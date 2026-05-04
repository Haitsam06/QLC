import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import axios from 'axios';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    CalendarDays,
    Bell,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    CheckCircle2,
    Clock,
    TrendingUp,
    Award,
    Star,
    Menu,
    FileText,
    ShieldUser,
    Info,
    Handshake,
    ArrowUpRight,
    ArrowRight,
    UserPlus,
    Search,
    Loader2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import GuruPage from './GuruPage';
import MitraPage from './MitraPage';
import WaliMuridPage from './WalimuridPage';
import SiswaPage from './SiswaPage';
import InfoPage from './InfoPage';
import AgendaPage from './AgendaPage';
import ProgressPage from './ProgressPage';
import PengaturanPage from './PengaturanPage';
import NotificationBell from '@/Components/NotificationBell';

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
interface DashStats {
    total_siswa: number;
    total_pending: number;
    total_guru: number;
    total_program: number;
    total_mitra: number;
}

interface ChartPoint {
    name: string;
    pendaftar: number;
}
interface AgendaItem {
    id: string;
    title: string;
    date: string;
    type: string;
}
interface PendingItem {
    id: string;
    nama: string;
    prog: string;
    date: string;
}
interface ReportItem {
    id: string;
    student_id: string;
    nama: string;
    capaian: string;
    report_type: string | null;
    kualitas: string | null;
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const QUAL_LABEL: Record<string, string> = {
    sangat_lancar: 'Sangat Lancar',
    lancar: 'Lancar',
    mengulang: 'Mengulang',
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function DashboardAdmin() {
    const { auth } = usePage().props as PageProps;
    const user = auth?.user;
    const adminName = (user as any)?.name || (user as any)?.username || 'Admin QLC';
    const initial = adminName.substring(0, 2).toUpperCase();

    const [col, setCol] = useState(false);
    const [mobOpen, setMobOpen] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const [active, setActive] = useState(urlParams.get('tab') || 'dashboard');

    useEffect(() => {
        if (active !== 'dashboard') window.history.pushState(null, '', `?tab=${active}`);
        else window.history.pushState(null, '', window.location.pathname);
    }, [active]);

    // ── Dashboard Data ──────────────────────────────────────
    const [stats, setStats] = useState<DashStats | null>(null);
    const [chart, setChart] = useState<ChartPoint[]>([]);
    const [agendas, setAgendas] = useState<AgendaItem[]>([]);
    const [pending, setPending] = useState<PendingItem[]>([]);
    const [topRep, setTopRep] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch semua data dashboard sekaligus saat tab = dashboard
    useEffect(() => {
        if (active !== 'dashboard') return;

        setLoading(true);
        Promise.all([
            axios.get<DashStats>('/api/admin/dashboard/stats'),
            axios.get<ChartPoint[]>('/api/admin/dashboard/chart'),
            axios.get<AgendaItem[]>('/api/admin/dashboard/upcoming-agenda'),
            axios.get<PendingItem[]>('/api/admin/dashboard/pending-students'),
            axios.get<ReportItem[]>('/api/admin/dashboard/top-reports'),
        ])
            .then(([s, c, a, p, r]) => {
                setStats(s.data);
                setChart(c.data);
                setAgendas(a.data);
                setPending(p.data);
                setTopRep(r.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [active]);

    const NAV = [
        { id: 'dashboard', l: 'Beranda', i: LayoutDashboard, badge: 0 },
        { id: 'agenda', l: 'Agenda QLC', i: CalendarDays, badge: 0 },
        { id: 'guru', l: 'Manajemen Guru', i: GraduationCap, badge: 0 },
        { id: 'mitra', l: 'Data Mitra', i: Handshake, badge: 0 },
        { id: 'wali_murid', l: 'Wali Murid', i: ShieldUser, badge: 0 },
        { id: 'siswa', l: 'Data Siswa', i: Users, badge: stats?.total_pending ?? 0 },
        { id: 'progress', l: 'Laporan Progress', i: BookOpen, badge: 0 },
        { id: 'info', l: 'Info Landing Page', i: Info, badge: 0 },
        { id: 'pengaturan', l: 'Pengaturan', i: Settings, badge: 0 },
    ];

    const handleLogout = () => router.post(route('logout'));
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Admin Dashboard | QLC" />

            <div className="flex min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
                {/* ════ SIDEBAR ════ */}
                <aside
                    className={`flex flex-col bg-teal-700 text-white shrink-0 transition-all duration-300 ease-in-out z-50 md:z-20 fixed md:relative inset-y-0 left-0 md:my-3 md:ml-3 shadow-2xl md:shadow-none md:rounded-2xl overflow-hidden
                    ${col ? 'md:w-16 w-64' : 'w-64'} 
                    ${mobOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                >
                    <div className="h-16 flex items-center px-4.5 gap-2.5 border-b border-white/10 whitespace-nowrap overflow-hidden">
                        <div className="w-8 h-8 rounded-lg shrink-0 bg-white/15 flex items-center justify-center">
                            <BookOpen size={20} color="#fff" />
                        </div>
                        <div className={`transition-opacity duration-200 ${col ? 'opacity-0 md:hidden' : 'opacity-100 block'}`}>
                            <div className="text-sm font-extrabold tracking-tight leading-tight">EduConnect</div>
                            <div className="text-[9.5px] font-medium text-teal-50/80">Admin Portal</div>
                        </div>
                    </div>

                    <button
                        className="absolute top-7 -right-2.5 w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-600 cursor-pointer z-10 shadow-sm transition-colors hover:text-teal-700 hidden md:flex"
                        onClick={() => setCol(!col)}
                    >
                        {col ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    <div className="flex-1 py-4 px-2.5 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                        {NAV.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-center gap-3 py-2 px-2.5 rounded-lg text-[13px] transition-colors cursor-pointer whitespace-nowrap relative hover:text-white hover:bg-white/10
                                ${active === n.id ? 'text-white bg-white/15 font-bold before:content-[""] before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:bg-white before:rounded-r-sm' : 'text-white/70 font-semibold'}`}
                                onClick={() => {
                                    setActive(n.id);
                                    setMobOpen(false);
                                }}
                            >
                                <n.i size={18} className="shrink-0" />
                                <span className={`transition-opacity duration-200 ${col ? 'opacity-0 md:hidden' : 'opacity-100 block'}`}>{n.l}</span>
                                {n.badge > 0 && (
                                    <span
                                        className={`ml-auto bg-red-600 text-white font-extrabold rounded-full ${col ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0 text-[0px] md:block hidden' : 'px-1.5 py-[1px] text-[10px]'}`}
                                    >
                                        {n.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="py-3 px-2.5 border-t border-white/10">
                        <div
                            className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-[13px] font-semibold text-red-300 hover:text-red-200 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} className="shrink-0" />
                            <span className={`transition-opacity duration-200 ${col ? 'opacity-0 md:hidden' : 'opacity-100 block'}`}>Keluar</span>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {mobOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setMobOpen(false)} />}

                {/* ════ MAIN ════ */}
                <main className="flex-1 flex flex-col min-w-0 transition-all duration-200 z-10 h-screen overflow-y-auto scroll-smooth">
                    {/* Topbar */}
                    <header className="flex items-center justify-between py-3 px-4 md:px-5 sticky top-0 z-40 bg-slate-50 border-b border-slate-200/60 md:border-none">
                        <div className="flex items-center gap-3">
                            <button
                                className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 hover:text-teal-700"
                                onClick={() => setMobOpen(true)}
                            >
                                <Menu size={17} />
                            </button>
                            <div className="hidden md:flex items-center gap-2 bg-white px-4 h-10 rounded-full border border-slate-300 w-[260px] focus-within:w-[310px] focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/10 transition-all duration-300">
                                <Search size={14} className="text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 text-[13px] text-slate-900 bg-transparent border-0 focus:ring-0 outline-none placeholder:text-slate-400"
                                    placeholder="Cari siswa, guru, atau program..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notifikasi */}
                            <NotificationBell onNavigate={(tab) => setActive(tab)} />

                            {/* Profile */}
                            <div
                                className="flex items-center gap-2 bg-white p-1 pr-3.5 rounded-full border border-slate-300 cursor-pointer transition-colors hover:bg-slate-100"
                                onClick={() => setActive('pengaturan')}
                            >
                                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">{initial}</div>
                                <div className="hidden md:block">
                                    <div className="text-[12.5px] font-bold text-slate-900 leading-tight truncate max-w-[120px]">{adminName}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold">Administrator</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ════ CONTENT ════ */}
                    <div className="p-4 md:px-6 md:pb-10 flex-1 flex flex-col gap-4 md:gap-5 transition-opacity duration-300">
                        {active === 'guru' ? (
                            <GuruPage />
                        ) : active === 'mitra' ? (
                            <MitraPage />
                        ) : active === 'wali_murid' ? (
                            <WaliMuridPage />
                        ) : active === 'siswa' ? (
                            <SiswaPage />
                        ) : active === 'info' ? (
                            <InfoPage />
                        ) : active === 'agenda' ? (
                            <AgendaPage />
                        ) : active === 'progress' ? (
                            <ProgressPage />
                        ) : active === 'pengaturan' ? (
                            <PengaturanPage />
                        ) : (
                            /* ════ BERANDA ════ */
                            <>
                                {/* Banner */}
                                <div className="bg-teal-700 rounded-2xl p-5 md:py-6 md:px-8 text-white flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 relative overflow-hidden">
                                    <div className="absolute -right-10 -top-20 w-60 h-60 rounded-full bg-white/10" />
                                    <div className="relative z-10">
                                        <div className="text-xl md:text-2xl font-extrabold mb-1 tracking-tight">Selamat Datang, {adminName.split(' ')[0]} 👋</div>
                                        <div className="text-[13px] text-white/80 font-medium">Berikut adalah ringkasan operasional QLC hari ini.</div>
                                    </div>
                                    <div className="bg-black/15 py-1.5 px-3.5 rounded-lg text-[12.5px] font-bold flex items-center gap-2 border border-white/10 relative z-10 whitespace-nowrap">
                                        <CalendarDays size={16} /> {today}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                                    {[
                                        {
                                            val: stats?.total_siswa,
                                            lbl: 'Total Siswa',
                                            icon: <Users size={22} strokeWidth={2} />,
                                            bgClass: 'bg-teal-700/10',
                                            textClass: 'text-teal-700',
                                            tab: 'siswa',
                                        },
                                        {
                                            val: stats?.total_guru,
                                            lbl: 'Pengajar Aktif',
                                            icon: <GraduationCap size={22} strokeWidth={2} />,
                                            bgClass: 'bg-blue-600/10',
                                            textClass: 'text-blue-600',
                                            tab: 'guru',
                                        },
                                        {
                                            val: stats?.total_program,
                                            lbl: 'Program Studi',
                                            icon: <BookOpen size={22} strokeWidth={2} />,
                                            bgClass: 'bg-purple-600/10',
                                            textClass: 'text-purple-600',
                                            tab: 'info',
                                        },
                                        {
                                            val: stats?.total_mitra,
                                            lbl: 'Mitra Aktif',
                                            icon: <Handshake size={22} strokeWidth={2} />,
                                            bgClass: 'bg-amber-500/10',
                                            textClass: 'text-amber-600',
                                            tab: 'mitra',
                                        },
                                    ].map(({ val, lbl, icon, bgClass, textClass, tab }) => (
                                        <div
                                            key={lbl}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 p-4 cursor-pointer transition-colors hover:bg-slate-50"
                                            onClick={() => setActive(tab)}
                                        >
                                            <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center ${bgClass} ${textClass}`}>{icon}</div>
                                            <div className="flex-1 min-w-0">
                                                {loading ? (
                                                    <div className="h-6 w-12 bg-slate-200 rounded-md animate-pulse" />
                                                ) : (
                                                    <div className="text-[22px] font-black text-slate-900 leading-tight">{val ?? 0}</div>
                                                )}
                                                <div className="text-[11px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide truncate">{lbl}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart & Agenda */}
                                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
                                    {/* Chart */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                                                <TrendingUp size={18} className="text-teal-700" /> Grafik Pendaftaran
                                            </div>
                                        </div>
                                        <div className="h-[260px] w-full mt-2">
                                            {loading ? (
                                                <div className="h-full flex items-center justify-center">
                                                    <Loader2 size={28} className="text-teal-700 animate-spin" />
                                                </div>
                                            ) : (
                                                <ResponsiveContainer>
                                                    <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                                                        <Area type="monotone" dataKey="pendaftar" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    {/* Agenda Terdekat */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                                                <CalendarDays size={18} className="text-blue-600" /> Agenda Terdekat
                                            </div>
                                            <button
                                                className="text-[11.5px] font-bold text-teal-700 flex items-center gap-1 transition-colors hover:text-teal-500 whitespace-nowrap"
                                                onClick={() => setActive('agenda')}
                                            >
                                                Lihat Semua <ArrowRight size={14} />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <div className="text-center py-6 px-5 text-slate-400 text-[13px] font-semibold">
                                                <Loader2 size={20} className="inline animate-spin" />
                                            </div>
                                        ) : agendas.length === 0 ? (
                                            <div className="text-center py-6 px-5 text-slate-400 text-[13px] font-semibold">Tidak ada agenda mendatang.</div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {agendas.map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl transition-colors hover:bg-slate-100"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div
                                                                className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-extrabold text-[13px] ${a.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                                                            >
                                                                {a.date.split(' ')[0]}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-[13px] font-bold text-slate-900 mb-0.5 truncate">{a.title}</div>
                                                                <div className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1">
                                                                    <Clock size={11} /> {a.date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom: Pending & Top Reports */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Perlu Persetujuan */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                                                <UserPlus size={18} className="text-yellow-600" /> Perlu Persetujuan
                                                {stats && stats.total_pending > 0 && (
                                                    <span className="bg-amber-100 text-amber-600 text-[11px] font-extrabold px-2 py-0.5 rounded-md ml-1">{stats.total_pending}</span>
                                                )}
                                            </div>
                                            <button
                                                className="text-[11.5px] font-bold text-teal-700 flex items-center gap-1 transition-colors hover:text-teal-500 whitespace-nowrap"
                                                onClick={() => setActive('siswa')}
                                            >
                                                Kelola Siswa <ArrowRight size={14} />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <div className="text-center py-6 px-5 text-slate-400 text-[13px] font-semibold">
                                                <Loader2 size={20} className="inline animate-spin" />
                                            </div>
                                        ) : pending.length === 0 ? (
                                            <div className="text-center py-6 px-5 text-green-600 text-[13px] font-semibold">
                                                <CheckCircle2 size={20} className="inline mr-1.5" />
                                                Semua pendaftaran sudah diproses.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {pending.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl transition-colors hover:bg-slate-100"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-extrabold text-[13px] bg-teal-700/10 text-teal-700">
                                                                {s.nama.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-[13px] font-bold text-slate-900 mb-0.5 truncate">{s.nama}</div>
                                                                <div className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1">
                                                                    <BookOpen size={11} /> <span className="truncate">{s.prog}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-2">
                                                            <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide">Menunggu</span>
                                                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">{s.date}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Laporan Terbaik */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center gap-2">
                                                <Star size={18} className="text-purple-600" /> Laporan Terbaik Hari Ini
                                            </div>
                                            <button
                                                className="text-[11.5px] font-bold text-teal-700 flex items-center gap-1 transition-colors hover:text-teal-500 whitespace-nowrap"
                                                onClick={() => setActive('progress')}
                                            >
                                                Semua Laporan <ArrowRight size={14} />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <div className="text-center py-6 px-5 text-slate-400 text-[13px] font-semibold">
                                                <Loader2 size={20} className="inline animate-spin" />
                                            </div>
                                        ) : topRep.length === 0 ? (
                                            <div className="text-center py-6 px-5 text-slate-400 text-[13px] font-semibold">Belum ada laporan hari ini.</div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {topRep.map((r) => (
                                                    <div
                                                        key={r.id}
                                                        className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl transition-colors hover:bg-slate-100"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-extrabold text-[13px] bg-purple-600/10 text-purple-600">
                                                                {r.nama.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-[13px] font-bold text-slate-900 mb-0.5 truncate">{r.nama}</div>
                                                                <div className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1 truncate">
                                                                    <FileText size={11} className="shrink-0" />
                                                                    {r.report_type ? r.report_type.toUpperCase() : '—'} · <span className="truncate">{r.capaian}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-2">
                                                            <span
                                                                className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${r.kualitas === 'sangat_lancar' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}
                                                            >
                                                                {r.kualitas ? QUAL_LABEL[r.kualitas] : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
