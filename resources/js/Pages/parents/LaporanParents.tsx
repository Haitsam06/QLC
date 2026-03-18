import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import axios from 'axios';
import {
    BookOpen, LogOut, Settings, Bell, LayoutDashboard,
    Users, BookCheck, CheckCircle2,
    Clock, XCircle, GraduationCap, Calendar, FileText,
    Star, Target, TrendingUp, AlertCircle, ArrowUpRight,
    MessageCircle, Award, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Child {
    id: string;
    nama: string;
    program_name: string;
    enrollment_status: 'active' | 'pending' | 'inactive';
}

interface ProgressReport {
    id: string;
    date: string;
    attendance: 'hadir' | 'izin' | 'sakit' | 'alpha';
    report_type: 'hafalan' | 'tilawah' | 'yanbua' | null;
    kualitas: 'sangat_lancar' | 'lancar' | 'mengulang' | null;
    hafalan_target: string | null;
    hafalan_achievement: string | null;
    teacher_notes: string | null;
    teacher_name: string | null;
}

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { cursor: pointer; font-family: inherit; border: none; background: none; }

:root {
  --green:       #0f766e;
  --green-mid:   #14b8a6;
  --green-light: #ccfbf1;
  --blue:        #2563eb;
  --blue-light:  #dbeafe;
  --gold:        #d4a017;
  --red:         #dc2626;
  --red-light:   #fee2e2;
  --bg:          #f1f5f9;
  --card:        #ffffff;
  --text:        #0f172a;
  --text2:       #475569;
  --text3:       #94a3b8;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.root { min-height: 100vh; background: var(--bg); }

/* ── Topnav ── */
.topnav {
  position: sticky; top: 0; z-index: 100;
  height: 64px; background: #fff;
  border-bottom: 1px solid rgba(15,118,110,0.08);
  box-shadow: 0 1px 12px rgba(15,118,110,0.06);
  display: flex; align-items: center;
  padding: 0 28px; gap: 0;
}
.topnav__brand { display: flex; align-items: center; gap: 10px; margin-right: 36px; flex-shrink: 0; }
.topnav__brand-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(15,118,110,0.3);
}
.topnav__brand-name { font-weight: 800; font-size: 15px; color: var(--text); }
.topnav__brand-sub  { font-size: 9.5px; color: var(--text3); margin-top: 1px; }
.topnav__nav { display: flex; align-items: center; gap: 4px; }
.topnav__nav-item {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: var(--text2);
  transition: all 0.18s; white-space: nowrap;
}
.topnav__nav-item:hover { background: rgba(15,118,110,0.06); color: var(--green); }
.topnav__nav-item--active {
  background: var(--green); color: #fff;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3);
}
.topnav__nav-item--active:hover { background: var(--green); color: #fff; }
.topnav__gap { flex: 1; }
.topnav__actions { display: flex; align-items: center; gap: 8px; }
.topnav__icon-btn {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(15,118,110,0.06); border: 1px solid rgba(15,118,110,0.1);
  display: flex; align-items: center; justify-content: center;
  position: relative; color: var(--text2); transition: all 0.18s;
}
.topnav__icon-btn:hover { background: rgba(15,118,110,0.12); color: var(--green); }
.topnav__profile {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 5px 5px 10px; border-radius: 12px;
  background: rgba(15,118,110,0.05); border: 1px solid rgba(15,118,110,0.1);
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.topnav__profile:hover { background: rgba(15,118,110,0.1); }
.av {
  border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff;
  box-shadow: 0 3px 10px rgba(15,118,110,0.28); flex-shrink: 0;
}
.av-sm { width: 30px; height: 30px; font-size: 11px; }
.pname { font-size: 12.5px; font-weight: 700; color: var(--text); white-space: nowrap; }
.prole { font-size: 10px; color: var(--text3); }

/* ── Page Layout ── */
.page {
  max-width: 900px; margin: 0 auto;
  padding: 32px 28px 60px;
  display: flex; flex-direction: column; gap: 24px;
}
.ph { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.ph-title { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
.ph-sub   { font-size: 13px; color: var(--text3); margin-top: 6px; font-weight:500; }

/* ── Child Selector Tabs ── */
.child-tabs {
  display: flex; gap: 8px; overflow-x: auto;
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 20px; padding: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  width: fit-content; max-width: 100%;
}
.child-tab {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 18px 8px 8px; border-radius: 14px;
  background: transparent; cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  white-space: nowrap; flex-shrink: 0; border: none; font-family: inherit;
}
.child-tab:hover:not(.child-tab--active) { background: rgba(255,255,255,0.6); }
.child-tab--active { background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.ct-av {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(15,118,110,0.08); color: var(--green);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; transition: all 0.25s;
}
.child-tab--active .ct-av {
  background: linear-gradient(135deg, var(--green), var(--blue));
  color: #fff; box-shadow: 0 4px 10px rgba(15,118,110,0.25);
}
.ct-info { display: flex; flex-direction: column; align-items: flex-start; }
.ct-name { font-size: 13.5px; font-weight: 700; color: var(--text2); transition: color 0.2s; }
.child-tab--active .ct-name { color: var(--text); font-weight: 800; }
.ct-prog { font-size: 11px; font-weight: 600; color: var(--text3); margin-top: 1px; }
.ct-status { display: inline-flex; align-items: center; gap: 4px; margin-top: 3px; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
.ct-status-pending  { background: rgba(234,179,8,0.12); color: #b45309; }
.ct-status-inactive { background: rgba(220,38,38,0.08); color: #dc2626; }

/* Lock overlay */
.lock-state {
  text-align: center; padding: 48px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  background: rgba(248,250,252,0.8); border-radius: 16px;
  border: 1.5px dashed rgba(0,0,0,0.1);
}
.lock-icon {
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.lock-pending  { background: rgba(234,179,8,0.12); }
.lock-inactive { background: rgba(220,38,38,0.08); }

/* ── Stats Summary ── */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card {
  background: var(--card); border-radius: 20px; padding: 20px;
  border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  display: flex; align-items: center; gap: 16px;
}
.stat-icon { width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.stat-val  { font-size: 28px; font-weight: 900; color: var(--text); line-height: 1; }
.stat-lbl  { font-size: 12px; color: var(--text3); font-weight: 600; margin-top: 4px; }

/* ── Timeline ── */
.timeline-container {
  background: var(--card); border-radius: 24px; padding: 32px;
  border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 24px rgba(0,0,0,0.03);
}
.ip-sec-title { font-size: 13px; font-weight: 800; color: var(--text2); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
.tl-item { display: flex; gap: 24px; position: relative; padding-bottom: 32px; }
.tl-item:last-child { padding-bottom: 0; }
.tl-item::before {
  content: ""; position: absolute;
  left: 104px; top: 36px; bottom: -8px; width: 2px;
  background: rgba(0,0,0,0.05);
}
.tl-item:last-child::before { display: none; }
.tl-date { width: 80px; flex-shrink: 0; text-align: right; padding-top: 6px; }
.tl-day   { font-size: 20px; font-weight: 900; color: var(--text); line-height: 1; }
.tl-month { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; margin-top: 2px; }
.tl-dot {
  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
  background: #fff; border: 3px solid var(--green);
  position: relative; z-index: 2; margin-top: 10px;
  box-shadow: 0 0 0 4px rgba(15,118,110,0.1);
}
.tl-dot-absent { border-color: var(--red); box-shadow: 0 0 0 4px rgba(220,38,38,0.1); }
.tl-content {
  flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px; padding: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  transition: all 0.2s;
}
.tl-content:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-2px); border-color: rgba(15,118,110,0.2); }
.tl-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.tl-teacher { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text3); }

/* Badges */
.badge { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; text-transform: uppercase; letter-spacing: 0.5px; }
.b-hadir { background:rgba(22,163,74,0.1); color:#16a34a; }
.b-izin  { background:rgba(234,179,8,0.1); color:#d97706; }
.b-sakit { background:rgba(56,189,248,0.1); color:#0284c7; }
.b-alpha { background:rgba(220,38,38,0.1); color:#dc2626; }
.b-type  { background:rgba(139,92,246,0.1); color:#7c3aed; }
.b-qual  { background:rgba(244,114,182,0.1); color:#db2777; }

/* Grid Capaian */
.tl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.tl-box { background: var(--bg); padding: 12px 16px; border-radius: 12px; }
.tl-box-lbl { font-size: 10.5px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
.tl-box-val { font-size: 14px; font-weight: 700; color: var(--text); }
.tl-box-ok  { background: rgba(22,163,74,0.06); }
.tl-box-ok .tl-box-val { color: #16a34a; }

/* Catatan */
.tl-notes {
  background: rgba(37,99,235,0.04); border-left: 3px solid var(--blue);
  padding: 12px 16px; border-radius: 8px 12px 12px 8px;
  font-size: 13px; color: var(--text2); line-height: 1.6; font-weight: 500;
}

/* Loading & Error & Empty */
.center-state { text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-st { color: var(--text3); }
.err-st { color: var(--red); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.err-banner {
  display: flex; align-items: center; gap: 10px;
  background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15);
  border-radius: 14px; padding: 14px 18px; color: var(--red);
  font-size: 13px; font-weight: 600;
}
.retry-btn {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
  background: rgba(220,38,38,0.1); color: var(--red); transition: all 0.2s;
}
.retry-btn:hover { background: rgba(220,38,38,0.18); }

@media (max-width: 768px) {
  .page { padding: 20px; }
  .topnav { padding: 0 16px; }
  .topnav__nav, .pname, .prole { display: none; }
  .stats-row { grid-template-columns: 1fr; }
  .tl-item { flex-direction: column; gap: 12px; padding-bottom: 24px; }
  .tl-item::before { display: none; }
  .tl-date { text-align: left; display: flex; align-items: baseline; gap: 6px; }
  .tl-dot { display: none; }
  .tl-grid { grid-template-columns: 1fr; }
  .timeline-container { padding: 20px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard' },
    { icon: Users,           label: 'Anak Saya',  id: 'anak'      },
    { icon: BookCheck,       label: 'Laporan',    id: 'laporan'   },
    { icon: Settings,        label: 'Pengaturan', id: 'pengaturan'},
];

const ATTD_BADGE: Record<string, { lbl: string; cls: string }> = {
    hadir: { lbl: 'Hadir', cls: 'b-hadir' },
    izin:  { lbl: 'Izin',  cls: 'b-izin'  },
    sakit: { lbl: 'Sakit', cls: 'b-sakit' },
    alpha: { lbl: 'Alpha', cls: 'b-alpha' },
};

const QUAL_LABEL: Record<string, string> = {
    sangat_lancar: 'Sangat Lancar',
    lancar:        'Lancar',
    mengulang:     'Perlu Mengulang',
};

/* ═══════════════════════════════════════════════════════════
   KOMPONEN UTAMA
═══════════════════════════════════════════════════════════ */
export default function LaporanParents() {
    const user        = usePage<PageProps>().props.auth.user;
    const displayName = (user as any)?.name || (user as any)?.username || 'Wali Murid';
    const avatarInit  = displayName.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('') || 'W';

    // ── State ────────────────────────────────────────────────
    const [children,      setChildren]      = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>('');
    const [reports,       setReports]       = useState<ProgressReport[]>([]);

    const [loadingChildren, setLoadingChildren] = useState(true);
    const [loadingReports,  setLoadingReports]  = useState(false);
    const [childrenError,   setChildrenError]   = useState<string | null>(null);
    const [reportsError,    setReportsError]    = useState<string | null>(null);

    // ── Load daftar anak saat mount ──────────────────────────
    useEffect(() => {
        setLoadingChildren(true);
        setChildrenError(null);
        axios.get<Child[]>('/api/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0].id);
            })
            .catch(() => setChildrenError('Gagal memuat data anak. Coba refresh halaman.'))
            .finally(() => setLoadingChildren(false));
    }, []);

    // ── Load laporan setiap kali tab anak berganti ───────────
    useEffect(() => {
        if (!selectedChild) return;
        setLoadingReports(true);
        setReportsError(null);
        setReports([]);
        axios.get<ProgressReport[]>(`/api/parent/children/${selectedChild}/reports`)
            .then(res => setReports(res.data))
            .catch(() => setReportsError('Gagal memuat laporan. Coba lagi.'))
            .finally(() => setLoadingReports(false));
    }, [selectedChild]);

    // ── Navigasi ─────────────────────────────────────────────
    const handleLogout = () => router.post(route('logout'));
    const goTo = (id: string) => {
        if (id === 'dashboard') router.visit(route('parents.dashboard'));
        if (id === 'anak')      router.visit(route('parents.anak'));
        if (id === 'laporan')   router.visit(route('parents.laporan'));
    };

    // ── Statistik ────────────────────────────────────────────
    const totalHadir       = reports.filter(r => r.attendance === 'hadir').length;
    const totalSangatLancar = reports.filter(r => r.kualitas  === 'sangat_lancar').length;

    return (
        <>
            <Head title="Laporan Perkembangan" />
            <style>{CSS}</style>
            <div className="root">

                {/* ════ TOPNAV ════ */}
                <nav className="topnav">
                    <div className="topnav__brand">
                        <div className="topnav__brand-icon">
                            <BookOpen size={18} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="topnav__brand-name">EduConnect</div>
                            <div className="topnav__brand-sub">Parent Portal</div>
                        </div>
                    </div>

                    <div className="topnav__nav">
                        {navItems.map(({ icon: Icon, label, id }) => (
                            <button key={id}
                                className={`topnav__nav-item ${id === 'laporan' ? 'topnav__nav-item--active' : ''}`}
                                onClick={() => goTo(id)}>
                                <Icon size={15} strokeWidth={id === 'laporan' ? 2.5 : 1.8} /> {label}
                            </button>
                        ))}
                    </div>

                    <div className="topnav__gap" />

                    <div className="topnav__actions">
                        <button className="topnav__icon-btn"><Settings size={16} strokeWidth={1.8} /></button>
                        <button className="topnav__icon-btn"><Bell size={16} strokeWidth={1.8} /></button>
                        <button className="topnav__icon-btn" onClick={handleLogout} title="Keluar">
                            <LogOut size={16} strokeWidth={1.8} />
                        </button>
                        <div className="topnav__profile">
                            <div>
                                <div className="pname">{displayName}</div>
                                <div className="prole">Wali Murid</div>
                            </div>
                            <div className="av av-sm">{avatarInit}</div>
                        </div>
                    </div>
                </nav>

                {/* ════ PAGE CONTENT ════ */}
                <div className="page">

                    {/* Heading */}
                    <div className="ph">
                        <div>
                            <div className="ph-title">Laporan Perkembangan</div>
                            <div className="ph-sub">Pantau mutabaah harian dan pencapaian setoran anak Anda.</div>
                        </div>
                    </div>

                    {/* Error banner: gagal load children */}
                    {childrenError && (
                        <div className="err-banner">
                            <AlertTriangle size={16} />
                            {childrenError}
                            <button className="retry-btn" onClick={() => window.location.reload()}>
                                <RefreshCw size={13} /> Refresh
                            </button>
                        </div>
                    )}

                    {/* Loading children */}
                    {loadingChildren && (
                        <div className="center-state">
                            <Loader2 size={32} className="spin" style={{ color: 'var(--green)' }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text3)' }}>Memuat data...</span>
                        </div>
                    )}

                    {/* Tab Pemilih Anak */}
                    {!loadingChildren && children.length > 0 && (
                        <div className="child-tabs">
                            {children.map(child => {
                                const isLocked = child.enrollment_status !== 'active';
                                return (
                                    <button key={child.id}
                                        className={`child-tab ${selectedChild === child.id ? 'child-tab--active' : ''}`}
                                        onClick={() => setSelectedChild(child.id)}
                                        style={{ opacity: isLocked ? 0.75 : 1 }}>
                                        <div className="ct-av">{child.nama.charAt(0)}</div>
                                        <div className="ct-info">
                                            <span className="ct-name">{child.nama}</span>
                                            <span className="ct-prog">{child.program_name}</span>
                                            {child.enrollment_status === 'pending' && (
                                                <span className="ct-status ct-status-pending">⏳ Menunggu Verifikasi</span>
                                            )}
                                            {child.enrollment_status === 'inactive' && (
                                                <span className="ct-status ct-status-inactive">⛔ Tidak Aktif</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Tidak punya anak */}
                    {!loadingChildren && !childrenError && children.length === 0 && (
                        <div className="timeline-container">
                            <div className="center-state empty-st">
                                <GraduationCap size={48} style={{ opacity: 0.3 }} />
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Belum Ada Data Anak</div>
                                <p style={{ fontSize: 13 }}>Hubungi admin untuk mendaftarkan anak Anda.</p>
                            </div>
                        </div>
                    )}

                    {/* Stats & Timeline — tampil hanya jika ada anak terpilih */}
                    {!loadingChildren && selectedChild && (() => {
                        const currentChild = children.find(c => c.id === selectedChild);
                        const isLocked = currentChild && currentChild.enrollment_status !== 'active';
                        return (
                        <>
                            {/* Lock state — jika pending atau inactive */}
                            {isLocked && currentChild && (
                                <div className="timeline-container">
                                    <div className={`lock-state`}>
                                        <div className={`lock-icon ${currentChild.enrollment_status === 'pending' ? 'lock-pending' : 'lock-inactive'}`}>
                                            {currentChild.enrollment_status === 'pending' ? '⏳' : '⛔'}
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                                            {currentChild.enrollment_status === 'pending' ? 'Menunggu Verifikasi' : 'Akun Tidak Aktif'}
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 340, lineHeight: 1.6 }}>
                                            {currentChild.enrollment_status === 'pending'
                                                ? 'Pendaftaran anak Anda sedang dalam proses verifikasi oleh admin. Laporan akan tersedia setelah status menjadi aktif.'
                                                : 'Akun anak Anda saat ini tidak aktif. Silakan hubungi admin untuk informasi lebih lanjut.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Stats Summary — hanya jika active */}
                            {!isLocked && <div className="stats-row">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--blue)' }}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className="stat-val">{loadingReports ? '—' : reports.length}</div>
                                        <div className="stat-lbl">Total Laporan</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <div className="stat-val">{loadingReports ? '—' : totalHadir}</div>
                                        <div className="stat-lbl">Total Hadir</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'rgba(212,160,23,0.1)', color: 'var(--gold)' }}>
                                        <Star size={24} />
                                    </div>
                                    <div>
                                        <div className="stat-val">{loadingReports ? '—' : totalSangatLancar}</div>
                                        <div className="stat-lbl">Sangat Lancar</div>
                                    </div>
                                </div>
                            </div>}

                            {/* Timeline — hanya jika active */}
                            {!isLocked && (
                            <div className="timeline-container">
                                <div className="ip-sec-title"><Calendar size={15} /> Riwayat Setoran</div>

                                {/* Loading reports */}
                                {loadingReports && (
                                    <div className="center-state">
                                        <Loader2 size={28} className="spin" style={{ color: 'var(--green)' }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)' }}>Memuat laporan...</span>
                                    </div>
                                )}

                                {/* Error reports */}
                                {!loadingReports && reportsError && (
                                    <div className="err-banner">
                                        <AlertTriangle size={16} />
                                        {reportsError}
                                        <button className="retry-btn"
                                            onClick={() => setSelectedChild(id => id)}>
                                            <RefreshCw size={13} /> Coba Lagi
                                        </button>
                                    </div>
                                )}

                                {/* Empty */}
                                {!loadingReports && !reportsError && reports.length === 0 && (
                                    <div className="center-state empty-st">
                                        <BookOpen size={48} style={{ opacity: 0.3 }} />
                                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Belum Ada Laporan</div>
                                        <p>Anak ini belum memiliki riwayat setoran atau absensi.</p>
                                    </div>
                                )}

                                {/* Timeline items */}
                                {!loadingReports && !reportsError && reports.map(r => {
                                    const d        = new Date(r.date);
                                    const day      = d.getDate();
                                    const month    = d.toLocaleString('id-ID', { month: 'short' });
                                    const isAbsent = ['izin', 'sakit', 'alpha'].includes(r.attendance);

                                    return (
                                        <div key={r.id} className="tl-item">

                                            {/* Kiri: Tanggal */}
                                            <div className="tl-date">
                                                <div className="tl-day">{day}</div>
                                                <div className="tl-month">{month}</div>
                                            </div>

                                            {/* Tengah: Titik */}
                                            <div className={`tl-dot ${isAbsent ? 'tl-dot-absent' : ''}`} />

                                            {/* Kanan: Konten */}
                                            <div className="tl-content">
                                                <div className="tl-head">
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <span className={`badge ${ATTD_BADGE[r.attendance].cls}`}>
                                                            {ATTD_BADGE[r.attendance].lbl}
                                                        </span>
                                                        {r.report_type && (
                                                            <span className="badge b-type">{r.report_type}</span>
                                                        )}
                                                        {r.kualitas && (
                                                            <span className="badge b-qual">{QUAL_LABEL[r.kualitas]}</span>
                                                        )}
                                                    </div>
                                                    <div className="tl-teacher">
                                                        <Users size={13} /> {r.teacher_name || 'Admin'}
                                                    </div>
                                                </div>

                                                {!isAbsent && r.report_type && (
                                                    <div className="tl-grid">
                                                        <div className="tl-box">
                                                            <div className="tl-box-lbl"><Target size={12} /> Target Hafalan</div>
                                                            <div className="tl-box-val">{r.hafalan_target || '—'}</div>
                                                        </div>
                                                        <div className="tl-box tl-box-ok">
                                                            <div className="tl-box-lbl"><TrendingUp size={12} /> Capaian Aktual</div>
                                                            <div className="tl-box-val">{r.hafalan_achievement || '—'}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {r.teacher_notes && (
                                                    <div className="tl-notes">
                                                        <MessageCircle size={14} style={{ display: 'inline', marginRight: 6, position: 'relative', top: -2 }} />
                                                        {r.teacher_notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            )}
                        </>
                        );
                    })()}

                </div>
            </div>
        </>
    );
}