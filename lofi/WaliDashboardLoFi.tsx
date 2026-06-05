// QLC Dashboard Wali Murid – Lo-Fi Wireframe
// Copy ke src/app/imports/ di Figma Make

function TL({ w, h = 4, cls = "" }: { w: number | string; h?: number; cls?: string }) {
  const width = typeof w === "number" ? `${w}px` : w;
  return <div className={`rounded bg-gray-400 flex-shrink-0 ${cls}`} style={{ width, height: `${h * 4}px` }} />;
}

// ── Nav Pill ──────────────────────────────────────────────────
function NavPill({ active = false }: { active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 ${active ? "bg-gray-800" : "bg-transparent"}`}>
      <div className={`w-4 h-4 rounded flex-shrink-0 ${active ? "bg-white/70" : "bg-gray-300"}`} />
      <div className={`h-3.5 w-16 rounded ${active ? "bg-white/90" : "bg-gray-300"}`} />
    </div>
  );
}

// ── Bottom Nav item ───────────────────────────────────────────
function BottomNavItem({ active = false }: { active?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 gap-1.5 py-2`}>
      <div className={`w-6 h-6 rounded ${active ? "bg-gray-700" : "bg-gray-300"}`} />
      <div className={`h-2.5 w-10 rounded ${active ? "bg-gray-500" : "bg-gray-300"}`} />
    </div>
  );
}

// ── Stat card (2×2 grid) ──────────────────────────────────────
function StatCard({ iconBg, iconColor }: { iconBg: string; iconColor: string }) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 text-center">
      <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <div className={`w-5 h-5 rounded ${iconColor}`} />
      </div>
      <div className="h-6 w-10 rounded bg-gray-700" />
      <div className="h-2.5 w-16 rounded bg-gray-300" />
    </div>
  );
}

// ── Note card (catatan asatidz) ───────────────────────────────
function NoteCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
      {/* Header badges + date */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-lg bg-gray-800" />
          <div className="h-6 w-20 rounded-lg bg-gray-100" />
        </div>
        <div className="h-3 w-16 rounded bg-gray-200" />
      </div>
      {/* Quote text */}
      <div className="flex gap-3">
        <div className="w-1 rounded-full bg-gray-100 flex-shrink-0 self-stretch" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 w-full rounded bg-gray-300" />
          <div className="h-3.5 w-[90%] rounded bg-gray-300" />
          <div className="h-3.5 w-[75%] rounded bg-gray-300" />
        </div>
      </div>
      {/* Footer: teacher name */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="h-3 w-36 rounded bg-gray-600" />
      </div>
    </div>
  );
}

export function WaliDashboardLoFi() {
  return (
    <div
      data-name="Wali Dashboard – Lo-Fi"
      className="font-sans flex flex-col"
      style={{ width: "1440px", minHeight: "900px", backgroundColor: "#F8FAFC" }}
    >
      {/* ════ TOPNAV ════ */}
      <nav
        data-name="Topnav"
        className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm flex items-center px-7"
        style={{ height: "64px" }}
      >
        {/* Logo EduConnect */}
        <div className="flex items-center gap-2.5 flex-shrink-0 mr-10">
          <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ backgroundColor: "#1C1C1C" }} />
          <div className="flex flex-col gap-1">
            <div className="h-3.5 w-24 rounded bg-gray-700" />
            <div className="h-2.5 w-12 rounded bg-gray-400" />
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
        <div className="flex items-center gap-3">
          {/* Notification */}
          <div className="relative w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-gray-400" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700" />
          </div>
          {/* Logout */}
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
            <div className="w-4.5 h-4.5 rounded" style={{ width: 18, height: 18, backgroundColor: "#94a3b8" }} />
          </div>
          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
            <div className="flex flex-col gap-1 items-end">
              <div className="h-3 w-24 rounded bg-gray-700" />
              <div className="h-2.5 w-14 rounded bg-gray-300" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
          </div>
        </div>
      </nav>

      {/* ════ CONTENT (max-w-5xl centered) ════ */}
      <div className="max-w-5xl mx-auto w-full px-4 py-10 flex flex-col gap-6 pb-28">

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <div className="h-8 w-56 rounded bg-gray-800" data-name="Title: Ahlan" />
          <div className="h-3 w-36 rounded bg-gray-300" data-name="Subtitle: Bulan" />
        </div>

        {/* 4 STAT CARDS (2x2) */}
        <div
          data-name="Stat Cards 4"
          className="grid grid-cols-4 gap-3"
        >
          <StatCard iconBg="bg-gray-50" iconColor="bg-gray-500" />
          <StatCard iconBg="bg-gray-50" iconColor="bg-gray-500" />
          <StatCard iconBg="bg-gray-50" iconColor="bg-gray-500" />
          <StatCard iconBg="bg-gray-50" iconColor="bg-gray-400" />
        </div>

        {/* CHILD SELECTOR PILLS */}
        <div
          data-name="Child Selector"
          className="flex gap-2"
        >
          <div className="h-11 w-28 rounded-2xl bg-gray-800 flex-shrink-0" />
          <div className="h-11 w-28 rounded-2xl bg-white border border-gray-100 flex-shrink-0" />
        </div>

        {/* CHILD HERO CARD */}
        <div
          data-name="Child Hero Card"
          className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl flex items-center gap-6"
          style={{ backgroundColor: "#1C1C1C" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          {/* Avatar emoji area */}
          <div className="w-20 h-20 rounded-[2rem] bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/40" />
          </div>
          {/* Info */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="h-5 w-24 rounded bg-white/20" />
            <div className="h-7 w-48 rounded bg-white/90" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/50" />
              <div className="h-3.5 w-32 rounded bg-white/60" />
            </div>
          </div>
        </div>

        {/* DETAIL CARDS: Presensi + Penilaian */}
        <div className="grid grid-cols-2 gap-5">

          {/* Presensi */}
          <div
            data-name="Card: Presensi"
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-gray-700" />
              <div className="h-6 w-24 rounded-full bg-gray-100" />
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full border border-gray-100 p-0.5">
              <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: "#1C1C1C" }} />
            </div>
            {/* 3 chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="h-6 w-6 rounded bg-gray-400" />
                <div className="h-2.5 w-10 rounded bg-gray-300" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="h-6 w-6 rounded bg-gray-400" />
                <div className="h-2.5 w-10 rounded bg-gray-300" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="h-6 w-6 rounded bg-gray-500" />
                <div className="h-2.5 w-10 rounded bg-gray-300" />
              </div>
            </div>
          </div>

          {/* Penilaian */}
          <div
            data-name="Card: Penilaian"
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-5"
          >
            <div className="h-4 w-24 rounded bg-gray-700" />
            {/* 3 horizontal bars */}
            <div className="flex flex-col gap-5">
              {[
                { label: "Sangat Lancar", w: "65%", color: "bg-gray-500", textColor: "text-green-600" },
                { label: "Lancar",        w: "45%", color: "bg-gray-500", textColor: "text-amber-600" },
                { label: "Perlu Mengulang", w: "20%", color: "bg-gray-700", textColor: "text-red-600" },
              ].map((q) => (
                <div key={q.label} className="flex items-center gap-4">
                  <div className="h-3.5 w-24 rounded bg-gray-600 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`${q.color} h-full rounded-full`} style={{ width: q.w }} />
                  </div>
                  <div className="h-3.5 w-6 rounded bg-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CATATAN ASATIDZ */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div className="h-4 w-36 rounded bg-gray-700" />
            <div className="w-8 h-8 rounded bg-gray-200" />
          </div>
          <NoteCard />
          <NoteCard />
        </div>

      </div>

      {/* ════ BOTTOM NAV (mobile style) ════ */}
      <nav
        data-name="Bottom Nav"
        className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-gray-100 px-4"
        style={{ height: "80px", width: "1440px" }}
      >
        <div className="max-w-md mx-auto flex justify-around items-center h-full">
          <BottomNavItem active />
          <BottomNavItem />
          <BottomNavItem />
          <BottomNavItem />
        </div>
      </nav>
    </div>
  );
}

export default WaliDashboardLoFi;
