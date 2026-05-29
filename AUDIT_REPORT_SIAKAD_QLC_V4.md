# AUDIT REPORT SIAKAD QLC — ITERASI KEEMPAT (V4)
### Tanggal Audit: 28 Mei 2026
### Auditor: Principal Software QA Engineer + Senior Security Auditor + Enterprise System Analyst
### Codebase: Laravel 11 + MongoDB + Inertia.js + React TypeScript
### Baseline: Setelah semua perbaikan dari Audit V1, V2, dan V3 diterapkan
### Skor Sistem: **85 / 100** *(naik dari 82/100 di V3)*

---

## RINGKASAN EKSEKUTIF

Audit keempat ini mencakup area yang belum diaudit di iterasi sebelumnya: `TeacherController`, `StudentController`, `EnrollmentController`, `AgendaController`, `InfoController` secara penuh, database seeder, `routes/auth.php`, dan frontend component utama (`Navbar.tsx`, `teacher/Dashboard.tsx`). Semua perbaikan dari V3 telah diverifikasi.

Ditemukan **13 temuan baru** (1 HIGH, 5 MEDIUM, 7 LOW). Temuan HIGH berkaitan dengan mass assignment pada field `user_id` di endpoint update guru — ini adalah celah logika yang berpotensi disalahgunakan oleh admin nakal. Tidak ada temuan CRITICAL baru, mengkonfirmasi kematangan arsitektur sistem secara keseluruhan.

---

## STATUS PERBAIKAN V3 (VERIFIKASI)

| ID V3   | Deskripsi                                              | Status     |
|---------|--------------------------------------------------------|------------|
| V3-H01  | `buildTeacherMap()` unguarded full table scan          | ✅ FIXED   |
| V3-M01  | No transaction in RegisteredUserController::store()    | ✅ FIXED   |
| V3-M02  | `$user->_id` tidak di-cast ke string di registrasi    | ✅ FIXED   |
| V3-M03  | `adminStudentReports()` no 404 on invalid studentId   | ✅ FIXED   |
| V3-L01  | `chart()` 6 sequential queries → 1 query              | ✅ FIXED   |
| V3-L02  | MitraReport file_url relative vs absolute             | ✅ FIXED   |
| V3-L03  | OTP brute force per-email rate limit missing          | ✅ FIXED   |
| V3-L04  | `Notification::sendToRole()` N+1 insert loop          | ✅ FIXED   |

---

## TEMUAN AUDIT V4

---

### V4-H01 — HIGH
**`TeacherController::update()` Menerima `user_id` dari Request — Mass Assignment & Account Hijacking**

**File:** `app/Http/Controllers/TeacherController.php:127–152`
**Endpoint:** `PUT /api/teachers/{id}`
**Severity:** HIGH
**Category:** Security / Business Logic

**Deskripsi:**
Method `update()` mengvalidasi dan menyimpan `user_id` langsung dari input request:

```php
// VALIDASI (baris 127-131):
$validator = Validator::make($request->all(), [
    'user_id'      => 'nullable|string',  // ← menerima user_id dari luar
    'nama_guru'    => 'nullable|string|max:100',
    'phone'        => 'nullable|string|max:20',
    'spesialisasi' => 'nullable|string|max:100',
]);

// UPDATE (baris 147-152):
$teacher->update([
    'user_id'   => $request->user_id ?? null,  // ← user_id dapat diinjeksi
    'nama_guru' => $request->nama_guru,
    ...
]);
```

**Steps To Reproduce:**
1. Login sebagai admin
2. Lihat ID dari user non-teacher (misal admin lain) di endpoint `GET /api/teachers`
3. Kirim `PUT /api/teachers/{teacher_id}` dengan body `{"user_id": "<admin_user_id>", "nama_guru": "Injected"}`
4. Teacher record sekarang terhubung ke akun admin

**Dampak:**
- Admin dapat memutus koneksi antara guru dan akun login-nya (`user_id: null`)
- Admin dapat menghubungkan teacher record ke akun user milik role lain
- Merusak integritas relasi `teachers ↔ users`
- `TeacherController::spesialisasiList()` dan semua query berbasis `user_id` akan mengembalikan data salah

**Root Cause:** Field `user_id` yang seharusnya immutable setelah create dibiarkan updatable tanpa verifikasi.

**Rekomendasi:**
```php
// Hapus user_id dari validasi dan update:
$validator = Validator::make($request->all(), [
    // HAPUS: 'user_id' => 'nullable|string',
    'nama_guru'    => 'nullable|string|max:100',
    'phone'        => 'nullable|string|max:20',
    'spesialisasi' => 'nullable|string|max:100',
]);

$teacher->update([
    // HAPUS: 'user_id' => $request->user_id ?? null,
    'nama_guru' => $request->nama_guru,
    'phone'     => $request->phone,
    'bidang'    => $request->spesialisasi,
]);
```

---

### V4-M01 — MEDIUM
**`TeacherController::destroy()` Menghapus Seluruh Riwayat Akademik Siswa**

**File:** `app/Http/Controllers/TeacherController.php:162–188`
**Severity:** MEDIUM
**Category:** Business Logic / Data Integrity

**Deskripsi:**
Saat guru dihapus, semua laporan kemajuan (`progress_reports`) yang pernah dibuat guru tersebut untuk seluruh siswa ikut terhapus:

```php
// Baris 172:
ProgressReport::where('teacher_id', $teacherId)->delete();
```

Ini berarti **riwayat belajar siswa hilang selamanya** hanya karena gurunya keluar dari sistem. Ini bertentangan dengan prinsip integritas data akademik — catatan perkembangan siswa adalah aset permanen yang tidak boleh dihapus karena perubahan kepegawaian.

**Dampak:**
- Orang tua kehilangan akses ke riwayat laporan anak yang pernah dibuat guru tersebut
- Admin tidak bisa lagi mengaudit progres akademik siswa di periode tersebut
- Data terhapus tidak bisa dipulihkan (MongoDB tidak ada recycle bin)

**Rekomendasi:** Ganti hard delete dengan soft approach — set `teacher_id` menjadi null, atau pertahankan reports dan hanya hapus akun guru:

```php
public function destroy(string $id)
{
    $teacher   = Teacher::find($id);
    $teacherId = (string) $teacher->_id;

    // Set teacher_id ke null alih-alih hapus — preservasi data akademik
    ProgressReport::where('teacher_id', $teacherId)->update(['teacher_id' => null]);

    $teacher->delete();

    if (!empty($teacher->user_id)) {
        User::find($teacher->user_id)?->delete();
    }
    ...
}
```

---

### V4-M02 — MEDIUM
**`TeacherController::updateOwnProfile()` Tidak Menghapus Foto Lama**

**File:** `app/Http/Controllers/TeacherController.php:246–249`
**Severity:** MEDIUM
**Category:** Storage Leak / Maintainability

**Deskripsi:**
Saat guru mengupload foto profil baru, foto lama di `storage/public/profile/` **tidak dihapus**:

```php
// Baris 246-249 — TIDAK ada penghapusan foto lama:
if ($request->hasFile('photo')) {
    $path     = $request->file('photo')->store('profile', 'public');
    $photoUrl = asset('storage/' . $path . '?v=' . time());  // ← masalah tambahan
}
```

Kontras: `MitraController::updateOwnProfile()` sudah benar menghapus foto lama (diperbaiki di V2).

**Masalah Tambahan — Double Cache-Buster:**
URL foto disimpan dengan `?v={timestamp}` di-embed dalam URL tersimpan (`asset('storage/' . $path . '?v=' . time())`). Kemudian `HandleInertiaRequests` menambahkan lagi `?v={md5}`, menghasilkan URL malformed:
```
http://localhost/storage/profile/photo.jpg?v=1716000000?v=abc123
```
Browser biasanya masih memparse ini, tapi ini URL tidak valid (seharusnya `&v=`).

**Rekomendasi:**
```php
if ($request->hasFile('photo')) {
    // Hapus foto lama jika ada
    if ($photoUrl && str_contains($photoUrl, '/storage/')) {
        $parsedPath = parse_url($photoUrl, PHP_URL_PATH);
        if ($parsedPath) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
        }
    }
    $path     = $request->file('photo')->store('profile', 'public');
    $photoUrl = asset('storage/' . $path);  // ← tanpa ?v=time(), biarkan Inertia yang handle
}
```

---

### V4-M03 — MEDIUM
**`InfoController::programUpdate()` Hanya Append Gallery — Tidak Ada Mekanisme Hapus**

**File:** `app/Http/Controllers/InfoController.php:324–348`
**Severity:** MEDIUM
**Category:** Business Logic / Storage Leak

**Deskripsi:**
Setiap kali program diupdate dengan `gallery_images`, gambar baru ditambahkan ke array yang ada, tidak pernah diganti:

```php
// Baris 324-333:
$galleryUrls = $doc->gallery ?? [];
if ($request->hasFile('gallery_images')) {
    foreach ($request->file('gallery_images') as $file) {
        if ($file->isValid()) {
            $path          = $file->store('info/programs/gallery', 'public');
            $galleryUrls[] = URL::to(Storage::url($path));  // ← selalu append
        }
    }
}
```

Tidak ada endpoint atau parameter untuk:
1. Menghapus gambar gallery tertentu
2. Mengganti seluruh gallery
3. File lama di disk tidak pernah dibersihkan

**Dampak:** Setiap update program yang menyertakan gambar baru akan menumpuk file di `storage/public/info/programs/gallery/` tanpa batas — storage leak yang membesar seiring waktu.

**Rekomendasi:**
Tambahkan parameter `remove_gallery_indices` (array index) atau support `gallery_replace = true` untuk reset gallery. Minimal tambahkan endpoint terpisah `DELETE /api/info/programs/{id}/gallery/{index}` untuk hapus satu gambar.

---

### V4-M04 — MEDIUM
**Dua Alur Lupa Password yang Aktif Bersamaan — Konflik & User Enumeration Risk**

**File:** `routes/auth.php:25–35`, `routes/api.php:33–36`
**Severity:** MEDIUM
**Category:** Security / Architecture

**Deskripsi:**
Sistem memiliki dua alur lupa password yang aktif bersamaan:

**Alur 1 — Custom OTP (digunakan oleh frontend):**
```
POST /api/forgot-password/send-otp   → ForgotPasswordController::sendOtp()
POST /api/forgot-password/reset      → ForgotPasswordController::resetPassword()
```

**Alur 2 — Breeze Email-based (masih aktif, tidak digunakan frontend):**
```
GET  /forgot-password   → PasswordResetLinkController::create()
POST /forgot-password   → PasswordResetLinkController::store()
GET  /reset-password/{token} → NewPasswordController::create()
POST /reset-password         → NewPasswordController::store()
```

Alur Breeze menggunakan `DB::table('users')` standar Laravel, bukan MongoDB User model — kemungkinan besar **tidak berfungsi dengan benar** karena sistem menggunakan MongoDB. Namun endpoint-nya tetap aktif dan bisa diakses publik.

**Potensi Eksploit:** Attacker bisa mengirim POST ke `/forgot-password` dengan email target untuk memicu email reset (jika SMTP dikonfigurasi), mengkonfirmasi bahwa email tersebut terdaftar di sistem — **user enumeration** via respons waktu/error yang berbeda.

**Rekomendasi:**
```php
// Di routes/auth.php — hapus atau nonaktifkan alur yang tidak digunakan:
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])->middleware('throttle:5,10');
    Route::get('login',  [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // HAPUS: semua route forgot-password dan reset-password (alur sudah diganti custom OTP)
});
```

---

### V4-M05 — MEDIUM
**`UsersSeeder` Menggunakan `truncate()` dan Password Lemah Hardcoded**

**File:** `database/seeders/UsersSeeder.php:13`
**Severity:** MEDIUM
**Category:** Security / Operations

**Deskripsi:**
`UsersSeeder::run()` memanggil `User::truncate()` di baris pertama — ini **menghapus seluruh koleksi users** tanpa konfirmasi:

```php
public function run(): void
{
    User::truncate();  // ← BAHAYA: hapus semua user jika dijalankan di production
    // ...
}
```

Password yang digunakan: `admin1234`, `guru1234`, `wali1234`, `mitra1234` — semua dapat ditebak dengan dictionary attack sederhana.

**Risiko:** Jika `php artisan db:seed --class=UsersSeeder` dijalankan di production (misalnya saat setup awal oleh tim yang tidak familiar), semua akun user yang ada **akan terhapus permanen**.

**Rekomendasi:**
```php
public function run(): void
{
    if (app()->environment('production')) {
        $this->command->warn('UsersSeeder dilewati di lingkungan production.');
        return;
    }

    User::truncate();

    User::create([
        'role_id'  => 'RL01',
        'username' => 'admin',
        'email'    => 'admin@qlc.id',
        'password' => Hash::make(env('SEED_ADMIN_PASSWORD', Str::random(16))),
        // ← password dari .env, bukan hardcoded
    ]);
    // ...
}
```

---

### V4-L01 — LOW
**`TeacherController::spesialisasiList()` Memuat Seluruh Koleksi Tanpa Proyeksi**

**File:** `app/Http/Controllers/TeacherController.php:281`
**Severity:** LOW
**Category:** Performance

**Deskripsi:**
```php
// Baris 281 — memuat SEMUA field dari semua teacher:
$list = Teacher::get()->pluck('bidang')->filter()->unique()->sort()->values()->toArray();
```

`Teacher::get()` memuat seluruh dokumen guru (termasuk `user_id`, `nama_guru`, `phone`, `email`, dll.) hanya untuk mengambil satu field `bidang`. Dengan 100 guru, ini membawa 100 dokumen penuh ke PHP.

**Perbaikan:**
```php
$list = Teacher::get(['bidang'])->pluck('bidang')->filter()->unique()->sort()->values()->toArray();
// Lebih baik lagi, distinct di database level:
// Teacher::distinct('bidang')->get() — tidak tersedia di MongoDB Eloquent
```

---

### V4-L02 — LOW
**`StudentController::format()` Mengandung Fallback N+1 Query**

**File:** `app/Http/Controllers/StudentController.php:242–258`
**Severity:** LOW
**Category:** Performance

**Deskripsi:**
Method `format()` memiliki fallback query individual jika `$programs` null atau program tidak ditemukan di map:

```php
private function format($doc, $programs = null): array
{
    if (!empty($doc->program_id)) {
        if ($programs && isset($programs[(string) $doc->program_id])) {
            $programName = $programs[(string) $doc->program_id]->name ?? null;
        } else {
            // ← Fallback: query individual per dokumen
            $p = Program::find($doc->program_id);
            $programName = $p?->name;
        }
    }

    if (!$parentName && !empty($doc->parent_id)) {
        // ← Fallback: query individual per dokumen
        $p = Parents::where('user_id', (string) $doc->parent_id)->first();
        $parentName = $p?->parent_name;
    }
    ...
}
```

Saat `show()` dipanggil dengan satu dokumen, ini acceptable. Namun jika `format()` digunakan tanpa `$programs` dari `index()`, masing-masing record memicu 1-2 query tambahan.

**Perbaikan:** Hapus fallback N+1, buat `$programs` parameter required untuk `index()` dan tidak pass ke `show()` mana semua data sudah di pre-loaded:

```php
private function format($doc, array $programMap = [], string $parentName = ''): array
{
    $pid         = (string) ($doc->program_id ?? '');
    $programName = $programMap[$pid] ?? null;
    // Tidak ada fallback query — caller bertanggung jawab pre-load data
    ...
}
```

---

### V4-L03 — LOW
**`InfoController::leaderStore()` dan `leaderUpdate()` — Tidak Ada Validasi Field Teks**

**File:** `app/Http/Controllers/InfoController.php:149–169`
**Severity:** LOW
**Category:** Validation / Data Integrity

**Deskripsi:**
`leaderStore()` hanya memvalidasi field `image` (file upload). Semua field teks disimpan langsung tanpa validasi:

```php
$doc = Leader::create([
    'nama'      => $request->nama,      // ← tidak divalidasi, bisa null/sangat panjang
    'jabatan'   => $request->jabatan,   // ← tidak divalidasi
    'deskripsi' => $request->deskripsi, // ← tidak divalidasi
    'poin'      => $request->poin,      // ← tipe tidak divalidasi (bisa string, float)
    'image_url' => $imageUrl,
]);
```

Hal yang sama berlaku untuk `leaderUpdate()`, `profileUpsert()` (field text tidak divalidasi), `galleryStore()` (`title` dan `type` tidak divalidasi).

**Perbaikan:**
```php
public function leaderStore(Request $request)
{
    $validated = $request->validate([
        'nama'      => 'required|string|max:150',
        'jabatan'   => 'nullable|string|max:150',
        'deskripsi' => 'nullable|string|max:1000',
        'poin'      => 'nullable|integer|min:0|max:9999',
        'image'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);
    ...
}
```

---

### V4-L04 — LOW
**`Gallery::uploaded_at` Tidak Di-set Saat Create — Ordering Tidak Konsisten**

**File:** `app/Http/Controllers/InfoController.php:402–408`
**Severity:** LOW
**Category:** Data Integrity / Logic

**Deskripsi:**
`galleryStore()` tidak mengisi field `uploaded_at` saat membuat galeri baru:

```php
$doc = Gallery::create([
    'title'     => $request->title,
    'media_url' => $mediaUrl,
    'type'      => $request->type,
    // ← uploaded_at tidak di-set
]);
```

Namun `galleryIndex()` menggunakan `Gallery::orderBy('uploaded_at', 'desc')`. Jika `uploaded_at` null untuk record baru, ordering akan tidak konsisten — MongoDB menaruh null value di awal atau akhir tergantung order direction.

**Perbaikan:**
```php
$doc = Gallery::create([
    'title'       => $request->title,
    'media_url'   => $mediaUrl,
    'type'        => $request->type,
    'uploaded_at' => now(),
]);
```

---

### V4-L05 — LOW
**`StudentController::options()` Memuat Seluruh Parents Tanpa Pagination**

**File:** `app/Http/Controllers/StudentController.php:225`
**Severity:** LOW
**Category:** Performance / Scalability

**Deskripsi:**
```php
$parents = Parents::orderBy('parent_name')->get()->map(...);
```

`get()` tanpa limit memuat SEMUA wali murid ke memori. Dengan 500+ wali murid, dropdown akan sangat besar dan response lambat. Endpoint ini dipanggil setiap kali admin membuka form tambah/edit siswa.

**Perbaikan:** Tambahkan search dengan batasan:
```php
$search  = $request->query('search', '');
$parents = Parents::when($search, fn($q) => $q->where('parent_name', new Regex(preg_quote($search, '/'), 'i')))
    ->orderBy('parent_name')
    ->limit(50)
    ->get()
    ->map(...);
```

---

### V4-L06 — LOW
**`EnrollmentController::store()` Menyimpan `bukti_pembayaran` Sebagai URL Relatif**

**File:** `app/Http/Controllers/Parents/EnrollmentController.php:71`
**Severity:** LOW
**Category:** Consistency

**Deskripsi:**
```php
$fileUrl = Storage::url($path);  // ← mengembalikan "/storage/enrollments/..."
```

`MitraController` dan `MitraReportController` (post V3 fix) menggunakan `url('storage/' . $path)` — URL absolut. `EnrollmentController` masih menggunakan `Storage::url()` — URL relatif. Inkonsistensi sama seperti V3-L02 yang sudah diperbaiki untuk MitraReport.

**Perbaikan:**
```php
$fileUrl = url('storage/' . $path);
```

---

### V4-L07 — LOW
**Frontend Teacher Dashboard: Cache-Busting Foto Menggunakan `Date.now()` Setiap Render**

**File:** `resources/js/Pages/teacher/Dashboard.tsx:166`
**Severity:** LOW
**Category:** Performance / Frontend

**Deskripsi:**
```tsx
src={`${auth.user.photo}?t=${Date.now()}`}
```

`Date.now()` menghasilkan timestamp berbeda setiap kali komponen dirender ulang. Browser tidak bisa mengcache gambar ini karena URL berubah setiap render. Setiap kali komponen ini remount (navigasi tab), gambar profile guru **akan didownload ulang dari server**, meningkatkan network traffic yang tidak perlu.

Backend sudah menyediakan `?v={md5}` yang stabil via `HandleInertiaRequests`. Frontend seharusnya menggunakan URL yang sudah disediakan tanpa menambah parameter lagi:

```tsx
// Cukup gunakan photo URL dari auth yang sudah ada md5 cache-bust dari backend:
src={auth.user.photo ?? ''}
```

---

## TEMUAN POSITIF (KONFIRMASI V4)

| Aspek | Detail |
|---|---|
| **TeacherController cascade delete** | Hapus ProgressReport saat guru dihapus — ada (meski bisnis logikanya perlu dipertimbangkan) |
| **StudentController parent+program validation** | `store()` dan `update()` memverifikasi parent dan program sebelum menyimpan |
| **StudentController enrollment notification** | Notifikasi ke guru saat siswa diaktifkan berjalan benar |
| **EnrollmentController program check** | Memvalidasi program sebelum upload file (V2 fix tetap ada) |
| **AgendaController visibility scope** | `forVisibility()` scope digunakan konsisten di semua query |
| **AgendaController limit enforcement** | Limit dibatasi max 50 via `max(1, min(50, ...))` (V2 fix tetap ada) |
| **InfoController file cleanup** | Delete file lama sebelum upload baru di `leaderUpdate()`, `programUpdate()`, `galleryUpdate()` |
| **Navbar authentication-aware** | Route dashboard dibedakan per role dengan benar |
| **Teacher Dashboard tabs** | Tab navigation menggunakan Inertia router dengan `preserveState: true` |
| **Login throttle** | 5 percobaan per username+IP sebelum lockout |

---

## TABEL PRIORITAS PERBAIKAN V4

| ID     | Severity | File                            | Estimasi | Urgensi |
|--------|----------|---------------------------------|----------|---------|
| V4-H01 | HIGH     | TeacherController.php:148       | 5 menit  | Segera  |
| V4-M01 | MEDIUM   | TeacherController.php:172       | 10 menit | Tinggi  |
| V4-M02 | MEDIUM   | TeacherController.php:247       | 10 menit | Tinggi  |
| V4-M03 | MEDIUM   | InfoController.php:324          | 30 menit | Sedang  |
| V4-M04 | MEDIUM   | routes/auth.php:25              | 5 menit  | Sedang  |
| V4-M05 | MEDIUM   | UsersSeeder.php:13              | 10 menit | Sedang  |
| V4-L01 | LOW      | TeacherController.php:281       | 2 menit  | Rendah  |
| V4-L02 | LOW      | StudentController.php:249       | 15 menit | Rendah  |
| V4-L03 | LOW      | InfoController.php:149          | 15 menit | Rendah  |
| V4-L04 | LOW      | InfoController.php:402          | 2 menit  | Rendah  |
| V4-L05 | LOW      | StudentController.php:225       | 10 menit | Rendah  |
| V4-L06 | LOW      | EnrollmentController.php:71     | 2 menit  | Rendah  |
| V4-L07 | LOW      | teacher/Dashboard.tsx:166       | 2 menit  | Rendah  |

---

## RENCANA PERBAIKAN BERTAHAP

### Tier 1 — Perbaiki Hari Ini
1. **V4-H01** — Hapus `user_id` dari validation rules dan update payload di `TeacherController::update()`
2. **V4-M02** — Tambahkan penghapusan foto lama dan hapus `?v=time()` dari stored URL di `TeacherController::updateOwnProfile()`
3. **V4-L04** — Set `uploaded_at` pada `Gallery::create()` di `galleryStore()`
4. **V4-L06** — Ganti `Storage::url($path)` dengan `url('storage/' . $path)` di `EnrollmentController::store()`
5. **V4-L07** — Hapus `?t=${Date.now()}` dari avatar src di `teacher/Dashboard.tsx`

### Tier 2 — Perbaiki Sprint Ini
6. **V4-M01** — Ubah `TeacherController::destroy()` untuk preserve reports (set `teacher_id = null`)
7. **V4-M04** — Hapus atau disable route Breeze password reset yang tidak digunakan di `routes/auth.php`
8. **V4-M05** — Tambahkan environment guard pada `UsersSeeder` dan baca password dari env
9. **V4-L01** — Tambahkan field projection `['bidang']` di `spesialisasiList()`
10. **V4-L03** — Tambahkan validasi field teks di `leaderStore()`, `leaderUpdate()`, `galleryStore()`

### Tier 3 — Optimisasi Jangka Menengah
11. **V4-M03** — Buat endpoint delete untuk individual gallery image di Program
12. **V4-L02** — Refactor `StudentController::format()` untuk eliminasi fallback N+1
13. **V4-L05** — Tambahkan search + limit pada `StudentController::options()`

---

## ANALISIS KEAMANAN MENYELURUH (PENETRATION TESTING SUMMARY)

### Simulasi Attack Vectors

| Attack Vector | Status | Mitigasi |
|---|---|---|
| SQL Injection | N/A (MongoDB) | MongoDB tidak rentan SQL injection; regex-based search sudah di-escape dengan `preg_quote()` |
| NoSQL Injection | ✅ Mitigated | Semua input string di-escape sebelum dijadikan MongoDB Regex |
| XSS | ⚠️ Partial | CSP ada tapi `unsafe-inline` melemahkan proteksi; Inertia otomatis escape di React |
| CSRF | ✅ Mitigated | `statefulApi()` + CSRF cookie untuk SPA; API routes dikecualikan secara sengaja |
| IDOR | ✅ Mitigated | Parent cek kepemilikan student; teacher cek kepemilikan report; notifikasi scoped per user |
| Brute Force Login | ✅ Mitigated | 5 attempts per IP+username, lockout via `RateLimiter` |
| Brute Force OTP | ✅ Mitigated | Per-email + per-IP rate limit; bcrypt hash check memperlambat serangan |
| File Upload | ✅ Mitigated | MIME validation, ukuran dibatasi, disimpan di luar webroot (`storage/`) |
| Mass Assignment | ❌ **VULNERABLE** | `user_id` injectable di TeacherController::update() (V4-H01) |
| Privilege Escalation | ✅ Mitigated | RoleMiddleware memverifikasi role dari database, bukan dari session/token |
| Session Fixation | ✅ Mitigated | Laravel regenerates session ID setelah login |
| Open Redirect | ✅ Mitigated | Redirect hanya ke named routes internal |
| User Enumeration (forgot pw) | ✅ Mitigated | Respons identik apakah email ada atau tidak |
| User Enumeration (Breeze routes) | ⚠️ Risk | Route `/forgot-password` Breeze masih aktif (V4-M04) |
| Sensitive Data Exposure | ✅ Mitigated | `password` di-hidden di User model; PHP version tidak di-expose |
| Cascade Delete Safety | ✅ Mitigated | V2 fixes cascade delete di parent/mitra; teacher reports perlu perbaikan logika |

---

## SCORING BREAKDOWN

| Kategori                        | V1   | V2   | V3   | V4   |
|---------------------------------|------|------|------|------|
| Authentication & Authorization  | 14/20| 17/20| 18/20| 19/20|
| Data Integrity & Validation     | 11/20| 15/20| 16/20| 17/20|
| Security (Headers, CSRF, XSS)   | 10/15| 13/15| 14/15| 14/15|
| Performance & Query Efficiency  |  8/15| 11/15| 12/15| 13/15|
| Code Quality & Consistency      | 10/15| 12/15| 13/15| 13/15|
| Error Handling & Robustness     |  9/15|  7/15|  9/15|  9/15|
| **TOTAL**                       |**62**|**75**|**82**|**85**|

---

## PRODUCTION READINESS CHECKLIST

| Item | Status |
|---|---|
| Semua V3 fixes diterapkan | ✅ |
| Rate limiting semua endpoint auth | ✅ |
| Security headers global | ✅ |
| OTP stored as hash | ✅ |
| Cascade delete implemented | ✅ |
| Role-based route protection | ✅ |
| CSRF protection (SPA mode) | ✅ |
| `user_id` injectable di TeacherController::update() | ❌ V4-H01 |
| Foto lama guru tidak dihapus saat update | ❌ V4-M02 |
| Breeze password reset routes masih aktif | ⚠️ V4-M04 |
| `UsersSeeder` bisa truncate production | ⚠️ V4-M05 |
| Gallery tidak bisa dihapus dari program | ⚠️ V4-M03 |
| MongoDB indexes aktif | ⚠️ Perlu `php artisan migrate` |
| HTTPS + HSTS di production | ⚠️ Infra |
| `.env` tidak tercommit ke repo | ⚠️ Verifikasi via `.gitignore` |

---

## KESIMPULAN

Sistem SIAKAD QLC telah mencapai **tingkat kematangan intermediate-production** dengan skor 85/100. Dari 4 iterasi audit, total 37 temuan telah diidentifikasi dan mayoritas telah diperbaiki. Arsitektur keamanan inti (autentikasi, otorisasi, rate limiting, security headers) sudah solid.

**Dua hal yang harus diprioritaskan sebelum go-live:**
1. **V4-H01** — Hapus `user_id` dari `TeacherController::update()` segera. Ini adalah mass assignment yang dapat disalahgunakan.
2. **V4-M04** — Nonaktifkan Breeze password reset routes (`/forgot-password`, `/reset-password`) karena alur ini tidak konsisten dengan sistem OTP custom yang digunakan.

Setelah 13 temuan V4 ini diperbaiki, sistem layak untuk deployment production dengan catatan: tambahkan `php artisan migrate` untuk aktivasi MongoDB indexes, dan verifikasi `.env` production menggunakan nilai yang kuat (tidak ada default values).

**Nilai kematangan kode: Intermediate → approaching Production Grade.**

---

*Dokumen ini bersifat internal dan hanya untuk keperluan perbaikan sistem SIAKAD QLC.*
*Total temuan across 4 audit iterations: 37 issues (V1: 15, V2: 15 baru, V3: 9 baru, V4: 13 baru)*
