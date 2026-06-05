// QLC Login Page – Lo-Fi Wireframe
// Copy ke src/app/imports/ di Figma Make

// ── Helpers ──────────────────────────────────────────────────

function FieldLabel() {
  return <div className="h-3 w-28 rounded bg-gray-300 mb-2 ml-1" />;
}

function InputField({ hasEye = false }: { hasEye?: boolean }) {
  return (
    <div className="flex items-center bg-gray-50 rounded-[1.5rem] overflow-hidden border border-transparent">
      <div className="flex items-center pl-5 flex-shrink-0">
        <div className="w-5 h-5 rounded bg-gray-400" />
      </div>
      <div className="flex-1 px-4 py-4">
        <div className="h-4 w-44 rounded bg-gray-300" />
      </div>
      {hasEye && (
        <div className="px-5 flex-shrink-0 flex items-center">
          <div className="w-5 h-5 rounded bg-gray-300" />
        </div>
      )}
    </div>
  );
}

function SubmitBtn() {
  return (
    <div
      className="w-full h-16 rounded-[1.8rem] flex items-center justify-center gap-3"
      style={{ backgroundColor: "#1C1C1C" }}
    >
      <div className="h-4 w-40 rounded bg-white/80" />
      <div className="w-5 h-5 rounded bg-white/60" />
    </div>
  );
}

// ── Branding panel kiri ───────────────────────────────────────
function BrandingPanel() {
  return (
    <div
      data-name="Branding Panel"
      className="flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0"
      style={{ width: "50%", background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)" }}
    >
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.08)", filter: "blur(40px)" }} />
      <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.05)", filter: "blur(40px)", transform: "translate(33%,33%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-12 gap-8" style={{ maxWidth: 480 }}>
        {/* Logo icon */}
        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div className="w-12 h-12 rounded-xl bg-white/60" />
        </div>
        {/* Judul */}
        <div className="flex flex-col gap-3 items-center">
          <div className="h-12 w-72 rounded-xl bg-white/90" />
          <div className="h-12 w-48 rounded-xl" style={{ backgroundColor: "rgba(180,180,180,0.85)" }} />
        </div>
        {/* Deskripsi */}
        <div className="flex flex-col gap-2 items-center">
          <div className="h-4 w-80 rounded bg-white/50" />
          <div className="h-4 w-72 rounded bg-white/50" />
          <div className="h-4 w-64 rounded bg-white/50" />
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export function LoginLoFi() {
  return (
    <div
      data-name="Login Page – Lo-Fi"
      className="flex font-sans"
      style={{ width: "1440px", height: "900px", backgroundColor: "#ffffff" }}
    >
      {/* ── KIRI: Branding ────────────────────────────── */}
      <BrandingPanel />

      {/* ── KANAN: Form ───────────────────────────────── */}
      <div className="flex flex-col justify-center px-16 bg-white" style={{ width: "50%" }}>
        <div className="w-full max-w-xl mx-auto">

          {/* Baris atas: back link + logo mobile */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300" />
              <div className="h-3.5 w-32 rounded bg-gray-300" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-xl flex-shrink-0" style={{ backgroundColor: "#1C1C1C" }} />
              <div className="h-3 w-8 rounded bg-gray-800/50" />
            </div>
          </div>

          {/* Tab switcher (Masuk aktif) */}
          <div className="flex bg-gray-100 p-1.5 rounded-[2rem] shadow-inner mb-12">
            <div className="flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center">
              <div className="h-4 w-36 rounded bg-gray-300" />
            </div>
            <div className="flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center bg-white shadow-md">
              <div className="h-4 w-16 rounded bg-gray-800/70" />
            </div>
          </div>

          {/* Judul + subtitle */}
          <div className="mb-10 flex flex-col gap-3">
            <div className="h-10 w-72 rounded-xl bg-gray-800" data-name="H2: Selamat Datang Kembali" />
            <div className="h-4 w-80 rounded bg-gray-300" />
            <div className="h-4 w-64 rounded bg-gray-300" />
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-6">
            {/* Username */}
            <div data-name="Field: Username">
              <FieldLabel />
              <InputField />
            </div>

            {/* Password */}
            <div data-name="Field: Kata Sandi">
              <FieldLabel />
              <InputField hasEye />
            </div>

            {/* Remember + Lupa sandi */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg border border-gray-300 bg-gray-50" />
                <div className="h-3.5 w-28 rounded bg-gray-300" />
              </div>
              <div className="h-3.5 w-28 rounded bg-gray-700/50" />
            </div>

            {/* Tombol submit */}
            <SubmitBtn />
          </div>

          {/* Footer bantuan */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-3">
            <div className="h-3.5 w-48 rounded bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-gray-300" />
              <div className="h-3 w-40 rounded bg-gray-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginLoFi;
