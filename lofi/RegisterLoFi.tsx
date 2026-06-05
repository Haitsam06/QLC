// QLC Register Page – Lo-Fi Wireframe (Step 1 + Step 2 OTP)
// Copy ke src/app/imports/ di Figma Make

// ── Helpers ──────────────────────────────────────────────────

function FieldLabel({ w = "w-28" }: { w?: string }) {
  return <div className={`h-3 ${w} rounded bg-gray-300 mb-2 ml-1`} />;
}

function SimpleField() {
  return (
    <div className="bg-gray-100 rounded-2xl px-6 py-4">
      <div className="h-4 w-36 rounded bg-gray-300" />
    </div>
  );
}

function PasswordField() {
  return (
    <div className="flex items-center bg-gray-100 rounded-2xl overflow-hidden">
      <div className="flex-1 px-6 py-4">
        <div className="h-4 w-32 rounded bg-gray-300" />
      </div>
      <div className="px-4 flex-shrink-0">
        <div className="w-4 h-4 rounded bg-gray-400" />
      </div>
    </div>
  );
}

function SubmitBtn({ labelW = "w-48" }: { labelW?: string }) {
  return (
    <div
      className="w-full h-16 rounded-[1.8rem] flex items-center justify-center gap-3"
      style={{ backgroundColor: "#1C1C1C" }}
    >
      <div className={`h-4 rounded ${labelW}`} style={{ backgroundColor: "rgba(255,255,255,0.8)" }} />
      <div className="w-5 h-5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.55)" }} />
    </div>
  );
}

// ── Branding panel kiri ───────────────────────────────────────
function BrandingPanel() {
  return (
    <div
      data-name="Branding Panel"
      className="flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0"
      style={{ width: "50%", backgroundColor: "#1C1C1C" }}
    >
      {/* Dekorasi blob atas kiri */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.06)", filter: "blur(40px)" }}
      />
      {/* Dekorasi blob bawah kanan */}
      <div
        className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", filter: "blur(50px)", transform: "translate(33%,33%)" }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center px-12 gap-8"
        style={{ maxWidth: 480 }}
      >
        {/* Logo icon */}
        <div
          className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
        >
          <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.55)" }} />
        </div>

        {/* Judul 2 baris */}
        <div className="flex flex-col gap-3 items-center">
          <div className="h-12 w-72 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.88)" }} />
          <div className="h-12 w-48 rounded-xl" style={{ backgroundColor: "rgba(200,200,200,0.75)" }} />
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-2 items-center">
          <div className="h-4 w-80 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
          <div className="h-4 w-72 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
          <div className="h-4 w-64 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
          <div className="h-4 w-56 rounded" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

// ── Tab switcher (Register aktif) ─────────────────────────────
function TabSwitcher() {
  return (
    <div className="flex bg-gray-100 p-1.5 rounded-[2rem] shadow-inner mb-10">
      {/* Aktif: Register */}
      <div className="flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center bg-white shadow-md">
        <div className="h-4 w-36 rounded bg-gray-700" />
      </div>
      {/* Inaktif: Masuk */}
      <div className="flex-1 py-3.5 rounded-[1.8rem] flex items-center justify-center">
        <div className="h-4 w-16 rounded bg-gray-300" />
      </div>
    </div>
  );
}

// ── Back link ─────────────────────────────────────────────────
function BackLink() {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="w-4 h-4 rounded bg-gray-300" />
      <div className="h-3.5 w-36 rounded bg-gray-300" />
    </div>
  );
}

// ── Footer bantuan ────────────────────────────────────────────
function FormFooter() {
  return (
    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-3">
      <div className="h-3.5 w-48 rounded bg-gray-300" />
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-gray-300" />
        <div className="h-3 w-44 rounded bg-gray-300" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 1: FORM DATA DIRI
// ══════════════════════════════════════════════════════════════
function RegisterStep1() {
  return (
    <div
      data-name="Register – Step 1 Form"
      className="flex font-sans"
      style={{ width: "1440px", height: "900px", backgroundColor: "#ffffff" }}
    >
      <BrandingPanel />

      {/* Panel kanan: form */}
      <div className="flex flex-col justify-center px-16 bg-white" style={{ width: "50%" }}>
        <div className="w-full max-w-xl mx-auto">

          <BackLink />
          <TabSwitcher />

          {/* Heading */}
          <div className="mb-7 flex flex-col gap-2">
            <div className="h-10 w-52 rounded-xl bg-gray-800" data-name="H2: Buat Akun Baru" />
            <div className="h-4 w-80 rounded bg-gray-300" />
          </div>

          <div className="flex flex-col gap-5">

            {/* Baris 1: Nama + Telepon */}
            <div className="grid grid-cols-2 gap-5">
              <div data-name="Field: Nama Lengkap">
                <FieldLabel w="w-24" />
                <SimpleField />
              </div>
              <div data-name="Field: Nomor Telepon">
                <FieldLabel w="w-28" />
                <SimpleField />
              </div>
            </div>

            {/* Alamat */}
            <div data-name="Field: Alamat">
              <FieldLabel w="w-28" />
              <div className="bg-gray-100 rounded-2xl px-6 py-4 flex flex-col gap-2.5">
                <div className="h-4 w-64 rounded bg-gray-300" />
                <div className="h-4 w-48 rounded bg-gray-300" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Baris 2: Username + Email */}
            <div className="grid grid-cols-2 gap-5">
              <div data-name="Field: Username">
                <FieldLabel w="w-20" />
                <SimpleField />
              </div>
              <div data-name="Field: Email">
                <FieldLabel w="w-14" />
                <SimpleField />
              </div>
            </div>

            {/* Baris 3: Password + Konfirmasi */}
            <div className="grid grid-cols-2 gap-5">
              <div data-name="Field: Password">
                <FieldLabel w="w-24" />
                <PasswordField />
              </div>
              <div data-name="Field: Konfirmasi Password">
                <FieldLabel w="w-32" />
                <PasswordField />
              </div>
            </div>

            {/* Tombol Submit */}
            <div className="mt-2">
              <SubmitBtn labelW="w-52" />
            </div>

          </div>

          <FormFooter />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 2: VERIFIKASI OTP
// ══════════════════════════════════════════════════════════════
function RegisterStep2() {
  return (
    <div
      data-name="Register – Step 2 OTP"
      className="flex font-sans"
      style={{ width: "1440px", height: "900px", backgroundColor: "#ffffff" }}
    >
      <BrandingPanel />

      {/* Panel kanan: OTP */}
      <div className="flex flex-col justify-center px-16 bg-white" style={{ width: "50%" }}>
        <div className="w-full max-w-xl mx-auto">

          <BackLink />
          <TabSwitcher />

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="h-10 w-64 rounded-xl bg-gray-800" data-name="H2: Verifikasi Email Anda" />
            <div className="h-4 w-80 rounded bg-gray-300" />
            <div className="h-4 w-68 rounded bg-gray-300" />
          </div>

          {/* OTP Info Card */}
          <div
            data-name="OTP Info Card"
            className="p-8 rounded-[2.5rem] bg-gray-100 border border-gray-200 flex flex-col items-center gap-4 mb-8"
          >
            {/* Key icon */}
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="w-7 h-7 rounded bg-gray-500" />
            </div>
            {/* Pesan OTP */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-4 w-64 rounded bg-gray-500" />
              <div className="h-4 w-56 rounded bg-gray-400" />
            </div>
          </div>

          {/* OTP Input — 6 kotak digit */}
          <div
            data-name="OTP Input"
            className="w-full h-24 rounded-[2.5rem] bg-gray-50 border border-gray-200 flex items-center justify-center gap-4 mb-8"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-9 h-11 rounded-xl flex-shrink-0"
                style={{
                  backgroundColor: i <= 3 ? "#1C1C1C" : "#D1D5DB",
                  opacity: i <= 3 ? 0.75 : 1,
                }}
              />
            ))}
          </div>

          {/* Tombol Selesaikan */}
          <SubmitBtn labelW="w-52" />

          {/* Edit data link */}
          <div className="mt-5 flex justify-center">
            <div className="h-3.5 w-32 rounded bg-gray-300" />
          </div>

          <FormFooter />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT — Step 1 + Step 2 berurutan
// ══════════════════════════════════════════════════════════════
export function RegisterLoFi() {
  return (
    <div
      data-name="Register – Lo-Fi (Step 1 + Step 2)"
      className="flex flex-col font-sans"
      style={{ width: "1440px" }}
    >
      {/* Separator Step 1 */}
      <div className="flex items-center gap-3 px-12 py-3 bg-gray-200 border-b border-gray-300">
        <div className="w-5 h-5 rounded-full bg-gray-600 flex-shrink-0" />
        <div className="h-4 w-52 rounded bg-gray-500" />
      </div>
      <RegisterStep1 />

      {/* Separator Step 2 */}
      <div className="flex items-center gap-3 px-12 py-3 bg-gray-200 border-b border-gray-300 border-t">
        <div className="w-5 h-5 rounded-full bg-gray-800 flex-shrink-0" />
        <div className="h-4 w-60 rounded bg-gray-500" />
      </div>
      <RegisterStep2 />
    </div>
  );
}

export { RegisterStep1 as RegisterStep1LoFi };
export { RegisterStep2 as RegisterStep2LoFi };
export default RegisterLoFi;
