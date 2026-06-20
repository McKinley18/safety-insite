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

  return (
    result?.suggestedStandards?.[0] ||
    result?.standardsReasoning?.topDefensible?.[0] ||
    result?.applicabilityIntelligence?.primaryApplicableStandards?.[0] ||
    result?.standardFamilyCandidates?.[0] ||
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

  const standardFamily = topStandard
    ? formatStandardDisplay(topStandard)
    : firstText(
        result.standardFamilyCandidates?.[0]?.label,
        result.standardFamilyCandidates?.[0]?.standardFamily,
        result.classification,
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
    ? "Needs qualified safety review before final report."
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
    <div className="space-y-2">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#1D72B8]">
          {summary.reviewed ? "HazLenz AI Finding" : "Finding Summary"}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
          {summary.detectedConcern}
        </p>
      </div>

      <div className="grid gap-1.5 text-[10px] font-semibold text-slate-600 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
          <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
            Why It Matters
          </p>
          <p className="mt-0.5 line-clamp-2 text-slate-800">
            {summary.whyItMatters}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
          <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
            Likely Scope
          </p>
          <p className="mt-0.5 truncate text-slate-800">{summary.likelyScope}</p>
        </div>

        <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100 sm:col-span-2">
          <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
            Advisory Standard
          </p>
          <p className="mt-0.5 line-clamp-2 text-slate-800">
            {summary.standardFamily}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100 sm:col-span-2">
          <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
            Recommended Action
          </p>
          <p className="mt-0.5 line-clamp-2 text-slate-800">
            {summary.recommendedAction}
          </p>
        </div>
      </div>

      {summary.evidenceNeeded.length > 0 && (
        <div className="rounded-lg bg-amber-50 px-2 py-1.5 ring-1 ring-amber-100">
          <p className="text-[8px] font-black uppercase tracking-wide text-amber-700">
            Evidence Still Needed
          </p>
          <ul className="mt-1 space-y-0.5 text-[10px] font-semibold leading-4 text-amber-900">
            {summary.evidenceNeeded.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-lg bg-blue-50 px-2 py-1.5 text-[10px] font-black text-blue-800 ring-1 ring-blue-100">
        {summary.reviewStatus}
      </p>
    </div>
  );
}
