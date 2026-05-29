# AUDIT REPORT SIAKAD QLC — V6
**Tanggal Audit:** 2026-05-28
**Auditor:** Principal Software QA Engineer / Senior Security Auditor / Enterprise System Analyst
**Pass:** 6 (post-fix dari V5)
**Skor Keseluruhan: 89/100**

---

## Ringkasan Eksekutif

Audit V6 mencakup seluruh bagian sistem yang belum diuji secara mendalam di V5 ke bawah: `ProfileController` (Breeze boilerplate), `InfoController` (CRUD landing page), `NotificationController`, `RoleMiddleware`, model-model utama, dan pipeline OTP. Tidak ada temuan HIGH atau CRITICAL. Ditemukan **3 temuan MEDIUM** dan **5 temuan LOW**, mayoritas berkaitan dengan Breeze scaffold yang belum diadaptasi dan inkonsistensi validasi di `InfoController`.

Semua perbaikan V5 terkonfirmasi stabil. Sistem secara keseluruhan sudah berada pada level **production-ready untuk skala kecil-menengah** (ratusan pengguna) dengan reservasi pada temuan V6-M01 yang harus diperbaiki sebelum go-live.

---

## Temuan V6

### 🟡 MEDIUM

---

#### V6-M01 — ProfileController: Account Deletion Tanpa Cascade → Orphaned Data

**Severity:** MEDIUM
**Category:** Security / Data Integrity
**File:** `app/Http/Controllers/ProfileController.php:46-62`
**Route:** `DELETE /profile` (web, semua role terautentikasi)

**Deskripsi:**
`ProfileController::destroy()` adalah boilerplate Laravel Breeze yang belum diadaptasi. Method ini menghapus User langsung tanpa membersihkan data turunan:

```php
public function destroy(Request $request): RedirectResponse
{
    $request->validate(['password' => ['required', 'current_password']]);

    $user = $request->user();
    Auth::logout();
    $user->delete();  // ← User dihapus, tapi relasi tidak dibersihkan
    $request->session()->invalidate();
    ...
}
```

**Skenario Dampak per Role:**

| Role | Dampak jika menghapus akun via /profile |
|------|------------------------------------------|
| **parents** | Parents document + seluruh Students tetap di DB (orphaned). Student.parent_id → user_id yang sudah tidak ada. ProgressReport siswa tetap ada. Bukti pembayaran tidak dihapus dari storage. |
| **teacher** | Teacher document + ProgressReport dengan teacher_id tersebut tetap ada. ProgressReport tidak di-nullify (berbeda dengan `TeacherController::destroy()` yang sudah benar). |
| **mitra** | Partner document + seluruh MitraReport tetap ada. MOU file tidak dihapus dari storage. |
| **admin** | Admin account dihapus → sistem bisa kehilangan satu-satunya admin jika hanya ada satu. |

Frontend `resources/js/Pages/Profile/Partials/DeleteUserForm.tsx` menyediakan UI "Delete Account" yang accessible melalui `/profile` route — aktif dan bisa digunakan user mana pun.

**Steps to Reproduce:**
1. Login sebagai wali murid yang memiliki anak terdaftar
2. Navigasi ke `/profile`
3. Klik "Delete Account", masukkan password
4. Akun user terhapus — Parents document dan Students tetap ada di DB

**Root Cause:** Breeze boilerplate tidak memiliki domain logic SIAKAD. Tidak ada cascade delete dan tidak ada role-guard pada route ini.

**Rekomendasi Fix:**
```php
// Option A: Tambahkan cascade logic per role
public function destroy(Request $request): RedirectResponse
{
    $request->validate(['password' => ['required', 'current_password']]);
    $user     = $request->user();
    $roleName = $user->getRoleName();

    if ($roleName === 'parents') {
        // Delegasikan ke ParentController::destroy() logic
        $parent = Parents::where('user_id', (string) $user->_id)->first();
        if ($parent) {
            Student::where('parent_id', (string) $parent->user_id)
                ->each(function ($student) {
                    ProgressReport::where('student_id', (string) $student->_id)->delete();
                    if (!empty($student->bukti_pembayaran)) {
                        Storage::disk('public')->delete($student->bukti_pembayaran);
                    }
                    $student->delete();
                });
            $parent->delete();
        }
    }
    // ... handle teacher, mitra similarly

    Auth::logout();
    $user->delete();
    ...
}

// Option B (lebih sederhana): Nonaktifkan route ini, arahkan ke settings halaman masing-masing role
// Hapus route profile.destroy dari web.php atau tambahkan middleware role yang tepat
```

---

#### V6-M02 — InfoController::profileUpsert(): Tidak Ada Validasi pada Field Teks

**Severity:** MEDIUM
**Category:** Validation / Data Integrity
**File:** `app/Http/Controllers/InfoController.php:25-91`
**Endpoint:** `POST /api/info/profile`

**Deskripsi:**
`profileUpsert()` hanya memvalidasi file upload (`logo`, `about_image`). Seluruh field teks tidak divalidasi sama sekali:

```php
$request->validate([
    'logo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    'about_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
]);
// Tidak ada validasi untuk: name, hero_title, tagline, history,
// vision, mission, address, whatsapp, email, established_year,
// bank_name, bank_account, bank_holder, bank_nominal
```

**Field yang tidak tervalidasi dan risikonya:**
| Field | Risk |
|-------|------|
| `email` | Tidak ada validasi format `email` — string sembarang tersimpan |
| `whatsapp` | Tidak ada validasi format nomor telepon |
| `bank_account` | Tidak ada validasi numerik — teks apapun bisa disimpan |
| `established_year` | Tidak ada validasi integer/year range |
| `history`, `vision`, `mission` | Tidak ada `max:` length — string tanpa batas bisa disimpan ke MongoDB |
| `name` | Tidak ada `required` — profil lembaga bisa disimpan dengan nama kosong |

**Rekomendasi Fix:**
```php
$request->validate([
    'name'             => 'nullable|string|max:200',
    'hero_title'       => 'nullable|string|max:300',
    'tagline'          => 'nullable|string|max:500',
    'history'          => 'nullable|string|max:5000',
    'vision'           => 'nullable|string|max:2000',
    'mission'          => 'nullable|string|max:2000',
    'address'          => 'nullable|string|max:500',
    'whatsapp'         => 'nullable|string|max:20',
    'email'            => 'nullable|email|max:150',
    'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
    'main_focus'       => 'nullable|string|max:500',
    'bank_name'        => 'nullable|string|max:100',
    'bank_account'     => 'nullable|string|max:30',
    'bank_holder'      => 'nullable|string|max:150',
    'bank_nominal'     => 'nullable|integer|min:0',
    'logo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    'about_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
]);
```

---

#### V6-M03 — ProfileController::update(): Field `name` Silently Dropped; Breeze Boilerplate Tidak Kompatibel dengan User Model SIAKAD

**Severity:** MEDIUM
**Category:** Logic Bug / Architecture
**File:** `app/Http/Controllers/ProfileController.php:30-39`
**File:** `app/Http/Requests/ProfileUpdateRequest.php`

**Deskripsi:**
`ProfileUpdateRequest` memvalidasi dua field: `name` dan `email`. Namun `User` model SIAKAD menggunakan `username` (bukan `name`) dan `$fillable` tidak mencakup field `name`:

```php
// ProfileUpdateRequest.php
'name' => ['required', 'string', 'max:255'],  // ← validasi 'name'

// ProfileController.php
$request->user()->fill($request->validated());
// fill(['name' => '...', 'email' => '...'])
// ↑ 'name' tidak ada di $fillable User → silently IGNORED
// ↑ hanya 'email' yang tersimpan
```

**Dampak:**
- User mengisi nama baru di form `/profile`, klik Save → form menampilkan "Berhasil disimpan" tapi nama TIDAK berubah (silently dropped).
- Hanya `email` yang tersimpan.
- Jika satu-satunya admin menggunakan form ini untuk mengubah email, bisa mengunci diri jika email baru salah.
- Halaman ini dalam **Bahasa Inggris** (boilerplate Breeze), tidak konsisten dengan UI SIAKAD lainnya.

**Root Cause:** `ProfileController` dan `ProfileUpdateRequest` adalah Breeze boilerplate yang mengasumsikan Laravel's default `name` field pada User model. SIAKAD menggunakan `username` bukan `name`.

**Rekomendasi Fix:**
Nonaktifkan atau hapus route `/profile` Breeze karena setiap role sudah memiliki halaman settings sendiri:
```php
// web.php — hapus atau comment out 3 baris ini:
// Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
// Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
// Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
```
Role-specific settings sudah ada: `/teacher/profile`, `/parents/profile`, `/mitra/profile`, dan `/settings` untuk admin.

---

### 🔵 LOW

---

#### V6-L01 — InfoController: 14+ Lokasi Masih Menggunakan `URL::to(Storage::url($path))`

**Severity:** LOW
**Category:** Code Quality / Consistency
**File:** `app/Http/Controllers/InfoController.php`
**Lokasi:** Lines 42, 53, 161, 197, 246, 252, 258, 266, 311, 320, 329, 337, 432, 464

**Deskripsi:**
V5-L04 memperbaiki pola ini di `ParentController` dan `SettingsController`, namun `InfoController` — yang memiliki paling banyak file upload — tidak diperbaiki. Ini adalah inkonsistensi terbesar yang tersisa.

```php
// Pola lama (InfoController — 14+ lokasi):
$imageUrl = URL::to(Storage::url($path));  // dua fungsi untuk satu tujuan

// Pola standar (TeacherController, MitraController, MitraReportController, EnrollmentController):
$imageUrl = url('storage/' . $path);
```

**Perbaikan:** Ganti semua `URL::to(Storage::url($path))` dengan `url('storage/' . $path)` di seluruh `InfoController`. Setelah itu hapus `use Illuminate\Support\Facades\URL;` dari import.

---

#### V6-L02 — InfoController::programStore/Update(): Tidak Ada Validasi pada Field Teks Program

**Severity:** LOW
**Category:** Validation
**File:** `app/Http/Controllers/InfoController.php:234-360`

**Deskripsi:**
`programStore()` dan `programUpdate()` hanya memvalidasi file gambar, tidak ada validasi pada field teks utama:

```php
$request->validate([
    'image'              => 'nullable|image|...',
    'hero_image'         => 'nullable|image|...',
    'about_image'        => 'nullable|image|...',
    'gallery_images.*'   => 'nullable|image|...',
    // TIDAK ADA validasi untuk: name, description, target_audience, advantages
]);
```

Program bisa disimpan tanpa `name`, atau dengan `description` tak terbatas panjangnya.

**Perbaikan:**
```php
$request->validate([
    'name'            => 'required|string|max:200',
    'description'     => 'nullable|string|max:5000',
    'target_audience' => 'nullable|string|max:500',
    'advantages'      => 'nullable|string',  // JSON string — tambah json validation
    'image'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
    // ...
]);
```

---

#### V6-L03 — InfoController::galleryUpdate(): Validasi `title` dan `type` Hilang (Inkonsisten dengan galleryStore)

**Severity:** LOW
**Category:** Validation / Inconsistency
**File:** `app/Http/Controllers/InfoController.php:444-471`

**Deskripsi:**
```php
// galleryStore() — validated:
'title' => 'required|string|max:200',
'type'  => 'required|in:Photo,Video',

// galleryUpdate() — TIDAK validated:
$request->validate([
    'media' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
    // 'title' dan 'type' tidak divalidasi
]);
$doc->update(['title' => $request->title, 'type' => $request->type, ...]);
// ↑ title bisa string sembarang, type bisa selain 'Photo'/'Video'
```

Lebih serius: baris 465-466:
```php
} elseif ($request->type === 'Video' && $request->filled('media_url')) {
    $mediaUrl = $request->media_url;  // ← tidak ada validasi URL format
}
```
`media_url` untuk Video tidak divalidasi format URL (galleryStore() memvalidasi: `'media_url' => 'nullable|url|max:500'`).

**Perbaikan:**
```php
$request->validate([
    'title'     => 'required|string|max:200',
    'type'      => 'required|in:Photo,Video',
    'media'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
    'media_url' => 'nullable|url|max:500',
]);
```

---

#### V6-L04 — Dead Import: `URL` Facade Masih di-import setelah V5-L04 Fix

**Severity:** LOW
**Category:** Code Quality / Dead Code
**File:** `app/Http/Controllers/SettingsController.php:10`
**File:** `app/Http/Controllers/ParentController.php:14`

**Deskripsi:**
Setelah V5-L04 mengganti `URL::to(Storage::url($path))` → `url('storage/' . $path)`, import `use Illuminate\Support\Facades\URL;` tidak lagi digunakan di kedua file ini.

```php
// SettingsController.php — baris 10
use Illuminate\Support\Facades\URL;  // ← tidak digunakan, hapus

// ParentController.php — baris 14
use Illuminate\Support\Facades\URL;  // ← tidak digunakan, hapus
```

---

#### V6-L05 — EnrollmentController::store(): Tidak Ada Pengecekan Duplikat Pendaftaran

**Severity:** LOW
**Category:** Business Logic
**File:** `app/Http/Controllers/Parents/EnrollmentController.php:41-104`

**Deskripsi:**
Seorang wali murid dapat mendaftarkan anak dengan nama dan program yang sama berkali-kali tanpa hambatan:

```php
// Tidak ada pengecekan:
// Student::where('parent_id', $userId)
//         ->where('nama', $request->nama)
//         ->where('program_id', $request->program_id)
//         ->where('enrollment_status', 'pending')
//         ->exists()

Student::create([...]);  // ← buat saja langsung
```

**Dampak:** Admin menerima duplikat pendaftaran untuk anak yang sama. Jika ada 100 wali murid yang menekan submit dua kali (double-submit), admin mendapat backlog palsu.

**Perbaikan:**
```php
$duplicate = Student::where('parent_id', $userId)
    ->where('nama', $request->nama)
    ->where('program_id', $request->program_id)
    ->whereIn('enrollment_status', ['pending', 'active'])
    ->exists();

if ($duplicate) {
    return back()->withErrors(['nama' => 'Anak ini sudah terdaftar atau sedang menunggu verifikasi untuk program yang sama.'])->withInput();
}
```

---

## Matriks Skor V6

| Kategori                    | V5  | V6  | Δ   |
|-----------------------------|-----|-----|-----|
| Auth & Otorisasi            | 19  | 19  | —   |
| Integritas Data & Validasi  | 17  | 16  | -1  |
| Keamanan                    | 15  | 14  | -1  |
| Performa                    | 13  | 13  | —   |
| Kualitas Kode               | 13  | 14  | +1  |
| Penanganan Error            | 11  | 13  | +2  |
| **Total**                   | **88** | **89** | **+1** |

> Skor naik tipis +1 karena V5 fixes solid dan tidak ada regresi. Penurunan di Data Integrity dan Security disebabkan temuan baru di area yang belum diaudit (InfoController, ProfileController Breeze). Naik di Code Quality dan Error Handling karena area yang sudah diaudit sudah bersih.

---

## Daftar Lengkap Temuan V6

| ID      | Severity | Lokasi                                      | Deskripsi                                                   | Status  |
|---------|----------|---------------------------------------------|-------------------------------------------------------------|---------|
| V6-M01  | MEDIUM   | ProfileController:46-62 / route web.php     | Account deletion tanpa cascade — orphaned Teacher/Parent/Partner + data turunan | 🔴 Open |
| V6-M02  | MEDIUM   | InfoController::profileUpsert:25-91         | Tidak ada validasi pada 13+ field teks profil lembaga       | 🔴 Open |
| V6-M03  | MEDIUM   | ProfileController::update / ProfileUpdateRequest | Field `name` silently dropped (User model tidak punya field `name`) | 🔴 Open |
| V6-L01  | LOW      | InfoController (14+ lokasi)                 | `URL::to(Storage::url($path))` masih digunakan — inkonsisten | 🔴 Open |
| V6-L02  | LOW      | InfoController::programStore/Update         | Tidak ada validasi `name`, `description`, `target_audience` | 🔴 Open |
| V6-L03  | LOW      | InfoController::galleryUpdate               | Hilangnya validasi `title`, `type`, dan `media_url` saat update | 🔴 Open |
| V6-L04  | LOW      | SettingsController:10 / ParentController:14 | Dead import `use Illuminate\Support\Facades\URL;`           | 🔴 Open |
| V6-L05  | LOW      | EnrollmentController::store                 | Tidak ada pengecekan duplikat pendaftaran anak yang sama    | 🔴 Open |

---

## Verifikasi Perbaikan V5 (Semua Confirmed)

| ID      | Deskripsi                                                     | Status       |
|---------|---------------------------------------------------------------|--------------|
| V5-M01  | class_name di TeacherDashboard menampilkan ObjectId           | ✅ Fixed      |
| V5-L01  | Field time & status non-existent di mapping agenda            | ✅ Fixed      |
| V5-L02  | profile?.username selalu undefined — nama guru tidak tampil   | ✅ Fixed      |
| V5-L03  | Redundant User::find() di HandleInertiaRequests               | ✅ Fixed      |
| V5-L04  | URL::to(Storage::url()) di ParentController & SettingsController | ✅ Fixed   |

---

## Temuan Tambahan: Area Yang Sudah Bersih (Confirmed)

### Security — Tidak Ada Temuan
- **OTP Registration**: `random_int()` + `Hash::make()` + 15 min expiry + `throttle:5,10` ✅
- **OTP Forgot Password**: Rate limiter per-email + per-IP + generic response (no user enumeration) ✅
- **RoleMiddleware**: Pengecekan `Auth::check()` + `loadMissing('role')` + `in_array()` ✅
- **CSRF**: Semua web route terproteksi; API dikecualikan (stateful SPA pattern correct) ✅
- **Notification IDOR**: `forUser($userId)->find($id)` scope memastikan user hanya bisa akses notifikasi miliknya ✅
- **Mass Assignment**: Semua model punya `$fillable` terdefinisi; tidak ada `$guarded = []` ✅
- **File Upload**: MIME type + max size divalidasi di semua endpoint upload ✅
- **SQL/MongoDB Injection**: Regex input di-escape dengan `preg_quote()` sebelum digunakan ✅

### Performance — Tidak Ada Temuan Baru
- **MongoDB Indexes**: Sudah dibuat untuk `students`, `progress_reports`, `notifications`, `partners`, `teachers` ✅
- **N+1 Query**: Semua terselesaikan dari V2-V4 ✅
- **Batch Notification**: `sendToRole()` menggunakan batch `insert()` ✅

### Architecture — Sudah Baik
- **Role separation**: Admin/Teacher/Parent/Mitra memiliki controller, route group, dan frontend page terpisah ✅
- **Cascade delete**: Teacher, Parent, Partner masing-masing punya cascade logic di controller ✅
- **API response consistency**: Format `{success, data, meta}` konsisten ✅

---

## Rekomendasi Prioritas V6

1. **[MEDIUM — Segera, sebelum production]** Perbaiki `ProfileController` Breeze:
   - Nonaktifkan route `DELETE /profile` atau tambahkan cascade logic
   - Nonaktifkan atau perbaiki route `PATCH /profile` (name field mismatch)
   - Atau: redirect `/profile` ke settings halaman masing-masing role

2. **[MEDIUM — Sprint ini]** Tambahkan validasi di `InfoController::profileUpsert()` — setidaknya `email`, `bank_account`, dan max-length pada field teks panjang.

3. **[LOW — Sprint ini]** Standarisasi URL pattern di `InfoController` (14+ lokasi `URL::to(Storage::url())` → `url('storage/' . $path)`).

4. **[LOW — Sprint ini]** Tambahkan validasi di `programStore/Update()` dan `galleryUpdate()`.

5. **[LOW — Maintenance]** Hapus dead imports `URL` facade dari `SettingsController` dan `ParentController`.

6. **[LOW — Sprint berikutnya]** Tambahkan duplicate enrollment guard di `EnrollmentController::store()`.

---

## Production Readiness Assessment

| Dimensi                  | Status | Catatan |
|--------------------------|--------|---------|
| Authentication           | ✅ Ready | OTP, rate limiting, session solid |
| Authorization (RBAC)     | ✅ Ready | RoleMiddleware, route groups bersih |
| Data Security            | ⚠️ Partial | V6-M01 profile delete cascade belum aman |
| Input Validation         | ⚠️ Partial | V6-M02 InfoController profile fields tanpa validasi |
| File Upload Security     | ✅ Ready | MIME + size validation di semua endpoint |
| Performance (small scale)| ✅ Ready | Indexes, batch queries, N+1 eliminated |
| Error Handling           | ✅ Ready | 404/403/422 konsisten di semua API |
| Data Integrity           | ⚠️ Partial | V6-M01 ProfileController tanpa cascade |
| Audit Trail              | ✅ Ready | Log::info() untuk delete operations |
| Codebase Maintainability | ✅ Ready | Clean separation, minimal dead code |

**Keputusan:** ⚠️ **Belum 100% siap production** — perbaikan V6-M01 dan V6-M02 wajib dilakukan terlebih dahulu. Setelah itu, sistem siap untuk deployment skala kecil-menengah.
