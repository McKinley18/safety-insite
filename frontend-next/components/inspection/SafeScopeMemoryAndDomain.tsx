"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeMemoryAndDomainProps = {
  safeScopeResult: any;
};

export default function SafeScopeMemoryAndDomain({
  safeScopeResult,
}: SafeScopeMemoryAndDomainProps) {
  return (
    <>
      {safeScopeResult.siteMemory && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Site Memory Intelligence
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Degradation risk: {safeScopeResult.siteMemory.degradationRisk || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.siteMemory.siteMemorySummary}
          </p>

          {!!safeScopeResult.siteMemory.operationalPatterns?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.siteMemory.operationalPatterns
                .slice(0, 4)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {safeScopeResult.domainIntelligence && (
        <SafeScopeDrawer
          title="Domain Intelligence"
          summary="Specialized operational domain analysis"
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            HazLenz AI checked specialized safety domains for deeper operational context.
          </p>

          <div className="mt-3 space-y-3">
            {Object.entries(safeScopeResult.domainIntelligence)
              .filter(([, value]: any) => Boolean(value))
              .map(([domain, value]: any) => (
                <div key={domain} className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                    {domain.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                    {value.reasoningSummary || "Domain indicators detected."}
                  </p>

                  {!!value.detectedIndicators?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {value.detectedIndicators
                        .slice(0, 6)
                        .map((indicator: string) => (
                          <span
                            key={indicator}
                            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {indicator}
                          </span>
                        ))}
                    </div>
                  )}

                  {!!value.requiredControls?.length && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">
                      Key controls: {value.requiredControls.slice(0, 4).join(" • ")}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </SafeScopeDrawer>
      )}
    </>
  );
}
