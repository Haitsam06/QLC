# AUDIT REPORT SIAKAD QLC — V5
**Tanggal Audit:** 2026-05-28
**Auditor:** Principal Software QA Engineer / Senior Security Auditor
**Pass:** 5 (post-fix dari V4)
**Skor Keseluruhan: 88/100**

---

## Ringkasan Eksekutif

Setelah perbaikan menyeluruh pada V3 dan V4 (total 22 temuan diperbaiki), sistem SIAKAD QLC telah mencapai tingkat kematangan yang signifikan. Tidak ada lagi temuan HIGH severity. Audit V5 menemukan **1 temuan MEDIUM** dan **4 temuan LOW** — semuanya bersifat logis atau konsistensi, bukan kerentanan keamanan.

Peningkatan utama yang telah dikonfirmasi tetap stabil:
- ✅ Seluruh pola N+1 query telah dieliminasi (batch `whereIn` + PHP grouping)
- ✅ `user_id` injectable pada `TeacherController::update()` telah diperbaiki
- ✅ Seeder production guard aktif; password dari `.env`
- ✅ Security headers middleware terdaftar di semua web request
- ✅ Rate limiter per-email pada forgot password
- ✅ Cascade delete di semua entitas (Teacher, Parent, Student, Partner)
- ✅ File URL konsisten menggunakan `url('storage/' . $path)` di sebagian besar controller
- ✅ `Notification::sendToRole()` menggunakan batch `insert()`
- ✅ Validasi lengkap pada `InfoController` (leader, gallery)

---

## Temuan V5

### 🟡 MEDIUM

#### V5-M01 — TeacherDashboardController: `class_name` Menampilkan ObjectId Mentah, Bukan Nama Program

**File:** `app/Http/Controllers/Teacher/TeacherDashboardController.php:84`
**Dampak:** Data salah di UI — guru melihat string ObjectId MongoDB di kolom "Kelas" pada tabel laporan terbaru

**Kode Bermasalah:**
```php
$recentReports = $reports->map(function ($r) use ($students) {
    $sid        = (string) ($r->student_id ?? '');
    $studentDoc = $students[$sid] ?? null;
    return [
        ...
        'class_name' => $studentDoc?->program_id ?? '—',  // BUG: ObjectId, bukan nama
        ...
    ];
});
```

`$studentDoc?->program_id` mengembalikan string ObjectId MongoDB (mis. `"6830a1c2..."`) bukan nama program. Frontend `Dashboard.tsx` mendefinisikan `class_name: string` dalam interface `RecentReport` dan menampilkannya langsung di tabel.

**Perbaikan:** Bangun program map sebelum mapping laporan, sama seperti pola yang sudah digunakan di `ProgressReportController::teacherStudents()`.

---

### 🔵 LOW

#### V5-L01 — TeacherDashboardController: Field `time` dan `status` Tidak Ada di Model Agenda

**File:** `app/Http/Controllers/Teacher/TeacherDashboardController.php:59,64`
**Dampak:** Kolom "Jam" selalu '—' dan kolom "Status" selalu 'Menunggu' di agenda dashboard guru

**Kode Bermasalah:**
```php
->map(fn($ag) => [
    'time'   => $ag->time   ?? '—',       // field tidak ada di model Agenda
    'status' => $ag->status ?? 'Menunggu', // field tidak ada di model Agenda
    ...
]);
```

Model `Agenda` hanya memiliki fillable: `user_id, title, event_date, description, location, registration_link, visibility`. Field `time` dan `status` tidak ada — MongoDB mengembalikan `null`, sehingga fallback `??` selalu aktif. Frontend mendefinisikan `status: 'Menunggu' | 'Sedang Berjalan' | 'Selesai'` tapi nilai lain selain 'Menunggu' tidak pernah muncul.

**Perbaikan:** Hapus field `time` dari output (data tidak tersedia di schema); untuk `status`, hapus field atau tetapkan sebagai statis 'Terjadwal' yang benar. Jika fitur status diperlukan, tambahkan field `status` ke schema Agenda.

---

#### V5-L02 — TeacherDashboardController: `profile` Prop Tidak Mengandung `username`; Nama Guru Tidak Tampil

**File:** `app/Http/Controllers/Teacher/TeacherDashboardController.php:24-29`
**File Frontend:** `resources/js/Pages/teacher/Dashboard.tsx:63`
**Dampak:** Sapaan di header dashboard selalu menampilkan username login, bukan nama guru (nama_guru)

**Kode Backend (profile prop):**
```php
$profile = $teacherDoc ? [
    'nama_guru' => $teacherDoc->nama_guru ?? '—',
    'phone'     => $teacherDoc->phone     ?? '—',
    'email'     => $teacherDoc->email     ?? '—',
    'bidang'    => $teacherDoc->bidang    ?? '—',
    // tidak ada 'username'
] : null;
```

**Kode Frontend (salah field):**
```tsx
const teacherName = profile?.username  // selalu undefined — field tidak ada
    || user?.name     // jatuh ke nama dari auth (= username login)
    || user?.username
    || 'Ustadz/Ustadzah';
```

`profile?.username` selalu `undefined` sehingga fallback ke `user?.name` (yang diisi dari username akun). Nama asli guru (`nama_guru`) tidak pernah digunakan sebagai greeting.

**Perbaikan:** Ubah frontend untuk menggunakan `profile?.nama_guru` sebagai prioritas utama:
```tsx
const teacherName = profile?.nama_guru || user?.name || user?.username || 'Ustadz/Ustadzah';
```

---

#### V5-L03 — HandleInertiaRequests: Redundant `User::find()` di Setiap Request Terautentikasi

**File:** `app/Http/Middleware/HandleInertiaRequests.php:37-39`
**Dampak:** 1 query MongoDB ekstra pada setiap page load untuk semua pengguna yang login

**Kode Bermasalah:**
```php
$user = $request->user();      // auth provider sudah query DB & mengembalikan model penuh
if ($user) {
    $user = \App\Models\User::find($user->_id);  // query DB kedua yang identik — redundan
}
```

`$request->user()` sudah mengembalikan `App\Models\User` yang sepenuhnya terhidrasi dari database (auth session driver selalu melakukan DB lookup saat retrieve). Re-query dengan `User::find()` menghasilkan query duplikat pada setiap page request.

**Perbaikan:** Hapus re-query:
```php
$user = $request->user();
// langsung lanjut ke: if ($user) { $user->load('role'); ... }
```

---

#### V5-L04 — ParentController + SettingsController: Pola Konstruksi URL File Tidak Konsisten

**File:** `app/Http/Controllers/ParentController.php:201`
**File:** `app/Http/Controllers/SettingsController.php:50`
**Dampak:** Inkonsistensi teknis — risiko URL yang berbeda di environment dengan konfigurasi non-standar

**Kode Bermasalah (kedua file):**
```php
$photoUrl = URL::to(Storage::url($path));  // dua fungsi untuk satu tujuan
```

**Pola yang benar (TeacherController, MitraController, MitraReportController):**
```php
$photoUrl = url('storage/' . $path);  // konsisten, langsung
// atau
$photoUrl = asset('storage/' . $path);
```

`URL::to(Storage::url($path))` berfungsi tetapi verbose. `Storage::url()` mengembalikan path relatif `/storage/{path}`, lalu `URL::to()` mengubahnya jadi absolut — dua langkah untuk satu operasi. Pola `url('storage/' . $path)` lebih eksplisit dan konsisten dengan seluruh codebase.

**Perbaikan:** Standarisasi ke `url('storage/' . $path)` di kedua file.

---

## Matriks Skor V5

| Kategori                    | V4  | V5  | Δ   |
|-----------------------------|-----|-----|-----|
| Auth & Otorisasi            | 19  | 19  | —   |
| Integritas Data & Validasi  | 17  | 17  | —   |
| Keamanan                    | 14  | 15  | +1  |
| Performa                    | 13  | 13  | —   |
| Kualitas Kode               | 13  | 13  | —   |
| Penanganan Error            | 9   | 11  | +2  |
| **Total**                   | **85** | **88** | **+3** |

> Kenaikan +3 mencerminkan stabilisasi seluruh perbaikan V4 yang terkonfirmasi berjalan. Tidak ada regresi ditemukan.

---

## Daftar Lengkap Temuan V5

| ID      | Severity | Lokasi                                    | Deskripsi                                        | Status  |
|---------|----------|-------------------------------------------|--------------------------------------------------|---------|
| V5-M01  | MEDIUM   | TeacherDashboardController:84             | `class_name` menampilkan ObjectId bukan nama program | 🔴 Open |
| V5-L01  | LOW      | TeacherDashboardController:59,64          | Field `time` & `status` tidak ada di model Agenda | 🔴 Open |
| V5-L02  | LOW      | TeacherDashboardController:24-29 / Dashboard.tsx:63 | `profile?.username` selalu undefined — nama guru tidak tampil | 🔴 Open |
| V5-L03  | LOW      | HandleInertiaRequests:37-39               | Redundant `User::find()` di setiap request auth | 🔴 Open |
| V5-L04  | LOW      | ParentController:201 / SettingsController:50 | URL file menggunakan `URL::to(Storage::url())` yang inkonsisten | 🔴 Open |

---

## Verifikasi Perbaikan V4 (Semua Confirmed)

| ID      | Deskripsi                                         | Status       |
|---------|---------------------------------------------------|--------------|
| V4-H01  | user_id injectable di TeacherController::update() | ✅ Fixed      |
| V4-M01  | Storage::delete() foto tidak dipanggil saat update | ✅ Fixed     |
| V4-M02  | ProgressReport nullification saat teacher dihapus | ✅ Fixed     |
| V4-M03  | Tidak ada route/handler untuk hapus galeri program | ✅ Fixed     |
| V4-M04  | Route Breeze reset password masih aktif (duplikat alur) | ✅ Fixed  |
| V4-M05  | Password admin hardcoded di seeder                | ✅ Fixed      |
| V4-L01  | spesialisasiList() meload semua kolom              | ✅ Fixed      |
| V4-L02  | format() fallback query per-baris (N+1)           | ✅ Fixed      |
| V4-L03  | Validasi InfoController::leaderStore/Update hilang | ✅ Fixed     |
| V4-L04  | Gallery::create() tidak set uploaded_at           | ✅ False Positive (auto-set oleh Eloquent CREATED_AT) |
| V4-L05  | students/options() tidak ada limit/filter          | ✅ Fixed      |
| V4-L06  | EnrollmentController URL file: Storage::url()     | ✅ Fixed      |
| V4-L07  | Photo src menggunakan `?t=${Date.now()}` bursting cache | ✅ Fixed |

---

## Rekomendasi Prioritas

1. **[MEDIUM — Segera]** Perbaiki `class_name` di `TeacherDashboardController` — ini menyebabkan data salah yang terlihat langsung di UI guru.
2. **[LOW — Sprint berikutnya]** Perbaiki sapaan nama guru di `Dashboard.tsx` (profile?.nama_guru).
3. **[LOW — Sprint berikutnya]** Hapus redundant `User::find()` di `HandleInertiaRequests` — hemat 1 query MongoDB per page load.
4. **[LOW — Maintenance]** Standarisasi URL konstruksi di `ParentController` dan `SettingsController`.
5. **[LOW — Desain]** Evaluasi apakah field `time` dan `status` perlu ditambahkan ke schema Agenda, atau hapus dari mapping teacher dashboard.
