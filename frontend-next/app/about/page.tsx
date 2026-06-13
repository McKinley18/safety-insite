"use client";

import React, { useEffect, useState } from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";

const benefits = [
  {
    title: "Capture the finding.",
    text: "Photos, location, notes, risk, standards, and actions stay connected from the start.",
  },
  {
    title: "Understand the exposure.",
    text: "SafeScope helps organize the hazard, task context, likely mechanisms, and review needs.",
  },
  {
    title: "Turn it into action.",
    text: "Create assigned corrective actions and produce cleaner report-ready records.",
  },
];

const proofPoints = [
  "Inspection workflow",
  "Photo evidence",
  "Risk review",
  "MSHA / OSHA support",
  "Corrective actions",
  "Report-ready records",
];

export default function AboutPage() {
  const [hasAuthSession, setHasAuthSession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setHasAuthSession(hasAuthToken());
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-3 py-3 sm:px-4 lg:py-5">
      <div className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-[#1D72B8]">
              Sentinel Safety
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
              Safety findings should become action.
            </h1>

            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Sentinel Safety helps teams capture hazards, organize evidence,
              review risk, connect standards, assign corrective actions, and
              generate professional inspection records from one focused workflow.
            </p>
          </div>

          <div className="bg-[#F5F9FD] px-5 py-6 sm:px-8 lg:px-8 lg:py-10">
            <div className="rounded-[26px] bg-[#0B1320] p-5 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                Built for the field
              </p>

              <div className="mt-4 grid gap-2">
                {proofPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-black ring-1 ring-white/10"
                  >
                    <span>{item}</span>
                    <span className="text-blue-200">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950">
              {item.title}
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[30px] bg-[#F5F9FD] px-5 py-7 ring-1 ring-slate-200 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1D72B8]">
              SafeScope
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Intelligence for what the inspector actually saw.
            </h2>
          </div>

          <p className="text-base font-semibold leading-7 text-slate-600">
            SafeScope is designed to support qualified safety judgment by
            organizing hazard classification, risk signals, evidence gaps,
            standards review, and corrective action reasoning. It is advisory
            decision support, not a replacement for professional review.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-[30px] bg-[#0B1320] px-5 py-7 text-center text-white shadow-sm sm:px-8 lg:px-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
          Get Started
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
          Make every inspection easier to capture, easier to review, and easier
          to act on.
        </h2>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {hasAuthSession ? (
            <AppLinkButton
              href="/command-center"
              className="rounded-full bg-[#1D72B8] px-7 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
            >
              Go to Dashboard
            </AppLinkButton>
          ) : (
            <>
              <AppLinkButton
                href="/login"
                className="rounded-full bg-[#1D72B8] px-7 py-3 text-white shadow-sm hover:bg-[#2B86D1]"
              >
                Sign In
              </AppLinkButton>

              <AppLinkButton
                href="/register"
                variant="secondary"
                className="rounded-full bg-white px-7 py-3 !text-[#0B1320] shadow-sm hover:bg-blue-50"
              >
                Create Account
              </AppLinkButton>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
