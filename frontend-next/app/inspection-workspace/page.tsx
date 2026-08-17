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
  updatePersistedObservation,
  uploadInspectionEvidence,
  type PersistedInspection,
  type HazLenzAnalysisResult,
  type HazLenzEvidenceFact,
} from "@/lib/canonicalWorkflowApi";
import { StandardCitationHeading } from "@/components/inspection/SafeScopeStandardsSection";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { getStoredPlanCode, getVerifiedPlanCode, hasPlanEntitlement, type BillingTier } from "@/lib/planEntitlements";

type Step = "capture" | "review" | "risk" | "followup" | "complete";

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
} | null;

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
  findings: { id: string; hazardKey: string; status: string }[],
  selectedFindingId: string,
): FindingStandardView {
  const primary = analysis?.guidedFinding?.primaryStandard || null;
  const observationFindings = findings.filter((finding) => finding.status !== "superseded");
  if (observationFindings.length <= 1 || !selectedFindingId) return primary;

  const selectedFinding = observationFindings.find((finding) => finding.id === selectedFindingId);
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

function safeActionDraftForFinding(finding: { hazardCategory: string | null; hazardKey: string; conclusion: string }, fallback: ActionDraft) {
  const family = `${finding.hazardCategory || ""} ${finding.hazardKey}`.toLowerCase();
  if (family.includes("electrical")) return {
    immediateAction: "Place the affected electrical equipment in a safe state and restrict access pending qualified electrical verification.",
    permanentCorrection: "Repair or replace the electrical component with appropriately rated equipment and verify the installation.",
    verificationStep: "Have a qualified person document the electrical inspection before returning the equipment to service.",
  };
  if (family.includes("fall")) return {
    immediateAction: "Restrict access to the elevated exposure and stop the task until compliant fall protection is verified.",
    permanentCorrection: "Provide and maintain a compliant guardrail, personal fall-arrest system, or other approved fall control for the work area.",
    verificationStep: "Verify the fall-control system and access route before resuming work.",
  };
  if (family.includes("loto") || family.includes("energy")) return {
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
  return fallback;
}

export default function InspectionWorkspacePage() {
  const router = useRouter();
  const [inspection, setInspection] = useState<PersistedInspection | null>(null);
  const [observation, setObservation] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [workActivity, setWorkActivity] = useState("");
  const [jurisdiction, setJurisdiction] = useState<"msha" | "osha-general-industry" | "osha-construction" | "unknown">("unknown");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceObjectId, setEvidenceObjectId] = useState("");
  const [analysis, setAnalysis] = useState<HazLenzAnalysisResult | null>(null);
  const [reviewFacts, setReviewFacts] = useState<HazLenzEvidenceFact[]>([]);
  const [observationId, setObservationId] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const analysisRequestVersion = useRef(0);
  const [findingIds, setFindingIds] = useState<string[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string>("");
  const [selectedSegmentKeys, setSelectedSegmentKeys] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("capture");
  const [planCode, setPlanCode] = useState<BillingTier>(() => getStoredPlanCode() as BillingTier);
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
        setSelectedFindingId((value.findings || []).find((finding) => finding.status !== "superseded")?.id || "");
        const persistedObservation = value.observations?.[0];
        const currentAnalysis = persistedObservation?.analyses
          ?.filter((item) => item.status !== "superseded")
          .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
        if (persistedObservation && currentAnalysis) {
          setObservationId(persistedObservation.id);
          setAnalysisId(currentAnalysis.id);
          setObservation(persistedObservation.rawText);
          setRevisionText(persistedObservation.rawText);
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
      setStatus("HazLenz advisory snapshot saved — qualified human review required.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis was not saved.");
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
      const result = await analyzeObservation(observation, {
        evidenceSnapshot: analysis.evidenceSnapshot
          ? { ...analysis.evidenceSnapshot, facts: correctedFacts }
          : undefined,
        clarificationAnswers: clarificationAnswer ? [clarificationAnswer] : undefined,
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
      setStatus("Updated HazLenz advisory snapshot saved — human confirmation is still required.");
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
      const candidatesToPersist = selectedFinding
        ? [{
          ...selectedFinding,
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
            correctiveAction: actionDraft,
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
        const findingAction = finding
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

  return (
    <main className="guided-page mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Safety InSite</p>
        <h1 className="mt-2 text-3xl font-black">Server-saved inspection</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          HazLenz AI is advisory. Applicability depends on facts and jurisdiction; a qualified
          safety professional must verify every finding before finalization.
        </p>
      </header>

      <nav aria-label="Inspection progress" className="guided-progress">
        {(["capture", "review", "risk", "followup", "complete"] as Step[]).map((item, index) => (
          <span key={item} aria-current={step === item ? "step" : undefined}
            className={step === item ? "guided-progress-step is-current" : "guided-progress-step"}>
            {index + 1}. {item === "followup" ? "Action" : item}
          </span>
        ))}
      </nav>

      <div role="status" aria-live="polite" className="guided-info">
        {status}
      </div>

      {inspection && (
        <section className="guided-card">
          <p className="text-xs font-bold uppercase tracking-wider">Inspection</p>
          <h2 className="mt-1 text-xl font-bold">{inspection.title}</h2>
          <p className="mt-1 text-sm">Status: {humanizeInspectionStatus(inspection.status)} · revision {inspection.version}</p>
        </section>
      )}

      {step === "capture" && inspection && (
        <section className="guided-card space-y-3">
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
            Site context
            <select
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value as typeof jurisdiction)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950"
            >
              <option value="unknown">Not sure</option>
              <option value="msha">MSHA mine site</option>
              <option value="osha-general-industry">OSHA general industry</option>
              <option value="osha-construction">OSHA construction</option>
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
            Save and review with HazLenz AI
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
          <h2 className="text-xl font-black">Human review required</h2>
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
            <section aria-label="Persisted findings" className="guided-subcard space-y-2">
              <h3 className="font-black">Persisted hazard findings</h3>
              {inspection.findings
                .filter((finding) => finding.status !== "superseded")
                .map((finding) => (
                  <article key={finding.id} className={`rounded-lg border p-3 ${selectedFindingId === finding.id ? "border-[var(--guided-focus)] bg-[var(--guided-info)] text-[var(--guided-text)]" : "border-slate-300"}`}>
                    <p className="font-bold">{finding.hazardCategory || finding.hazardKey}</p>
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
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-500">Advanced details</summary>
                      <p className="mt-1 text-xs text-slate-500">Finding ID: {finding.id}</p>
                      <p className="text-xs text-slate-500">Analysis: {finding.selectedAnalysisId || "pending"}</p>
                    </details>
                    <button type="button" onClick={() => {
                      setSelectedFindingId(finding.id);
                      const findingRisk = riskSnapshotToReviewerRisk(finding.riskSnapshot);
                      setReviewerRisk(findingRisk);
                      setProposedRisk(findingRisk);
                      setReviewerRiskReason("");
                    }} className="mt-2 min-h-10 rounded-lg border border-slate-700 px-3 font-bold">
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
          {(analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []).length > 0 && (
            <div className="guided-subcard">
              <h3 className="font-black">Essential clarification</h3>
              <p className="guided-muted mt-1 text-sm">
                {(() => {
                  const count = (analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []).length;
                  return `${count} evidence gap${count === 1 ? "" : "s"} — answer to raise confidence in the standard shown below.`;
                })()}
              </p>
              {(analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions || []).map((question) => (
                <fieldset key={question.id} className="mt-3">
                  <legend className="font-semibold">{question.question}</legend>
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
          <div className="guided-standard-card">
            <p className="guided-eyebrow">
              {selectedFindingStandard?.applicability === "candidate"
                ? "Candidate standard — more evidence required"
                : "Primary standard"}
            </p>
            {selectedFindingStandard ? (
              <StandardCitationHeading citation={selectedFindingStandard.citation} title={selectedFindingStandard.title} />
            ) : (
              <h3 className="mt-1 text-lg font-black">No standard established for this finding yet</h3>
            )}
            {selectedFindingStandard && (
              <>
                {selectedFindingStandard.simplifiedRequirement && (
                  <p className="mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">HazLenz standard summary</span>
                    <br />
                    {selectedFindingStandard.simplifiedRequirement}
                  </p>
                )}
                <h4 className="mt-3 font-bold">Why HazLenz selected this</h4>
                <p>{selectedFindingStandard.whyOffered}</p>
                <p className="mt-3"><strong>Confidence:</strong> {selectedFindingStandard.confidenceLabel}</p>
                {selectedFindingStandard.confidenceLimitReason && (
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
