import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    Bell,
    X,
    CheckCheck,
    Trash2,
    Loader2,
    BellOff,
    CalendarDays,
    BookOpen,
    UserPlus,
    Info,
    Settings,
} from 'lucide-react';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface NotifItem {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface Props {
    /** Callback opsional: saat notif diklik & punya link tab */
    onNavigate?: (tab: string) => void;
}

/* ══════════════════════════════════════════
   ICON PER TYPE
══════════════════════════════════════════ */
const TYPE_META: Record<string, { icon: JSX.Element; color: string }> = {
    pendaftaran: {
        icon: <UserPlus size={15} />,
        color: 'bg-amber-100 text-amber-600',
    },
    progress: {
        icon: <BookOpen size={15} />,
        color: 'bg-purple-100 text-purple-600',
    },
    agenda: {
        icon: <CalendarDays size={15} />,
        color: 'bg-blue-100 text-blue-600',
    },
    info: {
        icon: <Info size={15} />,
        color: 'bg-sky-100 text-sky-600',
    },
    system: {
        icon: <Settings size={15} />,
        color: 'bg-slate-100 text-slate-600',
    },
};

const fallbackMeta = { icon: <Bell size={15} />, color: 'bg-teal-100 text-teal-600' };

/* ══════════════════════════════════════════
   KOMPONEN UTAMA
══════════════════════════════════════════ */
export default function NotificationBell({ onNavigate }: Props) {
    const [open, setOpen]             = useState(false);
    const [notifs, setNotifs]         = useState<NotifItem[]>([]);
    const [unread, setUnread]         = useState(0);
    const [loading, setLoading]       = useState(false);
    const [actionLoading, setAction]  = useState<string | null>(null);

    const panelRef = useRef<HTMLDivElement>(null);

    /* ── Fetch notifikasi ─────────────────────────── */
    const fetchNotifs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/notifications');
            setNotifs(data.notifications);
            setUnread(data.unread_count);
        } catch (e) {
            console.error('Gagal mengambil notifikasi', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ambil saat pertama mount + polling tiap 60 detik
    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60_000);
        return () => clearInterval(interval);
    }, [fetchNotifs]);

    // Tutup panel saat klik di luar
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Actions ──────────────────────────────────── */
    const markRead = async (id: string) => {
        setAction(id);
        try {
            await axios.patch(`/api/notifications/${id}/read`);
            setNotifs((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
            );
            setUnread((c) => Math.max(0, c - 1));
        } finally {
            setAction(null);
        }
    };

    const markAllRead = async () => {
        setAction('all');
        try {
            await axios.patch('/api/notifications/read-all');
            setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnread(0);
        } finally {
            setAction(null);
        }
    };

    const deleteOne = async (id: string) => {
        setAction(`del-${id}`);
        try {
            await axios.delete(`/api/notifications/${id}`);
            const deleted = notifs.find((n) => n.id === id);
            setNotifs((prev) => prev.filter((n) => n.id !== id));
            if (deleted && !deleted.is_read) setUnread((c) => Math.max(0, c - 1));
        } finally {
            setAction(null);
        }
    };

    const deleteAll = async () => {
        setAction('del-all');
        try {
            await axios.delete('/api/notifications');
            setNotifs([]);
            setUnread(0);
        } finally {
            setAction(null);
        }
    };

    const handleClick = async (notif: NotifItem) => {
        // Tandai dibaca dulu
        if (!notif.is_read) await markRead(notif.id);

        // Navigasi ke tab jika ada link
        if (notif.link && onNavigate) {
            // link format: '?tab=siswa' atau langsung 'siswa'
            const tab = notif.link.replace('?tab=', '');
            onNavigate(tab);
            setOpen(false);
        }
    };

    /* ══════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════ */
    return (
        <div className="relative" ref={panelRef}>
            {/* ── Bell Button ── */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-600 relative transition-colors hover:bg-slate-100 hover:text-teal-700"
                aria-label="Notifikasi"
            >
                <Bell size={17} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white leading-none">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ── */}
            {open && (
                <div className="absolute right-0 mt-2 w-[360px] max-h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-teal-700" />
                            <span className="text-[14px] font-extrabold text-slate-900">Notifikasi</span>
                            {unread > 0 && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                                    {unread} baru
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    disabled={actionLoading === 'all'}
                                    className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-500 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                                    title="Tandai semua dibaca"
                                >
                                    {actionLoading === 'all' ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <CheckCheck size={13} />
                                    )}
                                    Baca semua
                                </button>
                            )}
                            {notifs.length > 0 && (
                                <button
                                    onClick={deleteAll}
                                    disabled={actionLoading === 'del-all'}
                                    className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    title="Hapus semua"
                                >
                                    {actionLoading === 'del-all' ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={12} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-slate-400">
                                <Loader2 size={22} className="animate-spin" />
                            </div>
                        ) : notifs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                <BellOff size={32} strokeWidth={1.5} />
                                <span className="text-[13px] font-semibold">Tidak ada notifikasi</span>
                            </div>
                        ) : (
                            notifs.map((n) => {
                                const meta = TYPE_META[n.type] ?? fallbackMeta;
                                const isDeleting = actionLoading === `del-${n.id}`;

                                return (
                                    <div
                                        key={n.id}
                                        className={`group flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors cursor-pointer
                                            ${n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/40 hover:bg-teal-50/70'}`}
                                        onClick={() => handleClick(n)}
                                    >
                                        {/* Icon tipe */}
                                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${meta.color}`}>
                                            {meta.icon}
                                        </div>

                                        {/* Teks */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <span className={`text-[12.5px] leading-snug truncate ${n.is_read ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                                                    {n.title}
                                                </span>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <span className="text-[10.5px] text-slate-400 font-medium mt-1 block">
                                                {n.created_at}
                                            </span>
                                        </div>

                                        {/* Hapus */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                                            disabled={isDeleting}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 mt-0.5"
                                            title="Hapus notifikasi"
                                        >
                                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifs.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                            <span className="text-[11px] text-slate-400 font-medium">
                                Menampilkan {notifs.length} notifikasi terbaru
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}