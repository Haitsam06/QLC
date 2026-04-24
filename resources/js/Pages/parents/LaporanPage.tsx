import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle2, Clock, XCircle, GraduationCap, Calendar,
    FileText, Star, Target, TrendingUp, AlertTriangle,
    MessageCircle, Loader2, RefreshCw, BookOpen, Users,
} from 'lucide-react';

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

const ATTD: Record<string,{lbl:string;cls:string}> = {
    hadir:{lbl:'Hadir',cls:'bg-green-100 text-green-600'}, 
    izin:{lbl:'Izin',cls:'bg-amber-100 text-amber-600'},
    sakit:{lbl:'Sakit',cls:'bg-sky-100 text-sky-600'}, 
    alpha:{lbl:'Alpha',cls:'bg-red-100 text-red-600'},
};
const QUAL: Record<string,string> = {
    sangat_lancar:'Sangat Lancar', lancar:'Lancar', mengulang:'Perlu Mengulang',
};

export default function LaporanPage() {
    const [children,      setChildren]      = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>('');
    const [reports,       setReports]       = useState<ProgressReport[]>([]);
    const [loadingC,  setLoadingC]  = useState(true);
    const [loadingR,  setLoadingR]  = useState(false);
    const [errorC,    setErrorC]    = useState<string|null>(null);
    const [errorR,    setErrorR]    = useState<string|null>(null);

    useEffect(() => {
        setLoadingC(true); setErrorC(null);
        axios.get<Child[]>('/api/parent/children')
            .then(res => { setChildren(res.data); if (res.data.length > 0) setSelectedChild(res.data[0].id); })
            .catch(() => setErrorC('Gagal memuat data anak.'))
            .finally(() => setLoadingC(false));
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        setLoadingR(true); setErrorR(null); setReports([]);
        axios.get<ProgressReport[]>(`/api/parent/children/${selectedChild}/reports`)
            .then(res => setReports(res.data))
            .catch(() => setErrorR('Gagal memuat laporan.'))
            .finally(() => setLoadingR(false));
    }, [selectedChild]);

    const totalHadir        = reports.filter(r => r.attendance === 'hadir').length;
    const totalSangatLancar = reports.filter(r => r.kualitas   === 'sangat_lancar').length;

    return (
        <>
            <div className="mb-5">
                <div className="text-[22px] font-black text-slate-900">Laporan Perkembangan</div>
                <div className="text-[12px] text-slate-500 mt-1">Pantau mutabaah harian dan pencapaian setoran anak Anda.</div>
            </div>

            {errorC && (
                <div className="flex items-center justify-between gap-2 p-3.5 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold">
                    <div className="flex items-center gap-2"><AlertTriangle size={16}/> {errorC}</div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors" onClick={() => window.location.reload()}>
                        <RefreshCw size={13}/> Refresh
                    </button>
                </div>
            )}

            {loadingC && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                    <Loader2 size={32} className="animate-spin text-teal-600"/>
                    <span className="text-[14px] font-bold">Memuat data...</span>
                </div>
            )}

            {!loadingC && children.length > 0 && (
                <div className="flex gap-2 overflow-x-auto w-fit max-w-full bg-white/60 backdrop-blur-md p-1.5 border border-slate-200 rounded-2xl mb-5 shadow-sm scrollbar-hide">
                    {children.map(child => {
                        const isLocked = child.enrollment_status !== 'active';
                        const isActive = selectedChild === child.id;
                        return (
                            <button key={child.id}
                                className={`flex items-center gap-3 pr-4 pl-2 py-2 rounded-xl transition-all shrink-0 ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                                onClick={() => setSelectedChild(child.id)}
                                style={{opacity: isLocked ? 0.75 : 1}}>
                                
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-extrabold transition-all ${isActive ? 'bg-gradient-to-br from-teal-700 to-blue-600 text-white shadow-md' : 'bg-teal-50 text-teal-700'}`}>
                                    {child.nama.charAt(0)}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className={`text-[13.5px] transition-colors ${isActive ? 'font-extrabold text-slate-900' : 'font-bold text-slate-600'}`}>{child.nama}</span>
                                    <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{child.program_name}</span>
                                    {child.enrollment_status === 'pending'  && <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">⏳ Menunggu Verifikasi</span>}
                                    {child.enrollment_status === 'inactive' && <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">⛔ Tidak Aktif</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {!loadingC && children.length > 0 && (() => {
                const child    = children.find(c => c.id === selectedChild);
                const isLocked = child?.enrollment_status !== 'active';

                return (
                    <>
                        {isLocked && (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[20px] p-[48px_20px] flex flex-col items-center text-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[24px] ${child?.enrollment_status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                    {child?.enrollment_status === 'pending' ? '⏳' : '⛔'}
                                </div>
                                <h3 className="text-[17px] font-extrabold text-slate-900">
                                    {child?.enrollment_status === 'pending' ? 'Menunggu Verifikasi Admin' : 'Akun Tidak Aktif'}
                                </h3>
                                <p className="text-[13px] text-slate-500 max-w-[340px] leading-relaxed">
                                    {child?.enrollment_status === 'pending'
                                        ? 'Laporan akan tersedia setelah admin mengaktifkan akun anak Anda.'
                                        : 'Akun anak Anda tidak aktif. Hubungi admin untuk informasi lebih lanjut.'}
                                </p>
                            </div>
                        )}

                        {!isLocked && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                    {icon:FileText,   bg:'bg-blue-50',  c:'text-blue-600', v:loadingR?'—':reports.length,        l:'Total Laporan'   },
                                    {icon:CheckCircle2,bg:'bg-green-50', c:'text-green-600',  v:loadingR?'—':totalHadir,             l:'Total Hadir'     },
                                    {icon:Star,        bg:'bg-amber-50',c:'text-amber-500',  v:loadingR?'—':totalSangatLancar,      l:'Sangat Lancar'   },
                                ].map((s,i) => (
                                    <div key={i} className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                                        <div className={`w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center ${s.bg} ${s.c}`}><s.icon size={24} /></div>
                                        <div><div className="text-[28px] font-black text-slate-900 leading-none">{s.v}</div><div className="text-[12px] font-semibold text-slate-500 mt-1">{s.l}</div></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLocked && (
                            <div className="bg-white rounded-[24px] p-5 md:p-8 border border-slate-100 shadow-sm">
                                <div className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide mb-6 flex items-center gap-2"><Calendar size={15}/> Riwayat Setoran</div>

                                {loadingR && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                                        <Loader2 size={28} className="animate-spin text-teal-600"/>
                                        <span className="text-[13px] font-bold">Memuat laporan...</span>
                                    </div>
                                )}
                                {!loadingR && errorR && (
                                    <div className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold">
                                        <div className="flex items-center gap-2"><AlertTriangle size={16}/> {errorR}</div>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors" onClick={() => setSelectedChild(id => id)}>
                                            <RefreshCw size={13}/> Coba Lagi
                                        </button>
                                    </div>
                                )}
                                {!loadingR && !errorR && reports.length === 0 && (
                                    <div className="flex flex-col items-center text-center py-12 gap-3">
                                        <BookOpen size={48} className="text-slate-200"/>
                                        <div className="text-[15px] font-extrabold text-slate-900">Belum Ada Laporan</div>
                                        <p className="text-[13px] text-slate-500">Anak ini belum memiliki riwayat setoran atau absensi.</p>
                                    </div>
                                )}

                                {!loadingR && !errorR && reports.map((r, index) => {
                                    const d       = new Date(r.date);
                                    const isAbsnt = ['izin','sakit','alpha'].includes(r.attendance);
                                    return (
                                        <div key={r.id} className="flex flex-col md:flex-row gap-4 md:gap-6 relative pb-8 last:pb-0">
                                            {/* Garis vertikal timeline */}
                                            {index !== reports.length - 1 && <div className="hidden md:block absolute left-[104px] top-9 bottom-[-8px] w-0.5 bg-slate-100 z-0" />}
                                            
                                            <div className="md:w20 shrink-0 md:text-right pt-1.5 flex md:flex-col items-baseline md:items-end gap-2 md:gap-0.5">
                                                <div className="text-[20px] font-black text-slate-900 leading-none">{d.getDate()}</div>
                                                <div className="text-[12px] font-bold text-slate-400 uppercase">{d.toLocaleString('id-ID',{month:'short'})}</div>
                                            </div>
                                            
                                            <div className={`hidden md:block w-3.5 h-3.5 rounded-full shrink-0 border-[3px] mt-2.5 relative z-10 shadow-[0_0_0_4px_white] ${isAbsnt ? 'bg-white border-red-500' : 'bg-white border-teal-600'}`} />
                                            
                                            <div className="flex-1 bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${ATTD[r.attendance]?.cls}`}>{ATTD[r.attendance]?.lbl}</span>
                                                        {r.report_type && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-purple-100 text-purple-600">{r.report_type}</span>}
                                                        {r.kualitas    && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-pink-100 text-pink-600">{QUAL[r.kualitas]}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400"><Users size={13}/> {r.teacher_name || 'Admin'}</div>
                                                </div>
                                                {!isAbsnt && r.report_type && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                        <div className="bg-slate-50 p-3 rounded-xl">
                                                            <div className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Target size={12}/> Target Hafalan</div>
                                                            <div className="text-[14px] font-bold text-slate-900">{r.hafalan_target || '—'}</div>
                                                        </div>
                                                        <div className="bg-green-50/50 p-3 rounded-xl">
                                                            <div className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingUp size={12}/> Capaian Aktual</div>
                                                            <div className="text-[14px] font-bold text-green-600">{r.hafalan_achievement || '—'}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {r.teacher_notes && (
                                                    <div className="bg-blue-50/50 border-l-[3px] border-blue-500 p-[12px_16px] rounded-[8px_12px_12px_8px] text-[13px] text-slate-700 font-medium leading-relaxed">
                                                        <MessageCircle size={14} className="inline mr-1.5 relative -top-0.5 text-blue-500"/>
                                                        {r.teacher_notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                );
            })()}

            {!loadingC && children.length === 0 && !errorC && (
                <div className="flex flex-col items-center text-center py-16 gap-3">
                    <BookOpen size={48} className="text-slate-200"/>
                    <div className="text-[15px] font-extrabold text-slate-900">Belum Ada Anak Terdaftar</div>
                    <p className="text-[13px] text-slate-500">Daftarkan anak terlebih dahulu untuk melihat laporan.</p>
                </div>
            )}
        </>
    );
}