"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPersistedObservation,
  analyzeObservation,
  createPersistedCorrectiveAction,
  createPersistedTask,
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
  type HazLenzAnalysisResult,
  type HazLenzEvidenceFact,
  type RegulatoryContext,
} from "@/lib/canonicalWorkflowApi";
import { StandardCitationHeading } from "@/components/inspection/SafeScopeStandardsSection";
import { getStandardBackingPresentation } from "@/lib/inspection/standardDisplay";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { getStoredPlanCode, getVerifiedPlanCode, hasPlanEntitlement, type BillingTier } from "@/lib/planEntitlements";

type Step = "capture" | "review" | "risk" | "followup" | "complete";

const STEP_ORDER: Step[] = ["capture", "review", "risk", "followup", "complete"];

// Short forms, sized for a five-across progress bar on a 320px screen.
const STEP_LABELS: Record<Step, string> = {
  capture: "Capture",
  review: "Review",
  risk: "Risk",
  followup: "Action",
  complete: "Done",
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
  const [report, setReport] = useState<{ reportId: string; version: number; checksum: string } | null>(null);
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
  const activeFindingCount = activeFindings.length;
  const reviewedFindingCount = activeFindings.filter((finding) => finding.finalReviewId).length;

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
          setStep("review");
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
    setStatus("Describe the additional hazard. Your existing findings are saved and unaffected.");
  }

  function cancelAdditionalObservation() {
    setCaptureMode("initial");
    setStep("review");
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
      setSelectedFindingId((ownFindings[0] || currentFindings[0])?.id || "");
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
      setStep("review");
      setStatus(
        captureMode === "additional"
          ? "Additional hazard analysed and added to this inspection — earlier findings are unchanged."
          : "HazLenz assessment saved — review before finalizing.",
      );
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
      setStep("review");
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

  async function acceptReview() {
    if (!inspection || !analysis || !observationId || !analysisId) return;
    const riskChanged = (["severity", "likelihood", "exposure", "overallRisk"] as const)
      .some(field => reviewerRisk[field] !== proposedRisk[field]);
    if (riskChanged && !reviewerRiskReason.trim()) {
      setStatus("Explain the risk adjustment before finalizing the finding.");
      return;
    }
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
          decision: reviewerRiskReason.trim() ? "edited" : "accepted",
          rationale: reviewerRiskReason.trim() ||
            "Reviewed against the observed facts; accepted as an advisory conclusion.",
          reviewedConclusion: {
            guidedFinding: analysis.guidedFinding,
            reviewerRisk: { ...reviewerRisk, reviewerConfirmed: true },
            // Corrective actions are reviewed on the Action step, AFTER every finding is
            // finalized; the shared draft here is the whole-observation proposal and has not been
            // reviewed for THIS finding. Attaching it made every finding's finalize-time action
            // record carry the same (e.g. electrical) text -- the fall-protection finding's report
            // action read "Isolate the affected extension cord". Leaving it out lets the backend
            // use each finding's own finding-scoped corrective-action intelligence.
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
        setStep("review");
        setStatus(`Review saved for ${selectedFinding?.hazardCategory || selectedFinding?.hazardKey || "finding"}. ${remaining.length} current finding${remaining.length === 1 ? " remains" : "s remain"} unreviewed.`);
      } else {
        setStep("followup");
        setStatus("All current findings have a separate completed human review.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Review was not saved.");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!inspection || findingIds.length === 0) return;
    setBusy(true);
    setStatus("Saving corrective action, calendar task, and report…");
    try {
      if (!riskPolicy) {
        throw new Error("The governed risk urgency policy was not returned by the server.");
      }
      const dueDays = riskPolicy.dueDays;
      const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString();
      for (const [index, findingId] of findingIds.entries()) {
        const finding = (inspection.findings || []).find(item => item.id === findingId);
        // With a single finding the Action step's draft IS that finding's reviewed action (the
        // user just edited it). With several findings the one shared draft cannot be assumed to
        // describe each of them, so each finding gets the action matched to its own family (the
        // shared draft only as a fallback for a family with no mapping).
        const findingAction = finding && findingIds.length > 1
          ? safeActionDraftForFinding(finding, actionDraft)
          : actionDraft;
        const action = await createPersistedCorrectiveAction({
          inspectionId: inspection.id,
          findingId,
          title: findingIds.length > 1
            ? `Verify and correct reviewed condition ${index + 1}`
            : "Verify and correct reviewed condition",
          description: [
            `Immediate: ${findingAction.immediateAction}`,
            `Permanent: ${findingAction.permanentCorrection}`,
            `Verification: ${findingAction.verificationStep}`,
          ].join("\n"),
          priorityCode: riskPolicy.priority,
        });
        await createPersistedTask({
          inspectionId: inspection.id,
          correctiveActionId: typeof action.id === "string" ? action.id : undefined,
          title: findingIds.length > 1
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
      setInspection(completed);
      setReport(generated);
      setStep("complete");
      setStatus("Inspection, follow-up records, and immutable report saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Finalization did not complete.");
    } finally {
      setBusy(false);
    }
  }

  const selectedFindingStandard = resolveSelectedFindingStandard(
    analysis,
    inspection?.findings || [],
    selectedFindingId,
  );
  const selectedFindingStandardBacking = getStandardBackingPresentation(selectedFindingStandard);

  return (
    <main className="guided-page mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header>
        {/* sky-600 measured 3.57:1 on this panel, under the 4.5 normal-text requirement.
            sky-700 is the same hue family and measures 5.26:1. */}
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">Safety InSite</p>
        {/* "Server-saved inspection" described our persistence model, not the customer's task. */}
        <h1 className="mt-2 text-3xl font-black">{inspection?.title || "Inspection"}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          HazLenz AI is advisory. Applicability depends on facts and jurisdiction; a qualified
          safety professional must verify every finding before finalization.
        </p>
      </header>

      {/* Five steps share the width of a phone screen, so every label has to survive
          being about 70px wide. "Complete" did not: it wrapped to a second line and left
          that step taller than the other four. The labels below are the short forms. */}
      <nav aria-label="Inspection progress" className="guided-progress">
        {STEP_ORDER.map((item, index) => (
          <span key={item} aria-current={step === item ? "step" : undefined}
            className={step === item ? "guided-progress-step is-current" : "guided-progress-step"}>
            {index + 1}. {STEP_LABELS[item]}
          </span>
        ))}
      </nav>

      <div role="status" aria-live="polite" className="guided-info">
        {status}
      </div>

      {inspection && (
        <section className="guided-card">
          <p className="text-xs font-bold uppercase tracking-wider">This inspection</p>
          <p className="mt-1 text-sm">Status: {humanizeInspectionStatus(inspection.status)} · revision {inspection.version}</p>
          {activeFindingCount > 0 && (
            <p className="mt-1 text-sm" data-testid="inspection-finding-progress">
              Findings: <strong>{activeFindingCount}</strong> captured · {reviewedFindingCount} reviewed
              {reviewedFindingCount < activeFindingCount
                ? ` · ${activeFindingCount - reviewedFindingCount} still need your review`
                : " · all reviewed"}
            </p>
          )}
          <p className="mt-1 text-sm" data-testid="inspection-regulatory-context">
            Regulatory context: <strong>{regulatoryContextLabel(jurisdiction)}</strong>
            {jurisdiction === "unknown"
              ? " — HazLenz keeps standards conditional and will ask once if the agency matters."
              : " — set for this inspection; every finding inherits it."}
          </p>
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

      {step === "capture" && inspection && !analysisLocked && (
        <section className="guided-card space-y-3">
          {captureMode === "additional" && (
            <div className="guided-subcard space-y-2" data-testid="additional-observation-banner">
              <h2 className="font-black">Add another finding</h2>
              <p className="guided-muted text-sm">
                Describe the additional hazard you observed. It is added to this same inspection and
                keeps the regulatory context already set — {regulatoryContextLabel(jurisdiction)}.
                The {activeFindingCount} finding{activeFindingCount === 1 ? "" : "s"} you have
                already captured stay exactly as they are.
              </p>
              <button type="button" disabled={busy} onClick={cancelAdditionalObservation} className="guided-secondary-button">
                Cancel and go back to review
              </button>
            </div>
          )}
          <label htmlFor="evidence" className="block font-bold">
            Photo evidence <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)}
            className="block min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-950"
          />
          {evidenceFile && <p className="text-sm">Selected: {evidenceFile.name}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block font-bold">
              Location or area
              <input
                value={workArea}
                onChange={(event) => setWorkArea(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
                placeholder="e.g. crusher drive"
              />
            </label>
            <label className="block font-bold">
              Work activity <span className="font-normal text-slate-500">(optional)</span>
              <input
                value={workActivity}
                onChange={(event) => setWorkActivity(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
                placeholder="e.g. clearing a jam"
              />
            </label>
          </div>
          <label className="block font-bold">
            Regulatory context <span className="font-normal text-slate-500">(saved on this inspection)</span>
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
          <label htmlFor="observation" className="block font-bold">What did you observe?</label>
          <textarea
            id="observation"
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            rows={7}
            maxLength={20000}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Describe only what was directly observed, including controls and uncertainty."
          />
          <button disabled={busy || observation.trim().length < 3} onClick={analyze} className="min-h-11 rounded-xl bg-sky-700 px-5 font-bold text-white disabled:opacity-50">
            {captureMode === "additional" ? "Analyze and add this finding" : "Save and review with HazLenz AI"}
          </button>
        </section>
      )}

      {step === "review" && analysis && inspection && (
        <section className="guided-card space-y-4">
          {staleAnalysis && (
            <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
              <p>A newer server-backed analysis is available. Your clarification remains on this page, but it cannot overwrite the newer version.</p>
              <button type="button" className="mt-2 min-h-11 rounded-lg border border-amber-800 px-4 font-bold" onClick={() => window.location.reload()}>
                Refresh current analysis
              </button>
            </div>
          )}
          <h2 className="text-xl font-black">HazLenz assessment — review before finalizing</h2>
          <p className="guided-muted text-sm">
            HazLenz has produced its best supported assessment from the evidence. Review, edit, or override it below;
            a qualified human review is recorded when you finalize each finding.
          </p>
          <div className="guided-subcard space-y-3" aria-label="Observation revision">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black">Current observation</h3>
                <p className="guided-muted text-sm">Revise the persisted observation before requesting a new HazLenz analysis.</p>
              </div>
              {!editingObservation && (
                <button type="button" disabled={busy} onClick={() => { setRevisionText(observation); setEditingObservation(true); }} className="min-h-10 rounded-lg border border-slate-700 px-3 font-bold">
                  Revise observation
                </button>
              )}
            </div>
            {editingObservation ? (
              <>
                <textarea aria-label="Revise persisted observation" value={revisionText} onChange={event => setRevisionText(event.target.value)} rows={6} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy || revisionText.trim().length < 3} onClick={saveObservationRevision} className="guided-primary-button">Save observation revision</button>
                  <button type="button" disabled={busy} onClick={() => setEditingObservation(false)} className="guided-secondary-button">Cancel</button>
                </div>
              </>
            ) : (
              <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900">{observation}</p>
            )}
            {!editingObservation && (
              <button type="button" disabled={busy} onClick={reanalyzeCurrentObservation} className="guided-secondary-button">
                Reanalyze with HazLenz AI
              </button>
            )}
          </div>
          {inspection.findings && inspection.findings.length > 0 && (
            <section aria-label="Findings in this inspection" className="guided-subcard space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-black">
                    Findings in this inspection ({activeFindingCount})
                  </h3>
                  <p className="guided-muted text-sm">
                    {reviewedFindingCount} of {activeFindingCount} reviewed. Select a finding to
                    review its standard, risk, and corrective action.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={beginAdditionalObservation}
                  data-testid="add-finding"
                  className="guided-primary-button"
                >
                  + Add finding
                </button>
              </div>
              {inspection.findings
                .filter((finding) => finding.status !== "superseded")
                .map((finding) => (
                  <article key={finding.id} className={`rounded-lg border p-3 ${selectedFindingId === finding.id ? "border-[var(--guided-focus)] bg-[var(--guided-info)] text-[var(--guided-text)]" : "border-slate-300"}`}>
                    <p className="font-bold">{findingDisplayTitle(finding)}</p>
                    <p className="text-xs">
                      {/* Reviewer-confirmed risk (the "Confirm risk and finalize finding" flow above) persists the
                          chosen band under riskSnapshot.overallRisk, not riskBand -- only the earlier, system-generated
                          snapshot uses riskBand. Fall back to overallRisk so a finalized, reviewer-confirmed finding
                          doesn't display as "Not established" here despite having a real recorded risk. */}
                      Risk: {String((finding.riskSnapshot as { riskBand?: string; overallRisk?: string } | null)?.riskBand
                        || (finding.riskSnapshot as { riskBand?: string; overallRisk?: string } | null)?.overallRisk
                        || "Not established")}
                      {" "}(independent of other findings from this observation)
                    </p>
                    <p className="text-xs">
                      {humanizeFindingStatus(finding.status)} · Review {finding.finalReviewId ? "complete" : "required"}
                    </p>
                    {/* slate-500 measured 4.38:1 against this card's light #EFF6FF surface,
                        under the 4.5 needed at 12px. slate-600 is the app's own next muted
                        step and clears it; dark mode is unaffected because the globals guard
                        maps both to the same dark muted colour. */}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-600">Advanced details</summary>
                      <p className="mt-1 text-xs text-slate-600">Finding ID: {finding.id}</p>
                      <p className="text-xs text-slate-600">Analysis: {finding.selectedAnalysisId || "pending"}</p>
                    </details>
                    <button type="button" onClick={() => selectFinding(finding)}
                      className="mt-2 min-h-10 rounded-lg border border-slate-700 px-3 font-bold">
                      {selectedFindingId === finding.id ? "Reviewing this finding" : "Review this finding"}
                    </button>
                  </article>
                ))}
            </section>
          )}
          {evidenceObjectId && <p className="text-sm">Private evidence stored: {evidenceObjectId.slice(0, 8)}…</p>}
          <div className="guided-subcard">
            <h3 className="font-black">What HazLenz understood</h3>
            <p className="mt-1 text-sm">
              Correct any extracted fact before accepting the advisory result. Unknown facts remain
              unknown; they are not treated as observed.
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
            {reviewFacts.length > 0 && (
              <button
                disabled={busy}
                onClick={() => reanalyze()}
                className="mt-3 min-h-11 rounded-xl border border-slate-800 px-4 font-bold"
              >
                Re-run after fact corrections
              </button>
            )}
          </div>
          {analysis.regulatoryContext && (
            <p className="text-sm" data-testid="hazlenz-regulatory-context">
              {analysis.regulatoryContext.provenance === "USER_CONFIRMED" && (
                <>Standards evaluated under <strong>{regulatoryContextLabel(analysis.regulatoryContext.value)}</strong> (set for this inspection).</>
              )}
              {analysis.regulatoryContext.provenance === "HAZLENZ_INFERRED" && (
                <>
                  Standards evaluated under <strong>{regulatoryContextLabel(analysis.regulatoryContext.value)}</strong> — inferred by HazLenz from the observation
                  {analysis.regulatoryContext.basis?.length ? ` (“${analysis.regulatoryContext.basis.join("”, “")}”)` : ""}, not yet confirmed for this inspection.{" "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void persistRegulatoryContext(analysis.regulatoryContext!.value)}
                    className="min-h-9 rounded-lg border border-slate-700 px-3 text-sm font-bold"
                  >
                    Confirm for this inspection
                  </button>
                </>
              )}
              {analysis.regulatoryContext.provenance === "UNKNOWN" && (
                <>Regulatory context is <strong>not established</strong>; standards below are shown as conditional candidates until the governing agency is known.</>
              )}
            </p>
          )}
          {/* Assessment lead-in for the SELECTED finding: what HazLenz identified, the evidence
              it read it from, and the risk -- in that order, before the citation. Everything here
              is existing persisted output (hazard title, the finding's own observationFragment,
              its riskSnapshot); no new regulatory reasoning is produced in the frontend. */}
          {selectedFindingDetail && (
            <div className="guided-subcard space-y-3" data-testid="hazlenz-assessment">
              <div>
                <p className="guided-eyebrow">HazLenz assessment</p>
                <h3 className="mt-1 text-lg font-black">{findingDisplayTitle(selectedFindingDetail)}</h3>
              </div>
              {selectedFindingFragment && (
                <div>
                  <h4 className="font-bold">Why HazLenz flagged this</h4>
                  <p className="guided-muted mt-1 text-sm">
                    From what you recorded: “{selectedFindingFragment}”
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-bold">Risk</h4>
                <p className="mt-1 text-sm">
                  <strong>{selectedFindingRiskBand}</strong>
                  {selectedFindingRiskBand === "Not established"
                    ? " — confirm severity and likelihood on the next step."
                    : " — assessed for this finding on its own, independent of the others."}
                </p>
              </div>
            </div>
          )}
          <div className="guided-standard-card">
            <p className="guided-eyebrow">
              {selectedFindingStandard?.applicability === "candidate"
                ? "Candidate standard — more evidence required"
                : selectedFindingStandard?.jurisdictionProvenance === "HAZLENZ_INFERRED"
                  ? "Primary standard — jurisdiction inferred by HazLenz, confirm for this inspection"
                  : "Primary standard"}
            </p>
            {selectedFindingStandard ? (
              <StandardCitationHeading citation={selectedFindingStandard.citation} title={selectedFindingStandard.title} />
            ) : (
              <h3 className="mt-1 text-lg font-black">No standard established for this finding yet</h3>
            )}
            {selectedFindingStandard && (
              <>
                {/* KG-3C: `simplifiedRequirement` falls back to the observation primary's value
                    when the finding's own candidate carries no corpus summary, so for a
                    CITATION_ONLY citation it holds the match rationale rather than a description
                    of the standard. `allowsContentText` gates that tier off in exactly that
                    state — the notice below is then the whole answer. */}
                {selectedFindingStandard.simplifiedRequirement && selectedFindingStandardBacking.allowsContentText && (
                  <p className="mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">HazLenz standard summary</span>
                    {/* KG-3C: positive-only verification marker, derived from backingStatus.
                        Never inferred from sourceKey — see standardDisplay.ts. `whitespace-nowrap`
                        keeps the pill intact: at a 390px viewport the phrase otherwise breaks
                        across two lines and renders as two separate rounded fragments. */}
                    {selectedFindingStandardBacking.verifiedBadge && (
                      <span className="ml-2 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {selectedFindingStandardBacking.verifiedBadge}
                      </span>
                    )}
                    <br />
                    {selectedFindingStandard.simplifiedRequirement}
                  </p>
                )}
                {selectedFindingStandardBacking.notice && (
                  <p className="guided-muted mt-2 text-sm">{selectedFindingStandardBacking.notice}</p>
                )}
                <h4 className="mt-3 font-bold">Why HazLenz selected this</h4>
                <p>{selectedFindingStandard.whyOffered}</p>
                <p className="mt-3"><strong>Confidence:</strong> {selectedFindingStandard.confidenceLabel}</p>
                {/* KG-3D (Phase 8). `confidenceLimitReason` is a CONTENT-BACKING caveat, but it
                    is computed by the guided-finding adapter, while the verified badge beside the
                    summary comes from this finding's own persisted candidate. Two independent
                    computations of one fact can disagree, and when they do the card says "Verified
                    standard text" and "has not completed source review" at the same time — the
                    contradiction KG-3C flagged (§20.13) but could not reproduce, because no record
                    was approved yet. KG-3D approves real records, so it became reachable.

                    Gating the caveat on the same presentation the badge uses makes the card
                    internally consistent whichever layer resolved the backing first. This does not
                    touch applicability confidence, and the evidence-gap list below is unaffected. */}
                {!selectedFindingStandardBacking.verifiedBadge && selectedFindingStandard.confidenceLimitReason && (
                  <p className="guided-muted mt-1 text-sm">{selectedFindingStandard.confidenceLimitReason}</p>
                )}
                {selectedFindingStandard.evidenceMissing.length > 0 && (
                  <>
                    <h4 className="mt-3 font-bold">Details that would increase confidence</h4>
                    <ul className="list-disc pl-5">
                      {selectedFindingStandard.evidenceMissing.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
          {/* Questions come after the assessment and its standard: they refine an answer the
              reviewer can already see, and none of them blocks review. */}
          {(analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []).length > 0 && (
            <div className="guided-subcard">
              <h3 className="font-black">Clarification</h3>
              <p className="guided-muted mt-1 text-sm">
                {(() => {
                  const list = (analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []) as Array<{ decisionCritical?: boolean }>;
                  const critical = list.filter((item) => item.decisionCritical).length;
                  return critical > 0
                    ? `${critical} of ${list.length} could change the finding, standard, or risk; the rest only raise confidence. None blocks your review.`
                    : `${list.length} optional question${list.length === 1 ? "" : "s"} — answering raises confidence in the standard shown below; none blocks your review.`;
                })()}
              </p>
              {(analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []).map((question) => (
                <fieldset key={question.id} className="mt-3">
                  <legend className="font-semibold">
                    {question.question}{" "}
                    <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${(question as { decisionCritical?: boolean }).decisionCritical ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
                      {(question as { decisionCritical?: boolean }).decisionCritical ? "Decision-critical" : "Optional"}
                    </span>
                  </legend>
                  {materialQuestionReason(question) && (
                    <p className="guided-muted mt-1 text-sm">{materialQuestionReason(question)}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(question.options || ["Yes", "No", "Not sure"]).map((option) => (
                      <button
                        key={option}
                        disabled={busy}
                        onClick={() => reanalyze({ questionId: question.id, answer: option })}
                        className="min-h-11 rounded-lg border border-slate-500 px-4 font-semibold"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
          {(analysis.guidedFinding?.multiHazardReview?.requiresSplitReview || decompositionHazards(analysis).length > 1) && (
          <div className="guided-info-panel space-y-3" role="group" aria-labelledby="multi-hazard-heading">
              <div>
                <strong id="multi-hazard-heading">Multiple distinct hazards detected.</strong>{" "}
                {analysis.guidedFinding?.multiHazardReview?.instruction ||
                  "Review each hazard separately; do not merge materially distinct mechanisms."}
              </div>
              <fieldset className="space-y-2">
                <legend className="font-bold">Choose the hazards to preserve as separate findings</legend>
                {(analysis.guidedFinding?.findingCandidates?.length
                  ? analysis.guidedFinding.findingCandidates
                  : decompositionHazards(analysis).map(family => ({
                    family,
                    citation: "",
                    applicability: "candidate" as const,
                    evidenceFactIds: [],
                  }))).map(candidate => {
                  const key = candidateKey(candidate);
                  return (
                    <label key={key} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSegmentKeys.includes(key)}
                        onChange={event => setSelectedSegmentKeys(current =>
                          event.target.checked
                            ? [...new Set([...current, key])]
                            : current.filter(item => item !== key))}
                        className="mt-1"
                      />
                      <span>
                        <strong>{candidate.family || "Safety hazard"}</strong>
                        {candidate.citation ? ` — ${candidate.citation}` : ""}
                        <span className="guided-muted block text-sm">
                          {candidate.applicability === "direct"
                            ? "Supported by current evidence"
                            : "Candidate — material evidence still requires review"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          )}
          <button disabled={busy} onClick={() => setStep("risk")} className="guided-primary-button">
            Continue to risk review
          </button>
        </section>
      )}

      {step === "risk" && analysis?.guidedFinding && (
        <section className="guided-card space-y-4">
          <div>
            <p className="guided-eyebrow">Reviewer confirmation</p>
            <h2 className="text-xl font-black">Proposed risk</h2>
            <p className="guided-muted mt-1">{reviewerRisk.rationale}</p>
          </div>
          {selectedFindingId && (
            <p role="status" className="rounded-lg border border-[var(--guided-border)] bg-[var(--guided-info)] p-3 text-sm font-semibold text-[var(--guided-text)]">
              Risk and review actions below apply only to the selected finding. Other findings require their own review.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {(["severity", "likelihood", "exposure", "overallRisk"] as const).map(field => (
              <label key={field} className="font-bold">
                {field === "overallRisk" ? "Overall risk" : field[0].toUpperCase() + field.slice(1)}
                <select value={reviewerRisk[field]}
                  onChange={event => setReviewerRisk(value => ({ ...value, [field]: event.target.value }))}
                  className="guided-input mt-1">
                  {["Not established", "Minor", "Moderate", "Serious", "Unlikely", "Possible", "Likely", "Rare", "Potential", "Repeated", "Controlled", "Low", "High", "Critical"]
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
            ))}
          </div>
          <label className="block font-bold">
            Reason for adjustment <span className="font-normal">(required when changing the proposal)</span>
            <textarea value={reviewerRiskReason} onChange={event => setReviewerRiskReason(event.target.value)}
              className="guided-input mt-1 min-h-24" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStep("review")} className="guided-secondary-button">Back to HazLenz review</button>
            <button disabled={busy} onClick={acceptReview} className="guided-primary-button">
              Confirm risk and finalize finding
            </button>
          </div>
        </section>
      )}

      {step === "followup" && (
        <section className="guided-card space-y-3">
          <h2 className="text-xl font-black">Corrective action</h2>
          {(["immediateAction", "permanentCorrection", "verificationStep"] as const).map(field => (
            <label key={field} className="block font-bold">
              {field === "immediateAction" ? "Immediate protective action" :
                field === "permanentCorrection" ? "Permanent correction" : "Verification step"}
              <textarea value={actionDraft[field]}
                onChange={event => setActionDraft(value => ({ ...value, [field]: event.target.value }))}
                className="guided-input mt-1 min-h-24" />
            </label>
          ))}
          <p className="guided-muted text-sm">This creates durable corrective-action and calendar records before completing the inspection.</p>
          {hasPlanEntitlement("correctiveActionAssignments", planCode) ? (
            <button disabled={busy || !actionDraft.permanentCorrection.trim()} onClick={complete} className="guided-primary-button">
              Complete inspection and generate report
            </button>
          ) : (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-sm font-black leading-5 text-amber-900">
                Assigning corrective actions is available on the Pro plan.
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">
                Your immediate action, permanent correction, and verification step above are saved in this draft — upgrade to finish creating the corrective action, calendar task, and report.
              </p>
              <AppLinkButton
                href="/pricing"
                variant="accent"
                className="mt-3 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-center !text-white"
              >
                Unlock Corrective Actions
              </AppLinkButton>
            </div>
          )}
        </section>
      )}

      {step === "complete" && report && (
        <section className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950">
          <h2 className="text-xl font-black">Report generated</h2>
          <p>Version {report.version} of this inspection&apos;s report has been saved and is available in your report history.</p>
          <button onClick={() => router.push("/reports")} className="min-h-11 rounded-xl bg-emerald-800 px-5 font-bold text-white">
            View report history
          </button>
        </section>
      )}
    </main>
  );
}
