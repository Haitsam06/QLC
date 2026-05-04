'use client';

import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Handshake, ArrowRight, Star, Camera, ChevronLeft } from 'lucide-react';

export default function ProgramDetail() {
    // Reusable Glass Class - Dioptimalkan untuk Mobile (Border lebih halus)
    const glassClass = 'bg-white/80 backdrop-blur-lg border border-white/40 shadow-lg';

    const dummyProgram = {
        title: 'QL - SCHOOL',
        subtitle: "Pendidikan Terpadu Al-Qur'an",
        heroImage: '/image/landing/1 (5).png',
        secondaryImage: '/image/landing/1 (1).png',
        description: [
            "Program pendidikan formal berkesinambungan dan terpadu berbasis Al-Qur'an. Kami mendesain kurikulum khusus yang mengintegrasikan ilmu pengetahuan umum dengan hafalan dan pemahaman Al-Qur'an.",
            'Tujuan utama dari QL-School adalah mencetak generasi pemimpin masa depan yang cerdas secara akademik dan berakhlak mulia.',
        ],
        advantages: [
            {
                title: 'Kurikulum Terintegrasi',
                desc: 'Perpaduan seimbang antara kurikulum Diknas dan kurikulum kepesantrenan.',
            },
            {
                title: 'Pembiasaan Adab Harian',
                desc: 'Fokus pada pembentukan karakter santri melalui praktik adab Islami sehari-hari.',
            },
            {
                title: 'Target Hafalan Mutqin',
                desc: 'Target capaian hafalan terukur dengan metode murojaah sistematis.',
            },
        ],
        gallery: [
            { url: '/image/landing/1 (2).png', alt: 'Kegiatan Belajar 1', spanClass: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2' },
            { url: '/image/landing/1 (3).png', alt: 'Kegiatan Belajar 2', spanClass: 'col-span-1 row-span-1' },
            { url: '/image/landing/1 (4).png', alt: 'Kegiatan Belajar 3', spanClass: 'col-span-1 row-span-2' },
            { url: '/image/landing/1 (6).png', alt: 'Kegiatan Belajar 4', spanClass: 'col-span-1 row-span-1' },
            { url: '/image/landing/1 (7).png', alt: 'Kegiatan Belajar 5', spanClass: 'col-span-2 row-span-1' },
        ],
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
            <Head title={`${dummyProgram.title} - QLC`} />
            <Navbar />

            <main className="overflow-x-hidden">
                {/* 1. HERO SECTION - Mobile Optimized Height */}
                <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src={dummyProgram.heroImage} alt={dummyProgram.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A] via-[#1B6B3A]/60 to-black/40"></div>
                    </div>

                    <div className="relative z-10 w-full px-6 text-center text-white mt-12 md:mt-20">
                        {/* Back Button for Mobile */}
                        <button onClick={() => window.history.back()} className="absolute top-[-40px] left-4 flex items-center text-white/80 text-sm font-bold md:hidden">
                            <ChevronLeft size={18} /> Kembali
                        </button>

                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-[10px] md:text-xs font-bold tracking-[0.2em] mb-4">DETAIL PROGRAM</span>
                        <h1 className="text-4xl md:text-7xl font-black mb-4 leading-tight">{dummyProgram.title}</h1>
                        <p className="text-base md:text-2xl text-gray-100 max-w-2xl mx-auto opacity-90">{dummyProgram.subtitle}</p>
                    </div>
                </section>

                {/* 2. CONTENT CARD - Negative Margin Optimized for Android Viewports */}
                <section className="px-4 md:px-8 -mt-12 md:-mt-24 relative z-20">
                    <div className={`${glassClass} rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 max-w-7xl mx-auto`}>
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Left: About */}
                            <div className="lg:w-3/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#D4A017]/10 rounded-lg">
                                        <Star className="w-6 h-6 text-[#D4A017]" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">Tentang Program</h2>
                                </div>
                                <div className="space-y-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                                    {dummyProgram.description.map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>

                                <div className="mt-8 rounded-2xl overflow-hidden shadow-inner h-48 md:h-80">
                                    <img src={dummyProgram.secondaryImage} className="w-full h-full object-cover" alt="Visual" />
                                </div>
                            </div>

                            {/* Right: Advantages - Grid 1 column on mobile */}
                            <div className="lg:w-2/5">
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Keunggulan</h2>
                                <div className="space-y-4">
                                    {dummyProgram.advantages.map((adv, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                                            <CheckCircle2 className="w-5 h-5 text-[#1B6B3A] mt-1 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm md:text-base">{adv.title}</h3>
                                                <p className="text-xs md:text-sm text-gray-500 mt-1">{adv.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. MOBILE GALLERY - Horizontal Scroll on small screens, Bento on tablet+ */}
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-[#1B6B3A] font-bold text-xs tracking-widest mb-2">GALLERY</p>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900">Potret Kegiatan</h2>
                        </div>
                        <Camera className="text-gray-300 hidden md:block" size={40} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[200px] gap-3">
                        {dummyProgram.gallery.map((img, idx) => (
                            <div key={idx} className={`relative rounded-2xl overflow-hidden group shadow-sm ${img.spanClass}`}>
                                <img src={img.url} className="w-full h-full object-cover" alt={img.alt} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-bold">{img.alt}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
