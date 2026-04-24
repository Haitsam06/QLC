import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FileCheck, Download, Search, Filter, FileText,
    FileSpreadsheet, FileBarChart, Clock, Eye,
    Loader2, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface MitraReport {
    id: string;
    partner_id: string;
    title: string;
    date: string | null;
    description: string | null;
    file_url: string | null;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    created_at: string | null;
}

interface Meta {
    total: number; page: number; per_page: number; last_page: number;
}

interface ApiResponse {
    data: MitraReport[];
    new_count: number;
    meta: Meta;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function useDebounce<T>(val: T, ms = 400): T {
    const [v, setV] = useState(val);
    useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
    return v;
}

const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatBytes = (b: number | null) => {
    if (!b) return '—';
    if (b < 1024)    return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
};

// Tentukan ikon & warna berdasarkan file_type
function getFileStyle(fileType: string | null) {
    switch (fileType?.toLowerCase()) {
        case 'pdf':
            return { icon: FileCheck,       iconColor: 'text-red-600',    iconBg: 'bg-red-50',    typeLabel: 'PDF'  };
        case 'doc':
        case 'docx':
            return { icon: FileText,        iconColor: 'text-blue-600',   iconBg: 'bg-blue-50',   typeLabel: 'Word' };
        case 'xls':
        case 'xlsx':
            return { icon: FileSpreadsheet, iconColor: 'text-green-600',  iconBg: 'bg-green-50',  typeLabel: 'Excel'};
        default:
            return { icon: FileBarChart,    iconColor: 'text-gray-600',   iconBg: 'bg-gray-100',  typeLabel: 'File' };
    }
}

// Apakah laporan "baru" (dalam 7 hari terakhir)
function isNew(date: string | null): boolean {
    if (!date) return false;
    const d     = new Date(date);
    const limit = new Date();
    limit.setDate(limit.getDate() - 7);
    return d >= limit;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT UTAMA
═══════════════════════════════════════════════════════════ */
export default function LaporanMitra() {
    const [reports,   setReports]   = useState<MitraReport[]>([]);
    const [meta,      setMeta]      = useState<Meta>({ total: 0, page: 1, per_page: 10, last_page: 1 });
    const [newCount,  setNewCount]  = useState(0);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState<string | null>(null);
    const [search,    setSearch]    = useState('');
    const [page,      setPage]      = useState(1);

    const dSearch = useDebounce(search);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (dSearch) params.set('search', dSearch);
        params.set('page', String(page));
        params.set('per_page', '10');

        axios.get<ApiResponse>(`/api/mitra/reports?${params}`)
            .then(res => {
                setReports(res.data.data);
                setMeta(res.data.meta);
                setNewCount(res.data.new_count);
            })
            .catch(() => setError('Gagal memuat laporan. Coba refresh halaman.'))
            .finally(() => setLoading(false));
    }, [dSearch, page]);

    useEffect(() => { load(); }, [load]);

    // Reset page saat search berubah
    useEffect(() => { setPage(1); }, [dSearch]);

    return (
        <div className="w-full pb-4 mx-auto flex flex-col gap-6">

                {/* ── Header & Stats ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                    <div className="w-full lg:w-1/2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Laporan & Evaluasi</h1>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Unduh dan arsipkan dokumen laporan bulanan, hasil supervisi, performa akademik, serta riwayat tagihan kemitraan.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-row gap-4 shrink-0">
                        <div className="bg-white border border-gray-200 px-5 py-4 rounded-xl shadow-sm flex items-center gap-4 w-40 md:w-48">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                <FileCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 leading-none">
                                    {loading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse"/> : meta.total}
                                </div>
                                <div className="text-xs font-semibold text-gray-500 mt-1">Total Laporan</div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 px-5 py-4 rounded-xl shadow-sm flex items-center gap-4 w-40 md:w-48">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 leading-none">
                                    {loading ? <span className="inline-block w-6 h-6 bg-gray-200 rounded animate-pulse"/> : newCount}
                                </div>
                                <div className="text-xs font-semibold text-gray-500 mt-1">Laporan Baru</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50">
                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="Cari judul laporan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={load}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-2 shrink-0 transition-colors"
                        >
                            <RefreshCw size={15} /> Refresh
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 m-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                            <Loader2 size={24} className="animate-spin text-green-500" />
                            <span className="text-sm font-medium">Memuat laporan...</span>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && reports.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <FileText size={48} className="opacity-30" />
                            <p className="text-sm font-semibold">Belum ada laporan tersedia.</p>
                        </div>
                    )}

                    {/* List Laporan */}
                    {!loading && !error && reports.length > 0 && (
                        <div className="flex flex-col">
                            {reports.map((report, index) => {
                                const { icon: IconCmp, iconColor, iconBg, typeLabel } = getFileStyle(report.file_type);
                                const reportIsNew = isNew(report.date);

                                return (
                                    <div
                                        key={report.id}
                                        className={`p-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-gray-50
                                            ${index !== reports.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        {/* Kiri: Ikon & Judul */}
                                        <div className="flex items-start gap-4 w-full md:w-5/12">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                                                <IconCmp size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{report.title}</h3>
                                                    {reportIsNew && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wide shrink-0">Baru</span>
                                                    )}
                                                </div>
                                                {report.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-1">{report.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tengah: Tanggal & Tipe */}
                                        <div className="flex flex-row md:w-4/12 gap-6 items-center">
                                            <div className="w-1/2">
                                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Tanggal</div>
                                                <div className="text-sm font-semibold text-gray-700">{formatDate(report.date)}</div>
                                            </div>
                                            <div className="w-1/2">
                                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ukuran</div>
                                                <div className="text-sm font-semibold text-gray-700">{formatBytes(report.file_size)}</div>
                                            </div>
                                        </div>

                                        {/* Kanan: Type & Actions */}
                                        <div className="flex items-center justify-between md:justify-end md:w-3/12 gap-4 pt-4 md:pt-0 border-t border-gray-100 md:border-none mt-2 md:mt-0">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500">
                                                {typeLabel}
                                            </span>

                                            <div className="flex gap-2">
                                                {/* Preview — buka di tab baru */}
                                                {report.file_url && (
                                                    <a
                                                        href={report.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-green-600 transition-colors"
                                                        title="Lihat Preview"
                                                    >
                                                        <Eye size={18} />
                                                    </a>
                                                )}

                                                {/* Download */}
                                                {report.file_url ? (
                                                    <a
                                                        href={report.file_url}
                                                        download={report.file_name ?? true}
                                                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Download size={16} />
                                                        <span className="hidden xl:inline">Unduh</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed flex items-center gap-2"
                                                        title="File tidak tersedia"
                                                    >
                                                        <Download size={16} />
                                                        <span className="hidden xl:inline">Unduh</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">
                                Menampilkan {((meta.page - 1) * meta.per_page) + 1}–{Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} laporan
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={meta.page <= 1}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
                                >
                                    <ChevronLeft size={15} /> Sebelumnya
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={meta.page >= meta.last_page}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
                                >
                                    Berikutnya <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        </div>
    );
}