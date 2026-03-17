import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
  LayoutDashboard, BookOpen, ClipboardList, CreditCard,
  Bell, MessageSquare, Settings, LogOut, ArrowUpRight,
  CheckCircle2, Clock, TrendingUp, TrendingDown,
  Award, ChevronRight, Plus, Star, Wallet, Users,
  BookCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";

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
  --purple:      #7c3aed;

  --bg:    #f1f5f9;
  --card:  #ffffff;
  --text:  #0f172a;
  --text2: #475569;
  --text3: #94a3b8;
  --border: rgba(15,118,110,0.1);

  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Root ─────────────────────────────────────────────── */
.root {
  min-height: 100vh;
  background: var(--bg);
  position: relative;
}

/* ── Topnav ───────────────────────────────────────────── */
.topnav {
  position: sticky; top: 0; z-index: 100;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid rgba(15,118,110,0.08);
  box-shadow: 0 1px 12px rgba(15,118,110,0.06);
  display: flex; align-items: center;
  padding: 0 28px; gap: 0;
}

.topnav__brand {
  display: flex; align-items: center; gap: 10px;
  margin-right: 36px; flex-shrink: 0;
}
.topnav__brand-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(15,118,110,0.3);
}
.topnav__brand-name { font-weight: 800; font-size: 15px; color: var(--text); }
.topnav__brand-sub  { font-size: 9.5px; color: var(--text3); margin-top: 1px; }

/* nav pills */
.topnav__nav { display: flex; align-items: center; gap: 4px; }
.topnav__nav-item {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: var(--text2);
  transition: all 0.18s; position: relative; white-space: nowrap;
}
.topnav__nav-item:hover { background: rgba(15,118,110,0.06); color: var(--green); }
.topnav__nav-item--active {
  background: var(--green);
  color: #fff;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3);
}
.topnav__nav-item--active:hover { background: var(--green); color: #fff; }
.nav-badge {
  background: var(--red); color: #fff;
  border-radius: 99px; min-width: 16px; height: 16px;
  font-size: 8.5px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}

.topnav__gap { flex: 1; }

/* right side actions */
.topnav__actions { display: flex; align-items: center; gap: 8px; }
.topnav__icon-btn {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(15,118,110,0.06);
  border: 1px solid rgba(15,118,110,0.1);
  display: flex; align-items: center; justify-content: center;
  position: relative; color: var(--text2);
  transition: all 0.18s;
}
.topnav__icon-btn:hover { background: rgba(15,118,110,0.12); color: var(--green); }
.bell-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--red); box-shadow: 0 0 6px rgba(220,38,38,0.8);
  border: 1.5px solid #fff;
}

.topnav__profile {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 5px 5px 10px;
  border-radius: 12px;
  background: rgba(15,118,110,0.05);
  border: 1px solid rgba(15,118,110,0.1);
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.topnav__profile:hover { background: rgba(15,118,110,0.1); }
.av {
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: #fff;
  box-shadow: 0 3px 10px rgba(15,118,110,0.28); flex-shrink: 0;
}
.av-sm { width: 30px; height: 30px; font-size: 11px; }
.av-lg { width: 44px; height: 44px; font-size: 16px; }
.pname { font-size: 12.5px; font-weight: 700; color: var(--text); white-space: nowrap; }
.prole { font-size: 10px; color: var(--text3); }

/* ── Page wrapper ─────────────────────────────────────── */
.page {
  max-width: 1300px; margin: 0 auto;
  padding: 28px 28px 40px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Page heading ─────────────────────────────────────── */
.ph { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.ph-title { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
.ph-sub   { font-size: 12px; color: var(--text3); margin-top: 5px; }
.ph-actions { display: flex; gap: 8px; }
.btn-outline {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 11px; font-size: 12.5px; font-weight: 700;
  background: #fff; border: 1.5px solid rgba(15,118,110,0.18); color: var(--text2);
  transition: all 0.18s;
}
.btn-outline:hover { border-color: var(--green); color: var(--green); }
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 11px; font-size: 12.5px; font-weight: 700;
  background: var(--text); color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  transition: all 0.18s;
}
.btn-primary:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.25); transform: translateY(-1px); }

/* ── Student hero card ────────────────────────────────── */
.hero {
  background: linear-gradient(135deg, var(--green) 0%, #0d5c56 50%, var(--blue) 100%);
  border-radius: 22px;
  padding: 28px 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  position: relative; overflow: hidden;
  box-shadow: 0 8px 32px rgba(15,118,110,0.3);
}
.hero::before {
  content: ""; position: absolute;
  width: 300px; height: 300px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
  top: -100px; right: -60px;
}
.hero::after {
  content: ""; position: absolute;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -80px; right: 200px;
}
.hero-left { display: flex; align-items: center; gap: 20px; position: relative; z-index: 1; }
.hero-emoji {
  width: 68px; height: 68px; border-radius: 20px; font-size: 32px; flex-shrink: 0;
  background: rgba(255,255,255,0.18);
  border: 2px solid rgba(255,255,255,0.28);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.hero-eyebrow { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: .8px; }
.hero-name    { font-size: 24px; font-weight: 900; color: #fff; line-height: 1.1; margin-top: 3px; }
.hero-class   { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 99px; margin-top: 10px;
  background: rgba(212,160,23,0.22); border: 1px solid rgba(212,160,23,0.4);
  font-size: 11px; font-weight: 700; color: #facc15;
}
.hero-stats {
  display: flex; gap: 20px; position: relative; z-index: 1;
  flex-wrap: wrap;
}
.hero-stat {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px; padding: 14px 20px;
  min-width: 110px; text-align: center;
  backdrop-filter: blur(10px);
}
.hero-stat-val   { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
.hero-stat-label { font-size: 10.5px; color: rgba(255,255,255,0.6); margin-top: 4px; font-weight: 600; }
.hero-stat-badge { font-size: 10px; font-weight: 700; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 3px; }

/* ── Top row: 3 stat cards ───────────────────────────── */
.stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }

.scard {
  background: var(--card); border-radius: 18px;
  padding: 20px 22px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 14px;
  border: 1px solid rgba(0,0,0,0.04);
  position: relative; overflow: hidden;
}
.scard-head { display: flex; align-items: flex-start; justify-content: space-between; }
.scard-icon {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.scard-arrow {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: var(--bg); border: 1px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; justify-content: center;
  color: var(--text3); transition: all 0.18s; cursor: pointer;
}
.scard-arrow:hover { background: var(--green); color: #fff; border-color: var(--green); }
.scard-title { font-size: 11.5px; font-weight: 600; color: var(--text3); margin-top: 12px; text-transform: uppercase; letter-spacing: .5px; }
.scard-val   { font-size: 36px; font-weight: 900; color: var(--text); line-height: 1; margin-top: 4px; }
.scard-foot  { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.05); }
.scard-sub   { font-size: 11px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
.trend-up    { color: #16a34a; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 2px; }
.trend-down  { color: var(--red); font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 2px; }
.tag {
  padding: 3px 9px; border-radius: 99px; font-size: 10.5px; font-weight: 700;
  background: var(--bg); color: var(--text2);
}

/* ── Main grid row ────────────────────────────────────── */
.main-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

/* ── Card base ────────────────────────────────────────── */
.card {
  background: var(--card); border-radius: 18px;
  padding: 20px 22px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
}
.card-title  { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.card-eyebrow {
  font-size: 10px; font-weight: 700; color: var(--text3);
  text-transform: uppercase; letter-spacing: .8px; margin-bottom: 2px;
}
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

/* ── Task-progress-style: Attendance bars ─────────────── */
.att-big   { font-size: 48px; font-weight: 900; color: var(--text); line-height: 1; }
.att-trend { font-size: 14px; font-weight: 700; }

.day-bars { display: flex; gap: 8px; align-items: flex-end; height: 80px; margin: 16px 0 8px; }
.day-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.day-bar {
  width: 100%; border-radius: 8px 8px 0 0;
  position: relative; overflow: hidden;
  transition: all 0.3s;
}
.day-bar--ok   { background: var(--green); }
.day-bar--skip { background: var(--red); opacity: 0.75; }
.day-bar-lbl   { font-size: 9.5px; color: var(--text3); font-weight: 600; }

.att-legend { display: flex; gap: 14px; font-size: 11px; color: var(--text3); margin-top: 8px; }
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; }

/* ── Donut-style payment ──────────────────────────────── */
.pay-donut-wrap { display: flex; align-items: center; gap: 18px; margin-bottom: 16px; }
.pay-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.pay-legend-item { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
.pay-legend-label { display: flex; align-items: center; gap: 6px; color: var(--text2); font-weight: 600; }
.pay-legend-val   { font-weight: 700; color: var(--text); }

.pay-list { display: flex; flex-direction: column; gap: 8px; }
.pay-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 13px; border-radius: 11px;
  border: 1px solid transparent; transition: all 0.18s; cursor: pointer;
}
.pay-item:hover { transform: translateX(2px); }
.pay-item--ok  { background: rgba(20,184,166,0.06); border-color: rgba(20,184,166,0.18); }
.pay-item--due { background: rgba(220,38,38,0.06); border-color: rgba(220,38,38,0.18); }
.pay-name   { font-size: 12px; font-weight: 600; color: var(--text); }
.pay-status { font-size: 10.5px; font-weight: 700; margin-top: 2px; }
.pay-ok  { color: #16a34a; }
.pay-due { color: var(--red); }
.pay-amt  { font-size: 12px; font-weight: 700; color: var(--text2); }

/* ── Chart card ───────────────────────────────────────── */
.chart-row { display: grid; grid-template-columns: 1.7fr 1fr; gap: 16px; }

.tab-group { display: flex; gap: 5px; }
.tab {
  padding: 5px 12px; border-radius: 8px;
  font-size: 11px; font-weight: 700; color: var(--text3);
  background: var(--bg); transition: all 0.18s;
}
.tab--on { background: var(--text); color: #fff; }

.sbadges { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.sbadge  { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.sbadge-val {
  width: 40px; height: 40px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12.5px; font-weight: 800;
  background: var(--bg); color: var(--text2);
  border: 1.5px solid rgba(0,0,0,0.06);
}
.sbadge-val--hi { background: var(--green-light); color: var(--green); border-color: rgba(15,118,110,0.2); }
.sbadge-val--lo { background: var(--red-light); color: var(--red); border-color: rgba(220,38,38,0.2); }
.sbadge-lbl { font-size: 9px; color: var(--text3); font-weight: 600; }

/* ── Announcements ────────────────────────────────────── */
.ann-list { display: flex; flex-direction: column; gap: 10px; }
.ann-item {
  padding: 12px 14px; border-radius: 12px;
  background: var(--bg); border: 1px solid rgba(0,0,0,0.04);
  cursor: pointer; transition: all 0.18s;
}
.ann-item:hover { background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.ann-row  { display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 3px; }
.ann-ttl  { font-size: 12.5px; font-weight: 700; color: var(--text); }
.ann-desc { font-size: 11px; color: var(--text3); line-height: 1.4; margin-bottom: 4px; }
.ann-date { font-size: 10px; color: var(--text3); display: flex; align-items: center; gap: 3px; }
.ann-tag  { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 99px; white-space: nowrap; flex-shrink: 0; }
.ann-tag--urgent { background: var(--red-light);   color: var(--red);    }
.ann-tag--info   { background: var(--blue-light);  color: var(--blue);   }
.ann-tag--normal { background: var(--bg);          color: var(--text3);  border: 1px solid rgba(0,0,0,0.08); }

/* ── Messages row ─────────────────────────────────────── */
.msg-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.msg-item {
  padding: 14px 15px; border-radius: 14px;
  background: var(--bg); border: 1px solid rgba(0,0,0,0.05);
  display: flex; gap: 11px; align-items: flex-start;
  cursor: pointer; transition: all 0.18s;
}
.msg-item:hover { background: #fff; box-shadow: 0 3px 14px rgba(0,0,0,0.08); transform: translateY(-1px); }
.msg-item--unread { background: rgba(37,99,235,0.04); border-color: rgba(37,99,235,0.12); }
.msg-av {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #fff;
  box-shadow: 0 4px 10px rgba(15,118,110,0.22);
}
.msg-body { flex: 1; overflow: hidden; }
.msg-top  { display: flex; justify-content: space-between; margin-bottom: 3px; align-items: baseline; }
.msg-from { font-size: 12.5px; font-weight: 700; color: var(--text); }
.msg-time { font-size: 10px; color: var(--text3); }
.msg-txt  { font-size: 11.5px; color: var(--text3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.4; }
.msg-dot  { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 6px rgba(37,99,235,0.5); }

/* link button */
.link-btn { font-size: 12px; font-weight: 700; color: var(--green); display: flex; align-items: center; gap: 3px; }
.link-btn:hover { text-decoration: underline; }
.icon-btn {
  width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
  background: var(--text); color: #fff;
  display: flex; align-items: center; justify-content: center;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 1100px) {
  .stat-row  { grid-template-columns: 1fr 1fr 1fr; }
  .main-row  { grid-template-columns: 1fr 1fr; }
  .chart-row { grid-template-columns: 1fr; }
  .msg-row   { grid-template-columns: 1fr 1fr; }
  .hero-stats { display: none; }
}

@media (max-width: 768px) {
  .page { padding: 16px; gap: 14px; }
  .topnav { padding: 0 16px; }
  .topnav__nav { display: none; }
  .pname, .prole { display: none; }
  .hero { padding: 20px; }
  .hero-name { font-size: 19px; }
  .stat-row  { grid-template-columns: 1fr; }
  .main-row  { grid-template-columns: 1fr; }
  .chart-row { grid-template-columns: 1fr; }
  .msg-row   { grid-template-columns: 1fr; }
  .ph-actions { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const monthlyGrades = [
  { b:"Jul",v:78 },{ b:"Agu",v:82 },{ b:"Sep",v:79 },
  { b:"Okt",v:85 },{ b:"Nov",v:88 },{ b:"Des",v:91 },
];
const subjects = [
  { s:"Mat",v:88 },{ s:"IPA",v:92 },{ s:"IPS",v:75 },
  { s:"B.Ing",v:85 },{ s:"B.Ind",v:90 },{ s:"PKn",v:78 },
];
const announcements = [
  { id:1, title:"Ujian Tengah Semester", date:"5 Des 2024",  type:"urgent", desc:"UTS akan dilaksanakan mulai 9 Desember 2024." },
  { id:2, title:"Pentas Seni Sekolah",   date:"10 Des 2024", type:"info",   desc:"Pentas seni tahunan digelar di aula sekolah." },
  { id:3, title:"Libur Nasional",        date:"15 Des 2024", type:"normal", desc:"Sekolah libur pada tanggal 25 Desember 2024." },
];
const messages = [
  { id:1, from:"Wali Kelas",      av:"W", t:"10:30",   txt:"Ada info jadwal belajar tambahan minggu ini.",  unread:true },
  { id:2, from:"Guru Matematika", av:"M", t:"09:15",   txt:"Nilai ulangan harian sudah diinput di sistem.", unread:true },
  { id:3, from:"TU Sekolah",      av:"T", t:"Kemarin", txt:"Pengingat pembayaran SPP bulan Desember.",      unread:false },
];
const payments = [
  { label:"SPP Desember 2024", ok:false, status:"Belum Bayar", amount:"Rp 350.000" },
  { label:"SPP November 2024", ok:true,  status:"Lunas",       amount:"Rp 350.000" },
  { label:"Kegiatan Sekolah",  ok:true,  status:"Lunas",       amount:"Rp 150.000" },
];
const navItems = [
  { icon:LayoutDashboard, label:"Dashboard",   id:"dashboard" },
  { icon:Users,           label:"Anak Saya",   id:"anak" },
  { icon:BookCheck,       label:"Laporan",     id:"laporan" },
  { icon:Settings,        label:"Pengaturan",  id:"pengaturan", badge:2 },
];
const payDonut = [{ name:"Lunas", value:2, fill:"#14b8a6" },{ name:"Belum", value:1, fill:"#dc2626" }];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ParentDashboard() {
  const user = usePage<PageProps>().props.auth.user;
  const displayName = user?.name || user?.username || user?.email || "Pengguna";
  const roleLabel = user?.role_id === "RL03" ? "Wali Murid" : "Pengguna";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  const [active, setActive] = useState("dashboard");
  const handleLogout = () => router.post(route("logout"));

  const handleNav = (id: string) => {
    if (id === "anak")    { router.visit(route("parents.anak"));    return; }
    if (id === "laporan") { router.visit(route("parents.laporan")); return; }
    setActive(id);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="root">

        {/* ════ TOPNAV ════ */}
        <nav className="topnav">
          {/* Brand */}
          <div className="topnav__brand">
            <div className="topnav__brand-icon">
              <BookOpen size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div className="topnav__brand-name">EduConnect</div>
              <div className="topnav__brand-sub">Parent Portal</div>
            </div>
          </div>

          {/* Nav pills */}
          <div className="topnav__nav">
            {navItems.map(({ icon: Icon, label, id, badge }) => (
              <button
                key={id}
                className={`topnav__nav-item ${active === id ? "topnav__nav-item--active" : ""}`}
                onClick={() => handleNav(id)}
              >
                <Icon size={15} strokeWidth={active === id ? 2.5 : 1.8} />
                {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </button>
            ))}
          </div>

          <div className="topnav__gap" />

          {/* Actions */}
          <div className="topnav__actions">
            <button className="topnav__icon-btn">
              <Settings size={16} strokeWidth={1.8} />
            </button>
            <button className="topnav__icon-btn">
              <Bell size={16} strokeWidth={1.8} />
              <span className="bell-dot" />
            </button>
            <button className="topnav__icon-btn" onClick={handleLogout} title="Keluar">
              <LogOut size={16} strokeWidth={1.8} />
            </button>
            <div className="topnav__profile">
              <div>
                <div className="pname">{displayName}</div>
                <div className="prole">{roleLabel}</div>
              </div>
              <div className="av av-sm">{initials}</div>
            </div>
          </div>
        </nav>

        {/* ════ PAGE ════ */}
        <div className="page">

          {/* Heading */}
          <div className="ph">
            <div>
              <div className="ph-title">Ringkasan Perkembangan Anak</div>
              <div className="ph-sub">Update terakhir: 4 Maret 2026 · Semester Ganjil 2024/25</div>
            </div>
            <div className="ph-actions">
              <button className="btn-outline"><TrendingUp size={14} /> Lihat Laporan</button>
              <button className="btn-primary"><Plus size={14} /> Tambah Catatan</button>
            </div>
          </div>

          {/* ── Hero: Student card ── */}
          <div className="hero">
            <div className="hero-left">
              <div className="hero-emoji">🧒</div>
              <div>
                <div className="hero-eyebrow">Profil Siswa</div>
                <div className="hero-name">Rizki Fauzi</div>
                <div className="hero-class">Kelas 8A · SMPN 5 Jakarta · NIS 23041</div>
                <div className="hero-badge"><Award size={11} /> Siswa Berprestasi</div>
              </div>
            </div>
            <div className="hero-stats">
              {[
                { val:"96%",  label:"Kehadiran",      badge:"↑ 2%",    bcolor:"#4ade80" },
                { val:"88.5", label:"Rata-rata Nilai", badge:"Sangat Baik", bcolor:"#facc15" },
                { val:"2/3",  label:"SPP Lunas",       badge:"1 Belum Bayar", bcolor:"#f87171" },
              ].map(s => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-val">{s.val}</div>
                  <div className="hero-stat-label">{s.label}</div>
                  <div className="hero-stat-badge" style={{ color: s.bcolor }}>{s.badge}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3 stat cards (like Cognify top row) ── */}
          <div className="stat-row">

            {/* Kehadiran card */}
            <div className="scard">
              <div className="scard-head">
                <div className="scard-icon" style={{ background:"rgba(15,118,110,0.1)", color:"var(--green)" }}>
                  <ClipboardList size={20} />
                </div>
                <button className="scard-arrow"><ArrowUpRight size={14} /></button>
              </div>
              <div className="scard-title">Total Kehadiran</div>
              <div className="scard-val">23<span style={{ fontSize:18, color:"var(--text3)", fontWeight:600 }}>/26</span></div>
              <div className="scard-foot">
                <span className="scard-sub">Hari sekolah bulan ini</span>
                <span className="trend-up"><TrendingUp size={11} /> 2%</span>
              </div>
            </div>

            {/* Nilai card */}
            <div className="scard">
              <div className="scard-head">
                <div className="scard-icon" style={{ background:"rgba(37,99,235,0.1)", color:"var(--blue)" }}>
                  <Star size={20} />
                </div>
                <button className="scard-arrow"><ArrowUpRight size={14} /></button>
              </div>
              <div className="scard-title">Rata-rata Nilai</div>
              <div className="scard-val">88.5</div>
              <div className="scard-foot">
                <span className="scard-sub">Semester Ganjil 2024</span>
                <span className="tag">Sangat Baik</span>
              </div>
            </div>

            {/* Pembayaran card */}
            <div className="scard">
              <div className="scard-head">
                <div className="scard-icon" style={{ background:"rgba(220,38,38,0.1)", color:"var(--red)" }}>
                  <Wallet size={20} />
                </div>
                <button className="scard-arrow"><ArrowUpRight size={14} /></button>
              </div>
              <div className="scard-title">Tagihan Aktif</div>
              <div className="scard-val">1</div>
              <div className="scard-foot">
                <span className="scard-sub">SPP Desember 2024</span>
                <span className="trend-down"><TrendingDown size={11} /> Belum Bayar</span>
              </div>
            </div>
          </div>

          {/* ── Main 3-col row (like Cognify bottom) ── */}
          <div className="main-row">

            {/* Attendance bars (like Task Progress) */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Kehadiran Minggu Ini</div>
                  <div className="card-title">Absensi Harian</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#16a34a", display:"flex", alignItems:"center", gap:4 }}>
                    <CheckCircle2 size={13} /> 4 dari 5 hari
                  </div>
                </div>
              </div>

              {/* Big percentage */}
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <div className="att-big">80<span style={{ fontSize:20, color:"var(--text3)", fontWeight:600 }}>%</span></div>
                <div className="att-trend" style={{ color:"var(--gold)" }}>↑ Minggu Lalu</div>
              </div>

              {/* Bars */}
              <div className="day-bars">
                {[
                  { d:"Sen", h:95, ok:true  },
                  { d:"Sel", h:95, ok:true  },
                  { d:"Rab", h:30, ok:false },
                  { d:"Kam", h:95, ok:true  },
                  { d:"Jum", h:95, ok:true  },
                ].map(d => (
                  <div key={d.d} className="day-bar-wrap">
                    <div className={`day-bar ${d.ok?"day-bar--ok":"day-bar--skip"}`} style={{ height:`${d.h}%` }} />
                    <span className="day-bar-lbl">{d.d}</span>
                  </div>
                ))}
              </div>
              <div className="att-legend">
                <span><span className="dot" style={{ background:"var(--green)" }} />Hadir</span>
                <span><span className="dot" style={{ background:"var(--red)", opacity:.75 }} />Izin/Sakit</span>
              </div>

              {/* Monthly summary */}
              <div style={{ display:"flex", gap:16, marginTop:14, paddingTop:14, borderTop:"1px solid rgba(0,0,0,0.05)" }}>
                {[{ l:"Hadir",v:"23",c:"var(--green)" },{ l:"Sakit",v:"1",c:"var(--gold)" },{ l:"Alpa",v:"0",c:"var(--red)" }].map(x=>(
                  <div key={x.l}>
                    <div style={{ fontSize:18, fontWeight:800, color:x.c }}>{x.v}</div>
                    <div style={{ fontSize:10, color:"var(--text3)", fontWeight:600 }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Status-style: Nilai per mapel */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Perkembangan Nilai</div>
                  <div className="card-title">Status per Mapel</div>
                </div>
                <div className="tab-group">
                  {["KKM","Nilai"].map((t,i)=>(
                    <button key={t} className={`tab ${i===1?"tab--on":""}`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Radial visual */}
              <div style={{ display:"flex", justifyContent:"center", margin:"8px 0" }}>
                <ResponsiveContainer width={160} height={160}>
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    data={[
                      { name:"Mat",   val:88, fill:"#0f766e" },
                      { name:"IPA",   val:92, fill:"#2563eb" },
                      { name:"IPS",   val:75, fill:"#d4a017" },
                      { name:"B.Ing", val:85, fill:"#14b8a6" },
                    ]}
                    startAngle={90} endAngle={-270}
                  >
                    <RadialBar dataKey="val" background={{ fill:"#f1f5f9" }} cornerRadius={4} />
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize:22, fontWeight:900, fill:"var(--text)" }}>88.5</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize:10, fill:"var(--text3)", fontWeight:600 }}>Rata-rata</text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Progress bars per mapel */}
              {subjects.slice(0,4).map(g => (
                <div key={g.s} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11.5, fontWeight:600, color:"var(--text2)" }}>{g.s}</span>
                    <span style={{ fontSize:11.5, fontWeight:800, color: g.v>=85?"var(--green)":g.v>=75?"var(--gold)":"var(--red)" }}>{g.v}%</span>
                  </div>
                  <div style={{ height:6, borderRadius:99, background:"var(--bg)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:99, width:`${g.v}%`, background: g.v>=85?"var(--green)":g.v>=75?"var(--gold)":"var(--red)", transition:"width 0.6s" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Payment status */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Status Pembayaran</div>
                  <div className="card-title">SPP & Kegiatan</div>
                </div>
                <button className="scard-arrow"><ArrowUpRight size={14} /></button>
              </div>

              {/* Mini donut */}
              <div className="pay-donut-wrap">
                <ResponsiveContainer width={90} height={90}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={28} outerRadius={42}
                    data={payDonut} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" background={{ fill:"#f1f5f9" }} cornerRadius={4} />
                    <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize:14, fontWeight:900, fill:"var(--text)" }}>2/3</text>
                    <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize:8, fill:"var(--text3)" }}>Lunas</text>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pay-legend">
                  <div className="pay-legend-item">
                    <span className="pay-legend-label"><span className="dot" style={{ background:"#14b8a6" }} />Lunas</span>
                    <span className="pay-legend-val">2</span>
                  </div>
                  <div className="pay-legend-item">
                    <span className="pay-legend-label"><span className="dot" style={{ background:"#dc2626" }} />Belum</span>
                    <span className="pay-legend-val">1</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
                    Total: <b style={{ color:"var(--text)" }}>Rp 850.000</b>
                  </div>
                </div>
              </div>

              <div className="pay-list">
                {payments.map(p => (
                  <div key={p.label} className={`pay-item ${p.ok?"pay-item--ok":"pay-item--due"}`}>
                    <div>
                      <div className="pay-name">{p.label}</div>
                      <div className={`pay-status ${p.ok?"pay-ok":"pay-due"}`}>{p.status}</div>
                    </div>
                    <div className="pay-amt">{p.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Chart + Announcements ── */}
          <div className="chart-row">

            {/* Area chart */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Tren Nilai Bulanan</div>
                  <div className="card-title">Perkembangan Akademik · Rata-rata <span style={{ color:"var(--green)" }}>88.5</span></div>
                </div>
                <div className="tab-group">
                  {["Semester","Bulan","Minggu"].map((t,i)=>(
                    <button key={t} className={`tab ${i===1?"tab--on":""}`}>{t}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={monthlyGrades} margin={{ top:4, right:4, left:-18, bottom:0 }}>
                  <defs>
                    <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f766e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="b" tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60,100]} tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background:"#fff", border:"1px solid rgba(15,118,110,0.15)", borderRadius:10, fontSize:12 }} cursor={{ stroke:"rgba(15,118,110,0.15)" }} />
                  <Area type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2.5} fill="url(#gg)" dot={{ fill:"#0f766e", r:4, strokeWidth:0 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="sbadges">
                {subjects.map(g => (
                  <div key={g.s} className="sbadge">
                    <div className={`sbadge-val ${g.v>=88?"sbadge-val--hi":g.v<78?"sbadge-val--lo":""}`}>{g.v}</div>
                    <span className="sbadge-lbl">{g.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Pengumuman Sekolah</div>
                  <div className="card-title">Terbaru</div>
                </div>
                <div className="icon-btn"><Plus size={13} color="#fff" /></div>
              </div>
              <div className="ann-list">
                {announcements.map(a => (
                  <div key={a.id} className="ann-item">
                    <div className="ann-row">
                      <span className="ann-ttl">{a.title}</span>
                      <span className={`ann-tag ann-tag--${a.type}`}>
                        {a.type==="urgent"?"Penting":a.type==="info"?"Info":"Umum"}
                      </span>
                    </div>
                    <p className="ann-desc">{a.desc}</p>
                    <div className="ann-date"><Clock size={9} />{a.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-eyebrow">Komunikasi</div>
                <div className="card-title">Pesan Terbaru</div>
              </div>
              <button className="link-btn">Lihat Semua <ChevronRight size={13} /></button>
            </div>
            <div className="msg-row">
              {messages.map(m => (
                <div key={m.id} className={`msg-item ${m.unread?"msg-item--unread":""}`}>
                  <div className="msg-av">{m.av}</div>
                  <div className="msg-body">
                    <div className="msg-top">
                      <span className="msg-from">{m.from}</span>
                      <span className="msg-time">{m.t}</span>
                    </div>
                    <p className="msg-txt">{m.txt}</p>
                  </div>
                  {m.unread && <span className="msg-dot" />}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}