"use client";

import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";

const sections = [
  {
    title: "Proprietary review intelligence",
    body: "ReviewCore is proprietary decision-support intelligence within Sentinel Safety. It helps organize hazard context, risk signals, evidence gaps, standards support, and corrective action reasoning for qualified review.",
  },
  {
    title: "Built for safety findings",
    body: "ReviewCore is designed around the inspection workflow: field observations, documented findings, risk review, standards support, corrective action, and inspection-ready records.",
  },
  {
    title: "Standards support",
    body: "ReviewCore can help connect observed conditions to relevant MSHA, OSHA, and safety management concepts. Suggestions must always be verified by qualified personnel before use.",
  },
  {
    title: "Evidence gaps",
    body: "ReviewCore can help identify missing context, unclear details, or follow-up questions that may be needed before a finding is finalized.",
  },
  {
    title: "Corrective action reasoning",
    body: "ReviewCore supports more relevant corrective action development by considering hazard context, exposure, task conditions, and review needs.",
  },
  {
    title: "Professional review required",
    body: "ReviewCore does not replace qualified safety professionals, declare violations, create citations, determine compliance, or override regulatory requirements.",
  },
];

export default function SafeScopePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-4 sm:px-5 lg:py-7">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#1D72B8]/10 blur-3xl" />

        <div className="relative border-b border-slate-200/80 pb-6 sm:pb-8">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] p-5 text-white shadow-lg shadow-slate-950/10 ring-1 ring-white/10 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                  Safety intelligence reimagined
                </p>

                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                  ReviewCore.
                </h1>

                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-200 sm:text-lg sm:leading-8">
                  Proprietary decision-support intelligence for organizing field observations, risk context, standards support, evidence gaps, and corrective action reasoning.
                </p>
              </div>

              <div className="border-l-4 border-blue-300/80 pl-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
                  Qualified review required
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  ReviewCore supports professional judgment. It does not replace qualified safety review, determine compliance, or make final decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200/80 border-b border-slate-200/80">
          {sections.map((section) => (
            <div
              key={section.title}
              className="grid gap-2 py-5 sm:grid-cols-[0.34fr_0.66fr] sm:gap-6"
            >
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                {section.title}
              </h2>

              <p className="text-sm font-semibold leading-6 text-slate-600">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="py-7 text-center sm:py-8">
          <p className="mx-auto mb-5 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            ReviewCore supports qualified professional review. See the{" "}
            <a href="/legal" className="border-b-2 border-[#1D72B8] font-black text-[#1D72B8] hover:border-[#0B1320] hover:text-[#0B1320]">
              legal disclaimer
            </a>
            {" "}for use limitations.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
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
