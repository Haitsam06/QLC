import { useState } from 'react';
import TeacherNavbar from '../../Components/TeacherNavbar';
import { BookOpen, CalendarDays, Users, Clock, MapPin, CheckCircle, AlertCircle, Plus, LayoutDashboard, Award, TrendingUp, Bell, Search, Filter } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DATA MOCKUP: DASHBOARD GURU
═══════════════════════════════════════════════════════════ */
const todayAgenda = [
    { id: 1, time: '07:30 - 09:00 WIB', class: 'Kelas 4A', type: 'Ziyadah (Hafalan Baru)', room: 'Ruang Tahfidz 1', status: 'Selesai' },
    { id: 2, time: '09:30 - 11:00 WIB', class: 'Kelas 4B', type: 'Murojaah (Pengulangan)', room: 'Ruang Tahfidz 2', status: 'Sedang Berjalan' },
    { id: 3, time: '13:00 - 14:30 WIB', class: 'Kelas 5A', type: 'Tahsin & Tilawah', room: 'Masjid Sekolah', status: 'Menunggu' },
];

const studentProgress = [
    { id: 1, name: 'Ahmad Fauzan', class: '4A', type: 'Ziyadah', surah: 'An-Naba', ayat: '1-20', status: 'Lancar', statusColor: 'bg-green-100 text-green-700' },
    { id: 2, name: 'Siti Aisyah', class: '4A', type: 'Murojaah', surah: 'Al-Mulk', ayat: '1-10', status: 'Perlu Diulang', statusColor: 'bg-yellow-100 text-yellow-700' },
    { id: 3, name: 'Budi Santoso', class: '4B', type: 'Tahsin', surah: 'Jilid 4', ayat: 'Hal 12', status: 'Lancar', statusColor: 'bg-green-100 text-green-700' },
    { id: 4, name: 'Zahra Nabila', class: '5A', type: 'Ziyadah', surah: 'Abasa', ayat: '1-42', status: 'Sangat Lancar', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 5, name: 'Rizky Maulana', class: '4A', type: 'Ziyadah', surah: 'An-Naziats', ayat: '1-15', status: 'Perlu Diulang', statusColor: 'bg-yellow-100 text-yellow-700' },
];

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: CalendarDays, label: 'Jadwal Mengajar', id: 'jadwal' },
    { icon: BookOpen, label: 'Buku Mutabaah', id: 'mutabaah' },
    { icon: Users, label: 'Data Santri', id: 'santri' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function DashboardGuru() {
    const [active, setActive] = useState('dashboard');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* ════ TOPNAV GURU ════ */}
            <TeacherNavbar activePage={active} />

            {/* ════ PAGE WRAPPER ════ */}
            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto flex flex-col gap-6">
                {/* ── Hero: Profil Guru & Quick Actions ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-700 bg-opacity-50 border border-green-500 border-opacity-30 rounded-full text-green-100 text-xs font-bold uppercase tracking-wider mb-4">
                            <CalendarDays size={14} /> Semester Ganjil 2025/2026
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Ahlan wa Sahlan, Ust. Mushadi</h1>
                        <p className="text-green-100 text-opacity-90 text-sm max-w-xl leading-relaxed">
                            Semoga Allah memberkahi setiap huruf yang diajarkan hari ini. Terdapat 3 jadwal mengajar yang menanti Anda.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:w-36 text-center">
                            <div className="text-3xl font-black text-white mb-1">120</div>
                            <div className="text-xs text-green-200 font-semibold">Total Santri Binaan</div>
                        </div>
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:w-36 text-center">
                            <div className="text-3xl font-black text-yellow-400 mb-1">85%</div>
                            <div className="text-xs text-green-200 font-semibold">Target Kelas Tercapai</div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Grid (1/3 Agenda & 2/3 Progres Siswa) ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mt-2">
                    {/* ── KOLOM KIRI: AGENDA MENGAJAR HARI INI ── */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Agenda Hari Ini</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Senin, 10 Maret 2026</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                        </div>

                        <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-6">
                            {todayAgenda.map((agenda, index) => (
                                <div key={agenda.id} className="relative pl-5">
                                    {/* Timeline Dot */}
                                    <div
                                        className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm 
                                        ${agenda.status === 'Selesai' ? 'bg-green-500' : agenda.status === 'Sedang Berjalan' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                    ></div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-800">{agenda.time}</span>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded font-bold
                                                ${agenda.status === 'Selesai' ? 'bg-green-100 text-green-700' : agenda.status === 'Sedang Berjalan' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {agenda.status}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-green-700 leading-snug">
                                            {agenda.class} <span className="text-gray-800 font-medium text-sm block sm:inline mt-1 sm:mt-0 sm:ml-1">- {agenda.type}</span>
                                        </h3>

                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
                                            <MapPin size={14} className="text-gray-400" /> {agenda.room}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                            <CalendarDays size={16} /> Lihat Kalender Mengajar
                        </button>
                    </div>

                    {/* ── KOLOM KANAN (2 Span): PROGRES HAFALAN & TILAWAH ── */}
                    <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        {/* Header & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Progres Santri Terbaru</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Buku Mutabaah Digital / Catatan Setoran</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Filter Kelas
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md flex items-center gap-2">
                                    <Plus size={16} /> Input Setoran
                                </button>
                            </div>
                        </div>

                        {/* List/Tabel Progres */}
                        <div className="flex flex-col gap-3">
                            {studentProgress.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-sm transition-all gap-4"
                                >
                                    {/* Nama & Kelas */}
                                    <div className="flex items-center gap-4 md:w-4/12">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {student.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{student.name}</h3>
                                            <p className="text-xs font-semibold text-gray-500">Kelas {student.class}</p>
                                        </div>
                                    </div>

                                    {/* Detail Setoran */}
                                    <div className="flex flex-row gap-6 md:w-5/12 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-1/2">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{student.type}</div>
                                            <div className="text-sm font-bold text-gray-800">{student.surah}</div>
                                        </div>
                                        <div className="w-1/2">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ayat / Halaman</div>
                                            <div className="text-sm font-bold text-gray-800">{student.ayat}</div>
                                        </div>
                                    </div>

                                    {/* Status & Aksi */}
                                    <div className="flex items-center justify-between md:justify-end md:w-3/12 gap-4">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${student.statusColor}`}>{student.status}</span>
                                        <button className="p-2 text-gray-400 hover:text-green-600 bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition-colors" title="Edit Data">
                                            <LayoutDashboard size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Laporan */}
                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-500 font-medium">Menampilkan 5 setoran terakhir hari ini.</div>
                            <button className="text-sm font-bold text-green-600 hover:text-green-800">Lihat Semua Mutabaah</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
