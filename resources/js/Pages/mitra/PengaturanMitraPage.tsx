import { useState, useEffect, FormEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import type { PageProps } from '@/types';
import {
    User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
    Phone, MessageCircle, KeyRound, Save, ExternalLink,
    Briefcase, Loader2, ShieldCheck, Mail,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════════════════════════════════ */
interface MitraProfile {
    institution_name: string | null;
    contact_person: string | null;
    phone: string | null;
    status: string | null;
    email: string | null;
}

const ADMIN_WA = '6281285723834';

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return createPortal(
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[13.5px] font-bold text-white shadow-xl border border-white/20 backdrop-blur-md ${
                type === 'success' ? 'bg-green-700/90' : 'bg-red-600/90'
            }`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   USERNAME + FOTO FORM
═══════════════════════════════════════════════════════════ */
function UsernameForm() {
    const { auth } = usePage<PageProps>().props as any;
    const user = auth?.user;
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        username: user?.username ?? '',
        email:    user?.email    ?? '',
        photo: null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('mitra.profile.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                    <KeyRound size={20} className="text-green-700 bg-green-50 p-1 rounded-lg" />
                    Kredensial Akun
                </div>
                <div className="text-[13px] text-slate-500 font-bold">Ubah username dan foto profil akun Anda.</div>
            </div>

            <div className="px-6 md:px-8 py-7 flex flex-col gap-5">
                {recentlySuccessful && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 border border-green-100 text-[13px] font-bold text-green-700">
                        <CheckCircle2 size={16} /> Kredensial berhasil diperbarui.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-5">
                    {/* Foto */}
                    <div className="flex items-center gap-5 mb-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm shrink-0">
                            {photoFile ? (
                                <img src={URL.createObjectURL(photoFile)} className="w-full h-full object-cover" />
                            ) : user?.photo ? (
                                <img src={user.photo} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-green-700 text-white flex items-center justify-center text-3xl font-black">
                                    {(user?.username || 'M').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-green-700 text-white text-[13px] font-bold cursor-pointer hover:bg-green-800 transition">
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
                            <span className="text-[11px] text-slate-400">JPG, PNG, WEBP • Maks. 2MB</span>
                        </div>
                    </div>

                    {errors.photo && (
                        <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold ml-1">
                            <AlertCircle size={14} /> {errors.photo}
                        </div>
                    )}

                    {/* Username */}
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
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                                    errors.username
                                        ? 'border-red-500 focus:ring-red-500/10'
                                        : 'border-transparent focus:border-green-700 focus:ring-green-700/10'
                                }`}
                            />
                        </div>
                        {errors.username && (
                            <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                <AlertCircle size={14} /> {errors.username}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Email (opsional)"
                                autoComplete="email"
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                                    errors.email
                                        ? 'border-red-500 focus:ring-red-500/10'
                                        : 'border-transparent focus:border-green-700 focus:ring-green-700/10'
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                                <AlertCircle size={14} /> {errors.email}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-green-700 text-white text-[14px] font-black shadow-lg shadow-green-900/20 transition-all hover:bg-green-800 active:scale-95 focus:outline-none disabled:opacity-60 w-full sm:w-max"
                    >
                        {processing ? (
                            <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                        ) : (
                            <><Save size={18} /> Simpan Perubahan</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD FORM
═══════════════════════════════════════════════════════════ */
function PasswordForm() {
    const [showC, setShowC] = useState(false);
    const [showN, setShowN] = useState(false);
    const [showK, setShowK] = useState(false);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('mitra.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const field = (
        label: string,
        key: 'current_password' | 'password' | 'password_confirmation',
        show: boolean,
        setShow: (v: boolean) => void,
        placeholder: string,
        autoComplete: string
    ) => (
        <div className="flex flex-col gap-1.5 max-w-xl">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            <div className="relative flex items-center">
                <Lock className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
                <input
                    type={show ? 'text' : 'password'}
                    value={data[key]}
                    onChange={(e) => setData(key, e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[14px] font-bold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                        errors[key]
                            ? 'border-red-500 focus:ring-red-500/10'
                            : 'border-transparent focus:border-green-700 focus:ring-green-700/10'
                    }`}
                />
                <button
                    type="button"
                    className="absolute right-4 text-slate-400 hover:text-green-700 transition-colors focus:outline-none"
                    onClick={() => setShow(!show)}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {errors[key] && (
                <div className="flex items-center gap-1.5 text-[12px] text-red-600 font-bold mt-1 ml-1">
                    <AlertCircle size={14} /> {errors[key]}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                    <Lock size={20} className="text-green-700 bg-green-50 p-1 rounded-lg" />
                    Ubah Kata Sandi
                </div>
                <div className="text-[13px] text-slate-500 font-bold">Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.</div>
            </div>

            <div className="px-6 md:px-8 py-7 flex flex-col gap-5">
                {recentlySuccessful && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 border border-green-100 text-[13px] font-bold text-green-700">
                        <CheckCircle2 size={16} /> Kata sandi berhasil diperbarui.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-5">
                    {field('Kata Sandi Saat Ini', 'current_password', showC, setShowC, '••••••••', 'current-password')}
                    <div className="h-px w-full max-w-xl bg-slate-100 my-1" />
                    {field('Kata Sandi Baru', 'password', showN, setShowN, 'Minimal 8 karakter', 'new-password')}
                    {field('Konfirmasi Kata Sandi Baru', 'password_confirmation', showK, setShowK, 'Ulangi kata sandi baru', 'new-password')}

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-amber-500 text-white text-[14px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none disabled:opacity-60 w-full sm:w-max"
                    >
                        {processing ? (
                            <><Loader2 size={18} className="animate-spin" /> Mengubah...</>
                        ) : (
                            <><Lock size={18} /> Perbarui Sandi</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function PengaturanMitraPage() {
    const [profile, setProfile] = useState<MitraProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        axios
            .get('/api/mitra/profile')
            .then((res) => setProfile(res.data.data))
            .catch(() => setProfile(null))
            .finally(() => setLoadingProfile(false));
    }, []);

    const statusColor =
        profile?.status === 'Active'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-slate-100 text-slate-500 border-slate-200';

    const profileFields = [
        { label: 'Nama Institusi', value: profile?.institution_name, icon: <Briefcase size={16} /> },
        { label: 'Contact Person', value: profile?.contact_person,   icon: <User size={16} /> },
        { label: 'Nomor Telepon',  value: profile?.phone,            icon: <Phone size={16} /> },
        { label: 'Email',          value: profile?.email,            icon: <Mail size={16} /> },
    ];

    return (
        <>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="flex flex-col gap-6 w-full max-w-4xl pb-10" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                {/* Header */}
                <div>
                    <div className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">
                        Pengaturan Akun
                    </div>
                    <div className="text-[13px] text-slate-500 mt-1.5 font-bold italic">
                        Kelola kredensial login dan lihat informasi kemitraan Anda.
                    </div>
                </div>

                {/* ── Info Profil (read-only) ── */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 md:px-8 py-6 border-b border-slate-50">
                        <div className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                            <ShieldCheck size={20} className="text-blue-600 bg-blue-50 p-1 rounded-lg" />
                            Informasi Kemitraan
                        </div>
                        <div className="text-[13px] text-slate-500 font-bold">
                            Data resmi kemitraan. Perubahan harus melalui administrator.
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-7 flex flex-col gap-4">
                        {loadingProfile ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-green-700" />
                            </div>
                        ) : (
                            <>
                                {/* Status badge */}
                                {profile?.status && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${statusColor}`}>
                                            <span className={`w-2 h-2 rounded-full ${profile.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                            {profile.status === 'Active' ? 'Kemitraan Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {profileFields.map((f) => (
                                        <div key={f.label} className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                {f.label}
                                            </span>
                                            <div className="flex items-center gap-3 h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                <span className="text-slate-400 shrink-0">{f.icon}</span>
                                                <span className="text-[13px] font-bold text-slate-700 flex-1 truncate">
                                                    {f.value || '—'}
                                                </span>
                                                <Lock size={14} className="text-slate-300 shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Banner hubungi admin */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl mt-4 bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-3 text-[13px] font-bold text-blue-800 flex-1">
                                <AlertCircle size={20} className="text-blue-600 shrink-0" />
                                <span>Ingin mengubah data kemitraan? Hubungi administrator QLC.</span>
                            </div>
                            <a
                                href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent("Assalamu'alaikum Admin, saya ingin mengajukan perubahan data profil akun mitra kami.")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[13px] font-black shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap focus:outline-none"
                            >
                                <MessageCircle size={16} /> Hubungi Admin <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Kredensial ── */}
                <UsernameForm />

                {/* ── Password ── */}
                <PasswordForm />
            </div>
        </>
    );
}
