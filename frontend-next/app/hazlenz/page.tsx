"use client";

import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { getAuthUser } from "@/lib/auth";

const sections = [
  {
    title: "Structured observation understanding",
    body: "Safety InSite's HazLenz AI processes natural language safety observations into clean, structured datasets including equipment category, components in use, active worker tasks, exposure pathways, energy sources, and control failures.",
  },
  {
    title: "Hazard mechanism reasoning",
    body: "Instead of simple keyword matching, the engine analyzes physical energy pathways (e.g., mechanical rotation, gravity, electrical) and barrier failure modes to identify plausible ways harm could occur in a given scenario.",
  },
  {
    title: "Standards-informed matching",
    body: "Matches structured observations against approved MSHA and OSHA (General Industry and Construction) regulatory frameworks to surface potentially applicable standard families and standards-informed references for qualified safety review.",
  },
  {
    title: "Evidence gap detection",
    body: "Autonomously identifies missing or ambiguous parameters—such as worker proximity, equipment operational state, or control status—and flags them as critical questions to resolve before finalizing findings.",
  },
  {
    title: "Advisory corrective action support",
    body: "Recommends custom, layered action plans following the strict hierarchy of controls (immediate containment, engineering barricades, administrative training, and verification guidelines) tailored to the hazard mechanism.",
  },
  {
    title: "Explainability & transparency",
    body: "Every finding includes a full visual and step-by-step AI Reasoning Trace. This allows safety managers to inspect the exact reasoning sequence, inputs used, and matched logic that led to the recommendations.",
  },
  {
    title: "Human-in-the-loop governance",
    body: "Designed with a strict fail-safe. HazLenz AI acts purely as a decision-support advisory tool. It never auto-finalizes findings, declares violations, creates official citations, or replaces qualified safety professionals.",
  },
  {
    title: "Benchmark validation",
    body: "To support repeatable validation and reasoning consistency, the engine's observation understanding is supported by an automated multi-scenario benchmark covering core industrial hazard scenarios.",
  },
];

export default function HazLenzPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    try {
      const user = getAuthUser();
      setIsSignedIn(Boolean(user?.email || user?.name || user?.role));
    } catch {
      setIsSignedIn(false);
    }
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-4 sm:px-5 lg:py-7">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#1D72B8]/10 blur-3xl" />

        <div className="relative border-b border-slate-200/80 pb-6 sm:pb-8">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] p-5 text-white shadow-none sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                  Safety intelligence reimagined
                </p>

                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                  HazLenz AI.
                </h1>

                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-200 sm:text-lg sm:leading-8">
                  A governed hazard intelligence engine that interprets inspection observations, extracts structured hazard context, reasons across equipment, task, exposure, energy, and control factors, identifies evidence gaps, and supports advisory corrective action review.
                </p>
              </div>

              <div className="border-l-4 border-blue-300/80 pl-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
                  Qualified review required
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  HazLenz AI supports professional judgment. It does not replace qualified safety review, declare violations, create citations, determine compliance, or make final decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200/80 border-b border-slate-200/80">
          {sections.map((section) => (
            <div
              key={section.title}
              className="grid gap-2 py-5 sm:grid-cols-[0.34fr_0.66fr] sm:gap-4"
            >
              <h2 className="text-lg font-black tracking-tight text-slate-950 capitalize">
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
            HazLenz AI supports qualified professional review. See the{" "}
            <a href="/legal" className="border-b-2 border-[#1D72B8] font-black text-[#1D72B8] hover:border-[#0B1320] hover:text-[#0B1320]">
              legal disclaimer
            </a>
            {" "}for use limitations.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <AppLinkButton
              href="/login"
              className="bg-[#1D72B8] px-6 py-3 text-white shadow-none hover:bg-[#0B1320]"
            >
              Return to sign in
            </AppLinkButton>

            <AppLinkButton
              href="/register"
              variant="secondary"
              className="bg-white px-6 py-3 !text-[#0B1320] shadow-none ring-1 ring-slate-200 hover:bg-blue-50"
            >
              Create account
            </AppLinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
