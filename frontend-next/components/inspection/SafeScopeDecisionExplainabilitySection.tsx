import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";
import { getHazLenzMechanismChain } from "@/lib/inspection/mechanismReasoning";

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeDecisionExplainabilitySection({
  safeScopeResult,
}: Props) {
  if (!safeScopeResult?.decisionExplainability) {
    return null;
  }

  const mechanismChain = getHazLenzMechanismChain(safeScopeResult);

  return (
    <SafeScopeDrawer
      title="Why This Was Suggested"
      summary="Review the factors behind this suggestion"
      badge={
        safeScopeResult.decisionExplainability.supervisorReviewRecommended
          ? "Qualified Review"
          : undefined
      }
      >
      <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
        {safeScopeResult.decisionExplainability.decisionSummary}
      </p>

      {mechanismChain && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
            Mechanism chain
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-slate-100">Observed condition:</span>{" "}
              {mechanismChain.observedCondition}
            </p>
            <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-slate-100">Failure/release mode:</span>{" "}
              {mechanismChain.failureMode}
            </p>
            <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-slate-100">Exposure pathway:</span>{" "}
              {mechanismChain.exposurePathway}
            </p>
            <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-slate-100">Potential consequence:</span>{" "}
              {mechanismChain.potentialConsequence}
            </p>
          </div>
          {!!mechanismChain.evidenceGaps.length && (
            <div className="mt-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                Evidence to confirm
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
                {mechanismChain.evidenceGaps.slice(0, 4).map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
          {!!mechanismChain.controlFocus.length && (
            <div className="mt-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                Control focus
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
                {mechanismChain.controlFocus.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Confidence
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            {safeScopeResult.decisionExplainability.confidenceStatement}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Risk Basis
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            {safeScopeResult.decisionExplainability.riskStatement}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Standards Basis
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            {safeScopeResult.decisionExplainability.standardsStatement}
          </p>
        </div>
      </div>

      {!!safeScopeResult.decisionExplainability.keyEvidence?.length && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
          {safeScopeResult.decisionExplainability.keyEvidence
            .slice(0, 5)
            .map((item: string) => (
              <li key={item}>{item}</li>
            ))}
        </ul>
      )}
    </SafeScopeDrawer>
  );
}
