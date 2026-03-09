import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Users, Phone, MapPin, Loader2, AlertCircle,
  CheckCircle2, Eye, EyeOff, Home,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Parent {
  id: string;
  user_id: string | null;
  parent_name: string;
  phone: string;
  address: string;
  created_at: string | null;
}
interface Meta { total: number; page: number; per_page: number; last_page: number; }

interface AddFormData {
  parent_name: string;
  phone: string;
  address: string;
  username: string;
  password: string;
  email: string;
}
interface EditFormData {
  parent_name: string;
  phone: string;
  address: string;
}

const EMPTY_ADD: AddFormData  = { parent_name: "", phone: "", address: "", username: "", password: "", email: "" };
const EMPTY_EDIT: EditFormData = { parent_name: "", phone: "", address: "" };
const API = "/api/parents";

/* ═══════════════════════════════════════════════════════════
   STYLES  — prefix .wp (wali page) agar tidak clash dengan .gp
═══════════════════════════════════════════════════════════ */
const CSS = `
/* ── Page ── */
.wp { width:100%; display:flex; flex-direction:column; gap:20px; }

.wp-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.wp-ttl { font-size:22px; font-weight:900; color:var(--text); line-height:1; }
.wp-sub { font-size:12px; color:var(--text3); margin-top:4px; }

.wp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.wp-chip {
  display:flex; align-items:center; gap:7px;
  padding:7px 14px; border-radius:11px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); box-shadow:var(--glass-sh);
  font-size:12.5px; font-weight:700; color:var(--text);
}
.wchip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Toolbar ── */
.wp-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

.wp-search {
  display:flex; align-items:center; gap:8px;
  flex:1; min-width:200px; max-width:340px;
  height:40px; padding:0 13px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.wp-search input { flex:1; font-size:13px; color:var(--text); font-family:inherit; background:transparent; }
.wp-search input::placeholder { color:var(--text3); }

.wp-btn-add {
  display:flex; align-items:center; gap:6px;
  height:40px; padding:0 18px; border-radius:11px;
  background:var(--b); color:#fff;
  font-size:13px; font-weight:700; font-family:inherit; cursor:pointer;
  box-shadow:0 4px 16px rgba(37,99,235,0.28);
  transition:all 0.18s; white-space:nowrap; border:none;
}
.wp-btn-add:hover { box-shadow:0 6px 22px rgba(37,99,235,0.38); transform:translateY(-1px); }

/* ── Table Card ── */
.wp-card {
  position: relative;
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  border-radius: 24px;
  border: 1.5px solid rgba(255,255,255,0.95);
  box-shadow:
    0 8px 32px rgba(37,99,235,0.10),
    0 2px 8px  rgba(0,0,0,0.06),
    inset 0 1.5px 0 rgba(255,255,255,1),
    inset 0 -1px 0 rgba(255,255,255,0.4);
  overflow: hidden;
}
.wp-card::before {
  content: "";
  position: absolute; top:0; left:0; right:0; height:56px;
  background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none; border-radius: 24px 24px 0 0; z-index: 0;
}
.wp-tbl { overflow-x:auto; position:relative; z-index:1; }
.wp-tbl table { width:100%; border-collapse:collapse; }
.wp-tbl thead tr {
  background: linear-gradient(90deg, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.06) 100%);
  border-bottom: 1.5px solid rgba(37,99,235,0.15);
}
.wp-tbl th {
  padding:13px 20px; text-align:left;
  font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.9px;
  color:#2563eb; white-space:nowrap;
}
.wp-tbl td { padding:14px 20px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(255,255,255,0.7); }
.wp-tbl tbody tr { transition:background 0.18s; }
.wp-tbl tbody tr:hover { background:rgba(255,255,255,0.72); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6); }
.wp-tbl tbody tr:last-child td { border-bottom:none; }

/* avatar cell */
.p-cell { display:flex; align-items:center; gap:12px; }
.p-av {
  width:38px; height:38px; border-radius:11px; flex-shrink:0;
  background: #2563eb;
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:13px; color:#fff;
  box-shadow:0 3px 12px rgba(37,99,235,0.4);
  letter-spacing:0.5px;
}
.p-name { font-size:13.5px; font-weight:700; color:var(--text); }
.p-uid  { font-size:10.5px; color:var(--text3); margin-top:1px; }

/* address truncate */
.p-addr {
  max-width:200px; overflow:hidden; text-overflow:ellipsis;
  white-space:nowrap; display:flex; align-items:center; gap:5px;
}

/* row actions */
.wp-acts { display:flex; gap:6px; justify-content:flex-end; }
.wp-act {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.18s; cursor:pointer; border:none; font-family:inherit;
}
.wa-e { background:rgba(37,99,235,0.08);  color:var(--b);   border:1px solid rgba(37,99,235,0.15)  !important; }
.wa-d { background:rgba(220,38,38,0.08);  color:var(--red); border:1px solid rgba(220,38,38,0.15)  !important; }
.wa-e:hover { background:var(--b);   color:#fff; }
.wa-d:hover { background:var(--red); color:#fff; }

/* empty & spinner */
.wp-empty {
  padding:60px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.wp-empty-lbl { font-size:14px; color:var(--text3); font-weight:600; }
.wp-spin { padding:60px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.wp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-top:1px solid rgba(0,0,0,0.05); flex-wrap:wrap; gap:10px;
}
.wp-pag-info { font-size:12px; color:var(--text3); }
.wp-pag-btns { display:flex; gap:5px; }
.wpb {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; font-family:inherit; cursor:pointer;
  background:rgba(37,99,235,0.08); border:1.5px solid rgba(37,99,235,0.15);
  color:#2563eb; transition:all 0.18s;
}
.wpb:hover:not(:disabled) { background:rgba(37,99,235,0.16); border-color:rgba(37,99,235,0.3); }
.wpb:disabled { opacity:.35; cursor:not-allowed; }
.wpb--on { background:#2563eb; color:#fff; border-color:#2563eb; box-shadow:0 3px 10px rgba(37,99,235,0.35); font-weight:800; }

/* ════════════════════════════════════════════════
   MODAL — shared base dengan GuruPage
════════════════════════════════════════════════ */
.wmbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.5);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:wfi .18s ease;
  overflow-y:auto;
}
@keyframes wfi { from{opacity:0} to{opacity:1} }
@keyframes wsu { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes wspin { to{transform:rotate(360deg)} }

.wm {
  width:100%; max-width:500px;
  max-height:90vh; overflow-y:auto;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.95); border-radius:22px;
  box-shadow:0 24px 80px rgba(37,99,235,0.14), 0 4px 16px rgba(0,0,0,0.08);
  animation:wsu .22s cubic-bezier(.4,0,.2,1);
}
.wm-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.96);
  border-radius:22px 22px 0 0; z-index:1;
}
.wm-title { font-size:17px; font-weight:800; color:var(--text); }
.wm-cls {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3);
  transition:all 0.18s; cursor:pointer; border:none; font-family:inherit;
}
.wm-cls:hover { background:rgba(220,38,38,0.1); color:var(--red); }

.wm-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }

/* form elements reuse same .fg .fl .fi .fe from GuruPage but with wm- prefix to be safe */
.wfg { display:flex; flex-direction:column; gap:6px; }
.wfl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text3); }
.wfi {
  height:42px; padding:0 14px;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%;
  outline:none;
}
.wfi:focus { border-color:var(--b); box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
.wfi.werr { border-color:var(--red); }

/* textarea for address */
.wfi-ta {
  height:auto; padding:11px 14px; resize:none;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text); line-height:1.5;
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%;
  outline:none;
}
.wfi-ta:focus { border-color:var(--b); box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
.wfi-ta.werr  { border-color:var(--red); }

.wfe { font-size:11px; color:var(--red); font-weight:600; }

/* section divider */
.wm-div {
  display:flex; align-items:center; gap:10px;
  font-size:10.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:.8px; color:var(--text3); margin:2px 0;
}
.wm-div::before, .wm-div::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.07); }

/* password toggle */
.wpw-wrap { position:relative; }
.wpw-wrap .wfi { padding-right:42px; }
.wpw-eye {
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  color:var(--text3); cursor:pointer; display:flex; align-items:center;
  background:none; border:none; transition:color 0.18s; padding:0;
}
.wpw-eye:hover { color:var(--b); }

/* info banner */
.wm-info {
  display:flex; align-items:center; gap:8px;
  padding:10px 13px; border-radius:11px;
  background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.15);
  font-size:12px; color:var(--b); font-weight:600;
}

.wm-ft {
  display:flex; justify-content:flex-end; gap:8px;
  padding:14px 24px 20px; border-top:1px solid rgba(0,0,0,0.06);
  position:sticky; bottom:0; background:rgba(255,255,255,0.96);
  border-radius:0 0 22px 22px;
}
.wbtn-cncl {
  padding:0 18px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:var(--text2);
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer; border:none;
  transition:background 0.18s;
}
.wbtn-cncl:hover { background:rgba(0,0,0,0.09); }
.wbtn-sv {
  padding:0 22px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff;
  background:var(--b); font-family:inherit; cursor:pointer; border:none;
  box-shadow:0 4px 14px rgba(37,99,235,0.28);
  display:flex; align-items:center; gap:7px; transition:all 0.18s;
}
.wbtn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(37,99,235,0.38); transform:translateY(-1px); }
.wbtn-sv:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Delete confirm */
.wm-del { max-width:380px; }
.wdel-bdy { padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; }
.wdel-ico {
  width:56px; height:56px; border-radius:16px;
  background:rgba(220,38,38,0.1); color:var(--red);
  display:flex; align-items:center; justify-content:center;
}
.wdel-t { font-size:17px; font-weight:800; color:var(--text); }
.wdel-d { font-size:13px; color:var(--text3); line-height:1.5; }
.wdel-ft { display:flex; gap:8px; padding:0 24px 22px; }
.wdel-ft .wbtn-cncl { flex:1; text-align:center; }
.wbtn-del {
  flex:1; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff; background:var(--red);
  box-shadow:0 4px 14px rgba(220,38,38,0.3);
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-family:inherit; cursor:pointer; border:none; transition:all 0.18s;
}
.wbtn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.4); transform:translateY(-1px); }
.wbtn-del:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Toast */
.wtoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:10px;
  padding:12px 18px; border-radius:13px;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 8px 32px rgba(0,0,0,0.12);
  font-size:13px; font-weight:600; color:var(--text);
  animation:wsu .22s ease; max-width:320px;
}
.wtoast-ok  { border-left:4px solid #16a34a; }
.wtoast-err { border-left:4px solid var(--red); }

/* blur konten saat modal buka */
.wp-blurred {
  filter: blur(4px) brightness(0.96);
  transition: filter 0.2s ease;
  pointer-events: none;
  user-select: none;
}

@media (max-width:640px) {
  .wp-tbl th:nth-child(4), .wp-tbl td:nth-child(4) { display:none; }
  .wp-bar { flex-direction:column; align-items:stretch; }
  .wp-search { max-width:100%; }
  .wp-btn-add { justify-content:center; }
  .wgrid2 { grid-template-columns:1fr !important; }
}
`;

/* ── Helpers ── */
const initials = (n: string) => n.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();

function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setV(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return v;
}

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <div className={`wtoast ${type === "success" ? "wtoast-ok" : "wtoast-err"}`}>
      {type === "success"
        ? <CheckCircle2 size={16} color="#16a34a" />
        : <AlertCircle  size={16} color="var(--red)" />}
      {msg}
    </div>,
    document.body
  );
}

/* ════════════════════════════════════════════════
   ADD MODAL
════════════════════════════════════════════════ */
function AddModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (d: AddFormData) => Promise<void>;
}) {
  const [f, setF]       = useState<AddFormData>(EMPTY_ADD);
  const [e, setE]       = useState<Partial<Record<keyof AddFormData, string>>>({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const upd = (k: keyof AddFormData) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF(p => ({ ...p, [k]: ev.target.value }));

  const validate = () => {
    const err: Partial<Record<keyof AddFormData, string>> = {};
    if (!f.parent_name.trim()) err.parent_name = "Nama wajib diisi.";
    if (!f.phone.trim())       err.phone       = "Telepon wajib diisi.";
    else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = "Format tidak valid.";
    if (!f.address.trim())     err.address     = "Alamat wajib diisi.";
    if (!f.username.trim())    err.username    = "Username wajib diisi.";
    else if (!/^[a-zA-Z0-9]{4,50}$/.test(f.username)) err.username = "Min 4 karakter, hanya huruf & angka.";
    if (!f.password)           err.password    = "Password wajib diisi.";
    else if (f.password.length < 8) err.password = "Password minimal 8 karakter.";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = "Format email tidak valid.";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="wmbk" onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div className="wm">
        <div className="wm-hd">
          <span className="wm-title">Tambah Wali Murid</span>
          <button className="wm-cls" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="wm-body">
          {/* ── Data Wali Murid ── */}
          <div className="wm-div">Data Wali Murid</div>

          <div className="wfg">
            <label className="wfl">Nama Lengkap</label>
            <input className={`wfi ${e.parent_name ? "werr" : ""}`} placeholder="Contoh: Budi Santoso" value={f.parent_name} onChange={upd("parent_name")} />
            {e.parent_name && <span className="wfe">{e.parent_name}</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="wgrid2">
            <div className="wfg">
              <label className="wfl">Nomor Telepon</label>
              <input className={`wfi ${e.phone ? "werr" : ""}`} placeholder="08123456789" value={f.phone} onChange={upd("phone")} />
              {e.phone && <span className="wfe">{e.phone}</span>}
            </div>
            <div className="wfg">
              <label className="wfl">Email <span style={{ color:"var(--text3)", fontWeight:400, textTransform:"none" }}>(opsional)</span></label>
              <input className={`wfi ${e.email ? "werr" : ""}`} type="email" placeholder="wali@email.com" value={f.email} onChange={upd("email")} />
              {e.email && <span className="wfe">{e.email}</span>}
            </div>
          </div>

          <div className="wfg">
            <label className="wfl">Alamat</label>
            <textarea
              className={`wfi-ta ${e.address ? "werr" : ""}`}
              placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
              value={f.address}
              onChange={upd("address")}
              rows={3}
            />
            {e.address && <span className="wfe">{e.address}</span>}
          </div>

          {/* ── Akun Login ── */}
          <div className="wm-div">
            Akun Login
            <span style={{ color:"var(--b)", fontSize:9, fontWeight:700, background:"rgba(37,99,235,0.1)", padding:"2px 7px", borderRadius:99, textTransform:"none", letterSpacing:0 }}>
              role: parents
            </span>
          </div>

          <div className="wfg">
            <label className="wfl">Username</label>
            <input
              className={`wfi ${e.username ? "werr" : ""}`}
              placeholder="min. 4 karakter, huruf & angka"
              value={f.username}
              onChange={upd("username")}
              autoComplete="off"
            />
            {e.username && <span className="wfe">{e.username}</span>}
          </div>

          <div className="wfg">
            <label className="wfl">Password</label>
            <div className="wpw-wrap">
              <input
                className={`wfi ${e.password ? "werr" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="min. 8 karakter"
                value={f.password}
                onChange={upd("password")}
                autoComplete="new-password"
              />
              <button className="wpw-eye" type="button" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {e.password && <span className="wfe">{e.password}</span>}
          </div>
        </div>

        <div className="wm-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"wspin 1s linear infinite" }} /> Menyimpan...</>
              : <><CheckCircle2 size={14} /> Tambah Wali Murid</>}
          </button>
        </div>
      </div>
    </div>
  ,
    document.body);
}

/* ════════════════════════════════════════════════
   EDIT MODAL
════════════════════════════════════════════════ */
function EditModal({ init, onClose, onSave }: {
  init: EditFormData;
  onClose: () => void;
  onSave: (d: EditFormData) => Promise<void>;
}) {
  const [f, setF]       = useState<EditFormData>(init);
  const [e, setE]       = useState<Partial<Record<keyof EditFormData, string>>>({});
  const [busy, setBusy] = useState(false);

  const updInp = (k: keyof EditFormData) =>
    (ev: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: ev.target.value }));
  const updTA = (k: keyof EditFormData) =>
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: ev.target.value }));

  const validate = () => {
    const err: Partial<Record<keyof EditFormData, string>> = {};
    if (!f.parent_name.trim()) err.parent_name = "Nama wajib diisi.";
    if (!f.phone.trim())       err.phone       = "Telepon wajib diisi.";
    else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = "Format tidak valid.";
    if (!f.address.trim())     err.address     = "Alamat wajib diisi.";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="wmbk" onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div className="wm">
        <div className="wm-hd">
          <span className="wm-title">Edit Data Wali Murid</span>
          <button className="wm-cls" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="wm-body">
          <div className="wfg">
            <label className="wfl">Nama Lengkap</label>
            <input className={`wfi ${e.parent_name ? "werr" : ""}`} placeholder="Nama lengkap" value={f.parent_name} onChange={updInp("parent_name")} />
            {e.parent_name && <span className="wfe">{e.parent_name}</span>}
          </div>

          <div className="wfg">
            <label className="wfl">Nomor Telepon</label>
            <input className={`wfi ${e.phone ? "werr" : ""}`} placeholder="08123456789" value={f.phone} onChange={updInp("phone")} />
            {e.phone && <span className="wfe">{e.phone}</span>}
          </div>

          <div className="wfg">
            <label className="wfl">Alamat</label>
            <textarea
              className={`wfi-ta ${e.address ? "werr" : ""}`}
              placeholder="Alamat lengkap"
              value={f.address}
              onChange={updTA("address")}
              rows={3}
            />
            {e.address && <span className="wfe">{e.address}</span>}
          </div>

          <div className="wm-info">
            <CheckCircle2 size={14} />
            Username &amp; password tidak berubah. Hubungi admin untuk reset akun.
          </div>
        </div>

        <div className="wm-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"wspin 1s linear infinite" }} /> Menyimpan...</>
              : <><CheckCircle2 size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>
  ,
    document.body);
}

/* ════════════════════════════════════════════════
   DELETE MODAL
════════════════════════════════════════════════ */
function DeleteModal({ parent, onClose, onConfirm }: {
  parent: Parent;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };

  return createPortal(
    <div className="wmbk" onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div className="wm wm-del">
        <div className="wdel-bdy">
          <div className="wdel-ico"><Trash2 size={24} /></div>
          <div className="wdel-t">Hapus Wali Murid?</div>
          <div className="wdel-d">
            Data <b>{parent.parent_name}</b> beserta akun login akan dihapus permanen dan tidak dapat dikembalikan.
          </div>
        </div>
        <div className="wdel-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-del" onClick={go} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"wspin 1s linear infinite" }} /> Menghapus...</>
              : <><Trash2 size={14} /> Hapus</>}
          </button>
        </div>
      </div>
    </div>
  ,
    document.body);
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function WaliMuridPage() {
  const [data,    setData]    = useState<Parent[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0, page:1, per_page:10, last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add" | "edit" | "delete" | null>(null);
  const [sel,     setSel]     = useState<Parent | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const dSearch = useDebounce(search);

  /* ── Load data ── */
  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), per_page: "10", search: dSearch });
      const j = await (await fetch(`${API}?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } catch {
      setToast({ msg: "Gagal memuat data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [dSearch]);

  useEffect(() => { load(1); }, [load]);

  /* ── Store ── */
  const post = async (d: AddFormData) => {
    const j = await (await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(d),
    })).json();

    if (j.success) {
      setToast({ msg: "Wali murid & akun berhasil ditambahkan.", type: "success" });
      setModal(null);
      load(1);
    } else if (j.errors) {
      const firstErr = Object.values(j.errors as Record<string, string[]>)[0]?.[0];
      setToast({ msg: firstErr ?? "Validasi gagal.", type: "error" });
    } else {
      setToast({ msg: j.message ?? "Gagal menambahkan.", type: "error" });
    }
  };

  /* ── Update ── */
  const put = async (d: EditFormData) => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(d),
    })).json();

    if (j.success) {
      setToast({ msg: "Data berhasil diperbarui.", type: "success" });
      setModal(null);
      load(meta.page);
    } else {
      setToast({ msg: j.message ?? "Gagal memperbarui.", type: "error" });
    }
  };

  /* ── Delete ── */
  const del = async () => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, {
      method: "DELETE",
      headers: { "Accept": "application/json" },
    })).json();

    if (j.success) {
      setToast({ msg: "Wali murid berhasil dihapus.", type: "success" });
      setModal(null);
      load(data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page);
    } else {
      setToast({ msg: j.message ?? "Gagal menghapus.", type: "error" });
    }
  };

  /* ── Pagination ── */
  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1, page - 2), e2 = Math.min(last_page, page + 2);
    return Array.from({ length: e2 - s + 1 }, (_, i) => s + i);
  };

  /* ── Render ── */
  return (
    <>
      <style>{CSS}</style>
      <div className={`wp${modal ? " wp-blurred" : ""}`}>

        {/* Header */}
        <div className="wp-hd">
          <div>
            <div className="wp-ttl">Manajemen Wali Murid</div>
            <div className="wp-sub">Kelola seluruh data wali murid yang terdaftar di sistem</div>
          </div>
          <div className="wp-chips">
            <div className="wp-chip">
              <span className="wchip-dot" style={{ background:"var(--b)" }} />
              {meta.total} Wali Murid Terdaftar
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="wp-bar">
          <div className="wp-search">
            <Search size={15} color="var(--text3)" />
            <input
              placeholder="Cari nama, telepon, alamat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color:"var(--text3)", display:"flex", background:"none", border:"none", cursor:"pointer" }}>
                <X size={13} />
              </button>
            )}
          </div>

          <button className="wp-btn-add" onClick={() => { setSel(null); setModal("add"); }}>
            <Plus size={15} /> Tambah Wali Murid
          </button>
        </div>

        {/* Table */}
        <div className="wp-card">
          <div className="wp-tbl">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Wali Murid</th>
                  <th>Telepon</th>
                  <th>Alamat</th>
                  <th>Terdaftar</th>
                  <th style={{ textAlign:"right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color:"var(--text3)", fontSize:12 }}>
                      {(meta.page - 1) * meta.per_page + i + 1}
                    </td>
                    <td>
                      <div className="p-cell">
                        <div className="p-av">{initials(p.parent_name)}</div>
                        <div>
                          <div className="p-name">{p.parent_name}</div>
                          {p.user_id && <div className="p-uid">UID: {p.user_id}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <Phone size={12} color="var(--text3)" />{p.phone}
                      </span>
                    </td>
                    <td>
                      <div className="p-addr" title={p.address}>
                        <MapPin size={12} color="var(--text3)" style={{ flexShrink:0 }} />
                        {p.address}
                      </div>
                    </td>
                    <td style={{ color:"var(--text3)", fontSize:12 }}>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })
                        : "—"}
                    </td>
                    <td>
                      <div className="wp-acts">
                        <button
                          className="wp-act wa-e"
                          title="Edit"
                          onClick={() => { setSel(p); setModal("edit"); }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="wp-act wa-d"
                          title="Hapus"
                          onClick={() => { setSel(p); setModal("delete"); }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Loading */}
            {loading && (
              <div className="wp-spin">
                <Loader2 size={28} color="var(--b)" style={{ animation:"wspin 1s linear infinite" }} />
              </div>
            )}

            {/* Empty */}
            {!loading && data.length === 0 && (
              <div className="wp-empty">
                <Users size={40} color="var(--text3)" />
                <div className="wp-empty-lbl">
                  {search ? "Tidak ada wali murid yang sesuai pencarian." : "Belum ada wali murid terdaftar."}
                </div>
                {!search && (
                  <button className="wp-btn-add" style={{ marginTop:4 }} onClick={() => setModal("add")}>
                    <Plus size={14} /> Tambah Wali Murid Pertama
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && meta.total > 0 && (
            <div className="wp-pag">
              <span className="wp-pag-info">
                {(meta.page - 1) * meta.per_page + 1}–{Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} wali murid
              </span>
              <div className="wp-pag-btns">
                <button className="wpb" disabled={meta.page === 1} onClick={() => load(meta.page - 1)}>
                  <ChevronLeft size={14} />
                </button>
                {pgs().map(p => (
                  <button key={p} className={`wpb ${p === meta.page ? "wpb--on" : ""}`} onClick={() => load(p)}>
                    {p}
                  </button>
                ))}
                <button className="wpb" disabled={meta.page === meta.last_page} onClick={() => load(meta.page + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <AddModal onClose={() => setModal(null)} onSave={post} />
      )}
      {modal === "edit" && sel && (
        <EditModal
          init={{ parent_name: sel.parent_name, phone: sel.phone, address: sel.address }}
          onClose={() => setModal(null)}
          onSave={put}
        />
      )}
      {modal === "delete" && sel && (
        <DeleteModal parent={sel} onClose={() => setModal(null)} onConfirm={del} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}