"use client";

import Link from "next/link";
import { useState } from "react";
import { createCheckoutSession, getAuthToken } from "@/lib/auth";

const tiers = [
  ["Basic", "Free", "Local inspections, basic reports, evidence notes, limited SafeScope assistance, local-only storage.", null],
  ["Plus", "Individual Pro", "Full SafeScope intelligence, standards suggestions, corrective actions, inspection history, offline save queue.", "plus"],
  ["Company", "Team Workspace", "Shared reports, company branding, assigned actions, analytics, supervisor validation, audit trail, team roles.", "company"],
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
    <section className="mx-auto max-w-5xl space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#1D72B8]">
          About Sentinel Safety
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Practical safety intelligence for people responsible for real risk.
        </h1>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-slate-600">
          Sentinel Safety is being built for safety professionals, supervisors, contractors,
          mines, plants, and companies that need a better way to document hazards, review
          standards, assign corrective actions, and build stronger safety records over time.
        </p>
      </header>

      <section className="grid gap-6 border-b border-slate-200 pb-7 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-2xl font-black text-slate-950">Who we are</h2>
        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            Sentinel Safety is being developed from real-world safety and operational experience.
            The goal is not to replace qualified judgment. The goal is to support it with
            better structure, clearer documentation, and more useful intelligence.
          </p>
          <p>
            Safety work happens in imperfect conditions: limited time, changing operations,
            incomplete information, and pressure to move quickly. Sentinel Safety is designed
            to help users slow the decision down just enough to see the risk clearly.
          </p>
        </div>

        {billingStatus && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            {billingStatus}
          </p>
        )}
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-7 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-2xl font-black text-slate-950">What we do</h2>
        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            Sentinel Safety is being developed to provide structured inspection workflows, evidence capture,
            risk review, standards support, corrective action tracking, and report generation.
          </p>
          <p>
            Inside the platform, SafeScope is being developed as the intelligence engine. It helps classify
            hazards, reason through exposure pathways, identify likely MSHA and OSHA standards,
            suggest corrective actions, and explain why a decision was made.
          </p>
        </div>
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-7 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-2xl font-black text-slate-950">Why we do it</h2>
        <div className="space-y-4 text-sm font-semibold leading-7 text-slate-600">
          <p>
            Too much safety documentation is either scattered, inconsistent, or difficult
            to defend later. Sentinel Safety is being developed to help users create records that
            are clearer, more complete, and more useful for preventing harm.
          </p>
          <p>
            The long-term vision is to continue building a safety intelligence platform that learns from reports,
            identifies trends, supports accountability, and helps organizations act before
            repeated issues become serious incidents.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          SafeScope Intelligence
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Built to support professional judgment.
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          SafeScope is designed to provide decision support only. It does not replace a qualified safety
          professional, competent person, supervisor, legal advisor, or regulatory authority.
          Final safety, compliance, and corrective action decisions remain with the user and
          their organization.
        </p>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Planned Access Tiers
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Simple enough to start. Strong enough to scale.
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[0.7fr_0.8fr_1.5fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
            <div>Tier</div>
            <div>Access</div>
            <div>Designed For</div>
            <div>Action</div>
          </div>

          {tiers.map(([name, price, description, planCode]) => (
            <div key={name} className="grid grid-cols-[0.7fr_0.8fr_1.5fr_0.8fr] gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
              <div className="font-black text-slate-950">{name}</div>
              <div className="font-bold text-[#1D72B8]">{price}</div>
              <div className="font-semibold leading-6 text-slate-600">{description}</div>
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
      </section>

      <section className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-black text-slate-950">The direction</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          Sentinel Safety is actively being developed as a practical safety intelligence platform:
          one that helps serious operations document risk, understand exposure, support
          standards review, and strengthen accountability without adding unnecessary complexity.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-2xl bg-[#1D72B8] px-5 py-3 text-sm font-black text-white hover:bg-[#155A93]">
            Create Account
          </Link>
          <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Return to Sign In
          </Link>
        </div>
      </section>
    </section>
  );
}
