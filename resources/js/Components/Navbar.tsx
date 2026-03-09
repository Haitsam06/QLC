// resources/js/Components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('beranda');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Daftar menu utama
    const menuItems = ['Beranda', 'Tentang', 'Visi & Misi', 'Pilar', 'Program', 'Galeri', 'Agenda'];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Jika sedang di halaman utama, update indikator menu saat di-scroll
            if (window.location.pathname === '/') {
                const sections = ['beranda', 'tentang', 'visi-misi', 'pilar', 'program', 'galeri'];
                let current = 'beranda';

                for (const section of sections) {
                    const element = document.getElementById(section);
                    if (element && window.scrollY >= element.offsetTop - 150) {
                        current = section;
                    }
                }
                setActiveSection(current);
            } else if (window.location.pathname.includes('/landing/agenda')) {
                // PERBAIKAN: Ubah '/Agenda' menjadi '/landing/agenda'
                setActiveSection('agenda');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Panggil sekali saat komponen dimuat untuk set status awal
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (itemName: string) => {
        setIsMobileMenuOpen(false);
        const id = itemName.toLowerCase().replace(' & ', '-');

        // 1. Jika menu yang diklik adalah Agenda
        if (id === 'agenda') {
            // PERBAIKAN: Huruf kecil semua agar sesuai dengan web.php
            router.get('/landing/agenda');
            return;
        }

        // 2. PERBAIKAN TAMBAHAN: Jika sedang di halaman Agenda, tapi klik menu lain (misal Tentang), kembali ke halaman utama
        if (window.location.pathname !== '/') {
            router.get(`/#${id}`);
            return;
        }

        // 3. Jika user di halaman utama, lakukan smooth scroll
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    const glassClass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 top-0 pt-4 px-4 sm:px-6 lg:px-8`}>
            <div className={`max-w-7xl mx-auto transition-all duration-500 ${isScrolled ? glassClass + ' rounded-full px-6 py-3' : 'bg-transparent px-2 py-4'}`}>
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('beranda')}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#0a381d] flex items-center justify-center text-white font-bold text-xl shadow-md">Q</div>
                        <span className={`ml-3 font-bold text-xl tracking-tight text-[#1B6B3A]`}>Pejuang Quran</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-1 items-center bg-white/40 p-1 rounded-full border border-white/60 backdrop-blur-sm shadow-sm">
                        {menuItems.map((item) => {
                            const id = item.toLowerCase().replace(' & ', '-');
                            const isActive = activeSection === id;

                            return (
                                <button
                                    key={item}
                                    onClick={() => handleNavigation(item)}
                                    className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                                        isActive ? 'bg-white text-[#1B6B3A] shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tombol Daftar Desktop */}
                    <div className="hidden lg:block">
                        <button className="bg-gradient-to-r from-[#D4A017] to-[#F0B429] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm">
                            Daftar Sekarang
                        </button>
                    </div>

                    {/* Mobile Toggle Button */}
                    <div className="lg:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full bg-white/50 text-[#1B6B3A]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mx-4 mt-2 p-4 rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-white border-opacity-50">
                    <div className="flex flex-col space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item)}
                                className={`text-left px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                                    activeSection === item.toLowerCase().replace(' & ', '-') ? 'bg-[#1B6B3A]/10 text-[#1B6B3A]' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                        <button className="mt-2 bg-gradient-to-r from-[#D4A017] to-[#F0B429] text-white px-4 py-3 rounded-xl font-bold text-center shadow-md">Daftar Sekarang</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
