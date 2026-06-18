"use client";

import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";

const capabilities = [
  {
    title: "Mobile inspection capture",
    highlight: "Capture the full field picture.",
    text: "Document findings with photos, notes, locations, risk details, and task context while the observation is still fresh.",
  },
  {
    title: "Risk and exposure review",
    highlight: "Understand what makes the finding serious.",
    text: "Organize severity, likelihood, exposure, evidence gaps, and review needs so findings are easier to evaluate.",
  },
  {
    title: "Standards-aware support",
    highlight: "Keep evidence and standards connected.",
    text: "Support MSHA and OSHA review by tying standards, reasoning, and inspection evidence back to the original finding.",
  },
  {
    title: "Corrective action tracking",
    highlight: "Turn findings into corrective action.",
    text: "Create follow-ups, track status, and keep accountability connected to the inspection record.",
  },
  {
    title: "Professional records",
    highlight: "Create cleaner inspection documentation.",
    text: "Build inspection-ready records that are easier to review, communicate, and use for operational follow-through.",
  },
];

const outcomes = [
  "Less scattered documentation",
  "Clearer inspection review",
  "Stronger corrective action follow-through",
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:px-5 lg:py-7">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#1D72B8]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-52 h-64 w-64 rounded-full bg-[#0B1320]/5 blur-3xl" />

        <div className="relative border-b border-slate-200/80 pb-7 sm:pb-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                Safety inspections, built for action.
              </h1>

              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Safety InSite helps safety professionals turn field observations into documented findings, risk review, standards support, corrective action, and inspection-ready records.
              </p>
            </div>

            <div className="border-l-4 border-[#1D72B8] pl-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Built for clarity
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                A cleaner way to manage inspection details, evidence, follow-ups, and records that need to hold up later.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {outcomes.map((item) => (
              <div
                key={item}
                className="border-l-2 border-[#1D72B8]/40 pl-3"
              >
                <p className="text-sm font-black leading-5 text-slate-800">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative border-b border-slate-200/80 py-7 sm:py-9">
          <div className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
                Capabilities
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                One connected workflow from observation to follow-through.
              </h2>
              <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-slate-600">
                Designed for safety professionals who need faster capture, cleaner review, and stronger accountability.
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200/80">
              {capabilities.map((item) => (
                <div
                  key={item.title}
                  className="grid gap-2 py-4 sm:grid-cols-[0.38fr_0.62fr] sm:gap-5"
                >
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#1D72B8]">
                      {item.highlight}
                    </p>
                  </div>

                  <p className="text-sm font-semibold leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative border-b border-slate-200/80 py-7 sm:py-9">
          <div className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
                HazLenz AI
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                Intelligence that supports the reviewer.
              </h2>
            </div>

            <div className="border-l border-slate-200/80 pl-4 text-base font-semibold leading-7 text-slate-600">
              <p>
                HazLenz AI helps organize hazard context, risk signals, evidence gaps, standards review, and corrective action reasoning so findings are easier to understand, review, and act on.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                HazLenz AI is advisory decision support. It does not replace professional judgment, declare violations, create citations, or override regulatory requirements.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-b border-slate-200/80 py-7 sm:py-9 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
              Why it matters
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
              Better records. Better follow-through.
            </h2>
          </div>

          <div className="border-l border-slate-200/80 pl-4">
            <p className="text-base font-semibold leading-7 text-slate-600">
              A safety finding should not disappear into a notebook, photo gallery, spreadsheet, or email chain. Safety InSite keeps the finding, evidence, review, and action connected so safety professionals can move faster, communicate clearly, and follow through with confidence.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="border-t border-slate-200/80 pt-3">
                <p className="text-sm font-black text-slate-950">Capture</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Record the condition clearly.
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-3">
                <p className="text-sm font-black text-slate-950">Review</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Understand risk and context.
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-3">
                <p className="text-sm font-black text-slate-950">Act</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Track correction.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-7 text-center sm:py-9">
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
            Capture the finding. Review the risk. Drive the action.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600">
            Start with a cleaner inspection workflow built for real field safety work.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <AppLinkButton
              href="/login"
              className="bg-[#1D72B8] px-6 py-3 text-white shadow-sm hover:bg-[#0B1320]"
            >
              Return to sign in
            </AppLinkButton>

            <AppLinkButton
              href="/register"
              variant="secondary"
              className="bg-white px-6 py-3 !text-[#0B1320] shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
            >
              Create account
            </AppLinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
