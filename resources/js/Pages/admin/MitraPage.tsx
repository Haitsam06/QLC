import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Handshake, Plus, Pencil, Trash2, X,
  Loader2, CheckCircle2, Search, ChevronLeft, ChevronRight,
  Phone, Building2, FileText, Filter, ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Status = "Active" | "Inactive";

interface Mitra {
  id:               string;
  user_id?:         string | null;
  institution_name: string;
  contact_person:   string;
  phone:            string;
  mou_file_url:     string | null;
  status:           Status;
  created_at?:      string | null;
}

interface Meta { total: number; page: number; per_page: number; last_page: number; }

const BASE = "http://127.0.0.1:8000/api";

/* ═══════════════════════════════════════════════════════════
   STYLES — prefix .mp (mitra page)
═══════════════════════════════════════════════════════════ */
const CSS = `
/* ── Page ── */
.mp { width:100%; display:flex; flex-direction:column; gap:20px; }

.mp-hd    { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.mp-title { font-size:22px; font-weight:900; color:var(--text); line-height:1; }
.mp-sub   { font-size:12px; color:var(--text3); margin-top:4px; }

.mp-chips { display:flex; gap:10px; flex-wrap:wrap; }
.mp-chip {
  display:flex; align-items:center; gap:7px;
  padding:7px 14px; border-radius:11px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); box-shadow:var(--glass-sh);
  font-size:12.5px; font-weight:700; color:var(--text);
}
.mp-chip-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Toolbar ── */
.mp-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

.mp-search {
  display:flex; align-items:center; gap:8px;
  flex:1; min-width:200px; max-width:340px;
  height:40px; padding:0 13px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.mp-search input { flex:1; font-size:13px; color:var(--text); font-family:inherit; background:transparent; outline:none; border:none; }
.mp-search input::placeholder { color:var(--text3); }

.mp-sel {
  display:flex; align-items:center; gap:7px;
  height:40px; padding:0 13px; min-width:160px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:11px; box-shadow:var(--glass-sh);
}
.mp-sel select {
  flex:1; font-size:13px; color:var(--text); font-family:inherit;
  background:transparent; cursor:pointer; outline:none; border:none;
}

.mp-btn-add {
  display:flex; align-items:center; gap:6px;
  height:40px; padding:0 18px; border-radius:11px;
  background:#7c3aed; color:#fff;
  font-size:13px; font-weight:700; font-family:inherit;
  box-shadow:0 4px 16px rgba(124,58,237,0.32);
  transition:all 0.18s; white-space:nowrap; border:none; cursor:pointer;
}
.mp-btn-add:hover { box-shadow:0 6px 22px rgba(124,58,237,0.42); transform:translateY(-1px); }

/* ── Liquid Glass Card ── */
.mp-card {
  position:relative;
  background:rgba(255,255,255,0.62);
  backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px);
  border-radius:24px;
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:
    0 8px 32px rgba(124,58,237,0.08),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 1.5px 0 rgba(255,255,255,1),
    inset 0 -1px 0 rgba(255,255,255,0.4);
  overflow:hidden;
}
.mp-card::before {
  content:""; position:absolute; top:0; left:0; right:0; height:56px;
  background:linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%);
  pointer-events:none; border-radius:24px 24px 0 0; z-index:0;
}

.mp-tbl-wrap { overflow-x:auto; position:relative; z-index:1; }

table.mp-tbl { width:100%; border-collapse:collapse; }
table.mp-tbl thead tr {
  background:linear-gradient(90deg, rgba(124,58,237,0.10) 0%, rgba(37,99,235,0.06) 100%);
  border-bottom:1.5px solid rgba(124,58,237,0.14);
}
table.mp-tbl th {
  padding:13px 20px; text-align:left;
  font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.9px;
  color:#7c3aed; white-space:nowrap;
}
table.mp-tbl td {
  padding:14px 20px; font-size:13px; color:var(--text2);
  border-bottom:1px solid rgba(255,255,255,0.7);
}
table.mp-tbl tbody tr { transition:background 0.18s; }
table.mp-tbl tbody tr:hover {
  background:rgba(255,255,255,0.72);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);
}
table.mp-tbl tbody tr:last-child td { border-bottom:none; }

/* avatar */
.m-cell { display:flex; align-items:center; gap:12px; }
.m-av {
  width:38px; height:38px; border-radius:11px; flex-shrink:0;
  background:#7c3aed;
  display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:13px; color:#fff;
  box-shadow:0 3px 12px rgba(124,58,237,0.4);
  letter-spacing:0.5px;
}
.m-name { font-size:13.5px; font-weight:700; color:var(--text); }
.m-uid  { font-size:10.5px; color:var(--text3); margin-top:1px; }

/* status badge */
.m-status {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px;
  font-size:11.5px; font-weight:700; white-space:nowrap;
}
.m-status--active   { background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.18); color:#16a34a; }
.m-status--inactive { background:rgba(100,116,139,0.08); border:1px solid rgba(100,116,139,0.18); color:#64748b; }
.m-status-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.m-status--active   .m-status-dot { background:#16a34a; }
.m-status--inactive .m-status-dot { background:#64748b; }

/* MOU link */
.m-mou {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px;
  background:rgba(124,58,237,0.07); border:1px solid rgba(124,58,237,0.15);
  font-size:11.5px; font-weight:600; color:#7c3aed;
  text-decoration:none; white-space:nowrap; transition:all 0.18s;
}
.m-mou:hover { background:rgba(124,58,237,0.14); }

.mp-acts { display:flex; gap:6px; justify-content:flex-end; }
.mp-act {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.18s; font-family:inherit; cursor:pointer; border:none;
}
.mp-act-e { background:rgba(37,99,235,0.08);  color:var(--b);   border:1px solid rgba(37,99,235,0.15); }
.mp-act-d { background:rgba(220,38,38,0.08);  color:var(--red); border:1px solid rgba(220,38,38,0.15); }
.mp-act-e:hover { background:var(--b);   color:#fff; border-color:var(--b);   }
.mp-act-d:hover { background:var(--red); color:#fff; border-color:var(--red); }

.mp-empty {
  padding:60px 20px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.mp-empty-lbl { font-size:14px; color:var(--text3); font-weight:600; }
.mp-spin { padding:60px 20px; display:flex; justify-content:center; }

/* ── Pagination ── */
.mp-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-top:1px solid rgba(0,0,0,0.05);
  flex-wrap:wrap; gap:10px; position:relative; z-index:1;
}
.mp-pag-info { font-size:12px; color:var(--text3); }
.mp-pag-btns { display:flex; gap:5px; }
.mpb {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700;
  background:rgba(124,58,237,0.08); border:1.5px solid rgba(124,58,237,0.15);
  color:#7c3aed; transition:all 0.18s; cursor:pointer; font-family:inherit;
}
.mpb:hover:not(:disabled) { background:rgba(124,58,237,0.16); border-color:rgba(124,58,237,0.3); }
.mpb:disabled { opacity:.35; cursor:not-allowed; }
.mpb--on {
  background:#7c3aed; color:#fff; border-color:#7c3aed;
  box-shadow:0 3px 10px rgba(124,58,237,0.35); font-weight:800;
}

/* ══════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════ */
.mp-mbk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.45); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:mp-fi .18s ease; overflow-y:auto;
}
@keyframes mp-fi   { from{opacity:0} to{opacity:1} }
@keyframes mp-su   { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes mp-spin { to{transform:rotate(360deg)} }

.mp-m {
  width:100%; max-width:460px;
  max-height:90vh; overflow-y:auto;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.96); border-radius:22px;
  box-shadow:0 24px 80px rgba(124,58,237,0.14),0 4px 16px rgba(0,0,0,0.08);
  animation:mp-su .22s cubic-bezier(.4,0,.2,1);
}

.mp-m-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 22px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.96);
  border-radius:22px 22px 0 0; z-index:1;
}
.mp-m-title { font-size:17px; font-weight:800; color:var(--text); }
.mp-m-cls {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3);
  cursor:pointer; border:none; transition:all 0.18s; font-family:inherit;
}
.mp-m-cls:hover { background:rgba(220,38,38,0.1); color:var(--red); }

.mp-m-body { padding:20px 22px; display:flex; flex-direction:column; gap:14px; }

.mp-m-ft {
  display:flex; justify-content:flex-end; gap:8px;
  padding:14px 22px 20px; border-top:1px solid rgba(0,0,0,0.06);
  position:sticky; bottom:0; background:rgba(255,255,255,0.96);
  border-radius:0 0 22px 22px;
}

/* form */
.mp-fg  { display:flex; flex-direction:column; gap:6px; }
.mp-fl  { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:var(--text3); }
.mp-fi  {
  height:42px; padding:0 13px;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s;
  width:100%; outline:none;
}
.mp-fi:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
.mp-fi.err   { border-color:var(--red); }
.mp-fe { font-size:11px; color:var(--red); font-weight:600; }

/* status segment */
.mp-seg { display:flex; gap:8px; }
.mp-seg-btn {
  flex:1; height:40px; border-radius:11px;
  font-size:13px; font-weight:700; font-family:inherit;
  display:flex; align-items:center; justify-content:center; gap:6px;
  border:1.5px solid rgba(0,0,0,0.1);
  background:rgba(255,255,255,0.5); color:var(--text3);
  cursor:pointer; transition:all 0.18s;
}
.mp-seg-active.mp-seg-on   { background:#16a34a; color:#fff; border-color:#16a34a; box-shadow:0 2px 8px rgba(22,163,74,0.3); }
.mp-seg-inactive.mp-seg-on { background:#64748b; color:#fff; border-color:#64748b; box-shadow:0 2px 8px rgba(100,116,139,0.3); }

/* cancel / save buttons */
.mp-btn-cncl {
  height:38px; padding:0 16px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:var(--text2);
  background:rgba(0,0,0,0.05); border:none; font-family:inherit;
  cursor:pointer; transition:background 0.18s;
}
.mp-btn-cncl:hover { background:rgba(0,0,0,0.09); }
.mp-btn-save {
  height:38px; padding:0 20px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:#fff;
  background:#7c3aed; border:none; font-family:inherit;
  display:flex; align-items:center; gap:6px; cursor:pointer;
  box-shadow:0 4px 14px rgba(124,58,237,0.3); transition:all 0.18s;
}
.mp-btn-save:hover:not(:disabled) { box-shadow:0 6px 20px rgba(124,58,237,0.42); transform:translateY(-1px); }
.mp-btn-save:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* delete modal */
.mp-m-del { max-width:380px; }
.mp-del-bdy {
  padding:28px 24px 18px;
  display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center;
}
.mp-del-ico {
  width:52px; height:52px; border-radius:15px;
  background:rgba(220,38,38,0.1);
  display:flex; align-items:center; justify-content:center; color:var(--red);
}
.mp-del-t { font-size:16px; font-weight:800; color:var(--text); }
.mp-del-d { font-size:12.5px; color:var(--text3); line-height:1.5; }
.mp-del-ft { display:flex; justify-content:center; gap:8px; padding:0 24px 22px; }
.mp-btn-del {
  height:38px; padding:0 20px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:#fff;
  background:var(--red); border:none; font-family:inherit;
  display:flex; align-items:center; gap:6px; cursor:pointer;
  box-shadow:0 4px 14px rgba(220,38,38,0.3); transition:all 0.18s;
}
.mp-btn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.42); }
.mp-btn-del:disabled { opacity:.5; cursor:not-allowed; }

/* toast */
.mp-toast {
  position:fixed; bottom:24px; right:24px; z-index:900;
  padding:11px 18px; border-radius:13px; font-size:13px; font-weight:700;
  color:#fff; backdrop-filter:blur(12px);
  display:flex; align-items:center; gap:8px;
  box-shadow:0 8px 24px rgba(0,0,0,0.18); animation:mp-fi .2s ease;
}
.mp-toast--ok  { background:rgba(124,58,237,0.92); }
.mp-toast--err { background:rgba(220,38,38,0.92);  }
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()??"").join("");
}
function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(()=>{ const t=setTimeout(()=>setV(val),ms); return()=>clearTimeout(t); },[val,ms]);
  return v;
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type }: { msg:string; type:"ok"|"err" }) {
  return createPortal(
    <div className={`mp-toast mp-toast--${type}`}>
      {type==="ok" ? <CheckCircle2 size={15}/> : <X size={15}/>}
      {msg}
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   FORM STATE
═══════════════════════════════════════════════════════════ */
interface FormState {
  institution_name: string;
  contact_person:   string;
  phone:            string;
  mou_file_url:     string;
  status:           Status;
}
const emptyForm = (): FormState => ({
  institution_name:"", contact_person:"", phone:"", mou_file_url:"", status:"Active",
});

/* ═══════════════════════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════════════════════ */
function MitraModal({ init, onClose, onSave }: {
  init: FormState & { id?: string };
  onClose: () => void;
  onSave: (f: FormState) => Promise<void>;
}) {
  const [f, setF]   = useState<FormState>(init);
  const [e, setE]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(init.id);

  const upd = (k: keyof FormState) =>
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setF(p => ({ ...p, [k]: ev.target.value }));
      setE(p => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const err: typeof e = {};
    if (!f.institution_name.trim()) err.institution_name = "Nama institusi wajib diisi.";
    if (!f.contact_person.trim())   err.contact_person   = "Nama kontak wajib diisi.";
    if (!f.phone.trim())            err.phone            = "Nomor telepon wajib diisi.";
    if (f.mou_file_url && !/^https?:\/\/.+/.test(f.mou_file_url))
                                    err.mou_file_url     = "URL tidak valid (harus diawali http/https).";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="mp-mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="mp-m">
        <div className="mp-m-hd">
          <span className="mp-m-title">{isEdit ? "Edit Mitra" : "Tambah Mitra"}</span>
          <button className="mp-m-cls" onClick={onClose}><X size={15}/></button>
        </div>

        <div className="mp-m-body">
          {/* Nama Institusi */}
          <div className="mp-fg">
            <label className="mp-fl">Nama Institusi</label>
            <input className={`mp-fi${e.institution_name?" err":""}`}
              placeholder="Contoh: Yayasan Pendidikan Nusantara"
              value={f.institution_name} onChange={upd("institution_name")}/>
            {e.institution_name && <span className="mp-fe">{e.institution_name}</span>}
          </div>

          {/* Contact Person */}
          <div className="mp-fg">
            <label className="mp-fl">Nama Kontak (PIC)</label>
            <input className={`mp-fi${e.contact_person?" err":""}`}
              placeholder="Nama lengkap penanggung jawab"
              value={f.contact_person} onChange={upd("contact_person")}/>
            {e.contact_person && <span className="mp-fe">{e.contact_person}</span>}
          </div>

          {/* Phone */}
          <div className="mp-fg">
            <label className="mp-fl">Nomor Telepon</label>
            <div style={{ position:"relative" }}>
              <Phone size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", pointerEvents:"none" }}/>
              <input className={`mp-fi${e.phone?" err":""}`} style={{ paddingLeft:36 }}
                placeholder="628123456789"
                value={f.phone} onChange={upd("phone")}/>
            </div>
            {e.phone && <span className="mp-fe">{e.phone}</span>}
          </div>

          {/* MOU File URL */}
          <div className="mp-fg">
            <label className="mp-fl">URL File MOU <span style={{ fontWeight:400, textTransform:"none", color:"var(--text3)" }}>(opsional)</span></label>
            <div style={{ position:"relative" }}>
              <FileText size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", pointerEvents:"none" }}/>
              <input className={`mp-fi${e.mou_file_url?" err":""}`} style={{ paddingLeft:36 }}
                placeholder="https://drive.google.com/..."
                value={f.mou_file_url} onChange={upd("mou_file_url")}/>
            </div>
            {e.mou_file_url && <span className="mp-fe">{e.mou_file_url}</span>}
          </div>

          {/* Status */}
          <div className="mp-fg">
            <label className="mp-fl">Status</label>
            <div className="mp-seg">
              {(["Active","Inactive"] as Status[]).map(s => (
                <button key={s}
                  className={`mp-seg-btn mp-seg-${s.toLowerCase()}${f.status===s?" mp-seg-on":""}`}
                  onClick={() => setF(p => ({ ...p, status:s }))}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:"currentColor",opacity:.8,display:"inline-block" }}/>
                  {s === "Active" ? "Aktif" : "Tidak Aktif"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mp-m-ft">
          <button className="mp-btn-cncl" onClick={onClose}>Batal</button>
          <button className="mp-btn-save" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"mp-spin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={14}/> {isEdit ? "Simpan Perubahan" : "Tambah Mitra"}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════════════════════ */
function DeleteModal({ mitra, onClose, onConfirm }: {
  mitra: Mitra; onClose: ()=>void; onConfirm: ()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };

  return createPortal(
    <div className="mp-mbk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="mp-m mp-m-del">
        <div className="mp-del-bdy">
          <div className="mp-del-ico"><Trash2 size={24}/></div>
          <div className="mp-del-t">Hapus Mitra?</div>
          <div className="mp-del-d">
            Data <b>{mitra.institution_name}</b> akan dihapus permanen dan tidak dapat dikembalikan.
          </div>
        </div>
        <div className="mp-del-ft">
          <button className="mp-btn-cncl" onClick={onClose}>Batal</button>
          <button className="mp-btn-del" onClick={go} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"mp-spin 1s linear infinite" }}/> Menghapus...</>
              : <><Trash2 size={14}/> Hapus</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function MitraPage() {
  const [data,    setData]    = useState<Mitra[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0, page:1, per_page:10, last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("");

  const [addModal,  setAddModal]  = useState(false);
  const [editModal, setEditModal] = useState<Mitra | null>(null);
  const [delModal,  setDelModal]  = useState<Mitra | null>(null);
  const [toast,     setToast]     = useState<{ msg:string; type:"ok"|"err" } | null>(null);

  const dSearch = useDebounce(search);

  const showToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"10", search:dSearch, status:statusF });
      const res  = await fetch(`${BASE}/partners?${p}`);
      const data = await res.json();
      if (data.success) { setData(data.data); setMeta(data.meta); }
    } catch { showToast("Gagal memuat data.", "err"); }
    finally  { setLoading(false); }
  }, [dSearch, statusF]);

  useEffect(() => { load(1); }, [load]);

  /* stat counts */
  const totalActive   = data.filter(d => d.status === "Active").length;
  const totalInactive = data.filter(d => d.status === "Inactive").length;

  /* pagination pages */
  const pages = () => {
    const { page, last_page } = meta;
    const s = Math.max(1, page-2), e = Math.min(last_page, page+2);
    return Array.from({ length: e-s+1 }, (_,i) => s+i);
  };

  /* CRUD handlers */
  const handleAdd = async (f: FormState) => {
    const res  = await fetch(`${BASE}/partners`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) });
    const data = await res.json();
    if (data.success) { showToast("Mitra berhasil ditambahkan."); setAddModal(false); load(1); }
    else showToast(data.message ?? "Gagal menyimpan.", "err");
  };

  const handleEdit = async (f: FormState) => {
    const res  = await fetch(`${BASE}/partners/${editModal!.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) });
    const data = await res.json();
    if (data.success) { showToast("Data mitra diperbarui."); setEditModal(null); load(meta.page); }
    else showToast(data.message ?? "Gagal memperbarui.", "err");
  };

  const handleDelete = async () => {
    const res  = await fetch(`${BASE}/partners/${delModal!.id}`, { method:"DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Mitra berhasil dihapus.");
      setDelModal(null);
      const prevPage = data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page;
      load(prevPage);
    } else showToast(json.message ?? "Gagal menghapus.", "err");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="mp">

        {/* ── Header ── */}
        <div className="mp-hd">
          <div>
            <div className="mp-title">Mitra</div>
            <div className="mp-sub">Kelola data institusi mitra dan dokumen MOU</div>
          </div>
        </div>

        {/* ── Chips ── */}
        <div className="mp-chips">
          {[
            { label:"Total Mitra",      value:meta.total,    color:"#7c3aed" },
            { label:"Mitra Aktif",      value:totalActive,   color:"#16a34a" },
            { label:"Tidak Aktif",      value:totalInactive, color:"#64748b" },
          ].map(c => (
            <div key={c.label} className="mp-chip">
              <span className="mp-chip-dot" style={{ background:c.color }}/>
              <span style={{ color:c.color, fontWeight:800 }}>{c.value}</span>
              <span style={{ color:"var(--text3)", fontWeight:600 }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="mp-bar">
          <div className="mp-search">
            <Search size={14} color="var(--text3)"/>
            <input placeholder="Cari institusi atau kontak..."
              value={search} onChange={e => setSearch(e.target.value)}/>
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", display:"flex" }}>
                <X size={12}/>
              </button>
            )}
          </div>

          <div className="mp-sel">
            <Filter size={13} color="var(--text3)"/>
            <select value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Tidak Aktif</option>
            </select>
          </div>

          <div style={{ flex:1 }}/>

          <button className="mp-btn-add" onClick={() => setAddModal(true)}>
            <Plus size={14}/> Tambah Mitra
          </button>
        </div>

        {/* ── Table ── */}
        <div className="mp-card">
          <div className="mp-tbl-wrap">
            {loading ? (
              <div className="mp-spin">
                <Loader2 size={28} color="#7c3aed" style={{ animation:"mp-spin 1s linear infinite" }}/>
              </div>
            ) : data.length === 0 ? (
              <div className="mp-empty">
                <Handshake size={44} color="var(--text3)"/>
                <div className="mp-empty-lbl">
                  {search || statusF ? "Tidak ada mitra yang sesuai filter." : "Belum ada data mitra."}
                </div>
              </div>
            ) : (
              <table className="mp-tbl">
                <thead>
                  <tr>
                    <th>Institusi</th>
                    <th>Kontak (PIC)</th>
                    <th>Telepon</th>
                    <th>Dokumen MOU</th>
                    <th>Status</th>
                    <th style={{ textAlign:"right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(m => (
                    <tr key={m.id}>
                      {/* Institusi */}
                      <td>
                        <div className="m-cell">
                          <div className="m-av">{initials(m.institution_name)}</div>
                          <div>
                            <div className="m-name">{m.institution_name}</div>
                            <div className="m-uid">ID: {m.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Building2 size={13} color="var(--text3)"/>
                          <span style={{ fontSize:13, color:"var(--text)" }}>{m.contact_person}</span>
                        </div>
                      </td>

                      {/* Telepon */}
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Phone size={13} color="var(--text3)"/>
                          <span>{m.phone}</span>
                        </div>
                      </td>

                      {/* MOU */}
                      <td>
                        {m.mou_file_url ? (
                          <a href={m.mou_file_url} target="_blank" rel="noreferrer" className="m-mou">
                            <FileText size={11}/> Lihat MOU <ExternalLink size={10}/>
                          </a>
                        ) : (
                          <span style={{ fontSize:12, color:"var(--text3)" }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`m-status m-status--${m.status.toLowerCase()}`}>
                          <span className="m-status-dot"/>
                          {m.status === "Active" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td>
                        <div className="mp-acts">
                          <button className="mp-act mp-act-e"
                            onClick={() => setEditModal(m)}
                            title="Edit">
                            <Pencil size={13}/>
                          </button>
                          <button className="mp-act mp-act-d"
                            onClick={() => setDelModal(m)}
                            title="Hapus">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && meta.total > 0 && (
            <div className="mp-pag">
              <span className="mp-pag-info">
                {(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page, meta.total)} dari {meta.total} mitra
              </span>
              <div className="mp-pag-btns">
                <button className="mpb" disabled={meta.page===1} onClick={() => load(meta.page-1)}>
                  <ChevronLeft size={13}/>
                </button>
                {pages().map(p => (
                  <button key={p} className={`mpb${p===meta.page?" mpb--on":""}`} onClick={() => load(p)}>{p}</button>
                ))}
                <button className="mpb" disabled={meta.page===meta.last_page} onClick={() => load(meta.page+1)}>
                  <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addModal && (
        <MitraModal
          init={{ ...emptyForm() }}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}/>
      )}
      {editModal && (
        <MitraModal
          init={{
            id:               editModal.id,
            institution_name: editModal.institution_name,
            contact_person:   editModal.contact_person,
            phone:            editModal.phone,
            mou_file_url:     editModal.mou_file_url ?? "",
            status:           editModal.status,
          }}
          onClose={() => setEditModal(null)}
          onSave={handleEdit}/>
      )}
      {delModal && (
        <DeleteModal
          mitra={delModal}
          onClose={() => setDelModal(null)}
          onConfirm={handleDelete}/>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
}