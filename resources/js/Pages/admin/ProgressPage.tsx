import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, Users, FileText,
  Calendar, ChevronDown, Check, Eye,
  BookOpen, AlertTriangle, GraduationCap
} from "lucide-react";
import axios from "axios";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Attendance  = "hadir" | "izin" | "sakit" | "alpha";
type ReportType  = "hafalan" | "tilawah" | "yanbua" | null;
type Quality     = "sangat_lancar" | "lancar" | "mengulang" | null;

interface ProgressReport {
  id: string;
  student_id: string;
  student_name?: string;
  program?: string;
  teacher_id: string;
  teacher_name?: string;
  date: string;
  attendance: Attendance;
  report_type: ReportType;
  kualitas: Quality;
  hafalan_target: string | null;
  hafalan_achievement: string | null;
  teacher_notes: string | null;
}

interface StudentProgress {
  id: string;
  nama: string;
  program: string;
  program_id?: string;
  lastReport?: ProgressReport;
}

interface Meta { total: number; page: number; per_page: number; last_page: number; }
interface Option { id: string; label: string; }
interface Options { students: Option[]; teachers: Option[]; programs: Option[]; }

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
.prg { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }
.prg-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.prg-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.prg-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }
.prg-tabs {
  display:flex; gap:8px; background: rgba(255,255,255,0.45);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.8); border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03); padding: 6px; width: fit-content;
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
  background: rgba(255,255,255,0.55); backdrop-filter: saturate(200%) blur(32px); -webkit-backdrop-filter: saturate(200%) blur(32px);
  border-radius: 28px; border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1); 
  /* PERBAIKAN 1: overflow diubah menjadi visible agar dropdown tidak terpotong */
  overflow: visible; 
}
.prg-bar { 
  display:flex; gap:12px; flex-wrap:wrap; align-items:center; padding:20px 24px; border-bottom:1px solid rgba(0,0,0,0.05); background:rgba(255,255,255,0.4); 
  /* PERBAIKAN 2: tambahkan radius atas agar tidak keluar dari prg-card */
  border-radius: 28px 28px 0 0;
}
.pg-bar { 
  display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-top:1px solid rgba(0,0,0,0.04); background:rgba(255,255,255,0.3); 
  /* PERBAIKAN 3: tambahkan radius bawah */
  border-radius: 0 0 28px 28px;
}

.prg-search {
  display:flex; align-items:center; gap:10px; flex:1; min-width:220px; max-width:340px; height:44px; padding:0 16px;
  background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.9); border-radius:14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9); transition:all 0.3s;
}
.prg-search:focus-within { background:#fff; border-color:#0ea5e9; box-shadow:0 8px 24px rgba(14,165,233,0.08); transform:translateY(-1px); }

/* PERBAIKAN 4: Reset style input search dengan !important agar menang dari tailwind forms */
.prg-search input { 
  flex:1; font-size:14px; font-weight:500; color:#1e293b; background:transparent; 
  outline:none !important; border:none !important; box-shadow:none !important; 
}
.prg-search input:focus { outline:none !important; border:none !important; box-shadow:none !important; }
.prg-search input::placeholder { color:#94a3b8; }

.prg-sel-wrap { position:relative; }
.prg-sel {
  display:flex; align-items:center; gap:8px; height:44px; padding:0 16px; min-width:180px;
  background:rgba(255,255,255,0.7); backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,0.9); border-radius:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.02); transition:all 0.3s; cursor:pointer; user-select:none;
}
.prg-sel:hover { background:rgba(255,255,255,0.95); }
.prg-sel--open { background:#fff; border-color:#0ea5e9; box-shadow:0 8px 24px rgba(14,165,233,0.08), 0 0 0 3px rgba(14,165,233,0.1); transform:translateY(-1px); }
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
.s-name  { font-weight:700; color:#1e293b; font-size:14px; }
.s-meta  { font-size:12px; color:#64748b; margin-top:2px; display:flex; align-items:center; gap:4px; }
.acts { display:flex; gap:6px; justify-content:flex-end; }
.act-btn { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05); transition:all 0.2s; cursor:pointer; font-family:inherit; }
.act-e { color:#0ea5e9; } .act-e:hover { background:#0ea5e9; color:#fff; border-color:#0ea5e9; transform:scale(1.05); }
.act-d { color:#dc2626; } .act-d:hover { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.05); }
.act-v { color:#10b981; } .act-v:hover { background:#10b981; color:#fff; border-color:#10b981; transform:scale(1.05); }

/* Modal Styles */
.rmbk { position:fixed; inset:0; z-index:700; background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; animation:rfi .2s ease; overflow:hidden; }
@keyframes rfi { from{opacity:0} to{opacity:1} }
@keyframes rsu { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
.rm { width:100%; max-width:600px; max-height:90vh; display:flex; flex-direction:column; background:rgba(255,255,255,0.97); border:1px solid rgba(255,255,255,1); border-radius:24px; box-shadow:0 24px 64px rgba(0,0,0,0.15); animation:rsu .3s cubic-bezier(0.175,0.885,0.32,1.275); }
.rm-large { max-width:820px; }
.rm-hd { display:flex; align-items:center; justify-content:space-between; padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06); flex-shrink:0; }
.rm-title { font-size:18px; font-weight:800; color:#1e293b; }
.rm-cls { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); color:#64748b; cursor:pointer; border:none; transition:all 0.2s; }
.rm-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; }
.rm-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; }
.rm-ft { display:flex; justify-content:flex-end; gap:10px; padding:16px 28px 24px; border-top:1px solid rgba(0,0,0,0.06); flex-shrink:0; }

.history-list { display:flex; flex-direction:column; gap:16px; }
.hist-item { background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:16px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:12px; }
.hist-hd { display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed rgba(0,0,0,0.06); padding-bottom:10px; }
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
.empty-st { padding:80px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; color:#64748b; font-weight:600; }
.toast { position:fixed; bottom:24px; right:24px; z-index:999; display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:16px; background:rgba(255,255,255,0.97); backdrop-filter:blur(16px); border:1px solid #fff; box-shadow:0 12px 40px rgba(0,0,0,0.1); font-weight:600; font-size:14px; animation:rsu .3s; }
.t-ok { border-left:4px solid #16a34a; } .t-err { border-left:4px solid #dc2626; }
.pg-info { font-size:13px; color:#64748b; font-weight:500; }
.pg-btns { display:flex; gap:6px; }
.pg-btn { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.06); cursor:pointer; color:#475569; transition:all 0.2s; font-family:inherit; }
.pg-btn:hover:not(:disabled) { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
.pg-btn:disabled { opacity:0.4; cursor:not-allowed; }
.err-banner { display:flex; align-items:center; gap:10px; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.15); border-radius:14px; padding:12px 16px; color:#dc2626; font-size:13px; font-weight:600; margin:16px 24px; }
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
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const ATTD_BADGE: Record<string, { lbl: string; cls: string }> = {
  hadir: { lbl: "Hadir", cls: "b-hadir" },
  izin:  { lbl: "Izin",  cls: "b-izin"  },
  sakit: { lbl: "Sakit", cls: "b-sakit" },
  alpha: { lbl: "Alpha", cls: "b-alpha" },
};
const QUAL_LABEL: Record<string, string> = {
  sangat_lancar: "Sangat Lancar",
  lancar:        "Lancar",
  mengulang:     "Mengulang",
};

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <div className={`toast ${type === "ok" ? "t-ok" : "t-err"}`}>
      {type === "ok" ? <CheckCircle2 color="#16a34a" size={18} /> : <AlertCircle color="#dc2626" size={18} />}
      {msg}
    </div>, document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRAM DROPDOWN (reusable)
═══════════════════════════════════════════════════════════ */
function ProgramFilter({
  programs, value, onChange,
}: { programs: Option[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = programs.find(p => p.id === value);
  return (
    <div className="prg-sel-wrap">
      <div className={`prg-sel ${open ? "prg-sel--open" : ""}`} onClick={() => setOpen(!open)}>
        <GraduationCap size={15} color="#64748b" />
        <span className="prg-sel-val">{selected ? selected.label : "Semua Program"}</span>
        <ChevronDown size={16} color="#64748b" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "0.2s" }} />
      </div>
      {open && (
        <>
          <div className="prg-sel-overlay" onClick={() => setOpen(false)} />
          <div className="prg-sel-menu">
            <div className={`prg-sel-item ${value === "" ? "active" : ""}`} onClick={() => { onChange(""); setOpen(false); }}>
              <span>Semua Program</span>{value === "" && <Check size={16} />}
            </div>
            {programs.map(p => (
              <div key={p.id} className={`prg-sel-item ${value === p.id ? "active" : ""}`}
                onClick={() => { onChange(p.id); setOpen(false); }}>
                <span>{p.label}</span>{value === p.id && <Check size={16} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — DATA SISWA
═══════════════════════════════════════════════════════════ */
function TabSiswa({
  onOpenDetail, programs,
}: { onOpenDetail: (s: StudentProgress) => void; programs: Option[] }) {
  const [data,      setData]      = useState<StudentProgress[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [programId, setProgramId] = useState("");
  const dSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (dSearch)    params.set("search",     dSearch);
    if (programId)  params.set("program_id", programId);

    axios.get<StudentProgress[]>(`/api/admin/progress/students?${params}`)
      .then(res => setData(res.data))
      .catch(() => setError("Gagal memuat data siswa."))
      .finally(() => setLoading(false));
  }, [dSearch, programId]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="prg-bar">
        <div className="prg-search">
          <Search size={16} color="#64748b" />
          {/* KELAS TAMBAHAN DI INPUT AGAR FOCUS BIRUNYA HILANG */}
          <input className="border-0 focus:ring-0 outline-none flex-1" placeholder="Cari nama siswa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <ProgramFilter programs={programs} value={programId} onChange={setProgramId} />
      </div>

      {error && <div className="err-banner"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="empty-st"><Loader2 className="animate-spin" size={32} color="#0ea5e9" /></div>
      ) : data.length === 0 ? (
        <div className="empty-st"><Users size={48} style={{ opacity: 0.4 }} />Tidak ada siswa ditemukan.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Laporan Terakhir</th>
                <th>Kehadiran</th>
                <th>Tipe & Kualitas</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => {
                const r = s.lastReport;
                return (
                  <tr key={s.id} className="clickable" onClick={() => onOpenDetail(s)}>
                    <td>
                      <div className="s-name">{s.nama}</div>
                      <div className="s-meta">
                        <span className="badge b-prog" style={{ padding: "2px 6px", fontSize: 10 }}>{s.program}</span>
                      </div>
                    </td>
                    <td>
                      {r ? (
                        <div className="s-meta" style={{ color: "#1e293b", fontWeight: 600 }}>
                          <Calendar size={13} /> {formatDate(r.date)}
                        </div>
                      ) : <span style={{ color: "#94a3b8", fontSize: 13 }}>Belum ada</span>}
                    </td>
                    <td>
                      {r ? <span className={`badge ${ATTD_BADGE[r.attendance].cls}`}>{ATTD_BADGE[r.attendance].lbl}</span> : "—"}
                    </td>
                    <td>
                      {r?.report_type ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <span className="badge b-type">{r.report_type.toUpperCase()}</span>
                          {r.kualitas && <span className="badge b-qual">{QUAL_LABEL[r.kualitas]}</span>}
                        </div>
                      ) : "—"}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="acts">
                        <button className="act-btn act-v" title="Lihat Riwayat" onClick={() => onOpenDetail(s)}>
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — SEMUA LAPORAN (GLOBAL)
═══════════════════════════════════════════════════════════ */
function TabLaporan({
  programs, onEdit, onDelete, onAdd, refreshKey,
}: {
  programs: Option[];
  onEdit: (r: ProgressReport) => void;
  onDelete: (r: ProgressReport) => void;
  onAdd: () => void;
  refreshKey: number;
}) {
  const [data,      setData]      = useState<ProgressReport[]>([]);
  const [meta,      setMeta]      = useState<Meta>({ total: 0, page: 1, per_page: 20, last_page: 1 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [programId, setProgramId] = useState("");
  const [page,      setPage]      = useState(1);
  const dSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (dSearch)   params.set("search",     dSearch);
    if (programId) params.set("program_id", programId);
    params.set("page",     String(page));
    params.set("per_page", "20");

    axios.get<{ data: ProgressReport[]; meta: Meta }>(`/api/admin/progress/reports?${params}`)
      .then(res => { setData(res.data.data); setMeta(res.data.meta); })
      .catch(() => setError("Gagal memuat data laporan."))
      .finally(() => setLoading(false));
  }, [dSearch, programId, page, refreshKey]);

  useEffect(() => { load(); }, [load]);

  // Reset page kalau filter berubah
  useEffect(() => { setPage(1); }, [dSearch, programId]);

  return (
    <>
      <div className="prg-bar">
        <div className="prg-search">
          <Search size={16} color="#64748b" />
          {/* KELAS TAMBAHAN DI INPUT AGAR FOCUS BIRUNYA HILANG */}
          <input className="border-0 focus:ring-0 outline-none flex-1" placeholder="Cari nama siswa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <ProgramFilter programs={programs} value={programId} onChange={setProgramId} />
        <button className="prg-btn-add" onClick={onAdd}><Plus size={16} /> Buat Laporan</button>
      </div>

      {error && <div className="err-banner"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="empty-st"><Loader2 className="animate-spin" size={32} color="#0ea5e9" /></div>
      ) : data.length === 0 ? (
        <div className="empty-st"><FileText size={48} style={{ opacity: 0.4 }} />Tidak ada laporan ditemukan.</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Siswa & Guru</th>
                  <th>Kehadiran</th>
                  <th>Capaian</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{formatDate(r.date)}</td>
                    <td>
                      <div className="s-name">{r.student_name ?? "—"}</div>
                      <div className="s-meta">
                        <Users size={12} /> {r.teacher_name ?? "—"}
                        {r.program && <span className="badge b-prog" style={{ padding: "2px 6px", fontSize: 10, marginLeft: 4 }}>{r.program}</span>}
                      </div>
                    </td>
                    <td><span className={`badge ${ATTD_BADGE[r.attendance].cls}`}>{ATTD_BADGE[r.attendance].lbl}</span></td>
                    <td>
                      {r.report_type ? (
                        <div>
                          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span className="badge b-type">{r.report_type.toUpperCase()}</span>
                            {r.kualitas && <span className="badge b-qual">{QUAL_LABEL[r.kualitas]}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "#475569" }}>
                            T: {r.hafalan_target ?? "—"} | C: {r.hafalan_achievement ?? "—"}
                          </div>
                        </div>
                      ) : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
                    </td>
                    <td>
                      <div className="acts">
                        <button className="act-btn act-e" title="Edit" onClick={() => onEdit(r)}><Pencil size={15} /></button>
                        <button className="act-btn act-d" title="Hapus" onClick={() => onDelete(r)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pg-bar">
            <span className="pg-info">
              Menampilkan {((meta.page - 1) * meta.per_page) + 1}–{Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} laporan
            </span>
            <div className="pg-btns">
              <button className="pg-btn" disabled={meta.page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="pg-btn" disabled={meta.page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETAIL — RIWAYAT SISWA
═══════════════════════════════════════════════════════════ */
function DetailModal({
  student, onClose, onEdit, onDelete, onAdd, refreshKey,
}: {
  student: StudentProgress;
  onClose: () => void;
  onEdit: (r: ProgressReport) => void;
  onDelete: (r: ProgressReport) => void;
  onAdd: (sid: string) => void;
  refreshKey: number;
}) {
  const [history, setHistory] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get<ProgressReport[]>(`/api/admin/progress/students/${student.id}/reports`)
      .then(res => setHistory(res.data))
      .catch(() => setError("Gagal memuat riwayat."))
      .finally(() => setLoading(false));
  }, [student.id, refreshKey]);

  useEffect(() => { load(); }, [load]);

  return createPortal(
    <div className="rmbk" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rm rm-large">
        <div className="rm-hd">
          <div>
            <div className="rm-title">Riwayat Progress Siswa</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={14} /> {student.nama} · {student.program}
            </div>
          </div>
          <button className="rm-cls" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="rm-body" style={{ background: "rgba(241,245,249,0.5)" }}>
          <button className="prg-btn-add" style={{ width: "100%", justifyContent: "center" }} onClick={() => onAdd(student.id)}>
            <Plus size={16} /> Catat Laporan untuk {student.nama}
          </button>

          {error && <div className="err-banner"><AlertTriangle size={16} />{error}</div>}

          {loading ? (
            <div className="empty-st"><Loader2 className="animate-spin" /></div>
          ) : history.length === 0 ? (
            <div className="empty-st">Belum ada riwayat laporan.</div>
          ) : (
            <div className="history-list">
              {history.map(h => (
                <div key={h.id} className="hist-item">
                  <div className="hist-hd">
                    <div className="hist-date"><Calendar size={15} color="#0ea5e9" />{formatDate(h.date)}</div>
                    <div className="acts">
                      <button className="act-btn act-e" onClick={() => onEdit(h)}><Pencil size={14} /></button>
                      <button className="act-btn act-d" onClick={() => onDelete(h)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="hist-grid">
                    <div>
                      <div className="hist-lbl">Kehadiran & Guru</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${ATTD_BADGE[h.attendance].cls}`}>{ATTD_BADGE[h.attendance].lbl}</span>
                        <span style={{ fontSize: 13, color: "#64748b" }}>Oleh: {h.teacher_name ?? "—"}</span>
                      </div>
                    </div>
                    {h.report_type && (
                      <div>
                        <div className="hist-lbl">Tipe & Kualitas</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span className="badge b-type">{h.report_type.toUpperCase()}</span>
                          {h.kualitas && <span className="badge b-qual">{QUAL_LABEL[h.kualitas]}</span>}
                        </div>
                      </div>
                    )}
                    {h.report_type && (
                      <div style={{ gridColumn: "span 2", display: "flex", gap: 16, marginTop: 8 }}>
                        <div style={{ flex: 1 }}><div className="hist-lbl">Target</div><div className="hist-val">{h.hafalan_target ?? "—"}</div></div>
                        <div style={{ flex: 1 }}><div className="hist-lbl">Pencapaian</div><div className="hist-val">{h.hafalan_achievement ?? "—"}</div></div>
                      </div>
                    )}
                  </div>
                  {h.teacher_notes && <div className="hist-notes">{h.teacher_notes}</div>}
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
   MODAL FORM — CREATE / EDIT
═══════════════════════════════════════════════════════════ */
function FormModal({
  init, studentIdLock, options, onClose, onSaved,
}: {
  init: ProgressReport | null;
  studentIdLock?: string;
  options: Options;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState<Partial<ProgressReport>>(
    init ?? {
      student_id: studentIdLock ?? "",
      teacher_id: "",
      date: new Date().toISOString().split("T")[0],
      attendance: "hadir",
      report_type: "hafalan",
      kualitas: "lancar",
      hafalan_target: "",
      hafalan_achievement: "",
      teacher_notes: "",
    }
  );
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upd = (k: keyof ProgressReport) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  const isAbsent = ["izin", "sakit", "alpha"].includes(f.attendance ?? "");

  const submit = async () => {
    if (!f.student_id) { setError("Pilih siswa terlebih dahulu."); return; }

    setBusy(true);
    setError(null);

    const payload = {
      student_id:          f.student_id,
      teacher_id:          f.teacher_id || null,
      date:                f.date,
      attendance:          f.attendance,
      report_type:         isAbsent ? null : f.report_type,
      kualitas:            isAbsent ? null : f.kualitas,
      hafalan_target:      isAbsent ? null : (f.hafalan_target  || null),
      hafalan_achievement: isAbsent ? null : (f.hafalan_achievement || null),
      teacher_notes:       f.teacher_notes || null,
    };

    try {
      if (init?.id) {
        await axios.put(`/api/admin/progress/reports/${init.id}`, payload);
      } else {
        await axios.post("/api/admin/progress/reports", payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Gagal menyimpan laporan.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="rmbk" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rm">
        <div className="rm-hd">
          <span className="rm-title">{init ? "Edit Laporan" : "Buat Laporan Baru"}</span>
          <button className="rm-cls" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="rm-body">

          {error && <div className="err-banner"><AlertTriangle size={16} />{error}</div>}

          {/* Pilih Siswa — hanya jika bukan dari detail panel */}
          {!studentIdLock && !init && (
            <div className="rfg">
              <label className="rfl">Pilih Siswa</label>
              <div className="sel-wrap">
                <select className="rsel" value={f.student_id} onChange={upd("student_id")}>
                  <option value="">-- Pilih Siswa --</option>
                  {options.students.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <ChevronDown className="sel-ico" size={16} />
              </div>
            </div>
          )}

          {/* Pilih Guru */}
          <div className="rfg">
            <label className="rfl">Guru (Opsional)</label>
            <div className="sel-wrap">
              <select className="rsel" value={f.teacher_id ?? ""} onChange={upd("teacher_id")}>
                <option value="">-- Tanpa Guru / Admin --</option>
                {options.teachers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <ChevronDown className="sel-ico" size={16} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="rfg">
              <label className="rfl">Tanggal</label>
              <input type="date" className="rfi" value={f.date} onChange={upd("date")} />
            </div>
            <div className="rfg">
              <label className="rfl">Kehadiran</label>
              <div className="sel-wrap">
                <select className="rsel" value={f.attendance} onChange={upd("attendance")}>
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>
                <ChevronDown className="sel-ico" size={16} />
              </div>
            </div>
          </div>

          {!isAbsent && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="rfg">
                  <label className="rfl">Tipe Laporan</label>
                  <div className="sel-wrap">
                    <select className="rsel" value={f.report_type ?? ""} onChange={upd("report_type")}>
                      <option value="hafalan">Hafalan</option>
                      <option value="tilawah">Tilawah</option>
                      <option value="yanbua">Yanbu'a</option>
                    </select>
                    <ChevronDown className="sel-ico" size={16} />
                  </div>
                </div>
                <div className="rfg">
                  <label className="rfl">Kualitas</label>
                  <div className="sel-wrap">
                    <select className="rsel" value={f.kualitas ?? ""} onChange={upd("kualitas")}>
                      <option value="sangat_lancar">Sangat Lancar</option>
                      <option value="lancar">Lancar</option>
                      <option value="mengulang">Mengulang</option>
                    </select>
                    <ChevronDown className="sel-ico" size={16} />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="rfg">
                  <label className="rfl">Target</label>
                  <input className="rfi" placeholder="Misal: Al-Mulk 1-15" value={f.hafalan_target ?? ""} onChange={upd("hafalan_target")} />
                </div>
                <div className="rfg">
                  <label className="rfl">Pencapaian</label>
                  <input className="rfi" placeholder="Misal: Al-Mulk 1-10" value={f.hafalan_achievement ?? ""} onChange={upd("hafalan_achievement")} />
                </div>
              </div>
            </>
          )}

          <div className="rfg">
            <label className="rfl">Catatan Admin / Guru</label>
            <textarea className="rta" rows={3} placeholder="Tambahkan catatan..." value={f.teacher_notes ?? ""} onChange={upd("teacher_notes")} />
          </div>

        </div>
        <div className="rm-ft">
          <button className="rbtn-cncl" onClick={onClose}>Batal</button>
          <button className="rbtn-sv" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {busy ? "Menyimpan..." : "Simpan Laporan"}
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
  const [tab, setTab] = useState<"siswa" | "laporan">("siswa");

  const [options,   setOptions]   = useState<Options>({ students: [], teachers: [], programs: [] });
  const [detailStd, setDetailStd] = useState<StudentProgress | null>(null);
  const [formModal, setFormModal] = useState<{ isOpen: boolean; data: ProgressReport | null; lockSid?: string }>({ isOpen: false, data: null });
  const [delModal,  setDelModal]  = useState<ProgressReport | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // refreshKey: di-increment setelah save/delete agar Tab2 & DetailModal reload
  const [refreshKey,       setRefreshKey]       = useState(0);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [delBusy,          setDelBusy]          = useState(false);

  // Load options (siswa, guru, program) sekali saat mount
  useEffect(() => {
    axios.get<Options>("/api/admin/progress/options")
      .then(res => setOptions(res.data))
      .catch(() => {});
  }, []);

  const handleSaved = () => {
    setRefreshKey(k => k + 1);
    setDetailRefreshKey(k => k + 1);
    setToast({ msg: "Laporan berhasil disimpan.", type: "ok" });
  };

  const handleDelete = async () => {
    if (!delModal) return;
    setDelBusy(true);
    try {
      await axios.delete(`/api/admin/progress/reports/${delModal.id}`);
      setDelModal(null);
      setRefreshKey(k => k + 1);
      setDetailRefreshKey(k => k + 1);
      setToast({ msg: "Laporan berhasil dihapus.", type: "ok" });
    } catch {
      setToast({ msg: "Gagal menghapus laporan.", type: "err" });
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="prg">

        {/* Header */}
        <div className="prg-hd">
          <div>
            <div className="prg-ttl">Progress & Laporan Siswa</div>
            <div className="prg-sub">Pantau aktivitas kehadiran dan pencapaian akademik siswa secara menyeluruh</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="prg-tabs">
          <button className={`prg-tab ${tab === "siswa" ? "prg-tab--on" : ""}`} onClick={() => setTab("siswa")}>
            <span className="prg-tab-dot" style={{ background: tab === "siswa" ? "#0ea5e9" : "#94a3b8" }} />
            <Users size={16} /> Data Siswa
          </button>
          <button className={`prg-tab ${tab === "laporan" ? "prg-tab--on" : ""}`} onClick={() => setTab("laporan")}>
            <span className="prg-tab-dot" style={{ background: tab === "laporan" ? "#8b5cf6" : "#94a3b8" }} />
            <FileText size={16} /> Semua Laporan
          </button>
        </div>

        {/* Content */}
        <div className="prg-card">
          {tab === "siswa" && (
            <TabSiswa
              programs={options.programs}
              onOpenDetail={setDetailStd}
            />
          )}
          {tab === "laporan" && (
            <TabLaporan
              programs={options.programs}
              refreshKey={refreshKey}
              onAdd={() => setFormModal({ isOpen: true, data: null })}
              onEdit={r => setFormModal({ isOpen: true, data: r })}
              onDelete={r => setDelModal(r)}
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailStd && (
        <DetailModal
          student={detailStd}
          refreshKey={detailRefreshKey}
          onClose={() => setDetailStd(null)}
          onAdd={sid => setFormModal({ isOpen: true, data: null, lockSid: sid })}
          onEdit={r => setFormModal({ isOpen: true, data: r })}
          onDelete={r => setDelModal(r)}
        />
      )}

      {/* Form Modal */}
      {formModal.isOpen && (
        <FormModal
          init={formModal.data}
          studentIdLock={formModal.lockSid}
          options={options}
          onClose={() => setFormModal({ isOpen: false, data: null })}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {delModal && (
        <div className="rmbk" onClick={e => e.target === e.currentTarget && setDelModal(null)}>
          <div className="rm" style={{ maxWidth: 400, textAlign: "center", padding: "32px 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(220,38,38,0.1)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={32} />
              </div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Hapus Laporan?</h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              Laporan tanggal <b>{formatDate(delModal.date)}</b> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="rbtn-cncl" style={{ flex: 1 }} onClick={() => setDelModal(null)}>Batal</button>
              <button
                className="rbtn-sv"
                style={{ flex: 1, background: "#dc2626", boxShadow: "0 4px 14px rgba(220,38,38,0.25)", justifyContent: "center" }}
                onClick={handleDelete}
                disabled={delBusy}
              >
                {delBusy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {delBusy ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}