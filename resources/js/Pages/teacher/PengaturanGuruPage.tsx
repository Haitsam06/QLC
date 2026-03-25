import { useState, FormEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    User, Lock, Eye, EyeOff, CheckCircle2,
    AlertCircle, Phone, MessageCircle,
    KeyRound, Save, ExternalLink, GraduationCap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
export interface TeacherProfile {
    nama_guru: string;
    phone: string;
    email: string;
    bidang: string;
}

interface Props {
    profile: TeacherProfile | null;
}

/* ═══════════════════════════════════════════════════════════
   STYLES — sama dengan PengaturanPage parents
═══════════════════════════════════════════════════════════ */
const CSS = `
.pg-wrap { display:flex; flex-direction:column; gap:20px; }
.pg-ph-title { font-size:22px; font-weight:900; color:var(--text); }
.pg-ph-sub   { font-size:12px; color:var(--text3); margin-top:4px; margin-bottom:0; }
.pg-card { background:var(--card); border-radius:18px; padding:24px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 1px 8px rgba(0,0,0,0.05); }
.pg-card-title { font-size:14px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.pg-card-sub   { font-size:11.5px; color:var(--text3); margin-bottom:20px; }
.pg-fields { display:flex; flex-direction:column; gap:14px; }
.pg-field  { display:flex; flex-direction:column; gap:5px; }
.pg-label  { font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.5px; }
.pg-value-wrap { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:11px; background:rgba(0,0,0,0.03); border:1.5px solid rgba(0,0,0,0.07); }
.pg-value { font-size:13.5px; font-weight:600; color:var(--text2); flex:1; }
.pg-lock  { color:var(--text3); flex-shrink:0; }
.pg-lock-banner { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; margin-top:16px; background:rgba(37,99,235,0.05); border:1px solid rgba(37,99,235,0.15); font-size:12px; color:var(--blue); font-weight:600; }
.pg-contact-btn { margin-left:auto; display:flex; align-items:center; gap:5px; padding:6px 14px; border-radius:8px; font-size:11.5px; font-weight:700; background:var(--blue); color:#fff; border:none; cursor:pointer; font-family:inherit; transition:all 0.18s; flex-shrink:0; text-decoration:none; }
.pg-contact-btn:hover { background:#1d4ed8; }
.pg-form { display:flex; flex-direction:column; gap:16px; }
.pg-fg   { display:flex; flex-direction:column; gap:6px; }
.pg-fl   { font-size:11.5px; font-weight:700; color:var(--text2); }
.pg-fi-wrap { display:flex; align-items:center; background:#fff; border:1.5px solid rgba(0,0,0,0.1); border-radius:11px; overflow:hidden; transition:all 0.2s; }
.pg-fi-wrap:focus-within { border-color:var(--green); box-shadow:0 0 0 3px rgba(15,118,110,0.1); }
.pg-fi-wrap--err { border-color:var(--red)!important; box-shadow:0 0 0 3px rgba(220,38,38,0.08)!important; }
.pg-fi { flex:1; height:44px; padding:0 14px; font-size:13.5px; font-weight:600; color:var(--text); background:transparent; outline:none; border:none; font-family:inherit; }
.pg-fi-icon { padding:0 12px; color:var(--text3); flex-shrink:0; }
.pg-fi-btn  { padding:0 12px; color:var(--text3); flex-shrink:0; cursor:pointer; background:none; border:none; transition:color 0.15s; }
.pg-fi-btn:hover { color:var(--green); }
.pg-err { font-size:11px; font-weight:600; color:var(--red); display:flex; align-items:center; gap:4px; }
.pg-submit { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; height:46px; border-radius:11px; background:var(--green); color:#fff; font-size:13.5px; font-weight:700; font-family:inherit; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(15,118,110,0.3); transition:all 0.18s; }
.pg-submit:hover { box-shadow:0 6px 20px rgba(15,118,110,0.4); transform:translateY(-1px); }
.pg-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
.pg-toast { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; margin-bottom:4px; background:var(--green-light); border:1px solid rgba(15,118,110,0.2); font-size:12.5px; font-weight:600; color:var(--green); animation:pgFade 0.25s ease; }
@keyframes pgFade { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.pg-divider { height:1px; background:rgba(0,0,0,0.06); margin:4px 0; }
`;

const ADMIN_WA = '6281234567890'; // ← Ganti nomor WA admin

/* ═══════════════════════════════════════════════════════════
   FORM: Username
═══════════════════════════════════════════════════════════ */
function UsernameForm() {
    const { auth } = usePage<PageProps>().props as any;
    const user = auth?.user;

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        username: (user?.username as string) ?? '',
        email:    (user?.email    as string) ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('settings.profile'));
    };

    return (
        <div className="pg-card">
            <div className="pg-card-title"><KeyRound size={16} color="var(--green)"/> Kredensial Akun</div>
            <div className="pg-card-sub">Ubah username dan email yang digunakan untuk masuk ke sistem.</div>

            {recentlySuccessful && (
                <div className="pg-toast"><CheckCircle2 size={15}/> Kredensial akun berhasil diperbarui.</div>
            )}

            <form onSubmit={submit} className="pg-form">
                <div className="pg-fg">
                    <label className="pg-fl">Username</label>
                    <div className={`pg-fi-wrap ${errors.username ? 'pg-fi-wrap--err' : ''}`}>
                        <span className="pg-fi-icon"><User size={15}/></span>
                        <input className="pg-fi" type="text" value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            placeholder="Username baru" autoComplete="username"/>
                    </div>
                    {errors.username && <p className="pg-err"><AlertCircle size={12}/>{errors.username}</p>}
                </div>

                <div className="pg-fg">
                    <label className="pg-fl">Email <span style={{fontWeight:500,color:'var(--text3)'}}>(opsional)</span></label>
                    <div className={`pg-fi-wrap ${errors.email ? 'pg-fi-wrap--err' : ''}`}>
                        <span className="pg-fi-icon"><span style={{fontSize:13}}>@</span></span>
                        <input className="pg-fi" type="email" value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="Alamat email" autoComplete="email"/>
                    </div>
                    {errors.email && <p className="pg-err"><AlertCircle size={12}/>{errors.email}</p>}
                </div>

                <button type="submit" className="pg-submit" disabled={processing}>
                    <Save size={15}/> {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   FORM: Password
═══════════════════════════════════════════════════════════ */
function PasswordForm() {
    const [showC, setShowC] = useState(false);
    const [showN, setShowN] = useState(false);
    const [showK, setShowK] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '', password: '', password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('settings.password'), { onSuccess: () => reset() });
    };

    return (
        <div className="pg-card">
            <div className="pg-card-title"><Lock size={16} color="var(--green)"/> Ubah Kata Sandi</div>
            <div className="pg-card-sub">Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.</div>

            {recentlySuccessful && (
                <div className="pg-toast"><CheckCircle2 size={15}/> Kata sandi berhasil diperbarui.</div>
            )}

            <form onSubmit={submit} className="pg-form">
                <div className="pg-fg">
                    <label className="pg-fl">Kata Sandi Saat Ini</label>
                    <div className={`pg-fi-wrap ${errors.current_password ? 'pg-fi-wrap--err' : ''}`}>
                        <span className="pg-fi-icon"><Lock size={15}/></span>
                        <input className="pg-fi" type={showC ? 'text' : 'password'} value={data.current_password}
                            onChange={e => setData('current_password', e.target.value)}
                            placeholder="••••••••" autoComplete="current-password"/>
                        <button type="button" className="pg-fi-btn" onClick={() => setShowC(v => !v)}>
                            {showC ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.current_password && <p className="pg-err"><AlertCircle size={12}/>{errors.current_password}</p>}
                </div>

                <div className="pg-divider"/>

                <div className="pg-fg">
                    <label className="pg-fl">Kata Sandi Baru</label>
                    <div className={`pg-fi-wrap ${errors.password ? 'pg-fi-wrap--err' : ''}`}>
                        <span className="pg-fi-icon"><KeyRound size={15}/></span>
                        <input className="pg-fi" type={showN ? 'text' : 'password'} value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter" autoComplete="new-password"/>
                        <button type="button" className="pg-fi-btn" onClick={() => setShowN(v => !v)}>
                            {showN ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.password && <p className="pg-err"><AlertCircle size={12}/>{errors.password}</p>}
                </div>

                <div className="pg-fg">
                    <label className="pg-fl">Konfirmasi Kata Sandi Baru</label>
                    <div className={`pg-fi-wrap ${errors.password_confirmation ? 'pg-fi-wrap--err' : ''}`}>
                        <span className="pg-fi-icon"><KeyRound size={15}/></span>
                        <input className="pg-fi" type={showK ? 'text' : 'password'} value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            placeholder="Ulangi kata sandi baru" autoComplete="new-password"/>
                        <button type="button" className="pg-fi-btn" onClick={() => setShowK(v => !v)}>
                            {showK ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                    {errors.password_confirmation && <p className="pg-err"><AlertCircle size={12}/>{errors.password_confirmation}</p>}
                </div>

                <button type="submit" className="pg-submit" disabled={processing}>
                    <Save size={15}/> {processing ? 'Menyimpan…' : 'Perbarui Kata Sandi'}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PengaturanGuruPage({ profile }: Props) {
    return (
        <>
            <style>{CSS}</style>
            <div className="pg-wrap">

                <div>
                    <div className="pg-ph-title">Pengaturan Akun</div>
                    <div className="pg-ph-sub">Kelola kredensial login dan lihat informasi profil Anda.</div>
                </div>

                {/* ── Profil read-only ── */}
                <div className="pg-card">
                    <div className="pg-card-title"><GraduationCap size={16} color="var(--blue)"/> Informasi Profil Guru</div>
                    <div className="pg-card-sub">Data ini terdaftar secara resmi dan tidak dapat diubah sendiri.</div>

                    <div className="pg-fields">
                        {[
                            { label:'Nama Lengkap', value:profile?.nama_guru ?? '—', icon:<User size={14}/>         },
                            { label:'No. Telepon',  value:profile?.phone    ?? '—', icon:<Phone size={14}/>        },
                            { label:'Email',        value:profile?.email    ?? '—', icon:<span style={{fontSize:13}}>@</span> },
                            { label:'Bidang Studi', value:profile?.bidang   ?? '—', icon:<GraduationCap size={14}/> },
                        ].map(f => (
                            <div key={f.label} className="pg-field">
                                <span className="pg-label">{f.label}</span>
                                <div className="pg-value-wrap">
                                    <span className="pg-lock">{f.icon}</span>
                                    <span className="pg-value">{f.value}</span>
                                    <Lock size={13} className="pg-lock" style={{opacity:0.4}}/>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pg-lock-banner">
                        <AlertCircle size={15} style={{flexShrink:0}}/>
                        <span>Ingin mengubah data profil? Hubungi administrator sekolah.</span>
                        <a href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent("Assalamu'alaikum Admin, saya ingin mengajukan perubahan data profil akun guru saya.")}`}
                            target="_blank" rel="noreferrer" className="pg-contact-btn">
                            <MessageCircle size={13}/> Hubungi Admin <ExternalLink size={11}/>
                        </a>
                    </div>
                </div>

                <UsernameForm/>
                <PasswordForm/>
            </div>
        </>
    );
}