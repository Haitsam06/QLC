import { useState } from 'react';
import MitraNavbar from '../../Components/MitraNavbar';
import { Briefcase, CalendarDays, FileCheck, Download, Clock, MapPin, User, ArrowRight, Bell, Activity, LayoutDashboard } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DATA MOCKUP
═══════════════════════════════════════════════════════════ */
const activeCollaborations = [
    {
        id: 1,
        program: 'QL - SCHOOL',
        location: 'SDIT Al-Hikmah',
        progress: 65,
        status: 'Sedang Berjalan',
        desc: "Implementasi kurikulum Al-Qur'an terpadu untuk siswa kelas 1-6.",
    },
    {
        id: 2,
        program: 'QL - TFT',
        location: 'Yayasan Pejuang Quran',
        progress: 25,
        status: 'Fase Awal',
        desc: "Pelatihan standarisasi pengajar Al-Qur'an metode QLC.",
    },
];

const schedules = [
    {
        id: 1,
        date: '12 Mar 2026',
        time: '08:00 - 11:30 WIB',
        agenda: 'Supervisi & Standarisasi Hafalan Guru',
        trainer: "Ust. Ainun Na'im",
        type: 'Kunjungan',
    },
    {
        id: 2,
        date: '19 Mar 2026',
        time: '09:00 - 12:00 WIB',
        agenda: 'Evaluasi Penerapan Metode Tamasya',
        trainer: 'Ust. Mushadi Sumaryanto',
        type: 'Online',
    },
    {
        id: 3,
        date: '26 Mar 2026',
        time: '13:00 - 15:00 WIB',
        agenda: "Training Manajemen Kelas Qur'an",
        trainer: 'K.H. Supriyatno',
        type: 'Kunjungan',
    },
];

const reports = [
    { id: 1, title: 'Laporan Pendampingan QL-School', period: 'Bulan Februari 2026', size: '2.4 MB' },
    { id: 2, title: 'Hasil Evaluasi & Supervisi Guru', period: 'Bulan Januari 2026', size: '1.8 MB' },
    { id: 3, title: 'Laporan Komprehensif QL-TFT', period: 'Semester Ganjil 2025', size: '5.1 MB' },
];

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Briefcase, label: 'Program Aktif', id: 'program' },
    { icon: CalendarDays, label: 'Jadwal', id: 'jadwal' },
    { icon: FileCheck, label: 'Laporan', id: 'laporan' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MitraDashboard() {
    const [active, setActive] = useState('dashboard');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <MitraNavbar activePage={active} />

            {/* ════ PAGE WRAPPER ════ */}
            {/* PERUBAHAN: Menghapus max-w-7xl dan merubah menjadi w-full, menyesuaikan padding edge-to-edge */}
            <div className="w-full px-4 md:px-8 lg:px-12 pt-8 pb-12 flex flex-col gap-6 mx-auto">
                {/* ── Hero: Profil Mitra ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="inline-block px-3 py-1 bg-green-700 bg-opacity-50 border border-green-500 border-opacity-30 rounded-full text-green-100 text-xs font-bold uppercase tracking-wider mb-4">
                            ID Kemitraan: MT-202601
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Selamat Datang, Yayasan Al-Hikmah</h1>
                        <p className="text-green-100 text-opacity-90 text-sm max-w-xl leading-relaxed">
                            Pantau perkembangan program kerjasama, jadwal pendampingan asatidz dari QLC, dan unduh laporan evaluasi berkala di dashboard ini.
                        </p>
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto relative z-10">
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[150px] text-center">
                            <div className="text-3xl font-black text-white mb-1">2</div>
                            <div className="text-xs text-green-200 font-semibold">Program Berjalan</div>
                        </div>
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[150px] text-center">
                            <div className="text-3xl font-black text-green-300 mb-1">12</div>
                            <div className="text-xs text-green-200 font-semibold">Total Pendampingan</div>
                        </div>
                    </div>
                </div>

                {/* ── Grid 3 Kolom Utama ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-2">
                    {/* Kolom 1: Kerjasama yang Sedang Berjalan */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Kerjasama Berjalan</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Program implementasi QLC</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {activeCollaborations.map((collab) => (
                                <div key={collab.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-base text-gray-800">{collab.program}</h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">{collab.status}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 font-medium">
                                        <MapPin size={16} /> {collab.location}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{collab.desc}</p>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className="text-gray-500">Progres Tahap 1</span>
                                            <span className="text-green-600">{collab.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${collab.progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kolom 2: Time Schedule Pendampingan */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Jadwal Pendampingan</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Agenda kunjungan & supervisi</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                                <CalendarDays size={20} />
                            </div>
                        </div>

                        <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-6">
                            {schedules.map((sched, index) => (
                                <div key={sched.id} className="relative pl-5">
                                    <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white ${index === 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>{sched.date}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">{sched.type}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 leading-snug">{sched.agenda}</h3>

                                        <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-4 mt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Clock size={14} className="text-gray-400" /> {sched.time}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <User size={14} className="text-gray-400" /> {sched.trainer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-auto pt-6 text-sm font-bold text-green-600 hover:text-green-800 flex items-center gap-1 w-fit">
                            Lihat Kalender Lengkap <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Kolom 3: Laporan Program */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Laporan Program</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Hasil evaluasi & supervisi</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileCheck size={20} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-start gap-3 w-full overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-black uppercase">PDF</span>
                                        </div>
                                        <div className="overflow-hidden w-full">
                                            <h3 className="text-sm font-bold text-gray-800 mb-0.5 group-hover:text-green-700 transition-colors truncate">{report.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <span>{report.period}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{report.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-green-100 group-hover:text-green-600 transition-colors shrink-0 ml-2">
                                        <Download size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-500 font-medium">Menampilkan 3 terbaru</div>
                            <button className="text-sm font-bold text-gray-700 hover:text-green-600">Arsip Laporan</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
