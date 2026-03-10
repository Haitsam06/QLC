import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft, ChevronRight, X, Pencil, Trash2,
  Loader2, CheckCircle2, MapPin, Link, Eye, Calendar,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Visibility = "umum" | "mitra" | "keduanya";

interface Agenda {
  id:                string;
  user_id?:          string | null;
  title:             string;
  event_date:        string;   // YYYY-MM-DD
  description:       string;
  location:          string;
  registration_link: string;
  visibility:        Visibility;
  created_at?:       string;
}

const BASE = "http://127.0.0.1:8000/api";

const VIS_LABEL: Record<Visibility, string> = {
  umum:     "Umum",
  mitra:    "Mitra",
  keduanya: "Umum & Mitra",
};

const VIS_COLOR: Record<Visibility, { bg: string; text: string; border: string }> = {
  umum:     { bg:"rgba(15,118,110,0.10)",  text:"#0f766e", border:"rgba(15,118,110,0.2)"  },
  mitra:    { bg:"rgba(124,58,237,0.10)",  text:"#7c3aed", border:"rgba(124,58,237,0.2)"  },
  keduanya: { bg:"rgba(220,38,38,0.08)",   text:"#dc2626", border:"rgba(220,38,38,0.15)"  },
};

const DAYS   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function pad(n: number) { return String(n).padStart(2,"0"); }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function formatDisplay(s: string) {
  const [y,m,d] = s.split("-");
  return `${d} ${MONTHS[parseInt(m)-1]} ${y}`;
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate(); }
function getFirstDOW(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
.ap { display:flex; flex-direction:column; gap:20px; }
.ap-hd { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:12px; }
.ap-title { font-size:21px; font-weight:800; color:var(--text); line-height:1; }
.ap-sub   { font-size:11px; color:var(--text3); margin-top:4px; }

/* ── Liquid glass card ── */
.ap-card {
  position:relative;
  background:rgba(255,255,255,0.62);
  backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px);
  border-radius:24px;
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:0 8px 32px rgba(15,118,110,0.10),0 2px 8px rgba(0,0,0,0.06),inset 0 1.5px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(255,255,255,0.4);
  overflow:hidden;
}
.ap-card::before {
  content:""; position:absolute; top:0; left:0; right:0; height:64px;
  background:linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 100%);
  pointer-events:none; border-radius:24px 24px 0 0; z-index:0;
}

/* ── Nav bar ── */
.ap-nav {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 24px 14px; position:relative; z-index:1;
  border-bottom:1.5px solid rgba(15,118,110,0.10);
  background:linear-gradient(90deg,rgba(15,118,110,0.06) 0%,rgba(37,99,235,0.04) 100%);
}
.ap-month { font-size:17px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px; }
.ap-year  {
  font-size:13px; font-weight:600; color:var(--text3);
  background:rgba(15,118,110,0.08); padding:2px 10px;
  border-radius:99px; border:1px solid rgba(15,118,110,0.12);
}
.ap-nav-btn {
  width:36px; height:36px; border-radius:11px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(255,255,255,0.9);
  color:var(--text); cursor:pointer; transition:all 0.18s; font-family:inherit;
}
.ap-nav-btn:hover { background:#0f766e; color:#fff; border-color:#0f766e; }
.ap-today-btn {
  padding:0 14px; height:34px; border-radius:10px; font-size:12px; font-weight:700;
  background:rgba(15,118,110,0.08); border:1.5px solid rgba(15,118,110,0.15);
  color:#0f766e; cursor:pointer; transition:all 0.18s; font-family:inherit;
}
.ap-today-btn:hover { background:#0f766e; color:#fff; border-color:#0f766e; }

/* ── Day labels ── */
.ap-days { display:grid; grid-template-columns:repeat(7,1fr); border-bottom:1px solid rgba(15,118,110,0.08); position:relative; z-index:1; }
.ap-dlbl { padding:10px 0; text-align:center; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; color:#0f766e; }
.ap-dlbl:first-child { color:#dc2626; }
.ap-dlbl:last-child  { color:#2563eb; }

/* ── Grid cells ── */
.ap-grid { display:grid; grid-template-columns:repeat(7,1fr); position:relative; z-index:1; }
.ap-cell {
  min-height:110px; padding:8px 8px 6px;
  border-right:1px solid rgba(255,255,255,0.6);
  border-bottom:1px solid rgba(255,255,255,0.6);
  cursor:pointer; transition:background 0.18s; position:relative; overflow:hidden;
}
.ap-cell:nth-child(7n) { border-right:none; }
.ap-cell:hover { background:rgba(15,118,110,0.04); }
.ap-cell--other .ap-cell-num { color:var(--text3); }
.ap-cell--other  { background:rgba(0,0,0,0.012); }
.ap-cell--today  { background:rgba(15,118,110,0.05); }
.ap-cell--sun .ap-cell-num { color:#dc2626; }
.ap-cell--sat .ap-cell-num { color:#2563eb; }

.ap-cell-num {
  font-size:12.5px; font-weight:800; color:var(--text);
  width:26px; height:26px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:4px;
}
.ap-cell--today .ap-cell-num { background:#0f766e; color:#fff; box-shadow:0 2px 8px rgba(15,118,110,0.35); }

/* pills */
.ap-pill {
  display:flex; align-items:center; gap:4px;
  padding:2px 7px; border-radius:6px; margin-bottom:2px;
  font-size:10.5px; font-weight:700; line-height:1.3;
  cursor:pointer; transition:all 0.15s;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;
}
.ap-pill:hover { filter:brightness(0.92); }
.ap-more { font-size:10px; font-weight:700; color:var(--text3); padding:1px 6px; background:rgba(0,0,0,0.04); border-radius:5px; margin-top:1px; display:inline-block; }

/* legend */
.ap-legend {
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  padding:14px 24px; border-top:1px solid rgba(0,0,0,0.05); position:relative; z-index:1;
}
.ap-leg { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text3); }
.ap-leg-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }

/* ── Layout ── */
.ap-wrap { display:grid; grid-template-columns:1fr 300px; gap:16px; align-items:start; }

/* ── Side panel ── */
.ap-side {
  position:relative;
  background:rgba(255,255,255,0.62);
  backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px);
  border-radius:24px;
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:0 8px 32px rgba(15,118,110,0.10),0 2px 8px rgba(0,0,0,0.06),inset 0 1.5px 0 rgba(255,255,255,1);
  overflow:hidden;
}
.ap-side-hd {
  padding:16px 20px 12px;
  border-bottom:1.5px solid rgba(15,118,110,0.10);
  background:linear-gradient(90deg,rgba(15,118,110,0.06) 0%,rgba(37,99,235,0.04) 100%);
}
.ap-side-title { font-size:13px; font-weight:800; color:var(--text); }
.ap-side-sub   { font-size:10.5px; color:var(--text3); margin-top:2px; }
.ap-side-list  { padding:12px; display:flex; flex-direction:column; gap:8px; max-height:520px; overflow-y:auto; }
.ap-side-empty { padding:40px 20px; text-align:center; color:var(--text3); font-size:12px; font-weight:600; }
.ap-side-add {
  margin:0 12px 12px; padding:9px; border-radius:12px; width:calc(100% - 24px);
  font-size:12px; font-weight:700; color:#0f766e;
  background:rgba(15,118,110,0.06); border:1.5px dashed rgba(15,118,110,0.25);
  cursor:pointer; transition:all 0.18s; font-family:inherit;
  display:flex; align-items:center; justify-content:center; gap:6px;
}
.ap-side-add:hover { background:rgba(15,118,110,0.12); border-style:solid; }

/* agenda item card */
.ap-item {
  padding:10px 12px; border-radius:13px;
  background:rgba(255,255,255,0.7); border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 2px 8px rgba(0,0,0,0.04);
  transition:all 0.18s;
}
.ap-item:hover { background:#fff; box-shadow:0 4px 14px rgba(15,118,110,0.10); transform:translateY(-1px); }
.ap-item-title { font-size:12.5px; font-weight:700; color:var(--text); margin-bottom:6px; }
.ap-item-row   { display:flex; align-items:center; gap:4px; font-size:10.5px; color:var(--text3); font-weight:600; margin-bottom:3px; }
.ap-item-acts  { display:flex; gap:4px; margin-top:8px; }
.ap-item-act   { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; font-family:inherit; }
.ap-item-act-e { background:rgba(37,99,235,0.08); color:#2563eb; border:1px solid rgba(37,99,235,0.15); }
.ap-item-act-d { background:rgba(220,38,38,0.08); color:#dc2626; border:1px solid rgba(220,38,38,0.15); }
.ap-item-act-e:hover { background:#2563eb; color:#fff; border-color:#2563eb; }
.ap-item-act-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; }

/* ── Modal ── */
.ambk {
  position:fixed; inset:0; z-index:700;
  background:rgba(15,23,42,0.45); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:afi .18s ease; overflow-y:auto;
}
@keyframes afi  { from{opacity:0} to{opacity:1} }
@keyframes asu  { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes aspin{ to{transform:rotate(360deg)} }

.am {
  width:100%; max-width:500px; max-height:90vh; overflow-y:auto;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
  border:1.5px solid rgba(255,255,255,0.95); border-radius:22px;
  box-shadow:0 24px 80px rgba(15,118,110,0.16),0 4px 16px rgba(0,0,0,0.08);
  animation:asu .22s cubic-bezier(.4,0,.2,1);
}
.am-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 22px 14px; border-bottom:1px solid rgba(0,0,0,0.06);
  position:sticky; top:0; background:rgba(255,255,255,0.96);
  border-radius:22px 22px 0 0; z-index:1;
}
.am-title      { font-size:16px; font-weight:800; color:var(--text); }
.am-date-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:8px; background:rgba(15,118,110,0.08); color:#0f766e; border:1px solid rgba(15,118,110,0.15); }
.am-cls {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:var(--text3);
  transition:all 0.18s; cursor:pointer; font-family:inherit; border:none;
}
.am-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; }

.am-body { padding:18px 22px; display:flex; flex-direction:column; gap:14px; }

.afg { display:flex; flex-direction:column; gap:5px; }
.afl { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:var(--text3); }
.afi {
  height:42px; padding:0 13px; border-radius:11px; font-size:13px;
  background:rgba(15,118,110,0.04); border:1.5px solid rgba(15,118,110,0.12);
  color:var(--text); font-family:inherit; transition:all 0.18s; width:100%;
}
.afi:focus { border-color:#0f766e; box-shadow:0 0 0 3px rgba(15,118,110,0.10); outline:none; }
.afi.err   { border-color:#dc2626; background:rgba(220,38,38,0.04); }
.afe { font-size:11px; color:#dc2626; font-weight:600; }
.atx {
  padding:10px 13px; border-radius:11px; font-size:13px; min-height:80px; resize:vertical;
  background:rgba(15,118,110,0.04); border:1.5px solid rgba(15,118,110,0.12);
  color:var(--text); font-family:inherit; transition:all 0.18s; width:100%;
}
.atx:focus { border-color:#0f766e; box-shadow:0 0 0 3px rgba(15,118,110,0.10); outline:none; }

/* visibility segment */
.a-seg { display:flex; gap:6px; flex-wrap:wrap; }
.a-seg-btn {
  padding:6px 12px; border-radius:9px; font-size:11.5px; font-weight:700;
  border:1.5px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.7);
  color:var(--text3); cursor:pointer; transition:all 0.18s; font-family:inherit;
}
.a-seg-btn:hover { border-color:rgba(15,118,110,0.25); color:#0f766e; }
.a-seg-btn--umum.a-seg-btn--on     { background:#0f766e; color:#fff; border-color:#0f766e; box-shadow:0 2px 8px rgba(15,118,110,0.3); }
.a-seg-btn--mitra.a-seg-btn--on    { background:#7c3aed; color:#fff; border-color:#7c3aed; box-shadow:0 2px 8px rgba(124,58,237,0.3); }
.a-seg-btn--keduanya.a-seg-btn--on { background:#dc2626; color:#fff; border-color:#dc2626; box-shadow:0 2px 8px rgba(220,38,38,0.25); }

.am-ft {
  display:flex; justify-content:flex-end; gap:8px;
  padding:12px 22px 18px; border-top:1px solid rgba(0,0,0,0.06);
  position:sticky; bottom:0; background:rgba(255,255,255,0.96);
  border-radius:0 0 22px 22px;
}
.abtn-cncl {
  padding:0 16px; height:38px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:var(--text3);
  background:rgba(0,0,0,0.05); font-family:inherit; cursor:pointer; border:none; transition:all 0.18s;
}
.abtn-cncl:hover { background:rgba(0,0,0,0.09); color:var(--text); }
.abtn-sv {
  padding:0 18px; height:38px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:#fff; background:#0f766e;
  font-family:inherit; cursor:pointer; border:none;
  display:flex; align-items:center; gap:6px;
  box-shadow:0 3px 10px rgba(15,118,110,0.3); transition:all 0.18s;
}
.abtn-sv:hover:not(:disabled) { background:#0d6560; }
.abtn-sv:disabled { opacity:.5; cursor:not-allowed; }

/* delete modal */
.am-del { max-width:380px; }
.a-del-bdy { padding:28px 24px 18px; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; }
.a-del-ico { width:52px; height:52px; border-radius:15px; background:rgba(220,38,38,0.1); display:flex; align-items:center; justify-content:center; color:#dc2626; }
.a-del-t   { font-size:16px; font-weight:800; color:var(--text); }
.a-del-d   { font-size:12.5px; color:var(--text3); line-height:1.5; }
.a-del-ft  { display:flex; justify-content:center; gap:8px; padding:0 24px 22px; }
.abtn-del  {
  padding:0 18px; height:38px; border-radius:10px;
  font-size:12.5px; font-weight:700; color:#fff; background:#dc2626;
  font-family:inherit; cursor:pointer; border:none;
  display:flex; align-items:center; gap:6px;
  box-shadow:0 3px 10px rgba(220,38,38,0.3); transition:all 0.18s;
}
.abtn-del:hover:not(:disabled) { background:#b91c1c; }
.abtn-del:disabled { opacity:.5; cursor:not-allowed; }

/* toast */
.a-toast {
  position:fixed; bottom:24px; right:24px; z-index:900;
  padding:11px 18px; border-radius:13px; font-size:13px; font-weight:700;
  color:#fff; backdrop-filter:blur(12px);
  display:flex; align-items:center; gap:8px;
  box-shadow:0 8px 24px rgba(0,0,0,0.18); animation:afi .2s ease;
}
.a-toast--ok  { background:rgba(15,118,110,0.92); }
.a-toast--err { background:rgba(220,38,38,0.92); }

@media(max-width:900px) { .ap-wrap { grid-template-columns:1fr; } }
@media(max-width:600px) { .ap-cell { min-height:72px; padding:5px 4px 4px; } .ap-pill { font-size:9px; } }
`;

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type }: { msg: string; type: "ok"|"err" }) {
  return createPortal(
    <div className={`a-toast a-toast--${type}`}>
      {type==="ok" ? <CheckCircle2 size={15}/> : <X size={15}/>}{msg}
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   FORM STATE
═══════════════════════════════════════════════════════════ */
interface FormState {
  title:             string;
  event_date:        string;
  description:       string;
  location:          string;
  registration_link: string;
  visibility:        Visibility;
}

const emptyForm = (date = ""): FormState => ({
  title:"", event_date:date, description:"", location:"", registration_link:"", visibility:"umum",
});

/* ═══════════════════════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════════════════════ */
function AgendaModal({ init, onClose, onSave }: {
  init: FormState & { id?: string };
  onClose: () => void;
  onSave: (f: FormState) => Promise<void>;
}) {
  const [f, setF]   = useState<FormState>(init);
  const [e, setE]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(init.id);

  const upd = (k: keyof FormState) =>
    (ev: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
      setF(p => ({ ...p, [k]: ev.target.value }));
      setE(p => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const err: typeof e = {};
    if (!f.title.trim())   err.title      = "Judul wajib diisi.";
    if (!f.event_date)     err.event_date = "Tanggal wajib diisi.";
    if (f.registration_link && !/^https?:\/\/.+/.test(f.registration_link))
                           err.registration_link = "URL tidak valid (harus diawali http/https).";
    setE(err);
    return !Object.keys(err).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try { await onSave(f); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="ambk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="am">
        <div className="am-hd">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="am-title">{isEdit ? "Edit Agenda" : "Tambah Agenda"}</span>
            {f.event_date && <span className="am-date-badge">{formatDisplay(f.event_date)}</span>}
          </div>
          <button className="am-cls" onClick={onClose}><X size={15}/></button>
        </div>

        <div className="am-body">
          {/* Judul */}
          <div className="afg">
            <label className="afl">Judul Agenda</label>
            <input className={`afi${e.title?" err":""}`}
              placeholder="Contoh: Workshop Manajemen Sekolah"
              value={f.title} onChange={upd("title")}/>
            {e.title && <span className="afe">{e.title}</span>}
          </div>

          {/* Tanggal */}
          <div className="afg">
            <label className="afl">Tanggal</label>
            <input className={`afi${e.event_date?" err":""}`} type="date"
              value={f.event_date} onChange={upd("event_date")}/>
            {e.event_date && <span className="afe">{e.event_date}</span>}
          </div>

          {/* Lokasi */}
          <div className="afg">
            <label className="afl">Lokasi <span style={{ fontWeight:400, textTransform:"none", color:"var(--text3)" }}>(opsional)</span></label>
            <input className="afi" placeholder="Contoh: Aula Gedung A / Zoom Meeting"
              value={f.location} onChange={upd("location")}/>
          </div>

          {/* Deskripsi */}
          <div className="afg">
            <label className="afl">Deskripsi <span style={{ fontWeight:400, textTransform:"none", color:"var(--text3)" }}>(opsional)</span></label>
            <textarea className="atx" rows={3}
              placeholder="Keterangan tambahan agenda..."
              value={f.description} onChange={upd("description")}/>
          </div>

          {/* Link Pendaftaran */}
          <div className="afg">
            <label className="afl">Link Pendaftaran <span style={{ fontWeight:400, textTransform:"none", color:"var(--text3)" }}>(opsional)</span></label>
            <input className={`afi${e.registration_link?" err":""}`}
              placeholder="https://forms.gle/..."
              value={f.registration_link} onChange={upd("registration_link")}/>
            {e.registration_link && <span className="afe">{e.registration_link}</span>}
          </div>

          {/* Visibility */}
          <div className="afg">
            <label className="afl">Tampilkan Untuk</label>
            <div className="a-seg">
              {(["umum","mitra","keduanya"] as Visibility[]).map(v => (
                <button key={v}
                  className={`a-seg-btn a-seg-btn--${v}${f.visibility===v?" a-seg-btn--on":""}`}
                  onClick={() => setF(p => ({ ...p, visibility:v }))}>
                  {VIS_LABEL[v]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="am-ft">
          <button className="abtn-cncl" onClick={onClose}>Batal</button>
          <button className="abtn-sv" onClick={submit} disabled={busy}>
            {busy
              ? <><Loader2 size={14} style={{ animation:"aspin 1s linear infinite" }}/> Menyimpan...</>
              : <><CheckCircle2 size={14}/> {isEdit ? "Simpan Perubahan" : "Tambah Agenda"}</>}
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
function DeleteModal({ agenda, onClose, onConfirm }: {
  agenda: Agenda; onClose: ()=>void; onConfirm: ()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };

  return createPortal(
    <div className="ambk" onClick={ev => ev.target===ev.currentTarget && onClose()}>
      <div className="am am-del">
        <div className="a-del-bdy">
          <div className="a-del-ico"><Trash2 size={24}/></div>
          <div className="a-del-t">Hapus Agenda?</div>
          <div className="a-del-d"><b>"{agenda.title}"</b> pada {formatDisplay(agenda.event_date)} akan dihapus permanen.</div>
        </div>
        <div className="a-del-ft">
          <button className="abtn-cncl" onClick={onClose}>Batal</button>
          <button className="abtn-del" onClick={go} disabled={busy}>
            {busy ? <><Loader2 size={14} style={{ animation:"aspin 1s linear infinite" }}/> Menghapus...</> : <><Trash2 size={14}/> Hapus</>}
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
export default function AgendaPage() {
  const today  = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [agendas,  setAgendas]  = useState<Agenda[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [addModal,  setAddModal]  = useState<FormState | null>(null);
  const [editModal, setEditModal] = useState<(FormState & { id: string }) | null>(null);
  const [delModal,  setDelModal]  = useState<Agenda | null>(null);
  const [toast,     setToast]     = useState<{ msg:string; type:"ok"|"err" } | null>(null);

  const showToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/agenda?year=${year}&month=${month+1}`);
      const data = await res.json();
      if (data.success) setAgendas(data.data);
    } catch { showToast("Gagal memuat agenda.", "err"); }
    finally  { setLoading(false); }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  /* calendar grid */
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDOW(year, month);
  const prevDays    = getDaysInMonth(year, month-1);

  const cells: { date:string; day:number; cur:boolean }[] = [];
  for (let i=firstDay-1; i>=0; i--) {
    const d=prevDays-i, m=month===0?11:month-1, y=month===0?year-1:year;
    cells.push({ date:toDateStr(y,m,d), day:d, cur:false });
  }
  for (let d=1; d<=daysInMonth; d++) cells.push({ date:toDateStr(year,month,d), day:d, cur:true });
  const rem = 7-(cells.length%7);
  if (rem<7) for (let d=1; d<=rem; d++) {
    const m=month===11?0:month+1, y=month===11?year+1:year;
    cells.push({ date:toDateStr(y,m,d), day:d, cur:false });
  }

  const byDate: Record<string,Agenda[]> = {};
  agendas.forEach(a => { if (!byDate[a.event_date]) byDate[a.event_date]=[]; byDate[a.event_date].push(a); });

  const todayStr   = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const selAgendas = byDate[selected] ?? [];

  const prevMonth = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(todayStr); };

  /* CRUD */
  const handleAdd = async (f: FormState) => {
    const res  = await fetch(`${BASE}/agenda`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) });
    const data = await res.json();
    if (data.success) { showToast("Agenda berhasil ditambahkan."); setAddModal(null); await load(); }
    else showToast(data.message??"Gagal menyimpan.", "err");
  };

  const handleEdit = async (f: FormState) => {
    const res  = await fetch(`${BASE}/agenda/${editModal!.id}`,{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) });
    const data = await res.json();
    if (data.success) { showToast("Agenda berhasil diperbarui."); setEditModal(null); await load(); }
    else showToast(data.message??"Gagal memperbarui.", "err");
  };

  const handleDelete = async () => {
    const res  = await fetch(`${BASE}/agenda/${delModal!.id}`,{ method:"DELETE" });
    const data = await res.json();
    if (data.success) { showToast("Agenda berhasil dihapus."); setDelModal(null); await load(); }
    else showToast(data.message??"Gagal menghapus.", "err");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ap">
        {/* Header */}
        <div className="ap-hd">
          <div>
            <div className="ap-title">Agenda</div>
            <div className="ap-sub">Kelola jadwal dan agenda kegiatan sekolah</div>
          </div>
        </div>

        <div className="ap-wrap">
          {/* ── Kalender ── */}
          <div className="ap-card">
            {/* Nav */}
            <div className="ap-nav">
              <button className="ap-nav-btn" onClick={prevMonth}><ChevronLeft size={16}/></button>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span className="ap-month">{MONTHS[month]}<span className="ap-year">{year}</span></span>
                <button className="ap-today-btn" onClick={goToday}>Hari Ini</button>
              </div>
              <button className="ap-nav-btn" onClick={nextMonth}><ChevronRight size={16}/></button>
            </div>

            {/* Day labels */}
            <div className="ap-days">
              {DAYS.map(d => <div key={d} className="ap-dlbl">{d}</div>)}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ padding:"60px 20px", display:"flex", justifyContent:"center" }}>
                <Loader2 size={28} color="#0f766e" style={{ animation:"aspin 1s linear infinite" }}/>
              </div>
            ) : (
              <div className="ap-grid">
                {cells.map((cell, idx) => {
                  const dow    = idx%7;
                  const isToday = cell.date===todayStr;
                  const isSel   = cell.date===selected;
                  const items   = byDate[cell.date]??[];
                  const cls = ["ap-cell",
                    !cell.cur?"ap-cell--other":"",
                    isToday?"ap-cell--today":"",
                    dow===0?"ap-cell--sun":"",
                    dow===6?"ap-cell--sat":"",
                  ].filter(Boolean).join(" ");

                  return (
                    <div key={cell.date} className={cls}
                      style={isSel&&!isToday?{ background:"rgba(15,118,110,0.07)", boxShadow:"inset 0 0 0 2px rgba(15,118,110,0.2)" }:{}}
                      onClick={() => { setSelected(cell.date); setAddModal(emptyForm(cell.date)); }}>
                      <div className="ap-cell-num">{cell.day}</div>
                      {items.slice(0,2).map(a => {
                        const vc = VIS_COLOR[a.visibility];
                        return (
                          <div key={a.id} className="ap-pill"
                            style={{ background:vc.bg, color:vc.text, border:`1px solid ${vc.border}` }}
                            onClick={ev => { ev.stopPropagation(); setSelected(cell.date); }}>
                            {a.title}
                          </div>
                        );
                      })}
                      {items.length>2 && <span className="ap-more">+{items.length-2} lagi</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="ap-legend">
              {(Object.entries(VIS_COLOR) as [Visibility, typeof VIS_COLOR[Visibility]][]).map(([k,v]) => (
                <div key={k} className="ap-leg">
                  <div className="ap-leg-dot" style={{ background:v.text }}/>
                  {VIS_LABEL[k]}
                </div>
              ))}
              <div className="ap-leg" style={{ marginLeft:"auto" }}>
                <Calendar size={11}/> Klik tanggal untuk tambah
              </div>
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="ap-side">
            <div className="ap-side-hd">
              <div className="ap-side-title">{selected ? formatDisplay(selected) : "Pilih Tanggal"}</div>
              <div className="ap-side-sub">{selAgendas.length ? `${selAgendas.length} agenda` : "Tidak ada agenda"}</div>
            </div>

            {selAgendas.length===0 ? (
              <div className="ap-side-empty">
                <Calendar size={28} style={{ margin:"0 auto 8px", opacity:.3 }}/>
                Tidak ada agenda.<br/>Klik tanggal untuk menambah.
              </div>
            ) : (
              <div className="ap-side-list">
                {selAgendas.map(a => {
                  const vc = VIS_COLOR[a.visibility];
                  return (
                    <div key={a.id} className="ap-item">
                      <div className="ap-item-title">{a.title}</div>

                      {a.location && (
                        <div className="ap-item-row">
                          <MapPin size={10}/> {a.location}
                        </div>
                      )}
                      {a.registration_link && (
                        <div className="ap-item-row">
                          <Link size={10}/>
                          <a href={a.registration_link} target="_blank" rel="noreferrer"
                            style={{ color:"#2563eb", textDecoration:"underline" }}
                            onClick={ev => ev.stopPropagation()}>
                            Link Pendaftaran
                          </a>
                        </div>
                      )}
                      {a.description && (
                        <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:4, lineHeight:1.5 }}>
                          {a.description}
                        </div>
                      )}

                      <div style={{ marginTop:6 }}>
                        <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:700,
                          background:vc.bg, color:vc.text, border:`1px solid ${vc.border}` }}>
                          <Eye size={9} style={{ display:"inline", marginRight:2 }}/>
                          {VIS_LABEL[a.visibility]}
                        </span>
                      </div>

                      <div className="ap-item-acts">
                        <button className="ap-item-act ap-item-act-e"
                          onClick={() => setEditModal({ ...emptyForm(a.event_date), ...a, id:a.id })}>
                          <Pencil size={12}/>
                        </button>
                        <button className="ap-item-act ap-item-act-d" onClick={() => setDelModal(a)}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="ap-side-add" onClick={() => setAddModal(emptyForm(selected))}>
              <Calendar size={13}/> Tambah Agenda
            </button>
          </div>
        </div>
      </div>

      {addModal  && <AgendaModal init={addModal}  onClose={() => setAddModal(null)}  onSave={handleAdd}/>}
      {editModal && <AgendaModal init={editModal} onClose={() => setEditModal(null)} onSave={handleEdit}/>}
      {delModal  && <DeleteModal agenda={delModal} onClose={() => setDelModal(null)} onConfirm={handleDelete}/>}
      {toast     && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
}