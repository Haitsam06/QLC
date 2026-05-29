# AUDIT REPORT SIAKAD QLC — ITERASI KETIGA (V3)
### Tanggal Audit: 28 Mei 2026
### Auditor: Principal Software QA Engineer + Senior Security Auditor + Enterprise System Analyst
### Codebase: Laravel 11 + MongoDB + Inertia.js + React TypeScript
### Baseline: Setelah semua perbaikan dari Audit V1 dan V2 diterapkan
### Skor Sistem: **82 / 100** *(naik dari 75/100 di V2)*

---

## RINGKASAN EKSEKUTIF

Audit ketiga ini mencakup area yang belum diaudit sebelumnya: alur autentikasi dan registrasi, modul laporan kemajuan (ProgressReport), dashboard admin secara menyeluruh, sistem notifikasi, modul mitra, forgot password flow, dan lapisan keamanan (RoleMiddleware, SecurityHeaders). Seluruh perbaikan dari V2 telah diverifikasi dan berhasil diterapkan dengan benar.

Ditemukan **9 temuan baru** (1 MEDIUM-HIGH, 3 MEDIUM, 4 LOW, 1 INFORMATIONAL). Tidak ada temuan CRITICAL di iterasi ini. Sistem menunjukkan peningkatan signifikan dalam hal keamanan dan arsitektur dibanding V1 dan V2.

---

## STATUS PERBAIKAN V2 (VERIFIKASI)

| ID V2   | Deskripsi                                         | Status      |
|---------|---------------------------------------------------|-------------|
| NEW-001 | N+1 di ParentDashboardController                  | ✅ FIXED    |
| NEW-002 | buildTeacherMap() dipanggil tanpa guard empty      | ✅ FIXED (di ParentDashboard) |
| NEW-003 | N+1 di TeacherDashboardController                 | ✅ FIXED    |
| NEW-004 | AgendaController limit tidak dibatas               | ✅ FIXED    |
| NEW-005 | Raw MongoDB query di routes/web.php               | ✅ FIXED    |
| NEW-006 | laravelVersion/phpVersion bocor ke frontend       | ✅ FIXED    |
| NEW-007 | Query Parents dijalankan untuk semua role         | ✅ FIXED    |
| NEW-008 | Cache-busting foto menggunakan time()             | ✅ FIXED    |
| NEW-009 | Program existence check sebelum upload enrollment | ✅ FIXED    |
| NEW-010 | Foundation store/update tanpa validasi            | ✅ FIXED    |
| NEW-011 | Duplicate role alias isTeacher/isParents          | ✅ FIXED    |
| NEW-012 | Security headers middleware tidak terdaftar       | ✅ FIXED    |
| NEW-013 | Route parents.password.update tidak ada           | ✅ FIXED    |
| NEW-014 | File foto lama tidak dihapus saat update profil mitra | ✅ FIXED |
| NEW-015 | Cascade delete tidak ada di destroy mitra/parent  | ✅ FIXED    |

---

## TEMUAN AUDIT V3

---

### V3-H01 — MEDIUM-HIGH
**`buildTeacherMap()` Masih Ada di ProgressReportController Tanpa Guard Early Return**

**File:** `app/Http/Controllers/ProgressReportController.php:558–568`

**Masalah:**
Pola yang sama yang sudah diperbaiki di `ParentDashboardController` (V2-NEW-002) masih ada di `ProgressReportController`. Saat `$teacherIds` kosong, kondisi `!empty($teacherIds)` mencegah `whereIn` ditambahkan, tetapi query tetap dieksekusi tanpa filter — mengambil seluruh koleksi `teachers`.

```php
// SEKARANG (bermasalah):
private function buildTeacherMap(array $teacherIds = []): array
{
    $query = Teacher::query();
    if (!empty($teacherIds)) {
        $query->whereIn('_id', $teacherIds);
    }
    // ← Jika $teacherIds kosong: SELECT * FROM teachers (tanpa WHERE)
    return $query->get(['_id', 'nama_guru'])
        ->keyBy(fn($t) => (string) $t->_id)
        ->map(fn($t) => $t->nama_guru ?? '—')
        ->toArray();
}
```

**Titik Pemanggil yang Berpotensi Menerima Array Kosong:**
- `parentChildReports()` baris 222: saat semua laporan tidak memiliki `teacher_id`
- `adminStudentReports()` baris 299: saat siswa belum memiliki laporan
- `adminReports()` baris 350: saat page pertama laporan tidak mengandung `teacher_id`

**Dampak:** Full collection scan pada `teachers`, kebocoran nama semua guru ke sisi PHP meski tidak dibutuhkan.

**Perbaikan:**
```php
private function buildTeacherMap(array $teacherIds): array
{
    if (empty($teacherIds)) return [];

    return Teacher::whereIn('_id', $teacherIds)
        ->get(['_id', 'nama_guru'])
        ->keyBy(fn($t) => (string) $t->_id)
        ->map(fn($t) => $t->nama_guru ?? '—')
        ->toArray();
}
```

---

### V3-M01 — MEDIUM
**Tidak Ada DB Transaction di Alur Registrasi Pengguna Baru**

**File:** `app/Http/Controllers/Auth/RegisteredUserController.php:101–113`

**Masalah:**
`User::create()` dan `Parents::create()` dieksekusi secara sekuensial tanpa transaction. Jika `Parents::create()` gagal (network glitch, MongoDB write error, validasi unik), akun `User` sudah terbentuk tanpa data `Parents` yang bersesuaian — menghasilkan akun yatim piatu yang tidak bisa login dengan benar (karena middleware profil mengharapkan data parents ada).

```php
// Jika baris ini berhasil...
$user = User::create([...]);

// ...tapi baris ini gagal:
Parents::create([
    'user_id'     => $user->_id,  // juga bermasalah, lihat V3-M02
    'parent_name' => $request->parent_name,
    'phone'       => $request->phone,
    'address'     => $request->address,
]);
// ← User orphan, tidak ada rollback
```

**Perbaikan:**
```php
use Illuminate\Support\Facades\DB;

// Bungkus dalam transaction
try {
    $user = null;
    DB::transaction(function () use ($request, &$user) {
        $user = User::create([
            'role_id'  => 'RL03',
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Parents::create([
            'user_id'     => (string) $user->_id,
            'parent_name' => $request->parent_name,
            'phone'       => $request->phone,
            'address'     => $request->address,
        ]);
    });
} catch (\Exception $e) {
    return back()->withErrors(['general' => 'Pendaftaran gagal. Silakan coba lagi.']);
}
```

> **Catatan:** MongoDB tidak mendukung multi-document ACID transaction pada versi standalone. Jika menggunakan MongoDB Standalone, transaction akan silent fail. Gunakan MongoDB Replica Set atau tambahkan manual cleanup (try/catch dengan `$user->delete()`).

---

### V3-M02 — MEDIUM
**`$user->_id` Tidak Di-cast ke String Sebelum Disimpan ke Parents**

**File:** `app/Http/Controllers/Auth/RegisteredUserController.php:109`

**Masalah:**
`$user->_id` adalah BSON `ObjectId`. Semua controller lain secara eksplisit melakukan `(string) $user->_id` sebelum menyimpannya. Di sini tidak ada cast:

```php
Parents::create([
    'user_id' => $user->_id,  // ← BSON ObjectId, bukan string
    ...
]);
```

Saat query kemudian dilakukan dengan `Parents::where('user_id', $stringId)->first()`, MongoDB membandingkan string dengan ObjectId — hasilnya bisa tidak cocok tergantung driver version, menyebabkan query selalu return `null` dan dashboard orang tua tidak bisa dimuat.

**Perbaikan:**
```php
Parents::create([
    'user_id' => (string) $user->_id,
    ...
]);
```

---

### V3-M03 — MEDIUM
**`adminStudentReports()` Tidak Memvalidasi Keberadaan Student**

**File:** `app/Http/Controllers/ProgressReportController.php:292–308`

**Masalah:**
Endpoint admin ini langsung mengquery laporan berdasarkan `$studentId` tanpa memverifikasi bahwa siswa tersebut ada. Input ID sembarang (termasuk yang tidak valid) hanya menghasilkan array kosong, bukan 404.

```php
public function adminStudentReports(string $studentId): JsonResponse
{
    // ← Tidak ada: $student = Student::find($studentId); if (!$student) abort(404);

    $reports = ProgressReport::where('student_id', $studentId)
        ->orderBy('date', 'desc')
        ->get();
    ...
    return response()->json($data);  // ← mengembalikan [] untuk ID fiktif
}
```

**Dampak:** Query yang sia-sia ke database; respons ambigu (admin tidak tahu apakah siswa tidak ada atau memang belum ada laporan).

**Perbaikan:**
```php
public function adminStudentReports(string $studentId): JsonResponse
{
    $student = Student::find($studentId);
    if (!$student) {
        return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
    }

    $reports = ProgressReport::where('student_id', $studentId)
        ->orderBy('date', 'desc')
        ->get();
    ...
}
```

---

### V3-L01 — LOW
**`chart()` Menjalankan 6 Query MongoDB Sekuensial**

**File:** `app/Http/Controllers/AdminDashboardController.php:34–55`

**Masalah:**
Loop `for ($i = 5; $i >= 0; $i--)` menjalankan 6 query `count()` terpisah ke MongoDB, satu per bulan. Ini bisa diganti satu aggregation pipeline.

```php
// SEKARANG (6 queries):
for ($i = 5; $i >= 0; $i--) {
    $month = $now->copy()->subMonths($i);
    $count = Student::where('created_at', '>=', $start)
                    ->where('created_at', '<=', $end)
                    ->count();  // ← 1 round-trip per iterasi
}
```

**Perbaikan (1 query):**
```php
public function chart(): JsonResponse
{
    $now    = Carbon::now();
    $start  = $now->copy()->subMonths(5)->startOfMonth();
    $labels = [];
    for ($i = 5; $i >= 0; $i--) {
        $labels[] = $now->copy()->subMonths($i)->format('M');
    }

    $raw = Student::raw(function ($collection) use ($start) {
        return $collection->aggregate([
            ['$match'  => ['created_at' => ['$gte' => new \MongoDB\BSON\UTCDateTime($start->timestamp * 1000)]]],
            ['$group'  => ['_id' => ['$month' => '$created_at'], 'count' => ['$sum' => 1]]],
            ['$sort'   => ['_id' => 1]],
        ]);
    });

    // Normalisasi ke label bulan dengan nilai default 0
    $countByMonth = collect($raw)->keyBy('_id');
    $result = [];
    for ($i = 5; $i >= 0; $i--) {
        $month    = $now->copy()->subMonths($i);
        $monthNum = (int) $month->format('n');
        $result[] = [
            'name'      => $month->format('M'),
            'pendaftar' => $countByMonth[$monthNum]['count'] ?? 0,
        ];
    }

    return response()->json($result);
}
```

> **Catatan Implementasi:** MongoDB aggregation `$month` mengembalikan angka 1–12, bukan label. Pendekatan alternatif yang lebih sederhana: gunakan `$dateToString` untuk format `YYYY-MM` lalu join ke label di PHP.

---

### V3-L02 — LOW
**Inkonsistensi URL File: Relatif vs Absolut pada MitraReport**

**File:** `app/Http/Controllers/Admin/MitraReportController.php:83`

**Masalah:**
`MitraReportController::store()` menyimpan URL file relatif, sementara `MitraController::store()` menyimpan URL absolut. Dua pendekatan berbeda untuk storage yang sama.

```php
// MitraReportController — URL RELATIF:
$fileUrl = Storage::url($path);  // → "/storage/mitra-reports/file.pdf"

// MitraController — URL ABSOLUT:
$mouFileUrl = url('storage/' . $path);  // → "http://localhost:8000/storage/mous/file.pdf"
```

**Dampak:** Frontend menerima tipe URL yang berbeda dari dua endpoint. URL relatif berfungsi dalam browser, tetapi bisa bermasalah di lingkungan di mana app diakses melalui subdomain atau reverse proxy.

**Perbaikan:** Pilih satu konvensi dan terapkan konsisten. Direkomendasikan gunakan `url('storage/' . $path)` (absolut) agar konsisten dengan `MitraController` dan `EnrollmentController`.

```php
// MitraReportController::store() — ganti baris 83:
$fileUrl = url('storage/' . $path);  // bukan Storage::url($path)
```

---

### V3-L03 — LOW
**Rate Limit OTP Reset Password Per-IP Saja, Tidak Per-Email**

**File:** `routes/api.php:33–36`, `app/Http/Controllers/Api/ForgotPasswordController.php`

**Masalah:**
`sendOtp` memiliki dual rate limit: per-email (3x/15 menit) DAN per-IP (10x/15 menit). Endpoint `resetPassword` hanya dilindungi rate limit per-IP (via `throttle:5,10`). Attacker yang menggunakan banyak IP (botnet/proxy) dapat mencoba hingga `5 × N_IP` kombinasi OTP selama window 15 menit.

Dengan 6-digit OTP (1.000.000 kombinasi) dan window 15 menit:
- 100 IP × 5 percobaan = 500 guess → probabilitas sukses 0,05%
- 1000 IP × 5 percobaan = 5000 guess → probabilitas sukses 0,5%

**Perbaikan:** Tambahkan per-email rate limit pada `resetPassword`:

```php
public function resetPassword(Request $request)
{
    $request->validate([...]);

    // Tambahan: per-email rate limit
    $emailKey = 'reset-verify:' . hash('sha256', Str::lower($request->email));
    if (RateLimiter::tooManyAttempts($emailKey, 5)) {
        return response()->json([
            'errors' => ['otp' => ['Kode OTP salah atau sudah kedaluwarsa.']]
        ], 400);
    }
    RateLimiter::hit($emailKey, 900);

    // ... sisa kode
}
```

> **Catatan:** Gunakan pesan error yang sama dengan kasus OTP salah agar tidak bocorkan informasi rate-limit.

---

### V3-L04 — LOW
**`Notification::sendToRole()` Mengirim Notifikasi Satu per Satu (N+1 Insert)**

**File:** `app/Models/Notification.php:78–95`

**Masalah:**
Method `sendToRole()` melakukan `foreach` memanggil `self::send()` (yang memanggil `create()`) untuk setiap user. Untuk role dengan banyak pengguna, ini berarti N database insert.

```php
foreach ($users as $user) {
    self::send((string) $user->_id, $type, $title, $message, $link);  // ← 1 insert per user
}
```

**Perbaikan (batch insert):**
```php
public static function sendToRole(string $roleName, string $type, string $title, string $message, ?string $link = null): void
{
    $role = \App\Models\Role::where('role_name', $roleName)->first();
    if (!$role) return;

    $users = \App\Models\User::where('role_id', (string) $role->_id)->get(['_id']);
    if ($users->isEmpty()) return;

    $now     = now();
    $inserts = $users->map(fn($u) => [
        'user_id'    => (string) $u->_id,
        'type'       => $type,
        'title'      => $title,
        'message'    => $message,
        'link'       => $link,
        'is_read'    => false,
        'created_at' => $now,
        'updated_at' => $now,
    ])->toArray();

    self::insert($inserts);
}
```

---

### V3-I01 — INFORMATIONAL
**CSP `script-src 'unsafe-inline'` Melemahkan Proteksi XSS**

**File:** `app/Http/Middleware/SecurityHeaders.php:21`

**Kondisi:**
```php
"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; ..."
```

`'unsafe-inline'` pada `script-src` memperbolehkan tag `<script>` inline dieksekusi, yang mengurangi nilai proteksi CSP secara signifikan terhadap XSS. Ini adalah trade-off yang umum dengan Inertia.js (yang menggunakan inline hydration script) dan sulit dihindari tanpa perubahan arsitektur besar.

**Rekomendasi Jangka Panjang:** Implementasi nonce-based CSP dengan `HandleInertiaRequests::share()` untuk menyisipkan nonce ke Inertia page props. Tidak kritis untuk fase ini, tetapi dicatat untuk roadmap keamanan.

---

## TEMUAN POSITIF (KONFIRMASI)

Berikut aspek sistem yang diaudit dan dinilai **sudah benar**:

| Aspek | Detail |
|---|---|
| **RoleMiddleware** | Benar menggunakan `loadMissing('role')` lalu `getRoleName()` — tidak ada hardcoded string perbandingan |
| **LoginRequest throttle** | `throttleKey()` menggabungkan username + IP; 5 percobaan sebelum lockout |
| **ForgotPassword enumeration** | Respons identik apakah email ada atau tidak — mencegah user enumeration |
| **OTP storage** | Disimpan sebagai bcrypt hash, bukan plaintext |
| **OTP expiry** | 15-menit TTL diverifikasi pada kedua endpoint (sendOtp + resetPassword) |
| **Teacher ownership** | `teacherShow/Update/Destroy` memverifikasi `report.teacher_id === teacher._id` |
| **Parent ownership** | `parentChildReports` memverifikasi `student.parent_id === parent.user_id` |
| **Enrollment status check** | Report hanya tersedia jika `enrollment_status === 'active'` |
| **Notification scoping** | `forUser($userId)` selalu digunakan — tidak ada kebocoran notifikasi antar user |
| **MitraDashboard scoping** | Dashboard mitra hanya menampilkan data partner milik user yang login |
| **SecurityHeaders** | Diterapkan global via `bootstrap/app.php` web middleware stack |
| **HSTS** | Hanya diaktifkan di `APP_ENV=production` |
| **File name sanitization** | `MitraReportController::store()` membersihkan nama file dari karakter berbahaya |
| **Admin cascade delete** | MitraController dan ParentController menghapus data turunan dengan benar |

---

## TABEL PRIORITAS PERBAIKAN

| ID      | Severity      | File                              | Estimasi | Urgensi |
|---------|--------------|-----------------------------------|----------|---------|
| V3-H01  | MEDIUM-HIGH  | ProgressReportController.php:558  | 5 menit  | Segera  |
| V3-M01  | MEDIUM       | RegisteredUserController.php:101  | 20 menit | Tinggi  |
| V3-M02  | MEDIUM       | RegisteredUserController.php:109  | 2 menit  | Tinggi  |
| V3-M03  | MEDIUM       | ProgressReportController.php:292  | 5 menit  | Sedang  |
| V3-L01  | LOW          | AdminDashboardController.php:34   | 30 menit | Rendah  |
| V3-L02  | LOW          | MitraReportController.php:83      | 2 menit  | Rendah  |
| V3-L03  | LOW          | ForgotPasswordController.php:67   | 10 menit | Rendah  |
| V3-L04  | LOW          | Notification.php:78               | 15 menit | Rendah  |
| V3-I01  | INFO         | SecurityHeaders.php:21            | —        | Roadmap |

---

## RENCANA PERBAIKAN BERTAHAP

### Tier 1 — Perbaiki Hari Ini (Bug Aktif)
1. **V3-H01** — Tambahkan `if (empty($teacherIds)) return [];` di awal `buildTeacherMap()` ProgressReportController
2. **V3-M02** — Tambahkan `(string)` cast pada `$user->_id` di RegisteredUserController line 109
3. **V3-M03** — Tambahkan existence check pada `adminStudentReports()`
4. **V3-L02** — Ganti `Storage::url($path)` menjadi `url('storage/' . $path)` di MitraReportController

### Tier 2 — Perbaiki Sprint Ini (Keandalan)
5. **V3-M01** — Bungkus registrasi User+Parents dalam try/catch dengan manual cleanup
6. **V3-L03** — Tambahkan per-email rate limit pada `resetPassword` endpoint

### Tier 3 — Optimisasi (Sebelum Scale)
7. **V3-L01** — Ganti 6 sequential count query dengan 1 MongoDB aggregation
8. **V3-L04** — Ganti loop `self::send()` di `sendToRole()` dengan batch `insert()`

---

## SCORING BREAKDOWN

| Kategori                        | V1   | V2   | V3   |
|---------------------------------|------|------|------|
| Authentication & Authorization  | 14/20| 17/20| 18/20|
| Data Integrity & Validation     | 11/20| 15/20| 16/20|
| Security (Headers, CSRF, XSS)   | 10/15| 13/15| 14/15|
| Performance & Query Efficiency  |  8/15| 11/15| 12/15|
| Code Quality & Consistency      | 10/15| 12/15| 13/15|
| Error Handling & Robustness     |  9/15| 7/15 | 9/15 |
| **TOTAL**                       |**62**|**75**|**82**|

---

## CHECKLIST PRODUCTION READINESS

| Item | Status |
|---|---|
| Semua perbaikan V2 diterapkan | ✅ |
| Rate limiting pada endpoint auth | ✅ |
| Security headers aktif | ✅ |
| Cascade delete implemented | ✅ |
| OTP stored as hash (tidak plaintext) | ✅ |
| User enumeration dicegah (forgot password) | ✅ |
| Role-based access control di semua route | ✅ |
| buildTeacherMap() unguarded (V3-H01) | ❌ Perlu fix |
| DB transaction pada registrasi (V3-M01) | ❌ Perlu fix |
| ObjectId cast di RegisteredUserController (V3-M02) | ❌ Perlu fix |
| MongoDB indexes aktif | ⚠️ Perlu `php artisan migrate` |
| Environment `.env` di `.gitignore` | ⚠️ Verifikasi |
| HTTPS aktif di production | ⚠️ Infra — HSTS siap |

---

## KESIMPULAN

Sistem SIAKAD QLC telah mengalami perbaikan substansial dari V1 ke V3. Arsitektur keamanan dasar (RoleMiddleware, SecurityHeaders, rate limiting, OTP hashing) sudah benar. Temuan utama V3 adalah **pola bug yang berulang** — `buildTeacherMap()` sudah diperbaiki di satu lokasi (V2) namun masih ada di `ProgressReportController`, menunjukkan perlunya abstraksi yang lebih ketat atau test coverage untuk helper kritis ini.

Dua temuan registrasi (V3-M01 dan V3-M02) berpotensi menyebabkan **data korup pada pengguna baru** jika terjadi error saat registrasi — sebaiknya diprioritaskan untuk diperbaiki sebelum go-live.

---

*Dokumen ini bersifat internal dan hanya untuk keperluan perbaikan sistem SIAKAD QLC.*
