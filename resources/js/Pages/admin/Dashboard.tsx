import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
  LayoutDashboard, BookOpen, Users, CalendarDays,
  CreditCard, Bell, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight, Plus, Search, GraduationCap,
  CheckCircle2, AlertCircle, Clock, TrendingUp,
  Award, Star, X, Menu, FileText, ShieldUser,
  BookOpenCheck, Info,
  Badge,
  Handshake,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import GuruPage from "./GuruPage";
import MitraPage from "./MitraPage";
import WaliMuridPage from "./WalimuridPage";
import SiswaPage from "./SiswaPage";
import InfoPage from "./InfoPage";
import AgendaPage from "./AgendaPage";
import ProgressPage from "./ProgressPage";
import PengaturanPage from "./PengaturanPage";

/* ═══════════════════════════════════════════════
   STYLES — injected as a <style> tag
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { cursor: pointer; font-family: inherit; border: none; }
input  { font-family: inherit; outline: none; border: none; }

:root {
  --green:        #0f766e;
  --green-mid:    #14b8a6;
  --green-light:  #ccfbf1;
  --blue:         #2563eb;
  --blue-light:   #dbeafe;
  --gold:         #d4a017;
  --gold-light:   #fef9c3;
  --red:          #dc2626;
  --red-light:    #fee2e2;

  --sidebar-bg:   #0f766e;
  --sw:           238px;
  --sw-col:       68px;
  --gap:          14px;
  --tbh:          60px;
  --pad:          18px;

  --text:         #1e293b;
  --text-2:       #475569;
  --text-3:       #94a3b8;

  --card:         rgba(255,255,255,0.7);
  --card-b:       rgba(255,255,255,0.92);
  --card-sh:      0 2px 20px rgba(15,118,110,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);

  font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
}

/* ── Root ── */
.root {
  min-height: 100vh;
  background: linear-gradient(150deg, #f0fdf9 0%, #eff6ff 40%, #fefce8 75%, #f0fdf9 100%);
  position: relative;
  overflow-x: hidden;
}

/* ambient blobs */
.blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
.b1   { width:480px; height:480px; top:-100px; left:5%;  background:rgba(15,118,110,0.11); }
.b2   { width:320px; height:320px; bottom:0;   right:5%; background:rgba(37,99,235,0.08); }
.b3   { width:280px; height:280px; top:45%;    left:45%; background:rgba(212,160,23,0.07); }

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
.sb {
  position:fixed; left:var(--gap); top:var(--gap); bottom:var(--gap);
  z-index:100; display:flex; flex-direction:column;
  padding:22px 10px 18px;
  background:var(--sidebar-bg);
  border-radius:22px;
  box-shadow:0 16px 48px rgba(15,118,110,0.38), 0 2px 8px rgba(15,118,110,0.2), inset 1px 0 0 rgba(255,255,255,0.1);
  overflow:hidden;
  transition:width 0.3s cubic-bezier(.4,0,.2,1);
}
.sb::before {
  content:""; position:absolute; inset:0;
  background:linear-gradient(170deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events:none; border-radius:inherit;
}
.sb--open { width:var(--sw); }
.sb--col  { width:var(--sw-col); }

/* brand */
.sb-brand {
  display:flex; align-items:center; gap:10px;
  padding:4px 4px 20px; overflow:hidden;
}
.sb-icon {
  width:40px; height:40px; border-radius:12px; flex-shrink:0;
  background:rgba(255,255,255,0.18);
  border:1.5px solid rgba(255,255,255,0.28);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 12px rgba(0,0,0,0.18);
}
.sb-icon-sm { width:34px; height:34px; border-radius:10px; }
.sb-name { color:#fff; font-weight:800; font-size:14.5px; line-height:1; white-space:nowrap; }
.sb-sub  { color:rgba(255,255,255,0.5); font-size:10px; margin-top:3px; white-space:nowrap; }

/* hide text when collapsed */
.sb--col .sb-name, .sb--col .sb-sub,
.sb--col .ni-label, .sb--col .ni-badge,
.sb--col .sb-logout span { display:none; }
.sb--col .sb-brand { padding-bottom:14px; }

/* toggle */
.sb-toggle {
  background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
  border-radius:9px; color:rgba(255,255,255,0.75);
  width:27px; height:27px;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; align-self:flex-end; margin-bottom:10px;
  transition:background 0.2s;
}
.sb-toggle:hover { background:rgba(255,255,255,0.22); }
.sb--col .sb-toggle { align-self:center; }

/* nav */
.sb-nav { display:flex; flex-direction:column; gap:2px; }
.ni {
  display:flex; align-items:center; gap:10px;
  padding:10px 10px; border-radius:11px;
  background:transparent; color:rgba(255,255,255,0.62);
  transition:all 0.18s; width:100%; text-align:left;
  position:relative; flex-shrink:0; white-space:nowrap;
}
.ni:hover { background:rgba(255,255,255,0.1); color:#fff; }
.ni--on {
  background:rgba(255,255,255,0.17); color:#fff; font-weight:700;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);
}
.ni--on::before {
  content:""; position:absolute; left:0; top:22%; height:56%;
  width:3px; border-radius:2px;
  background:linear-gradient(180deg,#facc15,#d4a017);
}
.ni-icon { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:20px; }
.ni-label { font-size:12.5px; flex:1; }
.ni-badge {
  background:var(--red); border-radius:99px;
  min-width:17px; height:17px;
  display:flex; align-items:center; justify-content:center;
  font-size:9px; font-weight:800; color:#fff;
}

.sb-spacer { flex:1; }

.sb-logout {
  display:flex; align-items:center; gap:10px;
  padding:10px 10px; border-radius:11px;
  color:rgba(255,255,255,0.45); background:transparent;
  width:100%; font-size:12.5px;
  border-top:1px solid rgba(255,255,255,0.1);
  padding-top:14px; margin-top:6px;
  transition:all 0.18s;
}
.sb-logout:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.08); }

/* ══════════════════════════════════════════════
   MOBILE DRAWER
══════════════════════════════════════════════ */
.mob-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(15,23,42,0.42);
  backdrop-filter:blur(5px); z-index:200;
}
.mob-overlay--show { display:block; }

.mob-drawer {
  position:fixed; left:0; top:0; bottom:0; width:265px;
  z-index:201; display:flex; flex-direction:column;
  padding:28px 12px 22px;
  background:var(--sidebar-bg);
  border-top-right-radius:24px; border-bottom-right-radius:24px;
  box-shadow:14px 0 48px rgba(15,118,110,0.38);
  transform:translateX(-100%);
  transition:transform 0.3s cubic-bezier(.4,0,.2,1);
}
.mob-drawer::before {
  content:""; position:absolute; inset:0;
  background:linear-gradient(170deg, rgba(255,255,255,0.08) 0%, transparent 50%);
  pointer-events:none; border-radius:inherit;
}
.mob-drawer--open { transform:translateX(0); }
.mob-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
.mob-close {
  background:rgba(255,255,255,0.12); border-radius:9px; padding:7px;
  color:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center;
}
.drawer-ni {
  gap:13px; padding:13px 12px; border-radius:12px;
}
.mob-profile {
  display:flex; align-items:center; gap:9px;
  padding:11px 10px; border-radius:12px;
  background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
  margin-top:8px;
}

/* ══════════════════════════════════════════════
   TOPBAR — single unified frosted bar
══════════════════════════════════════════════ */
.topbar {
  position:fixed; top:var(--gap); right:var(--pad); z-index:99;
  display:flex; align-items:center; gap:10px;
  height:var(--tbh);
  background:rgba(255,255,255,0.68);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1.5px solid rgba(255,255,255,0.9);
  border-radius:18px;
  box-shadow:0 4px 24px rgba(15,118,110,0.1), inset 0 1px 0 #fff;
  padding:0 14px 0 16px;
  transition:left 0.3s cubic-bezier(.4,0,.2,1);
}
.tb--open { left:calc(var(--gap) + var(--sw) + 16px); }
.tb--col  { left:calc(var(--gap) + var(--sw-col) + 16px); }

.tb-hamburger {
  display:none; width:36px; height:36px; border-radius:10px;
  background:rgba(15,118,110,0.08); flex-shrink:0;
  align-items:center; justify-content:center;
  color:var(--text); transition:background 0.2s;
}
.tb-hamburger:hover { background:rgba(15,118,110,0.14); }

.tb-greeting { display:flex; flex-direction:column; flex-shrink:0; }
.tb-sub  { color:var(--text-3); font-size:9.5px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
.tb-name { color:var(--text); font-weight:800; font-size:15.5px; line-height:1.2; }
.wave    { color:var(--gold); }

.tb-gap { flex:1; }

.tb-search {
  display:flex; align-items:center; gap:8px;
  padding:0 13px; height:36px; width:200px; flex-shrink:0;
  background:rgba(15,118,110,0.06);
  border:1px solid rgba(15,118,110,0.12);
  border-radius:11px;
}
.tb-search input { background:transparent; color:var(--text); font-size:12.5px; width:100%; }
.tb-search input::placeholder { color:var(--text-3); }

.tb-bell {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  background:rgba(15,118,110,0.06); border:1px solid rgba(15,118,110,0.1);
  display:flex; align-items:center; justify-content:center;
  position:relative;
}
.bell-dot {
  position:absolute; top:7px; right:7px;
  width:7px; height:7px; border-radius:50%;
  background:var(--red); box-shadow:0 0 7px rgba(220,38,38,0.85);
}

.tb-divider { width:1px; height:28px; background:rgba(15,118,110,0.12); flex-shrink:0; }

.tb-profile { display:flex; align-items:center; gap:8px; cursor:pointer; flex-shrink:0; }
.av {
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:800; color:#fff; flex-shrink:0;
  background:linear-gradient(135deg, var(--green), var(--blue));
  box-shadow:0 3px 10px rgba(15,118,110,0.28);
}
.av-sm { width:32px; height:32px; font-size:12px; }
.av-md { width:36px; height:36px; font-size:13px; }
.tb-pname { color:var(--text); font-weight:700; font-size:12.5px; white-space:nowrap; }
.tb-prole { color:var(--text-3); font-size:10px; }

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
.main {
  min-height:100vh; position:relative; z-index:1;
  padding-top:calc(var(--gap) + var(--tbh) + 14px);
  padding-bottom:20px; padding-right:var(--pad); padding-left:var(--pad);
  display:flex; flex-direction:column; gap:16px;
  transition:margin-left 0.3s cubic-bezier(.4,0,.2,1);
}
.main--open { margin-left:calc(var(--gap) + var(--sw) + 16px); }
.main--col  { margin-left:calc(var(--gap) + var(--sw-col) + 16px); }

/* Page title */
.ph { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:10px; }
.ph-title { color:var(--text); font-size:21px; font-weight:800; line-height:1; }
.ph-sub   { color:var(--text-3); font-size:11px; margin-top:4px; }
.ph-btns  { display:flex; gap:8px; }
.btn-ghost {
  display:flex; align-items:center; gap:5px;
  padding:8px 14px; border-radius:10px; font-size:12px; font-weight:700;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(255,255,255,0.9);
  color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,0.04);
  transition:all 0.18s;
}
.btn-ghost:hover { background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.08); }
.btn-solid {
  display:flex; align-items:center; gap:5px;
  padding:8px 14px; border-radius:10px; font-size:12px; font-weight:700;
  background:linear-gradient(135deg, var(--green), var(--blue));
  color:#fff;
  box-shadow:0 4px 14px rgba(15,118,110,0.32);
  transition:all 0.18s;
}
.btn-solid:hover { box-shadow:0 6px 20px rgba(15,118,110,0.42); transform:translateY(-1px); }

/* ── Glass card ── */
.card {
  background:var(--card);
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border:1.5px solid var(--card-b); border-radius:18px;
  box-shadow:var(--card-sh);
  padding:18px 20px;
}

/* ── Stat strip ── */
.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.sc { display:flex; align-items:center; gap:13px; }
.sc-icon {
  width:46px; height:46px; border-radius:13px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.sc-val   { font-size:28px; font-weight:800; line-height:1; }
.sc-label { font-size:11.5px; color:var(--text-2); font-weight:600; margin-top:2px; }
.sc-sub   { font-size:10px; color:var(--text-3); margin-top:1px; }

/* ── Row grids ── */
.g3     { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
.gchart { display:grid; grid-template-columns:1.65fr 1fr; gap:14px; }
.gmsg   { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px; }

/* ── Eyebrow ── */
.eyebrow {
  font-size:10px; font-weight:700; text-transform:uppercase;
  letter-spacing:1px; color:var(--text-3);
}

/* ── Section head ── */
.sh {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:14px;
}
.sh-icon-btn {
  width:24px; height:24px; border-radius:8px;
  background:linear-gradient(135deg, var(--green), var(--blue));
  display:flex; align-items:center; justify-content:center;
}
.sh-link {
  background:none; color:var(--green); font-size:11.5px; font-weight:700;
  padding:0; transition:opacity 0.18s;
}
.sh-link:hover { opacity:.7; }

/* ── Profile card ── */
.pcard-top { display:flex; align-items:center; gap:13px; margin-bottom:14px; }
.stu-emoji {
  width:52px; height:52px; border-radius:15px; flex-shrink:0; font-size:24px;
  background:linear-gradient(135deg, var(--green-mid), var(--blue));
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 8px 20px rgba(20,184,166,0.28);
}
.stu-name  { color:var(--text); font-weight:800; font-size:16px; }
.stu-class { color:var(--text-3); font-size:11px; margin-top:2px; }
.pcard-meta {
  display:flex; gap:18px;
  border-top:1px solid rgba(30,41,59,0.07);
  padding-top:11px; margin-bottom:11px;
}
.meta-l { font-size:9px; text-transform:uppercase; color:var(--text-3); letter-spacing:.5px; }
.meta-v { font-size:12px; font-weight:700; color:var(--text); margin-top:2px; }
.gold-badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:99px;
  background:rgba(212,160,23,0.1); border:1px solid rgba(212,160,23,0.25);
  font-size:10.5px; font-weight:700; color:var(--gold);
}

/* ── Attendance ── */
.att-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
.att-pct  { font-size:30px; font-weight:800; color:var(--text); line-height:1.1; margin-top:4px; }
.att-up   { font-size:13px; color:#16a34a; }
.good-badge {
  display:flex; align-items:center; gap:4px;
  padding:5px 10px; border-radius:99px; font-size:11px; font-weight:700;
  background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.28); color:#16a34a;
}
.days { display:flex; gap:7px; margin-bottom:12px; }
.day  { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.day-box {
  width:100%; height:38px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
}
.day-box--ok { background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.28); color:#16a34a; }
.day-box--no { background:rgba(220,38,38,0.08);  border:1px solid rgba(220,38,38,0.22); color:var(--red); }
.day-lbl  { font-size:9.5px; color:var(--text-3); }
.att-stat { display:flex; gap:14px; font-size:11px; color:var(--text-3); flex-wrap:wrap; }

/* ── Payment ── */
.pay-list { display:flex; flex-direction:column; gap:9px; }
.pay-row  {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; border-radius:11px;
  border:1px solid transparent;
}
.pay-row--ok  { background:rgba(20,184,166,0.06); border-color:rgba(20,184,166,0.2); }
.pay-row--due { background:rgba(220,38,38,0.06);  border-color:rgba(220,38,38,0.18); }
.pay-name   { font-size:11.5px; font-weight:600; color:var(--text); }
.pay-status { font-size:10.5px; font-weight:700; margin-top:2px; }
.pay-ok  { color:#16a34a; }
.pay-due { color:var(--red); }
.pay-amt { font-size:11.5px; font-weight:700; color:var(--text-2); }

/* ── Chart ── */
.ch-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
.ch-title { font-size:15.5px; font-weight:800; color:var(--text); margin-top:3px; }
.tabs { display:flex; gap:5px; }
.tab {
  padding:5px 11px; border-radius:9px; font-size:10.5px; font-weight:700;
  background:rgba(30,41,59,0.06); color:var(--text-3); transition:all 0.18s;
}
.tab--on {
  background:linear-gradient(135deg, var(--green), var(--blue));
  color:#fff; box-shadow:0 3px 10px rgba(15,118,110,0.25);
}
.sbadges { display:flex; gap:8px; margin-top:13px; flex-wrap:wrap; }
.sbadge  { display:flex; flex-direction:column; align-items:center; gap:4px; }
.sbadge-val {
  width:38px; height:38px; border-radius:11px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:800;
  background:rgba(30,41,59,0.05); border:1px solid rgba(30,41,59,0.1); color:var(--text-2);
}
.sbadge-val--hi { background:rgba(15,118,110,0.1); border-color:rgba(15,118,110,0.28); color:var(--green); }
.sbadge-lbl { font-size:9px; color:var(--text-3); }

/* ── Announcements ── */
.ann-list { display:flex; flex-direction:column; gap:10px; }
.ann-item {
  padding:11px 13px; border-radius:12px;
  background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.88);
  cursor:pointer; transition:box-shadow 0.2s;
}
.ann-item:hover { box-shadow:0 4px 16px rgba(15,118,110,0.1); }
.ann-row  { display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:4px; }
.ann-ttl  { font-size:12.5px; font-weight:700; color:var(--text); }
.ann-desc { font-size:10.5px; color:var(--text-3); margin-bottom:5px; line-height:1.4; }
.ann-date { display:flex; align-items:center; gap:4px; font-size:9.5px; color:var(--text-3); }
.ann-tag  { font-size:8.5px; font-weight:700; padding:2px 7px; border-radius:99px; white-space:nowrap; flex-shrink:0; }
.ann-tag--urgent { background:rgba(220,38,38,0.1);  color:var(--red);  border:1px solid rgba(220,38,38,0.22); }
.ann-tag--info   { background:rgba(37,99,235,0.1);  color:var(--blue); border:1px solid rgba(37,99,235,0.2); }
.ann-tag--normal { background:rgba(30,41,59,0.06);  color:var(--text-3); border:1px solid rgba(30,41,59,0.1); }

/* ── Messages ── */
.msg-item {
  padding:12px 13px; border-radius:13px;
  background:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.8);
  display:flex; gap:10px; align-items:flex-start;
  cursor:pointer; transition:all 0.18s;
}
.msg-item:hover { box-shadow:0 4px 16px rgba(15,118,110,0.1); transform:translateY(-1px); }
.msg-item--unread { background:rgba(37,99,235,0.05); border-color:rgba(37,99,235,0.17); }
.msg-av {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  background:linear-gradient(135deg, var(--green), var(--blue));
  display:flex; align-items:center; justify-content:center;
  font-weight:800; font-size:13px; color:#fff;
  box-shadow:0 4px 10px rgba(15,118,110,0.22);
}
.msg-body { flex:1; overflow:hidden; }
.msg-top  { display:flex; justify-content:space-between; margin-bottom:3px; }
.msg-from { font-size:12px; font-weight:700; color:var(--text); }
.msg-time { font-size:9.5px; color:var(--text-3); }
.msg-txt  { font-size:11px; color:var(--text-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.msg-dot  { width:8px; height:8px; border-radius:50%; background:var(--blue); flex-shrink:0; margin-top:4px; box-shadow:0 0 6px rgba(37,99,235,0.5); }

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width:1100px) {
  :root { --sw:200px; }
  .stats  { grid-template-columns:repeat(2,1fr); }
  .g3     { grid-template-columns:1fr 1fr; }
  .gchart { grid-template-columns:1fr; }
  .gmsg   { grid-template-columns:1fr 1fr; }
  .tb-search { width:150px; }
}

@media (max-width:767px) {
  :root { --pad:12px; --tbh:52px; }
  .sb { display:none; }
  .tb-hamburger   { display:flex; }
  .mob-overlay    { display:block; }
  .topbar, .tb--col { left:var(--pad); padding:0 12px; gap:8px; }
  .tb-search, .tb-divider, .tb-pname, .tb-prole { display:none; }
  .tb-greeting { gap:0; }
  .tb-sub  { font-size:8.5px; }
  .tb-name { font-size:13px; }
  .tb-bell { width:34px; height:34px; }
  .main, .main--col {
    margin-left:0;
    padding-left:var(--pad); padding-right:var(--pad);
    padding-top:calc(var(--pad) + var(--tbh) + 10px);
  }
  .stats, .g3, .gchart, .gmsg { grid-template-columns:1fr; }
  .ph { flex-direction:column; align-items:flex-start; }
  .ph-title { font-size:18px; }
  .ph-btns { width:100%; }
  .btn-ghost, .btn-solid { flex:1; justify-content:center; }
}

@media (max-width:400px) {
  .sc-val   { font-size:24px; }
  .att-pct  { font-size:26px; }
  .sbadge-val { width:32px; height:32px; font-size:11px; }
}
`;

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const monthlyGrades = [
  { b:"Jul",v:78 }, { b:"Agu",v:82 }, { b:"Sep",v:79 },
  { b:"Okt",v:85 }, { b:"Nov",v:88 }, { b:"Des",v:91 },
];
const subjects = [
  { s:"Mat",v:88 }, { s:"IPA",v:92 }, { s:"IPS",v:75 },
  { s:"B.Ing",v:85 }, { s:"B.Ind",v:90 }, { s:"PKn",v:78 },
];
const announcements = [
  { id:1, title:"Ujian Tengah Semester", date:"5 Des 2024",  type:"urgent", desc:"UTS dilaksanakan mulai 9 Desember 2024." },
  { id:2, title:"Pentas Seni Sekolah",   date:"10 Des 2024", type:"info",   desc:"Pentas seni tahunan akan digelar di aula sekolah." },
  { id:3, title:"Libur Nasional",        date:"15 Des 2024", type:"normal", desc:"Sekolah libur tanggal 25 Desember 2024." },
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
  { icon:LayoutDashboard, label:"Dashboard",      id:"dashboard"      },
  { icon:CalendarDays,    label:"Agenda",         id:"agenda"         },
  { icon:GraduationCap,   label:"Guru",           id:"guru"           },
  { icon:Handshake,       label:"Mitra",          id:"mitra"          },
  { icon:ShieldUser,      label:"Wali Murid",     id:"wali_murid"     },
  { icon:Users,           label:"Siswa",          id:"siswa", badge:3 },
  { icon:BookOpenCheck,   label:"Progress Siswa", id:"progress_siswa" },
  { icon:Info,            label:"Info",           id:"info"           },
  { icon:Settings,        label:"Pengaturan",     id:"pengaturan"     },
];

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export default function CombinedDashboard() {
  const user = usePage<PageProps>().props.auth.user;
  const displayName = user?.name || user?.username || user?.email || "Pengguna";
  const roleLabel = user?.role_id === "RL01" ? "Admin" : "Pengguna";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  const [active,  setActive]  = useState(() => {
    if (typeof window === "undefined") return "dashboard";
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab === "guru" ? "guru" : "dashboard";
  });
  const [col,     setCol]     = useState(false);
  const [drawer,  setDrawer]  = useState(false);

  const handleLogout = () => {
    router.post(route("logout"));
  };

  const nav = (id: string) => {
    setActive(id);
    setDrawer(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("tab", id);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    }
  };

  const NavList = ({ drawer: isDrawer }: { drawer?: boolean }) => (
    <nav className="sb-nav">
      {navItems.map(({ icon: Icon, label, id, badge }) => {
        const on = active === id;
        return (
          <button key={id} className={`ni ${isDrawer ? "drawer-ni" : ""} ${on ? "ni--on" : ""}`} onClick={() => nav(id)}>
            <span className="ni-icon"><Icon size={isDrawer ? 18 : 17} strokeWidth={on ? 2.5 : 1.8} /></span>
            <span className="ni-label">{label}</span>
            {badge && <span className="ni-badge">{badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="root">

        {/* blobs */}
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />

        {/* ════ SIDEBAR ════ */}
        <aside className={`sb ${col ? "sb--col" : "sb--open"}`}>
          <div className="sb-brand">
            <div className="sb-icon"><BookOpen size={20} color="#fff" strokeWidth={2.5} /></div>
            <div style={{ overflow:"hidden" }}>
              <div className="sb-name">EduConnect</div>
              <div className="sb-sub">Parent Portal</div>
            </div>
          </div>

          <button className="sb-toggle" onClick={() => setCol(!col)}>
            {col ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          <NavList />
          <div className="sb-spacer" />

          <button className="sb-logout" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.8} />
            <span>Keluar</span>
          </button>
        </aside>

        {/* ════ MOBILE DRAWER ════ */}
        <div className={`mob-overlay ${drawer ? "mob-overlay--show" : ""}`} onClick={() => setDrawer(false)} />
        <aside className={`mob-drawer ${drawer ? "mob-drawer--open" : ""}`}>
          <div className="mob-head">
            <div className="sb-brand" style={{ paddingBottom:0 }}>
              <div className="sb-icon sb-icon-sm"><BookOpen size={17} color="#fff" strokeWidth={2.5} /></div>
              <div style={{ overflow:"hidden" }}>
                <div className="sb-name">EduConnect</div>
                <div className="sb-sub">Parent Portal</div>
              </div>
            </div>
            <button className="mob-close" onClick={() => setDrawer(false)}><X size={15} /></button>
          </div>

          <NavList drawer />
          <div className="sb-spacer" />

          <div className="mob-profile">
            <div className="av av-md">{initials}</div>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{displayName}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10.5 }}>{roleLabel}</div>
            </div>
          </div>

          <button className="sb-logout drawer-ni" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.8} />
            <span>Keluar</span>
          </button>
        </aside>

        {/* ════ TOPBAR ════ */}
        <header className={`topbar ${col ? "tb--col" : "tb--open"}`}>
          <button className="tb-hamburger" onClick={() => setDrawer(true)}>
            <Menu size={17} />
          </button>

          <div className="tb-greeting">
            <span className="tb-sub">Selamat Datang</span>
            <span className="tb-name">{displayName} <span className="wave">👋</span></span>
          </div>

          <div className="tb-gap" />

          <div className="tb-search">
            <Search size={13} color="var(--text-3)" />
            <input placeholder="Cari sesuatu..." />
          </div>

          <div className="tb-bell">
            <Bell size={15} color="var(--text-2)" />
            <span className="bell-dot" />
          </div>

          <div className="tb-divider" />

          <div className="tb-profile">
            <div className="av av-sm">{initials}</div>
            <div>
              <div className="tb-pname">{displayName}</div>
              <div className="tb-prole">{roleLabel}</div>
            </div>
          </div>
        </header>

        {/* ════ MAIN ════ */}
        <main className={`main ${col ? "main--col" : "main--open"}`}>
          {active === "guru"      ? <GuruPage /> :
          active === "mitra"      ? <MitraPage /> :
          active === "wali_murid" ? <WaliMuridPage /> :
          active === "siswa"      ? <SiswaPage /> :
          active === "info"       ? <InfoPage /> :
          active === "agenda"     ? <AgendaPage /> :
          active === "progress_siswa" ? <ProgressPage /> :
          active === "pengaturan" ? <PengaturanPage /> :
          (
            <>

          {/* Heading */}
          <div className="ph">
            <div>
              <div className="ph-title">Dashboard Orang Tua</div>
              <div className="ph-sub">Update terakhir: 4 Maret 2026</div>
            </div>
            <div className="ph-btns">
              <button className="btn-ghost"><FileText size={13} /> Lihat Laporan</button>
              <button className="btn-solid"><TrendingUp size={13} /> Perkembangan</button>
            </div>
          </div>

          {/* ── Stat strip ── */}
          <div className="stats">
            {[
              { label:"Kehadiran",     value:"96%",  sub:"↑ 2% bulan ini", color:"var(--green)",   bg:"rgba(15,118,110,0.1)", icon:<CheckCircle2 size={18}/> },
              { label:"Rata-rata Nilai",value:"88.5", sub:"Semester Ganjil", color:"var(--blue)",    bg:"rgba(37,99,235,0.1)",  icon:<Star size={18}/> },
              { label:"Tagihan Aktif", value:"1",    sub:"SPP Desember",   color:"var(--red)",     bg:"rgba(220,38,38,0.1)", icon:<CreditCard size={18}/> },
              { label:"Pesan Baru",    value:"2",    sub:"Belum dibaca",   color:"var(--gold)",    bg:"rgba(212,160,23,0.1)", icon:<MessageSquare size={18}/> },
            ].map(s => (
              <div key={s.label} className="card sc">
                <div className="sc-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
                <div>
                  <div className="sc-val" style={{ color:s.color }}>{s.value}</div>
                  <div className="sc-label">{s.label}</div>
                  <div className="sc-sub">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: Profile + Attendance + Payment ── */}
          <div className="g3">

            {/* Profile */}
            <div className="card">
              <div className="pcard-top">
                <div className="stu-emoji">🧒</div>
                <div>
                  <div className="eyebrow" style={{ marginBottom:2 }}>Profil Siswa</div>
                  <div className="stu-name">Rizki Fauzi</div>
                  <div className="stu-class">Kelas 8A · SMPN 5 Jakarta</div>
                </div>
              </div>
              <div className="pcard-meta">
                {[["NIS","23041"],["Semester","Ganjil"],["T.A","2024/25"]].map(([l,v]) => (
                  <div key={l}>
                    <div className="meta-l">{l}</div>
                    <div className="meta-v">{v}</div>
                  </div>
                ))}
              </div>
              <div className="gold-badge"><Award size={11} /> Siswa Berprestasi</div>
            </div>

            {/* Attendance */}
            <div className="card">
              <div className="att-head">
                <div>
                  <div className="eyebrow">Kehadiran Bulan Ini</div>
                  <div className="att-pct">96% <span className="att-up">↑ 2%</span></div>
                </div>
                <div className="good-badge"><CheckCircle2 size={11} /> Sangat Baik</div>
              </div>
              <div className="days">
                {["Sen","Sel","Rab","Kam","Jum"].map((d,i) => (
                  <div key={d} className="day">
                    <div className={`day-box ${i===2?"day-box--no":"day-box--ok"}`}>
                      {i===2 ? <AlertCircle size={13}/> : <CheckCircle2 size={13}/>}
                    </div>
                    <span className="day-lbl">{d}</span>
                  </div>
                ))}
              </div>
              <div className="att-stat">
                <span>Hadir <b style={{ color:"#16a34a" }}>23</b></span>
                <span>Sakit <b style={{ color:"var(--gold)" }}>1</b></span>
                <span>Alpa <b style={{ color:"var(--red)" }}>0</b></span>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <div className="sh">
                <span className="eyebrow">Status Pembayaran</span>
              </div>
              <div className="pay-list">
                {payments.map(p => (
                  <div key={p.label} className={`pay-row ${p.ok?"pay-row--ok":"pay-row--due"}`}>
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

          {/* ── Row 3: Chart + Announcements ── */}
          <div className="gchart">

            {/* Chart */}
            <div className="card">
              <div className="ch-head">
                <div>
                  <div className="eyebrow">Perkembangan Nilai</div>
                  <div className="ch-title">Rata-rata: <span style={{ color:"var(--green)" }}>88.5</span></div>
                </div>
                <div className="tabs">
                  {["Semester","Bulan","Minggu"].map((t,i) => (
                    <button key={t} className={`tab ${i===1?"tab--on":""}`}>{t}</button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={monthlyGrades} margin={{ top:4, right:4, left:-16, bottom:0 }}>
                  <defs>
                    <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f766e" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="b" tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60,100]} tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background:"#fff", border:"1px solid rgba(15,118,110,0.18)", borderRadius:10, fontSize:12, color:"#1e293b" }} cursor={{ stroke:"rgba(15,118,110,0.18)" }} />
                  <Area type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2.5} fill="url(#gg)" dot={{ fill:"#0f766e", r:4, strokeWidth:0 }} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="sbadges">
                {subjects.map(g => (
                  <div key={g.s} className="sbadge">
                    <div className={`sbadge-val ${g.v>=88?"sbadge-val--hi":""}`}>{g.v}</div>
                    <span className="sbadge-lbl">{g.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="card">
              <div className="sh">
                <span className="eyebrow">Pengumuman</span>
                <button className="sh-icon-btn"><Plus size={12} color="#fff" /></button>
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

          {/* ── Row 4: Messages ── */}
          <div className="card">
            <div className="sh">
              <span className="eyebrow">Pesan Terbaru</span>
              <button className="sh-link">Lihat Semua →</button>
            </div>
            <div className="gmsg">
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
            </>
          )}

        </main>
      </div>
    </>
  );
}
