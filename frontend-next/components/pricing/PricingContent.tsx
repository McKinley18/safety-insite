"use client";

// ACQUISITION SURFACE.
//
// This page is for someone who has not decided yet: a safety professional who
// landed from the marketing page or a search, comparing what Free keeps and what
// $24.99 adds. It has to answer, in order, what the product does, what Free gives
// away, what Pro adds, and why that is worth a monthly price.
//
// It is deliberately NOT the same experience as /upgrade. /upgrade talks to someone
// already inside the product who knows what it does and is hitting a Free limit; it
// is short, states the price, and converts. Both read their plan facts from
// ./planData so the two can never disagree about a price or a claim -- see the
// header of that file for why that mattered.
//
// Mobile-first: the headline, the price and the primary CTA all land inside the
// first 320px viewport. The plan detail and the full comparison table sit behind
// progressive disclosure rather than as a wall of text above them.

import { AppTextLink } from "@/components/ui/AppTextLink";
import {
  COMPARISON_ROWS,
  FREE_PRICE_DISPLAY,
  LAUNCH_PLANS,
  PRO_PRICE_CADENCE,
  PRO_PRICE_DISPLAY,
} from "./planData";

const workflowSteps = [
  {
    step: "1",
    title: "Capture what you saw",
    detail: "Observation, location, work area, and photo evidence — from the phone in your hand.",
  },
  {
    step: "2",
    title: "HazLenz AI reviews it",
    detail: "The observation comes back as an organized hazard analysis with the evidence gaps named.",
  },
  {
    step: "3",
    title: "Connect it to a standard",
    detail: "Applicable MSHA and OSHA standards are suggested for the hazard so the finding has support.",
  },
  {
    step: "4",
    title: "Assign and report",
    detail: "Corrective actions get an owner and a due date, and the report is built from what you captured.",
  },
];

export default function PricingContent() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-1 sm:space-y-8">
      {/* Hero — headline, price and CTA inside the first phone viewport. */}
      <div className="rounded-3xl bg-[#0B1320] px-4 py-8 text-center text-white shadow-sm sm:rounded-[32px] sm:px-8 sm:py-12">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-200 sm:text-xs">
          Safety InSite Pricing
        </p>

        <h1 className="mx-auto mt-3 max-w-3xl text-[26px] font-black leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          Two plans. One does the paperwork, one does the thinking.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
          Safety InSite is an inspection app for safety professionals. Free keeps the
          record of what you saw. Pro adds the HazLenz AI review, the standards behind
          the finding, the corrective actions, and the report.
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <AppTextLink
            href="/register?plan=pro"
            tone="button"
            className="flex min-h-12 no-underline items-center justify-center rounded-full bg-[#1D72B8] px-6 text-sm font-black !text-white transition hover:bg-[#5DB7FF] hover:!text-[#0B1320]"
          >
            Start Pro — {PRO_PRICE_DISPLAY}{PRO_PRICE_CADENCE}
          </AppTextLink>

          <AppTextLink
            href="/register?plan=free"
            tone="button"
            className="flex min-h-12 no-underline items-center justify-center rounded-full bg-white px-6 text-sm font-black !text-[#0B1320] transition hover:bg-slate-100"
          >
            Start free — {FREE_PRICE_DISPLAY}
          </AppTextLink>
        </div>

        <p className="mx-auto mt-4 max-w-lg text-xs font-bold leading-5 text-blue-100">
          Every account starts on Free. Monthly billing, and HazLenz supports the review
          rather than replacing your judgment.
        </p>
      </div>

      {/* What the product actually does, before the plan table. */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-2xl">
          What an inspection looks like in Safety InSite
        </h2>

        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {workflowSteps.map((item) => (
            <li
              key={item.step}
              className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#102A43] text-xs font-black text-white">
                {item.step}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-slate-950">{item.title}</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Plans. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {LAUNCH_PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={[
              "flex flex-col rounded-3xl border bg-white p-4 shadow-sm sm:p-5",
              plan.featured ? "border-[#1D72B8] ring-2 ring-[#1D72B8]/20" : "border-slate-200",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{plan.name}</h2>
              {plan.badge && (
                <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                  {plan.badge}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {plan.price}
              </span>
              <span className="pb-1 text-sm font-black text-slate-500">{plan.cadence}</span>
            </div>

            <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{plan.audience}</p>

            <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-black leading-5 text-[#102A43] ring-1 ring-slate-200">
              {plan.position}
            </p>

            <div className="flex-1 space-y-4 py-4">
              {plan.sections.map((section) => (
                <div key={section.title}>
                  {/* The bg-[#E8F4FF] chips keep #1D72B8 because that surface has no dark
                      override and stays light; the eyebrows sit on bg-white / bg-slate-50,
                      which globals.css flips to the dark app surface, so they take the
                      dark counterpart. */}
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1D72B8] dark:text-[#5DB7FF]">
                    {section.title}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm font-semibold leading-5 text-slate-700"
                      >
                        <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8F4FF] text-[10px] font-black text-[#1D72B8]">
                          {section.title.startsWith("Not included") ? "—" : "✓"}
                        </span>
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <AppTextLink
              href={plan.publicHref}
              tone="button"
              className="mt-auto flex min-h-12 no-underline w-full items-center justify-center rounded-2xl bg-[#102A43] px-4 text-center text-sm font-black !text-white shadow-sm transition hover:bg-[#1D72B8]"
            >
              {plan.cta}
            </AppTextLink>
          </div>
        ))}
      </div>

      {/* Why the paid tier costs what it costs, in product terms. */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
          A basic audit app records the issue. Pro helps you say what it means and what
          happens next.
        </h2>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          {PRO_PRICE_DISPLAY}{PRO_PRICE_CADENCE} covers the part of the job that takes the
          longest after you leave the site: working out which standard applies, writing the
          corrective action, and assembling a report someone else will read. Findings still
          pass through your review before they count.
        </p>

        {/* Progressive disclosure: the full matrix is available, not imposed.
            The grid uses fixed narrow value columns instead of a min-width table so it
            fits a 320px screen without an internal horizontal scroller. */}
        <details className="group mt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-[#102A43] ring-1 ring-slate-200">
            Compare every feature
            <span className="text-xs transition group-open:rotate-180">▾</span>
          </summary>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[minmax(0,1fr)_3rem_3rem] bg-[#102A43] text-[10px] font-black uppercase tracking-wide text-white sm:grid-cols-[1.6fr_0.5fr_0.5fr] sm:text-xs">
              <div className="px-3 py-3">Feature</div>
              <div className="px-1 py-3 text-center sm:px-3">Free</div>
              <div className="px-1 py-3 text-center sm:px-3">Pro</div>
            </div>

            {COMPARISON_ROWS.map((row, index) => (
              <div
                key={row[0]}
                className={[
                  "grid grid-cols-[minmax(0,1fr)_3rem_3rem] border-t border-slate-200 text-xs font-semibold sm:grid-cols-[1.6fr_0.5fr_0.5fr] sm:text-sm",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50",
                ].join(" ")}
              >
                <div className="px-3 py-3 text-slate-800">{row[0]}</div>
                <div className="px-1 py-3 text-center text-slate-600 sm:px-3">{row[1]}</div>
                <div className="px-1 py-3 text-center font-black text-[#1D72B8] dark:text-[#5DB7FF] sm:px-3">
                  {row[2]}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Close. */}
      <div className="rounded-3xl bg-[#E8F4FF] px-4 py-6 text-center ring-1 ring-blue-100 sm:px-8 sm:py-7">
        <h2 className="text-lg font-black leading-tight text-[#102A43] sm:text-2xl">
          Record the hazard, correct it, and be able to show it was handled.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-700">
          Start on Free and move to Pro when you need the review, the standards, and the report.
        </p>

        <div className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <AppTextLink
            href="/register?plan=pro"
            tone="button"
            className="flex min-h-12 no-underline items-center justify-center rounded-full bg-[#102A43] px-6 text-sm font-black !text-white shadow-sm hover:bg-[#1D72B8]"
          >
            Start Pro
          </AppTextLink>

          <AppTextLink
            href="/login"
            tone="button"
            className="flex min-h-12 no-underline items-center justify-center rounded-full bg-white px-6 text-sm font-black !text-[#102A43] shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
          >
            Sign in
          </AppTextLink>
        </div>
      </div>
    </section>
  );
}
