import { useState, useEffect, useMemo } from 'react';
import TeacherNavbar from '../../Components/TeacherNavbar';
import { ChevronLeft, ChevronRight, Clock, MapPin, Link as LinkIcon, Calendar, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Agenda = {
    id: string;
    title: string;
    event_date: string; // YYYY-MM-DD
    description: string;
    location: string;
    registration_link: string;
    visibility: 'umum' | 'mitra' | 'keduanya';
};

const BASE = 'http://127.0.0.1:8000/api';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════════════════ */
function DetailModal({ agenda, onClose }: { agenda: Agenda; onClose: () => void }) {
    const [y, m, d] = agenda.event_date.split('-');
    const displayDate = `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 mb-2">{displayDate}</span>
                        <h3 className="text-base font-extrabold text-gray-900 leading-tight">{agenda.title}</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
                        <X size={14} className="text-gray-500" />
                    </button>
                </div>
                <div className="px-6 py-4 flex flex-col gap-3">
                    {agenda.location && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin size={15} className="text-green-600 shrink-0 mt-0.5" />
                            <span>{agenda.location}</span>
                        </div>
                    )}
                    {agenda.description && <p className="text-sm text-gray-600 leading-relaxed">{agenda.description}</p>}
                    {agenda.registration_link && (
                        <a href={agenda.registration_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-green-600 hover:underline">
                            <LinkIcon size={14} /> Daftar / Info Selengkapnya
                        </a>
                    )}
                </div>
                <div className="px-6 pb-5">
                    <button onClick={onClose} className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors">
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
export default function JadwalMitra() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [upcoming, setUpcoming] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Agenda | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    /* ── Fetch agenda (visibility=mitra = mitra + keduanya) ── */
    useEffect(() => {
        setLoading(true);
        Promise.all([fetch(`${BASE}/agenda?year=${year}&month=${month + 1}&visibility=mitra`).then((r) => r.json()), fetch(`${BASE}/agenda/upcoming?visibility=mitra&limit=3`).then((r) => r.json())])
            .then(([monthData, upcomingData]) => {
                if (monthData.success) setAgendas(monthData.data);
                if (upcomingData.success) setUpcoming(upcomingData.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [year, month]);

    /* ── Navigation ── */
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    /* ── Build calendar grid ── */
    const calendarDays = useMemo(() => {
        const firstDOW = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();
        const todayStr = formatDate(today);

        const eventsMap = new Map<string, Agenda[]>();
        agendas.forEach((a) => {
            const k = a.event_date.substring(0, 10);
            if (!eventsMap.has(k)) eventsMap.set(k, []);
            eventsMap.get(k)!.push(a);
        });

        const days = [];

        for (let i = firstDOW - 1; i >= 0; i--) {
            const d = prevDays - i;
            const ds = formatDate(new Date(year, month - 1, d));
            days.push({ day: d, isCurrentMonth: false, isToday: false, dateStr: ds, events: eventsMap.get(ds) ?? [] });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const ds = formatDate(new Date(year, month, i));
            days.push({ day: i, isCurrentMonth: true, isToday: ds === todayStr, dateStr: ds, events: eventsMap.get(ds) ?? [] });
        }

        const rem = 42 - days.length; // 6 rows × 7
        for (let i = 1; i <= rem; i++) {
            const ds = formatDate(new Date(year, month + 1, i));
            days.push({ day: i, isCurrentMonth: false, isToday: false, dateStr: ds, events: eventsMap.get(ds) ?? [] });
        }

        return days;
    }, [year, month, agendas]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <TeacherNavbar activePage="jadwal"  />

            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Jadwal & Agenda</h1>
                    <p className="text-gray-500 mt-2">Pantau kalender kegiatan pendampingan, supervisi, dan event kerjasama bersama QLC.</p>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* ── Kalender ── */}
                    <div className="w-full xl:flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                        {/* Header kalender */}
                        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="text-green-600" size={24} />
                                {MONTH_NAMES[month]} {year}
                            </h2>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button onClick={goToday} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mr-2">
                                    Bulan Ini
                                </button>
                                <button onClick={prevMonth} className="p-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-green-600 rounded-lg transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextMonth} className="p-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-green-600 rounded-lg transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 bg-gray-50 p-4">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                                {/* Day labels */}
                                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                    {DAYS_SHORT.map((d) => (
                                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="w-7 h-7 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-7 flex-1">
                                        {calendarDays.map((cell, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-2 border-b border-gray-100 relative transition-colors min-h-[120px]
                                                ${(idx + 1) % 7 !== 0 ? 'border-r' : ''}
                                                ${cell.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}`}
                                            >
                                                {/* Date number */}
                                                <div className="flex justify-end mb-2">
                                                    <span
                                                        className={`flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full transition-all
                                                        ${cell.isToday ? 'bg-green-600 text-white shadow-md' : cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}
                                                    >
                                                        {cell.day}
                                                    </span>
                                                </div>

                                                {/* Events */}
                                                <div className="flex flex-col gap-1.5">
                                                    {cell.events.map((a) => (
                                                        <div
                                                            key={a.id}
                                                            onClick={() => setSelected(a)}
                                                            className="px-2 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded text-xs font-bold leading-tight truncate cursor-pointer hover:bg-green-100 transition-colors"
                                                        >
                                                            {a.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Side panel: Agenda Terdekat ── */}
                    <div className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Agenda Terdekat</h2>
                                    <p className="text-xs text-gray-500 font-medium">Mulai hari ini</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-6 h-6 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                                    </div>
                                ) : upcoming.length > 0 ? (
                                    upcoming.map((evt) => {
                                        const [y, m, d] = evt.event_date.split('-');
                                        return (
                                            <div
                                                key={evt.id}
                                                onClick={() => setSelected(evt)}
                                                className="p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="text-sm font-bold text-gray-900 pr-2">{evt.title}</div>
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded shrink-0">
                                                        {d} {MONTH_NAMES[parseInt(m) - 1].substring(0, 3)}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {evt.location && (
                                                        <div className="flex items-center text-xs text-gray-500 font-medium">
                                                            <MapPin size={13} className="mr-2 text-gray-400 shrink-0" />
                                                            <span className="truncate">{evt.location}</span>
                                                        </div>
                                                    )}
                                                    {evt.registration_link && (
                                                        <div className="flex items-center text-xs text-green-600 font-medium">
                                                            <LinkIcon size={13} className="mr-2 shrink-0" />
                                                            <span>Ada link pendaftaran</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 text-sm text-gray-500">Tidak ada agenda terdekat.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selected && <DetailModal agenda={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
