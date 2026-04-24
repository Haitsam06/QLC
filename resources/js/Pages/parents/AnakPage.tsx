import { router } from '@inertiajs/react';
import {
    Plus, CheckCircle2, Clock, XCircle,
    GraduationCap, Calendar, FileText,
    ExternalLink, Baby,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type EnrollmentStatus = 'active' | 'inactive' | 'pending';

export interface Child {
    id: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    usia: number | null;
    program_id: string | null;
    program_name: string | null;
    enrollment_status: EnrollmentStatus;
    bukti_pembayaran: string | null;
    created_at: string | null;
}

interface Props { anakList: Child[]; }

const STATUS_CONFIG = {
    active:   { label:'Aktif',       cls:'bg-green-100 text-green-600 border-green-200', icon:<CheckCircle2 size={11}/> },
    pending:  { label:'Menunggu',    cls:'bg-amber-100 text-amber-600 border-amber-200',  icon:<Clock size={11}/>        },
    inactive: { label:'Tidak Aktif', cls:'bg-slate-100 text-slate-500 border-slate-200', icon:<XCircle size={11}/>     },
};

const fmtDate = (d: string|null) => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '—';
const inits   = (n: string)      => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function AnakPage({ anakList }: Props) {
    const activeCount  = anakList.filter(c => c.enrollment_status === 'active').length;
    const pendingCount = anakList.filter(c => c.enrollment_status === 'pending').length;

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-end flex-wrap gap-3 mb-5">
                <div>
                    <div className="text-[22px] font-black text-slate-900">Anak Saya</div>
                    <div className="text-[12px] text-slate-500 mt-1">
                        {anakList.length > 0
                            ? `${anakList.length} anak terdaftar · ${activeCount} aktif · ${pendingCount} menunggu`
                            : 'Belum ada anak yang didaftarkan'}
                    </div>
                </div>
                <button 
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px]" 
                    onClick={() => router.visit(route('parents.daftar'))}
                >
                    <Plus size={15}/> Daftarkan Anak
                </button>
            </div>

            {/* Stats */}
            {anakList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {[
                        { icon:Baby,         bg:'bg-teal-50',    c:'text-teal-600',  v:anakList.length,  l:'Total Anak'          },
                        { icon:CheckCircle2, bg:'bg-green-50',   c:'text-green-600', v:activeCount,      l:'Status Aktif'        },
                        { icon:Clock,        bg:'bg-amber-50',   c:'text-amber-600', v:pendingCount,     l:'Menunggu Konfirmasi' },
                    ].map((s,i) => (
                        <div key={i} className="bg-white rounded-2xl p-[18px_20px] border border-slate-100 shadow-sm flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center ${s.bg} ${s.c}`}>
                                <s.icon size={20} />
                            </div>
                            <div>
                                <div className="text-[26px] font-black text-slate-900 leading-none">{s.v}</div>
                                <div className="text-[11px] text-slate-500 font-semibold mt-1">{s.l}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List Anak */}
            {anakList.length === 0 ? (
                <div className="bg-white rounded-3xl p-[60px_40px] text-center border border-slate-100 flex flex-col items-center gap-3 shadow-sm">
                    <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-1">
                        <Baby size={36} className="text-teal-600"/>
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900">Belum Ada Anak Terdaftar</div>
                    <p className="text-[13px] text-slate-500 max-w-[340px] leading-relaxed">
                        Daftarkan anak Anda ke program QLC untuk mulai memantau perkembangan mereka.
                    </p>
                    <button 
                        className="mt-2 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-md" 
                        onClick={() => router.visit(route('parents.daftar'))}
                    >
                        <Plus size={15}/> Daftarkan Anak Sekarang
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {anakList.map(child => {
                        const st = STATUS_CONFIG[child.enrollment_status] ?? STATUS_CONFIG.pending;
                        return (
                            <div key={child.id} className="bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                {/* Card Header */}
                                <div className="bg-gradient-to-br from-teal-700 via-[#0d5c56] to-blue-600 p-5 flex items-center gap-3.5 relative overflow-hidden">
                                    <div className="absolute w-[120px] h-[120px] rounded-full bg-white/10 -top-[40px] -right-[30px]" />
                                    
                                    <div className="w-[52px] h-[52px] rounded-2xl shrink-0 bg-white/20 border-2 border-white/30 flex items-center justify-center text-[20px] font-black text-white shadow-md relative z-10">
                                        {inits(child.nama)}
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="text-[16px] font-extrabold text-white leading-tight">{child.nama}</div>
                                        <div className="text-[11px] text-white/70 mt-1">{child.tempat_lahir}{child.usia ? ` · ${child.usia} tahun` : ''}</div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border relative z-10 ${st.cls}`}>
                                        {st.label}
                                    </span>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-4 flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100">
                                        <GraduationCap size={14} className="text-teal-600"/>
                                        {child.program_name
                                            ? <span className="text-[12.5px] font-bold text-teal-700">{child.program_name}</span>
                                            : <span className="text-[12px] text-slate-400 italic">Program tidak ditemukan</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[12.5px] text-slate-600 mt-1">
                                        <Calendar size={13} className="text-slate-400 shrink-0"/>
                                        <span className="font-semibold text-slate-700">Tgl Lahir:</span>
                                        <span>{fmtDate(child.tanggal_lahir)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[12.5px] text-slate-600">
                                        <Clock size={13} className="text-slate-400 shrink-0"/>
                                        <span className="font-semibold text-slate-700">Didaftarkan:</span>
                                        <span>{fmtDate(child.created_at)}</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-3.5 border-t border-slate-50 flex items-center justify-between gap-2 bg-slate-50/50">
                                    {child.bukti_pembayaran ? (
                                        <a href={child.bukti_pembayaran} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11.5px] font-bold text-blue-600 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                                            <FileText size={12}/> Bukti Pembayaran <ExternalLink size={10}/>
                                        </a>
                                    ) : (
                                        <span className="text-[11.5px] text-slate-400 italic">Belum ada bukti</span>
                                    )}
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                        {st.icon} {st.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}