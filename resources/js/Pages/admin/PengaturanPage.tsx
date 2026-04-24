import { useState, FormEvent, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { User, Lock, Bell, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Save, ShieldCheck, Mail } from 'lucide-react';

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
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[14px] font-bold text-white shadow-xl animate-[fadeIn_0.3s_ease-out] border border-white/20 backdrop-blur-md ${type === 'success' ? 'bg-teal-700/90 shadow-teal-700/20' : 'bg-rose-600/90 shadow-rose-600/20'}`}
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

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string; colorClass: string }[] = [
    { id: 'account', label: 'Informasi Akun', icon: <User size={16} />, color: '#0f766e', colorClass: 'bg-teal-700' },
    { id: 'security', label: 'Keamanan', icon: <ShieldCheck size={16} />, color: '#2563eb', colorClass: 'bg-blue-600' },
    { id: 'preferences', label: 'Notifikasi', icon: <Bell size={16} />, color: '#d4a017', colorClass: 'bg-amber-500' },
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
    });

    const submitProfile = (e: FormEvent) => {
        e.preventDefault();
        formProfile.put(route('settings.profile'), {
            preserveScroll: true,
            onSuccess: () => {
                formProfile.clearErrors();
                setToastMsg({ msg: 'Profil berhasil diperbarui.', type: 'success' });
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

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

            <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-900 pb-10">
                {/* Header */}
                <div className="flex justify-between items-end flex-wrap gap-3">
                    <div>
                        <div className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">Pengaturan Akun</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-medium">Kelola informasi kredensial login dan preferensi akun Anda</div>
                    </div>
                </div>

                {/* Tabs Horizontal */}
                <div className="flex flex-wrap gap-2 bg-slate-100/80 border border-slate-200/60 rounded-[20px] p-1.5 w-fit shadow-sm">
                    {TABS.map((t) => {
                        const isActive = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[13.5px] font-bold cursor-pointer transition-all border-none focus:outline-none ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}`}
                                onClick={() => setTab(t.id)}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full inline-block transition-colors ${isActive ? t.colorClass : 'bg-slate-300'}`} />
                                {t.icon}
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Card */}
                <div className="relative bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {/* ════ TAB 1: AKUN ════ */}
                    {tab === 'account' && (
                        <form onSubmit={submitProfile} className="flex flex-col">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Informasi Akun</div>
                                <div className="text-[13px] text-slate-500 font-medium mt-1">Perbarui username dan alamat email yang Anda gunakan untuk masuk ke dalam sistem.</div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Username Login</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="text"
                                            value={formProfile.data.username}
                                            onChange={(e) => formProfile.setData('username', e.target.value)}
                                            className={`w-full h-12 pl-11 pr-4 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${formProfile.errors.username ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                        />
                                    </div>
                                    {formProfile.errors.username && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-rose-600 font-bold mt-1">
                                            <AlertCircle size={14} /> {formProfile.errors.username}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Alamat Email</label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="email"
                                            value={formProfile.data.email}
                                            onChange={(e) => formProfile.setData('email', e.target.value)}
                                            className={`w-full h-12 pl-11 pr-4 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${formProfile.errors.email ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-600/15'}`}
                                        />
                                    </div>
                                    {formProfile.errors.email && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-rose-600 font-bold mt-1">
                                            <AlertCircle size={14} /> {formProfile.errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 h-11 px-6 rounded-xl bg-teal-700 text-white text-[14px] font-bold shadow-md shadow-teal-700/20 transition-all hover:bg-teal-800 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={formProfile.processing}
                                >
                                    {formProfile.processing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} /> Simpan Akun
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ════ TAB 2: KEAMANAN ════ */}
                    {tab === 'security' && (
                        <form onSubmit={submitPassword} className="flex flex-col">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Keamanan Kata Sandi</div>
                                <div className="text-[13px] text-slate-500 font-medium mt-1">Pastikan akun Anda menggunakan kata sandi panjang yang unik untuk tetap aman.</div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Kata Sandi Saat Ini</label>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showOld ? 'text' : 'password'}
                                            value={formPwd.data.current_password}
                                            onChange={(e) => formPwd.setData('current_password', e.target.value)}
                                            className={`w-full h-12 pl-11 pr-12 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${formPwd.errors.current_password ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'}`}
                                        />
                                        <button type="button" className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none" onClick={() => setShowOld(!showOld)}>
                                            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formPwd.errors.current_password && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-rose-600 font-bold mt-1">
                                            <AlertCircle size={14} /> {formPwd.errors.current_password}
                                        </div>
                                    )}
                                </div>

                                <div className="h-px w-full max-w-xl bg-slate-100 my-2" />

                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Kata Sandi Baru</label>
                                    <div className="relative flex items-center">
                                        <ShieldCheck className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={formPwd.data.password}
                                            onChange={(e) => formPwd.setData('password', e.target.value)}
                                            className={`w-full h-12 pl-11 pr-12 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:ring-2 ${formPwd.errors.password ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'}`}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <button type="button" className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none" onClick={() => setShowNew(!showNew)}>
                                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formPwd.errors.password && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-rose-600 font-bold mt-1">
                                            <AlertCircle size={14} /> {formPwd.errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 max-w-xl">
                                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Konfirmasi Sandi Baru</label>
                                    <div className="relative flex items-center">
                                        <ShieldCheck className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={formPwd.data.password_confirmation}
                                            onChange={(e) => formPwd.setData('password_confirmation', e.target.value)}
                                            className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                                            placeholder="Ulangi kata sandi baru"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 text-white text-[14px] font-bold shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={formPwd.processing}
                                >
                                    {formPwd.processing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Mengubah...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} /> Perbarui Sandi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ════ TAB 3: NOTIFIKASI ════ */}
                    {tab === 'preferences' && (
                        <div className="flex flex-col">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight">Preferensi Notifikasi</div>
                                <div className="text-[13px] text-slate-500 font-medium mt-1">Atur bagaimana Anda ingin menerima pembaruan dari sistem QLC.</div>
                            </div>

                            <div className="px-6 md:px-8 py-7 flex flex-col gap-4 max-w-3xl">
                                {/* Switch Item 1 */}
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                                    <div className="flex flex-col gap-1 pr-6">
                                        <div className="text-[14.5px] font-bold text-slate-900">Pemberitahuan Email</div>
                                        <div className="text-[13px] text-slate-500 font-medium">Terima info tagihan, jadwal, dan pengumuman via Email.</div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`relative w-12 h-6 rounded-full shrink-0 transition-colors focus:outline-none border-none ${prefEmail ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        onClick={() => setPrefEmail(!prefEmail)}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${prefEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Switch Item 2 */}
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                                    <div className="flex flex-col gap-1 pr-6">
                                        <div className="text-[14.5px] font-bold text-slate-900">Pesan WhatsApp</div>
                                        <div className="text-[13px] text-slate-500 font-medium">Terima notifikasi cepat langsung ke nomor WA terdaftar Anda.</div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`relative w-12 h-6 rounded-full shrink-0 transition-colors focus:outline-none border-none ${prefWA ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        onClick={() => setPrefWA(!prefWA)}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${prefWA ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-500 text-white text-[14px] font-bold shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 focus:outline-none"
                                    onClick={() => setToastMsg({ msg: 'Preferensi disimpan.', type: 'success' })}
                                >
                                    <Save size={16} /> Simpan Preferensi
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
