'use client';

import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../Components/Navbar';

// --- Tipe Data ---
type CalendarEvent = {
    id: number;
    date: string; // YYYY-MM-DD
    title: string;
    color?: 'blue' | 'green' | 'yellow' | 'red';
    icon?: string;
};

interface CalendarPageProps {
    events?: CalendarEvent[];
    upcoming?: any[];
    currentDateStr?: string;
}

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_OF_WEEK_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Fungsi pembantu untuk mendapatkan format YYYY-MM-DD zona waktu lokal
const getLocalDateString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Calendar({ events = [], upcoming = [], currentDateStr }: CalendarPageProps) {
    // Pastikan currentDateStr valid, jika tidak gunakan hari ini (waktu lokal)
    const safeDateStr = currentDateStr ? currentDateStr : getLocalDateString(new Date());
    const currentDate = useMemo(() => new Date(safeDateStr), [safeDateStr]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // === LOGIKA NAVIGASI ===
    const changeMonth = (offset: number) => {
        const newDate = new Date(year, month + offset, 1);
        const newDateStr = getLocalDateString(newDate);

        // UBAH DISINI: Ganti rutenya menjadi /landing/agenda
        router.get('/landing/agenda', { date: newDateStr }, { preserveScroll: true, preserveState: true });
    };

    const handlePrevMonth = () => changeMonth(-1);
    const handleNextMonth = () => changeMonth(1);

    const goToToday = () => {
        // UBAH DISINI JUGA
        router.get('/landing/agenda', {}, { preserveScroll: true });
    };

    // --- LOGIKA BUILD GRID ---
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        const prevMonthYear = prevMonth.getFullYear();
        const prevMonthMonth = prevMonth.getMonth();
        const nextMonth = new Date(year, month + 1, 1);
        const nextMonthYear = nextMonth.getFullYear();
        const nextMonthMonth = nextMonth.getMonth();

        const today = new Date();
        const todayStr = getLocalDateString(today); // Perbaikan: konsisten gunakan fungsi pembantu

        const calendarDays = [];
        const eventsMap = new Map();

        // Safety check untuk mapping event
        if (Array.isArray(events)) {
            events.forEach((event) => {
                if (event && event.date) {
                    const dateKey = event.date.substring(0, 10);
                    if (!eventsMap.has(dateKey)) {
                        eventsMap.set(dateKey, []);
                    }
                    eventsMap.get(dateKey).push(event);
                }
            });
        }

        // Previous Month Padding
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            const dateStr = `${prevMonthYear}-${String(prevMonthMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarDays.push({
                day,
                isCurrentMonth: false,
                dateStr,
                isToday: false,
                events: eventsMap.get(dateStr) || [],
            });
        }

        // Current Month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            calendarDays.push({
                day: i,
                isCurrentMonth: true,
                dateStr,
                isToday: dateStr === todayStr,
                events: eventsMap.get(dateStr) || [],
            });
        }

        // Next Month Padding
        const totalCellsSoFar = firstDayOfMonth + daysInMonth;
        const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;

        for (let i = 1; i <= remainingCells; i++) {
            const day = i;
            const dateStr = `${nextMonthYear}-${String(nextMonthMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarDays.push({
                day,
                isCurrentMonth: false,
                dateStr,
                isToday: false,
                events: eventsMap.get(dateStr) || [],
            });
        }

        return calendarDays;
    }, [year, month, events]);

    // Reusable Glass Class (Sama seperti di Landing Page)
    const glassClass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

    return (
        <div className="font-sans text-gray-800 bg-white min-h-screen overflow-x-hidden selection:bg-[#1B6B3A]/20">
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <main className="max-w-7xl mx-auto">
                    {/* --- JUDUL HALAMAN --- */}
                    <div className="text-center mb-10 mt-10">
                        <span className="inline-block py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                            📅 JADWAL KEGIATAN
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Kalender <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#0a381d]">Agenda QLC</span>
                        </h1>
                    </div>

                    {/* --- KOTAK UTAMA (GLASSMORPHISM) --- */}
                    <div className={`${glassClass} rounded-[2.5rem] p-6 md:p-10`}>
                        {/* KONTROL NAVIGASI */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {MONTH_NAMES[month]} {year}
                            </h2>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={goToToday}
                                    className="px-6 py-2.5 text-sm bg-white border-2 border-transparent hover:border-[#D4A017] text-gray-700 hover:text-[#D4A017] font-bold rounded-full transition-all shadow-sm"
                                >
                                    Hari Ini
                                </button>
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2.5 bg-white border border-gray-100 hover:border-[#1B6B3A] hover:text-[#1B6B3A] text-gray-600 rounded-full transition-all shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2.5 bg-white border border-gray-100 hover:border-[#1B6B3A] hover:text-[#1B6B3A] text-gray-600 rounded-full transition-all shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* GRID KALENDER */}
                        <div className="bg-white/50 border border-gray-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                            {/* Header Hari */}
                            <div className="grid grid-cols-7 bg-white/60 border-b border-gray-200/60">
                                {DAYS_OF_WEEK_SHORT.map((day) => (
                                    <div key={day} className="py-4 text-center text-sm font-bold text-[#1B6B3A] uppercase tracking-wider border-r border-gray-200/60 last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Body Kalender */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map(({ day, isCurrentMonth, dateStr, isToday, events }, index) => (
                                    <div
                                        key={dateStr}
                                        className={`min-h-[120px] p-2 border-b border-gray-200/60 relative group transition-colors 
                                        ${(index + 1) % 7 !== 0 ? 'border-r' : ''} 
                                        ${isCurrentMonth ? 'bg-white/40 hover:bg-white/80' : 'bg-gray-50/30'}`}
                                    >
                                        {/* Nomor Tanggal */}
                                        <div className="flex justify-end mb-2">
                                            <span
                                                className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full transition-all
                                                ${
                                                    isToday
                                                        ? 'bg-[#D4A017] text-white shadow-md scale-110' // Warna kuning emas untuk hari ini
                                                        : isCurrentMonth
                                                          ? 'text-gray-700'
                                                          : 'text-gray-400'
                                                }`}
                                            >
                                                {day}
                                            </span>
                                        </div>

                                        {/* Daftar Agenda */}
                                        <div className="flex flex-col gap-1.5 w-full">
                                            {Array.isArray(events) &&
                                                events.map((event: CalendarEvent) => (
                                                    <div
                                                        key={event.id}
                                                        title={event.title}
                                                        className="bg-gradient-to-r from-[#1B6B3A] to-[#2D8A4E] text-white text-[11px] md:text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm truncate cursor-pointer hover:shadow-md hover:scale-[1.02] transition-transform"
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
