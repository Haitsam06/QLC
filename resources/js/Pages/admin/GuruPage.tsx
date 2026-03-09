import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  GraduationCap, Phone, BookOpen, Loader2, AlertCircle,
  CheckCircle2, Filter, Eye, EyeOff,
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
// Form untuk TAMBAH guru (termasuk akun)
interface AddFormData {
  nama_guru: string;
  phone: string;
  spesialisasi: string;
  username: string;
  password: string;
  email: string;
}

// Form untuk EDIT guru (tanpa ubah akun)
interface EditFormData {
  nama_guru: string;
  phone: string;
  spesialisasi: string;
}

// Union untuk backward compat di komponen generik
type FormData = AddFormData | EditFormData;

const EMPTY_ADD: AddFormData = { nama_guru: "", phone: "", spesialisasi: "", username: "", password: "", email: "" };
const EMPTY_EDIT: EditFormData = { nama_guru: "", phone: "", spesialisasi: "" };
const API  = "/api/teachers";

/* ═══════════════════════════════════════════════════════════
   STYLES  (shares CSS vars from parent dashboard)
═══════════════════════════════════════════════════════════ */
const CSS = `
/* ── Page ── */
.gp { width:100%; display:flex; flex-direction:column; gap:20px; }

.gp-hd { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.gp-title { font-size:22px; font-weight:900; color:var(--text); line-height:1; }
.gp-sub   { font-size:12px; color:var(--text3); margin-top:4px; }

.gp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.gp-chip {
  display:flex; align-items:center; gap:7px;
  padding:7px 14px; border-radius:11px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); box-shadow:var(--glass-sh);
  font-size:12.5px; font-weight:700; color:var(--text);
}
.chip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Toolbar ── */
.gp-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

.gp-search {
  display:flex; align-items:center; gap:8px;
  flex:1; min-width:200px; max-width:340px;
  height:40px; padding:0 13px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.gp-search input { flex:1; font-size:13px; color:var(--text); font-family:inherit; background:transparent; }
.gp-search input::placeholder { color:var(--text3); }

.gp-sel {
  display:flex; align-items:center; gap:7px;
  height:40px; padding:0 13px; min-width:170px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.gp-sel select {
  flex:1; font-size:13px; color:var(--text); font-family:inherit;
  background:transparent; cursor:pointer;
}

.btn-add {
  display:flex; align-items:center; gap:6px;
  height:40px; padding:0 18px; border-radius:11px;
  background:var(--g); color:#fff;
  font-size:13px; font-weight:700; font-family:inherit;
  box-shadow:0 4px 16px rgba(15,118,110,0.32);
  transition:all 0.18s; white-space:nowrap;
}
.btn-add:hover { box-shadow:0 6px 22px rgba(15,118,110,0.42); transform:translateY(-1px); }

/* ── Liquid Glass Card ── */
.gp-card {
  position: relative;
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  border-radius: 24px;
  border: 1.5px solid rgba(255,255,255,0.95);
  box-shadow:
    0 8px 32px rgba(15,118,110,0.10),
    0 2px 8px  rgba(0,0,0,0.06),
    inset 0 1.5px 0 rgba(255,255,255,1),
    inset 0 -1px 0 rgba(255,255,255,0.4);
  overflow: hidden;
}
/* glossy top sheen */
.gp-card::before {
  content: "";
  position: absolute; top:0; left:0; right:0; height:56px;
  background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none; border-radius: 24px 24px 0 0; z-index: 0;
}

.gp-tbl-wrap { overflow-x:auto; position:relative; z-index:1; }

table { width:100%; border-collapse:collapse; }
thead tr {
  background: linear-gradient(90deg, rgba(15,118,110,0.12) 0%, rgba(37,99,235,0.08) 100%);
  border-bottom: 1.5px solid rgba(15,118,110,0.15);
}
th {
  padding: 13px 20px; text-align:left;
  font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.9px;
  color:var(--g); white-space:nowrap;
}
td {
  padding: 14px 20px; font-size:13px; color:var(--text2);
  border-bottom: 1px solid rgba(255,255,255,0.7);
}
tbody tr { transition: background 0.18s; }
tbody tr:hover {
  background: rgba(255,255,255,0.72);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
}
tbody tr:last-child td { border-bottom: none; }

.g-cell { display:flex; align-items:center; gap:12px; }
.g-av {
  width:38px; height:38px; border-radius:11px; flex-shrink:0;
  background: #0f766e;
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:13px; color:#fff;
  box-shadow:0 3px 12px rgba(15,118,110,0.4);
  letter-spacing:0.5px;
}
.g-name { font-size:13.5px; font-weight:700; color:var(--text); }
.g-uid  { font-size:10.5px; color:var(--text3); margin-top:1px; }

.spec {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px;
  background:rgba(15,118,110,0.08); border:1px solid rgba(15,118,110,0.15);
  font-size:11.5px; font-weight:600; color:var(--g); white-space:nowrap;
}

.acts { display:flex; gap:6px; justify-content:flex-end; }
.act {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.18s; font-family:inherit; cursor:pointer;
}
.act-e { background:rgba(37,99,235,0.08);  color:var(--b);   border:1px solid rgba(37,99,235,0.15); }
.act-d { background:rgba(220,38,38,0.08);  color:var(--red); border:1px solid rgba(220,38,38,0.15); }
.act-e:hover { background:var(--b);   color:#fff; border-color:var(--b);   }
.act-d:hover { background:var(--red); color:#fff; border-color:var(--red); }

.gp-empty {
  padding:60px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.gp-empty-lbl { font-size:14px; color:var(--text3); font-weight:600; }
.gp-spin  { padding:60px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.gp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-top:1px solid rgba(0,0,0,0.05); flex-wrap:wrap; gap:10px;
}
.pag-info { font-size:12px; color:var(--text3); }
.pag-btns { display:flex; gap:5px; }
.pb {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700;
  background:rgba(15,118,110,0.08); border:1.5px solid rgba(15,118,110,0.15);
  color:#0f766e; transition:all 0.18s; cursor:pointer; font-family:inherit;
}
.pb:hover:not(:disabled) { background:rgba(15,118,110,0.16); border-color:rgba(15,118,110,0.3); }
.pb:disabled { opacity:.35; cursor:not-allowed; }
.pb--on {
  background:#0f766e; color:#fff; border-color:#0f766e;
  box-shadow:0 3px 10px rgba(15,118,110,0.35);
  font-weight:800;
}

/* ════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════ */
.mbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.45); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:fi .18s ease;
  overflow-y:auto;
}
@keyframes fi { from{opacity:0} to{opacity:1} }
@keyframes su { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }

.m {
  width:100%; max-width:460px;
  max-height:90vh; overflow-y:auto;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.95); border-radius:22px;
  box-shadow:0 24px 80px rgba(15,118,110,0.16), 0 4px 16px rgba(0,0,0,0.08);
  animation:su .22s cubic-bezier(.4,0,.2,1);
}
.m-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.96);
  border-radius:22px 22px 0 0; z-index:1;
}
.m-title { font-size:17px; font-weight:800; color:var(--text); }
.m-cls {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3);
  transition:all 0.18s; cursor:pointer; font-family:inherit;
}
.m-cls:hover { background:rgba(220,38,38,0.1); color:var(--red); }

.m-body { padding:20px 24px; display:flex; flex-direction:column; gap:15px; }
.fg { display:flex; flex-direction:column; gap:6px; }
.fl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text3); }
.fi {
  height:42px; padding:0 14px;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%;
}
.fi:focus { border-color:var(--g); box-shadow:0 0 0 3px rgba(15,118,110,0.12); outline:none; }
.fi.err { border-color:var(--red); }
.fe { font-size:11px; color:var(--red); font-weight:600; }

/* password field wrapper */
.pw-wrap { position:relative; }
.pw-wrap .fi { padding-right:42px; }
.pw-eye {
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  color:var(--text3); cursor:pointer; display:flex; align-items:center;
  background:none; transition:color 0.18s;
}
.pw-eye:hover { color:var(--g); }

/* section divider inside modal */
.m-divider {
  display:flex; align-items:center; gap:10px;
  font-size:10.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:.8px; color:var(--text3); margin:4px 0 2px;
}
.m-divider::before, .m-divider::after {
  content:""; flex:1; height:1px; background:rgba(0,0,0,0.07);
}

.m-ft {
  display:flex; justify-content:flex-end; gap:8px;
  padding:14px 24px 20px; border-top:1px solid rgba(0,0,0,0.06);
  position:sticky; bottom:0; background:rgba(255,255,255,0.96);
  border-radius:0 0 22px 22px;
}
.btn-cncl {
  padding:0 18px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:var(--text2);
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer;
  transition:background 0.18s;
}
.btn-cncl:hover { background:rgba(0,0,0,0.09); }
.btn-sv {
  padding:0 22px; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff;
  background:var(--g); font-family:inherit; cursor:pointer;
  box-shadow:0 4px 14px rgba(15,118,110,0.3);
  display:flex; align-items:center; gap:7px; transition:all 0.18s;
}
.btn-sv:hover:not(:disabled) { box-shadow:0 6px 20px rgba(15,118,110,0.4); transform:translateY(-1px); }
.btn-sv:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Delete modal */
.m-del { max-width:380px; }
.del-bdy { padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; }
.del-ico {
  width:56px; height:56px; border-radius:16px;
  background:rgba(220,38,38,0.1); color:var(--red);
  display:flex; align-items:center; justify-content:center;
}
.del-t { font-size:17px; font-weight:800; color:var(--text); }
.del-d { font-size:13px; color:var(--text3); line-height:1.5; }
.del-ft { display:flex; gap:8px; padding:0 24px 22px; }
.del-ft .btn-cncl { flex:1; text-align:center; }
.btn-del {
  flex:1; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; color:#fff; background:var(--red);
  box-shadow:0 4px 14px rgba(220,38,38,0.3);
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-family:inherit; cursor:pointer; transition:all 0.18s;
}
.btn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.4); transform:translateY(-1px); }
.btn-del:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Toast */
.toast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:10px;
  padding:12px 18px; border-radius:13px;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 8px 32px rgba(0,0,0,0.12);
  font-size:13px; font-weight:600; color:var(--text);
  animation:su .22s ease; max-width:320px;
}
.toast-ok  { border-left:4px solid #16a34a; }
.toast-err { border-left:4px solid var(--red); }

@media (max-width:640px) {
  th:nth-child(5), td:nth-child(5) { display:none; }
  .gp-bar { flex-direction:column; align-items:stretch; }
  .gp-search { max-width:100%; }
  .btn-add { justify-content:center; }
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
      {type==="success" ? <CheckCircle2 size={16} color="#16a34a"/> : <AlertCircle size={16} color="var(--red)"/>}
      {msg}
    </div>
  );
}

/* ── Add Modal (nama, phone, spesialisasi + username, password, email) ── */
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
    else if (!/^[a-zA-Z0-9]{4,50}$/.test(f.username)) err.username = "Min 4 karakter, hanya huruf & angka.";
    if (!f.password)            err.password     = "Password wajib diisi.";
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
    <div className="mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="m" style={{ maxWidth:500 }}>
        <div className="m-hd">
          <span className="m-title">Tambah Guru Baru</span>
          <button className="m-cls" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="m-body">

          {/* ── Info Guru ── */}
          <div className="m-divider">Data Guru</div>

          <div className="fg">
            <label className="fl">Nama Guru</label>
            <input className={`fi ${e.nama_guru?"err":""}`} placeholder="Contoh: Ahmad Fauzi, S.Pd" value={f.nama_guru} onChange={upd("nama_guru")}/>
            {e.nama_guru && <span className="fe">{e.nama_guru}</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
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
          <div className="m-divider">Akun Login <span style={{ color:"var(--g)", fontSize:9, fontWeight:700, background:"rgba(15,118,110,0.1)", padding:"2px 7px", borderRadius:99, textTransform:"none", letterSpacing:0 }}>role: teacher</span></div>

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
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {e.password && <span className="fe">{e.password}</span>}
          </div>

          <div className="fg">
            <label className="fl">Email <span style={{ color:"var(--text3)", fontWeight:400, textTransform:"none" }}>(opsional)</span></label>
            <input className={`fi ${e.email?"err":""}`} type="email" placeholder="guru@sekolah.ac.id" value={f.email} onChange={upd("email")}/>
            {e.email && <span className="fe">{e.email}</span>}
          </div>

        </div>
        <div className="m-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={14}/> Tambah Guru</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Edit Modal (hanya data guru, tidak ubah akun) ── */
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
          <button className="m-cls" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="m-body">
          <div className="fg">
            <label className="fl">Nama Guru</label>
            <input className={`fi ${e.nama_guru?"err":""}`} placeholder="Contoh: Ahmad Fauzi, S.Pd" value={f.nama_guru} onChange={upd("nama_guru")}/>
            {e.nama_guru && <span className="fe">{e.nama_guru}</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
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

          {/* Info: akun tidak diubah di sini */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:11, background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.15)" }}>
            <CheckCircle2 size={14} color="var(--b)"/>
            <span style={{ fontSize:12, color:"var(--b)", fontWeight:600 }}>
              Username & password tidak berubah. Hubungi admin untuk reset akun.
            </span>
          </div>
        </div>
        <div className="m-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={14}/> Simpan Perubahan</>}
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
          <div className="del-ico"><Trash2 size={24}/></div>
          <div className="del-t">Hapus Guru?</div>
          <div className="del-d">Data <b>{teacher.nama_guru}</b> akan dihapus permanen dan tidak dapat dikembalikan.</div>
        </div>
        <div className="del-ft">
          <button className="btn-cncl" onClick={onClose}>Batal</button>
          <button className="btn-del" onClick={go} disabled={busy}>
            {busy ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Menghapus...</> : <><Trash2 size={14}/> Hapus</>}
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
      // tampilkan error validasi pertama
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
              <span className="chip-dot" style={{ background:"var(--g)" }}/>
              {meta.total} Guru Terdaftar
            </div>
            {specs.length > 0 && (
              <div className="gp-chip">
                <span className="chip-dot" style={{ background:"var(--b)" }}/>
                {specs.length} Spesialisasi
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="gp-bar">
          <div className="gp-search">
            <Search size={15} color="var(--text3)"/>
            <input
              placeholder="Cari nama, telepon, spesialisasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={()=>setSearch("")} style={{ color:"var(--text3)",display:"flex" }}><X size={13}/></button>}
          </div>

          <div className="gp-sel">
            <Filter size={14} color="var(--text3)"/>
            <select value={spec} onChange={e=>setSpec(e.target.value)}>
              <option value="">Semua Spesialisasi</option>
              {specs.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button className="btn-add" onClick={()=>{ setSel(null); setModal("add"); }}>
            <Plus size={15}/> Tambah Guru
          </button>
        </div>

        {/* Table */}
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
                    <td style={{ color:"var(--text3)", fontSize:12 }}>{(meta.page-1)*meta.per_page+i+1}</td>
                    <td>
                      <div className="g-cell">
                        <div className="g-av">{initials(t.nama_guru)}</div>
                        <div>
                          <div className="g-name">{t.nama_guru}</div>
                          {t.user_id && <div className="g-uid">UID: {t.user_id}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="spec"><BookOpen size={11}/>{t.spesialisasi}</span></td>
                    <td>
                      <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <Phone size={12} color="var(--text3)"/>{t.phone}
                      </span>
                    </td>
                    <td style={{ color:"var(--text3)", fontSize:12 }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID",{ day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </td>
                    <td>
                      <div className="acts">
                        <button className="act act-e" title="Edit" onClick={()=>{ setSel(t); setModal("edit"); }}><Pencil size={13}/></button>
                        <button className="act act-d" title="Hapus" onClick={()=>{ setSel(t); setModal("delete"); }}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="gp-spin">
                <Loader2 size={28} color="var(--g)" style={{ animation:"spin 1s linear infinite" }}/>
              </div>
            )}

            {!loading && data.length === 0 && (
              <div className="gp-empty">
                <GraduationCap size={40} color="var(--text3)"/>
                <div className="gp-empty-lbl">
                  {search||spec ? "Tidak ada guru yang sesuai pencarian." : "Belum ada guru terdaftar."}
                </div>
                {!search && !spec && (
                  <button className="btn-add" style={{ marginTop:4 }} onClick={()=>setModal("add")}>
                    <Plus size={14}/> Tambah Guru Pertama
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
                  <ChevronLeft size={14}/>
                </button>
                {pgs().map(p => (
                  <button key={p} className={`pb ${p===meta.page?"pb--on":""}`} onClick={()=>load(p)}>{p}</button>
                ))}
                <button className="pb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}>
                  <ChevronRight size={14}/>
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