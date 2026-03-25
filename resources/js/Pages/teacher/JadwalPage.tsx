import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    ChevronLeft, ChevronRight, Clock, MapPin, Link as LinkIcon,
    Calendar, X, Eye, Plus, Pencil, Trash2, Loader2, CheckCircle2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Visibility = 'umum' | 'mitra' | 'keduanya';

type Agenda = {
    id:                string;
    user_id:           string | null;
    title:             string;
    event_date:        string; // YYYY-MM-DD
    description:       string;
    location:          string;
    registration_link: string;
    visibility:        Visibility;
};

interface FormState {
    title:             string;
    event_date:        string;
    description:       string;
    location:          string;
    registration_link: string;
    visibility:        Visibility;
}

const BASE = 'http://127.0.0.1:8000/api';

const MONTH_NAMES = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
];
const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const formatDisplay = (s: string) => {
    const [y, m, d] = s.split('-');
    return `${d} ${MONTH_NAMES[parseInt(m)-1]} ${y}`;
};

const emptyForm = (date = ''): FormState => ({
    title: '', event_date: date, description: '',
    location: '', registration_link: '', visibility: 'umum',
});

/* ── Visibility config ── */
const VIS_LABEL: Record<Visibility, string> = {
    umum:     'Umum',
    mitra:    'Mitra',
    keduanya: 'Umum & Mitra',
};
const VIS_CLASS: Record<Visibility, string> = {
    umum:     'bg-blue-50 border-blue-100 text-blue-700',
    mitra:    'bg-purple-50 border-purple-100 text-purple-700',
    keduanya: 'bg-teal-50 border-teal-100 text-teal-700',
};
const VIS_EVENT_CLASS: Record<Visibility, string> = {
    umum:     'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100',
    mitra:    'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100',
    keduanya: 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100',
};

function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[900] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-xl
            ${type === 'ok' ? 'bg-blue-600' : 'bg-red-500'}`}>
            {type === 'ok' ? <CheckCircle2 size={15}/> : <X size={15}/>}
            {msg}
        </div>
    );
}

function AgendaModal({ init, onClose, onSave }: {
    init:    FormState & { id?: string };
    onClose: () => void;
    onSave:  (f: FormState) => Promise<void>;
}) {
    const [f, setF]       = useState<FormState>(init);
    const [e, setE]       = useState<Partial<Record<keyof FormState, string>>>({});
    const [busy, setBusy] = useState(false);
    const isEdit = Boolean(init.id);

    const upd = (k: keyof FormState) =>
        (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setF(p => ({ ...p, [k]: ev.target.value }));
            setE(p => ({ ...p, [k]: '' }));
        };

    const validate = (): boolean => {
        const err: typeof e = {};
        if (!f.title.trim()) err.title = 'Judul wajib diisi.';
        if (!f.event_date)   err.event_date = 'Tanggal wajib diisi.';
        if (f.registration_link && !/^https?:\/\/.+/.test(f.registration_link))
            err.registration_link = 'URL tidak valid (harus diawali http/https).';
        setE(err);
        return !Object.keys(err).length;
    };

    const submit = async () => {
        if (!validate()) return;
        setBusy(true);
        try { await onSave(f); } finally { setBusy(false); }
    };

    return (
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={ev => ev.target === ev.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 my-auto">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold text-gray-900">
                            {isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}
                        </span>
                        {f.event_date && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {formatDisplay(f.event_date)}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                        <X size={14}/>
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Judul Jadwal
                        </label>
                        <input
                            className={`w-full h-10 px-3 rounded-xl text-sm border outline-none transition
                                ${e.title
                                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'}`}
                            placeholder="Contoh: Rapat Koordinasi Guru"
                            value={f.title}
                            onChange={upd('title')}
                        />
                        {e.title && <span className="text-xs text-red-500 font-semibold">{e.title}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Tanggal
                        </label>
                        <input type="date"
                            className={`w-full h-10 px-3 rounded-xl text-sm border outline-none transition
                                ${e.event_date
                                    ? 'border-red-400'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'}`}
                            value={f.event_date}
                            onChange={upd('event_date')}
                        />
                        {e.event_date && <span className="text-xs text-red-500 font-semibold">{e.event_date}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Lokasi <span className="normal-case font-normal">(opsional)</span>
                        </label>
                        <input
                            className="w-full h-10 px-3 rounded-xl text-sm border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                            placeholder="Contoh: Ruang Rapat / Zoom"
                            value={f.location}
                            onChange={upd('location')}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Deskripsi <span className="normal-case font-normal">(opsional)</span>
                        </label>
                        <textarea rows={3}
                            className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition resize-none"
                            placeholder="Keterangan tambahan..."
                            value={f.description}
                            onChange={upd('description')}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Link Pendaftaran <span className="normal-case font-normal">(opsional)</span>
                        </label>
                        <input
                            className={`w-full h-10 px-3 rounded-xl text-sm border outline-none transition
                                ${e.registration_link
                                    ? 'border-red-400'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'}`}
                            placeholder="https://forms.gle/..."
                            value={f.registration_link}
                            onChange={upd('registration_link')}
                        />
                        {e.registration_link && <span className="text-xs text-red-500 font-semibold">{e.registration_link}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                            Tampilkan Untuk
                        </label>
                        <div className="flex gap-2">
                            {(['umum','mitra','keduanya'] as Visibility[]).map(v => (
                                <button key={v}
                                    onClick={() => setF(p => ({ ...p, visibility: v }))}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition
                                        ${f.visibility === v
                                            ? VIS_CLASS[v] + ' shadow-sm'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                    {VIS_LABEL[v]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-6 pb-5 pt-2 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-4 h-9 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                        Batal
                    </button>
                    <button onClick={submit} disabled={busy}
                        className="px-5 h-9 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition">
                        {busy
                            ? <><Loader2 size={13} className="animate-spin"/> Menyimpan...</>
                            : <><CheckCircle2 size={13}/> {isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteModal({ agenda, onClose, onConfirm }: {
    agenda:    Agenda;
    onClose:   () => void;
    onConfirm: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);

    const go = async () => {
        setBusy(true);
        try { await onConfirm(); } finally { setBusy(false); }
    };

    return (
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={ev => ev.target === ev.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
                <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                        <Trash2 size={26}/>
                    </div>
                    <div className="text-base font-extrabold text-gray-900">Hapus Jadwal?</div>
                    <div className="text-sm text-gray-500 leading-relaxed">
                        <b>"{agenda.title}"</b> pada {formatDisplay(agenda.event_date)} akan dihapus permanen.
                    </div>
                </div>
                <div className="flex gap-2 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 h-10 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                        Batal
                    </button>
                    <button onClick={go} disabled={busy}
                        className="flex-1 h-10 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                        {busy
                            ? <><Loader2 size={13} className="animate-spin"/> Menghapus...</>
                            : <><Trash2 size={13}/> Hapus</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailModal({ agenda, canEdit, onClose, onEdit, onDelete }: {
    agenda:   Agenda;
    canEdit:  boolean;
    onClose:  () => void;
    onEdit:   () => void;
    onDelete: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)' }}
            onClick={ev => ev.target === ev.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {formatDisplay(agenda.event_date)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${VIS_CLASS[agenda.visibility]}`}>
                                <Eye size={10}/> {VIS_LABEL[agenda.visibility]}
                            </span>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 leading-tight">{agenda.title}</h3>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
                        <X size={14} className="text-gray-500"/>
                    </button>
                </div>

                <div className="px-6 py-4 flex flex-col gap-3">
                    {agenda.location && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin size={15} className="text-blue-500 shrink-0 mt-0.5"/>
                            <span>{agenda.location}</span>
                        </div>
                    )}
                    {agenda.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{agenda.description}</p>
                    )}
                    {agenda.registration_link && (
                        <a href={agenda.registration_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                            <LinkIcon size={14}/> Daftar / Info Selengkapnya
                        </a>
                    )}
                    {!canEdit && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400 font-semibold mt-1">
                            <Eye size={13}/> Dibuat oleh admin — hanya bisa dilihat
                        </div>
                    )}
                </div>

                <div className={`px-6 pb-5 flex gap-2 ${canEdit ? 'justify-between' : 'justify-end'}`}>
                    {canEdit && (
                        <div className="flex gap-2">
                            <button onClick={() => { onClose(); onEdit(); }}
                                className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition">
                                <Pencil size={13}/> Edit
                            </button>
                            <button onClick={() => { onClose(); onDelete(); }}
                                className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition">
                                <Trash2 size={13}/> Hapus
                            </button>
                        </div>
                    )}
                    <button onClick={onClose}
                        className="px-4 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function JadwalPage() {
    const authUser = usePage<PageProps>().props.auth.user as any;
    const myUserId: string | null = authUser?._id ?? null;

    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const [agendas,  setAgendas]  = useState<Agenda[]>([]);
    const [upcoming, setUpcoming] = useState<Agenda[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [selDate,  setSelDate]  = useState<string>(formatDate(today));

    const [addModal,  setAddModal]  = useState<FormState | null>(null);
    const [editModal, setEditModal] = useState<(FormState & { id: string }) | null>(null);
    const [delModal,  setDelModal]  = useState<Agenda | null>(null);
    const [detModal,  setDetModal]  = useState<Agenda | null>(null);
    const [toast,     setToast]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') =>
        setToast({ msg, type }), []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [mRes, uRes] = await Promise.all([
                fetch(`${BASE}/agenda?year=${year}&month=${month+1}`),
                fetch(`${BASE}/agenda/upcoming?limit=3`),
            ]);
            const [mData, uData] = await Promise.all([mRes.json(), uRes.json()]);
            if (mData.success) setAgendas(mData.data);
            if (uData.success) setUpcoming(uData.data);
        } catch {
            showToast('Gagal memuat agenda.', 'err');
        } finally {
            setLoading(false);
        }
    }, [year, month, showToast]);

    useEffect(() => { load(); }, [load]);

    const prevMonth = () => {
        if (month === 0) { setYear(y => y-1); setMonth(11); }
        else setMonth(m => m-1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y+1); setMonth(0); }
        else setMonth(m => m+1);
    };
    const goToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setSelDate(formatDate(today));
    };

    const calendarDays = useMemo(() => {
        const firstDOW    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();
        const prevDays    = new Date(year, month, 0).getDate();
        const todayStr    = formatDate(today);

        const eventsMap = new Map<string, Agenda[]>();
        agendas.forEach(a => {
            const k = a.event_date.substring(0, 10);
            if (!eventsMap.has(k)) eventsMap.set(k, []);
            eventsMap.get(k)!.push(a);
        });

        const days = [];

        for (let i = firstDOW-1; i >= 0; i--) {
            const d  = prevDays - i;
            const m2 = month === 0 ? 11 : month-1;
            const y2 = month === 0 ? year-1 : year;
            const ds = formatDate(new Date(y2, m2, d));
            days.push({ day:d, isCurrentMonth:false, isToday:false, dateStr:ds, events: eventsMap.get(ds)??[] });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const ds = formatDate(new Date(year, month, i));
            days.push({ day:i, isCurrentMonth:true, isToday: ds===todayStr, dateStr:ds, events: eventsMap.get(ds)??[] });
        }
        const rem = 42 - days.length;
        for (let i = 1; i <= rem; i++) {
            const m2 = month === 11 ? 0 : month+1;
            const y2 = month === 11 ? year+1 : year;
            const ds = formatDate(new Date(y2, m2, i));
            days.push({ day:i, isCurrentMonth:false, isToday:false, dateStr:ds, events: eventsMap.get(ds)??[] });
        }

        return days;
    }, [year, month, agendas]);

    const selAgendas = agendas.filter(a => a.event_date.substring(0,10) === selDate);

    const canEdit = (a: Agenda) =>
        myUserId !== null && a.user_id !== null && a.user_id === myUserId;

    const handleAdd = async (f: FormState) => {
        const res  = await fetch(`${BASE}/agenda`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(f),
        });
        const data = await res.json();
        if (data.success) {
            showToast('Jadwal berhasil ditambahkan.');
            setAddModal(null);
            load();
        } else {
            showToast(data.message ?? 'Gagal menyimpan.', 'err');
        }
    };

    const handleEdit = async (f: FormState) => {
        const res  = await fetch(`${BASE}/agenda/${editModal!.id}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(f),
        });
        const data = await res.json();
        if (data.success) {
            showToast('Jadwal berhasil diperbarui.');
            setEditModal(null);
            load();
        } else {
            showToast(data.message ?? 'Gagal memperbarui.', 'err');
        }
    };

    const handleDelete = async () => {
        const res  = await fetch(`${BASE}/agenda/${delModal!.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Jadwal berhasil dihapus.');
            setDelModal(null);
            load();
        } else {
            showToast(data.message ?? 'Gagal menghapus.', 'err');
        }
    };

    const openEdit = (a: Agenda) => setEditModal({
        id: a.id, title: a.title, event_date: a.event_date,
        description: a.description, location: a.location,
        registration_link: a.registration_link, visibility: a.visibility,
    });

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Jadwal & Agenda</h1>
                <p className="text-gray-500 mt-1.5 text-sm">
                    Pantau seluruh jadwal kegiatan dan tambahkan jadwal baru.
                </p>
            </div>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {(Object.entries(VIS_LABEL) as [Visibility, string][]).map(([k, v]) => (
                    <div key={k}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${VIS_CLASS[k]}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-70"/>
                        {v}
                    </div>
                ))}
                <span className="ml-auto text-xs text-gray-400 font-medium hidden sm:block">
                    Klik tanggal untuk tambah · Klik agenda untuk detail
                </span>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="text-blue-600" size={22}/>
                            {MONTH_NAMES[month]} {year}
                        </h2>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button onClick={goToday}
                                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mr-1">
                                Hari Ini
                            </button>
                            <button onClick={prevMonth}
                                className="p-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors">
                                <ChevronLeft size={20}/>
                            </button>
                            <button onClick={nextMonth}
                                className="p-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors">
                                <ChevronRight size={20}/>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 p-4">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                {DAYS_SHORT.map(d => (
                                    <div key={d}
                                        className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"/>
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 flex-1">
                                    {calendarDays.map((cell, idx) => {
                                        const isSel = cell.dateStr === selDate;
                                        return (
                                            <div key={idx}
                                                onClick={() => {
                                                    setSelDate(cell.dateStr);
                                                    setAddModal(emptyForm(cell.dateStr));
                                                }}
                                                className={`p-2 border-b border-gray-100 relative min-h-[110px] cursor-pointer transition-colors
                                                    ${(idx+1) % 7 !== 0 ? 'border-r' : ''}
                                                    ${isSel && !cell.isToday ? 'bg-blue-50/50 ring-inset ring-2 ring-blue-200' : ''}
                                                    ${cell.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/70'}`}
                                            >
                                                <div className="flex justify-end mb-1.5">
                                                    <span className={`flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full
                                                        ${cell.isToday
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                                                        {cell.day}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    {cell.events.slice(0, 2).map(a => (
                                                        <div key={a.id}
                                                            onClick={ev => { ev.stopPropagation(); setDetModal(a); }}
                                                            className={`px-1.5 py-1 border rounded text-[10.5px] font-bold leading-tight truncate cursor-pointer transition-colors
                                                                ${VIS_EVENT_CLASS[a.visibility]}`}>
                                                            {a.title}
                                                        </div>
                                                    ))}
                                                    {cell.events.length > 2 && (
                                                        <span className="text-[9.5px] font-bold text-gray-400 px-1">
                                                            +{cell.events.length-2} lagi
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Plus size={11}/> Klik tanggal untuk menambah jadwal baru
                    </div>
                </div>

                <div className="w-full xl:w-96 shrink-0 flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">
                                    {selDate ? formatDisplay(selDate) : 'Pilih Tanggal'}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {selAgendas.length
                                        ? `${selAgendas.length} agenda`
                                        : 'Tidak ada agenda'}
                                </div>
                            </div>
                            <button
                                onClick={() => setAddModal(emptyForm(selDate))}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm">
                                <Plus size={12}/> Tambah
                            </button>
                        </div>

                        {selAgendas.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400 font-medium">
                                <Calendar size={28} className="mx-auto mb-2 opacity-30"/>
                                Tidak ada agenda.<br/>Klik tanggal untuk menambah.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                {selAgendas.map(a => (
                                    <div key={a.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="text-sm font-bold text-gray-900 leading-snug">{a.title}</div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${VIS_CLASS[a.visibility]}`}>
                                                {VIS_LABEL[a.visibility]}
                                            </span>
                                        </div>
                                        {a.location && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                                <MapPin size={11} className="text-gray-400"/>
                                                {a.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            {canEdit(a) ? (
                                                <>
                                                    <button onClick={() => openEdit(a)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition">
                                                        <Pencil size={11}/> Edit
                                                    </button>
                                                    <button onClick={() => setDelModal(a)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition">
                                                        <Trash2 size={11}/> Hapus
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10.5px] text-gray-400 font-semibold">
                                                    <Eye size={11}/> Dibuat admin
                                                </span>
                                            )}
                                            <button onClick={() => setDetModal(a)}
                                                className="ml-auto text-xs text-gray-400 hover:text-gray-600 font-semibold transition">
                                                Detail →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Clock size={18}/>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Agenda Terdekat</div>
                                <div className="text-xs text-gray-400">Mulai hari ini</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"/>
                                </div>
                            ) : upcoming.length > 0 ? (
                                upcoming.map(evt => {
                                    const [y, m, d] = evt.event_date.split('-');
                                    return (
                                        <div key={evt.id}
                                            onClick={() => setDetModal(evt)}
                                            className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition cursor-pointer">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <div className="text-sm font-bold text-gray-900 pr-2 leading-snug">{evt.title}</div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded shrink-0">
                                                    {d} {MONTH_NAMES[parseInt(m)-1].substring(0,3)}
                                                </span>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${VIS_CLASS[evt.visibility]}`}>
                                                <Eye size={9}/> {VIS_LABEL[evt.visibility]}
                                            </span>
                                            {evt.location && (
                                                <div className="flex items-center text-xs text-gray-500 font-medium mt-1">
                                                    <MapPin size={11} className="mr-1.5 text-gray-400 shrink-0"/>
                                                    <span className="truncate">{evt.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-400">
                                    Tidak ada agenda terdekat.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            {addModal && (
                <AgendaModal
                    init={addModal!}
                    onClose={() => setAddModal(null)}
                    onSave={handleAdd}
                />
            )}
            {editModal && (
                <AgendaModal
                    init={editModal!}
                    onClose={() => setEditModal(null)}
                    onSave={handleEdit}
                />
            )}
            {delModal && (
                <DeleteModal
                    agenda={delModal!}
                    onClose={() => setDelModal(null)}
                    onConfirm={handleDelete}
                />
            )}
            {detModal && (
                <DetailModal
                    agenda={detModal!}
                    canEdit={canEdit(detModal!)}
                    onClose={() => setDetModal(null)}
                    onEdit={() => { setDetModal(null); openEdit(detModal!); }}
                    onDelete={() => { setDetModal(null); setDelModal(detModal!); }}
                />
            )}
            {toast && (
                <Toast msg={toast!.msg} type={toast!.type} onClose={() => setToast(null)}/>
            )}
        </div>
    );
}