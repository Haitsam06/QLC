// resources/js/Components/Footer.tsx
import React from 'react';
import { router } from '@inertiajs/react';

const Footer = () => {
    // Mempertahankan fungsi scroll yang sudah ada
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

            {/* CTA Floating Box - Optimasi Padding Mobile */}
            <div className="relative z-10 mx-4 sm:mx-8 lg:mx-12 mb-16 bg-white/95 border border-gray-100 shadow-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 text-center transition-shadow duration-300 hover:shadow-2xl">
                <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
                    Mari Berkolaborasi Mencetak <br className="hidden md:block" />
                    <span className="text-[#1B6B3A]">Generasi Quran</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 md:mb-10 text-sm md:text-lg leading-relaxed">Bergabunglah bersama kami sebagai santri, mitra institusi, atau bagian dari donatur pengembangan fasilitas Quantum Learning Center.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                    <button className="bg-[#1B6B3A] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-md hover:shadow-[#1B6B3A]/30 hover:-translate-y-1 transition-all active:scale-95">Hubungi Admin</button>
                    <button onClick={() => router.get('/login')} className="bg-white border border-gray-200 text-gray-800 px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-sm hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-95">
                        Daftar Sekarang
                    </button>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pb-8">
                {/* Grid: 2 Kolom di mobile (agar tidak terlalu panjang), 4 Kolom di desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-12">
                    {/* Kolom 1: Brand (Full width di mobile agar deskripsi terbaca) */}
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#0a381d] flex items-center justify-center text-white font-bold text-xl shadow-md">Q</div>
                            <span className="ml-3 font-bold text-xl tracking-tight text-[#1B6B3A]">Pejuang Quran</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 pr-4">Membangun generasi Rabbani terpadu dengan sistem pelaporan digital interaktif untuk mencetak pemimpin masa depan.</p>
                        <div className="flex space-x-3">
                            {['facebook', 'instagram', 'youtube'].map((soc) => (
                                <button key={soc} className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white transition-all shadow-sm">
                                    <span className="text-[10px] font-bold">{soc.substring(0, 2).toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kolom 2: Tautan Cepat */}
                    <div className="col-span-1">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Tautan</h4>
                        <ul className="space-y-4">
                            {['Beranda', 'Tentang Kami', 'Visi & Misi', 'Galeri'].map((link) => (
                                <li key={link}>
                                    <button onClick={() => scrollTo(link.split(' ')[0].toLowerCase())} className="text-gray-500 hover:text-[#1B6B3A] text-sm font-medium transition-colors">
                                        {link}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kolom 3: Program */}
                    <div className="col-span-1">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Program</h4>
                        <ul className="space-y-4">
                            {['QL - SCHOOL', 'QL - PARENTING', 'QL - KIDS'].map((prog) => (
                                <li key={prog}>
                                    <button onClick={() => scrollTo('program')} className="text-gray-500 hover:text-[#1B6B3A] text-sm font-medium transition-colors text-left">
                                        {prog}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kolom 4: Kontak (Full width di mobile agar alamat tidak terpotong) */}
                    <div className="col-span-2 lg:col-span-1">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li className="flex items-start group">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-[#D4A017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>Jl. Pendidikan No.123, Bekasi, Jawa Barat</span>
                            </li>
                            <li className="flex items-center group">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-[#D4A017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="pt-8 border-t border-gray-100 flex flex-col md:row justify-between items-center gap-4">
                    <p className="text-gray-400 text-xs font-medium text-center md:text-left">
                        &copy; {new Date().getFullYear()} QLC Pejuang Quran. <br className="md:hidden" /> All rights reserved.
                    </p>
                    <div className="flex gap-6 text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <button className="hover:text-[#1B6B3A] transition-colors">Privasi</button>
                        <button className="hover:text-[#1B6B3A] transition-colors">Syarat</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
