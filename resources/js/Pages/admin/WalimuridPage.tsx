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
   STYLES (APPLE LIQUID GLASS)
═══════════════════════════════════════════════════════════ */
const CSS = `
.wp { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }

.wp-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.wp-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.wp-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }

.wp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.wp-chip {
  display:flex; align-items:center; gap:8px;
  padding:8px 16px; border-radius:99px;
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  font-size:12.5px; font-weight:700; color:#1e293b;
}
.wchip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

.wp-bar { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }

.wp-search {
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
.wp-search:focus-within {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(37,99,235,0.3);
  box-shadow: 0 8px 24px rgba(37,99,235,0.06), 0 0 0 3px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.wp-search input { 
  flex:1; font-size:14px; color:#1e293b; font-family:inherit; font-weight: 500;
  background:transparent; border:none; outline:none; box-shadow:none; 
}
.wp-search input::placeholder { color:#94a3b8; font-weight: 400; }

.wp-search-clear {
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  cursor: pointer; border:none;
}
.wp-search-clear:hover { background: rgba(220,38,38,0.1); color: #dc2626; transform: scale(1.05); }

.wp-btn-add {
  margin-left: auto;
  display:flex; align-items:center; gap:6px;
  height:44px; padding:0 20px; border-radius:14px;
  background:#2563eb; color:#fff;
  font-size:14px; font-weight:700; font-family:inherit; cursor:pointer;
  box-shadow: 0 6px 16px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
  transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); white-space:nowrap; border:none;
}
.wp-btn-add:hover { box-shadow: 0 8px 24px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.3); transform:translateY(-2px); }

/* ── Table Card ── */
.wp-card {
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: saturate(200%) blur(32px); -webkit-backdrop-filter: saturate(200%) blur(32px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
  overflow: hidden;
}

.wp-tbl { overflow-x:auto; position:relative; z-index:1; }
.wp-tbl table { width:100%; border-collapse:collapse; }
.wp-tbl thead tr {
  background: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.wp-tbl th {
  padding:16px 24px; text-align:left;
  font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;
  color:#64748b; white-space:nowrap;
}
.wp-tbl td { padding:16px 24px; font-size:13.5px; color:#334155; border-bottom:1px solid rgba(0,0,0,0.03); }
.wp-tbl tbody tr { transition:background 0.2s; }
.wp-tbl tbody tr:hover { background:rgba(255,255,255,0.7); }
.wp-tbl tbody tr:last-child td { border-bottom:none; }

/* avatar cell */
.p-cell { display:flex; align-items:center; gap:14px; }
.p-av {
  width:42px; height:42px; border-radius:12px; flex-shrink:0;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:14px; color:#fff;
  box-shadow:0 4px 14px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  letter-spacing:0.5px;
}
.p-name { font-size:14px; font-weight:700; color:#1e293b; letter-spacing:-0.2px; }
.p-uid  { font-size:11px; font-weight:500; color:#64748b; margin-top:2px; }

/* address truncate */
.p-addr {
  max-width:240px; overflow:hidden; text-overflow:ellipsis;
  white-space:nowrap; display:flex; align-items:center; gap:6px;
  font-weight:500;
}

/* row actions */
.wp-acts { display:flex; gap:8px; justify-content:flex-end; }
.wp-act {
  width:36px; height:36px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.2s cubic-bezier(0.25, 1, 0.5, 1); cursor:pointer; border:none; font-family:inherit;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.wa-e { color:#2563eb; }
.wa-d { color:#dc2626; }
.wa-e:hover { background:#2563eb; color:#fff; border-color:#2563eb; transform:scale(1.05); box-shadow:0 4px 12px rgba(37,99,235,0.25); }
.wa-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.05); box-shadow:0 4px 12px rgba(220,38,38,0.25); }

/* empty & spinner */
.wp-empty {
  padding:80px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:12px;
}
.wp-empty-lbl { font-size:15px; color:#64748b; font-weight:600; }
.wp-spin { padding:80px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.wp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 24px; border-top:1px solid rgba(0,0,0,0.04); flex-wrap:wrap; gap:10px;
  background: rgba(255,255,255,0.3);
}
.wp-pag-info { font-size:13px; font-weight:500; color:#64748b; }
.wp-pag-btns { display:flex; gap:6px; }
.wpb {
  width:34px; height:34px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; font-family:inherit; cursor:pointer;
  background: rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05);
  color:#2563eb; transition:all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.wpb:hover:not(:disabled) { background:#fff; border-color:rgba(37,99,235,0.2); transform:translateY(-1px); }
.wpb:disabled { opacity:.4; cursor:not-allowed; }
.wpb--on { background:#2563eb; color:#fff; border-color:#2563eb; box-shadow:0 4px 12px rgba(37,99,235,0.3); }

/* ════════════════════════════════════════════════
   MODAL (APPLE GLASS)
════════════════════════════════════════════════ */
.wmbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:wfi .2s ease;
}
@keyframes wfi { from{opacity:0} to{opacity:1} }
@keyframes wsu { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes wspin { to{transform:rotate(360deg)} }

.wm {
  width:100%; max-width:500px;
  max-height:90vh; display:flex; flex-direction:column;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,1); border-radius:24px;
  box-shadow:0 24px 64px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1);
  animation:wsu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.wm-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  background:transparent;
}
.wm-title { font-size:18px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.wm-cls {
  width:32px; height:32px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:#64748b;
  transition:all 0.2s; cursor:pointer; border:none; font-family:inherit;
}
.wm-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; transform:scale(1.05); }

.wm-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; }

.wfg { display:flex; flex-direction:column; gap:8px; }
.wfl { font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#64748b; }
.wfi {
  height:44px; padding:0 16px;
  background:#ffffff; border:1px solid #d1d5db;
  border-radius:12px; font-size:14px; font-weight:500; color:#1e293b;
  font-family:inherit; transition:all 0.2s; width:100%; outline:none;
}
.wfi:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.15); }
.wfi.werr { border-color:#dc2626; }

.wfi-ta {
  height:auto; padding:12px 16px; resize:none;
  background:#ffffff; border:1px solid #d1d5db;
  border-radius:12px; font-size:14px; font-weight:500; color:#1e293b; line-height:1.5;
  font-family:inherit; transition:all 0.2s; width:100%; outline:none;
}
.wfi-ta:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.15); }
.wfi-ta.werr  { border-color:#dc2626; }
.wfe { font-size:11.5px; color:#dc2626; font-weight:600; }

.wm-div {
  display:flex; align-items:center; gap:12px;
  font-size:11px; font-weight:800; text-transform:uppercase;
  letter-spacing:1px; color:#64748b; margin:6px 0 4px;
}
.wm-div::before, .wm-div::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.08); }

.wpw-wrap { position:relative; }
.wpw-wrap .wfi { padding-right:44px; }
.wpw-eye {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  color:#64748b; cursor:pointer; display:flex; align-items:center;
  background:none; border:none; transition:color 0.2s; padding:0;
}
.wpw-eye:hover { color:#2563eb; }

.wm-info {
  display:flex; align-items:center; gap:10px;
  padding:12px 16px; border-radius:12px;
  background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.15);
  font-size:13px; color:#2563eb; font-weight:600;
}

.wm-ft {
  display:flex; justify-content:flex-end; gap:10px;
  padding:16px 28px 24px; border-top:1px solid rgba(0,0,0,0.06);
  background:transparent;
}
.wbtn-cncl {
  padding:0 20px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#475569;
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer; border:none;
  transition:background 0.2s;
}
.wbtn-cncl:hover { background:rgba(0,0,0,0.1); }
.wbtn-sv {
  padding:0 24px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#fff;
  background:#2563eb; font-family:inherit; cursor:pointer; border:none;
  box-shadow:0 4px 14px rgba(37,99,235,0.25);
  display:flex; align-items:center; gap:8px; transition:all 0.2s;
}
.wbtn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(37,99,235,0.35); transform:translateY(-1px); }
.wbtn-sv:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Delete confirm */
.wm-del { max-width:400px; }
.wdel-bdy { padding:32px 28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
.wdel-ico {
  width:64px; height:64px; border-radius:20px;
  background:linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05)); color:#dc2626;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(220,38,38,0.1);
}
.wdel-t { font-size:19px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.wdel-d { font-size:14px; font-weight:500; color:#64748b; line-height:1.5; }
.wdel-ft { display:flex; gap:10px; padding:0 28px 28px; }
.wdel-ft .wbtn-cncl { flex:1; text-align:center; }
.wbtn-del {
  flex:1; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#fff; background:#dc2626;
  box-shadow:0 4px 14px rgba(220,38,38,0.25);
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-family:inherit; cursor:pointer; border:none; transition:all 0.2s;
}
.wbtn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.35); transform:translateY(-1px); }
.wbtn-del:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Toast */
.wtoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:12px;
  padding:14px 20px; border-radius:16px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,1);
  box-shadow:0 12px 40px rgba(0,0,0,0.1);
  font-size:14px; font-weight:600; color:#1e293b;
  animation:wsu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width:340px;
}
.wtoast-ok  { border-left:4px solid #16a34a; }
.wtoast-err { border-left:4px solid #dc2626; }

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
  .wp-btn-add { justify-content:center; margin-left: 0; }
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
        ? <CheckCircle2 size={18} color="#16a34a" />
        : <AlertCircle  size={18} color="#dc2626" />}
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
          <button className="wm-cls" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="wm-body">
          {/* ── Data Wali Murid ── */}
          <div className="wm-div">Data Wali Murid</div>

          <div className="wfg">
            <label className="wfl">Nama Lengkap</label>
            <input className={`wfi ${e.parent_name ? "werr" : ""}`} placeholder="Contoh: Budi Santoso" value={f.parent_name} onChange={upd("parent_name")} />
            {e.parent_name && <span className="wfe">{e.parent_name}</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="wgrid2">
            <div className="wfg">
              <label className="wfl">Nomor Telepon</label>
              <input className={`wfi ${e.phone ? "werr" : ""}`} placeholder="08123456789" value={f.phone} onChange={upd("phone")} />
              {e.phone && <span className="wfe">{e.phone}</span>}
            </div>
            <div className="wfg">
              <label className="wfl">Email <span style={{ color:"#94a3b8", fontWeight:500, textTransform:"none" }}>(opsional)</span></label>
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
            <span style={{ color:"#2563eb", fontSize:9.5, fontWeight:700, background:"rgba(37,99,235,0.1)", padding:"3px 8px", borderRadius:99, textTransform:"none", letterSpacing:0 }}>
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
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {e.password && <span className="wfe">{e.password}</span>}
          </div>
        </div>

        <div className="wm-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"wspin 1s linear infinite" }} /> Menyimpan...</>
              : <><CheckCircle2 size={16} /> Tambah Wali Murid</>}
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
          <button className="wm-cls" onClick={onClose}><X size={16} /></button>
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
            <CheckCircle2 size={16} />
            Username &amp; password tidak berubah. Hubungi admin untuk reset akun.
          </div>
        </div>

        <div className="wm-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"wspin 1s linear infinite" }} /> Menyimpan...</>
              : <><CheckCircle2 size={16} /> Simpan Perubahan</>}
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
          <div className="wdel-ico"><Trash2 size={28} /></div>
          <div className="wdel-t">Hapus Wali Murid?</div>
          <div className="wdel-d">
            Data <b>{parent.parent_name}</b> beserta akun login akan dihapus permanen dan tidak dapat dikembalikan.
          </div>
        </div>
        <div className="wdel-ft">
          <button className="wbtn-cncl" onClick={onClose}>Batal</button>
          <button className="wbtn-del" onClick={go} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"wspin 1s linear infinite" }} /> Menghapus...</>
              : <><Trash2 size={16} /> Hapus</>}
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
              <span className="wchip-dot" style={{ background:"#2563eb" }} />
              {meta.total} Wali Murid Terdaftar
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="wp-bar">
          <div className="wp-search">
            <Search size={16} color="#64748b" className="flex-shrink-0" />
            <input
              placeholder="Cari nama, telepon, alamat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-0 focus:ring-0 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="wp-search-clear">
                <X size={14} strokeWidth={2.5}/>
              </button>
            )}
          </div>

          <button className="wp-btn-add" onClick={() => { setSel(null); setModal("add"); }}>
            <Plus size={16} /> Tambah Wali Murid
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
                    <td style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>
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
                      <span style={{ display:"flex", alignItems:"center", gap:6, fontWeight:500 }}>
                        <Phone size={13} color="#64748b" />{p.phone}
                      </span>
                    </td>
                    <td>
                      <div className="p-addr" title={p.address}>
                        <MapPin size={13} color="#64748b" style={{ flexShrink:0 }} />
                        {p.address}
                      </div>
                    </td>
                    <td style={{ color:"#64748b", fontSize:12.5, fontWeight:500 }}>
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
                          <Pencil size={15} />
                        </button>
                        <button
                          className="wp-act wa-d"
                          title="Hapus"
                          onClick={() => { setSel(p); setModal("delete"); }}
                        >
                          <Trash2 size={15} />
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
                <Loader2 size={32} color="#2563eb" style={{ animation:"wspin 1s linear infinite" }} />
              </div>
            )}

            {/* Empty */}
            {!loading && data.length === 0 && (
              <div className="wp-empty">
                <Users size={48} color="#94a3b8" style={{ opacity:0.5 }} />
                <div className="wp-empty-lbl">
                  {search ? "Tidak ada wali murid yang sesuai pencarian." : "Belum ada wali murid terdaftar."}
                </div>
                {!search && (
                  <button className="wp-btn-add" style={{ marginTop:8 }} onClick={() => setModal("add")}>
                    <Plus size={16} /> Tambah Wali Murid Pertama
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
                  <ChevronLeft size={16} />
                </button>
                {pgs().map(p => (
                  <button key={p} className={`wpb ${p === meta.page ? "wpb--on" : ""}`} onClick={() => load(p)}>
                    {p}
                  </button>
                ))}
                <button className="wpb" disabled={meta.page === meta.last_page} onClick={() => load(meta.page + 1)}>
                  <ChevronRight size={16} />
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