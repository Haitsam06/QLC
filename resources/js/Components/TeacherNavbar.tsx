import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarDays, Users, LayoutDashboard, Bell, LogOut } from 'lucide-react';
import type { PageProps } from '@/types';

/* ════ DATA MENU NAVBAR GURU ════ */
// PERHATIAN: Sesuaikan isi 'href' dengan route URL di web.php Anda untuk bagian Guru
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', href: '/teacher/dashboard' },
    { icon: CalendarDays, label: 'Jadwal', id: 'jadwal', href: '/teacher/jadwal' },
    { icon: BookOpen, label: 'Laporan Progress', id: 'laporan', href: '/teacher/laporan' },
];

export default function GuruNavbar({ activePage }: { activePage: string }) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const displayName = user?.name || user?.username || user?.email || 'Pengguna';
    const roleText = user?.role_id === 'RL02' ? 'Guru' : 'Pengguna';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 lg:px-12 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                {/* Brand / Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                    <div className="hidden md:block">
                        <div className="font-extrabold text-base text-gray-900 leading-tight">Pejuang Quran</div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Portal Asatidz</div>
                    </div>
                </div>

                {/* Nav Pills (Menggunakan Link Inertia) */}
                <div className="hidden lg:flex items-center gap-2">
                    {navItems.map(({ icon: Icon, label, id, href }) => {
                        const isActive = activePage === id;

                        return (
                            <Link
                                key={id}
                                href={href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 
                                ${isActive ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-3">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="h-10 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-bold"
                >
                    <LogOut size={16} />
                    Logout
                </Link>
                <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-100 hover:text-green-700 transition-colors">
                    <Bell size={20} />
                </button>
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900 leading-tight">{displayName}</div>
                        <div className="text-xs text-green-600 font-semibold">{roleText}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-sm">{initials}</div>
                </div>
            </div>
        </nav>
    );
}
