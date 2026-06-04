import { AppLinkButton } from "@/components/ui/AppLinkButton";

const painPoints = [
  "Hazards documented after the details are already fading",
  "Photos, notes, standards, and corrective actions scattered across tools",
  "Inspection reports that take too long to compile",
  "Corrective actions that lose ownership and follow-through",
];

const benefits = [
  {
    title: "Inspect faster",
    text: "Capture findings, evidence, location, risk, and corrective action details in one guided workflow.",
  },
  {
    title: "Build stronger records",
    text: "Connect observations to photos, standards, SafeScope review, actions, and final report language.",
  },
  {
    title: "Act before risk repeats",
    text: "Turn inspection findings into assigned corrective actions and visibility for leadership.",
  },
];

const proofPoints = [
  "MSHA and OSHA-focused workflows",
  "SafeScope intelligence built into inspections",
  "Professional reports from field findings",
  "Corrective action and follow-up support",
  "Designed for serious safety operations",
  "Built for accountability, not paperwork",
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[36px] bg-[#050B14] px-6 py-16 text-center text-white shadow-sm sm:px-10 md:px-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">
          Sentinel Safety
        </p>

        <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
          Stop letting safety findings become paperwork.
        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
          Sentinel Safety helps teams capture hazards, review risk, connect
          standards, assign corrective actions, and generate professional
          inspection reports from one focused workflow.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <AppLinkButton
            href="/register"
            className="rounded-full bg-[#1D72B8] px-7 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
          >
            Start Free
          </AppLinkButton>

          <AppLinkButton
            href="/login"
            variant="secondary"
            className="rounded-full bg-white px-7 py-3 !text-[#0B1320] shadow-sm hover:bg-blue-50"
          >
            Sign In
          </AppLinkButton>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 md:py-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
          The Real Problem
        </p>

        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
          Safety teams do not need more forms. They need findings that turn into action.
        </h2>

        <div className="mx-auto mt-9 grid max-w-5xl gap-3 md:grid-cols-2">
          {painPoints.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-slate-50 px-5 py-4 text-left text-sm font-bold leading-6 text-slate-700 ring-1 ring-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-2xl font-black text-slate-950">
              {item.title}
            </h3>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[36px] bg-[#102A43] px-6 py-14 text-white shadow-sm sm:px-10 md:px-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
              SafeScope
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Intelligence built for the inspection, not bolted on after.
            </h2>

            <p className="mt-5 text-base font-semibold leading-7 text-blue-100">
              SafeScope helps classify hazards, evaluate risk signals, support
              MSHA and OSHA standards review, and organize corrective action
              focus areas so safety teams can make faster, better-supported
              decisions.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
              Why it matters
            </p>

            <h3 className="mt-3 text-3xl font-black">
              The best inspection tool is not just a checklist.
            </h3>

            <p className="mt-4 text-sm font-semibold leading-6 text-blue-100">
              It should help users understand what they saw, why it matters,
              what standards may apply, what action is needed, and how to
              produce a record that leadership can act on.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-10 md:py-16">
        <p className="text-center text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
          Why Teams Choose It
        </p>

        <h2 className="mx-auto mt-5 max-w-4xl text-center text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
          Built for safety professionals who need more than a notes app.
        </h2>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proofPoints.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-slate-50 px-5 py-4 text-center text-sm font-black text-slate-800 ring-1 ring-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[36px] bg-[#050B14] px-6 py-16 text-center text-white shadow-sm sm:px-10 md:px-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
          See Risk. Prevent Harm.
        </p>

        <h2 className="mx-auto mt-5 max-w-5xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
          Make every inspection easier to capture, easier to defend, and easier to act on.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-slate-300">
          Start with better findings. Finish with stronger reports and clearer
          accountability.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <AppLinkButton
            href="/register"
            className="rounded-full bg-[#1D72B8] px-7 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
          >
            Start Free
          </AppLinkButton>

          <AppLinkButton
            href="/"
            variant="secondary"
            className="rounded-full bg-white px-7 py-3 !text-[#0B1320] shadow-sm hover:bg-blue-50"
          >
            Back to Home
          </AppLinkButton>
        </div>
      </div>
    </section>
  );
}
