// QLC Dashboard Guru – Lo-Fi Wireframe
// Copy ke src/app/imports/ di Figma Make

function TL({ w, h = 4, cls = "" }: { w: number | string; h?: number; cls?: string }) {
  const width = typeof w === "number" ? `${w}px` : w;
  return <div className={`rounded bg-gray-400 flex-shrink-0 ${cls}`} style={{ width, height: `${h * 4}px` }} />;
}

// ── Topbar Nav Pill ───────────────────────────────────────────
function NavPill({ active = false }: { active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 ${active ? "bg-gray-700" : "bg-transparent"}`}>
      <div className={`w-4 h-4 rounded flex-shrink-0 ${active ? "bg-white/70" : "bg-gray-300"}`} />
      <div className={`h-3.5 w-20 rounded ${active ? "bg-white/90" : "bg-gray-300"}`} />
    </div>
  );
}

// ── Timeline item (jadwal) ────────────────────────────────────
function TimelineItem({ dotColor = "bg-gray-300", badgeColor = "bg-gray-100" }: { dotColor?: string; badgeColor?: string }) {
  return (
    <div className="relative pl-5">
      <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ${dotColor}`} />
      <div className="flex flex-col gap-1.5 p-3 -mt-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-14 rounded bg-gray-600" />
          <div className={`h-5 w-20 rounded ${badgeColor}`} />
        </div>
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="h-3 w-28 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

// ── Report row (progres santri) ───────────────────────────────
function ReportRow({ badgeColor = "bg-gray-100" }: { badgeColor?: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white gap-4">
      {/* Avatar + Nama */}
      <div className="flex items-center gap-3" style={{ width: "28%" }}>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="h-3.5 w-24 rounded bg-gray-600" />
          <div className="h-3 w-16 rounded bg-gray-300" />
        </div>
      </div>
      {/* Detail box */}
      <div className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 flex-1">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2.5 w-14 rounded bg-gray-300" />
          <div className="h-3.5 w-24 rounded bg-gray-500" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2.5 w-14 rounded bg-gray-300" />
          <div className="h-3.5 w-20 rounded bg-gray-500" />
        </div>
      </div>
      {/* Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`h-7 w-28 rounded-lg ${badgeColor}`} />
        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200" />
      </div>
    </div>
  );
}

export function GuruDashboardLoFi() {
  return (
    <div
      data-name="Guru Dashboard – Lo-Fi"
      className="font-sans flex flex-col"
      style={{ width: "1440px", minHeight: "900px", backgroundColor: "#F9FAFB" }}
    >
      {/* ════ TOPNAV ════ */}
      <nav
        data-name="Topnav"
        className="bg-white border-b border-gray-200 shadow-sm flex items-center gap-0 px-10"
        style={{ height: "64px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mr-8 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gray-700 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <div className="h-3.5 w-28 rounded bg-gray-700" />
            <div className="h-2.5 w-20 rounded bg-gray-300" />
          </div>
        </div>

        {/* Nav pills */}
        <div className="flex items-center gap-1">
          <NavPill active />
          <NavPill />
          <NavPill />
          <NavPill />
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <div className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-gray-400" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700" />
          </div>
          {/* Logout btn */}
          <div className="h-10 px-3 rounded-xl bg-gray-50 border border-red-100 flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <div className="h-3 w-10 rounded bg-gray-400" />
          </div>
          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="flex flex-col gap-1 items-end">
              <div className="h-3 w-24 rounded bg-gray-600" />
              <div className="h-2.5 w-14 rounded bg-gray-300" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
          </div>
        </div>
      </nav>

      {/* ════ CONTENT ════ */}
      <div className="px-10 pt-6 pb-12 flex flex-col gap-6">

        {/* HERO BANNER */}
        <div
          data-name="Hero Banner"
          className="relative overflow-hidden rounded-3xl p-10 shadow-lg flex items-center justify-between gap-8"
          style={{ background: "linear-gradient(to right, #2D2D2D, #1C1C1C)" }}
        >
          {/* Dekorasi */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", transform: "translate(50%,-50%)" }} />
          <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", transform: "translateY(50%)" }} />

          {/* Teks kiri */}
          <div className="relative z-10 flex flex-col gap-3" style={{ maxWidth: 600 }}>
            {/* Badge tanggal */}
            <div className="h-7 w-64 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
            {/* H1 */}
            <div className="h-10 w-72 rounded bg-white/90 mt-1" />
            <div className="h-10 w-96 rounded bg-white/90" />
            {/* Desc */}
            <div className="h-3.5 w-[480px] rounded bg-white/50 mt-1" />
            <div className="h-3.5 w-[420px] rounded bg-white/50" />
            {/* Tags */}
            <div className="flex gap-2 mt-1">
              <div className="h-7 w-28 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
              <div className="h-7 w-36 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
            </div>
          </div>

          {/* Mini stat cards */}
          <div className="flex gap-4 relative z-10 flex-shrink-0">
            {/* Stat 1: Total Santri */}
            <div className="flex flex-col items-center p-6 rounded-2xl text-center" style={{ width: 148, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="h-9 w-12 rounded bg-white/90 mb-2" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
            {/* Stat 2: Target */}
            <div className="flex flex-col items-center p-6 rounded-2xl text-center" style={{ width: 148, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="h-9 w-16 rounded bg-gray-300/80 mb-2" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* GRID 3 COLS */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 2fr" }}>

          {/* CARD: Jadwal Hari Ini */}
          <div
            data-name="Card: Jadwal Hari Ini"
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-36 rounded bg-gray-700" />
                <div className="h-3 w-28 rounded bg-gray-300" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0" />
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-5 flex-1">
              <TimelineItem dotColor="bg-gray-500" badgeColor="bg-gray-100" />
              <TimelineItem dotColor="bg-gray-500" badgeColor="bg-gray-100" />
              <TimelineItem dotColor="bg-gray-300" badgeColor="bg-gray-100" />
            </div>

            {/* CTA button */}
            <div className="mt-6 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300" />
              <div className="h-3.5 w-36 rounded bg-gray-300" />
            </div>
          </div>

          {/* CARD: Progres Santri */}
          <div
            data-name="Card: Progres Santri"
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-5">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-44 rounded bg-gray-700" />
                <div className="h-3 w-52 rounded bg-gray-300" />
              </div>
              {/* Input Setoran button */}
              <div className="h-10 w-36 rounded-xl bg-gray-700 flex items-center justify-center gap-2 flex-shrink-0">
                <div className="w-4 h-4 rounded bg-white/60" />
                <div className="h-3 w-20 rounded bg-white/80" />
              </div>
            </div>

            {/* Report rows */}
            <div className="flex flex-col gap-3 flex-1">
              <ReportRow badgeColor="bg-gray-100" />
              <ReportRow badgeColor="bg-gray-100" />
              <ReportRow badgeColor="bg-gray-100" />
            </div>

            {/* Footer */}
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="h-3 w-48 rounded bg-gray-300" />
              </div>
              <div className="h-3.5 w-36 rounded bg-gray-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GuruDashboardLoFi;
