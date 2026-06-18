"use client";

import { secureStorage } from "@/lib/secureStorage";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runInspectionHazLenzReview } from "@/lib/inspection/hazlenzInspectionService";
import {
  submitHazLenzStandardFeedback,
  submitHazLenzValidationReview,
  type HazLenzValidationDecision,
} from "@/lib/inspection/hazlenzFeedbackService";
import {
  getEditReport,
  removeEditReport,
} from "@/lib/reportStorage";
import {
  persistFindingSaveSideEffects,
  shouldConfirmHazLenzSuggestionSelection,
  upsertFindingInList,
} from "@/lib/inspection/findingSaveService";
import { generateInspectionReportPackage } from "@/lib/inspection/reportGenerationService";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import AnnotationEditor from "@/components/evidence/AnnotationEditor";
import {
  deleteEvidencePhoto,
  loadFindingEvidencePhotos,
  saveUploadedEvidencePhotos,
} from "@/lib/inspection/photoEvidenceService";
import FinalizeInspectionSection from "@/components/inspection/FinalizeInspectionSection";
import GenerateReportSection from "@/components/inspection/GenerateReportSection";
import InspectionStepRenderer from "@/components/inspection/InspectionStepRenderer";
import CurrentHazardCard from "@/components/inspection/CurrentHazardCard";
import InspectionWorkflowHeader from "@/components/inspection/InspectionWorkflowHeader";
import {
  hazardCategoryOptions,
  inspectionSteps as steps,
  likelihoodScale,
  severityScale,
} from "@/lib/inspection/inspectionConstants";

import {
  determineInspectionMode,
  isQuickHazardCapture,
  loadInspectionContext,
} from "@/lib/inspection/inspectionContext";
import { buildFinding } from "@/lib/inspection/findingBuilder";
import { validateInspectionReport } from "@/lib/inspection/reportValidation";
import {
  buildFinalizedInspectionFindings,
  getStandardKey,
  hasFindingDraftData,
} from "@/lib/inspection/inspectionWorkflowHelpers";
import {
  ensureActiveLocalInspection,
  persistOfflineFindingSnapshot,
} from "@/lib/inspection/offlineInspectionWiring";

export default function InspectionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [hazardCategory, setHazardCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [annotatingPhotoIndex, setAnnotatingPhotoIndex] = useState<
    number | null
  >(null);
  const [annotationExpanded, setAnnotationExpanded] = useState(false);
  const [agencyMode, setAgencyMode] = useState("all");
  const [riskProfileId, setRiskProfileId] = useState<
    "simple_4x4" | "standard_5x5" | "advanced_6x6"
  >("standard_5x5");

  useEffect(() => {
    const savedRiskProfile =
      (window.localStorage.getItem("sentinel_risk_profile") as
        | "simple_4x4"
        | "standard_5x5"
        | "advanced_6x6"
        | null) ||
      (window.localStorage.getItem("sentinel_company_risk_profile") as
        | "simple_4x4"
        | "standard_5x5"
        | "advanced_6x6"
        | null);

    if (savedRiskProfile) setRiskProfileId(savedRiskProfile);

    const savedRegulatoryScope = window.localStorage.getItem("sentinel_regulatory_scope");
    if (savedRegulatoryScope) setAgencyMode(savedRegulatoryScope);
  }, []);
  const [safeScopeStatus, setSafeScopeStatus] = useState("");
  const [safeScopeResult, setsafeScopeResult] = useState<any>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [selectedStandards, setSelectedStandards] = useState<any[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [severity, setSeverity] = useState<number | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [editingFindingIndex, setEditingFindingIndex] = useState<number | null>(
    null,
  );
  const [currentFindingSaved, setCurrentFindingSaved] = useState(false);
  const [currentSavedFindingId, setCurrentSavedFindingId] = useState<
    string | number | null
  >(null);
  const [findingSaveMessage, setFindingSaveMessage] = useState("");
  const [manualActions, setManualActions] = useState<any[]>([]);
  const [selectedGeneratedActions, setSelectedGeneratedActions] = useState<
    any[]
  >([]);
  const [manualActionTitle, setManualActionTitle] = useState("");
  const [manualActionPriority, setManualActionPriority] = useState("Medium");
  const [manualActionDue, setManualActionDue] = useState("");
  const [manualActionClosureEvidence, setManualActionClosureEvidence] =
    useState("Photo");
  const [reportValidationMessage, setReportValidationMessage] = useState("");
  const [includeStandardsInReport, setIncludeStandardsInReport] =
    useState(true);
  const [includeActionsInReport, setIncludeActionsInReport] = useState(true);
  const [includePhotosInReport, setIncludePhotosInReport] = useState(true);
  const [includeSafeScopeNotesInReport, setIncludeSafeScopeNotesInReport] =
    useState(false);
  const [safeScopeHelpOpen, setSafeScopeHelpOpen] = useState(false);
  const [safeScopeDetailsOpen, setSafeScopeDetailsOpen] = useState(false);
  const [safeScopeStandardsOpen, setSafeScopeStandardsOpen] = useState(false);
  const [safeScopeCompactDetailsOpen, setSafeScopeCompactDetailsOpen] =
    useState(false);
  const [safeScopeAdvancedOpen, setSafeScopeAdvancedOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [inspectionContext, setInspectionContext] = useState<any>(null);
  const [activeEditReport, setActiveEditReport] = useState<any>(null);
  const [activeLocalInspectionId, setActiveLocalInspectionId] = useState<
    string | null
  >(null);

  const [inspectionMode, setInspectionMode] = useState<"quick" | "advanced">(
    "quick",
  );

  const isAdvancedMode = inspectionMode === "advanced";
  const quickCapture =
    inspectionContext?.inspectionType === "quick_hazard_capture" &&
    inspectionContext?.workflowDepth === "quick";

  const riskScore = severity && likelihood ? severity * likelihood : null;

  function ensureLocalInspectionForPage() {
    return ensureActiveLocalInspection({
      activeLocalInspectionId,
      setActiveLocalInspectionId,
      inspectionContext,
      inspectionMode,
      agencyMode,
    });
  }

  function saveOfflineFindingSnapshot(finding: any) {
    return persistOfflineFindingSnapshot({
      finding,
      activeLocalInspectionId,
      setActiveLocalInspectionId,
      inspectionContext,
      inspectionMode,
      agencyMode,
      riskScore,
    });
  }

  useEffect(() => {
    ensureLocalInspectionForPage();
  }, [inspectionContext, agencyMode, inspectionMode]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        "sentinel_selected_inspection_context",
      );
      if (!raw) return;

      const context = JSON.parse(raw);
      setInspectionContext(context);

      if (context.workflowDepth === "intelligent")
        setInspectionMode("advanced");
      if (context.workflowDepth === "standard") setInspectionMode("advanced");
      if (context.workflowDepth === "quick") setInspectionMode("quick");

      if (context.agency === "MSHA") setAgencyMode("msha");
      if (context.agency === "OSHA") setAgencyMode("osha_general");
    } catch {}
  }, []);

  useEffect(() => {
    async function loadEditReport() {
      const editReport = await getEditReport<any>();
      if (!editReport) return;

      setActiveEditReport(editReport);

      const reportFindings = Array.isArray(editReport.findings)
        ? editReport.findings
        : [];

      setFindings(reportFindings);
      setIncludeStandardsInReport(
        editReport.includeStandardsInReport !== false,
      );
      setIncludeActionsInReport(editReport.includeActionsInReport !== false);
      setIncludePhotosInReport(editReport.includePhotosInReport !== false);
      setIncludeSafeScopeNotesInReport(
        Boolean(editReport.includeSafeScopeNotesInReport),
      );

      if (editReport.reportPackageMode) {
        window.localStorage.setItem(
          "sentinel_report_package_mode",
          editReport.reportPackageMode,
        );
      }

      const editMode = editReport.__editMode;
      const editIndex =
        typeof editReport.__editFindingIndex === "number"
          ? editReport.__editFindingIndex
          : null;

      if (editMode === "edit_finding" && editIndex !== null) {
        const finding = reportFindings[editIndex];

        if (finding) {
          setHazardCategory(finding.hazardCategory || "");
          setDescription(finding.description || "");
          setLocation(finding.location || "");
          setEvidenceNotes(finding.evidenceNotes || "");
          loadFindingEvidencePhotos(finding.photos || []).then(setPhotos);
          setsafeScopeResult(finding.safeScopeResult || null);
          setSelectedStandards(finding.selectedStandards || []);
          setSelectedGeneratedActions(finding.selectedGeneratedActions || []);
          setManualActions(finding.manualActions || []);
          setSeverity(finding.severity || null);
          setLikelihood(finding.likelihood || null);
          setEditingFindingIndex(editIndex);
          setCurrentSavedFindingId(finding.id || null);
          setCurrentFindingSaved(true);
          setFindingSaveMessage("Editing saved finding.");
          setCurrentStep(1);
        }
      } else if (editMode === "add_finding") {
        resetCurrentFinding();
        setFindings(reportFindings);
        setFindingSaveMessage("Add a new finding to the existing report.");
        setCurrentStep(1);
      } else {
        resetCurrentFinding();
        setFindings(reportFindings);
        setCurrentFindingSaved(true);
        setFindingSaveMessage("Report loaded for editing.");
        setCurrentStep(4);
      }

      await removeEditReport();
    }

    loadEditReport();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        "sentinel_inspection_autosave",
        JSON.stringify({
          currentStep,
          hazardCategory,
          description,
          location,
          evidenceNotes,
          agencyMode,
          riskProfileId,
          severity,
          likelihood,
          manualActions,
          selectedGeneratedActions,
          updatedAt: new Date().toISOString(),
        }),
      );

      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [
    currentStep,
    hazardCategory,
    description,
    location,
    evidenceNotes,
    agencyMode,
    riskProfileId,
    severity,
    likelihood,
    manualActions,
    selectedGeneratedActions,
  ]);

  useEffect(() => {
    const existing = secureStorage.get("edit_report", null as any);
    if (!existing) return;

    try {
      const report = JSON.parse(existing);

      if (Array.isArray(report.findings)) {
        setFindings(report.findings);
      }

      window.localStorage.setItem(
        "sentinel_editing_report_id",
        report.id || "",
      );
      secureStorage.remove("edit_report");
    } catch {
      secureStorage.remove("edit_report");
    }
  }, []);

  async function handleRunSafeScope(forceOffline: boolean = false) {
    console.log("[HazLenz AI] handleRunSafeScope entered");

    setSafeScopeStatus("Starting HazLenz AI review...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      setSafeScopeStatus("Running HazLenz AI match...");

      const review = await runInspectionHazLenzReview({
        forceOffline,
        isOfflineMode,
        agencyMode,
        hazardCategory,
        description,
        location,
        evidenceNotes,
        riskProfileId,
        photos,
        findings,
      });

      if (!review.ok) {
        setSafeScopeStatus(review.status);
        return;
      }

      if (review.enableOfflineMode) {
        setIsOfflineMode(true);
      }

      setsafeScopeResult(review.result);
      setSafeScopeCompactDetailsOpen(false);
      setSafeScopeAdvancedOpen(false);
      setSelectedStandards(review.autoSelectedStandards);
      setSelectedGeneratedActions(review.autoSelectedActions);
      setSafeScopeStatus(review.status);
    } catch (error: any) {
      console.error("[HazLenz AI] Review failed", error);

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : typeof error?.message === "string"
            ? error.message
            : "Unknown HazLenz AI error.";

      setSafeScopeStatus(`HazLenz AI review failed: ${errorMessage}`);
    }
  }


  function toggleSelectedStandard(standard: any) {
    const standardKey = getStandardKey(standard);

    setSelectedStandards((current) => {
      const selected = current.some(
        (item) => getStandardKey(item) === standardKey,
      );

      if (selected) {
        return current.filter((item) => getStandardKey(item) !== standardKey);
      }

      return [
        ...current,
        {
          ...standard,
          reviewStatus: "selected_for_report",
          reviewedByUser: true,
        },
      ];
    });
  }

  async function handleFeedback(
    standard: any,
    action: "accepted" | "rejected" | "flagged",
  ) {
    try {
      setSafeScopeStatus(`Submitting ${action} feedback...`);

      await submitHazLenzStandardFeedback({
        standard,
        action,
        hazardCategory,
        description,
        location,
        evidenceNotes,
        agencyMode,
        feedbackNotes,
        safeScopeResult,
        riskProfileId,
      });

      if (action === "accepted") {
        setSelectedStandards((current) => {
          const exists = current.some(
            (item) => item.citation === standard.citation,
          );
          return exists ? current : [...current, standard];
        });
      }

      if (action === "rejected" || action === "flagged") {
        setSelectedStandards((current) =>
          current.filter((item) => item.citation !== standard.citation),
        );
      }

      setSafeScopeStatus(
        action === "accepted"
          ? `Standard selected: ${standard.citation}`
          : `Feedback saved: ${action} ${standard.citation}`,
      );
    } catch (error) {
      setSafeScopeStatus(
        "Feedback could not be saved. Please make sure you are signed in and the backend is running.",
      );
    }
  }

  async function submitSafeScopeValidation(decision: HazLenzValidationDecision) {
    try {
      setSafeScopeStatus("Submitting supervisor validation...");

      const validation = await submitHazLenzValidationReview({
        safeScopeResult,
        decision,
        feedbackNotes,
      });

      setSafeScopeStatus(validation.status);
    } catch {
      setSafeScopeStatus(
        "Supervisor validation could not be saved. Please confirm the backend is running.",
      );
    }
  }

  function toggleGeneratedAction(action: any) {
    const actionKey =
      action.title || action.description || JSON.stringify(action);

    setSelectedGeneratedActions((current) => {
      const alreadySelected = current.some(
        (selected) =>
          (selected.title ||
            selected.description ||
            JSON.stringify(selected)) === actionKey,
      );

      if (alreadySelected) {
        return current.filter(
          (selected) =>
            (selected.title ||
              selected.description ||
              JSON.stringify(selected)) !== actionKey,
        );
      }

      return [
        ...current,
        {
          ...action,
          source: "HazLenz AI",
        },
      ];
    });
  }

  function addManualAction() {
    if (!manualActionTitle.trim()) return;

    setManualActions((current) => [
      ...current,
      {
        title: manualActionTitle.trim(),
        priority: manualActionPriority,
        due: manualActionDue || "Not set",
        source: "User",
      },
    ]);

    setManualActionTitle("");
    setManualActionPriority("Medium");
    setManualActionDue("");
  }

  function removeManualAction(indexToRemove: number) {
    setManualActions((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  }

  function buildCurrentFinding() {
    return buildFinding({
      existingId:
        editingFindingIndex !== null ? findings[editingFindingIndex]?.id : null,
      fallbackId: currentSavedFindingId,
      hazardCategory,
      description,
      location,
      evidenceNotes,
      photos,
      safeScopeResult,
      selectedStandards,
      selectedGeneratedActions,
      manualActions,
      severity,
      likelihood,
      riskScore,
    });
  }

  function hasCurrentFindingData() {
    return hasFindingDraftData({
      description,
      hazardCategory,
      location,
      evidenceNotes,
      photos,
      safeScopeResult,
      selectedStandards,
      selectedGeneratedActions,
      manualActions,
      severity,
      likelihood,
    });
  }

  function resetCurrentFinding() {
    setCurrentStep(1);
    setHazardCategory("");
    setDescription("");
    setLocation("");
    setEvidenceNotes("");
    setPhotos([]);
    setAgencyMode("all");
    setSafeScopeStatus("");
    setsafeScopeResult(null);
    setFeedbackNotes("");
    setSeverity(null);
    setLikelihood(null);
    setEditingFindingIndex(null);
    setCurrentFindingSaved(false);
    setCurrentSavedFindingId(null);
    setFindingSaveMessage("");
    setSelectedGeneratedActions([]);
    setManualActions([]);
    setManualActionTitle("");
    setManualActionPriority("Medium");
    setManualActionDue("");
  }

  async function saveFinding() {
    if (!hasCurrentFindingData()) {
      setFindingSaveMessage("Enter finding details before saving.");
      return;
    }

    if (
      shouldConfirmHazLenzSuggestionSelection({
        safeScopeResult,
        selectedStandards,
        selectedGeneratedActions,
        manualActions,
      })
    ) {
      const confirmed = window.confirm(
        "HazLenz AI found recommended standards or corrective actions that are not selected for this finding. Save anyway?",
      );

      if (!confirmed) {
        setFindingSaveMessage("Review HazLenz AI standards/actions before saving.");
        return;
      }
    }

    const current = buildCurrentFinding();
    saveOfflineFindingSnapshot(current);
    await persistFindingSaveSideEffects({
      finding: current,
      detailFallback: "Inspection finding updated",
    });

    setFindings((prev) =>
      upsertFindingInList({
        findings: prev,
        finding: current,
        editingFindingIndex,
      }),
    );

    setCurrentSavedFindingId(current.id);
    setCurrentFindingSaved(true);
    setFindingSaveMessage(
      editingFindingIndex !== null || currentFindingSaved
        ? "Saved finding updated."
        : "Finding saved.",
    );
  }

  async function addNewFinding() {
    if (!currentFindingSaved && hasCurrentFindingData()) {
      const current = buildCurrentFinding();
      saveOfflineFindingSnapshot(current);
      await persistFindingSaveSideEffects({
        finding: current,
        detailFallback: "Inspection finding added",
      });
      setFindings((prev) => [...prev, current]);
    }

    resetCurrentFinding();
  }

  function editFinding(index: number) {
    const finding = findings[index];
    if (!finding) return;

    setHazardCategory(finding.hazardCategory || "");
    setDescription(finding.description || "");
    setLocation(finding.location || "");
    setEvidenceNotes(finding.evidenceNotes || "");
    loadFindingEvidencePhotos(finding.photos || []).then(setPhotos);
    setsafeScopeResult(finding.safeScopeResult || null);
    setSelectedStandards(finding.selectedStandards || []);
    setSelectedGeneratedActions(finding.selectedGeneratedActions || []);
    setManualActions(finding.manualActions || []);
    setSeverity(finding.severity || null);
    setLikelihood(finding.likelihood || null);
    setEditingFindingIndex(index);
    setCurrentSavedFindingId(finding.id || null);
    setFindingSaveMessage("");
    setCurrentFindingSaved(true);
    setCurrentStep(1);
  }

  function getActiveRiskScale() {
    const maxScore =
      riskProfileId === "simple_4x4"
        ? 4
        : riskProfileId === "advanced_6x6"
          ? 6
          : 5;

    return {
      maxScore,
      severity: severityScale.filter((item) => item.score <= maxScore),
      likelihood: likelihoodScale.filter((item) => item.score <= maxScore),
      label:
        riskProfileId === "simple_4x4"
          ? "Simple 4x4"
          : riskProfileId === "advanced_6x6"
            ? "Advanced 6x6"
            : "Standard 5x5",
    };
  }

  function goToInspectionStep(nextStep: number) {
    let targetStep = Math.max(1, Math.min(steps.length, nextStep));

    void isAdvancedMode;

    setCurrentStep(targetStep);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function deleteFinding(index: number) {
    setFindings((prev) => prev.filter((_, i) => i !== index));
    if (editingFindingIndex === index) {
      resetCurrentFinding();
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const nextPhotos = await saveUploadedEvidencePhotos(files);

    setPhotos((prev) => [...prev, ...nextPhotos]);
    event.target.value = "";
  }

  function removePhoto(id: string) {
    deleteEvidencePhoto(id);
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }

  function validateReportBeforeGenerate() {
    const finalizedFindings = buildFinalizedInspectionFindings({
      findings,
      currentFindingSaved,
      hasCurrentFindingData: hasCurrentFindingData(),
      buildCurrentFinding,
    });

    return validateInspectionReport(finalizedFindings);
  }

  async function generateReport() {
    const validationMessage = validateReportBeforeGenerate();

    if (validationMessage) {
      setReportValidationMessage(validationMessage);
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      });
      return;
    }

    setReportValidationMessage("");

    const finalizedFindings = buildFinalizedInspectionFindings({
      findings,
      currentFindingSaved,
      hasCurrentFindingData: hasCurrentFindingData(),
      buildCurrentFinding,
    });

    await generateInspectionReportPackage({
      finalizedFindings,
      activeEditReport,
      includeStandardsInReport,
      includeActionsInReport,
      includePhotosInReport,
      includeSafeScopeNotesInReport,
    });

    router.push("/inspection-review");
  }

  return (
    <div className="sentinel-mobile-page sentinel-inspection-page space-y-2">
      <div className="sentinel-inspection-before-header-gap" aria-hidden="true" />

      <InspectionWorkflowHeader
        currentStep={currentStep}
        steps={steps}
        inspectionContext={inspectionContext}
        isAdvancedMode={isAdvancedMode}
        quickCapture={quickCapture}
        lastSavedAt={lastSavedAt}
        goToInspectionStep={goToInspectionStep}
        saveFinding={saveFinding}
        generateReport={generateReport}
        goToCoverPage={() => router.push("/inspection-cover")}
      />

      <div className="sentinel-inspection-after-header-gap">
        <InspectionStepRenderer
        currentStep={currentStep}
        isAdvancedMode={isAdvancedMode}
        inspectionContext={inspectionContext}
        inspectionMode={inspectionMode}
        setInspectionMode={setInspectionMode}
        quickCapture={quickCapture}
        hazardCategory={hazardCategory}
        setHazardCategory={setHazardCategory}
        location={location}
        setLocation={setLocation}
        description={description}
        setDescription={setDescription}
        photos={photos}
        setPhotos={setPhotos}
        evidenceNotes={evidenceNotes}
        setEvidenceNotes={setEvidenceNotes}
        annotatingPhotoIndex={annotatingPhotoIndex}
        setAnnotatingPhotoIndex={setAnnotatingPhotoIndex}
        annotationExpanded={annotationExpanded}
        setAnnotationExpanded={setAnnotationExpanded}
        handlePhotoUpload={handlePhotoUpload}
        removePhoto={removePhoto}
        safeScopeHelpOpen={safeScopeHelpOpen}
        setSafeScopeHelpOpen={setSafeScopeHelpOpen}
        agencyMode={agencyMode}
        riskProfileId={riskProfileId}
        handleRunSafeScope={handleRunSafeScope}
        safeScopeStatus={safeScopeStatus}
        safeScopeResult={safeScopeResult}
        setIsOfflineMode={setIsOfflineMode}
        submitSafeScopeValidation={submitSafeScopeValidation}
        safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
        setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
        safeScopeAdvancedOpen={safeScopeAdvancedOpen}
        setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
        feedbackNotes={feedbackNotes}
        setFeedbackNotes={setFeedbackNotes}
        selectedStandards={selectedStandards}
        getStandardKey={getStandardKey}
        toggleSelectedStandard={toggleSelectedStandard}
        handleFeedback={handleFeedback}
        safeScopeDetailsOpen={safeScopeDetailsOpen}
        setSafeScopeDetailsOpen={setSafeScopeDetailsOpen}
        safeScopeStandardsOpen={safeScopeStandardsOpen}
        setSafeScopeStandardsOpen={setSafeScopeStandardsOpen}
        activeRiskScale={getActiveRiskScale()}
        severity={severity}
        setSeverity={setSeverity}
        likelihood={likelihood}
        setLikelihood={setLikelihood}
        selectedGeneratedActions={selectedGeneratedActions}
        toggleGeneratedAction={toggleGeneratedAction}
        manualActionTitle={manualActionTitle}
        setManualActionTitle={setManualActionTitle}
        manualActionPriority={manualActionPriority}
        setManualActionPriority={setManualActionPriority}
        manualActionDue={manualActionDue}
        setManualActionDue={setManualActionDue}
        manualActionClosureEvidence={manualActionClosureEvidence}
        setManualActionClosureEvidence={setManualActionClosureEvidence}
        manualActions={manualActions}
        addManualAction={addManualAction}
        removeManualAction={removeManualAction}
      />

      <FinalizeInspectionSection
        currentStep={currentStep}
        findingSaveMessage={findingSaveMessage}
        editingFindingIndex={editingFindingIndex}
        currentFindingSaved={currentFindingSaved}
        saveFinding={saveFinding}
        addNewFinding={addNewFinding}
        generateReport={generateReport}
        returnToReportInProgress={() => setCurrentStep(1)}
        description={description}
        hazardCategory={hazardCategory}
        location={location}
        photos={photos}
        safeScopeResult={safeScopeResult}
        riskScore={riskScore}
        selectedStandards={selectedStandards}
        findings={findings}
        editFinding={editFinding}
        deleteFinding={deleteFinding}
      />

      <GenerateReportSection
        currentStep={currentStep}
        findings={findings}
        includeStandardsInReport={includeStandardsInReport}
        setIncludeStandardsInReport={setIncludeStandardsInReport}
        includeActionsInReport={includeActionsInReport}
        setIncludeActionsInReport={setIncludeActionsInReport}
        includePhotosInReport={includePhotosInReport}
        setIncludePhotosInReport={setIncludePhotosInReport}
        includeSafeScopeNotesInReport={includeSafeScopeNotesInReport}
        setIncludeSafeScopeNotesInReport={setIncludeSafeScopeNotesInReport}
        generateReport={generateReport}
      />

      </div>

      {currentStep < 4 && (
        <CurrentHazardCard
          currentStep={currentStep}
          description={description}
          hazardCategory={hazardCategory}
          location={location}
          photos={photos}
          safeScopeResult={safeScopeResult}
          selectedStandards={selectedStandards}
          selectedGeneratedActions={selectedGeneratedActions}
          manualActions={manualActions}
          currentFindingSaved={currentFindingSaved}
        />
      )}

      {reportValidationMessage && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-black text-red-700">
          {reportValidationMessage}
        </div>
      )}
    </div>
  );
}
