'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, GraduationCap, Loader2, AlertCircle, CheckCircle2, Calendar, Filter, ChevronDown, Users, FileText, ExternalLink, Clock, CheckCheck, XCircle, Check, Activity, Upload, Camera } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type EnrollmentStatus = 'active' | 'inactive' | 'pending';

interface Student {
    id: string;
    parent_id: string | null;
    parent_name: string | null;
    program_id: string | null;
    program_name: string | null;
    nama: string;
    usia: number | null;
    tempat_lahir: string;
    tanggal_lahir: string;
    enrollment_status: EnrollmentStatus;
    bukti_pembayaran: string | null;
    foto: string | null;
    created_at: string | null;
}

interface Meta {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
}

interface Option {
    id: string;
    label: string;
}

interface StudentForm {
    parent_id: string;
    program_id: string;
    nama: string;
    usia: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    enrollment_status: EnrollmentStatus;
    bukti_pembayaran?: File | null; // Tambahkan ini
}

const EMPTY_FORM: StudentForm = {
    parent_id: '',
    program_id: '',
    nama: '',
    usia: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    enrollment_status: 'active',
    bukti_pembayaran: null,
};

const API = '/api/students';

/* ── Helpers ── */
function useDebounce<T>(val: T, ms = 400): T {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}

const initials = (n: string) =>
    n
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? String(age) : '0';
};

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; cls: string; dotCls: string; icon: React.ReactNode }> = {
    active: { label: 'Aktif', cls: 'bg-green-50 border-green-200 text-green-700', dotCls: 'bg-green-600', icon: <CheckCheck size={11} /> },
    inactive: { label: 'Tidak Aktif', cls: 'bg-slate-100 border-slate-200 text-slate-600', dotCls: 'bg-slate-500', icon: <XCircle size={11} /> },
    pending: { label: 'Menunggu', cls: 'bg-amber-50 border-amber-200 text-amber-700', dotCls: 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.6)] animate-pulse', icon: <Clock size={11} /> },
};

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return createPortal(
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 py-3 px-5 rounded-xl text-[13.5px] font-bold text-white shadow-xl animate-[fadeIn_0.2s_ease-out] ${type === 'success' ? 'bg-teal-700' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {msg}
        </div>,
        document.body
    );
}

/* ════════════════════════════════════════════════
   FORM MODAL
════════════════════════════════════════════════ */
function FormModal({ mode, init, student, parents, programs, onClose, onSave }: { mode: 'add' | 'edit'; init: StudentForm; student: Student | null; parents: Option[]; programs: Option[]; onClose: () => void; onSave: (d: StudentForm) => Promise<void> }) {
    const [f, setF] = useState<StudentForm>(init);
    const [e, setE] = useState<Partial<Record<keyof StudentForm, string>>>({});
    const [busy, setBusy] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    // Otomatis pilih QL - SCHOOL saat tambah data baru
    useEffect(() => {
        if (mode === 'add' && !f.program_id && programs.length > 0) {
            const targetProgram = programs.find((p) => p.label.toUpperCase().includes('QL - SCHOOL'));
            const qlSchoolId = targetProgram ? targetProgram.id : '69ecdbca04db090989004f5b';
            setF((prev) => ({ ...prev, program_id: qlSchoolId }));
        }
    }, [programs, mode]);

    const upd = (k: keyof StudentForm) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const val = ev.target.value;
        setF((p) => {
            const newForm = { ...p, [k]: val };
            // Hitung usia otomatis ketika tanggal lahir berubah
            if (k === 'tanggal_lahir') {
                newForm.usia = calculateAge(val);
                setE((err) => ({ ...err, usia: '' }));
            }
            return newForm;
        });
        setE((p) => ({ ...p, [k]: '' }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setF((p) => ({ ...p, bukti_pembayaran: file }));
        if (file.type.startsWith('image/')) {
            setPreviewFile(URL.createObjectURL(file));
        } else {
            setPreviewFile(null);
        }
        setE((err) => ({ ...err, bukti_pembayaran: '' }));
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setF((p) => ({ ...p, bukti_pembayaran: null }));
        setPreviewFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validate = () => {
        const err: Partial<Record<keyof StudentForm, string>> = {};
        if (!f.nama.trim()) err.nama = 'Nama wajib diisi.';
        if (!f.parent_id) err.parent_id = 'Wali murid wajib dipilih.';
        if (!f.tempat_lahir.trim()) err.tempat_lahir = 'Tempat lahir wajib diisi.';
        if (!f.tanggal_lahir) err.tanggal_lahir = 'Tanggal lahir wajib diisi.';
        if (!f.usia || isNaN(Number(f.usia)) || Number(f.usia) < 0) err.usia = 'Usia tidak valid.';
        setE(err);
        return !Object.keys(err).length;
    };

    const submit = async () => {
        if (!validate()) return;
        setBusy(true);
        try {
            await onSave(f);
        } finally {
            setBusy(false);
        }
    };

    const isPending = student?.enrollment_status === 'pending';

    return createPortal(
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
            <div className="w-full max-w-[560px] max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[28px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
                {/* Header Modal */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <span className="text-[17px] font-black text-slate-900">{mode === 'add' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 active:scale-90 transition-all focus:outline-none" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="px-7 py-6 flex flex-col gap-5 overflow-y-auto flex-1 scrollbar-hide">
                    {/* Notice untuk siswa pending */}
                    {mode === 'edit' && isPending && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-[13px] text-amber-800 font-medium leading-relaxed">
                                Siswa ini mendaftar melalui portal wali murid dan menunggu verifikasi. Ubah status ke <b className="font-extrabold">Aktif</b> untuk menyetujui, atau <b className="font-extrabold">Tidak Aktif</b> untuk menolak.
                            </div>
                        </div>
                    )}

                    {/* Data Pribadi Section */}
                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 my-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">Data Pribadi</div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Nama Lengkap</label>
                        <input
                            className={`h-12 px-4 bg-slate-50 border rounded-2xl text-sm font-bold transition-all outline-none focus:bg-white focus:ring-4 ${e.nama ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            value={f.nama}
                            onChange={upd('nama')}
                            placeholder="Nama Lengkap"
                        />
                        {e.nama && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.nama}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Tanggal Lahir (Usia terisi otomatis)</label>
                        <input
                            type="date"
                            className={`appearance-none h-12 px-4 bg-slate-50 border rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 transition-all outline-none ${e.tanggal_lahir ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                            value={f.tanggal_lahir}
                            onChange={upd('tanggal_lahir')}
                        />
                        {e.tanggal_lahir && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.tanggal_lahir}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Usia (Otomatis)</label>
                            <input
                                type="number"
                                min={0}
                                readOnly
                                className="h-12 px-4 bg-slate-100 border border-transparent rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                                value={f.usia}
                                placeholder="—"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Tempat Lahir</label>
                            <input
                                className={`h-12 px-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 transition-all outline-none ${e.tempat_lahir ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                                value={f.tempat_lahir}
                                onChange={upd('tempat_lahir')}
                                placeholder="Kota"
                            />
                            {e.tempat_lahir && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.tempat_lahir}</span>}
                        </div>
                    </div>

                    {/* Relasi & Program Section */}
                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 my-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">Wali Murid & Program</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Wali Murid</label>
                            <div className="relative">
                                <select
                                    className={`h-12 w-full px-4 pr-10 bg-slate-50 border rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 transition-all outline-none appearance-none ${e.parent_id ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                                    value={f.parent_id}
                                    onChange={upd('parent_id')}
                                >
                                    <option value="">— Pilih Wali —</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {e.parent_id && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.parent_id}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Program</label>
                            <div className="relative">
                                <select
                                    className={`h-12 w-full px-4 pr-10 bg-slate-50 border rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 transition-all outline-none appearance-none ${e.program_id ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-[#1B6B3A] focus:ring-[#1B6B3A]/10'}`}
                                    value={f.program_id}
                                    onChange={upd('program_id')}
                                >
                                    <option value="">— Pilih Program —</option>
                                    {programs.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {e.program_id && <span className="text-[11px] text-red-600 font-bold mt-0.5">{e.program_id}</span>}
                        </div>
                    </div>

                    {/* ════ BUKTI PEMBAYARAN ════ */}
                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 my-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">Bukti Pembayaran</div>
                    
                    <div className="flex flex-col gap-1.5">
                        {/* File Saat Ini (Hanya muncul saat mode edit & ada file lama & belum upload file baru) */}
                        {mode === 'edit' && student?.bukti_pembayaran && !f.bukti_pembayaran && (
                            <div className="flex items-center justify-between p-3.5 mb-2 rounded-xl bg-blue-50 border border-blue-100">
                                <div className="flex items-center gap-2 text-[13.5px] text-blue-700 font-bold">
                                    <FileText size={18} />
                                    <span>File saat ini tersimpan</span>
                                </div>
                                <a
                                    href={student.bukti_pembayaran}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-px hover:bg-blue-700 focus:outline-none"
                                >
                                    <ExternalLink size={14} /> Lihat File
                                </a>
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${f.bukti_pembayaran ? 'border-[#1B6B3A] bg-green-50' : 'border-slate-300 hover:border-[#1B6B3A] hover:bg-slate-50'}`}
                        >
                            {f.bukti_pembayaran ? (
                                <div className="space-y-2">
                                    {previewFile ? (
                                        <img src={previewFile} alt="preview" className="mx-auto max-h-32 rounded-lg object-contain shadow-sm border border-slate-200" />
                                    ) : (
                                        <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto flex items-center justify-center">
                                            <CheckCircle2 size={24} className="text-green-600" />
                                        </div>
                                    )}
                                    <p className="text-sm font-bold text-green-700 truncate px-4">{f.bukti_pembayaran.name}</p>
                                    <button type="button" onClick={removeFile} className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1 mx-auto hover:text-red-700">
                                        <X size={12} /> Batal / Hapus
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto flex items-center justify-center">
                                        <Upload size={22} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">
                                        {mode === 'edit' && student?.bukti_pembayaran ? 'Klik untuk mengganti file bukti pembayaran' : 'Klik untuk unggah file bukti pembayaran'}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400">Format: JPG, PNG, atau PDF</p>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 my-1 before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">Status Pendaftaran</div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <button
                            type="button"
                            className={`flex-1 h-12 px-3 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all focus:outline-none ${f.enrollment_status === 'active' ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700'}`}
                            onClick={() => setF((p) => ({ ...p, enrollment_status: 'active' }))}
                        >
                            <CheckCheck size={16} /> Aktif
                        </button>
                        <button
                            type="button"
                            className={`flex-1 h-12 px-3 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all focus:outline-none ${f.enrollment_status === 'pending' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700'}`}
                            onClick={() => setF((p) => ({ ...p, enrollment_status: 'pending' }))}
                        >
                            <Clock size={16} /> Menunggu
                        </button>
                        <button
                            type="button"
                            className={`flex-1 h-12 px-3 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all focus:outline-none ${f.enrollment_status === 'inactive' ? 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/20' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700'}`}
                            onClick={() => setF((p) => ({ ...p, enrollment_status: 'inactive' }))}
                        >
                            <XCircle size={16} /> Tidak Aktif
                        </button>
                    </div>
                </div>

                <div className="px-7 py-5 bg-slate-50 rounded-b-[28px] flex gap-3 border-t border-slate-100">
                    <button className="flex-1 h-12 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 active:scale-95 transition-all focus:outline-none" onClick={onClose}>
                        Batal
                    </button>
                    <button className="flex-[2] h-12 rounded-2xl text-sm font-black text-white bg-[#1B6B3A] shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#14522d] focus:outline-none" onClick={submit} disabled={busy}>
                        {busy ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Check size={18} /> {mode === 'add' ? 'Tambah Siswa' : 'Simpan Perubahan'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── Delete Modal ── */
function DeleteModal({ student, onClose, onConfirm }: { student: Student; onClose: () => void; onConfirm: () => Promise<void> }) {
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
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
            <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-[28px] shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
                <div className="pt-8 px-7 pb-5 text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 text-red-600 flex items-center justify-center shadow-inner border border-red-100">
                        <Trash2 size={28} />
                    </div>
                    <div className="text-[20px] font-black text-slate-900 mt-2">Hapus Siswa?</div>
                    <div className="text-[14px] text-slate-500 leading-relaxed px-2 font-medium">
                        Data siswa <b className="text-slate-700">{student.nama}</b> akan dihapus permanen dan tidak dapat dikembalikan.
                    </div>
                </div>

                <div className="flex gap-3 px-7 pb-7 mt-2">
                    <button className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 focus:outline-none" onClick={onClose}>
                        Batal
                    </button>
                    <button className="flex-1 h-12 rounded-2xl text-[14px] font-black text-white bg-red-600 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 focus:outline-none" onClick={go} disabled={busy}>
                        {busy ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} /> Hapus
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
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SiswaPage() {
    const [data, setData] = useState<Student[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, per_page: 10, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterProgram, setFilterProgram] = useState('');

    const [statusOpen, setStatusOpen] = useState(false);
    const [programOpen, setProgramOpen] = useState(false);

    const [parents, setParents] = useState<Option[]>([]);
    const [programs, setPrograms] = useState<Option[]>([]);

    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [sel, setSel] = useState<Student | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const fotoInputRef = useRef<HTMLInputElement>(null);
    const [uploadingFotoId, setUploadingFotoId] = useState<string | null>(null);

    const dSearch = useDebounce(search);

    const loadOptions = useCallback(async () => {
        try {
            const j = await (await fetch(`${API}/options`)).json();
            if (j.success) {
                setParents(j.parents);
                setPrograms(j.programs);
            }
        } catch {}
    }, []);

    const load = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const p = new URLSearchParams({
                    page: String(page),
                    per_page: '10',
                    search: dSearch,
                    status: filterStatus,
                    program_id: filterProgram,
                });
                const j = await (await fetch(`${API}?${p}`)).json();
                if (j.success) {
                    setData(j.data);
                    setMeta(j.meta);
                }
            } catch {
                setToast({ msg: 'Gagal memuat data.', type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [dSearch, filterStatus, filterProgram]
    );

    useEffect(() => {
        load(1);
    }, [load]);
    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    // Helper untuk mengubah data JSON menjadi format multipart/form-data
    const buildFormData = (d: StudentForm) => {
        const formData = new FormData();
        Object.keys(d).forEach((key) => {
            const val = d[key as keyof StudentForm];
            if (val instanceof File) {
                formData.append(key, val);
            } else if (val !== null && val !== undefined && val !== '') {
                formData.append(key, String(val));
            }
        });
        return formData;
    };

    const post = async (d: StudentForm) => {
        const formData = buildFormData(d);
        
        const j = await (
            await fetch(API, {
                method: 'POST',
                headers: { Accept: 'application/json' }, // Tidak pakai Content-Type json, biarkan browser atur boundry
                body: formData,
            })
        ).json();
        
        if (j.success) {
            setToast({ msg: 'Siswa berhasil ditambahkan.', type: 'success' });
            setModal(null);
            load(1);
        } else if (j.errors) {
            const firstErr = Object.values(j.errors as Record<string, string[]>)[0]?.[0];
            setToast({ msg: firstErr ?? 'Validasi gagal.', type: 'error' });
        } else {
            setToast({ msg: j.message ?? 'Gagal menambahkan.', type: 'error' });
        }
    };

    const put = async (d: StudentForm) => {
        if (!sel) return;
        const formData = buildFormData(d);
        formData.append('_method', 'PUT'); // Trick POST jadi PUT untuk Laravel karena FormData

        const j = await (
            await fetch(`${API}/${sel.id}`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
            })
        ).json();
        
        if (j.success) {
            setToast({ msg: 'Data berhasil diperbarui.', type: 'success' });
            setModal(null);
            load(meta.page);
        } else {
            setToast({ msg: j.message ?? 'Gagal memperbarui.', type: 'error' });
        }
    };

    const del = async () => {
        if (!sel) return;
        const j = await (
            await fetch(`${API}/${sel.id}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            })
        ).json();
        if (j.success) {
            setToast({ msg: 'Siswa berhasil dihapus.', type: 'success' });
            setModal(null);
            load(data.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page);
        } else {
            setToast({ msg: j.message ?? 'Gagal menghapus.', type: 'error' });
        }
    };

    const handleFotoClick = (studentId: string) => {
        setUploadingFotoId(studentId);
        fotoInputRef.current?.click();
    };

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingFotoId) return;
        e.target.value = '';
        const fd = new FormData();
        fd.append('foto', file);
        try {
            const j = await (await fetch(`${API}/${uploadingFotoId}/foto`, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })).json();
            if (j.success) {
                setData((prev) => prev.map((s) => s.id === uploadingFotoId ? { ...s, foto: j.foto } : s));
                setToast({ msg: 'Foto berhasil diperbarui.', type: 'success' });
            } else {
                setToast({ msg: j.message ?? 'Gagal mengupload foto.', type: 'error' });
            }
        } catch {
            setToast({ msg: 'Gagal mengupload foto.', type: 'error' });
        } finally {
            setUploadingFotoId(null);
        }
    };

    const pgs = () => {
        const { page, last_page } = meta;
        const s = Math.max(1, page - 2),
            e = Math.min(last_page, page + 2);
        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    };

    const openEdit = (s: Student) => {
        setSel(s);
        setModal('edit');
    };

    const editInit: StudentForm = sel
        ? {
              parent_id: sel.parent_id ?? '',
              program_id: sel.program_id ?? '',
              nama: sel.nama,
              usia: String(sel.usia ?? ''),
              tempat_lahir: sel.tempat_lahir,
              tanggal_lahir: sel.tanggal_lahir,
              enrollment_status: sel.enrollment_status,
              bukti_pembayaran: null, // Kita kosongkan agar state mengurus file input secara terpisah dari string url lama
          }
        : EMPTY_FORM;

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(15px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}</style>

            <div className={`flex flex-col gap-6 w-full text-slate-900 pb-10 ${modal ? 'opacity-40 pointer-events-none select-none transition-opacity duration-200' : ''}`}>
                {/* ════ HEADER & STATS (GRID 4 ANDROID OPTIMIZED) ════ */}
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-end flex-wrap gap-3">
                        <div>
                            <div className="text-[24px] md:text-[28px] font-black text-slate-900 tracking-tight leading-none">Manajemen Siswa</div>
                            <div className="text-[13px] text-slate-500 mt-1.5 font-bold">Kelola seluruh data siswa yang terdaftar di sistem</div>
                        </div>
                    </div>
                </div>

                {/* ════ TOOLBAR ════ */}
                <div className="flex gap-3 flex-wrap items-center flex-col sm:flex-row mt-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[220px] w-full sm:w-auto h-12 px-4 bg-white border border-slate-300 rounded-[1.2rem] transition-all focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500 focus-within:shadow-sm">
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <input placeholder="Cari nama, tempat lahir..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-[14px] font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-slate-400 placeholder:font-medium" />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-slate-400 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 transition-colors hover:bg-red-100 hover:text-red-600 cursor-pointer focus:outline-none">
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <div
                            className={`flex items-center gap-2 h-12 px-4 min-w-[170px] bg-white border rounded-[1.2rem] cursor-pointer select-none transition-all hover:bg-slate-50 ${statusOpen ? 'ring-4 ring-amber-500/10 border-amber-500' : 'border-slate-300'}`}
                            onClick={() => setStatusOpen(!statusOpen)}
                        >
                            <Filter size={16} className="text-slate-400 shrink-0" />
                            <span className="flex-1 text-[13.5px] font-bold text-slate-700 text-left truncate">{filterStatus === 'active' ? 'Aktif' : filterStatus === 'pending' ? 'Menunggu' : filterStatus === 'inactive' ? 'Tidak Aktif' : 'Semua Status'}</span>
                            <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {statusOpen && (
                            <>
                                <div className="fixed inset-0 z-[99]" onClick={() => setStatusOpen(false)} />
                                <div className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white border border-slate-200 rounded-[1.2rem] shadow-xl p-2 flex flex-col gap-1 z-[100] animate-[fadeIn_0.15s_ease-out]">
                                    {[
                                        { val: '', label: 'Semua Status' },
                                        { val: 'active', label: 'Aktif' },
                                        { val: 'pending', label: 'Menunggu' },
                                        { val: 'inactive', label: 'Tidak Aktif' },
                                    ].map((opt) => (
                                        <div
                                            key={opt.val}
                                            className={`p-3 rounded-xl text-[13px] font-bold cursor-pointer transition-colors flex items-center justify-between ${filterStatus === opt.val ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-amber-700'}`}
                                            onClick={() => {
                                                setFilterStatus(opt.val);
                                                setStatusOpen(false);
                                            }}
                                        >
                                            <span>{opt.label}</span>
                                            {filterStatus === opt.val && <Check size={16} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {programs.length > 0 && (
                        <div className="relative w-full sm:w-auto">
                            {programOpen && (
                                <>
                                    <div className="fixed inset-0 z-[99]" onClick={() => setProgramOpen(false)} />
                                    <div className="absolute top-[calc(100%+8px)] right-0 min-w-[240px] bg-white border border-slate-200 rounded-[1.2rem] shadow-xl p-2 flex flex-col gap-1 z-[100] animate-[fadeIn_0.15s_ease-out]">
                                        <div
                                            className={`p-3 rounded-xl text-[13px] font-bold cursor-pointer transition-colors flex items-center justify-between ${filterProgram === '' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-amber-700'}`}
                                            onClick={() => {
                                                setFilterProgram('');
                                                setProgramOpen(false);
                                            }}
                                        >
                                            <span>Semua Program</span>
                                            {filterProgram === '' && <Check size={16} />}
                                        </div>
                                        {programs.map((p) => (
                                            <div
                                                key={p.id}
                                                className={`p-3 rounded-xl text-[13px] font-bold cursor-pointer transition-colors flex items-center justify-between ${filterProgram === p.id ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-amber-700'}`}
                                                onClick={() => {
                                                    setFilterProgram(p.id);
                                                    setProgramOpen(false);
                                                }}
                                            >
                                                <span>{p.label}</span>
                                                {filterProgram === p.id && <Check size={16} />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <button
                        className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-[1.2rem] bg-amber-500 text-white text-[14px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none"
                        onClick={() => {
                            setSel(null);
                            setModal('add');
                        }}
                    >
                        <Plus size={18} strokeWidth={3} /> Tambah Siswa
                    </button>
                </div>

                {/* ════ TABLE ════ */}
                <div className="relative bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto relative z-10 w-full scrollbar-hide">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">#</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Siswa</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Wali Murid</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Program</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Tgl Lahir</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">Bukti Bayar</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap">Status</th>
                                    <th className="px-5 lg:px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading &&
                                    data.map((s, i) => {
                                        const stCfg = STATUS_CONFIG[s.enrollment_status];
                                        return (
                                            <tr key={s.id} className="transition-colors hover:bg-slate-50 group border-b border-slate-100 last:border-0">
                                                <td className="px-5 lg:px-6 py-4 text-[13px] font-bold text-slate-400">{(meta.page - 1) * meta.per_page + i + 1}</td>

                                                {/* Siswa */}
                                                <td className="px-5 lg:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="relative w-11 h-11 rounded-2xl shrink-0 overflow-hidden group/avatar focus:outline-none"
                                                            title="Klik untuk ganti foto"
                                                            onClick={() => handleFotoClick(s.id)}
                                                            disabled={uploadingFotoId === s.id}
                                                        >
                                                            {s.foto ? (
                                                                <img src={s.foto} alt={s.nama} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center font-black text-[15px] text-white tracking-wide shadow-md ${s.enrollment_status === 'pending' ? 'bg-amber-400' : 'bg-amber-500'}`}>
                                                                    {initials(s.nama)}
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                                {uploadingFotoId === s.id
                                                                    ? <Loader2 size={14} className="text-white animate-spin" />
                                                                    : <Camera size={14} className="text-white" />
                                                                }
                                                            </div>
                                                        </button>
                                                        <div className="min-w-0">
                                                            <div className="text-[14px] font-black text-slate-900 tracking-tight truncate max-w-[150px] lg:max-w-[200px]">{s.nama}</div>
                                                            <div className="text-[11.5px] font-bold text-slate-500 mt-0.5 truncate">
                                                                {s.tempat_lahir} · {s.usia ? `${s.usia} thn` : '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Wali Murid */}
                                                <td className="px-5 lg:px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                                                        <Users size={16} className="text-slate-400 shrink-0" />
                                                        {s.parent_name ?? <span className="text-slate-400 italic font-medium">Tidak ada</span>}
                                                    </div>
                                                </td>

                                                {/* Program */}
                                                <td className="px-5 lg:px-6 py-4">
                                                    {s.program_name ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-[11.5px] font-black text-amber-700 whitespace-nowrap">
                                                            <GraduationCap size={14} />
                                                            {s.program_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[13px] text-slate-400 font-bold">—</span>
                                                    )}
                                                </td>

                                                {/* Tgl Lahir */}
                                                <td className="px-5 lg:px-6 py-4 text-[13px] text-slate-600 font-bold hidden md:table-cell">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-slate-400 shrink-0" />
                                                        {formatDate(s.tanggal_lahir)}
                                                    </span>
                                                </td>

                                                {/* Bukti Pembayaran */}
                                                <td className="px-5 lg:px-6 py-4 hidden lg:table-cell">
                                                    {s.bukti_pembayaran ? (
                                                        <a
                                                            href={s.bukti_pembayaran}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[11.5px] font-black text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none whitespace-nowrap active:scale-95"
                                                            title="Klik untuk preview"
                                                        >
                                                            <FileText size={14} /> Lihat Bukti <ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[13px] text-slate-400 font-bold">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 lg:px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-black whitespace-nowrap border ${stCfg.cls}`}>
                                                        <span className={`w-2 h-2 rounded-full ${stCfg.dotCls}`} />
                                                        {stCfg.label}
                                                    </span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-5 lg:px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-blue-600 shadow-sm transition-all hover:bg-blue-50 hover:border-blue-200 active:scale-90 focus:outline-none"
                                                            title="Edit"
                                                            onClick={() => openEdit(s)}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-200 active:scale-90 focus:outline-none"
                                                            title="Hapus"
                                                            onClick={() => {
                                                                setSel(s);
                                                                setModal('delete');
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div className="py-20 px-5 flex justify-center w-full">
                            <Loader2 size={36} className="text-amber-500 animate-spin" />
                        </div>
                    )}

                    {!loading && data.length === 0 && (
                        <div className="py-20 px-5 text-center flex flex-col items-center gap-3 w-full">
                            <GraduationCap size={56} className="text-slate-200 mb-2" />
                            <div className="text-[14px] text-slate-500 font-bold">{search || filterStatus || filterProgram ? 'Tidak ada siswa yang sesuai filter.' : 'Belum ada siswa terdaftar.'}</div>
                            {!search && !filterStatus && !filterProgram && (
                                <button className="mt-4 flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-amber-500 text-white text-[13.5px] font-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 focus:outline-none" onClick={() => setModal('add')}>
                                    <Plus size={18} /> Tambah Siswa Pertama
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100 flex-wrap gap-4 bg-slate-50/50 w-full">
                            <span className="text-[13px] font-bold text-slate-500">
                                {(meta.page - 1) * meta.per_page + 1}–{Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} siswa
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black bg-white border border-slate-200 text-amber-600 transition-all shadow-sm hover:bg-slate-50 active:scale-90 focus:outline-none disabled:opacity-50 disabled:active:scale-100"
                                    disabled={meta.page === 1}
                                    onClick={() => load(meta.page - 1)}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {pgs().map((p) => (
                                    <button
                                        key={p}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-black transition-all shadow-sm active:scale-90 focus:outline-none ${p === meta.page ? 'bg-amber-500 text-white border-transparent shadow-amber-500/20' : 'bg-white border border-slate-200 text-amber-600 hover:bg-slate-50'}`}
                                        onClick={() => load(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black bg-white border border-slate-200 text-amber-600 transition-all shadow-sm hover:bg-slate-50 active:scale-90 focus:outline-none disabled:opacity-50 disabled:active:scale-100"
                                    disabled={meta.page === meta.last_page}
                                    onClick={() => load(meta.page + 1)}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal === 'add' && <FormModal mode="add" init={EMPTY_FORM} student={null} parents={parents} programs={programs} onClose={() => setModal(null)} onSave={post} />}
            {modal === 'edit' && sel && <FormModal mode="edit" init={editInit} student={sel} parents={parents} programs={programs} onClose={() => setModal(null)} onSave={put} />}
            {modal === 'delete' && sel && <DeleteModal student={sel} onClose={() => setModal(null)} onConfirm={del} />}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <input ref={fotoInputRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoChange} />
        </>
    );
}