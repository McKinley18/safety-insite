"use client";

type SafeScopeHumanAndContradictionProps = {
  safeScopeResult: any;
};

export default function SafeScopeHumanAndContradiction({
  safeScopeResult,
}: SafeScopeHumanAndContradictionProps) {
  return (
    <>
      {safeScopeResult.humanFactors?.humanFactorsPresent && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Human Factors Intelligence
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.humanFactors.humanFactorsSummary}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {[
              ...(safeScopeResult.humanFactors.behaviorRiskSignals || []),
              ...(safeScopeResult.humanFactors.visibilitySignals || []),
              ...(safeScopeResult.humanFactors.lineOfFireSignals || []),
              ...(safeScopeResult.humanFactors.humanFactorSignals || []),
            ]
              .slice(0, 4)
              .map((signal: string) => (
                <li key={signal}>{signal}</li>
              ))}
          </ul>
        </div>
      )}

      {safeScopeResult.contradictionIntelligence?.contradictionsDetected && (
        <div className="mt-4 border-l-4 border-red-300 bg-red-50 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Contradiction Detection
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-red-900">
            {safeScopeResult.contradictionIntelligence.reviewImpact}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-red-900">
            {safeScopeResult.contradictionIntelligence.contradictions
              .slice(0, 3)
              .map((item: string) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}
