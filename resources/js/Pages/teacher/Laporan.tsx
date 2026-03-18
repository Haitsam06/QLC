import { useState, useEffect } from 'react';
import TeacherNavbar from '../../Components/TeacherNavbar';
import {
    Search, Plus, BookOpen,
    X, Save, FileText, User, Calendar,
    CheckCircle2, AlertCircle, ChevronRight,
    Clock, TrendingUp, Award, Eye, ArrowLeft,
    Target, Star, BarChart2, Loader2, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Student {
    id: string;
    nama: string;
    program: string;
    lastReport?: ProgressReport;
}

interface ProgressReport {
    id: string;
    student_id: string;
    teacher_id: string;
    date: string;
    attendance: 'hadir' | 'izin' | 'sakit' | 'alpha';
    report_type: 'hafalan' | 'tilawah' | 'yanbua' | null;
    kualitas: 'sangat_lancar' | 'lancar' | 'mengulang' | null;
    hafalan_target: string | null;
    hafalan_achievement: string | null;
    teacher_notes: string | null;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const attendanceBadge: Record<string, { label: string; color: string }> = {
    hadir: { label: 'Hadir',  color: 'bg-emerald-100 text-emerald-700' },
    izin:  { label: 'Izin',   color: 'bg-blue-100 text-blue-700'       },
    sakit: { label: 'Sakit',  color: 'bg-yellow-100 text-yellow-700'   },
    alpha: { label: 'Alpha',  color: 'bg-red-100 text-red-700'         },
};

const kualitasBadge: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    sangat_lancar: { label: 'Sangat Lancar',  color: 'text-blue-600',    icon: Star         },
    lancar:        { label: 'Lancar',          color: 'text-emerald-600', icon: CheckCircle2 },
    mengulang:     { label: 'Perlu Mengulang', color: 'text-amber-500',  icon: AlertCircle  },
};

const reportTypeLabel: Record<string, string> = {
    hafalan: 'Hafalan',
    tilawah: 'Tilawah',
    yanbua:  "Yanbu'a",
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

/* ═══════════════════════════════════════════════════════════
   BADGE KEHADIRAN
═══════════════════════════════════════════════════════════ */
function AttendanceBadge({ status }: { status: string }) {
    const b = attendanceBadge[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${b.color}`}>
            {b.label}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFIKASI
═══════════════════════════════════════════════════════════ */
function Toast({
    message, type, onClose,
}: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold
            ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
            {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL PANEL — slide-in dari kanan
═══════════════════════════════════════════════════════════ */
function DetailPanel({
    student, onClose, onAddReport,
}: {
    student: Student;
    onClose: () => void;
    onAddReport: () => void;
}) {
    const [reports, setReports] = useState<ProgressReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const loadReports = () => {
        setLoading(true);
        setError(null);
        axios.get<ProgressReport[]>(`/api/teacher/students/${student.id}/reports`)
            .then(res => setReports(res.data))
            .catch(() => setError('Gagal memuat riwayat. Coba lagi.'))
            .finally(() => setLoading(false));
    };

    // Lazy load saat panel dibuka
    useEffect(() => { loadReports(); }, [student.id]);

    // Expose refresh ke parent (dipakai setelah simpan report baru)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (DetailPanel as any)._refresh = loadReports;

    const totalHadir  = reports.filter(r => r.attendance === 'hadir').length;
    const totalSangat = reports.filter(r => r.kualitas   === 'sangat_lancar').length;

    return (
        <div className="fixed inset-0 z-[90] flex justify-end">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in">

                {/* ── Header ── */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 truncate">{student.nama}</h2>
                        <p className="text-[11px] text-gray-500 font-medium">{student.program}</p>
                    </div>
                    <button
                        onClick={onAddReport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shrink-0"
                    >
                        <Plus size={13} /> Input
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50">
                    {[
                        { val: reports.length, label: 'Total Setoran', cls: 'text-gray-900'    },
                        { val: totalHadir,     label: 'Hadir',         cls: 'text-emerald-600' },
                        { val: totalSangat,    label: 'Sangat Lancar', cls: 'text-blue-600'    },
                    ].map(({ val, label, cls }) => (
                        <div key={label} className="flex flex-col items-center py-3">
                            <span className={`text-lg font-extrabold ${cls}`}>{val}</span>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">{label}</span>
                        </div>
                    ))}
                </div>

                {/* ── List ── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                            <Loader2 size={28} className="animate-spin" />
                            <p className="text-xs font-medium">Memuat riwayat...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center h-40 text-red-400 gap-2">
                            <AlertTriangle size={28} />
                            <p className="text-xs font-medium">{error}</p>
                            <button onClick={loadReports} className="text-xs font-bold text-red-500 underline">
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {!loading && !error && reports.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <FileText size={32} className="mb-2 opacity-40" />
                            <p className="text-sm font-medium">Belum ada laporan</p>
                            <p className="text-xs text-gray-400 mt-1">Tekan tombol Input untuk menambahkan</p>
                        </div>
                    )}

                    {!loading && !error && reports.map((report) => {
                        const kq       = report.kualitas ? kualitasBadge[report.kualitas] : null;
                        const KqIcon   = kq?.icon ?? CheckCircle2;
                        const isAbsent = ['izin', 'sakit', 'alpha'].includes(report.attendance);

                        return (
                            <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-green-200 transition-colors">
                                {/* Row 1 */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        {report.report_type && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
                                                <BookOpen size={10} />
                                                {reportTypeLabel[report.report_type]}
                                            </span>
                                        )}
                                        <AttendanceBadge status={report.attendance} />
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-medium shrink-0 flex items-center gap-1">
                                        <Calendar size={11} /> {formatDate(report.date)}
                                    </span>
                                </div>

                                {/* Target & Capaian */}
                                {!isAbsent && (
                                    <div className="grid grid-cols-2 gap-2 my-2">
                                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 flex items-center gap-1">
                                                <Target size={9} /> Target
                                            </div>
                                            <div className="text-xs font-semibold text-gray-700">{report.hafalan_target ?? '—'}</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg px-3 py-2">
                                            <div className="text-[10px] font-bold text-green-500 uppercase mb-0.5 flex items-center gap-1">
                                                <TrendingUp size={9} /> Capaian
                                            </div>
                                            <div className="text-xs font-semibold text-gray-700">{report.hafalan_achievement ?? '—'}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Kualitas */}
                                {kq && (
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${kq.color} mb-1`}>
                                        <KqIcon size={13} /> {kq.label}
                                    </div>
                                )}

                                {/* Catatan */}
                                {report.teacher_notes && (
                                    <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 mt-2">
                                        {report.teacher_notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MODAL INPUT PROGRESS
═══════════════════════════════════════════════════════════ */
function InputModal({
    student, onClose, onSaved,
}: {
    student: Student;
    onClose: () => void;
    onSaved: (report: ProgressReport) => void;
}) {
    const [date,                setDate]               = useState(new Date().toISOString().split('T')[0]);
    const [attendance,          setAttendance]         = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
    const [reportType,          setReportType]         = useState<'hafalan' | 'tilawah' | 'yanbua'>('hafalan');
    const [kualitas,            setKualitas]           = useState<'sangat_lancar' | 'lancar' | 'mengulang'>('lancar');
    const [hafalanTarget,       setHafalanTarget]      = useState('');
    const [hafalanAchievement,  setHafalanAchievement] = useState('');
    const [notes,               setNotes]              = useState('');
    const [saving,              setSaving]             = useState(false);
    const [formError,           setFormError]          = useState<string | null>(null);

    const isAbsent = ['izin', 'sakit', 'alpha'].includes(attendance);

    const handleSubmit = async () => {
        setSaving(true);
        setFormError(null);

        const payload = {
            student_id:           student.id,
            date,
            attendance,
            report_type:          isAbsent ? null : reportType,
            kualitas:             isAbsent ? null : kualitas,
            hafalan_target:       isAbsent ? null : (hafalanTarget.trim() || null),
            hafalan_achievement:  isAbsent ? null : (hafalanAchievement.trim() || null),
            teacher_notes:        notes.trim() || null,
        };

        try {
            const res = await axios.post<ProgressReport>('/api/teacher/reports', payload);
            onSaved(res.data);
            onClose();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Gagal menyimpan laporan. Coba lagi.';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Input Setoran</h2>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">Buku Mutabaah Digital</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 bg-gray-50 p-5 space-y-4">

                    {/* Error banner */}
                    {formError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold">
                            <AlertTriangle size={14} /> {formError}
                        </div>
                    )}

                    {/* Info Santri */}
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                <User size={16} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{student.nama}</div>
                                <div className="text-[11px] text-gray-500 font-medium">{student.program}</div>
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tanggal</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="text-xs font-bold text-gray-700 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Kehadiran */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Status Kehadiran</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {(['hadir', 'izin', 'sakit', 'alpha'] as const).map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setAttendance(s)}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                        attendance === s
                                            ? 'border-green-500 bg-green-600 text-white shadow-sm'
                                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'
                                    }`}
                                >
                                    {attendanceBadge[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Jenis Setoran + Kualitas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Jenis */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Jenis Setoran</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { id: 'hafalan', label: 'Hafalan', icon: BookOpen  },
                                    { id: 'tilawah', label: 'Tilawah', icon: FileText  },
                                    { id: 'yanbua',  label: "Yanbu'a", icon: BarChart2 },
                                ] as const).map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        disabled={isAbsent}
                                        onClick={() => setReportType(t.id)}
                                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                            ${reportType === t.id && !isAbsent
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'
                                            }`}
                                    >
                                        <t.icon size={16} />
                                        <span className="font-bold text-[11px]">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Kualitas */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Kualitas Bacaan</h3>
                            <div className="flex flex-col gap-2">
                                {([
                                    { id: 'sangat_lancar', label: 'Sangat Lancar',   activeColor: 'border-blue-400 bg-blue-50 text-blue-800',     icon: Star         },
                                    { id: 'lancar',        label: 'Lancar',           activeColor: 'border-emerald-400 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
                                    { id: 'mengulang',     label: 'Perlu Mengulang', activeColor: 'border-amber-400 bg-amber-50 text-amber-800',   icon: AlertCircle  },
                                ] as const).map(k => {
                                    const active = kualitas === k.id && !isAbsent;
                                    return (
                                        <button
                                            key={k.id}
                                            type="button"
                                            disabled={isAbsent}
                                            onClick={() => setKualitas(k.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                                ${active ? k.activeColor : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'}`}
                                        >
                                            <k.icon size={14} /> {k.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Target & Capaian */}
                    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-opacity ${isAbsent ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Capaian Setoran</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <Target size={10} /> Target
                                </label>
                                <input
                                    type="text"
                                    value={hafalanTarget}
                                    onChange={e => setHafalanTarget(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition-all"
                                    placeholder={reportType === 'yanbua' ? 'Jilid 4: Hal 1-5' : 'Al-Mulk: 1-15'}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <TrendingUp size={10} /> Capaian Aktual
                                </label>
                                <input
                                    type="text"
                                    value={hafalanAchievement}
                                    onChange={e => setHafalanAchievement(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition-all"
                                    placeholder={reportType === 'yanbua' ? 'Jilid 4: Hal 1-3' : 'Al-Mulk: 1-15'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <FileText size={13} className="text-green-600" /> Catatan Asatidz
                        </h3>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[72px] transition-all"
                            placeholder="Catatan tajwid, perkembangan, atau hal yang perlu diperhatikan... (opsional)"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? 'Menyimpan...' : 'Simpan Laporan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT UTAMA
═══════════════════════════════════════════════════════════ */
export default function LaporanProgres() {
    const [students,      setStudents]      = useState<Student[]>([]);
    const [loadingPage,   setLoadingPage]   = useState(true);
    const [pageError,     setPageError]     = useState<string | null>(null);

    const [searchQuery,   setSearchQuery]   = useState('');
    const [filterProgram, setFilterProgram] = useState('semua');

    const [detailStudent, setDetailStudent] = useState<Student | null>(null);
    const [modalStudent,  setModalStudent]  = useState<Student | null>(null);

    // Ref ke fungsi refresh detail panel
    const [detailRefreshKey, setDetailRefreshKey] = useState(0);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // ── Load daftar siswa saat mount ─────────────────────
    useEffect(() => {
        axios.get<Student[]>('/api/teacher/students')
            .then(res => setStudents(res.data))
            .catch(() => setPageError('Gagal memuat data santri. Refresh halaman.'))
            .finally(() => setLoadingPage(false));
    }, []);

    // ── Filter ───────────────────────────────────────────
    const programs = ['semua', ...Array.from(new Set(students.map(s => s.program)))];

    const filtered = students.filter(s => {
        const matchSearch  = s.nama.toLowerCase().includes(searchQuery.toLowerCase());
        const matchProgram = filterProgram === 'semua' || s.program === filterProgram;
        return matchSearch && matchProgram;
    });

    // ── Setelah report disimpan ──────────────────────────
    const handleSaved = (newReport: ProgressReport) => {
        // Update lastReport di tabel
        setStudents(prev =>
            prev.map(s => s.id === newReport.student_id ? { ...s, lastReport: newReport } : s)
        );
        // Refresh detail panel jika sedang terbuka untuk siswa yang sama
        if (detailStudent?.id === newReport.student_id) {
            setDetailRefreshKey(k => k + 1); // trigger re-mount DetailPanel
        }
        setToast({ message: 'Laporan berhasil disimpan!', type: 'success' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <TeacherNavbar activePage="laporan" />

            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto flex flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Progress Reports</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Pantau &amp; input progres setoran hafalan, tilawah, dan yanbu'a santri.
                        </p>
                    </div>
                    {/* Summary chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-bold text-gray-600">
                            <User size={13} className="text-green-600" />
                            {students.length} Santri
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-bold text-gray-600">
                            <Award size={13} className="text-blue-600" />
                            {students.filter(s => s.lastReport?.kualitas === 'sangat_lancar').length} Sangat Lancar Hari Ini
                        </div>
                    </div>
                </div>

                {/* ── Error state halaman ── */}
                {pageError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                        <AlertTriangle size={16} /> {pageError}
                    </div>
                )}

                {/* ── Toolbar ── */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={15} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition-all"
                            placeholder="Cari nama santri..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                        <select
                            value={filterProgram}
                            onChange={e => setFilterProgram(e.target.value)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            {programs.map(p => (
                                <option key={p} value={p}>{p === 'semua' ? 'Semua Program' : p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Tabel ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Santri</th>
                                    <th className="px-5 py-3">Program</th>
                                    <th className="px-5 py-3">Setoran Terakhir</th>
                                    <th className="px-5 py-3">Kehadiran</th>
                                    <th className="px-5 py-3">Kualitas</th>
                                    <th className="px-5 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Loading skeleton */}
                                {loadingPage && Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '80%' : '60%' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {!loadingPage && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                                            {students.length === 0 ? 'Belum ada data santri.' : 'Tidak ada santri ditemukan.'}
                                        </td>
                                    </tr>
                                )}

                                {!loadingPage && filtered.map(student => {
                                    const lr   = student.lastReport;
                                    const kq   = lr?.kualitas ? kualitasBadge[lr.kualitas] : null;
                                    const KqIcon = kq?.icon ?? CheckCircle2;

                                    return (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-green-50/40 transition-colors cursor-pointer group"
                                            onClick={() => setDetailStudent(student)}
                                        >
                                            {/* Santri */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {student.nama.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                            {student.nama}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Program */}
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-semibold text-gray-600">{student.program}</span>
                                            </td>

                                            {/* Setoran Terakhir */}
                                            <td className="px-5 py-3.5">
                                                {lr ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                                            <BookOpen size={11} className="text-gray-400" />
                                                            {lr.hafalan_achievement || lr.hafalan_target || '—'}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                            <Clock size={10} /> {formatDate(lr.date)}
                                                            {lr.report_type && ` · ${reportTypeLabel[lr.report_type]}`}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Kehadiran */}
                                            <td className="px-5 py-3.5">
                                                {lr ? <AttendanceBadge status={lr.attendance} /> : <span className="text-xs text-gray-400">—</span>}
                                            </td>

                                            {/* Kualitas */}
                                            <td className="px-5 py-3.5">
                                                {kq ? (
                                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${kq.color}`}>
                                                        <KqIcon size={13} /> {kq.label}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setDetailStudent(student)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Lihat riwayat"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setModalStudent(student)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition-all"
                                                    >
                                                        <Plus size={13} /> Input
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer tabel */}
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">
                            Menampilkan {filtered.length} dari {students.length} santri
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <ChevronRight size={14} /> Klik baris untuk lihat riwayat lengkap
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Detail Panel ── */}
            {detailStudent && (
                <DetailPanel
                    key={`${detailStudent.id}-${detailRefreshKey}`}
                    student={detailStudent}
                    onClose={() => setDetailStudent(null)}
                    onAddReport={() => setModalStudent(detailStudent)}
                />
            )}

            {/* ── Input Modal ── */}
            {modalStudent && (
                <InputModal
                    student={modalStudent}
                    onClose={() => setModalStudent(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>
        </div>
    );
}