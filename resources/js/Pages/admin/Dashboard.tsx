import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import axios from "axios";
import {
  LayoutDashboard, BookOpen, Users, CalendarDays,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, CheckCircle2, Clock, TrendingUp,
  Award, Star, Menu, FileText, ShieldUser,
  Info, Handshake, ArrowUpRight, ArrowRight, UserPlus,
  Search, Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

import GuruPage       from "./GuruPage";
import MitraPage      from "./MitraPage";
import WaliMuridPage  from "./WalimuridPage";
import SiswaPage      from "./SiswaPage";
import InfoPage       from "./InfoPage";
import AgendaPage     from "./AgendaPage";
import ProgressPage   from "./ProgressPage";
import PengaturanPage from "./PengaturanPage";

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
interface DashStats {
  total_siswa:   number;
  total_pending: number;
  total_guru:    number;
  total_program: number;
  total_mitra:   number;
}

interface ChartPoint   { name: string; pendaftar: number; }
interface AgendaItem   { id: string; title: string; date: string; type: string; }
interface PendingItem  { id: string; nama: string; prog: string; date: string; }
interface ReportItem   { id: string; student_id: string; nama: string; capaian: string; report_type: string | null; kualitas: string | null; }

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
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
  --red:         #dc2626;
  --bg:          #f1f5f9;
  --text:        #0f172a;
  --text2:       #475569;
  --text3:       #94a3b8;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.layout {
  display: flex; min-height: 100vh; background: var(--bg);
  position: relative; overflow: hidden;
}

.bg-decor { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; pointer-events: none; }
.dec-1 { width: 400px; height: 400px; background: var(--green-light); top: -100px; left: -100px; }
.dec-2 { width: 500px; height: 500px; background: var(--blue-light); bottom: -150px; right: -100px; }
.dec-3 { width: 300px; height: 300px; background: #fef08a; top: 40%; left: 30%; opacity: 0.2; }

/* ── SIDEBAR ── */
.sb {
  width: 220px; background: var(--green); color: #fff;
  display: flex; flex-direction: column;
  transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative; z-index: 20;
  box-shadow: 4px 0 24px rgba(15,118,110,0.15);
  margin: 12px 0 12px 12px; border-radius: 20px; overflow: hidden;
  flex-shrink: 0;
}
.sb--col { width: 64px; }
.sb-hd {
  height: 64px; display: flex; align-items: center; padding: 0 18px; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  white-space: nowrap; overflow: hidden;
}
.sb-logo {
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.2);
}
.sb-brand { font-size: 14px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.2; }
.sb-sub   { font-size: 9.5px; font-weight: 500; color: var(--green-light); opacity: 0.8; }
.sb-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; overflow-x: hidden; }
.sb-item {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 10px; border-radius: 12px;
  color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600;
  transition: all 0.2s; white-space: nowrap; cursor: pointer; position: relative;
}
.sb-item:hover { color: #fff; background: rgba(255,255,255,0.08); }
.sb-item--on {
  color: #fff; background: rgba(255,255,255,0.15);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); font-weight: 700;
}
.sb-item--on::before {
  content: ""; position: absolute; left: 0; top: 10px; bottom: 10px;
  width: 3px; background: #fff; border-radius: 0 3px 3px 0;
}
.sb-ico { flex-shrink: 0; }
.sb-lbl { transition: opacity 0.2s; }
.sb--col .sb-lbl { opacity: 0; width: 0; display: none; }
.sb-badge {
  margin-left: auto; background: var(--red); color: #fff;
  font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 99px;
  box-shadow: 0 2px 8px rgba(220,38,38,0.4);
}
.sb--col .sb-badge {
  position: absolute; top: 6px; right: 6px; padding: 0; width: 7px; height: 7px; font-size: 0;
}
.sb-ft { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.1); }
.sb-tog {
  position: absolute; top: 28px; right: -10px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; border: 1px solid rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); cursor: pointer; z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: 0.2s;
}
.sb-tog:hover { color: var(--green); transform: scale(1.1); }

/* ── MAIN ── */
.main {
  flex: 1; display: flex; flex-direction: column;
  transition: all 0.3s; z-index: 10; height: 100vh; overflow-y: auto; scroll-behavior: smooth;
  min-width: 0;
}
.main--open { max-width: calc(100vw - 232px); }
.main--col  { max-width: calc(100vw - 76px); }
/* ── TOPBAR — floating pills ── */
.top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; position: sticky; top: 0; z-index: 50;
  background: transparent; pointer-events: none;
}
.top > * { pointer-events: auto; }

/* Search pill */
.top-search {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  padding: 0 16px; height: 40px; border-radius: 99px; width: 260px;
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
  transition: 0.25s cubic-bezier(0.25,1,0.5,1);
}
.top-search:focus-within {
  background: rgba(255,255,255,0.88); width: 310px;
  border-color: rgba(15,118,110,0.35);
  box-shadow: 0 6px 24px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,1);
}
.top-search input { flex: 1; font-size: 13px; color: var(--text); background: transparent; }
.top-search input::placeholder { color: var(--text3); }

/* Notif pill — square-ish rounded */
.top-acts { display: flex; align-items: center; gap: 8px; }

.top-notif-pill {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 14px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
  color: var(--text2); position: relative; cursor: pointer; transition: 0.2s;
}
.top-notif-pill:hover {
  background: rgba(255,255,255,0.88); color: var(--green);
  box-shadow: 0 6px 20px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.top-dot {
  position: absolute; top: 8px; right: 8px;
  width: 7px; height: 7px; background: var(--red); border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.9);
  box-shadow: 0 0 0 2px rgba(220,38,38,0.15);
}

/* Profile pill */
.top-prof {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  padding: 5px 14px 5px 5px; border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
  cursor: pointer; transition: 0.2s;
}
.top-prof:hover {
  background: rgba(255,255,255,0.88);
  box-shadow: 0 6px 20px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.top-av {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--blue));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  box-shadow: 0 2px 8px rgba(15,118,110,0.35);
}
.top-pname { font-size: 12.5px; font-weight: 700; color: var(--text); line-height: 1.2; }
.top-prole { font-size: 10px; color: var(--text3); font-weight: 600; }

/* mobile menu btn — juga pill */
.top-menu-btn {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 14px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
  color: var(--text2); cursor: pointer; transition: 0.2s;
}
.top-menu-btn:hover { background: rgba(255,255,255,0.88); color: var(--green); }
.content { padding: 4px 24px 40px; flex: 1; display: flex; flex-direction: column; gap: 20px; animation: fi .4s ease; }
@keyframes fi { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }

/* ── GLASS CARD ── */
.glass-card {
  background: rgba(255,255,255,0.65);
  backdrop-filter: saturate(200%) blur(32px); -webkit-backdrop-filter: saturate(200%) blur(32px);
  border-radius: 20px; border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 8px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
  padding: 20px; overflow: hidden; position: relative;
}

/* Banner */
.dash-banner {
  background: linear-gradient(135deg, var(--green), #0d5c56, var(--blue));
  border-radius: 20px; padding: 24px 32px; color: #fff;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 8px 24px rgba(15,118,110,0.2); position: relative; overflow: hidden;
}
.dash-banner::after {
  content: ""; position: absolute; right: -40px; top: -80px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
}
.db-title { font-size: 22px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.5px; position:relative; z-index:2; }
.db-sub { font-size: 13px; opacity: 0.82; font-weight: 500; position:relative; z-index:2; }
.db-date {
  background: rgba(255,255,255,0.18); backdrop-filter: blur(10px);
  padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
  display: flex; align-items: center; gap: 7px; border: 1px solid rgba(255,255,255,0.25);
  position:relative; z-index:2; white-space: nowrap;
}

/* Stats */
.dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-box { display: flex; align-items: center; gap: 14px; padding: 16px 18px; transition: transform 0.2s; cursor: pointer; }
.stat-box:hover { transform: translateY(-2px); }
.st-icon-wrap { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.st-info { flex: 1; min-width: 0; }
.st-val { font-size: 22px; font-weight: 900; color: var(--text); line-height: 1.1; }
.st-lbl { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.st-val-skel { height: 26px; width: 48px; background: #e2e8f0; border-radius: 6px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* Grid */
.dash-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }
.dash-grid-bot { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sec-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sec-ttl { font-size: 14.5px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 7px; }
.sec-btn { font-size: 11.5px; font-weight: 700; color: var(--green); display: flex; align-items: center; gap: 4px; transition: 0.2s; white-space: nowrap; }
.sec-btn:hover { color: var(--green-mid); transform: translateX(2px); }

/* List items */
.list-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: rgba(255,255,255,0.6);
  border: 1px solid rgba(0,0,0,0.04); border-radius: 14px; margin-bottom: 8px; transition: 0.2s;
}
.list-item:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transform: scale(1.005); }
.list-item:last-child { margin-bottom: 0; }
.li-l { display: flex; align-items: center; gap: 10px; min-width: 0; }
.li-av {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(15,118,110,0.1); color: var(--green);
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;
}
.li-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.li-sub { font-size: 11.5px; color: var(--text3); font-weight: 500; display:flex; align-items:center; gap:4px; }
.li-r { text-align: right; flex-shrink: 0; margin-left: 8px; }
.li-badge { padding: 3px 8px; border-radius: 7px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
.b-warn { background: rgba(245,158,11,0.1); color: #d97706; }
.b-ok   { background: rgba(22,163,74,0.1); color: #16a34a; }
.b-blue { background: rgba(37,99,235,0.1); color: #2563eb; }

/* Empty/loading state inside cards */
.card-empty { text-align:center; padding:24px 20px; color:var(--text3); font-size:13px; font-weight:600; }

@media (max-width: 1280px) {
  .dash-grid { grid-template-columns: 3fr 2fr; }
}
@media (max-width: 1024px) {
  .dash-grid, .dash-grid-bot { grid-template-columns: 1fr; }
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: sembunyikan hamburger, tampilkan search & nama profil */
.top-menu-btn  { display: none; }
.top-search    { display: flex; }
.top-pname-wrap { display: block; }

@media (max-width: 768px) {
  /* Sidebar: tersembunyi, muncul saat .sb--open-mob */
  .sb {
    position: fixed; top: 0; left: 0;
    height: 100vh; margin: 0; border-radius: 0; z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .sb--open-mob { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,0.2); }

  /* Hamburger tampil di mobile */
  .top-menu-btn { display: flex; }

  /* Search & nama profil hilang di mobile */
  .top-search    { display: none; }
  .top-pname-wrap { display: none; }

  .main { max-width: 100vw; }
  .top  { padding: 12px 16px; }
  .content { padding: 4px 16px 32px; gap: 14px; }
  .dash-stats { grid-template-columns: 1fr 1fr; }
  .dash-banner { flex-direction: column; align-items: flex-start; gap: 12px; padding: 20px; }
  .dash-grid, .dash-grid-bot { grid-template-columns: 1fr; }
}
`;

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const QUAL_LABEL: Record<string, string> = {
  sangat_lancar: 'Sangat Lancar',
  lancar:        'Lancar',
  mengulang:     'Mengulang',
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function DashboardAdmin() {
  const { auth } = usePage().props as PageProps;
  const user      = auth?.user;
  const adminName = (user as any)?.name || (user as any)?.username || "Admin QLC";
  const initial   = adminName.substring(0, 2).toUpperCase();

  const [col,     setCol]     = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  const urlParams  = new URLSearchParams(window.location.search);
  const [active, setActive] = useState(urlParams.get('tab') || "dashboard");

  useEffect(() => {
    if (active !== "dashboard") window.history.pushState(null, '', `?tab=${active}`);
    else window.history.pushState(null, '', window.location.pathname);
  }, [active]);

  // ── Dashboard Data ──────────────────────────────────────
  const [stats,    setStats]    = useState<DashStats | null>(null);
  const [chart,    setChart]    = useState<ChartPoint[]>([]);
  const [agendas,  setAgendas]  = useState<AgendaItem[]>([]);
  const [pending,  setPending]  = useState<PendingItem[]>([]);
  const [topRep,   setTopRep]   = useState<ReportItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Fetch semua data dashboard sekaligus saat tab = dashboard
  useEffect(() => {
    if (active !== "dashboard") return;

    setLoading(true);
    Promise.all([
      axios.get<DashStats>('/api/admin/dashboard/stats'),
      axios.get<ChartPoint[]>('/api/admin/dashboard/chart'),
      axios.get<AgendaItem[]>('/api/admin/dashboard/upcoming-agenda'),
      axios.get<PendingItem[]>('/api/admin/dashboard/pending-students'),
      axios.get<ReportItem[]>('/api/admin/dashboard/top-reports'),
    ]).then(([s, c, a, p, r]) => {
      setStats(s.data);
      setChart(c.data);
      setAgendas(a.data);
      setPending(p.data);
      setTopRep(r.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [active]);

  const NAV = [
    { id: "dashboard",  l: "Beranda",         i: LayoutDashboard, badge: 0 },
    { id: "agenda",     l: "Agenda QLC",      i: CalendarDays,    badge: 0 },
    { id: "guru",       l: "Manajemen Guru",  i: GraduationCap,   badge: 0 },
    { id: "mitra",      l: "Data Mitra",      i: Handshake,       badge: 0 },
    { id: "wali_murid", l: "Wali Murid",      i: ShieldUser,      badge: 0 },
    { id: "siswa",      l: "Data Siswa",      i: Users,           badge: stats?.total_pending ?? 0 },
    { id: "progress",   l: "Laporan Progress", i: BookOpen,        badge: 0 },
    { id: "info",       l: "Info Sekolah",    i: Info,            badge: 0 },
    { id: "pengaturan", l: "Pengaturan",      i: Settings,        badge: 0 },
  ];

  const handleLogout = () => router.post(route("logout"));
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <Head title="Admin Dashboard | QLC" />
      <style>{CSS}</style>

      <div className="layout">
        <div className="bg-decor dec-1" />
        <div className="bg-decor dec-2" />
        <div className="bg-decor dec-3" />

        {/* ════ SIDEBAR ════ */}
        <aside className={`sb ${col ? "sb--col" : ""} ${mobOpen ? "sb--open-mob" : ""}`}>
          <div className="sb-hd">
            <div className="sb-logo"><BookOpen size={20} color="#fff" /></div>
            <div className="sb-lbl">
              <div className="sb-brand">EduConnect</div>
              <div className="sb-sub">Admin Portal</div>
            </div>
          </div>

          <button className="sb-tog hidden md:flex" onClick={() => setCol(!col)}>
            {col ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>

          <div className="sb-nav">
            {NAV.map(n => (
              <div key={n.id}
                className={`sb-item ${active === n.id ? "sb-item--on" : ""}`}
                onClick={() => { setActive(n.id); setMobOpen(false); }}>
                <n.i size={18} className="sb-ico" />
                <span className="sb-lbl">{n.l}</span>
                {n.badge > 0 && <span className="sb-badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sb-ft">
            <div className="sb-item" onClick={handleLogout} style={{ color: "#fca5a5" }}>
              <LogOut size={18} className="sb-ico" />
              <span className="sb-lbl">Keluar</span>
            </div>
          </div>
        </aside>

        {mobOpen && (
          <div
            style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }}
            onClick={() => setMobOpen(false)}
          />
        )}

        {/* ════ MAIN ════ */}
        <main className={`main ${col ? "main--col" : "main--open"}`}>

          {/* Topbar — floating pills */}
          <header className="top">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button className="top-menu-btn" onClick={() => setMobOpen(true)}>
                <Menu size={17}/>
              </button>
              <div className="top-search">
                <Search size={14} color="#94a3b8" />
                <input placeholder="Cari siswa, guru, atau program..." />
              </div>
            </div>

            <div className="top-acts">
              {/* Notifikasi — pill sendiri */}
              <button className="top-notif-pill">
                <Bell size={17} />
                <span className="top-dot"/>
              </button>

              {/* Profile — pill sendiri */}
              <div className="top-prof" onClick={() => setActive("pengaturan")}>
                <div className="top-av">{initial}</div>
                <div className="top-pname-wrap">
                  <div className="top-pname">{adminName}</div>
                  <div className="top-prole">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* ════ CONTENT ════ */}
          <div className="content">
            {active === "guru"       ? <GuruPage /> :
             active === "mitra"      ? <MitraPage /> :
             active === "wali_murid" ? <WaliMuridPage /> :
             active === "siswa"      ? <SiswaPage /> :
             active === "info"       ? <InfoPage /> :
             active === "agenda"     ? <AgendaPage /> :
             active === "progress"   ? <ProgressPage /> :
             active === "pengaturan" ? <PengaturanPage /> :
            (
              /* ════ BERANDA ════ */
              <>
                {/* Banner */}
                <div className="dash-banner">
                  <div>
                    <div className="db-title">Selamat Datang, {adminName.split(' ')[0]} 👋</div>
                    <div className="db-sub">Berikut adalah ringkasan operasional QLC hari ini.</div>
                  </div>
                  <div className="db-date"><CalendarDays size={16}/> {today}</div>
                </div>

                {/* Stats Grid */}
                <div className="dash-stats">
                  {[
                    {
                      val: stats?.total_siswa,
                      lbl: 'Total Siswa',
                      icon: <Users size={22} strokeWidth={2}/>,
                      bg: 'rgba(15,118,110,0.1)', color: 'var(--green)',
                      tab: 'siswa',
                    },
                    {
                      val: stats?.total_guru,
                      lbl: 'Pengajar Aktif',
                      icon: <GraduationCap size={22} strokeWidth={2}/>,
                      bg: 'rgba(37,99,235,0.1)', color: 'var(--blue)',
                      tab: 'guru',
                    },
                    {
                      val: stats?.total_program,
                      lbl: 'Program Studi',
                      icon: <BookOpen size={22} strokeWidth={2}/>,
                      bg: 'rgba(124,58,237,0.1)', color: '#7c3aed',
                      tab: 'info',
                    },
                    {
                      val: stats?.total_mitra,
                      lbl: 'Mitra Aktif',
                      icon: <Handshake size={22} strokeWidth={2}/>,
                      bg: 'rgba(212,160,23,0.1)', color: 'var(--gold)',
                      tab: 'mitra',
                    },
                  ].map(({ val, lbl, icon, bg, color, tab }) => (
                    <div key={lbl} className="glass-card stat-box" onClick={() => setActive(tab)}>
                      <div className="st-icon-wrap" style={{ background: bg, color }}>{icon}</div>
                      <div className="st-info">
                        {loading
                          ? <div className="st-val-skel" />
                          : <div className="st-val">{val ?? 0}</div>
                        }
                        <div className="st-lbl">{lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart & Agenda */}
                <div className="dash-grid">
                  {/* Chart */}
                  <div className="glass-card">
                    <div className="sec-hd">
                      <div className="sec-ttl"><TrendingUp size={18} color="var(--green)"/> Grafik Pendaftaran</div>
                    </div>
                    <div style={{ height: 260, width: "100%", marginTop: 10 }}>
                      {loading ? (
                        <div style={{ height: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Loader2 size={28} style={{ color:'var(--green)', animation:'spin 1s linear infinite' }} />
                        </div>
                      ) : (
                        <ResponsiveContainer>
                          <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="var(--green)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                            <Area type="monotone" dataKey="pendaftar" stroke="var(--green)" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Agenda Terdekat */}
                  <div className="glass-card">
                    <div className="sec-hd">
                      <div className="sec-ttl"><CalendarDays size={18} color="var(--blue)"/> Agenda Terdekat</div>
                      <button className="sec-btn" onClick={() => setActive("agenda")}>Lihat Semua <ArrowRight size={14}/></button>
                    </div>
                    {loading ? (
                      <div className="card-empty"><Loader2 size={20} style={{ animation:'spin 1s linear infinite', display:'inline' }}/></div>
                    ) : agendas.length === 0 ? (
                      <div className="card-empty">Tidak ada agenda mendatang.</div>
                    ) : (
                      <div className="flex flex-col">
                        {agendas.map(a => (
                          <div key={a.id} className="list-item">
                            <div className="li-l">
                              <div className="li-av" style={{
                                background: a.type === "urgent" ? "rgba(220,38,38,0.1)" : "rgba(37,99,235,0.1)",
                                color:      a.type === "urgent" ? "var(--red)"          : "var(--blue)",
                              }}>
                                {a.date.split(" ")[0]}
                              </div>
                              <div>
                                <div className="li-title">{a.title}</div>
                                <div className="li-sub"><Clock size={11}/> {a.date}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: Pending & Top Reports */}
                <div className="dash-grid-bot">
                  {/* Perlu Persetujuan */}
                  <div className="glass-card">
                    <div className="sec-hd">
                      <div className="sec-ttl">
                        <UserPlus size={18} color="var(--gold)"/> Perlu Persetujuan
                        {stats && stats.total_pending > 0 && (
                          <span style={{ background:'rgba(245,158,11,0.12)', color:'#d97706', fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:8, marginLeft:4 }}>
                            {stats.total_pending}
                          </span>
                        )}
                      </div>
                      <button className="sec-btn" onClick={() => setActive("siswa")}>Kelola Siswa <ArrowRight size={14}/></button>
                    </div>
                    {loading ? (
                      <div className="card-empty"><Loader2 size={20} style={{ animation:'spin 1s linear infinite', display:'inline' }}/></div>
                    ) : pending.length === 0 ? (
                      <div className="card-empty" style={{ color:'#16a34a' }}>
                        <CheckCircle2 size={20} style={{ display:'inline', marginRight:6 }}/>
                        Semua pendaftaran sudah diproses.
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {pending.map(s => (
                          <div key={s.id} className="list-item">
                            <div className="li-l">
                              <div className="li-av">{s.nama.charAt(0)}</div>
                              <div>
                                <div className="li-title">{s.nama}</div>
                                <div className="li-sub"><BookOpen size={11}/> {s.prog}</div>
                              </div>
                            </div>
                            <div className="li-r">
                              <span className="li-badge b-warn">Menunggu</span>
                              <div style={{ fontSize:10, color:'var(--text3)', marginTop:4, fontWeight:600 }}>{s.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Laporan Terbaik */}
                  <div className="glass-card">
                    <div className="sec-hd">
                      <div className="sec-ttl"><Star size={18} color="#7c3aed"/> Laporan Terbaik Hari Ini</div>
                      <button className="sec-btn" onClick={() => setActive("progress")}>Semua Laporan <ArrowRight size={14}/></button>
                    </div>
                    {loading ? (
                      <div className="card-empty"><Loader2 size={20} style={{ animation:'spin 1s linear infinite', display:'inline' }}/></div>
                    ) : topRep.length === 0 ? (
                      <div className="card-empty">Belum ada laporan hari ini.</div>
                    ) : (
                      <div className="flex flex-col">
                        {topRep.map(r => (
                          <div key={r.id} className="list-item">
                            <div className="li-l">
                              <div className="li-av" style={{ background:'rgba(124,58,237,0.1)', color:'#7c3aed' }}>
                                {r.nama.charAt(0)}
                              </div>
                              <div>
                                <div className="li-title">{r.nama}</div>
                                <div className="li-sub">
                                  <FileText size={11}/>
                                  {r.report_type ? r.report_type.toUpperCase() : '—'} · {r.capaian}
                                </div>
                              </div>
                            </div>
                            <div className="li-r">
                              <span className={`li-badge ${r.kualitas === 'sangat_lancar' ? 'b-ok' : 'b-blue'}`}>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}