const concepts = [
  {
    title: "Current Eye Radar",
    src: "/brand/guideguard-header-logo.svg?v=gg4",
    notes: "Keeps the Sight/Site eye concept, now with a radar iris.",
  },
  {
    title: "Technical Radar Lens",
    src: "/brand/guideguard-app-icon.svg",
    notes: "Less eye/surveillance feel. More polished instrument, sensor, and AI lens.",
  },
  {
    title: "Site Signal Pin",
    src: "/brand/guideguard-app-icon.svg",
    notes: "More field/site oriented. Suggests location-based findings and risk signals.",
  },
];

export default function BrandReviewPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <section className="rounded-[2rem] bg-[#0B1320] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5DB7FF]">
          InSite Brand Review
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
          Compare logo directions
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
          Comparing the current eye/radar mark against a technical radar lens and a
          guide-guard pin. HazLenz AI remains the engine name.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {concepts.map((concept) => (
          <article
            key={concept.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70"
          >
            <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] bg-[#0B1320] p-5">
              <img src={concept.src} alt={concept.title} className="max-h-44 w-auto object-contain" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">{concept.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{concept.notes}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-black text-slate-900">My recommendation</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          If the eye feels too surveillance-like, move to Technical Radar Lens. It keeps
          InSite’s meaning while feeling more like trusted audit support, field review, and
          hazard detection.
        </p>
      </section>
    </main>
  );
}
