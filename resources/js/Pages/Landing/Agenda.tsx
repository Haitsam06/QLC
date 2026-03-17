'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Link as LinkIcon, X } from 'lucide-react';
import Navbar from '../../Components/Navbar';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Agenda = {
    id:                string;
    title:             string;
    event_date:        string; // YYYY-MM-DD
    description:       string;
    location:          string;
    registration_link: string;
    visibility:        'umum' | 'mitra' | 'keduanya';
};

const BASE = 'http://127.0.0.1:8000/api';

const MONTH_NAMES     = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS_OF_WEEK    = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

const getLocalDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════════════════ */
function AgendaDetailModal({ agenda, onClose }: { agenda: Agenda; onClose: () => void }) {
    const [y,m,d] = agenda.event_date.split('-');
    const displayDate = `${d} ${MONTH_NAMES[parseInt(m)-1]} ${y}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(15,23,42,0.45)', backdropFilter:'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ border:'1.5px solid rgba(255,255,255,0.9)' }}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#1B6B3A]/10 text-[#1B6B3A] mb-2">
                            {displayDate}
                        </span>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{agenda.title}</h3>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
                        <X size={15} className="text-gray-500"/>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-3">
                    {agenda.location && (
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                            <MapPin size={16} className="text-[#1B6B3A] shrink-0 mt-0.5"/>
                            <span>{agenda.location}</span>
                        </div>
                    )}
                    {agenda.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{agenda.description}</p>
                    )}
                    {agenda.registration_link && (
                        <a href={agenda.registration_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-[#1B6B3A] hover:underline">
                            <LinkIcon size={14}/> Daftar Sekarang
                        </a>
                    )}
                </div>

                <div className="px-6 pb-6">
                    <button onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors">
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
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [agendas,  setAgendas]  = useState<Agenda[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [selected, setSelected] = useState<Agenda | null>(null);

    /* ── Fetch agenda for current month (visibility=umum) ── */
    useEffect(() => {
        setLoading(true);
        fetch(`${BASE}/agenda?year=${year}&month=${month+1}&visibility=umum`)
            .then(r => r.json())
            .then(d => { if (d.success) setAgendas(d.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [year, month]);

    /* ── Navigation ── */
    const prevMonth = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
    const nextMonth = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
    const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

    /* ── Build calendar grid ── */
    const calendarDays = useMemo(() => {
        const firstDOW    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();
        const prevDays    = new Date(year, month, 0).getDate();
        const todayStr    = getLocalDateString(today);

        const eventsMap = new Map<string, Agenda[]>();
        agendas.forEach(a => {
            const k = a.event_date.substring(0,10);
            if (!eventsMap.has(k)) eventsMap.set(k,[]);
            eventsMap.get(k)!.push(a);
        });

        const days = [];

        // Previous month padding
        for (let i=firstDOW; i>0; i--) {
            const d   = prevDays-i+1;
            const m2  = month===0?11:month-1;
            const y2  = month===0?year-1:year;
            const dateStr = `${y2}-${String(m2+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            days.push({ day:d, isCurrentMonth:false, isToday:false, dateStr, events:eventsMap.get(dateStr)??[] });
        }

        // Current month
        for (let i=1; i<=daysInMonth; i++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            days.push({ day:i, isCurrentMonth:true, isToday:dateStr===todayStr, dateStr, events:eventsMap.get(dateStr)??[] });
        }

        // Next month padding
        const rem = (7-(days.length%7))%7;
        for (let i=1; i<=rem; i++) {
            const m2  = month===11?0:month+1;
            const y2  = month===11?year+1:year;
            const dateStr = `${y2}-${String(m2+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            days.push({ day:i, isCurrentMonth:false, isToday:false, dateStr, events:eventsMap.get(dateStr)??[] });
        }

        return days;
    }, [year, month, agendas]);

    const glassClass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

    return (
        <div className="font-sans text-gray-800 bg-white min-h-screen overflow-x-hidden">
            <Navbar/>

            <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <main className="max-w-7xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-10 mt-10">
                        <span className="inline-block py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                            📅 JADWAL KEGIATAN
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Kalender <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#0a381d]">Agenda QLC</span>
                        </h1>
                    </div>

                    {/* Main glass card */}
                    <div className={`${glassClass} rounded-[2.5rem] p-6 md:p-10`}>
                        {/* Nav */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {MONTH_NAMES[month]} {year}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button onClick={goToday}
                                    className="px-6 py-2.5 text-sm bg-white border-2 border-transparent hover:border-[#D4A017] text-gray-700 hover:text-[#D4A017] font-bold rounded-full transition-all shadow-sm">
                                    Hari Ini
                                </button>
                                <button onClick={prevMonth}
                                    className="p-2.5 bg-white border border-gray-100 hover:border-[#1B6B3A] hover:text-[#1B6B3A] text-gray-600 rounded-full transition-all shadow-sm">
                                    <ChevronLeft size={20}/>
                                </button>
                                <button onClick={nextMonth}
                                    className="p-2.5 bg-white border border-gray-100 hover:border-[#1B6B3A] hover:text-[#1B6B3A] text-gray-600 rounded-full transition-all shadow-sm">
                                    <ChevronRight size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* Calendar grid */}
                        <div className="bg-white/50 border border-gray-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 bg-white/60 border-b border-gray-200/60">
                                {DAYS_OF_WEEK.map(d => (
                                    <div key={d} className="py-4 text-center text-sm font-bold text-[#1B6B3A] uppercase tracking-wider border-r border-gray-200/60 last:border-r-0">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days */}
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-8 h-8 border-4 border-[#1B6B3A]/30 border-t-[#1B6B3A] rounded-full animate-spin"/>
                                </div>
                            ) : (
                                <div className="grid grid-cols-7">
                                    {calendarDays.map(({ day, isCurrentMonth, dateStr, isToday, events }, idx) => (
                                        <div key={dateStr}
                                            className={`min-h-[120px] p-2 border-b border-gray-200/60 relative transition-colors
                                            ${(idx+1)%7!==0?'border-r border-gray-200/60':''}
                                            ${isCurrentMonth?'bg-white/40 hover:bg-white/80':'bg-gray-50/30'}`}>
                                            {/* Date number */}
                                            <div className="flex justify-end mb-2">
                                                <span className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full transition-all
                                                    ${isToday?'bg-[#D4A017] text-white shadow-md scale-110':isCurrentMonth?'text-gray-700':'text-gray-400'}`}>
                                                    {day}
                                                </span>
                                            </div>

                                            {/* Events */}
                                            <div className="flex flex-col gap-1.5 w-full">
                                                {events.map((a: Agenda) => (
                                                    <div key={a.id} title={a.title}
                                                        onClick={() => setSelected(a)}
                                                        className="bg-gradient-to-r from-[#1B6B3A] to-[#2D8A4E] text-white text-[11px] md:text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm truncate cursor-pointer hover:shadow-md hover:scale-[1.02] transition-transform">
                                                        {a.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer info */}
                        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                            Klik agenda untuk melihat detail · Menampilkan agenda publik QLC
                        </p>
                    </div>
                </main>
            </div>

            {/* Detail Modal */}
            {selected && <AgendaDetailModal agenda={selected} onClose={() => setSelected(null)}/>}
        </div>
    );
}
