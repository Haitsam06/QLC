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

/* ═══════════════════════════════════════════════════════════
   STYLES — hanya konten, tanpa root/topnav
═══════════════════════════════════════════════════════════ */
const CSS = `
/* ── Child Selector Tabs ── */
.lp-tabs {
  display:flex; gap:8px; overflow-x:auto;
  background:rgba(255,255,255,0.45); backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,0.8);
  border-radius:20px; padding:6px; width:fit-content; max-width:100%;
}
.lp-tab {
  display:flex; align-items:center; gap:12px;
  padding:8px 18px 8px 8px; border-radius:14px;
  background:transparent; cursor:pointer;
  transition:all 0.25s cubic-bezier(0.25,1,0.5,1);
  white-space:nowrap; flex-shrink:0; border:none; font-family:inherit;
}
.lp-tab:hover:not(.lp-tab--active) { background:rgba(255,255,255,0.6); }
.lp-tab--active { background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
.lp-av {
  width:36px; height:36px; border-radius:10px;
  background:rgba(15,118,110,0.08); color:var(--green);
  display:flex; align-items:center; justify-content:center;
  font-size:14px; font-weight:800; transition:all 0.25s;
}
.lp-tab--active .lp-av { background:linear-gradient(135deg,var(--green),var(--blue)); color:#fff; box-shadow:0 4px 10px rgba(15,118,110,0.25); }
.lp-info { display:flex; flex-direction:column; align-items:flex-start; }
.lp-name { font-size:13.5px; font-weight:700; color:var(--text2); transition:color 0.2s; }
.lp-tab--active .lp-name { color:var(--text); font-weight:800; }
.lp-prog { font-size:11px; font-weight:600; color:var(--text3); margin-top:1px; }
.lp-st { display:inline-flex; align-items:center; gap:4px; margin-top:3px; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:700; }
.lp-st-pending  { background:rgba(234,179,8,0.12); color:#b45309; }
.lp-st-inactive { background:rgba(220,38,38,0.08); color:#dc2626; }

/* Lock overlay */
.lp-lock {
  text-align:center; padding:48px 20px;
  display:flex; flex-direction:column; align-items:center; gap:12px;
  background:rgba(248,250,252,0.8); border-radius:16px;
  border:1.5px dashed rgba(0,0,0,0.1);
}
.lp-lock-icon { width:56px; height:56px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:24px; }
.lp-lock-pending  { background:rgba(234,179,8,0.12); }
.lp-lock-inactive { background:rgba(220,38,38,0.08); }

/* Stats */
.lp-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.lp-sc { background:var(--card); border-radius:20px; padding:20px; border:1px solid rgba(0,0,0,0.04); box-shadow:0 4px 16px rgba(0,0,0,0.03); display:flex; align-items:center; gap:16px; }
.lp-si { width:52px; height:52px; border-radius:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.lp-sv { font-size:28px; font-weight:900; color:var(--text); line-height:1; }
.lp-sl { font-size:12px; color:var(--text3); font-weight:600; margin-top:4px; }

/* Timeline */
.lp-tl { background:var(--card); border-radius:24px; padding:32px; border:1px solid rgba(0,0,0,0.04); box-shadow:0 4px 24px rgba(0,0,0,0.03); }
.lp-sec-title { font-size:13px; font-weight:800; color:var(--text2); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:24px; display:flex; align-items:center; gap:8px; }
.lp-item { display:flex; gap:24px; position:relative; padding-bottom:32px; }
.lp-item:last-child { padding-bottom:0; }
.lp-item::before { content:""; position:absolute; left:104px; top:36px; bottom:-8px; width:2px; background:rgba(0,0,0,0.05); }
.lp-item:last-child::before { display:none; }
.lp-date { width:80px; flex-shrink:0; text-align:right; padding-top:6px; }
.lp-day   { font-size:20px; font-weight:900; color:var(--text); line-height:1; }
.lp-month { font-size:12px; font-weight:700; color:var(--text3); text-transform:uppercase; margin-top:2px; }
.lp-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; background:#fff; border:3px solid var(--green); position:relative; z-index:2; margin-top:10px; box-shadow:0 0 0 4px rgba(15,118,110,0.1); }
.lp-dot-absent { border-color:var(--red); box-shadow:0 0 0 4px rgba(220,38,38,0.1); }
.lp-content { flex:1; background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:20px; padding:20px; box-shadow:0 4px 16px rgba(0,0,0,0.02); transition:all 0.2s; }
.lp-content:hover { box-shadow:0 8px 24px rgba(0,0,0,0.06); transform:translateY(-2px); border-color:rgba(15,118,110,0.2); }
.lp-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.lp-teacher { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--text3); }
.lp-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
.lp-box { background:var(--bg); padding:12px 16px; border-radius:12px; }
.lp-box-lbl { font-size:10.5px; font-weight:800; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:flex; align-items:center; gap:4px; }
.lp-box-val { font-size:14px; font-weight:700; color:var(--text); }
.lp-box-ok  { background:rgba(22,163,74,0.06); }
.lp-box-ok .lp-box-val { color:#16a34a; }
.lp-notes { background:rgba(37,99,235,0.04); border-left:3px solid var(--blue); padding:12px 16px; border-radius:8px 12px 12px 8px; font-size:13px; color:var(--text2); line-height:1.6; font-weight:500; }

/* Badges */
.badge { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
.b-hadir { background:rgba(22,163,74,0.1);  color:#16a34a; }
.b-izin  { background:rgba(234,179,8,0.1);  color:#d97706; }
.b-sakit { background:rgba(56,189,248,0.1); color:#0284c7; }
.b-alpha { background:rgba(220,38,38,0.1);  color:#dc2626; }
.b-type  { background:rgba(139,92,246,0.1); color:#7c3aed; }
.b-qual  { background:rgba(244,114,182,0.1);color:#db2777; }

.lp-center { text-align:center; padding:60px 20px; display:flex; flex-direction:column; align-items:center; gap:12px; color:var(--text3); }
.lp-spin { animation:lp-spin 1s linear infinite; }
@keyframes lp-spin { to { transform:rotate(360deg); } }

.lp-err { display:flex; align-items:center; gap:10px; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.15); border-radius:14px; padding:14px 18px; color:var(--red); font-size:13px; font-weight:600; }
.lp-retry { margin-left:auto; display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:700; background:rgba(220,38,38,0.1); color:var(--red); transition:all 0.2s; border:none; cursor:pointer; font-family:inherit; }
.lp-retry:hover { background:rgba(220,38,38,0.18); }

.lp-ph { margin-bottom:20px; }
.lp-ph-title { font-size:22px; font-weight:900; color:var(--text); }
.lp-ph-sub   { font-size:12px; color:var(--text3); margin-top:4px; }

@media (max-width:768px) {
  .lp-stats { grid-template-columns:1fr; }
  .lp-item { flex-direction:column; gap:12px; padding-bottom:24px; }
  .lp-item::before { display:none; }
  .lp-date { text-align:left; display:flex; align-items:baseline; gap:6px; }
  .lp-dot  { display:none; }
  .lp-grid { grid-template-columns:1fr; }
  .lp-tl   { padding:20px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const ATTD: Record<string,{lbl:string;cls:string}> = {
    hadir:{lbl:'Hadir',cls:'b-hadir'}, izin:{lbl:'Izin',cls:'b-izin'},
    sakit:{lbl:'Sakit',cls:'b-sakit'}, alpha:{lbl:'Alpha',cls:'b-alpha'},
};
const QUAL: Record<string,string> = {
    sangat_lancar:'Sangat Lancar', lancar:'Lancar', mengulang:'Perlu Mengulang',
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
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
            <style>{CSS}</style>

            <div className="lp-ph">
                <div className="lp-ph-title">Laporan Perkembangan</div>
                <div className="lp-ph-sub">Pantau mutabaah harian dan pencapaian setoran anak Anda.</div>
            </div>

            {errorC && (
                <div className="lp-err">
                    <AlertTriangle size={16}/> {errorC}
                    <button className="lp-retry" onClick={() => window.location.reload()}><RefreshCw size={13}/> Refresh</button>
                </div>
            )}

            {loadingC && (
                <div className="lp-center">
                    <Loader2 size={32} className="lp-spin" style={{color:'var(--green)'}}/>
                    <span style={{fontSize:14,fontWeight:600}}>Memuat data...</span>
                </div>
            )}

            {!loadingC && children.length > 0 && (
                <div className="lp-tabs">
                    {children.map(child => {
                        const locked = child.enrollment_status !== 'active';
                        return (
                            <button key={child.id}
                                className={`lp-tab ${selectedChild === child.id ? 'lp-tab--active' : ''}`}
                                onClick={() => setSelectedChild(child.id)}
                                style={{opacity: locked ? 0.75 : 1}}>
                                <div className="lp-av">{child.nama.charAt(0)}</div>
                                <div className="lp-info">
                                    <span className="lp-name">{child.nama}</span>
                                    <span className="lp-prog">{child.program_name}</span>
                                    {child.enrollment_status === 'pending'  && <span className="lp-st lp-st-pending">⏳ Menunggu Verifikasi</span>}
                                    {child.enrollment_status === 'inactive' && <span className="lp-st lp-st-inactive">⛔ Tidak Aktif</span>}
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
                            <div className="lp-lock">
                                <div className={`lp-lock-icon ${child?.enrollment_status === 'pending' ? 'lp-lock-pending' : 'lp-lock-inactive'}`}>
                                    {child?.enrollment_status === 'pending' ? '⏳' : '⛔'}
                                </div>
                                <h3 style={{fontSize:17,fontWeight:800,color:'var(--text)'}}>
                                    {child?.enrollment_status === 'pending' ? 'Menunggu Verifikasi Admin' : 'Akun Tidak Aktif'}
                                </h3>
                                <p style={{fontSize:13,color:'var(--text3)',maxWidth:340,lineHeight:1.6}}>
                                    {child?.enrollment_status === 'pending'
                                        ? 'Laporan akan tersedia setelah admin mengaktifkan akun anak Anda.'
                                        : 'Akun anak Anda tidak aktif. Hubungi admin untuk informasi lebih lanjut.'}
                                </p>
                            </div>
                        )}

                        {!isLocked && (
                            <div className="lp-stats">
                                {[
                                    {icon:FileText,   bg:'rgba(37,99,235,0.1)',  c:'var(--blue)', v:loadingR?'—':reports.length,        l:'Total Laporan'   },
                                    {icon:CheckCircle2,bg:'rgba(22,163,74,0.1)', c:'#16a34a',     v:loadingR?'—':totalHadir,             l:'Total Hadir'     },
                                    {icon:Star,        bg:'rgba(212,160,23,0.1)',c:'var(--gold)', v:loadingR?'—':totalSangatLancar,      l:'Sangat Lancar'   },
                                ].map((s,i) => (
                                    <div key={i} className="lp-sc">
                                        <div className="lp-si" style={{background:s.bg}}><s.icon size={24} color={s.c}/></div>
                                        <div><div className="lp-sv">{s.v}</div><div className="lp-sl">{s.l}</div></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLocked && (
                            <div className="lp-tl">
                                <div className="lp-sec-title"><Calendar size={15}/> Riwayat Setoran</div>

                                {loadingR && (
                                    <div className="lp-center">
                                        <Loader2 size={28} className="lp-spin" style={{color:'var(--green)'}}/>
                                        <span style={{fontSize:13,fontWeight:600,color:'var(--text3)'}}>Memuat laporan...</span>
                                    </div>
                                )}
                                {!loadingR && errorR && (
                                    <div className="lp-err">
                                        <AlertTriangle size={16}/> {errorR}
                                        <button className="lp-retry" onClick={() => setSelectedChild(id => id)}>
                                            <RefreshCw size={13}/> Coba Lagi
                                        </button>
                                    </div>
                                )}
                                {!loadingR && !errorR && reports.length === 0 && (
                                    <div className="lp-center">
                                        <BookOpen size={48} style={{opacity:0.3}}/>
                                        <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Belum Ada Laporan</div>
                                        <p style={{fontSize:13,color:'var(--text3)'}}>Anak ini belum memiliki riwayat setoran atau absensi.</p>
                                    </div>
                                )}

                                {!loadingR && !errorR && reports.map(r => {
                                    const d       = new Date(r.date);
                                    const isAbsnt = ['izin','sakit','alpha'].includes(r.attendance);
                                    return (
                                        <div key={r.id} className="lp-item">
                                            <div className="lp-date">
                                                <div className="lp-day">{d.getDate()}</div>
                                                <div className="lp-month">{d.toLocaleString('id-ID',{month:'short'})}</div>
                                            </div>
                                            <div className={`lp-dot ${isAbsnt?'lp-dot-absent':''}`}/>
                                            <div className="lp-content">
                                                <div className="lp-head">
                                                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                                                        <span className={`badge ${ATTD[r.attendance]?.cls}`}>{ATTD[r.attendance]?.lbl}</span>
                                                        {r.report_type && <span className="badge b-type">{r.report_type}</span>}
                                                        {r.kualitas    && <span className="badge b-qual">{QUAL[r.kualitas]}</span>}
                                                    </div>
                                                    <div className="lp-teacher"><Users size={13}/> {r.teacher_name || 'Admin'}</div>
                                                </div>
                                                {!isAbsnt && r.report_type && (
                                                    <div className="lp-grid">
                                                        <div className="lp-box">
                                                            <div className="lp-box-lbl"><Target size={12}/> Target Hafalan</div>
                                                            <div className="lp-box-val">{r.hafalan_target || '—'}</div>
                                                        </div>
                                                        <div className="lp-box lp-box-ok">
                                                            <div className="lp-box-lbl"><TrendingUp size={12}/> Capaian Aktual</div>
                                                            <div className="lp-box-val">{r.hafalan_achievement || '—'}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {r.teacher_notes && (
                                                    <div className="lp-notes">
                                                        <MessageCircle size={14} style={{display:'inline',marginRight:6,position:'relative',top:-2}}/>
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
                <div className="lp-center">
                    <BookOpen size={48} style={{opacity:0.3}}/>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Belum Ada Anak Terdaftar</div>
                    <p style={{fontSize:13,color:'var(--text3)'}}>Daftarkan anak terlebih dahulu untuk melihat laporan.</p>
                </div>
            )}
        </>
    );
}