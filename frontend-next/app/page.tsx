"use client";

import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";

const workflow = [
  {
    title: "Capture",
    body: "Document field observations with photos, locations, notes, task context, and the conditions that matter.",
  },
  {
    title: "Review",
    body: "Use HazLenz AI to organize risk signals, evidence gaps, standards support, and corrective action reasoning.",
  },
  {
    title: "Act",
    body: "Assign corrective actions, track follow-through, and keep records connected to the original finding.",
  },
];


const outcomes = [
  ["Less scattered evidence", "Keep findings, photos, notes, standards support, and actions connected."],
  ["Cleaner review", "Make it easier for qualified personnel to understand what happened and what still needs verification."],
  ["Stronger follow-through", "Move from observation to assigned work without losing accountability."],
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] text-white shadow-none">
        <div className="relative p-6 sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                Safety intelligence reimagined
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
                Field safety inspections, built for action.
              </h1>

              <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-200 sm:text-lg sm:leading-8">
                GuideGuard helps teams turn field observations into documented findings, risk review, standards support, corrective actions, and inspection-ready records.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <AppLinkButton
                  href="/register"
                  variant="primary"
                  className="bg-[#1D72B8] px-6 py-3 text-white hover:bg-white hover:text-[#0B1320]"
                >
                  Create account
                </AppLinkButton>

                <AppLinkButton
                  href="/login"
                  variant="secondary"
                  className="border border-white/20 bg-white/10 px-6 py-3 text-white hover:bg-white hover:text-[#0B1320]"
                >
                  Sign in
                </AppLinkButton>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/15 bg-white/10 p-5  sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">
                HazLenz AI
              </p>

              <p className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em] text-white">
                Proprietary decision-support intelligence for safety review.
              </p>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-200">
                HazLenz AI helps organize hazard context, risk signals, evidence gaps, standards support, and corrective action reasoning for qualified professional review.
              </p>

              <div className="mt-5 border-t border-white/15 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                  Advisory support only
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  Final safety, compliance, and corrective action decisions remain with qualified personnel and the user organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {workflow.map((item, index) => (
          <div
            key={item.title}
            className="rounded-[24px] border border-white/70 bg-white p-5 shadow-sm  "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1D72B8] text-sm font-black text-white">
              {index + 1}
            </div>
            <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-slate-950">
              {item.title}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm   sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.055em] text-slate-950 sm:text-4xl">
            One connected workflow from observation to follow-through.
          </h2>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            Built for teams that need faster capture, cleaner review, and stronger accountability across inspections, findings, and corrective actions.
          </p>
        </div>

      </section>

      <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm   sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Why it matters
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {outcomes.map(([title, body]) => (
            <div key={title} className="border-l-4 border-[#1D72B8] pl-4">
              <h3 className="text-lg font-black tracking-[-0.035em] text-slate-950">
                {title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-9 text-center">
        <h2 className="text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl">
          Capture the finding. Review the risk. Drive the action.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
          Start with a cleaner inspection workflow built for real field safety work.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <AppLinkButton href="/register" variant="primary">
            Create account
          </AppLinkButton>
          <AppLinkButton href="/login" variant="secondary">
            Sign in
          </AppLinkButton>
        </div>
      </section>
    </main>
  );
}
