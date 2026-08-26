"use client";
import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";
import { PRO_PRICE_DISPLAY } from "@/components/pricing/planData";

// Concrete capability, in the order the work actually happens. Deliberately no
// accuracy claims, no Level-3 language, and no "AI-powered transformation": the
// reader is an EHS professional who will discount all of it.
const proofPoints = [
  ["Capture it on site", "Observation, location, work area and photo evidence, entered from a phone while you are still standing there."],
  ["Review it with HazLenz AI", "The observation comes back as an organized hazard analysis with the applicable MSHA and OSHA standards suggested and the evidence gaps named."],
  ["Close it out", "Corrective actions with an owner and a due date, and an inspection report built from the findings you already captured."],
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

          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5DB7FF] sm:text-xs sm:tracking-[0.3em]">
            Safety InSite + HazLenz AI
          </p>

          {/* Sized so the headline, the supporting line and the CTA all land inside a
              320px viewport. The previous text-4xl with -0.055em tracking wrapped badly
              on a phone and pushed the primary action below the first screen. */}
          <h1 className="mx-auto mt-3 max-w-4xl text-center text-[28px] font-black leading-[1.05] tracking-[-0.03em] text-white sm:mt-4 sm:text-5xl sm:leading-[0.95] sm:tracking-[-0.055em] lg:text-6xl">
            The inspection app that helps you finish the paperwork.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-semibold leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-7">
            Safety InSite is built for safety professionals: capture the observation in the
            field, let HazLenz AI organize the hazard review and the standards behind it,
            track the corrective action, and produce the report. HazLenz supports the
            review — it does not replace your judgment.
          </p>

          <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <AppLinkButton
                href="/command-center"
                className="!flex min-h-12 !w-full items-center justify-center rounded-full bg-[#1D72B8] px-6 text-center text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320] sm:!w-[220px]"
              >
                Return to Dashboard
              </AppLinkButton>
            ) : (
              <>
                {/* This goes to /pricing, so it says so. Labelling it "Create account"
                    and landing the visitor on a plan comparison was a small broken promise
                    on the primary CTA. */}
                <AppLinkButton
                  href="/pricing"
                  className="!flex min-h-12 !w-full items-center justify-center rounded-full bg-[#1D72B8] px-6 text-center text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320] sm:!w-[200px]"
                >
                  See plans and pricing
                </AppLinkButton>

                <AppLinkButton
                  href="/login"
                  variant="secondary"
                  className="!flex min-h-12 !w-full items-center justify-center rounded-full border border-white/20 bg-[#FFFFFF] px-6 text-center text-sm font-black !text-[#0B1320] shadow-none transition hover:bg-slate-100 sm:!w-[200px]"
                >
                  Sign in
                </AppLinkButton>
              </>
            )}
          </div>

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

          <p className="mx-auto mt-4 max-w-xl text-center text-xs font-bold leading-5 text-blue-100">
            Free keeps your inspection records at no cost. Pro adds the HazLenz AI review,
            the standards, the corrective actions and the reports for {PRO_PRICE_DISPLAY} a month.
          </p>
        </div>
      </section>
    </section>
  );
}
