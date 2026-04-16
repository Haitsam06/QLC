import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Building2, BookOpen, Image, Plus, Pencil, Trash2, X,
  Loader2, CheckCircle2, AlertCircle, Search,
  ChevronLeft, ChevronRight, Upload, Link,
  Phone, Mail, MapPin, Instagram, Facebook,
  Youtube, Clock, Users, Filter, Eye, ChevronDown, Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Profile {
  id?: string;
  name: string;
  logo: string | null;
  tagline: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  address: string | null;
  whatsapp: string | null;
  email: string | null;
  social_media: Record<string, string> | null;
  updated_at?: string | null;
}
interface Program {
  id: string;
  name: string;
  description: string | null;
  target_audience: string | null;
  duration: string | null;
  image_url: string | null;
  created_at: string | null;
}
interface GalleryItem {
  id: string;
  title: string;
  media_url: string;
  type: "Photo" | "Video";
  uploaded_at: string | null;
}
interface Meta { total: number; page: number; per_page: number; last_page: number; }
interface Option { id: string; label: string; }

const API = "/api/info";

/* ═══════════════════════════════════════════════════════════
   STYLES (APPLE LIQUID GLASS)
═══════════════════════════════════════════════════════════ */
const CSS = `
.ip { width:100%; display:flex; flex-direction:column; gap:24px; color: #1e293b; }

/* ── Page header ── */
.ip-hd  { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.ip-ttl { font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; line-height:1; }
.ip-sub { font-size:13px; color:#64748b; margin-top:6px; font-weight:500; }

/* ── Tabs (Pill style) ── */
.ip-tabs {
  display:flex; gap:8px;
  background: rgba(255, 255, 255, 0.45); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  padding: 6px; width: fit-content; flex-wrap: wrap;
}
.ip-tab {
  display:flex; align-items:center; gap:8px;
  padding:10px 18px; border-radius:12px;
  font-size:13.5px; font-weight:700; color:#64748b;
  cursor:pointer; transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); border:none; font-family:inherit;
  background:transparent;
}
.ip-tab:hover { background:rgba(255,255,255,0.5); color:#1e293b; }
.ip-tab--on { background:#fff; color:#1e293b; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
.ip-tab-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

/* ── Glass card ── */
.ip-card {
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: saturate(200%) blur(32px); -webkit-backdrop-filter: saturate(200%) blur(32px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
  overflow: hidden;
}
.ip-card-pad { padding:28px 32px; }

/* ── Section titles ── */
.ip-sec-title {
  font-size:13.5px; font-weight:800; color:#1e293b;
  text-transform:uppercase; letter-spacing:1px;
  display:flex; align-items:center; gap:10px; margin-bottom:20px;
}
.ip-sec-title::after { content:""; flex:1; height:1px; background:rgba(0,0,0,0.08); }

/* ════════════════════
   PROFILE TAB (Green Theme #0f766e)
════════════════════ */
.prof-grid { display:grid; grid-template-columns:200px 1fr; gap:28px; }

.prof-logo-wrap { display:flex; flex-direction:column; align-items:center; gap:14px; }
.prof-logo {
  width:160px; height:160px; border-radius:24px; object-fit:cover;
  border:1px solid rgba(255,255,255,0.9);
  box-shadow:0 12px 32px rgba(15,118,110,0.15);
}
.prof-logo-placeholder {
  width:160px; height:160px; border-radius:24px;
  background:rgba(255,255,255,0.6); border:2px dashed rgba(15,118,110,0.3);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:10px; color:#64748b; font-size:13px; font-weight:600;
}
.prof-upload-btn {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700;
  background:rgba(255,255,255,0.7); color:#0f766e;
  border:1px solid rgba(15,118,110,0.2); cursor:pointer; transition:all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02); font-family:inherit;
}
.prof-upload-btn:hover { background:#fff; border-color:#0f766e; transform:translateY(-1px); box-shadow: 0 4px 12px rgba(15,118,110,0.1); }

.prof-contact { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
.prof-contact-item {
  display:flex; align-items:flex-start; gap:12px;
  padding:16px; border-radius:16px;
  background:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.9);
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}
.prof-contact-ico {
  width:36px; height:36px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.prof-contact-lbl { font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
.prof-contact-val { font-size:13.5px; font-weight:600; color:#1e293b; margin-top:4px; word-break:break-word; line-height:1.4; }

.prof-save-bar {
  display:flex; justify-content:flex-end; gap:10px;
  padding:20px 32px; border-top:1px solid rgba(0,0,0,0.06);
  background: rgba(255,255,255,0.3);
}

/* Base form inputs inside Card (glassy) */
.ifg { display:flex; flex-direction:column; gap:8px; }
.ifl { font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; }
.ifi-glass, .ita-glass {
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 12px;
  font-size: 14px; font-weight: 500; color: #1e293b;
  font-family: inherit; transition: all 0.25s; width: 100%; outline: none;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
}
.ifi-glass { height: 44px; padding: 0 16px; }
.ita-glass { padding: 14px 16px; resize: vertical; line-height: 1.5; }
.ifi-glass:focus, .ita-glass:focus {
  background: #ffffff; border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15,118,110,0.15), inset 0 1px 2px rgba(0,0,0,0.02);
}
.ife { font-size:11.5px; color:#dc2626; font-weight:600; }

/* ════════════════════
   PROGRAMS TAB (Blue Theme #2563eb) & SPECIAL PROG (Rose #e11d48)
════════════════════ */
.prog-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;
  padding:24px 32px 32px;
}
.prog-card {
  background:rgba(255,255,255,0.7); border-radius:20px;
  border:1px solid rgba(255,255,255,1);
  box-shadow:0 8px 24px rgba(0,0,0,0.04);
  overflow:hidden; transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.prog-card:hover { box-shadow:0 12px 32px rgba(37,99,235,0.1); transform:translateY(-3px); }


.prog-img { width:100%; height:180px; object-fit:cover; display:block; }
.prog-img-placeholder {
  width:100%; height:180px;
  background:linear-gradient(135deg, rgba(37,99,235,0.05), rgba(37,99,235,0.15));
  display:flex; align-items:center; justify-content:center; color:#94a3b8;
}

.prog-body { padding:20px; }
.prog-name { font-size:16px; font-weight:800; color:#1e293b; letter-spacing:-0.2px; }
.prog-desc {
  font-size:13px; color:#64748b; margin-top:6px; line-height:1.5; font-weight:500;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.prog-tags { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
.prog-tag {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:8px; font-size:11.5px; font-weight:700;
}
.prog-tag-audience { background:rgba(37,99,235,0.1); color:#2563eb; }
.prog-tag-duration { background:rgba(212,160,23,0.12); color:#b45309; }



.prog-card-foot {
  display:flex; gap:8px; padding:16px 20px;
  border-top:1px solid rgba(0,0,0,0.04); background:rgba(255,255,255,0.3);
}
.prog-act {
  flex:1; height:36px; border-radius:10px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  font-size:13px; font-weight:700; font-family:inherit; transition:all 0.2s;
  background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 6px rgba(0,0,0,0.02);
}
.prog-edit { color:#2563eb; }
.prog-del  { color:#dc2626; }
.prog-edit:hover { background:#2563eb; color:#fff; border-color:#2563eb; transform:scale(1.03); }

.prog-del:hover  { background:#dc2626; color:#fff; border-color:#dc2626; transform:scale(1.03); }

/* ════════════════════
   GALLERY TAB (Purple Theme #7c3aed)
════════════════════ */
.gal-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:16px;
  padding:24px 32px 32px;
}
.gal-item {
  border-radius:18px; overflow:hidden;
  background:rgba(255,255,255,0.7);
  border:1px solid rgba(255,255,255,0.9);
  box-shadow:0 6px 16px rgba(0,0,0,0.04);
  cursor:pointer; transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); position:relative;
}
.gal-item:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(124,58,237,0.15); }
.gal-item:hover .gal-overlay { opacity:1; }
.gal-thumb { width:100%; height:160px; object-fit:cover; display:block; }
.gal-thumb-placeholder {
  width:100%; height:160px;
  background:linear-gradient(135deg,rgba(124,58,237,0.05),rgba(124,58,237,0.15));
  display:flex; align-items:center; justify-content:center;
}
.gal-overlay {
  position:absolute; top:0; left:0; right:0; height:160px; background:rgba(15,23,42,0.4); backdrop-filter:blur(2px);
  display:flex; align-items:center; justify-content:center; gap:12px;
  opacity:0; transition:opacity 0.25s;
}
.gal-ov-btn {
  width:40px; height:40px; border-radius:12px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:all 0.2s;
  font-family:inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.gal-ov-edit { background:rgba(255,255,255,0.9); color:#7c3aed; }
.gal-ov-del  { background:#dc2626; color:#fff; }
.gal-ov-edit:hover { transform:scale(1.1); }
.gal-ov-del:hover  { transform:scale(1.1); box-shadow:0 4px 16px rgba(220,38,38,0.4); }
.gal-info { padding:14px 16px; }
.gal-title { font-size:14px; font-weight:700; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gal-meta  { font-size:11.5px; font-weight:500; color:#64748b; margin-top:4px; display:flex; align-items:center; gap:6px; }
.gal-type-badge {
  display:inline-flex; align-items:center; gap:3px;
  padding:3px 8px; border-radius:6px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;
}
.gal-photo { background:rgba(15,118,110,0.1); color:#0f766e; }
.gal-video { background:rgba(124,58,237,0.1); color:#7c3aed; }

/* ════════════════════
   TOOLBAR (shared)
════════════════════ */
.ip-toolbar {
  display:flex; gap:12px; flex-wrap:wrap; align-items:center;
  padding:20px 32px; border-bottom:1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.3);
}
.ip-search {
  display:flex; align-items:center; gap:10px;
  flex:1; min-width:220px; max-width:340px; height:44px; padding:0 16px;
  background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.9); border-radius:14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9); transition:all 0.3s;
}
.ip-search:focus-within { background:#fff; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color:#cbd5e1; transform:translateY(-1px); }

/* PENYEMPURNAAN CSS INPUT SEARCH */
.ip-search input { 
  flex:1; font-size:14px; font-weight:500; color:#1e293b; 
  background:transparent; outline:none !important; border:none !important; box-shadow:none !important; 
}
.ip-search input:focus { outline:none !important; border:none !important; box-shadow:none !important; }
.ip-search input::placeholder { color:#94a3b8; font-weight:400; }

/* Custom Dropdown Filter */
.ip-sel-wrap { position: relative; }
.ip-sel {
  display:flex; align-items:center; gap:8px;
  height:44px; padding:0 16px; min-width:180px;
  background: rgba(255, 255, 255, 0.7); 
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); cursor: pointer; user-select: none;
}
.ip-sel:hover { background: rgba(255, 255, 255, 0.95); }
.ip-sel--open {
  background: #ffffff; border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 0 0 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-1px);
}
.ip-sel-val { flex:1; font-size:14px; font-weight:600; color:#1e293b; text-align: left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.ip-sel-menu {
  position: absolute; top: calc(100% + 10px); right: 0; min-width: 200px; max-height:250px; overflow-y:auto;
  background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(200%) blur(40px); -webkit-backdrop-filter: saturate(200%) blur(40px);
  border: 1px solid rgba(255,255,255,1); border-radius: 18px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
  padding: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 100;
  animation: isu .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ip-sel-item {
  padding: 12px 14px; border-radius: 12px; font-size: 13.5px; font-weight: 500; color: #475569;
  cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between;
}
.ip-sel-item:hover { background: rgba(0,0,0,0.04); color: #1e293b; }
.ip-sel-item.active { background: #f1f5f9; color: #0f172a; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.ip-sel-overlay { position: fixed; inset: 0; z-index: 99; }

/* ── Buttons ── */
.ip-btn-add {
  display:flex; align-items:center; gap:6px; height:44px; padding:0 20px; border-radius:14px;
  font-size:14px; font-weight:700; color:#fff; cursor:pointer; border:none; font-family:inherit;
  transition:all 0.25s cubic-bezier(0.25, 1, 0.5, 1); white-space:nowrap;
}
.ip-btn-add:hover { transform:translateY(-2px); }

.ip-btn-save {
  display:flex; align-items:center; gap:8px; height:44px; padding:0 24px; border-radius:14px;
  font-size:14px; font-weight:700; color:#fff; cursor:pointer; border:none; font-family:inherit;
  background:#0f766e; box-shadow:0 6px 18px rgba(15,118,110,0.25), inset 0 1px 0 rgba(255,255,255,0.2); transition:all 0.25s;
}
.ip-btn-save:hover:not(:disabled) { box-shadow:0 8px 24px rgba(15,118,110,0.35); transform:translateY(-1px); }
.ip-btn-save:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* ── Pagination (shared) ── */
.ip-pag {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 32px; border-top:1px solid rgba(0,0,0,0.04); flex-wrap:wrap; gap:10px;
  background: rgba(255,255,255,0.3);
}
.ip-pag-info { font-size:13px; font-weight:500; color:#64748b; }
.ip-pag-btns { display:flex; gap:6px; }
.ipb {
  width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;
  background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.05); color:#475569;
  transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.02);
}
.ipb:hover:not(:disabled) { background:#fff; color:#1e293b; transform:translateY(-1px); }
.ipb:disabled { opacity:.4; cursor:not-allowed; }
.ipb--on-prog { background:#2563eb; color:#fff; border-color:#2563eb; box-shadow:0 4px 12px rgba(37,99,235,0.3); }
.ipb--on-sprog { background:#e11d48; color:#fff; border-color:#e11d48; box-shadow:0 4px 12px rgba(225,29,72,0.3); }
.ipb--on-gal { background:#7c3aed; color:#fff; border-color:#7c3aed; box-shadow:0 4px 12px rgba(124,58,237,0.3); }

/* ════════════════════
   MODALS (Clean White Glass)
════════════════════ */
.imbk {
  position:fixed; inset:0; z-index:700; background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px; animation:ifi .2s ease;
}
@keyframes ifi  { from{opacity:0} to{opacity:1} }
@keyframes isu  { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes ispin{ to{transform:rotate(360deg)} }

.im {
  width:100%; max-width:540px; max-height:90vh; display: flex; flex-direction: column;
  background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,1); border-radius:24px;
  box-shadow:0 24px 64px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1); animation:isu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.im-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 28px 16px; border-bottom:1px solid rgba(0,0,0,0.06); background:transparent;
}
.im-title { font-size:18px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.im-cls {
  width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.05); color:#64748b; cursor:pointer; border:none; transition:all 0.2s;
}
.im-cls:hover { background:rgba(220,38,38,0.1); color:#dc2626; transform:scale(1.05); }

.im-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; }

.im-ft {
  display:flex; justify-content:flex-end; gap:10px; padding:16px 28px 24px;
  border-top:1px solid rgba(0,0,0,0.06); background:transparent; 
}

/* Modal form inputs (Solid white for readability) */
.ifi, .ita, .isel {
  background: #ffffff; border: 1px solid #d1d5db;
  border-radius: 12px; font-size: 14px; font-weight: 500; color: #1e293b;
  font-family: inherit; transition: all 0.2s; width: 100%; outline: none;
}
.ifi, .isel { height: 44px; padding: 0 16px; }
.isel { appearance:none; padding-right:36px; cursor:pointer; }
.ita { padding: 14px 16px; resize: vertical; line-height:1.5; }
.ifi.ierr, .ita.ierr, .isel.ierr { border-color: #dc2626; }

/* Dynamic focus colors based on context */
.focus-prog:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.15); }
.focus-sprog:focus { border-color:#e11d48; box-shadow:0 0 0 3px rgba(225,29,72,0.15); }
.focus-gal:focus  { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.15); }

/* select wrapper */
.i-sel-wrap-modal { position:relative; }
.i-sel-ico { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; }

/* file upload area */
.i-upload {
  border:2px dashed rgba(0,0,0,0.15); border-radius:16px;
  padding:24px; text-align:center; cursor:pointer; transition:all 0.2s;
  background:rgba(255,255,255,0.6);
}
.i-upload.up-prog:hover { border-color:#2563eb; background:rgba(37,99,235,0.05); }
.i-upload.up-sprog:hover { border-color:#e11d48; background:rgba(225,29,72,0.05); }
.i-upload.up-gal:hover  { border-color:#7c3aed; background:rgba(124,58,237,0.05); }
.i-upload-lbl { font-size:13.5px; color:#1e293b; margin-top:8px; font-weight:700; }
.i-upload-sub { font-size:12px; color:#64748b; margin-top:4px; font-weight:500; }
.i-preview {
  width:100%; max-height:200px; object-fit:cover; border-radius:12px;
  margin-top:12px; border:1px solid rgba(0,0,0,0.08); box-shadow:0 4px 16px rgba(0,0,0,0.05);
}

/* type toggle */
.i-type-toggle { display:flex; gap:10px; }
.i-type-btn {
  flex:1; height:44px; border-radius:12px; border:1px solid #d1d5db;
  font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;
  display:flex; align-items:center; justify-content:center; gap:8px;
  background:#ffffff; color:#64748b; transition:all 0.2s;
}
.i-type-photo { background:#0f766e; color:#fff; border-color:#0f766e; box-shadow:0 4px 14px rgba(15,118,110,0.25); }
.i-type-video { background:#7c3aed; color:#fff; border-color:#7c3aed; box-shadow:0 4px 14px rgba(124,58,237,0.25); }
.i-status-active { background:#16a34a; color:#fff; border-color:#16a34a; box-shadow:0 4px 14px rgba(22,163,74,0.25); }
.i-status-draft { background:#64748b; color:#fff; border-color:#64748b; box-shadow:0 4px 14px rgba(100,116,139,0.25); }
.i-status-completed { background:#2563eb; color:#fff; border-color:#2563eb; box-shadow:0 4px 14px rgba(37,99,235,0.25); }

/* cancel btn */
.ibtn-cncl {
  padding:0 20px; height:44px; border-radius:12px; font-size:14px; font-weight:700; color:#475569;
  background:rgba(0,0,0,0.05); cursor:pointer; border:none; font-family:inherit; transition:background 0.2s;
}
.ibtn-cncl:hover { background:rgba(0,0,0,0.1); }

/* delete confirm */
.im-del { max-width:400px; }
.idel-bdy { padding:32px 28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
.idel-ico { width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,rgba(220,38,38,0.1),rgba(220,38,38,0.05)); color:#dc2626; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 24px rgba(220,38,38,0.1); }
.idel-t { font-size:19px; font-weight:800; color:#1e293b; letter-spacing:-0.3px; }
.idel-d { font-size:14px; font-weight:500; color:#64748b; line-height:1.5; }
.idel-ft { display:flex; gap:10px; padding:0 28px 28px; }
.ibtn-del {
  flex:1; height:44px; border-radius:12px; font-size:14px; font-weight:700; color:#fff;
  background:#dc2626; box-shadow:0 6px 18px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.2); cursor:pointer; border:none;
  display:flex; align-items:center; justify-content:center; gap:6px; font-family:inherit; transition:all 0.2s;
}
.ibtn-del:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(220,38,38,0.35); }
.ibtn-del:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* toast */
.itoast {
  position:fixed; bottom:24px; right:24px; z-index:999;
  display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:16px;
  background:rgba(255,255,255,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,1); box-shadow:0 12px 40px rgba(0,0,0,0.1);
  font-size:14px; font-weight:600; color:#1e293b; animation:isu .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width:340px;
}
.itoast-ok  { border-left:4px solid #16a34a; }
.itoast-err { border-left:4px solid #dc2626; }

/* blur */
.ip-blurred { filter:blur(4px) brightness(0.96); transition:filter 0.2s ease; pointer-events:none; user-select:none; }

/* empty */
.ip-empty { padding:80px 24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
.ip-empty-lbl { font-size:15px; color:#64748b; font-weight:600; }

@media (max-width:768px) {
  .prof-grid { grid-template-columns:1fr; gap:20px; }
  .prof-contact { grid-template-columns:1fr; }
  .ip-tabs { flex-wrap:wrap; }
  .prog-grid { grid-template-columns:1fr; padding: 20px; }
  .gal-grid  { grid-template-columns:repeat(2,1fr); padding: 20px; }
  .ip-card-pad { padding: 20px; }
}
@media (max-width:480px) {
  .gal-grid { grid-template-columns:1fr; }
}
`;

/* ── Helpers ── */
function useDebounce<T>(val: T, ms = 400): T {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`itoast ${type==="success"?"itoast-ok":"itoast-err"}`}>
      {type==="success" ? <CheckCircle2 size={18} color="#16a34a"/> : <AlertCircle size={18} color="#dc2626"/>}
      {msg}
    </div>
  );
}

/* ─── Shared form elements ─── */
const Fg = ({ label, error, children }: { label:string; error?:string; children:React.ReactNode }) => (
  <div className="ifg">
    <label className="ifl">{label}</label>
    {children}
    {error && <span className="ife">{error}</span>}
  </div>
);

/* ─── File upload preview ─── */
function FileUpload({ accept, preview, onFile, label, themeClass }: {
  accept: string; preview: string|null; onFile:(f:File)=>void; label:string; themeClass: "up-prog"|"up-gal"|"up-prof";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const color = themeClass === 'up-prog' ? '#2563eb' : themeClass === 'up-gal' ? '#7c3aed' : '#0f766e';
  return (
    <div>
      <div className={`i-upload ${themeClass}`} onClick={() => ref.current?.click()}>
        <Upload size={28} color={color}/>
        <div className="i-upload-lbl">{label}</div>
        <div className="i-upload-sub">Klik untuk pilih file</div>
        <input ref={ref} type="file" accept={accept} style={{ display:"none" }}
          onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}/>
      </div>
      {preview && <img src={preview} className="i-preview" alt="preview"/>}
    </div>
  );
}

/* ─── Delete confirm modal ─── */
function DeleteModal({ label, onClose, onConfirm }: {
  label:string; onClose:()=>void; onConfirm:()=>Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return createPortal(
    <div className="imbk" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="im im-del">
        <div className="idel-bdy">
          <div className="idel-ico"><Trash2 size={28}/></div>
          <div className="idel-t">Hapus Item?</div>
          <div className="idel-d">Data <b>{label}</b> akan dihapus permanen beserta filenya.</div>
        </div>
        <div className="idel-ft">
          <button className="ibtn-cncl" style={{ flex:1 }} onClick={onClose}>Batal</button>
          <button className="ibtn-del" onClick={go} disabled={busy}>
            {busy ? <><Loader2 size={16} style={{ animation:"ispin 1s linear infinite" }}/> Menghapus...</> : <><Trash2 size={16}/> Hapus</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — PROFILE (Green)
═══════════════════════════════════════════════════════════ */
function ProfileTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [prof, setProf] = useState<Profile>({ name:"", logo:null, tagline:null, history:null, vision:null, mission:null, address:null, whatsapp:null, email:null, social_media:null });
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [logoPreview, setLogoPreview] = useState<string|null>(null);
  const [busy, setBusy]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors]   = useState<Partial<Record<string,string>>>({});

  useEffect(() => {
    fetch(`${API}/profile`).then(r => r.json()).then(j => {
      if (j.success && j.data) setProf(j.data);
    }).finally(() => setLoading(false));
  }, []);

  const upd = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setProf(p => ({ ...p, [k]: e.target.value }));

  const updSocial = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProf(p => ({ ...p, social_media: { ...(p.social_media ?? {}), [k]: e.target.value } }));

  const validate = () => {
    const err: Record<string,string> = {};
    if (!prof.name.trim()) err.name = "Nama sekolah wajib diisi.";
    setErrors(err);
    return !Object.keys(err).length;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(prof).forEach(([k, v]) => {
        if (k === "logo" || k === "id" || k === "updated_at") return;
        if (k === "social_media") fd.append(k, JSON.stringify(v ?? {}));
        else fd.append(k, v ?? "");
      });
      if (logoFile) fd.append("logo", logoFile);

      const j = await (await fetch(`${API}/profile`, { method:"POST", body:fd })).json();
      if (j.success) { setProf(j.data); onToast("Profil berhasil disimpan.", "success"); }
      else onToast(j.message ?? "Gagal menyimpan.", "error");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="ip-empty"><Loader2 size={36} color="#0f766e" style={{ animation:"ispin 1s linear infinite" }}/></div>;

  return (
    <div>
      <div className="ip-card-pad">

        {/* ── Logo + Identitas ── */}
        <div className="ip-sec-title"><Building2 size={16}/> Identitas Sekolah</div>
        <div className="prof-grid">
          {/* Logo */}
          <div className="prof-logo-wrap">
            {(logoPreview || prof.logo)
              ? <img src={logoPreview ?? prof.logo!} className="prof-logo" alt="logo"/>
              : <div className="prof-logo-placeholder"><Building2 size={36}/><span>Belum ada logo</span></div>}
            <label className="prof-upload-btn">
              <Upload size={14}/> Ganti Logo
              <input type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                }}/>
            </label>
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Fg label="Nama Sekolah" error={errors.name}>
              <input className={`ifi-glass focus-prog ${errors.name?"ierr":""}`} placeholder="Nama resmi sekolah" value={prof.name} onChange={upd("name")}/>
            </Fg>
            <Fg label="Tagline">
              <input className="ifi-glass focus-prog" placeholder="Slogan atau motto sekolah" value={prof.tagline ?? ""} onChange={upd("tagline")}/>
            </Fg>
          </div>
        </div>

        {/* ── Konten ── */}
        <div className="ip-sec-title" style={{ marginTop:36 }}><BookOpen size={16}/> Konten Profil</div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Fg label="Sejarah">
            <textarea className="ita-glass focus-prog" rows={4} placeholder="Ceritakan sejarah berdirinya sekolah..." value={prof.history ?? ""} onChange={upd("history")}/>
          </Fg>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Fg label="Visi">
              <textarea className="ita-glass focus-prog" rows={3} placeholder="Visi sekolah..." value={prof.vision ?? ""} onChange={upd("vision")}/>
            </Fg>
            <Fg label="Misi">
              <textarea className="ita-glass focus-prog" rows={3} placeholder="Misi sekolah..." value={prof.mission ?? ""} onChange={upd("mission")}/>
            </Fg>
          </div>
        </div>

        {/* ── Kontak ── */}
        <div className="ip-sec-title" style={{ marginTop:36 }}><Phone size={16}/> Kontak & Media Sosial</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Fg label="Alamat">
            <textarea className="ita-glass focus-prog" rows={2} placeholder="Alamat lengkap sekolah" value={prof.address ?? ""} onChange={upd("address")}/>
          </Fg>
          <Fg label="Alamat Email">
            <input className="ifi-glass focus-prog" type="email" placeholder="info@sekolah.ac.id" value={prof.email ?? ""} onChange={upd("email")}/>
          </Fg>
          <Fg label="WhatsApp">
            <input className="ifi-glass focus-prog" placeholder="628123456789" value={prof.whatsapp ?? ""} onChange={upd("whatsapp")}/>
          </Fg>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginTop:16 }}>
          {[
            { k:"instagram", icon:<Instagram size={15}/>, ph:"@username" },
            { k:"facebook",  icon:<Facebook  size={15}/>, ph:"facebook.com/page" },
            { k:"youtube",   icon:<Youtube   size={15}/>, ph:"youtube.com/@channel" },
          ].map(({ k, icon, ph }) => (
            <Fg key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}>{icon}</div>
                <input className="ifi-glass focus-prog" style={{ paddingLeft:38 }} placeholder={ph}
                  value={prof.social_media?.[k] ?? ""} onChange={updSocial(k)}/>
              </div>
            </Fg>
          ))}
        </div>

      </div>

      <div className="prof-save-bar">
        <button className="ip-btn-save" onClick={save} disabled={busy}>
          {busy ? <><Loader2 size={16} style={{ animation:"ispin 1s linear infinite" }}/> Menyimpan...</> : <><CheckCircle2 size={16}/> Simpan Profil Sekolah</>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — PROGRAMS (Blue)
═══════════════════════════════════════════════════════════ */
function ProgramsTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [data,    setData]    = useState<Program[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0,page:1,per_page:10,last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,     setSel]     = useState<Program|null>(null);
  const dSearch = useDebounce(search);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"9", search:dSearch });
      const j = await (await fetch(`${API}/programs?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } finally { setLoading(false); }
  }, [dSearch]);

  useEffect(() => { load(1); }, [load]);

  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1,page-2), e = Math.min(last_page,page+2);
    return Array.from({ length:e-s+1 },(_,i)=>s+i);
  };

  return (
    <div>
      <div className="ip-toolbar">
        <div className="ip-search">
          <Search size={16} color="#64748b" className="flex-shrink-0"/>
          <input className="border-0 focus:ring-0 outline-none flex-1" placeholder="Cari program..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{ color:"#64748b", display:"flex", background:"none", border:"none", cursor:"pointer" }}><X size={14} strokeWidth={2.5}/></button>}
        </div>
        <div style={{ flex:1 }}/>
        <button className="ip-btn-add" style={{ background:"#2563eb", boxShadow:"0 6px 16px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          onClick={() => { setSel(null); setModal("add"); }}>
          <Plus size={16}/> Tambah Program
        </button>
      </div>

      {loading
        ? <div className="ip-empty"><Loader2 size={36} color="#2563eb" style={{ animation:"ispin 1s linear infinite" }}/></div>
        : data.length === 0
          ? <div className="ip-empty"><BookOpen size={48} color="#94a3b8" style={{opacity:0.5}}/><div className="ip-empty-lbl">{search ? "Tidak ada program yang sesuai." : "Belum ada data program."}</div></div>
          : <div className="prog-grid">
              {data.map(p => (
                <div key={p.id} className="prog-card">
                  {p.image_url
                    ? <img src={p.image_url} className="prog-img" alt={p.name}/>
                    : <div className="prog-img-placeholder"><BookOpen size={44} opacity={0.5}/></div>}
                  <div className="prog-body">
                    <div className="prog-name">{p.name}</div>
                    {p.description && <div className="prog-desc">{p.description}</div>}
                    <div className="prog-tags">
                      {p.target_audience && <span className="prog-tag prog-tag-audience"><Users size={12}/>{p.target_audience}</span>}
                      {p.duration        && <span className="prog-tag prog-tag-duration"><Clock size={12}/>{p.duration}</span>}
                    </div>
                  </div>
                  <div className="prog-card-foot">
                    <button className="prog-act prog-edit" onClick={() => { setSel(p); setModal("edit"); }}><Pencil size={14}/> Edit</button>
                    <button className="prog-act prog-del"  onClick={() => { setSel(p); setModal("delete"); }}><Trash2 size={14}/> Hapus</button>
                  </div>
                </div>
              ))}
            </div>}

      {!loading && meta.total > 0 && (
        <div className="ip-pag">
          <span className="ip-pag-info">{(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page,meta.total)} dari {meta.total} program</span>
          <div className="ip-pag-btns">
            <button className="ipb" disabled={meta.page===1} onClick={()=>load(meta.page-1)}><ChevronLeft size={14}/></button>
            {pgs().map(p=><button key={p} className={`ipb ${p===meta.page?"ipb--on-prog":""}`} onClick={()=>load(p)}>{p}</button>)}
            <button className="ipb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      )}

      {(modal==="add"||modal==="edit") && (
        <ProgramModal mode={modal} init={sel} onClose={()=>setModal(null)}
          onSave={async (fd)=>{
            const url = modal==="edit" ? `${API}/programs/${sel!.id}` : `${API}/programs`;
            const j = await (await fetch(url,{method:"POST",body:fd})).json();
            if (j.success) { onToast(modal==="add"?"Program ditambahkan.":"Program diperbarui.","success"); setModal(null); load(meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
      {modal==="delete" && sel && (
        <DeleteModal label={sel.name} onClose={()=>setModal(null)}
          onConfirm={async()=>{
            const j = await (await fetch(`${API}/programs/${sel.id}`,{method:"DELETE"})).json();
            if (j.success) { onToast("Program dihapus.","success"); setModal(null); load(data.length===1&&meta.page>1?meta.page-1:meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
    </div>
  );
}

function ProgramModal({ mode, init, onClose, onSave }: {
  mode:"add"|"edit"; init:Program|null; onClose:()=>void; onSave:(fd:FormData)=>Promise<void>;
}) {
  const [name, setName]       = useState(init?.name ?? "");
  const [desc, setDesc]       = useState(init?.description ?? "");
  const [target, setTarget]   = useState(init?.target_audience ?? "");
  const [dur, setDur]         = useState(init?.duration ?? "");
  const [imgFile, setImgFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(init?.image_url ?? null);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("Nama program wajib diisi."); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", desc);
    fd.append("target_audience", target);
    fd.append("duration", dur);
    if (imgFile) fd.append("image", imgFile);
    if (mode==="edit") fd.append("_method","PUT");
    try { await onSave(fd); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="imbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="im">
        <div className="im-hd">
          <span className="im-title">{mode==="add"?"Tambah Program Baru":"Edit Data Program"}</span>
          <button className="im-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="im-body">
          <Fg label="Nama Program" error={err||undefined}>
            <input className={`ifi focus-prog ${err?"ierr":""}`} placeholder="Contoh: Program Reguler" value={name} onChange={e=>{setName(e.target.value);setErr("");}}/>
          </Fg>
          <Fg label="Deskripsi">
            <textarea className="ita focus-prog" rows={3} placeholder="Penjelasan singkat mengenai program ini..." value={desc} onChange={e=>setDesc(e.target.value)}/>
          </Fg>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Fg label="Target Peserta">
              <input className="ifi focus-prog" placeholder="Contoh: Usia 5-7 tahun" value={target} onChange={e=>setTarget(e.target.value)}/>
            </Fg>
            <Fg label="Durasi">
              <input className="ifi focus-prog" placeholder="Contoh: 6 bulan" value={dur} onChange={e=>setDur(e.target.value)}/>
            </Fg>
          </div>
          <Fg label="Gambar Program (Banner)">
            <FileUpload accept="image/*" preview={preview} label="Pilih gambar banner (Max 3MB)" themeClass="up-prog"
              onFile={f=>{setImgFile(f);setPreview(URL.createObjectURL(f));}}/>
          </Fg>
        </div>
        <div className="im-ft">
          <button className="ibtn-cncl" onClick={onClose}>Batal</button>
          <button className="ip-btn-save" style={{ background:"#2563eb", boxShadow:"0 4px 14px rgba(37,99,235,0.25)" }} onClick={submit} disabled={busy}>
            {busy?<><Loader2 size={16} style={{animation:"ispin 1s linear infinite"}}/> Menyimpan...</>:<><CheckCircle2 size={16}/> {mode==="add"?"Tambah Program":"Simpan Perubahan"}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


/* ═══════════════════════════════════════════════════════════
   TAB 4 — GALLERY (Purple)
═══════════════════════════════════════════════════════════ */
function GalleryTab({ onToast }: { onToast:(msg:string,type:"success"|"error")=>void }) {
  const [data,    setData]    = useState<GalleryItem[]>([]);
  const [meta,    setMeta]    = useState<Meta>({ total:0,page:1,per_page:12,last_page:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal,   setModal]   = useState<"add"|"edit"|"delete"|null>(null);
  const [sel,     setSel]     = useState<GalleryItem|null>(null);
  const dSearch = useDebounce(search);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:String(page), per_page:"12", search:dSearch, type:filter });
      const j = await (await fetch(`${API}/gallery?${p}`)).json();
      if (j.success) { setData(j.data); setMeta(j.meta); }
    } finally { setLoading(false); }
  }, [dSearch, filter]);

  useEffect(() => { load(1); }, [load]);

  const pgs = () => {
    const { page, last_page } = meta;
    const s = Math.max(1,page-2), e = Math.min(last_page,page+2);
    return Array.from({ length:e-s+1 },(_,i)=>s+i);
  };

  return (
    <div>
      <div className="ip-toolbar">
        <div className="ip-search">
          <Search size={16} color="#64748b" className="flex-shrink-0"/>
          <input className="border-0 focus:ring-0 outline-none flex-1" placeholder="Cari judul media..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch("")} style={{ color:"#64748b", display:"flex", background:"none", border:"none", cursor:"pointer" }}><X size={14} strokeWidth={2.5}/></button>}
        </div>
        
        {/* Custom Dropdown Filter */}
        <div className="ip-sel-wrap">
          <div className={`ip-sel ${filterOpen ? 'ip-sel--open' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
            <Filter size={15} color="#64748b" className="flex-shrink-0" />
            <span className="ip-sel-val">
              {filter === "Photo" ? "Tipe: Foto" : filter === "Video" ? "Tipe: Video" : "Semua Media"}
            </span>
            <ChevronDown size={16} color="#64748b" className={`flex-shrink-0 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </div>

          {filterOpen && (
            <>
              <div className="ip-sel-overlay" onClick={() => setFilterOpen(false)} />
              <div className="ip-sel-menu">
                <div className={`ip-sel-item ${filter === "" ? "active" : ""}`} onClick={() => { setFilter(""); setFilterOpen(false); }}>
                  <span>Semua Media</span>{filter === "" && <Check size={16} />}
                </div>
                <div className={`ip-sel-item ${filter === "Photo" ? "active" : ""}`} onClick={() => { setFilter("Photo"); setFilterOpen(false); }}>
                  <span>Tipe: Foto</span>{filter === "Photo" && <Check size={16} />}
                </div>
                <div className={`ip-sel-item ${filter === "Video" ? "active" : ""}`} onClick={() => { setFilter("Video"); setFilterOpen(false); }}>
                  <span>Tipe: Video</span>{filter === "Video" && <Check size={16} />}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ flex:1 }}/>
        <button className="ip-btn-add" style={{ background:"#7c3aed", boxShadow:"0 6px 16px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          onClick={() => { setSel(null); setModal("add"); }}>
          <Plus size={16}/> Tambah Media
        </button>
      </div>

      {loading
        ? <div className="ip-empty"><Loader2 size={36} color="#7c3aed" style={{ animation:"ispin 1s linear infinite" }}/></div>
        : data.length === 0
          ? <div className="ip-empty"><Image size={48} color="#94a3b8" style={{opacity:0.5}}/><div className="ip-empty-lbl">{search||filter?"Tidak ada media yang sesuai filter.":"Belum ada media di galeri."}</div></div>
          : <div className="gal-grid">
              {data.map(item => (
                <div key={item.id} className="gal-item">
                  {item.type==="Photo"
                    ? <img src={item.media_url} className="gal-thumb" alt={item.title}/>
                    : <div className="gal-thumb-placeholder"><Youtube size={44} color="#7c3aed" opacity={0.8}/></div>}
                  <div className="gal-overlay">
                    <button className="gal-ov-btn gal-ov-edit" onClick={()=>{setSel(item);setModal("edit");}}><Pencil size={18}/></button>
                    <button className="gal-ov-btn gal-ov-del"  onClick={()=>{setSel(item);setModal("delete");}}><Trash2 size={18}/></button>
                  </div>
                  <div className="gal-info">
                    <div className="gal-title">{item.title}</div>
                    <div className="gal-meta">
                      <span className={`gal-type-badge ${item.type==="Photo"?"gal-photo":"gal-video"}`}>
                        {item.type==="Photo"?<Image size={10}/>:<Youtube size={10}/>} {item.type}
                      </span>
                      {item.uploaded_at && <span>{new Date(item.uploaded_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>}

      {!loading && meta.total > 0 && (
        <div className="ip-pag">
          <span className="ip-pag-info">{(meta.page-1)*meta.per_page+1}–{Math.min(meta.page*meta.per_page,meta.total)} dari {meta.total} media</span>
          <div className="ip-pag-btns">
            <button className="ipb" disabled={meta.page===1} onClick={()=>load(meta.page-1)}><ChevronLeft size={14}/></button>
            {pgs().map(p=><button key={p} className={`ipb ${p===meta.page?"ipb--on-gal":""}`} onClick={()=>load(p)}>{p}</button>)}
            <button className="ipb" disabled={meta.page===meta.last_page} onClick={()=>load(meta.page+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      )}

      {(modal==="add"||modal==="edit") && (
        <GalleryModal mode={modal} init={sel} onClose={()=>setModal(null)}
          onSave={async(fd)=>{
            const url = modal==="edit" ? `${API}/gallery/${sel!.id}` : `${API}/gallery`;
            const j = await (await fetch(url,{method:"POST",body:fd})).json();
            if (j.success) { onToast(modal==="add"?"Media ditambahkan.":"Media diperbarui.","success"); setModal(null); load(meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
      {modal==="delete" && sel && (
        <DeleteModal label={sel.title} onClose={()=>setModal(null)}
          onConfirm={async()=>{
            const j = await (await fetch(`${API}/gallery/${sel.id}`,{method:"DELETE"})).json();
            if (j.success) { onToast("Media dihapus.","success"); setModal(null); load(data.length===1&&meta.page>1?meta.page-1:meta.page); }
            else onToast(j.message??"Gagal.","error");
          }}/>
      )}
    </div>
  );
}

function GalleryModal({ mode, init, onClose, onSave }: {
  mode:"add"|"edit"; init:GalleryItem|null; onClose:()=>void; onSave:(fd:FormData)=>Promise<void>;
}) {
  const [title, setTitle]     = useState(init?.title ?? "");
  const [type,  setType]      = useState<"Photo"|"Video">(init?.type ?? "Photo");
  const [file,  setFile]      = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(init?.type==="Photo"?init.media_url:null);
  const [videoUrl, setVideoUrl] = useState(init?.type==="Video"?init.media_url:"");
  const [busy,  setBusy]      = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!title.trim()) e.title = "Judul wajib diisi.";
    if (type==="Video" && !videoUrl.trim()) e.media = "URL video wajib diisi.";
    if (type==="Photo" && !file && !preview) e.media = "File foto wajib diupload.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("type", type);
    if (type==="Photo" && file) fd.append("media", file);
    if (type==="Video") fd.append("media_url", videoUrl);
    if (mode==="edit") fd.append("_method","PUT");
    try { await onSave(fd); } finally { setBusy(false); }
  };

  return createPortal(
    <div className="imbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="im">
        <div className="im-hd">
          <span className="im-title">{mode==="add"?"Tambah Item Galeri":"Edit Item Galeri"}</span>
          <button className="im-cls" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="im-body">
          <Fg label="Judul Media" error={errors.title}>
            <input className={`ifi focus-gal ${errors.title?"ierr":""}`} placeholder="Contoh: Kegiatan Belajar Mengajar" value={title} onChange={e=>{setTitle(e.target.value);setErrors(p=>({...p,title:""}));}}/>
          </Fg>

          <div className="ifg">
            <label className="ifl">Tipe Media</label>
            <div className="i-type-toggle">
              <button type="button" className={`i-type-btn ${type==="Photo"?"i-type-photo":""}`} onClick={()=>setType("Photo")}>
                <Image size={16}/> Foto (.jpg, .png)
              </button>
              <button type="button" className={`i-type-btn ${type==="Video"?"i-type-video":""}`} onClick={()=>setType("Video")}>
                <Youtube size={16}/> Link Video
              </button>
            </div>
          </div>

          {type==="Photo"
            ? <Fg label="File Foto" error={errors.media}>
                <FileUpload accept="image/*" preview={preview} label="Pilih file foto (Max 5MB)" themeClass="up-gal"
                  onFile={f=>{setFile(f);setPreview(URL.createObjectURL(f));setErrors(p=>({...p,media:""}));}}/>
              </Fg>
            : <Fg label="URL Video (YouTube / Embed)" error={errors.media}>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#64748b" }}><Link size={16}/></div>
                  <input className={`ifi focus-gal ${errors.media?"ierr":""}`} style={{ paddingLeft:38 }} placeholder="https://youtube.com/embed/..." value={videoUrl}
                    onChange={e=>{setVideoUrl(e.target.value);setErrors(p=>({...p,media:""}));}}/>
                </div>
              </Fg>}
        </div>
        <div className="im-ft">
          <button className="ibtn-cncl" onClick={onClose}>Batal</button>
          <button className="ip-btn-save" style={{ background:"#7c3aed", boxShadow:"0 4px 14px rgba(124,58,237,0.25)" }} onClick={submit} disabled={busy}>
            {busy?<><Loader2 size={16} style={{animation:"ispin 1s linear infinite"}}/> Menyimpan...</>:<><CheckCircle2 size={16}/> {mode==="add"?"Tambah Media":"Simpan Perubahan"}</>}
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
type TabId = "profile" | "programs" | "gallery";

const TABS: { id:TabId; label:string; icon:React.ReactNode; color:string }[] = [
  { id:"profile",  label:"Profil Sekolah", icon:<Building2 size={16}/>, color:"#0f766e" },
  { id:"programs", label:"Program Utama",  icon:<BookOpen  size={16}/>, color:"#2563eb" },
  { id:"gallery",  label:"Galeri Media",   icon:<Image     size={16}/>, color:"#7c3aed" },
];

export default function InfoPage() {
  const [tab,   setTab]   = useState<TabId>("profile");
  const [modal, setModal] = useState(false); // for blur detection
  const [toast, setToast] = useState<{ msg:string; type:"success"|"error" }|null>(null);

  const showToast = (msg:string, type:"success"|"error") => setToast({ msg, type });

  return (
    <>
      <style>{CSS}</style>
      <div className={`ip ${modal ? "ip-blurred" : ""}`}>

        {/* Header */}
        <div className="ip-hd">
          <div>
            <div className="ip-ttl">Informasi Sekolah</div>
            <div className="ip-sub">Kelola profil, program, dan galeri untuk ditampilkan di *landing page* utama</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ip-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`ip-tab ${tab===t.id?"ip-tab--on":""}`} onClick={()=>setTab(t.id)}>
              <span className="ip-tab-dot" style={{ background: tab===t.id ? t.color : "#94a3b8" }}/>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="ip-card">
          {tab === "profile"  && <ProfileTab  onToast={showToast}/>}
          {tab === "programs" && <ProgramsTab onToast={showToast}/>}
          {tab === "gallery"  && <GalleryTab  onToast={showToast}/>}
        </div>

      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}