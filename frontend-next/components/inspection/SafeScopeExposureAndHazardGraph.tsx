"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeExposureAndHazardGraphProps = {
  safeScopeResult: any;
};

export default function SafeScopeExposureAndHazardGraph({
  safeScopeResult,
}: SafeScopeExposureAndHazardGraphProps) {
  return (
    <>
      {safeScopeResult.exposurePathIntelligence && (
        <SafeScopeDrawer
          title="Exposure Path Intelligence"
          summary={`Exposure complexity: ${
            safeScopeResult.exposurePathIntelligence.exposureComplexity || "low"
          }`}
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.exposurePathIntelligence.exposureSummary}
          </p>

          {!!safeScopeResult.exposurePathIntelligence.exposurePathways
            ?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safeScopeResult.exposurePathIntelligence.exposurePathways.map(
                (pathway: string) => (
                  <span
                    key={pathway}
                    className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                  >
                    {pathway}
                  </span>
                ),
              )}
            </div>
          )}

          {!!safeScopeResult.exposurePathIntelligence.exposureAmplifiers
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.exposurePathIntelligence.exposureAmplifiers
                .slice(0, 3)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </SafeScopeDrawer>
      )}

      {safeScopeResult.hazardGraph && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Hazard Relationship Graph
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Graph complexity: {safeScopeResult.hazardGraph.graphComplexity || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.hazardGraph.graphSummary}
          </p>

          {!!safeScopeResult.hazardGraph.nodes?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safeScopeResult.hazardGraph.nodes
                .slice(0, 8)
                .map((node: string) => (
                  <span
                    key={node}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                  >
                    {node.replaceAll("_", " ")}
                  </span>
                ))}
            </div>
          )}

          {!!safeScopeResult.hazardGraph.cascadeRisks?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.hazardGraph.cascadeRisks
                .slice(0, 3)
                .map((risk: string) => (
                  <li key={risk}>{risk}</li>
                ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
