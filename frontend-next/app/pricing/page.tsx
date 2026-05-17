import Link from "next/link";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    audience: "For individuals testing Sentinel Safety or documenting simple inspections.",
    cta: "Start Free",
    href: "/register",
    features: [
      "Local inspection workflow",
      "Basic hazard documentation",
      "Photo/evidence notes",
      "Manual corrective actions",
      "Basic report generation",
      "Local browser storage",
      "Limited SafeScope support",
    ],
  },
  {
    name: "Plus",
    price: "Individual Pro",
    audience: "For solo safety professionals who need stronger reports and SafeScope intelligence.",
    cta: "Upgrade Soon",
    href: "/register",
    featured: true,
    features: [
      "Everything in Basic",
      "Full SafeScope hazard intelligence",
      "MSHA and OSHA standards suggestions",
      "Corrective action recommendations",
      "Enhanced report formatting",
      "Saved inspection history",
      "Offline save queue",
      "Advanced risk reasoning",
    ],
  },
  {
    name: "Company",
    price: "Team Workspace",
    audience: "For companies, mines, contractors, plants, and safety teams.",
    cta: "Contact / Setup",
    href: "/register",
    features: [
      "Everything in Plus",
      "Multi-user workspace",
      "Company logo and report branding",
      "Shared reports and inspection records",
      "Assigned corrective actions",
      "Dashboard analytics and trends",
      "Supervisor validation workflow",
      "Audit trail and governance",
      "Facility/site management",
      "Cloud sync and team roles",
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="space-y-10">
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1320] via-[#102A43] to-[#1D72B8] px-6 py-12 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
          Sentinel Safety Plans
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
          Safety intelligence built for individuals first, then teams.
        </h1>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-blue-50">
          Start with structured inspections for free. Upgrade when you need deeper SafeScope reasoning,
          standards support, team workflows, analytics, and company-level safety intelligence.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={[
              "rounded-3xl border bg-white p-6 shadow-sm",
              tier.featured ? "border-[#1D72B8] ring-2 ring-blue-100" : "border-slate-200",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{tier.name}</h2>
                <p className="mt-1 text-sm font-black uppercase tracking-wide text-[#1D72B8]">
                  {tier.price}
                </p>
              </div>
              {tier.featured && (
                <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                  Best next step
                </span>
              )}
            </div>

            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
              {tier.audience}
            </p>

            <ul className="mt-5 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm font-semibold text-slate-700">
                  <span className="text-[#1D72B8]">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              className={[
                "mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition",
                tier.featured
                  ? "bg-[#1D72B8] text-white hover:bg-[#155A93]"
                  : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
              ].join(" ")}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-2xl font-black text-slate-900">Planned tier logic</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Basic keeps the product accessible. Plus is for serious solo users who want SafeScope’s
          full standards and reasoning support. Company unlocks shared accountability, corrective
          action ownership, trend analytics, branding, audit history, and supervisor review.
        </p>
      </section>
    </section>
  );
}
