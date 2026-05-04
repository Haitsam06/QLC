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
    // State untuk mengontrol tab aktif (Login atau Register)
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

    // State untuk mengontrol tahapan form Register (1: Isi Data, 2: Input OTP)
    const [registerStep, setRegisterStep] = useState<1 | 2>(1);
    const [registerStatusMessage, setRegisterStatusMessage] = useState('');

    // State UI
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form Instance untuk Login
    const loginForm = useForm({
        username: '',
        password: '',
        remember: false,
    });

    // Form Instance untuk Register (ditambah field 'otp')
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

    // Handler Submit Login
    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    // Handler Tahap 1: Kirim OTP Pendaftaran
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
            setRegisterStep(2); // Geser ke form OTP
        } catch (error: any) {
            if (error.response?.data?.errors) {
                // Menangkap pesan error dari server dan memasukannya ke useForm Inertia
                const validationErrors = error.response.data.errors;
                for (const key in validationErrors) {
                    registerForm.setError(key as any, validationErrors[key][0]);
                }
            } else {
                registerForm.setError('email', 'Terjadi kesalahan pada server saat mengirim OTP.');
            }
        }
    };

    // Handler Tahap 2: Submit Seluruh Form & OTP ke fungsi store() di Controller
    const handleRegisterSubmit = (e: FormEvent) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation', 'otp'),
        });
    };

    // Helper: Reset tab registrasi jika user pindah ke tab Login
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
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .anim-fade { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            <div className="min-h-screen w-full flex flex-row font-sans text-gray-800 bg-white">
                <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-green-800 to-green-900">
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <div className="absolute -top-24 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl -left-24" />
                        <div className="absolute bottom-0 w-3/4 h-3/4 bg-green-500 bg-opacity-20 rounded-full blur-3xl right-0 translate-x-1/3 translate-y-1/3" />
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                    </div>

                    <div key={`brand-text-${activeTab}`} className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center anim-fade">
                        <div className="w-20 h-20 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-sm">
                            <BookOpen size={40} className="text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                            Portal Terpadu <br />
                            <span className="text-green-300">Pejuang Quran</span>
                        </h1>
                        <p className="text-green-100 text-lg leading-relaxed h-20">
                            {activeTab === 'login' ? 'Sistem informasi tunggal untuk mengakses layanan akademik, manajemen kemitraan, evaluasi santri, dan laporan institusi QLC.' : 'Mulai perjalanan pendidikan buah hati Anda dengan bergabung ke dalam sistem informasi institusi QLC.'}
                        </p>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-green-200 bg-white bg-opacity-10 px-6 py-3 rounded-full border border-white border-opacity-10">
                            <ShieldCheck size={18} />
                            <span>{activeTab === 'login' ? 'Akses Aman & Terenkripsi' : 'Data Pribadi Terlindungi Aman'}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 relative bg-gray-50 min-h-screen overflow-y-auto">
                    <div className="w-full max-w-xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Kembali ke Beranda
                            </Link>

                            <div className="flex lg:hidden items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center text-white shadow-sm">
                                    <BookOpen size={12} strokeWidth={2.5} />
                                </div>
                                <div className="font-bold text-gray-900 text-xs">QLC</div>
                            </div>
                        </div>

                        {/* TAB MENU */}
                        <div className="flex bg-gray-200/60 p-1.5 rounded-2xl mb-10 shadow-inner">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('register');
                                    loginForm.clearErrors();
                                }}
                                className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                                Daftar Wali Murid
                            </button>
                            <button type="button" onClick={switchToLogin} className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'login' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                Masuk
                            </button>
                        </div>

                        <div key={`content-${activeTab}`} className="anim-fade">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{activeTab === 'login' ? 'Selamat Datang Kembali' : registerStep === 1 ? 'Buat Akun Baru' : 'Verifikasi Email Anda'}</h2>
                                <p className="text-gray-500 text-sm font-medium">
                                    {activeTab === 'login' ? 'Silakan masuk menggunakan kredensial akun QLC Anda.' : registerStep === 1 ? 'Lengkapi data di bawah ini untuk mendaftarkan akun.' : 'Masukkan 6 digit kode OTP yang telah kami kirimkan ke email Anda.'}
                                </p>
                            </div>

                            {status && activeTab === 'login' && <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{status}</div>}

                            {activeTab === 'login' ? (
                                /* ================= FORM LOGIN ================= */
                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Username / ID</label>
                                        <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${loginForm.errors.username ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                            <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                                <User size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                value={loginForm.data.username}
                                                onChange={(e) => loginForm.setData('username', e.target.value)}
                                                placeholder="Masukkan username akun Anda"
                                                className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                            />
                                        </div>
                                        {loginForm.errors.username && (
                                            <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {loginForm.errors.username}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi</label>
                                        <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${loginForm.errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                            <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginForm.data.password}
                                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                            />
                                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {loginForm.errors.password && (
                                            <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {loginForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={loginForm.data.remember as boolean} onChange={(e) => loginForm.setData('remember', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600" />
                                            <span className="text-sm font-semibold text-gray-600">Ingat sesi saya</span>
                                        </label>
                                        {canResetPassword && (
                                            <a href={route('password.request')} className="text-sm font-bold text-green-600 hover:text-green-800 transition-colors">
                                                Lupa kata sandi?
                                            </a>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loginForm.processing}
                                        className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                                    >
                                        {loginForm.processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                            ) : /* ================= FORM REGISTER ================= */
                            registerStep === 1 ? (
                                /* --- STEP 1: FORM DATA PENDAFTARAN --- */
                                <form onSubmit={handleSendRegisterOtp} className="space-y-5 anim-fade">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nama Lengkap</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.parent_name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <User size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={registerForm.data.parent_name}
                                                    onChange={(e) => registerForm.setData('parent_name', e.target.value)}
                                                    placeholder="Contoh: Budi Santoso"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                            </div>
                                            {registerForm.errors.parent_name && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.parent_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nomor Telepon</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <Phone size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={registerForm.data.phone}
                                                    onChange={(e) => registerForm.setData('phone', e.target.value)}
                                                    placeholder="08123456789"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                            </div>
                                            {registerForm.errors.phone && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Alamat Domisili</label>
                                        <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.address ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                            <div className="flex items-start pt-4 pl-4 text-gray-400">
                                                <MapPin size={16} />
                                            </div>
                                            <textarea
                                                value={registerForm.data.address}
                                                onChange={(e) => registerForm.setData('address', e.target.value)}
                                                placeholder="Alamat lengkap beserta kota"
                                                rows={2}
                                                className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0 resize-none"
                                            />
                                        </div>
                                        {registerForm.errors.address && (
                                            <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {registerForm.errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="h-px bg-gray-200/80 w-full my-6"></div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Username</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.username ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <User size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={registerForm.data.username}
                                                    onChange={(e) => registerForm.setData('username', e.target.value)}
                                                    placeholder="Username login"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                            </div>
                                            {registerForm.errors.username && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.username}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.email ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <Mail size={16} />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={registerForm.data.email}
                                                    onChange={(e) => registerForm.setData('email', e.target.value)}
                                                    placeholder="wali@email.com"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                            </div>
                                            {registerForm.errors.email && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Kata Sandi</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={registerForm.data.password}
                                                    onChange={(e) => registerForm.setData('password', e.target.value)}
                                                    placeholder="Min. 8 Karakter"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                                <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {registerForm.errors.password && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Ulangi Sandi</label>
                                            <div
                                                className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.password_confirmation ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}
                                            >
                                                <div className="flex items-center pl-4 text-gray-400">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={registerForm.data.password_confirmation}
                                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                                    placeholder="Min. 8 Karakter"
                                                    className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {registerForm.errors.password_confirmation && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {registerForm.errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={registerForm.processing}
                                        className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                                    >
                                        {registerForm.processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Mengecek Data...
                                            </>
                                        ) : (
                                            <>
                                                Lanjutkan Verifikasi <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* --- STEP 2: FORM OTP PENDAFTARAN --- */
                                <form onSubmit={handleRegisterSubmit} className="space-y-5 anim-fade">
                                    {registerStatusMessage && (
                                        <div className="mb-6 text-sm font-bold text-green-700 bg-green-100 border border-green-200 rounded-xl px-4 py-4 flex items-start gap-3">
                                            <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                                            <span>{registerStatusMessage}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 text-center">Kode OTP (6 Digit)</label>
                                        <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${registerForm.errors.otp ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                            <div className="flex items-center pl-4 text-gray-400">
                                                <Key size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                value={registerForm.data.otp}
                                                onChange={(e) => registerForm.setData('otp', e.target.value)}
                                                placeholder="Contoh: 123456"
                                                maxLength={6}
                                                className="flex-1 pl-3 pr-4 py-4 text-center text-lg font-bold tracking-widest text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                                autoFocus
                                            />
                                        </div>
                                        {registerForm.errors.otp && (
                                            <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1 justify-center">
                                                <AlertCircle size={12} /> {registerForm.errors.otp}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={registerForm.processing}
                                        className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                                    >
                                        {registerForm.processing ? 'Memproses Pendaftaran...' : 'Selesaikan Pendaftaran'}
                                    </button>

                                    <div className="text-center mt-6">
                                        <button type="button" onClick={() => setRegisterStep(1)} className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">
                                            Kembali edit data diri
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200/60 text-center">
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
