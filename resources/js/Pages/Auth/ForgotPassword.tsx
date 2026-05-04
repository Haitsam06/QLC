import { FormEvent, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Lock, Key, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
    // State untuk mengontrol tahap (1 = Input Email, 2 = Input OTP & Password Baru)
    const [step, setStep] = useState<1 | 2>(1);

    // State Data Form
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // State UI
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState<any>({});

    // State Toggle Password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Handler untuk mengirim Email OTP (Step 1)
    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            const response = await axios.post('/api/forgot-password/send-otp', { email });
            setStatus(response.data.message);
            setStep(2);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ email: ['Terjadi kesalahan pada server.'] });
            }
        } finally {
            setProcessing(false);
        }
    };

    // Handler untuk Submit Verifikasi OTP dan Password (Step 2)
    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post('/api/forgot-password/reset', {
                email: email,
                otp: otp,
                password: password,
                password_confirmation: passwordConfirmation,
            });

            setStatus(response.data.message);

            // Redirect ke halaman login setelah 3 detik
            setTimeout(() => {
                window.location.href = route('login');
            }, 3000);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ otp: ['Terjadi kesalahan saat memverifikasi OTP.'] });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Lupa Kata Sandi" />

            <style>{`
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .anim-fade { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            <div className="min-h-screen w-full flex flex-row font-sans text-gray-800 bg-white">
                {/* Bagian Kiri (Gradient Background) */}
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

                    <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center anim-fade">
                        <div className="w-20 h-20 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-sm">
                            <BookOpen size={40} className="text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                            Portal Terpadu <br />
                            <span className="text-green-300">Pejuang Quran</span>
                        </h1>
                        <p className="text-green-100 text-lg leading-relaxed h-20">Jangan khawatir, kami akan membantu Anda memulihkan akses ke dalam sistem portal QLC dengan aman.</p>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-green-200 bg-white bg-opacity-10 px-6 py-3 rounded-full border border-white border-opacity-10">
                            <ShieldCheck size={18} />
                            <span>Akses Pemulihan Terenkripsi</span>
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan (Form Lupa Password) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 relative bg-gray-50 min-h-screen overflow-y-auto">
                    <div className="w-full max-w-xl mx-auto anim-fade">
                        {/* Header Kanan & Tombol Kembali */}
                        <div className="mb-10 flex items-center justify-between">
                            <Link href={route('login')} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Kembali ke Halaman Masuk
                            </Link>

                            <div className="flex lg:hidden items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center text-white shadow-sm">
                                    <BookOpen size={12} strokeWidth={2.5} />
                                </div>
                                <div className="font-bold text-gray-900 text-xs">QLC</div>
                            </div>
                        </div>

                        {/* Judul Form */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{step === 1 ? 'Pulihkan Akses Anda' : 'Buat Kata Sandi Baru'}</h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                {step === 1 ? 'Lupa kata sandi Anda? Tidak masalah. Masukkan alamat email yang terdaftar pada akun Anda, dan kami akan mengirimkan kode OTP.' : 'Silakan masukkan 6 digit kode OTP yang telah dikirimkan ke email Anda beserta kata sandi baru yang ingin digunakan.'}
                            </p>
                        </div>

                        {/* Alert Status */}
                        {status && (
                            <div className="mb-6 text-sm font-bold text-green-700 bg-green-100 border border-green-200 rounded-xl px-4 py-4 flex items-start gap-3 anim-fade">
                                <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* FORM ========================================== */}
                        {step === 1 ? (
                            /* --- STEP 1: FORM EMAIL --- */
                            <form onSubmit={handleSendOtp} className="space-y-5 anim-fade">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.email ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                            <Mail size={16} />
                                        </div>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Masukkan email akun Anda" className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0" autoFocus />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.email[0]}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Mengirim Kode...
                                        </>
                                    ) : (
                                        <>
                                            Kirim Kode OTP <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* --- STEP 2: FORM OTP & PASSWORD --- */
                            <form onSubmit={handleResetPassword} className="space-y-5 anim-fade">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kode OTP (6 Digit)</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.otp ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                            <Key size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            placeholder="Contoh: 123456"
                                            maxLength={6}
                                            className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 tracking-widest focus:ring-0"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.otp && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.otp[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Baru</label>
                                    <div className={`relative flex bg-white border rounded-xl overflow-hidden transition-all ${errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100'}`}>
                                        <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Minimal 8 karakter"
                                            className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                        />
                                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.password[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ulangi Kata Sandi Baru</label>
                                    <div className="relative flex bg-white border border-gray-200 rounded-xl overflow-hidden transition-all focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
                                        <div className="flex items-center pl-4 text-gray-400 flex-shrink-0">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            required
                                            placeholder="Ketik ulang kata sandi"
                                            className="flex-1 pl-3 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-transparent outline-none border-0 focus:ring-0"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 mt-6 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Simpan Kata Sandi Baru <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-6">
                                    <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">
                                        Salah memasukkan email? Kembali
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Footer Bantuan */}
                        <div className="mt-12 pt-6 border-t border-gray-200/60 text-center">
                            <p className="text-sm font-medium text-gray-500">Masih mengalami kendala?</p>
                            <a href="mailto:admin@qlc.sch.id" className="text-green-600 font-bold hover:text-green-800 mt-1 inline-block text-sm transition-colors">
                                Hubungi Administrator QLC
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
