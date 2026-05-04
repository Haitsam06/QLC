'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Link as LinkIcon, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
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
    DETAIL MODAL (Sama seperti sebelumnya)
═══════════════════════════════════════════════════════════ */
function AgendaDetailModal({ agenda, onClose }: { agenda: Agenda; onClose: () => void }) {
    const [y, m, d] = agenda.event_date.split('-');
    const displayDate = `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-[#1B6B3A]/10 text-[#1B6B3A] mb-2 uppercase tracking-wider">{displayDate}</span>
                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{agenda.title}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>
                <div className="px-8 py-6 flex flex-col gap-4">
                    {agenda.location && (
                        <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl">
                            <MapPin size={18} className="text-[#D4A017] shrink-0 mt-0.5" />
                            <span className="font-medium">{agenda.location}</span>
                        </div>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed px-1">{agenda.description}</p>
                </div>
                <div className="px-8 pb-8 flex flex-col gap-3">
                    {agenda.registration_link && (
                        <a href={agenda.registration_link} target="_blank" rel="noreferrer" className="w-full py-4 rounded-2xl bg-[#1B6B3A] text-white text-center font-bold text-sm shadow-lg hover:-translate-y-1 transition-all">
                            Daftar Sekarang
                        </a>
                    )}
                    <button onClick={onClose} className="w-full py-4 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
    MAIN COMPONENT
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
        <div className="font-sans text-gray-800 bg-white min-h-screen">
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] py-16 md:py-24 px-4 sm:px-6">
                <main className="mt-10 max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tight">
                            Kalender <span className="text-[#1B6B3A]">Agenda QLC</span>
                        </h1>
                    </div>

                    <div className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-[2.5rem] overflow-hidden">
                        {/* Navigasi */}
                        <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 bg-white/30">
                            <h2 className="text-3xl font-black text-gray-900">
                                {MONTH_NAMES[month]} <span className="text-[#1B6B3A]">{year}</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <button onClick={prevMonth} className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#1B6B3A] transition-all shadow-sm">
                                    <ChevronLeft size={22} />
                                </button>
                                <button onClick={goToday} className="px-6 py-3 text-sm font-bold bg-white border border-gray-100 rounded-2xl hover:border-[#1B6B3A] transition-all shadow-sm">
                                    Hari Ini
                                </button>
                                <button onClick={nextMonth} className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#1B6B3A] transition-all shadow-sm">
                                    <ChevronRight size={22} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* LEFT: Grid Kalender (Dengan Teks di Desktop) */}
                            <div className="lg:col-span-8 p-4 md:p-8 border-r border-gray-100">
                                <div className="grid grid-cols-7 mb-4">
                                    {DAYS_OF_WEEK.map((d) => (
                                        <div key={d} className="py-2 text-center text-[10px] md:text-xs font-black text-[#1B6B3A] uppercase tracking-widest">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 md:gap-3">
                                    {calendarDays.map(({ day, isCurrentMonth, dateStr, isToday, events }) => {
                                        const isActive = activeDate === dateStr;
                                        return (
                                            <div
                                                key={dateStr}
                                                onClick={() => isCurrentMonth && setActiveDate(dateStr)}
                                                className={`
                                                    min-h-[60px] md:min-h-[110px] flex flex-col p-1.5 md:p-3 rounded-xl md:rounded-3xl cursor-pointer transition-all duration-300 relative border
                                                    ${isCurrentMonth ? 'bg-white/40 hover:shadow-lg' : 'opacity-10 pointer-events-none'}
                                                    ${isActive ? 'border-[#1B6B3A] bg-white ring-2 ring-[#1B6B3A]/10 scale-[1.02] z-10' : 'border-transparent'}
                                                `}
                                            >
                                                <span className={`text-xs md:text-lg font-black mb-1 ${isToday ? 'text-[#D4A017]' : 'text-gray-900'}`}>{day}</span>

                                                {/* LIST AGENDA (Muncul di Desktop) */}
                                                <div className="hidden md:flex flex-col gap-1 overflow-hidden">
                                                    {events.slice(0, 2).map((ev) => (
                                                        <div
                                                            key={ev.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelected(ev);
                                                            }}
                                                            className="text-[9px] bg-[#1B6B3A] text-white p-1 rounded-md truncate font-bold hover:bg-[#0a381d] transition-colors"
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                    {events.length > 2 && <div className="text-[9px] text-gray-400 font-bold">+{events.length - 2} lainnya</div>}
                                                </div>

                                                {/* DOT PENANDA (Muncul di Mobile) */}
                                                <div className="md:hidden flex justify-center mt-auto">{events.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RIGHT: Detail Agenda Samping */}
                            <div className="lg:col-span-4 bg-gray-50/40 p-6 md:p-8">
                                <h3 className="font-black text-gray-900 uppercase text-sm mb-6 flex items-center gap-2">
                                    <CalendarIcon size={18} className="text-[#1B6B3A]" /> Agenda {activeDate === getLocalDateString(today) ? 'Hari Ini' : ''}
                                </h3>
                                <div className="space-y-4">
                                    {activeDateEvents.length > 0 ? (
                                        activeDateEvents.map((a) => (
                                            <div key={a.id} onClick={() => setSelected(a)} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#1B6B3A] transition-all cursor-pointer shadow-sm hover:shadow-md">
                                                <h4 className="font-extrabold text-gray-900 mb-2 leading-tight">{a.title}</h4>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <MapPin size={14} className="text-[#D4A017]" /> {a.location || 'Lokasi TBA'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">Tidak ada agenda</div>
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
