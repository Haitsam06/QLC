import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    BookOpen, LogOut, Settings, Bell, LayoutDashboard,
    Users, BookCheck, ArrowLeft, Plus, CheckCircle2,
    Clock, XCircle, GraduationCap, Calendar, FileText,
    ExternalLink, Baby, ChevronRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type EnrollmentStatus = 'active' | 'inactive' | 'pending';

interface Child {
    id: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    usia: number | null;
    program_id: string | null;
    program_name: string | null;
    enrollment_status: EnrollmentStatus;
    bukti_pembayaran: string | null;
    created_at: string | null;
}

interface Props {
    children: Child[];
}

/* ═══════════════════════════════════════════════════════════
   STYLES — konsisten dengan Dashboard.tsx
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
.bell-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--red); border: 1.5px solid #fff;
}
.topnav__profile {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 5px 5px 10px; border-radius: 12px;
  background: rgba(15,118,110,0.05); border: 1px solid rgba(15,118,110,0.1);
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.topnav__profile:hover { background: rgba(15,118,110,0.1); }
.av {
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--blue));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: #fff;
  box-shadow: 0 3px 10px rgba(15,118,110,0.28); flex-shrink: 0;
}
.av-sm { width: 30px; height: 30px; font-size: 11px; }
.pname { font-size: 12.5px; font-weight: 700; color: var(--text); white-space: nowrap; }
.prole { font-size: 10px; color: var(--text3); }

/* ── Page ── */
.page {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 28px 40px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Page heading ── */
.ph { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.ph-title { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
.ph-sub   { font-size: 12px; color: var(--text3); margin-top: 5px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 11px; font-size: 13px; font-weight: 700;
  background: var(--green); color: #fff;
  box-shadow: 0 4px 14px rgba(15,118,110,0.3);
  transition: all 0.18s;
}
.btn-primary:hover { box-shadow: 0 6px 20px rgba(15,118,110,0.4); transform: translateY(-1px); }

/* ── Stats row ── */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat-card {
  background: var(--card); border-radius: 16px; padding: 18px 20px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  display: flex; align-items: center; gap: 14px;
}
.stat-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.stat-val  { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
.stat-lbl  { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 3px; }

/* ── Children grid ── */
.children-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.child-card {
  background: var(--card); border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  transition: all 0.2s;
}
.child-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }

.child-card-top {
  background: linear-gradient(135deg, var(--green) 0%, #0d5c56 60%, var(--blue) 100%);
  padding: 20px;
  display: flex; align-items: center; gap: 14px;
  position: relative; overflow: hidden;
}
.child-card-top::before {
  content: ""; position: absolute;
  width: 120px; height: 120px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  top: -40px; right: -30px;
}
.child-avatar {
  width: 52px; height: 52px; border-radius: 15px; flex-shrink: 0;
  background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900; color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.child-name  { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.2; }
.child-meta  { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 3px; }
.child-status-badge {
  margin-left: auto; flex-shrink: 0;
  padding: 4px 10px; border-radius: 99px;
  font-size: 10px; font-weight: 800; position: relative; z-index: 1;
}
.badge-active   { background: rgba(74,222,128,0.2); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
.badge-pending  { background: rgba(251,191,36,0.2); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
.badge-inactive { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.2); }

.child-card-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }

.child-info-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; color: var(--text2);
}
.child-info-row svg { color: var(--text3); flex-shrink: 0; }
.child-info-label { font-weight: 600; }

.child-program {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px; border-radius: 10px;
  background: rgba(15,118,110,0.06); border: 1px solid rgba(15,118,110,0.12);
}
.child-program-name { font-size: 12.5px; font-weight: 700; color: var(--green); }
.child-program-null { font-size: 12px; color: var(--text3); font-style: italic; }

.child-card-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.bukti-link {
  display: flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; color: var(--blue);
  padding: 5px 10px; border-radius: 8px;
  background: rgba(37,99,235,0.07); border: 1px solid rgba(37,99,235,0.15);
  text-decoration: none; transition: all 0.18s;
}
.bukti-link:hover { background: rgba(37,99,235,0.13); }
.daftar-date { font-size: 10.5px; color: var(--text3); }

/* ── Empty state ── */
.empty-state {
  background: var(--card); border-radius: 20px; padding: 60px 40px;
  text-align: center; border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-icon {
  width: 80px; height: 80px; border-radius: 24px;
  background: rgba(15,118,110,0.08); border: 1px solid rgba(15,118,110,0.12);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.empty-title { font-size: 18px; font-weight: 800; color: var(--text); }
.empty-desc  { font-size: 13px; color: var(--text3); max-width: 340px; line-height: 1.6; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .page { padding: 16px; gap: 14px; }
  .topnav { padding: 0 16px; }
  .topnav__nav { display: none; }
  .pname, .prole { display: none; }
  .stats-row { grid-template-columns: 1fr; }
  .children-grid { grid-template-columns: 1fr; }
}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
    active:   { label: 'Aktif',       badgeCls: 'badge-active',   icon: <CheckCircle2 size={11} /> },
    pending:  { label: 'Menunggu',    badgeCls: 'badge-pending',  icon: <Clock size={11} />        },
    inactive: { label: 'Tidak Aktif', badgeCls: 'badge-inactive', icon: <XCircle size={11} />     },
};

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard' },
    { icon: Users,           label: 'Anak Saya',  id: 'anak'      },
    { icon: BookCheck,       label: 'Laporan',    id: 'laporan'   },
    { icon: Settings,        label: 'Pengaturan', id: 'pengaturan'},
];

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const initials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Anak({ children }: Props) {
    const user        = usePage<PageProps>().props.auth.user;
    const displayName = user?.name || user?.username || 'Pengguna';
    const roleLabel   = 'Wali Murid';
    const avatarInit  = displayName.split(' ').filter(Boolean).slice(0, 2)
                            .map((p: string) => p[0]?.toUpperCase()).join('') || 'U';

    const activeCount  = children.filter(c => c.enrollment_status === 'active').length;
    const pendingCount = children.filter(c => c.enrollment_status === 'pending').length;

    const handleLogout = () => router.post(route('logout'));
    const goTo = (id: string) => {
        if (id === 'dashboard') router.visit(route('parents.dashboard'));
        if (id === 'anak')      router.visit(route('parents.anak'));
        if (id === 'laporan')   router.visit(route('parents.laporan'));
    };

    return (
        <>
            <Head title="Anak Saya" />
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
                            <button
                                key={id}
                                className={`topnav__nav-item ${id === 'anak' ? 'topnav__nav-item--active' : ''}`}
                                onClick={() => goTo(id)}
                            >
                                <Icon size={15} strokeWidth={id === 'anak' ? 2.5 : 1.8} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="topnav__gap" />

                    <div className="topnav__actions">
                        <button className="topnav__icon-btn">
                            <Settings size={16} strokeWidth={1.8} />
                        </button>
                        <button className="topnav__icon-btn">
                            <Bell size={16} strokeWidth={1.8} />
                            <span className="bell-dot" />
                        </button>
                        <button className="topnav__icon-btn" onClick={handleLogout} title="Keluar">
                            <LogOut size={16} strokeWidth={1.8} />
                        </button>
                        <div className="topnav__profile">
                            <div>
                                <div className="pname">{displayName}</div>
                                <div className="prole">{roleLabel}</div>
                            </div>
                            <div className="av av-sm">{avatarInit}</div>
                        </div>
                    </div>
                </nav>

                {/* ════ PAGE ════ */}
                <div className="page">

                    {/* Heading */}
                    <div className="ph">
                        <div>
                            <div className="ph-title">Anak Saya</div>
                            <div className="ph-sub">
                                {children.length > 0
                                    ? `${children.length} anak terdaftar · ${activeCount} aktif · ${pendingCount} menunggu konfirmasi`
                                    : 'Belum ada anak yang didaftarkan'}
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => router.visit(route('parents.daftar'))}
                        >
                            <Plus size={15} /> Daftarkan Anak
                        </button>
                    </div>

                    {/* Stats */}
                    {children.length > 0 && (
                        <div className="stats-row">
                            {[
                                { icon: Baby,         color: 'rgba(15,118,110,0.1)',   iconColor: 'var(--green)', val: children.length, lbl: 'Total Anak'          },
                                { icon: CheckCircle2, color: 'rgba(22,163,74,0.1)',    iconColor: '#16a34a',      val: activeCount,      lbl: 'Status Aktif'        },
                                { icon: Clock,        color: 'rgba(245,158,11,0.1)',   iconColor: '#d97706',      val: pendingCount,     lbl: 'Menunggu Konfirmasi' },
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.color }}>
                                        <s.icon size={20} color={s.iconColor} />
                                    </div>
                                    <div>
                                        <div className="stat-val">{s.val}</div>
                                        <div className="stat-lbl">{s.lbl}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Children list */}
                    {children.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Baby size={36} color="var(--green)" />
                            </div>
                            <div className="empty-title">Belum Ada Anak Terdaftar</div>
                            <p className="empty-desc">
                                Daftarkan anak Anda ke program QLC untuk mulai memantau perkembangan mereka di sini.
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => router.visit(route('parents.daftar'))}
                            >
                                <Plus size={15} /> Daftarkan Anak Sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="children-grid">
                            {children.map(child => {
                                const stCfg = STATUS_CONFIG[child.enrollment_status] ?? STATUS_CONFIG.pending;
                                return (
                                    <div key={child.id} className="child-card">

                                        {/* Card top */}
                                        <div className="child-card-top">
                                            <div className="child-avatar">
                                                {initials(child.nama)}
                                            </div>
                                            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                                <div className="child-name">{child.nama}</div>
                                                <div className="child-meta">
                                                    {child.tempat_lahir}{child.usia ? ` · ${child.usia} tahun` : ''}
                                                </div>
                                            </div>
                                            <span className={`child-status-badge ${stCfg.badgeCls}`}>
                                                {stCfg.label}
                                            </span>
                                        </div>

                                        {/* Card body */}
                                        <div className="child-card-body">

                                            {/* Program */}
                                            <div className="child-program">
                                                <GraduationCap size={14} color="var(--green)" />
                                                {child.program_name
                                                    ? <span className="child-program-name">{child.program_name}</span>
                                                    : <span className="child-program-null">Program tidak ditemukan</span>
                                                }
                                            </div>

                                            {/* Tanggal lahir */}
                                            <div className="child-info-row">
                                                <Calendar size={13} />
                                                <span className="child-info-label">Tgl Lahir:</span>
                                                <span>{formatDate(child.tanggal_lahir)}</span>
                                            </div>

                                            {/* Tanggal daftar */}
                                            <div className="child-info-row">
                                                <Clock size={13} />
                                                <span className="child-info-label">Didaftarkan:</span>
                                                <span>{formatDate(child.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Card footer */}
                                        <div className="child-card-footer">
                                            {child.bukti_pembayaran ? (
                                                <a
                                                    href={child.bukti_pembayaran}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bukti-link"
                                                >
                                                    <FileText size={12} />
                                                    Bukti Pembayaran
                                                    <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: 11.5, color: 'var(--text3)', fontStyle: 'italic' }}>
                                                    Belum ada bukti
                                                </span>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {stCfg.icon}
                                                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
                                                    {stCfg.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}