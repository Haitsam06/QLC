import { useState, FormEvent, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { User, Lock, Bell, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Save, ShieldCheck, Mail, Check } from 'lucide-react';

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
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
type TabId = 'account' | 'security' | 'preferences';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Profil Akun', icon: <User size={16} /> },
    { id: 'security', label: 'Keamanan', icon: <ShieldCheck size={16} /> },
    { id: 'preferences', label: 'Notifikasi', icon: <Bell size={16} /> },
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
                </div>
            </div>

            {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
        </>
    );
}
