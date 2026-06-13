"use client";

import { useEffect, useState } from "react";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { hasAuthToken } from "@/lib/auth";

const sections = [
  {
    title: "General Disclaimer",
    body: "Sentinel Safety is a decision-support platform. It does not replace professional judgment, site-specific safety evaluation, legal advice, regulatory interpretation, or qualified safety oversight.",
  },
  {
    title: "Statistical and Analytical Data",
    body: "Analytics, SPC concepts, RPN scoring, dashboards, and predictive indicators are advisory tools only. Users are responsible for validating all conclusions before making operational decisions.",
  },
  {
    title: "SafeScope AI Content",
    body: "SafeScope-generated classifications, standards suggestions, summaries, and corrective action recommendations must be reviewed and verified by a qualified human professional.",
  },
  {
    title: "Liability and Indemnification",
    body: "Users accept responsibility for how the platform is used and agree that Sentinel Safety and its developers are not liable for damages, citations, injuries, losses, or decisions arising from misuse or unverified outputs.",
  },
  {
    title: "User Responsibility",
    body: "The quality of any output depends on the accuracy, completeness, and context of user-provided information, photos, descriptions, and site details.",
  },
];

export default function LegalPage() {
  const [hasAuthSession, setHasAuthSession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasAuthSession(hasAuthToken());
  }, []);

  return (
    <section>
      <div className="mb-6 border-l-[5px] border-red-800 pl-4">
        <h1 className="mb-2.5 text-[30px] font-black text-slate-900">
          Legal Disclaimer
        </h1>
        <p className="text-[15px] font-black leading-[23px] text-red-800">
          Use of Sentinel Safety is at your own risk. All outputs require professional human verification.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <AppPanel key={section.title} padding="md">
            <h2 className="mb-2 text-[19px] font-black text-slate-900">{section.title}</h2>
            <p className="text-[15px] leading-[23px] text-slate-500">{section.body}</p>
          </AppPanel>
        ))}
      </div>

      {!hasAuthSession && (
        <div className="mt-5 flex justify-center">
          <AppTextLink
            href="/login"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-black !text-[#102A43] shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
          >
            Return to Sign In
          </AppTextLink>
        </div>
      )}
    </section>
  );
}
