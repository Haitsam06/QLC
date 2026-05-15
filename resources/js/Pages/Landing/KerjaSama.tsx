import { useState, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Building2,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Handshake,
    MessageCircle,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';

const ADMIN_WA = '6281285723834';

const STEPS = [
    { id: 1, label: 'Data Mitra', icon: Building2 },
    { id: 2, label: 'Detail Kerja Sama', icon: Handshake },
    { id: 3, label: 'Konfirmasi', icon: CheckCircle2 },
];

const JENIS_LEMBAGA = [
    'Sekolah / Pesantren',
    'Yayasan / NGO',
    'Perusahaan',
    'Organisasi Keagamaan',
    'Komunitas / Forum',
    'Lainnya',
];

const JENIS_KERJASAMA = [
    'Program Quran Terintegrasi',
    'Sponsorship / Donasi',
    'Pelatihan Guru / SDM',
    'Kegiatan Bersama',
    'Lainnya',
];

interface FormData {
    nama_lembaga: string;
    jenis_lembaga: string;
    nama_pic: string;
    no_wa: string;
    email: string;
    jenis_kerjasama: string;
    pesan: string;
}

export default function KerjaSama() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState<FormData>({
        nama_lembaga: '',
        jenis_lembaga: '',
        nama_pic: '',
        no_wa: '',
        email: '',
        jenis_kerjasama: '',
        pesan: '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const set = (key: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate1 = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.nama_lembaga.trim()) errs.nama_lembaga = 'Nama lembaga wajib diisi';
        if (!form.jenis_lembaga) errs.jenis_lembaga = 'Jenis lembaga wajib dipilih';
        if (!form.nama_pic.trim()) errs.nama_pic = 'Nama PIC wajib diisi';
        if (!form.no_wa.trim()) errs.no_wa = 'No. WhatsApp wajib diisi';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validate2 = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.jenis_kerjasama) errs.jenis_kerjasama = 'Jenis kerja sama wajib dipilih';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && !validate1()) return;
        if (step === 2 && !validate2()) return;
        setStep((s) => s + 1);
    };

    const buildWAMessage = () =>
        encodeURIComponent(
            `Assalamu'alaikum Admin QLC 🌟\n\n` +
                `Kami ingin mengajukan kerja sama dengan QLC:\n\n` +
                `🏛️ *Lembaga:* ${form.nama_lembaga}\n` +
                `🏢 *Jenis Lembaga:* ${form.jenis_lembaga}\n` +
                `👤 *PIC:* ${form.nama_pic}\n` +
                `📱 *No. WhatsApp:* ${form.no_wa}\n` +
                (form.email ? `📧 *Email:* ${form.email}\n` : '') +
                `\n🤝 *Jenis Kerja Sama:* ${form.jenis_kerjasama}\n` +
                (form.pesan ? `💬 *Keterangan:* ${form.pesan}\n` : '') +
                `\nMohon informasi lebih lanjut. Terima kasih 🙏`
        );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        window.open(`https://wa.me/${ADMIN_WA}?text=${buildWAMessage()}`, '_blank');
    };

    // ── TAMPILAN SUKSES ──
    if (submitted) {
        return (
            <>
                <Head title="Pengajuan Terkirim - QLC" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Pengajuan Terkirim!</h1>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Terima kasih, <strong>{form.nama_lembaga}</strong>. Tim QLC akan menghubungi Anda setelah menerima pesan WhatsApp Anda.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left mb-6">
                            <div className="text-xs font-bold text-yellow-800 mb-2">📋 Status Pengajuan</div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">Menunggu Konfirmasi</span>
                            </div>
                        </div>
                        <a
                            href={`https://wa.me/${ADMIN_WA}?text=${buildWAMessage()}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 mb-3"
                        >
                            <MessageCircle size={16} /> Buka WhatsApp
                        </a>
                        <button
                            onClick={() => router.get('/')}
                            className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-bold transition-all"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ── TAMPILAN FORM ──
    return (
        <>
            <Head title="Pengajuan Kerja Sama - QLC" />
            <div className="min-h-screen bg-gray-50 font-sans pb-10">
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.get('/')}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali ke Beranda
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A017] to-[#c49115] flex items-center justify-center">
                            <Handshake size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">Pengajuan Kerja Sama QLC</span>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-10">
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-10 relative">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-[#D4A017] z-0 transition-all duration-500"
                            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white ${
                                        step > s.id
                                            ? 'bg-[#D4A017] border-[#D4A017] text-white'
                                            : step === s.id
                                              ? 'border-[#D4A017] text-[#D4A017]'
                                              : 'border-gray-300 text-gray-400'
                                    }`}
                                >
                                    {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={16} strokeWidth={2} />}
                                </div>
                                <span className={`text-xs font-bold hidden sm:block ${step >= s.id ? 'text-[#c49115]' : 'text-gray-400'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Step header */}
                        <div className="bg-gradient-to-r from-[#1B6B3A] to-[#2a8a4f] px-6 py-5">
                            <div className="text-xs font-bold text-green-300 uppercase tracking-wider mb-1">
                                Langkah {step} dari {STEPS.length}
                            </div>
                            <h1 className="text-xl font-black text-white">{STEPS[step - 1].label}</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">
                                {/* ── STEP 1: Data Mitra ── */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 font-medium">Isi data lembaga / instansi yang ingin mengajukan kerja sama dengan QLC.</p>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Nama Lembaga / Instansi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.nama_lembaga}
                                                onChange={(e) => set('nama_lembaga', e.target.value)}
                                                placeholder="Contoh: Yayasan Al-Hikmah"
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all ${errors.nama_lembaga ? 'border-red-400' : 'border-gray-200'}`}
                                            />
                                            {errors.nama_lembaga && (
                                                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={11} /> {errors.nama_lembaga}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Jenis Lembaga <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.jenis_lembaga}
                                                onChange={(e) => set('jenis_lembaga', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all ${errors.jenis_lembaga ? 'border-red-400' : 'border-gray-200'}`}
                                            >
                                                <option value="">-- Pilih Jenis Lembaga --</option>
                                                {JENIS_LEMBAGA.map((j) => (
                                                    <option key={j} value={j}>
                                                        {j}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.jenis_lembaga && (
                                                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={11} /> {errors.jenis_lembaga}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Nama Penanggung Jawab (PIC) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.nama_pic}
                                                onChange={(e) => set('nama_pic', e.target.value)}
                                                placeholder="Nama lengkap PIC"
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all ${errors.nama_pic ? 'border-red-400' : 'border-gray-200'}`}
                                            />
                                            {errors.nama_pic && (
                                                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={11} /> {errors.nama_pic}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                    No. WhatsApp <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={form.no_wa}
                                                    onChange={(e) => set('no_wa', e.target.value)}
                                                    placeholder="Contoh: 08123456789"
                                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all ${errors.no_wa ? 'border-red-400' : 'border-gray-200'}`}
                                                />
                                                {errors.no_wa && (
                                                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                        <AlertCircle size={11} /> {errors.no_wa}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                    Email <span className="text-gray-400 font-normal">(opsional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => set('email', e.target.value)}
                                                    placeholder="email@lembaga.com"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: Detail Kerja Sama ── */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 font-medium">Ceritakan jenis kerja sama yang ingin dijalin dengan QLC.</p>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Jenis Kerja Sama <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.jenis_kerjasama}
                                                onChange={(e) => set('jenis_kerjasama', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all ${errors.jenis_kerjasama ? 'border-red-400' : 'border-gray-200'}`}
                                            >
                                                <option value="">-- Pilih Jenis Kerja Sama --</option>
                                                {JENIS_KERJASAMA.map((j) => (
                                                    <option key={j} value={j}>
                                                        {j}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.jenis_kerjasama && (
                                                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={11} /> {errors.jenis_kerjasama}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Deskripsi / Keterangan <span className="text-gray-400 font-normal">(opsional)</span>
                                            </label>
                                            <textarea
                                                value={form.pesan}
                                                onChange={(e) => set('pesan', e.target.value)}
                                                placeholder="Ceritakan lebih lanjut mengenai proposal atau ide kerja sama Anda..."
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 3: Konfirmasi ── */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 font-medium">Periksa kembali data sebelum mengirim.</p>
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                                            {[
                                                { label: 'Nama Lembaga', value: form.nama_lembaga },
                                                { label: 'Jenis Lembaga', value: form.jenis_lembaga },
                                                { label: 'Nama PIC', value: form.nama_pic },
                                                { label: 'No. WhatsApp', value: form.no_wa },
                                                { label: 'Email', value: form.email || '-' },
                                                { label: 'Jenis Kerja Sama', value: form.jenis_kerjasama },
                                                { label: 'Keterangan', value: form.pesan || '-' },
                                            ].map((row) => (
                                                <div key={row.label} className="flex justify-between items-start px-4 py-3 text-sm gap-4">
                                                    <span className="text-gray-500 font-medium whitespace-nowrap">{row.label}</span>
                                                    <span className="font-bold text-gray-800 text-right">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 font-medium leading-relaxed">
                                            ⚠️ Setelah submit, Anda akan diarahkan ke WhatsApp untuk mengirim pesan pengajuan kepada admin QLC.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation buttons */}
                            <div className="px-6 pb-6 flex justify-between gap-3">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep((s) => s - 1)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 transition-all"
                                    >
                                        <ChevronLeft size={16} /> Kembali
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {step < STEPS.length ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-sm font-bold hover:bg-[#155430] transition-all shadow-md shadow-green-600/20"
                                    >
                                        Lanjut <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#c49115] transition-all shadow-md shadow-yellow-600/20"
                                    >
                                        <MessageCircle size={16} /> Kirim & Hubungi via WA
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
