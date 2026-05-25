'use client';

import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { LayoutDashboard, Users, BookCheck, Settings, LogOut, Bell, BookOpen, TrendingUp, CheckCircle2, FileText, GraduationCap, MessageCircle, Calendar, Menu, X, ChevronRight, Activity } from 'lucide-react';

// Sub-pages
import AnakPage, { type Child } from './AnakPage';
import LaporanPage from './LaporanPage';
import PengaturanPage, { type ParentProfile } from './PengaturanPage';

// ── Components ───────────────────────────────────────────────
import NotificationBell from '@/Components/NotificationBell';

export default function ParentDashboard({ anakList, stats, bulan, children_stats, recent_reports, profile }: DashboardProps) {
    const user = usePage<PageProps>().props.auth.user as { photo?: string; name?: string; username?: string };
    const displayName = user?.name || user?.username || 'Wali Murid';
    const initials =
        displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase())
            .join('') || 'W';

    const params = new URLSearchParams(window.location.search);
    const activeTab = params.get('tab') || 'dashboard';

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const activeChildren = anakList.filter((c) => c.enrollment_status === 'active');
    const [selectedChildId, setSelectedChildId] = useState<string>(activeChildren[0]?.id ?? '');
    const activeChild = activeChildren.find((c) => c.id === selectedChildId) || activeChildren[0];

    const setActive = (tab: string) => {
        router.visit(route('parents.dashboard') + (tab !== 'dashboard' ? `?tab=${tab}` : ''), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 md:pb-0">
                {/* ════ TOPNAV ════ */}
                <nav className="sticky top-0 z-[100] h-16 bg-white border-b border-slate-100 shadow-sm flex items-center px-4 md:px-7">
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="bg-[#1B6B3A] p-2 rounded-xl shadow-lg shadow-green-900/10">
                            <BookOpen size={18} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="hidden md:block leading-none">
                            <div className="font-black text-slate-900 tracking-tight">EduConnect</div>
                            <div className="text-[9px] font-bold text-[#1B6B3A] uppercase tracking-widest">Portal</div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center ml-10 gap-1">
                        {navItems.map(({ icon: Icon, label, id }) => (
                            <button key={id} onClick={() => setActive(id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-[#1B6B3A] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Icon size={16} /> {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <NotificationBell onNavigate={setActive} />
                        <button className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors" onClick={handleLogout}>
                            <LogOut size={18} />
                        </button>
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-100">
                            <div className="text-right">
                                <div className="text-xs font-black text-slate-900 leading-none">{displayName}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Wali Murid</div>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-green-600 shadow-sm shrink-0">
                                {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{initials}</div>}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ════ MOBILE MENU OVERLAY ════ */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 top-16 bg-white z-[90] flex flex-col p-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        {navItems.map(({ icon: Icon, label, id }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActive(id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex items-center justify-between p-5 rounded-3xl font-black text-lg ${activeTab === id ? 'bg-green-50 text-[#1B6B3A]' : 'bg-slate-50 text-slate-600'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Icon size={24} /> {label}
                                </div>
                                <ChevronRight size={20} className="opacity-30" />
                            </button>
                        ))}
                    </div>
                )}

                {/* ════ CONTENT ════ */}
                <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
                    {activeTab === 'anak' ? (
                        <AnakPage anakList={anakList} />
                    ) : activeTab === 'laporan' ? (
                        <LaporanPage />
                    ) : activeTab === 'pengaturan' ? (
                        <PengaturanPage profile={profile} />
                    ) : (
                        <>
                            {/* 1. Header & Grid 4 Android Optimized */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ahlan, {displayName.split(' ')[0]}!</h1>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{bulan}</p>
                                </div>

                                {anakList.length === 0 ? (
                                    /* ── EMPTY STATE ── */
                                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center gap-5">
                                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#1B6B3A]/10 to-[#1B6B3A]/5 flex items-center justify-center text-4xl border border-[#1B6B3A]/10">👦</div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-2">Belum Ada Ananda Terdaftar</h2>
                                            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">Daftarkan putra/putri Anda ke program QLC untuk mulai memantau perkembangan belajar mereka.</p>
                                        </div>
                                        <button onClick={() => setActive('anak')} className="bg-[#1B6B3A] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-green-900/20 hover:bg-[#14522d] active:scale-95 transition-all flex items-center gap-2">
                                            <Users size={16} /> Daftarkan Ananda Sekarang
                                        </button>
                                    </div>
                                ) : (
                                    /* GRID 4 UNTUK MOBILE & DESKTOP */
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Ananda', val: stats.total_anak, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600' },
                                            { label: 'Hadir', val: stats.total_hadir, icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600' },
                                            { label: 'Laporan', val: stats.total_laporan, icon: FileText, bg: 'bg-purple-50', text: 'text-purple-600' },
                                            { label: 'Aktivitas', val: recent_reports.length, icon: Activity, bg: 'bg-orange-50', text: 'text-orange-600' },
                                        ].map((s, i) => (
                                            <div key={i} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-transform">
                                                <div className={`${s.bg} ${s.text} p-2.5 rounded-2xl mb-2`}>
                                                    <s.icon size={20} />
                                                </div>
                                                <b className="text-xl font-black text-slate-900">{s.val}</b>
                                                <span className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2–4. Child sections — only shown when children exist */}
                            {anakList.length > 0 && (
                                <>
                                    {/* 2. Child Selector & Focus Hero */}
                                    <div className="space-y-4">
                                        {activeChildren.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                                                {activeChildren.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => setSelectedChildId(c.id)}
                                                        className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all active:scale-95 ${selectedChildId === c.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}
                                                    >
                                                        {c.nama}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative overflow-hidden bg-[#1B6B3A] rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl shadow-green-900/20 group">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="text-4xl bg-white/20 w-20 h-20 rounded-[2rem] flex items-center justify-center border border-white/20 backdrop-blur-md">👦</div>
                                                <div>
                                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-white/20 text-[10px] font-black mb-1 uppercase tracking-widest">Fokus Pantauan</span>
                                                    <h2 className="text-xl md:text-2xl font-black leading-tight">{activeChild?.nama}</h2>
                                                    <div className="flex items-center gap-2 text-sm mt-1 font-bold opacity-80 italic">
                                                        <GraduationCap size={16} /> {activeChild?.program_name || 'Reguler'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Detail Statistics (Attendance & Quality) */}
                                    {(() => {
                                        const sel = children_stats[selectedChildId];
                                        if (!sel) return null;
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Presensi Card */}
                                                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Presensi</h3>
                                                        <span className="text-xs font-black bg-slate-50 px-3 py-1 rounded-full text-slate-500">
                                                            {sel.attendance.hadir}/{sel.attendance.total} Sesi
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-50 rounded-full h-3 border border-slate-100 p-0.5 mb-6">
                                                        <div className="bg-[#1B6B3A] h-full rounded-full shadow-[0_0_8px_rgba(27,107,58,0.2)]" style={{ width: `${(sel.attendance.hadir / sel.attendance.total) * 100}%` }}></div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[
                                                            { l: 'Izin', v: sel.attendance.izin, c: 'text-amber-500' },
                                                            { l: 'Sakit', v: sel.attendance.sakit, c: 'text-sky-500' },
                                                            { l: 'Alpha', v: sel.attendance.alpha, c: 'text-red-500' },
                                                        ].map((item) => (
                                                            <div key={item.l} className="bg-slate-50 rounded-2xl p-3 text-center">
                                                                <span className={`block text-lg font-black ${item.c}`}>{item.v}</span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase">{item.l}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Kualitas Card */}
                                                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Penilaian</h3>
                                                    <div className="space-y-4">
                                                        {[
                                                            { l: 'Sangat Lancar', v: sel.quality.sangat_lancar, c: 'bg-green-500', t: 'text-green-600', total: sel.quality.total },
                                                            { l: 'Lancar', v: sel.quality.lancar, c: 'bg-amber-500', t: 'text-amber-600', total: sel.quality.total },
                                                            { l: 'Perlu Mengulang', v: sel.quality.mengulang, c: 'bg-red-500', t: 'text-red-600', total: sel.quality.total },
                                                        ].map((q) => (
                                                            <div key={q.l} className="flex items-center gap-4">
                                                                <div className="text-sm font-black text-slate-900 w-24 leading-tight">{q.l}</div>
                                                                <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                                                    <div className={`${q.c} h-full rounded-full`} style={{ width: `${(q.v / q.total) * 100}%` }}></div>
                                                                </div>
                                                                <div className={`text-xs font-black ${q.t}`}>{q.v}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* 4. Recent Notes */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Catatan Asatidz</h3>
                                            <button onClick={() => setActive('laporan')} className="p-2 text-[#1B6B3A] active:scale-90 transition-transform">
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {recent_reports
                                                .filter((r) => r.student_id === selectedChildId)
                                                .slice(0, 3)
                                                .map((r) => (
                                                    <div key={r.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm active:scale-[0.98] transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex gap-2">
                                                                <span className="text-[9px] font-black px-2 py-1 bg-slate-900 text-white rounded-lg uppercase">{r.report_type}</span>
                                                                <span className="text-[9px] font-black px-2 py-1 bg-[#1B6B3A]/10 text-[#1B6B3A] rounded-lg uppercase">{r.kualitas?.replace('_', ' ')}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-300 tracking-tighter">{r.date}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">"{r.teacher_notes}"</p>
                                                        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-50 text-[11px] font-black text-slate-900 uppercase">
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#1B6B3A]">
                                                                <MessageCircle size={14} />
                                                            </div>
                                                            Ustadz/ah {r.teacher_name}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* ════ ANDROID BOTTOM NAVIGATION ════ */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-4 pb-safe lg:hidden">
                    <div className="max-w-md mx-auto flex justify-around items-center h-20">
                        {navItems.map((item) => (
                            <button key={item.id} onClick={() => setActive(item.id)} className={`flex flex-col items-center justify-center w-full transition-all duration-300 active:scale-75 ${activeTab === item.id ? 'text-[#1B6B3A]' : 'text-slate-300'}`}>
                                <div className={`mb-1.5 p-1 px-5 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-green-50 shadow-inner' : 'bg-transparent'}`}>
                                    <item.icon size={activeTab === item.id ? 24 : 22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-black tracking-tighter uppercase ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </>
    );
}

// Nav items definition
const navItems = [
    { icon: LayoutDashboard, label: 'Beranda', id: 'dashboard' },
    { icon: Users, label: 'Ananda', id: 'anak' },
    { icon: BookCheck, label: 'Laporan', id: 'laporan' },
    { icon: Settings, label: 'Menu', id: 'pengaturan' },
];

interface DashboardProps {
    anakList: Child[];
    stats: { total_anak: number; total_laporan: number; total_hadir: number };
    bulan: string;
    children_stats: Record<string, any>;
    recent_reports: any[];
    profile: any;
}
