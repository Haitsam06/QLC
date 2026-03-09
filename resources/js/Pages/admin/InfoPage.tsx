import { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2, BookOpen, Image, Plus, Pencil, Trash2, X,
  Loader2, CheckCircle2, AlertCircle, Search,
  ChevronLeft, ChevronRight, Upload, Link,
  Phone, Mail, MapPin, Globe, Instagram, Facebook,
  Youtube, Clock, Users, Filter, Eye,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Profile {
  id?: string;
  name: string;
  logo: string | null;
  tagline: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  address: string | null;
  whatsapp: string | null;
  email: string | null;
  social_media: Record<string, string> | null;
  updated_at?: string | null;
}
interface Program {
  id: string;
  name: string;
  description: string | null;
  target_audience: string | null;
  duration: string | null;
  image_url: string | null;
  created_at: string | null;
}
interface GalleryItem {
  id: string;
  title: string;
  media_url: string;
  type: "Photo" | "Video";
  uploaded_at: string | null;
}
interface Meta { total: number; page: number; per_page: number; last_page: number; }

const API = "/api/info";

/* ═══════════════════════════════════════════════════════════
   STYLES — prefix .ip (info page)
═══════════════════════════════════════════════════════════ */
const CSS = `
.ip { width:100%; display:flex; flex-direction:column; gap:20px; }

/* ── Page header ── */
.ip-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.ip-ttl { font-size:22px; font-weight:900; color:var(--text); line-height:1; }
.ip-sub { font-size:12px; color:var(--text3); margin-top:4px; }

/* ── Tabs ── */
.ip-tabs {
  display:flex; gap:6px;
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:16px; box-shadow:var(--glass-sh);
  padding:6px; width:fit-content;
}
.ip-tab {
  display:flex; align-items:center; gap:8px;
  padding:9px 18px; border-radius:11px;
  font-size:13px; font-weight:700; color:var(--text2);
  cursor:pointer; transition:all 0.2s; border:none; font-family:inherit;
  background:transparent;
}
.ip-tab:hover { background:rgba(255,255,255,0.6); color:var(--text); }
.ip-tab--on { background:#fff; color:var(--text); box-shadow:0 2px 12px rgba(0,0,0,0.08); }
.ip-tab-dot { width:7px; height:7px; border-radius:50%; }

/* ── Glass card ── */
.ip-card {
  background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid var(--glass-b); border-radius:20px; box-shadow:var(--glass-sh);
}
.ip-card-pad { padding:24px; }

/* ── Section titles ── */
.ip-sec-title {
  font-size:13px; font-weight:800; color:var(--text);
  text-transform:uppercase; letter-spacing:.8px;
  display:flex; align-items:center; gap:8px; margin-bottom:16px;
}
.ip-sec-title::after { content:""; flex:1; height:1.5px; background:rgba(0,0,0,0.06); }

/* ════════════════════
   PROFILE TAB
════════════════════ */
.prof-grid { display:grid; grid-template-columns:200px 1fr; gap:24px; }

.prof-logo-wrap {
  display:flex; flex-direction:column; align-items:center; gap:12px;
}
.prof-logo {
  width:160px; height:160px; border-radius:20px; object-fit:cover;
  border:2px solid rgba(15,118,110,0.15);
  box-shadow:0 4px 20px rgba(0,0,0,0.08);
}
.prof-logo-placeholder {
  width:160px; height:160px; border-radius:20px;
  background:rgba(15,118,110,0.06); border:2px dashed rgba(15,118,110,0.2);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:8px; color:var(--text3); font-size:12px; font-weight:600;
}
.prof-upload-btn {
  display:flex; align-items:center; gap:6px;
  padding:7px 14px; border-radius:9px; font-size:11.5px; font-weight:700;
  background:rgba(15,118,110,0.08); color:var(--g);
  border:1px solid rgba(15,118,110,0.2); cursor:pointer; transition:all 0.18s;
  font-family:inherit;
}
.prof-upload-btn:hover { background:rgba(15,118,110,0.15); }

.prof-contact { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.prof-contact-item {
  display:flex; align-items:flex-start; gap:10px;
  padding:12px 14px; border-radius:12px;
  background:rgba(255,255,255,0.5); border:1px solid rgba(0,0,0,0.05);
}
.prof-contact-ico {
  width:32px; height:32px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.prof-contact-lbl { font-size:10px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.5px; }
.prof-contact-val { font-size:13px; font-weight:600; color:var(--text); margin-top:2px; word-break:break-word; }

/* ── Save profile bar ── */
.prof-save-bar {
  display:flex; justify-content:flex-end; gap:8px;
  padding:16px 24px; border-top:1px solid rgba(0,0,0,0.05);
}

/* ════════════════════
   PROGRAMS TAB
════════════════════ */
.prog-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;
  padding:24px;
}
.prog-card {
  background:rgba(255,255,255,0.7); border-radius:16px;
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 2px 12px rgba(0,0,0,0.06);
  overflow:hidden; transition:all 0.2s;
}
.prog-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.1); transform:translateY(-2px); }
.prog-img {
  width:100%; height:160px; object-fit:cover; display:block;
}
.prog-img-placeholder {
  width:100%; height:160px;
  background:linear-gradient(135deg, rgba(15,118,110,0.08), rgba(37,99,235,0.06));
  display:flex; align-items:center; justify-content:center; color:var(--text3);
}
.prog-body { padding:16px; }
.prog-name { font-size:14.5px; font-weight:800; color:var(--text); }
.prog-desc {
  font-size:12px; color:var(--text3); margin-top:5px; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.prog-tags { display:flex; gap:6px; margin-top:10px; flex-wrap:wrap; }
.prog-tag {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 9px; border-radius:8px; font-size:11px; font-weight:600;
}
.prog-tag-audience { background:rgba(37,99,235,0.08); color:var(--b); }
.prog-tag-duration  { background:rgba(212,160,23,0.1); color:#92400e; }
.prog-card-foot {
  display:flex; gap:6px; padding:12px 16px;
  border-top:1px solid rgba(0,0,0,0.05);
}
.prog-act {
  flex:1; height:32px; border-radius:9px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:5px;
  font-size:12px; font-weight:700; font-family:inherit; transition:all 0.18s;
}
.prog-edit { background:rgba(37,99,235,0.08); color:var(--b); }
.prog-del  { background:rgba(220,38,38,0.08); color:var(--red); }
.prog-edit:hover { background:var(--b);   color:#fff; }
.prog-del:hover  { background:var(--red); color:#fff; }

/* ════════════════════
   GALLERY TAB
════════════════════ */
.gal-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px;
  padding:24px;
}
.gal-item {
  border-radius:14px; overflow:hidden;
  background:rgba(255,255,255,0.7);
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 2px 10px rgba(0,0,0,0.06);
  cursor:pointer; transition:all 0.2s; position:relative;
}
.gal-item:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
.gal-item:hover .gal-overlay { opacity:1; }
.gal-thumb { width:100%; height:140px; object-fit:cover; display:block; }
.gal-thumb-placeholder {
  width:100%; height:140px;
  background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(37,99,235,0.06));
  display:flex; align-items:center; justify-content:center;
}
.gal-overlay {
  position:absolute; inset:0; background:rgba(15,23,42,0.55);
  display:flex; align-items:center; justify-content:center; gap:8px;
  opacity:0; transition:opacity 0.2s;
}
.gal-ov-btn {
  width:34px; height:34px; border-radius:10px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:all 0.18s;
  font-family:inherit;
}
.gal-ov-edit { background:rgba(255,255,255,0.15); color:#fff; }
.gal-ov-del  { background:rgba(220,38,38,0.6);    color:#fff; }
.gal-ov-edit:hover { background:rgba(255,255,255,0.3); }
.gal-ov-del:hover  { background:var(--red); }
.gal-info { padding:10px 12px; }
.gal-title { font-size:12.5px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gal-meta  { font-size:10px; color:var(--text3); margin-top:2px; display:flex; align-items:center; gap:4px; }
.gal-type-badge {
  display:inline-flex; align-items:center; gap:3px;
  padding:2px 7px; border-radius:6px; font-size:9.5px; font-weight:700;
}
.gal-photo { background:rgba(15,118,110,0.1); color:var(--g); }
.gal-video { background:rgba(124,58,237,0.1); color:#7c3aed; }

/* ════════════════════
   TOOLBAR (shared)
════════════════════ */
.ip-toolbar {
  display:flex; gap:10px; flex-wrap:wrap; align-items:center;
  padding:16px 24px; border-bottom:1px solid rgba(0,0,0,0.05);
}
.ip-search {
  display:flex; align-items:center; gap:8px;
  flex:1; min-width:200px; max-width:320px; height:38px; padding:0 12px;
  background:rgba(255,255,255,0.6); border:1.5px solid rgba(0,0,0,0.08); border-radius:10px;
}
.ip-search input { flex:1; font-size:13px; color:var(--text); font-family:inherit; background:transparent; outline:none; border:none; }
.ip-search input::placeholder { color:var(--text3); }

.ip-sel {
  display:flex; align-items:center; gap:6px; height:38px; padding:0 12px;
  background:rgba(255,255,255,0.6); border:1.5px solid rgba(0,0,0,0.08); border-radius:10px;
  min-width:130px;
}
.ip-sel select { flex:1; font-size:13px; color:var(--text); background:transparent; border:none; outline:none; cursor:pointer; font-family:inherit; }

/* ── Buttons ── */
.ip-btn-add {
  display:flex; align-items:center; gap:6px; height:38px; padding:0 16px; border-radius:10px;
  font-size:13px; font-weight:700; color:#fff; cursor:pointer; border:none; font-family:inherit;
  transition:all 0.18s; white-space:nowrap;
}
.ip-btn-add:hover { transform:translateY(-1px); }
.ip-btn-save {
  display:flex; align-items:center; gap:6px; height:38px; padding:0 20px; border-radius:10px;
  font-size:13px; font-weight:700; color:#fff; cursor:pointer; border:none; font-family:inherit;
  background:var(--g); box-shadow:0 4px 14px rgba(15,118,110,0.28); transition:all 0.18s;
}
.ip-btn-save:hover:not(:disabled) { box-shadow:0 6px 20px rgba(15,118,110,0.38); transform:translateY(-1px); }
.ip-btn-save:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* ── Pagination (shared) ── */
.ip-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 24px; border-top:1px solid rgba(0,0,0,0.05); flex-wrap:wrap; gap:10px;
}
.ip-pag-info { font-size:12px; color:var(--text3); }
.ip-pag-btns { display:flex; gap:5px; }
.ipb {
  width:30px; height:30px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; cursor:pointer; font-family:inherit;
  background:rgba(255,255,255,0.6); border:1px solid rgba(0,0,0,0.08); color:var(--text2);
  transition:all 0.18s;
}
.ipb:hover:not(:disabled) { background:var(--g); color:#fff; border-color:var(--g); }
.ipb:disabled { opacity:.35; cursor:not-allowed; }
.ipb--on { background:var(--g); color:#fff; border-color:var(--g); }

/* ════════════════════
   MODALS
════════════════════ */
.imbk {
  position:fixed; inset:0; z-index:500; background:rgba(15,23,42,0.5);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:ifi .18s ease;
}
@keyframes ifi  { from{opacity:0} to{opacity:1} }
@keyframes isu  { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes ispin{ to{transform:rotate(360deg)} }

.im {
  width:100%; max-width:520px; max-height:88vh; overflow-y:auto;
  background:rgba(255,255,255,0.93); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.96); border-radius:22px;
  box-shadow:0 24px 80px rgba(0,0,0,0.14); animation:isu .22s cubic-bezier(.4,0,.2,1);
}
.im-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px 16px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.96); z-index:1; border-radius:22px 22px 0 0;
}
.im-title { font-size:17px; font-weight:800; color:var(--text); }
.im-cls {
  width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3); cursor:pointer; border:none; transition:all 0.18s;
}
.im-cls:hover { background:rgba(220,38,38,0.1); color:var(--red); }
.im-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.im-ft {
  display:flex; justify-content:flex-end; gap:8px; padding:14px 24px 20px;
  border-top:1px solid rgba(0,0,0,0.06); position:sticky; bottom:0;
  background:rgba(255,255,255,0.96); border-radius:0 0 22px 22px;
}

/* form elements */
.ifg { display:flex; flex-direction:column; gap:6px; }
.ifl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text3); }
.ifi {
  height:42px; padding:0 14px; background:rgba(255,255,255,0.7);
  border:1.5px solid rgba(0,0,0,0.1); border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%; outline:none;
}
.ifi:focus { border-color:var(--g); box-shadow:0 0 0 3px rgba(15,118,110,0.1); }
.ifi.ierr { border-color:var(--red); }
.ita {
  padding:11px 14px; background:rgba(255,255,255,0.7); border:1.5px solid rgba(0,0,0,0.1);
  border-radius:11px; font-size:13.5px; color:var(--text);
  font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s; width:100%; outline:none; resize:none;
}
.ita:focus { border-color:var(--g); box-shadow:0 0 0 3px rgba(15,118,110,0.1); }
.ife { font-size:11px; color:var(--red); font-weight:600; }

/* file upload area */
.i-upload {
  border:2px dashed rgba(15,118,110,0.25); border-radius:12px;
  padding:20px; text-align:center; cursor:pointer; transition:all 0.18s;
  background:rgba(15,118,110,0.03);
}
.i-upload:hover { border-color:var(--g); background:rgba(15,118,110,0.06); }
.i-upload-lbl { font-size:12.5px; color:var(--text3); margin-top:6px; font-weight:600; }
.i-upload-sub { font-size:11px; color:var(--text3); margin-top:3px; }
.i-preview {
  width:100%; max-height:180px; object-fit:cover; border-radius:10px;
  margin-top:10px; border:1.5px solid rgba(0,0,0,0.08);
}

/* im divider */
.im-div {
  display:flex; align-items:center; gap:10px;
  font-size:10.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:.8px; color:var(--text3); margin:2px 0;
}
.im-div::before, .im-div::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.07); }

/* type toggle */
.i-type-toggle { display:flex; gap:8px; }
.i-type-btn {
  flex:1; height:40px; border-radius:11px; border:1.5px solid rgba(0,0,0,0.1);
  font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;
  display:flex; align-items:center; justify-content:center; gap:7px;
  background:rgba(255,255,255,0.5); color:var(--text3); transition:all 0.18s;
}
.i-type-photo { background:rgba(15,118,110,0.1); color:var(--g); border-color:rgba(15,118,110,0.25); }
.i-type-video { background:rgba(124,58,237,0.1); color:#7c3aed; border-color:rgba(124,58,237,0.25); }

/* delete confirm */
.im-del { max-width:370px; }
.idel-bdy { padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; }
.idel-ico { width:56px; height:56px; border-radius:16px; background:rgba(220,38,38,0.1); color:var(--red); display:flex; align-items:center; justify-content:center; }
.idel-t { font-size:17px; font-weight:800; color:var(--text); }
.idel-d { font-size:13px; color:var(--text3); line-height:1.5; }
.idel-ft { display:flex; gap:8px; padding:0 24px 22px; }
.ibtn-cncl {
  flex:1; height:40px; border-radius:11px; font-size:13px; font-weight:700; color:var(--text2);
  background:rgba(0,0,0,0.05); cursor:pointer; border:none; font-family:inherit; transition:background 0.18s;
}
.ibtn-cncl:hover { background:rgba(0,0,0,0.09); }
.ibtn-del {
  flex:1; height:40px; border-radius:11px; font-size:13px; font-weight:700; color:#fff;
  background:var(--red); box-shadow:0 4px 14px rgba(220,38,38,0.3); cursor:pointer; border:none;
  display:flex; align-items:center; justify-content:center; gap:6px; font-family:inherit; transition:all 0.18s;
}
.ibtn-del:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,0.4); transform:translateY(-1px); }
.ibtn-del:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* toast */
.itoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:13px;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.9); box-shadow:0 8px 32px rgba(0,0,0,0.12);
  font-size:13px; font-weight:600; color:var(--text); animation:isu .22s ease; max-width:320px;
}
.itoast-ok  { border-left:4px solid #16a34a; }
.itoast-err { border-left:4px solid var(--red); }

/* blur */
.ip-blurred { filter:blur(4px) brightness(0.96); transition:filter 0.2s ease; pointer-events:none; user-select:none; }

/* empty */
.ip-empty {
  padding:60px 24px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.ip-empty-lbl { font-size:14px; color:var(--text3); font-weight:600; }

@media (max-width:768px) {
  .prof-grid { grid-template-columns:1fr; }
  .prof-contact { grid-template-columns:1fr; }
  .ip-tabs { flex-wrap:wrap; }
  .prog-grid { grid-template-columns:1fr; }
  .gal-grid  { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:480px) {
  .gal-grid { grid-template-columns:1fr; }
}
`;

/* ── Helpers ── */
function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`itoast ${type==="success"?"itoast-ok":"itoast-err"}`}>
      {type==="success" ? <CheckCircle2 size={16} color="#16a34a"/> : <AlertCircle size={16} color="var(--red)"/>}
      {msg}
    </div>
  );
}

/* ─── Shared form elements ─── */
const Fg = ({ label, error, children }: { label:string; error?:string; children:React.ReactNode }) => (
  <div className="ifg">
    <label className="ifl">{label}</label>
    {children}
    {error && <span className="ife">{error}</span>}
  </div>
);

/* ─── File upload preview ─── */
function FileUpload({ accept, preview, onFile, label }: {
  accept: string; preview: string|null; onFile:(f:File)=>void; label:string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="i-upload" onClick={() => ref.current?.click()}>
        <Upload size={22} color="var(--g)"/>
        <div className="i-upload-lbl">{label}</div>
        <div className="i-upload-sub">Klik untuk pilih file</div>
        <input ref={ref} type="file" accept={accept} style={{ display:"none" }}
          onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}/>
      </div>
      {preview && <img src={preview} className="i-preview" alt="preview"/>}
    </div>
  );
}

/* ─── Delete confirm modal ─── */
function DeleteModal({ label, onClose, onConfirm }: {
  label:string; onClose:()=>void; onConfirm:()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return (
    <div className="imbk" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="im im-del">
        <div className="idel-bdy">
          <div className="idel-ico"><Trash2 size={24}/></div>
          <div className="idel-t">Hapus Item?</div>
          <div className="idel-d">Data <b>{label}</b> akan dihapus permanen beserta filenya.</div>
        </div>
        <div className="idel-ft">
          <button className="ibtn-cncl" onClick={onClose}>Batal</button>
          <button className="ibtn-del" onClick={go} disabled={busy}>
            {busy ? <><Loader2 size={14} style={{ animation:"ispin 1s linear infinite" }}/> Menghapus...</> : <><Trash2 size={14}/> Hapus</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — PROFILE
═══════════════════════════════════════════════════════════ */
function ProfileTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [prof, setProf] = useState<Profile>({ name:"", logo:null, tagline:null, history:null, vision:null, mission:null, address:null, whatsapp:null, email:null, social_media:null });
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [logoPreview, setLogoPreview] = useState<string|null>(null);
  const [busy, setBusy]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors]   = useState<Partial<Record<string,string>>>({});

  useEffect(() => {
    fetch(`${API}/profile`).then(r => r.json()).then(j => {
      if (j.success && j.data) setProf(j.data);
    }).finally(() => setLoading(false));
  }, []);

  const upd = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setProf(p => ({ ...p, [k]: e.target.value }));

  const updSocial = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProf(p => ({ ...p, social_media: { ...(p.social_media ?? {}), [k]: e.target.value } }));

  const validate = () => {
    const err: Record<string,string> = {};
    if (!prof.name.trim()) err.name = "Nama sekolah wajib diisi.";
    setErrors(err);
    return !Object.keys(err).length;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(prof).forEach(([k, v]) => {
        if (k === "logo" || k === "id" || k === "updated_at") return;
        if (k === "social_media") fd.append(k, JSON.stringify(v ?? {}));
        else fd.append(k, v ?? "");
      });
      if (logoFile) fd.append("logo", logoFile);

      const j = await (await fetch(`${API}/profile`, { method:"POST", body:fd })).json();
      if (j.success) { setProf(j.data); onToast("Profil berhasil disimpan.", "success"); }
      else onToast(j.message ?? "Gagal menyimpan.", "error");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="ip-empty"><Loader2 size={28} color="var(--g)" style={{ animation:"ispin 1s linear infinite" }}/></div>;

  return (
    <div>
      <div className="ip-card-pad">

        {/* ── Logo + Identitas ── */}
        <div className="ip-sec-title"><Building2 size={14}/> Identitas Sekolah</div>
        <div className="prof-grid">
          {/* Logo */}
          <div className="prof-logo-wrap">
            {(logoPreview || prof.logo)
              ? <img src={logoPreview ?? prof.logo!} className="prof-logo" alt="logo"/>
              : <div className="prof-logo-placeholder"><Building2 size={32}/><span>Belum ada logo</span></div>}
            <label className="prof-upload-btn" style={{ cursor:"pointer" }}>
              <Upload size={13}/> Ganti Logo
              <input type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                }}/>
            </label>
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Fg label="Nama Sekolah" error={errors.name}>
              <input className={`ifi ${errors.name?"ierr":""}`} placeholder="Nama resmi sekolah" value={prof.name} onChange={upd("name")}/>
            </Fg>
            <Fg label="Tagline">
              <input className="ifi" placeholder="Slogan atau motto sekolah" value={prof.tagline ?? ""} onChange={upd("tagline")}/>
            </Fg>
          </div>
        </div>

        {/* ── Konten ── */}
        <div className="ip-sec-title" style={{ marginTop:24 }}><BookOpen size={14}/> Konten Profil</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Fg label="Sejarah">
            <textarea className="ita" rows={4} placeholder="Ceritakan sejarah berdirinya sekolah..." value={prof.history ?? ""} onChange={upd("history")}/>
          </Fg>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Fg label="Visi">
              <textarea className="ita" rows={3} placeholder="Visi sekolah..." value={prof.vision ?? ""} onChange={upd("vision")}/>
            </Fg>
            <Fg label="Misi">
              <textarea className="ita" rows={3} placeholder="Misi sekolah..." value={prof.mission ?? ""} onChange={upd("mission")}/>
            </Fg>
          </div>
        </div>

        {/* ── Kontak ── */}
        <div className="ip-sec-title" style={{ marginTop:24 }}><Phone size={14}/> Kontak & Media Sosial</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Fg label="Alamat">
            <textarea className="ita" rows={2} placeholder="Alamat lengkap sekolah" value={prof.address ?? ""} onChange={upd("address")}/>
          </Fg>
          <Fg label="Alamat Email">
            <input className="ifi" type="email" placeholder="info@sekolah.ac.id" value={prof.email ?? ""} onChange={upd("email")}/>
          </Fg>
          <Fg label="WhatsApp">
            <input className="ifi" placeholder="628123456789" value={prof.whatsapp ?? ""} onChange={upd("whatsapp")}/>
          </Fg>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:14 }}>
          {[
            { k:"instagram", icon:<Instagram size={13}/>, ph:"@username" },
            { k:"facebook",  icon:<Facebook  size={13}/>, ph:"facebook.com/page" },
            { k:"youtube",   icon:<Youtube   size={13}/>, ph:"youtube.com/@channel" },
          ].map(({ k, icon, ph }) => (
            <Fg key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }}>{icon}</div>
                <input className="ifi" style={{ paddingLeft:34 }} placeholder={ph}
                  value={prof.social_media?.[k] ?? ""} onChange={updSocial(k)}/>
              </div>
            </Fg>
          ))}
        </div>

        {/* Contact preview */}
        {(prof.address || prof.email || prof.whatsapp) && (
          <>
            <div className="ip-sec-title" style={{ marginTop:24 }}><Eye size={14}/> Preview Kontak</div>
            <div className="prof-contact">
              {prof.address   && <div className="prof-contact-item"><div className="prof-contact-ico" style={{ background:"rgba(15,118,110,0.1)", color:"var(--g)" }}><MapPin size={15}/></div><div><div className="prof-contact-lbl">Alamat</div><div className="prof-contact-val">{prof.address}</div></div></div>}
              {prof.email     && <div className="prof-contact-item"><div className="prof-contact-ico" style={{ background:"rgba(37,99,235,0.1)", color:"var(--b)" }}><Mail size={15}/></div><div><div className="prof-contact-lbl">Email</div><div className="prof-contact-val">{prof.email}</div></div></div>}
              {prof.whatsapp  && <div className="prof-contact-item"><div className="prof-contact-ico" style={{ background:"rgba(20,184,166,0.1)", color:"#0d9488" }}><Phone size={15}/></div><div><div className="prof-contact-lbl">WhatsApp</div><div className="prof-contact-val">{prof.whatsapp}</div></div></div>}
            </div>
          </>
        )}
      </div>

      <div className="prof-save-bar">
        <button className="ip-btn-save" onClick={save} disabled={busy}>
          {busy ? <><Loader2 size={14} style={{ animation:"ispin 1s linear infinite" }}/> Menyimpan...</> : <><CheckCircle2 size={14}/> Simpan Profil</>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — PROGRAMS
═══════════════════════════════════════════════════════════ */
function ProgramsTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [data,    setData]    = useState<Program[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0,page:1,per_page:10,last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,     setSel]     = useState<Program|null>(null);
  const dSearch = useDebounce(search);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"9", search:dSearch });
      const j = await (await fetch(`${API}/programs?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } finally { setLoading(false); }
  }, [dSearch]);

  useEffect(() => { load(1); }, [load]);

  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1,page-2), e = Math.min(last_page,page+2);
    return Array.from({ length:e-s+1 },(_,i)=>s+i);
  };

  return (
    <div>
      <div className="ip-toolbar">
        <div className="ip-search">
          <Search size={14} color="var(--text3)"/>
          <input placeholder="Cari program..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{ color:"var(--text3)",display:"flex",background:"none",border:"none",cursor:"pointer" }}><X size={12}/></button>}
        </div>
        <div style={{ flex:1 }}/>
        <button className="ip-btn-add" style={{ background:"var(--g)", boxShadow:"0 4px 14px rgba(15,118,110,0.28)" }}
          onClick={() => { setSel(null); setModal("add"); }}>
          <Plus size={14}/> Tambah Program
        </button>
      </div>

      {loading
        ? <div className="ip-empty"><Loader2 size={28} color="var(--g)" style={{ animation:"ispin 1s linear infinite" }}/></div>
        : data.length === 0
          ? <div className="ip-empty"><BookOpen size={40} color="var(--text3)"/><div className="ip-empty-lbl">{search ? "Tidak ada program yang sesuai." : "Belum ada program."}</div></div>
          : <div className="prog-grid">
              {data.map(p => (
                <div key={p.id} className="prog-card">
                  {p.image_url
                    ? <img src={p.image_url} className="prog-img" alt={p.name}/>
                    : <div className="prog-img-placeholder"><BookOpen size={36} color="var(--text3)"/></div>}
                  <div className="prog-body">
                    <div className="prog-name">{p.name}</div>
                    {p.description && <div className="prog-desc">{p.description}</div>}
                    <div className="prog-tags">
                      {p.target_audience && <span className="prog-tag prog-tag-audience"><Users size={10}/>{p.target_audience}</span>}
                      {p.duration        && <span className="prog-tag prog-tag-duration"><Clock size={10}/>{p.duration}</span>}
                    </div>
                  </div>
                  <div className="prog-card-foot">
                    <button className="prog-act prog-edit" onClick={() => { setSel(p); setModal("edit"); }}><Pencil size={12}/> Edit</button>
                    <button className="prog-act prog-del"  onClick={() => { setSel(p); setModal("delete"); }}><Trash2 size={12}/> Hapus</button>
                  </div>
                </div>
              ))}
            </div>}

      {!loading && meta.total > 0 && (
        <div className="ip-pag">
          <span className="ip-pag-info">{(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page,meta.total)} dari {meta.total} program</span>
          <div className="ip-pag-btns">
            <button className="ipb" disabled={meta.page===1} onClick={()=>load(meta.page-1)}><ChevronLeft size={13}/></button>
            {pgs().map(p=><button key={p} className={`ipb ${p===meta.page?"ipb--on":""}`} onClick={()=>load(p)}>{p}</button>)}
            <button className="ipb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}><ChevronRight size={13}/></button>
          </div>
        </div>
      )}

      {(modal==="add"||modal==="edit") && (
        <ProgramModal mode={modal} init={sel} onClose={()=>setModal(null)}
          onSave={async (fd)=>{
            const url = modal==="edit" ? `${API}/programs/${sel!.id}` : `${API}/programs`;
            const j = await (await fetch(url,{method:"POST",body:fd})).json();
            if (j.success) { onToast(modal==="add"?"Program ditambahkan.":"Program diperbarui.","success"); setModal(null); load(meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
      {modal==="delete" && sel && (
        <DeleteModal label={sel.name} onClose={()=>setModal(null)}
          onConfirm={async()=>{
            const j = await (await fetch(`${API}/programs/${sel.id}`,{method:"DELETE"})).json();
            if (j.success) { onToast("Program dihapus.","success"); setModal(null); load(data.length===1&&meta.page>1?meta.page-1:meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
    </div>
  );
}

function ProgramModal({ mode, init, onClose, onSave }: {
  mode:"add"|"edit"; init:Program|null; onClose:()=>void; onSave:(fd:FormData)=>Promise<void>;
}) {
  const [name, setName]       = useState(init?.name ?? "");
  const [desc, setDesc]       = useState(init?.description ?? "");
  const [target, setTarget]   = useState(init?.target_audience ?? "");
  const [dur, setDur]         = useState(init?.duration ?? "");
  const [imgFile, setImgFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(init?.image_url ?? null);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("Nama program wajib diisi."); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", desc);
    fd.append("target_audience", target);
    fd.append("duration", dur);
    if (imgFile) fd.append("image", imgFile);
    if (mode==="edit") fd.append("_method","PUT");
    try { await onSave(fd); } finally { setBusy(false); }
  };

  return (
    <div className="imbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="im">
        <div className="im-hd">
          <span className="im-title">{mode==="add"?"Tambah Program":"Edit Program"}</span>
          <button className="im-cls" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="im-body">
          <Fg label="Nama Program" error={err||undefined}>
            <input className={`ifi ${err?"ierr":""}`} placeholder="Nama program" value={name} onChange={e=>{setName(e.target.value);setErr("");}}/>
          </Fg>
          <Fg label="Deskripsi">
            <textarea className="ita" rows={3} placeholder="Deskripsi singkat program..." value={desc} onChange={e=>setDesc(e.target.value)}/>
          </Fg>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Fg label="Target Peserta">
              <input className="ifi" placeholder="Contoh: Usia 5-7 tahun" value={target} onChange={e=>setTarget(e.target.value)}/>
            </Fg>
            <Fg label="Durasi">
              <input className="ifi" placeholder="Contoh: 6 bulan" value={dur} onChange={e=>setDur(e.target.value)}/>
            </Fg>
          </div>
          <Fg label="Gambar Program">
            <FileUpload accept="image/*" preview={preview} label="Upload gambar program (JPG, PNG, max 3MB)"
              onFile={f=>{setImgFile(f);setPreview(URL.createObjectURL(f));}}/>
          </Fg>
        </div>
        <div className="im-ft">
          <button className="ibtn-cncl" onClick={onClose}>Batal</button>
          <button className="ip-btn-save" onClick={submit} disabled={busy}>
            {busy?<><Loader2 size={14} style={{animation:"ispin 1s linear infinite"}}/> Menyimpan...</>:<><CheckCircle2 size={14}/> {mode==="add"?"Tambah":"Simpan"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3 — GALLERY
═══════════════════════════════════════════════════════════ */
function GalleryTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [data,    setData]    = useState<GalleryItem[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0,page:1,per_page:12,last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("");
  const [modal,   setModal]   = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,     setSel]     = useState<GalleryItem|null>(null);
  const dSearch = useDebounce(search);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"12", search:dSearch, type:filter });
      const j = await (await fetch(`${API}/gallery?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } finally { setLoading(false); }
  }, [dSearch, filter]);

  useEffect(() => { load(1); }, [load]);

  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1,page-2), e = Math.min(last_page,page+2);
    return Array.from({ length:e-s+1 },(_,i)=>s+i);
  };

  return (
    <div>
      <div className="ip-toolbar">
        <div className="ip-search">
          <Search size={14} color="var(--text3)"/>
          <input placeholder="Cari judul..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{ color:"var(--text3)",display:"flex",background:"none",border:"none",cursor:"pointer" }}><X size={12}/></button>}
        </div>
        <div className="ip-sel">
          <Filter size={13} color="var(--text3)"/>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">Semua Tipe</option>
            <option value="Photo">Foto</option>
            <option value="Video">Video</option>
          </select>
        </div>
        <div style={{ flex:1 }}/>
        <button className="ip-btn-add" style={{ background:"#7c3aed", boxShadow:"0 4px 14px rgba(124,58,237,0.28)" }}
          onClick={() => { setSel(null); setModal("add"); }}>
          <Plus size={14}/> Tambah Media
        </button>
      </div>

      {loading
        ? <div className="ip-empty"><Loader2 size={28} color="#7c3aed" style={{ animation:"ispin 1s linear infinite" }}/></div>
        : data.length === 0
          ? <div className="ip-empty"><Image size={40} color="var(--text3)"/><div className="ip-empty-lbl">{search||filter?"Tidak ada media yang sesuai.":"Belum ada media di galeri."}</div></div>
          : <div className="gal-grid">
              {data.map(item => (
                <div key={item.id} className="gal-item">
                  {item.type==="Photo"
                    ? <img src={item.media_url} className="gal-thumb" alt={item.title}/>
                    : <div className="gal-thumb-placeholder"><Youtube size={36} color="#7c3aed"/></div>}
                  <div className="gal-overlay">
                    <button className="gal-ov-btn gal-ov-edit" onClick={()=>{setSel(item);setModal("edit");}}><Pencil size={14}/></button>
                    <button className="gal-ov-btn gal-ov-del"  onClick={()=>{setSel(item);setModal("delete");}}><Trash2 size={14}/></button>
                  </div>
                  <div className="gal-info">
                    <div className="gal-title">{item.title}</div>
                    <div className="gal-meta">
                      <span className={`gal-type-badge ${item.type==="Photo"?"gal-photo":"gal-video"}`}>{item.type}</span>
                      {item.uploaded_at && <span>{new Date(item.uploaded_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>}

      {!loading && meta.total > 0 && (
        <div className="ip-pag">
          <span className="ip-pag-info">{(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page,meta.total)} dari {meta.total} media</span>
          <div className="ip-pag-btns">
            <button className="ipb" disabled={meta.page===1} onClick={()=>load(meta.page-1)}><ChevronLeft size={13}/></button>
            {pgs().map(p=><button key={p} className={`ipb ${p===meta.page?"ipb--on":""}`} onClick={()=>load(p)}>{p}</button>)}
            <button className="ipb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}><ChevronRight size={13}/></button>
          </div>
        </div>
      )}

      {(modal==="add"||modal==="edit") && (
        <GalleryModal mode={modal} init={sel} onClose={()=>setModal(null)}
          onSave={async(fd)=>{
            const url = modal==="edit" ? `${API}/gallery/${sel!.id}` : `${API}/gallery`;
            const j = await (await fetch(url,{method:"POST",body:fd})).json();
            if (j.success) { onToast(modal==="add"?"Media ditambahkan.":"Media diperbarui.","success"); setModal(null); load(meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
      {modal==="delete" && sel && (
        <DeleteModal label={sel.title} onClose={()=>setModal(null)}
          onConfirm={async()=>{
            const j = await (await fetch(`${API}/gallery/${sel.id}`,{method:"DELETE"})).json();
            if (j.success) { onToast("Media dihapus.","success"); setModal(null); load(data.length===1&&meta.page>1?meta.page-1:meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
    </div>
  );
}

function GalleryModal({ mode, init, onClose, onSave }: {
  mode:"add"|"edit"; init:GalleryItem|null; onClose:()=>void; onSave:(fd:FormData)=>Promise<void>;
}) {
  const [title, setTitle]     = useState(init?.title ?? "");
  const [type,  setType]      = useState<"Photo"|"Video">(init?.type ?? "Photo");
  const [file,  setFile]      = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(init?.type==="Photo"?init.media_url:null);
  const [videoUrl, setVideoUrl] = useState(init?.type==="Video"?init.media_url:"");
  const [busy,  setBusy]      = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!title.trim()) e.title = "Judul wajib diisi.";
    if (type==="Video" && !videoUrl.trim()) e.media = "URL video wajib diisi.";
    if (type==="Photo" && !file && !preview) e.media = "File foto wajib diupload.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("type", type);
    if (type==="Photo" && file) fd.append("media", file);
    if (type==="Video") fd.append("media_url", videoUrl);
    if (mode==="edit") fd.append("_method","PUT");
    try { await onSave(fd); } finally { setBusy(false); }
  };

  return (
    <div className="imbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="im">
        <div className="im-hd">
          <span className="im-title">{mode==="add"?"Tambah Media":"Edit Media"}</span>
          <button className="im-cls" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="im-body">
          <Fg label="Judul" error={errors.title}>
            <input className={`ifi ${errors.title?"ierr":""}`} placeholder="Judul foto atau video" value={title} onChange={e=>{setTitle(e.target.value);setErrors(p=>({...p,title:""}));}}/>
          </Fg>

          <div className="ifg">
            <label className="ifl">Tipe Media</label>
            <div className="i-type-toggle">
              <button type="button" className={`i-type-btn ${type==="Photo"?"i-type-photo":""}`} onClick={()=>setType("Photo")}>
                <Image size={14}/> Foto
              </button>
              <button type="button" className={`i-type-btn ${type==="Video"?"i-type-video":""}`} onClick={()=>setType("Video")}>
                <Youtube size={14}/> Video
              </button>
            </div>
          </div>

          {type==="Photo"
            ? <Fg label="File Foto" error={errors.media}>
                <FileUpload accept="image/*" preview={preview} label="Upload foto (JPG, PNG, max 5MB)"
                  onFile={f=>{setFile(f);setPreview(URL.createObjectURL(f));setErrors(p=>({...p,media:""}));}}/>
              </Fg>
            : <Fg label="URL Video (YouTube / embed)" error={errors.media}>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text3)" }}><Link size={14}/></div>
                  <input className={`ifi ${errors.media?"ierr":""}`} style={{ paddingLeft:36 }} placeholder="https://youtube.com/embed/..." value={videoUrl}
                    onChange={e=>{setVideoUrl(e.target.value);setErrors(p=>({...p,media:""}));}}/>
                </div>
              </Fg>}
        </div>
        <div className="im-ft">
          <button className="ibtn-cncl" onClick={onClose}>Batal</button>
          <button className="ip-btn-save" style={{ background:"#7c3aed", boxShadow:"0 4px 14px rgba(124,58,237,0.24)" }} onClick={submit} disabled={busy}>
            {busy?<><Loader2 size={14} style={{animation:"ispin 1s linear infinite"}}/> Menyimpan...</>:<><CheckCircle2 size={14}/> {mode==="add"?"Tambah":"Simpan"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
type TabId = "profile" | "programs" | "gallery";

const TABS: { id:TabId; label:string; icon:React.ReactNode; color:string }[] = [
  { id:"profile",  label:"Profil Sekolah", icon:<Building2 size={15}/>, color:"#0f766e" },
  { id:"programs", label:"Program",        icon:<BookOpen  size={15}/>, color:"#2563eb" },
  { id:"gallery",  label:"Galeri",         icon:<Image     size={15}/>, color:"#7c3aed" },
];

export default function InfoPage() {
  const [tab,   setTab]   = useState<TabId>("profile");
  const [modal, setModal] = useState(false); // for blur detection
  const [toast, setToast] = useState<{ msg:string; type:"success"|"error" }|null>(null);

  const showToast = (msg:string, type:"success"|"error") => setToast({ msg, type });

  return (
    <>
      <style>{CSS}</style>
      <div className="ip">

        {/* Header */}
        <div className="ip-hd">
          <div>
            <div className="ip-ttl">Informasi Sekolah</div>
            <div className="ip-sub">Kelola profil, program, dan galeri untuk ditampilkan di landing page</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ip-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`ip-tab ${tab===t.id?"ip-tab--on":""}`} onClick={()=>setTab(t.id)}>
              <span className="ip-tab-dot" style={{ background: tab===t.id ? t.color : "var(--text3)" }}/>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="ip-card">
          {tab === "profile"  && <ProfileTab  onToast={showToast}/>}
          {tab === "programs" && <ProgramsTab onToast={showToast}/>}
          {tab === "gallery"  && <GalleryTab  onToast={showToast}/>}
        </div>

      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}