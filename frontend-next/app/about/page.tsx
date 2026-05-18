"use client";

import Link from "next/link";
import { useState } from "react";
import { createCheckoutSession, getAuthToken } from "@/lib/auth";

const valuePillars = [
  "Faster field inspections",
  "Stronger audit records",
  "Corrective action accountability",
  "MSHA & OSHA support",
  "Offline-capable workflows",
  "Human-verified intelligence",
];

const companyDrivers = [
  ["Speed", "Capture hazards, evidence, risk context, and corrective actions while the condition is still fresh."],
  ["Defensibility", "Build clearer records with evidence, standards rationale, review triggers, and traceable decision support."],
  ["Accountability", "Move findings into assigned corrective action instead of letting hazards disappear into spreadsheets or inboxes."],
  ["Visibility", "Help leadership see repeat hazards, overdue actions, risk concentration, and operational patterns over time."],
];

const tiers = [
  [
    "Basic",
    "Free",
    "Individuals getting started",
    "Fast local inspections, basic reports, evidence notes, limited SafeScope assistance, and local-only storage.",
    null,
  ],
  [
    "Plus",
    "$24/mo",
    "Safety professionals",
    "Full SafeScope intelligence, standards support, corrective action guidance, inspection history, and offline field workflows.",
    "plus",
  ],
  [
    "Company",
    "$149/mo",
    "Teams and operations",
    "Shared workspace, company branding, assigned actions, analytics, supervisor validation, audit trail, and team roles.",
    "company",
  ],
] as const;

export default function AboutPage() {
  const [billingStatus, setBillingStatus] = useState("");

  async function startCheckout(planCode: "plus" | "company") {
    try {
      setBillingStatus("");

      if (!getAuthToken()) {
        window.location.href = "/login";
        return;
      }

      const session = await createCheckoutSession(planCode);

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      setBillingStatus("Billing checkout could not be started.");
    } catch {
      setBillingStatus("Billing is not configured yet. Please check back soon.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="overflow-hidden rounded-[2rem] bg-[#0B1320] text-white shadow-xl">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(29,114,184,0.45),transparent_38%),linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] px-6 py-10 sm:px-8 sm:py-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C0C6CF]">
            Sentinel Safety
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-6xl">
            Operational safety intelligence for companies that cannot afford weak records.
          </h1>

          <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-200">
            Capture hazards, document evidence, review likely standards, assign corrective actions,
            and build defensible safety records from the field — before risk becomes an incident,
            citation, shutdown, or repeat failure.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {valuePillars.map((pillar) => (
              <span key={pillar} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-100">
                {pillar}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-2xl bg-[#1D72B8] px-5 py-3 text-sm font-black text-white hover:bg-[#155A93]">
              Start Free
            </Link>
            <a href="#plans" className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
              View Plans
            </a>
          </div>
        </div>
      </header>

      <section className="grid gap-6 border-b border-slate-200 pb-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            The Problem
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Safety programs do not fail only because hazards exist.
          </h2>
        </div>

        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            They fail when hazards are recognized late, documented inconsistently, assigned without
            follow-through, or buried in disconnected systems that leadership cannot act on quickly.
          </p>
          <p>
            Sentinel Safety is designed to reduce those gaps by turning field observations into structured,
            reviewable, and actionable safety intelligence.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {companyDrivers.map(([title, body]) => (
          <div key={title} className="border-l-4 border-[#1D72B8] bg-white px-4 py-4 shadow-sm">
            <h3 className="text-base font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 border-y border-slate-200 py-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Built for the field
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Designed around real operating conditions.
          </h2>
        </div>

        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            Field safety work happens around poor connectivity, changing conditions, active equipment,
            production pressure, and limited time. Sentinel Safety is mobile-first, offline-capable,
            and centered on rapid evidence capture instead of administrative overhead.
          </p>
          <p>
            The platform helps inspectors document what they saw, why it matters, what standards may apply,
            who owns the correction, and what evidence supports the record.
          </p>
        </div>
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            SafeScope Intelligence
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Explainable intelligence, not blind automation.
          </h2>
        </div>

        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            SafeScope is the operational reasoning engine inside Sentinel Safety. It supports hazard
            classification, exposure-path reasoning, standards review, corrective action planning,
            confidence calibration, and supervisor validation.
          </p>
          <p>
            Every SafeScope output is designed to support qualified human review. It does not replace
            professional judgment, legal review, competent-person evaluation, or site-specific safety oversight.
          </p>
        </div>
      </section>

      <section id="plans" className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Access Tiers
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Free to start. Powerful enough for serious operations.
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            Basic keeps field documentation accessible. Plus unlocks full SafeScope intelligence for
            individual professionals. Company adds shared accountability, analytics, validation, and workspace control.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[0.7fr_0.7fr_1fr_1.4fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
            <div>Tier</div>
            <div>Price</div>
            <div>Best For</div>
            <div>Company Value</div>
            <div>Action</div>
          </div>

          {tiers.map(([name, price, audience, description, planCode]) => (
            <div key={name} className="grid gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[0.7fr_0.7fr_1fr_1.4fr_0.7fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 md:hidden">Tier</p>
                <p className="font-black text-slate-950">{name}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 md:hidden">Price</p>
                <p className="font-bold text-[#1D72B8]">{price}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 md:hidden">Best For</p>
                <p className="font-semibold text-slate-700">{audience}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 md:hidden">Company Value</p>
                <p className="font-semibold leading-6 text-slate-600">{description}</p>
              </div>

              <div>
                {planCode ? (
                  <button
                    type="button"
                    onClick={() => startCheckout(planCode)}
                    className="rounded-xl bg-[#1D72B8] px-3 py-2 text-xs font-black text-white hover:bg-[#155A93]"
                  >
                    Upgrade
                  </button>
                ) : (
                  <Link href="/register" className="text-xs font-black text-[#1D72B8] hover:underline">
                    Start Free
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {billingStatus && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            {billingStatus}
          </p>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          See Risk. Prevent Harm.
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Built for organizations that need faster inspections, clearer documentation, stronger accountability, and defensible safety records.
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-2xl bg-[#1D72B8] px-5 py-3 text-sm font-black text-white hover:bg-[#155A93]">
            Start Free
          </Link>
          <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Return to Sign In
          </Link>
        </div>
      </section>
    </section>
  );
}
