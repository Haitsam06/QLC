import { useState, FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    BookOpen, User, Lock, Eye, EyeOff,
    ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react';

interface Props {
    status?: string;
    canResetPassword: boolean;
}

interface LoginForm {
    username: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export default function Login({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen w-full flex font-sans text-gray-800 bg-white">

                {/* ════ SISI KIRI: BRANDING ════ */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 to-green-900 relative items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-green-500 bg-opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                    </div>

                    <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-sm">
                            <BookOpen size={40} className="text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                            Portal Terpadu <br />
                            <span className="text-green-300">Pejuang Quran</span>
                        </h1>
                        <p className="text-green-100 text-lg leading-relaxed">
                            Sistem informasi tunggal untuk mengakses layanan akademik,
                            manajemen kemitraan, evaluasi santri, dan laporan institusi QLC.
                        </p>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-green-200 bg-white bg-opacity-10 px-6 py-3 rounded-full border border-white border-opacity-10">
                            <ShieldCheck size={18} />
                            <span>Akses Aman & Terenkripsi</span>
                        </div>
                    </div>
                </div>

                {/* ════ SISI KANAN: FORM ════ */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-50">

                    {/* Mobile brand */}
                    <div className="absolute top-8 left-8 flex lg:hidden items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md">
                            <BookOpen size={16} strokeWidth={2.5} />
                        </div>
                        <div className="font-bold text-gray-900 text-sm">Pejuang Quran</div>
                    </div>

                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang</h2>
                            <p className="text-gray-500 text-sm font-medium">
                                Silakan masuk menggunakan kredensial akun QLC Anda.
                            </p>
                        </div>

                        {/* Session status (misal setelah reset password) */}
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                {status}
                            </div>
                        )}

                        {/* ── Form ── */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Username / ID
                                </label>
                                <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${
                                    errors.username
                                        ? 'border-red-400 ring-2 ring-red-100'
                                        : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'
                                }`}>
                                    <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value)}
                                        placeholder="Masukkan username akun Anda"
                                        autoComplete="username"
                                        autoFocus
                                        className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Kata Sandi
                                </label>
                                <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${
                                    errors.password
                                        ? 'border-red-400 ring-2 ring-red-100'
                                        : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'
                                }`}>
                                    <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                                    />
                                    <span className="text-sm font-semibold text-gray-600">Ingat sesi saya</span>
                                </label>
                                {canResetPassword && (
                                    <a
                                        href={route('password.request')}
                                        className="text-sm font-bold text-green-600 hover:text-green-800 transition-colors"
                                    >
                                        Lupa kata sandi?
                                    </a>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 mt-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Memproses…
                                    </>
                                ) : (
                                    <>
                                        Masuk ke Sistem <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm font-medium text-gray-500">Kesulitan mengakses akun Anda?</p>
                            <a href="mailto:admin@qlc.sch.id" className="text-green-600 font-bold hover:text-green-800 mt-1 inline-block text-sm">
                                Hubungi Administrator QLC
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
}   