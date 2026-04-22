import { useState, useEffect } from 'react';
import axios from 'axios';
import MitraNavbar from '../../Components/MitraNavbar';
import { 
    CalendarDays, FileCheck, Download, MapPin, 
    Clock, Activity, Eye, Loader2, FileBadge, ShieldCheck 
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   HELPERS & TYPES
═══════════════════════════════════════════════════════════ */
const formatBytes = (b: number) => {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

export default function MitraDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data dari endpoint dashboard yang baru dibuat
        axios.get('/api/mitra/dashboard')
            .then(res => setData(res.data.data))
            .catch(err => console.error("Gagal memuat dashboard:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <MitraNavbar activePage="dashboard" />

            <div className="w-full px-4 md:px-8 lg:px-12 pt-8 pb-12 flex flex-col gap-6 mx-auto">
                {/* ── Hero: Profil Mitra ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="inline-block px-3 py-1 bg-green-700 bg-opacity-50 border border-green-500 border-opacity-30 rounded-full text-green-100 text-xs font-bold uppercase tracking-wider mb-4">
                            Status: {data?.profile?.status === 'Active' ? 'Kemitraan Aktif' : 'Menunggu / Inaktif'}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                            {loading ? 'Memuat Profil...' : `Selamat Datang, ${data?.profile?.institution_name}`}
                        </h1>
                        <p className="text-green-100 text-opacity-90 text-sm max-w-xl leading-relaxed">
                            Pantau dokumen kerja sama, jadwal kegiatan pendampingan dari QLC, serta unduh laporan evaluasi berkala secara real-time di dashboard ini.
                        </p>
                    </div>

                    {/* Ringkasan Cepat */}
                    <div className="flex gap-4 w-full lg:w-auto relative z-10">
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[140px] text-center">
                            <div className="text-3xl font-black text-white mb-1">
                                {loading ? '-' : data?.schedules?.length || 0}
                            </div>
                            <div className="text-xs text-green-200 font-semibold">Agenda Terdekat</div>
                        </div>
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 flex-1 lg:min-w-[140px] text-center">
                            <div className="text-3xl font-black text-green-300 mb-1">
                                {loading ? '-' : data?.reports?.length || 0}
                            </div>
                            <div className="text-xs text-green-200 font-semibold">Laporan Baru</div>
                        </div>
                    </div>
                </div>

                {/* ── Grid 3 Kolom Utama ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-2">
                    
                    {/* KOLOM 1: Dokumen MOU & Info Kemitraan */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Dokumen Kemitraan</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Memorandum of Understanding</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-gray-400"/></div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/50 flex flex-col items-center text-center gap-3">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-600 mb-2">
                                        <FileBadge size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">MOU Resmi QLC</h3>
                                        <p className="text-xs text-gray-500 mt-1 px-4 leading-relaxed">
                                            Dokumen ini berisi landasan hukum, hak, dan kewajiban kerja sama antara pihak QLC dengan Instansi Anda.
                                        </p>
                                    </div>

                                    <div className="w-full mt-2">
                                        {data?.profile?.mou_file_url ? (
                                            <a 
                                                href={data.profile.mou_file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 transition-colors"
                                            >
                                                <Eye size={18} /> Lihat Dokumen MOU
                                            </a>
                                        ) : (
                                            <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                Dokumen MOU Belum Tersedia
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between px-2 font-medium">
                                    <span>PIC: {data?.profile?.contact_person || '-'}</span>
                                    <span className="text-green-600">Terverifikasi</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* KOLOM 2: Jadwal Terdekat */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Agenda Terdekat</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Jadwal kegiatan & kunjungan</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                                <CalendarDays size={20} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-gray-400"/></div>
                        ) : data?.schedules?.length === 0 ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-gray-400 text-sm font-medium">
                                <CalendarDays size={32} className="mb-2 opacity-50" />
                                Belum ada agenda terdekat.
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-6">
                                {data.schedules.map((sched: any, index: number) => (
                                    <div key={sched.id} className="relative pl-5">
                                        <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white ${index === 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                                    {formatDate(sched.date)}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-gray-800 leading-snug">{sched.title}</h3>
                                            
                                            {sched.location && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
                                                    <MapPin size={14} className="text-gray-400" /> {sched.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* KOLOM 3: Laporan Terbaru */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">Laporan Terbaru</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Hasil evaluasi QLC</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileCheck size={20} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-gray-400"/></div>
                        ) : data?.reports?.length === 0 ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-gray-400 text-sm font-medium">
                                <FileCheck size={32} className="mb-2 opacity-50" />
                                Belum ada laporan diterbitkan.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {data.reports.map((report: any) => (
                                    <div key={report.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all group">
                                        <div className="flex items-start gap-3 w-full overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-black uppercase">{report.file_type || 'PDF'}</span>
                                            </div>
                                            <div className="overflow-hidden w-full pr-2">
                                                <h3 className="text-sm font-bold text-gray-800 mb-0.5 truncate">{report.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                    <span>{report.date ? formatDate(report.date) : '-'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span>{formatBytes(report.file_size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {report.file_url && (
                                            <a 
                                                href={report.file_url}
                                                download 
                                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-green-100 hover:text-green-600 transition-colors shrink-0"
                                            >
                                                <Download size={16} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    );
}