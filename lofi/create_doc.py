import os

html_template = r"""<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>BAB IV - Implementasi dan Pengujian</title>
<style>
@page Section1 {
    size: 21cm 29.7cm; /* A4 */
    margin: 3cm 3cm 3cm 4cm; /* Top, Right, Bottom, Left (Standar Skripsi) */
    mso-page-orientation: portrait;
}
div.Section1 {
    page: Section1;
}
body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000000;
}
h1.title {
    font-size: 14pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 0px;
    margin-bottom: 6pt;
    line-height: 1.5;
}
h2.subtitle {
    font-size: 14pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 0px;
    margin-bottom: 24pt;
    line-height: 1.5;
}
h3.heading {
    font-size: 12pt;
    text-align: left;
    font-weight: bold;
    margin-top: 18pt;
    margin-bottom: 6pt;
    line-height: 1.5;
}
h4.subheading {
    font-size: 12pt;
    text-align: left;
    font-weight: bold;
    margin-top: 12pt;
    margin-bottom: 6pt;
    line-height: 1.5;
}
h5.subsubheading {
    font-size: 12pt;
    text-align: left;
    font-style: italic;
    font-weight: bold;
    margin-top: 12pt;
    margin-bottom: 6pt;
    line-height: 1.5;
}
p {
    text-align: justify;
    text-indent: 1.25cm; /* Alenia baru menjorok 1.25cm */
    margin-bottom: 12pt;
    margin-top: 0px;
    line-height: 1.5;
}
p.no-indent {
    text-indent: 0px;
    margin-bottom: 12pt;
}
p.caption {
    text-align: center;
    text-indent: 0px;
    font-weight: bold;
    margin-top: 6pt;
    margin-bottom: 12pt;
}
ol, ul {
    margin-top: 0px;
    margin-bottom: 12pt;
    padding-left: 20px;
}
li {
    text-align: justify;
    line-height: 1.5;
    margin-bottom: 6pt;
}
pre {
    font-family: 'Consolas', 'Courier New', Courier, monospace;
    font-size: 9.5pt;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 12px;
    white-space: pre-wrap;
    margin-top: 6pt;
    margin-bottom: 12pt;
    line-height: 1.2;
}
code {
    font-family: 'Consolas', 'Courier New', Courier, monospace;
    font-size: 9.5pt;
}
hr {
    border: none;
    border-top: 1px solid #cccccc;
    margin-top: 24pt;
    margin-bottom: 24pt;
}
</style>
</head>
<body>
<div class="Section1">

<h1 class="title">BAB IV</h1>
<h2 class="subtitle">IMPLEMENTASI DAN PENGUJIAN</h2>

<h3 class="heading">4.1. Implementasi</h3>
<p>Tahap implementasi merupakan lanjutan dari tahap analisis dan perancangan sistem yang bertujuan menerjemahkan rancangan ke dalam bentuk kode program yang dapat dijalankan oleh komputer. Pada Sistem Informasi Akademik (SIAKAD) QLC (Quran Leader Center), implementasi menggunakan arsitektur Model-View-Controller (MVC) termodifikasi. Backend dikembangkan dengan Laravel 12 dan MongoDB melalui package <i>mongodb/laravel-mongodb</i> v5.7, sedangkan frontend menggunakan React JS, TypeScript, dan Vite dengan pendekatan Single Page Application (SPA). Integrasi backend dan frontend dilakukan menggunakan Inertia.js v2.0, serta antarmuka dibangun responsif menggunakan Tailwind CSS. Subbab ini membahas spesifikasi perangkat keras dan perangkat lunak, implementasi antarmuka pengguna, serta implementasi kode program pada komponen utama sistem.</p>

<hr>

<h3 class="heading">4.1.1. Implementasi Perangkat Keras</h3>
<p>Implementasi perangkat keras (hardware) mencakup spesifikasi infrastruktur fisik yang digunakan selama proses pengembangan (development) sistem oleh pengembang (programmer), serta spesifikasi minimal perangkat yang dibutuhkan oleh pengguna (user) untuk mengakses dan menjalankan aplikasi dengan optimal. Rincian spesifikasi perangkat keras adalah sebagai berikut:</p>

<h4 class="subheading">a. Perangkat Keras Pengembang (Server / Localhost)</h4>
<p class="no-indent">Digunakan oleh pengembang untuk menulis kode program, menjalankan local web server, mengelola basis data MongoDB, melakukan kompilasi aset frontend, dan debugging sistem. Spesifikasi minimum yang digunakan dalam proyek ini meliputi:</p>
<ol>
    <li><b>Prosesor</b>: Intel Core i5 / AMD Ryzen 5 (atau setara dengan minimal 4 core / 8 thread), untuk menjamin kelancaran kompilasi data frontend (Vite bundling) dan proses rendering pada server lokal.</li>
    <li><b>Memori (RAM)</b>: 8 GB DDR4, dibutuhkan agar sistem operasi dapat menjalankan server lokal Laravel, database MongoDB, dan aplikasi editor kode (VS Code) secara bersamaan tanpa kendala memory leak.</li>
    <li><b>Penyimpanan</b>: SSD 256 GB, untuk mempercepat proses baca-tulis (input/output) database MongoDB serta mempercepat pemuatan aset pemrograman yang berukuran besar.</li>
</ol>

<h4 class="subheading">b. Perangkat Keras Pengguna (Klien / Client)</h4>
<p class="no-indent">Digunakan oleh pengguna sistem (Admin, Guru, Wali Murid, dan Mitra) untuk mengakses aplikasi SIAKAD QLC yang telah di-deploy. Spesifikasi minimal meliputi:</p>
<ol>
    <li>Komputer, Laptop, atau Smartphone (berbasis Android/iOS) yang mendukung web browser modern.</li>
    <li>Akses internet yang stabil, untuk melakukan komunikasi data secara real-time ke server cloud.</li>
</ol>

<hr>

<h3 class="heading">4.1.2. Implementasi Perangkat Lunak</h3>
<p>Perangkat lunak (software) pendukung sangat krusial dalam membangun ekosistem aplikasi yang fungsional. Lingkungan pengembangan (development environment) pada SIAKAD QLC dibagi menjadi tiga kelompok utama, yaitu sistem operasi & alat bantu pengembangan, ketergantungan backend (Laravel), serta ketergantungan frontend (React & Vite). Rincian perangkat lunak yang diimplementasikan adalah sebagai berikut:</p>

<h4 class="subheading">a. Perangkat Lunak & Alat Bantu Pengembangan</h4>
<ol>
    <li><b>Sistem Operasi</b>: Windows 10/11 atau macOS / Linux.</li>
    <li><b>Bahasa Pemrograman Utama</b>: PHP v8.2+ dan JavaScript (ECMAScript 6) / TypeScript v5.0+.</li>
    <li><b>Runtime Engine</b>: Node.js v20.x atau versi terbaru.</li>
    <li><b>Database Management System (DBMS)</b>: MongoDB Community Server v6.0+ bersama MongoDB Compass sebagai visualisasi data NoSQL.</li>
    <li><b>Editor Kode</b>: Visual Studio Code dengan ekstensi PHP Intelephense dan Tailwind CSS IntelliSense.</li>
    <li><b>Web Browser</b>: Google Chrome, Mozilla Firefox, atau Microsoft Edge yang dilengkapi fitur Developer Tools untuk pengujian responsivitas dan konsol error.</li>
</ol>

<h4 class="subheading">b. Perangkat Lunak Sisi Backend (Composer Dependencies)</h4>
<p class="no-indent">Backend aplikasi menggunakan pustaka eksternal yang diatur melalui Composer:</p>
<ol>
    <li><b>Framework Utama</b>: Laravel v12.0 (menyediakan sistem routing, arsitektur dasar, validasi request, sistem queue, mailer, dan otorisasi middleware).</li>
    <li><b>MongoDB Eloquent Bridge</b>: mongodb/laravel-mongodb v5.7 (mengizinkan model Eloquent Laravel terhubung langsung dengan koleksi NoSQL MongoDB).</li>
    <li><b>Frontend Integration</b>: inertiajs/inertia-laravel v2.0 (menjembatani data controller Laravel langsung ke komponen frontend React tanpa modifikasi JSON routing manual).</li>
    <li><b>Routing Helper</b>: tightenco/ziggy v2.0 (mengizinkan pemanggilan nama rute Laravel langsung di dalam kode React di sisi klien).</li>
    <li><b>API Token Management</b>: laravel/sanctum v4.0 (untuk proteksi rute API).</li>
</ol>

<h4 class="subheading">c. Perangkat Lunak Sisi Frontend (npm Dependencies)</h4>
<p class="no-indent">Frontend aplikasi dibangun dengan memanfaatkan paket modul yang dikelola oleh npm:</p>
<ol>
    <li><b>Frontend View Library</b>: React JS v18.2.0 & React DOM v18.2.0.</li>
    <li><b>Frontend Inertia Bridge</b>: @inertiajs/react v2.0.0.</li>
    <li><b>Build Tool & Bundler</b>: Vite v7.0.7 & @vitejs/plugin-react v4.2.0 (menyediakan fitur Hot Module Replacement untuk kompilasi super cepat selama pengembangan).</li>
    <li><b>CSS Framework</b>: Tailwind CSS v3.2.1 (menyediakan utilitas class modern untuk pembuatan UI responsif).</li>
    <li><b>Ikon Grafis</b>: lucide-react v0.576.0 (pustaka ikon SVG modern berukuran ringan).</li>
    <li><b>Data Visualization</b>: recharts v3.8.1 (digunakan untuk memvisualisasikan grafik perkembangan akademik santri di dashboard wali murid dan guru).</li>
    <li><b>HTTP Client</b>: Axios v1.11.0 (untuk melakukan request asinkron ke server).</li>
</ol>

<hr>

<h3 class="heading">4.1.3. Implementasi Antar Muka</h3>
<p>Tahap implementasi antarmuka (User Interface Implementation) merupakan proses penerjemahan desain mockup atau wireframe yang telah dirancang pada bab sebelumnya ke dalam bentuk halaman web yang interaktif, responsif, dan fungsional. Antarmuka sistem SIAKAD QLC dibangun menggunakan React JS, TypeScript, dan Tailwind CSS untuk menjamin antarmuka modern yang ramah pengguna (user-friendly) dan adaptif terhadap berbagai ukuran layar (desktop, tablet, dan smartphone).</p>
<p>Antarmuka sistem ini dibagi menjadi 5 bagian utama yang disesuaikan dengan hak akses (role) pengguna yang terdaftar pada sistem. Halaman Public (Landing Page), Halaman Dashboard Admin, Halaman Dashboard Guru, Halaman Dashboard Wali Murid, Halaman Dashboard Mitra. Berikut adalah beberapa hasil implementasi antarmuka pada sistem:</p>

<h4 class="subheading">a. Tampilan Landing Page (Halaman Utama Publik)</h4>
<p>Halaman utama yang diakses melalui URL basis ketika pengunjung pertama kali membuka website. Halaman ini dirancang secara elegan untuk mempromosikan Quran Leader Center kepada publik.</p>
<p class="caption">(Silakan lampirkan Gambar 4.1 di sini)<br>[Gambar 4.1 Tampilan Halaman Landing Page]</p>
<p>Deskripsi: Halaman ini mengimplementasikan tata letak modern dengan navigasi interaktif, penjelasan profil yayasan, visualisasi galeri kegiatan santri, dan rincian program belajar yang ditawarkan oleh QLC.</p>

<h4 class="subheading">b. Tampilan Halaman Portal Autentikasi (Login & Register)</h4>
<p>Halaman yang digunakan pengguna untuk masuk ke dalam dasbor yang sesuai dengan perannya masing-masing.</p>
<p class="caption">(Silakan lampirkan Gambar 4.2 di sini)<br>[Gambar 4.2 Tampilan Halaman Login]</p>
<p>Deskripsi: Halaman portal login mengimplementasikan form masukan berupa username atau email dan password, yang divalidasi secara asinkron di backend. Halaman ini juga mendukung sistem keamanan filter CSRF dan pembatasan login gagal (rate limiting) untuk melindungi akun pengguna dari serangan brute force.</p>

<h4 class="subheading">c. Tampilan Halaman Dashboard Administrator</h4>
<p>Dasbor utama bagi admin untuk mengelola dan memantau status operasional QLC secara keseluruhan.</p>
<p class="caption">(Silakan lampirkan Gambar 4.3 di sini)<br>[Gambar 4.3 Tampilan Halaman Dashboard Admin]</p>
<p>Deskripsi: Dashboard admin menyajikan ringkasan statistik interaktif yang menampilkan jumlah total santri aktif, total pengajar/guru, wali murid, dan mitra terdaftar, serta visualisasi log aktivitas sistem secara langsung.</p>

<h4 class="subheading">d. Tampilan Halaman Manajemen Data Siswa oleh Admin</h4>
<p>Halaman khusus bagi administrator untuk mengelola pendaftaran, status keaktifan, dan pembagian kelas santri.</p>
<p class="caption">(Silakan lampirkan Gambar 4.4 di sini)<br>[Gambar 4.4 Tampilan Halaman Manajemen Siswa]</p>
<p>Deskripsi: Halaman ini menyediakan antarmuka CRUD (Create, Read, Update, Delete) terpadu untuk data santri. Dilengkapi dengan filter pencarian berbasis teks (menggunakan regular expression MongoDB), filter status pendaftaran (aktif/nonaktif/pending), serta opsi verifikasi bukti pembayaran pendaftaran santri baru yang diunggah oleh wali murid.</p>

<h4 class="subheading">e. Tampilan Halaman Laporan Perkembangan Santri (Wali Murid)</h4>
<p>Halaman yang diakses oleh wali murid untuk memantau capaian belajar anak secara berkala.</p>
<p class="caption">(Silakan lampirkan Gambar 4.5 di sini)<br>[Gambar 4.5 Tampilan Halaman Laporan Perkembangan Santri]</p>
<p>Deskripsi: Halaman ini menyajikan visualisasi data yang interaktif menggunakan diagram garis/batang (Recharts) untuk menggambarkan grafik hafalan materi Quran/Hadits, rekapitulasi nilai evaluasi pekanan, status presensi kehadiran, serta komentar catatan perkembangan karakter dari guru pengampu.</p>

<hr>

<h3 class="heading">4.1.4. Implementasi Sistem</h3>
<p>Implementasi sistem merupakan tahap inti dalam proses pembangunan aplikasi, di mana rancangan arsitektur basis data, logika bisnis, dan diagram kelas (Class Diagram) yang telah dirancang sebelumnya direalisasikan ke dalam barisan kode program terstruktur.</p>
<p>Pada arsitektur SIAKAD QLC, implementasi logika backend dibagi menjadi dua komponen utama berbasis MVC:</p>
<ul>
    <li><b>Model:</b> Berfungsi sebagai representasi skema dokumen NoSQL MongoDB, menentukan hubungan relasi antar entitas, menentukan keamanan pengisian kolom massal (mass assignment protection), serta menampung logika penolong (helper) terkait entitas tersebut.</li>
    <li><b>Controller:</b> Berfungsi sebagai otak logika bisnis aplikasi yang menangani alur eksekusi request, validasi skema input, manipulasi data (CRUD), pengiriman notifikasi, pencatatan log audit, serta pengembalian respons data ke frontend.</li>
</ul>
<p>Berikut adalah rincian implementasi kode pada kelas model dan controller utama sistem:</p>

<h4 class="subheading">1. Implementasi Kelas Model</h4>
<p>Sistem ini menggunakan ORM Eloquent bawaan Laravel yang diadaptasikan untuk basis data MongoDB NoSQL. Sistem mendefinisikan total 15 kelas model secara utuh. Berikut adalah contoh source code implementasi dari dua kelas model utama:</p>

<h5 class="subsubheading">1) Kelas Model User (User.php)</h5>
<p>Kelas model ini mengelola data autentikasi dan identitas pengguna sistem. Model ini mengextend kelas Authenticatable MongoDB agar mendukung otentikasi bawaan Laravel:</p>

<pre><code>&lt;?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $connection = 'mongodb';

    protected $collection = 'users';

    protected $fillable = [
        'role_id',
        'username',
        'email',
        'password',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Relasi belongsTo ke Model Role
     */
    public function role()
    {
        return $this->belongsTo(
            Role::class,
            'role_id',
            '_id'
        );
    }

    /**
     * Mendapatkan nama role pengguna
     */
    public function getRoleName(): ?string
    {
        return $this->role?-&gt;role_name;
    }

    /**
     * Helper pengecekan hak akses (role) pengguna
     */
    public function isAdmin(): bool
    {
        return $this->getRoleName() === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->getRoleName() === 'teacher';
    }

    public function isParents(): bool
    {
        return $this->getRoleName() === 'parents';
    }

    public function isMitra(): bool
    {
        return $this->getRoleName() === 'mitra';
    }
}</code></pre>

<h5 class="subsubheading">2) Kelas Model Student (Student.php)</h5>
<p>Kelas model ini merepresentasikan entitas siswa/santri yang memuat informasi biodata pribadi siswa:</p>

<pre><code>&lt;?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Student extends Model
{
    protected $connection = 'mongodb';
    
    protected $collection = 'students';

    protected $fillable = [
        'parent_id',
        'parent_name',
        'program_id',
        'nama',
        'usia',
        'tempat_lahir',
        'tanggal_lahir',
        'enrollment_status',
        'bukti_pembayaran',
    ];
}</code></pre>

<h4 class="subheading">2. Implementasi Kelas Controller</h4>
<p>Kelas Controller bertugas menangani request dari klien, melakukan penanganan kesalahan (error handling), validasi input secara aman, serta memanipulasi basis data MongoDB.</p>

<h5 class="subsubheading">1) Kelas StudentController (StudentController.php)</h5>
<p>Berikut adalah potongan kode program utama pada StudentController.php yang menangani logika penambahan data santri baru (store) dan penghapusan data santri dengan metode cascade delete (destroy) guna menjamin integritas data NoSQL:</p>

<pre><code>&lt;?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Parents;
use App\Models\ProgressReport;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    /**
     * Logika Penyimpanan Data Santri Baru (Store)
     */
    public function store(Request $request)
    {
        // Validasi skema input
        $validator = Validator::make($request-&gt;all(), [
            'parent_id'         =&gt; 'required|string',
            'program_id'        =&gt; 'required|string',
            'nama'              =&gt; 'required|string|max:100',
            'usia'              =&gt; 'required|integer|min:1|max:30',
            'tempat_lahir'      =&gt; 'required|string|max:100',
            'tanggal_lahir'     =&gt; 'required|date_format:Y-m-d',
            'enrollment_status' =&gt; 'required|in:active,inactive,pending',
        ]);

        if ($validator-&gt;fails()) {
            return response()-&gt;json(['success' =&gt; false, 'errors' =&gt; $validator-&gt;errors()], 422);
        }

        // Memvalidasi keberadaan wali murid terkait
        $parent = Parents::where('user_id', (string) $request-&gt;parent_id)-&gt;first();
        if (!$parent) {
            return response()-&gt;json(['success' =&gt; false, 'message' =&gt; 'Wali murid tidak ditemukan.'], 404);
        }

        // Memvalidasi keberadaan program belajar
        $program = Program::find($request-&gt;program_id);
        if (!$program) {
            return response()-&gt;json(['success' =&gt; false, 'message' =&gt; 'Program tidak ditemukan.'], 404);
        }

        // Pembuatan entitas santri baru di basis data NoSQL
        $student = Student::create([
            'parent_id'         =&gt; $request-&gt;parent_id,
            'parent_name'       =&gt; $parent-&gt;parent_name ?? null,
            'program_id'        =&gt; $request-&gt;program_id,
            'nama'              =&gt; $request-&gt;nama,
            'usia'              =&gt; (int) $request-&gt;usia,
            'tempat_lahir'      =&gt; $request-&gt;tempat_lahir,
            'tanggal_lahir'     =&gt; $request-&gt;tanggal_lahir,
            'enrollment_status' =&gt; $request-&gt;enrollment_status,
        ]);

        // Mengirimkan notifikasi sistem otomatis ke seluruh guru jika pendaftaran aktif
        if ($request-&gt;enrollment_status === 'active') {
            Notification::sendToRole(
                'teacher',
                'pendaftaran',
                'Santri Baru Aktif',
                "Santri baru \"{$request-&gt;nama}\" telah terdaftar aktif di {$program-&gt;name}.",
                null
            );
        }

        return response()-&gt;json([
            'success' =&gt; true,
            'message' => 'Siswa berhasil ditambahkan.',
            'data'    => $this-&gt;format($student),
        ], 201);
    }

    /**
     * Logika Penghapusan Data Santri & Cascade Delete (Destroy)
     */
    public function destroy(string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()-&gt;json(['success' =&gt; false, 'message' =&gt; 'Siswa tidak ditemukan.'], 404);
        }

        $studentId = (string) $student-&gt;_id;

        // Cascade: hapus seluruh Laporan Perkembangan (Progress Report) terkait siswa ini
        ProgressReport::where('student_id', $studentId)-&gt;delete();

        // Hapus berkas bukti pembayaran dari storage publik jika ada
        if (!empty($student-&gt;bukti_pembayaran)) {
            $parsed = parse_url($student-&gt;bukti_pembayaran, PHP_URL_PATH);
            if ($parsed) {
                Storage::disk('public')-&gt;delete(str_replace('/storage/', '', $parsed));
            }
        }

        // Hapus entitas santri
        $student-&gt;delete();

        // Pencatatan Log Audit Sistem untuk aspek keamanan
        Log::info('audit.student_deleted', [
            'student_id' =&gt; $studentId,
            'nama'       =&gt; $student-&gt;nama ?? '—',
            'by_admin'   =&gt; auth()-&gt;id(),
            'ip'         =&gt; request()-&gt;ip(),
        ]);

        return response()-&gt;json(['success' =&gt; true, 'message' =&gt; 'Data siswa berhasil dihapus.']);
    }

    /**
     * Method format pembantu untuk mapping data respons
     */
    private function format($doc, $programs = null): array
    {
        $pid         = (string) ($doc-&gt;program_id ?? '');
        $programName = ($programs && isset($programs[$pid])) ? ($programs[$pid]-&gt;name ?? null) : null;

        return [
            'id'                => (string) $doc-&gt;_id,
            'parent_id'         => $doc-&gt;parent_id ?? null,
            'parent_name'       => $doc-&gt;parent_name ?? null,
            'program_id'        => $doc-&gt;program_id ?? null,
            'program_name'      => $programName,
            'nama'              => $doc-&gt;nama,
            'usia'              => $doc-&gt;usia ?? null,
            'tempat_lahir'      => $doc-&gt;tempat_lahir,
            'tanggal_lahir'     => $doc-&gt;tanggal_lahir,
            'enrollment_status' => $doc-&gt;enrollment_status,
            'bukti_pembayaran'  => $doc-&gt;bukti_pembayaran ?? null,
            'created_at'        => $doc-&gt;created_at?-&gt;format('Y-m-d H:i:s'),
        ];
    }
}</code></pre>

</div>
</body>
</html>
"""

# Let's save this content directly as bab_iv_implementasi.doc
output_path = r"c:\Users\ACER\Desktop\Client\QLC\bab_iv_implementasi.doc"
try:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_template)
    print("SUCCESS: File .doc berhasil dibuat di " + output_path)
except Exception as e:
    print("ERROR: Gagal menulis file .doc: " + str(e))
