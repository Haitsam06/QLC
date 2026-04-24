import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, GraduationCap, Phone, BookOpen, Loader2, AlertCircle, CheckCircle2, Filter, Eye, EyeOff, ChevronDown, Check } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Teacher {
    id: string;
    user_id: string | null;
    nama_guru: string;
    phone: string;
    spesialisasi: string;
    created_at: string | null;
}
interface Meta {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
}
interface AddFormData {
    nama_guru: string;
    phone: string;
    spesialisasi: string;
    username: string;
    password: string;
    email: string;
}
interface EditFormData {
    nama_guru: string;
    phone: string;
    spesialisasi: string;
}

type FormData = AddFormData | EditFormData;

const EMPTY_ADD: AddFormData = { nama_guru: '', phone: '', spesialisasi: '', username: '', password: '', email: '' };
const EMPTY_EDIT: EditFormData = { nama_guru: '', phone: '', spesialisasi: '' };
const API = '/api/teachers';

/* ── Helpers ── */
const initials = (n: string) =>
    n
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
function useDebounce<T>(val: T, ms = 400): T {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${type === 'success' ? 'bg-teal-700' : 'bg-red-600'}`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>
    );
}

/* ── Add Modal ── */
function AddModal({ specs, onClose, onSave }: { specs: string[]; onClose: () => void; onSave: (d: AddFormData) => Promise<void> }) {
    const [f, setF] = useState<AddFormData>(EMPTY_ADD);
    const [e, setE] = useState<Partial<Record<keyof AddFormData, string>>>({});
    const [busy, setBusy] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const upd = (k: keyof AddFormData) => (ev: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: ev.target.value }));

    const validate = () => {
        const err: Partial<Record<keyof AddFormData, string>> = {};
        if (!f.nama_guru.trim()) err.nama_guru = 'Nama wajib diisi.';
        if (!f.phone.trim()) err.phone = 'Telepon wajib diisi.';
        else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = 'Format tidak valid.';
        if (!f.spesialisasi.trim()) err.spesialisasi = 'Spesialisasi wajib diisi.';
        if (!f.username.trim()) err.username = 'Username wajib diisi.';
        else if (!/^[a-zA-Z0-9]{4,50}$/.test(f.username)) err.username = 'Min 4 karakter, huruf & angka.';
        if (!f.password) err.password = 'Password wajib diisi.';
        else if (f.password.length < 8) err.password = 'Min 8 karakter.';
        if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = 'Format email tidak valid.';
        setE(err);
        return !Object.keys(err).length;
    };

    const submit = async () => {
        if (!validate()) return;
        setBusy(true);
        try {
            await onSave(f);
        } finally {
            setBusy(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(ev) => ev.target === ev.currentTarget && onClose()}
        >
            <div className="w-full max-w-[480px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-extrabold text-slate-900">Tambah Guru Baru</span>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    {/* ── Info Guru ── */}
                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 my-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">
                        Data Guru
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nama Guru</label>
                        <input
                            className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.nama_guru ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                            placeholder="Contoh: Ahmad Fauzi, S.Pd"
                            value={f.nama_guru}
                            onChange={upd('nama_guru')}
                        />
                        {e.nama_guru && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.nama_guru}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nomor Telepon</label>
                            <input
                                className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                placeholder="08123456789"
                                value={f.phone}
                                onChange={upd('phone')}
                            />
                            {e.phone && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.phone}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Spesialisasi</label>
                            <input
                                className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.spesialisasi ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                placeholder="Matematika"
                                value={f.spesialisasi}
                                onChange={upd('spesialisasi')}
                                list="sl"
                            />
                            <datalist id="sl">
                                {specs.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                            {e.spesialisasi && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.spesialisasi}</span>}
                        </div>
                    </div>

                    {/* ── Akun ── */}
                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mt-3 mb-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">
                        Akun Login
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Username <span className="bg-teal-600/10 text-teal-700 px-2 py-0.5 rounded-full lowercase tracking-normal ml-2">role: teacher</span>
                        </label>
                        <input
                            className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.username ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                            placeholder="min. 4 karakter, huruf & angka"
                            value={f.username}
                            onChange={upd('username')}
                            autoComplete="off"
                        />
                        {e.username && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.username}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Password</label>
                        <div className="relative w-full">
                            <input
                                className={`w-full h-11 pl-4 pr-11 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.password ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                type={showPw ? 'text' : 'password'}
                                placeholder="min. 8 karakter"
                                value={f.password}
                                onChange={upd('password')}
                                autoComplete="new-password"
                            />
                            <button
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-700 transition-colors focus:outline-none"
                                type="button"
                                onClick={() => setShowPw((p) => !p)}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {e.password && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.password}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Email <span className="text-slate-400 font-medium normal-case tracking-normal">(opsional)</span>
                        </label>
                        <input
                            className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.email ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                            type="email"
                            placeholder="guru@sekolah.ac.id"
                            value={f.email}
                            onChange={upd('email')}
                        />
                        {e.email && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.email}</span>}
                    </div>
                </div>

                <div className="flex justify-end gap-2.5 px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-[24px]">
                    <button
                        className="px-5 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="px-6 h-11 rounded-xl text-[13px] font-bold text-white bg-teal-600 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all hover:bg-teal-700 hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none"
                        onClick={submit}
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} /> Tambah Guru
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── Edit Modal ── */
function EditModal({ init, specs, onClose, onSave }: { init: EditFormData; specs: string[]; onClose: () => void; onSave: (d: EditFormData) => Promise<void> }) {
    const [f, setF] = useState<EditFormData>(init);
    const [e, setE] = useState<Partial<Record<keyof EditFormData, string>>>({});
    const [busy, setBusy] = useState(false);

    const upd = (k: keyof EditFormData) => (ev: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: ev.target.value }));

    const validate = () => {
        const err: Partial<Record<keyof EditFormData, string>> = {};
        if (!f.nama_guru.trim()) err.nama_guru = 'Nama wajib diisi.';
        if (!f.phone.trim()) err.phone = 'Telepon wajib diisi.';
        else if (!/^[0-9+\-\s]{8,20}$/.test(f.phone)) err.phone = 'Format tidak valid.';
        if (!f.spesialisasi.trim()) err.spesialisasi = 'Spesialisasi wajib diisi.';
        setE(err);
        return !Object.keys(err).length;
    };

    const submit = async () => {
        if (!validate()) return;
        setBusy(true);
        try {
            await onSave(f);
        } finally {
            setBusy(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(ev) => ev.target === ev.currentTarget && onClose()}
        >
            <div className="w-full max-w-[480px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-extrabold text-slate-900">Edit Data Guru</span>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nama Guru</label>
                        <input
                            className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.nama_guru ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                            placeholder="Contoh: Ahmad Fauzi, S.Pd"
                            value={f.nama_guru}
                            onChange={upd('nama_guru')}
                        />
                        {e.nama_guru && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.nama_guru}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nomor Telepon</label>
                            <input
                                className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                placeholder="08123456789"
                                value={f.phone}
                                onChange={upd('phone')}
                            />
                            {e.phone && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.phone}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Spesialisasi</label>
                            <input
                                className={`h-11 px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.spesialisasi ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                placeholder="Matematika"
                                value={f.spesialisasi}
                                onChange={upd('spesialisasi')}
                                list="sl-edit"
                            />
                            <datalist id="sl-edit">
                                {specs.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                            {e.spesialisasi && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.spesialisasi}</span>}
                        </div>
                    </div>

                    <div className="flex flex-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mt-2">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-[12.5px] text-blue-700 font-semibold leading-relaxed">
                            Username & password login guru tidak berubah. Hubungi administrator untuk melakukan reset kata sandi.
                        </span>
                    </div>
                </div>
                <div className="flex justify-end gap-2.5 px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-[24px]">
                    <button
                        className="px-5 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="px-6 h-11 rounded-xl text-[13px] font-bold text-white bg-teal-600 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all hover:bg-teal-700 hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none"
                        onClick={submit}
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} /> Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── Delete Modal ── */
function DeleteModal({ teacher, onClose, onConfirm }: { teacher: Teacher; onClose: () => void; onConfirm: () => Promise<void> }) {
    const [busy, setBusy] = useState(false);
    const go = async () => {
        setBusy(true);
        try {
            await onConfirm();
        } finally {
            setBusy(false);
        }
    };
    return createPortal(
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(ev) => ev.target === ev.currentTarget && onClose()}
        >
            <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
                <div className="pt-8 px-7 pb-5 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                        <Trash2 size={28} />
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900 mt-1">Hapus Guru?</div>
                    <div className="text-[13.5px] text-slate-500 leading-relaxed px-2">
                        Data <b>{teacher.nama_guru}</b> akan dihapus permanen dan tidak dapat dikembalikan.
                    </div>
                </div>
                <div className="flex gap-2.5 px-7 pb-7">
                    <button
                        className="flex-1 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-red-600 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:bg-red-700 hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none"
                        onClick={go}
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} /> Hapus
                            </>
                        )}
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
export default function GuruPage() {
    const [data, setData] = useState<Teacher[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, per_page: 10, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [spec, setSpec] = useState('');
    const [specs, setSpecs] = useState<string[]>([]);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<Teacher | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [filterOpen, setFilterOpen] = useState(false);

    const dSearch = useDebounce(search);

    const load = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const p = new URLSearchParams({ page: String(page), per_page: '10', search: dSearch, spesialisasi: spec });
                const j = await (await fetch(`${API}?${p}`)).json();
                if (j.success) {
                    setData(j.data);
                    setMeta(j.meta);
                }
            } catch {
                setToast({ msg: 'Gagal memuat data.', type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [dSearch, spec]
    );

    const loadSpecs = useCallback(async () => {
        try {
            const j = await (await fetch(`${API}/spesialisasi`)).json();
            if (j.success) setSpecs(j.data);
        } catch {}
    }, []);

    useEffect(() => {
        load(1);
    }, [load]);
    useEffect(() => {
        loadSpecs();
    }, [loadSpecs]);

    const post = async (d: AddFormData) => {
        const j = await (await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })).json();
        if (j.success) {
            setToast({ msg: 'Guru & akun berhasil ditambahkan.', type: 'success' });
            setModal(null);
            load(1);
            loadSpecs();
        } else if (j.errors) {
            const firstErr = Object.values(j.errors as Record<string, string[]>)[0]?.[0];
            setToast({ msg: firstErr ?? 'Validasi gagal.', type: 'error' });
        } else setToast({ msg: j.message ?? 'Gagal menambahkan.', type: 'error' });
    };

    const put = async (d: EditFormData) => {
        if (!sel) return;
        const j = await (await fetch(`${API}/${sel.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })).json();
        if (j.success) {
            setToast({ msg: 'Data berhasil diperbarui.', type: 'success' });
            setModal(null);
            load(meta.page);
            loadSpecs();
        } else setToast({ msg: j.message ?? 'Gagal memperbarui.', type: 'error' });
    };

    const del = async () => {
        if (!sel) return;
        const j = await (await fetch(`${API}/${sel.id}`, { method: 'DELETE', headers: { Accept: 'application/json' } })).json();
        if (j.success) {
            setToast({ msg: 'Guru berhasil dihapus.', type: 'success' });
            setModal(null);
            load(data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page);
            loadSpecs();
        } else setToast({ msg: j.message ?? 'Gagal menghapus.', type: 'error' });
    };

    const pgs = () => {
        const { page, last_page } = meta;
        const s = Math.max(1, page - 2),
            e = Math.min(last_page, page + 2);
        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    };

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(15px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

            <div className="flex flex-col gap-6 w-full text-slate-900">
                {/* Header */}
                <div className="flex justify-between items-end flex-wrap gap-3">
                    <div>
                        <div className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">Manajemen Guru</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-medium">Kelola seluruh data guru yang terdaftar di sistem</div>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12.5px] font-bold text-slate-900">
                            <span className="w-2 h-2 rounded-full inline-block bg-teal-700" />
                            {meta.total} Guru Terdaftar
                        </div>
                        {specs.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12.5px] font-bold text-slate-900">
                                <span className="w-2 h-2 rounded-full inline-block bg-blue-600" />
                                {specs.length} Spesialisasi
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-3 flex-wrap items-center flex-col sm:flex-row">
                    {/* Pencarian */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-[220px] w-full sm:w-auto h-11 px-4 bg-white border border-slate-300 rounded-xl transition-all focus-within:ring-2 focus-within:ring-teal-600/15 focus-within:border-teal-600 focus-within:shadow-sm">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            placeholder="Cari nama, telepon, spesialisasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 text-[13.5px] font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400 placeholder:font-normal"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-slate-400 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 transition-colors hover:bg-red-100 hover:text-red-600 cursor-pointer focus:outline-none"
                                title="Bersihkan pencarian"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    {/* Custom Dropdown Filter */}
                    <div className="relative w-full sm:w-auto">
                        <div
                            className={`flex items-center gap-2 h-11 px-4 min-w-[200px] bg-white border rounded-xl cursor-pointer select-none transition-all hover:bg-slate-50 ${filterOpen ? 'ring-2 ring-teal-600/15 border-teal-600' : 'border-slate-300'}`}
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <Filter size={15} className="text-slate-400 shrink-0" />
                            <span className="flex-1 text-[13.5px] font-bold text-slate-700 text-left">{spec || 'Semua Spesialisasi'}</span>
                            <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {filterOpen && (
                            <>
                                <div className="fixed inset-0 z-[99]" onClick={() => setFilterOpen(false)} />
                                <div className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white border border-slate-200 rounded-[16px] shadow-xl p-2 flex flex-col gap-1 z-[100] animate-[fadeIn_0.15s_ease-out]">
                                    <div
                                        className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${spec === '' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}
                                        onClick={() => {
                                            setSpec('');
                                            setFilterOpen(false);
                                        }}
                                    >
                                        <span>Semua Spesialisasi</span>
                                        {spec === '' && <Check size={16} />}
                                    </div>

                                    {specs.map((s) => (
                                        <div
                                            key={s}
                                            className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${spec === s ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}
                                            onClick={() => {
                                                setSpec(s);
                                                setFilterOpen(false);
                                            }}
                                        >
                                            <span>{s}</span>
                                            {spec === s && <Check size={16} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl bg-teal-600 text-white text-[13.5px] font-bold shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 focus:outline-none"
                        onClick={() => {
                            setSel(null);
                            setModal('add');
                        }}
                    >
                        <Plus size={16} /> Tambah Guru
                    </button>
                </div>

                {/* Table Card */}
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto relative z-10 w-full">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">#</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Guru</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Spesialisasi</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Telepon</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">Terdaftar</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading &&
                                    data.map((t, i) => (
                                        <tr key={t.id} className="transition-colors hover:bg-slate-50 group border-b border-slate-100 last:border-0">
                                            <td className="px-6 py-4 text-[12px] font-bold text-slate-400">{(meta.page - 1) * meta.per_page + i + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl shrink-0 bg-teal-600 flex items-center justify-center font-black text-[14px] text-white tracking-wide shadow-sm shadow-teal-600/20">
                                                        {initials(t.nama_guru)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[14px] font-bold text-slate-900 tracking-tight truncate max-w-[200px]">{t.nama_guru}</div>
                                                        {t.user_id && <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">UID: {t.user_id}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 border border-teal-100 text-[12px] font-bold text-teal-700 whitespace-nowrap">
                                                    <BookOpen size={12} />
                                                    {t.spesialisasi}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600">
                                                    <Phone size={13} className="text-slate-400" />
                                                    {t.phone}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-slate-500 hidden lg:table-cell">
                                                {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-blue-600 shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-200 focus:outline-none"
                                                        title="Edit"
                                                        onClick={() => {
                                                            setSel(t);
                                                            setModal('edit');
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-red-600 shadow-sm transition-colors hover:bg-red-50 hover:border-red-200 focus:outline-none"
                                                        title="Hapus"
                                                        onClick={() => {
                                                            setSel(t);
                                                            setModal('delete');
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div className="py-20 px-5 flex justify-center w-full">
                            <Loader2 size={32} className="text-teal-600 animate-spin" />
                        </div>
                    )}

                    {!loading && data.length === 0 && (
                        <div className="py-20 px-5 text-center flex flex-col items-center gap-3 w-full">
                            <GraduationCap size={48} className="text-slate-300 mb-2" />
                            <div className="text-[14px] text-slate-500 font-semibold">
                                {search || spec ? 'Tidak ada guru yang sesuai dengan filter pencarian.' : 'Belum ada data guru yang terdaftar.'}
                            </div>
                            {!search && !spec && (
                                <button
                                    className="mt-2 flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-teal-600 text-white text-[13px] font-bold shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 focus:outline-none"
                                    onClick={() => setModal('add')}
                                >
                                    <Plus size={16} /> Tambah Data Guru Pertama
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 flex-wrap gap-3 bg-white w-full">
                            <span className="text-[13px] font-medium text-slate-500">
                                {(meta.page - 1) * meta.per_page + 1} – {Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} guru
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold bg-white border border-slate-200 text-teal-700 transition-colors cursor-pointer shadow-sm hover:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={meta.page === 1}
                                    onClick={() => load(meta.page - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {pgs().map((p) => (
                                    <button
                                        key={p}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors cursor-pointer shadow-sm focus:outline-none ${p === meta.page ? 'bg-teal-600 text-white border-transparent hover:bg-teal-700' : 'bg-white border border-slate-200 text-teal-700 hover:bg-slate-50'}`}
                                        onClick={() => load(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold bg-white border border-slate-200 text-teal-700 transition-colors cursor-pointer shadow-sm hover:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={meta.page === meta.last_page}
                                    onClick={() => load(meta.page + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal === 'add' && <AddModal specs={specs} onClose={() => setModal(null)} onSave={post} />}
            {modal === 'edit' && sel && <EditModal init={{ nama_guru: sel.nama_guru, phone: sel.phone, spesialisasi: sel.spesialisasi }} specs={specs} onClose={() => setModal(null)} onSave={put} />}
            {modal === 'delete' && sel && <DeleteModal teacher={sel} onClose={() => setModal(null)} onConfirm={del} />}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
