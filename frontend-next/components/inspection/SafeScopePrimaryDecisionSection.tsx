type Props = {
  safeScopeResult: any;
};

export default function SafeScopePrimaryDecisionSection({
  safeScopeResult,
}: Props) {
  return (
    <>
      <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Primary Decision
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {(safeScopeResult.risk?.riskBand ||
                safeScopeResult.risk?.operationalRisk?.matrixBand ||
                "Review").toUpperCase()} — {safeScopeResult.classification || "Review Required"}
            </h3>
          </div>

          {(safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
            safeScopeResult.requiresHumanReview) && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
              Supervisor Review
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="border-l-4 border-[#1D72B8] bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Why It Matters
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
              {safeScopeResult.decisionExplainability?.decisionSummary ||
                safeScopeResult.explanation ||
                "SafeScope identified a condition that should be reviewed before finalizing the finding."}
            </p>
          </div>

          <div className="border-l-4 border-amber-400 bg-amber-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
              Recommended Focus
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-amber-900">
              {safeScopeResult.generatedActions?.[0]?.title ||
                safeScopeResult.controlIntelligence?.verificationRecommendation ||
                "Verify controls before closure."}
            </p>
          </div>

          <div className="border-l-4 border-slate-300 bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Top Standard
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
              {safeScopeResult.suggestedStandards?.[0]?.citation || "No standard selected yet"}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              Standards remain optional until final review.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Risk
          </p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {safeScopeResult.risk?.riskBand ||
              safeScopeResult.risk?.operationalRisk?.matrixBand ||
              "Not rated"}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Environment
          </p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {safeScopeResult.expandedContext?.environment || "Not inferred"}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Review Needed
          </p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
            safeScopeResult.requiresHumanReview
              ? "Yes"
              : "No"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Top Concern
            </p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {safeScopeResult.decisionExplainability?.decisionSummary ||
                safeScopeResult.explanation ||
                "SafeScope identified a condition requiring review."}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Recommended Focus
            </p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {safeScopeResult.generatedActions?.[0]?.title ||
                safeScopeResult.controlIntelligence?.verificationRecommendation ||
                "Verify controls before closure."}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Top Standard
            </p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {safeScopeResult.suggestedStandards?.[0]?.citation || "Not selected"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
