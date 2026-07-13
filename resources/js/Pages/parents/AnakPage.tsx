import { router, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, CheckCircle2, Clock, XCircle, GraduationCap, Calendar, FileText, ExternalLink, Baby, Camera, Loader2, X, MessageCircle } from 'lucide-react';
import ImageCropperModal from '@/Components/ImageCropperModal';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type EnrollmentStatus = 'active' | 'inactive' | 'pending';

export interface Child {
    id: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    usia: number | null;
    program_id: string | null;
    program_name: string | null;
    enrollment_status: EnrollmentStatus;
    bukti_pembayaran: string | null;
    foto: string | null;
    created_at: string | null;
}

interface Props {
    anakList: Child[];
}

/* ═══════════════════════════════════════════════════════════
   HELPERS & CONFIG
═══════════════════════════════════════════════════════════ */
const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; badgeCls: string; textCls: string; icon: React.ReactNode }> = {
    active: {
        label: 'Aktif',
        badgeCls: 'bg-green-400/20 text-green-100 border-green-400/30',
        textCls: 'text-green-600',
        icon: <CheckCircle2 size={14} className="text-green-600" />,
    },
    pending: {
        label: 'Menunggu',
        badgeCls: 'bg-amber-400/20 text-amber-100 border-amber-400/30',
        textCls: 'text-amber-500',
        icon: <Clock size={14} className="text-amber-500" />,
    },
    inactive: {
        label: 'Tidak Aktif',
        badgeCls: 'bg-white/10 text-white/50 border-white/20',
        textCls: 'text-slate-400',
        icon: <XCircle size={14} className="text-slate-400" />,
    },
};

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

const inits = (n: string) =>
    n
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AnakPage({ anakList }: Props) {
    const activeCount = anakList.filter((c) => c.enrollment_status === 'active').length;
    const pendingCount = anakList.filter((c) => c.enrollment_status === 'pending').length;

    const [children, setChildren] = useState(anakList);
    const fotoInputRef = useRef<HTMLInputElement>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const parentName = auth?.user?.name || 'Wali Murid';

    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [adminWa, setAdminWa] = useState('6281285723834'); // Default fallback

    useEffect(() => {
        fetch('/api/info/profile')
            .then((r) => r.json())
            .then((j) => {
                if (!j.success || !j.data) return;
                const d = j.data;
                if (d.whatsapp) {
                    const digits = d.whatsapp.replace(/\D/g, '');
                    setAdminWa(digits.startsWith('0') ? '62' + digits.slice(1) : digits || '6281285723834');
                }
            })
            .catch(() => {});
    }, []);

    const handleFotoClick = (id: string) => {
        setUploadingId(id);
        fotoInputRef.current?.click();
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingId) return;
        e.target.value = '';

        // Validasi format file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setToast({ msg: 'Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WEBP.', ok: false });
            setUploadingId(null);
            setTimeout(() => setToast(null), 3000);
            return;
        }

        // Validasi ukuran file (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setToast({ msg: 'Ukuran file terlalu besar. Maksimal ukuran adalah 2MB.', ok: false });
            setUploadingId(null);
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setCropFile(file);
        setIsCropperOpen(true);
    };

    const handleCropComplete = async (croppedFile: File) => {
        setIsCropperOpen(false);
        setCropFile(null);

        if (!uploadingId) return;

        const fd = new FormData();
        fd.append('foto', croppedFile);
        try {
            const j = await (await fetch(`/api/parent/children/${uploadingId}/foto`, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })).json();
            if (j.success) {
                setChildren((prev) => prev.map((c) => c.id === uploadingId ? { ...c, foto: j.foto } : c));
                setToast({ msg: 'Foto berhasil diperbarui.', ok: true });
            } else {
                setToast({ msg: j.message ?? 'Gagal mengupload foto.', ok: false });
            }
        } catch {
            setToast({ msg: 'Gagal mengupload foto.', ok: false });
        } finally {
            setUploadingId(null);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleCropClose = () => {
        setIsCropperOpen(false);
        setCropFile(null);
        setUploadingId(null);
    };

    return (
        <>
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        <div className="flex flex-col gap-5 w-full animate-[fadeIn_0.3s_ease-out]">
            {/* ════ HEADER ════ */}
            <div className="flex flex-col md:flex-row justify-between md:items-end flex-wrap gap-4 mb-2">
                <div>
                    <h1 className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">Anak Saya</h1>
                    <p className="text-[13px] text-slate-500 mt-1.5 font-bold italic">{anakList.length > 0 ? `${anakList.length} anak terdaftar · ${activeCount} aktif · ${pendingCount} menunggu` : 'Belum ada anak yang didaftarkan'}</p>
                </div>
                <button
                    onClick={() => router.visit(route('parents.daftar'))}
                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-[#1B6B3A] text-white text-[14px] font-black shadow-lg shadow-green-900/20 transition-all hover:bg-[#14522d] active:scale-95 focus:outline-none w-full md:w-auto"
                >
                    <Plus size={18} strokeWidth={3} /> Daftarkan Anak
                </button>
            </div>

            {/* ════ STATS GRID ════ */}
            {anakList.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-2">
                    {[
                        { icon: Baby, bg: 'bg-teal-50', c: 'text-teal-700', v: anakList.length, l: 'Total Anak' },
                        { icon: CheckCircle2, bg: 'bg-green-50', c: 'text-green-600', v: activeCount, l: 'Status Aktif' },
                        { icon: Clock, bg: 'bg-amber-50', c: 'text-amber-500', v: pendingCount, l: 'Menunggu' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform active:scale-95">
                            <div className={`w-12 h-12 rounded-[1rem] shrink-0 flex items-center justify-center ${s.bg} ${s.c}`}>
                                <s.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-[22px] font-black text-slate-900 leading-none">{s.v}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{s.l}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ════ EMPTY STATE ════ */}
            {anakList.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-10 md:p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-teal-50 border border-teal-100 rounded-[2rem] flex items-center justify-center mb-2">
                        <Baby size={40} className="text-[#1B6B3A]" />
                    </div>
                    <div className="text-[20px] font-black text-slate-900">Belum Ada Anak Terdaftar</div>
                    <p className="text-[13px] font-bold text-slate-400 max-w-sm leading-relaxed">Daftarkan anak Anda ke program QLC untuk mulai memantau perkembangan mereka.</p>
                    <button
                        onClick={() => router.visit(route('parents.daftar'))}
                        className="mt-2 flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-amber-500 text-white text-[14px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none"
                    >
                        <Plus size={18} strokeWidth={3} /> Daftarkan Sekarang
                    </button>
                </div>
            ) : (
                /* ════ CHILD CARDS GRID ════ */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {children.map((child) => {
                        const st = STATUS_CONFIG[child.enrollment_status] ?? STATUS_CONFIG.pending;
                        return (
                            <div 
                                key={child.id} 
                                onClick={() => setSelectedChildId(child.id)}
                                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-transform active:scale-[0.98] flex flex-col cursor-pointer"
                            >
                                {/* Card Header (Gradient) */}
                                <div className="bg-gradient-to-br from-[#1B6B3A] via-[#0d5c56] to-blue-700 p-5 flex items-center gap-4 relative overflow-hidden">
                                    {/* Decor */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                                    {/* Avatar */}
                                    <button
                                        className="relative w-14 h-14 rounded-[1.2rem] shrink-0 overflow-hidden border-2 border-white/30 shadow-md z-10 group/av focus:outline-none"
                                        title="Klik untuk ganti foto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFotoClick(child.id);
                                        }}
                                        disabled={uploadingId === child.id}
                                    >
                                        {child.foto
                                            ? <img src={child.foto} alt={child.nama} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-white/20 flex items-center justify-center text-[18px] font-black text-white">{inits(child.nama)}</div>
                                        }
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity">
                                            {uploadingId === child.id
                                                ? <Loader2 size={16} className="text-white animate-spin" />
                                                : <Camera size={16} className="text-white" />
                                            }
                                        </div>
                                    </button>

                                    <div className="flex-1 relative z-10 min-w-0">
                                        <div className="text-[16px] font-black text-white leading-tight truncate">{child.nama}</div>
                                        <div className="text-[11px] font-bold text-white/80 mt-1 truncate">
                                            {child.tempat_lahir}
                                            {child.usia ? ` · ${child.usia} tahun` : ''}
                                        </div>
                                    </div>

                                    {/* Status Badge Top */}
                                    <span className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider relative z-10 border ${st.badgeCls}`}>{st.label}</span>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex flex-col gap-4 flex-1">
                                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-teal-50 border border-teal-100/50">
                                        <GraduationCap size={18} className="text-[#1B6B3A] shrink-0" />
                                        {child.program_name ? <span className="text-[13px] font-black text-[#1B6B3A]">{child.program_name}</span> : <span className="text-[12px] font-bold text-slate-400 italic">Program tidak ditemukan</span>}
                                    </div>

                                    <div className="flex flex-col gap-2.5 px-1">
                                        <div className="flex items-center gap-3 text-[12.5px]">
                                            <Calendar size={14} className="text-slate-400 shrink-0" />
                                            <span className="font-bold text-slate-500 w-20">Tgl Lahir</span>
                                            <span className="font-black text-slate-800 truncate">{fmtDate(child.tanggal_lahir)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[12.5px]">
                                            <Clock size={14} className="text-slate-400 shrink-0" />
                                            <span className="font-bold text-slate-500 w-20">Didaftarkan</span>
                                            <span className="font-black text-slate-800 truncate">{fmtDate(child.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-3">
                                    {child.bukti_pembayaran ? (
                                        <a
                                            href={child.bukti_pembayaran}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-700 hover:bg-blue-100 transition-colors active:scale-95 focus:outline-none"
                                        >
                                            <FileText size={14} />
                                            Bukti Bayar
                                            <ExternalLink size={12} className="opacity-70" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] font-bold text-slate-400 italic bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/50">Belum ada bukti</span>
                                    )}

                                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        {st.icon}
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${st.textCls}`}>{st.label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <input ref={fotoInputRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoChange} />

        {isCropperOpen && cropFile && (
            <ImageCropperModal
                file={cropFile}
                onClose={handleCropClose}
                onCrop={handleCropComplete}
            />
        )}

        {selectedChildId && children.find(c => c.id === selectedChildId) && (
            <DetailAnakModal
                child={children.find(c => c.id === selectedChildId)!}
                onClose={() => setSelectedChildId(null)}
                onGantiFoto={() => handleFotoClick(selectedChildId)}
                uploading={uploadingId === selectedChildId}
                adminWa={adminWa}
                parentName={parentName}
            />
        )}

        {toast && (
            <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${toast.ok ? 'bg-teal-700' : 'bg-red-600'}`}>
                {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {toast.msg}
            </div>
        )}
        </>
    );
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function DetailAnakModal({
    child,
    onClose,
    onGantiFoto,
    uploading,
    adminWa,
    parentName,
}: {
    child: Child;
    onClose: () => void;
    onGantiFoto: () => void;
    uploading: boolean;
    adminWa: string;
    parentName: string;
}) {
    const displayBirthDate = fmtDate(child.tanggal_lahir);
    
    const waMessage = `Halo Admin QLC, saya ${parentName}, orang tua dari ${child.nama}. Saya ingin mengajukan perubahan data anak saya. Mohon bantuannya.`;
    const waLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

    return createPortal(
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />

            {/* Modal Box */}
            <div className="relative w-full max-w-[460px] bg-white border border-slate-200 rounded-[28px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-[slideUp_0.3s_ease-out] z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-black text-slate-900">Detail Informasi Anak</span>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors focus:outline-none cursor-pointer"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center gap-6">
                    
                    {/* Foto Profil & Tombol Ganti */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg ring-4 ring-teal-50 shrink-0">
                            {child.foto ? (
                                <img src={child.foto} alt={child.nama} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#1B6B3A] to-[#0d5c56] flex items-center justify-center text-[36px] font-black text-white">
                                    {inits(child.nama)}
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 size={24} className="text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={onGantiFoto}
                            disabled={uploading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1B6B3A]/10 text-slate-700 hover:text-[#1B6B3A] text-xs font-bold transition-colors active:scale-95 focus:outline-none cursor-pointer"
                        >
                            <Camera size={14} /> Ganti Foto Profil
                        </button>
                    </div>

                    {/* Data Grid */}
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="grid grid-cols-3 text-[13px] border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Nama</span>
                            <span className="col-span-2 font-black text-slate-800 text-right">{child.nama}</span>
                        </div>
                        <div className="grid grid-cols-3 text-[13px] border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Program</span>
                            <span className="col-span-2 font-black text-teal-700 text-right bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100/50 w-fit ml-auto">
                                {child.program_name || '—'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 text-[13px] border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Tempat Lahir</span>
                            <span className="col-span-2 font-black text-slate-800 text-right">{child.tempat_lahir}</span>
                        </div>
                        <div className="grid grid-cols-3 text-[13px] border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Tgl Lahir</span>
                            <span className="col-span-2 font-black text-slate-800 text-right">{displayBirthDate}</span>
                        </div>
                        <div className="grid grid-cols-3 text-[13px] border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Usia</span>
                            <span className="col-span-2 font-black text-slate-800 text-right">{child.usia ? `${child.usia} tahun` : '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 rounded-b-[28px]">
                    <a 
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="h-12 w-full rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-[14px] font-black flex items-center justify-center gap-2 shadow-md shadow-green-600/10 transition-colors focus:outline-none cursor-pointer"
                    >
                        <MessageCircle size={18} strokeWidth={2.5} /> Hubungi Admin (Ubah Data)
                    </a>
                    <button 
                        onClick={onClose}
                        className="h-11 w-full rounded-xl text-slate-500 bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}
