"use client";

import { formatStandardDisplay, getStandardCitation, getStandardSummary } from "@/lib/inspection/standardDisplay";

type SafeScopeStandardsReasoningProps = {
  safeScopeResult: any;
};

export default function SafeScopeStandardsReasoning({
  safeScopeResult,
}: SafeScopeStandardsReasoningProps) {
  return (
    <>
      {safeScopeResult.standardsReasoning?.topDefensible?.length && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Adaptive Standards Reasoning
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.standardsReasoning.summary}
          </p>

          <div className="mt-3 space-y-2">
            {safeScopeResult.standardsReasoning.topDefensible
              .slice(0, 3)
              .map((standard: any) => (
                <div
                  key={getStandardCitation(standard) || formatStandardDisplay(standard)}
                  className="rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-900">
                      {formatStandardDisplay(standard)}
                    </p>
                    <span className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                      {Math.round((standard.defensibilityScore || 0) * 100)}%
                      defensible
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    {getStandardSummary(standard) || standard.reasoning || "No reasoning summary available."}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
