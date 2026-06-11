import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Loader2, ChevronDown, Upload, X, AlertCircle, CheckCircle2, ImageIcon } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface SppItem {
    id: string;
    tahun: number;
    bulan: number;
    nominal: number;
    status: 'lunas' | 'belum' | 'cicilan' | 'menunggu';
    tanggal_bayar: string | null;
    keterangan: string | null;
    bukti_bayar: string | null;
}
interface ChildSpp {
    student_id: string;
    student_name: string;
    payments: SppItem[];
}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i + 1).reverse();
const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const STATUS_CFG: Record<string, { label: string; badge: string; dot: string; num: string }> = {
    lunas:    { label: 'Lunas',                 badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  num: 'bg-green-50 text-green-700' },
    belum:    { label: 'Belum Bayar',            badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500',    num: 'bg-red-50 text-red-600' },
    cicilan:  { label: 'Cicilan',               badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',  num: 'bg-amber-50 text-amber-700' },
    menunggu: { label: 'Menunggu Konfirmasi',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   num: 'bg-blue-50 text-blue-700' },
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function fmtRupiah(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

/* ═══════════════════════════════════════════════════════════
   BAYAR MODAL — upload bukti pembayaran
═══════════════════════════════════════════════════════════ */
function BayarModal({ payment, studentName, onClose, onUploaded }: {
    payment: SppItem;
    studentName: string;
    onClose: () => void;
    onUploaded: () => void;
}) {
    const [file, setFile]           = useState<File | null>(null);
    const [preview, setPreview]     = useState<string | null>(null);
    const [keterangan, setKet]      = useState('');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const inputRef                  = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 4 * 1024 * 1024) { setError('Ukuran file maksimal 4 MB.'); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError('');
    };

    const submit = async () => {
        if (!file) { setError('Bukti pembayaran wajib diupload.'); return; }
        setLoading(true);
        const fd = new FormData();
        fd.append('bukti_bayar', file);
        if (keterangan) fd.append('keterangan', keterangan);
        try {
            const res = await fetch(`/api/parent/spp/${payment.id}/pay`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Gagal mengupload.'); return; }
            onUploaded();
        } catch {
            setError('Koneksi gagal.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl z-10 pb-safe overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div>
                        <div className="text-[15px] font-black text-slate-900">Upload Bukti Bayar</div>
                        <div className="text-[11.5px] font-bold text-slate-400 mt-0.5">
                            {studentName} · {BULAN[payment.bulan]} {payment.tahun} · {fmtRupiah(payment.nominal)}
                        </div>
                    </div>
                    <button className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-semibold rounded-2xl px-4 py-2.5 flex items-center gap-2">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Upload area */}
                    <div
                        className="border-2 border-dashed border-slate-200 rounded-[1.5rem] overflow-hidden cursor-pointer hover:border-[#1B6B3A] transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="w-full max-h-52 object-cover" />
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 hover:opacity-100 text-white text-xs font-black bg-black/50 px-3 py-1.5 rounded-full transition-opacity">Ganti Foto</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-[#1B6B3A]/10 flex items-center justify-center">
                                    <ImageIcon size={24} className="text-[#1B6B3A]" />
                                </div>
                                <div className="font-black text-slate-700 text-sm">Tap untuk upload foto</div>
                                <div className="text-[11px] font-bold text-slate-400">JPG, PNG, JPEG · Maks 4 MB</div>
                            </div>
                        )}
                    </div>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                    {/* Catatan */}
                    <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">Catatan (opsional)</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-900 outline-none resize-none focus:border-[#1B6B3A] transition-colors"
                            rows={2}
                            placeholder="Mis: transfer BCA, no. ref 123456..."
                            value={keterangan}
                            onChange={(e) => setKet(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button className="flex-1 py-3.5 rounded-2xl border border-slate-200 font-black text-[13px] text-slate-600 hover:bg-slate-50 transition-colors" onClick={onClose} disabled={loading}>
                        Batal
                    </button>
                    <button
                        className="flex-1 py-3.5 rounded-2xl bg-[#1B6B3A] text-white font-black text-[13px] flex items-center justify-center gap-2 hover:bg-[#14522d] transition-colors disabled:opacity-50 shadow-lg shadow-green-900/20"
                        onClick={submit}
                        disabled={loading || !file}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {loading ? 'Mengupload...' : 'Kirim Bukti Bayar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ═══════════════════════════════════════════════════════════
   CHILD CARD — collapsible per student
═══════════════════════════════════════════════════════════ */
function ChildCard({ child, onRefresh }: { child: ChildSpp; onRefresh: () => void }) {
    const [open, setOpen]         = useState(true);
    const [bayarTarget, setBayar] = useState<SppItem | null>(null);
    const total  = child.payments.length;
    const lunas  = child.payments.filter((p) => p.status === 'lunas').length;
    const belum  = child.payments.filter((p) => p.status === 'belum').length;
    const pct    = total > 0 ? Math.round((lunas / total) * 100) : 0;

    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            {/* Card header */}
            <button
                className="w-full flex items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50/60 active:scale-[0.99]"
                onClick={() => setOpen((o) => !o)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-[#1B6B3A]/10 flex items-center justify-center font-black text-[#1B6B3A] text-lg shrink-0">
                        {child.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <div className="font-black text-slate-900 text-sm leading-tight">{child.student_name}</div>
                        {total === 0 ? (
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">Belum ada tagihan</div>
                        ) : (
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#1B6B3A] rounded-full transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-500">{lunas}/{total} lunas</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {total > 0 && (
                        <div className="flex items-center gap-1.5">
                            {lunas > 0  && <span className="text-[11px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{lunas}✓</span>}
                            {belum > 0  && <span className="text-[11px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{belum}!</span>}
                        </div>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Payments list */}
            {open && total > 0 && (
                <div className="border-t border-slate-50 divide-y divide-slate-50">
                    {child.payments.map((p) => {
                        const cfg = STATUS_CFG[p.status];
                        return (
                            <div key={p.id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black ${cfg.num}`}>
                                        {p.bulan.toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-black text-slate-900">
                                            {BULAN[p.bulan]} {p.tahun}
                                        </div>
                                        <div className="text-[11.5px] font-bold text-slate-400">
                                            {fmtRupiah(p.nominal)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${cfg.badge}`}>
                                        {cfg.label}
                                    </span>
                                    {p.tanggal_bayar && (
                                        <span className="text-[10px] font-bold text-slate-400">{p.tanggal_bayar}</span>
                                    )}
                                    {(p.status === 'belum' || p.status === 'cicilan') && (
                                        <button
                                            className="text-[11px] font-black text-white bg-[#1B6B3A] px-3 py-1.5 rounded-xl hover:bg-[#14522d] active:scale-95 transition-all flex items-center gap-1"
                                            onClick={() => setBayar(p)}
                                        >
                                            <Upload size={11} /> Bayar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {open && total === 0 && (
                <div className="border-t border-slate-50 px-6 py-8 text-center text-[12.5px] font-bold text-slate-400">
                    Belum ada tagihan untuk tahun ini.
                </div>
            )}

            {bayarTarget && (
                <BayarModal
                    payment={bayarTarget}
                    studentName={child.student_name}
                    onClose={() => setBayar(null)}
                    onUploaded={() => { setBayar(null); onRefresh(); }}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SppParentPage() {
    const [data, setData]           = useState<ChildSpp[]>([]);
    const [loading, setLoading]     = useState(true);
    const [filterTahun, setFilterTahun] = useState(String(CY));

    const fetchData = useCallback(() => {
        setLoading(true);
        const p = new URLSearchParams();
        if (filterTahun) p.set('tahun', filterTahun);
        fetch(`/api/parent/spp?${p}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((d) => setData(d.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filterTahun]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalAll    = data.reduce((s, c) => s + c.payments.length, 0);
    const totalLunas  = data.reduce((s, c) => s + c.payments.filter((p) => p.status === 'lunas').length, 0);
    const totalBelum  = data.reduce((s, c) => s + c.payments.filter((p) => p.status === 'belum').length, 0);
    const totalNominalLunas = data.reduce((s, c) => s + c.payments.filter((p) => p.status === 'lunas').reduce((ss, p) => ss + p.nominal, 0), 0);

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard size={22} className="text-[#1B6B3A]" />
                        Pembayaran SPP
                    </h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Status tagihan ananda
                    </p>
                </div>
                <select
                    className="border border-slate-200 rounded-2xl px-4 py-2 text-sm font-black text-slate-700 outline-none focus:border-[#1B6B3A] bg-white shadow-sm"
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                >
                    <option value="">Semua Tahun</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            {/* ── Summary pills ── */}
            {!loading && totalAll > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Lunas',    value: totalLunas,  sub: fmtRupiah(totalNominalLunas), bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
                        { label: 'Belum',    value: totalBelum,  sub: null,                         bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500' },
                        { label: 'Total',    value: totalAll,    sub: null,                         bg: 'bg-slate-50',  text: 'text-slate-700',  dot: 'bg-slate-400' },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-[1.5rem] p-4 border border-white/80 shadow-sm`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{s.label}</span>
                            </div>
                            <div className={`text-[22px] font-black ${s.text} leading-none`}>{s.value}</div>
                            {s.sub && <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">{s.sub}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-[#1B6B3A]" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center gap-3 text-center shadow-sm">
                    <CreditCard size={36} strokeWidth={1.5} className="text-slate-200" />
                    <p className="font-black text-slate-500 text-sm">Belum ada data tagihan SPP.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {data.map((child) => (
                        <ChildCard key={child.student_id} child={child} onRefresh={fetchData} />
                    ))}
                </div>
            )}
        </div>
    );
}
