import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    BookOpen, LayoutDashboard, CalendarDays, FileText,
    Settings, LogOut, Bell, CalendarX,
    CheckCircle2, AlertCircle, Plus, Star,
    ChevronRight, Clock, MapPin, Users, Menu, X
} from 'lucide-react';

// ── Sub-pages ─────────────────────────────────────────────
import JadwalPage from './JadwalPage';
import LaporanGuruPage from './LaporanGuruPage';
import PengaturanGuruPage, { type TeacherProfile } from './PengaturanGuruPage';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Agenda {
    id: string; time: string; class: string;
    type: string; room: string;
    status: 'Menunggu' | 'Sedang Berjalan' | 'Selesai';
}

interface RecentReport {
    id: string; student_name: string; class_name: string;
    report_type: 'hafalan' | 'tilawah' | 'yanbua';
    surah_or_jilid: string; ayat_or_hal: string;
    kualitas: 'sangat_lancar' | 'lancar' | 'mengulang';
}

interface TeacherDashboardProps {
    stats:          { total_santri: number; target_tercapai: number; };
    today_agendas:  Agenda[];
    recent_reports: RecentReport[];
    profile:        TeacherProfile | null;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const kualitasConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    sangat_lancar: { label:'Sangat Lancar',   color:'bg-blue-100 text-blue-700',       icon:Star         },
    lancar:        { label:'Lancar',          color:'bg-emerald-100 text-emerald-700', icon:CheckCircle2 },
    mengulang:     { label:'Perlu Mengulang', color:'bg-amber-100 text-amber-700',     icon:AlertCircle  },
};

const navItems = [
    { icon:LayoutDashboard, label:'Dashboard',       id:'dashboard'  },
    { icon:CalendarDays,    label:'Jadwal & Agenda', id:'jadwal'     },
    { icon:FileText,        label:'Buku Mutabaah',   id:'laporan'    },
    { icon:Settings,        label:'Pengaturan',      id:'pengaturan' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function TeacherDashboard({ stats, today_agendas, recent_reports, profile }: TeacherDashboardProps) {
    const user        = usePage<PageProps>().props.auth.user as any;
    const teacherName = profile?.nama_guru || user?.name || user?.username || 'Ustadz/Ustadzah';
    const initials    = teacherName.split(' ').filter(Boolean).slice(0,2).map((p:string)=>p[0]?.toUpperCase()).join('') || 'G';

    const params    = new URLSearchParams(window.location.search);
    const activeTab = params.get('tab') || 'dashboard';

    // State untuk mengontrol Mobile Menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const setActive = (tab: string) => {
        setIsMobileMenuOpen(false); // Tutup menu mobile setelah tab dipilih
        router.visit(route('teacher.dashboard') + (tab !== 'dashboard' ? `?tab=${tab}` : ''), {
            preserveScroll: true, preserveState: true, replace: true,
        });
    };

    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Dashboard Guru" />
            <style>{`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); opacity: 0; }
                    to   { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
            `}</style>

            <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

                {/* ════ TOPNAV ════ */}
                <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-10 gap-0">
                    
                    {/* Tombol Hamburger (Hanya muncul di Mobile/Tablet) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden mr-3 p-2 text-gray-500 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo & Judul */}
                    <div className="flex items-center gap-3 lg:mr-8 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
                            <BookOpen size={20} strokeWidth={2.5}/>
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-extrabold text-base text-gray-900 leading-tight">Pejuang Quran</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Portal Asatidz</div>
                        </div>
                    </div>

                    {/* Desktop Navigation (Sembunyi di Mobile/Tablet) */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map(({icon:Icon, label, id}) => (
                            <button key={id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    activeTab === id
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
                                }`}
                                onClick={() => setActive(id)}>
                                <Icon size={16} strokeWidth={activeTab===id?2.5:2}/>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1"/>

                    {/* Profile & Logout */}
                    <div className="flex items-center gap-2">
                        <button className="hidden sm:flex w-10 h-10 rounded-xl bg-gray-100 items-center justify-center text-gray-500 hover:bg-green-100 hover:text-green-700 transition-colors">
                            <Bell size={18}/>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="h-10 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-bold">
                            <LogOut size={16}/> <span className="hidden md:block">Keluar</span>
                        </button>
                        <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l border-gray-200">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-bold text-gray-900 leading-tight">{teacherName}</div>
                                <div className="text-xs text-green-600 font-semibold">Asatidz</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                {initials}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ════ MOBILE MENU OVERLAY ════ */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        {/* Background redup (klik untuk tutup) */}
                        <div 
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)} 
                        />
                        
                        {/* Panel Menu yang meluncur dari kiri */}
                        <div className="absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-left">
                            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
                                <span className="font-extrabold text-gray-900">Menu Navigasi</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                                {navItems.map(({icon:Icon, label, id}) => (
                                    <button key={id}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                            activeTab === id
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                        onClick={() => setActive(id)}>
                                        <Icon size={18} strokeWidth={activeTab===id?2.5:2}/>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Info User di bawah menu mobile */}
                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{teacherName}</div>
                                    <div className="text-xs text-green-600 font-semibold truncate">Asatidz QLC</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ CONTENT ════ */}
                <div className="w-full px-4 sm:px-6 lg:px-10 pt-6 pb-12 mx-auto">
                    {activeTab === 'jadwal'     ? <JadwalPage/> :
                     activeTab === 'laporan'    ? <LaporanGuruPage/> :
                     activeTab === 'pengaturan' ? <PengaturanGuruPage profile={profile}/> :
                    (
                        <div className="flex flex-col gap-6">

                            {/* Hero */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 to-green-900 rounded-3xl p-6 md:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"/>
                                <div className="absolute bottom-0 left-20 w-40 h-40 bg-green-400 bg-opacity-20 rounded-full blur-2xl transform translate-y-1/2"/>

                                <div className="relative z-10 w-full">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full text-green-50 text-[11px] font-bold uppercase tracking-wider mb-4">
                                        <CalendarDays size={13}/> Hari ini, {new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">
                                        Ahlan wa Sahlan,<br className="sm:hidden" /> {teacherName}
                                    </h1>
                                    <p className="text-green-50 text-sm max-w-xl leading-relaxed font-medium">
                                        Semoga Allah memberkahi setiap huruf yang diajarkan hari ini. Terdapat{' '}
                                        <b className="text-white">{today_agendas.length} jadwal</b> mengajar yang menanti Anda.
                                    </p>
                                </div>

                                <div className="flex flex-row gap-3 w-full lg:w-auto relative z-10">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 lg:w-36 text-center">
                                        <div className="text-2xl md:text-3xl font-black text-white mb-1">{stats.total_santri}</div>
                                        <div className="text-[10px] md:text-xs text-green-100 font-semibold">Total Santri Binaan</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 lg:w-36 text-center">
                                        <div className="text-2xl md:text-3xl font-black text-yellow-400 mb-1">{stats.target_tercapai}%</div>
                                        <div className="text-[10px] md:text-xs text-green-100 font-semibold">Target Kelas Tercapai</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                                {/* Agenda hari ini */}
                                <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h2 className="text-base md:text-lg font-extrabold text-gray-900">Jadwal Hari Ini</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Agenda mengajar aktif</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                            <CalendarDays size={20}/>
                                        </div>
                                    </div>

                                    {today_agendas.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 py-10 text-gray-400 gap-3">
                                            <CalendarX size={40} className="opacity-30"/>
                                            <p className="text-sm font-semibold">Tidak ada jadwal hari ini</p>
                                        </div>
                                    ) : (
                                        <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-5">
                                            {today_agendas.map(a => (
                                                <div key={a.id} className="relative pl-5">
                                                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm
                                                        ${a.status==='Selesai'?'bg-emerald-500':a.status==='Sedang Berjalan'?'bg-amber-500':'bg-gray-300'}`}/>
                                                    <div className="flex flex-col gap-1 p-3 -mt-3 rounded-xl hover:bg-gray-50 transition">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-800">{a.time}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold
                                                                ${a.status==='Selesai'?'bg-emerald-100 text-emerald-700':
                                                                  a.status==='Sedang Berjalan'?'bg-amber-100 text-amber-700 animate-pulse':
                                                                  'bg-gray-100 text-gray-500'}`}>
                                                                {a.status}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm md:text-base font-bold text-green-700">
                                                            {a.class} <span className="text-gray-600 font-medium text-[11px] md:text-sm">— {a.type}</span>
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-gray-500 font-medium">
                                                            <MapPin size={12} className="text-gray-400 shrink-0"/> {a.room}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button onClick={() => setActive('jadwal')}
                                        className="w-full mt-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                                        <CalendarDays size={16}/> Lihat Kalender Lengkap
                                    </button>
                                </div>

                                {/* Progres santri terbaru */}
                                <div className="xl:col-span-2 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                                        <div>
                                            <h2 className="text-base md:text-lg font-extrabold text-gray-900">Progres Santri Terbaru</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Buku Mutabaah Digital / Catatan Setoran</p>
                                        </div>
                                        <button onClick={() => setActive('laporan')}
                                            className="px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
                                            <Plus size={16}/> Input Setoran
                                        </button>
                                    </div>

                                    {recent_reports.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-400 gap-3">
                                            <FileText size={48} className="opacity-20"/>
                                            <p className="text-sm md:text-base font-semibold text-gray-500">Belum ada setoran hari ini.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 flex-1">
                                            {recent_reports.map(report => {
                                                const conf = kualitasConfig[report.kualitas];
                                                const Icon = conf.icon;
                                                return (
                                                    <div key={report.id} onClick={() => setActive('laporan')}
                                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md transition-all cursor-pointer gap-4 group">
                                                        
                                                        {/* Avatar & Nama */}
                                                        <div className="flex items-center gap-3 md:w-4/12">
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                                {report.student_name.substring(0,2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors truncate">{report.student_name}</h3>
                                                                <p className="text-xs font-semibold text-gray-500">Kelas {report.class_name}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Detail Setoran */}
                                                        <div className="flex flex-row gap-4 sm:gap-6 md:w-5/12 bg-gray-50/80 p-3 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                                            <div className="w-1/2">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{report.report_type}</div>
                                                                <div className="text-xs sm:text-sm font-bold text-gray-800 truncate" title={report.surah_or_jilid}>{report.surah_or_jilid}</div>
                                                            </div>
                                                            <div className="w-1/2">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ayat / Hal</div>
                                                                <div className="text-xs sm:text-sm font-bold text-gray-800 truncate" title={report.ayat_or_hal}>{report.ayat_or_hal}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Badge Kualitas & Action */}
                                                        <div className="flex items-center justify-between md:justify-end md:w-3/12 gap-3 mt-1 md:mt-0">
                                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap ${conf.color}`}>
                                                                <Icon size={12}/> {conf.label}
                                                            </span>
                                                            <button className="p-2 text-gray-400 hover:text-green-600 bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
                                                                <ChevronRight size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="text-[11px] sm:text-xs text-gray-500 font-medium flex items-center gap-1">
                                            <Clock size={12}/> Menampilkan setoran terakhir hari ini.
                                        </div>
                                        <button onClick={() => setActive('laporan')}
                                            className="text-[13px] sm:text-sm font-bold text-green-600 hover:text-green-800 flex items-center gap-1 group self-start sm:self-auto">
                                            Lihat Semua Mutabaah <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}