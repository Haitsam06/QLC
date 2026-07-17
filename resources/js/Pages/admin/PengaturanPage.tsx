import { useState, FormEvent, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { User, Lock, Bell, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Save, ShieldCheck, Mail, Check, Database, Download, Upload, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';

/* ═══════════════════════════════════════════════════════════
   TOAST COMPONENT
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return createPortal(
        <div
            className={`fixed bottom-24 lg:bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.3s_ease-out] border border-white/20 backdrop-blur-md ${type === 'success' ? 'bg-teal-700/90 shadow-teal-700/20' : 'bg-rose-600/90 shadow-rose-600/20'}`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD MODAL COMPONENT
   ═══════════════════════════════════════════════════════════ */
function PasswordModal({
    isOpen,
    title,
    description = "Masukkan password admin untuk melanjutkan tindakan ini.",
    onClose,
    onSubmit
}: {
    isOpen: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    onSubmit: (password: string, setError: (msg: string | null) => void) => void;
}) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Password wajib diisi.');
            return;
        }
        setError(null);
        onSubmit(password, setError);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                            <Lock size={16} />
                        </div>
                        <h3 className="text-[16px] font-extrabold text-slate-900 leading-tight">{title}</h3>
                    </div>
                    <button
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none border-none cursor-pointer"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="flex-1 p-6 flex flex-col gap-4">
                    <p className={`text-[12.5px] font-bold leading-relaxed ${description.includes('PERINGATAN') ? 'text-rose-700 bg-rose-50/50 p-4 rounded-2xl border border-rose-100' : 'text-slate-500'}`}>
                        {description}
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Password Admin</label>
                        <div className="relative flex items-center h-11 px-4 bg-white border border-slate-300 rounded-xl transition-all focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:border-sky-500">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 text-[13.5px] font-medium text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400"
                                placeholder="Masukkan password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer border-none bg-transparent"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-[12.5px] text-red-600 font-bold flex items-center gap-1.5 mt-1 bg-red-50 p-2.5 rounded-xl border border-red-100">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-2.5 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 h-11 px-4 rounded-xl bg-teal-700 text-white text-[13px] font-bold hover:bg-teal-800 transition-colors focus:outline-none shadow-md shadow-teal-900/10 border-none cursor-pointer"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
type TabId = 'account' | 'security' | 'preferences' | 'database';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Profil Akun', icon: <User size={16} /> },
    { id: 'security', label: 'Keamanan', icon: <ShieldCheck size={16} /> },
    { id: 'preferences', label: 'Notifikasi', icon: <Bell size={16} /> },
    { id: 'database', label: 'Backup & Restore', icon: <Database size={16} /> },
];

export default function PengaturanPage() {
    const { auth, flash } = usePage().props as any;
    const user = auth?.user;

    const [tab, setTab] = useState<TabId>('account');
    const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) setToastMsg({ msg: flash.success, type: 'success' });
        if (flash?.error) setToastMsg({ msg: flash.error, type: 'error' });
    }, [flash]);

    /* ── Form Profil Akun ── */
    const formProfile = useForm({
        username: user?.username || '',
        email: user?.email || '',
        photo: null as File | null,
    });

    const submitProfile = (e: FormEvent) => {
        e.preventDefault();
        formProfile.post(route('settings.profile'), {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                formProfile.clearErrors();

                setToastMsg({
                    msg: 'Profil berhasil diperbarui.',
                    type: 'success',
                });
            },
        });
    };

    /* ── Form Keamanan (Password) ── */
    const formPwd = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const submitPassword = (e: FormEvent) => {
        e.preventDefault();
        formPwd.put(route('settings.password'), {
            preserveScroll: true,
            onSuccess: () => {
                formPwd.reset();
                setToastMsg({ msg: 'Kata sandi berhasil diperbarui.', type: 'success' });
            },
        });
    };

    /* ── Preferensi (Mockup UI) ── */
    const [prefEmail, setPrefEmail] = useState(true);
    const [prefWA, setPrefWA] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    /* ── Backup & Restore Database ── */
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [restoreLoading, setRestoreLoading] = useState(false);

    // Modal state for Backup/Restore
    const [pwdModalOpen, setPwdModalOpen] = useState(false);
    const [pwdModalType, setPwdModalType] = useState<'backup' | 'restore' | null>(null);

    const handleBackup = () => {
        setPwdModalType('backup');
        setPwdModalOpen(true);
    };

    const handleRestoreClick = () => {
        if (!restoreFile) return;
        setPwdModalType('restore');
        setPwdModalOpen(true);
    };

    const handleConfirmBackup = async (password: string, setError: (msg: string | null) => void) => {
        setBackupLoading(true);
        try {
            // First check credentials using a safe Axios GET call
            await axios.get(`/api/database/backup?password=${encodeURIComponent(password)}`);
            
            // If successful, trigger native browser download
            window.location.href = `/api/database/backup?password=${encodeURIComponent(password)}`;
            setToastMsg({ msg: 'Database backup berhasil diunduh.', type: 'success' });
            setPwdModalOpen(false);
        } catch (error: any) {
            console.error(error);
            let errMsg = 'Gagal mengunduh backup database. Pastikan password Anda benar.';
            if (error.response?.data?.message) {
                errMsg = error.response.data.message;
            }
            setError(errMsg);
        } finally {
            setBackupLoading(false);
        }
    };

    const handleConfirmRestore = async (password: string, setError: (msg: string | null) => void) => {
        setRestoreLoading(true);
        const formData = new FormData();
        formData.append('backup_file', restoreFile!);
        formData.append('password', password);

        try {
            const response = await axios.post('/api/database/restore', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                setToastMsg({ msg: response.data.message || 'Database berhasil dipulihkan.', type: 'success' });
                setRestoreFile(null);
                setPwdModalOpen(false);
            } else {
                setError(response.data.message || 'Gagal memulihkan database.');
            }
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat memulihkan database.';
            setError(errMsg);
        } finally {
            setRestoreLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>

            <div className="flex flex-col gap-6 w-full text-slate-900 animate-[fadeIn_0.3s_ease-out]">
                {/* ════ HEADER ════ */}
                <div className="flex justify-between items-end flex-wrap gap-3">
                    <div>
                        <div className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">Pengaturan Akun</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-bold italic">Kelola kredensial login dan preferensi Anda.</div>
                    </div>
                </div>

                {/* ════ TAB SELECTOR (Android Pill Style) ════ */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all active:scale-95 ${tab === t.id ? 'bg-[#1B6B3A] text-white shadow-lg shadow-green-900/20' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ════ CONTENT CARD ════ */}
                <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {/* --- TAB 1: AKUN --- */}
                    {tab === 'account' && (
                        <form onSubmit={submitProfile} className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Header Section */}
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Informasi Dasar</div>
                                <div className="text-[13px] text-slate-500 font-semibold mt-1">Perbarui username dan alamat email akun Anda.</div>
                            </div>

                            {/* Form Inputs Section */}
                            <div className="px-6 md:px-8 py-7 flex flex-col gap-6">
                                {/* Username Input */}
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Username Login</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="text"
                                            value={formProfile.data.username}
                                            onChange={(e) => formProfile.setData('username', e.target.value)}
                                            className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                                                formProfile.errors.username ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'
                                            }`}
                                        />
                                    </div>
                                    {formProfile.errors.username && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                            <AlertCircle size={14} /> {formProfile.errors.username}
                                        </div>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="email"
                                            value={formProfile.data.email}
                                            onChange={(e) => formProfile.setData('email', e.target.value)}
                                            className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                                                formProfile.errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'
                                            }`}
                                        />
                                    </div>
                                    {formProfile.errors.email && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                            <AlertCircle size={14} /> {formProfile.errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Profile Photo Section */}
                                <div className="flex flex-col gap-2.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto Profil</label>
                                    <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
                                            <img src={photoFile ? URL.createObjectURL(photoFile) : user?.photo || '/image/default-avatar.png'} className="w-full h-full object-cover" alt="Preview Foto" />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="flex items-center justify-center h-9 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 active:scale-98 transition-all">
                                                <span>Pilih Foto Baru</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        setPhotoFile(file);
                                                        formProfile.setData('photo', file);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-[11px] text-slate-400 ml-1">Maksimal format JPG, PNG, atau WEBP.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Section / Action Button */}
                            <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-[#1B6B3A] text-white text-[14px] font-black shadow-lg shadow-green-900/10 transition-all hover:bg-[#14522d] active:scale-95 focus:outline-none disabled:opacity-60"
                                    disabled={formProfile.processing}
                                >
                                    {formProfile.processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Simpan Akun</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- TAB 2: KEAMANAN --- */}
                    {tab === 'security' && (
                        <form onSubmit={submitPassword} className="flex flex-col">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Keamanan Kata Sandi</div>
                                <div className="text-[13px] text-slate-500 font-bold mt-1">Pastikan akun Anda menggunakan kata sandi panjang yang unik.</div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Saat Ini</label>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showOld ? 'text' : 'password'}
                                            value={formPwd.data.current_password}
                                            onChange={(e) => formPwd.setData('current_password', e.target.value)}
                                            className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${formPwd.errors.current_password ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-amber-500 focus:ring-amber-500/10'}`}
                                        />
                                        <button type="button" className="absolute right-4 text-slate-400 hover:text-amber-500 focus:outline-none active:scale-90 transition-transform" onClick={() => setShowOld(!showOld)}>
                                            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formPwd.errors.current_password && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                            <AlertCircle size={14} /> {formPwd.errors.current_password}
                                        </div>
                                    )}
                                </div>

                                <div className="h-px w-full max-w-xl bg-slate-100 my-2" />

                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Baru</label>
                                    <div className="relative flex items-center">
                                        <ShieldCheck className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={formPwd.data.password}
                                            onChange={(e) => formPwd.setData('password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${formPwd.errors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-amber-500 focus:ring-amber-500/10'}`}
                                        />
                                        <button type="button" className="absolute right-4 text-slate-400 hover:text-amber-500 focus:outline-none active:scale-90 transition-transform" onClick={() => setShowNew(!showNew)}>
                                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formPwd.errors.password && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                            <AlertCircle size={14} /> {formPwd.errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Sandi Baru</label>
                                    <div className="relative flex items-center">
                                        <ShieldCheck className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={formPwd.data.password_confirmation}
                                            onChange={(e) => formPwd.setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi kata sandi baru"
                                            className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-5 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-amber-500 text-white text-[14px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none disabled:opacity-60"
                                    disabled={formPwd.processing}
                                >
                                    {formPwd.processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Mengubah...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} /> Perbarui Sandi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- TAB 3: NOTIFIKASI --- */}
                    {tab === 'preferences' && (
                        <div className="flex flex-col">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Preferensi Notifikasi</div>
                                <div className="text-[13px] text-slate-500 font-bold mt-1">Atur bagaimana Anda ingin menerima pembaruan dari sistem.</div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-4 max-w-3xl">
                                <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm transition-colors hover:bg-slate-50">
                                    <div className="flex flex-col gap-1 pr-6">
                                        <div className="text-sm font-black text-slate-900">Pemberitahuan Email</div>
                                        <div className="text-[12px] text-slate-500 font-bold">Terima info tagihan, jadwal, dan pengumuman via Email.</div>
                                    </div>
                                    <button type="button" className={`relative w-14 h-8 rounded-full shrink-0 transition-colors focus:outline-none border-none ${prefEmail ? 'bg-[#1B6B3A]' : 'bg-slate-200'}`} onClick={() => setPrefEmail(!prefEmail)}>
                                        <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${prefEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm transition-colors hover:bg-slate-50">
                                    <div className="flex flex-col gap-1 pr-6">
                                        <div className="text-sm font-black text-slate-900">Pesan WhatsApp</div>
                                        <div className="text-[12px] text-slate-500 font-bold">Terima notifikasi cepat langsung ke nomor WA Anda.</div>
                                    </div>
                                    <button type="button" className={`relative w-14 h-8 rounded-full shrink-0 transition-colors focus:outline-none border-none ${prefWA ? 'bg-[#1B6B3A]' : 'bg-slate-200'}`} onClick={() => setPrefWA(!prefWA)}>
                                        <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${prefWA ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-5 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-[#1B6B3A] text-white text-[14px] font-black shadow-lg shadow-green-900/20 transition-all hover:bg-[#14522d] active:scale-95 focus:outline-none"
                                    onClick={() => setToastMsg({ msg: 'Preferensi disimpan.', type: 'success' })}
                                >
                                    <Check size={18} strokeWidth={3} /> Simpan Preferensi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: BACKUP & RESTORE --- */}
                    {tab === 'database' && (
                        <div className="flex flex-col bg-white rounded-3xl overflow-hidden">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Cadangkan & Pulihkan Database</div>
                                <div className="text-[13px] text-slate-500 font-semibold mt-1">
                                    Unduh salinan data Anda atau lakukan pemulihan sistem dari cadangan berkas ZIP.
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-8 max-w-3xl">
                                {/* Section 1: Backup */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1 max-w-md">
                                        <div className="text-sm font-bold text-slate-900">Cadangkan Database (Backup)</div>
                                        <div className="text-[12.5px] text-slate-500 font-medium">
                                            Ekspor seluruh 16 koleksi MongoDB termasuk akun user, progres belajar, SPP, dan konfigurasi lainnya ke dalam berkas ZIP terkompresi.
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBackup}
                                        disabled={backupLoading}
                                        className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-teal-700 text-white text-[13px] font-extrabold shadow-md shadow-teal-900/10 transition-all hover:bg-teal-800 active:scale-95 disabled:opacity-60 cursor-pointer self-start sm:self-center whitespace-nowrap"
                                    >
                                        {backupLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Mengekspor...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={16} />
                                                <span>Unduh Cadangan</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Section 2: Restore */}
                                 <div className="p-6 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex flex-col gap-5">
                                     <div className="flex flex-col gap-1">
                                         <div className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                                             <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                                             <span>Pulihkan Database (Restore)</span>
                                         </div>
                                         <div className="text-[12.5px] text-rose-900/80 font-medium mt-1 leading-relaxed">
                                             Unggah berkas ZIP cadangan Anda untuk memulihkan keadaan database. 
                                             <span className="font-extrabold text-rose-700 block mt-1">
                                                 PERINGATAN: Proses ini akan menghapus (truncate) seluruh data di database saat ini sebelum mengimpor data cadangan!
                                             </span>
                                         </div>
                                     </div>
 
                                     <div className="flex flex-col gap-2.5">
                                         <div className="flex items-center gap-4 flex-wrap">
                                             <label className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 active:scale-98 transition-all">
                                                 <Upload size={16} />
                                                 <span>Pilih Berkas ZIP</span>
                                                 <input
                                                     type="file"
                                                     accept=".zip"
                                                     onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                                                     className="hidden"
                                                 />
                                             </label>
                                             <span className="text-[12px] font-bold text-slate-600">
                                                 {restoreFile ? restoreFile.name : 'Belum ada berkas terpilih'}
                                             </span>
                                         </div>
                                         <span className="text-[11px] text-slate-400">Berkas wajib berupa format ZIP hasil ekspor sistem (maksimal 10MB).</span>
                                     </div>
 
                                     {restoreFile && (
                                         <div className="flex justify-end border-t border-rose-100/60 pt-4 mt-2">
                                             <button
                                                 type="button"
                                                 onClick={handleRestoreClick}
                                                 disabled={restoreLoading}
                                                 className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-rose-600 text-white text-[13px] font-extrabold shadow-md shadow-rose-900/10 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-60 cursor-pointer"
                                             >
                                                 {restoreLoading ? (
                                                     <>
                                                         <Loader2 size={16} className="animate-spin" />
                                                         <span>Memulihkan Data...</span>
                                                     </>
                                                 ) : (
                                                     <>
                                                         <Upload size={16} />
                                                         <span>Mulai Pemulihan</span>
                                                     </>
                                                 )}
                                             </button>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

            <PasswordModal
                isOpen={pwdModalOpen}
                title={pwdModalType === 'backup' ? 'Cadangkan Database (Backup)' : 'Pulihkan Database (Restore)'}
                description={pwdModalType === 'backup' ? 'Masukkan password admin untuk mengunduh backup database.' : 'PERINGATAN KERAS: Proses pemulihan database akan menghapus seluruh data yang ada saat ini sebelum mengimpor data cadangan. Silakan masukkan password admin untuk melanjutkan.'}
                onClose={() => setPwdModalOpen(false)}
                onSubmit={pwdModalType === 'backup' ? handleConfirmBackup : handleConfirmRestore}
            />
        </>
    );
}
