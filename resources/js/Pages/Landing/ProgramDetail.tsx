'use client';

import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Handshake, ArrowRight, Star, Camera } from 'lucide-react'; // Tambah icon Camera

export default function ProgramDetail() {
    // Reusable Glass Class
    const glassClass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

    // === DATA DUMMY STATIS QL-SCHOOL ===
    const dummyProgram = {
        title: 'QL - SCHOOL',
        subtitle: "Pendidikan Terpadu Al-Qur'an",
        heroImage: '/image/landing/1 (5).png',
        secondaryImage: '/image/landing/1 (1).png',
        description: [
            "Program pendidikan formal berkesinambungan dan terpadu berbasis Al-Qur'an. Kami mendesain kurikulum khusus yang mengintegrasikan ilmu pengetahuan umum dengan hafalan dan pemahaman Al-Qur'an.",
            'Tujuan utama dari QL-School adalah mencetak generasi pemimpin masa depan yang tidak hanya cerdas secara akademik, tetapi juga memiliki akhlak mulia dan kokoh secara aqidah Islamiyah.',
            'Dengan didukung fasilitas yang memadai dan tenaga pengajar (Asatidz) yang berkompeten serta bersertifikasi, kami memastikan setiap santri mendapatkan perhatian yang optimal dalam perkembangan hafalan dan karakternya.',
        ],
        advantages: [
            {
                title: 'Kurikulum Terintegrasi',
                desc: 'Perpaduan seimbang antara kurikulum Diknas untuk pengetahuan umum dan kurikulum kepesantrenan (Tahfidz, Tahsin, & Adab).',
            },
            {
                title: 'Pembiasaan Adab Harian',
                desc: 'Fokus pada pembentukan karakter santri melalui praktik adab Islami sehari-hari, baik kepada guru, teman, maupun lingkungan.',
            },
            {
                title: 'Target Hafalan Mutqin',
                desc: 'Memiliki target capaian hafalan yang terukur dengan metode murojaah yang sistematis dan terpantau secara digital.',
            },
        ],
        // Tambahan data Galeri untuk Layout Bento
        gallery: [
            {
                url: '/image/landing/1 (2).png',
                alt: 'Kegiatan Belajar 1',
                // Span besar (2 kolom, 2 baris)
                spanClass: 'md:col-span-2 md:row-span-2',
            },
            {
                url: '/image/landing/1 (3).png',
                alt: 'Kegiatan Belajar 2',
                // Span standar
                spanClass: 'md:col-span-1 md:row-span-1',
            },
            {
                url: '/image/landing/1 (4).png',
                alt: 'Kegiatan Belajar 3',
                // Span tinggi (1 kolom, 2 baris)
                spanClass: 'md:col-span-1 md:row-span-2',
            },
            {
                url: '/image/landing/1 (6).png',
                alt: 'Kegiatan Belajar 4',
                // Span standar
                spanClass: 'md:col-span-1 md:row-span-1',
            },
            {
                url: '/image/landing/1 (7).png',
                alt: 'Kegiatan Belajar 5',
                // Span lebar (2 kolom, 1 baris)
                spanClass: 'md:col-span-2 md:row-span-1',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20">
            <Head title={`${dummyProgram.title} - QLC`} />

            <Navbar />

            <main className="pb-24">
                {/* 1. HERO SECTION DENGAN GAMBAR UTAMA */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={dummyProgram.heroImage}
                            alt={dummyProgram.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${dummyProgram.title}&background=random&size=800`)}
                        />
                        {/* Overlay Gradient Gelap ke Hijau QLC */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A] via-[#1B6B3A]/80 to-black/50"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-sm font-bold tracking-wider mb-6 shadow-sm">
                            DETAIL PROGRAM
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-xl">{dummyProgram.title}</h1>
                        <p className="text-xl md:text-2xl font-medium text-gray-200 max-w-3xl mx-auto drop-shadow-md">{dummyProgram.subtitle}</p>
                    </div>
                </section>

                {/* 2. DETAIL & KEUNGGULAN */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                    <div className={`${glassClass} rounded-[2.5rem] p-8 md:p-12`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                            {/* Kiri: Deskripsi Lengkap */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Star className="w-8 h-8 text-[#D4A017] mr-3" />
                                    Tentang Program
                                </h2>
                                <div className="space-y-4 text-lg text-gray-600 leading-relaxed text-justify">
                                    {dummyProgram.description.map((paragraf, i) => (
                                        <p key={i}>{paragraf}</p>
                                    ))}
                                </div>

                                {/* Gambar Pendukung */}
                                <div className="mt-10 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg h-64 md:h-80 relative group">
                                    <img src={dummyProgram.secondaryImage} alt="Ilustrasi Pendukung" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-colors duration-500"></div>
                                </div>
                            </div>

                            {/* Kanan: Poin Keunggulan */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Keunggulan Utama</h2>
                                <div className="space-y-6">
                                    {dummyProgram.advantages.map((adv, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/80 border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-start gap-5 group"
                                        >
                                            <div className="bg-gradient-to-br from-[#1B6B3A] to-[#34ad62] p-3 rounded-xl text-white flex-shrink-0 mt-1 shadow-sm group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{adv.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{adv.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. GALERI PROGRAM (BENTO LAYOUT) */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
                            <Camera className="w-8 h-8 text-[#1B6B3A]" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Potret Kegiatan</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sekilas dokumentasi aktivitas santri dalam program {dummyProgram.title}.</p>
                    </div>

                    {/* Grid Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4 md:gap-6">
                        {dummyProgram.gallery.map((image, idx) => (
                            <div key={idx} className={`relative rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 ${image.spanClass}`}>
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=Galeri+${idx + 1}&background=random&size=600`)}
                                />
                                {/* Overlay Gradient saat Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{image.alt}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. CTA KERJASAMA / KEMITRAAN */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <div className="bg-gradient-to-br from-[#1B6B3A] to-[#0a381d] rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                        {/* Ornamen Background */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-[#D4A017] opacity-20 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="bg-white/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                                <Handshake className="w-12 h-12 text-[#D4A017]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Tertarik Mendaftarkan <span className="text-[#D4A017]">Santri</span> Anda?
                            </h2>
                            <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Jadikan instansi/lembaga Anda bagian dari pencetak generasi Rabbani. Kami juga membuka peluang kemitraan dan kerjasama penuh untuk mengimplementasikan kurikulum{' '}
                                {dummyProgram.title} di tempat Anda.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button className="bg-[#D4A017] hover:bg-[#b58813] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center">
                                    Daftar Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => router.get('/')}
                                    className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm"
                                >
                                    Kembali ke Beranda
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
