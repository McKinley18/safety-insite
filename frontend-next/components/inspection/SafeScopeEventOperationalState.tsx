"use client";

type SafeScopeEventOperationalStateProps = {
  safeScopeResult: any;
};

export default function SafeScopeEventOperationalState({
  safeScopeResult,
}: SafeScopeEventOperationalStateProps) {
  return (
    <>
      {safeScopeResult.eventSequence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Event Sequence Intelligence
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Sequence confidence:{" "}
            {safeScopeResult.eventSequence.sequenceConfidence || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.eventSequence.sequenceSummary}
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {(safeScopeResult.eventSequence.likelySequence || []).map(
              (item: string) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ol>
        </div>
      )}

      {safeScopeResult.operationalState && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Operational State
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            {safeScopeResult.operationalState.primaryState?.replaceAll(
              "_",
              " ",
            ) || "unknown"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.operationalState.stateAwarenessSummary}
          </p>
          {!!safeScopeResult.operationalState.stateRisks?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.operationalState.stateRisks
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
