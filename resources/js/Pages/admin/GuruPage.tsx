import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  GraduationCap, Phone, BookOpen, Loader2, AlertCircle,
  CheckCircle2, Filter, Eye, EyeOff, ChevronDown, Check
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Teacher {
  id: string;
  user_id: string | null;
  nama_guru: string;
  phone: string;
  spesialisasi: string;
  created_at: string | null;
}
interface Meta { total: number; page: number; per_page: number; last_page: number; }
interface AddFormData {
  nama_guru: string;
  phone: string;
  spesialisasi: string;
  username: string;
  password: string;
  email: string;
}
interface EditFormData {
  nama_guru: string;
  phone: string;
  spesialisasi: string;
}

type FormData = AddFormData | EditFormData;

const EMPTY_ADD: AddFormData = { nama_guru: "", phone: "", spesialisasi: "", username: "", password: "", email: "" };
const EMPTY_EDIT: EditFormData = { nama_guru: "", phone: "", spesialisasi: "" };
const API  = "/api/teachers";

/* ═══════════════════════════════════════════════════════════
   STYLES (REFINED APPLE GLASS + HEX COLORS)
═══════════════════════════════════════════════════════════ */
const CSS = `
.gp { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }

.gp-hd { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.gp-title { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.gp-sub   { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }

.gp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.gp-chip {
  display:flex; align-items:center; gap:8px;
  padding:8px 16px; border-radius:99px;
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  font-size:12.5px; font-weight:700; color:#1e293b;
}
.chip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

.gp-bar { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }

.gp-search {
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
.gp-search:focus-within {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(15,118,110,0.3);
  box-shadow: 0 8px 24px rgba(15,118,110,0.06), 0 0 0 3px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.gp-search input { 
  flex:1; font-size:14px; color:#1e293b; font-family:inherit; font-weight: 500;
  background:transparent; border:none; outline:none; box-shadow:none; 
}
.gp-search input::placeholder { color:#94a3b8; font-weight: 400; }

.gp-search-clear {
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  cursor: pointer;
}
.gp-search-clear:hover { background: rgba(220,38,38,0.1); color: #dc2626; transform: scale(1.05); }

/* ── CUSTOM DROPDOWN FILTER (APPLE LIQUID GLASS) ── */
.gp-sel-wrap { position: relative; }
.gp-sel {
  display:flex; align-items:center; gap:8px;
  height:44px; padding:0 16px; min-width:200px;
  background: rgba(255, 255, 255, 0.7); 
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer; user-select: none;
}
.gp-sel:hover { background: rgba(255, 255, 255, 0.9); }
.gp-sel--open {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(15,118,110,0.4);
  box-shadow: 0 8px 24px rgba(15,118,110,0.08), 0 0 0 3px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.gp-sel-val { flex:1; font-size:14px; font-weight:600; color:#1e293b; text-align: left; }

.sel-menu {
  position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: saturate(200%) blur(40px); -webkit-backdrop-filter: saturate(200%) blur(40px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 18px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
  padding: 8px; display: flex; flex-direction: column; gap: 4px;
  z-index: 100;
  animation: su .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.sel-item {
  padding: 12px 14px; border-radius: 12px;
  font-size: 13.5px; font-weight: 500; color: #475569;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: space-between;
}
.sel-item:hover { background: rgba(15,118,110,0.08); color: #0f766e; }
.sel-item.active {
  background: linear-gradient(135deg, #0f766e, #115e59);
  color: #fff; font-weight: 700;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}
.sel-overlay { position: fixed; inset: 0; z-index: 99; }

.btn-add {
  margin-left: auto;
  display:flex; align-items:center; gap:6px;
  height:44px; padding:0 20px; border-radius:14px;
  background:#0f766e; color:#fff;
  font-size:14px; font-weight:700; font-family:inherit;
  box-shadow: 0 6px 16px rgba(15,118,110,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
  transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); white-space:nowrap; border: none; cursor:pointer;
}
.btn-add:hover { 
  box-shadow: 0 8px 24px rgba(15,118,110,0.35), inset 0 1px 0 rgba(255,255,255,0.3); 
  transform:translateY(-2px); 
}

.gp-card {
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
  overflow: hidden;
}

.gp-tbl-wrap { overflow-x:auto; position:relative; z-index:1; }

table { width:100%; border-collapse:collapse; }
thead tr {
  background: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
th {
  padding: 16px 24px; text-align:left;
  font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;
  color:#64748b; white-space:nowrap;
}
td {
  padding: 16px 24px; font-size:13.5px; color:#334155;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}
tbody tr { transition: background 0.2s; }
tbody tr:hover { background: rgba(255,255,255,0.7); }
tbody tr:last-child td { border-bottom: none; }

.g-cell { display:flex; align-items:center; gap:14px; }
.g-av {
  width:42px; height:42px; border-radius:12px; flex-shrink:0;
  background: linear-gradient(135deg, #0f766e, #115e59);
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:14px; color:#fff;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  letter-spacing:0.5px;
}
.g-name { font-size:14px; font-weight:700; color:#1e293b; letter-spacing:-0.2px; }
.g-uid  { font-size:11px; font-weight:500; color:#64748b; margin-top:2px; }

.spec {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 12px; border-radius:9px;
  background:rgba(15,118,110,0.08); border:1px solid rgba(15,118,110,0.15);
  font-size:12px; font-weight:600; color:#0f766e; white-space:nowrap;
}

.acts { display:flex; gap:8px; justify-content:flex-end; }
.act {
  width:36px; height:36px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.2s cubic-bezier(0.25, 1, 0.5, 1); font-family:inherit; cursor:pointer;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.act-e { color:#2563eb; }
.act-d { color:#dc2626; }
.act-e:hover { background:#2563eb; color:#fff; border-color:#2563eb; transform:scale(1.05); box-shadow:0 4px 12px rgba(37,99,235,0.25); }
.act-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.05); box-shadow:0 4px 12px rgba(220,38,38,0.25); }

.gp-empty {
  padding:80px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:12px;
}
.gp-empty-lbl { font-size:15px; color:#64748b; font-weight:600; }
.gp-spin  { padding:80px 20px; display:flex; justify-content:center; }

.gp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 24px; border-top:1px solid rgba(0,0,0,0.04); flex-wrap:wrap; gap:10px;
  background: rgba(255,255,255,0.3);
}
.pag-info { font-size:13px; font-weight:500; color:#64748b; }
.pag-btns { display:flex; gap:6px; }
.pb {
  width:34px; height:34px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700;
  background: rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05);
  color:#0f766e; transition:all 0.2s; cursor:pointer; font-family:inherit;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.pb:hover:not(:disabled) { background:#fff; border-color:rgba(15,118,110,0.2); transform:translateY(-1px); }
.pb:disabled { opacity:.4; cursor:not-allowed; }
.pb--on {
  background:#0f766e; color:#fff; border-color:#0f766e;
  box-shadow:0 4px 12px rgba(15,118,110,0.3);
}

/* ════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════ */
.mbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:fi .2s ease; 
}
@keyframes fi { from{opacity:0} to{opacity:1} }
@keyframes su { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }

.m {
  width:100%; max-width:480px;
  max-height:90vh; display: flex; flex-direction: column;
  background:rgba(255,255,255,0.92); 
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border:1px solid rgba(255,255,255,1); border-radius:24px;
  box-shadow:0 24px 64px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1);
  animation:su .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
.m-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  background:transparent;
}
.m-title { font-size:18px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.m-cls {
  width:32px; height:32px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:#64748b;
  transition:all 0.2s; cursor:pointer; border:none;
}
.m-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; transform:scale(1.05); }

.m-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y: auto; flex: 1; }
.fg { display:flex; flex-direction:column; gap:8px; }
.fl { font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#64748b; }
.fi {
  height:44px; padding:0 16px;
  background:#ffffff; border:1px solid #d1d5db;
  border-radius:12px; font-size:14px; font-weight:500; color:#1e293b;
  font-family:inherit; transition:all 0.2s; width:100%;
}
.fi:focus { border-color:#0f766e; box-shadow:0 0 0 3px rgba(15,118,110,0.15); outline:none; }
.fi.err { border-color:#dc2626; }
.fe { font-size:11.5px; color:#dc2626; font-weight:600; }

.pw-wrap { position:relative; }
.pw-wrap .fi { padding-right:44px; }
.pw-eye {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  color:#64748b; cursor:pointer; display:flex; align-items:center;
  background:none; border:none; transition:color 0.2s;
}
.pw-eye:hover { color:#0f766e; }

.m-divider {
  display:flex; align-items:center; gap:12px;
  font-size:11px; font-weight:800; text-transform:uppercase;
  letter-spacing:1px; color:#64748b; margin:6px 0 4px;
}
.m-divider::before, .m-divider::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.08); }

.m-ft {
  display:flex; justify-content:flex-end; gap:10px;
  padding:16px 28px 24px; border-top:1px solid rgba(0,0,0,0.06);
  background:transparent; 
}
.btn-cncl {
  padding:0 20px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#475569;
  background:rgba(0,0,0,0.05); border:none; cursor:pointer;
  transition:all 0.2s;
}
.btn-cncl:hover { background:rgba(0,0,0,0.1); }
.btn-sv {
  padding:0 24px; height:44px; border-radius:12px;
  font-size:14px; font-weight:700; color:#fff;
  background:#0f766e; border:none; cursor:pointer;
  box-shadow:0 4px 14px rgba(15,118,110,0.25);
  display:flex; align-items:center; gap:8px; transition:all 0.2s;
}
.btn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(15,118,110,0.35); transform:translateY(-1px); }
.btn-sv:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Delete modal */
.m-del { max-width:400px; }
.del-bdy { padding:32px 28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
.del-ico {
  width:64px; height:64px; border-radius:20px;
  background: linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05)); color:#dc2626;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(220,38,38,0.1);
}
.del-t { font-size:19px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.del-d { font-size:14px; font-weight:500; color:#64748b; line-height:1.5; }
.del-ft { display:flex; gap:10px; padding:0 28px 28px; }
.del-ft .btn-cncl { flex:1; text-align:center; }
.btn-del {
  flex:1; height:44px; border-radius:12px; border:none;
  font-size:14px; font-weight:700; color:#fff; background:#dc2626;
  box-shadow:0 4px 14px rgba(220,38,38,0.25);
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:all 0.2s; cursor:pointer;
}
.btn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.35); transform:translateY(-1px); }
.btn-del:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Toast */
.toast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:12px;
  padding:14px 20px; border-radius:16px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,1);
  box-shadow:0 12px 40px rgba(0,0,0,0.1);
  font-size:14px; font-weight:600; color:#1e293b;
  animation:su .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width:340px;
}
.toast-ok  { border-left:4px solid #16a34a; }
.toast-err { border-left:4px solid #dc2626; }

@media (max-width:640px) {
  th:nth-child(5), td:nth-child(5) { display:none; }
  .gp-bar { flex-direction:column; align-items:stretch; }
  .gp-search { max-width:100%; }
  .btn-add { justify-content:center; margin-left: 0; }
}
`;

/* ── Helpers ── */
const initials = (n: string) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
function useDebounce<T>(val: T, ms=400): T {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type==="success"?"toast-ok":"toast-err"}`}>
      {type==="success" ? <CheckCircle2 size={18} color="#16a34a"/> : <AlertCircle size={18} color="#dc2626"/>}
      {msg}
    </div>
  );
}

/* ── Add Modal ── */
function AddModal({ specs, onClose, onSave }: {
  specs: string[];
  onClose: ()=>void;
  onSave: (d: AddFormData)=>Promise<void>;
}) {
  const [f, setF]     = useState<AddFormData>(EMPTY_ADD);
  const [e, setE]     = useState<Partial<Record<keyof AddFormData, string>>>({});
  const [busy, setBusy]   = useState(false);
  const [showPw, setShowPw] = useState(false);

  const upd = (k: keyof AddFormData) => (ev: React.ChangeEvent<HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: ev.target.value }));

  const validate = () => {
    const err: Partial<Record<keyof AddFormData, string>> = {};
    if (!f.nama_guru.trim())    err.nama_guru    = "Nama wajib diisi.";
    if (!f.phone.trim())        err.phone        = "Telepon wajib diisi.";
    else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = "Format tidak valid.";
    if (!f.spesialisasi.trim()) err.spesialisasi = "Spesialisasi wajib diisi.";
    if (!f.username.trim())     err.username     = "Username wajib diisi.";
    else if (!/^[a-zA-Z0-9]{4,50}$/.test(f.username)) err.username = "Min 4 karakter, huruf & angka.";
    if (!f.password)            err.password     = "Password wajib diisi.";
    else if (f.password.length < 8) err.password = "Min 8 karakter.";
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
    <div className="mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="m">
        <div className="m-hd">
          <span className="m-title">Tambah Guru Baru</span>
          <button className="m-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="m-body">

          {/* ── Info Guru ── */}
          <div className="m-divider">Data Guru</div>

          <div className="fg">
            <label className="fl">Nama Guru</label>
            <input className={`fi ${e.nama_guru?"err":""}`} placeholder="Contoh: Ahmad Fauzi, S.Pd" value={f.nama_guru} onChange={upd("nama_guru")}/>
            {e.nama_guru && <span className="fe">{e.nama_guru}</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="fg">
              <label className="fl">Nomor Telepon</label>
              <input className={`fi ${e.phone?"err":""}`} placeholder="08123456789" value={f.phone} onChange={upd("phone")}/>
              {e.phone && <span className="fe">{e.phone}</span>}
            </div>
            <div className="fg">
              <label className="fl">Spesialisasi</label>
              <input className={`fi ${e.spesialisasi?"err":""}`} placeholder="Matematika" value={f.spesialisasi} onChange={upd("spesialisasi")} list="sl"/>
              <datalist id="sl">{specs.map(s=><option key={s} value={s}/>)}</datalist>
              {e.spesialisasi && <span className="fe">{e.spesialisasi}</span>}
            </div>
          </div>

          {/* ── Akun ── */}
          <div className="m-divider">Akun Login <span style={{ color:"#0f766e", fontSize:9.5, fontWeight:700, background:"rgba(15,118,110,0.1)", padding:"3px 8px", borderRadius:99, textTransform:"none", letterSpacing:0 }}>role: teacher</span></div>

          <div className="fg">
            <label className="fl">Username</label>
            <input className={`fi ${e.username?"err":""}`} placeholder="min. 4 karakter, huruf & angka" value={f.username} onChange={upd("username")} autoComplete="off"/>
            {e.username && <span className="fe">{e.username}</span>}
          </div>

          <div className="fg">
            <label className="fl">Password</label>
            <div className="pw-wrap">
              <input
                className={`fi ${e.password?"err":""}`}
                type={showPw ? "text" : "password"}
                placeholder="min. 8 karakter"
                value={f.password}
                onChange={upd("password")}
                autoComplete="new-password"
              />
              <button className="pw-eye" type="button" onClick={() => setShowPw(p=>!p)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {e.password && <span className="fe">{e.password}</span>}
          </div>

          <div className="fg">
            <label className="fl">Email <span style={{ color:"#94a3b8", fontWeight:500, textTransform:"none" }}>(opsional)</span></label>
            <input className={`fi ${e.email?"err":""}`} type="email" placeholder="guru@sekolah.ac.id" value={f.email} onChange={upd("email")}/>
            {e.email && <span className="fe">{e.email}</span>}
          </div>

        </div>
        <div className="m-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={16}/> Tambah Guru</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Edit Modal ── */
function EditModal({ init, specs, onClose, onSave }: {
  init: EditFormData; specs: string[];
  onClose: ()=>void; onSave: (d: EditFormData)=>Promise<void>;
}) {
  const [f, setF]   = useState<EditFormData>(init);
  const [e, setE]   = useState<Partial<Record<keyof EditFormData, string>>>({});
  const [busy, setBusy] = useState(false);

  const upd = (k: keyof EditFormData) => (ev: React.ChangeEvent<HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: ev.target.value }));

  const validate = () => {
    const err: Partial<Record<keyof EditFormData, string>> = {};
    if (!f.nama_guru.trim())    err.nama_guru    = "Nama wajib diisi.";
    if (!f.phone.trim())        err.phone        = "Telepon wajib diisi.";
    else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = "Format tidak valid.";
    if (!f.spesialisasi.trim()) err.spesialisasi = "Spesialisasi wajib diisi.";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="m">
        <div className="m-hd">
          <span className="m-title">Edit Data Guru</span>
          <button className="m-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="m-body">
          <div className="fg">
            <label className="fl">Nama Guru</label>
            <input className={`fi ${e.nama_guru?"err":""}`} placeholder="Contoh: Ahmad Fauzi, S.Pd" value={f.nama_guru} onChange={upd("nama_guru")}/>
            {e.nama_guru && <span className="fe">{e.nama_guru}</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="fg">
              <label className="fl">Nomor Telepon</label>
              <input className={`fi ${e.phone?"err":""}`} placeholder="08123456789" value={f.phone} onChange={upd("phone")}/>
              {e.phone && <span className="fe">{e.phone}</span>}
            </div>
            <div className="fg">
              <label className="fl">Spesialisasi</label>
              <input className={`fi ${e.spesialisasi?"err":""}`} placeholder="Matematika" value={f.spesialisasi} onChange={upd("spesialisasi")} list="sl-edit"/>
              <datalist id="sl-edit">{specs.map(s=><option key={s} value={s}/>)}</datalist>
              {e.spesialisasi && <span className="fe">{e.spesialisasi}</span>}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.15)" }}>
            <CheckCircle2 size={16} color="#2563eb"/>
            <span style={{ fontSize:13, color:"#2563eb", fontWeight:600 }}>
              Username & password tidak berubah. Hubungi admin untuk reset akun.
            </span>
          </div>
        </div>
        <div className="m-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={16}/> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Delete Modal ── */
function DeleteModal({ teacher, onClose, onConfirm }: {
  teacher: Teacher; onClose: ()=>void; onConfirm: ()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return createPortal(
    <div className="mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="m m-del">
        <div className="del-bdy">
          <div className="del-ico"><Trash2 size={28}/></div>
          <div className="del-t">Hapus Guru?</div>
          <div className="del-d">Data <b>{teacher.nama_guru}</b> akan dihapus permanen dan tidak dapat dikembalikan.</div>
        </div>
        <div className="del-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-del" onClick={go} disabled={busy}>
            {busy ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/> Menghapus...</> : <><Trash2 size={16}/> Hapus</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function GuruPage() {
  const [data,    setData]    = useState<Teacher[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0, page:1, per_page:10, last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [spec,    setSpec]    = useState("");
  const [specs,   setSpecs]   = useState<string[]>([]);
  const [modal,   setModal]   = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,     setSel]     = useState<Teacher|null>(null);
  const [toast,   setToast]   = useState<{ msg:string; type:"success"|"error" }|null>(null);
  
  // STATE BARU UNTUK FILTER DROPDOWN
  const [filterOpen, setFilterOpen] = useState(false);

  const dSearch = useDebounce(search);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"10", search:dSearch, spesialisasi:spec });
      const j = await (await fetch(`${API}?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } catch { setToast({ msg:"Gagal memuat data.", type:"error" }); }
    finally  { setLoading(false); }
  }, [dSearch, spec]);

  const loadSpecs = useCallback(async () => {
    try { const j = await (await fetch(`${API}/spesialisasi`)).json(); if (j.success) setSpecs(j.data); } catch {}
  }, []);

  useEffect(() => { load(1); },   [load]);
  useEffect(() => { loadSpecs(); }, [loadSpecs]);

  const post = async (d: AddFormData) => {
    const j = await (await fetch(API, { method:"POST", headers:{ "Content-Type":"application/json","Accept":"application/json" }, body:JSON.stringify(d) })).json();
    if (j.success) { setToast({ msg:"Guru & akun berhasil ditambahkan.", type:"success" }); setModal(null); load(1); loadSpecs(); }
    else if (j.errors) {
      const firstErr = Object.values(j.errors as Record<string, string[]>)[0]?.[0];
      setToast({ msg: firstErr ?? "Validasi gagal.", type:"error" });
    }
    else setToast({ msg: j.message ?? "Gagal menambahkan.", type:"error" });
  };

  const put = async (d: EditFormData) => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, { method:"PUT", headers:{ "Content-Type":"application/json","Accept":"application/json" }, body:JSON.stringify(d) })).json();
    if (j.success) { setToast({ msg:"Data berhasil diperbarui.", type:"success" }); setModal(null); load(meta.page); loadSpecs(); }
    else setToast({ msg: j.message ?? "Gagal memperbarui.", type:"error" });
  };

  const del = async () => {
    if (!sel) return;
    const j = await (await fetch(`${API}/${sel.id}`, { method:"DELETE", headers:{ "Accept":"application/json" } })).json();
    if (j.success) { setToast({ msg:"Guru berhasil dihapus.", type:"success" }); setModal(null); load(data.length===1&&meta.page>1 ? meta.page-1 : meta.page); loadSpecs(); }
    else setToast({ msg: j.message ?? "Gagal menghapus.", type:"error" });
  };

  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1, page-2), e = Math.min(last_page, page+2);
    return Array.from({ length: e-s+1 }, (_,i) => s+i);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gp">

        {/* Header */}
        <div className="gp-hd">
          <div>
            <div className="gp-title">Manajemen Guru</div>
            <div className="gp-sub">Kelola seluruh data guru yang terdaftar di sistem</div>
          </div>
          <div className="gp-chips">
            <div className="gp-chip">
              <span className="chip-dot" style={{ background:"#0f766e" }}/>
              {meta.total} Guru Terdaftar
            </div>
            {specs.length > 0 && (
              <div className="gp-chip">
                <span className="chip-dot" style={{ background:"#2563eb" }}/>
                {specs.length} Spesialisasi
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="gp-bar">
          {/* Pencarian */}
          <div className="gp-search">
            <Search size={16} color="#64748b" className="flex-shrink-0" />
            <input
              placeholder="Cari nama, telepon, spesialisasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-0 focus:ring-0 outline-none flex-1"
            />
            {search && (
              <button onClick={()=>setSearch("")} className="gp-search-clear" title="Bersihkan pencarian">
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* PERBAIKAN: Custom Dropdown Filter */}
          <div className="gp-sel-wrap">
            <div 
              className={`gp-sel ${filterOpen ? 'gp-sel--open' : ''}`} 
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={15} color="#64748b" className="flex-shrink-0" />
              <span className="gp-sel-val">{spec || "Semua Spesialisasi"}</span>
              <ChevronDown 
                size={16} 
                color="#64748b" 
                className={`flex-shrink-0 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} 
              />
            </div>

            {filterOpen && (
              <>
                {/* Overlay transparan untuk mendeteksi klik di luar menu agar menu menutup */}
                <div className="sel-overlay" onClick={() => setFilterOpen(false)} />
                <div className="sel-menu">
                  
                  <div 
                    className={`sel-item ${spec === "" ? "active" : ""}`} 
                    onClick={() => { setSpec(""); setFilterOpen(false); }}
                  >
                    <span>Semua Spesialisasi</span>
                    {spec === "" && <Check size={16} />}
                  </div>

                  {specs.map(s => (
                    <div 
                      key={s} 
                      className={`sel-item ${spec === s ? "active" : ""}`} 
                      onClick={() => { setSpec(s); setFilterOpen(false); }}
                    >
                      <span>{s}</span>
                      {spec === s && <Check size={16} />}
                    </div>
                  ))}

                </div>
              </>
            )}
          </div>

          <button className="btn-add" onClick={()=>{ setSel(null); setModal("add"); }}>
            <Plus size={16}/> Tambah Guru
          </button>
        </div>

        {/* Table Card */}
        <div className="gp-card">
          <div className="gp-tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guru</th>
                  <th>Spesialisasi</th>
                  <th>Telepon</th>
                  <th>Terdaftar</th>
                  <th style={{ textAlign:"right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>{(meta.page-1)*meta.per_page+i+1}</td>
                    <td>
                      <div className="g-cell">
                        <div className="g-av">{initials(t.nama_guru)}</div>
                        <div>
                          <div className="g-name">{t.nama_guru}</div>
                          {t.user_id && <div className="g-uid">UID: {t.user_id}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="spec"><BookOpen size={12}/>{t.spesialisasi}</span></td>
                    <td>
                      <span style={{ display:"flex", alignItems:"center", gap:6, fontWeight:500 }}>
                        <Phone size={13} color="#64748b"/>{t.phone}
                      </span>
                    </td>
                    <td style={{ color:"#64748b", fontSize:12.5, fontWeight:500 }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID",{ day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </td>
                    <td>
                      <div className="acts">
                        <button className="act act-e" title="Edit" onClick={()=>{ setSel(t); setModal("edit"); }}><Pencil size={15}/></button>
                        <button className="act act-d" title="Hapus" onClick={()=>{ setSel(t); setModal("delete"); }}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="gp-spin">
                <Loader2 size={32} color="#0f766e" style={{ animation:"spin 1s linear infinite" }}/>
              </div>
            )}

            {!loading && data.length === 0 && (
              <div className="gp-empty">
                <GraduationCap size={48} color="#94a3b8" style={{ opacity: 0.5 }}/>
                <div className="gp-empty-lbl">
                  {search||spec ? "Tidak ada guru yang sesuai pencarian." : "Belum ada guru terdaftar."}
                </div>
                {!search && !spec && (
                  <button className="btn-add" style={{ marginTop:8, marginInline:"auto" }} onClick={()=>setModal("add")}>
                    <Plus size={16}/> Tambah Guru Pertama
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && meta.total > 0 && (
            <div className="gp-pag">
              <span className="pag-info">
                {(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page, meta.total)} dari {meta.total} guru
              </span>
              <div className="pag-btns">
                <button className="pb" disabled={meta.page===1} onClick={()=>load(meta.page-1)}>
                  <ChevronLeft size={16}/>
                </button>
                {pgs().map(p => (
                  <button key={p} className={`pb ${p===meta.page?"pb--on":""}`} onClick={()=>load(p)}>{p}</button>
                ))}
                <button className="pb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal==="add" && (
        <AddModal specs={specs} onClose={()=>setModal(null)} onSave={post}/>
      )}
      {modal==="edit" && sel && (
        <EditModal
          init={{ nama_guru:sel.nama_guru, phone:sel.phone, spesialisasi:sel.spesialisasi }}
          specs={specs} onClose={()=>setModal(null)} onSave={put}
        />
      )}
      {modal==="delete" && sel && (
        <DeleteModal teacher={sel} onClose={()=>setModal(null)} onConfirm={del}/>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}