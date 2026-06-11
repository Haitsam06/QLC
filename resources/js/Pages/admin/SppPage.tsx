import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, CreditCard, Loader2, AlertCircle, CheckCircle2, Eye, ShieldCheck, ShieldX } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface SppPayment {
    id: string;
    student_id: string;
    student_name: string;
    parent_id: string | null;
    tahun: number;
    bulan: number;
    nominal: number;
    status: 'lunas' | 'belum' | 'cicilan' | 'menunggu';
    tanggal_bayar: string | null;
    keterangan: string | null;
    bukti_bayar: string | null;
    created_at: string | null;
}
interface Meta { total: number; page: number; per_page: number; last_page: number; }
interface Summary { total: number; lunas: number; belum: number; cicilan: number; nominal_lunas: number; nominal_all: number; }
interface AddForm {
    periode: string;
    nominal: string;
    keterangan: string;
}
interface EditForm {
    nominal: string;
    status: string;
    tanggal_bayar: string;
    keterangan: string;
}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CY - i + 2).reverse();
const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const nowM = `${CY}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const EMPTY_ADD: AddForm = { periode: nowM, nominal: '', keterangan: '' };
const EMPTY_EDIT: EditForm = { nominal: '', status: 'belum', tanggal_bayar: '', keterangan: '' };

const STATUS_STYLE: Record<string, string> = {
    lunas:    'bg-green-100 text-green-700',
    belum:    'bg-red-100 text-red-600',
    cicilan:  'bg-amber-100 text-amber-700',
    menunggu: 'bg-blue-100 text-blue-700',
};
const STATUS_LABEL: Record<string, string> = { lunas: 'Lunas', belum: 'Belum Bayar', cicilan: 'Cicilan', menunggu: 'Menunggu' };

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function fmtRupiah(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function useDebounce<T>(val: T, ms = 400): T {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}

/* ═══════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${type === 'success' ? 'bg-teal-700' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>
    );
}

const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-[13px] text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 ${err ? 'border-red-400' : 'border-slate-300'}`;
const selectCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-[13px] text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white ${err ? 'border-red-400' : 'border-slate-300'}`;

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-[11.5px] text-red-500 mt-1 font-medium">{error}</p>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   ADD MODAL (Bulk — semua siswa aktif)
═══════════════════════════════════════════════════════════ */
function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: (msg: string) => void }) {
    const [form, setForm] = useState<AddForm>(EMPTY_ADD);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const set = (k: keyof AddForm, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => { const ne = { ...e }; delete ne[k]; return ne; });
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.periode) e.periode = 'Periode wajib diisi.';
        if (!form.nominal || isNaN(Number(form.nominal)) || Number(form.nominal) < 0) e.nominal = 'Nominal harus berupa angka ≥ 0.';
        return e;
    };

    const submit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        const [tahunStr, bulanStr] = form.periode.split('-');
        setLoading(true);
        try {
            const res = await fetch('/api/spp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({
                    tahun:      parseInt(tahunStr),
                    bulan:      parseInt(bulanStr),
                    nominal:    Number(form.nominal),
                    keterangan: form.keterangan || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) {
                    const mapped: Record<string, string> = {};
                    Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v); });
                    setErrors(mapped);
                } else {
                    setErrors({ _general: data.message ?? 'Terjadi kesalahan.' });
                }
                return;
            }
            onSaved(data.message ?? 'Tagihan berhasil dibuat.');
        } catch {
            setErrors({ _general: 'Koneksi gagal.' });
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                        <CreditCard size={17} className="text-teal-700" /> Buat Tagihan SPP Bulanan
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" onClick={onClose}>
                        <X size={17} />
                    </button>
                </div>

                <div className="px-5 pt-4 pb-2">
                    <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5 text-[12px] text-teal-800 font-medium">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" />
                        Tagihan akan dibuat sekaligus untuk <strong>semua siswa aktif</strong>. Siswa yang sudah memiliki tagihan di periode ini akan dilewati.
                    </div>
                </div>

                <div className="p-5 pt-3 flex flex-col gap-4">
                    {errors._general && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-semibold rounded-lg px-3 py-2 flex items-center gap-2">
                            <AlertCircle size={14} /> {errors._general}
                        </div>
                    )}

                    <Field label="Periode (Bulan/Tahun)" required error={errors.periode}>
                        <input
                            type="month"
                            className={inputCls(errors.periode)}
                            value={form.periode}
                            onChange={(e) => set('periode', e.target.value)}
                        />
                    </Field>

                    <Field label="Nominal (Rp)" required error={errors.nominal}>
                        <input
                            type="number"
                            className={inputCls(errors.nominal)}
                            placeholder="Contoh: 150000"
                            value={form.nominal}
                            onChange={(e) => set('nominal', e.target.value)}
                            min={0}
                        />
                    </Field>

                    <Field label="Keterangan" error={errors.keterangan}>
                        <textarea
                            className={inputCls(errors.keterangan) + ' resize-none'}
                            rows={2}
                            placeholder="Opsional..."
                            value={form.keterangan}
                            onChange={(e) => set('keterangan', e.target.value)}
                        />
                    </Field>
                </div>

                <div className="flex justify-end gap-2 px-5 pb-5">
                    <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-colors" onClick={onClose} disabled={loading}>
                        Batal
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-teal-700 text-white text-[13px] font-bold flex items-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50"
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={15} className="animate-spin" />} Buat Tagihan
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ═══════════════════════════════════════════════════════════
   EDIT MODAL
═══════════════════════════════════════════════════════════ */
function EditModal({ payment, onClose, onSaved }: { payment: SppPayment; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState<EditForm>({
        nominal:       String(payment.nominal),
        status:        payment.status,
        tanggal_bayar: payment.tanggal_bayar ?? '',
        keterangan:    payment.keterangan ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const set = (k: keyof EditForm, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => { const ne = { ...e }; delete ne[k]; return ne; });
    };

    const submit = async () => {
        const e: Record<string, string> = {};
        if (!form.nominal || isNaN(Number(form.nominal)) || Number(form.nominal) < 0) e.nominal = 'Nominal harus berupa angka ≥ 0.';
        if (!form.status) e.status = 'Status wajib dipilih.';
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/spp/${payment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({
                    nominal:       Number(form.nominal),
                    status:        form.status,
                    tanggal_bayar: form.tanggal_bayar || null,
                    keterangan:    form.keterangan || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) {
                    const mapped: Record<string, string> = {};
                    Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v); });
                    setErrors(mapped);
                } else {
                    setErrors({ _general: data.message ?? 'Terjadi kesalahan.' });
                }
                return;
            }
            onSaved();
        } catch {
            setErrors({ _general: 'Koneksi gagal.' });
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto z-10">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <div className="text-[15px] font-extrabold text-slate-900">Edit Tagihan SPP</div>
                        <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                            {payment.student_name} · {BULAN[payment.bulan]} {payment.tahun}
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" onClick={onClose}>
                        <X size={17} />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {errors._general && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-semibold rounded-lg px-3 py-2 flex items-center gap-2">
                            <AlertCircle size={14} /> {errors._general}
                        </div>
                    )}

                    {/* Bukti Bayar — tampil jika wali sudah upload */}
                    {payment.bukti_bayar && (
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                                Bukti Pembayaran
                                <span className="ml-2 text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Menunggu Verifikasi</span>
                            </label>
                            <a href={payment.bukti_bayar} target="_blank" rel="noopener noreferrer" className="block group">
                                <img
                                    src={payment.bukti_bayar}
                                    alt="Bukti bayar"
                                    className="w-full rounded-xl border border-slate-200 object-cover max-h-48 group-hover:opacity-90 transition-opacity"
                                />
                                <p className="text-[11px] text-slate-400 font-medium mt-1 text-center">Klik untuk buka gambar penuh</p>
                            </a>
                        </div>
                    )}

                    <Field label="Nominal (Rp)" required error={errors.nominal}>
                        <input
                            type="number"
                            className={inputCls(errors.nominal)}
                            value={form.nominal}
                            onChange={(e) => set('nominal', e.target.value)}
                            min={0}
                            autoFocus={!payment.bukti_bayar}
                        />
                    </Field>

                    <Field label="Status Pembayaran" required error={errors.status}>
                        <select className={selectCls(errors.status)} value={form.status} onChange={(e) => set('status', e.target.value)}>
                            <option value="belum">Belum Bayar</option>
                            <option value="cicilan">Cicilan</option>
                            <option value="lunas">Lunas</option>
                        </select>
                    </Field>

                    <Field label="Tanggal Bayar" error={errors.tanggal_bayar}>
                        <input type="date" className={inputCls(errors.tanggal_bayar)} value={form.tanggal_bayar} onChange={(e) => set('tanggal_bayar', e.target.value)} />
                    </Field>

                    <Field label="Keterangan" error={errors.keterangan}>
                        <textarea
                            className={inputCls(errors.keterangan) + ' resize-none'}
                            rows={2}
                            value={form.keterangan}
                            onChange={(e) => set('keterangan', e.target.value)}
                        />
                    </Field>
                </div>

                <div className="flex justify-end gap-2 px-5 pb-5">
                    <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-colors" onClick={onClose} disabled={loading}>
                        Batal
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-teal-700 text-white text-[13px] font-bold flex items-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50"
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={15} className="animate-spin" />} Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRM
═══════════════════════════════════════════════════════════ */
function DeleteConfirm({ payment, onClose, onDeleted }: { payment: SppPayment; onClose: () => void; onDeleted: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const confirm = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/spp/${payment.id}`, {
                method: 'DELETE',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) { setError('Gagal menghapus. Coba lagi.'); return; }
            onDeleted();
        } catch {
            setError('Koneksi gagal.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 size={18} className="text-red-600" />
                    </div>
                    <div>
                        <div className="text-[15px] font-extrabold text-slate-900">Hapus Tagihan?</div>
                        <div className="text-[12.5px] text-slate-500 font-medium mt-1">
                            {payment.student_name} · {BULAN[payment.bulan]} {payment.tahun}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-0.5">Tindakan ini tidak dapat dibatalkan.</div>
                    </div>
                </div>
                {error && <p className="text-[12px] text-red-500 font-semibold mb-3">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-colors" onClick={onClose} disabled={loading}>
                        Batal
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-red-600 text-white text-[13px] font-bold flex items-center gap-2 hover:bg-red-500 transition-colors disabled:opacity-50"
                        onClick={confirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={15} className="animate-spin" />} Hapus
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ═══════════════════════════════════════════════════════════
   REVIEW MODAL — verifikasi bukti bayar
═══════════════════════════════════════════════════════════ */
function ReviewModal({ payment, onClose, onDone }: { payment: SppPayment; onClose: () => void; onDone: (msg: string) => void }) {
    const [loading, setLoading] = useState<'confirm' | 'reject' | null>(null);
    const [error, setError] = useState('');

    const updateStatus = async (status: 'lunas' | 'belum') => {
        setLoading(status === 'lunas' ? 'confirm' : 'reject');
        setError('');
        try {
            const res = await fetch(`/api/spp/${payment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Terjadi kesalahan.'); return; }
            onDone(status === 'lunas' ? 'Pembayaran dikonfirmasi lunas.' : 'Bukti bayar ditolak.');
        } catch {
            setError('Koneksi gagal.');
        } finally {
            setLoading(null);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                        <Eye size={17} className="text-blue-600" /> Verifikasi Bukti Bayar
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" onClick={onClose}>
                        <X size={17} />
                    </button>
                </div>

                {/* Info */}
                <div className="px-5 pt-4 pb-0">
                    <div className="text-[13px] font-bold text-slate-900">{payment.student_name}</div>
                    <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                        {BULAN[payment.bulan]} {payment.tahun} · {fmtRupiah(payment.nominal)}
                    </div>
                    {payment.keterangan && (
                        <div className="mt-2 text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <span className="font-bold text-slate-500">Catatan wali:</span> {payment.keterangan}
                        </div>
                    )}
                </div>

                {/* Bukti bayar image */}
                <div className="px-5 pt-3 pb-2">
                    {payment.bukti_bayar ? (
                        <a href={payment.bukti_bayar} target="_blank" rel="noopener noreferrer" className="block group">
                            <img
                                src={payment.bukti_bayar}
                                alt="Bukti bayar"
                                className="w-full rounded-xl border border-slate-200 object-cover max-h-72 group-hover:opacity-90 transition-opacity cursor-zoom-in"
                            />
                            <p className="text-center text-[11px] text-slate-400 mt-1.5 font-medium">Klik untuk buka ukuran penuh</p>
                        </a>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                            <AlertCircle size={20} className="mb-1.5" />
                            <span className="text-[12px] font-semibold">Bukti bayar tidak tersedia</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mx-5 mb-2 text-[12px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <AlertCircle size={13} /> {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 px-5 pb-5 pt-1">
                    <button
                        className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                        onClick={() => updateStatus('belum')}
                        disabled={loading !== null}
                    >
                        {loading === 'reject' ? <Loader2 size={15} className="animate-spin" /> : <ShieldX size={15} />}
                        Tolak
                    </button>
                    <button
                        className="flex-1 py-2.5 rounded-xl bg-teal-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50"
                        onClick={() => updateStatus('lunas')}
                        disabled={loading !== null}
                    >
                        {loading === 'confirm' ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                        Konfirmasi Lunas
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SppPage() {
    const [payments, setPayments] = useState<SppPayment[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, per_page: 10, last_page: 1 });
    const [loading, setLoading] = useState(true);

    const [search, setSearch]           = useState('');
    const [filterTahun, setFilterTahun] = useState('');
    const [filterBulan, setFilterBulan] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage]               = useState(1);
    const debouncedSearch               = useDebounce(search, 400);

    const [summary, setSummary]           = useState<Summary | null>(null);
    const [showAdd, setShowAdd]           = useState(false);
    const [editTarget, setEditTarget]     = useState<SppPayment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SppPayment | null>(null);
    const [reviewTarget, setReviewTarget] = useState<SppPayment | null>(null);
    const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

    useEffect(() => {
        const p = new URLSearchParams();
        if (filterTahun) p.set('tahun', filterTahun);
        if (filterBulan) p.set('bulan', filterBulan);
        fetch(`/api/spp/summary?${p}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((d) => setSummary(d))
            .catch(() => {});
    }, [filterTahun, filterBulan]);

    const fetchData = useCallback(() => {
        setLoading(true);
        const p = new URLSearchParams();
        if (debouncedSearch) p.set('search', debouncedSearch);
        if (filterTahun)     p.set('tahun', filterTahun);
        if (filterBulan)     p.set('bulan', filterBulan);
        if (filterStatus)    p.set('status', filterStatus);
        p.set('page', String(page));
        p.set('per_page', '10');

        fetch(`/api/spp?${p}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((d) => {
                setPayments(d.data ?? []);
                setMeta(d.meta ?? { total: 0, page: 1, per_page: 10, last_page: 1 });
            })
            .catch(() => showToast('Gagal memuat data.', 'error'))
            .finally(() => setLoading(false));
    }, [debouncedSearch, filterTahun, filterBulan, filterStatus, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => { setPage(1); }, [debouncedSearch, filterTahun, filterBulan, filterStatus]);

    return (
        <>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            <div className="flex flex-col gap-5">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-[20px] font-extrabold text-slate-900 flex items-center gap-2">
                            <CreditCard size={22} className="text-teal-700" /> Pembayaran SPP
                        </h1>
                        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Kelola tagihan SPP siswa</p>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                        onClick={() => setShowAdd(true)}
                    >
                        <Plus size={16} /> Tambah Tagihan
                    </button>
                </div>

                {/* ── Stats Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Tagihan', value: summary?.total ?? 0,   sub: null,                              bg: 'bg-slate-50',   text: 'text-slate-700',  dot: 'bg-slate-400' },
                        { label: 'Lunas',         value: summary?.lunas ?? 0,   sub: fmtRupiah(summary?.nominal_lunas ?? 0), bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
                        { label: 'Belum Bayar',   value: summary?.belum ?? 0,   sub: null,                              bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
                        { label: 'Cicilan',       value: summary?.cicilan ?? 0, sub: null,                              bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-white/80`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">{s.label}</span>
                            </div>
                            <div className={`text-[22px] font-black ${s.text} leading-none`}>{s.value}</div>
                            {s.sub && <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{s.sub}</div>}
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                            placeholder="Cari nama siswa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                        value={filterTahun}
                        onChange={(e) => setFilterTahun(e.target.value)}
                    >
                        <option value="">Semua Tahun</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value)}
                    >
                        <option value="">Semua Bulan</option>
                        {BULAN.slice(1).map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
                    </select>
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="lunas">Lunas</option>
                        <option value="belum">Belum Bayar</option>
                        <option value="cicilan">Cicilan</option>
                    </select>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="text-left px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Siswa</th>
                                    <th className="text-left px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Periode</th>
                                    <th className="text-right px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Nominal</th>
                                    <th className="text-center px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Status</th>
                                    <th className="text-left px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Tgl Bayar</th>
                                    <th className="text-left px-4 py-3 font-extrabold text-slate-500 uppercase text-[11px] tracking-wide">Keterangan</th>
                                    <th className="px-4 py-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-14">
                                            <Loader2 size={26} className="animate-spin text-teal-700 inline" />
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-14">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <CreditCard size={28} strokeWidth={1.5} />
                                                <span className="text-[13px] font-semibold">Belum ada data tagihan SPP.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-teal-700/10 text-teal-700 flex items-center justify-center font-extrabold text-[12px] shrink-0">
                                                        {p.student_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-900 truncate max-w-[150px]">{p.student_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">
                                                {BULAN[p.bulan]} {p.tahun}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                                {fmtRupiah(p.nominal)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${STATUS_STYLE[p.status]}`}>
                                                    {STATUS_LABEL[p.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">
                                                {p.tanggal_bayar ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 font-medium max-w-[160px] truncate">
                                                {p.keterangan ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {p.status === 'menunggu' && (
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                            title="Verifikasi bukti bayar"
                                                            onClick={() => setReviewTarget(p)}
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                                                        onClick={() => setEditTarget(p)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        onClick={() => setDeleteTarget(p)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <span className="text-[12px] text-slate-500 font-medium">
                            {meta.total} tagihan{meta.last_page > 1 ? ` · Hal ${meta.page}/${meta.last_page}` : ''}
                        </span>
                        {meta.last_page > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                    disabled={page >= meta.last_page}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAdd && (
                <AddModal
                    onClose={() => setShowAdd(false)}
                    onSaved={(msg) => { setShowAdd(false); fetchData(); showToast(msg); }}
                />
            )}
            {editTarget && (
                <EditModal
                    payment={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={() => { setEditTarget(null); fetchData(); showToast('Tagihan berhasil diperbarui.'); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    payment={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); fetchData(); showToast('Tagihan berhasil dihapus.'); }}
                />
            )}
            {reviewTarget && (
                <ReviewModal
                    payment={reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    onDone={(msg) => { setReviewTarget(null); fetchData(); showToast(msg); }}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
