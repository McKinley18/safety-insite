import { getHazLenzSuggestedStandards } from "@/lib/hazlenzStandardHelpers";
import { formatStandardDisplay } from "@/lib/inspection/standardDisplay";

type HazLenzFindingSummaryProps = {
  description: string;
  hazardCategory: string;
  safeScopeResult: any;
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
  fallbackText: string;
};

function compactText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function firstText(...values: any[]) {
  for (const value of values) {
    const compact = compactText(value);
    if (compact) return compact;

    if (Array.isArray(value)) {
      const found = value.map(compactText).find(Boolean);
      if (found) return found;
    }
  }

  return "";
}

function shortenReviewLabel(value: unknown) {
  return compactText(value)
    .replace(/^review needed\s*[-—–:]\s*/i, "")
    .replace(/^likely\s+/i, "")
    .replace(/\s+issue$/i, "")
    .replace(/guarding/i, "Guarding")
    .trim();
}


function normalizeConfidencePercent(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const raw =
    typeof value === "string"
      ? Number(value.replace("%", "").trim())
      : Number(value);

  if (!Number.isFinite(raw)) return null;

  const percent = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  return Math.max(0, Math.min(100, percent));
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace("rotating equipment nip point", "rotating equipment / nip point")
    .replace("machine guarding", "machine guarding");
}

function getTopStandard(result: any, selectedStandards: any[]) {
  if (selectedStandards?.[0]) return selectedStandards[0];

  const broadCandidates = getHazLenzSuggestedStandards(result);
  if (broadCandidates[0]) return broadCandidates[0];

  if (result?.suggestedStandards?.[0]) {
    return result.suggestedStandards[0];
  }

  if (result?.inspectionIntelligence?.candidateStandards?.[0]) {
    return result.inspectionIntelligence.candidateStandards[0];
  }

  if (result?.executiveJudgment?.topStandard) {
    return result.executiveJudgment.topStandard;
  }

  return (
    result?.standardsReasoning?.topDefensible?.[0] ||
    result?.applicabilityIntelligence?.primaryApplicableStandards?.[0] ||
    null
  );
}

function actionText(action: any) {
  return firstText(
    action?.text,
    action?.action,
    action?.title,
    action?.description,
    action,
  );
}

function buildSummary({
  description,
  hazardCategory,
  safeScopeResult,
  selectedStandards,
  selectedGeneratedActions,
  manualActions,
  fallbackText,
}: HazLenzFindingSummaryProps) {
  const result = safeScopeResult;

  if (!result) {
    return {
      reviewed: false,
      detectedConcern:
        hazardCategory || fallbackText || "Document the condition, then run HazLenz AI.",
      whyItMatters: "HazLenz AI has not reviewed this finding yet.",
      likelyScope: "Pending",
      standardFamily: "Pending",
      recommendedAction:
        actionText(selectedGeneratedActions?.[0]) ||
        actionText(manualActions?.[0]) ||
        "Add or select a corrective action before final review.",
      evidenceNeeded: [] as string[],
      reviewStatus: "Manual documentation in progress.",
    };
  }

  const understanding = result.observationUnderstanding || {};
  const topScenario = understanding?.scenarioUnderstanding?.topScenario;
  const topStandard = getTopStandard(result, selectedStandards);

  const mechanism = humanize(
    firstText(
      topScenario?.mechanism,
      understanding?.mechanismCandidates?.[0]?.mechanism,
      understanding?.exposure?.exposurePathway,
    ),
  );

  const consequences = Array.isArray(result.commonConsequences)
    ? result.commonConsequences.slice(0, 2).join(" or ")
    : "";

  const detectedConcern = firstText(
    result.decisionExplainability?.decisionSummary,
    result.explanation,
    description,
    result.classification ? `${result.classification} concern identified.` : "",
  );

  const whyItMatters = firstText(
    result.risk?.reasoning,
    result.decisionExplainability?.riskStatement,
    mechanism && consequences
      ? `Exposure to ${mechanism} can result in ${consequences}.`
      : "",
    mechanism ? `Exposure pathway: ${mechanism}.` : "",
    "Review the exposure pathway and controls before relying on the finding.",
  );

  const jurisdiction =
    understanding?.jurisdiction?.detected ||
    result.applicabilityIntelligence?.jurisdiction ||
    "";

  const scopeConfidence = normalizeConfidencePercent(
    understanding?.jurisdiction?.confidence?.score,
  );

  const likelyScope = jurisdiction
    ? `${String(jurisdiction).toUpperCase()}${
        scopeConfidence !== null ? ` · ${scopeConfidence}% confidence` : ""
      }`
    : "Scope not confirmed";

  const standardFamily = result.isVague && (!result.suggestedStandards || result.suggestedStandards.length === 0)
    ? "No specific standard selected yet. HazLenz needs more evidence before suggesting a candidate standard."
    : topStandard
      ? formatStandardDisplay(topStandard)
      : firstText(
          result.standardFamilyCandidates?.[0]?.label
            ? `${result.standardFamilyCandidates[0].label} — review candidate standard`
            : undefined,
          result.standardFamilyCandidates?.[0]?.standardFamily
            ? `${result.standardFamilyCandidates[0].standardFamily} — review candidate standard`
            : undefined,
          result.candidateStandardFamily
            ? `${result.candidateStandardFamily} — review candidate standard`
            : undefined,
          result.classification
            ? `${result.classification} — review candidate standard`
            : undefined,
          "No advisory standard selected yet",
        );

  const recommendedAction = firstText(
    actionText(selectedGeneratedActions?.[0]),
    actionText(result.generatedActions?.[0]),
    actionText(result.correctiveActionReasoning?.immediateActions?.[0]),
    actionText(result.correctiveActionReasoning?.permanentCorrections?.[0]),
    result.requiredControls?.[0]
      ? `Verify ${result.requiredControls[0]} is in place before exposure continues.`
      : "",
    "Select a corrective action before final review.",
  );

  const evidenceNeeded = Array.from(
    new Set(
      [
        ...(result.evidenceGapQuestions || []).map((q: any) => q?.question),
        ...(result.decisionExplainability?.uncertainty || []),
      ]
        .filter(Boolean)
        .map((item: string) => String(item).trim()),
    ),
  ).slice(0, 3);

  const reviewStatus = result.requiresHumanReview
    ? "Requires qualified review before final report."
    : "Ready for qualified review.";

  return {
    reviewed: true,
    detectedConcern,
    whyItMatters,
    likelyScope,
    standardFamily,
    recommendedAction,
    evidenceNeeded,
    reviewStatus,
  };
}

export default function HazLenzFindingSummary(props: HazLenzFindingSummaryProps) {
  const summary = buildSummary(props);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#1D72B8]">
          {summary.reviewed ? "HazLenz AI Finding" : "Finding Summary"}
        </p>
        <p className="mt-1.5 text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">
          {shortenReviewLabel(summary.detectedConcern) || summary.detectedConcern}
        </p>
      </div>

      <div className="grid gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 sm:grid-cols-2">
        <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Why It Matters
          </p>
          <p className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">
            {summary.whyItMatters}
          </p>
        </div>

        <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Likely Scope
          </p>
          <p className="mt-1 truncate text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">{summary.likelyScope}</p>
        </div>

        <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800 sm:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Advisory Standard
          </p>
          <p className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">
            {summary.standardFamily}
          </p>
        </div>

        <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800 sm:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Recommended Action
          </p>
          <p className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">
            {summary.recommendedAction}
          </p>
        </div>
      </div>

      {summary.evidenceNeeded.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-3 py-3 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-800">
          <p className="text-[8px] font-black uppercase tracking-wide text-amber-700">
            Evidence Still Needed
          </p>
          <ul className="mt-2 space-y-1 text-sm font-bold leading-6 text-amber-950 dark:text-amber-100">
            {summary.evidenceNeeded.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-xl bg-blue-50 px-3 py-3 text-xs font-black leading-5 text-blue-900 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-100 dark:ring-blue-800">
        {summary.reviewStatus}
      </p>
    </div>
  );
}
