import { useState } from 'react';
import MitraNavbar from '../../Components/MitraNavbar';
import { Briefcase, CalendarDays, FileCheck, Clock, MapPin, User, Bell, LayoutDashboard, Users, ChevronRight, Search, Filter } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DATA MOCKUP
═══════════════════════════════════════════════════════════ */
const activeProgramsList = [
    {
        id: 'PRG-2026-001',
        title: 'QL - SCHOOL (Implementasi Kurikulum)',
        location: 'SDIT Al-Hikmah, Bekasi',
        pic: "Ust. Ainun Na'im",
        startDate: '10 Jan 2026',
        endDate: '10 Jun 2026',
        progress: 65,
        status: 'Sedang Berjalan',
        statusColor: 'bg-green-100 text-green-700',
        progressColor: 'bg-green-500',
        currentStage: 'Tahap 2: Pembinaan & Supervisi Guru',
        participants: '350 Siswa',
        desc: "Penerapan kurikulum Al-Qur'an terpadu QLC ke dalam jam pelajaran sekolah, mencakup tahsin, tahfidz, dan evaluasi berkala.",
    },
    {
        id: 'PRG-2026-002',
        title: 'QL - TFT (Training For Trainers)',
        location: 'Aula Yayasan Pejuang Quran',
        pic: 'Ust. Mushadi Sumaryanto',
        startDate: '01 Feb 2026',
        endDate: '15 Apr 2026',
        progress: 25,
        status: 'Fase Awal',
        statusColor: 'bg-blue-100 text-blue-700',
        progressColor: 'bg-blue-500',
        currentStage: 'Tahap 1: Standarisasi Tilawah',
        participants: '45 Guru',
        desc: 'Pelatihan intensif untuk menstandarisasi bacaan dan metode pengajaran asatidz menggunakan metode Tamasya.',
    },
    {
        id: 'PRG-2026-003',
        title: 'QL - PARENTING',
        location: 'Auditorium Utama SDIT Al-Hikmah',
        pic: 'K.H. Supriyatno',
        startDate: '20 Mar 2026',
        endDate: '21 Mar 2026',
        progress: 0,
        status: 'Menunggu Jadwal',
        statusColor: 'bg-yellow-100 text-yellow-700',
        progressColor: 'bg-yellow-500',
        currentStage: 'Persiapan Acara',
        participants: '120 Orang Tua',
        desc: "Seminar edukasi kepengasuhan anak berbasis Al-Qur'an untuk menyelaraskan pendidikan di sekolah dan di rumah.",
    },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProgramAktif() {
    const [active, setActive] = useState('program');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <MitraNavbar activePage={active} />

            {/* ════ PAGE WRAPPER ════ */}
            {/* PERUBAHAN: max-w-6xl dihapus, diganti w-full, dan padding pinggir disamakan dengan Navbar (px-6 lg:px-12) */}
            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto">
                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Program Aktif Kemitraan</h1>
                    <p className="text-gray-500 mt-2">Kelola dan pantau detail pelaksanaan program QLC yang sedang berjalan di instansi Anda.</p>
                </div>

                {/* ── Search & Filter ── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-2xl">
                        {' '}
                        {/* Ditambahkan max-w-2xl agar input pencarian tidak melebar tak terbatas di layar ultrawide */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Cari nama program..."
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                {/* ── List Program Cards ── */}
                {/* PERUBAHAN: Ditambahkan breakpoint lg, xl, dan 2xl agar jumlah kolom kartu menyesuaikan lebar layar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProgramsList.map((prog) => (
                        <div key={prog.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 mb-1">{prog.id}</div>
                                    <h2 className="text-lg font-bold text-gray-800 leading-snug">{prog.title}</h2>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-4 ${prog.statusColor}`}>{prog.status}</span>
                            </div>

                            {/* Info List (Simple Stack) */}
                            <div className="space-y-3 mb-5">
                                <div className="flex items-start text-sm text-gray-600">
                                    <MapPin size={18} className="text-gray-400 mr-3 shrink-0" />
                                    <span>{prog.location}</span>
                                </div>
                                <div className="flex items-start text-sm text-gray-600">
                                    <User size={18} className="text-gray-400 mr-3 shrink-0" />
                                    <span>
                                        Trainer: <strong>{prog.pic}</strong>
                                    </span>
                                </div>
                                <div className="flex items-start text-sm text-gray-600">
                                    <Clock size={18} className="text-gray-400 mr-3 shrink-0" />
                                    <span>
                                        {prog.startDate} - {prog.endDate}
                                    </span>
                                </div>
                                <div className="flex items-start text-sm text-gray-600">
                                    <Users size={18} className="text-gray-400 mr-3 shrink-0" />
                                    <span>{prog.participants}</span>
                                </div>
                            </div>

                            {/* Description Box */}
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-6 flex-grow">{prog.desc}</div>

                            {/* Footer: Progress & Button */}
                            <div className="mt-auto">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{prog.currentStage}</span>
                                    <span className="text-sm font-bold text-gray-900">{prog.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                    <div className={`h-2 rounded-full ${prog.progressColor}`} style={{ width: `${prog.progress}%` }}></div>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-600 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors">
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
