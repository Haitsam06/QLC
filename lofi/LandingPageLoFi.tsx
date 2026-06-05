// QLC Landing Page – Lo-Fi Wireframe
// Cara pakai di Figma Make: copy file ini ke src/app/imports/
// lalu tambahkan <LandingPageLoFi /> di App.tsx

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

function ImgPlaceholder({
  w,
  h,
  radius = 24,
  className = "",
}: {
  w: number;
  h: number;
  radius?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-300 flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: `${w}px`, height: `${h}px`, borderRadius: `${radius}px` }}
    >
      <div className="w-12 h-12 rounded-full bg-gray-400" />
    </div>
  );
}

function PrimaryBtn({ w = 210, h = 52 }: { w?: number; h?: number }) {
  return (
    <div
      className="bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <div className="h-4 w-32 rounded bg-gray-400" />
    </div>
  );
}

function SecondaryBtn({ w = 170, h = 52 }: { w?: number; h?: number }) {
  return (
    <div
      className="bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <div className="h-4 w-28 rounded bg-gray-400" />
    </div>
  );
}

function OutlineBtn({
  w = 200,
  h = 48,
  dark = false,
}: {
  w?: number;
  h?: number;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${
        dark
          ? "bg-white/15 border border-white/30"
          : "bg-white border border-gray-300"
      }`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <div className={`h-4 w-32 rounded ${dark ? "bg-white/60" : "bg-gray-400"}`} />
    </div>
  );
}

export function LandingPageLoFi() {
  return (
    <div
      data-name="QLC Landing Page – Lo-Fi"
      className="font-sans overflow-x-hidden"
      style={{ width: "1440px", backgroundColor: "#EEEFF2" }}
    >
      {/* ──────────────────────────────────────────
          01 NAVBAR
      ────────────────────────────────────────── */}
      <nav
        data-name="01 – Navbar"
        className="bg-white border-b border-gray-200 flex items-center px-20"
        style={{ height: "72px" }}
      >
        <div className="w-32 h-8 rounded bg-gray-300" data-name="Logo" />
        <div className="flex gap-6 ml-60">
          {["Beranda", "Tentang", "Program", "Galeri"].map((l) => (
            <div key={l} className="w-16 h-5 rounded bg-gray-400" data-name={`Nav: ${l}`} />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="w-16 h-5 rounded bg-gray-400" data-name="Login" />
          <div className="w-28 h-10 rounded-full bg-gray-800" data-name="CTA: Daftar" />
        </div>
      </nav>

      {/* ──────────────────────────────────────────
          02 HERO
      ────────────────────────────────────────── */}
      <section
        data-name="02 – Hero Section"
        className="flex items-center px-20 gap-16"
        style={{ height: "620px", backgroundColor: "#F4FAF7" }}
      >
        {/* Teks Kiri */}
        <div className="flex flex-col gap-4" style={{ width: "620px" }}>
          <div
            className="h-9 w-60 rounded-full bg-white border border-gray-300"
            data-name="Badge"
          />
          <TextLine w={460} h={11} className="mt-2" />
          <TextLine w={380} h={11} />
          <TextLine w={300} h={11} className="bg-gray-500" />
          <div className="flex flex-col gap-2 mt-4">
            <TextLine w={520} h={5} />
            <TextLine w={480} h={5} />
            <TextLine w={300} h={5} />
          </div>
          <div className="flex gap-4 mt-6">
            <PrimaryBtn w={210} />
            <SecondaryBtn w={170} />
          </div>
        </div>

        {/* Gambar Kanan */}
        <ImgPlaceholder w={580} h={500} radius={48} />
      </section>

      {/* ──────────────────────────────────────────
          03 TENTANG QLC
      ────────────────────────────────────────── */}
      <section
        data-name="03 – Tentang QLC"
        className="flex items-center gap-16 px-20"
        style={{ height: "520px", backgroundColor: "#FDF9F0" }}
      >
        <ImgPlaceholder w={560} h={380} radius={40} />

        <div className="flex flex-col gap-3" style={{ width: "600px" }}>
          <TextLine w={130} h={4} className="bg-gray-300" />
          <TextLine w={220} h={9} className="bg-gray-600" />
          <div className="w-20 h-1.5 rounded-full bg-gray-600 my-1" />
          <div className="flex flex-col gap-2">
            <TextLine w={580} h={4} />
            <TextLine w={560} h={4} />
            <TextLine w={580} h={4} />
            <TextLine w={540} h={4} />
            <TextLine w={460} h={4} />
          </div>
          {/* Stat Cards */}
          <div className="flex gap-5 mt-4">
            <div
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border border-gray-200 bg-gray-50"
              style={{ width: "260px", height: "110px" }}
              data-name="Stat: Tahun Berdiri"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <TextLine w={100} h={5} className="bg-gray-500" />
              <TextLine w={120} h={3} className="bg-gray-300" />
            </div>
            <div
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border border-gray-200 bg-gray-50"
              style={{ width: "260px", height: "110px" }}
              data-name="Stat: Fokus Utama"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <TextLine w={100} h={5} className="bg-gray-500" />
              <TextLine w={120} h={3} className="bg-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          04 PENDIRI
      ────────────────────────────────────────── */}
      <section
        data-name="04 – Pendiri"
        className="px-20 py-14"
        style={{ backgroundColor: "#313131" }}
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="h-9 w-52 rounded-full bg-white/20 border border-white/20" />
          <TextLine w={580} h={11} className="bg-white/90" />
        </div>

        <div className="flex gap-8 justify-between mt-16">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              data-name={`Pendiri Card ${i}`}
              className="flex flex-col items-center pt-16 pb-8 px-8 rounded-[2.5rem] border border-white/10 bg-white/10 relative flex-1"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gray-400 border-4 border-white" />
              <TextLine w={200} h={6} className="bg-white/90 mt-2" />
              <div className="h-5 w-40 rounded-full bg-white/20 mt-2" />
              <div className="w-full h-px bg-white/15 my-5" />
              <div className="flex flex-col gap-3 w-full">
                <TextLine w={280} h={4} className="bg-white/60" />
                <TextLine w={260} h={4} className="bg-white/60" />
                <TextLine w={240} h={4} className="bg-white/60" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <OutlineBtn w={320} h={52} dark={false} />
        </div>
      </section>

      {/* ──────────────────────────────────────────
          05 VISI & MISI
      ────────────────────────────────────────── */}
      <section
        data-name="05 – Visi & Misi"
        className="bg-white px-20 py-16"
      >
        <div className="flex gap-8" style={{ height: "300px" }}>
          {/* Visi */}
          <div
            className="flex flex-col gap-4 p-12 rounded-[3rem] bg-gray-800 flex-shrink-0"
            style={{ width: "540px" }}
            data-name="Visi Card"
          >
            <div className="h-6 w-40 rounded bg-gray-300/80" data-name="Label: VISI KAMI" />
            <TextLine w={460} h={6} className="bg-white/70 mt-2" />
            <TextLine w={420} h={6} className="bg-white/70" />
            <TextLine w={380} h={6} className="bg-white/70" />
          </div>

          {/* Misi */}
          <div
            className="flex flex-col p-12 rounded-[3rem] border border-gray-200 bg-white flex-1"
            data-name="Misi Card"
          >
            <TextLine w={160} h={8} className="bg-gray-700 mb-5" />
            <div className="h-px w-full bg-gray-200 mb-5" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <TextLine w={i % 2 === 0 ? 500 : 460} h={5} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          06 PILAR INTI
      ────────────────────────────────────────── */}
      <section
        data-name="06 – Pilar Inti"
        className="px-20 py-16"
        style={{ backgroundColor: "#EFF8F5" }}
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <TextLine w={280} h={4} className="bg-gray-400" />
          <TextLine w={560} h={10} className="bg-gray-600" />
        </div>

        <div className="flex gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              data-name={`Pilar Card ${i}`}
              className="bg-white border border-gray-200 rounded-[2.5rem] p-8 flex flex-col gap-4 flex-1"
              style={{ minHeight: "240px" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{i}</span>
              </div>
              <TextLine w={300} h={6} className="bg-gray-600" />
              <div className="flex flex-col gap-2">
                <TextLine w="85%" h={4} />
                <TextLine w="80%" h={4} />
                <TextLine w="70%" h={4} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────
          07 PROGRAM LAYANAN
      ────────────────────────────────────────── */}
      <section
        data-name="07 – Program Layanan"
        className="px-20 py-16"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="h-9 w-72 rounded-full bg-white border border-gray-200" />
          <TextLine w={500} h={10} className="bg-gray-600" />
        </div>

        <div className="flex gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              data-name={`Program Card ${i}`}
              className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col flex-1"
            >
              {/* Image area */}
              <div
                className="bg-gray-300 flex items-center justify-center flex-shrink-0"
                style={{ height: "156px" }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-400" />
              </div>
              {/* Konten */}
              <div className="flex flex-col gap-3 p-8 flex-1">
                <TextLine w={280} h={6} className="bg-gray-600" />
                <TextLine w="90%" h={4} />
                <TextLine w="85%" h={4} />
                <TextLine w="75%" h={4} />
                <div className="mt-auto pt-4">
                  <div className="h-11 rounded-2xl bg-gray-100 border border-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────
          08 GALERI KEGIATAN
      ────────────────────────────────────────── */}
      <section
        data-name="08 – Galeri Kegiatan"
        className="bg-white px-20 py-16"
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="h-9 w-48 rounded-full bg-gray-100 border border-gray-200" />
          <TextLine w={520} h={10} className="bg-gray-600" />
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "580px 1fr 380px",
            gridTemplateRows: "143px 143px",
          }}
        >
          {/* Big cell */}
          <div
            className="bg-gray-300 rounded-2xl flex items-center justify-center"
            style={{ gridColumn: "1", gridRow: "1 / span 2" }}
            data-name="Galeri: Big Cell"
          >
            <div className="w-12 h-12 rounded-full bg-gray-400" />
          </div>
          {/* Cell 2 */}
          <div
            className="bg-gray-300 rounded-2xl flex items-center justify-center"
            data-name="Galeri: Cell 2"
          >
            <div className="w-10 h-10 rounded-full bg-gray-400" />
          </div>
          {/* Cell 3 tall */}
          <div
            className="bg-gray-300 rounded-2xl flex items-center justify-center"
            style={{ gridRow: "1 / span 2" }}
            data-name="Galeri: Cell 3"
          >
            <div className="w-12 h-12 rounded-full bg-gray-400" />
          </div>
          {/* Cell 4 */}
          <div
            className="bg-gray-300 rounded-2xl flex items-center justify-center"
            data-name="Galeri: Cell 4"
          >
            <div className="w-10 h-10 rounded-full bg-gray-400" />
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <OutlineBtn w={240} h={48} />
        </div>
      </section>

      {/* ──────────────────────────────────────────
          09 KERJA SAMA
      ────────────────────────────────────────── */}
      <section
        data-name="09 – Kerja Sama"
        className="px-20 py-16"
        style={{ backgroundColor: "#313131" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-44 rounded-full bg-white/15 border border-white/20" />
          <TextLine w={560} h={11} className="bg-white/90" />
          <TextLine w={440} h={11} className="bg-gray-300/80" />
          <div className="flex flex-col items-center gap-2 mt-2">
            <TextLine w={520} h={5} className="bg-white/50" />
            <TextLine w={480} h={5} className="bg-white/50" />
          </div>
        </div>

        <div className="flex gap-6 mt-10">
          {["Institusi Pendidikan", "Lembaga & Yayasan", "Sponsor"].map((label) => (
            <div
              key={label}
              data-name={`Partner: ${label}`}
              className="flex flex-col gap-3 p-6 rounded-3xl border border-white/15 bg-white/10 flex-1"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20" />
              <TextLine w={180} h={5} className="bg-white/90" />
              <TextLine w="80%" h={3} className="bg-white/50" />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-10">
          {/* Primary: Ajukan Kerja Sama */}
          <div
            className="h-12 rounded-full bg-gray-500 flex items-center justify-center"
            style={{ width: "220px" }}
          >
            <div className="h-4 w-40 rounded bg-gray-300" />
          </div>
          {/* Secondary: Email */}
          <OutlineBtn w={200} h={48} dark />
        </div>
      </section>

      {/* ──────────────────────────────────────────
          10 FOOTER
      ────────────────────────────────────────── */}
      <footer
        data-name="10 – Footer"
        className="flex items-center px-20"
        style={{ height: "120px", backgroundColor: "#1F1F1F" }}
      >
        <div className="w-32 h-8 rounded bg-gray-600" data-name="Footer Logo" />
        <div className="flex gap-6 mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-20 h-4 rounded bg-gray-500" />
          ))}
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-gray-600" />
          ))}
        </div>
      </footer>
    </div>
  );
}

export default LandingPageLoFi;
