'use client';

import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import { ImageIcon, PlayCircle } from 'lucide-react';

interface GalleryItem {
    id: string;
    title: string;
    media_url: string;
    type: 'Photo' | 'Video';
}

interface Props {
    galleries: GalleryItem[];
}

export default function Galeri({ galleries }: Props) {
    const [filter, setFilter] = useState<'Semua' | 'Photo' | 'Video'>('Semua');
    const categories: ('Semua' | 'Photo' | 'Video')[] = ['Semua', 'Photo', 'Video'];

    // Pola tata letak Bento Box berulang (9 pola)
    const getSpanPattern = (index: number) => {
        const patterns = [
            'md:col-span-2 md:row-span-2', // Besar Kiri
            'md:col-span-1 md:row-span-1', // Kecil Tengah Atas
            'md:col-span-1 md:row-span-2', // Panjang Kanan
            'md:col-span-1 md:row-span-1', // Kecil Tengah Bawah
            'md:col-span-2 md:row-span-1', // Lebar Kiri
            'md:col-span-2 md:row-span-1', // Lebar Kanan
            'md:col-span-1 md:row-span-2', // Panjang Kiri
            'md:col-span-2 md:row-span-2', // Besar Tengah
            'md:col-span-1 md:row-span-2', // Panjang Kanan
        ];
        return patterns[index % patterns.length];
    };

    // Mendapatkan Thumbnail YouTube jika tipenya Video
    const getMediaSrc = (item: GalleryItem) => {
        if (item.type === 'Photo') return item.media_url;

        const ytMatch = item.media_url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?\n]+)/);
        return ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` : 'https://ui-avatars.com/api/?name=Video&background=000&color=fff';
    };

    // Terapkan filter
    const filteredGalleries = galleries.filter((item) => filter === 'Semua' || item.type === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20">
            <Head title="Galeri Kegiatan - QLC" />

            <Navbar />

            <main className="px-4 pt-36 pb-24 max-w-7xl mx-auto min-h-screen">
                {/* --- HEADER GALERI --- */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <span className="inline-flex items-center py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                        <ImageIcon className="w-4 h-4 mr-2" /> DOKUMENTASI
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Galeri Kegiatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#34ad62]">QLC</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">Jelajahi momen-momen berharga santri dan asatidz dalam berbagai kegiatan belajar, menghafal, dan aktivitas pembentukan karakter.</p>

                    {/* --- FILTER KATEGORI --- */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm border ${filter === cat ? 'bg-[#1B6B3A] text-white border-[#1B6B3A] scale-105' : 'bg-white text-gray-600 border-white hover:border-[#1B6B3A]/30 hover:text-[#1B6B3A]'}`}
                            >
                                {cat === 'Semua' ? 'Semua Media' : cat === 'Photo' ? 'Hanya Foto' : 'Hanya Video'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- GRID BENTO BOX DINAMIS --- */}
                {filteredGalleries.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 font-medium text-lg">Belum ada dokumentasi untuk kategori ini.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                        {filteredGalleries.map((item, idx) => {
                            const spanClass = getSpanPattern(idx);
                            const imgSrc = getMediaSrc(item);

                            return (
                                <div
                                    key={item.id}
                                    className={`group relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl cursor-pointer border-4 border-white bg-gray-100 animate-in fade-in zoom-in-95 duration-700 ${spanClass}`}
                                    style={{ animationDelay: `${(idx % 10) * 100}ms`, animationFillMode: 'both' }}
                                    onClick={() => {
                                        // Jika video, buka tab YouTube baru
                                        if (item.type === 'Video') window.open(item.media_url, '_blank');
                                    }}
                                >
                                    {/* Gambar Utama / Thumbnail */}
                                    <img src={imgSrc} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                                    {/* Jika tipe Video, beri icon Play di tengah */}
                                    {item.type === 'Video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors z-10">
                                            <PlayCircle className="text-white w-16 h-16 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                                        </div>
                                    )}

                                    {/* Overlay Gradient & Teks */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/95 via-[#1B6B3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8 z-20">
                                        <span className="text-[#D4A017] font-bold text-xs md:text-sm tracking-wider mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.type.toUpperCase()}</span>
                                        <h3 className="text-white font-bold text-xl md:text-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 line-clamp-2">{item.title}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
