'use client';

import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

interface Leader {
    id: string;
    nama: string;
    jabatan: string;
    deskripsi: string | null;
    poin: string | null;
    image_url: string | null;
}

interface Props {
    leaders: Leader[];
}

export default function Pengurus({ leaders }: Props) {
    // OPTIMASI: Ganti backdrop-blur dengan bg-white solid atau transparansi rendah tanpa blur
    const cardClass = 'bg-white border border-gray-100 shadow-lg';

    const styleData = {
        warna: 'from-[#1B6B3A] to-[#34ad62]',
        textColor: 'text-[#1B6B3A]',
        iconBg: 'bg-emerald-50 text-[#1B6B3A]',
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800">
            <Head title="Pendiri & Pengurus - QLC" />
            <Navbar />

            <main className="px-4 pt-36 pb-24 max-w-5xl mx-auto relative">
                <button 
                    onClick={() => window.history.back()} 
                    className="absolute top-20 left-4 flex items-center gap-1 text-gray-600 text-sm font-bold active:scale-90 transition-all hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm z-10"
                >
                    <ChevronLeft size={18} /> Kembali
                </button>
                
                {/* --- HEADER --- */}
                <div className="text-center mb-16">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] text-xs font-bold tracking-widest mb-4 uppercase">👥 Profil Kami</span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
                        Dewan Pendiri & <span className="text-[#1B6B3A]">Pengurus QLC</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Mengenal lebih dekat tokoh-tokoh di balik lahirnya Quantum Learning Center yang berdedikasi mencetak pemimpin masa depan.</p>
                </div>

                {/* --- DAFTAR PENGURUS --- */}
                <div className="space-y-8">
                    {leaders.map((orang) => (
                        <div key={orang.id} className={`${cardClass} rounded-[2rem] flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 transition-transform duration-300 hover:scale-[1.01] overflow-hidden relative`}>
                            {/* Dekorasi Pojok - Disederhanakan agar ringan */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B6B3A]/5 rounded-bl-full pointer-events-none"></div>

                            {/* Kiri: Foto */}
                            <div className="w-full md:w-1/3 flex justify-center">
                                <div className="relative w-48 md:w-64 aspect-[3/4] shrink-0">
                                    <div className="w-full h-full border-4 border-white shadow-md rounded-2xl overflow-hidden bg-gray-100">
                                        <img
                                            src={orang.image_url || `https://ui-avatars.com/api/?name=${orang.nama}&background=1B6B3A&color=fff`}
                                            alt={orang.nama}
                                            className="w-full h-full object-cover"
                                            loading="lazy" // OPTIMASI: Lazy load gambar
                                        />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-2 border-white bg-[#1B6B3A] flex items-center justify-center text-white shadow-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: Detail Profil */}
                            <div className="w-full md:w-2/3 flex flex-col">
                                <div className="mb-4 text-center md:text-left">
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{orang.nama}</h2>
                                    <p className="text-sm font-bold text-[#1B6B3A] uppercase tracking-widest">{orang.jabatan}</p>
                                </div>

                                <p className="text-gray-600 mb-6 text-sm md:text-base text-center md:text-left leading-relaxed">{orang.deskripsi || 'Belum ada deskripsi profil.'}</p>

                                {/* Kualifikasi Box */}
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Kualifikasi & Pengalaman</h4>
                                    <ul className="grid grid-cols-1 gap-3">
                                        {orang.poin
                                            ?.split('\n')
                                            .filter(Boolean)
                                            .map((p, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className={`mt-0.5 ${styleData.iconBg} rounded-full p-1 flex-shrink-0`}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium leading-snug">{p}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
