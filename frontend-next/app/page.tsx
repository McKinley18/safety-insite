import { AppLinkButton } from "@/components/ui/AppLinkButton";

const outcomes = [
  {
    label: "Capture",
    title: "Document hazards in the field",
    text: "Record photos, locations, observed conditions, and evidence notes in a structured inspection workflow.",
  },
  {
    label: "Analyze",
    title: "Use SafeScope to support review",
    text: "Classify hazards, surface risk signals, suggest standards, and organize reasoning for qualified safety review.",
  },
  {
    label: "Act",
    title: "Turn findings into corrective action",
    text: "Create report-ready findings, corrective actions, follow-up language, and executive summaries.",
  },
];

const capabilities = [
  "Hazard photo and evidence capture",
  "SafeScope hazard classification",
  "MSHA and OSHA standards support",
  "Risk scoring and priority signals",
  "Corrective action tracking",
  "Professional inspection reports",
  "Executive review summaries",
  "Analytics and trend intelligence",
];

const audience = [
  "Mining operations",
  "Construction teams",
  "General industry employers",
  "Safety managers",
  "Supervisors",
  "Auditors and consultants",
];

const trustPoints = [
  "Designed as decision support for qualified safety professionals",
  "Built around reviewable findings, not black-box conclusions",
  "Supports MSHA and OSHA-focused inspection workflows",
  "Connects observations, standards, risk, and corrective action",
];

export default function MarketingPage() {
  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[32px] bg-[#0B1320] p-6 text-white shadow-sm sm:p-8 md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5DB7FF]">
              Sentinel Safety
            </p>

            <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
              See Risk.
              <span className="block text-[#5DB7FF]">Prevent Harm.</span>
            </h1>

            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
              Sentinel Safety helps safety teams capture hazards, review
              standards, create corrective actions, and generate professional
              inspection reports with SafeScope intelligence built into the
              workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AppLinkButton
                href="/register"
                className="rounded-full bg-[#1D72B8] px-6 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
              >
                Create an Account
              </AppLinkButton>

              <AppLinkButton
                href="/login"
                variant="secondary"
                className="rounded-full border-white/20 bg-white px-6 py-3 !text-[#0B1320] shadow-sm hover:bg-blue-50"
              >
                Sign In
              </AppLinkButton>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
              Built for the full safety cycle
            </p>

            <div className="mt-4 space-y-3">
              {["Identify", "Analyze", "Correct", "Report", "Track"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10"
                  >
                    <span className="text-sm font-black text-white">
                      {item}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-[#102A43]">
                      {index + 1}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-400">
          The problem
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
          Safety documentation is too often scattered, inconsistent, and hard to defend.
        </h2>

        <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
          Field observations, photos, standards, risk levels, corrective actions,
          and final reports are commonly handled in separate tools. Sentinel
          Safety is being built to bring those pieces into one structured,
          professional workflow.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-400">
          Platform Workflow
        </p>

        <h2 className="mb-5 text-3xl font-black text-slate-900 dark:text-slate-100">
          From hazard capture to report-ready action.
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {outcomes.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D72B8] dark:text-sky-400">
                {item.label}
              </p>
              <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-400">
              SafeScope Intelligence
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
              Safety intelligence designed for real inspection decisions.
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
              SafeScope is the intelligence layer inside Sentinel Safety. It is
              being developed to help organize observations, classify hazards,
              connect applicable standards, identify risk themes, and recommend
              corrective action focus areas.
            </p>

            <p className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400">
              SafeScope supports qualified safety judgment. It does not replace
              competent-person review, professional responsibility, or employer
              compliance obligations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-400">
            Built For
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            Serious safety operations.
          </h2>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {audience.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-400">
            Trust Layer
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            Reviewable. Explainable. Report-ready.
          </h2>

          <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {trustPoints.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 py-3 text-sm font-bold leading-6 text-slate-700 dark:text-slate-300"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1D72B8]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-[#0F172A] p-8 text-center text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
          Sentinel Safety
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Build stronger inspections from the first observation.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Document hazards, support qualified review, and produce stronger safety
          records from one professional workflow.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <AppLinkButton
            href="/register"
            className="rounded-full bg-[#1D72B8] px-6 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
          >
            Create an Account
          </AppLinkButton>

          <AppLinkButton
            href="/safescope"
            variant="secondary"
            className="rounded-full border-white/20 bg-white px-6 py-3 !text-[#0B1320] shadow-sm hover:bg-blue-50"
          >
            Learn About SafeScope
          </AppLinkButton>
        </div>
      </div>
    </section>
  );
}