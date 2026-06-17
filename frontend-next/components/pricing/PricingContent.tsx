import { AppTextLink } from "@/components/ui/AppTextLink";

type PricingContentProps = {
  mode?: "public" | "upgrade";
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    audience: "For trying InSite and creating basic inspection records.",
    position: "Start documenting findings without committing to a paid plan.",
    cta: "Create Free Account",
    publicHref: "/register?plan=free",
    upgradeHref: "/profile",
    featured: false,
    sections: [
      {
        title: "Included",
        items: [
          "Basic inspection finding capture",
          "Photos, location, and notes",
          "Basic hazard category support",
          "Simple report output",
          "Manual corrective action entry",
        ],
      },
      {
        title: "Limitations",
        items: [
          "Limited HazLenz AI preview only",
          "No full standards reasoning",
          "No advanced corrective action intelligence",
          "Limited report intelligence",
        ],
      },
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    cadence: "/month",
    audience: "For individual safety professionals who need more than documentation.",
    position: "Unlock HazLenz AI intelligence, stronger reports, and better corrective actions.",
    cta: "Choose Pro",
    publicHref: "/register?plan=pro",
    upgradeHref: "/profile?upgrade=pro",
    featured: true,
    badge: "Best value",
    sections: [
      {
        title: "HazLenz AI Intelligence",
        items: [
          "Full HazLenz AI hazard review",
          "MSHA / OSHA standards suggestions",
          "Risk and confidence support",
          "Evidence gap prompts",
          "Additional hazard awareness",
        ],
      },
      {
        title: "Professional Workflow",
        items: [
          "Professional inspection reports",
          "Corrective action recommendations",
          "Saved inspection history",
          "Repeat-hazard insight support",
          "Human-review safeguards",
        ],
      },
    ],
  },
  {
    name: "Advanced",
    price: "$49.99",
    cadence: "/month",
    audience: "For safety professionals who need deeper reporting and review tools.",
    position: "Adds expanded reporting, review visibility, and advanced workflow tools.",
    cta: "Choose Advanced",
    publicHref: "/register?plan=pro",
    upgradeHref: "/profile?upgrade=pro",
    featured: false,
    sections: [
      {
        title: "Team Access",
        items: [
          "Expanded report review",
          "Advanced inspection history",
          "Advanced review controls",
          "Advanced workspace tools",
          "Expanded inspection records",
        ],
      },
      {
        title: "Advanced Tools",
        items: [
          "Inspection planning tools",
          "Corrective action tracking",
          "Advanced dashboards",
          "Action due dates and status tracking",
          "Workspace-level safety visibility",
        ],
      },
    ],
  },
];

const comparisonRows = [
  ["Basic findings, photos, and notes", "Yes", "Yes", "Yes"],
  ["Simple report creation", "Yes", "Yes", "Yes"],
  ["Full HazLenz AI hazard intelligence", "Preview only", "Yes", "Yes"],
  ["Suggested MSHA / OSHA standards", "Limited", "Yes", "Yes"],
  ["Evidence gap prompts", "No", "Yes", "Yes"],
  ["Corrective action reasoning", "Manual only", "Yes", "Yes"],
  ["Saved inspection history", "Limited", "Yes", "Yes"],
  ["Advanced review controls", "No", "No", "Yes"],
  ["Inspection planning tools", "No", "No", "Yes"],
  ["Advanced dashboards", "No", "No", "Yes"],
];

export default function PricingContent({ mode = "public" }: PricingContentProps) {
  const isUpgrade = mode === "upgrade";

  return (
    <section className="mx-auto max-w-6xl space-y-7 px-1">
      <div className="rounded-[32px] bg-[#0B1320] px-5 py-10 text-center text-white shadow-sm sm:px-8 md:py-12">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
          {isUpgrade ? "Upgrade InSite" : "InSite Pricing"}
        </p>

        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {isUpgrade
            ? "Choose the plan that matches how your safety work is growing."
            : "Choose the level of safety intelligence your work requires."}
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
          Free helps users try the workflow. Pro unlocks HazLenz AI intelligence.
          Advanced tools add expanded review, reporting, and
          workspace-level visibility.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => {
          const href = isUpgrade ? tier.upgradeHref : tier.publicHref;
          const cta =
            isUpgrade && tier.name === "Free"
              ? "Current / Downgrade"
              : isUpgrade
                ? `Upgrade to ${tier.name}`
                : tier.cta;

          return (
            <div
              key={tier.name}
              className={[
                "flex rounded-[28px] border bg-white p-5 shadow-sm",
                tier.featured
                  ? "border-[#1D72B8] ring-2 ring-[#1D72B8]/20"
                  : "border-slate-200",
              ].join(" ")}
            >
              <div className="flex w-full flex-col">
                <div className="min-h-[172px] border-b border-slate-200 pb-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-black text-slate-950">
                      {tier.name}
                    </h2>

                    {tier.badge && (
                      <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-black tracking-tight text-slate-950">
                      {tier.price}
                    </span>
                    <span className="pb-1 text-sm font-black text-slate-500">
                      {tier.cadence}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-bold leading-6 text-slate-600">
                    {tier.audience}
                  </p>

                  <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black leading-5 text-[#102A43] ring-1 ring-slate-200">
                    {tier.position}
                  </p>
                </div>

                <div className="flex-1 space-y-5 py-5">
                  {tier.sections.map((section) => (
                    <div key={section.title}>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                        {section.title}
                      </p>

                      <ul className="mt-3 space-y-2">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm font-semibold leading-5 text-slate-700"
                          >
                            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8F4FF] text-[10px] font-black text-[#1D72B8]">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <AppTextLink
                  href={href}
                  className="mt-auto flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#102A43] px-4 py-3 text-center text-sm font-black !text-white shadow-sm transition hover:bg-[#1D72B8]"
                >
                  {cta}
                </AppTextLink>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Why Pro Is Different
          </p>

          <h2 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            Basic audit apps document the issue. InSite helps explain
            what it means and what should happen next.
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Pro is built around HazLenz AI: hazard review, standards support,
            evidence gaps, risk signals, corrective action reasoning, and
            professional reporting safeguards.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.35fr_0.65fr_0.65fr_0.8fr] bg-[#102A43] text-xs font-black uppercase tracking-wide text-white">
              <div className="px-3 py-3">Feature</div>
              <div className="px-3 py-3 text-center">Free</div>
              <div className="px-3 py-3 text-center">Pro</div>
              <div className="px-3 py-3 text-center">Advanced</div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row[0]}
                className={[
                  "grid grid-cols-[1.35fr_0.65fr_0.65fr_0.8fr] border-t border-slate-200 text-sm font-semibold",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50",
                ].join(" ")}
              >
                <div className="px-3 py-3 text-slate-800">{row[0]}</div>
                <div className="px-3 py-3 text-center text-slate-600">{row[1]}</div>
                <div className="px-3 py-3 text-center font-black text-[#1D72B8]">{row[2]}</div>
                <div className="px-3 py-3 text-center font-black text-[#102A43]">{row[3]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-[#E8F4FF] px-5 py-7 text-center ring-1 ring-blue-100 sm:px-8">
        <h2 className="text-2xl font-black text-[#102A43]">
          Don’t just record hazards. Understand them, correct them, and prove
          they were addressed.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-700">
          InSite is designed for safety professionals who need stronger
          findings, clearer corrective actions, and records that support real
          accountability.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <AppTextLink
            href={isUpgrade ? "/profile?upgrade=pro" : "/register?plan=pro"}
            className="rounded-full bg-[#102A43] px-6 py-3 text-sm font-black !text-white shadow-sm hover:bg-[#1D72B8]"
          >
            {isUpgrade ? "Upgrade to Pro" : "Start Pro"}
          </AppTextLink>

          <AppTextLink
            href={isUpgrade ? "/profile" : "/login"}
            className="rounded-full bg-white px-6 py-3 text-sm font-black !text-[#102A43] shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
          >
            {isUpgrade ? "Return to Profile" : "Return to Sign In"}
          </AppTextLink>
        </div>
      </div>
    </section>
  );
}
