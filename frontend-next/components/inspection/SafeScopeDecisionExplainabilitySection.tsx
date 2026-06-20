import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeDecisionExplainabilitySection({
  safeScopeResult,
}: Props) {
  if (!safeScopeResult?.decisionExplainability) {
    return null;
  }

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
      <p className="text-sm font-semibold leading-6 text-slate-700">
        {safeScopeResult.decisionExplainability.decisionSummary}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Confidence
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.decisionExplainability.confidenceStatement}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Risk Basis
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.decisionExplainability.riskStatement}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Standards Basis
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.decisionExplainability.standardsStatement}
          </p>
        </div>
      </div>

      {!!safeScopeResult.decisionExplainability.keyEvidence?.length && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
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
