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

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
.an-ph { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
.an-ph-title { font-size:22px; font-weight:900; color:var(--text); }
.an-ph-sub   { font-size:12px; color:var(--text3); margin-top:4px; }
.an-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; border-radius:11px; font-size:13px; font-weight:700; background:var(--green); color:#fff; box-shadow:0 4px 14px rgba(15,118,110,0.3); transition:all 0.18s; border:none; cursor:pointer; font-family:inherit; }
.an-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(15,118,110,0.4); }
.an-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
.an-sc { background:var(--card); border-radius:16px; padding:18px 20px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 1px 8px rgba(0,0,0,0.05); display:flex; align-items:center; gap:14px; }
.an-si { width:44px; height:44px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.an-sv { font-size:26px; font-weight:900; color:var(--text); line-height:1; }
.an-sl { font-size:11px; color:var(--text3); font-weight:600; margin-top:3px; }
.an-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:16px; }
.an-card { background:var(--card); border-radius:20px; overflow:hidden; border:1px solid rgba(0,0,0,0.05); box-shadow:0 1px 8px rgba(0,0,0,0.06); transition:all 0.2s; }
.an-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.1); transform:translateY(-2px); }
.an-top { background:linear-gradient(135deg,var(--green) 0%,#0d5c56 60%,var(--blue) 100%); padding:20px; display:flex; align-items:center; gap:14px; position:relative; overflow:hidden; }
.an-top::before { content:""; position:absolute; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.06); top:-40px; right:-30px; }
.an-av { width:52px; height:52px; border-radius:15px; flex-shrink:0; background:rgba(255,255,255,0.2); border:2px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900; color:#fff; box-shadow:0 4px 14px rgba(0,0,0,0.15); position:relative; z-index:1; }
.an-nm { font-size:16px; font-weight:800; color:#fff; position:relative; z-index:1; }
.an-mt { font-size:11px; color:rgba(255,255,255,0.65); margin-top:3px; }
.an-badge { margin-left:auto; flex-shrink:0; padding:4px 10px; border-radius:99px; font-size:10px; font-weight:800; position:relative; z-index:1; }
.an-active   { background:rgba(74,222,128,0.2);  color:#4ade80; border:1px solid rgba(74,222,128,0.3); }
.an-pending  { background:rgba(251,191,36,0.2);  color:#fbbf24; border:1px solid rgba(251,191,36,0.3); }
.an-inactive { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.2); }
.an-body { padding:16px 20px; display:flex; flex-direction:column; gap:10px; }
.an-prog { display:flex; align-items:center; gap:7px; padding:8px 12px; border-radius:10px; background:rgba(15,118,110,0.06); border:1px solid rgba(15,118,110,0.12); }
.an-pn { font-size:12.5px; font-weight:700; color:var(--green); }
.an-ir { display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--text2); }
.an-ir svg { color:var(--text3); flex-shrink:0; }
.an-il { font-weight:600; }
.an-foot { padding:12px 20px; border-top:1px solid rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:space-between; gap:8px; }
.an-bukti { display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:700; color:var(--blue); padding:5px 10px; border-radius:8px; background:rgba(37,99,235,0.07); border:1px solid rgba(37,99,235,0.15); text-decoration:none; transition:all 0.18s; }
.an-bukti:hover { background:rgba(37,99,235,0.13); }
.an-empty { background:var(--card); border-radius:20px; padding:60px 40px; text-align:center; border:1px solid rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; gap:12px; }
.an-ei { width:80px; height:80px; border-radius:24px; background:rgba(15,118,110,0.08); border:1px solid rgba(15,118,110,0.12); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
.an-et { font-size:18px; font-weight:800; color:var(--text); }
.an-ed { font-size:13px; color:var(--text3); max-width:340px; line-height:1.6; }
@media (max-width:900px) { .an-stats { grid-template-columns:1fr 1fr; } .an-grid { grid-template-columns:1fr; } }
`;

const STATUS_CONFIG = {
    active:   { label:'Aktif',       cls:'an-active',   icon:<CheckCircle2 size={11}/> },
    pending:  { label:'Menunggu',    cls:'an-pending',  icon:<Clock size={11}/>        },
    inactive: { label:'Tidak Aktif', cls:'an-inactive', icon:<XCircle size={11}/>     },
};

const fmtDate = (d: string|null) => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '—';
const inits   = (n: string)      => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function AnakPage({ anakList }: Props) {
    const activeCount  = anakList.filter(c => c.enrollment_status === 'active').length;
    const pendingCount = anakList.filter(c => c.enrollment_status === 'pending').length;

    return (
        <>
            <style>{CSS}</style>

            <div className="an-ph">
                <div>
                    <div className="an-ph-title">Anak Saya</div>
                    <div className="an-ph-sub">
                        {anakList.length > 0
                            ? `${anakList.length} anak terdaftar · ${activeCount} aktif · ${pendingCount} menunggu`
                            : 'Belum ada anak yang didaftarkan'}
                    </div>
                </div>
                <button className="an-btn" onClick={() => router.visit(route('parents.daftar'))}>
                    <Plus size={15}/> Daftarkan Anak
                </button>
            </div>

            {anakList.length > 0 && (
                <div className="an-stats">
                    {[
                        { icon:Baby,         bg:'rgba(15,118,110,0.1)',  c:'var(--green)',   v:anakList.length,  l:'Total Anak'          },
                        { icon:CheckCircle2, bg:'rgba(22,163,74,0.1)',   c:'#16a34a',      v:activeCount,      l:'Status Aktif'        },
                        { icon:Clock,        bg:'rgba(245,158,11,0.1)',  c:'#d97706',      v:pendingCount,     l:'Menunggu Konfirmasi' },
                    ].map((s,i) => (
                        <div key={i} className="an-sc">
                            <div className="an-si" style={{background:s.bg}}><s.icon size={20} color={s.c}/></div>
                            <div><div className="an-sv">{s.v}</div><div className="an-sl">{s.l}</div></div>
                        </div>
                    ))}
                </div>
            )}

            {anakList.length === 0 ? (
                <div className="an-empty">
                    <div className="an-ei"><Baby size={36} color="var(--green)"/></div>
                    <div className="an-et">Belum Ada Anak Terdaftar</div>
                    <p className="an-ed">Daftarkan anak Anda ke program QLC untuk mulai memantau perkembangan mereka.</p>
                    <button className="an-btn" onClick={() => router.visit(route('parents.daftar'))}>
                        <Plus size={15}/> Daftarkan Anak Sekarang
                    </button>
                </div>
            ) : (
                <div className="an-grid">
                    {anakList.map(child => {
                        const st = STATUS_CONFIG[child.enrollment_status] ?? STATUS_CONFIG.pending;
                        return (
                            <div key={child.id} className="an-card">
                                <div className="an-top">
                                    <div className="an-av">{inits(child.nama)}</div>
                                    <div style={{flex:1,position:'relative',zIndex:1}}>
                                        <div className="an-nm">{child.nama}</div>
                                        <div className="an-mt">{child.tempat_lahir}{child.usia ? ` · ${child.usia} tahun` : ''}</div>
                                    </div>
                                    <span className={`an-badge ${st.cls}`}>{st.label}</span>
                                </div>
                                <div className="an-body">
                                    <div className="an-prog">
                                        <GraduationCap size={14} color="var(--green)"/>
                                        {child.program_name
                                            ? <span className="an-pn">{child.program_name}</span>
                                            : <span style={{fontSize:12,color:'var(--text3)',fontStyle:'italic'}}>Program tidak ditemukan</span>}
                                    </div>
                                    <div className="an-ir"><Calendar size={13}/><span className="an-il">Tgl Lahir:</span><span>{fmtDate(child.tanggal_lahir)}</span></div>
                                    <div className="an-ir"><Clock size={13}/><span className="an-il">Didaftarkan:</span><span>{fmtDate(child.created_at)}</span></div>
                                </div>
                                <div className="an-foot">
                                    {child.bukti_pembayaran
                                        ? <a href={child.bukti_pembayaran} target="_blank" rel="noreferrer" className="an-bukti"><FileText size={12}/>Bukti Pembayaran<ExternalLink size={10}/></a>
                                        : <span style={{fontSize:11.5,color:'var(--text3)',fontStyle:'italic'}}>Belum ada bukti</span>}
                                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                                        {st.icon}
                                        <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>{st.label}</span>
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