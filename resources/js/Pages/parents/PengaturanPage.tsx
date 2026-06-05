import { useState, FormEvent, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { createPortal } from 'react-dom';
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Phone, KeyRound, Save, Loader2, MapPin, MessageCircle, ExternalLink, Home } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════════════════════════════════ */
export interface ParentProfile {
    parent_name: string;
    phone: string;
    address: string;
}

interface Props {
    profile: ParentProfile | null;
    flash?: { success?: string };
}

const ADMIN_WA = '6281285723834';

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
            className={`fixed bottom-24 lg:bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[13.5px] font-bold text-white shadow-xl border border-white/20 backdrop-blur-md ${type === 'success' ? 'bg-[#1B6B3A]/90 shadow-green-900/20' : 'bg-red-600/90 shadow-red-600/20'}`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM: Username + Photo
═══════════════════════════════════════════════════════════ */
function UsernameForm() {
    const { auth } = usePage<PageProps>().props as any;
    const user = auth?.user;
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        username: (user?.username as string) ?? '',
        email:    (user?.email as string)    ?? '',
        photo:    null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('parents.profile.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all">
            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                    <KeyRound size={20} className="text-[#1B6B3A] bg-green-50 p-1 rounded-lg" />
                    Kredensial Akun
                </div>
                <div className="text-[13px] text-slate-500 font-bold">Ubah username, email, dan foto profile akun Anda.</div>
            </div>

            <div className="px-6 md:px-8 py-7 flex flex-col gap-5">
                {recentlySuccessful && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 border border-green-100 text-[13px] font-bold text-green-700 mb-2 animate-[fadeIn_0.3s_ease-out]">
                        <CheckCircle2 size={16} />
                        Kredensial akun berhasil diperbarui.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-5">
                    {/* FOTO PROFILE */}
                    <div className="flex items-center gap-5 mb-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm shrink-0">
                            {photoFile ? (
                                <img src={URL.createObjectURL(photoFile)} className="w-full h-full object-cover" />
                            ) : user?.photo ? (
                                <img src={user.photo} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#1B6B3A] text-white flex items-center justify-center text-3xl font-black">{(user?.username || 'P').charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-[#1B6B3A] text-white text-[13px] font-bold cursor-pointer hover:opacity-90 transition">
                                Ganti Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setPhotoFile(file);
                                        setData('photo', file);
                                    }}
                                />
                            </label>
                            <span className="text-[11px] text-slate-400">JPG, PNG, WEBP • Maksimal 2MB</span>
                        </div>
                    </div>

                    {errors.photo && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold ml-1"><AlertCircle size={14} />{errors.photo}</div>}

                    {/* USERNAME */}
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Username Login</label>
                        <div className="relative flex items-center">
                            <User className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Username baru"
                                autoComplete="username"
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${errors.username ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            />
                        </div>
                        {errors.username && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1"><AlertCircle size={14} />{errors.username}</div>}
                    </div>

                    {/* EMAIL */}
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email <span className="font-semibold opacity-70">(opsional)</span></label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 pointer-events-none font-bold text-lg">@</span>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Alamat email"
                                autoComplete="email"
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            />
                        </div>
                        {errors.email && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1"><AlertCircle size={14} />{errors.email}</div>}
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-[#1B6B3A] text-white text-[14px] font-black shadow-lg shadow-green-900/20 transition-all hover:bg-[#14522d] active:scale-95 focus:outline-none disabled:opacity-60 w-full sm:w-max"
                    >
                        {processing ? <><Loader2 size={18} className="animate-spin" />Menyimpan...</> : <><Save size={18} />Simpan Perubahan</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM: Password
═══════════════════════════════════════════════════════════ */
function PasswordForm() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('settings.password'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all">
            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                    <Lock size={20} className="text-[#1B6B3A] bg-green-50 p-1 rounded-lg" /> Ubah Kata Sandi
                </div>
                <div className="text-[13px] text-slate-500 font-bold">Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.</div>
            </div>

            <div className="px-6 md:px-8 py-7 flex flex-col gap-5">
                {recentlySuccessful && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 border border-green-100 text-[13px] font-bold text-green-700 mb-2 animate-[fadeIn_0.3s_ease-out]">
                        <CheckCircle2 size={16} /> Kata sandi berhasil diperbarui.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Saat Ini</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${errors.current_password ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            />
                            <button type="button" className="absolute right-4 text-slate-400 hover:text-[#1B6B3A] focus:outline-none active:scale-90 transition-transform" onClick={() => setShowCurrent((v) => !v)}>
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.current_password && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1"><AlertCircle size={14} />{errors.current_password}</div>}
                    </div>

                    <div className="h-px w-full max-w-xl bg-slate-100 my-2" />

                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Baru</label>
                        <div className="relative flex items-center">
                            <KeyRound className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                                className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${errors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            />
                            <button type="button" className="absolute right-4 text-slate-400 hover:text-[#1B6B3A] focus:outline-none active:scale-90 transition-transform" onClick={() => setShowNew((v) => !v)}>
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1"><AlertCircle size={14} />{errors.password}</div>}
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Kata Sandi Baru</label>
                        <div className="relative flex items-center">
                            <KeyRound className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi kata sandi baru"
                                autoComplete="new-password"
                                className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${errors.password_confirmation ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            />
                            <button type="button" className="absolute right-4 text-slate-400 hover:text-[#1B6B3A] focus:outline-none active:scale-90 transition-transform" onClick={() => setShowConfirm((v) => !v)}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password_confirmation && <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1"><AlertCircle size={14} />{errors.password_confirmation}</div>}
                    </div>

                    <button
                        type="submit"
                        className="mt-4 flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-amber-500 text-white text-[14px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none disabled:opacity-60 w-full sm:w-max"
                        disabled={processing}
                    >
                        {processing ? <><Loader2 size={18} className="animate-spin" />Mengubah...</> : <><Lock size={18} />Perbarui Sandi</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PengaturanPage({ profile, flash }: Props) {
    const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) setToastMsg({ msg: flash.success, type: 'success' });
    }, [flash]);

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>

            <div className="flex flex-col gap-6 w-full max-w-4xl animate-[fadeIn_0.3s_ease-out]">
                {/* Heading */}
                <div className="flex justify-between items-end flex-wrap gap-3 mb-2">
                    <div>
                        <div className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">Pengaturan Akun</div>
                        <div className="text-[13px] text-slate-500 mt-1.5 font-bold italic">Kelola kredensial login dan lihat informasi profil Anda.</div>
                    </div>
                </div>

                {/* ── Informasi Profil (read-only) ── */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                        <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                            <Home size={20} className="text-blue-600 bg-blue-50 p-1 rounded-lg" />
                            Informasi Profil Wali Murid
                        </div>
                        <div className="text-[13px] text-slate-500 font-bold">Data profil hanya dapat diubah oleh administrator.</div>
                    </div>

                    <div className="px-6 md:px-8 py-7 flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Nama Lengkap', value: profile?.parent_name ?? '—', icon: <User size={16} /> },
                                { label: 'No. Telepon',  value: profile?.phone       ?? '—', icon: <Phone size={16} /> },
                            ].map((f) => (
                                <div key={f.label} className="flex flex-col gap-1.5">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{f.label}</span>
                                    <div className="flex items-center gap-3 h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <span className="text-slate-400 shrink-0">{f.icon}</span>
                                        <span className="text-[13px] font-bold text-slate-700 flex-1 truncate">{f.value}</span>
                                        <Lock size={14} className="text-slate-300 shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Alamat full-width */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat</span>
                            <div className="flex items-start gap-3 min-h-[3rem] px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="text-[13px] font-bold text-slate-700 flex-1">{profile?.address ?? '—'}</span>
                                <Lock size={14} className="text-slate-300 shrink-0 mt-0.5" />
                            </div>
                        </div>

                        {/* Hubungi Admin banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl mt-2 bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-3 text-[13px] font-bold text-blue-800 flex-1">
                                <AlertCircle size={20} className="text-blue-600 shrink-0" />
                                <span>Ingin mengubah data profil? Hubungi administrator sekolah.</span>
                            </div>
                            <a
                                href={`https://wa.me/${ADMIN_WA}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition shrink-0"
                            >
                                <MessageCircle size={16} />
                                Hubungi Admin
                                <ExternalLink size={13} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Kredensial Akun ── */}
                <UsernameForm />

                {/* ── Password ── */}
                <PasswordForm />
            </div>

            {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
        </>
    );
}
