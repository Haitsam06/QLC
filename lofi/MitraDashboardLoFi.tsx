// QLC Dashboard Mitra – Lo-Fi Wireframe
// Copy ke src/app/imports/ di Figma Make

function TL({ w, h = 4, cls = "" }: { w: number | string; h?: number; cls?: string }) {
  const width = typeof w === "number" ? `${w}px` : w;
  return <div className={`rounded bg-gray-400 flex-shrink-0 ${cls}`} style={{ width, height: `${h * 4}px` }} />;
}

// ── Nav Pill ──────────────────────────────────────────────────
function NavPill({ active = false }: { active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 ${active ? "bg-gray-700" : "bg-transparent"}`}>
      <div className={`w-4.5 h-4.5 rounded flex-shrink-0 ${active ? "bg-white/70" : "bg-gray-300"}`} style={{ width: 18, height: 18 }} />
      <div className={`h-3.5 w-16 rounded ${active ? "bg-white/90" : "bg-gray-300"}`} />
    </div>
  );
}

// ── Timeline item (agenda jadwal) ─────────────────────────────
function AgendaTimelineItem({ isFirst = false }: { isFirst?: boolean }) {
  return (
    <div className="relative pl-5">
      <div
        className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white flex-shrink-0 ${
          isFirst ? "bg-gray-500" : "bg-gray-300"
        }`}
      />
      <div className="flex flex-col gap-1.5">
        <div className={`h-3.5 w-24 rounded ${isFirst ? "bg-gray-400" : "bg-gray-400"}`} />
        <div className="h-4 w-48 rounded bg-gray-600" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="h-3 w-32 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

// ── Laporan file row ──────────────────────────────────────────
function LaporanRow() {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* File type badge */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center">
          <div className="h-2.5 w-7 rounded bg-gray-400" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="h-3.5 w-[75%] rounded bg-gray-600" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded bg-gray-300" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="h-3 w-12 rounded bg-gray-300" />
          </div>
        </div>
      </div>
      {/* Download btn */}
      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded bg-gray-400" />
      </div>
    </div>
  );
}

export function MitraDashboardLoFi() {
  return (
    <div
      data-name="Mitra Dashboard – Lo-Fi"
      className="font-sans flex flex-col"
      style={{ width: "1440px", minHeight: "900px", backgroundColor: "#F9FAFB" }}
    >
      {/* ════ TOPNAV ════ */}
      <nav
        data-name="Topnav"
        className="bg-white border-b border-gray-200 shadow-sm flex items-center gap-0 px-12"
        style={{ height: "64px" }}
      >
        {/* Logo Mitra QLC */}
        <div className="flex items-center gap-3 mr-8 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gray-700 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <div className="h-3.5 w-20 rounded bg-gray-700" />
            <div className="h-2.5 w-28 rounded bg-gray-300" />
          </div>
        </div>

        {/* Nav pills */}
        <div className="flex items-center gap-2">
          <NavPill active />
          <NavPill />
          <NavPill />
          <NavPill />
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Logout */}
          <div className="h-10 px-3 rounded-xl bg-gray-50 flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <div className="h-3 w-14 rounded bg-gray-400" />
          </div>
          {/* Notification */}
          <div className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-gray-400" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700" />
          </div>
          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="flex flex-col gap-1 items-end">
              <div className="h-3 w-24 rounded bg-gray-600" />
              <div className="h-2.5 w-10 rounded bg-gray-400" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
          </div>
        </div>
      </nav>

      {/* ════ CONTENT ════ */}
      <div className="px-12 pt-8 pb-12 flex flex-col gap-6">

        {/* HERO BANNER */}
        <div
          data-name="Hero Banner"
          className="relative overflow-hidden rounded-3xl p-10 shadow-lg flex items-center justify-between gap-8"
          style={{ background: "linear-gradient(to right, #2D2D2D, #1C1C1C)" }}
        >
          {/* Dekorasi */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", transform: "translate(50%,-50%)" }} />

          {/* Teks kiri */}
          <div className="relative z-10 flex flex-col gap-3">
            {/* Status badge */}
            <div className="h-7 w-48 rounded-full" style={{ backgroundColor: "rgba(22,101,52,0.6)", border: "1px solid rgba(74,222,128,0.3)" }} />
            {/* H1 */}
            <div className="h-10 w-80 rounded bg-white/90 mt-1" />
            {/* Desc */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="h-3.5 w-[520px] rounded bg-white/50" />
              <div className="h-3.5 w-[460px] rounded bg-white/50" />
              <div className="h-3.5 w-[380px] rounded bg-white/50" />
            </div>
          </div>

          {/* Mini stat cards */}
          <div className="flex gap-4 relative z-10 flex-shrink-0">
            <div className="flex flex-col items-center p-6 rounded-2xl text-center" style={{ width: 148, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="h-9 w-10 rounded bg-white/90 mb-2" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl text-center" style={{ width: 148, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="h-9 w-10 rounded bg-gray-300/80 mb-2" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* GRID 3 COLS */}
        <div className="grid grid-cols-3 gap-6 mt-2">

          {/* KOLOM 1: Dokumen Kemitraan */}
          <div
            data-name="Card: Dokumen Kemitraan"
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-40 rounded bg-gray-700" />
                <div className="h-3 w-48 rounded bg-gray-300" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-gray-300" />
              </div>
            </div>

            {/* MOU Card */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col items-center text-center gap-4 flex-1">
              {/* Big icon */}
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 rounded bg-gray-300" />
              </div>
              {/* Title + desc */}
              <div className="flex flex-col gap-2 items-center">
                <div className="h-4 w-28 rounded bg-gray-600" />
                <div className="h-3 w-48 rounded bg-gray-300" />
                <div className="h-3 w-44 rounded bg-gray-300" />
                <div className="h-3 w-36 rounded bg-gray-300" />
              </div>
              {/* Button: Lihat MOU */}
              <div className="w-full h-11 rounded-xl bg-gray-600 mt-2 flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400" />
                <div className="h-3.5 w-32 rounded bg-white/80" />
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-4 flex justify-between px-1">
              <div className="h-3 w-24 rounded bg-gray-300" />
              <div className="h-3 w-16 rounded bg-gray-400" />
            </div>
          </div>

          {/* KOLOM 2: Agenda Terdekat */}
          <div
            data-name="Card: Agenda Terdekat"
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-36 rounded bg-gray-700" />
                <div className="h-3 w-44 rounded bg-gray-300" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-gray-400" />
              </div>
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-6 flex-1">
              <AgendaTimelineItem isFirst />
              <AgendaTimelineItem />
              <AgendaTimelineItem />
            </div>
          </div>

          {/* KOLOM 3: Laporan Terbaru */}
          <div
            data-name="Card: Laporan Terbaru"
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-36 rounded bg-gray-700" />
                <div className="h-3 w-32 rounded bg-gray-300" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-gray-400" />
              </div>
            </div>

            {/* File rows */}
            <div className="flex flex-col gap-3 flex-1">
              <LaporanRow />
              <LaporanRow />
              <LaporanRow />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MitraDashboardLoFi;
