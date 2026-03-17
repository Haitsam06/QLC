import { useState, FormEvent } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    BookOpen, User, Lock, Eye, EyeOff, Mail,
    ArrowRight, ShieldCheck, AlertCircle, Phone, MapPin, ArrowLeft
} from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        parent_name: '',
        phone: '',
        address: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Pendaftaran Wali Murid" />

            {/* ── CSS ANIMASI ── */}
            <style>{`
                @keyframes slideInLeft {
                    0% { opacity: 0; transform: translateX(-40px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    0% { opacity: 0; transform: translateX(40px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                .anim-slide-left { animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .anim-slide-right { animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {/* Layout Dibalik: flex-row-reverse (Kiri Form, Kanan Branding) */}
            <div className="min-h-screen w-full flex flex-row-reverse font-sans text-gray-800 bg-white">

                {/* ════ SISI BRANDING (Sekarang di Kanan) ════ */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-bl from-green-800 to-green-900 relative items-center justify-center overflow-hidden anim-slide-right">
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-green-500 bg-opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
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
                            Mulai perjalanan pendidikan buah hati Anda dengan bergabung
                            ke dalam sistem informasi institusi QLC.
                        </p>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-green-200 bg-white bg-opacity-10 px-6 py-3 rounded-full border border-white border-opacity-10">
                            <ShieldCheck size={18} />
                            <span>Data Pribadi Terlindungi Aman</span>
                        </div>
                    </div>
                </div>

                {/* ════ SISI FORM (Sekarang di Kiri) ════ */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 relative bg-gray-50 min-h-screen overflow-y-auto anim-slide-left">

                    <div className="w-full max-w-lg mx-auto">

                        {/* ── TOMBOL KEMBALI KE BERANDA ── */}
                        <div className="mb-6 flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                                Kembali ke Beranda
                            </Link>

                            {/* Mobile brand (muncul di kanan atas pada HP) */}
                            <div className="flex lg:hidden items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center text-white shadow-sm">
                                    <BookOpen size={12} strokeWidth={2.5} />
                                </div>
                                <div className="font-bold text-gray-900 text-xs">QLC</div>
                            </div>
                        </div>

                        {/* ── TOGGLE BAR (REGISTER KIRI / LOGIN KANAN) ── */}
                        <div className="flex bg-gray-200/60 p-1.5 rounded-2xl mb-10 shadow-inner">
                            <Link href={route('register')} className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all bg-white text-green-700 shadow-sm pointer-events-none">
                                Daftar Wali Murid
                            </Link>
                            <Link href={route('login')} className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-200/50">
                                Masuk
                            </Link>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h2>
                            <p className="text-gray-500 text-sm font-medium">
                                Lengkapi data di bawah ini untuk mendaftarkan akun.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* ── SEGMEN: PROFIL WALI ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Nama Wali */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nama Lengkap</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.parent_name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><User size={16} /></div>
                                        <input type="text" value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} placeholder="Contoh: Budi Santoso" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                    </div>
                                    {errors.parent_name && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.parent_name}</p>}
                                </div>

                                {/* No. Telepon */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nomor Telepon</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><Phone size={16} /></div>
                                        <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="08123456789" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                    </div>
                                    {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Alamat Domisili</label>
                                <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.address ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                    <div className="flex items-start pt-4 pl-4 text-gray-400"><MapPin size={16} /></div>
                                    <textarea value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Alamat lengkap beserta kota" rows={2} className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0 resize-none" />
                                </div>
                                {errors.address && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.address}</p>}
                            </div>

                            <div className="h-px bg-gray-200/80 w-full my-6"></div>

                            {/* ── SEGMEN: KREDENSIAL LOGIN ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Username */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Username</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.username ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><User size={16} /></div>
                                        <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} placeholder="Username login" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                    </div>
                                    {errors.username && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.username}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email <span className="font-normal text-gray-400 capitalize">(Opsional)</span></label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.email ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><Mail size={16} /></div>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="wali@email.com" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                    </div>
                                    {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Kata Sandi</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><Lock size={16} /></div>
                                        <input type={showPassword ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 Karakter" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                        <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.password}</p>}
                                </div>

                                {/* Konfirmasi Password */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Ulangi Sandi</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.password_confirmation ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400"><Lock size={16} /></div>
                                        <input type={showConfirmPassword ? 'text' : 'password'} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Min. 8 Karakter" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" />
                                        <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.password_confirmation}</p>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Mendaftarkan...
                                    </>
                                ) : (
                                    <>
                                        Daftar Sekarang <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}