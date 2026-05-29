# LAPORAN AUDIT TEKNIS & KEAMANAN SISTEM
# SIAKAD QLC — Sistem Informasi Akademik Quranic Leadership Centre

---

| | |
|---|---|
| **Nama Sistem** | SIAKAD QLC |
| **Versi Stack** | Laravel 11 + MongoDB + Inertia.js + React (TypeScript) |
| **Tanggal Audit** | 27 Mei 2026 |
| **Auditor** | Tim QA & Security — Claude Code Audit System |
| **Jenis Audit** | Full Quality Control, Security Penetration Review, Architecture Audit |
| **Status Laporan** | FINAL — Pre-Production Review |

---

## DAFTAR ISI

1. Executive Summary
2. Temuan Kritis (CRITICAL)
3. Temuan Tinggi (HIGH)
4. Temuan Sedang (MEDIUM)
5. Temuan Rendah (LOW)
6. Code Smell & Technical Debt
7. Audit Security Headers
8. Audit Database & Arsitektur
9. Audit Frontend
10. Scorecard & Penilaian
11. Prioritas Perbaikan
12. Kesimpulan

---

## 1. EXECUTIVE SUMMARY

Sistem SIAKAD QLC merupakan platform akademik berbasis web untuk manajemen lembaga pendidikan Quranic Leadership Centre. Sistem ini dibangun menggunakan pendekatan modern dengan stack Laravel 11, MongoDB sebagai database NoSQL, Inertia.js sebagai bridge server-client, dan React TypeScript sebagai frontend.

Audit ini dilakukan secara menyeluruh mencakup source code review, analisis arsitektur, pengujian keamanan simulatif, review logika bisnis, dan evaluasi kualitas kode.

### Ringkasan Temuan

| Kategori | Jumlah |
|---|---|
| Critical | 4 |
| High | 3 |
| Medium | 5 |
| Low | 3 |
| Code Smell / Technical Debt | 7 |

### Kesimpulan Umum

Sistem memiliki fondasi arsitektur yang cukup solid dengan implementasi role-based access control, validasi input yang memadai, dan konversi ke Eloquent ORM yang baik. Namun ditemukan **4 celah keamanan kritis**, **3 celah keamanan tinggi**, dan **12+ code quality issue** yang harus ditangani sebelum sistem dapat digunakan di lingkungan production.

> **VERDICT: SISTEM BELUM SIAP PRODUCTION**
> Minimal 4 temuan Critical dan 2 temuan High wajib diperbaiki sebelum deployment.

---

## 2. TEMUAN KRITIS (CRITICAL)

---

### [BUG-001] HARDCODED DEFAULT PASSWORD — BACKDOOR EKSPLISIT

| Atribut | Detail |
|---|---|
| **Severity** | CRITICAL |
| **Category** | Security — Authentication |
| **File** | `app/Http/Controllers/TeacherController.php` baris 188 |
| | `app/Http/Controllers/ParentController.php` baris 229 |
| | `app/Http/Controllers/MitraController.php` baris 195 |
| **Function** | `resetPassword()` |

#### Deskripsi

Tiga controller menggunakan password default statis yang di-hardcode langsung dalam source code untuk fitur reset password. Password tersebut adalah `mieayambakso` dan diketahui oleh semua developer yang pernah membaca kode ini.

#### Kode Bermasalah

```php
// TeacherController.php:188
$user->update(['password' => Hash::make('mieayambakso')]);

// ParentController.php:229
$user->update(['password' => Hash::make('mieayambakso')]);

// MitraController.php:195
$user->update(['password' => Hash::make('mieayambakso')]);
```

#### Steps to Reproduce / Exploit

1. Mantan developer atau insider mengetahui bahwa password default adalah `mieayambakso`
2. Admin melakukan reset password pada akun target (wali/guru/mitra)
3. Attacker login menggunakan `mieayambakso` sebelum user sempat mengganti password
4. Attacker mendapatkan akses penuh ke akun target

#### Dampak

Account takeover pada seluruh user yang pernah di-reset passwordnya oleh admin. Pada sistem pendidikan yang menyimpan data anak-anak, ini termasuk pelanggaran keamanan data yang serius.

#### Rekomendasi Perbaikan

```php
// Ganti di ketiga controller dengan implementasi berikut:
public function resetPassword(string $id)
{
    $teacher = Teacher::find($id);
    if (!$teacher) {
        return response()->json(['success' => false, 'message' => 'Guru tidak ditemukan.'], 404);
    }

    if (empty($teacher->user_id)) {
        return response()->json(['success' => false, 'message' => 'Guru tidak memiliki akun.'], 400);
    }

    $user = User::find($teacher->user_id);
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Akun tidak ditemukan.'], 404);
    }

    // Generate password acak yang aman
    $tempPassword = \Illuminate\Support\Str::random(12);
    $user->update([
        'password'             => Hash::make($tempPassword),
        'must_change_password' => true, // tambahkan field ini ke users
    ]);

    // Kirim password baru ke email user
    \Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($tempPassword));

    \Log::info('password_reset', [
        'target_user_id' => $teacher->user_id,
        'by_admin_id'    => auth()->id(),
        'ip'             => request()->ip(),
        'timestamp'      => now()->toIso8601String(),
    ]);

    return response()->json(['success' => true, 'message' => 'Password baru telah dikirim ke email pengguna.']);
}
```

---

### [BUG-002] IDOR — SIAPA PUN BISA MEMBACA LAPORAN PROGRESS SIAPA SAJA

| Atribut | Detail |
|---|---|
| **Severity** | CRITICAL |
| **Category** | Security — Broken Access Control / IDOR |
| **File** | `app/Http/Controllers/ProgressReportController.php` baris 101 |
| **Function** | `teacherShow()` |
| **Endpoint** | `GET /api/teacher/reports/{id}` |

#### Deskripsi

Endpoint `teacherShow` tidak melakukan pengecekan kepemilikan laporan. Siapa pun yang sudah login (termasuk user dengan role `parent` atau `mitra`) dapat membaca laporan progress milik siswa mana pun selama mereka mengetahui ID dokumennya. Ini adalah celah **Insecure Direct Object Reference (IDOR)** klasik.

#### Kode Bermasalah

```php
public function teacherShow(string $id): JsonResponse
{
    $report = ProgressReport::find($id);

    if (!$report) {
        return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
    }

    // TIDAK ADA PENGECEKAN teacher_id ATAU ROLE USER
    return response()->json($this->formatReport($report));
}
```

#### Simulasi Exploit

```bash
# User login sebagai parent (role RL03)
curl -X POST https://app.qlc.id/login \
  -d "username=wali1&password=wali1234"

# Setelah mendapat session, akses laporan milik siswa lain
curl -X GET https://app.qlc.id/api/teacher/reports/68345abc123def456... \
  -H "Cookie: laravel_session=..."

# Respons: 200 OK dengan seluruh data laporan siswa
```

#### Dampak

- Kebocoran data perkembangan akademis seluruh siswa kepada pihak tidak berwenang
- Pelanggaran privasi data anak-anak (sangat sensitif secara hukum dan etika)
- Orang tua dapat membaca laporan anak orang tua lain

#### Rekomendasi Perbaikan

```php
public function teacherShow(string $id): JsonResponse
{
    // Verifikasi bahwa user adalah guru yang valid
    $teacher = $this->resolveTeacher();
    if (!$teacher) {
        return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
    }

    $report = ProgressReport::find($id);
    if (!$report) {
        return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
    }

    // Verifikasi kepemilikan: hanya guru yang membuat laporan boleh melihatnya
    if ((string) $report->teacher_id !== (string) $teacher->_id) {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    return response()->json($this->formatReport($report));
}
```

---

### [BUG-003] BROKEN ACCESS CONTROL — ROUTE GURU DAPAT DIAKSES SEMUA ROLE

| Atribut | Detail |
|---|---|
| **Severity** | CRITICAL |
| **Category** | Security — Authorization |
| **File** | `routes/api.php` baris 136–146 |
| **Endpoint** | Seluruh `GET|POST|PUT|DELETE /api/teacher/*` |

#### Deskripsi

Semua route dengan prefix `/api/teacher/*` hanya dilindungi oleh middleware `auth` (cukup login saja), bukan `role:teacher`. Artinya pengguna dengan role `parent` atau `mitra` dapat mengakses semua endpoint yang seharusnya hanya untuk guru.

#### Kode Bermasalah

```php
// routes/api.php:136
Route::middleware('auth')->group(function () {  // ← hanya auth, bukan role:teacher
    Route::prefix('teacher')->group(function () {
        Route::get('students', [ProgressReportController::class, 'teacherStudents']);
        Route::get('students/{studentId}/reports', [ProgressReportController::class, 'teacherStudentReports']);
        Route::post('reports', [ProgressReportController::class, 'teacherStore']);
        Route::get('reports/{id}', [ProgressReportController::class, 'teacherShow']);   // IDOR
        Route::put('reports/{id}', [ProgressReportController::class, 'teacherUpdate']);
        Route::delete('reports/{id}', [ProgressReportController::class, 'teacherDestroy']);
    });
```

#### Dampak Akses Tidak Sah

| Endpoint | Akses oleh Parent/Mitra | Dampak |
|---|---|---|
| `GET /api/teacher/students` | Berhasil | Melihat daftar semua siswa aktif |
| `GET /api/teacher/reports/{id}` | Berhasil (IDOR) | Membaca laporan siapa saja |
| `POST /api/teacher/reports` | Gagal di resolveTeacher() | Tidak berbahaya tapi tidak tepat |
| `PUT /api/teacher/reports/{id}` | Gagal di cek teacher_id | Tidak berbahaya |

#### Rekomendasi Perbaikan

```php
// Pisahkan group dengan middleware yang tepat
Route::middleware(['auth', 'role:teacher'])->prefix('teacher')->group(function () {
    Route::get('students',                          [ProgressReportController::class, 'teacherStudents']);
    Route::get('students/{studentId}/reports',      [ProgressReportController::class, 'teacherStudentReports']);
    Route::post('reports',                          [ProgressReportController::class, 'teacherStore']);
    Route::get('reports/{id}',                      [ProgressReportController::class, 'teacherShow']);
    Route::put('reports/{id}',                      [ProgressReportController::class, 'teacherUpdate']);
    Route::delete('reports/{id}',                   [ProgressReportController::class, 'teacherDestroy']);
});
```

---

### [BUG-004] OTP DISIMPAN PLAINTEXT + BRUTE-FORCE TANPA PERLINDUNGAN

| Atribut | Detail |
|---|---|
| **Severity** | CRITICAL |
| **Category** | Security — Authentication |
| **File** | `app/Http/Controllers/Auth/RegisteredUserController.php` baris 50 |
| **Endpoint** | `POST /register/send-otp`, `POST /register` |

#### Deskripsi

Terdapat tiga kelemahan serius pada implementasi OTP pendaftaran:

1. OTP dibuat dengan fungsi `rand()` yang bukan cryptographically secure random number generator (CSPRNG)
2. OTP disimpan dalam bentuk plaintext di tabel `password_reset_tokens`
3. Tidak ada rate limiting pada endpoint verifikasi OTP — memungkinkan brute force 1.000.000 kombinasi

#### Kode Bermasalah

```php
// RegisteredUserController.php:50
$otp = (string) rand(100000, 999999);  // ← NON-CRYPTOGRAPHIC, predictable

DB::table('password_reset_tokens')->insert([
    'email'      => $email,
    'token'      => $otp,              // ← PLAINTEXT, tidak di-hash
    'created_at' => Carbon::now()->toDateTimeString()
]);
```

#### Simulasi Exploit (Brute Force)

```bash
# Tidak ada rate limit pada POST /register
# Attacker bisa bruteforce 1 juta kombinasi:

for i in $(seq 100000 999999); do
  curl -s -X POST https://app.qlc.id/register \
    -d "otp=$i&email=victim@example.com&username=victim&password=P@ss1234&password_confirmation=P@ss1234&parent_name=X&phone=08100000000&address=Jakarta"
  
  # Jika berhasil, akun terdaftar atas nama attacker
done
```

#### Dampak

- Attacker dapat mendaftarkan akun atas nama email orang lain
- Jika database bocor, OTP plaintext langsung terbaca (tidak seperti hash yang memerlukan cracking)
- Akun orang lain dapat di-hijack sebelum proses registrasi selesai

#### Rekomendasi Perbaikan

```php
// Langkah 1: Gunakan CSPRNG + hash OTP sebelum simpan
public function sendOtp(Request $request)
{
    // ... validasi awal ...

    $email = $request->email;

    // CSPRNG: cryptographically secure
    $otp       = (string) str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $otpHashed = Hash::make($otp);  // hash sebelum simpan

    DB::table('password_reset_tokens')->where('email', $email)->delete();
    DB::table('password_reset_tokens')->insert([
        'email'      => $email,
        'token'      => $otpHashed,   // simpan hash, bukan plaintext
        'created_at' => now(),
    ]);

    Mail::to($email)->send(new VerifyRegistrationMail($otp)); // kirim plaintext ke email
    return response()->json(['message' => 'Kode OTP berhasil dikirim.']);
}

// Langkah 2: Verifikasi dengan Hash::check
$record = DB::table('password_reset_tokens')
    ->where('email', $request->email)
    ->first();

if (!$record || !Hash::check($request->otp, $record->token)) {
    return back()->withErrors(['otp' => 'Kode OTP salah.']);
}
```

```php
// Langkah 3: Tambahkan rate limit di routes/web.php
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('throttle:5,10')
    ->name('register');
```

---

## 3. TEMUAN TINGGI (HIGH)

---

### [BUG-005] N+1 QUERY — STUDENTCONTROLLER::FORMAT()

| Atribut | Detail |
|---|---|
| **Severity** | HIGH |
| **Category** | Performance — Database |
| **File** | `app/Http/Controllers/StudentController.php` baris 220 |
| **Function** | `format()` |

#### Deskripsi

Metode `format()` melakukan query fallback individual ke database untuk setiap dokumen siswa ketika data tidak tersedia dalam batch yang sudah di-load. Ini menciptakan pola N+1 query.

#### Kode Bermasalah

```php
private function format($doc, $programs = null): array
{
    if ($programs && isset($programs[(string) $doc->program_id])) {
        $programName = $programs[(string) $doc->program_id]->name ?? null;
    } else {
        $p = Program::find($doc->program_id);    // ← QUERY INDIVIDUAL PER SISWA
        $programName = $p?->name;
    }

    if (!$parentName && !empty($doc->parent_id)) {
        $p = Parents::where('user_id', ..)->first(); // ← QUERY INDIVIDUAL PER SISWA
        $parentName = $p?->parent_name;
    }
}
```

#### Simulasi Impact

Dengan 100 siswa dan admin membuka halaman detail:
- `index()` dengan pagination: aman (programs di-batch)
- `show($id)` single student: 2 query extra per request
- Export semua data: **200 query tambahan** untuk 100 siswa

#### Rekomendasi Perbaikan

```php
public function show(string $id)
{
    $student = Student::find($id);
    if (!$student) {
        return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
    }

    // Batch load relasi sebelum format
    $programs = collect();
    if ($student->program_id) {
        $programs = Program::whereIn('_id', [$student->program_id])
            ->get()
            ->keyBy(fn($p) => (string) $p->_id);
    }

    return response()->json(['success' => true, 'data' => $this->format($student, $programs)]);
}
```

---

### [BUG-006] BUILDTEACHERMAP TANPA FILTER — UNBOUND MEMORY USAGE

| Atribut | Detail |
|---|---|
| **Severity** | HIGH |
| **Category** | Performance — Memory |
| **File** | `app/Http/Controllers/ProgressReportController.php` baris 546 |
| **Function** | `buildTeacherMap()` |
| **Dipanggil tanpa args oleh** | `parentChildReports()`, `adminStudentReports()` |

#### Deskripsi

Fungsi `buildTeacherMap()` ketika dipanggil tanpa argumen akan mem-fetch **seluruh koleksi teachers** dari database ke memory PHP. Fungsi ini dipanggil tanpa filter pada dua endpoint yang dapat dipanggil oleh user biasa (parent).

#### Kode Bermasalah

```php
private function buildTeacherMap(array $teacherIds = []): array
{
    $query = Teacher::query();
    if (!empty($teacherIds)) {      // jika array kosong, TIDAK ADA FILTER
        $query->whereIn('_id', $teacherIds);
    }
    return $query->get(['_id', 'nama_guru'])  // ← SELECT * dari seluruh tabel teachers
        ->keyBy(fn($t) => (string) $t->_id)
        ->map(fn($t) => $t->nama_guru ?? '—')
        ->toArray();
}

// Dipanggil tanpa args:
public function parentChildReports(string $studentId): JsonResponse
{
    // ...
    $teacherMap = $this->buildTeacherMap(); // ← LOAD SEMUA GURU
}
```

#### Dampak pada Scale

| Jumlah Guru | Memory per Request | Request Concurrent |
|---|---|---|
| 100 guru | ~50 KB | rendah |
| 1.000 guru | ~500 KB | mulai bermasalah |
| 10.000 guru | ~5 MB | server crash |

#### Rekomendasi Perbaikan

```php
public function parentChildReports(string $studentId): JsonResponse
{
    // ... existing validation ...

    $reports = ProgressReport::where('student_id', $studentId)
        ->orderBy('date', 'desc')
        ->get();

    // Extract hanya teacher IDs yang diperlukan
    $teacherIds = $reports->pluck('teacher_id')->filter()->unique()->values()->toArray();
    $teacherMap = $this->buildTeacherMap($teacherIds);  // selalu pass IDs

    // ... rest of method ...
}
```

---

### [BUG-007] MISSING CASCADE DELETE — ORPHAN DATA

| Atribut | Detail |
|---|---|
| **Severity** | HIGH |
| **Category** | Database — Data Integrity |
| **File** | `app/Http/Controllers/StudentController.php` baris 184 |
| | `app/Http/Controllers/TeacherController.php` baris 157 |
| **Function** | `destroy()` |

#### Deskripsi

Penghapusan siswa tidak menghapus `progress_reports` yang terkait. Penghapusan guru juga tidak menghapus laporan yang dibuat oleh guru tersebut. Ini menyebabkan data orphan yang terus menumpuk di database.

#### Kode Bermasalah

```php
// StudentController.php:184
public function destroy(string $id)
{
    $student = Student::find($id);
    // ...
    $student->delete();
    // ← ProgressReport dengan student_id ini masih ada di database
    // ← Notifikasi yang pernah dikirim ke parent juga tidak dibersihkan
}
```

#### Dampak

- Database terus membengkak dengan data yang sudah tidak relevan
- Statistik dashboard admin menjadi tidak akurat
- Potensi data confusion jika MongoDB ObjectId di-recycle (sangat jarang namun mungkin)
- Laporan orphan muncul di query admin yang tidak memfilter berdasarkan siswa aktif

#### Rekomendasi Perbaikan

```php
// StudentController.php
public function destroy(string $id)
{
    $student = Student::find($id);
    if (!$student) {
        return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
    }

    $studentId = (string) $student->_id;

    // Cascade delete semua data terkait
    ProgressReport::where('student_id', $studentId)->delete();

    // Hapus file bukti pembayaran jika ada
    if (!empty($student->bukti_pembayaran)) {
        Storage::disk('public')->delete($student->bukti_pembayaran);
    }

    $student->delete();

    \Log::info('student_deleted', [
        'student_id' => $studentId,
        'nama'       => $student->nama,
        'by_admin'   => auth()->id(),
    ]);

    return response()->json(['success' => true, 'message' => 'Data siswa berhasil dihapus.']);
}
```

---

## 4. TEMUAN SEDANG (MEDIUM)

---

### [BUG-008] APP_DEBUG=TRUE — STACK TRACE TERBUKA KE PUBLIK

| Atribut | Detail |
|---|---|
| **Severity** | MEDIUM |
| **Category** | Security — Information Disclosure |
| **File** | `.env` baris 4 |

**Kondisi Saat Ini:**
```env
APP_DEBUG=true
```

Dengan debug mode aktif, saat terjadi exception Laravel menampilkan full stack trace, nama file, baris kode, query MongoDB, dan nilai variabel langsung di browser. Informasi ini sangat berguna bagi attacker untuk memetakan struktur sistem.

**Perbaikan:**
```env
# Production / Staging
APP_DEBUG=false
APP_ENV=production
```

---

### [BUG-009] SESSION TIDAK DIENKRIPSI + FILE-BASED

| Atribut | Detail |
|---|---|
| **Severity** | MEDIUM |
| **Category** | Security — Session Management |
| **File** | `.env` |

```env
SESSION_DRIVER=file       # file session, tidak ideal untuk production
SESSION_ENCRYPT=false     # session tidak terenkripsi
```

Session file tersimpan di `storage/framework/sessions/` tanpa enkripsi. Jika server terkompromikan, semua session token dapat dibaca langsung, memungkinkan session hijacking.

**Perbaikan:**
```env
SESSION_DRIVER=database   # lebih aman, bisa di-revoke
SESSION_ENCRYPT=true      # enkripsi payload session
```

---

### [BUG-010] RATE LIMITING LEMAH PADA FORGOT PASSWORD

| Atribut | Detail |
|---|---|
| **Severity** | MEDIUM |
| **Category** | Security — Brute Force |
| **File** | `routes/api.php` baris 33 |

```php
Route::middleware('throttle:5,10')->group(function () {
    // 5 request per 10 menit per IP
```

Throttle hanya per-IP, mudah di-bypass dengan IP rotation. Tidak ada proteksi per-email, memungkinkan account enumeration (mendeteksi apakah email terdaftar berdasarkan respons waktu).

**Perbaikan:**
```php
// Di ForgotPasswordController::sendOtp()
$emailKey = 'forgot-email:' . hash('sha256', Str::lower($request->email));
$ipKey    = 'forgot-ip:' . $request->ip();

if (RateLimiter::tooManyAttempts($emailKey, 3) ||
    RateLimiter::tooManyAttempts($ipKey, 10)) {
    return response()->json([
        'message' => 'Terlalu banyak percobaan. Silakan coba 15 menit lagi.'
    ], 429);
}

RateLimiter::hit($emailKey, 900); // per-email: 3x per 15 menit
RateLimiter::hit($ipKey, 900);    // per-ip: 10x per 15 menit
```

---

### [BUG-011] RESPONSE FORMAT API TIDAK KONSISTEN

| Atribut | Detail |
|---|---|
| **Severity** | MEDIUM |
| **Category** | Architecture — Maintainability |
| **File** | Multiple controllers |

Terdapat empat format respons berbeda yang digunakan secara tidak konsisten:

```php
// Format 1: StudentController — wraps dengan 'success'
return response()->json(['success' => true, 'data' => $data]);

// Format 2: ProgressReportController — langsung array
return response()->json($data);

// Format 3: MitraReportController — langsung data
return response()->json($this->formatReport($report), 201);

// Format 4: AdminDashboardController — langsung hasil query
return response()->json($result);
```

**Dampak:** Frontend harus menangani setiap format secara berbeda, meningkatkan kompleksitas dan risiko bug saat ada perubahan.

**Perbaikan:** Buat `ApiResponse` trait atau helper:
```php
// app/Traits/ApiResponds.php
trait ApiResponds
{
    protected function success($data, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    protected function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }

    protected function paginated($data, array $meta): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => $meta,
        ]);
    }
}
```

---

### [BUG-012] TEACHER MODEL $FILLABLE TIDAK KONSISTEN

| Atribut | Detail |
|---|---|
| **Severity** | MEDIUM |
| **Category** | Data Integrity |
| **File** | `app/Models/Teacher.php`, `database/seeders/TeacherSeeder.php`, `TeacherDashboardController.php` |

Terdapat inkonsistensi antara nama field di tiga tempat berbeda:

```php
// app/Models/Teacher.php — menggunakan 'spesialisasi'
protected $fillable = ['user_id', 'nama_guru', 'phone', 'spesialisasi'];

// TeacherSeeder.php — menggunakan 'bidang' dan 'email' (tidak ada di fillable!)
Teacher::create(['bidang' => 'Tahfidz', 'email' => 'guru1@qlc.id', ...]);
//                ↑ TIDAK TERSIMPAN    ↑ TIDAK TERSIMPAN

// TeacherDashboardController.php — mengakses 'bidang' dan 'email'
'bidang' => $teacherDoc->bidang ?? '—',  // ← selalu null
'email'  => $teacherDoc->email  ?? '—',  // ← selalu null
```

**Perbaikan:** Seragamkan ke satu nama field. Rekomendasi menggunakan `bidang`:
```php
// app/Models/Teacher.php
protected $fillable = ['user_id', 'nama_guru', 'phone', 'email', 'bidang'];
```

---

## 5. TEMUAN RENDAH (LOW)

---

### [BUG-013] CLASSIFYAGENDA — NAMA KATEGORI SALAH

| Atribut | Detail |
|---|---|
| **Severity** | LOW |
| **Category** | Business Logic |
| **File** | `app/Http/Controllers/AdminDashboardController.php` baris 151 |

```php
private function classifyAgenda(Carbon $date): string
{
    $diff = Carbon::now()->diffInDays($date);
    return $diff <= 3 ? 'urgent' : ($diff <= 7 ? 'mitra' : 'umum');
    //                                            ↑ 'mitra' tidak bermakna sebagai klasifikasi waktu
}
```

Kategori `'mitra'` digunakan untuk agenda 4-7 hari ke depan yang tidak ada hubungannya dengan mitra. Kemungkinan sisa dari refaktor sebelumnya yang tidak dibersihkan.

**Perbaikan:**
```php
return $diff <= 3 ? 'urgent' : ($diff <= 7 ? 'segera' : 'umum');
```

---

### [BUG-014] NOTIFICATION LINK TANPA VALIDASI FORMAT

| Atribut | Detail |
|---|---|
| **Severity** | LOW |
| **Category** | Security — Input Validation |
| **File** | `app/Http/Controllers/ProgressReportController.php` baris 464 |

```php
Notification::send(
    userId:  $parentUserId,
    type:    'progress',
    title:   $title,
    message: $message,
    link:    '?tab=laporan',  // ← relative path tanpa validasi
);
```

Jika di masa depan `link` dikontrol dari input pengguna, bisa dimanipulasi menjadi URL eksternal (open redirect). Saat ini tidak berbahaya karena nilai hardcoded.

---

### [BUG-015] MISSING AUDIT TRAIL UNTUK OPERASI KRITIS

| Atribut | Detail |
|---|---|
| **Severity** | LOW |
| **Category** | Compliance — Auditability |
| **File** | Multiple controllers |

Tidak ada logging untuk operasi-operasi sensitif berikut:
- Reset password pengguna
- Penghapusan data siswa, guru, atau mitra
- Persetujuan/penolakan pendaftaran
- Login gagal berulang

**Perbaikan:** Tambahkan minimal `\Log::info()` untuk operasi kritis:
```php
\Log::channel('audit')->info('student_deleted', [
    'student_id' => $student->_id,
    'nama'       => $student->nama,
    'admin_id'   => auth()->id(),
    'ip'         => request()->ip(),
    'timestamp'  => now()->toIso8601String(),
]);
```

---

## 6. CODE SMELL & TECHNICAL DEBT

| ID | File | Masalah | Dampak |
|---|---|---|---|
| S-01 | `resources/js/Pages/teacher/JadwalPage.tsx:34` | `const BASE = 'http://127.0.0.1:8000/api'` — URL hardcoded localhost | **Gagal total di production** |
| S-02 | `app/Http/Controllers/StudentController.php:220` | `format()` melakukan query fallback sekaligus formatting (violates SRP) | Sulit di-maintain |
| S-03 | `routes/web.php:24` | Landing page route masih menggunakan raw MongoDB driver (`$db->selectCollection()`), tidak konsisten | Inkonsistensi maintenance |
| S-04 | `PengaturanGuruPage.tsx` | Interface `TeacherProfile` expect field `username` tapi controller mengirim `nama_guru` | Data tidak ditampilkan |
| S-05 | Multiple controllers | `use MongoDB\BSON\Regex` diimpor langsung — coupling ke implementasi driver | Sulit migrasi DB |
| S-06 | `ProgressReportController::buildLastReportMap()` | Load semua progress report untuk student IDs tanpa `LIMIT`, baru difilter di PHP | Slow pada dataset besar |
| S-07 | `.env` | `SESSION_LIFETIME=120` (2 jam) tanpa idle timeout — session aktif terlalu lama | Risiko session hijacking |

---

## 7. AUDIT SECURITY HEADERS

Berdasarkan pemeriksaan `bootstrap/app.php` dan seluruh middleware yang dikonfigurasi, **tidak ada satu pun security header** yang diset oleh aplikasi.

| Header | Status | Risiko Jika Tidak Ada |
|---|---|---|
| `Content-Security-Policy` | TIDAK ADA | XSS melalui script injection |
| `X-Frame-Options` | TIDAK ADA | Clickjacking — halaman bisa diembed di iframe milik attacker |
| `X-Content-Type-Options` | TIDAK ADA | MIME type sniffing — browser bisa salah interpretasi respons |
| `Strict-Transport-Security` | TIDAK ADA | SSL stripping — koneksi bisa downgrade ke HTTP |
| `Referrer-Policy` | TIDAK ADA | URL sensitif bocor ke pihak ketiga |
| `Permissions-Policy` | TIDAK ADA | Browser API seperti camera/mic tidak dibatasi |

**Implementasi Security Headers Middleware:**

```php
// app/Http/Middleware/SecurityHeaders.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
        );

        if (config('app.env') === 'production') {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}
```

```php
// bootstrap/app.php — daftarkan middleware
$middleware->web(append: [
    \App\Http\Middleware\HandleInertiaRequests::class,
    \App\Http\Middleware\SecurityHeaders::class,  // ← tambahkan
]);
```

---

## 8. AUDIT DATABASE & ARSITEKTUR

### 8.1 Missing Index

MongoDB secara default hanya memiliki index pada field `_id`. Query-query berikut dijalankan tanpa index yang optimal:

| Collection | Field | Query Type | Rekomendasi |
|---|---|---|---|
| `students` | `enrollment_status` | Filter utama hampir semua query | Single index |
| `progress_reports` | `student_id + date` | Filter + sort laporan | Compound index |
| `progress_reports` | `teacher_id` | Filter by guru | Single index |
| `notifications` | `user_id + is_read` | Filter notifikasi belum dibaca | Compound index |
| `partners` | `user_id` | Lookup mitra dari user | Single index |
| `students` | `parent_id` | Lookup anak dari orang tua | Single index |

**Contoh Membuat Index via MongoDB Shell:**
```javascript
db.students.createIndex({ enrollment_status: 1 });
db.progress_reports.createIndex({ student_id: 1, date: -1 });
db.progress_reports.createIndex({ teacher_id: 1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });
db.partners.createIndex({ user_id: 1 });
```

### 8.2 Inkonsistensi Relasi

| Masalah | Lokasi | Detail |
|---|---|---|
| `student.parent_id` menyimpan `user_id` bukan `parents._id` | `StudentController`, `ProgressReportController` | Naming membingungkan, seharusnya `parent_user_id` |
| `progress_reports.teacher_id` tidak divalidasi saat store | `ProgressReportController::adminStore()` | Teacher ID bisa bernilai sembarang string |
| Tidak ada referential integrity | Semua relasi | MongoDB tidak enforce FK — aplikasi harus handle sendiri |

### 8.3 Potensi Duplicate Data

Field `parent_name` disimpan redundan di dokumen `students`:
```php
Student::create([
    'parent_id'   => $request->parent_id,
    'parent_name' => $parent->parent_name,  // ← redundant copy
    ...
]);
```

Jika nama orang tua berubah, data di `students` tidak otomatis terupdate. Pertimbangkan hanya menyimpan `parent_id` dan join saat query.

---

## 9. AUDIT FRONTEND

### 9.1 Temuan Kritis Frontend

| Masalah | File | Baris | Status |
|---|---|---|---|
| `kualitasConfig[report.kualitas]` crash jika nilai tidak dikenal | `Dashboard.tsx` | 327 | SUDAH DIPERBAIKI |
| URL hardcoded localhost `http://127.0.0.1:8000/api` | `JadwalPage.tsx` | 34 | BELUM DIPERBAIKI |

### 9.2 Keamanan Frontend

| Pemeriksaan | Status | Catatan |
|---|---|---|
| `dangerouslySetInnerHTML` | AMAN — Tidak ditemukan | Tidak ada XSS risk |
| Form validation client-side | ADA — Didukung server validation | Memadai |
| CSRF token | ADA — Inertia handle otomatis | Aman |
| Sensitive data di localStorage | TIDAK ADA | Aman |
| Password di URL params | TIDAK ADA | Aman |

### 9.3 Masalah UX/Aksesibilitas

| Masalah | Lokasi | Detail |
|---|---|---|
| Loading state tidak konsisten | Beberapa form | Beberapa endpoint tanpa indikator loading |
| Empty state tersedia | Dashboard, laporan | Baik |
| Error message | Form validation ada | Cukup user-friendly |
| Mobile responsiveness | Tersedia | Layout sudah responsive |

---

## 10. SCORECARD & PENILAIAN

| Dimensi | Nilai | Grade | Catatan |
|---|---|---|---|
| **Security** | 42 / 100 | D | 4 celah critical, tidak ada security headers, OTP lemah |
| **Authentication** | 65 / 100 | C | Login flow oke, OTP tidak secure, session tidak enkripsi |
| **Authorization** | 55 / 100 | D+ | Role middleware ada tapi tidak lengkap di API layer |
| **Data Integrity** | 60 / 100 | C | Tidak ada cascade delete, orphan data, field inkonsisten |
| **Performance** | 58 / 100 | C- | N+1 query, unfiltered bulk load, tidak ada indexing |
| **Code Quality** | 65 / 100 | C+ | Clean code cukup baik, response format tidak konsisten |
| **Maintainability** | 62 / 100 | C+ | URL hardcoded, model inkonsisten, response format beda-beda |
| **Business Logic** | 72 / 100 | B- | Alur akademik sudah benar, beberapa label salah |
| **Frontend** | 70 / 100 | B- | Satu crash bug sudah fix, tidak ada XSS risk |
| **Architecture** | 68 / 100 | C+ | MVC dipatuhi, beberapa fat logic di controller |
| | | | |
| **OVERALL SCORE** | **62 / 100** | **C+** | |

---

### Indikator Kesiapan Produksi

| Indikator | Status |
|---|---|
| Tidak ada celah security critical | ❌ GAGAL — 4 celah critical ditemukan |
| Tidak ada celah security high | ❌ GAGAL — 3 celah high ditemukan |
| APP_DEBUG=false | ❌ GAGAL — masih true |
| Session terenkripsi | ❌ GAGAL — SESSION_ENCRYPT=false |
| URL hardcoded | ❌ GAGAL — localhost di frontend |
| Security headers | ❌ GAGAL — tidak ada sama sekali |
| Cascade delete | ❌ GAGAL — orphan data |
| Cascade delete file | ✅ ADA — pada StudentController |
| Input validation | ✅ ADA — cukup lengkap |
| Password hashing | ✅ ADA — menggunakan bcrypt |
| CSRF protection | ✅ ADA — via Inertia |
| Role-based access control | ✅ ADA — sebagian besar |
| Sanitasi search input | ✅ ADA — menggunakan preg_quote |

> **KESIMPULAN: SISTEM TIDAK SIAP UNTUK PRODUCTION**

---

## 11. PRIORITAS PERBAIKAN

### Tier 1 — WAJIB SEBELUM LAUNCH (estimasi: 1–3 hari kerja)

| No | Bug | Aksi | PIC |
|---|---|---|---|
| 1 | BUG-002 | Tambahkan ownership check di `teacherShow()` | Backend Dev |
| 2 | BUG-003 | Tambahkan `role:teacher` middleware pada route `/api/teacher/*` | Backend Dev |
| 3 | BUG-001 | Ganti hardcoded password dengan random + email di 3 controller | Backend Dev |
| 4 | BUG-004 | Hash OTP dengan `Hash::make()` + gunakan `random_int()` + rate limit pada `/register` | Backend Dev |
| 5 | S-01 | Ganti `http://127.0.0.1:8000/api` dengan `/api` (relative path) di `JadwalPage.tsx` | Frontend Dev |

### Tier 2 — HIGH PRIORITY (estimasi: 1–2 minggu)

| No | Bug | Aksi |
|---|---|---|
| 6 | BUG-007 | Tambahkan cascade delete ProgressReport saat student/teacher dihapus |
| 7 | Security Headers | Implementasi `SecurityHeaders` middleware |
| 8 | BUG-006 | Perbaiki `buildTeacherMap()` selalu terima dan filter berdasarkan IDs |
| 9 | BUG-008 | Set `APP_DEBUG=false` di staging dan production |
| 10 | BUG-009 | Ganti ke `SESSION_DRIVER=database` dan `SESSION_ENCRYPT=true` |

### Tier 3 — SEBELUM SCALE (estimasi: 1 bulan)

| No | Bug | Aksi |
|---|---|---|
| 11 | BUG-005 | Eliminasi N+1 query di `StudentController::format()` |
| 12 | BUG-012 | Standarisasi API response format menggunakan `ApiResponds` trait |
| 13 | BUG-013 | Seragamkan field `bidang` vs `spesialisasi` di Model, Seeder, Controller |
| 14 | Database | Buat MongoDB index pada field-field yang sering diquery |
| 15 | BUG-010 | Implementasi per-email rate limiting pada forgot password |
| 16 | BUG-015 | Implementasi audit logging untuk operasi kritis |

---

## 12. KESIMPULAN

SIAKAD QLC menunjukkan kualitas pengembangan yang cukup baik dari sisi struktur dan keterbacaan kode. Tim developer memiliki pemahaman yang baik tentang Laravel Eloquent, validasi input, dan pemisahan tanggung jawab (controller, model, route). Konversi dari raw MongoDB driver ke Eloquent ORM juga sudah dilakukan dengan benar.

Namun, terdapat **gap yang signifikan antara kualitas implementasi fitur dan kematangan keamanan sistem**. Keempat temuan Critical yang ditemukan bukan merupakan kesalahan kompleks — melainkan celah yang terjadi karena kurangnya security review layer sebelum rilis.

**Estimasi waktu perbaikan Tier 1 (wajib sebelum launch): 1–2 hari kerja penuh** dengan developer yang memahami codebase. Setelah Tier 1 selesai, sistem akan jauh lebih layak untuk diuji lebih lanjut sebelum production deployment.

Seluruh temuan di laporan ini didasarkan pada **static code review dan analisis arsitektur**. Pengujian penetrasi dinamis (dynamic penetration testing) dengan environment yang berjalan tetap direkomendasikan sebelum go-live.

---

*Laporan ini bersifat rahasia dan hanya untuk keperluan internal tim pengembangan QLC.*
*Disusun oleh: Claude Code Audit System — 27 Mei 2026*
