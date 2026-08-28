"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPersistedObservation,
  analyzeObservation,
  createPersistedCorrectiveAction,
  createPersistedTask,
  createUserAuthoredFinding,
  getCompletionReadiness,
  finalizePersistedFinding,
  generatePersistedReport,
  getPersistedInspection,
  saveAnalysisSnapshot,
  saveHumanReview,
  transitionPersistedInspection,
  updatePersistedInspectionRegulatoryContext,
  updatePersistedObservation,
  uploadInspectionEvidence,
  REGULATORY_CONTEXT_OPTIONS,
  regulatoryContextLabel,
  type PersistedInspection,
  type PersistedFinding,
  type HazLenzAnalysisResult,
  type HazLenzEvidenceFact,
  type RegulatoryContext,
  type CompletionReadiness,
  type InspectionReportSummary,
} from "@/lib/canonicalWorkflowApi";
import { StandardCitationHeading } from "@/components/inspection/SafeScopeStandardsSection";
import RiskReviewSection from "@/components/inspection/RiskReviewSection";
import { getStandardBackingPresentation } from "@/lib/inspection/standardDisplay";
import { getInspectionRiskScale } from "@/lib/inspection/inspectionPageHelpers";
import { RISK_BAND_DUE_DAYS, governedDueDate, riskBandForScore, type RiskBandLabel } from "@/lib/inspection/riskBands";
import { likelihoodScale, severityScale } from "@/lib/inspection/inspectionConstants";
import { getRegulatorySection, type RegulatorySectionRecord } from "@/lib/canonicalWorkflowApi";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { getStoredPlanCode, getVerifiedPlanCode, hasPlanEntitlement, type BillingTier } from "@/lib/planEntitlements";

/**
 * The five customer-facing steps of one finding, plus the inspection-level finalize page.
 *
 *   capture  — photo, location, task, description
 *   hazlenz  — applicable standards, confidence (expandable into the questions that raise it),
 *              and the option to revise the observation and reanalyze
 *   risk     — risk matrix, and the HazLenz-suggested corrective actions, which the reviewer may
 *              extend or replace with their own
 *   review   — read back the finding that has been assembled, then save it
 *   finalize — every finding in the inspection as a card: edit, remove, review, generate report
 *
 * Saving a finding returns straight to `capture` for the next one -- there is no interstitial
 * between findings, because the real job is walking a site recording several in a row.
 */
type Step = "capture" | "candidates" | "hazlenz" | "risk" | "review" | "finalize";

const STEP_ORDER: Step[] = ["capture", "hazlenz", "risk", "review", "finalize"];

// Short forms, sized for a five-across progress bar on a 320px screen. Named for the customer's
// task rather than for the internal state machine.
const STEP_LABELS: Record<Step, string> = {
  // "What you saw" truncated to "What You S..." at a 390px viewport; these all survive ~70px.
  capture: "Record it",
  // The candidate confirmation is part of reading HazLenz's result, not a sixth stage of the
  // inspection, so it shares the HazLenz position in the bar rather than lengthening it.
  candidates: "HazLenz",
  hazlenz: "HazLenz",
  risk: "Risk & fix",
  review: "Review",
  finalize: "Finish",
};

/**
 * True when the server refused an action because the account's plan does not
 * include it. `apiJson` collapses the response to `new Error(body.message)`, so
 * the entitlement guard's message is the only signal that survives to the UI.
 */
function isEntitlementRefusal(error: unknown) {
  return (
    error instanceof Error &&
    /paid subscription is required/i.test(error.message)
  );
}

function selectedInspectionId() {
  try {
    const value = JSON.parse(
      window.localStorage.getItem("sentinel_selected_inspection_context") || "{}",
    );
    return typeof value.persistedInspectionId === "string"
      ? value.persistedInspectionId
      : "";
  } catch {
    return "";
  }
}

const INSPECTION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  completed: "Completed",
};

function humanizeInspectionStatus(status: string) {
  return INSPECTION_STATUS_LABELS[status] || status;
}

const FINDING_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  finalized: "Finalized",
  dismissed: "Dismissed",
  superseded: "Superseded",
};

function humanizeFindingStatus(status: string) {
  return FINDING_STATUS_LABELS[status] || status;
}

// `hazardKey`/`segmentKey` are internal identifiers the finding table is keyed on
// ("egress", "mobile_equipment", "powered_industrial_trucks"). They were being rendered
// directly as the customer-visible finding title. Prefer the human-readable values the
// engine already produces -- hazardCategory, then the conclusion/mechanism sentence -- and
// only ever fall back to a de-slugged key.
function humanizeHazardKey(key: string) {
  const words = String(key || "").replace(/[_-]+/g, " ").trim();
  if (!words) return "Safety observation";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function findingDisplayTitle(finding: { hazardCategory?: string | null; conclusion?: string | null; hazardKey: string }) {
  const category = (finding.hazardCategory || "").trim();
  if (category && !/^[a-z0-9_-]+$/.test(category)) return category;
  const conclusion = (finding.conclusion || "").trim();
  if (conclusion && conclusion.length <= 120 && !/^[a-z0-9_-]+$/.test(conclusion)) return conclusion;
  return humanizeHazardKey(category || finding.hazardKey);
}

function materialQuestionReason(question: unknown) {
  if (!question || typeof question !== "object" || !("reason" in question)) return "";
  const reason = (question as { reason?: unknown }).reason;
  return typeof reason === "string" ? reason : "";
}

function candidateKey(candidate: { citation: string; family: string }) {
  return `${candidate.family}-${candidate.citation}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

// Matches the backend's InspectionService.stableHazardKey() slugification (single
// field, no citation) so a candidate's `family` can be compared against a durable
// finding's `hazardKey` -- candidateKey() above is a DIFFERENT compound
// family+citation slug used only for segment-selection bookkeeping.
function familySlug(family: string) {
  return String(family || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

type FindingStandardView = {
  citation: string;
  title: string;
  applicability: "direct" | "candidate";
  whyOffered: string;
  simplifiedRequirement: string;
  confidenceLabel: string;
  confidenceLimitReason?: string | null;
  evidenceMissing: string[];
  jurisdictionProvenance?: "USER_CONFIRMED" | "HAZLENZ_INFERRED" | "UNKNOWN";
  /** KG-3C canonical backing status. The ONLY basis for claiming verified regulatory backing. */
  backingStatus?: "APPROVED_GOVERNED_CONTENT" | "UNAPPROVED_CONTENT" | "CITATION_ONLY";
  source: "finding-scoped" | "observation-primary";
} | null;

type PersistedStandardCandidate = {
  citation: string;
  family: string;
  status: string;
  confidence: number;
  applicability: "direct" | "candidate" | "excluded";
  explanation: string;
  missingPredicates: string[];
  jurisdictionProvenance?: "USER_CONFIRMED" | "HAZLENZ_INFERRED" | "UNKNOWN";
  /** Corpus-backed fields (present when standards_master has a row for the citation). */
  title?: string;
  plainLanguageSummary?: string;
  /** KG-3C canonical backing status; `corpusBacked` is derived from it, never from `sourceKey`. */
  backingStatus?: "APPROVED_GOVERNED_CONTENT" | "UNAPPROVED_CONTENT" | "CITATION_ONLY";
  corpusBacked?: boolean;
};

function candidateConfidenceLabel(confidence: number, applicability: string) {
  if (applicability !== "direct") return "Low";
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.6) return "Moderate";
  return "Low";
}

// PRA-006 identity fix: `analysis` is one HazLenz result shared by every hazard
// decomposed from the same observation, but `primaryStandard` only ever describes
// the ONE hazard that was primary when this observation was first analyzed
// (multiHazardDecomposition.primaryHazard). `findingCandidates`/`additionalStandards`
// are not populated per sibling hazard by this pipeline -- a sibling finding has no
// standard computed yet until its own review runs. Once more than one finding exists
// for this observation, showing `primaryStandard` unconditionally means switching the
// selected finding can leave the standard panel displaying a sibling finding's
// citation/rationale. Only show `primaryStandard` when the selected finding IS the
// hazard it was computed for; otherwise show nothing rather than a mismatched
// sibling's content.
function resolveSelectedFindingStandard(
  analysis: HazLenzAnalysisResult | null,
  findings: { id: string; hazardKey: string; status: string; sourceCandidate?: Record<string, unknown> | null }[],
  selectedFindingId: string,
): FindingStandardView {
  const primaryRaw = analysis?.guidedFinding?.primaryStandard || null;
  const primary: FindingStandardView = primaryRaw ? { ...primaryRaw, source: "observation-primary" } : null;
  const observationFindings = findings.filter((finding) => finding.status !== "superseded");
  const selectedFinding = observationFindings.find((finding) => finding.id === selectedFindingId);

  // Standards are finding-scoped: each persisted finding carries its OWN candidates, computed
  // from that finding's own evidence fragment under the inspection's regulatory context
  // (inspection_findings.sourceCandidate.standardCandidates). Those are authoritative for the
  // Standard Detail panel whenever the selected finding has them -- never a sibling finding's
  // standard, and never the whole-observation primary when the finding's own evaluation ran.
  const ownCandidates = Array.isArray(selectedFinding?.sourceCandidate?.standardCandidates)
    ? (selectedFinding!.sourceCandidate!.standardCandidates as PersistedStandardCandidate[])
    : null;
  if (ownCandidates) {
    const best = ownCandidates.find((candidate) => candidate.applicability === "direct")
      || ownCandidates.find((candidate) => candidate.applicability === "candidate");
    if (best) {
      const sameAsPrimary = primaryRaw && primaryRaw.citation === best.citation;
      return {
        citation: best.citation,
        // Corpus-backed title/summary when standards_master has the row; otherwise the rule family
        // (and, for the observation's primary, whatever the guided response resolved).
        title: best.title || (sameAsPrimary ? primaryRaw!.title : best.family),
        applicability: best.applicability === "direct" ? "direct" : "candidate",
        whyOffered: best.explanation,
        simplifiedRequirement: best.plainLanguageSummary || (sameAsPrimary ? primaryRaw!.simplifiedRequirement : ""),
        confidenceLabel: candidateConfidenceLabel(best.confidence, best.applicability),
        confidenceLimitReason: sameAsPrimary ? primaryRaw!.confidenceLimitReason : null,
        evidenceMissing: best.missingPredicates || [],
        jurisdictionProvenance: best.jurisdictionProvenance,
        // KG-3C: carried from the finding's OWN persisted candidate, so the panel describes the
        // backing of the record it is actually rendering rather than the observation primary's.
        backingStatus: best.backingStatus,
        source: "finding-scoped",
      };
    }
    // The finding's own evaluation ran and found nothing. For a multi-finding observation that
    // is the honest answer (the primary belongs to whichever hazard was primary). For a
    // single-finding observation the whole-observation primary is that finding's standard.
    if (observationFindings.length > 1) return null;
  }
  if (observationFindings.length <= 1 || !selectedFindingId) return primary;
  if (!selectedFinding) return primary;

  const decomposition = analysis?.multiHazardDecomposition as { primaryHazard?: { domainId?: string; hazardFamily?: string } } | undefined;
  const primaryDomainId = decomposition?.primaryHazard?.domainId || decomposition?.primaryHazard?.hazardFamily || "";
  if (primary && primaryDomainId && familySlug(primaryDomainId) === selectedFinding.hazardKey) {
    return primary;
  }

  const candidates = analysis?.guidedFinding?.findingCandidates || [];
  const matchedCandidate = candidates.find((candidate) => familySlug(candidate.family) === selectedFinding.hazardKey);
  if (!matchedCandidate) return null;

  if (primary && primary.citation === matchedCandidate.citation) return primary;

  const additional = analysis?.guidedFinding?.additionalStandards || [];
  const matchedAdditional = additional.find((standard) => standard.citation === matchedCandidate.citation);
  if (!matchedAdditional) return null;

  return {
    citation: matchedAdditional.citation,
    title: matchedAdditional.title,
    applicability: matchedAdditional.applicability,
    whyOffered: matchedAdditional.whyOffered,
    simplifiedRequirement: "",
    confidenceLabel: "Not established",
    confidenceLimitReason: null,
    evidenceMissing: matchedAdditional.evidenceMissing,
    source: "observation-primary",
  };
}

// V5-C01: converts a finding's persisted, independently-computed riskSnapshot
// (severity/likelihood are numeric 1-5 on the selected risk profile; riskBand is a
// label) into the string-label shape this workspace's risk step already uses. Falls
// back to "Not established" defaults when a finding has no risk yet (e.g. HazLenz
// found insufficient evidence for that specific hazard) rather than fabricating one.
function riskSnapshotToReviewerRisk(riskSnapshot: Record<string, unknown> | null | undefined) {
  const fallback = { severity: "Not established", likelihood: "Not established", exposure: "Not established", overallRisk: "Not established", rationale: "No finding-specific risk has been computed yet." };
  if (!riskSnapshot) return fallback;
  const operational = (riskSnapshot.operationalRisk as Record<string, unknown>) || {};
  const numericToSeverity = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "Not established";
    if (n >= 4) return "Serious";
    if (n >= 3) return "Moderate";
    return "Minor";
  };
  const numericToLikelihood = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "Not established";
    if (n >= 4) return "Likely";
    if (n >= 3) return "Possible";
    return "Unlikely";
  };
  const overallRisk = String(riskSnapshot.riskBand || "Not established");
  const reasoning = Array.isArray(riskSnapshot.reasoning) ? (riskSnapshot.reasoning as string[]) : [];
  return {
    severity: numericToSeverity(operational.severity),
    likelihood: numericToLikelihood(operational.likelihood),
    exposure: overallRisk === "Not established" ? "Not established" : "Potential",
    overallRisk,
    rationale: reasoning[0] || `This finding's own evidence supports a ${overallRisk.toLowerCase()} advisory risk level.`,
  };
}

function decompositionHazards(analysis: HazLenzAnalysisResult | null): string[] {
  const value = analysis?.multiHazardDecomposition;
  if (!value || typeof value !== "object") return [];
  const hazards = (value as { hazards?: unknown }).hazards;
  if (!Array.isArray(hazards)) return [];
  return hazards.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

type ActionDraft = { immediateAction: string; permanentCorrection: string; verificationStep: string };

// The finding's OWN HazLenz corrective-action intelligence (persisted on riskSnapshot by
// InspectionService.computeFindingCorrectiveAction from that finding's own evidence, risk and
// standards). Used for families without a hand-written mapping below so a hazcom or egress finding
// never inherits a sibling's electrical/LOTO action text.
function findingScopedActionDraft(finding: { riskSnapshot?: Record<string, unknown> | null }): ActionDraft | null {
  const intelligence = (finding.riskSnapshot as { correctiveActionIntelligence?: Record<string, unknown> } | null | undefined)?.correctiveActionIntelligence;
  if (!intelligence || typeof intelligence !== "object") return null;
  const first = (key: string) => {
    const list = (intelligence as Record<string, unknown>)[key];
    const item = Array.isArray(list) ? (list[0] as { rationale?: string; title?: string; description?: string } | undefined) : undefined;
    return String(item?.rationale || item?.description || item?.title || "").trim();
  };
  const immediateAction = first("immediateActions");
  const permanentCorrection = first("preventionActions") || first("permanentActions");
  const verificationStep = first("verificationActions");
  if (!immediateAction && !permanentCorrection && !verificationStep) return null;
  return { immediateAction, permanentCorrection, verificationStep };
}

function safeActionDraftForFinding(finding: { hazardCategory: string | null; hazardKey: string; conclusion: string; riskSnapshot?: Record<string, unknown> | null }, fallback: ActionDraft) {
  const family = `${finding.hazardCategory || ""} ${finding.hazardKey}`.toLowerCase();
  if (family.includes("electrical") || family.includes("electric")) return {
    immediateAction: "Place the affected electrical equipment in a safe state and restrict access pending qualified electrical verification.",
    permanentCorrection: "Repair or replace the electrical component with appropriately rated equipment and verify the installation.",
    verificationStep: "Have a qualified person document the electrical inspection before returning the equipment to service.",
  };
  if (family.includes("fall")) return {
    immediateAction: "Restrict access to the elevated exposure and stop the task until compliant fall protection is verified.",
    permanentCorrection: "Provide and maintain a compliant guardrail, personal fall-arrest system, or other approved fall control for the work area.",
    verificationStep: "Verify the fall-control system and access route before resuming work.",
  };
  if (family.includes("loto") || family.includes("lockout") || family.includes("tagout") || family.includes("energy")) return {
    immediateAction: "Stop servicing and control hazardous energy before anyone enters the danger zone.",
    permanentCorrection: "Implement the applicable energy-control procedure with isolation, lockout, release of stored energy, and verification.",
    verificationStep: "Document zero-energy verification before returning the equipment to service.",
  };
  if (family.includes("guard")) return {
    immediateAction: "Keep the equipment out of service and restrict access to the point of operation.",
    permanentCorrection: "Install or restore guarding that prevents access to the moving hazard during operation and foreseeable tasks.",
    verificationStep: "Test the guard and document that access to the moving hazard is prevented.",
  };
  if (family.includes("hot_work")) return {
    immediateAction: "Pause hot work until fire-prevention controls, combustible separation, and fire watch are verified.",
    permanentCorrection: "Implement the applicable hot-work permit, fire prevention, and post-work monitoring controls.",
    verificationStep: "Verify hot-work controls and fire-watch records before resuming the operation.",
  };
  if (family.includes("gas")) return {
    immediateAction: "Secure the work area and verify cylinder condition and handling controls before continuing; do not assume a leak.",
    permanentCorrection: "Provide compliant cylinder securing, separation, valve protection, and storage/handling controls for the observed equipment.",
    verificationStep: "Have a competent person verify cylinder condition and controls before use.",
  };
  // No hand-written mapping for this family: prefer the finding's own finding-scoped HazLenz
  // action over the shared (sibling-derived) draft.
  return findingScopedActionDraft(finding) || fallback;
}

/**
 * EVERY standard candidate the engine attached to this finding, not only the strongest one.
 *
 * `resolveSelectedFindingStandard` above answers "which single standard heads this finding" and is
 * kept unchanged, because the finalization path and the Standard Detail panel both depend on its
 * exact selection rules. The HazLenz step needs the whole list: where several standards genuinely
 * apply, all of them are shown, ordered direct-before-candidate and then by descending confidence.
 * Excluded candidates are dropped -- the engine has already decided they do not apply.
 */
function resolveFindingStandards(
  finding: { sourceCandidate?: Record<string, unknown> | null } | null | undefined,
): PersistedStandardCandidate[] {
  const raw = finding?.sourceCandidate?.standardCandidates;
  if (!Array.isArray(raw)) return [];
  return (raw as PersistedStandardCandidate[])
    .filter((candidate) => candidate && candidate.citation && candidate.applicability !== "excluded")
    .sort((a, b) => {
      if (a.applicability !== b.applicability) return a.applicability === "direct" ? -1 : 1;
      return (b.confidence || 0) - (a.confidence || 0);
    });
}

/** A corrective action the reviewer has accepted for the finding, whatever its origin. */
type ReviewerAction = {
  id: string;
  title: string;
  detail: string;
  origin: "hazlenz" | "user";
  /** HazLenz's own bucket, kept so the saved action can say which part of the fix it is. */
  kind: "immediate" | "prevention" | "verification";
  selected: boolean;
};

const ACTION_KIND_LABELS: Record<ReviewerAction["kind"], string> = {
  immediate: "Immediate protective action",
  prevention: "Permanent correction",
  verification: "Verification step",
};

/**
 * Neutral guidance for the manual corrective-action editor. Prompts about the SHAPE of the answer,
 * never a suggested answer: pre-filling substantive text would be pseudo-HazLenz content attached
 * to a hazard HazLenz never assessed.
 */
const ACTION_KIND_PLACEHOLDERS: Record<ReviewerAction["kind"], string> = {
  immediate: "What was done, or must be done now, to control the exposure",
  prevention: "What will stop this recurring",
  verification: "How completion will be confirmed, and by whom",
};

const ACTION_KIND_ORDER: ReviewerAction["kind"][] = ["immediate", "prevention", "verification"];

/**
 * Three empty, editable slots -- one per domain field of the existing action model.
 *
 * Used when there is nothing to suggest, so the inspector meets a usable editor rather than an
 * empty panel explaining what HazLenz did not do. Unselected until something is typed, so a slot
 * left blank is never saved as an action.
 */
function blankManualActions(): ReviewerAction[] {
  return ACTION_KIND_ORDER.map((kind) => ({
    id: `manual-${kind}`,
    title: ACTION_KIND_LABELS[kind],
    detail: "",
    origin: "user",
    kind,
    selected: false,
  }));
}

/**
 * The finding's own HazLenz corrective-action intelligence, flattened into selectable items.
 * Reads `riskSnapshot.correctiveActionIntelligence`, which the backend computes per finding from
 * that finding's own evidence, risk and standards -- so a guarding finding never inherits an
 * electrical finding's action text.
 */
function suggestedActionsForFinding(
  finding: { riskSnapshot?: Record<string, unknown> | null } | null | undefined,
): ReviewerAction[] {
  const intelligence = (finding?.riskSnapshot as { correctiveActionIntelligence?: Record<string, unknown> } | null | undefined)
    ?.correctiveActionIntelligence;
  if (!intelligence || typeof intelligence !== "object") return [];
  const buckets: Array<{ key: string; kind: ReviewerAction["kind"] }> = [
    { key: "immediateActions", kind: "immediate" },
    { key: "preventionActions", kind: "prevention" },
    { key: "verificationActions", kind: "verification" },
  ];
  const actions: ReviewerAction[] = [];
  for (const bucket of buckets) {
    const list = (intelligence as Record<string, unknown>)[bucket.key];
    if (!Array.isArray(list)) continue;
    list.forEach((item, index) => {
      const entry = item as { title?: string; rationale?: string; description?: string; verificationRequired?: string };
      const title = String(entry?.title || "").trim();
      const detail = String(entry?.rationale || entry?.description || "").trim();
      if (!title && !detail) return;
      actions.push({
        id: `${bucket.key}-${index}`,
        title: title || ACTION_KIND_LABELS[bucket.kind],
        detail,
        origin: "hazlenz",
        kind: bucket.kind,
        // The immediate action is pre-selected because it is the one the risk band demands; the
        // rest are offered. Nothing is saved until the reviewer confirms on the review step.
        selected: bucket.kind === "immediate",
      });
    });
  }
  return actions;
}

/**
 * Collapses the reviewer's accepted actions into the three fields the save path already persists.
 *
 * A manual slot's `title` IS its kind label, so prefixing it produced "Immediate protective action:
 * Immediate protective action: ..." once the Finish screen added its own "Immediate:" label. Only a
 * HazLenz action carries a title that says something the kind label does not, so only that is kept.
 */
function actionDraftFromReviewerActions(actions: ReviewerAction[]) {
  const pick = (kind: ReviewerAction["kind"]) =>
    actions
      .filter((action) => action.selected && action.kind === kind)
      .map((action) => {
        const titleAddsMeaning = action.title && action.title !== ACTION_KIND_LABELS[action.kind];
        if (!action.detail) return action.title;
        return titleAddsMeaning ? `${action.title}: ${action.detail}` : action.detail;
      })
      .join(" ");
  return {
    immediateAction: pick("immediate"),
    permanentCorrection: pick("prevention"),
    verificationStep: pick("verification"),
  };
}

// The band shown here and the band saved on the finding must be the same number. Both come from
// the ONE shared table in lib/inspection/riskBands.ts, which mirrors risk-profiles.ts and is held
// to it by `npm run check:risk-band-parity`. See that module for the defect this replaced.
const RISK_BAND_FOR_SCORE = (score: number, maxScore: number) => riskBandForScore(score, maxScore);

export default function InspectionWorkspacePage() {
  const router = useRouter();
  const [inspection, setInspection] = useState<PersistedInspection | null>(null);
  const [observation, setObservation] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [workActivity, setWorkActivity] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceObjectId, setEvidenceObjectId] = useState("");
  const [analysis, setAnalysis] = useState<HazLenzAnalysisResult | null>(null);
  const [reviewFacts, setReviewFacts] = useState<HazLenzEvidenceFact[]>([]);
  // reanalyze() only sends ONE round's clarification answer at a time (the button just clicked),
  // never the full answer history. The backend's per-finding standards evaluation is re-derived from
  // scratch on every round from the current request alone, so an earlier round's answer (e.g.
  // confirming jurisdiction) would otherwise be forgotten the moment the next question is answered --
  // the "Essential clarification" panel would keep re-asking a question the user already answered.
  // Accumulating and resending every answered question every round keeps each round's re-evaluation
  // complete rather than a snapshot of only the single latest click.
  const [clarificationAnswerHistory, setClarificationAnswerHistory] = useState<
    Array<{ questionId: string; answer: string }>
  >([]);
  const [observationId, setObservationId] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const analysisRequestVersion = useRef(0);
  const [findingIds, setFindingIds] = useState<string[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string>("");
  const [selectedSegmentKeys, setSelectedSegmentKeys] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("capture");
  // "additional" means the capture step is collecting a SECOND (or later) observation for an
  // inspection that already has findings. The data model already supports this -- an inspection
  // owns many observations, each owning its own findings, and supersession is scoped to a single
  // observationId -- so an added observation can never disturb findings captured earlier. Before
  // this flag the capture step was reachable only as the very first thing an inspection did, so
  // the only way to record a newly noticed hazard was to rewrite the original observation, which
  // supersedes that observation's findings. See BASELINE/FINAL_REPORT for the audit.
  const [captureMode, setCaptureMode] = useState<"initial" | "additional">("initial");
  const [planCode, setPlanCode] = useState<BillingTier>(() => getStoredPlanCode() as BillingTier);
  // Set when HazLenz analysis is refused for entitlement reasons (HTTP 402). The
  // observation itself is already persisted at that point, so this is a paywall,
  // not a lost capture -- and it needs to say so.
  const [analysisLocked, setAnalysisLocked] = useState(false);
  const [status, setStatus] = useState("Loading server-saved inspection…");
  const [busy, setBusy] = useState(false);
  const [staleAnalysis, setStaleAnalysis] = useState(false);
  const [editingObservation, setEditingObservation] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [report, setReport] = useState<InspectionReportSummary | null>(null);
  const [reviewerRisk, setReviewerRisk] = useState({
    severity: "Not established",
    likelihood: "Not established",
    exposure: "Not established",
    overallRisk: "Not established",
    rationale: "",
  });
  const [reviewerRiskReason, setReviewerRiskReason] = useState("");
  const [riskPolicy, setRiskPolicy] = useState<{
    modelVersion: string;
    priority: "low" | "medium" | "high" | "urgent";
    dueDays: number;
    closeoutEvidenceRequired: boolean;
  } | null>(null);
  const [proposedRisk, setProposedRisk] = useState({
    severity: "Not established",
    likelihood: "Not established",
    exposure: "Not established",
    overallRisk: "Not established",
  });
  const [actionDraft, setActionDraft] = useState({
    immediateAction: "",
    permanentCorrection: "",
    verificationStep: "",
  });

  // --- Risk matrix (step 3). The reviewer picks ONE cell; severity x likelihood is the score,
  // and the band derived from it drives the reviewer-confirmed risk saved on the finding.
  const riskScale = getInspectionRiskScale({ riskProfileId: "standard_5x5", severityScale, likelihoodScale });
  const [severity, setSeverity] = useState<number | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);

  // --- Corrective actions (step 3). HazLenz's own per-finding suggestions, plus anything the
  // reviewer adds. Nothing here is persisted until the finding is saved on the review step.
  const [reviewerActions, setReviewerActions] = useState<ReviewerAction[]>([]);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDetail, setNewActionDetail] = useState("");
  const [newActionKind, setNewActionKind] = useState<ReviewerAction["kind"]>("immediate");

  /**
   * The person accountable for completing the corrective action, as the customer typed it.
   *
   * Descriptive report metadata, not an assignment system: it does not select an account, grant
   * anything, or notify anyone. Blank means UNASSIGNED and stays that way -- the inspector is never
   * silently written in, because inspecting a hazard and being responsible for fixing it are
   * different roles. Persisted as `corrective_actions.assignedToName`, which already exists.
   */
  const [responsiblePerson, setResponsiblePerson] = useState("");

  /**
   * Brief non-blocking confirmation that a finding was saved. Deliberately not a modal and not a
   * screen: it acknowledges the save and gets out of the way so the next condition can be recorded.
   */
  /**
   * The server's completion contract, refreshed whenever the Finish screen is shown or the finding
   * set changes. It is the ONLY basis for enabling the Finish action -- there is no second frontend
   * rule about what counts as finishable.
   */
  const [readiness, setReadiness] = useState<CompletionReadiness | null>(null);

  const [savedFlash, setSavedFlash] = useState("");
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Refresh the server's completion answer. Called on entering Finish and after any change that
   * could alter it, so readiness updates in place without a reload.
   */
  const refreshReadiness = useCallback(async (inspectionId: string) => {
    try {
      setReadiness(await getCompletionReadiness(inspectionId));
    } catch {
      // A readiness lookup that fails must not present the inspection as finishable.
      setReadiness(null);
    }
  }, []);

  useEffect(() => {
    if (step === "finalize" && inspection?.id) void refreshReadiness(inspection.id);
  }, [step, inspection?.id, inspection?.findings, refreshReadiness]);

  function flashSaved(message = "Finding saved") {
    if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
    setSavedFlash(message);
    savedFlashTimer.current = setTimeout(() => setSavedFlash(""), 4000);
  }

  useEffect(() => () => {
    if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
  }, []);

  // --- Standards presentation (step 2). Citations are collapsed to number + title; expanding one
  // fetches its regulatory text on demand. `getRegulatorySection` fails soft to null, so a citation
  // whose text has not been ingested shows an honest notice rather than an error.
  // --- Candidate confirmation. HazLenz proposes; the customer confirms which actually apply
  // BEFORE any of them costs a review cycle. Keyed by finding id; true means confirmed.
  const [candidateSelection, setCandidateSelection] = useState<Record<string, boolean>>({});

  // --- "Add a finding HazLenz missed". Distinct from revising the observation: the observation is
  // valid, HazLenz simply did not identify a hazard the inspector believes is present.
  const [missedFormOpen, setMissedFormOpen] = useState(false);
  const [missedHazardTitle, setMissedHazardTitle] = useState("");
  const [missedHazardDetail, setMissedHazardDetail] = useState("");

  const [expandedCitation, setExpandedCitation] = useState("");
  const [standardTexts, setStandardTexts] = useState<Record<string, RegulatorySectionRecord | null>>({});
  const [standardTextLoading, setStandardTextLoading] = useState("");
  const [confidenceOpenFor, setConfidenceOpenFor] = useState("");

  useEffect(() => {
    getVerifiedPlanCode().then(setPlanCode).catch(() => {});
  }, []);

  // The inspection-level regulatory context is the ONE authoritative jurisdiction for every
  // observation and finding here. It is persisted on the inspection (set at inspection start,
  // changeable below) and re-read from the server, never a page-local default -- the backend
  // applies it authoritatively to every analysis via `inspectionId`, so nothing here has to
  // resend a fragile jurisdiction string per finding.
  const jurisdiction: RegulatoryContext = inspection?.regulatoryContext || "unknown";

  // Findings still in play across EVERY observation on this inspection (superseded revisions are
  // history, not findings the reviewer has to act on).
  const activeFindings = (inspection?.findings || []).filter((finding) => finding.status !== "superseded");
  // The counters the customer reads must describe FINDINGS, and a candidate they declined to
  // confirm is not one. `dismissed` rows carry a finalReviewId (the rejection is itself a recorded
  // review), so counting "has a review" reported "2 of 3 saved" immediately after the customer had
  // confirmed exactly one finding and rejected two suggestions.
  const countableFindings = activeFindings.filter((finding) => finding.status !== "dismissed");
  const activeFindingCount = countableFindings.length;
  const reviewedFindingCount = countableFindings.filter((finding) => finding.status === "finalized").length;

  // The selected finding's own persisted record, and the two customer-facing values drawn from
  // it for the assessment lead-in. observationFragment is the sentence the engine attributed to
  // THIS finding, so it is the honest "why" -- not a rationale reconstructed in the browser.
  const selectedFindingDetail = activeFindings.find((finding) => finding.id === selectedFindingId) || null;
  const selectedFindingFragment = (() => {
    const candidate = selectedFindingDetail?.sourceCandidate as { observationFragment?: unknown } | null;
    const fragment = candidate?.observationFragment;
    return typeof fragment === "string" && fragment.trim() ? fragment.trim() : "";
  })();
  const selectedFindingRiskBand = (() => {
    const snapshot = selectedFindingDetail?.riskSnapshot as { riskBand?: string; overallRisk?: string } | null;
    return snapshot?.riskBand || snapshot?.overallRisk || "Not established";
  })();

  async function persistRegulatoryContext(next: RegulatoryContext) {
    if (!inspection || next === jurisdiction) return inspection;
    setBusy(true);
    setStatus("Saving the inspection's regulatory context…");
    try {
      const saved = await updatePersistedInspectionRegulatoryContext(inspection.id, next, inspection.version);
      const refreshed = await getPersistedInspection(inspection.id);
      setInspection(refreshed);
      setStatus(analysis
        ? `Regulatory context saved as ${regulatoryContextLabel(saved.regulatoryContext)}. Run HazLenz again so findings inherit it.`
        : `Regulatory context saved as ${regulatoryContextLabel(saved.regulatoryContext)}.`);
      return refreshed;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The regulatory context was not saved.");
      return inspection;
    } finally {
      setBusy(false);
    }
  }

  // The ONE consolidated jurisdiction question HazLenz asks (id "jurisdiction") is answered at
  // inspection level: persist the answer onto the inspection so it is never asked again for any
  // finding in this inspection, then re-run the analysis, which now inherits it as USER_CONFIRMED.
  function regulatoryContextFromAnswer(answer: string): RegulatoryContext | null {
    const value = answer.toLowerCase();
    if (/msha|mine/.test(value)) return "msha";
    if (/construction/.test(value)) return "osha-construction";
    if (/general/.test(value)) return "osha-general-industry";
    return null;
  }

  useEffect(() => {
    const id = selectedInspectionId();
    if (!id) {
      queueMicrotask(() => setStatus("No server-saved inspection was selected."));
      return;
    }
    getPersistedInspection(id)
      .then((value) => {
        setInspection(value);
        setFindingIds((value.findings || [])
          .filter((finding) => finding.status !== "superseded")
          .map((finding) => finding.id));
        // Restore onto the work still outstanding: the first finding that has no completed
        // review, falling back to the first active finding. Loading observations[0]
        // unconditionally meant that after a reload of a multi-observation inspection the page
        // showed observation 1's analysis while selecting a finding that could belong to
        // observation 2 or 3 -- the same mismatch that made finalization stall.
        const activeOnLoad = (value.findings || []).filter((finding) => finding.status !== "superseded");
        const restoreTarget = activeOnLoad.find((finding) => !finding.finalReviewId) || activeOnLoad[0];
        setSelectedFindingId(restoreTarget?.id || "");
        const persistedObservation =
          (restoreTarget && (value.observations || []).find((item) => item.id === restoreTarget.observationId))
          || value.observations?.[0];
        const currentAnalysis = persistedObservation?.analyses
          ?.filter((item) => item.status !== "superseded")
          .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
        // Observation restoration and analysis restoration are deliberately SEPARATE.
        //
        // These were previously one `persistedObservation && currentAnalysis` block, which meant a
        // Free account could never see its own saved observation again. HazLenz classification is
        // Pro-gated (classify returns 402), so `currentAnalysis` is undefined on Free by
        // construction and the entire block was skipped -- including the rawText the API had
        // already returned in hand. Re-reading your own observation is record-keeping, which Free
        // IS entitled to; re-reading an analysis is not. Keep them decoupled.
        if (persistedObservation) {
          setObservationId(persistedObservation.id);
          setObservation(persistedObservation.rawText);
          setRevisionText(persistedObservation.rawText);
        }
        if (persistedObservation && currentAnalysis) {
          setAnalysisId(currentAnalysis.id);
          analysisRequestVersion.current = currentAnalysis.requestVersion || 0;
          const restoredAnalysis = currentAnalysis.resultSnapshot as HazLenzAnalysisResult;
          setAnalysis(restoredAnalysis);
          // Location and task survive a reload. They are not columns on the observation, but they
          // ARE persisted inside the analysis snapshot's structuredObservation, so they can be
          // restored rather than silently blanked -- the finding builder read "Where: Not recorded"
          // for a location the inspector had typed, and it is wanted on the report.
          const restoredContext = (restoredAnalysis as { structuredObservation?: { workArea?: string; taskBeingPerformed?: string } })
            .structuredObservation;
          if (restoredContext?.workArea) setWorkArea(restoredContext.workArea);
          if (restoredContext?.taskBeingPerformed) setWorkActivity(restoredContext.taskBeingPerformed);
          // Seed the matrix cell and this finding's own corrective actions, exactly as the live
          // analysis path does, so a reload does not drop back to "Risk: Not set".
          prepareFindingWorkingState(restoreTarget);
          if (restoredAnalysis.guidedFinding) {
            const restoredRisk = restoredAnalysis.guidedFinding.riskAssessment;
            setReviewerRisk({
              severity: restoredRisk.severity,
              likelihood: restoredRisk.likelihood,
              exposure: restoredRisk.exposure,
              overallRisk: restoredRisk.overallRisk,
              rationale: restoredRisk.rationale,
            });
            setProposedRisk({
              severity: restoredRisk.severity,
              likelihood: restoredRisk.likelihood,
              exposure: restoredRisk.exposure,
              overallRisk: restoredRisk.overallRisk,
            });
            setActionDraft({
              immediateAction: restoredAnalysis.guidedFinding.correctiveAction.immediateAction,
              permanentCorrection: restoredAnalysis.guidedFinding.correctiveAction.permanentCorrection,
              verificationStep: restoredAnalysis.guidedFinding.correctiveAction.verificationStep,
            });
          }
          setStep("hazlenz");
        }
        setStatus("Saved to Safety InSite");
      })
      .catch((error) =>
        setStatus(error instanceof Error ? error.message : "Inspection could not be loaded."),
      );
  }, []);

  // Load the observation + current analysis that a given finding actually belongs to.
  //
  // Findings are owned by an observation, and every write on the review/risk path
  // (saveHumanReview, finalizePersistedFinding) is addressed by the page-level `observationId`.
  // Once an inspection can hold more than one observation, selecting a finding without also
  // switching that context means the reviewer confirms risk against the wrong observation:
  // acceptReview's `durableFindings` filter (observationId === observationId) would not contain
  // the selected finding at all and silently fell back to durableFindings[0]. In practice
  // finalization stalled after the first finding -- 1 of 4 reviewed, 3 permanently unreviewable.
  function loadObservationContextFor(findingId: string, source?: PersistedInspection) {
    const snapshot = source || inspection;
    if (!snapshot) return false;
    const finding = (snapshot.findings || []).find((item) => item.id === findingId);
    if (!finding || finding.observationId === observationId) return false;
    const owning = (snapshot.observations || []).find((item) => item.id === finding.observationId);
    const current = owning?.analyses
      ?.filter((item) => item.status !== "superseded")
      .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
    if (!owning || !current) return false;

    setObservationId(owning.id);
    setAnalysisId(current.id);
    setObservation(owning.rawText);
    setRevisionText(owning.rawText);
    setEditingObservation(false);
    analysisRequestVersion.current = current.requestVersion || 0;
    const restored = current.resultSnapshot as HazLenzAnalysisResult;
    setAnalysis(restored);
    // Switching to a finding from a DIFFERENT observation must also bring that observation's own
    // location and task, or the finding builder shows the previous observation's context.
    const restoredContext = (restored as { structuredObservation?: { workArea?: string; taskBeingPerformed?: string } })
      .structuredObservation;
    setWorkArea(restoredContext?.workArea || "");
    setWorkActivity(restoredContext?.taskBeingPerformed || "");
    const candidates = restored.guidedFinding?.findingCandidates || [];
    setSelectedSegmentKeys(
      candidates.filter((candidate) => candidate.applicability === "direct").map(candidateKey).slice(0, 6),
    );
    setReviewFacts(restored.evidenceSnapshot?.facts || []);
    if (restored.guidedFinding) {
      setActionDraft({
        immediateAction: restored.guidedFinding.correctiveAction.immediateAction,
        permanentCorrection: restored.guidedFinding.correctiveAction.permanentCorrection,
        verificationStep: restored.guidedFinding.correctiveAction.verificationStep,
      });
    }
    return true;
  }

  // Selecting a finding: switch the observation context first, then apply that finding's own
  // recorded risk to the reviewer form.
  function selectFinding(finding: { id: string; riskSnapshot: Record<string, unknown> | null }) {
    loadObservationContextFor(finding.id);
    setSelectedFindingId(finding.id);
    const findingRisk = riskSnapshotToReviewerRisk(finding.riskSnapshot);
    setReviewerRisk(findingRisk);
    setProposedRisk(findingRisk);
    setReviewerRiskReason("");
    prepareFindingWorkingState(finding);
  }

  /**
   * Loads the per-finding working state for steps 3 and 4: the matrix cell seeded from the
   * finding's OWN computed risk, and that finding's OWN suggested corrective actions.
   *
   * Seeding rather than leaving blank matters -- the reviewer is confirming or changing HazLenz's
   * assessment, not producing one from nothing. Everything remains editable, and nothing is
   * persisted until the finding is saved.
   */
  function prepareFindingWorkingState(finding: { riskSnapshot?: Record<string, unknown> | null } | null | undefined) {
    const operational = (finding?.riskSnapshot as { operationalRisk?: Record<string, unknown> } | null | undefined)?.operationalRisk;
    const seedSeverity = Number(operational?.severity);
    const seedLikelihood = Number(operational?.likelihood);
    setSeverity(Number.isFinite(seedSeverity) && seedSeverity > 0 ? Math.min(seedSeverity, riskScale.maxScore) : null);
    setLikelihood(Number.isFinite(seedLikelihood) && seedLikelihood > 0 ? Math.min(seedLikelihood, riskScale.maxScore) : null);
    // When HazLenz has nothing to suggest -- always the case for a hazard the inspector identified
    // themselves -- open the manual editor rather than an empty panel.
    const suggested = suggestedActionsForFinding(finding);
    setReviewerActions(suggested.length > 0 ? suggested : blankManualActions());
    // Responsible party is per finding, exactly like the action text. Reset on every switch so one
    // finding's owner can never carry silently onto the next.
    setResponsiblePerson("");
    setNewActionTitle("");
    setNewActionDetail("");
    setExpandedCitation("");
    setConfidenceOpenFor("");
  }

  /**
   * Whether a proposed candidate is pre-ticked on the confirmation step.
   *
   * Pre-ticking is a convenience, never a judgement the customer cannot see: every candidate is
   * listed with its evidence whether ticked or not, and one tap changes either way. The rule is
   * deliberately biased toward INCLUSION for anything that could matter --
   *
   *   - it is the hazard the decomposition called primary; or
   *   - a standard applies to it directly; or
   *   - its own computed risk is High or Critical.
   *
   * A serious hazard is therefore pre-ticked even when no standard was matched, so the bias only
   * ever runs against low-risk candidates that carry no direct standard -- which is exactly the
   * class that was generating review work for incidental phrases.
   */
  function candidatePreselected(finding: PersistedFinding, analysisSnapshot: HazLenzAnalysisResult | null) {
    const decomposition = analysisSnapshot?.multiHazardDecomposition as
      { primaryHazard?: { domainId?: string; hazardFamily?: string } } | undefined;
    const primaryKey = decomposition?.primaryHazard?.domainId || decomposition?.primaryHazard?.hazardFamily || "";
    if (primaryKey && familySlug(primaryKey) === finding.hazardKey) return true;
    if (resolveFindingStandards(finding).some((candidate) => candidate.applicability === "direct")) return true;
    const snapshot = finding.riskSnapshot as { riskBand?: string; overallRisk?: string } | null;
    const band = String(snapshot?.riskBand || snapshot?.overallRisk || "");
    return band === "High" || band === "Critical";
  }

  /**
   * Records that HazLenz proposed a candidate and the customer did not confirm it.
   *
   * Uses the EXISTING architecture rather than a new concept: a human review with decision
   * `dismissed`, which finalization turns into `status = 'dismissed'` on the finding row. That
   * keeps the whole proposal auditable and measurable -- the finding row, its evidence fragment,
   * its standard candidates and the rejecting review all survive -- while the row is excluded from
   * corrective actions (upsert runs only for 'finalized'), excluded from the report snapshot, and
   * accepted by the completion gate. Nothing is silently discarded.
   *
   * The rationale is supplied by the system. The customer is never asked to justify a rejection.
   */
  async function recordCandidateRejection(finding: PersistedFinding, rationale: string) {
    const owningObservation = (inspection?.observations || [])
      .find((item) => item.id === finding.observationId);
    const currentAnalysis = owningObservation?.analyses
      ?.filter((item) => item.status !== "superseded")
      .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
    const review = await saveHumanReview(finding.observationId, {
      findingId: finding.id,
      idempotencyKey: `reject:${finding.id}:${finding.revision}`,
      analysisId: currentAnalysis?.id || finding.selectedAnalysisId || "",
      decision: "dismissed",
      rationale,
    });
    await finalizePersistedFinding(finding.observationId, {
      reviewId: review.id,
      hazardCategory: finding.hazardCategory || undefined,
      conclusion: finding.conclusion,
      segmentKey: finding.hazardKey,
      sourceCandidate: (finding.sourceCandidate || {}) as Record<string, unknown>,
    });
  }

  /**
   * Apply the confirmation: rejected candidates are recorded as not confirmed, and only the
   * confirmed ones go on to Risk & fix.
   */
  async function confirmCandidates() {
    if (!inspection) return;
    const proposed = (inspection.findings || [])
      .filter((finding) => finding.observationId === observationId && finding.status === "pending_review");
    const confirmed = proposed.filter((finding) => candidateSelection[finding.id]);
    const rejected = proposed.filter((finding) => !candidateSelection[finding.id]);
    if (confirmed.length === 0) {
      setStatus("Confirm at least one finding, or go back and revise what you wrote.");
      return;
    }
    setBusy(true);
    setStatus("Applying your confirmation…");
    try {
      for (const finding of rejected) {
        await recordCandidateRejection(
          finding,
          "HazLenz proposed this hazard from the observation; the inspector did not confirm it as a finding.",
        );
      }
      const refreshed = await getPersistedInspection(inspection.id);
      setInspection(refreshed);
      const stillOpen = (refreshed.findings || [])
        .filter((finding) => finding.status === "pending_review");
      setFindingIds(stillOpen.map((finding) => finding.id));
      const next = stillOpen.find((finding) => finding.observationId === observationId) || stillOpen[0];
      setSelectedFindingId(next?.id || "");
      prepareFindingWorkingState(next);
      setStep("hazlenz");
      setStatus(
        rejected.length > 0
          ? `${confirmed.length} finding${confirmed.length === 1 ? "" : "s"} confirmed. ${rejected.length} suggestion${rejected.length === 1 ? " was" : "s were"} not confirmed and will not appear in the report.`
          : `${confirmed.length} finding${confirmed.length === 1 ? "" : "s"} confirmed.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Your confirmation was not saved.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Record a hazard the inspector identified that HazLenz did not propose, then take them straight
   * into the normal Risk & fix step for it.
   *
   * The observation already on screen is the evidence, so nothing is re-collected; `detail` exists
   * only for the case where that observation genuinely does not contain the missed hazard's
   * evidence. The finding is created server-side as a real `pending_review` row with
   * `source = 'user_authored'`, no citation, no confidence and no risk -- the reviewer sets risk on
   * the matrix like any other finding. It skips the HazLenz step because HazLenz has nothing to
   * show for a hazard it did not identify; it does NOT skip risk or review.
   */
  async function addMissedFinding() {
    if (!inspection || !observationId) return;
    const hazardTitle = missedHazardTitle.trim();
    if (hazardTitle.length < 3) {
      setStatus("Name the hazard HazLenz missed before adding it.");
      return;
    }
    setBusy(true);
    setStatus("Adding the finding you identified…");
    try {
      const created = await createUserAuthoredFinding(observationId, {
        hazardTitle,
        detail: missedHazardDetail.trim() || undefined,
      });
      const refreshed = await getPersistedInspection(inspection.id);
      setInspection(refreshed);
      const persisted = (refreshed.findings || []).find((finding) => finding.id === created.id) || created;
      setSelectedFindingId(persisted.id);
      // No HazLenz risk or action exists for this hazard, so the working state is deliberately
      // empty rather than seeded from a sibling finding's assessment.
      prepareFindingWorkingState(persisted);
      setMissedFormOpen(false);
      setMissedHazardTitle("");
      setMissedHazardDetail("");
      setStep("risk");
      setStatus("You identified this finding. HazLenz did not propose it — set its risk and corrective action.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The finding was not added.");
    } finally {
      setBusy(false);
    }
  }

  /** On-demand regulatory text for one citation, cached per citation for this page's lifetime. */
  async function toggleStandardText(citation: string) {
    if (expandedCitation === citation) {
      setExpandedCitation("");
      return;
    }
    setExpandedCitation(citation);
    if (citation in standardTexts) return;
    setStandardTextLoading(citation);
    try {
      const record = await getRegulatorySection(citation);
      setStandardTexts((current) => ({ ...current, [citation]: record }));
    } finally {
      setStandardTextLoading("");
    }
  }

  function toggleReviewerAction(id: string) {
    setReviewerActions((current) =>
      current.map((action) => (action.id === id ? { ...action, selected: !action.selected } : action)),
    );
  }

  /**
   * Typing into an action selects it; clearing it deselects. In the manual editor there is no
   * separate tick to remember, so a filled field is by definition an action the inspector wants and
   * an empty one is never saved.
   */
  function editReviewerAction(id: string, detail: string) {
    setReviewerActions((current) =>
      current.map((action) => (action.id === id
        ? { ...action, detail, selected: action.origin === "user" ? detail.trim().length > 0 : action.selected }
        : action)),
    );
  }

  function addReviewerAction() {
    const title = newActionTitle.trim();
    const detail = newActionDetail.trim();
    if (!title && !detail) return;
    setReviewerActions((current) => [
      ...current,
      {
        id: `user-${current.length}-${title.slice(0, 12)}`,
        title: title || ACTION_KIND_LABELS[newActionKind],
        detail,
        origin: "user",
        kind: newActionKind,
        selected: true,
      },
    ]);
    setNewActionTitle("");
    setNewActionDetail("");
  }

  // Return to the capture form to record a hazard noticed after the first analysis. Clears only
  // the per-observation inputs; the inspection, its regulatory context, and every existing
  // finding stay exactly as they are.
  function beginAdditionalObservation() {
    setObservation("");
    setWorkArea("");
    setWorkActivity("");
    setEvidenceFile(null);
    setEvidenceObjectId("");
    setEditingObservation(false);
    setRevisionText("");
    setCaptureMode("additional");
    setStep("capture");
    setStatus("Ready for the next condition.");
  }

  function cancelAdditionalObservation() {
    setCaptureMode("initial");
    setStep("hazlenz");
    setStatus("Returned to review — no new observation was recorded.");
  }

  async function analyze() {
    if (!inspection || observation.trim().length < 3) return;
    setBusy(true);
    setStaleAnalysis(false);
    setStatus("Saving observation and requesting HazLenz AI…");
    try {
      const savedObservation = await addPersistedObservation(inspection.id, observation);
      if (evidenceFile) {
        const storedEvidence = await uploadInspectionEvidence(inspection.id, evidenceFile);
        setEvidenceObjectId(storedEvidence.id);
      }
      const result = await analyzeObservation(observation, {
        inspectionId: inspection.id,
        structuredObservation: {
          narrative: observation,
          jurisdiction,
          workArea: workArea || undefined,
          taskBeingPerformed: workActivity || undefined,
          evidenceSource: evidenceFile ? ["worker-report", "photo"] : ["worker-report"],
          controlsPresent: [],
          controlsMissing: [],
          unknownFacts: [],
          unresolvedContradictions: [],
          userConfirmedFacts: [],
        },
      });
      const requestVersion = ++analysisRequestVersion.current;
      const savedAnalysis = await saveAnalysisSnapshot(savedObservation.id, result, {
        idempotencyKey: crypto.randomUUID(),
        requestVersion,
      });
      const nextInspection = await getPersistedInspection(inspection.id);
      setObservationId(savedObservation.id);
      setAnalysisId(savedAnalysis.id);
      setAnalysis(result);
      // Select the first current finding immediately so the Standard Detail panel shows THAT
      // finding's own finding-scoped standard (not the whole-observation primary, which for a
      // multi-finding observation is only one sibling's citation).
      const currentFindings = (nextInspection.findings || []).filter((finding) => finding.status !== "superseded");
      setFindingIds(currentFindings.map((finding) => finding.id));
      // Select a finding the observation just analysed actually produced. On an added observation
      // the inspection-wide list still starts with the EARLIER observation's findings, so taking
      // [0] would drop the reviewer back onto a finding they already reviewed.
      const ownFindings = currentFindings.filter((finding) => finding.observationId === savedObservation.id);
      const firstFinding = ownFindings[0] || currentFindings[0];
      setSelectedFindingId(firstFinding?.id || "");
      // Seed the matrix cell and the corrective-action list from THIS finding's own computed
      // risk and action intelligence, so steps 3 and 4 open pre-filled rather than blank.
      prepareFindingWorkingState(firstFinding);
      setReviewFacts(result.evidenceSnapshot?.facts || []);
      if (result.guidedFinding) {
        const proposal = {
          severity: result.guidedFinding.riskAssessment.severity,
          likelihood: result.guidedFinding.riskAssessment.likelihood,
          exposure: result.guidedFinding.riskAssessment.exposure,
          overallRisk: result.guidedFinding.riskAssessment.overallRisk,
          rationale: result.guidedFinding.riskAssessment.rationale,
        };
        setReviewerRisk(proposal);
        setProposedRisk({
          severity: proposal.severity,
          likelihood: proposal.likelihood,
          exposure: proposal.exposure,
          overallRisk: proposal.overallRisk,
        });
        setReviewerRiskReason("");
        setActionDraft({
          immediateAction: result.guidedFinding.correctiveAction.immediateAction,
          permanentCorrection: result.guidedFinding.correctiveAction.permanentCorrection,
          verificationStep: result.guidedFinding.correctiveAction.verificationStep,
        });
        const candidates = result.guidedFinding.findingCandidates || [];
        setSelectedSegmentKeys(
          candidates.filter(candidate => candidate.applicability === "direct")
            .map(candidateKey)
            .slice(0, 6),
        );
      }
      setInspection(nextInspection);
      // CANDIDATE CONFIRMATION.
      //
      // HazLenz regularly decomposes one recorded condition into several hazards, and some of them
      // come from clauses the inspector wrote as CONTEXT for the hazard they meant to report. Sending
      // every one of those straight into the per-finding review loop is what made adding a finding
      // expensive: a spurious candidate had to be fully reviewed before it could be removed.
      //
      // So when more than one candidate is proposed, the customer confirms which ones actually apply
      // first. With exactly one candidate there is nothing to choose between, and the step is skipped
      // entirely -- an ordinary single-hazard finding gains no extra interaction.
      // ONLY what this observation produced. There was previously a fallback to the inspection's
      // whole finding list when the new observation produced nothing, which offered the inspector
      // their own already-saved findings back as candidates to confirm -- measured live on an
      // observation HazLenz could not decompose, where the confirmation screen announced "9
      // possible findings" and listed none of them. An observation that yields no candidate must
      // say so.
      const proposed = ownFindings;
      if (proposed.length === 0) {
        setStep("candidates");
        setStatus("HazLenz did not identify a hazard in this observation.");
      } else if (proposed.length > 1) {
        setCandidateSelection(Object.fromEntries(
          proposed.map((finding) => [finding.id, candidatePreselected(finding, result)]),
        ));
        setStep("candidates");
        setStatus(`HazLenz found ${proposed.length} possible findings. Confirm which ones apply.`);
      } else {
        setStep("hazlenz");
        setStatus(
          captureMode === "additional"
            ? "Additional hazard analysed and added to this inspection — earlier findings are unchanged."
            : "HazLenz assessment saved — review before finalizing.",
        );
      }
      setCaptureMode("initial");
    } catch (error) {
      // The backend refuses HazLenz analysis for a Free account with
      // 402 PAID_SUBSCRIPTION_REQUIRED. Surfacing that raw message left the
      // inspector staring at "A paid subscription is required for this feature."
      // with no explanation of what was kept or where to go next.
      const message = error instanceof Error ? error.message : "Analysis was not saved.";
      if (isEntitlementRefusal(error)) {
        setAnalysisLocked(true);
        setStatus("Observation saved. HazLenz AI analysis is a Pro feature.");
      } else {
        setStatus(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function reanalyze(
    clarificationAnswer?: { questionId: string; answer: string },
  ) {
    if (!analysis) return;
    const persistedInspectionId = inspection?.id;
    if (!persistedInspectionId) return;
    let currentJurisdiction = jurisdiction;
    if (clarificationAnswer?.questionId === "jurisdiction") {
      const answered = regulatoryContextFromAnswer(clarificationAnswer.answer);
      if (answered && answered !== jurisdiction) {
        const refreshed = await persistRegulatoryContext(answered);
        currentJurisdiction = refreshed?.regulatoryContext || answered;
      }
    }
    setBusy(true);
    setStatus("Re-evaluating the evidence and applicability predicates…");
    try {
      const correctedFacts = reviewFacts.map((item) => ({
        ...item,
        source: "user_confirmation",
        status: "confirmed",
        reviewerStatus: "user_confirmed",
        confidence: 1,
      }));
      const nextAnswerHistory = clarificationAnswer
        ? [
            ...clarificationAnswerHistory.filter((item) => item.questionId !== clarificationAnswer.questionId),
            clarificationAnswer,
          ]
        : clarificationAnswerHistory;
      const result = await analyzeObservation(observation, {
        inspectionId: persistedInspectionId,
        evidenceSnapshot: analysis.evidenceSnapshot
          ? { ...analysis.evidenceSnapshot, facts: correctedFacts }
          : undefined,
        clarificationAnswers: nextAnswerHistory.length ? nextAnswerHistory : undefined,
        structuredObservation: {
          narrative: observation,
          jurisdiction: currentJurisdiction,
          workArea: workArea || undefined,
          taskBeingPerformed: workActivity || undefined,
          evidenceSource: evidenceFile ? ["worker-report", "photo"] : ["worker-report"],
          controlsPresent: [],
          controlsMissing: [],
          unknownFacts: [],
          unresolvedContradictions: [],
          userConfirmedFacts: correctedFacts.map((item) => ({
            field: item.type,
            value: item.value,
          })),
        },
      });
      const requestVersion = ++analysisRequestVersion.current;
      const saved = await saveAnalysisSnapshot(observationId, result, {
        idempotencyKey: crypto.randomUUID(),
        requestVersion,
      });
      const nextInspection = await getPersistedInspection(persistedInspectionId);
      setAnalysisId(saved.id);
      setAnalysis(result);
      setClarificationAnswerHistory(nextAnswerHistory);
      setInspection(nextInspection);
      setFindingIds((nextInspection.findings || [])
        .filter((finding) => finding.status !== "superseded")
        .map((finding) => finding.id));
      setSelectedFindingId((nextInspection.findings || []).find((finding) => finding.status !== "superseded")?.id || "");
      setReviewFacts(result.evidenceSnapshot?.facts || correctedFacts);
      if (result.guidedFinding) {
        const proposal = {
          severity: result.guidedFinding.riskAssessment.severity,
          likelihood: result.guidedFinding.riskAssessment.likelihood,
          exposure: result.guidedFinding.riskAssessment.exposure,
          overallRisk: result.guidedFinding.riskAssessment.overallRisk,
          rationale: result.guidedFinding.riskAssessment.rationale,
        };
        setReviewerRisk(proposal);
        const candidates = result.guidedFinding.findingCandidates || [];
        setSelectedSegmentKeys(
          candidates.filter(candidate => candidate.applicability === "direct")
            .map(candidateKey)
            .slice(0, 6),
        );
        setProposedRisk({
          severity: proposal.severity,
          likelihood: proposal.likelihood,
          exposure: proposal.exposure,
          overallRisk: proposal.overallRisk,
        });
        setReviewerRiskReason("");
        setActionDraft({
          immediateAction: result.guidedFinding.correctiveAction.immediateAction,
          permanentCorrection: result.guidedFinding.correctiveAction.permanentCorrection,
          verificationStep: result.guidedFinding.correctiveAction.verificationStep,
        });
      }
      setStatus("Updated HazLenz assessment saved — review before finalizing.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The corrected evidence was not saved.";
      if (/newer analysis|stale|conflict/i.test(message)) {
        setStaleAnalysis(true);
        setStatus("A newer server analysis exists. Refresh before submitting this clarification again.");
      } else {
        setStatus(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function reanalyzeCurrentObservation() {
    if (!inspection || !observationId || !observation.trim()) return;
    setBusy(true);
    setStaleAnalysis(false);
    setStatus("Reanalyzing the persisted observation with HazLenz AI…");
    setClarificationAnswerHistory([]);
    try {
      const stateBeforeAnalysis = await getPersistedInspection(inspection.id);
      const persistedObservation = stateBeforeAnalysis.observations?.find(item => item.id === observationId);
      if (!persistedObservation) throw new Error("The persisted observation could not be reloaded.");
      if (persistedObservation.rawText.trim() !== observation.trim()) {
        setObservation(persistedObservation.rawText);
        setRevisionText(persistedObservation.rawText);
        setInspection(stateBeforeAnalysis);
        throw new Error("The observation changed elsewhere. Refresh the current text before reanalyzing.");
      }
      const latestRequestVersion = Math.max(
        ...(persistedObservation.analyses || []).map(item => item.requestVersion || 0),
        analysisRequestVersion.current,
      );
      const result = await analyzeObservation(observation, {
        inspectionId: inspection.id,
        structuredObservation: {
          narrative: observation,
          jurisdiction,
          workArea: workArea || undefined,
          taskBeingPerformed: workActivity || undefined,
          evidenceSource: evidenceFile ? ["worker-report", "photo"] : ["worker-report"],
          controlsPresent: [],
          controlsMissing: [],
          unknownFacts: [],
          unresolvedContradictions: [],
          userConfirmedFacts: [],
        },
      });
      let requestVersion = Math.max(latestRequestVersion + 1, 1);
      let saved;
      try {
        saved = await saveAnalysisSnapshot(observationId, result, {
          idempotencyKey: crypto.randomUUID(),
          requestVersion,
        });
      } catch (error) {
        if (!(error instanceof Error) || !/newer analysis|conflict|stale/i.test(error.message)) throw error;
        const synchronized = await getPersistedInspection(inspection.id);
        const currentObservation = synchronized.observations?.find(item => item.id === observationId);
        const synchronizedLatest = Math.max(
          ...(currentObservation?.analyses || []).map(item => item.requestVersion || 0),
          requestVersion,
        );
        if (!currentObservation || currentObservation.rawText.trim() !== observation.trim()) {
          throw new Error("The observation changed elsewhere. Refresh the current text before reanalyzing.");
        }
        requestVersion = synchronizedLatest + 1;
        saved = await saveAnalysisSnapshot(observationId, result, {
          idempotencyKey: crypto.randomUUID(),
          requestVersion,
        });
      }
      analysisRequestVersion.current = requestVersion;
      const refreshed = await getPersistedInspection(inspection.id);
      setAnalysisId(saved.id);
      setAnalysis(result);
      setInspection(refreshed);
      setFindingIds((refreshed.findings || []).filter(finding => finding.status !== "superseded").map(finding => finding.id));
      setSelectedFindingId((refreshed.findings || []).find(finding => finding.status !== "superseded")?.id || "");
      setReviewFacts(result.evidenceSnapshot?.facts || []);
      setStep("hazlenz");
      setStatus("New HazLenz analysis saved; current findings were reconciled and may require review.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Reanalysis was not saved.");
    } finally {
      setBusy(false);
    }
  }

  async function saveObservationRevision() {
    if (!inspection || !observationId || revisionText.trim().length < 3) return;
    setBusy(true);
    setStatus("Saving observation revision…");
    try {
      let currentInspection = inspection;
      if (currentInspection.status === "completed") {
        currentInspection = await transitionPersistedInspection(currentInspection.id, "draft", currentInspection.version);
        setInspection(currentInspection);
      }
      const currentObservation = currentInspection.observations?.find(item => item.id === observationId);
      if (!currentObservation) throw new Error("The persisted observation could not be reloaded.");
      const saved = await updatePersistedObservation(observationId, revisionText.trim(), currentObservation.version);
      const refreshed = await getPersistedInspection(currentInspection.id);
      const authoritative = refreshed.observations?.find(item => item.id === observationId) || saved;
      setInspection(refreshed);
      setObservation(authoritative.rawText);
      setRevisionText(authoritative.rawText);
      setEditingObservation(false);
      setStatus("Observation revision saved. Run HazLenz again to reconcile findings.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Observation revision was not saved.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * The reviewer-confirmed risk, taken from the matrix cell selected on step 3.
   *
   * `reviewerRisk` remains the shape the review/finalize API already accepts (label strings), so
   * nothing downstream changes; what changed is where the labels come from. The matrix is the only
   * risk control the customer now sees, and severity x likelihood is the score behind the band.
   */
  const matrixRisk = (() => {
    if (!severity || !likelihood) return null;
    const score = severity * likelihood;
    return {
      severity: severityScale.find((item) => item.score === severity)?.label || "Not established",
      likelihood: likelihoodScale.find((item) => item.score === likelihood)?.label || "Not established",
      exposure: "Potential",
      overallRisk: RISK_BAND_FOR_SCORE(score, riskScale.maxScore),
      rationale: `Reviewer-confirmed on the ${riskScale.label} matrix: severity ${severity} x likelihood ${likelihood} = ${score}.`,
      score,
    };
  })();

  async function acceptReview() {
    if (!inspection || !analysis || !observationId || !analysisId) return;
    if (!matrixRisk) {
      setStatus("Select a cell on the risk matrix before saving this finding.");
      setStep("risk");
      return;
    }
    // The reviewer's matrix selection IS the confirmed risk from here on.
    const reviewerRisk = {
      severity: matrixRisk.severity,
      likelihood: matrixRisk.likelihood,
      exposure: matrixRisk.exposure,
      overallRisk: matrixRisk.overallRisk,
      rationale: matrixRisk.rationale,
    };
    // A user-authored finding has no HazLenz proposal, so its review is not an EDIT of one. Without
    // this, the "Not established" placeholder risk would always differ from the reviewer's matrix
    // selection and every inspector-identified finding would be recorded as having overridden an
    // assessment that never existed.
    const isUserAuthoredFinding =
      (inspection.findings || []).find((finding) => finding.id === selectedFindingId)?.source === "user_authored";
    const riskChanged = !isUserAuthoredFinding
      && (["severity", "likelihood", "exposure", "overallRisk"] as const)
        .some(field => reviewerRisk[field] !== proposedRisk[field]);
    // The server independently enforces a rationale on a MATERIAL override (addReview ->
    // materialRiskChanged), so the matrix's own explanation is sent when the reviewer has not
    // typed one. It is a true description of what they did, not a fabricated justification.
    const overrideRationale = reviewerRiskReason.trim() || matrixRisk.rationale;
    // Corrective actions the reviewer accepted on step 3, in the three fields the save path and
    // the report already understand.
    const confirmedAction = actionDraftFromReviewerActions(reviewerActions);
    setBusy(true);
    setStatus("Saving qualified human review…");
    try {
      const conclusion = String(
        analysis.classification || analysis.hazardType || analysis.observedCondition || observation,
      );
      const candidates = analysis.guidedFinding?.findingCandidates || [];
      const selectedCandidates = candidates.filter(candidate =>
        selectedSegmentKeys.includes(candidateKey(candidate)));
      const durableFindings = (inspection.findings || [])
        .filter((finding) => finding.observationId === observationId && finding.status !== "superseded");
      const selectedFinding = durableFindings.find((finding) => finding.id === selectedFindingId) || durableFindings[0];
      // The persisted sourceCandidate written at finalization must be the finding's OWN
      // finding-scoped candidate (observationFragment, standardCandidates, provenance...) with the
      // review bookkeeping keys added -- not the finding row wrapped around it. Spreading the
      // whole finding here buried observationFragment/standardCandidates one level deeper, so the
      // report read "What was observed: cord" and "Applicable standard: Not established" for a
      // finding whose own evaluation had a direct standard.
      const candidatesToPersist = selectedFinding
        ? [{
          ...((selectedFinding.sourceCandidate || {}) as Record<string, unknown>),
          hazardKey: selectedFinding.hazardKey,
          citation: String(selectedFinding.sourceCandidate?.citation || ""),
          family: selectedFinding.hazardCategory || selectedFinding.hazardKey,
          conclusion: selectedFinding.conclusion,
          applicability: "candidate" as const,
          evidenceFactIds: [],
          stableKey: selectedFinding.hazardKey,
        }]
        : selectedCandidates.length > 0
        ? selectedCandidates
        : [{
          citation: analysis.guidedFinding?.primaryStandard?.citation || "",
          family: String(analysis.hazardCategory || analysis.classification || "Safety observation"),
          applicability: analysis.guidedFinding?.primaryStandard?.applicability || "candidate" as const,
          evidenceFactIds: [],
        }];
      const findings = [];
      let firstReview: Awaited<ReturnType<typeof saveHumanReview>> | null = null;
      for (const candidate of candidatesToPersist) {
        const stableKey = "stableKey" in candidate && typeof candidate.stableKey === "string"
          ? candidate.stableKey
          : candidateKey(candidate);
        const durableFinding = durableFindings.find(finding => finding.hazardKey === stableKey);
        const review = await saveHumanReview(observationId, {
          findingId: durableFinding?.id,
          idempotencyKey: `review:${analysisId}:${stableKey}`,
          analysisId,
          decision: riskChanged ? "edited" : "accepted",
          rationale: overrideRationale,
          reviewedConclusion: {
            guidedFinding: analysis.guidedFinding,
            reviewerRisk: { ...reviewerRisk, reviewerConfirmed: true },
            // Corrective actions are now reviewed on step 3 FOR THIS FINDING, from that finding's
            // own `riskSnapshot.correctiveActionIntelligence` plus anything the reviewer added,
            // so attaching them here is safe and is the more authoritative value: the backend's
            // buildCorrectiveActionPayload prefers reviewedConclusion.correctiveAction over the
            // system-computed intelligence. The earlier hazard of every finding inheriting one
            // shared whole-observation draft is gone, because this state is rebuilt per finding by
            // prepareFindingWorkingState. Only attached when this call targets ONE finding.
            ...(candidatesToPersist.length === 1
              ? {
                correctiveAction: {
                  ...confirmedAction,
                  urgency: matrixRisk.overallRisk,
                  rationale: `Confirmed by the reviewer for this finding at ${matrixRisk.overallRisk} risk.`,
                  // Descriptive responsible party, per finding. Absent when the customer left it
                  // blank -- which is recorded as unassigned, never as the inspector.
                  ...(responsiblePerson.trim() ? { responsiblePerson: responsiblePerson.trim() } : {}),
                },
              }
              : {}),
            segmentationDecision: {
              selectedSegmentKeys,
              rejectedSegmentKeys: (analysis.guidedFinding?.findingCandidates || [])
                .map(candidateKey)
                .filter(key => !selectedSegmentKeys.includes(key)),
              disposition: selectedSegmentKeys.length > 1 ? "split" : "single_or_merged",
            },
          },
        });
        firstReview ||= review;
        findings.push(await finalizePersistedFinding(observationId, {
          reviewId: review.id,
          hazardCategory: candidate.family,
          conclusion: "conclusion" in candidate && typeof candidate.conclusion === "string"
            ? candidate.conclusion
            : candidatesToPersist.length > 1 ? `${candidate.family}: ${conclusion}` : conclusion,
          segmentKey: stableKey,
          sourceCandidate: candidate,
          reviewerDisposition: candidatesToPersist.length > 1 ? "split" : "single",
          // V5-C01: only attach the reviewer's edited risk when this call unambiguously
          // targets ONE specific finding (the normal "select a finding, review its own
          // risk" flow). When multiple candidates are being persisted in one call, each
          // keeps its own independently-computed riskSnapshot rather than all inheriting
          // whatever was last shown in the shared risk-step form -- see PRA-006.
          ...(candidatesToPersist.length === 1 ? { riskAssessment: reviewerRisk } : {}),
        }));
      }
      setRiskPolicy(firstReview?.reviewedConclusion?.riskPolicy || null);
      if (inspection.status === "draft") {
        await transitionPersistedInspection(
          inspection.id,
          "in_review",
          inspection.version,
        );
      }
      const refreshed = await getPersistedInspection(inspection.id);
      const activeFindings = (refreshed.findings || []).filter((finding) => finding.status !== "superseded");
      setFindingIds(activeFindings.map(finding => finding.id));
      setInspection(refreshed);
      const remaining = activeFindings.filter((finding) => !finding.finalReviewId);
      if (remaining.length > 0) {
        // The next unreviewed finding frequently belongs to a DIFFERENT observation than the one
        // just finalized, so its observation/analysis context must be loaded before it can be
        // reviewed -- otherwise the auto-advance lands on a finding this page cannot finalize.
        loadObservationContextFor(remaining[0].id, refreshed);
        setSelectedFindingId(remaining[0].id);
        // Auto-advancing to the next unreviewed finding must reset the risk-proposal
        // form to THAT finding's own computed risk, exactly like the manual "Review
        // this finding" button does -- otherwise the previous finding's dropdown
        // selections and typed reason silently carry over, and confirming without
        // noticing would persist the wrong finding's risk under the new one's id.
        const nextFindingRisk = riskSnapshotToReviewerRisk(remaining[0].riskSnapshot);
        setReviewerRisk(nextFindingRisk);
        setProposedRisk(nextFindingRisk);
        setReviewerRiskReason("");
        // The same reset applies to the matrix cell and the corrective-action list, which are the
        // controls the reviewer now actually uses.
        prepareFindingWorkingState(remaining[0]);
        // A user-authored finding has no HazLenz assessment to read, so sending the reviewer to the
        // HazLenz step for it would present an empty analysis screen headed "HazLenz assessment"
        // for a hazard HazLenz never identified. Risk & fix is the first step that has anything to
        // do.
        setStep(remaining[0].source === "user_authored" ? "risk" : "hazlenz");
        setStatus(`Finding saved. ${remaining.length} more hazard${remaining.length === 1 ? "" : "s"} from this observation still need${remaining.length === 1 ? "s" : ""} your review.`);
      } else {
        // Nothing left to review from this observation, so go straight back to recording the next
        // condition. An inspector walking a site records several findings in a row, and a screen
        // between each one is friction that compounds -- by the seventh finding it is the dominant
        // cost of the workflow. Confirmation is a brief non-blocking flash, not a page.
        flashSaved();
        beginAdditionalObservation();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Review was not saved.");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!inspection) return;
    // Corrective actions and calendar tasks are created only for findings the reviewer KEPT.
    // A dismissed finding still satisfies the server's completion gate, but it is not a hazard
    // anyone has to act on, so it must not generate an action or a due task.
    const reportableFindingIds = (inspection.findings || [])
      .filter((finding) => finding.status === "finalized")
      .map((finding) => finding.id);
    if (reportableFindingIds.length === 0) {
      setStatus("Save at least one finding before generating the report.");
      return;
    }
    setBusy(true);
    setStatus("Saving corrective actions, calendar tasks, and the report…");
    try {
      if (!riskPolicy) {
        throw new Error("The governed risk urgency policy was not returned by the server.");
      }
      const dueDays = riskPolicy.dueDays;
      const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString();
      for (const [index, findingId] of reportableFindingIds.entries()) {
        const finding = (inspection.findings || []).find(item => item.id === findingId);
        // Each finding now carries its OWN reviewer-confirmed corrective action, persisted on its
        // own human review when the reviewer saved it on step 3. That is the authoritative text
        // and is preferred here, so this call adopts the reviewer's own words and the ownership
        // scope onto the canonical corrective_actions row rather than overwriting every finding's
        // action with one shared draft. The family mapping remains only as a fallback for a
        // finding whose review recorded no action at all.
        const reviewedAction = (() => {
          if (!finding?.finalReviewId) return null;
          const owningObservation = (inspection.observations || [])
            .find((item) => item.id === finding.observationId);
          const review = (owningObservation?.reviews || [])
            .find((item) => item.id === finding.finalReviewId) as
              | { reviewedConclusion?: { correctiveAction?: Record<string, unknown> } }
              | undefined;
          const action = review?.reviewedConclusion?.correctiveAction;
          if (!action) return null;
          const immediateAction = String(action.immediateAction || "").trim();
          const permanentCorrection = String(action.permanentCorrection || "").trim();
          const verificationStep = String(action.verificationStep || "").trim();
          const responsible = String(action.responsiblePerson || "").trim();
          if (!immediateAction && !permanentCorrection && !verificationStep && !responsible) return null;
          return { immediateAction, permanentCorrection, verificationStep, responsible };
        })();
        const findingAction = reviewedAction
          || (finding ? safeActionDraftForFinding(finding, actionDraft) : actionDraft);
        const action = await createPersistedCorrectiveAction({
          inspectionId: inspection.id,
          findingId,
          title: reportableFindingIds.length > 1
            ? `Verify and correct reviewed condition ${index + 1}`
            : "Verify and correct reviewed condition",
          description: [
            `Immediate: ${findingAction.immediateAction}`,
            `Permanent: ${findingAction.permanentCorrection}`,
            `Verification: ${findingAction.verificationStep}`,
          ].join("\n"),
          priorityCode: riskPolicy.priority,
          // The responsible party the customer named for THIS finding, or omitted entirely.
          // Omitted means unassigned: the server no longer substitutes the inspector, and the
          // report renders a missing owner as "Unassigned" rather than naming them.
          ...(reviewedAction?.responsible ? { assignedToName: reviewedAction.responsible } : {}),
        });
        await createPersistedTask({
          inspectionId: inspection.id,
          correctiveActionId: typeof action.id === "string" ? action.id : undefined,
          title: reportableFindingIds.length > 1
            ? `Follow up reviewed finding ${index + 1}`
            : "Follow up reviewed finding",
          description: findingAction.verificationStep || "Confirm corrective action completion.",
          dueDate,
          priority: riskPolicy.priority,
        });
      }
      const completed = await transitionPersistedInspection(
        inspection.id,
        "completed",
        inspection.version,
      );
      const generated = await generatePersistedReport(inspection.id);
      const refreshed = await getPersistedInspection(inspection.id);
      setInspection(refreshed);
      setReport(generated);
      setStep("finalize");
      // The inspection has ONE report. Finishing a reopened inspection replaces it, so the
      // confirmation says what happened without inventing a version the customer must track.
      setStatus("Inspection finished. Your report is ready.");
      // The inspection is complete, so the customer's place is the completed-inspection/report
      // experience rather than a finishing screen for something already finished. The banner stays
      // rendered until the route changes, so the confirmation is seen either way.
      // The completed INSPECTION, not the generic report library: the inspection is the record
      // the customer just committed, and the report is one of its artefacts.
      router.push("/inspection-complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Finalization did not complete.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Remove a finding from the inspection.
   *
   * There is no delete endpoint and there should not be one: a finding that HazLenz raised and a
   * person then rejected is part of the inspection's history. `dismissed` is the existing status
   * for exactly this, it satisfies the completion gate (which accepts finalized OR dismissed), and
   * it keeps the rejection auditable. Dismissed findings are excluded from the report snapshot.
   */
  async function dismissFinding(finding: PersistedFinding) {
    if (!inspection) return;
    setBusy(true);
    setStatus("Removing finding…");
    try {
      const owningObservation = (inspection.observations || [])
        .find((item) => item.id === finding.observationId);
      const currentAnalysis = owningObservation?.analyses
        ?.filter((item) => item.status !== "superseded")
        .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
      const review = await saveHumanReview(finding.observationId, {
        findingId: finding.id,
        idempotencyKey: `dismiss:${finding.id}:${finding.revision}`,
        analysisId: currentAnalysis?.id || finding.selectedAnalysisId || "",
        decision: "dismissed",
        rationale: "Reviewed and removed by the inspector; not carried into the report.",
      });
      await finalizePersistedFinding(finding.observationId, {
        reviewId: review.id,
        hazardCategory: finding.hazardCategory || undefined,
        conclusion: finding.conclusion,
        segmentKey: finding.hazardKey,
        sourceCandidate: (finding.sourceCandidate || {}) as Record<string, unknown>,
      });
      const refreshed = await getPersistedInspection(inspection.id);
      setInspection(refreshed);
      setFindingIds((refreshed.findings || [])
        .filter((item) => item.status === "finalized")
        .map((item) => item.id));
      setStatus("Finding removed from this inspection.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The finding was not removed.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Bring back a candidate the customer chose not to confirm.
   *
   * There is no "un-dismiss" endpoint and none is needed: the customer is put back into the normal
   * review flow for that hazard, and saving it posts a fresh `accepted` review, which supersedes
   * the rejection and moves the finding from `dismissed` to `finalized`. Until they save, the
   * rejection stands. This keeps one path for "this becomes a finding" instead of inventing a
   * second way for a finding to come into existence.
   */
  function restoreCandidate(finding: PersistedFinding) {
    selectFinding(finding);
    setStep("hazlenz");
    setStatus("Reviewing a suggestion you had not confirmed. Saving it makes it a finding.");
  }

  /** Reopen a saved finding for editing: load its context and drop back to the HazLenz step. */
  function reviewFindingAgain(finding: PersistedFinding) {
    loadObservationContextFor(finding.id);
    setSelectedFindingId(finding.id);
    const findingRisk = riskSnapshotToReviewerRisk(finding.riskSnapshot);
    setReviewerRisk(findingRisk);
    setProposedRisk(findingRisk);
    setReviewerRiskReason("");
    prepareFindingWorkingState(finding);
    setStep("hazlenz");
    setStatus("Reviewing a saved finding. Saving again records a new review.");
  }

  /** Begin another finding: the capture form, with the inspection's own context carried over. */
  function startAnotherFinding() {
    beginAdditionalObservation();
  }

  const selectedFindingStandard = resolveSelectedFindingStandard(
    analysis,
    inspection?.findings || [],
    selectedFindingId,
  );
  const selectedFindingStandardBacking = getStandardBackingPresentation(selectedFindingStandard);
  // Standards for the SELECTED finding: all of them, ordered strongest first. Where several
  // standards genuinely apply, all are shown -- the objection was accuracy, not multiplicity.
  const findingStandards = resolveFindingStandards(selectedFindingDetail);

  // Clarification questions, presented as the way to RAISE a standard's confidence rather than as
  // a queue of things to answer before proceeding. None of them blocks saving a finding.
  const clarificationQuestions = (analysis?.guidedFinding?.clarificationQuestions
    || analysis?.clarificationQuestions
    || []) as Array<{ id: string; question: string; reason?: string; options?: string[]; decisionCritical?: boolean }>;

  // "candidates" is part of reading the HazLenz result, so it shares the HazLenz position rather
  // than adding a stage to the five-step bar.
  const barStep: Step = step === "candidates" ? "hazlenz" : step;
  const activeStepIndex = Math.max(0, STEP_ORDER.indexOf(barStep));

  // The candidates HazLenz proposed from the observation now on screen, still awaiting the
  // customer's confirmation.
  const proposedCandidates = (inspection?.findings || [])
    .filter((finding) => finding.observationId === observationId
      && finding.status === "pending_review"
      && finding.source !== "user_authored");
  const confirmedCount = proposedCandidates.filter((finding) => candidateSelection[finding.id]).length;

  const selectedIsUserAuthored = selectedFindingDetail?.source === "user_authored";

  /**
   * True when the action list holds only the blank manual slots -- nothing HazLenz suggested. The
   * editor is chosen by what there is to show, not by provenance, so a HazLenz-derived finding for
   * which the engine produced no action gets the same usable editor rather than an empty panel.
   */
  const hasOnlyManualActions = reviewerActions.length > 0
    && reviewerActions.every((action) => action.origin === "user" && action.id.startsWith("manual-"));

  /** Only the hazards HazLenz actually proposed from the observation on screen. */
  const hazlenzProposedForObservation = activeFindings
    .filter((finding) => finding.observationId === observationId && finding.source !== "user_authored");

  /**
   * Whether the reviewer has moved off the risk HazLenz computed FOR THIS FINDING.
   *
   * Compared against the finding's own `riskSnapshot.operationalRisk` -- the same values that seed
   * the matrix -- not against the observation-level guided assessment, which for a multi-hazard
   * observation describes whichever hazard happened to be primary. Always false for a user-authored
   * finding: HazLenz proposed nothing, so there is nothing to differ from.
   */
  const riskDiffersFromHazLenz = (() => {
    if (selectedIsUserAuthored) return false;
    const operational = (selectedFindingDetail?.riskSnapshot as { operationalRisk?: Record<string, unknown> } | null)
      ?.operationalRisk;
    const proposedSeverity = Number(operational?.severity);
    const proposedLikelihood = Number(operational?.likelihood);
    if (!Number.isFinite(proposedSeverity) || !Number.isFinite(proposedLikelihood)) return false;
    if (severity === null || likelihood === null) return false;
    return severity !== proposedSeverity || likelihood !== proposedLikelihood;
  })();

  /**
   * "Add a finding HazLenz missed". Rendered wherever the inspector is reading a HazLenz result,
   * because that is where they discover the omission.
   *
   * Deliberately a DIFFERENT action from "revise what I wrote": revising means the observation was
   * incomplete and HazLenz should re-analyse better evidence; this means the observation is fine
   * and HazLenz failed to spot something in it.
   */
  const missedFindingBlock = (
    <details
      className="guided-subcard"
      open={missedFormOpen}
      onToggle={(event) => setMissedFormOpen((event.currentTarget as HTMLDetailsElement).open)}
      data-testid="missed-finding"
    >
      <summary className="cursor-pointer font-bold">Add a finding HazLenz missed</summary>
      <p className="guided-muted mt-1 text-sm">
        For a hazard you can see in what you recorded but HazLenz did not identify. It becomes a
        normal finding: you set its risk and corrective action, and it goes in the report. It will
        be recorded as identified by you, with no standard attached unless HazLenz later finds one.
      </p>
      <div className="mt-3 space-y-2">
        <label className="block text-sm font-bold">
          What did HazLenz miss?
          <input
            value={missedHazardTitle}
            onChange={(event) => setMissedHazardTitle(event.target.value)}
            maxLength={160}
            placeholder="e.g. No lockout applied before guard removal"
            className="guided-input mt-1"
          />
        </label>
        <details>
          <summary className="cursor-pointer text-sm font-semibold">
            Add detail (only if what you wrote does not already describe it)
          </summary>
          <textarea
            aria-label="Additional detail for the missed hazard"
            value={missedHazardDetail}
            onChange={(event) => setMissedHazardDetail(event.target.value)}
            className="guided-input mt-2 min-h-20"
          />
        </details>
        <button
          type="button"
          disabled={busy || missedHazardTitle.trim().length < 3}
          onClick={() => void addMissedFinding()}
          className="guided-primary-button"
          data-testid="add-missed-finding"
        >
          {busy ? "Adding…" : "Add this finding"}
        </button>
      </div>
    </details>
  );

  /**
   * Responsible party and the governed deadline, shown together because they are the two facts
   * about WHO and WHEN.
   *
   * The due date is displayed, never entered: the risk the customer just confirmed establishes it,
   * and showing the reason ("Based on High risk — 3 days") is what makes that legible rather than
   * arbitrary. The server's own policy value is what gets persisted; this renders the same rule so
   * the date can be shown before the save round-trip, and `check:risk-band-parity` holds the two in
   * agreement.
   */
  const responsibleAndDueBlock = (
    <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-white/15">
      <label className="block font-bold">
        Responsible person <span className="font-normal text-slate-500">(optional)</span>
        <input
          value={responsiblePerson}
          onChange={(event) => setResponsiblePerson(event.target.value)}
          maxLength={160}
          placeholder="Name or role"
          className="guided-input mt-1"
          data-testid="responsible-person"
        />
        <span className="mt-1 block text-xs font-normal text-slate-600 dark:text-slate-300">
          Who is responsible for completing the corrective action? Leave blank if it is not yet
          decided — it will show as Unassigned.
        </span>
      </label>

      <div>
        <p className="font-bold">Due date</p>
        {matrixRisk ? (
          <>
            <p className="text-sm">
              {governedDueDate(matrixRisk.overallRisk as RiskBandLabel, new Date())
                .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="guided-muted text-xs">
              Based on {matrixRisk.overallRisk} risk — {RISK_BAND_DUE_DAYS[matrixRisk.overallRisk as RiskBandLabel]}{" "}
              {RISK_BAND_DUE_DAYS[matrixRisk.overallRisk as RiskBandLabel] === 1 ? "day" : "days"}
            </p>
          </>
        ) : (
          <p className="guided-muted text-sm">Set once you confirm the risk above.</p>
        )}
      </div>
    </div>
  );

  /** Honest provenance line. Never shown for a HazLenz-derived finding, and never inverted. */
  const userAuthoredNotice = (
    <p className="rounded-lg border border-slate-400 bg-slate-50 p-2 text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      You identified this finding. HazLenz did not propose it, so there is no HazLenz confidence or
      standard for it unless one is established separately.
    </p>
  );
  const savedFindings = activeFindings.filter((finding) => finding.status === "finalized");

  /**
   * Findings that would stop the server completing the inspection.
   *
   * Driven by `readiness.blockingFindingIds` -- the server's own list -- so the Finish screen can
   * never omit something that would then be rejected. Falls back to the local "not finalized and
   * not dismissed" reading only until the first readiness response arrives.
   */
  const unresolvedFindings = readiness
    ? activeFindings.filter((finding) => readiness.blockingFindingIds.includes(finding.id))
    : activeFindings.filter((finding) => finding.status !== "finalized" && finding.status !== "dismissed");

  /**
   * The reviewer-confirmed remediation plan for a finding, read back from the human review that
   * finalized it. One plan per finding, matching the domain model -- the three fields are parts of
   * a single remediation plan, not three action records.
   */
  function reviewedPlanFor(finding: PersistedFinding): { lines: string[]; responsible: string } {
    const owningObservation = (inspection?.observations || [])
      .find((item) => item.id === finding.observationId);
    const review = (owningObservation?.reviews || [])
      .find((item) => item.id === finding.finalReviewId) as
        | { reviewedConclusion?: { correctiveAction?: Record<string, unknown> } }
        | undefined;
    const action = review?.reviewedConclusion?.correctiveAction || {};
    // Records written before the label fix carry their kind label inside the stored value, which
    // read as "Immediate: Immediate protective action: ...". Stripped here rather than rewritten in
    // the database: the stored review is a signed record of what the reviewer confirmed, and a
    // cosmetic prefix is not worth mutating history for.
    const stripKindPrefix = (text: string, kind: ReviewerAction["kind"]) =>
      text.replace(new RegExp(`^${ACTION_KIND_LABELS[kind]}:\\s*`, "i"), "");
    const lines = ([
      ["Immediate", action.immediateAction, "immediate"],
      ["Permanent", action.permanentCorrection, "prevention"],
      ["Verify", action.verificationStep, "verification"],
    ] as const)
      .map(([label, value, kind]) => {
        const text = stripKindPrefix(String(value || "").trim(), kind as ReviewerAction["kind"]);
        return text ? `${label}: ${text}` : "";
      })
      .filter(Boolean);
    return { lines, responsible: String(action.responsiblePerson || "").trim() };
  }

  return (
    <main className="guided-page mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header>
        {/* sky-600 measured 3.57:1 on this panel, under the 4.5 normal-text requirement.
            sky-700 is the same hue family and measures 5.26:1. */}
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">Safety InSite</p>
        <h1 className="mt-2 text-3xl font-black">{inspection?.title || "Inspection"}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          HazLenz AI is advisory. Applicability depends on facts and jurisdiction; a qualified
          safety professional must verify every finding before finalization.
        </p>
      </header>

      {/* Five steps share the width of a phone screen, so every label has to survive being about
          70px wide. Labels name the customer's task, not the internal state machine. */}
      <nav aria-label="Inspection progress" className="guided-progress">
        {STEP_ORDER.map((item, index) => (
          <span key={item} aria-current={index === activeStepIndex ? "step" : undefined}
            className={index === activeStepIndex ? "guided-progress-step is-current" : "guided-progress-step"}>
            {index + 1}. {STEP_LABELS[item]}
          </span>
        ))}
      </nav>

      <div role="status" aria-live="polite" className="guided-info">
        {status}
      </div>

      {/* Non-blocking save confirmation. Announced to assistive technology, dismissed on its own,
          and never in the way of recording the next condition. */}
      {savedFlash && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900"
          data-testid="saved-flash"
        >
          ✓ {savedFlash}
        </p>
      )}

      {/*
        RUNNING INSPECTION SUMMARY.

        Compact and collapsed by default so the capture screen stays a capture screen. It exists so
        the inspector can recognise what they have already recorded and reopen any of it, without a
        separate page in the loop.

        The count is `savedFindings` -- findings that completed Review and are `finalized`. A
        dismissed candidate is not a finding and is excluded; a candidate still pending review is
        not yet a saved finding and is excluded; a user-authored finding that went through the
        normal Review -> Save flow is a genuine finding and counts exactly like any other.

        "Finish inspection" lives here, so it is persistently reachable from every step once there
        is something to finish, without competing with the primary capture action lower down the
        page. It is absent entirely until the first finding is saved.
      */}
      {inspection && savedFindings.length > 0 && step !== "finalize" && (
        <section className="guided-card" data-testid="running-summary">
          {/* The list is full width and BELOW the action row. Nesting it inside a side-by-side flex
              child collapsed each finding to a ~60px column at a 390px viewport, breaking every
              title onto four lines. */}
          <details data-testid="running-summary-details">
            <summary className="cursor-pointer font-black">
              Findings ({savedFindings.length})
            </summary>
            <ul className="mt-2 space-y-1">
              {savedFindings.map((finding) => {
                const band = finding.riskSnapshot as { overallRisk?: string; riskBand?: string } | null;
                return (
                  <li key={finding.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => reviewFindingAgain(finding)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      {findingDisplayTitle(finding)}
                      <span className="guided-muted"> — {band?.overallRisk || band?.riskBand || "Risk not set"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Recording the next condition is the primary thing an inspector does mid-walk, so it
                  is reachable from every step -- not only from the moment just after a save. On the
                  capture step it is omitted, because that IS this action. */}
              {step !== "capture" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={startAnotherFinding}
                  className="min-h-10 rounded-lg bg-sky-700 px-4 font-bold text-white"
                  data-testid="add-finding"
                >
                  + Record another condition
                </button>
              )}
              {/* Secondary by design: while findings are still being collected, finishing must not
                  compete with collecting. */}
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep("finalize")}
                className="min-h-10 rounded-lg border border-slate-700 px-4 font-bold"
                data-testid="finish-inspection"
              >
                Finish inspection
              </button>
            </div>
          </div>
        </section>
      )}

      {/*
        THE FINDING BUILDER.

        Pinned directly under the progress bar and rendered in the SAME position on every step of a
        finding, so the customer can always see the finding they are assembling and what is still
        blank. It fills in as they progress: the hazard and standard arrive from HazLenz on step 2,
        the risk on step 3, the corrective action on step 3, and step 4 is a read-back of the whole
        thing. It is deliberately absent on the capture step (nothing exists to summarise yet) and
        on the finalize page (which is inspection-level, not finding-level).
      */}
      {inspection && selectedFindingDetail && step !== "capture" && step !== "candidates" && step !== "finalize" && (
        <section className="guided-card space-y-2" aria-label="Finding builder" data-testid="finding-builder">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="guided-eyebrow">Finding you are building</p>
            {activeFindingCount > 1 && (
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {reviewedFindingCount} of {activeFindingCount} saved in this inspection
              </p>
            )}
          </div>
          <h2 className="text-lg font-black">{findingDisplayTitle(selectedFindingDetail)}</h2>
          {selectedIsUserAuthored && (
            <p className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Identified by you · not proposed by HazLenz
            </p>
          )}
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-bold">Where</dt>
              <dd className="text-slate-700 dark:text-slate-300">{workArea || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="font-bold">Standard</dt>
              <dd className="text-slate-700 dark:text-slate-300">
                {findingStandards.length
                  ? `${findingStandards[0].citation}${findingStandards.length > 1 ? ` +${findingStandards.length - 1} more` : ""}`
                  : "Not established"}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Risk</dt>
              <dd className="text-slate-700 dark:text-slate-300">
                {matrixRisk ? `${matrixRisk.overallRisk} (${matrixRisk.score})` : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Corrective action</dt>
              <dd className="text-slate-700 dark:text-slate-300">
                {reviewerActions.filter((action) => action.selected).length
                  ? `${reviewerActions.filter((action) => action.selected).length} selected`
                  : "None selected"}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {step === "capture" && inspection && analysisLocked && (
        <section className="guided-card space-y-3">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <h2 className="text-sm font-black leading-5 text-amber-900">
              HazLenz AI analysis is available on the Pro plan.
            </h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">
              Your observation, photo evidence, and site details are saved to this
              inspection and stay exactly as you entered them. Pro adds the HazLenz AI
              hazard analysis, suggested MSHA / OSHA standards, risk scoring, recorded
              findings, corrective actions, and the generated report.
            </p>
            <AppLinkButton
              href="/upgrade"
              variant="accent"
              className="mt-3 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-center !text-white"
            >
              Upgrade to Pro
            </AppLinkButton>
          </div>
          <button type="button" onClick={() => setAnalysisLocked(false)} className="guided-secondary-button">
            Back to the observation
          </button>
        </section>
      )}

      {/* ---------------------------------------------------------------- STEP 1 — WHAT YOU SAW */}
      {step === "capture" && inspection && !analysisLocked && (
        <section className="guided-card space-y-3">
          {captureMode === "additional" && (
            <div className="guided-subcard space-y-2" data-testid="additional-observation-banner">
              {/* Kept short. The running summary above already shows what has been recorded, so
                  this only needs to say what this screen is for. */}
              <h2 className="font-black">Next condition</h2>
              <p className="guided-muted text-sm">
                Added to this same inspection, under {regulatoryContextLabel(jurisdiction)}.
              </p>
              <button type="button" disabled={busy} onClick={cancelAdditionalObservation} className="guided-secondary-button">
                Cancel
              </button>
            </div>
          )}

          {/* Photo leads: the customer is standing in front of the hazard with a phone.
              `capture="environment"` opens the rear camera directly on a mobile browser and is
              ignored on desktop, where this stays an ordinary file picker. */}
          <label htmlFor="evidence" className="block font-bold">
            Photo <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)}
            className="block min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-950"
          />
          {evidenceFile && <p className="text-sm">Selected: {evidenceFile.name}</p>}

          <label htmlFor="observation" className="block font-bold">What did you see?</label>
          <textarea
            id="observation"
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            rows={7}
            maxLength={20000}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="What was wrong, what was running, and who could be exposed."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block font-bold">
              Where <span className="font-normal text-slate-500">(optional)</span>
              <input
                value={workArea}
                onChange={(event) => setWorkArea(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
                placeholder="e.g. crusher drive"
              />
            </label>
            <label className="block font-bold">
              Task being done <span className="font-normal text-slate-500">(optional)</span>
              <input
                value={workActivity}
                onChange={(event) => setWorkActivity(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
                placeholder="e.g. clearing a jam"
              />
            </label>
          </div>

          {/* Already set for the inspection and inherited by every finding. Kept here as a
              correction affordance, pre-filled, not as a question asked a second time. */}
          <label className="block font-bold">
            Regulatory context <span className="font-normal text-slate-500">(set for this inspection)</span>
            <select
              aria-label="Regulatory context"
              value={jurisdiction}
              disabled={busy}
              onChange={(event) => void persistRegulatoryContext(event.target.value as RegulatoryContext)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
            >
              <option value="unknown" disabled>Select regulatory context</option>
              {REGULATORY_CONTEXT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button disabled={busy || observation.trim().length < 3} onClick={analyze} className="guided-primary-button">
            {busy ? "Working…" : "Review with HazLenz AI"}
          </button>
        </section>
      )}

      {/* -------------------------------------------------- CANDIDATE CONFIRMATION (multi only) */}
      {step === "candidates" && inspection && (
        <section className="guided-card space-y-4" data-testid="candidate-confirmation">
          {/* Two states share this screen: candidates to confirm, and the honest "nothing found"
              case. The second is not an error -- HazLenz simply could not identify a hazard in what
              was written -- and it must not be dressed up as a list of zero candidates. */}
          {proposedCandidates.length === 0 ? (
            <div>
              <h2 className="text-xl font-black">HazLenz did not identify a hazard here</h2>
              <p className="guided-muted mt-1 text-sm">
                Nothing was recorded as a finding. If a hazard is present, either add more detail to
                what you wrote and run it again, or record the finding yourself below.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-black">
                HazLenz found {proposedCandidates.length} possible finding{proposedCandidates.length === 1 ? "" : "s"}
              </h2>
              <p className="guided-muted mt-1 text-sm">
                Tick the ones that are real findings. Anything you leave unticked is not recorded as a
                finding, creates no corrective action, and does not appear in your report — you do not
                have to review it or explain why.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {proposedCandidates.map((finding) => {
              const fragment = (finding.sourceCandidate as { observationFragment?: string } | null)?.observationFragment;
              const standards = resolveFindingStandards(finding);
              const snapshot = finding.riskSnapshot as { riskBand?: string; overallRisk?: string } | null;
              const band = snapshot?.riskBand || snapshot?.overallRisk || "Not established";
              const checked = !!candidateSelection[finding.id];
              return (
                <label
                  key={finding.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${checked ? "border-sky-700 bg-sky-50 dark:bg-sky-950" : "border-slate-300"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={busy}
                    onChange={() => setCandidateSelection((current) => ({ ...current, [finding.id]: !current[finding.id] }))}
                    className="mt-1 h-5 w-5"
                  />
                  <span className="min-w-0">
                    <span className="block font-black">{findingDisplayTitle(finding)}</span>
                    {fragment && (
                      <span className="guided-muted mt-1 block text-sm">
                        From what you wrote: “{fragment}”
                      </span>
                    )}
                    <span className="mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Risk {band}
                      {standards.length > 0
                        ? ` · ${standards[0].citation}${standards.length > 1 ? ` +${standards.length - 1}` : ""}`
                        : " · no standard matched"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {proposedCandidates.length > 0 && (
            <p className="guided-muted text-sm">
              {confirmedCount} of {proposedCandidates.length} selected.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {proposedCandidates.length > 0 && (
              <button
                disabled={busy || confirmedCount === 0}
                onClick={confirmCandidates}
                className="guided-primary-button"
                data-testid="confirm-candidates"
              >
                {busy
                  ? "Working…"
                  : confirmedCount === 0
                    ? "Tick at least one to continue"
                    : `Continue with ${confirmedCount} finding${confirmedCount === 1 ? "" : "s"}`}
              </button>
            )}
            <button
              disabled={busy}
              onClick={() => { setRevisionText(observation); setEditingObservation(true); setStep("hazlenz"); }}
              className={proposedCandidates.length === 0 ? "guided-primary-button" : "guided-secondary-button"}
            >
              {proposedCandidates.length === 0 ? "Revise what I wrote" : "None of these — revise what I wrote"}
            </button>
          </div>

          {missedFindingBlock}
        </section>
      )}

      {/* ------------------------------------------------------------------ STEP 2 — HAZLENZ */}
      {step === "hazlenz" && analysis && inspection && (
        <section className="guided-card space-y-4">
          {staleAnalysis && (
            <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
              <p>A newer server-backed analysis is available. Your clarification remains on this page, but it cannot overwrite the newer version.</p>
              <button type="button" className="mt-2 min-h-11 rounded-lg border border-amber-800 px-4 font-bold" onClick={() => window.location.reload()}>
                Refresh current analysis
              </button>
            </div>
          )}

          {/* The heading must describe whose assessment this is. For a finding the inspector added,
              HazLenz produced nothing and did not "flag" anything -- saying otherwise would credit
              the engine with the inspector's work. */}
          <div>
            <h2 className="text-xl font-black">
              {selectedIsUserAuthored ? "Finding you identified" : "HazLenz assessment"}
            </h2>
            {selectedIsUserAuthored ? (
              <p className="guided-muted mt-1 text-sm">
                HazLenz did not propose this hazard. The evidence is what you recorded for this
                observation.
              </p>
            ) : selectedFindingFragment ? (
              <p className="guided-muted mt-1 text-sm">
                Flagged from what you recorded: “{selectedFindingFragment}”
              </p>
            ) : null}
          </div>

          {/* APPLICABLE STANDARDS.
              Collapsed to citation number + title. Expanding one fetches its regulatory text on
              demand. Confidence sits on each standard, and opening it offers the questions that
              would raise it -- clarification is pulled by the reviewer, never pushed at them. */}
          <div className="space-y-2" aria-label="Applicable standards" data-testid="applicable-standards">
            <h3 className="font-black">
              Applicable standard{findingStandards.length === 1 ? "" : "s"}
              {findingStandards.length > 0 && ` (${findingStandards.length})`}
            </h3>
            {findingStandards.length === 0 && (
              <p className="guided-muted text-sm">
                {selectedIsUserAuthored
                  ? "You identified this hazard, so HazLenz has not matched a standard to it. None will be attached unless the engine independently finds one."
                  : "No standard has been established for this finding from the evidence recorded so far."}
              </p>
            )}
            {findingStandards.map((candidate) => {
              const backing = getStandardBackingPresentation({
                citation: candidate.citation,
                backingStatus: candidate.backingStatus,
                simplifiedRequirement: candidate.plainLanguageSummary || "",
              } as Parameters<typeof getStandardBackingPresentation>[0]);
              const expanded = expandedCitation === candidate.citation;
              const record = standardTexts[candidate.citation];
              const confidenceOpen = confidenceOpenFor === candidate.citation;
              return (
                <article key={candidate.citation} className="rounded-lg border border-slate-300 p-3">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => void toggleStandardText(candidate.citation)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <span>
                      <StandardCitationHeading
                        citation={candidate.citation}
                        title={candidate.title || candidate.family}
                      />
                    </span>
                    <span aria-hidden className="mt-1 shrink-0 text-lg font-black">{expanded ? "−" : "+"}</span>
                  </button>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className={candidate.applicability === "direct"
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-amber-900"}>
                      {candidate.applicability === "direct" ? "Applies" : "Candidate"}
                    </span>
                    {backing.verifiedBadge && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{backing.verifiedBadge}</span>
                    )}
                    <button
                      type="button"
                      aria-expanded={confidenceOpen}
                      onClick={() => setConfidenceOpenFor(confidenceOpen ? "" : candidate.citation)}
                      className="rounded-full border border-slate-500 px-3 py-0.5 font-bold"
                    >
                      Confidence: {candidateConfidenceLabel(candidate.confidence, candidate.applicability)} ⓘ
                    </button>
                  </div>

                  {/* Raise-the-confidence questions. Answering one re-runs the analysis; skipping
                      them all is always allowed, because none of them blocks the review. */}
                  {confidenceOpen && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:bg-slate-900">
                      {candidate.missingPredicates?.length > 0 && (
                        <>
                          <p className="text-sm font-bold">What would raise this</p>
                          <ul className="mt-1 list-disc pl-5 text-sm">
                            {candidate.missingPredicates.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </>
                      )}
                      {clarificationQuestions.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {clarificationQuestions.map((question) => (
                            <fieldset key={question.id}>
                              <legend className="text-sm font-semibold">{question.question}</legend>
                              {question.reason && <p className="guided-muted mt-1 text-xs">{question.reason}</p>}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {(question.options || ["Yes", "No", "Not sure"]).map((option) => (
                                  <button
                                    key={option}
                                    disabled={busy}
                                    onClick={() => reanalyze({ questionId: question.id, answer: option })}
                                    className="min-h-11 rounded-lg border border-slate-500 px-4 text-sm font-semibold"
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                        </div>
                      ) : (
                        <p className="guided-muted mt-2 text-sm">
                          There is no question HazLenz can ask that would change this. Confidence is
                          limited by the evidence itself — adding detail to the observation and
                          reanalyzing is the way to raise it.
                        </p>
                      )}
                      <p className="guided-muted mt-3 text-xs">
                        Answering is optional. Nothing here blocks saving the finding.
                      </p>
                    </div>
                  )}

                  {candidate.explanation && (
                    <p className="mt-2 text-sm"><span className="font-bold">Why: </span>{candidate.explanation}</p>
                  )}

                  {expanded && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:bg-slate-900">
                      {standardTextLoading === candidate.citation && <p className="guided-muted">Loading the regulatory text…</p>}
                      {standardTextLoading !== candidate.citation && record && (
                        <>
                          {record.matchScope === "parent-section" && (
                            <p className="guided-muted mb-2 text-xs">
                              InSite holds this standard at section level. The text below is{" "}
                              <strong>{record.citation}</strong>, which contains the cited paragraph.
                            </p>
                          )}
                          {record.heading && <p className="font-bold">{record.heading}</p>}
                          <p className="mt-1 whitespace-pre-wrap">{record.textPlain}</p>
                        </>
                      )}
                      {standardTextLoading !== candidate.citation && !record && (
                        <p className="guided-muted">
                          The regulatory text for this citation is not available in InSite yet.
                          {candidate.plainLanguageSummary && backing.allowsContentText
                            ? " HazLenz's summary is shown above."
                            : ""}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Revise and reanalyze, at the bottom of the assessment where it belongs: it is what
              you do when the assessment is wrong, not the first thing you read. */}
          <details className="guided-subcard">
            <summary className="cursor-pointer font-bold">Not right? Revise what you wrote</summary>
            {editingObservation ? (
              <>
                <textarea aria-label="Revise persisted observation" value={revisionText} onChange={event => setRevisionText(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={busy || revisionText.trim().length < 3} onClick={saveObservationRevision} className="guided-primary-button">Save revision</button>
                  <button type="button" disabled={busy} onClick={() => setEditingObservation(false)} className="guided-secondary-button">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900">{observation}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => { setRevisionText(observation); setEditingObservation(true); }} className="guided-secondary-button">
                    Edit the observation
                  </button>
                  <button type="button" disabled={busy} onClick={reanalyzeCurrentObservation} className="guided-secondary-button">
                    Reanalyze
                  </button>
                </div>
              </>
            )}
          </details>

          {/* Correcting a fact HazLenz misread is a genuine safety action, so it stays available --
              but behind a disclosure, because most reviews never need it. */}
          {reviewFacts.length > 0 && (
            <details className="guided-subcard">
              <summary className="cursor-pointer font-bold">Correct what HazLenz read</summary>
              <p className="guided-muted mt-1 text-sm">
                Unknown facts stay unknown; they are never treated as observed.
              </p>
              <div className="mt-3 space-y-3">
                {reviewFacts.map((item, index) => (
                  <label key={item.id} className="block text-sm font-semibold">
                    {item.type.replace(/([A-Z])/g, " $1")}
                    <input
                      aria-label={`Correct ${item.type}`}
                      value={Array.isArray(item.value) ? item.value.join(", ") : String(item.value ?? "")}
                      onChange={(event) =>
                        setReviewFacts((facts) =>
                          facts.map((fact, factIndex) =>
                            factIndex === index ? { ...fact, value: event.target.value } : fact,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-600">
                      Source: {item.source.replaceAll("_", " ")} · {item.status}
                    </span>
                  </label>
                ))}
              </div>
              <button disabled={busy} onClick={() => reanalyze()} className="guided-secondary-button mt-3">
                Re-run after corrections
              </button>
            </details>
          )}

          {/* Other hazards HazLenz raised from the SAME observation. Shown here so the reviewer
              knows what else is queued, without leaving the finding they are working on. */}
          {/* Everything HazLenz proposed from this observation, INCLUDING what the customer did not
              confirm. Nothing is silently discarded: an unconfirmed suggestion stays visible and
              one tap brings it back, and its state is stated honestly rather than as "Saved".
              User-authored findings are excluded by construction -- HazLenz did not propose them,
              and counting them here would misattribute the inspector's own work to the engine. */}
          {hazlenzProposedForObservation.length > 1 && (
            <details className="guided-subcard">
              <summary className="cursor-pointer font-bold">
                HazLenz proposed {hazlenzProposedForObservation.length} hazards from this observation
              </summary>
              <div className="mt-2 space-y-2">
                {hazlenzProposedForObservation
                  .map((finding) => (
                    <div key={finding.id} className={`rounded-lg border p-2 text-sm ${selectedFindingId === finding.id ? "border-sky-700 bg-sky-50" : "border-slate-300"}`}>
                      <p className="font-bold">{findingDisplayTitle(finding)}</p>
                      <p className="text-xs">
                        {finding.status === "dismissed"
                          ? "Not confirmed — not in the report"
                          : finding.status === "finalized"
                            ? "Saved as a finding"
                            : "Confirmed — not yet saved"}
                      </p>
                      {finding.status === "dismissed" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void restoreCandidate(finding)}
                          className="mt-1 min-h-9 rounded-lg border border-slate-700 px-3 text-xs font-bold"
                        >
                          Actually, include this one
                        </button>
                      ) : selectedFindingId !== finding.id && (
                        <button type="button" disabled={busy} onClick={() => selectFinding(finding)} className="mt-1 min-h-9 rounded-lg border border-slate-700 px-3 text-xs font-bold">
                          Work on this one
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </details>
          )}

          {missedFindingBlock}

          <button disabled={busy} onClick={() => setStep("risk")} className="guided-primary-button">
            Continue to risk
          </button>
        </section>
      )}

      {/* --------------------------------------------------------------- STEP 3 — RISK & FIX */}
      {step === "risk" && inspection && selectedFindingDetail && (
        <section className="guided-card space-y-5">
          <div>
            <h2 className="text-xl font-black">Risk and corrective action</h2>
            <p className="guided-muted mt-1 text-sm">
              Confirm the risk for this finding, then choose what will be done about it.
            </p>
          </div>

          {selectedIsUserAuthored && userAuthoredNotice}

          <RiskReviewSection
            activeRiskScale={riskScale}
            safeScopeResult={{
              risk: {
                operationalRisk: (selectedFindingDetail.riskSnapshot as { operationalRisk?: Record<string, unknown> } | null)?.operationalRisk,
              },
            }}
            severity={severity}
            setSeverity={setSeverity}
            likelihood={likelihood}
            setLikelihood={setLikelihood}
          />

          {/*
            The rationale field is PROVENANCE-AWARE, because the same words are not true of both
            kinds of finding.

            A user-authored finding has no HazLenz risk proposal, so there is nothing to "disagree
            with" and nothing to have "changed" -- the matrix selection IS the risk decision, and the
            rationale is supporting human reasoning. A HazLenz-derived finding does have a proposal,
            so when the reviewer moves off it the field keeps its existing wording, explicitly tied
            to changing HazLenz's assessment; when they accept it, there is nothing to justify and
            the field collapses out of the way.

            Optional in every case. The matrix selection is the authoritative risk decision and the
            rationale is never a completion requirement.
          */}
          {selectedIsUserAuthored ? (
            <div>
              <label className="block font-bold">
                Why this risk? <span className="font-normal text-slate-500">(optional)</span>
                <textarea
                  aria-label="Risk rationale"
                  value={reviewerRiskReason}
                  onChange={event => setReviewerRiskReason(event.target.value)}
                  className="guided-input mt-1 min-h-20"
                />
              </label>
            </div>
          ) : riskDiffersFromHazLenz ? (
            <div>
              <label className="block font-bold">
                Why you changed it <span className="font-normal text-slate-500">(you have moved off HazLenz&apos;s assessment)</span>
                <textarea value={reviewerRiskReason} onChange={event => setReviewerRiskReason(event.target.value)}
                  className="guided-input mt-1 min-h-20" />
              </label>
            </div>
          ) : (
            <details>
              <summary className="cursor-pointer font-bold">
                Add a note about this risk <span className="font-normal text-slate-500">(optional)</span>
              </summary>
              <textarea
                aria-label="Risk rationale"
                value={reviewerRiskReason}
                onChange={event => setReviewerRiskReason(event.target.value)}
                className="guided-input mt-2 min-h-20"
              />
            </details>
          )}

          {/* CORRECTIVE ACTIONS for this finding, from its own HazLenz intelligence. The reviewer
              may deselect any of them, edit the wording, or add their own. */}
          {/*
            MANUAL EDITOR — shown when there is nothing to suggest, which is always the case for a
            hazard the inspector identified themselves.

            The three fields are the existing domain fields, unchanged; only the labels and the
            placeholder guidance are new. Placeholders describe the SHAPE of the answer and never
            supply one: pre-filling substantive text would be pseudo-HazLenz content attached to a
            hazard HazLenz never assessed. The heading is what the inspector needs to do, not an
            apology for what the engine did not do -- the provenance note is secondary and small.
          */}
          {hasOnlyManualActions ? (
            <div className="space-y-3" data-testid="corrective-actions">
              <div>
                <h3 className="font-black">Add corrective action</h3>
                {selectedIsUserAuthored && (
                  <p className="guided-muted mt-1 text-sm">
                    You identified this finding, so no HazLenz corrective action was generated.
                  </p>
                )}
              </div>
              {reviewerActions.map((action) => (
                <label key={action.id} className="block font-bold">
                  {ACTION_KIND_LABELS[action.kind]}
                  {action.kind === "immediate" && (
                    <span className="font-normal text-slate-500"> — interim control</span>
                  )}
                  <textarea
                    aria-label={ACTION_KIND_LABELS[action.kind]}
                    value={action.detail}
                    placeholder={ACTION_KIND_PLACEHOLDERS[action.kind]}
                    onChange={(event) => editReviewerAction(action.id, event.target.value)}
                    className="guided-input mt-1 min-h-20"
                  />
                </label>
              ))}
              <p className="guided-muted text-sm">
                Anything you leave blank is simply not recorded.
              </p>
              {responsibleAndDueBlock}
            </div>
          ) : (
          <div className="space-y-3" data-testid="corrective-actions">
            <h3 className="font-black">What will be done</h3>
            {reviewerActions.map((action) => (
              <div key={action.id} className="rounded-lg border border-slate-300 p-3">
                <label className="flex items-start gap-2 font-bold">
                  <input
                    type="checkbox"
                    checked={action.selected}
                    onChange={() => toggleReviewerAction(action.id)}
                    className="mt-1"
                  />
                  <span>
                    {action.title}
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {ACTION_KIND_LABELS[action.kind]}
                      {action.origin === "user" ? " · added by you" : " · suggested by HazLenz"}
                    </span>
                  </span>
                </label>
                {action.selected && (
                  <textarea
                    aria-label={`Detail for ${action.title}`}
                    value={action.detail}
                    onChange={(event) => editReviewerAction(action.id, event.target.value)}
                    className="guided-input mt-2 min-h-16"
                  />
                )}
              </div>
            ))}

            <details className="guided-subcard">
              <summary className="cursor-pointer font-bold">Add your own action</summary>
              <div className="mt-2 space-y-2">
                <label className="block text-sm font-bold">
                  Type
                  <select
                    value={newActionKind}
                    onChange={(event) => setNewActionKind(event.target.value as ReviewerAction["kind"])}
                    className="guided-input mt-1"
                  >
                    <option value="immediate">Immediate protective action</option>
                    <option value="prevention">Permanent correction</option>
                    <option value="verification">Verification step</option>
                  </select>
                </label>
                <label className="block text-sm font-bold">
                  Title
                  <input value={newActionTitle} onChange={(event) => setNewActionTitle(event.target.value)} className="guided-input mt-1" />
                </label>
                <label className="block text-sm font-bold">
                  What will be done
                  <textarea value={newActionDetail} onChange={(event) => setNewActionDetail(event.target.value)} className="guided-input mt-1 min-h-20" />
                </label>
                <button type="button" onClick={addReviewerAction} disabled={!newActionTitle.trim() && !newActionDetail.trim()} className="guided-secondary-button">
                  Add action
                </button>
              </div>
            </details>
            {responsibleAndDueBlock}
          </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStep("hazlenz")} className="guided-secondary-button">Back</button>
            <button
              disabled={busy || !matrixRisk}
              onClick={() => setStep("review")}
              className="guided-primary-button"
            >
              {matrixRisk ? "Continue to review" : "Select a risk cell to continue"}
            </button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ STEP 4 — REVIEW */}
      {step === "review" && inspection && selectedFindingDetail && (
        <section className="guided-card space-y-4">
          <div>
            <h2 className="text-xl font-black">Check this finding before saving</h2>
            <p className="guided-muted mt-1 text-sm">
              Saving records your review against this finding. You can reopen and change it until
              the report is generated.
            </p>
          </div>

          <div className="guided-subcard space-y-3">
            <div>
              <h3 className="font-black">{findingDisplayTitle(selectedFindingDetail)}</h3>
              {workArea && <p className="guided-muted text-sm">{workArea}</p>}
            </div>

            <div>
              <h4 className="font-bold">What you recorded</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm">{observation}</p>
            </div>

            {selectedIsUserAuthored && userAuthoredNotice}

            <div>
              <h4 className="font-bold">Standard{findingStandards.length === 1 ? "" : "s"}</h4>
              {findingStandards.length === 0 && (
                <p className="guided-muted text-sm">
                  {selectedIsUserAuthored
                    ? "None. HazLenz did not identify this hazard, so no standard has been matched to it."
                    : "Not established."}
                </p>
              )}
              <ul className="mt-1 space-y-1 text-sm">
                {findingStandards.map((candidate) => (
                  <li key={candidate.citation}>
                    <strong>{candidate.citation}</strong>
                    {candidate.title ? ` — ${candidate.title}` : ""}
                    <span className="guided-muted"> · {candidate.applicability === "direct" ? "applies" : "candidate"}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold">Risk</h4>
              <p className="mt-1 text-sm">
                {matrixRisk
                  ? `${matrixRisk.overallRisk} — severity ${severity} × likelihood ${likelihood} = ${matrixRisk.score}`
                  : "Not set"}
              </p>
              {reviewerRiskReason.trim() && <p className="guided-muted mt-1 text-sm">{reviewerRiskReason}</p>}
            </div>

            <div>
              <h4 className="font-bold">What will be done</h4>
              {reviewerActions.filter((action) => action.selected).length === 0 && (
                <p className="guided-muted text-sm">No corrective action selected.</p>
              )}
              <ul className="mt-1 space-y-2 text-sm">
                {reviewerActions.filter((action) => action.selected).map((action) => (
                  <li key={action.id}>
                    <strong>{ACTION_KIND_LABELS[action.kind]}: </strong>
                    {action.detail || action.title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Who and when, read back with the rest. Both were decided on the previous step -- one
                typed, one derived from the risk -- and a check-before-saving screen that omits them
                is not a complete read-back. "Unassigned" is stated plainly rather than left blank,
                so the customer sees what the report will say. */}
            <div>
              <h4 className="font-bold">Responsible person</h4>
              <p className="mt-1 text-sm">
                {responsiblePerson.trim() || <span className="guided-muted">Unassigned</span>}
              </p>
            </div>

            <div>
              <h4 className="font-bold">Due date</h4>
              <p className="mt-1 text-sm">
                {matrixRisk ? (
                  <>
                    {governedDueDate(matrixRisk.overallRisk as RiskBandLabel, new Date())
                      .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    <span className="guided-muted">
                      {" "}— based on {matrixRisk.overallRisk} risk
                    </span>
                  </>
                ) : "Not set"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStep("risk")} className="guided-secondary-button">Back</button>
            <button disabled={busy} onClick={acceptReview} className="guided-primary-button" data-testid="save-finding">
              {busy ? "Saving…" : "Save finding"}
            </button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ STEP 5 — FINISH
          The purpose of this screen is COMPLETING THE INSPECTION. The report is what completion
          produces, not the thing the customer is here to do. It shows every current finding --
          including any that still block completion -- with the accountability the inspector is
          about to commit to: what will be done, by whom, and by when. */}
      {step === "finalize" && inspection && (
        <section className="space-y-4" data-testid="finalize-page">
          <div className="guided-card">
            <h2 className="text-xl font-black">Finish this inspection</h2>
            <p className="guided-muted mt-1 text-sm">
              Review your findings and corrective actions before finishing.
            </p>

            {/* READINESS, straight from the server's own completion contract. Never a frontend
                approximation: `readiness` is the same evaluation `transition` enforces. */}
            {readiness && (
              <p
                className={`mt-3 rounded-xl border p-3 text-sm font-black ${readiness.ready
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-sky-300 bg-sky-50 text-sky-900"}`}
                data-testid="completion-readiness"
                role="status"
              >
                {readiness.ready ? (
                  <>Ready to finish — {readiness.reportableCount} finding{readiness.reportableCount === 1 ? "" : "s"} reviewed</>
                ) : readiness.reasons.includes("NO_CURRENT_FINDING") ? (
                  <>Record at least one finding before finishing.</>
                ) : readiness.reasons.includes("NO_OBSERVATION") ? (
                  <>Record an observation before finishing.</>
                ) : (
                  <>
                    {readiness.blockingFindingIds.length} finding
                    {readiness.blockingFindingIds.length === 1 ? "" : "s"} need
                    {readiness.blockingFindingIds.length === 1 ? "s" : ""} review before you can finish
                  </>
                )}
              </p>
            )}

            <div className="mt-3">
              <button disabled={busy} onClick={startAnotherFinding} className="guided-secondary-button">
                + Add another finding
              </button>
            </div>
          </div>

          {/* UNRESOLVED FIRST. A finding that would block the server must be visible and actionable
              here -- pressing Finish and meeting a validation error for something this screen never
              showed is the defect this replaces. */}
          {unresolvedFindings.map((finding) => (
            <article key={finding.id} className="guided-card space-y-2 border-sky-400" data-testid="unresolved-finding">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-black">{findingDisplayTitle(finding)}</h3>
                <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-black text-sky-900">
                  Needs review
                </span>
              </div>
              {finding.source === "user_authored" && (
                <p className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Identified by you
                </p>
              )}
              <p className="guided-muted text-sm">
                This finding has not been reviewed yet, so the inspection cannot be finished.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => reviewFindingAgain(finding)}
                  className="min-h-10 rounded-lg bg-sky-700 px-3 font-bold text-white"
                  data-testid="continue-review"
                >
                  Continue review
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void dismissFinding(finding)}
                  className="min-h-10 rounded-lg border border-red-700 px-3 font-bold text-red-800"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}

          {savedFindings.length === 0 && unresolvedFindings.length === 0 && (
            <div className="guided-card">
              <p className="guided-muted text-sm">
                No findings have been recorded yet. Add one before finishing.
              </p>
            </div>
          )}

          {/* COMPLETED FINDINGS. A compact read-back of what is being committed: the hazard, its
              risk, the standard, the remediation plan, who is responsible and when it is due. */}
          {savedFindings.map((finding) => {
            const standards = resolveFindingStandards(finding);
            const band = finding.riskSnapshot as { overallRisk?: string; riskBand?: string } | null;
            const bandLabel = band?.overallRisk || band?.riskBand || "Risk not set";
            const plan = reviewedPlanFor(finding);
            return (
              <article key={finding.id} className="guided-card space-y-2" data-testid="finalize-finding-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-black">{findingDisplayTitle(finding)}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-black uppercase text-slate-800">
                    {bandLabel}
                  </span>
                </div>

                {finding.source === "user_authored" && (
                  <p className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Identified by you · not proposed by HazLenz
                  </p>
                )}

                <p className="text-sm">
                  {standards.length ? (
                    <>
                      <strong>{standards[0].citation}</strong>
                      {standards[0].title ? ` — ${standards[0].title}` : ""}
                      {standards.length > 1 ? ` +${standards.length - 1} more` : ""}
                    </>
                  ) : (
                    <span className="guided-muted">
                      {finding.source === "user_authored"
                        ? "No standard matched — you identified this hazard"
                        : "No standard established"}
                    </span>
                  )}
                </p>

                {/* The remediation plan, presented compactly. One plan per finding, which is what
                    the domain model holds -- no separate action objects are invented here. */}
                {plan.lines.length > 0 ? (
                  <ul className="space-y-0.5 text-sm">
                    {plan.lines.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                ) : (
                  <p className="guided-muted text-sm">No corrective action recorded.</p>
                )}

                <p className="text-sm">
                  <span className="font-bold">Responsible: </span>
                  {plan.responsible || <span className="guided-muted">Unassigned</span>}
                  {bandLabel !== "Risk not set" && RISK_BAND_DUE_DAYS[bandLabel as RiskBandLabel] !== undefined && (
                    <>
                      {" · "}
                      <span className="font-bold">Due: </span>
                      {governedDueDate(bandLabel as RiskBandLabel, new Date())
                        .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </>
                  )}
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => reviewFindingAgain(finding)}
                    className="min-h-10 rounded-lg border border-slate-700 px-3 font-bold"
                  >
                    Edit / review
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void dismissFinding(finding)}
                    className="min-h-10 rounded-lg border border-red-700 px-3 font-bold text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}

          <div className="guided-card space-y-3">
            {hasPlanEntitlement("correctiveActionAssignments", planCode) ? (
              <>
                <button
                  disabled={busy || !readiness?.ready}
                  onClick={complete}
                  className="guided-primary-button"
                  data-testid="generate-report"
                >
                  {busy ? "Working…" : "Finish inspection"}
                </button>
                <p className="guided-muted text-sm">
                  {readiness?.ready
                    // One report per inspection: finishing an inspection that already has one
                    // replaces it rather than adding a version beside it.
                    ? "Finishes the inspection and creates its report."
                    : "Resolve the findings above to finish this inspection."}
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="text-sm font-black leading-5 text-amber-900">
                  Corrective actions and reports are available on the Pro plan.
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">
                  Everything you have recorded is saved to this inspection — upgrade to finish it and
                  create the report.
                </p>
                <AppLinkButton
                  href="/pricing"
                  variant="accent"
                  className="mt-3 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-center !text-white"
                >
                  Unlock reports
                </AppLinkButton>
              </div>
            )}

            {report && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
                <p className="font-black">Inspection finished. Your report is ready.</p>
                <button onClick={() => router.push("/reports")} className="mt-2 min-h-11 rounded-xl bg-emerald-800 px-5 font-bold text-white">
                  Open reports
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
