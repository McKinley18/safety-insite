import { formatStandardDisplay, getStandardSummary } from "@/lib/inspection/standardDisplay";

type Props = {
  safeScopeResult: any;
};

function formatRiskLabel(value: any) {
  return String(value || "Review").replaceAll("_", " ").toUpperCase();
}

function formatConfidence(value: any) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) return "0%";
  if (number <= 1) return `${Math.round(number * 100)}%`;

  return `${Math.round(number)}%`;
}

function uniqueItems(items: any[]) {
  return Array.from(
    new Set(
      items
        .flat()
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  );
}

export default function SafeScopePrimaryDecisionSection({
  safeScopeResult,
}: Props) {
  const riskLabel =
    safeScopeResult.risk?.riskBand ||
    safeScopeResult.risk?.operationalRisk?.matrixBand ||
    "Review";

  const confidenceLabel = formatConfidence(
    safeScopeResult.confidenceIntelligence?.overallConfidence ??
      safeScopeResult.confidence,
  );

  const reviewNeeded =
    safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
    safeScopeResult.requiresHumanReview;

  const primaryReason =
    safeScopeResult.decisionExplainability?.decisionSummary ||
    safeScopeResult.explanation ||
    "SafeScope identified a condition requiring review.";

  const recommendedAction =
    safeScopeResult.generatedActions?.[0]?.title ||
    safeScopeResult.generatedActions?.[0]?.description ||
    safeScopeResult.controlIntelligence?.verificationRecommendation ||
    "Verify controls before closure.";

  const topStandard = safeScopeResult.suggestedStandards?.[0];

  const topStandardLabel = topStandard
    ? formatStandardDisplay(topStandard)
    : "No standard selected";

  const standardReason =
    getStandardSummary(topStandard) ||
    safeScopeResult.standardsReasoning?.summary ||
    "SafeScope did not identify a primary standard for automatic selection.";

  const confirmationItems = uniqueItems([
    safeScopeResult.knowledgeBrain?.evidenceGaps || [],
    safeScopeResult.confidenceIntelligence?.missingCriticalInformation || [],
    safeScopeResult.evidenceQuality?.gaps || [],
    safeScopeResult.operationalReasoning?.supervisorQuestions || [],
  ]).slice(0, 4);

  const fallbackConfirmationItems = [
    "Confirm the exposed hazard is visible or documented.",
    "Confirm the operating or energy state.",
    "Verify the corrective action removes the exposure.",
  ];

  const itemsToConfirm = confirmationItems.length
    ? confirmationItems
    : fallbackConfirmationItems;

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            SafeScope Decision
          </p>

          <h3 className="mt-1 text-xl font-black leading-7 text-slate-900">
            {safeScopeResult.classification || "Review Required"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-700">
              {formatRiskLabel(riskLabel)}
            </span>

            <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#1D72B8]">
              {confidenceLabel} confidence
            </span>
          </div>
        </div>

        {reviewNeeded && (
          <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-red-700">
            Review
          </span>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
          Primary standard
        </p>
        <p className="mt-1 text-base font-black text-[#1D72B8]">
          {topStandardLabel}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
          {standardReason}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Why SafeScope selected this
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
            {primaryReason}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Recommended action
          </p>
          <p className="mt-1 text-sm font-black leading-6 text-slate-800">
            {recommendedAction}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">
            Confirm before closure
          </p>

          <ul className="mt-2 space-y-1 text-xs font-bold leading-5 text-amber-900">
            {itemsToConfirm.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
