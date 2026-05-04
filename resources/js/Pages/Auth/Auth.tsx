import { useState, FormEvent } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import { BookOpen, User, Lock, Eye, EyeOff, Mail, ArrowRight, ShieldCheck, AlertCircle, Phone, MapPin, ArrowLeft, Key } from 'lucide-react';

interface Props {
    status?: string;
    canResetPassword?: boolean;
    initialTab?: 'login' | 'register';
}

export default function Auth({ status, canResetPassword = true, initialTab = 'login' }: Props) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
    const [registerStep, setRegisterStep] = useState<1 | 2>(1);
    const [registerStatusMessage, setRegisterStatusMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const loginForm = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const registerForm = useForm({
        parent_name: '',
        phone: '',
        address: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        otp: '',
    });

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const handleSendRegisterOtp = async (e: FormEvent) => {
        e.preventDefault();
        registerForm.clearErrors();
        setRegisterStatusMessage('');

        try {
            const response = await axios.post(route('register.send-otp'), {
                parent_name: registerForm.data.parent_name,
                phone: registerForm.data.phone,
                address: registerForm.data.address,
                username: registerForm.data.username,
                email: registerForm.data.email,
                password: registerForm.data.password,
                password_confirmation: registerForm.data.password_confirmation,
            });

            setRegisterStatusMessage(response.data.message);
            setRegisterStep(2);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                for (const key in validationErrors) {
                    registerForm.setError(key as any, validationErrors[key][0]);
                }
            } else {
                registerForm.setError('email', 'Terjadi kesalahan pada server saat mengirim OTP.');
            }
        }
    };

    const handleRegisterSubmit = (e: FormEvent) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation', 'otp'),
        });
    };

    const switchToLogin = () => {
        setActiveTab('login');
        registerForm.clearErrors();
        setRegisterStep(1);
        setRegisterStatusMessage('');
    };

    return (
        <>
            <Head title={activeTab === 'login' ? 'Masuk' : 'Pendaftaran Wali Murid'} />

            <style>{`
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .anim-fade { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                input, textarea { font-size: 16px !important; }
            `}</style>

            <div className="min-h-screen w-full flex flex-row font-sans text-gray-800 bg-white">
                {/* SISI KIRI: BRANDING (Hanya Desktop) */}
                <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#1B6B3A] to-[#0a381d]">
                    <div className="absolute inset-0 z-0 opacity-20">
                        <div className="absolute -top-24 w-96 h-96 bg-white rounded-full blur-3xl -left-24" />
                        <div className="absolute bottom-0 w-3/4 h-3/4 bg-green-400 rounded-full blur-3xl right-0 translate-x-1/3 translate-y-1/3" />
                    </div>

                    <div key={`brand-text-${activeTab}`} className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center anim-fade">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl">
                            <BookOpen size={48} className="text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                            Portal Terpadu <br />
                            <span className="text-[#D4A017]">Pejuang Quran</span>
                        </h1>
                        <p className="text-green-50 text-xl leading-relaxed opacity-90">
                            {activeTab === 'login' ? 'Sistem informasi tunggal untuk mengakses layanan akademik, manajemen kemitraan, evaluasi santri, dan laporan institusi QLC.' : 'Mulai perjalanan pendidikan buah hati Anda dengan bergabung ke dalam sistem informasi institusi QLC.'}
                        </p>
                    </div>
                </div>

                {/* SISI KANAN: FORM (Optimasi Android/Mobile) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 relative bg-white min-h-screen overflow-y-auto">
                    <div className="w-full max-w-xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#1B6B3A] transition-all group">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Kembali ke Beranda
                            </Link>

                            {/* Logo Mobile */}
                            <div className="flex lg:hidden items-center gap-2 bg-[#1B6B3A]/5 px-4 py-2 rounded-2xl border border-[#1B6B3A]/10">
                                <div className="w-7 h-7 rounded-xl bg-[#1B6B3A] flex items-center justify-center text-white shadow-md shadow-green-900/20">
                                    <BookOpen size={14} strokeWidth={2.5} />
                                </div>
                                <div className="font-black text-[#1B6B3A] text-xs tracking-widest">QLC</div>
                            </div>
                        </div>

                        {/* TAB MENU - Pill UI */}
                        <div className="flex bg-gray-100 p-1.5 rounded-[2rem] mb-12 shadow-inner">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('register');
                                    loginForm.clearErrors();
                                }}
                                className={`flex-1 text-center py-3.5 rounded-[1.8rem] text-sm font-bold transition-all active:scale-[0.97] ${activeTab === 'register' ? 'bg-white text-[#1B6B3A] shadow-md' : 'text-gray-400'}`}
                            >
                                Daftar Wali Murid
                            </button>
                            <button type="button" onClick={switchToLogin} className={`flex-1 text-center py-3.5 rounded-[1.8rem] text-sm font-bold transition-all active:scale-[0.97] ${activeTab === 'login' ? 'bg-white text-[#1B6B3A] shadow-md' : 'text-gray-400'}`}>
                                Masuk
                            </button>
                        </div>

                        <div key={`content-${activeTab}`} className="anim-fade">
                            <div className="mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">{activeTab === 'login' ? 'Selamat Datang Kembali' : registerStep === 1 ? 'Buat Akun Baru' : 'Verifikasi Email Anda'}</h2>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    {activeTab === 'login' ? 'Silakan masuk menggunakan kredensial akun QLC Anda.' : registerStep === 1 ? 'Lengkapi data di bawah ini untuk mendaftarkan akun.' : 'Masukkan 6 digit kode OTP yang telah kami kirimkan ke email Anda.'}
                                </p>
                            </div>

                            {status && activeTab === 'login' && <div className="mb-6 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-3xl px-6 py-4 shadow-sm">{status}</div>}

                            {activeTab === 'login' ? (
                                /* ================= FORM LOGIN ================= */
                                <form onSubmit={handleLoginSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username / ID</label>
                                        <div
                                            className={`relative flex bg-gray-50 border rounded-[1.5rem] overflow-hidden transition-all ${loginForm.errors.username ? 'border-red-400 ring-4 ring-red-50' : 'border-transparent focus-within:bg-white focus-within:border-[#1B6B3A] focus-within:ring-4 focus-within:ring-[#1B6B3A]/10'}`}
                                        >
                                            <div className="flex items-center pl-5 text-gray-400">
                                                <User size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                value={loginForm.data.username}
                                                onChange={(e) => loginForm.setData('username', e.target.value)}
                                                placeholder="Masukkan username akun Anda"
                                                className="flex-1 px-4 py-4.5 text-sm font-bold text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                            />
                                        </div>
                                        {loginForm.errors.username && <p className="text-xs font-bold text-red-500 ml-2">{loginForm.errors.username}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                                        <div
                                            className={`relative flex bg-gray-50 border rounded-[1.5rem] overflow-hidden transition-all ${loginForm.errors.password ? 'border-red-400 ring-4 ring-red-50' : 'border-transparent focus-within:bg-white focus-within:border-[#1B6B3A] focus-within:ring-4 focus-within:ring-[#1B6B3A]/10'}`}
                                        >
                                            <div className="flex items-center pl-5 text-gray-400">
                                                <Lock size={20} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginForm.data.password}
                                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className="flex-1 px-4 py-4.5 text-sm font-bold text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                            />
                                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="px-5 text-gray-400 hover:text-[#1B6B3A]">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {loginForm.errors.password && <p className="text-xs font-bold text-red-500 ml-2">{loginForm.errors.password}</p>}
                                    </div>

                                    <div className="flex items-center justify-between px-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={loginForm.data.remember as boolean} onChange={(e) => loginForm.setData('remember', e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-[#1B6B3A] focus:ring-[#1B6B3A]/20 transition-all" />
                                            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700">Ingat sesi saya</span>
                                        </label>
                                        {canResetPassword && (
                                            <a href={route('password.request')} className="text-sm font-black text-[#1B6B3A]">
                                                Lupa kata sandi?
                                            </a>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loginForm.processing}
                                        className="w-full py-5 bg-[#1B6B3A] text-white rounded-[1.8rem] text-lg font-black shadow-xl shadow-green-900/20 hover:bg-[#14522d] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                    >
                                        {loginForm.processing ? (
                                            'Memproses…'
                                        ) : (
                                            <>
                                                Masuk ke Sistem <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : registerStep === 1 ? (
                                /* --- STEP 1: REGISTER --- */
                                <form onSubmit={handleSendRegisterOtp} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={registerForm.data.parent_name}
                                                onChange={(e) => registerForm.setData('parent_name', e.target.value)}
                                                placeholder="Contoh: Budi Santoso"
                                                className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/10 transition-all text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                                            <input
                                                type="text"
                                                value={registerForm.data.phone}
                                                onChange={(e) => registerForm.setData('phone', e.target.value)}
                                                placeholder="08123456789"
                                                className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/10 transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Domisili</label>
                                        <textarea
                                            value={registerForm.data.address}
                                            onChange={(e) => registerForm.setData('address', e.target.value)}
                                            placeholder="Alamat lengkap beserta kota"
                                            rows={2}
                                            className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/10 transition-all text-sm font-bold resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                            <input
                                                type="text"
                                                value={registerForm.data.username}
                                                onChange={(e) => registerForm.setData('username', e.target.value)}
                                                placeholder="Username login"
                                                className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/10 transition-all text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                            <input
                                                type="email"
                                                value={registerForm.data.email}
                                                onChange={(e) => registerForm.setData('email', e.target.value)}
                                                placeholder="wali@email.com"
                                                className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/10 transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <input
                                            type="password"
                                            value={registerForm.data.password}
                                            onChange={(e) => registerForm.setData('password', e.target.value)}
                                            placeholder="Buat Kata Sandi"
                                            className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] transition-all text-sm font-bold"
                                        />
                                        <input
                                            type="password"
                                            value={registerForm.data.password_confirmation}
                                            onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi Sandi"
                                            className="w-full px-6 py-4.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#1B6B3A] transition-all text-sm font-bold"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={registerForm.processing}
                                        className="w-full py-5 bg-[#1B6B3A] text-white rounded-[1.8rem] text-base font-black shadow-xl shadow-[#1B6B3A]/20 hover:bg-[#14522d] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6"
                                    >
                                        {registerForm.processing ? (
                                            'Mengecek Data...'
                                        ) : (
                                            <>
                                                Lanjutkan Verifikasi <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* --- STEP 2: OTP --- */
                                <form onSubmit={handleRegisterSubmit} className="space-y-8 text-center">
                                    <div className="p-8 bg-[#1B6B3A]/5 rounded-[2.5rem] border border-[#1B6B3A]/10">
                                        <Key size={40} className="mx-auto text-[#1B6B3A] mb-4" />
                                        <p className="text-sm font-bold text-[#1B6B3A] leading-relaxed px-2">{registerStatusMessage}</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={registerForm.data.otp}
                                        onChange={(e) => registerForm.setData('otp', e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full py-7 bg-gray-50 border-transparent rounded-[2.5rem] focus:bg-white focus:border-[#1B6B3A] focus:ring-8 focus:ring-[#1B6B3A]/5 transition-all text-4xl font-black text-center tracking-[0.5em] text-[#1B6B3A]"
                                    />
                                    <button type="submit" disabled={registerForm.processing} className="w-full py-5 bg-[#1B6B3A] text-white rounded-[2.5rem] text-lg font-black shadow-xl shadow-[#1B6B3A]/20 hover:bg-[#14522d] active:scale-[0.98] transition-all">
                                        Selesaikan Pendaftaran
                                    </button>
                                    <button type="button" onClick={() => setRegisterStep(1)} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
                                        Edit data diri
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
                            <p className="text-sm font-bold text-gray-400 mb-3">Butuh bantuan akses akun?</p>
                            <a href="mailto:admin@qlc.sch.id" className="text-[#1B6B3A] font-black hover:opacity-70 transition-opacity flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]">
                                <Mail size={14} /> Hubungi Administrator QLC
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
