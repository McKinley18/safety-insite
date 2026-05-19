"use client";

type SafeScopeCorrelationCounterfactualProps = {
  safeScopeResult: any;
};

export default function SafeScopeCorrelationCounterfactual({
  safeScopeResult,
}: SafeScopeCorrelationCounterfactualProps) {
  return (
    <>
      {safeScopeResult.correlationIntelligence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                Correlation Intelligence
              </p>
              <h4 className="mt-1 text-sm font-black text-slate-900">
                Cascade potential:{" "}
                {safeScopeResult.correlationIntelligence.cascadePotential ||
                  "low"}
              </h4>
            </div>

            {safeScopeResult.correlationIntelligence.escalationRecommended && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                Escalate
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.correlationIntelligence.recommendation}
          </p>
        </div>
      )}

      {safeScopeResult.counterfactualIntelligence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Counterfactual Reasoning
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {
              safeScopeResult.counterfactualIntelligence
                .counterfactualSummary
            }
          </p>

          {!!safeScopeResult.counterfactualIntelligence.counterfactuals
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.counterfactualIntelligence.counterfactuals
                .slice(0, 3)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
