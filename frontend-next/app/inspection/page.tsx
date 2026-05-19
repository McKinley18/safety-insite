"use client";

import { secureStorage } from "@/lib/secureStorage";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runSafeScopeV2Classify, sendSafeScopeFeedback, submitSupervisorValidation } from "@/lib/safescope";
import { addReportAttachment, getOrganizationSettings, saveWorkspaceReport, uploadReportAttachment } from "@/lib/auth";
import { getCoverPage, getReports, setLatestReport, setReports } from "@/lib/reportStorage";
import { getStoredActions, saveStoredActions, type StoredAction } from "@/lib/actionStorage";
import { addActivityEvent } from "@/lib/activityStorage";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import AnnotationEditor from "@/components/evidence/AnnotationEditor";
import { deleteEncryptedPhoto, loadEncryptedPhoto, saveEncryptedPhoto } from "@/lib/evidenceStorage";
import { enqueueOfflineItem } from "@/lib/offlineQueue";
import QuickCaptureSection from "@/components/inspection/QuickCaptureSection";
import EvidenceCaptureSection from "@/components/inspection/EvidenceCaptureSection";
import RiskReviewSection from "@/components/inspection/RiskReviewSection";
import CorrectiveActionsSection from "@/components/inspection/CorrectiveActionsSection";
import FinalizeInspectionSection from "@/components/inspection/FinalizeInspectionSection";
import SafeScopeControlsSection from "@/components/inspection/SafeScopeControlsSection";
import SafeScopeResultHeaderSection from "@/components/inspection/SafeScopeResultHeaderSection";
import SafeScopePrimaryDecisionSection from "@/components/inspection/SafeScopePrimaryDecisionSection";
import SafeScopeReasoningPanel from "@/components/inspection/SafeScopeReasoningPanel";
import SafeScopeStandardsSection from "@/components/inspection/SafeScopeStandardsSection";
import SafeScopeSupportingIntelligenceSection from "@/components/inspection/SafeScopeSupportingIntelligenceSection";
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
import { buildInspectionReport } from "@/lib/inspection/reportBuilder";
import { validateInspectionReport } from "@/lib/inspection/reportValidation";





export default function InspectionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [hazardCategory, setHazardCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [annotatingPhotoIndex, setAnnotatingPhotoIndex] = useState<number | null>(null);
  const [annotationExpanded, setAnnotationExpanded] = useState(false);
  const [agencyMode, setAgencyMode] = useState("all");
  const [riskProfileId, setRiskProfileId] = useState<"simple_4x4" | "standard_5x5" | "advanced_6x6">("standard_5x5");

  useEffect(() => {
    async function loadCompanyRiskProfile() {
      try {
        const settings = await getOrganizationSettings();
        const backendRiskProfile = settings.riskProfileId as
          | "simple_4x4"
          | "standard_5x5"
          | "advanced_6x6"
          | undefined;

        if (backendRiskProfile) {
          setRiskProfileId(backendRiskProfile);
          window.localStorage.setItem("sentinel_company_risk_profile", backendRiskProfile);
          return;
        }
      } catch {
        // Fall back to local workspace setting when offline or signed out.
      }

      const savedRiskProfile = window.localStorage.getItem("sentinel_company_risk_profile") as
        | "simple_4x4"
        | "standard_5x5"
        | "advanced_6x6"
        | null;

      if (savedRiskProfile) setRiskProfileId(savedRiskProfile);
    }

    loadCompanyRiskProfile();
  }, []);
  const [safeScopeStatus, setSafeScopeStatus] = useState("");
  const [safeScopeResult, setSafeScopeResult] = useState<any>(null);
  const [selectedStandards, setSelectedStandards] = useState<any[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [severity, setSeverity] = useState<number | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [editingFindingIndex, setEditingFindingIndex] = useState<number | null>(null);
  const [currentFindingSaved, setCurrentFindingSaved] = useState(false);
  const [currentSavedFindingId, setCurrentSavedFindingId] = useState<string | number | null>(null);
  const [findingSaveMessage, setFindingSaveMessage] = useState("");
  const [manualActions, setManualActions] = useState<any[]>([]);
  const [selectedGeneratedActions, setSelectedGeneratedActions] = useState<any[]>([]);
  const [manualActionTitle, setManualActionTitle] = useState("");
  const [manualActionPriority, setManualActionPriority] = useState("Medium");
  const [manualActionDue, setManualActionDue] = useState("");
  const [reportValidationMessage, setReportValidationMessage] = useState("");
  const [includeStandardsInReport, setIncludeStandardsInReport] = useState(true);
  const [includeActionsInReport, setIncludeActionsInReport] = useState(true);
  const [includePhotosInReport, setIncludePhotosInReport] = useState(true);
  const [includeSafeScopeNotesInReport, setIncludeSafeScopeNotesInReport] = useState(false);
  const [safeScopeHelpOpen, setSafeScopeHelpOpen] = useState(false);
  const [safeScopeDetailsOpen, setSafeScopeDetailsOpen] = useState(false);
  const [safeScopeCompactDetailsOpen, setSafeScopeCompactDetailsOpen] = useState(false);
  const [safeScopeAdvancedOpen, setSafeScopeAdvancedOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [inspectionContext, setInspectionContext] = useState<any>(null);

  const [inspectionMode, setInspectionMode] = useState<"quick" | "advanced">("quick");

  const isAdvancedMode = inspectionMode === "advanced";
  const quickCapture =
    inspectionContext?.inspectionType === "quick_hazard_capture" &&
    inspectionContext?.workflowDepth === "quick";

  const riskScore = severity && likelihood ? severity * likelihood : null;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("sentinel_selected_inspection_context");
      if (!raw) return;

      const context = JSON.parse(raw);
      setInspectionContext(context);

      if (context.workflowDepth === "intelligent") setInspectionMode("advanced");
      if (context.workflowDepth === "standard") setInspectionMode("advanced");
      if (context.workflowDepth === "quick") setInspectionMode("quick");

      if (context.agency === "MSHA") setAgencyMode("msha");
      if (context.agency === "OSHA") setAgencyMode("osha_general");
    } catch {}
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
        })
      );

      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
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

      window.localStorage.setItem("sentinel_editing_report_id", report.id || "");
      secureStorage.remove("edit_report");
    } catch {
      secureStorage.remove("edit_report");
    }
  }, []);

  async function handleRunSafeScope() {
    try {
      setSafeScopeStatus("Running SafeScope match...");
      const result = await runSafeScopeV2Classify({
        text: [
          `Hazard category: ${hazardCategory || "Unspecified"}`,
          `Observed condition: ${description || "No description provided"}`,
          `Location: ${location || "No location provided"}`,
          `Evidence notes: ${evidenceNotes || "No evidence notes provided"}`,
          `Regulatory scope: ${agencyMode.toUpperCase()}`,
        ].join("\n"),
        scopes: agencyMode === "all" ? undefined : [agencyMode],
        riskProfileId,
        evidenceTexts: [
          evidenceNotes,
          location,
          photos.length ? `${photos.length} evidence photo(s) attached` : "",
          ...photos.map((photo, index) => `Photo ${index + 1}: ${photo.name || "evidence photo"}`),
        ].filter(Boolean),
        priorFindings: findings.map((finding) => ({
          id: finding.id,
          hazardCategory: finding.hazardCategory,
          classification: finding.safeScopeResult?.classification,
          description: finding.description,
          location: finding.location,
          riskScore: finding.riskScore,
          createdAt: finding.createdAt,
        })),
      });

      setSafeScopeResult(result);
      setSafeScopeCompactDetailsOpen(false);
      setSafeScopeCompactDetailsOpen(false);
      setSafeScopeAdvancedOpen(false);
      setSelectedStandards([]);
      setSafeScopeStatus(`SafeScope v2: ${result.classification} (${result.confidenceBand} confidence)`);
    } catch (error) {
      setSafeScopeStatus(error instanceof Error ? error.message : "SafeScope request failed.");
    }
  }

  function buildSafeScopeText() {
    return [
      `Hazard category: ${hazardCategory || "Unspecified"}`,
      `Observed condition: ${description || "No description provided"}`,
      `Location: ${location || "No location provided"}`,
      `Evidence notes: ${evidenceNotes || "No evidence notes provided"}`,
      `Regulatory scope: ${agencyMode.toUpperCase()}`,
    ].join("\n");
  }

  function getStandardKey(standard: any) {
    return standard.citation || standard.id || standard.title || JSON.stringify(standard);
  }

  function toggleSelectedStandard(standard: any) {
    const standardKey = getStandardKey(standard);

    setSelectedStandards((current) => {
      const selected = current.some((item) => getStandardKey(item) === standardKey);

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
    action: "accepted" | "rejected" | "flagged"
  ) {
    try {
      setSafeScopeStatus(`Submitting ${action} feedback...`);

      await sendSafeScopeFeedback({
        text: buildSafeScopeText(),
        category: safeScopeResult?.classification || hazardCategory || "General",
        mode: agencyMode,
        citation: standard.citation,
        action,
        notes: feedbackNotes,
        confidenceBefore: safeScopeResult?.confidenceIntelligence?.overallConfidence ?? safeScopeResult?.confidence,
        riskProfileId,
      });

      if (action === "accepted") {
        setSelectedStandards((current) => {
          const exists = current.some((item) => item.citation === standard.citation);
          return exists ? current : [...current, standard];
        });
      }

      if (action === "rejected" || action === "flagged") {
        setSelectedStandards((current) =>
          current.filter((item) => item.citation !== standard.citation)
        );
      }

      setSafeScopeStatus(
        action === "accepted"
          ? `Standard selected: ${standard.citation}`
          : `Feedback saved: ${action} ${standard.citation}`
      );
    } catch (error) {
      setSafeScopeStatus("Feedback could not be saved. Please make sure you are signed in and the backend is running.");
    }
  }

  async function submitSafeScopeValidation(decision: "accepted" | "modified" | "rejected" | "escalated" | "insufficient_evidence") {
    if (!safeScopeResult?.reasoningSnapshotId) {
      setSafeScopeStatus("No SafeScope reasoning snapshot is available to validate.");
      return;
    }

    try {
      setSafeScopeStatus("Submitting supervisor validation...");

      await submitSupervisorValidation({
        reasoningSnapshotId: safeScopeResult.reasoningSnapshotId,
        validationDecision: decision,
        reviewerNotes: feedbackNotes,
      });

      setSafeScopeStatus(`Supervisor validation saved: ${decision.replaceAll("_", " ")}`);
    } catch {
      setSafeScopeStatus("Supervisor validation could not be saved. Please confirm the backend is running.");
    }
  }

  function toggleGeneratedAction(action: any) {
    const actionKey = action.title || action.description || JSON.stringify(action);

    setSelectedGeneratedActions((current) => {
      const alreadySelected = current.some(
        (selected) => (selected.title || selected.description || JSON.stringify(selected)) === actionKey
      );

      if (alreadySelected) {
        return current.filter(
          (selected) => (selected.title || selected.description || JSON.stringify(selected)) !== actionKey
        );
      }

      return [
        ...current,
        {
          ...action,
          source: "SafeScope",
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
    setManualActions((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function buildCurrentFinding() {
    return buildFinding({
      existingId:
        editingFindingIndex !== null
          ? findings[editingFindingIndex]?.id
          : null,
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

  async function persistFindingActions(finding: any) {
    const correctiveActions = finding.correctiveActions || [];

    if (!correctiveActions.length) return;

    const storedActions = await getStoredActions();

    const normalizedActions: StoredAction[] = correctiveActions.map((action: any, index: number) => ({
      id: action.id || `ACT-${finding.id}-${index}`,
      title: action.title || action.description || "Corrective action",
      priority: action.priority || "Medium",
      status: action.status || "Open",
      due: action.due || action.dueDate || "",
      source: action.source || "Inspection",
      location: finding.location || "Field Inspection",
      findingTitle:
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        finding.description ||
        "Inspection Finding",
      createdAt: action.createdAt || new Date().toISOString(),
    }));

    const merged = [
      ...normalizedActions,
      ...storedActions.filter(
        (storedAction) =>
          !normalizedActions.some((action) => action.id === storedAction.id)
      ),
    ];

    await saveStoredActions(merged);
  }

  function hasCurrentFindingData() {
    return !!(
      description ||
      hazardCategory ||
      location ||
      evidenceNotes ||
      photos.length ||
      safeScopeResult ||
      selectedStandards.length ||
      selectedGeneratedActions.length ||
      manualActions.length ||
      severity ||
      likelihood
    );
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
    setSafeScopeResult(null);
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

    const current = buildCurrentFinding();
    await persistFindingActions(current);
    await addActivityEvent({
      type: "Finding",
      title: current.hazardCategory || current.safeScopeResult?.classification || "Finding saved",
      detail: current.location || "Inspection finding updated",
    });

    setFindings((prev) => {
      if (editingFindingIndex !== null) {
        return prev.map((finding, index) =>
          index === editingFindingIndex ? current : finding
        );
      }

      const existingIndex = prev.findIndex((finding) => finding.id === current.id);

      if (existingIndex >= 0) {
        return prev.map((finding) =>
          finding.id === current.id ? current : finding
        );
      }

      return [...prev, current];
    });

    setCurrentSavedFindingId(current.id);
    setCurrentFindingSaved(true);
    setFindingSaveMessage(
      editingFindingIndex !== null || currentFindingSaved
        ? "Saved finding updated."
        : "Finding saved."
    );
  }

  async function addNewFinding() {
    if (!currentFindingSaved && hasCurrentFindingData()) {
      const current = buildCurrentFinding();
      await persistFindingActions(current);
      await addActivityEvent({
        type: "Finding",
        title: current.hazardCategory || current.safeScopeResult?.classification || "Finding saved",
        detail: current.location || "Inspection finding added",
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
    Promise.all((finding.photos || []).map((photo: any) => loadEncryptedPhoto(photo))).then(setPhotos);
    setSafeScopeResult(finding.safeScopeResult || null);
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

    if (!isAdvancedMode && targetStep === 3) targetStep = 5;
    if (!isAdvancedMode && currentStep === 5 && nextStep < currentStep) targetStep = 2;

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

    const nextPhotos = await Promise.all(
      files.map((file) => saveEncryptedPhoto(file))
    );

    setPhotos((prev) => [...prev, ...nextPhotos]);
    event.target.value = "";
  }

  function removePhoto(id: string) {
    deleteEncryptedPhoto(id);
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }






  function validateReportBeforeGenerate() {
    const finalizedFindings = [...findings];

    if (!currentFindingSaved && hasCurrentFindingData()) {
      finalizedFindings.push(buildCurrentFinding());
    }

    return validateInspectionReport(finalizedFindings);
  }

  async function generateReport() {
    const validationMessage = validateReportBeforeGenerate();

    if (validationMessage) {
      setReportValidationMessage(validationMessage);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      });
      return;
    }

    setReportValidationMessage("");

    const finalizedFindings = [...findings];

    if (!currentFindingSaved && hasCurrentFindingData()) {
      finalizedFindings.push(buildCurrentFinding());
    }

    const coverPage = await getCoverPage<any>() || {};

    const report = buildInspectionReport({
      coverPage,
      findings: finalizedFindings,
      includeStandardsInReport,
      includeActionsInReport,
      includePhotosInReport,
      includeSafeScopeNotesInReport,
    });

    const storageMode =
      (window.localStorage.getItem("sentinel_report_storage_mode") as
        | "local"
        | "cloud"
        | "ask"
        | null) || "local";

    let shouldSaveLocal = storageMode !== "cloud";

    if (storageMode === "ask") {
      shouldSaveLocal = window.confirm(
        "Save this report locally in this browser?\n\nSelect Cancel for cloud-only storage."
      );
    }

    if (shouldSaveLocal) {
      const existingReportsRaw = await getReports<any>();
      const existingReports = Array.isArray(existingReportsRaw) ? existingReportsRaw : [];

      const nextReports = [
        report,
        ...existingReports.filter((existing: any) => existing.id !== report.id),
      ];

      await setLatestReport(report);
      await setReports(nextReports);
    }

    if (storageMode === "cloud" || storageMode === "ask") {
      try {
        const savedCloudReport = await saveWorkspaceReport(report);

        const attachmentPayloads = finalizedFindings.flatMap((finding: any) =>
          (finding.photos || []).map((photo: any) => ({
            imageUri: photo.url || photo.imageUri || photo.id,
            mimeType: photo.mimeType || photo.type || "image/jpeg",
            fileName: photo.name || "evidence-photo",
          }))
        );

        const uploadedPhotoFiles = finalizedFindings.flatMap((finding: any) =>
          (finding.photos || []).filter((photo: any) => photo.file)
        );

        await Promise.allSettled(
          uploadedPhotoFiles.map((photo: any) =>
            uploadReportAttachment(savedCloudReport.id, photo.file)
          )
        );

        const metadataOnlyAttachments = attachmentPayloads.filter(
          (attachment: any) => !String(attachment.imageUri || "").startsWith("data:")
        );

        await Promise.allSettled(
          metadataOnlyAttachments.map((attachment: any) =>
            addReportAttachment(savedCloudReport.id, attachment)
          )
        );

        window.localStorage.setItem("sentinel_latest_cloud_report_id", savedCloudReport.id);
        window.localStorage.setItem(
          "sentinel_latest_report",
          JSON.stringify(savedCloudReport.frontendReportJson || report)
        );
      } catch (error) {
        await enqueueOfflineItem({
          type: "report_save",
          payload: {
            report,
            storageMode,
            reason: "workspace_cloud_save_failed",
          },
          lastError: error instanceof Error ? error.message : "Unknown cloud save failure",
        });

        alert("Report could not be saved to the workspace database. It was saved locally and queued for retry.");

        const existingReportsRaw = await getReports<any>();
        const existingReports = Array.isArray(existingReportsRaw) ? existingReportsRaw : [];

        const nextReports = [
          report,
          ...existingReports.filter((existing: any) => existing.id !== report.id),
        ];

        await setLatestReport(report);
        await setReports(nextReports);
      }
    }

    await addActivityEvent({
      type: "Report",
      title: `Inspection report ${report.id} generated`,
      detail: `${finalizedFindings.length} finding(s)`,
    });

    router.push("/inspection-review");
  }

  return (
    <>
      <div className="sticky top-[73px] z-30 -mx-4 -mt-5 mb-4 border-b border-blue-100 bg-gradient-to-br from-white via-[#F4F9FF] to-[#E8F4FF] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:-mx-6 sm:px-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              {inspectionContext?.inspectionTitle || steps[currentStep - 1].title.replace(/^Step \d+: /, "")}
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {inspectionContext?.inspectionTitle
                ? `${steps[currentStep - 1].title.replace(/^Step \d+: /, "")} — ${steps[currentStep - 1].desc}`
                : steps[currentStep - 1].desc}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-[#1D72B8] shadow-sm">
              Step {currentStep} of {steps.length}
            </div>
            <p className="text-[11px] font-black text-slate-500">
              {lastSavedAt ? `Saved ${lastSavedAt}` : "Autosave ready"}
            </p>
          </div>
        </div>

        <div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  router.push("/inspection-cover");
                  return;
                }
                goToInspectionStep(currentStep - 1);
              }}
              className="flex min-h-7 items-center rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep === 6) {
                  generateReport();
                  return;
                }

                if (quickCapture && currentStep === 1) {
                  saveFinding();
                  goToInspectionStep(5);
                  return;
                }

                goToInspectionStep(currentStep + 1);
              }}
              className="flex min-h-7 items-center rounded-xl bg-[#102A43] px-4 py-1 text-[11px] font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
            >
              {currentStep === 6
                ? "Generate Report"
                : quickCapture && currentStep === 1
                  ? "Save Finding →"
                  : currentStep === 1
                    ? "Save & Continue →"
                    : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 hidden gap-2 sm:flex">
        {steps
          .filter((_, index) => isAdvancedMode || ![2, 3].includes(index))
          .map((_, visibleIndex) => {
          const visibleSteps = isAdvancedMode ? [1, 2, 3, 4, 5, 6] : [1, 2, 5, 6];
          const stepNumber = visibleSteps[visibleIndex];
          const active = currentStep === stepNumber;
          const complete = currentStep > stepNumber;

          return (
            <div key={stepNumber} className="h-2 flex-1 rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  active || complete ? "bg-[#1D72B8]" : "bg-slate-200"
                }`}
              />
            </div>
          );
        })}
      </div>

      {inspectionContext && (
        <div className="mb-4 border-y border-slate-200 py-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Inspection Context
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {inspectionContext.inspectionTitle}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {inspectionContext.agency} • {inspectionContext.workflowDepth?.replaceAll("_", " ")}
          </p>
        </div>
      )}

      <div className="px-1 py-2 sm:px-2">
        {currentStep === 1 && (
          <QuickCaptureSection
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
            handlePhotoUpload={handlePhotoUpload}
            manualActionTitle={manualActionTitle}
            setManualActionTitle={setManualActionTitle}
            manualActionPriority={manualActionPriority}
            setManualActionPriority={setManualActionPriority}
            manualActionDue={manualActionDue}
            setManualActionDue={setManualActionDue}
            manualActions={manualActions}
            addManualAction={addManualAction}
            removeManualAction={removeManualAction}
          />
        )}
        {currentStep === 2 && (
          <EvidenceCaptureSection
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
          />
        )}

        {currentStep === 3 && isAdvancedMode && (
          <>
            <SafeScopeControlsSection
              safeScopeHelpOpen={safeScopeHelpOpen}
              setSafeScopeHelpOpen={setSafeScopeHelpOpen}
              agencyMode={agencyMode}
              setAgencyMode={setAgencyMode}
              riskProfileId={riskProfileId}
              handleRunSafeScope={handleRunSafeScope}
              safeScopeStatus={safeScopeStatus}
            />

            {safeScopeResult && (
              <div className="mb-4 border-y border-slate-200 py-4">
                <SafeScopeResultHeaderSection
                  safeScopeResult={safeScopeResult}
                  submitSafeScopeValidation={submitSafeScopeValidation}
                />

                <SafeScopePrimaryDecisionSection safeScopeResult={safeScopeResult} />

                <SafeScopeReasoningPanel
                  safeScopeResult={safeScopeResult}
                  safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
                  setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
                  safeScopeAdvancedOpen={safeScopeAdvancedOpen}
                  setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
                />
              </div>
            )}

            <SafeScopeStandardsSection
              safeScopeResult={safeScopeResult}
              feedbackNotes={feedbackNotes}
              setFeedbackNotes={setFeedbackNotes}
              selectedStandards={selectedStandards}
              getStandardKey={getStandardKey}
              toggleSelectedStandard={toggleSelectedStandard}
              handleFeedback={handleFeedback}
            />

            <SafeScopeSupportingIntelligenceSection
              safeScopeResult={safeScopeResult}
              safeScopeDetailsOpen={safeScopeDetailsOpen}
              setSafeScopeDetailsOpen={setSafeScopeDetailsOpen}
            />
          </>
        )}

        {currentStep === 4 && isAdvancedMode && (
          <RiskReviewSection
            activeRiskScale={getActiveRiskScale()}
            safeScopeResult={safeScopeResult}
            severity={severity}
            setSeverity={setSeverity}
            likelihood={likelihood}
            setLikelihood={setLikelihood}
          />
        )}
        {currentStep === 5 && (
          <CorrectiveActionsSection
            safeScopeResult={safeScopeResult}
            selectedGeneratedActions={selectedGeneratedActions}
            toggleGeneratedAction={toggleGeneratedAction}
            manualActionTitle={manualActionTitle}
            setManualActionTitle={setManualActionTitle}
            manualActionPriority={manualActionPriority}
            setManualActionPriority={setManualActionPriority}
            manualActionDue={manualActionDue}
            setManualActionDue={setManualActionDue}
            manualActions={manualActions}
            addManualAction={addManualAction}
            removeManualAction={removeManualAction}
          />
        )}
      </div>

      <FinalizeInspectionSection
        currentStep={currentStep}
        findingSaveMessage={findingSaveMessage}
        editingFindingIndex={editingFindingIndex}
        currentFindingSaved={currentFindingSaved}
        saveFinding={saveFinding}
        addNewFinding={addNewFinding}
        includeStandardsInReport={includeStandardsInReport}
        setIncludeStandardsInReport={setIncludeStandardsInReport}
        includeActionsInReport={includeActionsInReport}
        setIncludeActionsInReport={setIncludeActionsInReport}
        includePhotosInReport={includePhotosInReport}
        setIncludePhotosInReport={setIncludePhotosInReport}
        includeSafeScopeNotesInReport={includeSafeScopeNotesInReport}
        setIncludeSafeScopeNotesInReport={setIncludeSafeScopeNotesInReport}
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

      {reportValidationMessage && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-black text-red-700">
          {reportValidationMessage}
        </div>
      )}

    </>
  );
}
