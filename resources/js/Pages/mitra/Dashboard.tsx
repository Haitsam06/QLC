import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import type { PageProps } from '@/types';
import {
    Briefcase, CalendarDays, FileCheck, LayoutDashboard,
    Bell, LogOut, Download, MapPin, Eye, Loader2,
    FileBadge, ShieldCheck, Menu, X
} from 'lucide-react';

// ── Sub-pages ─────────────────────────────────────────────
import JadwalMitra from './JadwalMitra';
import LaporanMitra from './LaporanMitra';

/* ═══════════════════════════════════════════════════════════
   HELPERS & TYPES
═══════════════════════════════════════════════════════════ */
const formatBytes = (b: number) => {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

/* ════ DATA MENU NAVBAR ════ */
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: CalendarDays,    label: 'Jadwal',    id: 'jadwal'    },
    { icon: FileCheck,       label: 'Laporan',   id: 'laporan'   },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MitraDashboard() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user as any;
    const displayName = user?.name || user?.username || user?.email || 'Pengguna';
    const roleText    = 'Mitra';
    const initials    = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join('') || 'U';

    // ── Aktif Tab dari URL query ──
    const params    = new URLSearchParams(window.location.search);
    const activeTab = params.get('tab') || 'dashboard';

    // ── Mobile menu state ──
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ── Dashboard data ──
    const [data,    setData]    = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/mitra/dashboard')
            .then(res => setData(res.data.data))
            .catch(err => console.error('Gagal memuat dashboard:', err))
            .finally(() => setLoading(false));
    }, []);

    const setActive = (tab: string) => {
        setIsMobileMenuOpen(false);
        router.visit(
            route('mitra.dashboard') + (tab !== 'dashboard' ? `?tab=${tab}` : ''),
            { preserveScroll: true, preserveState: true, replace: true }
        );
    };

    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Dashboard Mitra" />
            <style>{`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); opacity: 0; }
                    to   { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
            `}</style>

            <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

                {/* ════ TOPNAV ════ */}
                <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-4 md:px-8 lg:px-12 gap-0">

                    {/* Hamburger — hanya muncul di mobile/tablet */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden mr-3 p-2 text-gray-500 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3 lg:mr-8 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-md shrink-0">
                            <Briefcase size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div className="hidden md:block">
                            <div className="font-extrabold text-base text-gray-900 leading-tight">Mitra QLC</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Portal Kerjasama</div>
                        </div>
                    </div>

                    {/* Nav Pills — desktop */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map(({ icon: Icon, label, id }) => (
                            <button
                                key={id}
                                onClick={() => setActive(id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
                                    ${activeTab === id
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
                                    }`}
                            >
                                <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* Actions & Profile */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="h-10 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-bold"
                        >
                            <LogOut size={16} />
                            <span className="hidden md:block">Logout</span>
                        </button>
                        <button className="hidden sm:flex w-10 h-10 rounded-xl bg-gray-100 items-center justify-center text-gray-500 hover:bg-green-100 hover:text-green-700 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-bold text-gray-900 leading-tight">{displayName}</div>
                                <div className="text-xs text-green-600 font-semibold">{roleText}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                {initials}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ════ MOBILE MENU OVERLAY ════ */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Panel meluncur dari kiri */}
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
                                {navItems.map(({ icon: Icon, label, id }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActive(id)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all
                                            ${activeTab === id
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                            }`}
                                    >
                                        <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Info user di bawah menu mobile */}
                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{displayName}</div>
                                    <div className="text-xs text-green-600 font-semibold">{roleText}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ CONTENT ════ */}
                <div className="w-full px-4 md:px-8 lg:px-12 pt-8 pb-12 mx-auto">
                    {activeTab === 'jadwal'  ? <JadwalMitra /> :
                     activeTab === 'laporan' ? <LaporanMitra /> :
                    (
                        <div className="flex flex-col gap-6">

                            {/* ── Hero: Profil Mitra ── */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="inline-block px-3 py-1 bg-green-700 bg-opacity-50 border border-green-500 border-opacity-30 rounded-full text-green-100 text-xs font-bold uppercase tracking-wider mb-4">
                                        Status: {data?.profile?.status === 'Active' ? 'Kemitraan Aktif' : 'Menunggu / Inaktif'}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                                        {loading ? 'Memuat Profil...' : `Selamat Datang, ${data?.profile?.institution_name}`}
                                    </h1>
                                    <p className="text-green-100 text-opacity-90 text-sm max-w-xl leading-relaxed">
                                        Pantau dokumen kerja sama, jadwal kegiatan pendampingan dari QLC, serta unduh laporan evaluasi berkala secara real-time di dashboard ini.
                                    </p>
                                </div>

                                {/* Ringkasan Cepat */}
                                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                                    <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[140px] text-center">
                                        <div className="text-3xl font-black text-white mb-1">
                                            {loading ? '-' : data?.schedules?.length || 0}
                                        </div>
                                        <div className="text-xs text-green-200 font-semibold">Agenda Terdekat</div>
                                    </div>
                                    <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[140px] text-center">
                                        <div className="text-3xl font-black text-green-300 mb-1">
                                            {loading ? '-' : data?.reports?.length || 0}
                                        </div>
                                        <div className="text-xs text-green-200 font-semibold">Laporan Baru</div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Grid 3 Kolom Utama ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-2">

                                {/* KOLOM 1: Dokumen MOU & Info Kemitraan */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-extrabold text-gray-900">Dokumen Kemitraan</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Memorandum of Understanding</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <ShieldCheck size={20} />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex-1 flex justify-center items-center">
                                            <Loader2 className="animate-spin text-gray-400" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/50 flex flex-col items-center text-center gap-3">
                                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-600 mb-2">
                                                    <FileBadge size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">MOU Resmi QLC</h3>
                                                    <p className="text-xs text-gray-500 mt-1 px-4 leading-relaxed">
                                                        Dokumen ini berisi landasan hukum, hak, dan kewajiban kerja sama antara pihak QLC dengan Instansi Anda.
                                                    </p>
                                                </div>
                                                <div className="w-full mt-2">
                                                    {data?.profile?.mou_file_url ? (
                                                        <a
                                                            href={data.profile.mou_file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Eye size={18} /> Lihat Dokumen MOU
                                                        </a>
                                                    ) : (
                                                        <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                            Dokumen MOU Belum Tersedia
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500 flex justify-between px-2 font-medium">
                                                <span>PIC: {data?.profile?.contact_person || '-'}</span>
                                                <span className="text-green-600">Terverifikasi</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* KOLOM 2: Jadwal Terdekat */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-extrabold text-gray-900">Agenda Terdekat</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Jadwal kegiatan & kunjungan</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                                            <CalendarDays size={20} />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex-1 flex justify-center items-center">
                                            <Loader2 className="animate-spin text-gray-400" />
                                        </div>
                                    ) : data?.schedules?.length === 0 ? (
                                        <div className="flex-1 flex flex-col justify-center items-center text-gray-400 text-sm font-medium">
                                            <CalendarDays size={32} className="mb-2 opacity-50" />
                                            Belum ada agenda terdekat.
                                        </div>
                                    ) : (
                                        <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-6">
                                            {data?.schedules?.map((sched: any, index: number) => (
                                                <div key={sched.id} className="relative pl-5">
                                                    <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white ${index === 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                                            {formatDate(sched.date)}
                                                        </span>
                                                        <h3 className="text-base font-bold text-gray-800 leading-snug">{sched.title}</h3>
                                                        {sched.location && (
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
                                                                <MapPin size={14} className="text-gray-400" /> {sched.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* KOLOM 3: Laporan Terbaru */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-extrabold text-gray-900">Laporan Terbaru</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Hasil evaluasi QLC</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <FileCheck size={20} />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex-1 flex justify-center items-center">
                                            <Loader2 className="animate-spin text-gray-400" />
                                        </div>
                                    ) : data?.reports?.length === 0 ? (
                                        <div className="flex-1 flex flex-col justify-center items-center text-gray-400 text-sm font-medium">
                                            <FileCheck size={32} className="mb-2 opacity-50" />
                                            Belum ada laporan diterbitkan.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {data?.reports?.map((report: any) => (
                                                <div key={report.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all group">
                                                    <div className="flex items-start gap-3 w-full overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-black uppercase">{report.file_type || 'PDF'}</span>
                                                        </div>
                                                        <div className="overflow-hidden w-full pr-2">
                                                            <h3 className="text-sm font-bold text-gray-800 mb-0.5 truncate">{report.title}</h3>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                                <span>{report.date ? formatDate(report.date) : '-'}</span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                <span>{formatBytes(report.file_size)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {report.file_url && (
                                                        <a
                                                            href={report.file_url}
                                                            download
                                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-green-100 hover:text-green-600 transition-colors shrink-0"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}