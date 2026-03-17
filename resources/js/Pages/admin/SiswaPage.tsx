import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  GraduationCap, Loader2, AlertCircle, CheckCircle2,
  Calendar, Filter, ChevronDown, Users, FileText,
  ExternalLink, Clock, CheckCheck, XCircle, Check
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type EnrollmentStatus = "active" | "inactive" | "pending";

interface Student {
  id: string;
  parent_id: string | null;
  parent_name: string | null;
  program_id: string | null;
  program_name: string | null;
  nama: string;
  usia: number | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  enrollment_status: EnrollmentStatus;
  bukti_pembayaran: string | null;
  created_at: string | null;
}
interface Meta   { total: number; page: number; per_page: number; last_page: number; }
interface Option { id: string; label: string; }

interface StudentForm {
  parent_id: string;
  program_id: string;
  nama: string;
  usia: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  enrollment_status: EnrollmentStatus;
}

const EMPTY_FORM: StudentForm = {
  parent_id: "", program_id: "", nama: "",
  usia: "", tempat_lahir: "", tanggal_lahir: "",
  enrollment_status: "active",
};

const API = "/api/students";

/* ═══════════════════════════════════════════════════════════
   STYLES (APPLE LIQUID GLASS)
═══════════════════════════════════════════════════════════ */
const CSS = `
.sp { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }

/* ── Header ── */
.sp-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.sp-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.sp-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }

.sp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.sp-chip {
  display:flex; align-items:center; gap:8px;
  padding:8px 16px; border-radius:99px;
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  font-size:12.5px; font-weight:700; color:#1e293b;
}
.sp-chip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Toolbar ── */
.sp-bar { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }

.sp-search {
  display:flex; align-items:center; gap:10px;
  flex:1; min-width:220px; 
  height:44px; padding:0 16px;
  background: rgba(255, 255, 255, 0.7); 
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.sp-search:focus-within {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(212,160,23,0.4);
  box-shadow: 0 8px 24px rgba(212,160,23,0.08), 0 0 0 3px rgba(212,160,23,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.sp-search input { 
  flex:1; font-size:14px; color:#1e293b; font-family:inherit; font-weight: 500;
  background:transparent; border:none; outline:none; box-shadow:none; 
}
.sp-search input::placeholder { color:#94a3b8; font-weight: 400; }

.sp-search-clear {
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  cursor: pointer; border: none;
}
.sp-search-clear:hover { background: rgba(220,38,38,0.1); color: #dc2626; transform: scale(1.05); }

/* CUSTOM DROPDOWN */
.sp-sel-wrap { position: relative; }
.sp-sel {
  display:flex; align-items:center; gap:8px;
  height:44px; padding:0 16px; min-width:170px;
  background: rgba(255, 255, 255, 0.7); 
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer; user-select: none;
}
.sp-sel:hover { background: rgba(255, 255, 255, 0.9); }
.sp-sel--open {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(212,160,23,0.4);
  box-shadow: 0 8px 24px rgba(212,160,23,0.08), 0 0 0 3px rgba(212,160,23,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.sp-sel-val { flex:1; font-size:14px; font-weight:600; color:#1e293b; text-align: left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.sp-sel-menu {
  position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: saturate(200%) blur(40px); -webkit-backdrop-filter: saturate(200%) blur(40px);
  border: 1px solid rgba(255,255,255,0.9); border-radius: 18px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
  padding: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 100;
  animation: su .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.sp-sel-item {
  padding: 12px 14px; border-radius: 12px;
  font-size: 13.5px; font-weight: 500; color: #475569;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: space-between;
}
.sp-sel-item:hover { background: rgba(212,160,23,0.08); color: #d4a017; }
.sp-sel-item.active {
  background: linear-gradient(135deg, #d4a017, #b45309); color: #fff; font-weight: 700;
  box-shadow: 0 4px 14px rgba(212,160,23,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}
.sp-sel-overlay { position: fixed; inset: 0; z-index: 99; }

.sp-btn-add {
  margin-left: auto;
  display:flex; align-items:center; gap:6px;
  height:44px; padding:0 20px; border-radius:14px;
  background:#d4a017; color:#fff;
  font-size:14px; font-weight:700; font-family:inherit; cursor:pointer;
  box-shadow:0 6px 16px rgba(212,160,23,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
  transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); white-space:nowrap; border:none;
}
.sp-btn-add:hover { box-shadow:0 8px 24px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3); transform:translateY(-2px); }

/* ── Table Card ── */
.sp-card {
  position:relative;
  background:rgba(255,255,255,0.55);
  backdrop-filter:saturate(200%) blur(32px); -webkit-backdrop-filter:saturate(200%) blur(32px);
  border-radius:28px;
  border:1px solid rgba(255,255,255,0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
  overflow:hidden;
}

.sp-tbl { overflow-x:auto; position:relative; z-index:1; }
.sp-tbl table { width:100%; border-collapse:collapse; }
.sp-tbl thead tr {
  background:rgba(255,255,255,0.4);
  border-bottom:1px solid rgba(0,0,0,0.04);
}
.sp-tbl th {
  padding:16px 24px; text-align:left;
  font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;
  color:#64748b; white-space:nowrap;
}
.sp-tbl td { padding:16px 24px; font-size:13.5px; color:#334155; border-bottom:1px solid rgba(0,0,0,0.03); }
.sp-tbl tbody tr { transition:background 0.2s; }
.sp-tbl tbody tr:hover { background:rgba(255,255,255,0.7); }
.sp-tbl tbody tr:last-child td { border-bottom:none; }

/* student avatar cell */
.s-cell { display:flex; align-items:center; gap:14px; }
.s-av {
  width:42px; height:42px; border-radius:12px; flex-shrink:0;
  background: linear-gradient(135deg, #d4a017, #b45309);
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:14px; color:#fff;
  box-shadow: 0 4px 14px rgba(212,160,23,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  letter-spacing:0.5px;
}
.s-av-pending { background: linear-gradient(135deg,#f59e0b,#d97706); box-shadow: 0 4px 14px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
.s-name { font-size:14px; font-weight:700; color:#1e293b; letter-spacing:-0.2px; }
.s-meta { font-size:11px; font-weight:500; color:#64748b; margin-top:2px; }

/* program tag */
.s-prog {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 12px; border-radius:9px;
  background:rgba(212,160,23,0.08); border:1px solid rgba(212,160,23,0.15);
  font-size:12px; font-weight:600; color:#b45309; white-space:nowrap;
}

/* parent tag */
.s-parent { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500; color:#334155; }

/* status badge */
.s-status {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:99px;
  font-size:12px; font-weight:700; white-space:nowrap;
}
.s-active   { background:rgba(22,163,74,0.08);  color:#16a34a;  border:1px solid rgba(22,163,74,0.15);  }
.s-inactive { background:rgba(100,116,139,0.08); color:#64748b; border:1px solid rgba(100,116,139,0.15); }
.s-pending  { background:rgba(245,158,11,0.08);  color:#d97706; border:1px solid rgba(245,158,11,0.15); }
.s-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.s-dot-active   { background:#16a34a; }
.s-dot-inactive { background:#64748b; }
.s-dot-pending  { background:#f59e0b; box-shadow:0 0 5px rgba(245,158,11,0.6); animation: sp-pulse 1.5s infinite; }
@keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* bukti pembayaran */
.s-bukti {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:9px;
  background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.12);
  font-size:12px; font-weight:600; color:#2563eb;
  cursor:pointer; transition:all 0.18s; white-space:nowrap;
  text-decoration:none;
}
.s-bukti:hover { background:rgba(37,99,235,0.12); border-color:rgba(37,99,235,0.2); }
.s-no-bukti { font-size:13px; color:#94a3b8; }

/* row actions */
.sp-acts { display:flex; gap:8px; justify-content:flex-end; }
.sp-act {
  width:36px; height:36px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.2s cubic-bezier(0.25, 1, 0.5, 1); cursor:pointer; border:none; font-family:inherit;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.sa-e { color:#2563eb; }
.sa-d { color:#dc2626; }
.sa-e:hover { background:#2563eb; color:#fff; border-color:#2563eb; transform:scale(1.05); box-shadow:0 4px 12px rgba(37,99,235,0.25); }
.sa-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.05); box-shadow:0 4px 12px rgba(220,38,38,0.25); }

/* empty & spinner */
.sp-empty {
  padding:80px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:12px;
}
.sp-empty-lbl { font-size:15px; color:#64748b; font-weight:600; }
.sp-spin { padding:80px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.sp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 24px; border-top:1px solid rgba(0,0,0,0.04); flex-wrap:wrap; gap:10px;
  background: rgba(255,255,255,0.3);
}
.sp-pag-info { font-size:13px; font-weight:500; color:#64748b; }
.sp-pag-btns { display:flex; gap:6px; }
.spb {
  width:34px; height:34px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; font-family:inherit; cursor:pointer;
  background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05);
  color:#d4a017; transition:all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.spb:hover:not(:disabled) { background:#fff; border-color:rgba(212,160,23,0.2); transform:translateY(-1px); }
.spb:disabled { opacity:.4; cursor:not-allowed; }
.spb--on { background:#d4a017; color:#fff; border-color:#d4a017; box-shadow:0 4px 12px rgba(212,160,23,0.3); }

/* ════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════ */
.smbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:sfi .2s ease;
}
@keyframes sfi   { from{opacity:0} to{opacity:1} }
@keyframes ssu   { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes sspin { to{transform:rotate(360deg)} }

.sm {
  width:100%; max-width:560px;
  max-height:90vh; display:flex; flex-direction:column;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,1); border-radius:24px;
  box-shadow:0 24px 64px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1);
  animation:ssu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.sm-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06); background:transparent;
}
.sm-title { font-size:18px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.sm-cls {
  width:32px; height:32px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:#64748b;
  transition:all 0.2s; cursor:pointer; border:none; font-family:inherit;
}
.sm-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; transform:scale(1.05); }

.sm-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; }

/* form elements */
.sfg { display:flex; flex-direction:column; gap:8px; }
.sfl { font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#64748b; }
.sfi {
  height:44px; padding:0 16px;
  background:#ffffff; border:1px solid #d1d5db;
  border-radius:12px; font-size:14px; font-weight:500; color:#1e293b;
  font-family:inherit; transition:all 0.2s; width:100%; outline:none;
}
.sfi:focus { border-color:#d4a017; box-shadow:0 0 0 3px rgba(212,160,23,0.15); }
.sfi.serr  { border-color:#dc2626; }
.sfe { font-size:11.5px; color:#dc2626; font-weight:600; }

/* select wrapper */
.s-sel-wrap-modal { position:relative; }
.s-sel-wrap-modal .sfi { appearance:none; padding-right:36px; cursor:pointer; }
.s-sel-ico { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; }

/* section divider */
.sm-div {
  display:flex; align-items:center; gap:12px;
  font-size:11px; font-weight:800; text-transform:uppercase;
  letter-spacing:1px; color:#64748b; margin:6px 0 4px;
}
.sm-div::before, .sm-div::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.08); }

/* status toggle — 3 opsi */
.s-toggle { display:flex; gap:8px; }
.s-tog-btn {
  flex:1; height:44px; border-radius:12px; border:1px solid #d1d5db;
  font-size:14px; font-weight:700; font-family:inherit; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  background:#ffffff; color:#64748b;
  transition:all 0.2s;
}
.s-tog-active {
  background:#16a34a; color:#fff;
  border-color:#16a34a; box-shadow:0 4px 14px rgba(22,163,74,0.25);
}
.s-tog-inactive {
  background:#64748b; color:#fff;
  border-color:#64748b; box-shadow:0 4px 14px rgba(100,116,139,0.25);
}
.s-tog-pending {
  background:#d97706; color:#fff;
  border-color:#d97706; box-shadow:0 4px 14px rgba(245,158,11,0.25);
}

/* bukti pembayaran box di modal */
.s-bukti-box {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 16px; border-radius:12px;
  background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.15);
}
.s-bukti-box-info { display:flex; align-items:center; gap:8px; font-size:13.5px; color:#2563eb; font-weight:600; }
.s-bukti-open {
  display:flex; align-items:center; gap:5px;
  padding:6px 14px; border-radius:8px;
  background:#2563eb; color:#fff;
  font-size:12px; font-weight:700; text-decoration:none;
  transition:all 0.2s; box-shadow:0 2px 8px rgba(37,99,235,0.3);
}
.s-bukti-open:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.4); }

/* pending notice */
.s-pending-notice {
  display:flex; align-items:flex-start; gap:12px;
  padding:14px 16px; border-radius:12px;
  background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2);
}
.s-pending-notice-txt { font-size:13.5px; color:#92400e; font-weight:500; line-height:1.5; }

.sm-ft {
  display:flex; justify-content:flex-end; gap:10px;
  padding:16px 28px 24px; border-top:1px solid rgba(0,0,0,0.06); background:transparent;
}
.sbtn-cncl {
  padding:0 20px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#475569;
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer; border:none;
  transition:background 0.2s;
}
.sbtn-cncl:hover { background:rgba(0,0,0,0.1); }
.sbtn-sv {
  padding:0 24px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#fff;
  background:#d4a017; font-family:inherit; cursor:pointer; border:none;
  box-shadow:0 4px 14px rgba(212,160,23,0.25);
  display:flex; align-items:center; gap:8px; transition:all 0.2s;
}
.sbtn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(212,160,23,0.35); transform:translateY(-1px); }
.sbtn-sv:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Delete modal */
.sm-del { max-width:400px; }
.sdel-bdy { padding:32px 28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
.sdel-ico  { width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05)); color:#dc2626; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 24px rgba(220,38,38,0.1); }
.sdel-t    { font-size:19px; font-weight:800; color:#1e293b; letter-spacing:-0.3px;}
.sdel-d    { font-size:14px; font-weight:500; color:#64748b; line-height:1.5; }
.sdel-ft   { display:flex; gap:10px; padding:0 28px 28px; }
.sdel-ft .sbtn-cncl { flex:1; text-align:center; }
.sbtn-del {
  flex:1; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#fff; background:#dc2626;
  box-shadow:0 4px 14px rgba(220,38,38,0.25);
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-family:inherit; cursor:pointer; border:none; transition:all 0.2s;
}
.sbtn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.35); transform:translateY(-1px); }
.sbtn-del:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Toast */
.stoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:12px;
  padding:14px 20px; border-radius:16px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,1);
  box-shadow:0 12px 40px rgba(0,0,0,0.1);
  font-size:14px; font-weight:600; color:#1e293b;
  animation:ssu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width:340px;
}
.stoast-ok  { border-left:4px solid #16a34a; }
.stoast-err { border-left:4px solid #dc2626; }

.sp-blurred { filter:blur(4px) brightness(0.96); transition:filter 0.2s ease; pointer-events:none; user-select:none; }

@media (max-width:768px) {
  .sp-tbl th:nth-child(5), .sp-tbl td:nth-child(5) { display:none; }
  .sp-tbl th:nth-child(6), .sp-tbl td:nth-child(6) { display:none; }
  .sp-bar { flex-direction:column; align-items:stretch; }
  .sp-search { max-width:100%; }
  .sp-btn-add { justify-content:center; margin-left: 0; }
  .sgrid2 { grid-template-columns:1fr !important; }
  .sgrid3 { grid-template-columns:1fr !important; }
}
`;

/* ── Helpers ── */
const initials = (n: string) => n.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();

function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }) : "—";

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; cls: string; dotCls: string; icon: React.ReactNode }> = {
  active:   { label:"Aktif",       cls:"s-active",   dotCls:"s-dot-active",   icon:<CheckCheck size={11}/> },
  inactive: { label:"Tidak Aktif", cls:"s-inactive",  dotCls:"s-dot-inactive", icon:<XCircle size={11}/> },
  pending:  { label:"Menunggu",    cls:"s-pending",   dotCls:"s-dot-pending",  icon:<Clock size={11}/> },
};

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <div className={`stoast ${type==="success" ? "stoast-ok" : "stoast-err"}`}>
      {type==="success" ? <CheckCircle2 size={18} color="#16a34a"/> : <AlertCircle size={18} color="#dc2626"/>}
      {msg}
    </div>,
    document.body);
}

/* ════════════════════════════════════════════════
   FORM MODAL
════════════════════════════════════════════════ */
function FormModal({ mode, init, student, parents, programs, onClose, onSave }: {
  mode:     "add" | "edit";
  init:     StudentForm;
  student:  Student | null;
  parents:  Option[];
  programs: Option[];
  onClose:  () => void;
  onSave:   (d: StudentForm) => Promise<void>;
}) {
  const [f, setF]       = useState<StudentForm>(init);
  const [e, setE]       = useState<Partial<Record<keyof StudentForm, string>>>({});
  const [busy, setBusy] = useState(false);

  const upd = (k: keyof StudentForm) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF(p => ({ ...p, [k]: ev.target.value }));

  const validate = () => {
    const err: Partial<Record<keyof StudentForm, string>> = {};
    if (!f.nama.trim())         err.nama          = "Nama wajib diisi.";
    if (!f.parent_id)           err.parent_id     = "Wali murid wajib dipilih.";
    if (!f.program_id)          err.program_id    = "Program wajib dipilih.";
    if (!f.tempat_lahir.trim()) err.tempat_lahir  = "Tempat lahir wajib diisi.";
    if (!f.tanggal_lahir)       err.tanggal_lahir = "Tanggal lahir wajib diisi.";
    if (!f.usia || isNaN(Number(f.usia)) || Number(f.usia) < 1)
                                err.usia          = "Usia wajib diisi (angka > 0).";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  const isPending = student?.enrollment_status === "pending";

  return createPortal(
    <div className="smbk" onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div className="sm">
        <div className="sm-hd">
          <span className="sm-title">{mode === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}</span>
          <button className="sm-cls" onClick={onClose}><X size={16}/></button>
        </div>

        <div className="sm-body">

          {/* Notice untuk siswa pending */}
          {mode === "edit" && isPending && (
            <div className="s-pending-notice">
              <Clock size={18} color="#d97706" style={{ flexShrink:0, marginTop:1 }}/>
              <div className="s-pending-notice-txt">
                Siswa ini mendaftar melalui portal wali murid dan menunggu verifikasi.
                Ubah status ke <b>Aktif</b> untuk menyetujui pendaftaran, atau <b>Tidak Aktif</b> untuk menolak.
              </div>
            </div>
          )}

          {/* ── Bukti Pembayaran (edit + ada bukti) ── */}
          {mode === "edit" && student?.bukti_pembayaran && (
            <>
              <div className="sm-div">Bukti Pembayaran</div>
              <div className="s-bukti-box">
                <div className="s-bukti-box-info">
                  <FileText size={18}/>
                  <span>File bukti pembayaran tersedia</span>
                </div>
                <a href={student.bukti_pembayaran} target="_blank" rel="noreferrer" className="s-bukti-open">
                  <ExternalLink size={14}/> Buka
                </a>
              </div>
            </>
          )}

          {/* ── Data Pribadi ── */}
          <div className="sm-div">Data Pribadi</div>

          <div className="sfg">
            <label className="sfl">Nama Lengkap</label>
            <input className={`sfi ${e.nama?"serr":""}`} placeholder="Nama lengkap siswa" value={f.nama} onChange={upd("nama")}/>
            {e.nama && <span className="sfe">{e.nama}</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }} className="sgrid3">
            <div className="sfg">
              <label className="sfl">Usia</label>
              <input className={`sfi ${e.usia?"serr":""}`} type="number" min={1} max={30} placeholder="Tahun" value={f.usia} onChange={upd("usia")}/>
              {e.usia && <span className="sfe">{e.usia}</span>}
            </div>
            <div className="sfg" style={{ gridColumn:"span 2" }}>
              <label className="sfl">Tempat Lahir</label>
              <input className={`sfi ${e.tempat_lahir?"serr":""}`} placeholder="Kota tempat lahir" value={f.tempat_lahir} onChange={upd("tempat_lahir")}/>
              {e.tempat_lahir && <span className="sfe">{e.tempat_lahir}</span>}
            </div>
          </div>

          <div className="sfg">
            <label className="sfl">Tanggal Lahir</label>
            <input className={`sfi ${e.tanggal_lahir?"serr":""}`} type="date" value={f.tanggal_lahir} onChange={upd("tanggal_lahir")}/>
            {e.tanggal_lahir && <span className="sfe">{e.tanggal_lahir}</span>}
          </div>

          {/* ── Relasi & Program ── */}
          <div className="sm-div">Wali Murid &amp; Program</div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="sgrid2">
            <div className="sfg">
              <label className="sfl">Wali Murid</label>
              <div className="s-sel-wrap-modal">
                <select className={`sfi ${e.parent_id?"serr":""}`} value={f.parent_id} onChange={upd("parent_id")}>
                  <option value="">— Pilih wali murid —</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <ChevronDown size={16} className="s-sel-ico"/>
              </div>
              {e.parent_id && <span className="sfe">{e.parent_id}</span>}
            </div>
            <div className="sfg">
              <label className="sfl">Program</label>
              <div className="s-sel-wrap-modal">
                <select className={`sfi ${e.program_id?"serr":""}`} value={f.program_id} onChange={upd("program_id")}>
                  <option value="">— Pilih program —</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <ChevronDown size={16} className="s-sel-ico"/>
              </div>
              {e.program_id && <span className="sfe">{e.program_id}</span>}
            </div>
          </div>

          {/* ── Status ── */}
          <div className="sm-div">Status Pendaftaran</div>

          <div className="s-toggle">
            <button type="button"
              className={`s-tog-btn ${f.enrollment_status === "active" ? "s-tog-active" : ""}`}
              onClick={() => setF(p => ({ ...p, enrollment_status:"active" }))}>
              <CheckCheck size={16}/> Aktif
            </button>
            <button type="button"
              className={`s-tog-btn ${f.enrollment_status === "pending" ? "s-tog-pending" : ""}`}
              onClick={() => setF(p => ({ ...p, enrollment_status:"pending" }))}>
              <Clock size={16}/> Menunggu
            </button>
            <button type="button"
              className={`s-tog-btn ${f.enrollment_status === "inactive" ? "s-tog-inactive" : ""}`}
              onClick={() => setF(p => ({ ...p, enrollment_status:"inactive" }))}>
              <XCircle size={16}/> Tidak Aktif
            </button>
          </div>

        </div>

        <div className="sm-ft">
          <button className="sbtn-cncl" onClick={onClose}>Batal</button>
          <button className="sbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"sspin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={16}/> {mode === "add" ? "Tambah Siswa" : "Simpan Perubahan"}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body);
}

/* ── Delete Modal ── */
function DeleteModal({ student, onClose, onConfirm }: {
  student: Student; onClose: ()=>void; onConfirm: ()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };

  return createPortal(
    <div className="smbk" onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div className="sm sm-del">
        <div className="sdel-bdy">
          <div className="sdel-ico"><Trash2 size={28}/></div>
          <div className="sdel-t">Hapus Siswa?</div>
          <div className="sdel-d">
            Data siswa <b>{student.nama}</b> akan dihapus permanen dan tidak dapat dikembalikan.
          </div>
        </div>
        <div className="sdel-ft">
          <button className="sbtn-cncl" onClick={onClose}>Batal</button>
          <button className="sbtn-del" onClick={go} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"sspin 1s linear infinite" }}/> Menghapus...</>
              : <><Trash2 size={16}/> Hapus</>}
          </button>
        </div>
      </div>
    </div>,
    document.body);
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SiswaPage() {
  const [data,          setData]          = useState<Student[]>([]);
  const [meta,          setMeta]          = useState<Meta>({ total:0, page:1, per_page:10, last_page:1 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterProgram, setFilterProgram] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);

  const [parents,  setParents]  = useState<Option[]>([]);
  const [programs, setPrograms] = useState<Option[]>([]);

  const [modal,  setModal]  = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,    setSel]    = useState<Student|null>(null);
  const [toast,  setToast]  = useState<{ msg:string; type:"success"|"error" }|null>(null);

  const dSearch = useDebounce(search);

  /* ── Load options ── */
  const loadOptions = useCallback(async () => {
    try {
      const j = await (await fetch(`${API}/options`)).json();
      if (j.success) { setParents(j.parents); setPrograms(j.programs); }
    } catch {}
  }, []);

  /* ── Load students ── */
  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page: String(page), per_page: "10",
        search: dSearch,
        status: filterStatus,
        program_id: filterProgram,
      });
      const j = await (await fetch(`${API}?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } catch {
      setToast({ msg:"Gagal memuat data.", type:"error" });
    } finally {
      setLoading(false);
    }
  }, [dSearch, filterStatus, filterProgram]);

  useEffect(() => { load(1); },      [load]);
  useEffect(() => { loadOptions(); }, [loadOptions]);

  /* ── Store ── */
  const post = async (d: StudentForm) => {
    const j = await (await fetch(API, {
      method:"POST",
      headers:{ "Content-Type":"application/json","Accept":"application/json" },
      body: JSON.stringify(d),
    })).json();
    if (j.success) {
      setToast({ msg:"Siswa berhasil ditambahkan.", type:"success" });
      setModal(null); load(1);
    } else if (j.errors) {
      const firstErr = Object.values(j.errors as Record<string, string[]>)[0]?.[0];
      setToast({ msg: firstErr ?? "Validasi gagal.", type:"error" });
    } else {
      setToast({ msg: j.message ?? "Gagal menambahkan.", type:"error" });
    }
  };

  /* ── Update ── */
  const put = async (d: StudentForm) => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json","Accept":"application/json" },
      body: JSON.stringify(d),
    })).json();
    if (j.success) {
      setToast({ msg:"Data berhasil diperbarui.", type:"success" });
      setModal(null); load(meta.page);
    } else {
      setToast({ msg: j.message ?? "Gagal memperbarui.", type:"error" });
    }
  };

  /* ── Delete ── */
  const del = async () => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, {
      method:"DELETE", headers:{ "Accept":"application/json" },
    })).json();
    if (j.success) {
      setToast({ msg:"Siswa berhasil dihapus.", type:"success" });
      setModal(null);
      load(data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page);
    } else {
      setToast({ msg: j.message ?? "Gagal menghapus.", type:"error" });
    }
  };

  /* ── Pagination ── */
  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1, page-2), e = Math.min(last_page, page+2);
    return Array.from({ length: e-s+1 }, (_,i) => s+i);
  };

  const openEdit = (s: Student) => { setSel(s); setModal("edit"); };

  const editInit: StudentForm = sel ? {
    parent_id:         sel.parent_id    ?? "",
    program_id:        sel.program_id   ?? "",
    nama:              sel.nama,
    usia:              String(sel.usia ?? ""),
    tempat_lahir:      sel.tempat_lahir,
    tanggal_lahir:     sel.tanggal_lahir,
    enrollment_status: sel.enrollment_status,
  } : EMPTY_FORM;

  const activeCount  = data.filter(s => s.enrollment_status === "active").length;
  const pendingCount = data.filter(s => s.enrollment_status === "pending").length;

  return (
    <>
      <style>{CSS}</style>
      <div className={`sp${modal ? " sp-blurred" : ""}`}>

        {/* Header */}
        <div className="sp-hd">
          <div>
            <div className="sp-ttl">Manajemen Siswa</div>
            <div className="sp-sub">Kelola seluruh data siswa yang terdaftar di sistem</div>
          </div>
          <div className="sp-chips">
            <div className="sp-chip">
              <span className="sp-chip-dot" style={{ background:"#d4a017" }}/>
              {meta.total} Terdaftar
            </div>
            <div className="sp-chip">
              <span className="sp-chip-dot" style={{ background:"#16a34a" }}/>
              {activeCount} Aktif
            </div>
            {pendingCount > 0 && (
              <div className="sp-chip">
                <span className="sp-chip-dot" style={{ background:"#f59e0b" }}/>
                {pendingCount} Menunggu
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="sp-bar">
          <div className="sp-search">
            <Search size={16} color="#64748b" className="flex-shrink-0" />
            <input
              placeholder="Cari nama, tempat lahir..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-0 focus:ring-0 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="sp-search-clear">
                <X size={14} strokeWidth={2.5}/>
              </button>
            )}
          </div>

          {/* CUSTOM STATUS FILTER */}
          <div className="sp-sel-wrap">
            <div className={`sp-sel ${statusOpen ? 'sp-sel--open' : ''}`} onClick={() => setStatusOpen(!statusOpen)}>
              <Filter size={15} color="#64748b" className="flex-shrink-0" />
              <span className="sp-sel-val">
                {filterStatus === "active" ? "Aktif" : filterStatus === "pending" ? "Menunggu" : filterStatus === "inactive" ? "Tidak Aktif" : "Semua Status"}
              </span>
              <ChevronDown size={16} color="#64748b" className={`flex-shrink-0 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
            </div>
            {statusOpen && (
              <>
                <div className="sp-sel-overlay" onClick={() => setStatusOpen(false)} />
                <div className="sp-sel-menu">
                  <div className={`sp-sel-item ${filterStatus === "" ? "active" : ""}`} onClick={() => { setFilterStatus(""); setStatusOpen(false); }}>
                    <span>Semua Status</span>{filterStatus === "" && <Check size={16} />}
                  </div>
                  <div className={`sp-sel-item ${filterStatus === "active" ? "active" : ""}`} onClick={() => { setFilterStatus("active"); setStatusOpen(false); }}>
                    <span>Aktif</span>{filterStatus === "active" && <Check size={16} />}
                  </div>
                  <div className={`sp-sel-item ${filterStatus === "pending" ? "active" : ""}`} onClick={() => { setFilterStatus("pending"); setStatusOpen(false); }}>
                    <span>Menunggu</span>{filterStatus === "pending" && <Check size={16} />}
                  </div>
                  <div className={`sp-sel-item ${filterStatus === "inactive" ? "active" : ""}`} onClick={() => { setFilterStatus("inactive"); setStatusOpen(false); }}>
                    <span>Tidak Aktif</span>{filterStatus === "inactive" && <Check size={16} />}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CUSTOM PROGRAM FILTER */}
          {programs.length > 0 && (
            <div className="sp-sel-wrap">
              <div className={`sp-sel ${programOpen ? 'sp-sel--open' : ''}`} onClick={() => setProgramOpen(!programOpen)}>
                <GraduationCap size={15} color="#64748b" className="flex-shrink-0" />
                <span className="sp-sel-val">
                  {filterProgram ? programs.find(p => p.id === filterProgram)?.label : "Semua Program"}
                </span>
                <ChevronDown size={16} color="#64748b" className={`flex-shrink-0 transition-transform ${programOpen ? 'rotate-180' : ''}`} />
              </div>
              {programOpen && (
                <>
                  <div className="sp-sel-overlay" onClick={() => setProgramOpen(false)} />
                  <div className="sp-sel-menu">
                    <div className={`sp-sel-item ${filterProgram === "" ? "active" : ""}`} onClick={() => { setFilterProgram(""); setProgramOpen(false); }}>
                      <span>Semua Program</span>{filterProgram === "" && <Check size={16} />}
                    </div>
                    {programs.map(p => (
                      <div key={p.id} className={`sp-sel-item ${filterProgram === p.id ? "active" : ""}`} onClick={() => { setFilterProgram(p.id); setProgramOpen(false); }}>
                        <span>{p.label}</span>{filterProgram === p.id && <Check size={16} />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button className="sp-btn-add" onClick={() => { setSel(null); setModal("add"); }}>
            <Plus size={16}/> Tambah Siswa
          </button>
        </div>

        {/* Table */}
        <div className="sp-card">
          <div className="sp-tbl">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Siswa</th>
                  <th>Wali Murid</th>
                  <th>Program</th>
                  <th>Tgl Lahir</th>
                  <th>Bukti Bayar</th>
                  <th>Status</th>
                  <th style={{ textAlign:"right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.map((s, i) => {
                  const stCfg = STATUS_CONFIG[s.enrollment_status];
                  return (
                    <tr key={s.id}>
                      <td style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>
                        {(meta.page-1)*meta.per_page+i+1}
                      </td>

                      {/* Siswa */}
                      <td>
                        <div className="s-cell">
                          <div className={`s-av ${s.enrollment_status === "pending" ? "s-av-pending" : ""}`}>
                            {initials(s.nama)}
                          </div>
                          <div>
                            <div className="s-name">{s.nama}</div>
                            <div className="s-meta">
                              {s.tempat_lahir} · {s.usia ? `${s.usia} thn` : "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wali Murid */}
                      <td>
                        <div className="s-parent">
                          <Users size={14} color="#64748b"/>
                          {s.parent_name ?? <span style={{ color:"#94a3b8", fontStyle:"italic" }}>Tidak ada</span>}
                        </div>
                      </td>

                      {/* Program */}
                      <td>
                        {s.program_name
                          ? <span className="s-prog"><GraduationCap size={12}/>{s.program_name}</span>
                          : <span style={{ color:"#94a3b8", fontSize:13 }}>—</span>}
                      </td>

                      {/* Tgl Lahir */}
                      <td style={{ fontSize:13, color:"#334155", fontWeight:500 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Calendar size={13} color="#64748b"/>
                          {formatDate(s.tanggal_lahir)}
                        </span>
                      </td>

                      {/* Bukti Pembayaran */}
                      <td>
                        {s.bukti_pembayaran
                          ? (
                            <a href={s.bukti_pembayaran} target="_blank" rel="noreferrer" className="s-bukti" title="Klik untuk preview">
                              <FileText size={12}/> Lihat Bukti <ExternalLink size={10}/>
                            </a>
                          ) : (
                            <span className="s-no-bukti">—</span>
                          )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`s-status ${stCfg.cls}`}>
                          <span className={`s-dot ${stCfg.dotCls}`}/>
                          {stCfg.label}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td>
                        <div className="sp-acts">
                          <button className="sp-act sa-e" title="Edit" onClick={() => openEdit(s)}>
                            <Pencil size={15}/>
                          </button>
                          <button className="sp-act sa-d" title="Hapus" onClick={() => { setSel(s); setModal("delete"); }}>
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {loading && (
              <div className="sp-spin">
                <Loader2 size={32} color="#d4a017" style={{ animation:"sspin 1s linear infinite" }}/>
              </div>
            )}

            {!loading && data.length === 0 && (
              <div className="sp-empty">
                <GraduationCap size={48} color="#94a3b8" style={{ opacity:0.5 }}/>
                <div className="sp-empty-lbl">
                  {search || filterStatus || filterProgram
                    ? "Tidak ada siswa yang sesuai filter."
                    : "Belum ada siswa terdaftar."}
                </div>
                {!search && !filterStatus && !filterProgram && (
                  <button className="sp-btn-add" style={{ marginTop:8 }} onClick={() => setModal("add")}>
                    <Plus size={16}/> Tambah Siswa Pertama
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && meta.total > 0 && (
            <div className="sp-pag">
              <span className="sp-pag-info">
                {(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page, meta.total)} dari {meta.total} siswa
              </span>
              <div className="sp-pag-btns">
                <button className="spb" disabled={meta.page===1} onClick={() => load(meta.page-1)}>
                  <ChevronLeft size={16}/>
                </button>
                {pgs().map(p => (
                  <button key={p} className={`spb ${p===meta.page?"spb--on":""}`} onClick={() => load(p)}>
                    {p}
                  </button>
                ))}
                <button className="spb" disabled={meta.page===meta.last_page} onClick={() => load(meta.page+1)}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <FormModal
          mode="add" init={EMPTY_FORM} student={null}
          parents={parents} programs={programs}
          onClose={() => setModal(null)} onSave={post}
        />
      )}
      {modal === "edit" && sel && (
        <FormModal
          mode="edit" init={editInit} student={sel}
          parents={parents} programs={programs}
          onClose={() => setModal(null)} onSave={put}
        />
      )}
      {modal === "delete" && sel && (
        <DeleteModal student={sel} onClose={() => setModal(null)} onConfirm={del}/>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </>
  );
}