"use client";
import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";

const proofPoints = [
  ["Inspection-first", "Built around the field workflow safety professionals already use: observe, capture, classify, correct, review, and report."],
  ["HazLenz AI support", "Turn photos and observations into organized hazard reasoning, evidence gaps, corrective actions, and report-ready findings."],
  ["Audit-ready records", "Keep findings, photos, actions, review notes, and report packages connected instead of scattered across notes, folders, and spreadsheets."],
];

export default function MarketingHomePage() {
  // hasAuthToken() reads localStorage, so it is always false during SSR but true for a
  // signed-in visitor on the client. Seeding useState with it made the server and the
  // first client render disagree about which CTA to show, which React reports as
  // hydration error #418 and repairs by throwing away and re-rendering the subtree.
  // Resolving after mount keeps the first client render identical to the server HTML.
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    setIsSignedIn(hasAuthToken());
  }, []);

  return (
    <section className="mx-auto -mb-8 flex w-full max-w-6xl flex-col gap-5 px-3 pt-4 pb-0 sm:-mb-10 sm:px-6 sm:pt-8 lg:pt-10">
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

          <div className="mx-auto mt-7 grid max-w-4xl gap-3 border-t border-white/15 pt-6 md:grid-cols-3">
            {proofPoints.map(([title, description]) => (
              <article
                key={title}
                className="rounded-xl bg-white/10 px-4 py-4 text-center ring-1 ring-white/15"
              >
                <h2 className="text-sm font-black text-white">{title}</h2>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-200">
                  {description}
                </p>
              </article>
            ))}
          </div>

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
                  href="/pricing"
                  className="!flex !w-full items-center justify-center rounded-full bg-[#1D72B8] px-6 py-3 text-center text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320] sm:!w-[180px]"
                >
                  Create account
                </AppLinkButton>

                <AppLinkButton
                  href="/login"
                  variant="secondary"
                  className="!flex !w-full items-center justify-center rounded-full border border-white/20 bg-[#FFFFFF] px-6 py-3 text-center text-sm font-black !text-[#0B1320] shadow-none transition hover:bg-slate-100 sm:!w-[180px]"
                >
                  Sign in
                </AppLinkButton>
              </>
            )}
          </div>

          <p className="mx-auto mt-4 max-w-xl text-center text-xs font-bold leading-5 text-blue-100">
            View Free and Pro options before creating your account. Already registered? Sign in directly.
          </p>
        </div>
      </section>
    </section>
  );
}
