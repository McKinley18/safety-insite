"use client";

import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";

const sections = [
  {
    title: "Proprietary platform",
    body: "Safety InSite reserves rights in its platform, software, source code, workflows, user interface, reports, content, databases, taxonomies, classifications, reasoning systems, generated structures, logos, branding, and related materials to the extent permitted by law.",
  },
  {
    title: "HazLenz AI",
    body: "HazLenz AI is proprietary decision-support intelligence within Safety InSite. It is designed to help organize hazard context, risk signals, evidence gaps, standards support, and corrective action reasoning for qualified review.",
  },
  {
    title: "No affiliation or endorsement",
    body: "All third-party trademarks, trade names, service marks, organization names, product names, and logos are the property of their respective owners. Use of Safety InSite or HazLenz AI does not imply affiliation with, endorsement by, or sponsorship from any other organization using similar names.",
  },
  {
    title: "Professional review required",
    body: "Safety InSite and HazLenz AI do not replace qualified safety professionals, legal counsel, regulatory agencies, site policy, site-specific evaluation, or professional judgment. All outputs must be reviewed and verified by qualified personnel before use.",
  },
  {
    title: "No compliance determination",
    body: "HazLenz AI does not declare violations, create citations, determine legal compliance, issue regulatory interpretations, or override MSHA, OSHA, site or legal requirements.",
  },
  {
    title: "User responsibility",
    body: "Users are responsible for the accuracy and completeness of the information they enter, including photos, descriptions, locations, task context, and site conditions. Final safety, operational, legal, regulatory, and corrective action decisions remain the responsibility of the user and their organization.",
  },
];

export default function LegalPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setIsSignedIn(hasAuthToken());
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-4 sm:px-5 lg:py-7">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#1D72B8]/10 blur-3xl" />

        <div className="relative border-b border-slate-200/80 pb-7 sm:pb-9">
          <h1 className="max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-slate-950 sm:text-5xl">
            Legal disclaimer.
          </h1>

          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Safety InSite is a proprietary field safety inspection and corrective action platform. HazLenz AI is proprietary decision-support intelligence within the platform. Neither replaces qualified professional judgment, legal advice, regulatory interpretation, or site-specific safety review.
          </p>
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

        <div className="border-b border-slate-200/80 py-6">
          <p className="max-w-3xl text-sm font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            Important
          </p>

          <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-slate-700">
            Do not rely on Safety InSite or HazLenz AI as the sole basis for safety, compliance, disciplinary, legal, medical, engineering, emergency-response, or operational decisions.
          </p>
        </div>

        <div className="py-7 text-center sm:py-8">
          <div className="flex flex-wrap justify-center gap-3">
            {isSignedIn ? (
              <AppLinkButton
                href="/command-center"
                className="bg-[#1D72B8] px-6 py-3 text-white shadow-sm hover:bg-[#0B1320]"
              >
                Return to Dashboard
              </AppLinkButton>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
