import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
  LayoutDashboard, BookOpen, ClipboardList,
  Bell, Settings, LogOut, CheckCircle2,
  TrendingUp, Award, Users, BookCheck, FileText, Star,
  GraduationCap, MessageCircle, Calendar
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { cursor: pointer; font-family: inherit; border: none; background: none; }
input  { font-family: inherit; outline: none; border: none; background: none; }

:root {
  --green:       #0f766e;
  --green-mid:   #14b8a6;
  --green-light: #ccfbf1;
  --blue:        #2563eb;
  --blue-light:  #dbeafe;
  --gold:        #d4a017;
  --gold-light:  #fef9c3;
  --red:         #dc2626;
  --red-light:   #fee2e2;
  --orange:      #d97706;
  --sky:         #0284c7;
  --purple:      #7c3aed;

  --bg:    #f1f5f9;
  --card:  #ffffff;
  --text:  #0f172a;
  --text2: #475569;
  --text3: #94a3b8;

  font-family: 'Plus Jakarta Sans', sans-serif;
}

.root { min-height: 100vh; background: var(--bg); position: relative; }

/* ── Topnav ── */
.topnav {
  position: sticky; top: 0; z-index: 100;
  height: 64px; background: #fff;
  border-bottom: 1px solid rgba(15,118,110,0.08);
  box-shadow: 0 1px 12px rgba(15,118,110,0.06);
  display: flex; align-items: center; padding: 0 28px; gap: 0;
}
.topnav__brand { display: flex; align-items: center; gap: 10px; margin-right: 36px; flex-shrink: 0; }
.topnav__brand-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(15,118,110,0.3);
}
.topnav__brand-name { font-weight: 800; font-size: 15px; color: var(--text); }
.topnav__brand-sub  { font-size: 9.5px; color: var(--text3); margin-top: 1px; }

.topnav__nav { display: flex; align-items: center; gap: 4px; }
.topnav__nav-item {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: var(--text2);
  transition: all 0.18s; position: relative; white-space: nowrap;
}
.topnav__nav-item:hover { background: rgba(15,118,110,0.06); color: var(--green); }
.topnav__nav-item--active {
  background: var(--green); color: #fff;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3);
}
.topnav__nav-item--active:hover { background: var(--green); color: #fff; }

.topnav__gap { flex: 1; }

.topnav__actions { display: flex; align-items: center; gap: 8px; }
.topnav__icon-btn {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(15,118,110,0.06); border: 1px solid rgba(15,118,110,0.1);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); transition: all 0.18s;
}
.topnav__icon-btn:hover { background: rgba(15,118,110,0.12); color: var(--green); }

.topnav__profile {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 5px 5px 10px; border-radius: 12px;
  background: rgba(15,118,110,0.05); border: 1px solid rgba(15,118,110,0.1);
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.topnav__profile:hover { background: rgba(15,118,110,0.1); }
.av {
  border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: #fff; box-shadow: 0 3px 10px rgba(15,118,110,0.28); flex-shrink: 0;
}
.av-sm { width: 30px; height: 30px; font-size: 11px; }
.pname { font-size: 12.5px; font-weight: 700; color: var(--text); white-space: nowrap; }
.prole { font-size: 10px; color: var(--text3); }

/* ── Page wrapper ── */
.page {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 28px 40px; display: flex; flex-direction: column; gap: 20px;
}

/* ── Page heading ── */
.ph { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.ph-title { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
.ph-sub   { font-size: 12px; color: var(--text3); margin-top: 5px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 11px; font-size: 12.5px; font-weight: 700;
  background: var(--text); color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18); transition: all 0.18s;
}
.btn-primary:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.25); transform: translateY(-1px); }

/* ── Student hero card ── */
.hero {
  background: linear-gradient(135deg, var(--green) 0%, #0d5c56 50%, var(--blue) 100%);
  border-radius: 22px; padding: 28px 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  position: relative; overflow: hidden;
  box-shadow: 0 8px 32px rgba(15,118,110,0.3);
}
.hero::before {
  content: ""; position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: rgba(255,255,255,0.05); top: -100px; right: -60px;
}
.hero::after {
  content: ""; position: absolute; width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.04); bottom: -80px; right: 200px;
}
.hero-left { display: flex; align-items: center; gap: 20px; position: relative; z-index: 1; }
.hero-emoji {
  width: 68px; height: 68px; border-radius: 20px; font-size: 32px; flex-shrink: 0;
  background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.28);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.hero-eyebrow { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: .8px; }
.hero-name    { font-size: 24px; font-weight: 900; color: #fff; line-height: 1.1; margin-top: 3px; }
.hero-class   { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; display: flex; align-items: center; gap: 6px; }

/* ── Top row: 3 stat cards ── */
.stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.scard {
  background: var(--card); border-radius: 18px; padding: 20px 22px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 16px;
  border: 1px solid rgba(0,0,0,0.04);
}
.scard-icon {
  width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.scard-val  { font-size: 28px; font-weight: 900; color: var(--text); line-height: 1; }
.scard-lbl  { font-size: 12px; color: var(--text3); font-weight: 600; margin-top: 4px; }

/* ── Main grid row ── */
.main-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* ── Card base ── */
.card {
  background: var(--card); border-radius: 18px; padding: 20px 22px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
}
.card-title  { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.card-eyebrow {
  font-size: 10px; font-weight: 700; color: var(--text3);
  text-transform: uppercase; letter-spacing: .8px; margin-bottom: 2px;
}
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

/* ── Bars ── */
.att-big   { font-size: 36px; font-weight: 900; color: var(--text); line-height: 1; }
.day-bars { display: flex; gap: 8px; align-items: flex-end; height: 80px; margin: 16px 0 8px; }
.day-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.day-bar { width: 100%; border-radius: 8px 8px 0 0; position: relative; overflow: hidden; transition: all 0.3s; }
.day-bar--hadir { background: #16a34a; }
.day-bar--izin  { background: var(--orange); }
.day-bar--sakit { background: var(--sky); }
.day-bar--alpha { background: var(--red); }
.day-bar-lbl   { font-size: 9.5px; color: var(--text3); font-weight: 600; }

.att-legend { display: flex; gap: 10px; font-size: 10.5px; color: var(--text3); margin-top: 8px; flex-wrap: wrap; }
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; }

/* ── Catatan Asatidz List ── */
.note-list { display: flex; flex-direction: column; gap: 12px; }
.note-item {
  padding: 16px; border-radius: 14px;
  background: var(--bg); border: 1px solid rgba(0,0,0,0.04);
}
.note-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.note-teacher { font-size: 12.5px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px; }
.note-date { font-size: 10px; color: var(--text3); font-weight: 600; }
.note-body {
  background: rgba(37,99,235,0.04); border-left: 3px solid var(--blue);
  padding: 10px 14px; border-radius: 6px 10px 10px 6px;
  font-size: 12.5px; color: var(--text2); line-height: 1.5; font-weight: 500;
}
.badge { display:inline-flex; align-items:center; gap:4px; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform: uppercase; letter-spacing: 0.5px; }
.b-hadir { background:rgba(22,163,74,0.1); color:#16a34a; }
.b-type  { background:rgba(139,92,246,0.1); color:#7c3aed; }
.b-qual  { background:rgba(244,114,182,0.1); color:#db2777; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .stat-row  { grid-template-columns: 1fr; }
  .main-row  { grid-template-columns: 1fr; }
  .hero-stats { display: none; }
}
@media (max-width: 768px) {
  .page { padding: 16px; gap: 14px; }
  .topnav { padding: 0 16px; }
  .topnav__nav { display: none; }
  .pname, .prole { display: none; }
  .hero { padding: 20px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   DATA DUMMY (Sesuai dengan LaporanParents.tsx & Anak.tsx)
═══════════════════════════════════════════════════════════ */
const recentReports = [
  {
    id: 1, date: "2026-03-19", attendance: "hadir", report_type: "hafalan", kualitas: "sangat_lancar",
    hafalan_target: "QS. Al-Mulk 1-10", hafalan_achievement: "QS. Al-Mulk 1-10",
    teacher_name: "Ustadz Ali",
    teacher_notes: "Alhamdulillah ananda hari ini menyelesaikan hafalan surah Al-Mulk dengan sangat lancar. Teruskan murajaah di rumah."
  },
  {
    id: 2, date: "2026-03-18", attendance: "hadir", report_type: "yanbua", kualitas: "mengulang",
    hafalan_target: "Jilid 4 Hal 15", hafalan_achievement: "Jilid 4 Hal 15",
    teacher_name: "Ustadzah Fatimah",
    teacher_notes: "Ananda perlu mengulang bacaan Yanbua halaman 15 di rumah ya Bunda, terutama pada hukum tajwid Ikhfa."
  }
];

const qualStats = [
  { label: "Sangat Lancar", count: 18, color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  { label: "Lancar",        count: 5,  color: "var(--gold)", bg: "rgba(212,160,23,0.1)" },
  { label: "Mengulang",     count: 1,  color: "var(--red)", bg: "rgba(220,38,38,0.1)" },
];

const navItems = [
  { icon:LayoutDashboard, label:"Dashboard",   id:"dashboard" },
  { icon:Users,           label:"Anak Saya",   id:"anak" },
  { icon:BookCheck,       label:"Laporan",     id:"laporan" },
  { icon:Settings,        label:"Pengaturan",  id:"pengaturan" },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ParentDashboard() {
  const user = usePage<PageProps>().props.auth.user;
  const displayName = user?.name || user?.username || user?.email || "Wali Murid";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";

  const handleLogout = () => router.post(route("logout"));
  const handleNav = (id: string) => {
    if (id === "anak")    { router.visit(route("parents.anak"));    return; }
    if (id === "laporan") { router.visit(route("parents.laporan")); return; }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="root">

        {/* ════ TOPNAV ════ */}
        <nav className="topnav">
          <div className="topnav__brand">
            <div className="topnav__brand-icon">
              <BookOpen size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div className="topnav__brand-name">EduConnect</div>
              <div className="topnav__brand-sub">Parent Portal</div>
            </div>
          </div>

          <div className="topnav__nav">
            {navItems.map(({ icon: Icon, label, id }) => (
              <button key={id} className={`topnav__nav-item ${id === "dashboard" ? "topnav__nav-item--active" : ""}`} onClick={() => handleNav(id)}>
                <Icon size={15} strokeWidth={id === "dashboard" ? 2.5 : 1.8} /> {label}
              </button>
            ))}
          </div>

          <div className="topnav__gap" />

          <div className="topnav__actions">
            <button className="topnav__icon-btn"><Settings size={16} strokeWidth={1.8} /></button>
            <button className="topnav__icon-btn"><Bell size={16} strokeWidth={1.8} /></button>
            <button className="topnav__icon-btn" onClick={handleLogout} title="Keluar">
              <LogOut size={16} strokeWidth={1.8} />
            </button>
            <div className="topnav__profile">
              <div>
                <div className="pname">{displayName}</div>
                <div className="prole">Wali Murid</div>
              </div>
              <div className="av av-sm">{initials}</div>
            </div>
          </div>
        </nav>

        {/* ════ PAGE ════ */}
        <div className="page">

          <div className="ph">
            <div>
              <div className="ph-title">Selamat Datang, {displayName.split(' ')[0]}</div>
              <div className="ph-sub">Pantau aktivitas dan perkembangan ananda di satu tempat.</div>
            </div>
            <button className="btn-primary" onClick={() => handleNav('laporan')}>
              <TrendingUp size={14} /> Lihat Laporan Lengkap
            </button>
          </div>

          {/* ── Hero Card ── */}
          <div className="hero">
            <div className="hero-left">
              <div className="hero-emoji">👦</div>
              <div>
                <div className="hero-eyebrow">Akses Cepat Anak</div>
                <div className="hero-name">Rizki Fauzi</div>
                <div className="hero-class"><GraduationCap size={14} /> Program Tahfidz Reguler</div>
              </div>
            </div>
          </div>

          {/* ── 3 Stat Cards (Sesuai LaporanParents.tsx & Anak.tsx) ── */}
          <div className="stat-row">
            <div className="scard">
              <div className="scard-icon" style={{ background:"rgba(37,99,235,0.1)", color:"var(--blue)" }}>
                <Users size={24} />
              </div>
              <div>
                <div className="scard-val">1</div>
                <div className="scard-lbl">Anak Aktif Terdaftar</div>
              </div>
            </div>
            <div className="scard">
              <div className="scard-icon" style={{ background:"rgba(139,92,246,0.1)", color:"var(--purple)" }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="scard-val">24</div>
                <div className="scard-lbl">Total Laporan Diterima</div>
              </div>
            </div>
            <div className="scard">
              <div className="scard-icon" style={{ background:"rgba(22,163,74,0.1)", color:"#16a34a" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="scard-val">23</div>
                <div className="scard-lbl">Total Kehadiran (Hadir)</div>
              </div>
            </div>
          </div>

          {/* ── Main Row (Kehadiran & Kualitas) ── */}
          <div className="main-row">
            {/* Absensi */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Kehadiran Minggu Ini</div>
                  <div className="card-title">Absensi Harian</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <div className="att-big">4<span style={{ fontSize:20, color:"var(--text3)", fontWeight:600 }}>/5 Hari</span></div>
              </div>
              <div className="day-bars">
                {[
                  { d:"Sen", h:95, s:"hadir" },
                  { d:"Sel", h:95, s:"hadir" },
                  { d:"Rab", h:40, s:"izin" },
                  { d:"Kam", h:95, s:"hadir" },
                  { d:"Jum", h:95, s:"hadir" },
                ].map(d => (
                  <div key={d.d} className="day-bar-wrap">
                    <div className={`day-bar day-bar--${d.s}`} style={{ height:`${d.h}%` }} />
                    <span className="day-bar-lbl">{d.d}</span>
                  </div>
                ))}
              </div>
              <div className="att-legend">
                <span><span className="dot" style={{ background:"#16a34a" }} />Hadir</span>
                <span><span className="dot" style={{ background:"var(--orange)" }} />Izin</span>
                <span><span className="dot" style={{ background:"var(--sky)" }} />Sakit</span>
                <span><span className="dot" style={{ background:"var(--red)" }} />Alpha</span>
              </div>
            </div>

            {/* Kualitas Setoran */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Distribusi Penilaian</div>
                  <div className="card-title">Kualitas Setoran Bulan Ini</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginTop:"12px" }}>
                {qualStats.map(q => (
                  <div key={q.label} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"42px", height:"42px", borderRadius:"12px", background: q.bg, color: q.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"15px" }}>
                      {q.count}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>{q.label}</div>
                      <div style={{ height:"6px", borderRadius:"99px", background:"var(--bg)", marginTop:"6px", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"99px", width: `${(q.count / 24) * 100}%`, background: q.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Catatan Asatidz (Menggantikan Chat & Pengumuman) ── */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-eyebrow">Mutabaah Terkini</div>
                <div className="card-title">Catatan Asatidz Terbaru</div>
              </div>
            </div>
            <div className="note-list">
              {recentReports.map(r => (
                <div key={r.id} className="note-item">
                  <div className="note-head">
                    <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                      <div className="note-teacher"><MessageCircle size={14} /> {r.teacher_name}</div>
                      <span className="badge b-type">{r.report_type}</span>
                      <span className="badge b-qual">{r.kualitas.replace('_', ' ')}</span>
                    </div>
                    <div className="note-date"><Calendar size={10} style={{ display:'inline', marginRight:4 }}/> {new Date(r.date).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}</div>
                  </div>
                  <div className="note-body">{r.teacher_notes}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}