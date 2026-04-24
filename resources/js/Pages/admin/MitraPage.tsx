import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Handshake,
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    CheckCircle2,
    Search,
    ChevronLeft,
    ChevronRight,
    Phone,
    Building2,
    FileText,
    Filter,
    ExternalLink,
    ChevronDown,
    Check,
    AlertCircle,
    User,
    Lock,
    Mail,
    Upload,
    FileBadge,
    Download,
    File,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Status = 'Active' | 'Inactive';

interface Mitra {
    id: string;
    user_id?: string | null;
    institution_name: string;
    contact_person: string;
    phone: string;
    mou_file_url: string | null;
    status: Status;
    created_at?: string | null;
}

interface Meta {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
}

const BASE = '/api';

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function initials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}
function formatBytes(b: number) {
    if (b === 0) return '0 B';
    return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
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
            {type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM STATE
═══════════════════════════════════════════════════════════ */
interface FormState {
    institution_name: string;
    contact_person: string;
    phone: string;
    mou_file: File | null;
    mou_file_url: string | null;
    status: Status;
    username?: string;
    password?: string;
    email?: string;
}
const emptyForm = (): FormState => ({
    institution_name: '',
    contact_person: '',
    phone: '',
    mou_file: null,
    mou_file_url: null,
    status: 'Active',
    username: '',
    password: '',
    email: '',
});

/* ═══════════════════════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════════════════════ */
function MitraModal({ init, onClose, onSave }: { init: FormState & { id?: string }; onClose: () => void; onSave: (f: FormState) => Promise<void> }) {
    const [f, setF] = useState<FormState>(init);
    const [e, setE] = useState<Partial<Record<keyof FormState, string>>>({});
    const [busy, setBusy] = useState(false);
    const isEdit = Boolean(init.id);

    // State dan Ref untuk fitur Upload
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upd = (k: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement>) => {
        setF((p) => ({ ...p, [k]: ev.target.value }));
        setE((p) => ({ ...p, [k]: '' }));
    };

    // Handler validasi dan set file
    const handleFile = (file: File) => {
        const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (!ok.includes(file.type)) {
            setE((p) => ({ ...p, mou_file: 'Format file tidak didukung (Gunakan PDF, DOC/DOCX, JPG, atau PNG).' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setE((p) => ({ ...p, mou_file: 'Ukuran file maksimal 5MB.' }));
            return;
        }
        setF((p) => ({ ...p, mou_file: file }));
        setE((p) => ({ ...p, mou_file: '' })); // Hapus pesan error jika file valid
    };

    const validate = () => {
        const err: typeof e = {};
        if (!f.institution_name.trim()) err.institution_name = 'Nama institusi wajib diisi.';
        if (!f.contact_person.trim()) err.contact_person = 'Nama kontak wajib diisi.';
        if (!f.phone.trim()) err.phone = 'Nomor telepon wajib diisi.';

        // Validasi akun hanya untuk mode Tambah (Add)
        if (!isEdit) {
            if (!f.username?.trim()) err.username = 'Username wajib diisi.';
            if (!f.password?.trim() || f.password.length < 8) err.password = 'Password minimal 8 karakter.';
        }

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
            <div className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-extrabold text-slate-900">{isEdit ? 'Edit Mitra' : 'Tambah Mitra'}</span>
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    {/* ── SEGMEN INFORMASI AKUN (Hanya saat Tambah Mitra) ── */}
                    {!isEdit && (
                        <>
                            <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-purple-600 my-1 before:content-[''] before:flex-1 before:h-px before:bg-purple-100 after:content-[''] after:flex-1 after:h-px after:bg-purple-100">
                                Informasi Akun Mitra
                            </div>

                            {/* Username */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        className={`h-11 w-full pl-10 pr-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.username ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                                        placeholder="Username untuk login mitra"
                                        value={f.username}
                                        onChange={upd('username')}
                                    />
                                </div>
                                {e.username && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.username}</span>}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="password"
                                        className={`h-11 w-full pl-10 pr-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.password ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                                        placeholder="Minimal 8 karakter"
                                        value={f.password}
                                        onChange={upd('password')}
                                    />
                                </div>
                                {e.password && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.password}</span>}
                            </div>

                            {/* Email (Opsional) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                    Email <span className="font-medium normal-case text-slate-400 ml-1">(opsional)</span>
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        className={`h-11 w-full pl-10 pr-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.email ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                                        placeholder="email@institusi.com"
                                        value={f.email}
                                        onChange={upd('email')}
                                    />
                                </div>
                                {e.email && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.email}</span>}
                            </div>

                            <div className="h-2" />
                            <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-purple-600 my-1 before:content-[''] before:flex-1 before:h-px before:bg-purple-100 after:content-[''] after:flex-1 after:h-px after:bg-purple-100">
                                Profil Institusi
                            </div>
                        </>
                    )}

                    {/* Nama Institusi */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nama Institusi</label>
                        <input
                            className={`h-11 w-full px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.institution_name ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                            placeholder="Contoh: Yayasan Pendidikan Nusantara"
                            value={f.institution_name}
                            onChange={upd('institution_name')}
                        />
                        {e.institution_name && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.institution_name}</span>}
                    </div>

                    {/* Contact Person */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nama Kontak (PIC)</label>
                        <input
                            className={`h-11 w-full px-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.contact_person ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                            placeholder="Nama lengkap penanggung jawab"
                            value={f.contact_person}
                            onChange={upd('contact_person')}
                        />
                        {e.contact_person && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.contact_person}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nomor Telepon</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                className={`h-11 w-full pl-10 pr-4 bg-slate-50 border rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${e.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/15'}`}
                                placeholder="08123456789"
                                value={f.phone}
                                onChange={upd('phone')}
                            />
                        </div>
                        {e.phone && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.phone}</span>}
                    </div>

                    {/* MOU File Upload (Drag & Drop) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            File MOU <span className="font-medium normal-case text-slate-400 ml-1">(opsional)</span>
                        </label>

                        <div
                            className={`border-2 border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-purple-600 bg-purple-50' : f.mou_file ? 'border-green-500 bg-green-50/50 border-solid' : 'border-slate-300 bg-slate-50 hover:border-purple-500 hover:bg-slate-100'}`}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleFile(file);
                            }}
                        >
                            {f.mou_file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileBadge size={36} className="text-green-600" />
                                    <div className="font-bold text-slate-900 text-[13.5px] truncate max-w-xs">{f.mou_file.name}</div>
                                    <div className="text-[11.5px] text-slate-500 font-medium">{formatBytes(f.mou_file.size)}</div>
                                    <div className="text-[11.5px] text-green-600 font-bold mt-1">✓ File siap diupload</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload size={32} className="text-slate-400 mb-1" />
                                    <div className="font-bold text-slate-700 text-[13px]">Klik atau drag & drop file di sini</div>
                                    <div className="text-[11.5px] text-slate-500 font-medium">PDF, DOC, DOCX, JPG, PNG — max 5MB</div>
                                </div>
                            )}
                        </div>

                        {/* Hidden Input File */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                            }}
                        />
                        {/* Error Message for File */}
                        {e.mou_file && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.mou_file}</span>}

                        {/* Tampilkan link jika sedang mode edit dan file MOU lama sudah ada */}
                        {isEdit && f.mou_file_url && !f.mou_file && (
                            <a
                                href={f.mou_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-purple-50 border border-purple-200 rounded-xl text-[12px] font-bold text-purple-700 hover:bg-purple-100 transition-colors w-fit"
                            >
                                <File size={14} />
                                Lihat Dokumen MOU Saat Ini
                                <Download size={13} className="ml-1" />
                            </a>
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Status</label>
                        <div className="flex gap-2">
                            {(['Active', 'Inactive'] as Status[]).map((s) => {
                                const isActive = f.status === s;
                                let btnClasses = 'flex-1 h-11 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 border transition-all focus:outline-none ';

                                if (isActive) {
                                    if (s === 'Active') btnClasses += 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20';
                                    else btnClasses += 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/20';
                                } else {
                                    btnClasses += 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400';
                                }

                                return (
                                    <button key={s} type="button" className={btnClasses} onClick={() => setF((p) => ({ ...p, status: s }))}>
                                        {isActive && <Check size={14} strokeWidth={3} />}
                                        {s === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                                    </button>
                                );
                            })}
                        </div>
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
                        className="px-6 h-11 rounded-xl text-[13px] font-bold text-white bg-purple-600 shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                        onClick={submit}
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Mitra'}
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
   DELETE MODAL
═══════════════════════════════════════════════════════════ */
function DeleteModal({ mitra, onClose, onConfirm }: { mitra: Mitra; onClose: () => void; onConfirm: () => Promise<void> }) {
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
                    <div className="text-[18px] font-extrabold text-slate-900 mt-1">Hapus Mitra?</div>
                    <div className="text-[13.5px] text-slate-500 leading-relaxed px-2">
                        Data <b>{mitra.institution_name}</b> akan dihapus permanen dan tidak dapat dikembalikan.
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
                        className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-red-600 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
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
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function MitraPage() {
    const [data, setData] = useState<Mitra[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, per_page: 10, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('');

    const [filterOpen, setFilterOpen] = useState(false);

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState<Mitra | null>(null);
    const [delModal, setDelModal] = useState<Mitra | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    const dSearch = useDebounce(search);

    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const p = new URLSearchParams({ page: String(page), per_page: '10', search: dSearch, status: statusF });
                const res = await fetch(`${BASE}/partners?${p}`);
                const data = await res.json();
                if (data.success) {
                    setData(data.data);
                    setMeta(data.meta);
                }
            } catch {
                showToast('Gagal memuat data.', 'err');
            } finally {
                setLoading(false);
            }
        },
        [dSearch, statusF]
    );

    useEffect(() => {
        load(1);
    }, [load]);

    /* stat counts */
    const totalActive = data.filter((d) => d.status === 'Active').length;
    const totalInactive = data.filter((d) => d.status === 'Inactive').length;

    /* pagination pages */
    const pages = () => {
        const { page, last_page } = meta;
        const s = Math.max(1, page - 2),
            e = Math.min(last_page, page + 2);
        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    };

    /* CRUD handlers */
    const handleAdd = async (f: FormState) => {
        const formData = new FormData();
        Object.entries(f).forEach(([key, value]) => {
            // Kita tidak mengirimkan 'mou_file_url' ke backend saat proses upload
            if (value !== null && value !== undefined && key !== 'mou_file_url') {
                formData.append(key, value as string | Blob);
            }
        });

        const res = await fetch(`${BASE}/partners`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            showToast('Mitra berhasil ditambahkan.');
            setAddModal(false);
            load(1);
        } else showToast(data.message ?? 'Gagal menyimpan data mitra. Silakan periksa kembali input Anda.', 'err');
    };

    const handleEdit = async (f: FormState) => {
        const formData = new FormData();
        Object.entries(f).forEach(([key, value]) => {
            if (value !== null && value !== undefined && key !== 'mou_file_url') {
                formData.append(key, value as string | Blob);
            }
        });
        // PENTING UNTUK LARAVEL: Kita menggunakan POST, tapi menyisipkan _method PUT
        // karena PHP tidak bisa membaca file dari form-data dengan method PUT murni.
        formData.append('_method', 'PUT');

        const res = await fetch(`${BASE}/partners/${editModal!.id}`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            showToast('Data mitra diperbarui.');
            setEditModal(null);
            load(meta.page);
        } else showToast(data.message ?? 'Gagal memperbarui.', 'err');
    };

    const handleDelete = async () => {
        const res = await fetch(`${BASE}/partners/${delModal!.id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('Mitra berhasil dihapus.');
            setDelModal(null);
            const prevPage = data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page;
            load(prevPage);
        } else showToast(json.message ?? 'Gagal menghapus.', 'err');
    };

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(15px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

            <div className="flex flex-col gap-6 w-full text-slate-900">
                {/* ── Header ── */}
                <div className="flex justify-between items-end flex-wrap gap-3">
                    <div>
                        <div className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">Mitra</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-medium">Kelola data institusi mitra dan dokumen MOU</div>
                    </div>

                    {/* ── Chips ── */}
                    <div className="flex gap-2.5 flex-wrap">
                        {[
                            { label: 'Total Mitra', value: meta.total, color: 'bg-purple-600' },
                            { label: 'Mitra Aktif', value: totalActive, color: 'bg-green-600' },
                            { label: 'Tidak Aktif', value: totalInactive, color: 'bg-slate-500' },
                        ].map((c) => (
                            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12.5px] font-bold text-slate-900">
                                <span className={`w-2 h-2 rounded-full inline-block ${c.color}`} />
                                <span>{c.value}</span>
                                <span className="text-slate-500 font-semibold">{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex gap-3 flex-wrap items-center flex-col sm:flex-row">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[220px] w-full sm:w-auto h-11 px-4 bg-white border border-slate-300 rounded-xl transition-all focus-within:ring-2 focus-within:ring-purple-600/15 focus-within:border-purple-600 focus-within:shadow-sm">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            placeholder="Cari institusi atau kontak..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 text-[13.5px] font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400 placeholder:font-normal"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-slate-400 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 transition-colors hover:bg-red-100 hover:text-red-600 cursor-pointer focus:outline-none"
                                title="Bersihkan"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <div
                            className={`flex items-center gap-2 h-11 px-4 min-w-[200px] bg-white border rounded-xl cursor-pointer select-none transition-all hover:bg-slate-50 ${filterOpen ? 'ring-2 ring-purple-600/15 border-purple-600' : 'border-slate-300'}`}
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <Filter size={15} className="text-slate-400 shrink-0" />
                            <span className="flex-1 text-[13.5px] font-bold text-slate-700 text-left">{statusF === 'Active' ? 'Aktif' : statusF === 'Inactive' ? 'Tidak Aktif' : 'Semua Status'}</span>
                            <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {filterOpen && (
                            <>
                                <div className="fixed inset-0 z-[99]" onClick={() => setFilterOpen(false)} />
                                <div className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white border border-slate-200 rounded-[16px] shadow-xl p-2 flex flex-col gap-1 z-[100] animate-[fadeIn_0.15s_ease-out]">
                                    <div
                                        className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${statusF === '' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-purple-700'}`}
                                        onClick={() => {
                                            setStatusF('');
                                            setFilterOpen(false);
                                        }}
                                    >
                                        <span>Semua Status</span>
                                        {statusF === '' && <Check size={16} />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${statusF === 'Active' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-purple-700'}`}
                                        onClick={() => {
                                            setStatusF('Active');
                                            setFilterOpen(false);
                                        }}
                                    >
                                        <span>Aktif</span>
                                        {statusF === 'Active' && <Check size={16} />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${statusF === 'Inactive' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-purple-700'}`}
                                        onClick={() => {
                                            setStatusF('Inactive');
                                            setFilterOpen(false);
                                        }}
                                    >
                                        <span>Tidak Aktif</span>
                                        {statusF === 'Inactive' && <Check size={16} />}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl bg-purple-600 text-white text-[13.5px] font-bold shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700 focus:outline-none"
                        onClick={() => setAddModal(true)}
                    >
                        <Plus size={16} /> Tambah Mitra
                    </button>
                </div>

                {/* ── Table ── */}
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto relative z-10 w-full">
                        {loading ? (
                            <div className="py-20 px-5 flex justify-center w-full">
                                <Loader2 size={32} className="text-purple-600 animate-spin" />
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-20 px-5 text-center flex flex-col items-center gap-3 w-full">
                                <Handshake size={48} className="text-slate-300 mb-2" />
                                <div className="text-[14px] text-slate-500 font-semibold">{search || statusF ? 'Tidak ada mitra yang sesuai filter.' : 'Belum ada data mitra yang terdaftar.'}</div>
                                {!search && !statusF && (
                                    <button
                                        className="mt-2 flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-purple-600 text-white text-[13px] font-bold shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700 focus:outline-none"
                                        onClick={() => setAddModal(true)}
                                    >
                                        <Plus size={16} /> Tambah Data Mitra Pertama
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Institusi</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Kontak (PIC)</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Telepon</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">Dokumen MOU</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((m) => (
                                        <tr key={m.id} className="transition-colors hover:bg-slate-50 group border-b border-slate-100 last:border-0">
                                            {/* Institusi */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl shrink-0 bg-purple-600 flex items-center justify-center font-black text-[14px] text-white tracking-wide shadow-sm shadow-purple-600/20">
                                                        {initials(m.institution_name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[14px] font-bold text-slate-900 tracking-tight truncate max-w-[200px]">{m.institution_name}</div>
                                                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">ID: {m.id.slice(-6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kontak */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900">
                                                    <Building2 size={14} className="text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{m.contact_person}</span>
                                                </div>
                                            </td>

                                            {/* Telepon */}
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                                                    <Phone size={14} className="text-slate-400 shrink-0" />
                                                    <span>{m.phone}</span>
                                                </div>
                                            </td>

                                            {/* MOU */}
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                {m.mou_file_url ? (
                                                    <a
                                                        href={m.mou_file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-[11.5px] font-bold text-purple-700 hover:bg-purple-100 transition-colors focus:outline-none whitespace-nowrap"
                                                    >
                                                        <FileText size={12} /> Lihat MOU <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[13px] text-slate-400 font-medium">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold whitespace-nowrap border ${m.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}`} />
                                                    {m.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-blue-600 shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-200 focus:outline-none"
                                                        onClick={() => setEditModal(m)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-red-600 shadow-sm transition-colors hover:bg-red-50 hover:border-red-200 focus:outline-none"
                                                        onClick={() => setDelModal(m)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 flex-wrap gap-3 bg-white w-full">
                            <span className="text-[13px] font-medium text-slate-500">
                                {(meta.page - 1) * meta.per_page + 1} – {Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} mitra
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold bg-white border border-slate-200 text-purple-700 transition-colors cursor-pointer shadow-sm hover:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={meta.page === 1}
                                    onClick={() => load(meta.page - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {pages().map((p) => (
                                    <button
                                        key={p}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors cursor-pointer shadow-sm focus:outline-none ${p === meta.page ? 'bg-purple-600 text-white border-transparent hover:bg-purple-700' : 'bg-white border border-slate-200 text-purple-700 hover:bg-slate-50'}`}
                                        onClick={() => load(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold bg-white border border-slate-200 text-purple-700 transition-colors cursor-pointer shadow-sm hover:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            {addModal && <MitraModal init={{ ...emptyForm() }} onClose={() => setAddModal(false)} onSave={handleAdd} />}
            {editModal && (
                <MitraModal
                    init={{
                        id: editModal.id,
                        institution_name: editModal.institution_name,
                        contact_person: editModal.contact_person,
                        phone: editModal.phone,
                        mou_file: null, // File baru tidak wajib saat edit, jadi inisialisasi dengan null
                        mou_file_url: editModal.mou_file_url ?? '',
                        status: editModal.status,
                    }}
                    onClose={() => setEditModal(null)}
                    onSave={handleEdit}
                />
            )}
            {delModal && <DeleteModal mitra={delModal} onClose={() => setDelModal(null)} onConfirm={handleDelete} />}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
