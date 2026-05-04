import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

interface Props {
    profile: any;
    programs: any[];
    galleries: any[];
    foundations: any[];
    leaders: any[];
}

const LandingPage = ({ profile, programs, galleries, foundations, leaders }: Props) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('beranda');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Ambil data dinamis dengan Fallback (jika database kosong)
    const namaSekolah = profile?.name || 'Pejuang Quran';
    const heroTitle = profile?.hero_title || 'Membangun Generasi Rabbani bersama';
    const tagline = profile?.tagline || 'Pusat pembelajaran komprehensif (QLC) yang berdedikasi mencetak pemimpin masa depan.';
    const sejarah = profile?.history || 'Menjawab kerinduan dan tingginya antusiasme umat...';
    const visi = profile?.vision || 'Visi kami belum diatur.';
    const misi = profile?.mission || 'Misi 1\nMisi 2';
    const estYear = profile?.established_year || '21 Juni 2016';
    const mainFocus = profile?.main_focus || 'Pengembangan SDM';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            const sections = ['beranda', 'tentang', 'pendiri', 'visi-misi', 'pilar', 'program'];
            let current = 'beranda';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && window.scrollY >= element.offsetTop - 150) {
                    current = section;
                }
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        entry.target.classList.remove('opacity-0', 'translate-y-8');
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const glassClass = 'bg-white/60 backdrop-blur-lg border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

    return (
        <div className="font-sans text-gray-800 bg-white min-h-screen overflow-x-hidden selection:bg-[#1B6B3A]/20">
            <style dangerouslySetInnerHTML={{ __html: `.reveal { transition: opacity 0.8s ease-out, transform 0.8s ease-out; }` }} />
            <Navbar />

            {/* 2. HERO SECTION */}
            <section id="beranda" className="pt-32 pb-20 lg:pt-38 lg:pb-32 relative bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] overflow-hidden">
                {/* ... dekorasi background tetap sama ... */}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* --- BAGIAN TEKS (Sekarang diberi order-last agar di HP pindah ke bawah) --- */}
                        <div className="reveal opacity-0 translate-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-10 duration-1000 order-last lg:order-first">
                            <span className="inline-block py-2.5 px-5 rounded-full bg-white/90 border border-white/80 shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-6">✨ ERA KEPEMIMPINAN AL-QUR'AN</span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
                                {heroTitle} <br className="hidden xl:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#0a381d]">{namaSekolah}</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed lg:pr-10">{tagline}</p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                                <button onClick={() => scrollTo('tentang')} className="bg-[#1B6B3A] text-white px-9 py-4 rounded-full font-bold text-lg transition-all shadow-md hover:shadow-lg hover:shadow-[#1B6B3A]/30 hover:-translate-y-1 transform duration-300">
                                    Pelajari Lebih Lanjut
                                </button>
                                <button onClick={() => router.get('/landing/agenda')} className={`${glassClass} px-9 py-4 rounded-full font-bold text-lg text-gray-700 hover:bg-white hover:border-gray-200 transition-all transform duration-300 hover:-translate-y-0.5`}>
                                    Lihat Agenda
                                </button>
                            </div>
                        </div>

                        {/* --- BAGIAN GAMBAR (Sekarang diberi order-first agar di HP muncul di atas) --- */}
                        <div className="reveal opacity-0 translate-y-8 delay-300 relative animate-in fade-in slide-in-from-right-10 duration-1000 order-first lg:order-last">
                            <div className="absolute inset-0 bg-white/60 rounded-[3rem] border-4 border-white transform rotate-3 z-0 shadow-lg"></div>
                            <div className="relative z-10 p-2 bg-white/40 rounded-[3rem] border border-white shadow-xl aspect-[4/3] lg:aspect-square overflow-hidden group">
                                <img src={profile?.logo || '/image/landing/hero-image.png'} alt="Santri Pejuang Quran QLC" className="w-full h-full object-cover rounded-[2.5rem] transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[2.5rem]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TENTANG QLC */}
            <section id="tentang" className="py-24 relative bg-[#FDFBF7] border-t border-b border-[#F0ECE1]">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f4f1e1]/50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-white/95 rounded-[3rem] p-8 md:p-14 shadow-md border border-white/60 transition-shadow duration-300 hover:shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#D4A017]/20 rounded-[2.5rem] transform translate-x-4 translate-y-4 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500 ease-out"></div>
                                <img
                                    src={profile?.about_image || '/image/landing/1 (1).png'}
                                    alt="Tentang QLC"
                                    className="relative z-10 w-full h-auto rounded-[2.5rem] shadow-sm object-cover aspect-[4/3] md:aspect-auto"
                                    onError={(e) => {
                                        e.currentTarget.src = '/image/landing/1 (1).png';
                                    }}
                                />
                            </div>
                            <div className="reveal opacity-0 translate-y-8" style={{ transitionDelay: '0.2s' }}>
                                <span className="text-[#D4A017] font-bold text-sm tracking-widest uppercase mb-2 block">Mengenal Kami</span>
                                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 leading-tight">Tentang QLC</h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-[#1B6B3A] to-[#34ad62] rounded-full mb-8"></div>

                                <p className="text-gray-600 text-lg leading-relaxed mb-8 text-justify whitespace-pre-line">{sejarah}</p>

                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <div className="bg-gradient-to-br from-[#1B6B3A]/5 to-transparent p-6 rounded-3xl border border-[#1B6B3A]/10 flex flex-col items-center text-center hover:bg-[#1B6B3A]/5 transition-colors duration-300">
                                        <div className="w-12 h-12 rounded-full bg-[#1B6B3A]/10 flex items-center justify-center mb-3">
                                            <span className="text-2xl">🕌</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{estYear}</span>
                                        <span className="text-sm text-gray-500 mt-1 font-medium">Berdiri di Bekasi</span>
                                    </div>

                                    <div className="bg-gradient-to-br from-[#D4A017]/5 to-transparent p-6 rounded-3xl border border-[#D4A017]/10 flex flex-col items-center text-center hover:bg-[#D4A017]/5 transition-colors duration-300">
                                        <div className="w-12 h-12 rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-3">
                                            <span className="text-2xl">📖</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">Fokus Utama</span>
                                        <span className="text-sm text-gray-500 mt-1 font-medium">{mainFocus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION PENDIRI */}
            <section id="pendiri" className="py-20 bg-[#1B6B3A] text-white relative">
                {/* Dekorasi Background */}
                <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 bg-[radial-gradient(circle,rgba(52,173,98,0.3)_0%,transparent_70%)] rounded-full z-0"></div>
                <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 bg-[radial-gradient(circle,rgba(212,160,23,0.2)_0%,transparent_70%)] rounded-full z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16 md:mb-20">
                        <span className="inline-block py-2 px-5 rounded-full bg-white/15 border border-white/20 shadow-sm text-gray-100 text-sm font-bold tracking-wider mb-4">👥 PEMIMPIN LEMBAGA</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Pendiri <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] to-[#F0B429]">{namaSekolah}</span>
                        </h2>
                    </div>

                    {/* Flexbox/Carousel Container (Mobile Optimized) */}
                    <div className="flex lg:grid lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto pt-16 pb-10 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
                        {leaders.map((dewan, idx) => (
                            <div key={idx} className="bg-white/10 border border-white/10 rounded-[2.5rem] p-8 pt-20 relative flex flex-col min-w-[85%] sm:min-w-[45%] lg:min-w-full snap-center">
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex justify-center items-center">
                                        <img src={dewan.image_url || `https://ui-avatars.com/api/?name=${dewan.nama}`} alt={dewan.nama} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="text-center mb-6 pb-6 border-b border-white/10 flex-1 mt-3">
                                    <h3 className="text-xl font-extrabold text-white mb-1.5">{dewan.nama}</h3>
                                    <p className="text-sm font-semibold text-gray-200 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">{dewan.jabatan}</p>
                                </div>
                                <ul className="text-sm text-gray-100 space-y-3 px-1 flex-1">
                                    {dewan.poin
                                        ?.split('\n')
                                        .filter(Boolean)
                                        .map((p: string, i: number) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-[#D4A017] mr-3 mt-0.5">✔</span>
                                                <span className="leading-snug font-medium">{p}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* TOMBOL MENUJU HALAMAN PENGURUS */}
                    <div className="mt-16 text-center">
                        <button onClick={() => router.get('/pengurus')} className="bg-white text-[#1B6B3A] hover:bg-gray-50 active:scale-95 px-10 py-4 rounded-full font-black text-lg transition-all shadow-xl shadow-green-900/20 flex items-center gap-3 mx-auto border-2 border-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            Lihat Struktur Pengurus Lengkap
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. VISI & MISI */}
            <section id="visi-misi" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        <div className={`reveal opacity-0 translate-y-8 lg:col-span-5 rounded-[3rem] p-10 md:p-14 bg-gradient-to-br from-[#114a27] to-[#1B6B3A] text-white shadow-xl relative overflow-hidden`}>
                            <h2 className="text-3xl font-bold mb-6 text-[#F0B429] tracking-wide">VISI KAMI</h2>
                            <p className="text-2xl leading-relaxed font-light italic text-white/95">{visi}</p>
                        </div>
                        <div className={`reveal opacity-0 translate-y-8 lg:col-span-7 bg-white/95 border border-gray-100 shadow-xl rounded-[3rem] p-10 md:p-14`} style={{ transitionDelay: '0.2s' }}>
                            <h2 className="text-3xl font-bold mb-10 text-gray-900 border-b pb-4">MISI KAMI</h2>
                            <ul className="space-y-6">
                                {misi
                                    .split('\n')
                                    .filter(Boolean)
                                    .map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start space-x-5 group">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#D4A017] group-hover:text-white text-[#1B6B3A] flex items-center justify-center font-bold text-base transition-colors duration-300 border border-gray-200">{idx + 1}</div>
                                            <span className="text-gray-700 leading-relaxed text-lg font-medium pt-1.5">{item}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. PILAR INTI */}
            <section id="pilar" className="py-16 md:py-24 bg-gradient-to-b from-[#f0f7f6] to-[#ffffff] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-16 reveal opacity-0 translate-y-8">
                        <span className="text-[#34ad62] font-bold text-sm tracking-widest uppercase mb-2 block">Fondasi Karakter</span>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">Pilar Inti Realisasi Konsep</h2>
                    </div>

                    {/* CONTAINER SCROLL: Menggunakan flex-nowrap dan overflow-x-auto pada mobile */}
                    <div className="flex lg:grid lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto pb-8 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
                        {foundations.map((pilar, idx) => (
                            <div
                                key={idx}
                                className={`reveal opacity-0 translate-y-8 bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col min-w-[85%] sm:min-w-[50%] lg:min-w-full snap-center`}
                                style={{ transitionDelay: `${idx * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg md:text-xl mb-4 md:mb-6 shadow-lg`}>{idx + 1}</div>
                                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-2 md:mb-3 tracking-tight">{pilar.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-1">{pilar.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* INDIKATOR SWIPE (Hanya muncul di mobile) */}
                    <div className="flex justify-center gap-2 mt-2 lg:hidden">
                        {foundations.map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-emerald-200"></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. PROGRAM PENDIDIKAN */}
            <section id="program" className="py-24 bg-[#FAFAFA] border-t border-gray-200/50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 reveal opacity-0 translate-y-8">
                        <span className="inline-block py-2 px-5 rounded-full bg-white border border-gray-200 shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4">📚 EDUKASI BERKELANJUTAN</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            Program Layanan <span className="text-[#D4A017]">QLC</span>
                        </h2>
                    </div>

                    {/* CONTAINER: Flex di mobile, Grid di desktop */}
                    <div className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-10 overflow-x-auto pb-8 lg:pb-0 snap-x snap-mandatory scrollbar-hide pt-4">
                        {programs.map((prog, idx) => (
                            <div
                                key={idx}
                                className="reveal opacity-0 translate-y-8 bg-white border border-gray-200/60 shadow-md hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden flex flex-col group min-w-[85%] sm:min-w-[45%] lg:min-w-full snap-center"
                                style={{ transitionDelay: `${idx * 0.1}s` }}
                            >
                                <div className="h-48 overflow-hidden relative bg-gray-100">{prog.image_url && <img src={prog.image_url} alt={prog.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}</div>
                                <div className="p-8 flex-1 flex flex-col bg-white">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-[#1B6B3A] transition-colors">{prog.name}</h3>
                                    <p className="text-gray-600 text-base mb-8 flex-1 leading-relaxed">{prog.description}</p>
                                    <button onClick={() => router.get('/program-detail')} className="w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[#1B6B3A] font-bold hover:bg-[#1B6B3A] hover:text-white transition-all shadow-sm text-sm">
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. GALERI */}
            <section id="galeri" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 reveal opacity-0 translate-y-8">
                        <span className="inline-block py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4">📸 DOKUMENTASI</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Galeri Kegiatan <span className="text-[#D4A017]">QLC</span>
                        </h2>
                    </div>

                    {/* Bento Grid yang disesuaikan barisnya untuk mobile */}
                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[250px] gap-3 md:gap-6">
                        {galleries.slice(0, 4).map((gal, idx) => (
                            <div
                                key={idx}
                                className={`reveal opacity-0 translate-y-8 
                        ${idx === 0 ? 'col-span-2 row-span-2' : ''} 
                        ${idx === 1 ? 'col-span-1 row-span-1' : ''}
                        ${idx === 2 ? 'col-span-1 row-span-2' : ''}
                        ${idx === 3 ? 'col-span-1 row-span-1' : ''}
                        group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-sm cursor-pointer border border-white/50 bg-gray-100`}
                            >
                                <img src={gal.media_url} alt={gal.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 md:p-6">
                                    <h3 className="text-white font-bold text-xs md:text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{gal.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 reveal opacity-0 translate-y-8">
                        <button onClick={() => router.get('/galeri')} className="bg-white border border-gray-200 text-gray-700 hover:border-[#1B6B3A] hover:text-[#1B6B3A] px-8 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            Lihat Semua Galeri
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default LandingPage;
