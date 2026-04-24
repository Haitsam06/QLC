import { useState, FormEvent } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    User, Lock, Eye, EyeOff, CheckCircle2,
    AlertCircle, Shield, Phone, MessageCircle,
    KeyRound, Save, ExternalLink,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
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

/* ═══════════════════════════════════════════════════════════
   FORM: Username
═══════════════════════════════════════════════════════════ */
function UsernameForm() {
    const { auth } = usePage<PageProps>().props as any;
    const user = auth?.user;

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        username: (user?.username as string) ?? '',
        email:    (user?.email    as string) ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('settings.profile'), { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-[18px] p-5 md:p-6 border border-slate-100 shadow-sm">
            <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2 mb-1"><KeyRound size={16} className="text-teal-600"/> Kredensial Akun</div>
            <div className="text-[11.5px] text-slate-500 mb-5">Ubah username dan email yang digunakan untuk masuk ke sistem.</div>

            {recentlySuccessful && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4 bg-green-50 border border-green-100 text-[12.5px] font-bold text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={15}/> Kredensial akun berhasil diperbarui.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-slate-700">Username</label>
                    <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-all focus-within:ring-4 ${errors.username ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-100 focus-within:border-teal-600 focus-within:ring-teal-50'}`}>
                        <span className="px-3 text-slate-400 shrink-0"><User size={15}/></span>
                        <input
                            className="flex-1 h-11 px-1 text-[13.5px] font-semibold text-slate-900 bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-300"
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            placeholder="Username baru"
                            autoComplete="username"
                        />
                    </div>
                    {errors.username && <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.username}</p>}
                </div>

                {/* Email (opsional) */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-slate-700">Email <span className="font-medium text-slate-400">(opsional)</span></label>
                    <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-all focus-within:ring-4 ${errors.email ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-100 focus-within:border-teal-600 focus-within:ring-teal-50'}`}>
                        <span className="px-3 text-slate-400 shrink-0 text-[14px] font-bold">@</span>
                        <input
                            className="flex-1 h-11 px-1 text-[13.5px] font-semibold text-slate-900 bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-300"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="Alamat email"
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.email}</p>}
                </div>

                <button type="submit" disabled={processing} className="flex items-center justify-center gap-1.5 w-full h-11 mt-2 rounded-xl bg-teal-700 text-white text-[13.5px] font-bold hover:bg-teal-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md">
                    <Save size={15}/> {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM: Password
═══════════════════════════════════════════════════════════ */
function PasswordForm() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password:      '',
        password:              '',
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
        <div className="bg-white rounded-[18px] p-5 md:p-6 border border-slate-100 shadow-sm">
            <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2 mb-1"><Lock size={16} className="text-teal-600"/> Ubah Kata Sandi</div>
            <div className="text-[11.5px] text-slate-500 mb-5">Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.</div>

            {recentlySuccessful && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4 bg-green-50 border border-green-100 text-[12.5px] font-bold text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={15}/> Kata sandi berhasil diperbarui.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Password lama */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-slate-700">Kata Sandi Saat Ini</label>
                    <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-all focus-within:ring-4 ${errors.current_password ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-100 focus-within:border-teal-600 focus-within:ring-teal-50'}`}>
                        <span className="px-3 text-slate-400 shrink-0"><Lock size={15}/></span>
                        <input
                            className="flex-1 h-11 px-1 text-[13.5px] font-semibold text-slate-900 bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-300"
                            type={showCurrent ? 'text' : 'password'}
                            value={data.current_password}
                            onChange={e => setData('current_password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        <button type="button" className="px-3 text-slate-400 hover:text-teal-600 transition-colors" onClick={() => setShowCurrent(v => !v)}>
                            {showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.current_password && <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.current_password}</p>}
                </div>

                <div className="h-px bg-slate-100 my-1"/>

                {/* Password baru */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-slate-700">Kata Sandi Baru</label>
                    <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-all focus-within:ring-4 ${errors.password ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-100 focus-within:border-teal-600 focus-within:ring-teal-50'}`}>
                        <span className="px-3 text-slate-400 shrink-0"><KeyRound size={15}/></span>
                        <input
                            className="flex-1 h-11 px-1 text-[13.5px] font-semibold text-slate-900 bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-300"
                            type={showNew ? 'text' : 'password'}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            autoComplete="new-password"
                        />
                        <button type="button" className="px-3 text-slate-400 hover:text-teal-600 transition-colors" onClick={() => setShowNew(v => !v)}>
                            {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.password && <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.password}</p>}
                </div>

                {/* Konfirmasi password baru */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                    <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-all focus-within:ring-4 ${errors.password_confirmation ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-100 focus-within:border-teal-600 focus-within:ring-teal-50'}`}>
                        <span className="px-3 text-slate-400 shrink-0"><KeyRound size={15}/></span>
                        <input
                            className="flex-1 h-11 px-1 text-[13.5px] font-semibold text-slate-900 bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-300"
                            type={showConfirm ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            placeholder="Ulangi kata sandi baru"
                            autoComplete="new-password"
                        />
                        <button type="button" className="px-3 text-slate-400 hover:text-teal-600 transition-colors" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.password_confirmation && <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.password_confirmation}</p>}
                </div>

                <button type="submit" disabled={processing} className="flex items-center justify-center gap-1.5 w-full h-11 mt-2 rounded-xl bg-teal-700 text-white text-[13.5px] font-bold hover:bg-teal-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md">
                    <Save size={15}/> {processing ? 'Menyimpan…' : 'Perbarui Kata Sandi'}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const ADMIN_WA = '6281234567890'; // ← Ganti nomor WA admin

export default function PengaturanPage({ profile }: Props) {
    return (
        <div className="flex flex-col gap-5">
            {/* Heading */}
            <div>
                <div className="text-[22px] font-black text-slate-900">Pengaturan Akun</div>
                <div className="text-[12px] text-slate-500 mt-1">Kelola kredensial login dan lihat informasi profil Anda.</div>
            </div>

            {/* Profil (read-only) */}
            <div className="bg-white rounded-[18px] p-5 md:p-6 border border-slate-100 shadow-sm">
                <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2 mb-1"><User size={16} className="text-blue-600"/> Informasi Profil</div>
                <div className="text-[11.5px] text-slate-500 mb-5">Data ini terdaftar secara resmi dan tidak dapat diubah sendiri.</div>

                <div className="flex flex-col gap-3.5">
                    {[
                        { label: 'Nama Lengkap',    value: profile?.parent_name ?? '—', icon: <User size={14}/>     },
                        { label: 'Nomor Telepon',   value: profile?.phone       ?? '—', icon: <Phone size={14}/>    },
                        { label: 'Alamat',          value: profile?.address     ?? '—', icon: <Shield size={14}/>   },
                    ].map(f => (
                        <div key={f.label} className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{f.label}</span>
                            <div className="flex items-center gap-2.5 p-[10px_14px] rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-slate-400 shrink-0">{f.icon}</span>
                                <span className="text-[13.5px] font-bold text-slate-700 flex-1">{f.value}</span>
                                <Lock size={13} className="text-slate-300 shrink-0"/>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner hubungi admin */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl mt-5 bg-blue-50 border border-blue-100 text-[12px] text-blue-700 font-semibold">
                    <div className="flex items-center gap-2 flex-1">
                        <AlertCircle size={15} className="shrink-0"/>
                        <span>Ingin mengubah data profil? Hubungi administrator sekolah.</span>
                    </div>
                    <a
                        href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent('Assalamu\'alaikum Admin, saya ingin mengajukan perubahan data profil akun saya.')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-[11.5px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap"
                    >
                        <MessageCircle size={13}/> Hubungi Admin
                        <ExternalLink size={11}/>
                    </a>
                </div>
            </div>

            <UsernameForm />
            <PasswordForm />
        </div>
    );
}