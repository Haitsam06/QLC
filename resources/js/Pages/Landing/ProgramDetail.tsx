'use client';

import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import { Camera, ChevronLeft, Target, Star, Info, CheckCircle2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Program {
    id: string;
    name: string;
    description: string | null;
    target_audience: string | null;
    image_url: string | null;
    hero_image_url: string | null;
    about_image_url: string | null;
    advantages: any;
    gallery: string[];
}

interface Props {
    program: Program;
    galleries?: any[];
}

export default function ProgramDetail({ program, galleries = [] }: Props) {
    const glassClass = 'bg-white/80 backdrop-blur-lg border border-white/40 shadow-lg';
    const heroImage = program?.hero_image_url || '/image/landing/1 (5).png';
    const descriptionParagraphs = program?.description ? program.description.split('\n').filter(Boolean) : ['Belum ada deskripsi untuk program ini.'];
    const advantages = typeof program.advantages === 'string' ? JSON.parse(program.advantages) : program.advantages || [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
            <Head title={`${program?.name || 'Detail Program'} - QLC`} />
            <Navbar />

            <main className="overflow-x-hidden">
                {/* 1. HERO SECTION */}
                <section className="relative h-[65vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0 bg-slate-900">
                        <img src={heroImage} alt={program?.name} className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A] via-[#1B6B3A]/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full px-6 text-center text-white mt-12 md:mt-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <button onClick={() => window.history.back()} className="absolute top-[-50px] left-4 flex items-center gap-1 text-white/80 text-sm font-bold active:scale-90 transition-all hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20">
                            <ChevronLeft size={18} /> Kembali
                        </button>
                        <span className="inline-block py-1 px-4 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-[10px] font-black tracking-[0.2em] mb-4 uppercase">Detail Program</span>
                        <h1 className="text-4xl md:text-7xl font-black mb-4 leading-tight">{program?.name}</h1>
                        <p className="text-base md:text-2xl text-gray-100 max-w-2xl mx-auto opacity-90">Program Layanan Unggulan Quantum Learning Center</p>
                    </div>
                </section>

                {/* 2. CONTENT CARD */}
                <section className="px-4 md:px-8 -mt-16 md:-mt-24 relative z-20 pb-20">
                    <div className={`${glassClass} rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 max-w-7xl mx-auto`}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            {/* Kiri: Tentang Program */}
                            <div className="lg:col-span-7">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
                                        <Star className="text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">Tentang Program</h2>
                                </div>
                                <div className="text-gray-600 text-base md:text-lg leading-relaxed text-justify whitespace-pre-line mb-10">
                                    {descriptionParagraphs.map((p: string, i: number) => (
                                        <p key={i} className="mb-4">
                                            {p}
                                        </p>
                                    ))}
                                </div>
                                <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-video">
                                    <img src={(program?.about_image_url || program?.image_url) ?? undefined} className="w-full h-full object-cover" alt="Visual" />
                                </div>
                            </div>

                            {/* Kanan: Info & Keunggulan */}
                            <div className="lg:col-span-5 flex flex-col gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-green-50 rounded-2xl border border-green-100">
                                        <Info className="text-[#1B6B3A]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Informasi & Keunggulan</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Box Target Audiens */}
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wider">
                                            <Target size={18} /> Target Audiens
                                        </div>
                                        <p className="text-gray-900 font-black text-lg ml-6">{program?.target_audience || 'Semua Kalangan'}</p>
                                    </div>

                                    {/* List Keunggulan */}
                                    {advantages.map((adv: any, i: number) => (
                                        <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-[#1B6B3A] transition-colors">
                                                <CheckCircle2 size={20} className="text-[#1B6B3A] group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-gray-900 mb-1">{adv.title}</h3>
                                                <p className="text-sm text-gray-500 font-medium leading-snug">{adv.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. GALLERY */}
                {program?.gallery && program.gallery.length > 0 && (
                    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-100">
                        <div className="flex flex-col gap-2 mb-10">
                            <p className="text-[#1B6B3A] font-black text-xs tracking-widest uppercase ml-1">Documentation</p>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Potret Kegiatan</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[250px] gap-3 md:gap-5">
                            {program.gallery.map((url: string, idx: number) => (
                                <div key={idx} className={`relative rounded-3xl overflow-hidden group shadow-sm bg-slate-100 ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                                    <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Kegiatan" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                                        <Camera className="text-white/80" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
