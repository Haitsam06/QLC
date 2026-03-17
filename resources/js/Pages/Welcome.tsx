import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('beranda');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .reveal { transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
      `,
                }}
            />

            <Navbar />

            {/* 2. HERO SECTION */}
            <section id="beranda" className="pt-32 pb-20 lg:pt-38 lg:pb-32 relative bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] overflow-hidden">
                {/* OPTIMASI 1: Ganti efek 'blur-3xl' yang berat dengan 'radial-gradient' murni */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[radial-gradient(circle,rgba(212,160,23,0.15)_0%,transparent_70%)] rounded-full z-0"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-[radial-gradient(circle,rgba(27,107,58,0.15)_0%,transparent_70%)] rounded-full z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="reveal opacity-0 translate-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            {/* OPTIMASI 2: Hapus 'backdrop-blur-md' dan naikkan opacity warna putihnya */}
                            <span className="inline-block py-2.5 px-5 rounded-full bg-white/90 border border-white/80 shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-6">
                                ✨ ERA KEPEMIMPINAN AL-QUR'AN
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
                                Membangun Generasi Rabbani bersama <br className="hidden xl:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#0a381d]">Pejuang Quran</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed lg:pr-10">
                                Pusat pembelajaran komprehensif (QLC) yang berdedikasi mencetak pemimpin masa depan dengan kurikulum terpadu dan sistem pelaporan mutakhir.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                                <button
                                    onClick={() => scrollTo('tentang')}
                                    className="bg-[#1B6B3A] text-white px-9 py-4 rounded-full font-bold text-lg transition-all shadow-md hover:shadow-lg hover:shadow-[#1B6B3A]/30 hover:-translate-y-1 transform duration-300"
                                >
                                    Pelajari Lebih Lanjut
                                </button>
                                <button
                                    onClick={() => router.get('/landing/agenda')}
                                    className={`${glassClass} px-9 py-4 rounded-full font-bold text-lg text-gray-700 hover:bg-white hover:border-gray-200 transition-all transform duration-300 hover:-translate-y-0.5`}
                                >
                                    Lihat Agenda
                                </button>
                            </div>
                        </div>

                        <div className="reveal opacity-0 translate-y-8 delay-300 relative animate-in fade-in slide-in-from-right-10 duration-1000">
                            {/* OPTIMASI 3: Hapus 'backdrop-blur-sm' pada frame foto, cukup gunakan background transparan */}
                            <div className="absolute inset-0 bg-white/60 rounded-[3rem] border-4 border-white transform rotate-3 z-0 shadow-lg"></div>

                            {/* OPTIMASI 4: Kurangi shadow dari 2xl ke xl, dan hapus blur */}
                            <div className="relative z-10 p-2 bg-white/40 rounded-[3rem] border border-white shadow-xl aspect-[4/3] lg:aspect-square overflow-hidden group">
                                <img
                                    src="/image/landing/hero-image.png"
                                    alt="Santri Pejuang Quran QLC"
                                    className="w-full h-full object-cover rounded-[2.5rem] transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=QLC+Hero&background=1B6B3A&color=fff&size=500';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[2.5rem]"></div>
                            </div>

                            {/* OPTIMASI 5: Hapus 'animate-bounce-slow'. Animasi terus-menerus pada elemen dengan shadow sangat membebani GPU */}
                            <div
                                className={`${glassClass} absolute -bottom-6 -left-6 p-4 rounded-2xl shadow-lg z-20 flex items-center gap-3 border border-white/80 transition-transform duration-300 hover:-translate-y-2`}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#D4A017] flex items-center justify-center text-white text-2xl">✨</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Mencetak</p>
                                    <p className="text-xs text-gray-600">Generasi Hafidz Mutqin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TENTANG QLC */}
            <section id="tentang" className="py-24 relative bg-[#FDFBF7] border-t border-b border-[#F0ECE1]">
                {/* Background gradient tetap aman karena sangat ringan */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f4f1e1]/50 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* OPTIMASI 1: Menghapus glassClass (backdrop-blur) dan menggantinya dengan bg-white/95. 
            Mengurangi shadow-xl menjadi shadow-md agar rendering GPU lebih santai. */}
                    <div className="bg-white/95 rounded-[3rem] p-8 md:p-14 shadow-md border border-white/60 transition-shadow duration-300 hover:shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="relative group">
                                {/* OPTIMASI 2: Efek hover translation tetap ada, tapi kita pastikan efisien */}
                                <div className="absolute inset-0 bg-[#D4A017]/20 rounded-[2.5rem] transform translate-x-4 translate-y-4 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500 ease-out"></div>

                                {/* OPTIMASI 3: Shadow pada gambar diturunkan sedikit intensitasnya */}
                                <img src="/image/landing/1 (1).png" alt="Tentang QLC" className="relative z-10 w-full h-auto rounded-[2.5rem] shadow-sm object-cover" />
                            </div>

                            <div className="reveal opacity-0 translate-y-8" style={{ transitionDelay: '0.2s' }}>
                                <span className="text-[#D4A017] font-bold text-sm tracking-widest uppercase mb-2 block">Mengenal Kami</span>
                                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 leading-tight">Tentang QLC</h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-[#1B6B3A] to-[#34ad62] rounded-full mb-8"></div>

                                <p className="text-gray-600 text-lg leading-relaxed mb-8 text-justify">
                                    Menjawab kerinduan dan tingginya antusiasme umat untuk kembali kepada Al-Qur'an, <strong className="text-[#1B6B3A]">Qur’anic Leadership Centre (QLC)</strong> hadir
                                    memberikan bimbingan pengajaran secara komprehensif. Kami membina santri tidak hanya untuk menghafal, tetapi juga memahami (terjemah), merenungi (tadabur), dan
                                    mengaplikasikan nilai-nilai Al-Qur'an.
                                </p>

                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    {/* Efek hover background pada kotak kecil ini sudah ringan, aman untuk dipertahankan */}
                                    <div className="bg-gradient-to-br from-[#1B6B3A]/5 to-transparent p-6 rounded-3xl border border-[#1B6B3A]/10 flex flex-col items-center text-center hover:bg-[#1B6B3A]/5 transition-colors duration-300">
                                        <div className="w-12 h-12 rounded-full bg-[#1B6B3A]/10 flex items-center justify-center mb-3">
                                            <span className="text-2xl">🕌</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">21 Juni 2016</span>
                                        <span className="text-sm text-gray-500 mt-1 font-medium">Berdiri di Bekasi</span>
                                    </div>

                                    <div className="bg-gradient-to-br from-[#D4A017]/5 to-transparent p-6 rounded-3xl border border-[#D4A017]/10 flex flex-col items-center text-center hover:bg-[#D4A017]/5 transition-colors duration-300">
                                        <div className="w-12 h-12 rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-3">
                                            <span className="text-2xl">📖</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">Fokus Utama</span>
                                        <span className="text-sm text-gray-500 mt-1 font-medium">Pengembangan SDM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* 4. PENDIRI & PENGURUS */}
            {/* 4. PENDIRI QLC */}
            <section id="pendiri" className="py-24 bg-[#1B6B3A] text-white relative overflow-hidden">
                {/* OPTIMASI 1: Ganti blur-3xl dengan radial-gradient yang sangat ringan di-render */}
                <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 bg-[radial-gradient(circle,rgba(52,173,98,0.3)_0%,transparent_70%)] rounded-full z-0"></div>
                <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 bg-[radial-gradient(circle,rgba(212,160,23,0.2)_0%,transparent_70%)] rounded-full z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 reveal opacity-0 translate-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        {/* OPTIMASI 2: Hapus backdrop-blur-sm, ganti dengan warna background sedikit lebih terang (bg-white/15) */}
                        <span className="inline-block py-2 px-5 rounded-full bg-white/15 border border-white/20 shadow-sm text-gray-100 text-sm font-bold tracking-wider mb-4">
                            👥 PEMIMPIN LEMBAGA
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Pendiri <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] to-[#F0B429]">QLC</span>
                        </h2>
                        <p className="text-lg text-gray-200 max-w-2xl mx-auto">Dibalik lahirnya Quantum Learning Center, terdapat tokoh-tokoh berdedikasi tinggi untuk mencetak generasi Rabbani.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-20 md:gap-x-8 md:gap-y-8">
                        {[
                            {
                                nama: "Ainun Na'im Al-Hafidh",
                                jabatan: "Ketua Yayasan Pejuang Qur'an Indonesia",
                                poin: ["Hafidh Qur'an 30 Juz Bersanad", "Master Trainer Metode Yanbu'a"],
                                shadow: 'hover:shadow-red-500/20',
                            },
                            {
                                nama: 'Mushadi Sumaryanto',
                                jabatan: 'Direktur Program QLC',
                                poin: ['Hafidh 30 Juz 42 Hari Ziyadah', 'Master Trainer Metode Tamasya'],
                                shadow: 'hover:shadow-orange-500/20',
                            },
                            {
                                nama: 'K.H. Supriyatno, M.Pd.I',
                                jabatan: 'General Manager QLC',
                                poin: ['Dosen', 'Konsultan Lembaga Pendidikan', "Da'i dan Motivator"],
                                shadow: 'hover:shadow-green-500/20',
                            },
                        ].map((dewan, idx) => (
                            <div
                                key={idx}
                                // OPTIMASI 3: Hapus backdrop-blur-xl dan turunkan hover:shadow-2xl menjadi hover:shadow-xl
                                className={`reveal opacity-0 translate-y-8 bg-white/10 border border-white/10 rounded-[2.5rem] p-8 pt-20 relative flex flex-col hover:-translate-y-3 transition-all duration-300 group ${dewan.shadow} hover:shadow-xl hover:border-white/30 animate-in fade-in slide-in-from-bottom-10`}
                                style={{ transitionDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
                            >
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                                    <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex justify-center items-center group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        <img src={`/image/landing/1 (${idx + 2}).png`} alt={dewan.nama} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#D4A017] to-[#F0B429] rounded-full border-4 border-[#1B6B3A] flex items-center justify-center shadow-md z-10">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.35.35l2.13 3.13c.2.2.4.4.6.5l3.13 2.13a1 1 0 001.03-.03l3.13-2.13c.2-.1.4-.3.6-.5l2.13-3.13a.999.999 0 01.35-.35l2.644-1.131a1 1 0 000-1.84l-7-3z"></path>
                                            <path d="M11.764 11.881l-2.096 1.428-2.096-1.428c-.1-.0-.1-.1-.1-.1l-1.428-2.096a1 1 0 00-1.84-.1L1.1 11.764a1 1 0 000 1.03l2.096 2.096c.1.1.3.1.5.1h13.2a1 1 0 00.5-.1l2.096-2.096a1 1 0 000-1.03l-1.428-2.096a1 1 0 00-1.84.1l-1.428 2.096s-.1.1-.1.1z"></path>
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-center mb-6 pb-6 border-b border-white/10 flex-1 mt-3">
                                    <h3 className="text-xl font-extrabold text-white mb-1.5 drop-shadow-sm">{dewan.nama}</h3>
                                    <p className="text-sm font-semibold text-gray-200 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">{dewan.jabatan}</p>
                                </div>
                                <ul className="text-sm text-gray-100 space-y-3 lg:space-y-4 px-1">
                                    {dewan.poin.map((p, i) => (
                                        <li key={i} className="flex items-start">
                                            <svg
                                                className="w-5 h-5 text-[#D4A017] mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span className="leading-snug font-medium text-gray-100">{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center reveal opacity-0 translate-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000" style={{ transitionDelay: '0.5s' }}>
                        <button
                            onClick={() => router.get('/pengurus')}
                            className="bg-white text-[#1B6B3A] hover:bg-gray-100 hover:scale-105 border-2 border-white px-9 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl flex items-center gap-2 mx-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Lihat Detail Pendiri QLC
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. VISI & MISI */}
            <section id="visi-misi" className="py-24 bg-white relative overflow-hidden">
                {/* OPTIMASI 4: Hapus background blur-3xl berukuran besar yang sangat memberatkan rendering */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse,rgba(27,107,58,0.06)_0%,rgba(212,160,23,0.06)_50%,transparent_70%)] rounded-full z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* OPTIMASI 5: Hapus glassClass (karena mengandung backdrop-blur-xl) pada Visi */}
                        <div
                            className={`reveal opacity-0 translate-y-8 lg:col-span-5 rounded-[3rem] p-10 md:p-14 bg-gradient-to-br from-[#114a27] to-[#1B6B3A] text-white shadow-xl relative overflow-hidden`}
                        >
                            <div className="absolute -right-10 -bottom-10 opacity-10">
                                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-10 5 10 5 10-5-10-5z" />
                                </svg>
                            </div>
                            {/* OPTIMASI 6: Hapus backdrop-blur pada icon wrapper */}
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/20">
                                <svg className="w-8 h-8 text-[#F0B429]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    ></path>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-6 text-[#F0B429] tracking-wide">VISI KAMI</h2>
                            <p className="text-2xl leading-relaxed font-light italic text-white/95">
                                "Menjadi salah satu LEMBAGA PENDIDIKAN QUR'AN UNGGULAN yang mencetak para PEMIMPIN / LEADER berdasarkan Al Qur'an dan Sunnah."
                            </p>
                        </div>

                        {/* OPTIMASI 7: Hapus backdrop-blur-md dan ubah transparansi pada Misi menjadi background putih padat (bg-white/95) */}
                        <div className={`reveal opacity-0 translate-y-8 lg:col-span-7 bg-white/95 border border-gray-100 shadow-xl rounded-[3rem] p-10 md:p-14`} style={{ transitionDelay: '0.2s' }}>
                            <h2 className="text-3xl font-bold mb-10 text-gray-900 border-b pb-4">MISI KAMI</h2>
                            <ul className="space-y-6">
                                {[
                                    'Mencetak pribadi yang KOKOH/KUAT Aqidahnya.',
                                    'Mencetak pribadi yang TAAT Menjalankan perintah Allah SWT dan beribadah sesuai dengan tuntunan Rasulullah SAW.',
                                    'Mencetak pribadi yang sehat jiwa, raga dan muamalahnya.',
                                    'Mencetak pribadi yang mengikuti teladan orang-orang HEBAT dari Zaman Rasulullah SAW, Sahabat, Tabiin, Tabiut Tabiin dan Ilmuan Islam.',
                                    'Mencetak pribadi yang BERMANFAAT bagi orang lain.',
                                ].map((misi, idx) => (
                                    <li key={idx} className="flex items-start space-x-5 group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#D4A017] group-hover:text-white text-[#1B6B3A] flex items-center justify-center font-bold text-base transition-colors duration-300 shadow-sm border border-gray-200 group-hover:border-[#D4A017]">
                                            {idx + 1}
                                        </div>
                                        <span className="text-gray-700 leading-relaxed text-lg font-medium pt-1.5">{misi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* 6. PILAR INTI */}
            <section id="pilar" className="py-24 bg-gradient-to-b from-[#f0f7f6] to-[#ffffff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 reveal opacity-0 translate-y-8">
                        <span className="text-[#34ad62] font-bold text-sm tracking-widest uppercase mb-2 block">Fondasi Karakter</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">5 Pilar Inti Realisasi Konsep</h2>
                        <p className="text-gray-600 text-lg">Membentuk Pribadi Muslim Kaaffah yang Paripurna</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-center">
                        {[
                            { title: 'PRIBADI KUAT', desc: 'Kuat secara AQIDAH Islamiyah mencakup keimanan kepada rukun iman.', color: 'from-rose-500 to-red-600', shadow: 'shadow-red-500/20' },
                            {
                                title: 'PRIBADI TAAT',
                                desc: 'Taat menjalankan SYARIAT Islam melingkupi pengamalan 5 Rukun Islam.',
                                color: 'from-amber-500 to-orange-500',
                                shadow: 'shadow-orange-500/20',
                            },
                            { title: 'PRIBADI SEHAT', desc: 'Sehat secara Jiwa (Ruhiyah), Jasadiyah, Aqliyah, dan Muamalah.', color: 'from-emerald-500 to-green-600', shadow: 'shadow-green-500/20' },
                            { title: 'PRIBADI HEBAT', desc: 'Mendalami sejarah dan mengambil teladan dari para Nabi dan Ulama.', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                            {
                                title: 'PRIBADI MANFAAT',
                                desc: 'Menggali potensi anak sesuai fitrahnya untuk mengejar cita-cita.',
                                color: 'from-purple-500 to-fuchsia-600',
                                shadow: 'shadow-purple-500/20',
                            },
                        ].map((pilar, idx) => (
                            <div
                                key={idx}
                                className={`reveal opacity-0 translate-y-8 bg-white border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 rounded-[2.5rem] p-8 flex flex-col ${idx === 3 ? 'lg:col-start-1 lg:ml-auto lg:w-full' : ''} ${idx === 4 ? 'lg:col-start-2 lg:mr-auto lg:w-full' : ''}`}
                                style={{ transitionDelay: `${idx * 0.1}s` }}
                            >
                                <div
                                    className={`w-14 h-14 bg-gradient-to-br ${pilar.color} rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-lg ${pilar.shadow}`}
                                >
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{pilar.title}</h3>
                                <p className="text-base text-gray-600 leading-relaxed flex-1">{pilar.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. PROGRAM PENDIDIKAN */}
            <section id="program" className="py-24 bg-[#FAFAFA] border-t border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 reveal opacity-0 translate-y-8">
                        <span className="inline-block py-2 px-5 rounded-full bg-white border border-gray-200 shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4">
                            📚 EDUKASI BERKELANJUTAN
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            Program Layanan <span className="text-[#D4A017]">QLC</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {[
                            { slug: 'ql-school', title: 'QL - SCHOOL', desc: "Program pendidikan berkesinambungan terpadu berbasis Al-Qur'an." },
                            { slug: 'ql-tft', title: 'QL - TFT', desc: 'Training for Trainers. Pelatihan intensif mencetak instruktur.' },
                            { slug: 'ql-parenting', title: 'QL - PARENTING', desc: 'Bimbingan untuk orang tua dalam mendidik anak sesuai fitrah.' },
                            { slug: 'ql-kids', title: 'QL - KIDS', desc: 'Edukasi penanaman nilai tauhid dasar untuk usia dini.' },
                            { slug: 'ql-teens', title: 'QL - TEENS', desc: 'Pembinaan karakter & kepemimpinan remaja.' },
                            { slug: 'ql-teacher', title: 'QL - TEACHER', desc: 'Pengembangan kapasitas profesionalisme guru.' },
                        ].map((prog, idx) => (
                            <div
                                key={idx}
                                className={`reveal opacity-0 translate-y-8 bg-white border border-gray-200/60 shadow-md hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden flex flex-col group`}
                                style={{ transitionDelay: `${idx * 0.1}s` }}
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[#1B6B3A]/10 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={`/image/landing/1 (${idx + 5 <= 9 ? idx + 5 : 9}).png`}
                                        alt={prog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8 flex-1 flex flex-col bg-white">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-[#1B6B3A] transition-colors">{prog.title}</h3>
                                    <p className="text-gray-600 text-base mb-8 flex-1 leading-relaxed">{prog.desc}</p>
                                    {/* Rute Hardcoded ke /program-detail */}
                                    <button
                                        onClick={() => router.get('/program-detail')}
                                        className="w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[#1B6B3A] font-bold hover:bg-[#1B6B3A] hover:text-white hover:border-[#1B6B3A] transition-all shadow-sm text-sm"
                                    >
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
                        <span className="inline-block py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                            📸 DOKUMENTASI
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Galeri Kegiatan <span className="text-[#D4A017]">QLC</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Momen-momen berharga santri dalam kegiatan belajar, menghafal, dan aktivitas pembentukan karakter.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4 md:gap-6">
                        {/* Item 1 */}
                        <div
                            className={`reveal opacity-0 translate-y-8 md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] shadow-sm cursor-pointer border border-white/50 bg-gray-100`}
                            style={{ transitionDelay: '0.1s' }}
                        >
                            <img src="/image/landing/1 (6).png" alt="Halaqah Pagi" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/95 via-[#1B6B3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                <span className="text-[#D4A017] font-bold text-sm tracking-wider mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    KBM UTAMA
                                </span>
                                <h3 className="text-white font-bold text-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">Halaqah Tahfidz Pagi</h3>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div
                            className={`reveal opacity-0 translate-y-8 md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2rem] shadow-sm cursor-pointer border border-white/50 bg-gray-100`}
                            style={{ transitionDelay: '0.2s' }}
                        >
                            <img src="/image/landing/1 (3).png" alt="Ujian Tahfidz" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Ujian Sertifikasi</h3>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div
                            className={`reveal opacity-0 translate-y-8 md:col-span-1 md:row-span-2 group relative overflow-hidden rounded-[2rem] shadow-sm cursor-pointer border border-white/50 bg-gray-100`}
                            style={{ transitionDelay: '0.3s' }}
                        >
                            <img src="/image/landing/1 (4).png" alt="Kajian Rutin" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/95 via-[#1B6B3A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <span className="text-[#D4A017] font-bold text-xs tracking-wider mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    KEAGAMAAN
                                </span>
                                <h3 className="text-white font-bold text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">Kajian & Mabit</h3>
                            </div>
                        </div>

                        {/* Item 4 */}
                        <div
                            className={`reveal opacity-0 translate-y-8 md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2rem] shadow-sm cursor-pointer border border-white/50 bg-gray-100`}
                            style={{ transitionDelay: '0.4s' }}
                        >
                            <img src="/image/landing/1 (5).png" alt="Outbound Santri" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Outbound Santri</h3>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12 reveal opacity-0 translate-y-8">
                        {/* Rute Hardcoded ke /galeri */}
                        <button
                            onClick={() => router.get('/galeri')}
                            className="bg-white border border-gray-200 text-gray-700 hover:border-[#1B6B3A] hover:text-[#1B6B3A] px-8 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
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
