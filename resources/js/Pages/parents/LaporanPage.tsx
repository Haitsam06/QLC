import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, XCircle, GraduationCap, Calendar, FileText, Star, Target, TrendingUp, AlertTriangle, MessageCircle, Loader2, RefreshCw, BookOpen, Users } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Child {
    id: string;
    nama: string;
    program_name: string;
    enrollment_status: 'active' | 'pending' | 'inactive';
}

interface ProgressReport {
    id: string;
    date: string;
    attendance: 'hadir' | 'izin' | 'sakit' | 'alpha';
    report_type: 'hafalan' | 'tilawah' | 'yanbua' | null;
    kualitas: 'sangat_lancar' | 'lancar' | 'mengulang' | null;
    hafalan_target: string | null;
    hafalan_achievement: string | null;
    teacher_notes: string | null;
    teacher_name: string | null;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS & CONSTANTS
═══════════════════════════════════════════════════════════ */
const ATTD: Record<string, { lbl: string; cls: string }> = {
    hadir: { lbl: 'Hadir', cls: 'bg-green-100 text-green-700 border-green-200' },
    izin: { lbl: 'Izin', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    sakit: { lbl: 'Sakit', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
    alpha: { lbl: 'Alpha', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const QUAL: Record<string, { lbl: string; cls: string }> = {
    sangat_lancar: { lbl: 'Sangat Lancar', cls: 'bg-pink-100 text-pink-700 border-pink-200' },
    lancar: { lbl: 'Lancar', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    mengulang: { lbl: 'Perlu Mengulang', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function LaporanPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>('');
    const [reports, setReports] = useState<ProgressReport[]>([]);
    const [loadingC, setLoadingC] = useState(true);
    const [loadingR, setLoadingR] = useState(false);
    const [errorC, setErrorC] = useState<string | null>(null);
    const [errorR, setErrorR] = useState<string | null>(null);

    useEffect(() => {
        setLoadingC(true);
        setErrorC(null);
        axios
            .get<Child[]>('/api/parent/children')
            .then((res) => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0].id);
            })
            .catch(() => setErrorC('Gagal memuat data anak.'))
            .finally(() => setLoadingC(false));
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        setLoadingR(true);
        setErrorR(null);
        setReports([]);
        axios
            .get<ProgressReport[]>(`/api/parent/children/${selectedChild}/reports`)
            .then((res) => setReports(res.data))
            .catch(() => setErrorR('Gagal memuat laporan.'))
            .finally(() => setLoadingR(false));
    }, [selectedChild]);

    const totalHadir = reports.filter((r) => r.attendance === 'hadir').length;
    const totalSangatLancar = reports.filter((r) => r.kualitas === 'sangat_lancar').length;

    return (
        <div className="flex flex-col gap-6 w-full animate-[fadeIn_0.3s_ease-out]">
            {/* ════ HEADER ════ */}
            <div className="flex flex-col gap-1">
                <h1 className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">Laporan Perkembangan</h1>
                <p className="text-[13px] text-slate-500 mt-1 font-bold italic">Pantau mutabaah harian dan pencapaian setoran anak Anda.</p>
            </div>

            {/* Error State Global */}
            {errorC && (
                <div className="flex items-center gap-3 p-4 rounded-[1rem] bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold">
                    <AlertTriangle size={18} /> {errorC}
                    <button className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors active:scale-95 focus:outline-none" onClick={() => window.location.reload()}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            )}

            {/* Loading State Global */}
            {loadingC && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={36} className="animate-spin text-[#1B6B3A]" />
                    <span className="text-[14px] font-bold text-slate-500">Memuat data...</span>
                </div>
            )}

            {/* ════ CHILD TABS (PILL SCROLL) ════ */}
            {!loadingC && children.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {children.map((child) => {
                        const isLocked = child.enrollment_status !== 'active';
                        const isActive = selectedChild === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChild(child.id)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-[1.2rem] whitespace-nowrap shrink-0 transition-all active:scale-95 focus:outline-none border ${isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'} ${isLocked ? 'opacity-70' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-[0.8rem] flex items-center justify-center text-[15px] font-black transition-all ${isActive ? 'bg-gradient-to-br from-[#1B6B3A] to-blue-600 text-white shadow-md' : 'bg-teal-50 text-teal-700'}`}>
                                    {child.nama.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col items-start text-left leading-tight">
                                    <span className={`text-[13.5px] transition-colors ${isActive ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{child.nama}</span>
                                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">{child.program_name}</span>
                                    {child.enrollment_status === 'pending' && <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md mt-1">⏳ Menunggu</span>}
                                    {child.enrollment_status === 'inactive' && <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md mt-1">⛔ Nonaktif</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ════ DYNAMIC CONTENT (Based on Selected Child) ════ */}
            {!loadingC &&
                children.length > 0 &&
                (() => {
                    const child = children.find((c) => c.id === selectedChild);
                    const isLocked = child?.enrollment_status !== 'active';

                    return (
                        <div className="flex flex-col gap-5">
                            {/* --- LOCKED STATE --- */}
                            {isLocked && (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 md:p-14 flex flex-col items-center text-center gap-3">
                                    <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-3xl mb-2 ${child?.enrollment_status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{child?.enrollment_status === 'pending' ? '⏳' : '⛔'}</div>
                                    <h3 className="text-[18px] font-black text-slate-900">{child?.enrollment_status === 'pending' ? 'Menunggu Verifikasi Admin' : 'Akun Tidak Aktif'}</h3>
                                    <p className="text-[13px] font-bold text-slate-500 max-w-sm leading-relaxed">
                                        {child?.enrollment_status === 'pending' ? 'Laporan akan tersedia setelah admin mengaktifkan akun anak Anda.' : 'Akun anak Anda tidak aktif. Hubungi admin untuk informasi lebih lanjut.'}
                                    </p>
                                </div>
                            )}

                            {/* --- STATS GRID --- */}
                            {!isLocked && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                                    {[
                                        { icon: FileText, bg: 'bg-blue-50', c: 'text-blue-600', v: loadingR ? '—' : reports.length, l: 'Total Laporan' },
                                        { icon: CheckCircle2, bg: 'bg-green-50', c: 'text-green-600', v: loadingR ? '—' : totalHadir, l: 'Total Hadir' },
                                        { icon: Star, bg: 'bg-amber-50', c: 'text-amber-500', v: loadingR ? '—' : totalSangatLancar, l: 'Sangat Lancar' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform active:scale-95">
                                            <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 ${s.bg} ${s.c}`}>
                                                <s.icon size={22} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="text-[24px] font-black text-slate-900 leading-none">{s.v}</div>
                                                <div className="text-[11px] font-black text-slate-400 uppercase mt-1.5 tracking-wider">{s.l}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- TIMELINE LAPORAN --- */}
                            {!isLocked && (
                                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
                                    <div className="text-[14px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Calendar size={18} className="text-[#1B6B3A]" /> Riwayat Setoran
                                    </div>

                                    {/* Loading Reports */}
                                    {loadingR && (
                                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                                            <Loader2 size={32} className="animate-spin text-[#1B6B3A]" />
                                            <span className="text-[13px] font-bold text-slate-500">Memuat laporan...</span>
                                        </div>
                                    )}

                                    {/* Error Reports */}
                                    {!loadingR && errorR && (
                                        <div className="flex items-center gap-3 p-4 rounded-[1rem] bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold">
                                            <AlertTriangle size={18} /> {errorR}
                                            <button className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors active:scale-95 focus:outline-none" onClick={() => setSelectedChild((id) => id)}>
                                                <RefreshCw size={14} /> Coba Lagi
                                            </button>
                                        </div>
                                    )}

                                    {/* Empty Reports */}
                                    {!loadingR && !errorR && reports.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                            <BookOpen size={56} className="text-slate-200 mb-2" />
                                            <div className="text-[16px] font-black text-slate-900">Belum Ada Laporan</div>
                                            <p className="text-[13px] font-bold text-slate-400">Anak ini belum memiliki riwayat setoran atau absensi.</p>
                                        </div>
                                    )}

                                    {/* Timeline Flowbite-ish (Responsive) */}
                                    {!loadingR && !errorR && reports.length > 0 && (
                                        <div className="relative border-l-2 border-slate-100 ml-3 md:ml-[5.5rem] flex flex-col gap-8 mt-2">
                                            {reports.map((r) => {
                                                const d = new Date(r.date);
                                                const isAbsnt = ['izin', 'sakit', 'alpha'].includes(r.attendance);
                                                const attdConf = ATTD[r.attendance] || { lbl: 'Unk', cls: 'bg-slate-100 text-slate-600' };

                                                return (
                                                    <div key={r.id} className="relative pl-6 md:pl-8 group">
                                                        {/* Dot */}
                                                        <span className={`absolute flex items-center justify-center w-4 h-4 rounded-full -left-[9px] top-2 md:top-4 ring-4 ring-white ${isAbsnt ? 'bg-red-500' : 'bg-[#1B6B3A] shadow-[0_0_0_4px_rgba(27,107,58,0.1)]'}`}></span>

                                                        {/* Date (Desktop Absolute, Mobile Inline) */}
                                                        <div className="md:absolute md:-left-[6.5rem] md:top-1.5 md:w-20 md:text-right flex items-baseline gap-1.5 md:block mb-2 md:mb-0">
                                                            <span className="text-[20px] md:text-[22px] font-black text-slate-900 leading-none">{d.getDate()}</span>
                                                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest md:block md:mt-1">{d.toLocaleString('id-ID', { month: 'short' })}</span>
                                                        </div>

                                                        {/* Report Card */}
                                                        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${attdConf.cls}`}>{attdConf.lbl}</span>
                                                                    {!isAbsnt && r.report_type && <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">{r.report_type}</span>}
                                                                    {!isAbsnt && r.kualitas && <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${QUAL[r.kualitas]?.cls || 'bg-slate-100 text-slate-600'}`}>{QUAL[r.kualitas]?.lbl || r.kualitas}</span>}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                                    <Users size={14} /> {r.teacher_name || 'Admin'}
                                                                </div>
                                                            </div>

                                                            {!isAbsnt && r.report_type && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/50">
                                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                                            <Target size={14} className="text-slate-400" /> Target Hafalan
                                                                        </div>
                                                                        <div className="text-[14px] font-bold text-slate-800">{r.hafalan_target || '—'}</div>
                                                                    </div>
                                                                    <div className="bg-green-50/50 p-3.5 rounded-xl border border-green-100/50">
                                                                        <div className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                                            <TrendingUp size={14} className="text-green-500" /> Capaian Aktual
                                                                        </div>
                                                                        <div className="text-[14px] font-bold text-green-800">{r.hafalan_achievement || '—'}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {r.teacher_notes && (
                                                                <div className="bg-blue-50/50 border-l-[3px] border-blue-500 p-4 rounded-r-xl rounded-bl-md text-[13px] font-semibold text-slate-600 leading-relaxed italic">
                                                                    <MessageCircle size={16} className="inline mr-2 text-blue-500 relative -top-0.5" />"{r.teacher_notes}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}

            {/* Empty States Global */}
            {!loadingC && children.length === 0 && !errorC && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <BookOpen size={36} className="text-slate-300" />
                    </div>
                    <div className="text-[18px] font-black text-slate-900">Belum Ada Anak Terdaftar</div>
                    <p className="text-[13px] font-bold text-slate-400 max-w-sm">Daftarkan anak Anda terlebih dahulu melalui menu "Ananda" untuk dapat melihat laporan perkembangannya di sini.</p>
                </div>
            )}
        </div>
    );
}
