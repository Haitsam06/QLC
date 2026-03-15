import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  GraduationCap, Loader2, AlertCircle, CheckCircle2,
  Calendar, Filter, ChevronDown, Users, FileText,
  ExternalLink, Clock, CheckCheck, XCircle,
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
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
.sp { width:100%; display:flex; flex-direction:column; gap:20px; }

/* ── Header ── */
.sp-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.sp-ttl { font-size:22px; font-weight:900; color:var(--text); line-height:1; }
.sp-sub { font-size:12px; color:var(--text3); margin-top:4px; }

.sp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.sp-chip {
  display:flex; align-items:center; gap:7px;
  padding:7px 14px; border-radius:11px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); box-shadow:var(--glass-sh);
  font-size:12.5px; font-weight:700; color:var(--text);
}
.sp-chip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Toolbar ── */
.sp-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

.sp-search {
  display:flex; align-items:center; gap:8px;
  flex:1; min-width:200px; max-width:340px;
  height:40px; padding:0 13px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.sp-search input { flex:1; font-size:13px; color:var(--text); font-family:inherit; background:transparent; }
.sp-search input::placeholder { color:var(--text3); }

.sp-sel {
  display:flex; align-items:center; gap:7px;
  height:40px; padding:0 13px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
  min-width:150px;
}
.sp-sel select {
  flex:1; font-size:13px; color:var(--text); font-family:inherit;
  background:transparent; cursor:pointer; border:none; outline:none;
}

.sp-btn-add {
  display:flex; align-items:center; gap:6px;
  height:40px; padding:0 18px; border-radius:11px;
  background:var(--gold); color:#fff;
  font-size:13px; font-weight:700; font-family:inherit; cursor:pointer;
  box-shadow:0 4px 16px rgba(212,160,23,0.3);
  transition:all 0.18s; white-space:nowrap; border:none;
}
.sp-btn-add:hover { box-shadow:0 6px 22px rgba(212,160,23,0.42); transform:translateY(-1px); }

/* ── Table Card ── */
.sp-card {
  position:relative;
  background:rgba(255,255,255,0.62);
  backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px);
  border-radius:24px;
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:
    0 8px 32px rgba(212,160,23,0.10),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 1.5px 0 rgba(255,255,255,1),
    inset 0 -1px 0 rgba(255,255,255,0.4);
  overflow:hidden;
}
.sp-card::before {
  content:""; position:absolute; top:0; left:0; right:0; height:56px;
  background:linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 100%);
  pointer-events:none; border-radius:24px 24px 0 0; z-index:0;
}
.sp-tbl { overflow-x:auto; position:relative; z-index:1; }
.sp-tbl table { width:100%; border-collapse:collapse; }
.sp-tbl thead tr {
  background:linear-gradient(90deg,rgba(212,160,23,0.12) 0%,rgba(245,158,11,0.07) 100%);
  border-bottom:1.5px solid rgba(212,160,23,0.2);
}
.sp-tbl th {
  padding:13px 20px; text-align:left;
  font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.9px;
  color:#d4a017; white-space:nowrap;
}
.sp-tbl td { padding:13px 20px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(255,255,255,0.7); }
.sp-tbl tbody tr { transition:background 0.18s; }
.sp-tbl tbody tr:hover { background:rgba(255,255,255,0.72); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6); }
.sp-tbl tbody tr:last-child td { border-bottom:none; }

/* student avatar cell */
.s-cell { display:flex; align-items:center; gap:12px; }
.s-av {
  width:38px; height:38px; border-radius:11px; flex-shrink:0;
  background:#d4a017;
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:13px; color:#fff;
  box-shadow:0 3px 12px rgba(212,160,23,0.4);
  letter-spacing:0.5px;
}
.s-av-pending { background: linear-gradient(135deg,#f59e0b,#d97706); }
.s-name { font-size:13.5px; font-weight:700; color:var(--text); }
.s-meta { font-size:10.5px; color:var(--text3); margin-top:1px; }

/* program tag */
.s-prog {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px;
  background:rgba(212,160,23,0.1); border:1px solid rgba(212,160,23,0.2);
  font-size:11.5px; font-weight:600; color:#92400e; white-space:nowrap;
}

/* parent tag */
.s-parent { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text2); }

/* status badge */
.s-status {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:99px;
  font-size:11px; font-weight:700; white-space:nowrap;
}
.s-active   { background:rgba(15,118,110,0.1);  color:var(--g);    border:1px solid rgba(15,118,110,0.2);  }
.s-inactive { background:rgba(148,163,184,0.12); color:var(--text3); border:1px solid rgba(148,163,184,0.2); }
.s-pending  { background:rgba(245,158,11,0.12);  color:#d97706;     border:1px solid rgba(245,158,11,0.25); }
.s-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.s-dot-active   { background:var(--g);   box-shadow:0 0 5px rgba(15,118,110,0.6); }
.s-dot-inactive { background:var(--text3); }
.s-dot-pending  { background:#f59e0b; box-shadow:0 0 5px rgba(245,158,11,0.6); animation: sp-pulse 1.5s infinite; }
@keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* bukti pembayaran */
.s-bukti {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px;
  background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.15);
  font-size:11.5px; font-weight:600; color:var(--b);
  cursor:pointer; transition:all 0.18s; white-space:nowrap;
  text-decoration:none;
}
.s-bukti:hover { background:rgba(37,99,235,0.14); border-color:rgba(37,99,235,0.28); }
.s-no-bukti { font-size:12px; color:var(--text3); font-style:italic; }

/* row actions */
.sp-acts { display:flex; gap:6px; justify-content:flex-end; }
.sp-act {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.18s; cursor:pointer; border:none; font-family:inherit;
}
.sa-e { background:rgba(37,99,235,0.08);  color:var(--b);   border:1px solid rgba(37,99,235,0.15)  !important; }
.sa-d { background:rgba(220,38,38,0.08);  color:var(--red); border:1px solid rgba(220,38,38,0.15)  !important; }
.sa-e:hover { background:var(--b);   color:#fff; }
.sa-d:hover { background:var(--red); color:#fff; }

/* empty & spinner */
.sp-empty {
  padding:60px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.sp-empty-lbl { font-size:14px; color:var(--text3); font-weight:600; }
.sp-spin { padding:60px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.sp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-top:1px solid rgba(0,0,0,0.05); flex-wrap:wrap; gap:10px;
}
.sp-pag-info { font-size:12px; color:var(--text3); }
.sp-pag-btns { display:flex; gap:5px; }
.spb {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; font-family:inherit; cursor:pointer;
  background:rgba(212,160,23,0.08); border:1.5px solid rgba(212,160,23,0.2);
  color:#d4a017; transition:all 0.18s;
}
.spb:hover:not(:disabled) { background:rgba(212,160,23,0.16); border-color:rgba(212,160,23,0.35); }
.spb:disabled { opacity:.35; cursor:not-allowed; }
.spb--on { background:#d4a017; color:#fff; border-color:#d4a017; box-shadow:0 3px 10px rgba(212,160,23,0.4); font-weight:800; }

/* ════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════ */
.smbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.5);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:sfi .18s ease;
  overflow-y:auto;
}
@keyframes sfi   { from{opacity:0} to{opacity:1} }
@keyframes ssu   { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes sspin { to{transform:rotate(360deg)} }

.sm {
  width:100%; max-width:560px;
  max-height:90vh; overflow-y:auto;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.95); border-radius:22px;
  box-shadow:0 24px 80px rgba(212,160,23,0.14), 0 4px 16px rgba(0,0,0,0.08);
  animation:ssu .22s cubic-bezier(.4,0,.2,1);
}
.sm-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.95); z-index:1;
  border-radius:22px 22px 0 0;
}
.sm-title { font-size:17px; font-weight:800; color:var(--text); }
.sm-cls {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3);
  transition:all 0.18s; cursor:pointer; border:none; font-family:inherit;
}
.sm-cls:hover { background:rgba(220,38,38,0.1); color:var(--red); }

.sm-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }

/* form elements */
.sfg { display:flex; flex-direction:column; gap:6px; }
.sfl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text3); }
.sfi {
  height:42px; padding:0 14px;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%; outline:none;
}
.sfi:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(212,160,23,0.12); }
.sfi.serr  { border-color:var(--red); }
.sfe { font-size:11px; color:var(--red); font-weight:600; }

/* select wrapper */
.s-sel-wrap { position:relative; }
.s-sel-wrap .sfi { appearance:none; padding-right:36px; cursor:pointer; }
.s-sel-ico { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text3); pointer-events:none; }

/* section divider */
.sm-div {
  display:flex; align-items:center; gap:10px;
  font-size:10.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:.8px; color:var(--text3); margin:2px 0;
}
.sm-div::before, .sm-div::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.07); }

/* status toggle — 3 opsi */
.s-toggle { display:flex; gap:8px; }
.s-tog-btn {
  flex:1; height:40px; border-radius:11px; border:1.5px solid rgba(0,0,0,0.1);
  font-size:12.5px; font-weight:700; font-family:inherit; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  background:rgba(255,255,255,0.5); color:var(--text3);
  transition:all 0.18s;
}
.s-tog-active {
  background:rgba(15,118,110,0.1); color:var(--g);
  border-color:rgba(15,118,110,0.3); box-shadow:0 2px 8px rgba(15,118,110,0.12);
}
.s-tog-inactive {
  background:rgba(148,163,184,0.1); color:var(--text3);
  border-color:rgba(148,163,184,0.25);
}
.s-tog-pending {
  background:rgba(245,158,11,0.1); color:#d97706;
  border-color:rgba(245,158,11,0.3); box-shadow:0 2px 8px rgba(245,158,11,0.12);
}

/* bukti pembayaran box di modal */
.s-bukti-box {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px; border-radius:11px;
  background:rgba(37,99,235,0.06); border:1.5px solid rgba(37,99,235,0.15);
}
.s-bukti-box-info { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--b); font-weight:600; }
.s-bukti-open {
  display:flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:8px;
  background:var(--b); color:#fff;
  font-size:11.5px; font-weight:700; text-decoration:none;
  transition:opacity 0.18s;
}
.s-bukti-open:hover { opacity:0.85; }

/* pending notice */
.s-pending-notice {
  display:flex; align-items:flex-start; gap:10px;
  padding:12px 14px; border-radius:12px;
  background:rgba(245,158,11,0.08); border:1.5px solid rgba(245,158,11,0.2);
}
.s-pending-notice-txt { font-size:12.5px; color:#92400e; font-weight:600; line-height:1.5; }

.sm-ft {
  display:flex; justify-content:flex-end; gap:8px;
  padding:14px 24px 20px; border-top:1px solid rgba(0,0,0,0.06);
  position:sticky; bottom:0; background:rgba(255,255,255,0.95);
  border-radius:0 0 22px 22px;
}
.sbtn-cncl {
  padding:0 18px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:var(--text2);
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer; border:none;
  transition:background 0.18s;
}
.sbtn-cncl:hover { background:rgba(0,0,0,0.09); }
.sbtn-sv {
  padding:0 22px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff;
  background:var(--gold); font-family:inherit; cursor:pointer; border:none;
  box-shadow:0 4px 14px rgba(212,160,23,0.28);
  display:flex; align-items:center; gap:7px; transition:all 0.18s;
}
.sbtn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(212,160,23,0.4); transform:translateY(-1px); }
.sbtn-sv:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Delete modal */
.sm-del { max-width:380px; }
.sdel-bdy { padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; }
.sdel-ico  { width:56px; height:56px; border-radius:16px; background:rgba(220,38,38,0.1); color:var(--red); display:flex; align-items:center; justify-content:center; }
.sdel-t    { font-size:17px; font-weight:800; color:var(--text); }
.sdel-d    { font-size:13px; color:var(--text3); line-height:1.5; }
.sdel-ft   { display:flex; gap:8px; padding:0 24px 22px; }
.sdel-ft .sbtn-cncl { flex:1; text-align:center; }
.sbtn-del {
  flex:1; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff; background:var(--red);
  box-shadow:0 4px 14px rgba(220,38,38,0.3);
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-family:inherit; cursor:pointer; border:none; transition:all 0.18s;
}
.sbtn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.4); transform:translateY(-1px); }
.sbtn-del:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Toast */
.stoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:10px;
  padding:12px 18px; border-radius:13px;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 8px 32px rgba(0,0,0,0.12);
  font-size:13px; font-weight:600; color:var(--text);
  animation:ssu .22s ease; max-width:320px;
}
.stoast-ok  { border-left:4px solid #16a34a; }
.stoast-err { border-left:4px solid var(--red); }

.sp-blurred { filter:blur(4px) brightness(0.96); transition:filter 0.2s ease; pointer-events:none; user-select:none; }

@media (max-width:768px) {
  .sp-tbl th:nth-child(5), .sp-tbl td:nth-child(5) { display:none; }
  .sp-tbl th:nth-child(6), .sp-tbl td:nth-child(6) { display:none; }
  .sp-bar { flex-direction:column; align-items:stretch; }
  .sp-search { max-width:100%; }
  .sp-btn-add { justify-content:center; }
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
      {type==="success" ? <CheckCircle2 size={16} color="#16a34a"/> : <AlertCircle size={16} color="var(--red)"/>}
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
          <button className="sm-cls" onClick={onClose}><X size={15}/></button>
        </div>

        <div className="sm-body">

          {/* Notice untuk siswa pending */}
          {mode === "edit" && isPending && (
            <div className="s-pending-notice">
              <Clock size={16} color="#d97706" style={{ flexShrink:0, marginTop:1 }}/>
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
                  <FileText size={16}/>
                  <span>File bukti pembayaran tersedia</span>
                </div>
                <a
                  href={student.bukti_pembayaran}
                  target="_blank"
                  rel="noreferrer"
                  className="s-bukti-open"
                >
                  <ExternalLink size={12}/> Buka
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

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }} className="sgrid3">
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

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="sgrid2">
            <div className="sfg">
              <label className="sfl">Wali Murid</label>
              <div className="s-sel-wrap">
                <select className={`sfi ${e.parent_id?"serr":""}`} value={f.parent_id} onChange={upd("parent_id")}>
                  <option value="">— Pilih wali murid —</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <ChevronDown size={14} className="s-sel-ico"/>
              </div>
              {e.parent_id && <span className="sfe">{e.parent_id}</span>}
            </div>
            <div className="sfg">
              <label className="sfl">Program</label>
              <div className="s-sel-wrap">
                <select className={`sfi ${e.program_id?"serr":""}`} value={f.program_id} onChange={upd("program_id")}>
                  <option value="">— Pilih program —</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <ChevronDown size={14} className="s-sel-ico"/>
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
              <CheckCheck size={13}/> Aktif
            </button>
            <button type="button"
              className={`s-tog-btn ${f.enrollment_status === "pending" ? "s-tog-pending" : ""}`}
              onClick={() => setF(p => ({ ...p, enrollment_status:"pending" }))}>
              <Clock size={13}/> Menunggu
            </button>
            <button type="button"
              className={`s-tog-btn ${f.enrollment_status === "inactive" ? "s-tog-inactive" : ""}`}
              onClick={() => setF(p => ({ ...p, enrollment_status:"inactive" }))}>
              <XCircle size={13}/> Tidak Aktif
            </button>
          </div>

        </div>

        <div className="sm-ft">
          <button className="sbtn-cncl" onClick={onClose}>Batal</button>
          <button className="sbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"sspin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={14}/> {mode === "add" ? "Tambah Siswa" : "Simpan Perubahan"}</>}
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
          <div className="sdel-ico"><Trash2 size={24}/></div>
          <div className="sdel-t">Hapus Siswa?</div>
          <div className="sdel-d">
            Data siswa <b>{student.nama}</b> akan dihapus permanen dan tidak dapat dikembalikan.
          </div>
        </div>
        <div className="sdel-ft">
          <button className="sbtn-cncl" onClick={onClose}>Batal</button>
          <button className="sbtn-del" onClick={go} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"sspin 1s linear infinite" }}/> Menghapus...</>
              : <><Trash2 size={14}/> Hapus</>}
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
              <span className="sp-chip-dot" style={{ background:"var(--gold)" }}/>
              {meta.total} Terdaftar
            </div>
            <div className="sp-chip">
              <span className="sp-chip-dot" style={{ background:"var(--g)" }}/>
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
            <Search size={15} color="var(--text3)"/>
            <input
              placeholder="Cari nama, tempat lahir..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color:"var(--text3)", display:"flex", background:"none", border:"none", cursor:"pointer" }}>
                <X size={13}/>
              </button>
            )}
          </div>

          <div className="sp-sel">
            <Filter size={14} color="var(--text3)"/>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="pending">Menunggu</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {programs.length > 0 && (
            <div className="sp-sel">
              <GraduationCap size={14} color="var(--text3)"/>
              <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
                <option value="">Semua Program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          )}

          <button className="sp-btn-add" onClick={() => { setSel(null); setModal("add"); }}>
            <Plus size={15}/> Tambah Siswa
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
                      <td style={{ color:"var(--text3)", fontSize:12 }}>
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
                          <Users size={12} color="var(--text3)"/>
                          {s.parent_name ?? <span style={{ color:"var(--text3)", fontStyle:"italic" }}>Tidak ada</span>}
                        </div>
                      </td>

                      {/* Program */}
                      <td>
                        {s.program_name
                          ? <span className="s-prog"><GraduationCap size={11}/>{s.program_name}</span>
                          : <span style={{ color:"var(--text3)", fontSize:12 }}>—</span>}
                      </td>

                      {/* Tgl Lahir */}
                      <td style={{ fontSize:12, color:"var(--text3)" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <Calendar size={11}/>
                          {formatDate(s.tanggal_lahir)}
                        </span>
                      </td>

                      {/* Bukti Pembayaran */}
                      <td>
                        {s.bukti_pembayaran
                          ? (
                            <a
                              href={s.bukti_pembayaran}
                              target="_blank"
                              rel="noreferrer"
                              className="s-bukti"
                              title="Klik untuk preview"
                            >
                              <FileText size={12}/>
                              Lihat Bukti
                              <ExternalLink size={10}/>
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
                            <Pencil size={13}/>
                          </button>
                          <button className="sp-act sa-d" title="Hapus" onClick={() => { setSel(s); setModal("delete"); }}>
                            <Trash2 size={13}/>
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
                <Loader2 size={28} color="var(--gold)" style={{ animation:"sspin 1s linear infinite" }}/>
              </div>
            )}

            {!loading && data.length === 0 && (
              <div className="sp-empty">
                <GraduationCap size={40} color="var(--text3)"/>
                <div className="sp-empty-lbl">
                  {search || filterStatus || filterProgram
                    ? "Tidak ada siswa yang sesuai filter."
                    : "Belum ada siswa terdaftar."}
                </div>
                {!search && !filterStatus && !filterProgram && (
                  <button className="sp-btn-add" style={{ marginTop:4 }} onClick={() => setModal("add")}>
                    <Plus size={14}/> Tambah Siswa Pertama
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
                  <ChevronLeft size={14}/>
                </button>
                {pgs().map(p => (
                  <button key={p} className={`spb ${p===meta.page?"spb--on":""}`} onClick={() => load(p)}>
                    {p}
                  </button>
                ))}
                <button className="spb" disabled={meta.page===meta.last_page} onClick={() => load(meta.page+1)}>
                  <ChevronRight size={14}/>
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