import React, { useState, useEffect } from 'react';
import { router, Link, usePage } from '@inertiajs/react';

const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        admin:   'Admin',
        teacher: 'Guru',
        mitra:   'Mitra',
        parents: 'Wali Murid',
    };
    return labels[role] || role;
};

const Avatar = ({ photo, name, size = 'sm' }: { photo?: string | null; name?: string; size?: 'sm' | 'md' }) => {
    const dim = size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
    const initial = name?.charAt(0)?.toUpperCase() || 'U';

    if (photo) {
        return <img src={photo} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-white`} />;
    }
    return (
        <div className={`${dim} rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#34ad62] flex items-center justify-center text-white font-bold ring-2 ring-white`}>
            {initial}
        </div>
    );
};

const Navbar = () => {
    const { auth } = usePage().props as any;
    const isLoggedIn = !!auth?.user;
    const user       = auth?.user as { name?: string; photo?: string | null; role?: string } | null;
    const userRole   = user?.role || '';

    const getDashboardRoute = () => {
        if (userRole === 'admin')   return '/admin/dashboard';
        if (userRole === 'teacher') return '/teacher/dashboard';
        if (userRole === 'mitra')   return '/mitra/dashboard';
        return '/parents/dashboard';
    };

    const [isScrolled, setIsScrolled]         = useState(false);
    const [activeSection, setActiveSection]   = useState('beranda');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = ['Beranda', 'Tentang', 'Visi & Misi', 'Pilar', 'Program', 'Galeri', 'Agenda'];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

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
                setActiveSection('agenda');
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (itemName: string) => {
        setIsMobileMenuOpen(false);
        const id = itemName.toLowerCase().replace(' & ', '-');

        if (id === 'agenda') {
            router.get('/landing/agenda');
            return;
        }

        if (window.location.pathname !== '/') {
            router.get(`/#${id}`);
            return;
        }

        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    const glassClass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

    return (
        <nav className="fixed w-full z-50 transition-all duration-500 top-0 pt-4 px-4 sm:px-6 lg:px-8">
            <div className={`max-w-7xl mx-auto transition-all duration-500 ${isScrolled ? glassClass + ' rounded-full px-6 py-3' : 'bg-transparent px-2 py-4'}`}>
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('beranda')}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#0a381d] flex items-center justify-center text-white font-bold text-xl shadow-md">Q</div>
                        <span className="ml-3 font-bold text-xl tracking-tight text-[#1B6B3A]">Pejuang Quran</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-1 items-center bg-white/40 p-1 rounded-full border border-white/60 backdrop-blur-sm shadow-sm">
                        {menuItems.map((item) => {
                            const id       = item.toLowerCase().replace(' & ', '-');
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

                    {/* Desktop: Profile card / Daftar */}
                    <div className="hidden lg:block">
                        {isLoggedIn ? (
                            <Link
                                href={getDashboardRoute()}
                                className="flex items-center gap-2.5 bg-white/80 hover:bg-white border border-white/70 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
                            >
                                <Avatar photo={user?.photo} name={user?.name} size="sm" />
                                <div className="text-left pr-1">
                                    <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-[#1B6B3A] transition-colors line-clamp-1 max-w-[120px]">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-tight">{getRoleLabel(userRole)}</p>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href={route('register')}
                                className="inline-block bg-gradient-to-r from-[#D4A017] to-[#F0B429] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                            >
                                Daftar Sekarang
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center gap-2">
                        {isLoggedIn && (
                            <Link href={getDashboardRoute()}>
                                <Avatar photo={user?.photo} name={user?.name} size="sm" />
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full bg-white/50 text-[#1B6B3A]"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mx-4 mt-2 p-4 rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-white border-opacity-50">
                    {/* Profile card di atas menu jika sudah login */}
                    {isLoggedIn && (
                        <Link
                            href={getDashboardRoute()}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B6B3A]/5 hover:bg-[#1B6B3A]/10 transition-colors mb-3"
                        >
                            <Avatar photo={user?.photo} name={user?.name} size="md" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                <p className="text-xs text-[#1B6B3A] font-medium leading-tight">{getRoleLabel(userRole)}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}

                    <div className="flex flex-col space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item)}
                                className={`text-left px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                                    activeSection === item.toLowerCase().replace(' & ', '-')
                                        ? 'bg-[#1B6B3A]/10 text-[#1B6B3A]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        ))}

                        {!isLoggedIn && (
                            <Link
                                href={route('register')}
                                className="mt-2 bg-gradient-to-r from-[#D4A017] to-[#F0B429] text-white px-4 py-3 rounded-xl font-bold text-center shadow-md block"
                            >
                                Daftar Sekarang
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
