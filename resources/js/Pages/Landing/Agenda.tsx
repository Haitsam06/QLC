'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Link as LinkIcon, X, Calendar as CalendarIcon } from 'lucide-react';
import Navbar from '../../Components/Navbar';

/* ═══════════════════════════════════════════════════════════
    TYPES & CONSTANTS
═══════════════════════════════════════════════════════════ */
type Agenda = {
    id: string;
    title: string;
    event_date: string;
    description: string;
    location: string;
    registration_link: string;
    visibility: 'umum' | 'mitra' | 'keduanya';
};

const BASE = 'http://127.0.0.1:8000/api';
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const getLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ═══════════════════════════════════════════════════════════
    DETAIL MODAL (Versi Ringan)
═══════════════════════════════════════════════════════════ */
function AgendaDetailModal({ agenda, onClose }: { agenda: Agenda; onClose: () => void }) {
    const [y, m, d] = agenda.event_date.split('-');
    const displayDate = `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-[#1B6B3A] bg-green-50 px-2 py-1 rounded uppercase tracking-wider">{displayDate}</span>
                        <h3 className="text-lg font-bold text-gray-900 mt-2 leading-tight">{agenda.title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {agenda.location && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <MapPin size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                            <span>{agenda.location}</span>
                        </div>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed">{agenda.description}</p>
                </div>
                <div className="p-6 pt-0 flex flex-col gap-2">
                    {agenda.registration_link && (
                        <a href={agenda.registration_link} target="_blank" rel="noreferrer" className="w-full py-3 bg-[#1B6B3A] text-white text-center font-bold text-sm rounded-lg hover:bg-[#14522d] transition-colors">
                            Daftar Sekarang
                        </a>
                    )}
                    <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
    MAIN COMPONENT (Optimized)
═══════════════════════════════════════════════════════════ */
export default function AgendaLanding() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Agenda | null>(null);
    const [activeDate, setActiveDate] = useState(getLocalDateString(today));

    useEffect(() => {
        setLoading(true);
        fetch(`${BASE}/agenda?year=${year}&month=${month + 1}&visibility=umum`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setAgendas(d.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [year, month]);

    const prevMonth = () => {
        if (month === 0) {
            setYear((y) => y - 1);
            setMonth(11);
        } else setMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) {
            setYear((y) => y + 1);
            setMonth(0);
        } else setMonth((m) => m + 1);
    };
    const goToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setActiveDate(getLocalDateString(today));
    };

    const calendarDays = useMemo(() => {
        const firstDOW = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();
        const todayStr = getLocalDateString(today);

        const eventsMap = new Map<string, Agenda[]>();
        agendas.forEach((a) => {
            const k = a.event_date.substring(0, 10);
            if (!eventsMap.has(k)) eventsMap.set(k, []);
            eventsMap.get(k)!.push(a);
        });

        const days = [];
        for (let i = firstDOW; i > 0; i--) {
            const d = prevDays - i + 1;
            const m2 = month === 0 ? 11 : month - 1;
            const y2 = month === 0 ? year - 1 : year;
            const dateStr = `${y2}-${String(m2 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, isCurrentMonth: false, dateStr, events: eventsMap.get(dateStr) ?? [] });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, isCurrentMonth: true, isToday: dateStr === todayStr, dateStr, events: eventsMap.get(dateStr) ?? [] });
        }
        const rem = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= rem; i++) {
            const m2 = month === 11 ? 0 : month + 1;
            const y2 = month === 11 ? year + 1 : year;
            const dateStr = `${y2}-${String(m2 + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, isCurrentMonth: false, dateStr, events: eventsMap.get(dateStr) ?? [] });
        }
        return days;
    }, [year, month, agendas]);

    const activeDateEvents = useMemo(() => {
        return agendas.filter((a) => a.event_date.substring(0, 10) === activeDate);
    }, [agendas, activeDate]);

    return (
        <div className="font-sans text-gray-800 bg-[#f8fafc] min-h-screen">
            <Navbar />
            <div className="py-20 px-4 sm:px-6 mt-10">
                <main className="max-w-7xl mx-auto">
                    {/* --- TOMBOL KEMBALI --- */}
                    <div className="mb-8">
                        <button 
                            onClick={() => window.history.back()} 
                            className="flex items-center gap-1 text-gray-600 text-sm font-bold active:scale-90 transition-all hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit"
                        >
                            <ChevronLeft size={18} /> Kembali
                        </button>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Kalender <span className="text-[#1B6B3A]">Agenda</span>
                        </h1>
                    </div>

                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                        {/* Navigasi Sederhana */}
                        <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {MONTH_NAMES[month]} <span className="text-[#1B6B3A]">{year}</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={goToday} className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Hari Ini
                                </button>
                                <div className="flex gap-1">
                                    <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* LEFT: Grid Kalender */}
                            <div className="lg:col-span-8 p-2 md:p-4 border-r border-gray-100">
                                <div className="grid grid-cols-7 mb-2">
                                    {DAYS_OF_WEEK.map((d) => (
                                        <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                                    {calendarDays.map(({ day, isCurrentMonth, dateStr, isToday, events }) => {
                                        const isActive = activeDate === dateStr;
                                        return (
                                            <div
                                                key={dateStr}
                                                onClick={() => isCurrentMonth && setActiveDate(dateStr)}
                                                className={`
                                                    min-h-[70px] md:min-h-[100px] flex flex-col p-2 cursor-pointer transition-colors relative
                                                    ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-40 pointer-events-none'}
                                                    ${isActive ? 'ring-2 ring-inset ring-[#1B6B3A]' : ''}
                                                `}
                                            >
                                                <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-[#1B6B3A]' : 'text-gray-900'}`}>{day}</span>

                                                <div className="hidden md:flex flex-col gap-1 mt-1 overflow-hidden">
                                                    {events.slice(0, 2).map((ev) => (
                                                        <div key={ev.id} className="text-[8px] bg-[#1B6B3A]/10 text-[#1B6B3A] p-1 rounded border border-[#1B6B3A]/20 truncate font-semibold">
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                    {events.length > 2 && <div className="text-[8px] text-gray-400 font-bold">+{events.length - 2}</div>}
                                                </div>

                                                <div className="md:hidden flex justify-center mt-auto">{events.length > 0 && <div className="w-1 h-1 rounded-full bg-[#D4A017]" />}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RIGHT: Detail Agenda List */}
                            <div className="lg:col-span-4 bg-gray-50/50 p-4 md:p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CalendarIcon size={16} className="text-[#1B6B3A]" />
                                    <span className="text-xs font-bold text-gray-900 uppercase">Agenda {activeDate === getLocalDateString(today) ? 'Hari Ini' : ''}</span>
                                </div>
                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="py-10 text-center text-xs text-gray-400">Memuat...</div>
                                    ) : activeDateEvents.length > 0 ? (
                                        activeDateEvents.map((a) => (
                                            <div key={a.id} onClick={() => setSelected(a)} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1B6B3A] transition-colors cursor-pointer group shadow-sm">
                                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#1B6B3A] transition-colors mb-2 leading-tight">{a.title}</h4>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                                    <MapPin size={12} className="text-[#D4A017]" /> {a.location || 'Lokasi TBA'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tidak ada agenda</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {selected && <AgendaDetailModal agenda={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
