import { useState, FormEvent, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import {
  User, Lock, Bell, CheckCircle2, AlertCircle,
  Loader2, Eye, EyeOff, Save, ShieldCheck, Mail
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   STYLES (APPLE LIQUID GLASS)
═══════════════════════════════════════════════════════════ */
const CSS = `
.st { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }

/* Header */
.st-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.st-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.st-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }

/* ── Tabs (Horizontal Pill style seperti InfoPage) ── */
.st-tabs {
  display:flex; gap:8px;
  background: rgba(255, 255, 255, 0.45); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  padding: 6px; width: fit-content; flex-wrap: wrap;
}
.st-tab {
  display:flex; align-items:center; gap:8px;
  padding:10px 18px; border-radius:12px;
  font-size:13.5px; font-weight:700; color:#64748b;
  cursor:pointer; transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); border:none; font-family:inherit;
  background:transparent;
}
.st-tab:hover { background:rgba(255,255,255,0.5); color:#1e293b; }
.st-tab--on { background:#fff; color:#1e293b; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
.st-tab-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Content Card ── */
.st-card {
  position: relative; width: 100%;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: saturate(200%) blur(32px); -webkit-backdrop-filter: saturate(200%) blur(32px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
  overflow: hidden;
}

.st-c-hd {
  padding: 24px 32px; border-bottom: 1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.4);
}
.st-c-ttl { font-size: 18px; font-weight: 800; color: #1e293b; }
.st-c-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.st-c-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; }

/* Form Fields */
.st-fg { display: flex; flex-direction: column; gap: 8px; }
.st-fl { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
.st-input-wrap { position: relative; display: flex; align-items: center; }
.st-input-ico { position: absolute; left: 16px; color: #94a3b8; pointer-events: none; }
.st-fi {
  height: 48px; padding: 0 16px 0 46px; width: 100%;
  background: #ffffff; border: 1px solid #d1d5db;
  border-radius: 14px; font-size: 14px; font-weight: 500; color: #1e293b;
  font-family: inherit; transition: all 0.2s; outline: none;
}
/* Dinamis fokus warna per tab */
.st-fi-acc:focus { border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,0.15); }
.st-fi-sec:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }

.st-fi.st-err { border-color: #dc2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1) !important; }
.st-fe { font-size: 12px; color: #dc2626; font-weight: 600; display:flex; align-items:center; gap:4px; margin-top:2px; }

/* Password eye */
.st-eye {
  position: absolute; right: 16px; color: #94a3b8; cursor: pointer;
  background: none; border: none; padding: 0; display: flex; transition: color 0.2s;
}
.st-eye:hover { color: #2563eb; }

/* Toggle Switch (Notifikasi) */
.st-switch-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-radius: 16px;
  background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.9);
}
.st-sr-info { display: flex; flex-direction: column; gap: 4px; }
.st-sr-ttl { font-size: 14px; font-weight: 700; color: #1e293b; }
.st-sr-sub { font-size: 12.5px; color: #64748b; }
.st-toggle {
  width: 48px; height: 26px; border-radius: 99px; background: #cbd5e1;
  position: relative; cursor: pointer; transition: all 0.3s; border: none;
}
.st-toggle::after {
  content: ""; position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.st-toggle.st-toggle-on { background: #d4a017; }
.st-toggle.st-toggle-on::after { transform: translateX(22px); }

/* Submit Button */
.st-c-ft {
  padding: 20px 32px; border-top: 1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.4); display: flex; justify-content: flex-end;
}
.st-btn-save {
  display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 24px;
  border-radius: 14px; font-size: 14px; font-weight: 700; color: #fff;
  border: none; cursor: pointer; font-family: inherit; transition: all 0.25s;
}
.st-btn-save-acc { background: #0f766e; box-shadow: 0 6px 18px rgba(15,118,110,0.25), inset 0 1px 0 rgba(255,255,255,0.2); }
.st-btn-save-acc:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,118,110,0.35); }

.st-btn-save-sec { background: #2563eb; box-shadow: 0 6px 18px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.2); }
.st-btn-save-sec:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }

.st-btn-save-pref { background: #d4a017; box-shadow: 0 6px 18px rgba(212,160,23,0.25), inset 0 1px 0 rgba(255,255,255,0.2); }
.st-btn-save-pref:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,160,23,0.35); }

.st-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Toast */
.stoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:16px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,1); box-shadow:0 12px 40px rgba(0,0,0,0.1);
  font-size:14px; font-weight:600; color:#1e293b; animation:su .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes su { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
.stoast-ok  { border-left:4px solid #16a34a; }
.stoast-err { border-left:4px solid #dc2626; }

@media (max-width: 768px) {
  .st-c-hd, .st-c-body, .st-c-ft { padding: 20px; }
  .st-tabs { flex-wrap: wrap; }
}
`;

function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <div className={`stoast ${type==="success"?"stoast-ok":"stoast-err"}`}>
      {type==="success" ? <CheckCircle2 size={18} color="#16a34a"/> : <AlertCircle size={18} color="#dc2626"/>}
      {msg}
    </div>, document.body
  );
}

type TabId = "account" | "security" | "preferences";

const TABS: { id:TabId; label:string; icon:React.ReactNode; color:string }[] = [
  { id:"account",     label:"Informasi Akun", icon:<User size={16}/>,        color:"#0f766e" },
  { id:"security",    label:"Keamanan",       icon:<ShieldCheck size={16}/>, color:"#2563eb" },
  { id:"preferences", label:"Notifikasi",     icon:<Bell size={16}/>,        color:"#d4a017" },
];

export default function PengaturanPage() {
  const { auth, flash } = usePage().props as any;
  const user = auth?.user;

  const [tab, setTab] = useState<TabId>("account");
  const [toastMsg, setToastMsg] = useState<{ msg:string, type:"success"|"error" } | null>(null);

  useEffect(() => {
    if (flash?.success) setToastMsg({ msg: flash.success, type: 'success' });
    if (flash?.error) setToastMsg({ msg: flash.error, type: 'error' });
  }, [flash]);

  /* ── Form Profil Akun ── */
  const formProfile = useForm({
    username: user?.username || '',
    email: user?.email || '',
  });

  const submitProfile = (e: FormEvent) => {
    e.preventDefault();
    formProfile.put(route('settings.profile'), {
      preserveScroll: true,
      onSuccess: () => {
        formProfile.clearErrors();
        setToastMsg({ msg: "Profil berhasil diperbarui.", type: "success" });
      },
    });
  };

  /* ── Form Keamanan (Password) ── */
  const formPwd = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    formPwd.put(route('settings.password'), {
      preserveScroll: true,
      onSuccess: () => {
        formPwd.reset();
        setToastMsg({ msg: "Kata sandi berhasil diperbarui.", type: "success" });
      },
    });
  };

  /* ── Preferensi (Mockup UI) ── */
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefWA, setPrefWA] = useState(false);

  return (
    <>
      <style>{CSS}</style>

      <div className="st">
        {/* Header */}
        <div className="st-hd">
          <div>
            <div className="st-ttl">Pengaturan Akun</div>
            <div className="st-sub">Kelola informasi kredensial login dan preferensi akun Anda</div>
          </div>
        </div>

        {/* Tabs Horizontal */}
        <div className="st-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`st-tab ${tab===t.id ? "st-tab--on" : ""}`} onClick={() => setTab(t.id)}>
              <span className="st-tab-dot" style={{ background: tab===t.id ? t.color : "#94a3b8" }}/>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Card Berdasarkan Tab Aktif */}
        <div className="st-card">
            
          {/* ════ TAB 1: AKUN ════ */}
          {tab === "account" && (
            <form onSubmit={submitProfile}>
              <div className="st-c-hd">
                <div className="st-c-ttl">Informasi Akun</div>
                <div className="st-c-sub">Perbarui username dan alamat email yang Anda gunakan untuk masuk ke dalam sistem.</div>
              </div>
              <div className="st-c-body">
                <div className="st-fg">
                  <label className="st-fl">Username Login</label>
                  <div className="st-input-wrap">
                    <User className="st-input-ico" size={18} />
                    <input 
                      type="text" 
                      value={formProfile.data.username} 
                      onChange={e => formProfile.setData('username', e.target.value)} 
                      className={`st-fi st-fi-acc ${formProfile.errors.username ? 'st-err' : ''}`} 
                    />
                  </div>
                  {formProfile.errors.username && <div className="st-fe"><AlertCircle size={14}/> {formProfile.errors.username}</div>}
                </div>

                <div className="st-fg">
                  <label className="st-fl">Alamat Email</label>
                  <div className="st-input-wrap">
                    <Mail className="st-input-ico" size={18} />
                    <input 
                      type="email" 
                      value={formProfile.data.email} 
                      onChange={e => formProfile.setData('email', e.target.value)} 
                      className={`st-fi st-fi-acc ${formProfile.errors.email ? 'st-err' : ''}`} 
                    />
                  </div>
                  {formProfile.errors.email && <div className="st-fe"><AlertCircle size={14}/> {formProfile.errors.email}</div>}
                </div>
              </div>
              <div className="st-c-ft">
                <button type="submit" className="st-btn-save st-btn-save-acc" disabled={formProfile.processing}>
                  {formProfile.processing ? <><Loader2 size={16} className="animate-spin"/> Menyimpan...</> : <><Save size={16}/> Simpan Akun</>}
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 2: KEAMANAN ════ */}
          {tab === "security" && (
            <form onSubmit={submitPassword}>
              <div className="st-c-hd">
                <div className="st-c-ttl">Keamanan Kata Sandi</div>
                <div className="st-c-sub">Pastikan akun Anda menggunakan kata sandi panjang yang unik untuk tetap aman.</div>
              </div>
              <div className="st-c-body">
                <div className="st-fg">
                  <label className="st-fl">Kata Sandi Saat Ini</label>
                  <div className="st-input-wrap">
                    <Lock className="st-input-ico" size={18} />
                    <input 
                      type={showOld ? "text" : "password"} 
                      value={formPwd.data.current_password} 
                      onChange={e => formPwd.setData('current_password', e.target.value)} 
                      className={`st-fi st-fi-sec ${formPwd.errors.current_password ? 'st-err' : ''}`} 
                    />
                    <button type="button" className="st-eye" onClick={() => setShowOld(!showOld)}>
                      {showOld ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {formPwd.errors.current_password && <div className="st-fe"><AlertCircle size={14}/> {formPwd.errors.current_password}</div>}
                </div>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '8px 0' }} />

                <div className="st-fg">
                  <label className="st-fl">Kata Sandi Baru</label>
                  <div className="st-input-wrap">
                    <ShieldCheck className="st-input-ico" size={18} />
                    <input 
                      type={showNew ? "text" : "password"} 
                      value={formPwd.data.password} 
                      onChange={e => formPwd.setData('password', e.target.value)} 
                      className={`st-fi st-fi-sec ${formPwd.errors.password ? 'st-err' : ''}`} 
                      placeholder="Minimal 8 karakter"
                    />
                    <button type="button" className="st-eye" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {formPwd.errors.password && <div className="st-fe"><AlertCircle size={14}/> {formPwd.errors.password}</div>}
                </div>

                <div className="st-fg">
                  <label className="st-fl">Konfirmasi Sandi Baru</label>
                  <div className="st-input-wrap">
                    <ShieldCheck className="st-input-ico" size={18} />
                    <input 
                      type={showNew ? "text" : "password"} 
                      value={formPwd.data.password_confirmation} 
                      onChange={e => formPwd.setData('password_confirmation', e.target.value)} 
                      className="st-fi st-fi-sec" 
                      placeholder="Ulangi kata sandi baru"
                    />
                  </div>
                </div>
              </div>
              <div className="st-c-ft">
                <button type="submit" className="st-btn-save st-btn-save-sec" disabled={formPwd.processing}>
                  {formPwd.processing ? <><Loader2 size={16} className="animate-spin"/> Mengubah...</> : <><Lock size={16}/> Perbarui Sandi</>}
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 3: NOTIFIKASI ════ */}
          {tab === "preferences" && (
            <div>
              <div className="st-c-hd">
                <div className="st-c-ttl">Preferensi Notifikasi</div>
                <div className="st-c-sub">Atur bagaimana Anda ingin menerima pembaruan dari sistem QLC.</div>
              </div>
              <div className="st-c-body">
                <div className="st-switch-row">
                  <div className="st-sr-info">
                    <div className="st-sr-ttl">Pemberitahuan Email</div>
                    <div className="st-sr-sub">Terima info tagihan, jadwal, dan pengumuman via Email.</div>
                  </div>
                  <button type="button" className={`st-toggle ${prefEmail ? 'st-toggle-on' : ''}`} onClick={() => setPrefEmail(!prefEmail)} />
                </div>

                <div className="st-switch-row">
                  <div className="st-sr-info">
                    <div className="st-sr-ttl">Pesan WhatsApp</div>
                    <div className="st-sr-sub">Terima notifikasi cepat langsung ke nomor WA terdaftar Anda.</div>
                  </div>
                  <button type="button" className={`st-toggle ${prefWA ? 'st-toggle-on' : ''}`} onClick={() => setPrefWA(!prefWA)} />
                </div>
              </div>
              <div className="st-c-ft">
                <button type="button" className="st-btn-save st-btn-save-pref" onClick={() => setToastMsg({ msg: "Preferensi disimpan.", type: "success" })}>
                  <Save size={16}/> Simpan Preferensi
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </>
  );
}