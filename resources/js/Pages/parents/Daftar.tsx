import { useState, useRef, useEffect, FormEvent } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    BookOpen, ChevronRight, ChevronLeft, CheckCircle2,
    User, Calendar, Upload, CreditCard, X,
    AlertCircle, BookCheck, Clock, Users, ArrowLeft,
    MessageCircle, PartyPopper
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface Program {
    id: string;
    name: string;
    description: string;
    target_audience: string;
    duration: string;
    image_url: string | null;
}

interface Props {
    programs: Program[];
    flash: {
        success: boolean | null;
        nama: string | null;
        program_id: string | null;
    };
}

interface EnrollForm {
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    usia: string;
    program_id: string;
    bukti_pembayaran: File | null;
    [key: string]: string | File | null;
}

// ── Constants ─────────────────────────────────────────────────
const ADMIN_WA = '6281285723834'; // ← Ganti dengan nomor WA admin QLC
const BANK_INFO = {
    bank: 'Bank Syariah Indonesia (BSI)',
    norek: '7123456789',
    atas_nama: 'Yayasan Pejuang Quran',
    nominal: 'Sesuai program yang dipilih',
};

const STEPS = [
    { id: 1, label: 'Pilih Program', icon: BookCheck    },
    { id: 2, label: 'Data Anak',     icon: User         },
    { id: 3, label: 'Pembayaran',    icon: CreditCard   },
    { id: 4, label: 'Konfirmasi',    icon: CheckCircle2 },
];

// ── Component ─────────────────────────────────────────────────
export default function Daftar({ programs, flash }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };

    const [step, setStep]               = useState(1);
    const [submitted, setSubmitted]     = useState(false);
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [fileType, setFileType]       = useState<string>('');
    const fileInputRef                  = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<EnrollForm>({
        nama:             '',
        tempat_lahir:     '',
        tanggal_lahir:    '',
        usia:             '',
        program_id:       '',
        bukti_pembayaran: null,
    });

    const selectedProgram = programs.find(p => p.id === data.program_id);

    // Deteksi flash sukses dari Laravel setelah submit
    useEffect(() => {
        if (flash?.success) {
            setSubmitted(true);

            // Buka WA otomatis
            const programName = programs.find(p => p.id === flash.program_id)?.name ?? '-';
            const pesan = encodeURIComponent(
                `Assalamu'alaikum Admin QLC 🌟\n\n` +
                `Saya *${auth.user.name}* ingin mengonfirmasi pendaftaran anak saya:\n\n` +
                `👤 *Nama Anak:* ${flash.nama}\n` +
                `📚 *Program:* ${programName}\n\n` +
                `Bukti pembayaran sudah saya kirimkan melalui sistem.\n\n` +
                `Mohon konfirmasinya. Terima kasih 🙏`
            );
            window.open(`https://wa.me/${ADMIN_WA}?text=${pesan}`, '_blank');
        }
    }, [flash?.success]);

    const canNext = (): boolean => {
        if (step === 1) return !!data.program_id;
        if (step === 2) return !!(data.nama && data.tempat_lahir && data.tanggal_lahir && data.usia);
        if (step === 3) return !!data.bukti_pembayaran;
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('bukti_pembayaran', file);
        setFileType(file.type);
        if (file.type.startsWith('image/')) {
            setPreviewFile(URL.createObjectURL(file));
        } else {
            setPreviewFile(null);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('parents.daftar.store'), { forceFormData: true });
    };

    // ════ TAMPILAN SUKSES ════
    if (submitted) {
        const programName = programs.find(p => p.id === flash.program_id)?.name ?? '-';
        const pesan = encodeURIComponent(
            `Assalamu'alaikum Admin QLC 🌟\n\n` +
            `Saya *${auth.user.name}* ingin mengonfirmasi pendaftaran anak saya:\n\n` +
            `👤 *Nama Anak:* ${flash.nama}\n` +
            `📚 *Program:* ${programName}\n\n` +
            `Bukti pembayaran sudah saya kirimkan melalui sistem.\n\n` +
            `Mohon konfirmasinya. Terima kasih 🙏`
        );

        return (
            <>
                <Head title="Pendaftaran Berhasil" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">

                        {/* Icon sukses */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Data pendaftaran <strong>{flash.nama}</strong> untuk program <strong>{programName}</strong> sudah kami terima dan sedang diproses.
                        </p>

                        {/* Info status */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left mb-6">
                            <div className="text-xs font-bold text-yellow-800 mb-2">📋 Status Pendaftaran</div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">Menunggu Konfirmasi</span>
                            </div>
                        </div>

                        {/* Tombol WA */}
                        <a
                            href={`https://wa.me/${ADMIN_WA}?text=${pesan}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 mb-3"
                        >
                            <MessageCircle size={16} /> Konfirmasi via WhatsApp
                        </a>

                        <button
                            onClick={() => router.visit(route('parents.dashboard'))}
                            className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-bold transition-all"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ════ TAMPILAN FORM ════
    return (
        <>
            <Head title="Pendaftaran QLC" />
            <div className="min-h-screen bg-gray-50 font-sans">

                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.visit(route('parents.dashboard'))}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali ke Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center">
                            <BookOpen size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">Pendaftaran QLC</span>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-10">

                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-10 relative">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-green-600 z-0 transition-all duration-500"
                            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map(s => (
                            <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    step > s.id  ? 'bg-green-600 border-green-600 text-white' :
                                    step === s.id ? 'bg-white border-green-600 text-green-600' :
                                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={16} strokeWidth={2} />}
                                </div>
                                <span className={`text-xs font-bold hidden sm:block ${step >= s.id ? 'text-green-700' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Step header */}
                        <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                            <div className="text-xs font-bold text-green-300 uppercase tracking-wider mb-1">
                                Langkah {step} dari {STEPS.length}
                            </div>
                            <h1 className="text-xl font-black text-white">{STEPS[step - 1].label}</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">

                                {/* ── STEP 1: Pilih Program ── */}
                                {step === 1 && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-500 font-medium mb-4">
                                            Pilih program QLC yang ingin Anda daftarkan untuk anak Anda.
                                        </p>
                                        {programs.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400">
                                                <BookCheck size={40} className="mx-auto mb-3 opacity-40" />
                                                <p className="font-semibold">Belum ada program tersedia</p>
                                            </div>
                                        ) : programs.map(p => (
                                            <label key={p.id} className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                data.program_id === p.id
                                                    ? 'border-green-600 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="program_id"
                                                    value={p.id}
                                                    checked={data.program_id === p.id}
                                                    onChange={() => setData('program_id', p.id)}
                                                    className="mt-1 accent-green-600 flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                                                    {p.description && (
                                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.description}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        {p.target_audience && (
                                                            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                                <Users size={12} /> {p.target_audience}
                                                            </span>
                                                        )}
                                                        {p.duration && (
                                                            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                                <Clock size={12} /> {p.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {data.program_id === p.id && (
                                                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                                )}
                                            </label>
                                        ))}
                                        {errors.program_id && (
                                            <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.program_id}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ── STEP 2: Data Anak ── */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 font-medium">
                                            Isi data anak yang akan didaftarkan sesuai dokumen resmi.
                                        </p>

                                        {[
                                            { key: 'nama',         label: 'Nama Lengkap Anak', type: 'text',   placeholder: 'Masukkan nama lengkap' },
                                            { key: 'tempat_lahir', label: 'Tempat Lahir',       type: 'text',   placeholder: 'Contoh: Jakarta' },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                    {f.label} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type={f.type}
                                                    value={data[f.key] as string}
                                                    onChange={e => setData(f.key, e.target.value)}
                                                    placeholder={f.placeholder}
                                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${errors[f.key] ? 'border-red-400' : 'border-gray-200'}`}
                                                />
                                                {errors[f.key] && (
                                                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                        <AlertCircle size={11} /> {errors[f.key]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                    Tanggal Lahir <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.tanggal_lahir}
                                                    onChange={e => {
                                                        setData('tanggal_lahir', e.target.value);
                                                        if (e.target.value) {
                                                            const age = Math.floor(
                                                                (Date.now() - new Date(e.target.value).getTime()) /
                                                                (1000 * 60 * 60 * 24 * 365.25)
                                                            );
                                                            setData('usia', String(age));
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${errors.tanggal_lahir ? 'border-red-400' : 'border-gray-200'}`}
                                                />
                                                {errors.tanggal_lahir && <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={11} />{errors.tanggal_lahir}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                    Usia <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.usia}
                                                    onChange={e => setData('usia', e.target.value)}
                                                    placeholder="Tahun"
                                                    min={1} max={30}
                                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${errors.usia ? 'border-red-400' : 'border-gray-200'}`}
                                                />
                                                {errors.usia && <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={11} />{errors.usia}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 3: Pembayaran ── */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <div className="text-sm font-black text-green-800 mb-3 flex items-center gap-2">
                                                <CreditCard size={16} /> Informasi Pembayaran
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                {[
                                                    { l: 'Bank',        v: BANK_INFO.bank },
                                                    { l: 'No. Rekening',v: BANK_INFO.norek },
                                                    { l: 'Atas Nama',   v: BANK_INFO.atas_nama },
                                                    { l: 'Nominal',     v: BANK_INFO.nominal },
                                                ].map(r => (
                                                    <div key={r.l} className="flex justify-between">
                                                        <span className="text-gray-500 font-medium">{r.l}</span>
                                                        <span className="font-bold text-gray-800 font-mono text-right">{r.v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Upload Bukti Pembayaran <span className="text-red-500">*</span>
                                            </label>
                                            <p className="text-xs text-gray-400 mb-3">Format: JPG, PNG, atau PDF. Maks. 5MB.</p>

                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                                    data.bukti_pembayaran
                                                        ? 'border-green-400 bg-green-50'
                                                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                                                }`}
                                            >
                                                {data.bukti_pembayaran ? (
                                                    <div className="space-y-2">
                                                        {previewFile && fileType.startsWith('image/') ? (
                                                            <img src={previewFile} alt="preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto flex items-center justify-center">
                                                                <CheckCircle2 size={24} className="text-green-600" />
                                                            </div>
                                                        )}
                                                        <p className="text-sm font-bold text-green-700">{(data.bukti_pembayaran as File).name}</p>
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.stopPropagation(); setData('bukti_pembayaran', null); setPreviewFile(null); }}
                                                            className="text-xs text-red-500 font-semibold flex items-center gap-1 mx-auto hover:text-red-700"
                                                        >
                                                            <X size={12} /> Hapus file
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                                                            <Upload size={22} className="text-gray-400" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-600">Klik untuk unggah file</p>
                                                        <p className="text-xs text-gray-400">JPG, PNG, PDF hingga 5MB</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                                            {errors.bukti_pembayaran && (
                                                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={11} /> {errors.bukti_pembayaran}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 4: Konfirmasi ── */}
                                {step === 4 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 font-medium">
                                            Periksa kembali data sebelum mengirim.
                                        </p>
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                                            {[
                                                { label: 'Program',       value: selectedProgram?.name ?? '-' },
                                                { label: 'Nama Anak',     value: data.nama },
                                                { label: 'Tempat Lahir',  value: data.tempat_lahir },
                                                { label: 'Tanggal Lahir', value: data.tanggal_lahir },
                                                { label: 'Usia',          value: `${data.usia} tahun` },
                                                { label: 'Bukti Bayar',   value: data.bukti_pembayaran ? (data.bukti_pembayaran as File).name : '-' },
                                                { label: 'Pendaftar',     value: auth.user.name },
                                            ].map(row => (
                                                <div key={row.label} className="flex justify-between items-center px-4 py-3 text-sm">
                                                    <span className="text-gray-500 font-medium">{row.label}</span>
                                                    <span className="font-bold text-gray-800 text-right max-w-[60%] truncate">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 font-medium leading-relaxed">
                                            ⚠️ Setelah submit, Anda akan diarahkan ke WhatsApp untuk konfirmasi kepada admin QLC.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation buttons */}
                            <div className="px-6 pb-6 flex justify-between gap-3">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(s => s - 1)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 transition-all"
                                    >
                                        <ChevronLeft size={16} /> Kembali
                                    </button>
                                ) : <div />}

                                {step < STEPS.length ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(s => s + 1)}
                                        disabled={!canNext()}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-green-600/20"
                                    >
                                        Lanjut <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-all shadow-md shadow-green-600/20"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Mengirim…
                                            </>
                                        ) : (
                                            <><CheckCircle2 size={16} /> Kirim & Konfirmasi via WA</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}