// QLC Agenda Page – Lo-Fi Wireframe
// Cara pakai di Figma Make: copy ke src/app/imports/
// lalu import { AgendaLoFi } from "./imports/AgendaLoFi"

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

// ── Hari-hari header kalender ─────────────────────────────────
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ── Dummy event tags (untuk tanggal yang punya agenda) ────────
const EVENT_DATES = [3, 8, 12, 15, 20, 23, 28];

// ── Satu sel tanggal di kalender ─────────────────────────────
function CalCell({
  day,
  isCurrentMonth = true,
  isToday = false,
  isActive = false,
  hasEvent = false,
}: {
  day: number;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isActive?: boolean;
  hasEvent?: boolean;
}) {
  return (
    <div
      data-name={`Cal Cell ${day}`}
      className={`flex flex-col p-2 border-r border-b border-gray-100 relative
        ${!isCurrentMonth ? "bg-gray-50 opacity-40" : "bg-white"}
        ${isActive ? "ring-2 ring-inset ring-gray-700" : ""}
      `}
      style={{ minHeight: "96px" }}
    >
      {/* Nomor tanggal */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${isToday ? "bg-gray-800 text-white" : "text-gray-700"}
        `}
      >
        {day}
      </div>

      {/* Event tags (hanya desktop) */}
      {hasEvent && isCurrentMonth && (
        <div className="mt-1.5 flex flex-col gap-1">
          <div className="h-3.5 rounded bg-gray-100 border border-gray-200 w-full" />
          {day % 5 === 0 && (
            <div className="h-3.5 rounded bg-gray-100 border border-gray-200 w-4/5" />
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel item agenda (kolom kanan) ──────────────────────────
function AgendaItem({ variant = "normal" }: { variant?: "normal" | "active" }) {
  return (
    <div
      data-name="Agenda Item"
      className={`p-4 rounded-xl border cursor-pointer
        ${variant === "active"
          ? "bg-white border-gray-400 shadow-sm"
          : "bg-white border-gray-200 shadow-sm"
        }`}
    >
      {/* Judul */}
      <TextLine w="80%" h={5} className="bg-gray-600 mb-2" />
      {/* Lokasi */}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
        <TextLine w="55%" h={3} className="bg-gray-300" />
      </div>
    </div>
  );
}

// ── Modal Detail Agenda ───────────────────────────────────────
function AgendaModal() {
  return (
    <div
      data-name="Modal Overlay"
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div
        data-name="Modal Card"
        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex-shrink-0"
        style={{ width: "440px" }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {/* Badge tanggal */}
            <div className="h-5 w-32 rounded bg-gray-100 border border-gray-200" />
            {/* Judul event */}
            <TextLine w={280} h={6} className="bg-gray-700" />
          </div>
          {/* Tombol close */}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Lokasi */}
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-gray-400 flex-shrink-0 mt-0.5" />
            <TextLine w={260} h={4} className="bg-gray-400" />
          </div>
          {/* Deskripsi */}
          <div className="flex flex-col gap-2">
            <TextLine w="100%" h={4} className="bg-gray-300" />
            <TextLine w="95%" h={4} className="bg-gray-300" />
            <TextLine w="85%" h={4} className="bg-gray-300" />
            <TextLine w="70%" h={4} className="bg-gray-300" />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          {/* Tombol Daftar */}
          <div className="h-11 rounded-lg bg-gray-700 w-full" />
          {/* Tombol Tutup */}
          <div className="h-11 rounded-lg bg-gray-100 border border-gray-200 w-full" />
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export function AgendaLoFi() {
  // Buat 35 sel kalender (5 baris × 7 kolom)
  // Baris pertama: 3 sel bulan lalu + mulai dari tanggal 1
  const cells: {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isActive: boolean;
    hasEvent: boolean;
  }[] = [];

  // 3 sel bulan sebelumnya (abu-abu)
  [29, 30, 31].forEach((d) =>
    cells.push({ day: d, isCurrentMonth: false, isToday: false, isActive: false, hasEvent: false })
  );
  // 28 hari bulan ini
  for (let d = 1; d <= 28; d++) {
    cells.push({
      day: d,
      isCurrentMonth: true,
      isToday: d === 15,
      isActive: d === 15,
      hasEvent: EVENT_DATES.includes(d),
    });
  }
  // 4 sel bulan berikutnya
  [1, 2, 3, 4].forEach((d) =>
    cells.push({ day: d, isCurrentMonth: false, isToday: false, isActive: false, hasEvent: false })
  );

  return (
    <div
      data-name="Agenda Page – Lo-Fi"
      className="font-sans"
      style={{ width: "1440px", minHeight: "900px", backgroundColor: "#F8FAFC", position: "relative" }}
    >
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav
        data-name="Navbar"
        className="bg-white border-b border-gray-200 flex items-center px-20"
        style={{ height: "72px" }}
      >
        <div className="w-32 h-8 rounded bg-gray-300" data-name="Logo" />
        <div className="flex gap-6 ml-60">
          {["Beranda", "Tentang", "Program", "Galeri"].map((l) => (
            <div key={l} className="w-16 h-5 rounded bg-gray-400" />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="w-16 h-5 rounded bg-gray-400" />
          <div className="w-28 h-10 rounded-full bg-gray-800" />
        </div>
      </nav>

      {/* ── KONTEN UTAMA ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Tombol Kembali */}
        <div className="mb-8">
          <div
            data-name="Button: Kembali"
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 w-fit shadow-sm"
          >
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <TextLine w={60} h={4} className="bg-gray-400" />
          </div>
        </div>

        {/* Judul Halaman */}
        <div className="flex justify-center mb-8">
          <TextLine w={380} h={12} className="bg-gray-700" data-name="Title: Kalender Agenda" />
        </div>

        {/* ── KARTU KALENDER UTAMA ────────────────────────────── */}
        <div
          data-name="Calendar Card"
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* ── Header navigasi bulan ────────────────────────── */}
          <div
            data-name="Calendar Nav"
            className="px-6 py-4 flex items-center justify-between border-b border-gray-100"
          >
            {/* Nama bulan + tahun */}
            <TextLine w={200} h={8} className="bg-gray-700" data-name="Month Year" />

            {/* Tombol navigasi */}
            <div className="flex items-center gap-2">
              {/* Tombol Hari Ini */}
              <div
                data-name="Button: Hari Ini"
                className="h-8 w-20 rounded-lg bg-gray-100 border border-gray-200"
              />
              {/* Prev */}
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded" />
              </div>
              {/* Next */}
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded" />
              </div>
            </div>
          </div>

          {/* ── Body: Kalender + Panel kanan ─────────────────── */}
          <div className="flex">
            {/* LEFT: Grid kalender (2/3) */}
            <div
              data-name="Calendar Grid"
              className="border-r border-gray-100 p-4"
              style={{ width: "66.66%" }}
            >
              {/* Header hari */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid tanggal */}
              <div
                data-name="Date Grid"
                className="grid grid-cols-7 border-l border-t border-gray-100 rounded-lg overflow-hidden"
              >
                {cells.map((cell, idx) => (
                  <CalCell
                    key={idx}
                    day={cell.day}
                    isCurrentMonth={cell.isCurrentMonth}
                    isToday={cell.isToday}
                    isActive={cell.isActive}
                    hasEvent={cell.hasEvent}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: Panel agenda (1/3) */}
            <div
              data-name="Agenda Panel"
              className="p-6 bg-gray-50/50 flex flex-col gap-3"
              style={{ width: "33.33%" }}
            >
              {/* Label tanggal aktif */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" />
                <TextLine w={120} h={4} className="bg-gray-500" data-name="Label: Agenda Hari Ini" />
              </div>

              {/* Daftar agenda */}
              <AgendaItem variant="active" />
              <AgendaItem />
              <AgendaItem />

              {/* State kosong (tersembunyi, sebagai referensi) */}
              <div
                data-name="Empty State (ref)"
                className="hidden py-10 flex-col items-center gap-2 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <TextLine w={140} h={3} className="bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL DETAIL (overlay terpisah) ───────────────────── */}
      <AgendaModal />
    </div>
  );
}

export default AgendaLoFi;
