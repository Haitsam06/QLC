import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Building2, BookOpen, Image, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, Upload, Instagram, Facebook, Youtube, Users, Star, Award } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Profile {
    id?: string;
    name: string;
    hero_title: string | null;
    logo: string | null;
    about_image: string | null;
    tagline: string | null;
    history: string | null;
    vision: string | null;
    mission: string | null;
    address: string | null;
    whatsapp: string | null;
    email: string | null;
    social_media: Record<string, string> | null;
    established_year: string | null;
    main_focus: string | null;
}
interface Foundation {
    id: string;
    title: string;
    description: string;
}
interface Leader {
    id: string;
    nama: string;
    jabatan: string;
    deskripsi: string | null;
    poin: string | null;
    image_url: string | null;
}
interface Program {
    id: string;
    name: string;
    description: string | null;
    target_audience: string | null;
    duration: string | null;
    image_url: string | null;
}
interface GalleryItem {
    id: string;
    title: string;
    media_url: string;
    type: 'Photo' | 'Video';
}

const API = '/api/info';

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return createPortal(
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${type === 'success' ? 'bg-[#1B6B3A]' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

const Fg = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 opacity-80">{label}</label>
        {children}
        {error && <span className="text-[11px] text-red-600 font-bold mt-0.5">{error}</span>}
    </div>
);

function FileUpload({ accept, preview, onFile, label }: { accept: string; preview: string | null; onFile: (f: File) => void; label: string; themeClass?: string }) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="w-full">
            <div className={`border-2 border-dashed border-slate-300 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white/50 hover:bg-white hover:border-[#1B6B3A]`} onClick={() => ref.current?.click()}>
                <Upload size={28} className="text-[#1B6B3A]" />
                <div className="text-[13.5px] font-bold text-slate-700">{label}</div>
                <div className="text-[12px] font-medium text-slate-500">Klik untuk memilih file</div>
                <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
            {preview && <img src={preview} className="w-full max-h-[200px] object-cover rounded-[1.5rem] mt-3 border border-slate-200 shadow-sm" alt="preview" />}
        </div>
    );
}

function DeleteModal({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => Promise<void> }) {
    const [busy, setBusy] = useState(false);
    const go = async () => {
        setBusy(true);
        try {
            await onConfirm();
        } finally {
            setBusy(false);
        }
    };
    return createPortal(
        <div className="fixed inset-0 z-[900] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out] overflow-hidden text-center">
                <div className="pt-8 px-7 pb-5 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                        <Trash2 size={28} />
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900 mt-1">Hapus Item?</div>
                    <div className="text-[13.5px] text-slate-500 leading-relaxed px-2">
                        Data <b>{label}</b> akan dihapus permanen beserta filenya.
                    </div>
                </div>
                <div className="flex gap-2.5 px-7 pb-7">
                    <button className="flex-1 h-11 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors" onClick={onClose}>
                        Batal
                    </button>
                    <button className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-red-600 shadow-md shadow-red-600/20 hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50" onClick={go} disabled={busy}>
                        {busy ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} /> Hapus
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1: PROFILE
═══════════════════════════════════════════════════════════ */
function ProfileTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
    const [prof, setProf] = useState<Profile>({
        name: '',
        hero_title: '',
        logo: null,
        about_image: null,
        tagline: '',
        history: '',
        vision: '',
        mission: '',
        address: '',
        whatsapp: '',
        email: '',
        social_media: null,
        established_year: '',
        main_focus: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [aboutFile, setAboutFile] = useState<File | null>(null);
    const [aboutPreview, setAboutPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    useEffect(() => {
        fetch(`${API}/profile`)
            .then((r) => r.json())
            .then((j) => {
                if (j.success && j.data) setProf(j.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const upd = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProf((p) => ({ ...p, [k]: e.target.value }));
    const updSocial = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setProf((p) => ({ ...p, social_media: { ...(p.social_media ?? {}), [k]: e.target.value } }));

    const validate = () => {
        const err: Record<string, string> = {};
        if (!prof.name?.trim()) err.name = 'Nama sekolah wajib diisi.';
        if (!prof.hero_title?.trim()) err.hero_title = 'Teks Utama (Hero) wajib diisi.';
        setErrors(err);
        return !Object.keys(err).length;
    };

    const save = async () => {
        if (!validate()) return;
        setBusy(true);
        try {
            const fd = new FormData();
            Object.entries(prof).forEach(([k, v]) => {
                if (k === 'logo' || k === 'id' || k === 'updated_at') return;
                if (k === 'social_media') fd.append(k, JSON.stringify(v ?? {}));
                else fd.append(k, v ?? '');
            });
            if (logoFile) fd.append('logo', logoFile);
            if (aboutFile) fd.append('about_image', aboutFile);
            const j = await (await fetch(`${API}/profile`, { method: 'POST', body: fd })).json();
            if (j.success) {
                setProf(j.data);
                onToast('Profil berhasil disimpan.', 'success');
            } else onToast(j.message ?? 'Gagal menyimpan.', 'error');
        } finally {
            setBusy(false);
        }
    };

    if (loading)
        return (
            <div className="py-20 flex justify-center">
                <Loader2 size={36} className="text-[#1B6B3A] animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col bg-white">
            <div className="p-6 md:p-8 flex flex-col gap-10">
                {/* IDENTITAS */}
                <div className="relative bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] p-8 lg:p-12 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-6">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white border border-white/80 shadow-sm text-[#1B6B3A] text-xs font-bold tracking-wider w-fit">1. IDENTITAS & HERO SECTION</span>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="flex flex-col gap-5 w-full">
                                <Fg label="Teks Utama (Hero Title)" error={errors.hero_title}>
                                    <input className="w-full h-14 px-5 bg-white/80 border rounded-2xl text-[16px] font-extrabold focus:ring-4 border-slate-200 focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/20" value={prof.hero_title ?? ''} onChange={upd('hero_title')} />
                                </Fg>
                                <Fg label="Nama Sekolah" error={errors.name}>
                                    <input className="w-full h-14 px-5 bg-white/80 border rounded-2xl text-[16px] font-extrabold text-[#1B6B3A] focus:ring-4 border-slate-200 focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/20" value={prof.name} onChange={upd('name')} />
                                </Fg>
                                <Fg label="Tagline / Deskripsi Singkat">
                                    <textarea className="w-full p-5 bg-white/80 border border-slate-200 rounded-2xl text-[15px] font-medium min-h-[120px] focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/20" value={prof.tagline ?? ''} onChange={upd('tagline')} />
                                </Fg>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-white/40 border border-white rounded-[2.5rem] shadow-lg aspect-square lg:aspect-auto h-full overflow-hidden">
                                {logoPreview || prof.logo ? (
                                    <img src={logoPreview ?? prof.logo!} className="w-48 h-48 rounded-[2rem] object-cover border-4 border-white shadow-xl" alt="logo" />
                                ) : (
                                    <div className="w-48 h-48 rounded-[2rem] bg-white/80 border-4 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-semibold text-[13px]">Belum ada logo</div>
                                )}
                                <label className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B6B3A] text-white font-bold text-[13px] cursor-pointer hover:bg-[#114a27] shadow-md">
                                    <Upload size={14} /> Ganti Logo{' '}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                setLogoFile(f);
                                                setLogoPreview(URL.createObjectURL(f));
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TENTANG KAMI */}
                <div className="relative bg-[#FDFBF7] p-8 lg:p-12 rounded-[3rem] border border-[#F0ECE1] shadow-sm">
                    <div className="relative z-10 flex flex-col gap-6">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white border border-gray-200 shadow-sm text-[#D4A017] text-xs font-bold tracking-wider w-fit">2. KONTEN TENTANG KAMI</span>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Kolom Gambar (Kiri) */}
                            <div className="lg:col-span-5 w-full">
                                <Fg label="Gambar Tentang Kami">
                                    <FileUpload
                                        accept="image/*"
                                        preview={aboutPreview || prof.about_image}
                                        label="Pilih Foto / Gambar Pendukung"
                                        onFile={(file) => {
                                            setAboutFile(file);
                                            setAboutPreview(URL.createObjectURL(file));
                                        }}
                                    />
                                </Fg>
                            </div>

                            {/* Kolom Teks (Kanan) */}
                            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                                <Fg label="Sejarah">
                                    <textarea className="w-full p-6 bg-white/95 border border-white rounded-[2rem] shadow-sm text-[15px] font-medium min-h-[160px] focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/20" value={prof.history ?? ''} onChange={upd('history')} />
                                </Fg>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <Fg label="Tahun Berdiri">
                                            <input
                                                className="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl text-[14px] font-bold focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/20"
                                                placeholder="Misal: Melayani Umat Sejak 2010"
                                                value={prof.established_year ?? ''}
                                                onChange={upd('established_year')}
                                            />
                                        </Fg>
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <Fg label="Fokus Utama">
                                            <input
                                                className="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl text-[14px] font-bold focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/20"
                                                placeholder="Misal: Pengembangan SDM"
                                                value={prof.main_focus ?? ''}
                                                onChange={upd('main_focus')}
                                            />
                                        </Fg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visi Misi (Tetap dibawah) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div className="bg-gradient-to-br from-[#114a27] to-[#1B6B3A] p-8 rounded-[2rem] shadow-lg flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-[#F0B429]">VISI KAMI</h2>
                                <textarea className="w-full p-4 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-light italic min-h-[120px] focus:border-[#F0B429] focus:ring-2 focus:ring-[#F0B429]/50" value={prof.vision ?? ''} onChange={upd('vision')} />
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] shadow-md border border-gray-100 flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">MISI KAMI</h2>
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Gunakan (ENTER) untuk pisah poin</label>
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[14px] font-medium min-h-[120px] focus:border-[#1B6B3A] focus:ring-2 focus:ring-[#1B6B3A]/20" value={prof.mission ?? ''} onChange={upd('mission')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* KONTAK */}
                <div className="relative bg-slate-50 p-8 lg:p-12 rounded-[3rem] border border-slate-200 shadow-sm">
                    <div className="relative z-10 flex flex-col gap-6">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white border border-gray-200 shadow-sm text-slate-700 text-xs font-bold tracking-wider w-fit">3. KONTAK & MEDIA SOSIAL</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Fg label="Alamat Lengkap">
                                <textarea className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium min-h-[140px] focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/15" value={prof.address ?? ''} onChange={upd('address')} />
                            </Fg>
                            <div className="flex flex-col gap-5">
                                <Fg label="Email">
                                    <input className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/15" type="email" value={prof.email ?? ''} onChange={upd('email')} />
                                </Fg>
                                <Fg label="WhatsApp">
                                    <input className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:border-[#1B6B3A] focus:ring-4 focus:ring-[#1B6B3A]/15" value={prof.whatsapp ?? ''} onChange={upd('whatsapp')} />
                                </Fg>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
                            {[
                                { k: 'instagram', icon: <Instagram size={18} /> },
                                { k: 'facebook', icon: <Facebook size={18} /> },
                                { k: 'youtube', icon: <Youtube size={18} /> },
                            ].map(({ k, icon }) => (
                                <Fg key={k} label={k.toUpperCase()}>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]">{icon}</div>
                                        <input className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/20" value={prof.social_media?.[k] ?? ''} onChange={updSocial(k)} />
                                    </div>
                                </Fg>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="sticky bottom-0 px-6 py-5 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-end z-40 rounded-b-[24px]">
                <button className="flex items-center gap-2 h-12 px-8 rounded-full bg-[#1B6B3A] text-white text-[15px] font-bold shadow-lg shadow-[#1B6B3A]/30 hover:bg-[#114a27] hover:-translate-y-1 disabled:opacity-50 transition-all" onClick={save} disabled={busy}>
                    {busy ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Menyimpan...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={18} /> Publikasikan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2: FONDASI
═══════════════════════════════════════════════════════════ */
function FoundationsTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
    const [data, setData] = useState<Foundation[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<Foundation | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const j = await (await fetch(`${API}/foundations`)).json();
        if (j.success) setData(j.data);
        setLoading(false);
    }, []);
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col bg-[#f0f7f6] min-h-[600px]">
            <div className="p-6 md:p-8 flex flex-wrap gap-4 items-center justify-between bg-white border-b border-slate-200">
                <div>
                    <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wider mb-2">🌿 FONDASI KARAKTER</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Pilar Inti Realisasi Konsep</h2>
                </div>
                <button
                    className="flex items-center gap-2 px-6 h-12 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md"
                    onClick={() => {
                        setSel(null);
                        setModal('add');
                    }}
                >
                    <Plus size={16} /> Tambah Pilar
                </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 size={40} className="text-emerald-600 animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 font-bold">Belum ada fondasi karakter.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((f, idx) => (
                            <div key={f.id} className="bg-white border border-gray-100 hover:shadow-xl rounded-[2.5rem] p-8 flex flex-col group transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-lg">{idx + 1}</div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-base text-gray-600 leading-relaxed flex-1">{f.description}</p>
                                <div className="flex border-t border-slate-100 mt-6 pt-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="flex-1 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            setSel(f);
                                            setModal('edit');
                                        }}
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        className="flex-1 py-2 text-[12px] font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            setSel(f);
                                            setModal('delete');
                                        }}
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <FoundationModal
                    mode={modal}
                    init={sel}
                    onClose={() => setModal(null)}
                    onSave={async (fd) => {
                        const url = modal === 'edit' ? `${API}/foundations/${sel!.id}` : `${API}/foundations`;
                        const j = await (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) })).json();
                        if (j.success) {
                            onToast('Berhasil disimpan.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal menyimpan.', 'error');
                    }}
                />
            )}
            {modal === 'delete' && sel && (
                <DeleteModal
                    label={sel.title}
                    onClose={() => setModal(null)}
                    onConfirm={async () => {
                        const j = await (await fetch(`${API}/foundations/${sel.id}`, { method: 'DELETE' })).json();
                        if (j.success) {
                            onToast('Pilar dihapus.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
        </div>
    );
}

function FoundationModal({ mode, init, onClose, onSave }: { mode: 'add' | 'edit'; init: Foundation | null; onClose: () => void; onSave: (d: any) => Promise<void> }) {
    const [f, setF] = useState({ title: init?.title ?? '', description: init?.description ?? '' });
    const [busy, setBusy] = useState(false);
    return createPortal(
        <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#FAFAFA]">
                    <span className="text-[20px] font-extrabold text-slate-900">{mode === 'add' ? 'Tambah Pilar' : 'Edit Pilar'}</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:text-red-600 shadow-sm" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">
                    <Fg label="Judul Pilar">
                        <input className="w-full h-12 px-5 bg-slate-50 border border-slate-300 rounded-xl text-[14px] font-bold" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
                    </Fg>
                    <Fg label="Deskripsi">
                        <textarea className="w-full p-5 bg-slate-50 border border-slate-300 rounded-xl text-[14px] font-medium min-h-[100px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
                    </Fg>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3">
                    <button className="px-6 h-12 rounded-full font-bold bg-white border border-slate-300 hover:bg-slate-100" onClick={onClose}>
                        Batal
                    </button>
                    <button
                        className="px-8 h-12 rounded-full font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        onClick={async () => {
                            setBusy(true);
                            await onSave(f);
                            setBusy(false);
                        }}
                        disabled={busy || !f.title || !f.description}
                    >
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3: LEADERS
═══════════════════════════════════════════════════════════ */
function LeadersTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
    const [data, setData] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<Leader | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const j = await (await fetch(`${API}/leaders`)).json();
        if (j.success) setData(j.data);
        setLoading(false);
    }, []);
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col bg-[#1B6B3A]/5 min-h-[600px]">
            <div className="p-6 md:p-8 flex flex-wrap gap-4 items-center justify-between bg-white border-b border-slate-200">
                <div>
                    <span className="inline-block py-1.5 px-4 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold tracking-wider mb-2">👥 PIMPINAN LEMBAGA</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Pendiri & Pengurus QLC</h2>
                </div>
                <button
                    className="flex items-center gap-2 px-6 h-12 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-md"
                    onClick={() => {
                        setSel(null);
                        setModal('add');
                    }}
                >
                    <Plus size={16} /> Tambah Pengurus
                </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 size={40} className="text-orange-600 animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 font-bold">Belum ada pengurus ditambahkan.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-20 md:gap-x-8 md:gap-y-8 mt-16">
                        {data.map((dewan) => (
                            <div key={dewan.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 pt-20 relative flex flex-col hover:-translate-y-3 transition-all group shadow-sm hover:shadow-xl">
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                                    <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex justify-center items-center">
                                        <img src={dewan.image_url || `https://ui-avatars.com/api/?name=${dewan.nama}&background=f97316&color=fff`} alt={dewan.nama} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#D4A017] to-[#F0B429] rounded-full border-4 border-white flex items-center justify-center shadow-md z-10 text-white">
                                        <Star size={20} />
                                    </div>
                                </div>
                                <div className="text-center mb-6 pb-6 border-b border-slate-100 flex-1 mt-3">
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">{dewan.nama}</h3>
                                    <p className="text-sm font-semibold text-orange-700 bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-100">{dewan.jabatan}</p>
                                </div>
                                <ul className="text-sm text-slate-600 space-y-3 px-1 min-h-[100px]">
                                    {dewan.poin &&
                                        dewan.poin
                                            .split('\n')
                                            .filter(Boolean)
                                            .map((p, i) => (
                                                <li key={i} className="flex items-start">
                                                    <CheckCircle2 className="w-4 h-4 text-[#D4A017] mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="leading-snug font-medium text-slate-700">{p}</span>
                                                </li>
                                            ))}
                                </ul>
                                <div className="flex border-t border-slate-100 mt-6 pt-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="flex-1 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            setSel(dewan);
                                            setModal('edit');
                                        }}
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        className="flex-1 py-2 text-[12px] font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            setSel(dewan);
                                            setModal('delete');
                                        }}
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <LeaderModal
                    mode={modal}
                    init={sel}
                    onClose={() => setModal(null)}
                    onSave={async (fd) => {
                        const url = modal === 'edit' ? `${API}/leaders/${sel!.id}` : `${API}/leaders`;
                        const j = await (await fetch(url, { method: 'POST', body: fd })).json();
                        if (j.success) {
                            onToast('Pengurus disimpan.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal menyimpan.', 'error');
                    }}
                />
            )}
            {modal === 'delete' && sel && (
                <DeleteModal
                    label={sel.nama}
                    onClose={() => setModal(null)}
                    onConfirm={async () => {
                        const j = await (await fetch(`${API}/leaders/${sel.id}`, { method: 'DELETE' })).json();
                        if (j.success) {
                            onToast('Pengurus dihapus.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
        </div>
    );
}

function LeaderModal({ mode, init, onClose, onSave }: { mode: 'add' | 'edit'; init: Leader | null; onClose: () => void; onSave: (fd: FormData) => Promise<void> }) {
    const [f, setF] = useState({ nama: init?.nama ?? '', jabatan: init?.jabatan ?? '', deskripsi: init?.deskripsi ?? '', poin: init?.poin ?? '' });
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(init?.image_url ?? null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!f.nama || !f.jabatan) return;
        setBusy(true);
        const fd = new FormData();
        Object.entries(f).forEach(([k, v]) => fd.append(k, v));
        if (imgFile) fd.append('image', imgFile);
        if (mode === 'edit') fd.append('_method', 'PUT');
        await onSave(fd);
        setBusy(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[600px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#FAFAFA]">
                    <span className="text-[20px] font-extrabold text-slate-900">{mode === 'add' ? 'Tambah Pengurus' : 'Edit Pengurus'}</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:text-red-600 border shadow-sm" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-5">
                        <Fg label="Nama Lengkap">
                            <input className="w-full h-12 px-5 bg-slate-50 border rounded-xl" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
                        </Fg>
                        <Fg label="Jabatan">
                            <input className="w-full h-12 px-5 bg-slate-50 border rounded-xl" value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} />
                        </Fg>
                    </div>
                    <Fg label="Deskripsi">
                        <textarea className="w-full p-5 bg-slate-50 border rounded-xl min-h-[100px]" value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} />
                    </Fg>
                    <Fg label="Poin Kualifikasi (Pisahkan dengan ENTER)">
                        <textarea className="w-full p-5 bg-slate-50 border rounded-xl min-h-[100px]" value={f.poin} onChange={(e) => setF({ ...f, poin: e.target.value })} />
                    </Fg>
                    <Fg label="Foto Pengurus">
                        <FileUpload
                            accept="image/*"
                            preview={preview}
                            label="Pilih Foto"
                            onFile={(file) => {
                                setImgFile(file);
                                setPreview(URL.createObjectURL(file));
                            }}
                        />
                    </Fg>
                </div>
                <div className="px-8 py-5 flex justify-end gap-3 border-t">
                    <button className="px-6 h-12 rounded-full font-bold bg-white border" onClick={onClose}>
                        Batal
                    </button>
                    <button className="px-8 h-12 rounded-full font-bold text-white bg-orange-600 flex items-center gap-2" onClick={submit} disabled={busy || !f.nama || !f.jabatan}>
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB 4: PROGRAMS
═══════════════════════════════════════════════════════════ */
function ProgramsTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
    const [data, setData] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<Program | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const j = await (await fetch(`${API}/programs`)).json();
        if (j.success) setData(j.data);
        setLoading(false);
    }, []);
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col bg-blue-50/50 min-h-[600px]">
            <div className="p-6 md:p-8 flex flex-wrap gap-4 items-center justify-between bg-white border-b border-slate-200">
                <div>
                    <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider mb-2">📚 PROGRAM LAYANAN</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Kelola Program Pendidikan</h2>
                </div>
                <button
                    className="flex items-center gap-2 px-6 h-12 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700"
                    onClick={() => {
                        setSel(null);
                        setModal('add');
                    }}
                >
                    <Plus size={16} /> Tambah Program
                </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 size={40} className="text-blue-600 animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 font-bold">Belum ada program ditambahkan.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((prog) => (
                            <div key={prog.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                                <div className="h-48 overflow-hidden relative bg-slate-100">
                                    {prog.image_url ? (
                                        <img src={prog.image_url} alt={prog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Image size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-2">{prog.name}</h3>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">{prog.description}</p>
                                    <div className="flex border-t border-slate-100 pt-4 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="flex-1 py-2 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 flex items-center justify-center gap-1.5"
                                            onClick={() => {
                                                setSel(prog);
                                                setModal('edit');
                                            }}
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            className="flex-1 py-2 text-[12px] font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 flex items-center justify-center gap-1.5"
                                            onClick={() => {
                                                setSel(prog);
                                                setModal('delete');
                                            }}
                                        >
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <ProgramModal
                    mode={modal}
                    init={sel}
                    onClose={() => setModal(null)}
                    onSave={async (fd) => {
                        const url = modal === 'edit' ? `${API}/programs/${sel!.id}` : `${API}/programs`;
                        const j = await (await fetch(url, { method: 'POST', body: fd })).json();
                        if (j.success) {
                            onToast('Program disimpan.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
            {modal === 'delete' && sel && (
                <DeleteModal
                    label={sel.name}
                    onClose={() => setModal(null)}
                    onConfirm={async () => {
                        const j = await (await fetch(`${API}/programs/${sel.id}`, { method: 'DELETE' })).json();
                        if (j.success) {
                            onToast('Program dihapus.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
        </div>
    );
}

function ProgramModal({ mode, init, onClose, onSave }: { mode: 'add' | 'edit'; init: Program | null; onClose: () => void; onSave: (fd: FormData) => Promise<void> }) {
    const [f, setF] = useState({ name: init?.name ?? '', description: init?.description ?? '', target_audience: init?.target_audience ?? '', duration: init?.duration ?? '' });
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(init?.image_url ?? null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!f.name) return;
        setBusy(true);
        const fd = new FormData();
        Object.entries(f).forEach(([k, v]) => fd.append(k, v));
        if (imgFile) fd.append('image', imgFile);
        if (mode === 'edit') fd.append('_method', 'PUT');
        await onSave(fd);
        setBusy(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[600px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#FAFAFA]">
                    <span className="text-[20px] font-extrabold text-slate-900">{mode === 'add' ? 'Tambah Program' : 'Edit Program'}</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:text-red-600 border shadow-sm" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">
                    <Fg label="Nama Program">
                        <input className="w-full h-12 px-5 border rounded-xl" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                    </Fg>
                    <Fg label="Deskripsi">
                        <textarea className="w-full p-5 border rounded-xl min-h-[100px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
                    </Fg>
                    <div className="grid grid-cols-2 gap-5">
                        <Fg label="Target Audiens">
                            <input className="w-full h-12 px-5 border rounded-xl" value={f.target_audience} onChange={(e) => setF({ ...f, target_audience: e.target.value })} />
                        </Fg>
                        <Fg label="Durasi">
                            <input className="w-full h-12 px-5 border rounded-xl" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
                        </Fg>
                    </div>
                    <Fg label="Foto Program">
                        <FileUpload
                            accept="image/*"
                            preview={preview}
                            label="Pilih Foto"
                            onFile={(file) => {
                                setImgFile(file);
                                setPreview(URL.createObjectURL(file));
                            }}
                        />
                    </Fg>
                </div>
                <div className="px-8 py-5 flex justify-end gap-3 border-t">
                    <button className="px-6 h-12 rounded-full font-bold bg-slate-100" onClick={onClose}>
                        Batal
                    </button>
                    <button className="px-8 h-12 rounded-full font-bold text-white bg-blue-600 flex items-center gap-2" onClick={submit} disabled={busy || !f.name}>
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB 5: GALLERY
═══════════════════════════════════════════════════════════ */
function GalleryTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
    const [data, setData] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<GalleryItem | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const j = await (await fetch(`${API}/gallery`)).json();
        if (j.success) setData(j.data);
        setLoading(false);
    }, []);
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col bg-purple-50/50 min-h-[600px]">
            <div className="p-6 md:p-8 flex flex-wrap gap-4 items-center justify-between bg-white border-b border-slate-200">
                <div>
                    <span className="inline-block py-1.5 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-wider mb-2">📸 DOKUMENTASI</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Galeri Kegiatan</h2>
                </div>
                <button
                    className="flex items-center gap-2 px-6 h-12 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700"
                    onClick={() => {
                        setSel(null);
                        setModal('add');
                    }}
                >
                    <Plus size={16} /> Tambah Media
                </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 size={40} className="text-purple-600 animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 font-bold">Belum ada foto kegiatan.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.map((gal) => (
                            <div key={gal.id} className="relative group rounded-[1.5rem] overflow-hidden bg-slate-100 aspect-square shadow-sm border border-slate-200">
                                {gal.type === 'Photo' ? (
                                    <img src={gal.media_url} alt={gal.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                        <Youtube size={40} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <span className="text-white font-bold text-center px-4">{gal.title}</span>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 bg-white/20 hover:bg-blue-600 rounded-full text-white"
                                            onClick={() => {
                                                setSel(gal);
                                                setModal('edit');
                                            }}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="p-2 bg-white/20 hover:bg-red-600 rounded-full text-white"
                                            onClick={() => {
                                                setSel(gal);
                                                setModal('delete');
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <GalleryModal
                    mode={modal}
                    init={sel}
                    onClose={() => setModal(null)}
                    onSave={async (fd) => {
                        const url = modal === 'edit' ? `${API}/gallery/${sel!.id}` : `${API}/gallery`;
                        const j = await (await fetch(url, { method: 'POST', body: fd })).json();
                        if (j.success) {
                            onToast('Media disimpan.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
            {modal === 'delete' && sel && (
                <DeleteModal
                    label={sel.title}
                    onClose={() => setModal(null)}
                    onConfirm={async () => {
                        const j = await (await fetch(`${API}/gallery/${sel.id}`, { method: 'DELETE' })).json();
                        if (j.success) {
                            onToast('Media dihapus.', 'success');
                            setModal(null);
                            load();
                        } else onToast('Gagal.', 'error');
                    }}
                />
            )}
        </div>
    );
}

function GalleryModal({ mode, init, onClose, onSave }: { mode: 'add' | 'edit'; init: GalleryItem | null; onClose: () => void; onSave: (fd: FormData) => Promise<void> }) {
    const [title, setTitle] = useState(init?.title ?? '');
    const [type, setType] = useState<'Photo' | 'Video'>(init?.type ?? 'Photo');
    const [url, setUrl] = useState(init?.type === 'Video' ? (init?.media_url ?? '') : '');
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(init?.type === 'Photo' ? (init?.media_url ?? null) : null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!title) return;
        setBusy(true);
        const fd = new FormData();
        fd.append('title', title);
        fd.append('type', type);
        if (type === 'Photo' && imgFile) fd.append('media', imgFile);
        if (type === 'Video') fd.append('media_url', url);
        if (mode === 'edit') fd.append('_method', 'PUT');
        await onSave(fd);
        setBusy(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#FAFAFA]">
                    <span className="text-[20px] font-extrabold text-slate-900">{mode === 'add' ? 'Tambah Media' : 'Edit Media'}</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:text-red-600 border shadow-sm" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">
                    <Fg label="Judul Media">
                        <input className="w-full h-12 px-5 border rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Fg>
                    <Fg label="Jenis Media">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'Photo'} onChange={() => setType('Photo')} /> Foto
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'Video'} onChange={() => setType('Video')} /> Video
                            </label>
                        </div>
                    </Fg>
                    {type === 'Photo' ? (
                        <Fg label="Upload Foto">
                            <FileUpload
                                accept="image/*"
                                preview={preview}
                                label="Pilih Gambar"
                                onFile={(f) => {
                                    setImgFile(f);
                                    setPreview(URL.createObjectURL(f));
                                }}
                            />
                        </Fg>
                    ) : (
                        <Fg label="URL YouTube">
                            <input className="w-full h-12 px-5 border rounded-xl" placeholder="https://youtube.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
                        </Fg>
                    )}
                </div>
                <div className="px-8 py-5 flex justify-end gap-3 border-t">
                    <button className="px-6 h-12 rounded-full font-bold bg-slate-100" onClick={onClose}>
                        Batal
                    </button>
                    <button className="px-8 h-12 rounded-full font-bold text-white bg-purple-600 flex items-center gap-2" onClick={submit} disabled={busy || !title}>
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
type TabId = 'profile' | 'foundations' | 'leaders' | 'programs' | 'gallery';

const TABS: { id: TabId; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { id: 'profile', label: 'Profil & Teks', icon: <Building2 size={18} />, colorClass: 'bg-[#1B6B3A]' },
    { id: 'foundations', label: 'Fondasi Karakter', icon: <Award size={18} />, colorClass: 'bg-emerald-600' },
    { id: 'leaders', label: 'Pimpinan Lembaga', icon: <Users size={18} />, colorClass: 'bg-orange-600' },
    { id: 'programs', label: 'Daftar Program', icon: <BookOpen size={18} />, colorClass: 'bg-blue-600' },
    { id: 'gallery', label: 'Galeri Landing', icon: <Image size={18} />, colorClass: 'bg-purple-600' },
];

export default function InfoPage() {
    const [tab, setTab] = useState<TabId>('profile');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}</style>

            <div className="flex flex-col gap-8 w-full text-slate-900 pb-12">
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <div className="text-[28px] font-black tracking-tight leading-none mb-2">Konten Landing Page</div>
                        <div className="text-[14px] text-slate-500 font-medium">Kelola teks, profil, program, dan galeri untuk ditampilkan secara publik.</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-[1.5rem] p-2 w-fit shadow-sm">
                    {TABS.map((t) => {
                        const isActive = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1rem] text-[14.5px] font-bold cursor-pointer transition-all focus:outline-none ${isActive ? 'bg-slate-50 text-[#1B6B3A] shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                onClick={() => setTab(t.id)}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full inline-block transition-colors ${isActive ? t.colorClass : 'bg-slate-300'}`} />
                                {t.icon} {t.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                    {tab === 'profile' && <ProfileTab onToast={showToast} />}
                    {tab === 'foundations' && <FoundationsTab onToast={showToast} />}
                    {tab === 'leaders' && <LeadersTab onToast={showToast} />}
                    {tab === 'programs' && <ProgramsTab onToast={showToast} />}
                    {tab === 'gallery' && <GalleryTab onToast={showToast} />}
                </div>
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
