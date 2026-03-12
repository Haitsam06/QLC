import { useState } from 'react';
import TeacherNavbar from '../../Components/TeacherNavbar';
import { 
    Search, Filter, Plus, BookOpen, 
    X, Save, FileText, User, Calendar, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    nis: string;
    class: string;
    lastHafalan: string;
    lastTilawah: string;
}

/* ═══════════════════════════════════════════════════════════
   DATA MOCKUP: DAFTAR SANTRI
═══════════════════════════════════════════════════════════ */
const studentsData: Student[] = [
    { id: 1, name: 'Ahmad Fauzan', nis: '2401001', class: '4A', lastHafalan: 'An-Naba: 1-20', lastTilawah: 'Jilid 4: Hal 15' },
    { id: 2, name: 'Siti Aisyah', nis: '2401002', class: '4A', lastHafalan: 'Al-Mulk: 1-10', lastTilawah: 'Al-Baqarah: 1-5' },
    { id: 3, name: 'Budi Santoso', nis: '2401003', class: '4B', lastHafalan: 'An-Naziats: 1-15', lastTilawah: 'Yanbua 3: Hal 10' },
    { id: 4, name: 'Zahra Nabila', nis: '2401004', class: '5A', lastHafalan: 'Abasa: 1-42', lastTilawah: 'Jilid 5: Hal 20' },
    { id: 5, name: 'Rizky Maulana', nis: '2401005', class: '4A', lastHafalan: 'At-Takwir: 1-30', lastTilawah: 'Yanbua 4: Hal 5' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT UTAMA
═══════════════════════════════════════════════════════════ */
export default function BukuMutabaah() {
    const [activeTab, setActiveTab] = useState('mutabaah');
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [reportType, setReportType] = useState('hafalan'); // hafalan | tilawah | yanbua
    const [statusKelancaran, setStatusKelancaran] = useState('lancar');

    const handleOpenModal = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
        setReportType('hafalan');
        setStatusKelancaran('lancar');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };
    const [active, setActive] = useState('laporan');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <TeacherNavbar activePage={active} />

            <div className="w-full px-6 lg:px-12 pt-8 pb-12 mx-auto flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                    <div className="w-full md:w-2/3">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Buku Mutabaah Santri</h1>
                        <p className="text-sm text-gray-500 font-medium">Pantau riwayat setoran dan input progres hafalan, tilawah, serta tahsin.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition-all"
                            placeholder="Cari nama santri atau NIS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                        <select className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                            <option>Semua Kelas</option>
                            <option>Kelas 4A</option>
                            <option>Kelas 4B</option>
                            <option>Kelas 5A</option>
                        </select>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 shrink-0">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                {/* Tabel */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Nama Santri</th>
                                    <th className="px-5 py-3">Kelas</th>
                                    <th className="px-5 py-3">Terakhir (Hafalan)</th>
                                    <th className="px-5 py-3">Terakhir (Tilawah)</th>
                                    <th className="px-5 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {studentsData.map((student) => (
                                    <tr key={student.id} className="hover:bg-green-50/50 transition-colors group">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {student.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-medium">NIS: {student.nis}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-700">{student.class}</td>
                                        <td className="px-5 py-3">
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                                                <BookOpen size={12} className="text-gray-400" />
                                                {student.lastHafalan}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                                                <FileText size={12} className="text-gray-400" />
                                                {student.lastTilawah}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => handleOpenModal(student)}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-bold hover:bg-green-700 shadow-sm transition-all"
                                            >
                                                <Plus size={14} /> Input Progres
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ════ MODAL INPUT LAPORAN (COMPACT & PROPORTIONAL) ════ */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>

                    {/* Modal Content - Diperkecil menjadi max-w-3xl (768px) */}
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Input Setoran Santri</h2>
                                <p className="text-[11px] text-gray-500 font-medium">Buku Mutabaah Digital</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 md:p-5 overflow-y-auto bg-gray-50 flex-1">
                            
                            {/* Info Santri (Super Compact) */}
                            <div className="flex items-center justify-between p-3 mb-4 bg-white border border-gray-200 shadow-sm rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{selectedStudent.name}</div>
                                        <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                                            Kelas {selectedStudent.class} <span className="mx-1">•</span> NIS: {selectedStudent.nis}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Setoran</div>
                                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                                        <Calendar size={12} className="text-green-600" />
                                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Form Split Layout 2 Kolom */}
                            <form className="grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
                                
                                {/* ── KOLOM KIRI ── */}
                                <div className="flex flex-col gap-4">
                                    
                                    {/* Capaian */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                            <BookOpen size={14} className="text-green-600" /> Detail Capaian
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                    {reportType === 'yanbua' ? 'Jilid / Buku' : 'Nama Surah'}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500"
                                                    placeholder={reportType === 'yanbua' ? 'Jilid 4' : 'Al-Mulk'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Halaman / Ayat</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500"
                                                    placeholder="Ayat 1-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1">
                                        <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                                            <FileText size={14} className="text-green-600" /> Catatan Asatidz
                                        </h3>
                                        <textarea
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 resize-none flex-1 min-h-[60px]"
                                            placeholder="Catatan tajwid (opsional)..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* ── KOLOM KANAN ── */}
                                <div className="flex flex-col gap-4">
                                    
                                    {/* Jenis Laporan */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-gray-800 mb-3">Pilih Jenis Setoran</h3>
                                        {/* Diubah jadi 3 kolom horizontal agar compact */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'hafalan', label: 'Hafalan', icon: BookOpen },
                                                { id: 'tilawah', label: 'Tilawah', icon: FileText },
                                                { id: 'yanbua', label: "Yanbu'a", icon: BookOpen },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setReportType(type.id)}
                                                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all
                                                    ${reportType === type.id 
                                                        ? 'border-green-500 bg-green-50 text-green-700' 
                                                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'}`}
                                                >
                                                    <type.icon size={16} className={reportType === type.id ? 'text-green-600' : 'text-gray-400'} />
                                                    <span className="font-bold text-[11px]">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Kualitas Bacaan */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1">
                                        <h3 className="text-xs font-bold text-gray-800 mb-3">Kualitas Bacaan</h3>
                                        {/* List vertikal rapat agar menghemat tinggi */}
                                        <div className="flex flex-col gap-2">
                                            <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                                                ${statusKelancaran === 'sangat_lancar' ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white'}`}>
                                                <input type="radio" name="kelancaran" className="hidden" onClick={() => setStatusKelancaran('sangat_lancar')} />
                                                <CheckCircle2 size={16} className={statusKelancaran === 'sangat_lancar' ? 'text-blue-500' : 'text-gray-400'} /> 
                                                <span className="font-bold text-xs">Sangat Lancar</span>
                                            </label>
                                            
                                            <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                                                ${statusKelancaran === 'lancar' ? 'border-green-400 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white'}`}>
                                                <input type="radio" name="kelancaran" className="hidden" onClick={() => setStatusKelancaran('lancar')} />
                                                <CheckCircle2 size={16} className={statusKelancaran === 'lancar' ? 'text-green-500' : 'text-gray-400'} /> 
                                                <span className="font-bold text-xs">Lancar</span>
                                            </label>
                                            
                                            <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                                                ${statusKelancaran === 'mengulang' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white'}`}>
                                                <input type="radio" name="kelancaran" className="hidden" onClick={() => setStatusKelancaran('mengulang')} />
                                                <AlertCircle size={16} className={statusKelancaran === 'mengulang' ? 'text-yellow-500' : 'text-gray-400'} /> 
                                                <span className="font-bold text-xs">Perlu Mengulang</span>
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                                Batal
                            </button>
                            <button className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1.5 transition-all">
                                <Save size={14} /> Simpan Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}