'use client';

import { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ImageIcon, PlayCircle, X } from 'lucide-react';

interface GalleryItem {
    id: string;
    title: string;
    media_url: string;
    type: 'Photo' | 'Video';
}

interface Props {
    galleries: GalleryItem[];
}

// Ekstrak YouTube video ID dari berbagai format URL
function getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|.*\/embed\/|.*\/v\/|shorts\/))([^&?\n/]+)/);
    return match ? match[1] : null;
}

export default function Galeri({ galleries }: Props) {
    const [filter, setFilter] = useState<'Semua' | 'Photo' | 'Video'>('Semua');
    const [activeVideo, setActiveVideo] = useState<GalleryItem | null>(null);
    const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
    const categories: ('Semua' | 'Photo' | 'Video')[] = ['Semua', 'Photo', 'Video'];

    const getSpanPattern = (index: number) => {
        const patterns = [
            'md:col-span-2 md:row-span-2',
            'md:col-span-1 md:row-span-1',
            'md:col-span-1 md:row-span-2',
            'md:col-span-1 md:row-span-1',
            'md:col-span-2 md:row-span-1',
            'md:col-span-2 md:row-span-1',
            'md:col-span-1 md:row-span-2',
            'md:col-span-2 md:row-span-2',
            'md:col-span-1 md:row-span-2',
        ];
        return patterns[index % patterns.length];
    };

    // Thumbnail: foto langsung pakai URL, video pakai thumbnail YouTube
    const getThumbnail = (item: GalleryItem) => {
        if (item.type === 'Photo') return item.media_url;
        const ytId = getYoutubeId(item.media_url);
        return ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : null;
    };

    const filteredGalleries = galleries.filter((item) => filter === 'Semua' || item.type === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20">
            <Head title="Galeri Kegiatan - QLC" />
            <Navbar />

            <main className="px-4 pt-36 pb-24 max-w-7xl mx-auto min-h-screen">
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 text-gray-600 text-sm font-bold active:scale-90 transition-all hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit"
                    >
                        <ChevronLeft size={18} /> Kembali
                    </button>
                </div>

                {/* HEADER */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <span className="inline-flex items-center py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                        <ImageIcon className="w-4 h-4 mr-2" /> DOKUMENTASI
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Galeri Kegiatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#34ad62]">QLC</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        Jelajahi momen-momen berharga santri dan asatidz dalam berbagai kegiatan belajar, menghafal, dan aktivitas pembentukan karakter.
                    </p>
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

                {/* GRID */}
                {filteredGalleries.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 font-medium text-lg">Belum ada dokumentasi untuk kategori ini.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                        {filteredGalleries.map((item, idx) => {
                            const spanClass = getSpanPattern(idx);
                            const thumbnail = getThumbnail(item);

                            return (
                                <div
                                    key={item.id}
                                    className={`group relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl cursor-pointer border-4 border-white bg-gray-900 animate-in fade-in zoom-in-95 duration-700 ${spanClass}`}
                                    style={{ animationDelay: `${(idx % 10) * 100}ms`, animationFillMode: 'both' }}
                                    onClick={() => item.type === 'Video' ? setActiveVideo(item) : setActivePhoto(item)}
                                >
                                    {thumbnail ? (
                                        <img src={thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <PlayCircle className="text-white/40 w-16 h-16" />
                                        </div>
                                    )}

                                    {/* Icon play untuk video */}
                                    {item.type === 'Video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-10">
                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <PlayCircle className="text-[#1B6B3A] w-10 h-10" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay teks */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/95 via-[#1B6B3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8 z-20">
                                        <span className="text-[#D4A017] font-bold text-xs tracking-wider mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {item.type === 'Video' ? '▶ VIDEO' : '📷 FOTO'}
                                        </span>
                                        <h3 className="text-white font-bold text-lg md:text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 line-clamp-2">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />

            {/* LIGHTBOX FOTO */}
            {activePhoto && (
                <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActivePhoto(null)}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors" onClick={() => setActivePhoto(null)}>
                        <X size={20} />
                    </button>
                    <div className="max-w-5xl w-full flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
                        <img src={activePhoto.media_url} alt={activePhoto.title} className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
                        {activePhoto.title && <p className="text-white font-bold text-sm">{activePhoto.title}</p>}
                    </div>
                </div>
            )}

            {/* MODAL VIDEO PLAYER */}
            {activeVideo && (() => {
                const ytId = getYoutubeId(activeVideo.media_url);
                return (
                    <div
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setActiveVideo(null)}
                    >
                        <div
                            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Tombol tutup */}
                            <button
                                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                                onClick={() => setActiveVideo(null)}
                            >
                                <X size={20} />
                            </button>

                            {/* Judul */}
                            <div className="px-6 py-4 bg-gray-900">
                                <p className="text-white font-bold text-base line-clamp-1">{activeVideo.title}</p>
                            </div>

                            {/* Player */}
                            <div className="aspect-video w-full">
                                {ytId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                        title={activeVideo.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
                                        <PlayCircle size={48} className="text-white/40" />
                                        <p className="text-sm text-white/60">Format URL video tidak dikenali.</p>
                                        <a
                                            href={activeVideo.media_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2 rounded-full bg-[#1B6B3A] text-white text-sm font-bold hover:bg-[#114a27]"
                                        >
                                            Buka di tab baru
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
