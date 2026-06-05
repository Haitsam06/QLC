// QLC Admin Dashboard – Lo-Fi Wireframe (Hitam Putih)
// Cara pakai di Figma Make: copy ke src/app/imports/
// lalu import { AdminDashboardLoFi } from "./imports/AdminDashboardLoFi"

// ── Helpers ──────────────────────────────────────────────────

function TextLine({
  w,
  h = 4,
  className = "",
}: {
  w: number | string;
  h?: number;
  className?: string;
}) {
  const width = typeof w === "number" ? `${w}px` : w;
  return (
    <div
      className={`rounded bg-gray-400 flex-shrink-0 ${className}`}
      style={{ width, height: `${h * 4}px` }}
    />
  );
}

// ── Sidebar nav item ──────────────────────────────────────────
function NavItem({
  active = false,
  hasBadge = false,
}: {
  active?: boolean;
  hasBadge?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg relative ${
        active ? "bg-white/20" : ""
      }`}
    >
      {active && (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white" />
      )}
      <div
        className="rounded flex-shrink-0"
        style={{ width: 18, height: 18, backgroundColor: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}
      />
      <div
        className="h-3.5 rounded flex-1"
        style={{
          maxWidth: 120,
          backgroundColor: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
        }}
      />
      {hasBadge && (
        <div className="w-5 h-5 rounded-full bg-white/70 flex-shrink-0" />
      )}
    </div>
  );
}

// ── Stat card (grayscale) ─────────────────────────────────────
function StatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-xl flex-shrink-0 bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 rounded bg-gray-400" />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-6 w-14 rounded bg-gray-700" />
        <div className="h-3 w-24 rounded bg-gray-300" />
      </div>
    </div>
  );
}

// ── List row (grayscale) ──────────────────────────────────────
function ListRow({ hasBadge = false }: { hasBadge?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg flex-shrink-0 bg-gray-200" />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="h-3.5 rounded bg-gray-500" style={{ width: "70%" }} />
          <div className="h-3 rounded bg-gray-300" style={{ width: "50%" }} />
        </div>
      </div>
      {hasBadge && (
        <div className="h-5 w-16 rounded-md bg-gray-200 flex-shrink-0" />
      )}
    </div>
  );
}

// ── Area chart (grayscale SVG) ────────────────────────────────
function AreaChartPlaceholder() {
  return (
    <div className="w-full bg-gray-50 rounded-xl overflow-hidden" style={{ height: 240 }}>
      <svg viewBox="0 0 600 240" preserveAspectRatio="none" className="w-full h-full">
        {[40, 80, 120, 160, 200].map((y) => (
          <line key={y} x1="40" y1={y} x2="580" y2={y} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        <path
          d="M 40 200 C 120 160, 160 120, 220 140 C 280 160, 320 80, 380 60 C 440 40, 480 100, 540 80 L 540 220 L 40 220 Z"
          fill="rgba(107,114,128,0.1)"
        />
        <path
          d="M 40 200 C 120 160, 160 120, 220 140 C 280 160, 320 80, 380 60 C 440 40, 480 100, 540 80"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {[60, 140, 220, 300, 380, 460, 540].map((x) => (
          <rect key={x} x={x - 20} y={228} width={40} height={8} rx="3" fill="#d1d5db" />
        ))}
        {[40, 80, 120, 160, 200].map((y) => (
          <rect key={y} x={0} y={y - 4} width={32} height={8} rx="3" fill="#d1d5db" />
        ))}
      </svg>
    </div>
  );
}

// ── Section card wrapper (grayscale) ──────────────────────────
function SectionCard({
  children,
  hasAction = true,
}: {
  children: React.ReactNode;
  hasAction?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded bg-gray-300" style={{ width: 18, height: 18 }} />
          <div className="h-4 w-36 rounded bg-gray-700" />
        </div>
        {hasAction && <div className="h-3.5 w-20 rounded bg-gray-300" />}
      </div>
      {children}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export function AdminDashboardLoFi() {
  return (
    <div
      data-name="Admin Dashboard – Lo-Fi (B&W)"
      className="flex font-sans"
      style={{ width: "1440px", height: "900px", backgroundColor: "#F3F4F6", overflow: "hidden" }}
    >
      {/* ════════════════════════════════════════
          SIDEBAR (hitam)
      ════════════════════════════════════════ */}
      <aside
        data-name="Sidebar"
        className="flex flex-col flex-shrink-0 m-3 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: "256px", backgroundColor: "#1C1C1C" }}
      >
        {/* Logo area */}
        <div
          data-name="Sidebar Logo"
          className="flex items-center gap-2.5 px-4 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)", height: "64px" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-28 rounded bg-white/80" />
            <div className="h-2.5 w-16 rounded bg-white/30" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2.5 flex flex-col gap-1 overflow-y-auto">
          <NavItem active />
          <NavItem />
          <NavItem />
          <NavItem />
          <NavItem />
          <NavItem hasBadge />
          <NavItem />
          <NavItem />
          <NavItem />
        </nav>

        {/* Logout */}
        <div
          className="py-3 px-2.5 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg">
            <div className="rounded flex-shrink-0" style={{ width: 18, height: 18, backgroundColor: "rgba(255,255,255,0.3)" }} />
            <div className="h-3.5 w-12 rounded" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════════ */}
      <main
        data-name="Main Area"
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
      >
        {/* ── TOPBAR ─────────────────────────────── */}
        <header
          data-name="Topbar"
          className="flex items-center justify-end gap-2 px-6 py-3 sticky top-0 bg-gray-100 border-b border-gray-200 z-10"
        >
          {/* Notification bell */}
          <div className="relative w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-gray-400" />
            {/* Dot notifikasi → hitam */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800" />
          </div>
          {/* Profile */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-700" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-24 rounded bg-gray-600" />
              <div className="h-2.5 w-16 rounded bg-gray-300" />
            </div>
          </div>
        </header>

        {/* ── CONTENT ────────────────────────────── */}
        <div className="p-6 flex flex-col gap-5 flex-1">

          {/* BANNER (abu gelap) */}
          <div
            data-name="Welcome Banner"
            className="rounded-2xl p-6 flex items-center justify-between relative overflow-hidden"
            style={{ backgroundColor: "#2D2D2D" }}
          >
            <div
              className="absolute -right-8 -top-16 w-52 h-52 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="h-6 w-64 rounded bg-white/85" />
              <div className="h-3.5 w-48 rounded bg-white/40" />
            </div>
            {/* Date badge */}
            <div
              className="relative z-10 h-8 w-52 rounded-lg flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>

          {/* STATS GRID – 4 kartu, semua grayscale */}
          <div data-name="Stats Grid" className="grid grid-cols-4 gap-4">
            <StatCard />
            <StatCard />
            <StatCard />
            <StatCard />
          </div>

          {/* ROW 2: Chart + Agenda */}
          <div
            data-name="Chart & Agenda Row"
            className="grid gap-4"
            style={{ gridTemplateColumns: "3fr 2fr" }}
          >
            {/* Grafik Pendaftaran */}
            <SectionCard hasAction={false}>
              <AreaChartPlaceholder />
            </SectionCard>

            {/* Agenda Terdekat */}
            <SectionCard>
              <div className="flex flex-col gap-2">
                <ListRow />
                <ListRow />
                <ListRow />
              </div>
            </SectionCard>
          </div>

          {/* ROW 3: Pending + Laporan Terbaik */}
          <div data-name="Pending & Reports Row" className="grid grid-cols-2 gap-4">
            {/* Perlu Persetujuan */}
            <SectionCard>
              <div className="flex flex-col gap-2">
                <ListRow hasBadge />
                <ListRow hasBadge />
                <ListRow hasBadge />
              </div>
            </SectionCard>

            {/* Laporan Terbaik */}
            <SectionCard>
              <div className="flex flex-col gap-2">
                <ListRow hasBadge />
                <ListRow hasBadge />
                <ListRow hasBadge />
              </div>
            </SectionCard>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboardLoFi;
