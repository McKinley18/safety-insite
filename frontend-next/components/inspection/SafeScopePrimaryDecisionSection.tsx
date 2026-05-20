type Props = {
  safeScopeResult: any;
};

export default function SafeScopePrimaryDecisionSection({
  safeScopeResult,
}: Props) {
  const riskLabel =
    safeScopeResult.risk?.riskBand ||
    safeScopeResult.risk?.operationalRisk?.matrixBand ||
    "Review";

  const reviewNeeded =
    safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
    safeScopeResult.requiresHumanReview;

  const primaryReason =
    safeScopeResult.decisionExplainability?.decisionSummary ||
    safeScopeResult.explanation ||
    "SafeScope identified a condition requiring review.";

  const recommendedFocus =
    safeScopeResult.generatedActions?.[0]?.title ||
    safeScopeResult.controlIntelligence?.verificationRecommendation ||
    "Verify controls before closure.";

  const topStandard =
    safeScopeResult.suggestedStandards?.[0]?.citation || "No standard selected";

  return (
    <section className="mb-4 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            SafeScope Result
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-900">
            {safeScopeResult.classification || "Review Required"}
          </h3>
          <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">
            Risk: {String(riskLabel).toUpperCase()}
          </p>
        </div>

        {reviewNeeded && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
            Supervisor Review
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Why it matters
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
            {primaryReason}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Recommended focus
            </p>
            <p className="mt-1 text-sm font-black leading-6 text-slate-800">
              {recommendedFocus}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Top standard
            </p>
            <p className="mt-1 text-sm font-black leading-6 text-slate-800">
              {topStandard}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
