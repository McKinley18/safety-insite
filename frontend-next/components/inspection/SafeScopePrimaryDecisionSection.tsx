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
    "This condition requires review.";

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
    "No primary standard was selected automatically.";

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

  const isDegraded =
    safeScopeResult.degraded ||
    safeScopeResult.fallbackMode ||
    safeScopeResult.offlineFallback ||
    safeScopeResult.fullIntelligenceAvailable === false ||
    safeScopeResult.governance?.degradedMode;

  const degradedReason =
    safeScopeResult.fallbackReason ||
    "Full review was unavailable. Treat this as fallback output requiring qualified review.";

  return (
    <section className="mb-4 rounded-2xl border-l-4 border-l-[#1D72B8] border-y border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:border-sky-500/50 hover:scale-[1.01]">
      {isDegraded && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-black">Limited review</p>
          <p className="mt-1 font-semibold leading-5">{degradedReason}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-wide">
            Do not treat this as a full review. Qualified review is required.
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            Finding Summary
          </p>

          <h3 className="mt-1 text-xl font-black leading-7 text-slate-900 dark:text-slate-100">
            {safeScopeResult.classification || "Review Required"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
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

      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Primary standard
        </p>
        <p className="mt-1 text-base font-black text-[#1D72B8]">
          {topStandardLabel}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
          {standardReason}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Why this was suggested
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            {primaryReason}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Recommended action
          </p>
          <p className="mt-1 text-sm font-black leading-6 text-slate-800 dark:text-slate-200">
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
