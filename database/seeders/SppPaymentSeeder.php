<?php

namespace Database\Seeders;

use App\Models\SppPayment;
use App\Models\Student;
use Illuminate\Database\Seeder;

class SppPaymentSeeder extends Seeder
{
    public function run(): void
    {
        SppPayment::truncate();

        $students = Student::all();

        if ($students->isEmpty()) {
            $this->command->warn('SppPaymentSeeder: data siswa tidak ditemukan, skip.');
            return;
        }

        // Loop untuk setiap siswa
        foreach ($students as $student) {
            // Generate data SPP bulanan selama 12 bulan di tahun 2026
            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $tahun = 2026;
                $nominal = 500000;
                
                // Aturan status SPP realistis:
                // - Januari (1) s/d Juni (6): Lunas
                // - Juli (7): Menunggu Verifikasi atau Lunas atau Belum
                // - Agustus (8) s/d Desember (12): Belum Bayar (Belum)
                
                if ($bulan < 7) {
                    $status = 'lunas';
                    $tanggalBayar = sprintf('%04d-%02d-%02d', $tahun, $bulan, rand(1, 10));
                    $keterangan = 'Lunas dibayar tepat waktu via Transfer Bank.';
                    $buktiBayar = 'spp/dummy_bukti.jpg';
                } elseif ($bulan == 7) {
                    $rand = rand(1, 3);
                    if ($rand == 1) {
                        $status = 'lunas';
                        $tanggalBayar = sprintf('%04d-%02d-%02d', $tahun, $bulan, rand(1, 5));
                        $keterangan = 'Lunas dibayar via transfer.';
                        $buktiBayar = 'spp/dummy_bukti.jpg';
                    } elseif ($rand == 2) {
                        $status = 'menunggu';
                        $tanggalBayar = sprintf('%04d-%02d-%02d', $tahun, $bulan, rand(1, 5));
                        $keterangan = 'Bukti bayar telah diunggah, menunggu konfirmasi.';
                        $buktiBayar = 'spp/dummy_bukti.jpg';
                    } else {
                        $status = 'belum';
                        $tanggalBayar = null;
                        $keterangan = null;
                        $buktiBayar = null;
                    }
                } else {
                    $status = 'belum';
                    $tanggalBayar = null;
                    $keterangan = null;
                    $buktiBayar = null;
                }

                SppPayment::create([
                    'student_id'    => (string) $student->_id,
                    'student_name'  => $student->nama,
                    'parent_id'     => (string) $student->parent_id,
                    'tahun'         => $tahun,
                    'bulan'         => $bulan,
                    'nominal'       => $nominal,
                    'status'        => $status,
                    'tanggal_bayar' => $tanggalBayar,
                    'keterangan'    => $keterangan,
                    'bukti_bayar'   => $buktiBayar,
                ]);
            }
        }

        $this->command->info('SppPaymentSeeder: Data SPP 12 bulan untuk seluruh siswa berhasil di-seed.');
    }
}
