import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, Users, FileText,
  Calendar, ChevronDown, Check, Eye, BookOpen, AlertTriangle,
  GraduationCap, Handshake, Upload, Download, File, FileBadge
} from "lucide-react";
import axios from "axios";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Attendance = "hadir" | "izin" | "sakit" | "alpha";
type ReportType = "hafalan" | "tilawah" | "yanbua" | null;
type Quality    = "sangat_lancar" | "lancar" | "mengulang" | null;

interface ProgressReport {
  id: string; student_id: string; student_name?: string; program?: string;
  teacher_id: string; teacher_name?: string; date: string;
  attendance: Attendance; report_type: ReportType; kualitas: Quality;
  hafalan_target: string | null; hafalan_achievement: string | null; teacher_notes: string | null;
}
interface StudentProgress {
  id: string; nama: string; program: string; program_id?: string; lastReport?: ProgressReport;
}
interface MitraItem {
  id: string; institution_name: string; contact_person: string;
  status: string; report_count: number;
}
interface MitraReport {
  id: string; partner_id: string; title: string; date: string;
  description: string | null; file_url: string | null; file_name: string | null;
  file_type: string | null; file_size: number | null; created_at: string | null;
}
interface Meta    { total: number; page: number; per_page: number; last_page: number; }
interface Option  { id: string; label: string; }
interface Options { students: Option[]; teachers: Option[]; programs: Option[]; }

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
.prg { width:100%; display:flex; flex-direction:column; gap:24px; color:#1e293b; }
.prg-hd { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.prg-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.prg-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }
.prg-tabs {
  display:flex; gap:8px; background:rgba(255,255,255,0.45);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,0.8); border-radius:16px;
  box-shadow:0 4px 16px rgba(0,0,0,0.03); padding:6px; width:fit-content;
}
.prg-tab {
  display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:12px;
  font-size:13.5px; font-weight:700; color:#64748b; cursor:pointer;
  transition:all 0.25s; border:none; background:transparent; font-family:inherit;
}
.prg-tab:hover { background:rgba(255,255,255,0.5); color:#1e293b; }
.prg-tab--on { background:#fff; color:#1e293b; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
.prg-tab-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
.prg-card {
  background:rgba(255,255,255,0.55); backdrop-filter:saturate(200%) blur(32px); -webkit-backdrop-filter:saturate(200%) blur(32px);
  border-radius:28px; border:1px solid rgba(255,255,255,0.9);
  box-shadow:0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1); overflow:hidden;
}
.prg-bar { display:flex; gap:12px; flex-wrap:wrap; align-items:center; padding:20px 24px; border-bottom:1px solid rgba(0,0,0,0.05); background:rgba(255,255,255,0.4); }
.prg-search {
  display:flex; align-items:center; gap:10px; flex:1; min-width:220px; max-width:340px; height:44px; padding:0 16px;
  background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.9); border-radius:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9); transition:all 0.3s;
}
.prg-search:focus-within { background:#fff; border-color:#0ea5e9; box-shadow:0 8px 24px rgba(14,165,233,0.08); transform:translateY(-1px); }
.prg-search input { flex:1; font-size:14px; font-weight:500; color:#1e293b; background:transparent; outline:none; border:none; }
.prg-search input::placeholder { color:#94a3b8; }
.prg-sel-wrap { position:relative; }
.prg-sel {
  display:flex; align-items:center; gap:8px; height:44px; padding:0 16px; min-width:180px;
  background:rgba(255,255,255,0.7); backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,0.9); border-radius:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.02); transition:all 0.3s; cursor:pointer; user-select:none;
}
.prg-sel:hover { background:rgba(255,255,255,0.95); }
.prg-sel--open { background:#fff; border-color:#0ea5e9; box-shadow:0 8px 24px rgba(14,165,233,0.08),0 0 0 3px rgba(14,165,233,0.1); transform:translateY(-1px); }
.prg-sel-val { flex:1; font-size:14px; font-weight:600; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.prg-sel-menu {
  position:absolute; top:calc(100% + 10px); left:0; min-width:220px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(40px);
  border:1px solid rgba(255,255,255,1); border-radius:18px;
  box-shadow:0 20px 48px rgba(0,0,0,0.12); padding:8px; display:flex; flex-direction:column; gap:4px; z-index:100;
  animation:rsu .2s cubic-bezier(0.175,0.885,0.32,1.275);
}
.prg-sel-item { padding:12px 14px; border-radius:12px; font-size:13.5px; font-weight:500; color:#475569; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:space-between; }
.prg-sel-item:hover { background:rgba(14,165,233,0.08); color:#0ea5e9; }
.prg-sel-item.active { background:linear-gradient(135deg,#0ea5e9,#0284c7); color:#fff; font-weight:700; box-shadow:0 4px 14px rgba(14,165,233,0.3); }
.prg-sel-overlay { position:fixed; inset:0; z-index:99; }
.prg-btn-add {
  margin-left:auto; display:flex; align-items:center; gap:6px; height:44px; padding:0 20px; border-radius:14px;
  background:#0ea5e9; color:#fff; font-size:14px; font-weight:700; font-family:inherit; cursor:pointer;
  box-shadow:0 6px 16px rgba(14,165,233,0.25); transition:all 0.25s; border:none;
}
.prg-btn-add:hover { box-shadow:0 8px 24px rgba(14,165,233,0.35); transform:translateY(-2px); }
table { width:100%; border-collapse:collapse; }
th { padding:14px 24px; text-align:left; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#64748b; white-space:nowrap; background:rgba(255,255,255,0.3); border-bottom:1px solid rgba(0,0,0,0.04); }
td { padding:16px 24px; font-size:13.5px; color:#334155; border-bottom:1px solid rgba(0,0,0,0.03); }
tr { transition:background 0.2s; }
tbody tr:hover { background:rgba(255,255,255,0.7); }
tr.clickable { cursor:pointer; }
tr.clickable:hover { background:rgba(14,165,233,0.05); }
.badge { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:11.5px; font-weight:700; white-space:nowrap; }
.b-hadir { background:rgba(22,163,74,0.1); color:#16a34a; }
.b-izin  { background:rgba(234,179,8,0.1); color:#d97706; }
.b-sakit { background:rgba(56,189,248,0.1); color:#0284c7; }
.b-alpha { background:rgba(220,38,38,0.1); color:#dc2626; }
.b-type  { background:rgba(139,92,246,0.1); color:#7c3aed; }
.b-qual  { background:rgba(244,114,182,0.1); color:#db2777; }
.b-prog  { background:rgba(245,158,11,0.1); color:#b45309; }
.b-active   { background:rgba(22,163,74,0.1); color:#16a34a; }
.b-inactive { background:rgba(220,38,38,0.1); color:#dc2626; }
.s-name { font-weight:700; color:#1e293b; font-size:14px; }
.s-meta { font-size:12px; color:#64748b; margin-top:2px; display:flex; align-items:center; gap:4px; }
.acts { display:flex; gap:6px; justify-content:flex-end; }
.act-btn { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05); transition:all 0.2s; cursor:pointer; font-family:inherit; }
.act-e { color:#0ea5e9; } .act-e:hover { background:#0ea5e9; color:#fff; border-color:#0ea5e9; transform:scale(1.05); }
.act-d { color:#dc2626; } .act-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.05); }
.act-v { color:#10b981; } .act-v:hover { background:#10b981; color:#fff; border-color:#10b981; transform:scale(1.05); }
.rmbk { position:fixed; inset:0; z-index:700; background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; animation:rfi .2s ease; overflow-y:auto; }
@keyframes rfi { from{opacity:0} to{opacity:1} }
@keyframes rsu { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
.rm { width:100%; max-width:600px; max-height:92vh; display:flex; flex-direction:column; background:rgba(255,255,255,0.97); border:1px solid rgba(255,255,255,1); border-radius:24px; box-shadow:0 24px 64px rgba(0,0,0,0.15); animation:rsu .3s cubic-bezier(0.175,0.885,0.32,1.275); }
.rm-large { max-width:820px; max-height:90vh; }
.rm-hd { display:flex; align-items:center; justify-content:space-between; padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06); flex-shrink:0; }
.rm-title { font-size:18px; font-weight:800; color:#1e293b; }
.rm-cls { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); color:#64748b; cursor:pointer; border:none; transition:all 0.2s; }
.rm-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; }
.rm-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; min-height:0; }
.rm-ft { display:flex; justify-content:flex-end; gap:10px; padding:16px 28px 24px; border-top:1px solid rgba(0,0,0,0.06); flex-shrink:0; }
.history-list { display:flex; flex-direction:column; gap:12px; }
.hist-item { background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:16px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:10px; }
.hist-hd { display:flex; justify-content:space-between; align-items:center; }
.hist-date { font-weight:700; color:#1e293b; display:flex; align-items:center; gap:6px; font-size:14px; }
.hist-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.hist-lbl { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px; }
.hist-val { font-size:13.5px; font-weight:600; color:#1e293b; }
.hist-notes { background:rgba(248,250,252,1); padding:12px; border-radius:10px; font-size:13px; color:#475569; font-style:italic; border-left:3px solid #0ea5e9; }
.rfg { display:flex; flex-direction:column; gap:6px; }
.rfl { font-size:11.5px; font-weight:700; text-transform:uppercase; color:#64748b; }
.rfi, .rsel, .rta { background:#fff; border:1px solid #d1d5db; border-radius:12px; font-size:14px; font-weight:500; color:#1e293b; width:100%; transition:all 0.2s; outline:none; font-family:inherit; }
.rfi, .rsel { height:44px; padding:0 16px; }
.rsel { appearance:none; padding-right:36px; cursor:pointer; }
.rta { padding:14px 16px; resize:vertical; line-height:1.5; }
.rfi:focus, .rsel:focus, .rta:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,0.15); }
.sel-wrap { position:relative; }
.sel-ico { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; }
.rbtn-cncl { padding:0 20px; height:44px; border-radius:12px; font-size:14px; font-weight:700; color:#475569; background:rgba(0,0,0,0.05); border:none; cursor:pointer; transition:0.2s; font-family:inherit; }
.rbtn-cncl:hover { background:rgba(0,0,0,0.1); }
.rbtn-sv { display:flex; align-items:center; gap:8px; padding:0 24px; height:44px; border-radius:12px; font-size:14px; font-weight:700; color:#fff; background:#0ea5e9; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(14,165,233,0.25); transition:0.2s; font-family:inherit; }
.rbtn-sv:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(14,165,233,0.35); }
.rbtn-sv:disabled { opacity:0.6; cursor:not-allowed; }
.empty-st { padding:64px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; color:#64748b; font-weight:600; }
.toast { position:fixed; bottom:24px; right:24px; z-index:999; display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:16px; background:rgba(255,255,255,0.97); backdrop-filter:blur(16px); border:1px solid #fff; box-shadow:0 12px 40px rgba(0,0,0,0.1); font-weight:600; font-size:14px; animation:rsu .3s; }
.t-ok { border-left:4px solid #16a34a; } .t-err { border-left:4px solid #dc2626; }
.err-banner { display:flex; align-items:center; gap:10px; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.15); border-radius:14px; padding:12px 16px; color:#dc2626; font-size:13px; font-weight:600; margin:16px 24px; }

/* Upload zone */
.upload-zone {
  border:2px dashed #cbd5e1; border-radius:14px; padding:28px 20px;
  text-align:center; cursor:pointer; transition:all 0.2s; background:rgba(248,250,252,0.8);
}
.upload-zone:hover, .upload-zone--over { border-color:#0ea5e9; background:rgba(14,165,233,0.04); }
.upload-zone--has-file { border-color:#16a34a; background:rgba(22,163,74,0.04); border-style:solid; }

/* File chip di laporan mitra */
.file-chip {
  display:inline-flex; align-items:center; gap:8px; padding:8px 14px;
  background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.2);
  border-radius:10px; font-size:12.5px; font-weight:600; color:#0369a1; text-decoration:none;
  transition:all 0.2s;
}
.file-chip:hover { background:rgba(14,165,233,0.14); transform:translateY(-1px); }
.file-chip-pdf { background:rgba(220,38,38,0.07); border-color:rgba(220,38,38,0.2); color:#b91c1c; }
.file-chip-pdf:hover { background:rgba(220,38,38,0.13); }

@media (max-width:768px) {
  .prg-bar { flex-direction:column; align-items:stretch; }
  .prg-search, .prg-sel-wrap { max-width:100%; }
  .prg-btn-add { justify-content:center; margin-left:0; }
  table th:nth-child(3), table td:nth-child(3) { display:none; }
}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
const formatBytes = (b: number) =>
  b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB';

const ATTD_BADGE: Record<string, {lbl:string;cls:string}> = {
  hadir:{lbl:"Hadir",cls:"b-hadir"}, izin:{lbl:"Izin",cls:"b-izin"},
  sakit:{lbl:"Sakit",cls:"b-sakit"}, alpha:{lbl:"Alpha",cls:"b-alpha"},
};
const QUAL_LABEL: Record<string,string> = {
  sangat_lancar:"Sangat Lancar", lancar:"Lancar", mengulang:"Mengulang",
};

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({msg,type,onClose}:{msg:string;type:"ok"|"err";onClose:()=>void}) {
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[onClose]);
  return createPortal(
    <div className={`toast ${type==="ok"?"t-ok":"t-err"}`}>
      {type==="ok"?<CheckCircle2 color="#16a34a" size={18}/>:<AlertCircle color="#dc2626" size={18}/>}
      {msg}
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRAM FILTER DROPDOWN (reusable)
═══════════════════════════════════════════════════════════ */
function ProgramFilter({programs,value,onChange}:{programs:Option[];value:string;onChange:(v:string)=>void}) {
  const [open,setOpen]=useState(false);
  const sel=programs.find(p=>p.id===value);
  return (
    <div className="prg-sel-wrap">
      <div className={`prg-sel ${open?"prg-sel--open":""}`} onClick={()=>setOpen(!open)}>
        <GraduationCap size={15} color="#64748b"/>
        <span className="prg-sel-val">{sel?sel.label:"Semua Program"}</span>
        <ChevronDown size={16} color="#64748b" style={{transform:open?"rotate(180deg)":undefined,transition:"0.2s"}}/>
      </div>
      {open&&(<>
        <div className="prg-sel-overlay" onClick={()=>setOpen(false)}/>
        <div className="prg-sel-menu">
          <div className={`prg-sel-item ${value===""?"active":""}`} onClick={()=>{onChange("");setOpen(false);}}>
            <span>Semua Program</span>{value===""&&<Check size={16}/>}
          </div>
          {programs.map(p=>(
            <div key={p.id} className={`prg-sel-item ${value===p.id?"active":""}`} onClick={()=>{onChange(p.id);setOpen(false);}}>
              <span>{p.label}</span>{value===p.id&&<Check size={16}/>}
            </div>
          ))}
        </div>
      </>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — DATA SISWA
═══════════════════════════════════════════════════════════ */
function TabSiswa({programs,onOpenDetail}:{programs:Option[];onOpenDetail:(s:StudentProgress)=>void}) {
  const [data,setData]=useState<StudentProgress[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [programId,setProgramId]=useState("");
  const dSearch=useDebounce(search);

  const load=useCallback(()=>{
    setLoading(true); setError(null);
    const p=new URLSearchParams();
    if(dSearch) p.set("search",dSearch);
    if(programId) p.set("program_id",programId);
    axios.get<StudentProgress[]>(`/api/admin/progress/students?${p}`)
      .then(r=>setData(r.data)).catch(()=>setError("Gagal memuat data siswa."))
      .finally(()=>setLoading(false));
  },[dSearch,programId]);

  useEffect(()=>{load();},[load]);

  return (<>
    <div className="prg-bar">
      <div className="prg-search">
        <Search size={16} color="#64748b"/>
        <input placeholder="Cari nama siswa..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <ProgramFilter programs={programs} value={programId} onChange={setProgramId}/>
    </div>
    {error&&<div className="err-banner"><AlertTriangle size={16}/>{error}</div>}
    {loading?(<div className="empty-st"><Loader2 size={32} className="animate-spin" style={{color:"#0ea5e9"}}/></div>)
    :data.length===0?(<div className="empty-st"><Users size={48} style={{opacity:0.4}}/>Tidak ada siswa ditemukan.</div>)
    :(<div style={{overflowX:"auto"}}>
      <table>
        <thead><tr><th>Siswa</th><th>Laporan Terakhir</th><th>Kehadiran</th><th>Tipe & Kualitas</th><th style={{textAlign:"right"}}>Aksi</th></tr></thead>
        <tbody>
          {data.map(s=>{
            const r=s.lastReport;
            return (
              <tr key={s.id} className="clickable" onClick={()=>onOpenDetail(s)}>
                <td>
                  <div className="s-name">{s.nama}</div>
                  <div className="s-meta"><span className="badge b-prog" style={{padding:"2px 6px",fontSize:10}}>{s.program}</span></div>
                </td>
                <td>{r?<div className="s-meta" style={{color:"#1e293b",fontWeight:600}}><Calendar size={13}/>{formatDate(r.date)}</div>:<span style={{color:"#94a3b8",fontSize:13}}>Belum ada</span>}</td>
                <td>{r?<span className={`badge ${ATTD_BADGE[r.attendance].cls}`}>{ATTD_BADGE[r.attendance].lbl}</span>:"—"}</td>
                <td>{r?.report_type?(<div style={{display:"flex",gap:6}}>
                  <span className="badge b-type">{r.report_type.toUpperCase()}</span>
                  {r.kualitas&&<span className="badge b-qual">{QUAL_LABEL[r.kualitas]}</span>}
                </div>):"—"}</td>
                <td onClick={e=>e.stopPropagation()}>
                  <div className="acts">
                    <button className="act-btn act-v" onClick={()=>onOpenDetail(s)}><Eye size={15}/></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>)}
  </>);
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — DATA MITRA
═══════════════════════════════════════════════════════════ */
function TabMitra({onOpenDetail}:{onOpenDetail:(m:MitraItem)=>void}) {
  const [data,setData]=useState<MitraItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const dSearch=useDebounce(search);

  const load=useCallback(()=>{
    setLoading(true); setError(null);
    const p=new URLSearchParams();
    if(dSearch) p.set("search",dSearch);
    axios.get<MitraItem[]>(`/api/admin/mitra/list?${p}`)
      .then(r=>setData(r.data)).catch(()=>setError("Gagal memuat data mitra."))
      .finally(()=>setLoading(false));
  },[dSearch]);

  useEffect(()=>{load();},[load]);

  return (<>
    <div className="prg-bar">
      <div className="prg-search">
        <Search size={16} color="#64748b"/>
        <input placeholder="Cari nama lembaga atau kontak..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
    </div>
    {error&&<div className="err-banner"><AlertTriangle size={16}/>{error}</div>}
    {loading?(<div className="empty-st"><Loader2 size={32} className="animate-spin" style={{color:"#0ea5e9"}}/></div>)
    :data.length===0?(<div className="empty-st"><Handshake size={48} style={{opacity:0.4}}/>Tidak ada mitra ditemukan.</div>)
    :(<div style={{overflowX:"auto"}}>
      <table>
        <thead><tr><th>Lembaga</th><th>Kontak</th><th>Status</th><th>Laporan</th><th style={{textAlign:"right"}}>Aksi</th></tr></thead>
        <tbody>
          {data.map(m=>(
            <tr key={m.id} className="clickable" onClick={()=>onOpenDetail(m)}>
              <td><div className="s-name">{m.institution_name}</div></td>
              <td><div className="s-meta">{m.contact_person}</div></td>
              <td>
                <span className={`badge ${m.status==="Active"?"b-active":"b-inactive"}`}>
                  {m.status==="Active"?"Aktif":"Tidak Aktif"}
                </span>
              </td>
              <td>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontWeight:700,color:"#1e293b"}}>{m.report_count}</span>
                  <span style={{fontSize:12,color:"#94a3b8"}}>laporan</span>
                </div>
              </td>
              <td onClick={e=>e.stopPropagation()}>
                <div className="acts">
                  <button className="act-btn act-v" onClick={()=>onOpenDetail(m)}><Eye size={15}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>)}
  </>);
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETAIL SISWA
═══════════════════════════════════════════════════════════ */
function DetailSiswaModal({student,onClose,onAdd,onEdit,onDelete,refreshKey}:{
  student:StudentProgress; onClose:()=>void;
  onAdd:(sid:string)=>void; onEdit:(r:ProgressReport)=>void; onDelete:(r:ProgressReport)=>void;
  refreshKey:number;
}) {
  const [history,setHistory]=useState<ProgressReport[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    setLoading(true); setError(null);
    axios.get<ProgressReport[]>(`/api/admin/progress/students/${student.id}/reports`)
      .then(r=>setHistory(r.data)).catch(()=>setError("Gagal memuat riwayat."))
      .finally(()=>setLoading(false));
  },[student.id,refreshKey]);

  return createPortal(
    <div className="rmbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="rm rm-large">
        <div className="rm-hd">
          <div>
            <div className="rm-title">Riwayat Progress — {student.nama}</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4}}>{student.program}</div>
          </div>
          <button className="rm-cls" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="rm-body" style={{background:"rgba(241,245,249,0.5)"}}>
          <button className="prg-btn-add" style={{width:"100%",justifyContent:"center"}} onClick={()=>onAdd(student.id)}>
            <Plus size={16}/> Catat Laporan Baru
          </button>
          {error&&<div className="err-banner"><AlertTriangle size={16}/>{error}</div>}
          {loading?(<div className="empty-st"><Loader2 className="animate-spin"/></div>)
          :history.length===0?(<div className="empty-st">Belum ada riwayat laporan.</div>)
          :(
            <div className="history-list">
              {history.map(h=>(
                <div key={h.id} className="hist-item">
                  <div className="hist-hd">
                    <div className="hist-date"><Calendar size={15} color="#0ea5e9"/>{formatDate(h.date)}</div>
                    <div className="acts">
                      <button className="act-btn act-e" onClick={()=>onEdit(h)}><Pencil size={14}/></button>
                      <button className="act-btn act-d" onClick={()=>onDelete(h)}><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span className={`badge ${ATTD_BADGE[h.attendance].cls}`}>{ATTD_BADGE[h.attendance].lbl}</span>
                    {h.report_type&&<span className="badge b-type">{h.report_type.toUpperCase()}</span>}
                    {h.kualitas&&<span className="badge b-qual">{QUAL_LABEL[h.kualitas]}</span>}
                    <span style={{fontSize:12,color:"#64748b",marginLeft:"auto"}}>Oleh: {h.teacher_name||"—"}</span>
                  </div>
                  {h.report_type&&(
                    <div className="hist-grid">
                      <div><div className="hist-lbl">Target</div><div className="hist-val">{h.hafalan_target||"—"}</div></div>
                      <div><div className="hist-lbl">Pencapaian</div><div className="hist-val">{h.hafalan_achievement||"—"}</div></div>
                    </div>
                  )}
                  {h.teacher_notes&&<div className="hist-notes">{h.teacher_notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETAIL MITRA — riwayat laporan + upload
═══════════════════════════════════════════════════════════ */
function DetailMitraModal({mitra,onClose,refreshKey,onDeleted}:{
  mitra:MitraItem; onClose:()=>void; refreshKey:number;
  onDeleted:(id:string)=>void;
}) {
  const [reports,setReports]=useState<MitraReport[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [showUpload,setShowUpload]=useState(false);
  const [delId,setDelId]=useState<string|null>(null);
  const [toast,setToast]=useState<{msg:string;type:"ok"|"err"}|null>(null);

  const load=()=>{
    setLoading(true); setError(null);
    axios.get<MitraReport[]>(`/api/admin/mitra/${mitra.id}/reports`)
      .then(r=>setReports(r.data)).catch(()=>setError("Gagal memuat laporan."))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[mitra.id,refreshKey]);

  const handleUploaded=(r:MitraReport)=>{
    setReports(prev=>[r,...prev]);
    setShowUpload(false);
    setToast({msg:"Laporan berhasil diupload.",type:"ok"});
  };

  const handleDelete=async(id:string)=>{
    try {
      await axios.delete(`/api/admin/mitra/reports/${id}`);
      setReports(prev=>prev.filter(r=>r.id!==id));
      setDelId(null);
      onDeleted(id);
      setToast({msg:"Laporan berhasil dihapus.",type:"ok"});
    } catch {
      setToast({msg:"Gagal menghapus laporan.",type:"err"});
    }
  };

  return createPortal(
    <div className="rmbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="rm rm-large">
        <div className="rm-hd">
          <div>
            <div className="rm-title">Laporan Mitra — {mitra.institution_name}</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4,display:"flex",gap:8,alignItems:"center"}}>
              {mitra.contact_person}
              <span className={`badge ${mitra.status==="Active"?"b-active":"b-inactive"}`} style={{fontSize:10,padding:"2px 7px"}}>
                {mitra.status==="Active"?"Aktif":"Tidak Aktif"}
              </span>
            </div>
          </div>
          <button className="rm-cls" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="rm-body" style={{background:"rgba(241,245,249,0.5)"}}>
          <button className="prg-btn-add" style={{width:"100%",justifyContent:"center"}}
            onClick={()=>setShowUpload(true)}>
            <Upload size={16}/> Upload Laporan Baru
          </button>

          {error&&<div className="err-banner"><AlertTriangle size={16}/>{error}</div>}

          {loading?(<div className="empty-st"><Loader2 className="animate-spin"/></div>)
          :reports.length===0?(<div className="empty-st"><FileText size={40} style={{opacity:0.3}}/>Belum ada laporan diupload.</div>)
          :(
            <div className="history-list">
              {reports.map(r=>(
                <div key={r.id} className="hist-item">
                  <div className="hist-hd">
                    <div className="hist-date"><Calendar size={15} color="#0ea5e9"/>{formatDate(r.date)}</div>
                    <button className="act-btn act-d" onClick={()=>setDelId(r.id)}><Trash2 size={14}/></button>
                  </div>
                  <div>
                    <div style={{fontWeight:700,color:"#1e293b",marginBottom:4}}>{r.title}</div>
                    {r.description&&<div style={{fontSize:13,color:"#64748b",marginBottom:10}}>{r.description}</div>}
                    {r.file_url&&(
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        className={`file-chip ${r.file_type==="pdf"?"file-chip-pdf":""}`}>
                        <File size={14}/>
                        {r.file_name||"Lihat File"}
                        {r.file_size&&<span style={{opacity:0.7,fontSize:11}}>· {formatBytes(r.file_size)}</span>}
                        <Download size={13}/>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload&&(
        <UploadMitraModal
          partnerId={mitra.id}
          partnerName={mitra.institution_name}
          onClose={()=>setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}

      {/* Delete confirm */}
      {delId&&(
        <div className="rmbk" style={{zIndex:800}} onClick={e=>e.target===e.currentTarget&&setDelId(null)}>
          <div className="rm" style={{maxWidth:400,textAlign:"center",padding:"32px 24px"}}>
            <div style={{width:56,height:56,borderRadius:18,background:"rgba(220,38,38,0.1)",color:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <Trash2 size={28}/>
            </div>
            <h3 style={{fontSize:17,fontWeight:800,marginBottom:8}}>Hapus Laporan?</h3>
            <p style={{fontSize:13,color:"#64748b",marginBottom:24}}>File akan dihapus permanen dari server.</p>
            <div style={{display:"flex",gap:10}}>
              <button className="rbtn-cncl" style={{flex:1}} onClick={()=>setDelId(null)}>Batal</button>
              <button className="rbtn-sv" style={{flex:1,background:"#dc2626",boxShadow:"0 4px 14px rgba(220,38,38,0.25)",justifyContent:"center"}}
                onClick={()=>handleDelete(delId)}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL UPLOAD LAPORAN MITRA
═══════════════════════════════════════════════════════════ */
function UploadMitraModal({partnerId,partnerName,onClose,onUploaded}:{
  partnerId:string; partnerName:string; onClose:()=>void; onUploaded:(r:MitraReport)=>void;
}) {
  const [title,setTitle]=useState("");
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [description,setDescription]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [dragOver,setDragOver]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  const handleFile=(f:File)=>{
    const ok=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if(!ok.includes(f.type)){setError("Hanya file PDF atau Word yang diizinkan.");return;}
    if(f.size>10*1024*1024){setError("Ukuran file maksimal 10MB.");return;}
    setFile(f); setError(null);
  };

  const submit=async()=>{
    if(!title.trim()){setError("Judul wajib diisi.");return;}
    if(!file){setError("Pilih file terlebih dahulu.");return;}
    setBusy(true); setError(null);
    const fd=new FormData();
    fd.append("title",title); fd.append("date",date);
    fd.append("description",description); fd.append("file",file);
    try {
      const r=await axios.post<MitraReport>(`/api/admin/mitra/${partnerId}/reports`,fd,
        {headers:{"Content-Type":"multipart/form-data"}});
      onUploaded(r.data);
    } catch(e:unknown) {
      const msg=(e as {response?:{data?:{message?:string}}})?.response?.data?.message||"Gagal mengupload laporan.";
      setError(msg);
    } finally { setBusy(false); }
  };

  return createPortal(
    <div className="rmbk" style={{zIndex:800}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="rm">
        <div className="rm-hd">
          <div>
            <div className="rm-title">Upload Laporan</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{partnerName}</div>
          </div>
          <button className="rm-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="rm-body">
          {error&&<div className="err-banner"><AlertTriangle size={14}/>{error}</div>}

          <div className="rfg">
            <label className="rfl">Judul Laporan</label>
            <input className="rfi" placeholder="Misal: Laporan Kerjasama Q1 2026"
              value={title} onChange={e=>setTitle(e.target.value)}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="rfg">
              <label className="rfl">Tanggal</label>
              <input type="date" className="rfi" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
          </div>

          <div className="rfg">
            <label className="rfl">Deskripsi (opsional)</label>
            <textarea className="rta" rows={2} placeholder="Ringkasan isi laporan..."
              value={description} onChange={e=>setDescription(e.target.value)}/>
          </div>

          {/* Upload Zone */}
          <div className="rfg">
            <label className="rfl">File Laporan (PDF / Word, maks 10MB)</label>
            <div
              className={`upload-zone ${dragOver?"upload-zone--over":""} ${file?"upload-zone--has-file":""}`}
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}>
              {file?(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <FileBadge size={32} color="#16a34a"/>
                  <div style={{fontWeight:700,color:"#1e293b",fontSize:14}}>{file.name}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>{formatBytes(file.size)}</div>
                  <div style={{fontSize:12,color:"#16a34a",fontWeight:600}}>✓ File siap diupload</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <Upload size={32} color="#94a3b8"/>
                  <div style={{fontWeight:600,color:"#475569",fontSize:14}}>Klik atau drag & drop file di sini</div>
                  <div style={{fontSize:12,color:"#94a3b8"}}>PDF, DOC, DOCX — maksimal 10MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}}
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
          </div>
        </div>
        <div className="rm-ft">
          <button className="rbtn-cncl" onClick={onClose} disabled={busy}>Batal</button>
          <button className="rbtn-sv" onClick={submit} disabled={busy}>
            {busy?<Loader2 size={16} className="animate-spin"/>:<Upload size={16}/>}
            {busy?"Mengupload...":"Upload Laporan"}
          </button>
        </div>
      </div>
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   FORM MODAL — LAPORAN SISWA (CREATE/EDIT)
═══════════════════════════════════════════════════════════ */
function FormModal({init,studentIdLock,options,onClose,onSaved}:{
  init:ProgressReport|null; studentIdLock?:string; options:Options;
  onClose:()=>void; onSaved:()=>void;
}) {
  const [f,setF]=useState<Partial<ProgressReport>>(
    init??{student_id:studentIdLock??"",teacher_id:"",date:new Date().toISOString().split("T")[0],
      attendance:"hadir",report_type:"hafalan",kualitas:"lancar",
      hafalan_target:"",hafalan_achievement:"",teacher_notes:""}
  );
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const upd=(k:keyof ProgressReport)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>
    setF(p=>({...p,[k]:e.target.value}));
  const isAbsent=["izin","sakit","alpha"].includes(f.attendance??"");

  const submit=async()=>{
    if(!f.student_id){setError("Pilih siswa terlebih dahulu.");return;}
    setBusy(true); setError(null);
    const payload={...f,report_type:isAbsent?null:f.report_type,kualitas:isAbsent?null:f.kualitas,
      hafalan_target:isAbsent?null:(f.hafalan_target||null),
      hafalan_achievement:isAbsent?null:(f.hafalan_achievement||null),
      teacher_notes:f.teacher_notes||null};
    try {
      if(init?.id) await axios.put(`/api/admin/progress/reports/${init.id}`,payload);
      else await axios.post("/api/admin/progress/reports",payload);
      onSaved(); onClose();
    } catch(e:unknown) {
      setError((e as {response?:{data?:{message?:string}}})?.response?.data?.message??"Gagal menyimpan laporan.");
    } finally { setBusy(false); }
  };

  return createPortal(
    <div className="rmbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="rm">
        <div className="rm-hd">
          <span className="rm-title">{init?"Edit Laporan":"Buat Laporan Baru"}</span>
          <button className="rm-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="rm-body">
          {error&&<div className="err-banner"><AlertTriangle size={14}/>{error}</div>}
          {!studentIdLock&&!init&&(
            <div className="rfg">
              <label className="rfl">Pilih Siswa</label>
              <div className="sel-wrap">
                <select className="rsel" value={f.student_id} onChange={upd("student_id")}>
                  <option value="">-- Pilih Siswa --</option>
                  {options.students.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <ChevronDown className="sel-ico" size={16}/>
              </div>
            </div>
          )}
          <div className="rfg">
            <label className="rfl">Guru (Opsional)</label>
            <div className="sel-wrap">
              <select className="rsel" value={f.teacher_id??""} onChange={upd("teacher_id")}>
                <option value="">-- Tanpa Guru / Admin --</option>
                {options.teachers.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <ChevronDown className="sel-ico" size={16}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="rfg"><label className="rfl">Tanggal</label>
              <input type="date" className="rfi" value={f.date} onChange={upd("date")}/></div>
            <div className="rfg"><label className="rfl">Kehadiran</label>
              <div className="sel-wrap">
                <select className="rsel" value={f.attendance} onChange={upd("attendance")}>
                  <option value="hadir">Hadir</option><option value="izin">Izin</option>
                  <option value="sakit">Sakit</option><option value="alpha">Alpha</option>
                </select>
                <ChevronDown className="sel-ico" size={16}/>
              </div>
            </div>
          </div>
          {!isAbsent&&(<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="rfg"><label className="rfl">Tipe Laporan</label>
                <div className="sel-wrap">
                  <select className="rsel" value={f.report_type??""} onChange={upd("report_type")}>
                    <option value="hafalan">Hafalan</option><option value="tilawah">Tilawah</option>
                    <option value="yanbua">Yanbu'a</option>
                  </select>
                  <ChevronDown className="sel-ico" size={16}/>
                </div>
              </div>
              <div className="rfg"><label className="rfl">Kualitas</label>
                <div className="sel-wrap">
                  <select className="rsel" value={f.kualitas??""} onChange={upd("kualitas")}>
                    <option value="sangat_lancar">Sangat Lancar</option>
                    <option value="lancar">Lancar</option><option value="mengulang">Mengulang</option>
                  </select>
                  <ChevronDown className="sel-ico" size={16}/>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="rfg"><label className="rfl">Target</label>
                <input className="rfi" placeholder="Al-Mulk 1-15" value={f.hafalan_target??""} onChange={upd("hafalan_target")}/></div>
              <div className="rfg"><label className="rfl">Pencapaian</label>
                <input className="rfi" placeholder="Al-Mulk 1-10" value={f.hafalan_achievement??""} onChange={upd("hafalan_achievement")}/></div>
            </div>
          </>)}
          <div className="rfg"><label className="rfl">Catatan</label>
            <textarea className="rta" rows={3} value={f.teacher_notes??""} onChange={upd("teacher_notes")}
              placeholder="Catatan tambahan..."/></div>
        </div>
        <div className="rm-ft">
          <button className="rbtn-cncl" onClick={onClose} disabled={busy}>Batal</button>
          <button className="rbtn-sv" onClick={submit} disabled={busy}>
            {busy?<Loader2 size={16} className="animate-spin"/>:<CheckCircle2 size={16}/>}
            {busy?"Menyimpan...":"Simpan Laporan"}
          </button>
        </div>
      </div>
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function ProgressPage() {
  const [tab,setTab]=useState<"siswa"|"mitra">("siswa");
  const [options,setOptions]=useState<Options>({students:[],teachers:[],programs:[]});
  const [detailSiswa,setDetailSiswa]=useState<StudentProgress|null>(null);
  const [detailMitra,setDetailMitra]=useState<MitraItem|null>(null);
  const [formModal,setFormModal]=useState<{isOpen:boolean;data:ProgressReport|null;lockSid?:string}>({isOpen:false,data:null});
  const [delModal,setDelModal]=useState<ProgressReport|null>(null);
  const [toast,setToast]=useState<{msg:string;type:"ok"|"err"}|null>(null);
  const [refreshKey,setRefreshKey]=useState(0);
  const [detailRefreshKey,setDetailRefreshKey]=useState(0);
  const [delBusy,setDelBusy]=useState(false);

  useEffect(()=>{
    axios.get<Options>("/api/admin/progress/options").then(r=>setOptions(r.data)).catch(()=>{});
  },[]);

  const handleSaved=()=>{
    setRefreshKey(k=>k+1); setDetailRefreshKey(k=>k+1);
    setToast({msg:"Laporan berhasil disimpan.",type:"ok"});
  };
  const handleDelete=async()=>{
    if(!delModal) return;
    setDelBusy(true);
    try {
      await axios.delete(`/api/admin/progress/reports/${delModal.id}`);
      setDelModal(null); setRefreshKey(k=>k+1); setDetailRefreshKey(k=>k+1);
      setToast({msg:"Laporan berhasil dihapus.",type:"ok"});
    } catch { setToast({msg:"Gagal menghapus laporan.",type:"err"}); }
    finally { setDelBusy(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="prg">
        <div className="prg-hd">
          <div>
            <div className="prg-ttl">Progress & Laporan</div>
            <div className="prg-sub">Pantau pencapaian siswa dan kelola laporan mitra kolaborasi.</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="prg-tabs">
          <button className={`prg-tab ${tab==="siswa"?"prg-tab--on":""}`} onClick={()=>setTab("siswa")}>
            <span className="prg-tab-dot" style={{background:tab==="siswa"?"#0ea5e9":"#94a3b8"}}/>
            <Users size={16}/> Data Siswa
          </button>
          <button className={`prg-tab ${tab==="mitra"?"prg-tab--on":""}`} onClick={()=>setTab("mitra")}>
            <span className="prg-tab-dot" style={{background:tab==="mitra"?"#d4a017":"#94a3b8"}}/>
            <Handshake size={16}/> Data Mitra
          </button>
        </div>

        <div className="prg-card">
          {tab==="siswa"&&(
            <TabSiswa programs={options.programs} onOpenDetail={setDetailSiswa}/>
          )}
          {tab==="mitra"&&(
            <TabMitra onOpenDetail={setDetailMitra}/>
          )}
        </div>
      </div>

      {/* Detail Siswa */}
      {detailSiswa&&(
        <DetailSiswaModal
          student={detailSiswa} refreshKey={detailRefreshKey}
          onClose={()=>setDetailSiswa(null)}
          onAdd={sid=>setFormModal({isOpen:true,data:null,lockSid:sid})}
          onEdit={r=>setFormModal({isOpen:true,data:r})}
          onDelete={r=>setDelModal(r)}
        />
      )}

      {/* Detail Mitra */}
      {detailMitra&&(
        <DetailMitraModal
          mitra={detailMitra} refreshKey={refreshKey}
          onClose={()=>setDetailMitra(null)}
          onDeleted={()=>setRefreshKey(k=>k+1)}
        />
      )}

      {/* Form laporan siswa */}
      {formModal.isOpen&&(
        <FormModal
          init={formModal.data} studentIdLock={formModal.lockSid}
          options={options}
          onClose={()=>setFormModal({isOpen:false,data:null})}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm laporan siswa */}
      {delModal&&(
        <div className="rmbk" onClick={e=>e.target===e.currentTarget&&setDelModal(null)}>
          <div className="rm" style={{maxWidth:400,textAlign:"center",padding:"32px 24px"}}>
            <div style={{width:56,height:56,borderRadius:18,background:"rgba(220,38,38,0.1)",color:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <AlertTriangle size={28}/>
            </div>
            <h3 style={{fontSize:17,fontWeight:800,color:"#1e293b",marginBottom:8}}>Hapus Laporan?</h3>
            <p style={{fontSize:13,color:"#64748b",marginBottom:24}}>
              Laporan tanggal <b>{formatDate(delModal.date)}</b> akan dihapus permanen.
            </p>
            <div style={{display:"flex",gap:10}}>
              <button className="rbtn-cncl" style={{flex:1}} onClick={()=>setDelModal(null)}>Batal</button>
              <button className="rbtn-sv"
                style={{flex:1,background:"#dc2626",boxShadow:"0 4px 14px rgba(220,38,38,0.25)",justifyContent:"center"}}
                onClick={handleDelete} disabled={delBusy}>
                {delBusy?<Loader2 size={16} className="animate-spin"/>:<Trash2 size={16}/>}
                {delBusy?"Menghapus...":"Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}