import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
  LayoutDashboard, BookOpen, Settings, LogOut,
  Users, BookCheck, TrendingUp, CheckCircle2, 
  FileText, GraduationCap, MessageCircle, 
  Calendar, Menu, X
} from "lucide-react";

// ── Sub-pages ────────────────────────────────────────────────
import AnakPage, { type Child } from "./AnakPage";
import LaporanPage from "./LaporanPage";
import PengaturanPage, { type ParentProfile } from "./PengaturanPage";

// ── Components ───────────────────────────────────────────────
import NotificationBell from "@/Components/NotificationBell"; // Pastikan path import ini sesuai

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface ChildStat {
  attendance: { hadir: number; izin: number; sakit: number; alpha: number; total: number; };
  quality:    { sangat_lancar: number; lancar: number; mengulang: number; total: number; };
}

interface DashboardProps {
  anakList: Child[];
  stats: { total_anak: number; total_laporan: number; total_hadir: number; };
  bulan: string;
  children_stats: Record<string, ChildStat>;
  recent_reports: {
    id: number; student_id: string; date: string; report_type: string; kualitas: string;
    teacher_name: string; teacher_notes: string;
  }[];
  first_child: { nama: string; program_name: string | null } | null;
  profile: ParentProfile | null;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard'  },
  { icon: Users,           label: 'Anak Saya',  id: 'anak'       },
  { icon: BookCheck,       label: 'Laporan',    id: 'laporan'    },
  { icon: Settings,        label: 'Pengaturan', id: 'pengaturan' },
];

export default function ParentDashboard({ anakList, stats, bulan, children_stats, recent_reports, first_child, profile }: DashboardProps) {
  const user        = usePage<PageProps>().props.auth.user;
  const displayName = (user as any)?.name || (user as any)?.username || 'Wali Murid';
  const initials    = displayName.split(' ').filter(Boolean).slice(0,2).map((p:string)=>p[0]?.toUpperCase()).join('')||'W';

  const params    = new URLSearchParams(window.location.search);
  const activeTab = params.get('tab') || 'dashboard';

  // State untuk hamburger menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Anak aktif untuk selector
  const activeChildren = anakList.filter(c => c.enrollment_status === 'active');
  const [selectedChildId, setSelectedChildId] = useState<string>(activeChildren[0]?.id ?? '');

  // Cari object anak yang sedang dipilih saat ini
  const activeChild = activeChildren.find(c => c.id === selectedChildId) || activeChildren[0];

  const setActive = (tab: string) => {
    router.visit(route('parents.dashboard') + (tab !== 'dashboard' ? `?tab=${tab}` : ''), {
      preserveScroll: true,
      preserveState:  true,
      replace:        true,
    });
  };

  const handleLogout = () => router.post(route('logout'));

  return (
    <>
      <Head title="Dashboard" />
      
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* ════ TOPNAV ════ */}
        <nav className="sticky top-0 z-[100] h-16 bg-white border-b border-teal-700/10 shadow-sm flex items-center px-4 md:px-7">
          {/* Tombol Hamburger (Khusus Mobile) */}
          <button 
            className="block md:hidden mr-3 text-slate-800 transition-all" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2.5 md:mr-9 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-blue-600 flex items-center justify-center shadow-md">
              <BookOpen size={18} color="#fff" strokeWidth={2.5}/>
            </div>
            <div className="hidden md:block">
              <div className="font-extrabold text-[15px] text-slate-900 leading-tight">EduConnect</div>
              <div className="text-[9.5px] text-slate-400 mt-[1px]">Parent Portal</div>
            </div>
          </div>
          
          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({icon:Icon,label,id})=>(
              <button 
                key={id} 
                className={`flex items-center gap-[7px] px-3.5 py-[7px] rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                  activeTab === id 
                    ? 'bg-teal-700 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-teal-700/5 hover:text-teal-700'
                }`} 
                onClick={()=>setActive(id)}
              >
                <Icon size={15} strokeWidth={activeTab===id?2.5:1.8}/> {label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 md:gap-3">
            {/* Integrasi Komponen Notifikasi */}
            <NotificationBell onNavigate={setActive} />
            
            <button 
              className="w-9 h-9 rounded-xl bg-teal-700/5 border border-teal-700/10 flex items-center justify-center text-slate-600 transition-all hover:bg-teal-700/10 hover:text-teal-700" 
              onClick={handleLogout} 
              title="Keluar"
            >
              <LogOut size={16} strokeWidth={1.8}/>
            </button>
            
            <div className="flex items-center gap-2 p-0 md:p-1 md:pl-2.5 rounded-xl md:bg-teal-700/5 md:border md:border-teal-700/10 cursor-pointer transition-all hover:md:bg-teal-700/10 shrink-0">
              <div className="hidden md:block">
                <div className="text-[12.5px] font-bold text-slate-900 whitespace-nowrap leading-tight">{displayName}</div>
                <div className="text-[10px] text-slate-400">Wali Murid</div>
              </div>
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-teal-700 to-blue-600 flex items-center justify-center font-extrabold text-white text-[11px] shadow-sm shrink-0">
                {initials}
              </div>
            </div>
          </div>
        </nav>

        {/* ════ MOBILE MENU OVERLAY ════ */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 inset-x-0 bottom-0 bg-slate-50 z-[90] flex flex-col p-5 gap-3 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {navItems.map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                  activeTab === id 
                    ? 'bg-teal-700 text-white shadow-md border-transparent' 
                    : 'text-slate-600 bg-white shadow-sm border-slate-100'
                }`}
                onClick={() => {
                  setActive(id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} /> {label}
              </button>
            ))}
          </div>
        )}

        {/* ════ CONTENT ════ */}
        <div className="max-w-[1100px] mx-auto px-4 py-5 md:px-7 md:py-7 lg:pb-10 flex flex-col gap-5">
          {activeTab === 'anak'       ? <AnakPage anakList={anakList}/> :
           activeTab === 'laporan'    ? <LaporanPage/> :
           activeTab === 'pengaturan' ? <PengaturanPage profile={profile}/> :
          (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end flex-wrap gap-4 md:gap-3 items-start">
                <div>
                  <div className="text-[22px] md:text-[26px] font-black text-slate-900 leading-none">
                    Selamat Datang, {displayName.split(' ')[0]}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-1.5">
                    Pantau aktivitas dan perkembangan ananda di satu tempat.
                  </div>
                </div>
                <button 
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold bg-slate-900 text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-[1px] w-full md:w-auto" 
                  onClick={()=>setActive('laporan')}
                >
                  <TrendingUp size={14}/> Lihat Laporan Lengkap
                </button>
              </div>

              {/* Stats Global */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {icon:Users,        bg:'bg-blue-100',   text:'text-blue-600',   v:stats.total_anak,    l:'Anak Terdaftar'       },
                  {icon:FileText,     bg:'bg-purple-100', text:'text-purple-600', v:stats.total_laporan, l:'Total Laporan'        },
                  {icon:CheckCircle2, bg:'bg-green-100',  text:'text-green-600',  v:stats.total_hadir,   l:'Total Kehadiran'      },
                ].map((s,i)=>(
                  <div key={i} className="bg-white rounded-[18px] p-4 md:p-[20px_22px] shadow-sm flex items-center gap-4 border border-slate-100">
                    <div className={`w-11 h-11 md:w-[52px] md:h-[52px] rounded-2xl shrink-0 flex items-center justify-center ${s.bg} ${s.text}`}>
                      <s.icon size={24}/>
                    </div>
                    <div>
                      <div className="text-[24px] md:text-[28px] font-black text-slate-900 leading-none">{s.v}</div>
                      <div className="text-[12px] text-slate-400 font-semibold mt-1">{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Spesifik Anak */}
              {(() => {
                const sel  = children_stats[selectedChildId];
                const att  = sel?.attendance;
                const qual = sel?.quality;
                return (
                  <div className="flex flex-col gap-5">
                    
                    {/* Filter / Selector Anak */}
                    {activeChildren.length > 1 && (
                      <div className="w-full overflow-x-auto scrollbar-hide">
                        <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-1">
                          {activeChildren.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => setSelectedChildId(c.id)}
                              className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[12px] md:text-[13px] font-bold transition-all whitespace-nowrap ${
                                selectedChildId === c.id 
                                  ? 'bg-teal-700 text-white shadow-md' 
                                  : 'text-slate-600 hover:bg-teal-700/5 hover:text-teal-700'
                              }`}
                            >
                              {c.nama}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hero Dinamis (Akses Cepat -> Fokus Pantauan) */}
                    <div className="bg-gradient-to-br from-teal-700 via-[#0d5c56] to-blue-600 rounded-[22px] p-5 md:p-[28px_32px] flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 relative overflow-hidden shadow-lg">
                      <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -top-[100px] -right-[60px]" />
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5 relative z-10">
                        <div className="w-12 h-12 md:w-[68px] md:h-[68px] rounded-[20px] text-[24px] md:text-[32px] shrink-0 bg-white/20 border-2 border-white/30 flex items-center justify-center">
                          👦
                        </div>
                        <div>
                          <div className="text-[10.5px] font-semibold text-white/70 uppercase tracking-wide">Fokus Pantauan Ananda</div>
                          <div className="text-[18px] md:text-[24px] font-black text-white leading-[1.2] mt-1">{activeChild ? activeChild.nama : 'Belum Ada Anak'}</div>
                          {activeChild?.program_name && (
                            <div className="text-[13px] text-white/80 mt-1.5 flex items-center gap-1.5">
                              <GraduationCap size={15}/> Program: {activeChild.program_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chart Kehadiran & Kualitas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-[18px] p-4 md:p-6 shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-5 items-start">
                          <div>
                            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-1">Kehadiran Bulan Ini</div>
                            <div className="text-[16px] font-extrabold text-slate-900 mb-1">Rekap Absensi · {bulan}</div>
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                            {att?.total??0} sesi
                          </div>
                        </div>
                        {!att||att.total===0 ? (
                          <p className="text-[13px] text-slate-400 italic">{activeChildren.length===0?'Tidak ada anak aktif.':'Belum ada data kehadiran bulan ini.'}</p>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2 mb-5">
                              <div className="text-[28px] md:text-[36px] font-black text-slate-900 leading-none">
                                {att.hadir}
                                <span className="text-[18px] text-slate-400 font-semibold">/{att.total}</span>
                              </div>
                              <div className="text-[13px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                                {Math.round((att.hadir/att.total)*100)}% Hadir
                              </div>
                            </div>
                            {[
                              {label:'Hadir',val:att.hadir,colorClass:'bg-green-600', textClass:'text-green-600'},
                              {label:'Izin', val:att.izin, colorClass:'bg-amber-500', textClass:'text-amber-500'},
                              {label:'Sakit',val:att.sakit,colorClass:'bg-sky-500', textClass:'text-sky-500'},
                              {label:'Alpha',val:att.alpha,colorClass:'bg-red-600', textClass:'text-red-600'},
                            ].map(s=>(
                              <div key={s.label} className="mb-3">
                                <div className="flex justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full inline-block ${s.colorClass}`}/>
                                    <span className="text-[13px] font-semibold text-slate-600">{s.label}</span>
                                  </div>
                                  <span className={`text-[13px] font-extrabold ${s.textClass}`}>{s.val} sesi</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div className={`h-full rounded-full ${s.colorClass} transition-all duration-500 ease-out`} style={{width:`${(s.val/att.total)*100}%`}}/>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-[18px] p-4 md:p-6 shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-5 items-start">
                          <div>
                            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-1">Distribusi Penilaian</div>
                            <div className="text-[16px] font-extrabold text-slate-900 mb-1">Kualitas Setoran · {bulan}</div>
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                            {qual?.total??0} setoran
                          </div>
                        </div>
                        {!qual||qual.total===0 ? (
                          <p className="text-[13px] text-slate-400 italic">{activeChildren.length===0?'Tidak ada anak aktif.':'Belum ada data setoran bulan ini.'}</p>
                        ) : (
                          <div className="flex flex-col gap-4 mt-3">
                            {[
                              {label:'Sangat Lancar',  val:qual.sangat_lancar, barColor:'bg-green-600', bgBox:'bg-green-100', text:'text-green-600'},
                              {label:'Lancar',         val:qual.lancar,       barColor:'bg-amber-500', bgBox:'bg-amber-100', text:'text-amber-600'},
                              {label:'Perlu Mengulang',val:qual.mengulang,    barColor:'bg-red-600',   bgBox:'bg-red-100', text:'text-red-600'},
                            ].map(q=>(
                              <div key={q.label} className="flex items-center gap-3.5">
                                <div className={`w-11 h-11 md:w-[46px] md:h-[46px] rounded-xl flex items-center justify-center font-black text-[18px] shrink-0 ${q.bgBox} ${q.text}`}>
                                  {q.val}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between mb-1.5">
                                    <span className="text-[13px] font-bold text-slate-900">{q.label}</span>
                                    <span className="text-[12px] font-extrabold text-slate-400">{Math.round((q.val/qual.total)*100)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ease-out ${q.barColor}`} style={{width:`${(q.val/qual.total)*100}%`}}/>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Catatan (Sudah difilter berdasarkan anak) */}
              {(() => {
                const filteredReports = recent_reports.filter(r => r.student_id === selectedChildId);

                return (
                  <div className="bg-white rounded-[18px] p-4 md:p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-5 items-start">
                      <div>
                        <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-1">Mutabaah Terkini</div>
                        <div className="text-[16px] font-extrabold text-slate-900 mb-1">Catatan Asatidz Terbaru</div>
                      </div>
                    </div>
                    {filteredReports.length === 0
                      ? <p className="text-[13px] text-slate-400 italic">Belum ada catatan terbaru untuk ananda ini.</p>
                      : (
                        <div className="flex flex-col gap-3">
                          {filteredReports.map(r=>(
                            <div key={r.id} className="p-4 rounded-[14px] bg-slate-50 border border-slate-100">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                                <div className="flex gap-2 items-center flex-wrap">
                                  <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                                    <MessageCircle size={15}/> {r.teacher_name}
                                  </div>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-600">
                                    {r.report_type}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-pink-100 text-pink-600">
                                    {r.kualitas?.replace('_',' ')}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Calendar size={12}/>{new Date(r.date).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}
                                </div>
                              </div>
                              <div className="bg-blue-600/5 border-l-[3px] border-blue-600 px-3.5 py-3 rounded-r-[10px] rounded-bl-[6px] rounded-tl-[6px] text-[13px] text-slate-600 leading-relaxed font-medium mt-3">
                                {r.teacher_notes}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}