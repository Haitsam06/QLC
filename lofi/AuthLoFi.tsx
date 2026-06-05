// QLC Auth Page – Lo-Fi Wireframe (Login + Register Step 1 + Register Step 2 OTP)
// Copy ke src/app/imports/ di Figma Make
// Menampilkan 3 state berurutan ke bawah

// ── Helpers ──────────────────────────────────────────────────

function TL({ w, h = 4, cls = "" }: { w: number | string; h?: number; cls?: string }) {
  const width = typeof w === "number" ? `${w}px` : w;
  return <div className={`rounded bg-gray-400 flex-shrink-0 ${cls}`} style={{ width, height: `${h * 4}px` }} />;
}

// ── Field label ───────────────────────────────────────────────
function FieldLabel() {
  return <div className="h-3 w-28 rounded bg-gray-300 mb-2 ml-1" />;
}

// ── Input field with left icon (and optional eye toggle) ──────
function InputField({
  hasEye = false,
  iconColor = "bg-gray-400",
}: {
  hasEye?: boolean;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center bg-gray-50 rounded-[1.5rem] overflow-hidden gap-0 border border-transparent">
      {/* Left icon */}
      <div className="flex items-center pl-5 flex-shrink-0">
        <div className={`w-5 h-5 rounded ${iconColor}`} />
      </div>
      {/* Input area */}
      <div className="flex-1 px-4 py-4">
        <div className="h-4 w-44 rounded bg-gray-300" />
      </div>
      {/* Eye toggle */}
      {hasEye && (
        <div className="px-5 flex-shrink-0 flex items-center">
          <div className="w-5 h-5 rounded bg-gray-300" />
        </div>
      )}
    </div>
  );
}

// ── Textarea field ────────────────────────────────────────────
function TextareaField() {
  return (
    <div className="bg-gray-50 rounded-2xl px-6 py-4 flex flex-col gap-2">
      <div className="h-4 w-56 rounded bg-gray-300" />
      <div className="h-4 w-40 rounded bg-gray-300" />
    </div>
  );
}

// ── Password field (no left icon, has eye) ────────────────────
function PasswordField() {
  return (
    <div className="relative flex items-center bg-gray-50 rounded-2xl overflow-hidden border border-transparent">
      <div className="flex-1 px-6 py-4">
        <div className="h-4 w-36 rounded bg-gray-300" />
      </div>
      <div className="px-4 flex-shrink-0">
        <div className="w-4.5 h-4.5 rounded bg-gray-300" style={{ width: 18, height: 18 }} />
      </div>
    </div>
  );
}

// ── Tab switcher (pill) ───────────────────────────────────────
function TabSwitcher({ active }: { active: "login" | "register" }) {
  return (
    <div className="flex bg-gray-100 p-1.5 rounded-[2rem] shadow-inner mb-12">
      <div
        className={`flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center ${
          active === "register" ? "bg-white shadow-md" : ""
        }`}
      >
        <div className={`h-4 w-36 rounded ${active === "register" ? "bg-gray-800/70" : "bg-gray-300"}`} />
      </div>
      <div
        className={`flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center ${
          active === "login" ? "bg-white shadow-md" : ""
        }`}
      >
        <div className={`h-4 w-16 rounded ${active === "login" ? "bg-gray-800/70" : "bg-gray-300"}`} />
      </div>
    </div>
  );
}

// ── Submit button (full width, green) ─────────────────────────
function SubmitBtn({ w = "100%" }: { w?: string }) {
  return (
    <div
      className="h-16 rounded-[1.8rem] flex items-center justify-center gap-3"
      style={{ width: w, backgroundColor: "#1C1C1C" }}
    >
      <div className="h-4 w-40 rounded bg-white/80" />
      <div className="w-5 h-5 rounded bg-white/60" />
    </div>
  );
}

// ── Left branding panel (shared across all 3 states) ──────────
function BrandingPanel({ state }: { state: "login" | "register" | "otp" }) {
  return (
    <div
      data-name="Branding Panel"
      className="flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        width: "50%",
        background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
        minHeight: "100%",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.08)", filter: "blur(40px)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.05)", filter: "blur(40px)", transform: "translate(33%,33%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12 gap-8" style={{ maxWidth: 480 }}>
        {/* Logo icon */}
        <div
          className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/60" />
        </div>

        {/* H1 */}
        <div className="flex flex-col gap-3 items-center">
          <div className="h-12 w-72 rounded-xl bg-white/90" />
          <div className="h-12 w-48 rounded-xl" style={{ backgroundColor: "rgba(180,180,180,0.85)" }} />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 items-center">
          <div className="h-4 w-80 rounded bg-white/50" />
          <div className="h-4 w-72 rounded bg-white/50" />
          <div className="h-4 w-64 rounded bg-white/50" />
          {state !== "login" && <div className="h-4 w-56 rounded bg-white/50" />}
        </div>
      </div>
    </div>
  );
}

// ── Footer (help text) ────────────────────────────────────────
function FormFooter() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100 text-center flex flex-col items-center gap-3">
      <div className="h-3.5 w-48 rounded bg-gray-300" />
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-gray-300" />
        <div className="h-3 w-40 rounded bg-gray-300" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STATE 1: LOGIN
// ══════════════════════════════════════════════════════════════
function LoginView() {
  return (
    <div
      data-name="State 1 – Login"
      className="flex"
      style={{ width: "1440px", height: "900px", backgroundColor: "#fff" }}
    >
      <BrandingPanel state="login" />

      {/* Right: Form */}
      <div
        className="flex flex-col justify-center px-16 bg-white overflow-y-auto"
        style={{ width: "50%" }}
      >
        <div className="w-full max-w-xl mx-auto">
          {/* Top row: back link + mobile logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded bg-gray-300" style={{ width: 18, height: 18 }} />
              <div className="h-3.5 w-32 rounded bg-gray-300" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-xl flex-shrink-0" style={{ backgroundColor: "#1C1C1C" }} />
              <div className="h-3 w-8 rounded bg-gray-800/50" />
            </div>
          </div>

          {/* Tab switcher */}
          <TabSwitcher active="login" />

          {/* Heading */}
          <div className="mb-10 flex flex-col gap-3">
            <div className="h-10 w-72 rounded-xl bg-gray-800" data-name="H2: Selamat Datang Kembali" />
            <div className="h-4 w-80 rounded bg-gray-300" />
            <div className="h-4 w-64 rounded bg-gray-300" />
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6">
            {/* Username */}
            <div>
              <FieldLabel />
              <InputField iconColor="bg-gray-400" />
            </div>

            {/* Password */}
            <div>
              <FieldLabel />
              <InputField hasEye iconColor="bg-gray-400" />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg border border-gray-300 bg-gray-50" />
                <div className="h-3.5 w-28 rounded bg-gray-300" />
              </div>
              <div className="h-3.5 w-28 rounded bg-gray-700/50" />
            </div>

            {/* Submit */}
            <SubmitBtn />
          </div>

          <FormFooter />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STATE 2: REGISTER STEP 1
// ══════════════════════════════════════════════════════════════
function RegisterStep1View() {
  return (
    <div
      data-name="State 2 – Register Step 1"
      className="flex"
      style={{ width: "1440px", height: "900px", backgroundColor: "#fff" }}
    >
      <BrandingPanel state="register" />

      {/* Right: Form */}
      <div
        className="flex flex-col justify-center px-16 bg-white overflow-y-auto"
        style={{ width: "50%" }}
      >
        <div className="w-full max-w-xl mx-auto">
          {/* Back link */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-4.5 h-4.5 rounded bg-gray-300" style={{ width: 18, height: 18 }} />
            <div className="h-3.5 w-32 rounded bg-gray-300" />
          </div>

          {/* Tab switcher */}
          <TabSwitcher active="register" />

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="h-10 w-52 rounded-xl bg-gray-800" data-name="H2: Buat Akun Baru" />
            <div className="h-4 w-80 rounded bg-gray-300" />
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Row 1: Nama + Telepon */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel />
                <div className="bg-gray-50 rounded-2xl px-6 py-4">
                  <div className="h-4 w-32 rounded bg-gray-300" />
                </div>
              </div>
              <div>
                <FieldLabel />
                <div className="bg-gray-50 rounded-2xl px-6 py-4">
                  <div className="h-4 w-32 rounded bg-gray-300" />
                </div>
              </div>
            </div>

            {/* Alamat (textarea) */}
            <div>
              <FieldLabel />
              <TextareaField />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-1" />

            {/* Row 2: Username + Email */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel />
                <div className="bg-gray-50 rounded-2xl px-6 py-4">
                  <div className="h-4 w-32 rounded bg-gray-300" />
                </div>
              </div>
              <div>
                <FieldLabel />
                <div className="bg-gray-50 rounded-2xl px-6 py-4">
                  <div className="h-4 w-32 rounded bg-gray-300" />
                </div>
              </div>
            </div>

            {/* Row 3: Password + Konfirmasi */}
            <div className="grid grid-cols-2 gap-5">
              <PasswordField />
              <PasswordField />
            </div>

            {/* Submit */}
            <div className="mt-2">
              <SubmitBtn />
            </div>
          </div>

          <FormFooter />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STATE 3: REGISTER STEP 2 – OTP
// ══════════════════════════════════════════════════════════════
function RegisterStep2View() {
  return (
    <div
      data-name="State 3 – Register Step 2 (OTP)"
      className="flex"
      style={{ width: "1440px", height: "900px", backgroundColor: "#fff" }}
    >
      <BrandingPanel state="otp" />

      {/* Right: OTP Form */}
      <div
        className="flex flex-col justify-center px-16 bg-white overflow-y-auto"
        style={{ width: "50%" }}
      >
        <div className="w-full max-w-xl mx-auto">
          {/* Back link */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-4.5 h-4.5 rounded bg-gray-300" style={{ width: 18, height: 18 }} />
            <div className="h-3.5 w-32 rounded bg-gray-300" />
          </div>

          {/* Tab switcher */}
          <TabSwitcher active="register" />

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="h-10 w-64 rounded-xl bg-gray-800" data-name="H2: Verifikasi Email Anda" />
            <div className="h-4 w-80 rounded bg-gray-300" />
            <div className="h-4 w-72 rounded bg-gray-300" />
          </div>

          {/* OTP info card */}
          <div
            data-name="OTP Info Card"
            className="p-8 rounded-[2.5rem] flex flex-col items-center gap-4 mb-8"
            style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            {/* Key icon area */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="w-6 h-6 rounded bg-gray-700/60" />
            </div>
            {/* Status message text */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-3.5 w-64 rounded bg-gray-800/40" />
              <div className="h-3.5 w-56 rounded bg-gray-800/40" />
            </div>
          </div>

          {/* OTP input (large, centered) */}
          <div
            data-name="OTP Input"
            className="w-full h-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center gap-3 mb-8"
          >
            {/* 6 digit placeholders */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-8 h-10 rounded-xl"
                style={{ backgroundColor: i <= 3 ? "#1C1C1C" : "#e5e7eb", opacity: i <= 3 ? 0.6 : 1 }}
              />
            ))}
          </div>

          {/* Submit button */}
          <SubmitBtn />

          {/* Edit data link */}
          <div className="mt-6 flex justify-center">
            <div className="h-3.5 w-28 rounded bg-gray-300" />
          </div>

          <FormFooter />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT – semua state berurutan ke bawah
// ══════════════════════════════════════════════════════════════
export function AuthLoFi() {
  return (
    <div
      data-name="Auth Pages – Lo-Fi (All States)"
      className="flex flex-col font-sans"
      style={{ width: "1440px" }}
    >
      {/* Separator label */}
      <div className="flex items-center gap-4 px-12 py-4 bg-gray-100 border-b border-gray-200">
        <div className="h-5 w-5 rounded-full bg-gray-500 flex-shrink-0" />
        <div className="h-4 w-48 rounded bg-gray-500" />
      </div>
      <LoginView />

      <div className="flex items-center gap-4 px-12 py-4 bg-gray-100 border-b border-gray-200 border-t">
        <div className="h-5 w-5 rounded-full bg-gray-500 flex-shrink-0" />
        <div className="h-4 w-56 rounded bg-gray-500" />
      </div>
      <RegisterStep1View />

      <div className="flex items-center gap-4 px-12 py-4 bg-gray-100 border-b border-gray-200 border-t">
        <div className="h-5 w-5 rounded-full bg-gray-500 flex-shrink-0" />
        <div className="h-4 w-64 rounded bg-gray-500" />
      </div>
      <RegisterStep2View />
    </div>
  );
}

// Named exports untuk import individual per state
export { LoginView as LoginLoFi };
export { RegisterStep1View as RegisterStep1LoFi };
export { RegisterStep2View as RegisterOtpLoFi };

export default AuthLoFi;
