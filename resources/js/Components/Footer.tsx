// resources/js/Components/Footer.tsx
import React from 'react';
import { router } from '@inertiajs/react';

const Footer = () => {
    const glassClass = 'bg-white/60 backdrop-blur-lg border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        } else {
            router.get(`/#${id}`);
        }
    };

    return (
        <footer className="mt-10 relative pt-10 bg-white">
            <div className="bg-gradient-to-b from-transparent to-[#1B6B3A]/10 absolute inset-0 z-0"></div>

            {/* CTA Floating Box */}
            {/* OPTIMASI 1: Menghapus variabel ${glassClass} (backdrop-blur) dan menggantinya dengan background putih solid (bg-white/95) serta shadow-xl */}
            <div className="relative z-10 mx-4 sm:mx-8 lg:mx-12 mb-16 bg-white/95 border border-gray-100 shadow-xl rounded-[3rem] p-12 lg:p-16 text-center transition-shadow duration-300 hover:shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Mari Berkolaborasi Mencetak Generasi Quran</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
                    Bergabunglah bersama kami sebagai santri, mitra institusi, atau bagian dari donatur pengembangan fasilitas Quantum Learning Center.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="bg-[#1B6B3A] text-white px-8 py-4 rounded-full font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">Hubungi Admin</button>
                    <button
                        onClick={() => router.get('/login')}
                        className="bg-white border border-gray-200 text-gray-800 px-8 py-4 rounded-full font-bold text-lg shadow-sm hover:bg-gray-50 transition-all hover:-translate-y-1"
                    >
                        Daftar Sekarang
                    </button>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Kolom 1: Brand */}
                    <div>
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#0a381d] flex items-center justify-center text-white font-bold text-xl shadow-md">Q</div>
                            <span className="ml-3 font-bold text-xl tracking-tight text-[#1B6B3A]">Pejuang Quran</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            Membangun generasi Rabbani terpadu. Terintegrasi dengan sistem pelaporan digital interaktif bagi orang tua dan asatidz untuk mencetak pemimpin masa depan.
                        </p>
                        <div className="flex space-x-4">
                            {['facebook', 'instagram', 'youtube'].map((soc) => (
                                <button
                                    key={soc}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white transition-colors shadow-sm hover:-translate-y-1"
                                >
                                    <span className="text-xs font-bold">{soc.substring(0, 2).toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kolom 2: Tautan Cepat */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Tautan Cepat</h4>
                        <ul className="space-y-3">
                            {['Beranda', 'Tentang Kami', 'Visi & Misi', 'Galeri'].map((link) => (
                                <li key={link}>
                                    <button
                                        onClick={() => scrollTo(link.split(' ')[0].toLowerCase())}
                                        className="text-gray-600 hover:text-[#1B6B3A] text-sm font-medium transition-colors hover:translate-x-1"
                                    >
                                        {link}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kolom 3: Program */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Program Kami</h4>
                        <ul className="space-y-3">
                            {['QL - SCHOOL', 'QL - TFT', 'QL - PARENTING', 'QL - KIDS'].map((prog) => (
                                <li key={prog}>
                                    <button onClick={() => scrollTo('program')} className="text-gray-600 hover:text-[#1B6B3A] text-sm font-medium transition-colors hover:translate-x-1">
                                        {prog}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kolom 4: Kontak */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4 text-sm text-gray-600 font-medium">
                            <li className="flex items-start group">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-[#D4A017] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>Jl. Pendidikan No.123, Kota Bekasi, Jawa Barat, Indonesia</span>
                            </li>
                            <li className="flex items-center group">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-[#D4A017] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    ></path>
                                </svg>
                                <span>+62 812 3456 7890</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="pt-8 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} QLC Pejuang Quran. All rights reserved.</p>
                    <div className="flex gap-6 text-sm font-medium text-gray-500">
                        <button className="hover:text-[#1B6B3A] transition-colors">Kebijakan Privasi</button>
                        <button className="hover:text-[#1B6B3A] transition-colors">Syarat & Ketentuan</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
