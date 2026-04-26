'use client';

import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';

// Buat struktur tipe data yang diterima dari database
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
    const glassClass = 'bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl';

    // Gaya seragam untuk efek warna hijau khas QLC
    const styleData = {
        warna: 'from-[#1B6B3A] to-[#34ad62]',
        bgGlow: 'bg-[#1B6B3A]/5',
        textColor: 'text-[#1B6B3A]',
        iconBg: 'bg-emerald-100 text-[#1B6B3A]',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20">
            <Head title="Pendiri & Pengurus - QLC" />

            <Navbar />

            <main className="px-4 pt-36 pb-24 max-w-5xl mx-auto relative z-10">
                {/* --- HEADER --- */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <span className="inline-block py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">👥 PROFIL KAMI</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Dewan Pendiri & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#34ad62]">Pengurus QLC</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Mengenal lebih dekat tokoh-tokoh di balik lahirnya Quantum Learning Center yang berdedikasi mencetak pemimpin masa depan.</p>
                </div>

                {/* --- DAFTAR PENGURUS DINAMIS --- */}
                <div className="space-y-12">
                    {leaders.map((orang, idx) => (
                        <div
                            key={orang.id}
                            className={`${glassClass} ${styleData.bgGlow} rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center gap-10 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative group`}
                            style={{
                                animationDelay: `${idx * 150}ms`,
                                animationFillMode: 'both',
                            }}
                        >
                            {/* Elemen Dekorasi Abstrak */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${styleData.warna} opacity-5 rounded-bl-[100px]`}></div>

                            {/* Kiri: Foto */}
                            <div className="w-full md:w-1/3 flex justify-center relative">
                                <div className="relative w-56 md:w-72 lg:w-80 flex-shrink-0 mx-auto md:mx-0">
                                    <div className={`relative w-full aspect-[3/4] border-[6px] border-white shadow-lg overflow-hidden bg-white flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-500 rounded-xl`}>
                                        <img
                                            src={orang.image_url || `https://ui-avatars.com/api/?name=${orang.nama}&background=1B6B3A&color=fff`}
                                            alt={orang.nama}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${orang.nama}&background=1B6B3A&color=fff`;
                                            }}
                                        />
                                    </div>

                                    <div
                                        className={`absolute -bottom-4 -right-4 md:bottom-2 md:right-2 w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br ${styleData.warna} shadow-md z-20 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: Detail Profil */}
                            <div className="w-full md:w-2/3 flex flex-col justify-center z-10">
                                <div className="mb-4 text-center md:text-left">
                                    <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${styleData.warna}`}>{orang.nama}</h2>
                                    <p className="text-lg font-bold text-gray-700 tracking-wide uppercase text-sm">{orang.jabatan}</p>
                                </div>

                                <p className="text-gray-600 mb-8 text-center md:text-left leading-relaxed text-lg whitespace-pre-line">{orang.deskripsi || 'Belum ada deskripsi profil.'}</p>

                                <div className="bg-white/60 rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className={`text-xs font-bold ${styleData.textColor} mb-4 uppercase tracking-widest`}>Kualifikasi & Pengalaman</h4>
                                    <ul className="space-y-3">
                                        {orang.poin
                                            ?.split('\n')
                                            .filter(Boolean)
                                            .map((p: string, i: number) => (
                                                <li key={i} className="flex items-start">
                                                    <div className={`mr-4 mt-0.5 ${styleData.iconBg} rounded-full p-1 shadow-sm flex-shrink-0`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                    <span className="text-base text-gray-700 font-medium leading-tight">{p}</span>
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
