import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
  LayoutDashboard, BookOpen, Settings, LogOut,
  Bell, Users, BookCheck, TrendingUp,
  CheckCircle2, FileText, GraduationCap,
  MessageCircle, Calendar, Menu, X
} from "lucide-react";

// ── Sub-pages ────────────────────────────────────────────────
import AnakPage, { type Child } from "./AnakPage";
import LaporanPage from "./LaporanPage";
import PengaturanPage, { type ParentProfile } from "./PengaturanPage";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface ChildStat {
  attendance: { hadir: number; izin: number; sakit: number; alpha: number; total: number; };
  quality:    { sangat_lancar: number; lancar: number; mengulang: number; total: number; };
}

interface DashboardProps {
  anakList: Child[];
  stats: { total_anak: number; total_laporan: number; total_hadir: number; };
  bulan: string;
  children_stats: Record<string, ChildStat>;
  recent_reports: {
    id: number; student_id: string; date: string; report_type: string; kualitas: string;
    teacher_name: string; teacher_notes: string;
  }[];
  first_child: { nama: string; program_name: string | null } | null;
  profile: ParentProfile | null;
}

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button{cursor:pointer;font-family:inherit;border:none;background:none;}
:root{--green:#0f766e;--green-mid:#14b8a6;--green-light:#ccfbf1;--blue:#2563eb;--gold:#d4a017;--red:#dc2626;--orange:#d97706;--sky:#0284c7;--purple:#7c3aed;--bg:#f1f5f9;--card:#ffffff;--text:#0f172a;--text2:#475569;--text3:#94a3b8;font-family:'Plus Jakarta Sans',sans-serif;}
.root{min-height:100vh;background:var(--bg);}
.topnav{position:sticky;top:0;z-index:100;height:64px;background:#fff;border-bottom:1px solid rgba(15,118,110,0.08);box-shadow:0 1px 12px rgba(15,118,110,0.06);display:flex;align-items:center;padding:0 28px;}
.topnav__hamburger{display:none; margin-right:12px; color:var(--text); transition:all 0.2s;}
.topnav__brand{display:flex;align-items:center;gap:10px;margin-right:36px;flex-shrink:0;}
.topnav__brand-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,118,110,0.3);}
.topnav__brand-name{font-weight:800;font-size:15px;color:var(--text);}
.topnav__brand-sub{font-size:9.5px;color:var(--text3);margin-top:1px;}
.topnav__nav{display:flex;align-items:center;gap:4px;}
.topnav__nav-item{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:10px;font-size:13px;font-weight:600;color:var(--text2);transition:all 0.18s;white-space:nowrap;}
.topnav__nav-item:hover{background:rgba(15,118,110,0.06);color:var(--green);}
.topnav__nav-item--active{background:var(--green);color:#fff;box-shadow:0 4px 14px rgba(15,118,110,0.3);}
.topnav__nav-item--active:hover{background:var(--green);color:#fff;}
.topnav__gap{flex:1;}
.topnav__actions{display:flex;align-items:center;gap:8px;}
.topnav__icon-btn{width:36px;height:36px;border-radius:10px;background:rgba(15,118,110,0.06);border:1px solid rgba(15,118,110,0.1);display:flex;align-items:center;justify-content:center;color:var(--text2);transition:all 0.18s;}
.topnav__icon-btn:hover{background:rgba(15,118,110,0.12);color:var(--green);}
.topnav__profile{display:flex;align-items:center;gap:8px;padding:5px 5px 5px 10px;border-radius:12px;background:rgba(15,118,110,0.05);border:1px solid rgba(15,118,110,0.1);cursor:pointer;transition:all 0.18s;flex-shrink:0;}
.topnav__profile:hover{background:rgba(15,118,110,0.1);}
.av{border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;box-shadow:0 3px 10px rgba(15,118,110,0.28);flex-shrink:0;}
.av-sm{width:30px;height:30px;font-size:11px;}
.pname{font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;}
.prole{font-size:10px;color:var(--text3);}

/* ── Mobile Menu Overlay ── */
.mobile-nav-overlay{position:fixed;top:64px;left:0;right:0;bottom:0;background:var(--bg);z-index:90;display:flex;flex-direction:column;padding:20px;gap:12px;animation:slideDown 0.2s ease-out; overflow-y:auto;}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
.mobile-nav-item{display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:16px;font-size:15px;font-weight:700;color:var(--text2);background:var(--card);box-shadow:0 2px 8px rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.02); transition:all 0.2s;}
.mobile-nav-item--active{background:var(--green);color:#fff;box-shadow:0 4px 16px rgba(15,118,110,0.25);}

.page{max-width:1100px;margin:0 auto;padding:28px 28px 40px;display:flex;flex-direction:column;gap:20px;}
.ph{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;}
.ph-title{font-size:26px;font-weight:900;color:var(--text);line-height:1;}
.ph-sub{font-size:13px;color:var(--text3);margin-top:6px;}
.btn-primary{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border-radius:11px;font-size:12.5px;font-weight:700;background:var(--text);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,0.18);transition:all 0.18s;}
.btn-primary:hover{box-shadow:0 6px 20px rgba(0,0,0,0.25);transform:translateY(-1px);}

/* ── Child Selector Tabs ── */
.child-tabs-wrapper{width:100%;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;}
.child-tabs-wrapper::-webkit-scrollbar{display:none;}
.child-tabs{display:inline-flex;background:var(--card);padding:6px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.04);gap:4px;}
.child-tab{padding:10px 20px;border-radius:12px;font-size:13px;font-weight:700;color:var(--text2);transition:all 0.2s;white-space:nowrap;}
.child-tab:hover{background:rgba(15,118,110,0.05);color:var(--green);}
.child-tab--active{background:var(--green);color:#fff;box-shadow:0 4px 12px rgba(15,118,110,0.25);}

.hero{background:linear-gradient(135deg,var(--green) 0%,#0d5c56 50%,var(--blue) 100%);border-radius:22px;padding:28px 32px;display:flex;align-items:center;gap:24px;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(15,118,110,0.3);}
.hero::before{content:"";position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.05);top:-100px;right:-60px;}
.hero-left{display:flex;align-items:center;gap:20px;position:relative;z-index:1;}
.hero-emoji{width:68px;height:68px;border-radius:20px;font-size:32px;flex-shrink:0;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.28);display:flex;align-items:center;justify-content:center;}
.hero-eyebrow{font-size:10.5px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.8px;}
.hero-name{font-size:24px;font-weight:900;color:#fff;line-height:1.2;margin-top:3px;}
.hero-class{font-size:13px;color:rgba(255,255,255,0.8);margin-top:6px;display:flex;align-items:center;gap:6px;}

.stat-row{display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;}
.scard{background:var(--card);border-radius:18px;padding:20px 22px;box-shadow:0 1px 8px rgba(0,0,0,0.06);display:flex;align-items:center;gap:16px;border:1px solid rgba(0,0,0,0.04);}
.scard-icon{width:52px;height:52px;border-radius:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.scard-val{font-size:28px;font-weight:900;color:var(--text);line-height:1;}
.scard-lbl{font-size:12px;color:var(--text3);font-weight:600;margin-top:4px;}

.main-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.card{background:var(--card);border-radius:18px;padding:24px;box-shadow:0 1px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.04);}
.card-title{font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;}
.card-eyebrow{font-size:10.5px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.att-big{font-size:36px;font-weight:900;color:var(--text);line-height:1;}

.note-list{display:flex;flex-direction:column;gap:12px;}
.note-item{padding:16px;border-radius:14px;background:var(--bg);border:1px solid rgba(0,0,0,0.04);}
.note-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.note-teacher{font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px;}
.note-date{font-size:11px;color:var(--text3);font-weight:600;display:flex;align-items:center;gap:4px;}
.note-body{background:rgba(37,99,235,0.04);border-left:3px solid var(--blue);padding:12px 14px;border-radius:6px 10px 10px 6px;font-size:13px;color:var(--text2);line-height:1.5;font-weight:500;}

.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
.b-type{background:rgba(139,92,246,0.1);color:#7c3aed;}.b-qual{background:rgba(244,114,182,0.1);color:#db2777;}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;}

/* ── Tablet & Normal Mobile ── */
@media(max-width:900px){
  .main-row{grid-template-columns:1fr;}
}
@media(max-width:768px){
  .topnav__hamburger{display:block;}
  .topnav{padding:0 16px; gap:8px;}
  .topnav__brand{margin-right:0;}
  .topnav__brand-name, .topnav__brand-sub, .topnav__nav, .pname, .prole{display:none;}
  
  /* Hapus border/background profile di mobile */
  .topnav__profile{background:transparent; border:none; padding:0; gap:0;}
  .topnav__profile:hover{background:transparent;}
  
  .page{padding:20px 16px; gap:20px;}
  .ph{flex-direction:column; align-items:flex-start; gap:16px;}
  .btn-primary{width:100%;}
  .hero{padding:24px 20px;}
  .hero-emoji{width:56px; height:56px; font-size:28px;}
  .hero-name{font-size:20px;}
  .hero-left{gap:16px;}
  .card{padding:20px;}
}

/* ── Tiny Mobile (iPhone SE / Pixel 320px-375px) ── */
@media(max-width:400px){
  .stat-row{grid-template-columns:1fr;} /* Pastikan stack penuh */
  .hero{padding:20px 16px; align-items:flex-start;}
  .hero-left{flex-direction:column; align-items:flex-start; gap:12px;}
  .hero-name{font-size:18px;}
  .hero-emoji{width:48px; height:48px; font-size:24px;}
  
  .card{padding:16px;}
  .card-head{flex-direction:column; align-items:flex-start; gap:8px;}
  .att-big{font-size:28px;}
  .scard{padding:16px;}
  .scard-icon{width:44px; height:44px;}
  .scard-val{font-size:24px;}
  
  .child-tab{padding:8px 14px; font-size:12px;}
  .note-head{flex-direction:column; gap:8px;}
}
`;

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard'  },
  { icon: Users,           label: 'Anak Saya',  id: 'anak'       },
  { icon: BookCheck,       label: 'Laporan',    id: 'laporan'    },
  { icon: Settings,        label: 'Pengaturan', id: 'pengaturan' },
];

export default function ParentDashboard({ anakList, stats, bulan, children_stats, recent_reports, first_child, profile }: DashboardProps) {
  const user        = usePage<PageProps>().props.auth.user;
  const displayName = (user as any)?.name || (user as any)?.username || 'Wali Murid';
  const initials    = displayName.split(' ').filter(Boolean).slice(0,2).map((p:string)=>p[0]?.toUpperCase()).join('')||'W';

  const params    = new URLSearchParams(window.location.search);
  const activeTab = params.get('tab') || 'dashboard';

  // State untuk hamburger menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Anak aktif untuk selector
  const activeChildren = anakList.filter(c => c.enrollment_status === 'active');
  const [selectedChildId, setSelectedChildId] = useState<string>(activeChildren[0]?.id ?? '');

  // Cari object anak yang sedang dipilih saat ini
  const activeChild = activeChildren.find(c => c.id === selectedChildId) || activeChildren[0];

  const setActive = (tab: string) => {
    router.visit(route('parents.dashboard') + (tab !== 'dashboard' ? `?tab=${tab}` : ''), {
      preserveScroll: true,
      preserveState:  true,
      replace:        true,
    });
  };

  const handleLogout = () => router.post(route('logout'));

  return (
    <>
      <Head title="Dashboard" />
      <style>{CSS}</style>
      <div className="root">

        {/* ════ TOPNAV ════ */}
        <nav className="topnav">
          {/* Tombol Hamburger (Khusus Mobile) */}
          <button 
            className="topnav__hamburger" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="topnav__brand">
            <div className="topnav__brand-icon"><BookOpen size={18} color="#fff" strokeWidth={2.5}/></div>
            <div>
              <div className="topnav__brand-name">EduConnect</div>
              <div className="topnav__brand-sub">Parent Portal</div>
            </div>
          </div>
          
          {/* Navigasi Desktop */}
          <div className="topnav__nav">
            {navItems.map(({icon:Icon,label,id})=>(
              <button key={id} className={`topnav__nav-item ${activeTab===id?'topnav__nav-item--active':''}`} onClick={()=>setActive(id)}>
                <Icon size={15} strokeWidth={activeTab===id?2.5:1.8}/> {label}
              </button>
            ))}
          </div>

          <div className="topnav__gap"/>

          <div className="topnav__actions">
            <button className="topnav__icon-btn"><Bell size={16} strokeWidth={1.8}/></button>
            <button className="topnav__icon-btn" onClick={handleLogout} title="Keluar"><LogOut size={16} strokeWidth={1.8}/></button>
            <div className="topnav__profile">
              <div><div className="pname">{displayName}</div><div className="prole">Wali Murid</div></div>
              <div className="av av-sm">{initials}</div>
            </div>
          </div>
        </nav>

        {/* ════ MOBILE MENU OVERLAY ════ */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-overlay">
            {navItems.map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                className={`mobile-nav-item ${activeTab === id ? 'mobile-nav-item--active' : ''}`}
                onClick={() => {
                  setActive(id);
                  setIsMobileMenuOpen(false); // Tutup menu setelah klik
                }}
              >
                <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} /> {label}
              </button>
            ))}
          </div>
        )}

        {/* ════ CONTENT ════ */}
        <div className="page">
          {activeTab === 'anak'       ? <AnakPage anakList={anakList}/> :
           activeTab === 'laporan'    ? <LaporanPage/> :
           activeTab === 'pengaturan' ? <PengaturanPage profile={profile}/> :
          (
            <>
              {/* Header */}
              <div className="ph">
                <div>
                  <div className="ph-title">Selamat Datang, {displayName.split(' ')[0]}</div>
                  <div className="ph-sub">Pantau aktivitas dan perkembangan ananda di satu tempat.</div>
                </div>
                <button className="btn-primary" onClick={()=>setActive('laporan')}>
                  <TrendingUp size={14}/> Lihat Laporan Lengkap
                </button>
              </div>

              {/* Stats Global */}
              <div className="stat-row">
                {[
                  {icon:Users,        bg:'rgba(37,99,235,0.1)',  c:'var(--blue)',   v:stats.total_anak,    l:'Anak Terdaftar'       },
                  {icon:FileText,     bg:'rgba(139,92,246,0.1)', c:'var(--purple)', v:stats.total_laporan, l:'Total Laporan'        },
                  {icon:CheckCircle2, bg:'rgba(22,163,74,0.1)',  c:'#16a34a',       v:stats.total_hadir,   l:'Total Kehadiran'      },
                ].map((s,i)=>(
                  <div key={i} className="scard">
                    <div className="scard-icon" style={{background:s.bg,color:s.c}}><s.icon size={24}/></div>
                    <div><div className="scard-val">{s.v}</div><div className="scard-lbl">{s.l}</div></div>
                  </div>
                ))}
              </div>

              {/* Data Spesifik Anak */}
              {(() => {
                const sel  = children_stats[selectedChildId];
                const att  = sel?.attendance;
                const qual = sel?.quality;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Filter / Selector Anak */}
                    {activeChildren.length > 1 && (
                      <div className="child-tabs-wrapper">
                        <div className="child-tabs">
                          {activeChildren.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => setSelectedChildId(c.id)}
                              className={`child-tab ${selectedChildId === c.id ? 'child-tab--active' : ''}`}
                            >
                              {c.nama}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hero Dinamis (Akses Cepat -> Fokus Pantauan) */}
                    <div className="hero">
                      <div className="hero-left">
                        <div className="hero-emoji">👦</div>
                        <div>
                          <div className="hero-eyebrow">Fokus Pantauan Ananda</div>
                          <div className="hero-name">{activeChild ? activeChild.nama : 'Belum Ada Anak'}</div>
                          {activeChild?.program_name && (
                            <div className="hero-class"><GraduationCap size={15}/> Program: {activeChild.program_name}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chart Kehadiran & Kualitas */}
                    <div className="main-row">
                      <div className="card">
                        <div className="card-head">
                          <div><div className="card-eyebrow">Kehadiran Bulan Ini</div><div className="card-title">Rekap Absensi · {bulan}</div></div>
                          <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',background:'var(--bg)',padding:'4px 10px',borderRadius:8}}>{att?.total??0} sesi</div>
                        </div>
                        {!att||att.total===0 ? (
                          <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>{activeChildren.length===0?'Tidak ada anak aktif.':'Belum ada data kehadiran bulan ini.'}</p>
                        ) : (
                          <>
                            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:20}}>
                              <div className="att-big">{att.hadir}<span style={{fontSize:18,color:'var(--text3)',fontWeight:600}}>/{att.total}</span></div>
                              <div style={{fontSize:13,fontWeight:700,color:'#16a34a',background:'rgba(22,163,74,0.1)',padding:'4px 8px',borderRadius:6}}>
                                {Math.round((att.hadir/att.total)*100)}% Hadir
                              </div>
                            </div>
                            {[
                              {label:'Hadir',val:att.hadir,color:'#16a34a'},
                              {label:'Izin', val:att.izin, color:'var(--orange)'},
                              {label:'Sakit',val:att.sakit,color:'var(--sky)'},
                              {label:'Alpha',val:att.alpha,color:'var(--red)'},
                            ].map(s=>(
                              <div key={s.label} style={{marginBottom:12}}>
                                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                                    <span className="dot" style={{background:s.color}}/>
                                    <span style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>{s.label}</span>
                                  </div>
                                  <span style={{fontSize:13,fontWeight:800,color:s.color}}>{s.val} sesi</span>
                                </div>
                                <div style={{height:8,borderRadius:99,background:'var(--bg)',overflow:'hidden'}}>
                                  <div style={{height:'100%',borderRadius:99,background:s.color,width:`${(s.val/att.total)*100}%`,transition:'width 0.6s ease-out'}}/>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      
                      <div className="card">
                        <div className="card-head">
                          <div><div className="card-eyebrow">Distribusi Penilaian</div><div className="card-title">Kualitas Setoran · {bulan}</div></div>
                          <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',background:'var(--bg)',padding:'4px 10px',borderRadius:8}}>{qual?.total??0} setoran</div>
                        </div>
                        {!qual||qual.total===0 ? (
                          <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>{activeChildren.length===0?'Tidak ada anak aktif.':'Belum ada data setoran bulan ini.'}</p>
                        ) : (
                          <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:12}}>
                            {[
                              {label:'Sangat Lancar',  val:qual.sangat_lancar,color:'#16a34a',bg:'rgba(22,163,74,0.1)'},
                              {label:'Lancar',         val:qual.lancar,       color:'var(--gold)',bg:'rgba(212,160,23,0.1)'},
                              {label:'Perlu Mengulang',val:qual.mengulang,    color:'var(--red)',bg:'rgba(220,38,38,0.1)'},
                            ].map(q=>(
                              <div key={q.label} style={{display:'flex',alignItems:'center',gap:14}}>
                                <div style={{width:46,height:46,borderRadius:12,background:q.bg,color:q.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,flexShrink:0}}>{q.val}</div>
                                <div style={{flex:1}}>
                                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                                    <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{q.label}</span>
                                    <span style={{fontSize:12,fontWeight:800,color:'var(--text3)'}}>{Math.round((q.val/qual.total)*100)}%</span>
                                  </div>
                                  <div style={{height:8,borderRadius:99,background:'var(--bg)',overflow:'hidden'}}>
                                    <div style={{height:'100%',borderRadius:99,width:`${(q.val/qual.total)*100}%`,background:q.color,transition:'width 0.6s ease-out'}}/>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Catatan (Sudah difilter berdasarkan anak) */}
              {(() => {
                const filteredReports = recent_reports.filter(r => r.student_id === selectedChildId);

                return (
                  <div className="card">
                    <div className="card-head">
                      <div><div className="card-eyebrow">Mutabaah Terkini</div><div className="card-title">Catatan Asatidz Terbaru</div></div>
                    </div>
                    {filteredReports.length === 0
                      ? <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>Belum ada catatan terbaru untuk ananda ini.</p>
                      : (
                        <div className="note-list">
                          {filteredReports.map(r=>(
                            <div key={r.id} className="note-item">
                              <div className="note-head">
                                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                                  <div className="note-teacher"><MessageCircle size={15}/> {r.teacher_name}</div>
                                  <span className="badge b-type">{r.report_type}</span>
                                  <span className="badge b-qual">{r.kualitas?.replace('_',' ')}</span>
                                </div>
                                <div className="note-date"><Calendar size={12}/>{new Date(r.date).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</div>
                              </div>
                              <div className="note-body">{r.teacher_notes}</div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}