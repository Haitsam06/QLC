import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Filter,
    ChevronDown,
    Users,
    FileText,
    ExternalLink,
    Clock,
    CheckCheck,
    XCircle,
    Check,
    Handshake,
    Upload,
    Download,
    File,
    FileBadge,
    AlertTriangle,
} from 'lucide-react';
import axios from 'axios';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Attendance = 'hadir' | 'izin' | 'sakit' | 'alpha';
type ReportType = 'hafalan' | 'tilawah' | 'yanbua' | null;
type Quality = 'sangat_lancar' | 'lancar' | 'mengulang' | null;

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
interface MitraItem {
    id: string;
    institution_name: string;
    contact_person: string;
    status: string;
    report_count: number;
}
interface MitraReport {
    id: string;
    partner_id: string;
    title: string;
    date: string;
    description: string | null;
    file_url: string | null;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    created_at: string | null;
}
interface Meta {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
}
interface Option {
    id: string;
    label: string;
}
interface Options {
    students: Option[];
    teachers: Option[];
    programs: Option[];
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function useDebounce<T>(val: T, ms = 400): T {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}
const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB');

const ATTD_BADGE: Record<string, { lbl: string; cls: string }> = {
    hadir: { lbl: 'Hadir', cls: 'bg-green-50 text-green-700 border-green-200' },
    izin: { lbl: 'Izin', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    sakit: { lbl: 'Sakit', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
    alpha: { lbl: 'Alpha', cls: 'bg-red-50 text-red-700 border-red-200' },
};
const QUAL_LABEL: Record<string, string> = {
    sangat_lancar: 'Sangat Lancar',
    lancar: 'Lancar',
    mengulang: 'Mengulang',
};

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return createPortal(
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${type === 'ok' ? 'bg-teal-700' : 'bg-red-600'}`}
        >
            {type === 'ok' ? <CheckCircle2 color="#fff" size={18} /> : <AlertCircle color="#fff" size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   PROGRAM FILTER DROPDOWN (reusable)
═══════════════════════════════════════════════════════════ */
function ProgramFilter({ programs, value, onChange }: { programs: Option[]; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const sel = programs.find((p) => p.id === value);
    return (
        <div className="relative w-full sm:w-auto">
            <div
                className={`flex items-center gap-2 h-11 px-4 min-w-[180px] bg-white border rounded-xl cursor-pointer select-none transition-all hover:bg-slate-50 ${open ? 'ring-2 ring-sky-500/15 border-sky-500' : 'border-slate-300'}`}
                onClick={() => setOpen(!open)}
            >
                <GraduationCap size={15} className="text-slate-400 shrink-0" />
                <span className="flex-1 text-[13.5px] font-bold text-slate-700 truncate">{sel ? sel.label : 'Semua Program'}</span>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            {open && (
                <>
                    <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
                    <div className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white border border-slate-200 rounded-[16px] shadow-xl p-2 flex flex-col gap-1 z-[100] animate-[fadeIn_0.15s_ease-out]">
                        <div
                            className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${value === '' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'}`}
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                        >
                            <span>Semua Program</span>
                            {value === '' && <Check size={16} />}
                        </div>
                        {programs.map((p) => (
                            <div
                                key={p.id}
                                className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${value === p.id ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'}`}
                                onClick={() => {
                                    onChange(p.id);
                                    setOpen(false);
                                }}
                            >
                                <span>{p.label}</span>
                                {value === p.id && <Check size={16} />}
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
function TabSiswa({ programs, onOpenDetail }: { programs: Option[]; onOpenDetail: (s: StudentProgress) => void }) {
    const [data, setData] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [programId, setProgramId] = useState('');
    const dSearch = useDebounce(search);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        const p = new URLSearchParams();
        if (dSearch) p.set('search', dSearch);
        if (programId) p.set('program_id', programId);
        axios
            .get<StudentProgress[]>(`/api/admin/progress/students?${p}`)
            .then((r) => setData(r.data))
            .catch(() => setError('Gagal memuat data siswa.'))
            .finally(() => setLoading(false));
    }, [dSearch, programId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <>
            <div className="flex gap-3 flex-wrap items-center p-5 lg:px-6 border-b border-slate-100 bg-slate-50/50 flex-col sm:flex-row">
                <div className="flex items-center gap-2.5 flex-1 min-w-[220px] w-full sm:w-auto h-11 px-4 bg-white border border-slate-300 rounded-xl transition-all focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:border-sky-500 focus-within:shadow-sm">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        placeholder="Cari nama siswa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 text-[13.5px] font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="text-slate-400 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors focus:outline-none"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <ProgramFilter programs={programs} value={programId} onChange={setProgramId} />
            </div>

            {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold mx-6 my-4">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center w-full">
                    <Loader2 size={32} className="animate-spin text-sky-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="py-20 px-5 text-center flex flex-col items-center gap-3 w-full text-slate-500 font-semibold text-[14px]">
                    <Users size={48} className="text-slate-300 mb-2" />
                    Tidak ada siswa ditemukan.
                </div>
            ) : (
                <div className="overflow-x-auto w-full relative z-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Siswa</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Laporan Terakhir</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Kehadiran</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">Tipe & Kualitas</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((s) => {
                                const r = s.lastReport;
                                return (
                                    <tr key={s.id} className="transition-colors hover:bg-slate-50 group border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => onOpenDetail(s)}>
                                        <td className="px-6 py-4">
                                            <div className="text-[14px] font-bold text-slate-900 tracking-tight">{s.nama}</div>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700">
                                                    {s.program}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {r ? (
                                                <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                                                    <Calendar size={13} className="text-slate-400" />
                                                    {formatDate(r.date)}
                                                </div>
                                            ) : (
                                                <span className="text-[13px] text-slate-400 font-medium">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {r ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold border ${ATTD_BADGE[r.attendance].cls}`}>
                                                    {ATTD_BADGE[r.attendance].lbl}
                                                </span>
                                            ) : (
                                                <span className="text-[13px] text-slate-400 font-medium">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {r?.report_type ? (
                                                <div className="flex gap-1.5 flex-wrap">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wider">
                                                        {r.report_type}
                                                    </span>
                                                    {r.kualitas && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold border bg-pink-50 text-pink-700 border-pink-200">
                                                            {QUAL_LABEL[r.kualitas]}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[13px] text-slate-400 font-medium">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-teal-600 shadow-sm transition-colors hover:bg-teal-50 hover:border-teal-200 focus:outline-none"
                                                    onClick={() => onOpenDetail(s)}
                                                    title="Lihat Detail"
                                                >
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
   TAB 2 — DATA MITRA
═══════════════════════════════════════════════════════════ */
function TabMitra({ onOpenDetail }: { onOpenDetail: (m: MitraItem) => void }) {
    const [data, setData] = useState<MitraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const dSearch = useDebounce(search);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        const p = new URLSearchParams();
        if (dSearch) p.set('search', dSearch);
        axios
            .get<MitraItem[]>(`/api/admin/mitra/list?${p}`)
            .then((r) => setData(r.data))
            .catch(() => setError('Gagal memuat data mitra.'))
            .finally(() => setLoading(false));
    }, [dSearch]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <>
            <div className="flex items-center p-5 lg:px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5 flex-1 min-w-[220px] max-w-[400px] h-11 px-4 bg-white border border-slate-300 rounded-xl transition-all focus-within:ring-2 focus-within:ring-amber-500/15 focus-within:border-amber-500 focus-within:shadow-sm">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        placeholder="Cari nama lembaga atau kontak..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 text-[13.5px] font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="text-slate-400 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors focus:outline-none"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold mx-6 my-4">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center w-full">
                    <Loader2 size={32} className="animate-spin text-amber-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="py-20 px-5 text-center flex flex-col items-center gap-3 w-full text-slate-500 font-semibold text-[14px]">
                    <Handshake size={48} className="text-slate-300 mb-2" />
                    Tidak ada mitra ditemukan.
                </div>
            ) : (
                <div className="overflow-x-auto w-full relative z-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Lembaga</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Kontak</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden sm:table-cell">Status</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Laporan</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((m) => (
                                <tr key={m.id} className="transition-colors hover:bg-slate-50 group border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => onOpenDetail(m)}>
                                    <td className="px-6 py-4">
                                        <div className="text-[14px] font-bold text-slate-900 tracking-tight truncate max-w-[200px]">{m.institution_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-medium text-slate-600 truncate max-w-[150px]">{m.contact_person}</div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11.5px] font-bold whitespace-nowrap border ${m.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}`} />
                                            {m.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[14px] font-black text-slate-900">{m.report_count}</span>
                                            <span className="text-[12px] font-medium text-slate-500">laporan</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-teal-600 shadow-sm transition-colors hover:bg-teal-50 hover:border-teal-200 focus:outline-none"
                                                onClick={() => onOpenDetail(m)}
                                                title="Lihat Detail"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETAIL SISWA
═══════════════════════════════════════════════════════════ */
function DetailSiswaModal({
    student,
    onClose,
    onAdd,
    onEdit,
    onDelete,
    refreshKey,
}: {
    student: StudentProgress;
    onClose: () => void;
    onAdd: (sid: string) => void;
    onEdit: (r: ProgressReport) => void;
    onDelete: (r: ProgressReport) => void;
    refreshKey: number;
}) {
    const [history, setHistory] = useState<ProgressReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios
            .get<ProgressReport[]>(`/api/admin/progress/students/${student.id}/reports`)
            .then((r) => setHistory(r.data))
            .catch(() => setError('Gagal memuat riwayat.'))
            .finally(() => setLoading(false));
    }, [student.id, refreshKey]);

    return createPortal(
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[820px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white rounded-t-[24px] shrink-0">
                    <div>
                        <h3 className="text-[18px] font-extrabold text-slate-900 leading-tight">Riwayat Progress — {student.nama}</h3>
                        <p className="text-[13px] font-medium text-slate-500 mt-1">{student.program}</p>
                    </div>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5 bg-slate-50/50">
                    <button
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-sky-500 text-white text-[14px] font-bold shadow-md shadow-sky-500/20 transition-all hover:bg-sky-600 hover:-translate-y-px focus:outline-none"
                        onClick={() => onAdd(student.id)}
                    >
                        <Plus size={16} /> Catat Laporan Baru
                    </button>

                    {error && (
                        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold">
                            <AlertTriangle size={18} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 flex justify-center w-full">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 font-semibold text-[14px]">Belum ada riwayat laporan.</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {history.map((h) => (
                                <div key={h.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5 transition-colors hover:border-slate-300">
                                    <div className="flex justify-between items-center">
                                        <div className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                            <Calendar size={16} className="text-sky-500" />
                                            {formatDate(h.date)}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 text-sky-600 transition-colors hover:bg-sky-50 hover:border-sky-200 focus:outline-none"
                                                onClick={() => onEdit(h)}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 text-red-600 transition-colors hover:bg-red-50 hover:border-red-200 focus:outline-none"
                                                onClick={() => onDelete(h)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap items-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold border ${ATTD_BADGE[h.attendance].cls}`}>
                                            {ATTD_BADGE[h.attendance].lbl}
                                        </span>
                                        {h.report_type && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wider">
                                                {h.report_type}
                                            </span>
                                        )}
                                        {h.kualitas && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold border bg-pink-50 text-pink-700 border-pink-200">
                                                {QUAL_LABEL[h.kualitas]}
                                            </span>
                                        )}
                                        <span className="text-[12px] font-medium text-slate-500 ml-auto">
                                            Oleh: <span className="font-bold text-slate-700">{h.teacher_name || '—'}</span>
                                        </span>
                                    </div>

                                    {h.report_type && (
                                        <div className="grid grid-cols-2 gap-4 mt-1">
                                            <div>
                                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Target</div>
                                                <div className="text-[13.5px] font-bold text-slate-900">{h.hafalan_target || '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Pencapaian</div>
                                                <div className="text-[13.5px] font-bold text-slate-900">{h.hafalan_achievement || '—'}</div>
                                            </div>
                                        </div>
                                    )}
                                    {h.teacher_notes && (
                                        <div className="bg-slate-50 p-3.5 rounded-xl text-[13px] text-slate-600 font-medium italic border border-slate-100 border-l-4 border-l-sky-500 leading-relaxed">
                                            {h.teacher_notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETAIL MITRA — riwayat laporan + upload
═══════════════════════════════════════════════════════════ */
function DetailMitraModal({ mitra, onClose, refreshKey, onDeleted }: { mitra: MitraItem; onClose: () => void; refreshKey: number; onDeleted: (id: string) => void }) {
    const [reports, setReports] = useState<MitraReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [delId, setDelId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    const load = () => {
        setLoading(true);
        setError(null);
        axios
            .get<MitraReport[]>(`/api/admin/mitra/${mitra.id}/reports`)
            .then((r) => setReports(r.data))
            .catch(() => setError('Gagal memuat laporan.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        load();
    }, [mitra.id, refreshKey]);

    const handleUploaded = (r: MitraReport) => {
        setReports((prev) => [r, ...prev]);
        setShowUpload(false);
        setToast({ msg: 'Laporan berhasil diupload.', type: 'ok' });
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/mitra/reports/${id}`);
            setReports((prev) => prev.filter((r) => r.id !== id));
            setDelId(null);
            onDeleted(id);
            setToast({ msg: 'Laporan berhasil dihapus.', type: 'ok' });
        } catch {
            setToast({ msg: 'Gagal menghapus laporan.', type: 'err' });
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[820px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white rounded-t-[24px] shrink-0">
                    <div>
                        <h3 className="text-[18px] font-extrabold text-slate-900 leading-tight">Laporan Mitra — {mitra.institution_name}</h3>
                        <div className="flex items-center gap-2.5 mt-1.5">
                            <span className="text-[13px] font-bold text-slate-500">{mitra.contact_person}</span>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap border ${mitra.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${mitra.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}`} />
                                {mitra.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5 bg-slate-50/50">
                    <button
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500 text-white text-[14px] font-bold shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:-translate-y-px focus:outline-none"
                        onClick={() => setShowUpload(true)}
                    >
                        <Upload size={16} /> Upload Laporan Baru
                    </button>

                    {error && (
                        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold">
                            <AlertTriangle size={18} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 flex justify-center w-full">
                            <Loader2 className="animate-spin text-amber-500" size={32} />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 font-semibold text-[14px] flex flex-col items-center gap-3">
                            <FileText size={48} className="text-slate-300" />
                            Belum ada laporan diupload.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {reports.map((r) => (
                                <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 transition-colors hover:border-slate-300">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-1">
                                        <div className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                            <Calendar size={16} className="text-amber-500" />
                                            {formatDate(r.date)}
                                        </div>
                                        <button
                                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 text-red-600 transition-colors hover:bg-red-50 hover:border-red-200 focus:outline-none"
                                            onClick={() => setDelId(r.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="text-[14.5px] font-extrabold text-slate-900 mb-1.5">{r.title}</div>
                                        {r.description && <div className="text-[13px] text-slate-600 font-medium mb-4 leading-relaxed">{r.description}</div>}
                                        {r.file_url && (
                                            <a
                                                href={r.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all border ${r.file_type === 'pdf' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'}`}
                                            >
                                                <File size={15} />
                                                {r.file_name || 'Lihat File'}
                                                {r.file_size && <span className="opacity-70 font-semibold text-[11px] ml-1">· {formatBytes(r.file_size)}</span>}
                                                <Download size={14} className="ml-1" />
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
            {showUpload && <UploadMitraModal partnerId={mitra.id} partnerName={mitra.institution_name} onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}

            {/* Delete confirm */}
            {delId && (
                <div
                    className="fixed inset-0 z-[800] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={(e) => e.target === e.currentTarget && setDelId(null)}
                >
                    <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
                        <div className="pt-8 px-7 pb-5 text-center flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                                <Trash2 size={28} />
                            </div>
                            <div className="text-[18px] font-extrabold text-slate-900 mt-1">Hapus Laporan?</div>
                            <div className="text-[13.5px] text-slate-500 leading-relaxed px-2">File akan dihapus permanen dari server.</div>
                        </div>
                        <div className="flex gap-2.5 px-7 pb-7">
                            <button
                                className="flex-1 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                                onClick={() => setDelId(null)}
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-red-600 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:bg-red-700 focus:outline-none"
                                onClick={() => handleDelete(delId)}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   MODAL UPLOAD LAPORAN MITRA
═══════════════════════════════════════════════════════════ */
function UploadMitraModal({ partnerId, partnerName, onClose, onUploaded }: { partnerId: string; partnerName: string; onClose: () => void; onUploaded: (r: MitraReport) => void }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!ok.includes(f.type)) {
            setError('Hanya file PDF atau Word yang diizinkan.');
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB.');
            return;
        }
        setFile(f);
        setError(null);
    };

    const submit = async () => {
        if (!title.trim()) {
            setError('Judul wajib diisi.');
            return;
        }
        if (!file) {
            setError('Pilih file terlebih dahulu.');
            return;
        }
        setBusy(true);
        setError(null);
        const fd = new FormData();
        fd.append('title', title);
        fd.append('date', date);
        fd.append('description', description);
        fd.append('file', file);
        try {
            const r = await axios.post<MitraReport>(`/api/admin/mitra/${partnerId}/reports`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onUploaded(r.data);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengupload laporan.';
            setError(msg);
        } finally {
            setBusy(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[500px] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-[17px] font-extrabold text-slate-900">Upload Laporan</h3>
                        <p className="text-[12px] font-medium text-slate-500 mt-1">{partnerName}</p>
                    </div>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Judul Laporan</label>
                        <input
                            className="w-full h-11 px-4 rounded-xl text-[13px] font-medium bg-slate-50 border border-slate-200 text-slate-900 transition-all outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            placeholder="Misal: Laporan Kerjasama Q1 2026"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tanggal</label>
                        <input
                            type="date"
                            className="w-full h-11 px-4 rounded-xl text-[13px] font-medium bg-slate-50 border border-slate-200 text-slate-900 transition-all outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Deskripsi <span className="font-medium normal-case text-slate-400 ml-1">(opsional)</span>
                        </label>
                        <textarea
                            className="w-full p-4 rounded-xl text-[13px] font-medium bg-slate-50 border border-slate-200 text-slate-900 transition-all outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 min-h-[80px] resize-y"
                            rows={2}
                            placeholder="Ringkasan isi laporan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Upload Zone */}
                    <div className="flex flex-col gap-1.5 mt-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">File Laporan (PDF / Word, maks 10MB)</label>
                        <div
                            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${dragOver ? 'border-amber-500 bg-amber-50' : file ? 'border-green-500 bg-green-50 border-solid' : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-slate-100'}`}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const f = e.dataTransfer.files[0];
                                if (f) handleFile(f);
                            }}
                        >
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileBadge size={36} className="text-green-600" />
                                    <div className="font-bold text-slate-900 text-[13.5px] truncate max-w-xs">{file.name}</div>
                                    <div className="text-[11.5px] text-slate-500 font-medium">{formatBytes(file.size)}</div>
                                    <div className="text-[11.5px] text-green-600 font-bold mt-1">✓ File siap diupload</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload size={32} className="text-slate-400 mb-1" />
                                    <div className="font-bold text-slate-700 text-[13px]">Klik atau drag & drop file di sini</div>
                                    <div className="text-[11.5px] text-slate-500 font-medium">PDF, DOC, DOCX — maksimal 10MB</div>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2.5 px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-[24px]">
                    <button
                        className="px-5 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Batal
                    </button>
                    <button
                        className="px-6 h-11 rounded-xl text-[13px] font-bold text-white bg-amber-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:bg-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={submit}
                        disabled={busy}
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {busy ? 'Mengupload...' : 'Upload Laporan'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM MODAL — LAPORAN SISWA (CREATE/EDIT)
═══════════════════════════════════════════════════════════ */
function FormModal({ init, studentIdLock, options, onClose, onSaved }: { init: ProgressReport | null; studentIdLock?: string; options: Options; onClose: () => void; onSaved: () => void }) {
    const [f, setF] = useState<Partial<ProgressReport>>(
        init ?? {
            student_id: studentIdLock ?? '',
            teacher_id: '',
            date: new Date().toISOString().split('T')[0],
            attendance: 'hadir',
            report_type: 'hafalan',
            kualitas: 'lancar',
            hafalan_target: '',
            hafalan_achievement: '',
            teacher_notes: '',
        }
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const upd = (k: keyof ProgressReport) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
    const isAbsent = ['izin', 'sakit', 'alpha'].includes(f.attendance ?? '');

    const submit = async () => {
        if (!f.student_id) {
            setError('Pilih siswa terlebih dahulu.');
            return;
        }
        setBusy(true);
        setError(null);
        const payload = {
            ...f,
            report_type: isAbsent ? null : f.report_type,
            kualitas: isAbsent ? null : f.kualitas,
            hafalan_target: isAbsent ? null : f.hafalan_target || null,
            hafalan_achievement: isAbsent ? null : f.hafalan_achievement || null,
            teacher_notes: f.teacher_notes || null,
        };
        try {
            if (init?.id) await axios.put(`/api/admin/progress/reports/${init.id}`, payload);
            else await axios.post('/api/admin/progress/reports', payload);
            onSaved();
            onClose();
        } catch (e: unknown) {
            setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan laporan.');
        } finally {
            setBusy(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[540px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-extrabold text-slate-900">{init ? 'Edit Laporan' : 'Buat Laporan Baru'}</span>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {!studentIdLock && !init && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pilih Siswa</label>
                            <div className="relative">
                                <select
                                    className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none appearance-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    value={f.student_id}
                                    onChange={upd('student_id')}
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {options.students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Guru <span className="font-medium normal-case text-slate-400 ml-1">(Opsional)</span>
                        </label>
                        <div className="relative">
                            <select
                                className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none appearance-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                value={f.teacher_id ?? ''}
                                onChange={upd('teacher_id')}
                            >
                                <option value="">-- Tanpa Guru / Admin --</option>
                                {options.teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tanggal</label>
                            <input
                                type="date"
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                value={f.date}
                                onChange={upd('date')}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Kehadiran</label>
                            <div className="relative">
                                <select
                                    className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none appearance-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    value={f.attendance}
                                    onChange={upd('attendance')}
                                >
                                    <option value="hadir">Hadir</option>
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="alpha">Alpha</option>
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {!isAbsent && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tipe Laporan</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none appearance-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                            value={f.report_type ?? ''}
                                            onChange={upd('report_type')}
                                        >
                                            <option value="hafalan">Hafalan</option>
                                            <option value="tilawah">Tilawah</option>
                                            <option value="yanbua">Yanbu'a</option>
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Kualitas</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none appearance-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                            value={f.kualitas ?? ''}
                                            onChange={upd('kualitas')}
                                        >
                                            <option value="sangat_lancar">Sangat Lancar</option>
                                            <option value="lancar">Lancar</option>
                                            <option value="mengulang">Mengulang</option>
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Target</label>
                                    <input
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                        placeholder="Al-Mulk 1-15"
                                        value={f.hafalan_target ?? ''}
                                        onChange={upd('hafalan_target')}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pencapaian</label>
                                    <input
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                        placeholder="Al-Mulk 1-10"
                                        value={f.hafalan_achievement ?? ''}
                                        onChange={upd('hafalan_achievement')}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Catatan <span className="font-medium normal-case text-slate-400 ml-1">(Opsional)</span>
                        </label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 min-h-[90px] resize-y"
                            rows={3}
                            value={f.teacher_notes ?? ''}
                            onChange={upd('teacher_notes')}
                            placeholder="Catatan tambahan..."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2.5 px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-[24px]">
                    <button
                        className="px-5 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Batal
                    </button>
                    <button
                        className="px-6 h-11 rounded-xl text-[13px] font-bold text-white bg-sky-500 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all hover:bg-sky-600 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                        onClick={submit}
                        disabled={busy}
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {busy ? 'Menyimpan...' : 'Simpan Laporan'}
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
export default function ProgressPage() {
    const [tab, setTab] = useState<'siswa' | 'mitra'>('siswa');
    const [options, setOptions] = useState<Options>({ students: [], teachers: [], programs: [] });
    const [detailSiswa, setDetailSiswa] = useState<StudentProgress | null>(null);
    const [detailMitra, setDetailMitra] = useState<MitraItem | null>(null);
    const [formModal, setFormModal] = useState<{ isOpen: boolean; data: ProgressReport | null; lockSid?: string }>({ isOpen: false, data: null });
    const [delModal, setDelModal] = useState<ProgressReport | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [detailRefreshKey, setDetailRefreshKey] = useState(0);
    const [delBusy, setDelBusy] = useState(false);

    useEffect(() => {
        axios
            .get<Options>('/api/admin/progress/options')
            .then((r) => setOptions(r.data))
            .catch(() => {});
    }, []);

    const handleSaved = () => {
        setRefreshKey((k) => k + 1);
        setDetailRefreshKey((k) => k + 1);
        setToast({ msg: 'Laporan berhasil disimpan.', type: 'ok' });
    };
    const handleDelete = async () => {
        if (!delModal) return;
        setDelBusy(true);
        try {
            await axios.delete(`/api/admin/progress/reports/${delModal.id}`);
            setDelModal(null);
            setRefreshKey((k) => k + 1);
            setDetailRefreshKey((k) => k + 1);
            setToast({ msg: 'Laporan berhasil dihapus.', type: 'ok' });
        } catch {
            setToast({ msg: 'Gagal menghapus laporan.', type: 'err' });
        } finally {
            setDelBusy(false);
        }
    };

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(15px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
            <div
                className={`flex flex-col gap-6 w-full text-slate-900 ${formModal.isOpen || delModal || detailSiswa || detailMitra ? 'opacity-60 pointer-events-none select-none transition-opacity duration-200' : ''}`}
            >
                {/* Header */}
                <div className="flex justify-between items-end flex-wrap gap-3">
                    <div>
                        <div className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">Progress & Laporan</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-medium">Pantau pencapaian siswa dan kelola laporan mitra kolaborasi.</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 border border-slate-200 rounded-[16px] p-1.5 w-fit flex-wrap">
                    <button
                        className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[13.5px] font-bold cursor-pointer transition-all border-none focus:outline-none ${tab === 'siswa' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
                        onClick={() => setTab('siswa')}
                    >
                        <span className={`w-2 h-2 rounded-full inline-block ${tab === 'siswa' ? 'bg-sky-500' : 'bg-slate-400'}`} />
                        <Users size={16} /> Data Siswa
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[13.5px] font-bold cursor-pointer transition-all border-none focus:outline-none ${tab === 'mitra' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
                        onClick={() => setTab('mitra')}
                    >
                        <span className={`w-2 h-2 rounded-full inline-block ${tab === 'mitra' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <Handshake size={16} /> Data Mitra
                    </button>
                </div>

                {/* Content Card */}
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {tab === 'siswa' && <TabSiswa programs={options.programs} onOpenDetail={setDetailSiswa} />}
                    {tab === 'mitra' && <TabMitra onOpenDetail={setDetailMitra} />}
                </div>
            </div>

            {/* Detail Siswa */}
            {detailSiswa && (
                <DetailSiswaModal
                    student={detailSiswa}
                    refreshKey={detailRefreshKey}
                    onClose={() => setDetailSiswa(null)}
                    onAdd={(sid) => setFormModal({ isOpen: true, data: null, lockSid: sid })}
                    onEdit={(r) => setFormModal({ isOpen: true, data: r })}
                    onDelete={(r) => setDelModal(r)}
                />
            )}

            {/* Detail Mitra */}
            {detailMitra && <DetailMitraModal mitra={detailMitra} refreshKey={refreshKey} onClose={() => setDetailMitra(null)} onDeleted={() => setRefreshKey((k) => k + 1)} />}

            {/* Form laporan siswa */}
            {formModal.isOpen && (
                <FormModal init={formModal.data} studentIdLock={formModal.lockSid} options={options} onClose={() => setFormModal({ isOpen: false, data: null })} onSaved={handleSaved} />
            )}

            {/* Delete confirm laporan siswa */}
            {delModal && (
                <div
                    className="fixed inset-0 z-[900] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={(e) => e.target === e.currentTarget && setDelModal(null)}
                >
                    <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out] text-center p-7 pt-8">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-[17px] font-extrabold text-slate-900 mb-2">Hapus Laporan?</h3>
                        <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                            Laporan tanggal <b className="text-slate-700">{formatDate(delModal.date)}</b> akan dihapus permanen.
                        </p>
                        <div className="flex gap-2.5">
                            <button
                                className="flex-1 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                                onClick={() => setDelModal(null)}
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-red-600 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:bg-red-700 focus:outline-none disabled:opacity-50"
                                onClick={handleDelete}
                                disabled={delBusy}
                            >
                                {delBusy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {delBusy ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
