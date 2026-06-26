"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";

const proofPoints = [
  ["Inspection-first", "Built around the field workflow safety professionals already use: observe, capture, classify, correct, review, and report."],
  ["HazLenz AI support", "Turn photos and observations into organized hazard reasoning, evidence gaps, corrective actions, and report-ready findings."],
  ["Audit-ready records", "Keep findings, photos, actions, review notes, and report packages connected instead of scattered across notes, folders, and spreadsheets."],
];

const proFeatures = [
  "Guided inspection workflow",
  "HazLenz AI decision support",
  "Risk and corrective action planning",
  "Standards-aware review support",
  "Saved reports and inspection history",
  "Professional report package workflow",
];

const useCases = [
  ["Field inspections", "Capture hazards quickly and keep each finding tied to evidence, location, risk, and action."],
  ["Corrective actions", "Move from observation to follow-up without losing what needs to be fixed, who reviewed it, or why it matters."],
  ["Safety reports", "Create cleaner inspection records that are easier to review, share, and defend."],
];

export default function MarketingHomePage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setIsSignedIn(hasAuthToken());
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] text-white shadow-none">
        <div className="relative isolate px-5 py-8 text-center sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#5DB7FF]">
            Safety InSite + HazLenz AI
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-center text-4xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
            Inspection-first safety intelligence for real field work.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-center text-base font-semibold leading-7 text-slate-200 sm:text-lg">
            Safety InSite helps safety professionals capture hazards, organize evidence, plan corrective actions, and build cleaner inspection records — with HazLenz AI supporting the review instead of replacing qualified judgment.
          </p>

          <div className="mx-auto mt-7 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <AppLinkButton
                href="/command-center"
                className="!flex !w-full items-center justify-center rounded-full bg-[#1D72B8] px-6 py-3 text-center text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320] sm:!w-[220px]"
              >
                Return to Dashboard
              </AppLinkButton>
            ) : (
              <>
                <AppLinkButton
                  href="/register"
                  className="!flex !w-full items-center justify-center rounded-full bg-[#1D72B8] px-6 py-3 text-center text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320] sm:!w-[180px]"
                >
                  Create account
                </AppLinkButton>

                <AppLinkButton
                  href="/login"
                  variant="secondary"
                  className="!flex !w-full items-center justify-center rounded-full border border-white/20 bg-white px-6 py-3 text-center text-sm font-black !text-[#0B1320] shadow-none transition hover:bg-slate-100 sm:!w-[180px]"
                >
                  Sign in
                </AppLinkButton>
              </>
            )}
          </div>

          <p className="mx-auto mt-4 max-w-xl text-center text-xs font-bold leading-5 text-blue-100">
            Start simple. Upgrade when you need guided inspections, HazLenz AI review, corrective action planning, and professional report workflows.
          </p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {proofPoints.map(([title, description]) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-none"
          >
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-none sm:px-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
            Why Safety InSite
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900 sm:text-3xl">
            Less clutter than enterprise EHS software. More structure than notes and spreadsheets.
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
            Many safety tools try to become everything at once. Safety InSite stays focused on the work that starts the whole safety cycle: the inspection. Capture what you see, preserve the evidence, organize the finding, and move it toward action.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {useCases.map(([title, description]) => (
              <div key={title} className="rounded-xl bg-slate-50 px-3 py-4 text-center ring-1 ring-slate-200">
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#1D72B8]/25 bg-[#E8F4FF] px-5 py-6 shadow-none sm:px-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
            Pro tier
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
            Built for professionals who need more than quick capture.
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
            Pro is for recurring inspections, deeper documentation, and higher-confidence review workflows. Use it when findings need more context, traceability, and follow-through.
          </p>

          <div className="mt-5 grid gap-2">
            {proFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-black text-slate-800 ring-1 ring-blue-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D72B8] text-xs text-white">
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <AppLinkButton
              href="/pricing"
              className="!inline-flex !w-full max-w-xs justify-center rounded-full bg-[#102A43] px-6 py-3 text-sm font-black !text-white shadow-none transition hover:bg-[#1D72B8]"
            >
              Compare plans
            </AppLinkButton>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-none sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">
          Professional guardrails
        </p>
        <h2 className="mx-auto mt-2 max-w-3xl text-2xl font-black tracking-[-0.04em] text-slate-900 sm:text-3xl">
          AI-assisted, not auto-cited. Designed for qualified safety review.
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          HazLenz AI is advisory support. It helps organize observations, likely hazard context, evidence gaps, and corrective action ideas, while keeping the final safety decision with the qualified reviewer.
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          {!isSignedIn && (
              <Link
                href="/register"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            )}
        </div>
      </section>
    </section>
  );
}
