"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeTrendIntelligenceProps = {
  safeScopeResult: any;
};

export default function SafeScopeTrendIntelligence({
  safeScopeResult,
}: SafeScopeTrendIntelligenceProps) {
  return (
    <>
      {safeScopeResult.trendIntelligence && (
        <SafeScopeDrawer
          title="Trend Intelligence"
          summary={`Recurrence risk: ${
            safeScopeResult.trendIntelligence.recurrenceRisk || "low"
          }`}
          badge={
            safeScopeResult.trendIntelligence.escalationRecommended
              ? "Escalate"
              : undefined
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Trend
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.trendDirection ||
                  "not established"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Hotspot
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.hotspotArea ||
                  "None detected"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Related
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.relatedFindingCount || 0}{" "}
                finding(s)
              </p>
            </div>
          </div>

          {!!safeScopeResult.trendIntelligence.controlFailureIndicators
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.trendIntelligence.controlFailureIndicators
                .slice(0, 3)
                .map((indicator: string) => (
                  <li key={indicator}>{indicator}</li>
                ))}
            </ul>
          )}

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.trendIntelligence.recommendation}
          </p>
        </SafeScopeDrawer>
      )}
    </>
  );
}
