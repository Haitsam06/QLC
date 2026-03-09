import { useState } from 'react';
import MitraNavbar from '../../Components/MitraNavbar';
import { FileCheck, Download, Search, Filter, FileText, FileSpreadsheet, FileBarChart, Clock, Eye } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DATA MOCKUP LAPORAN
═══════════════════════════════════════════════════════════ */
const reportsData = [
    {
        id: 'REP-001',
        title: 'Laporan Evaluasi & Supervisi Guru',
        program: 'QL - SCHOOL',
        date: '02 Maret 2026',
        type: 'Evaluasi',
        size: '2.4 MB',
        isNew: true,
        icon: FileCheck,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
    },
    {
        id: 'REP-002',
        title: 'Invoice Tagihan Pendampingan',
        program: 'Keuangan',
        date: '28 Februari 2026',
        type: 'Keuangan',
        size: '845 KB',
        isNew: true,
        icon: FileSpreadsheet,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-50',
    },
    {
        id: 'REP-003',
        title: 'Laporan Progres Hafalan Siswa',
        program: 'QL - SCHOOL',
        date: '15 Februari 2026',
        type: 'Akademik',
        size: '4.1 MB',
        isNew: false,
        icon: FileBarChart,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
    },
    {
        id: 'REP-004',
        title: 'Hasil Standarisasi Tilawah',
        program: 'QL - TFT',
        date: '10 Februari 2026',
        type: 'Evaluasi',
        size: '1.2 MB',
        isNew: false,
        icon: FileCheck,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
    },
    {
        id: 'REP-005',
        title: 'Laporan Kick-off Program',
        program: 'QL - SCHOOL',
        date: '20 Januari 2026',
        type: 'Umum',
        size: '3.5 MB',
        isNew: false,
        icon: FileText,
        iconColor: 'text-gray-600',
        iconBg: 'bg-gray-100',
    },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function LaporanMitra() {
    const [active, setActive] = useState('laporan');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* ════ TOPNAV ════ */}
            <MitraNavbar activePage={active} />

            {/* ════ PAGE WRAPPER ════ */}
            {/* PERUBAHAN: max-w-7xl dihapus, diganti w-full, dan padding disamakan dengan Navbar (px-6 lg:px-12) */}
            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto flex flex-col gap-6">
                {/* ── Page Header & Quick Stats ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                    <div className="w-full lg:w-1/2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Laporan & Evaluasi</h1>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Unduh dan arsipkan dokumen laporan bulanan, hasil supervisi, performa akademik, serta riwayat tagihan kemitraan.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-row gap-4 shrink-0">
                        <div className="bg-white border border-gray-200 px-5 py-4 rounded-xl shadow-sm flex items-center gap-4 w-40 md:w-48">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                <FileCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 leading-none">12</div>
                                <div className="text-xs font-semibold text-gray-500 mt-1">Total Laporan</div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 px-5 py-4 rounded-xl shadow-sm flex items-center gap-4 w-40 md:w-48">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 leading-none">2</div>
                                <div className="text-xs font-semibold text-gray-500 mt-1">Laporan Baru</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Area ── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    {/* Toolbar (Search & Filter) */}
                    <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50">
                        <div className="relative w-full md:max-w-md">
                            {' '}
                            {/* max-w-md agar search bar tidak terlalu panjang di layar besar */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="Cari nama laporan atau program..."
                            />
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <select className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                                <option>Semua Program</option>
                                <option>QL - SCHOOL</option>
                                <option>QL - TFT</option>
                                <option>Keuangan</option>
                            </select>
                            <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-2 shrink-0">
                                <Filter size={16} /> Filter
                            </button>
                        </div>
                    </div>

                    {/* List Laporan */}
                    <div className="flex flex-col">
                        {reportsData.map((report, index) => {
                            const IconCmp = report.icon;
                            return (
                                <div
                                    key={report.id}
                                    className={`p-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-gray-50 
                                    ${index !== reportsData.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    {/* Kolom Kiri: Ikon & Judul */}
                                    <div className="flex items-start gap-4 w-full md:w-5/12">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.iconBg} ${report.iconColor}`}>
                                            <IconCmp size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{report.title}</h3>
                                                {report.isNew && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wide shrink-0">Baru</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">{report.id}</p>
                                        </div>
                                    </div>

                                    {/* Kolom Tengah: Info Program & Tanggal */}
                                    <div className="flex flex-row md:w-4/12 gap-6 items-center">
                                        <div className="w-1/2">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Kategori</div>
                                            <div className="text-sm font-semibold text-gray-700">{report.program}</div>
                                        </div>
                                        <div className="w-1/2">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Tanggal Update</div>
                                            <div className="text-sm font-semibold text-gray-700">{report.date}</div>
                                        </div>
                                    </div>

                                    {/* Kolom Kanan: Tipe, Size & Action */}
                                    <div className="flex items-center justify-between md:justify-end md:w-3/12 gap-4 pt-4 md:pt-0 border-t border-gray-100 md:border-none mt-2 md:mt-0">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded">{report.type}</span>
                                            <span>•</span>
                                            <span>{report.size}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-green-600 transition-colors"
                                                title="Lihat Preview"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                                                <Download size={16} /> <span className="hidden xl:inline">Unduh</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Menampilkan 1 hingga 5 dari 12 Laporan</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-lg text-sm bg-gray-50 cursor-not-allowed font-semibold">Sebelumnya</button>
                            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 font-semibold transition-colors">Berikutnya</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
