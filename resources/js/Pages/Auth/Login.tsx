import { useState } from 'react';
import { BookOpen, User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen w-full flex font-sans text-gray-800 bg-white">
            
            {/* ════ SISI KIRI: BRANDING VISUAL (Hanya tampil di layar laptop/desktop) ════ */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 to-green-900 relative items-center justify-center overflow-hidden">
                {/* Ornamen Dekorasi Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-green-500 bg-opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-sm">
                        <BookOpen size={40} className="text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                        Portal Terpadu <br/> <span className="text-green-300">Pejuang Quran</span>
                    </h1>
                    <p className="text-green-100 text-lg leading-relaxed">
                        Sistem informasi tunggal untuk mengakses layanan akademik, manajemen kemitraan, evaluasi santri, dan laporan institusi QLC.
                    </p>

                    <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-green-200 bg-white bg-opacity-10 px-6 py-3 rounded-full border border-white border-opacity-10">
                        <ShieldCheck size={18} />
                        <span>Akses Aman & Terenkripsi</span>
                    </div>
                </div>
            </div>

            {/* ════ SISI KANAN: FORM LOGIN ════ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                
                {/* Logo & Judul Mobile (Muncul jika layar kecil/HP) */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md">
                        <BookOpen size={16} strokeWidth={2.5} />
                    </div>
                    <div className="font-bold text-gray-900 text-sm">Pejuang Quran</div>
                </div>

                <div className="w-full max-w-md">
                    {/* Header Form */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang</h2>
                        <p className="text-gray-500 text-sm font-medium">
                            Silakan masuk menggunakan kredensial akun QLC Anda.
                        </p>
                    </div>

                    {/* Form Login */}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        
                        {/* Input Username/Email/ID */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Username / Email / ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                                    placeholder="Masukkan identitas akun anda"
                                    required
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Options: Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                                />
                                <span className="text-sm font-semibold text-gray-600">Ingat sesi saya</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-green-600 hover:text-green-800 transition-colors">
                                Lupa kata sandi?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full py-3.5 mt-8 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 focus:ring-4 focus:ring-green-600 focus:ring-opacity-20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                        >
                            Masuk ke Sistem <ArrowRight size={18} />
                        </button>

                    </form>

                    {/* Footer Info */}
                    <div className="mt-10 pt-6 border-t border-gray-100 text-center flex flex-col items-center">
                        <p className="text-sm font-medium text-gray-500">
                            Kesulitan mengakses akun Anda?
                        </p>
                        <a href="#" className="text-green-600 font-bold hover:text-green-800 mt-1 inline-block">
                            Hubungi Administrator QLC
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}