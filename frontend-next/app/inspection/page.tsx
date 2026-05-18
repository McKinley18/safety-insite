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
import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";
import { deleteEncryptedPhoto, loadEncryptedPhoto, saveEncryptedPhoto } from "@/lib/evidenceStorage";
import { enqueueOfflineItem } from "@/lib/offlineQueue";

const steps = [
  { title: "Step 1: Quick Capture", desc: "Capture the finding quickly. Intelligence can be added after the finding is saved." },
  { title: "Step 2: Evidence", desc: "Add photos, annotations, and notes when available." },
  { title: "Step 3: SafeScope Intelligence", desc: "Optional standards, reasoning, and confidence support." },
  { title: "Step 4: Risk Review", desc: "Optional severity and likelihood scoring for deeper inspections." },
  { title: "Step 5: Actions", desc: "Assign corrective work or accept generated actions." },
  { title: "Step 6: Finalize", desc: "Review and generate the report." },
];

const severityScale = [
  { score: 1, label: "Minor", desc: "First aid or low-impact condition." },
  { score: 2, label: "Moderate", desc: "Medical treatment or limited damage possible." },
  { score: 3, label: "Serious", desc: "Lost time injury or significant equipment damage possible." },
  { score: 4, label: "Major", desc: "Permanent injury, major damage, or regulatory exposure." },
  { score: 5, label: "Critical", desc: "Fatality, catastrophic injury, or imminent danger." },
];

const hazardCategoryOptions = [
  "Machine Guarding",
  "Electrical",
  "Fall Protection",
  "Walking/Working Surfaces",
  "Lockout/Tagout",
  "PPE",
  "Housekeeping",
  "Mobile Equipment",
  "Confined Space",
  "Fire Protection",
  "Hazard Communication",
  "Ergonomics",
  "Material Handling",
  "Emergency Egress",
  "Other",
];

const likelihoodScale = [
  { score: 1, label: "Rare", desc: "Not expected under normal conditions." },
  { score: 2, label: "Unlikely", desc: "Could happen, but not often." },
  { score: 3, label: "Possible", desc: "Could reasonably happen during work." },
  { score: 4, label: "Likely", desc: "Expected to happen if not corrected." },
  { score: 5, label: "Frequent", desc: "Happening now or repeatedly likely." },
];

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
  const isQuickHazardCapture =
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
    const findingId =
      editingFindingIndex !== null
        ? findings[editingFindingIndex]?.id
        : currentSavedFindingId || Date.now();

    const correctiveActions = [...selectedGeneratedActions, ...manualActions].map((action, index) => ({
      ...action,
      id: action.id || `ACT-${findingId}-${index}`,
      title: action.title || action.description || "Corrective action",
      priority: action.priority || "Medium",
      status: action.status || "Open",
      due: action.due || action.dueDate || "",
      source: action.source || (index < selectedGeneratedActions.length ? "SafeScope" : "User"),
      createdAt: action.createdAt || new Date().toISOString(),
    }));

    return {
      id: findingId,
      hazardCategory,
      description,
      location,
      evidenceNotes,
      photos,
      safeScopeResult,
      selectedStandards,
      selectedGeneratedActions,
      manualActions,
      correctiveActions,
      correctiveActionIds: correctiveActions.map((action) => action.id),
      severity,
      likelihood,
      riskScore,
    };
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



  function generateReportId() {
    const year = new Date().getFullYear();
    const shortId = String(Date.now()).slice(-6);
    return `SSR-${year}-${shortId}`;
  }


  function validateReportBeforeGenerate() {
    const finalizedFindings = [...findings];

    if (!currentFindingSaved && hasCurrentFindingData()) {
      finalizedFindings.push(buildCurrentFinding());
    }

    if (!finalizedFindings.length) {
      return "Add at least one finding before generating the report.";
    }

    for (let index = 0; index < finalizedFindings.length; index++) {
      const finding = finalizedFindings[index];
      const label = `Finding ${index + 1}`;

      if (!finding.description?.trim()) {
        return `${label}: Add a hazard description.`;
      }

      // Risk scoring is optional for Quick Capture findings.

      // Standards are optional. Reports can be generated before final standard selection.

      const correctiveActions = finding.correctiveActions || [
        ...(finding.selectedGeneratedActions || []),
        ...(finding.manualActions || []),
      ];

      // Corrective actions are recommended, but optional for fast capture.
    }

    return "";
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

    const report = {
      id: generateReportId(),
      createdAt: new Date().toISOString(),
      title: coverPage.organizationName
        ? `${coverPage.organizationName} Inspection Report`
        : "Inspection Report",
      organizationName: coverPage.organizationName || "",
      siteLocation: coverPage.siteLocation || "",
      inspectionDate: coverPage.inspectionDate || "",
      leadInspector: coverPage.leadInspector || "",
      additionalInspectors: coverPage.additionalInspectors || [],
      isConfidential: !!coverPage.isConfidential,
      includeStandardsInReport,
      includeActionsInReport,
      includePhotosInReport,
      includeSafeScopeNotesInReport,
      findings: finalizedFindings,
    };

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

                if (isQuickHazardCapture && currentStep === 1) {
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
                : isQuickHazardCapture && currentStep === 1
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
          <>
            <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
              {inspectionContext?.inspectionType === "quick_hazard_capture"
                ? "Capture the hazard quickly. Add only what is needed now; deeper review can happen later."
                : inspectionContext?.inspectionType === "msha_workplace_exam"
                  ? "Document all observed workplace conditions clearly. MSHA mode is selected for standards support when advanced review is used."
                  : inspectionContext?.inspectionType === "osha_review"
                    ? "Capture the observed condition first. OSHA-focused standards support is available in advanced review."
                    : inspectionContext?.inspectionType === "incident_review"
                      ? "Capture the event condition, location, and evidence quickly. Add timeline and deeper investigation notes during advanced review."
                      : "Fast capture is the priority. Add the category, location, and a short description now. Risk scoring, standards, and SafeScope intelligence can be added after the finding is saved."}
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectionMode("quick")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  inspectionMode === "quick"
                    ? "bg-[#1D72B8] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Quick Capture
              </button>

              <button
                type="button"
                onClick={() => setInspectionMode("advanced")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  inspectionMode === "advanced"
                    ? "bg-[#102A43] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Advanced Review
              </button>

              <span className="text-xs font-bold text-slate-500">
                {inspectionMode === "quick"
                  ? "Fastest workflow for field inspections."
                  : "Expanded intelligence and defensibility workflow."}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Hazard Category
                </label>
                <input
                  list="hazard-category-options"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                  placeholder="Choose or type"
                  value={hazardCategory}
                  onChange={(e) => setHazardCategory(e.target.value)}
                />
                <datalist
                  id="hazard-category-options"
                  style={{ maxHeight: "120px" }}
                >
                  {hazardCategoryOptions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Location
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                  placeholder="Example: Conveyor 3, north catwalk"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Observed Condition
              </label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                placeholder="Describe what is wrong, who may be exposed, and whether the condition is active."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {isQuickHazardCapture && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                  Photo Evidence
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add a photo now if available. You can still attach more evidence later.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]">
                    Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                {!!photos.length && (
                  <p className="mt-3 text-xs font-black text-slate-500">
                    {photos.length} photo(s) attached.
                  </p>
                )}
              </div>
            )}

            {isQuickHazardCapture && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                  Quick Action
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add a corrective action now, or leave it blank and assign it later.
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px_160px]">
                  <input
                    value={manualActionTitle}
                    onChange={(event) => setManualActionTitle(event.target.value)}
                    placeholder="Corrective action"
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                  />

                  <select
                    value={manualActionPriority}
                    onChange={(event) => setManualActionPriority(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>

                  <input
                    type="date"
                    value={manualActionDue}
                    onChange={(event) => setManualActionDue(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={addManualAction}
                  className="mt-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                >
                  Add Action
                </button>

                {!!manualActions.length && (
                  <div className="mt-3 border-y border-slate-200">
                    {manualActions.map((action, index) => (
                      <div key={`${action.title}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-b-0">
                        <div>
                          <p className="text-sm font-black text-slate-900">{action.title}</p>
                          <p className="text-xs font-semibold text-slate-500">
                            {action.priority} • Due: {action.due || "Not set"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeManualAction(index)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
              {hazardCategory && (
                <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[#1D72B8]">
                  {hazardCategory}
                </span>
              )}
              {location && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {location}
                </span>
              )}
              {description && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  Description added
                </span>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
                Capture clear visual evidence, then annotate key hazard areas for review and verification.
              </p>

              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]">
                  Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="overflow-hidden border-b border-slate-200 bg-white pb-3">
                    <AnnotationPreview photoUrl={photo.url} annotations={photo.annotations || []} />

                    <div className="space-y-2 pt-2">
                      <p className="truncate text-xs font-black text-slate-600">{photo.name}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAnnotatingPhotoIndex(index);
                            setAnnotationExpanded(false);
                          }}
                          className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                        >
                          Annotate
                        </button>

                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      {annotatingPhotoIndex === index && !annotationExpanded && (
                        <div className="mt-3">
                          <button
                            onClick={() => setAnnotationExpanded(true)}
                            className="mb-2 float-right rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                          >
                            Expand
                          </button>

                          <div className="clear-both">
                            <AnnotationEditor
                              photoUrl={photo.url}
                              annotations={photo.annotations || []}
                              onSave={(annotations) => {
                                const next = [...photos];
                                next[index] = { ...photo, annotations };
                                setPhotos(next);
                                setAnnotatingPhotoIndex(null);
                                setAnnotationExpanded(false);
                              }}
                              onCancel={() => {
                                setAnnotatingPhotoIndex(null);
                                setAnnotationExpanded(false);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {annotatingPhotoIndex === index && annotationExpanded && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3">
                          <div className="max-h-[96vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-base font-black text-slate-900">Photo Annotation</h3>
                              <button
                                onClick={() => setAnnotationExpanded(false)}
                                className="rounded-full bg-slate-300 px-4 py-2 text-xs font-black text-slate-900"
                              >
                                Collapse
                              </button>
                            </div>

                            <AnnotationEditor
                              photoUrl={photo.url}
                              annotations={photo.annotations || []}
                              expanded
                              onSave={(annotations) => {
                                const next = [...photos];
                                next[index] = { ...photo, annotations };
                                setPhotos(next);
                                setAnnotatingPhotoIndex(null);
                                setAnnotationExpanded(false);
                              }}
                              onCancel={() => {
                                setAnnotatingPhotoIndex(null);
                                setAnnotationExpanded(false);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">Evidence Notes</label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
              placeholder="Describe photos, documents, or evidence needed."
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
            />
          </>
        )}

        {currentStep === 3 && isAdvancedMode && (
          <>
            <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
              SafeScope uses the hazard category, description, location, evidence notes, and agency mode to suggest likely standards. Suggestions must be reviewed by a qualified safety professional.
            </p>

            <div className="relative mb-4 flex items-center gap-2">
              <p className="text-sm font-black text-slate-800">
                SafeScope decision-support mode
              </p>

              <button
                type="button"
                onClick={() => setSafeScopeHelpOpen((open) => !open)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-[#E8F4FF] text-xs font-black text-[#1D72B8]"
                aria-label="Explain SafeScope decision-support mode"
              >
                ?
              </button>

              {safeScopeHelpOpen && (
                <div className="absolute left-0 top-8 z-20 max-w-sm rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold leading-6 text-slate-600 shadow-xl">
                  <p className="font-black text-slate-900">What this means</p>
                  <p className="mt-1">
                    SafeScope provides decision-support only. Use the results as a review aid. Final standard selection, compliance decisions, and corrective actions remain with qualified personnel.
                  </p>
                </div>
              )}
            </div>

            <label className="mb-2 block text-sm font-black text-slate-700">Applicable Regulations</label>
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["msha", "MSHA"],
                ["osha_general", "OSHA General"],
                ["osha_construction", "OSHA Construction"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setAgencyMode(value)}
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    agencyMode === value
                      ? "bg-[#1D72B8] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-black text-slate-700">Company Risk Matrix</label>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {riskProfileId === "simple_4x4"
                ? "Simple 4x4"
                : riskProfileId === "advanced_6x6"
                  ? "Advanced 6x6"
                  : "Standard 5x5"} is controlled in Company Settings.
            </div>

            <button
              onClick={handleRunSafeScope}
              className="mb-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
            >
              Run SafeScope Match
            </button>

            {safeScopeStatus && <p className="mb-4 text-sm font-black text-slate-600">{safeScopeStatus}</p>}

            {safeScopeResult && (
              <div className="mb-4 border-y border-slate-200 py-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                      SafeScope Analysis
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {safeScopeResult.classification || "Review Required"}
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                    {Math.round(
                      ((safeScopeResult.confidenceIntelligence?.overallConfidence ??
                        safeScopeResult.confidence ??
                        0) || 0) * 100
                    )}% confidence
                  </span>
                </div>

                {(safeScopeResult.basicPlanMode || safeScopeResult.upgradeRequiredForFullSafeScope) && (
                  <div className="mb-4 rounded-2xl border border-blue-100 bg-[#E8F4FF] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                      Plus unlocks full SafeScope
                    </p>
                    <h4 className="mt-1 text-base font-black text-slate-900">
                      You are seeing limited Basic hazard assistance.
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      Upgrade to Plus or Company for standards matching, evidence quality review,
                      exposure-path reasoning, corrective action recommendations, confidence calibration,
                      and full SafeScope traceability.
                    </p>
                  </div>
                )}

                {safeScopeResult.reasoningSnapshotId && (
                  <div className="mb-4 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Supervisor Validation
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      Validate this SafeScope reasoning snapshot for audit history and future learning.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ["accepted", "Accept"],
                        ["modified", "Modify"],
                        ["rejected", "Reject"],
                        ["escalated", "Escalate"],
                        ["insufficient_evidence", "Insufficient Evidence"],
                      ].map(([decision, label]) => (
                        <button
                          key={decision}
                          type="button"
                          onClick={() => submitSafeScopeValidation(decision as any)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(safeScopeResult.reasoningSnapshotId || safeScopeResult.intelligenceMetadata) && (
                  <div className="mb-4 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      SafeScope Traceability
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Snapshot
                        </p>
                        <p className="mt-1 break-all text-xs font-bold text-slate-700">
                          {safeScopeResult.reasoningSnapshotId || "Not saved"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Engine
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-700">
                          {safeScopeResult.intelligenceMetadata?.engineVersion || "Not versioned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Layers
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-700">
                          {safeScopeResult.intelligenceMetadata?.layersExecuted?.length || 0} executed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                        Primary Decision
                      </p>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">
                        {(safeScopeResult.risk?.riskBand ||
                          safeScopeResult.risk?.operationalRisk?.matrixBand ||
                          "Review").toUpperCase()} — {safeScopeResult.classification || "Review Required"}
                      </h3>
                    </div>

                    {(safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
                      safeScopeResult.requiresHumanReview) && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                        Supervisor Review
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="border-l-4 border-[#1D72B8] bg-slate-50 px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Why It Matters
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                        {safeScopeResult.decisionExplainability?.decisionSummary ||
                          safeScopeResult.explanation ||
                          "SafeScope identified a condition that should be reviewed before finalizing the finding."}
                      </p>
                    </div>

                    <div className="border-l-4 border-amber-400 bg-amber-50 px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                        Recommended Focus
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6 text-amber-900">
                        {safeScopeResult.generatedActions?.[0]?.title ||
                          safeScopeResult.controlIntelligence?.verificationRecommendation ||
                          "Verify controls before closure."}
                      </p>
                    </div>

                    <div className="border-l-4 border-slate-300 bg-slate-50 px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Top Standard
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                        {safeScopeResult.suggestedStandards?.[0]?.citation || "No standard selected yet"}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        Standards remain optional until final review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Risk
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {safeScopeResult.risk?.riskBand ||
                        safeScopeResult.risk?.operationalRisk?.matrixBand ||
                        "Not rated"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Environment
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {safeScopeResult.expandedContext?.environment || "Not inferred"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Review Needed
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {safeScopeResult.confidenceIntelligence?.supervisorReviewRecommended ||
                      safeScopeResult.requiresHumanReview
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Top Concern
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {safeScopeResult.decisionExplainability?.decisionSummary ||
                          safeScopeResult.explanation ||
                          "SafeScope identified a condition requiring review."}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Recommended Focus
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {safeScopeResult.generatedActions?.[0]?.title ||
                          safeScopeResult.controlIntelligence?.verificationRecommendation ||
                          "Verify controls before closure."}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Top Standard
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {safeScopeResult.suggestedStandards?.[0]?.citation || "Not selected"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSafeScopeCompactDetailsOpen((open) => !open)}
                    className="mt-4 text-sm font-black text-[#1D72B8] hover:underline"
                  >
                    {safeScopeCompactDetailsOpen ? "Hide detailed reasoning" : "Show detailed reasoning"}
                  </button>
                </div>

                {safeScopeCompactDetailsOpen && (
                  <div className="mt-3">
                {safeScopeCompactDetailsOpen && (
                  <div className="mt-3">
                {!!safeScopeResult.confidenceIntelligence?.missingCriticalInformation?.length && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                      Missing information
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.confidenceIntelligence.missingCriticalInformation
                        .slice(0, 3)
                        .join(" • ")}
                    </p>
                  </div>
                )}

                {!!safeScopeResult.confidenceIntelligence?.reviewTriggers?.length && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-red-700">
                      Supervisor review triggers
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.confidenceIntelligence.reviewTriggers
                        .slice(0, 4)
                        .map((trigger: string) => (
                          <li key={trigger}>{trigger}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setSafeScopeAdvancedOpen((open) => !open)}
                    className="text-sm font-black text-[#1D72B8] hover:underline"
                  >
                    {safeScopeAdvancedOpen ? "Hide detailed SafeScope reasoning" : "Show detailed SafeScope reasoning"}
                  </button>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Expand for domain intelligence, traceability, evidence quality, reasoning layers, and reliability checks.
                  </p>
                </div>

                {safeScopeAdvancedOpen && (
                  <>
                {!!safeScopeResult.confidenceIntelligence?.reasonCodes?.length && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Confidence reason codes
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {safeScopeResult.confidenceIntelligence.reasonCodes
                        .slice(0, 6)
                        .map((code: string) => (
                          <span
                            key={code}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {code.replaceAll("_", " ")}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {safeScopeResult.trendIntelligence && (
                  <SafeScopeDrawer
                    title="Trend Intelligence"
                    summary={`Recurrence risk: ${safeScopeResult.trendIntelligence.recurrenceRisk || "low"}`}
                    badge={safeScopeResult.trendIntelligence.escalationRecommended ? "Escalate" : undefined}
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Trend</p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {safeScopeResult.trendIntelligence.trendDirection || "not established"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Hotspot</p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {safeScopeResult.trendIntelligence.hotspotArea || "None detected"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Related</p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {safeScopeResult.trendIntelligence.relatedFindingCount || 0} finding(s)
                        </p>
                      </div>
                    </div>

                    {!!safeScopeResult.trendIntelligence.controlFailureIndicators?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.trendIntelligence.controlFailureIndicators
                          .slice(0, 3)
                          .map((indicator: string) => (
                            <li key={indicator}>{indicator}</li>
                          ))}
                      </ul>
                    )}

                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.trendIntelligence.recommendation}
                    </p>
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.evidenceQuality && (
                  <SafeScopeDrawer
                    title="Evidence Quality"
                    summary={`Defensibility score: ${safeScopeResult.evidenceQuality.evidenceQualityScore}/100`}
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.evidenceQuality.defensibilityStatement}
                    </p>

                    {!!safeScopeResult.evidenceQuality.gaps?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.evidenceQuality.gaps.slice(0, 4).map((gap: string) => (
                          <li key={gap}>{gap}</li>
                        ))}
                      </ul>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.standardsReasoning?.topDefensible?.length && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Adaptive Standards Reasoning
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.standardsReasoning.summary}
                    </p>

                    <div className="mt-3 space-y-2">
                      {safeScopeResult.standardsReasoning.topDefensible
                        .slice(0, 3)
                        .map((standard: any) => (
                          <div key={standard.citation} className="rounded-xl bg-slate-50 px-3 py-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-black text-slate-900">{standard.citation}</p>
                              <span className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                                {Math.round((standard.defensibilityScore || 0) * 100)}% defensible
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                              {standard.reasoning}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {safeScopeResult.eventSequence && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Event Sequence Intelligence
                    </p>
                    <h4 className="mt-1 text-sm font-black text-slate-900">
                      Sequence confidence: {safeScopeResult.eventSequence.sequenceConfidence || "low"}
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.eventSequence.sequenceSummary}
                    </p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                      {(safeScopeResult.eventSequence.likelySequence || []).map((item: string) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {safeScopeResult.operationalState && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Operational State
                    </p>
                    <h4 className="mt-1 text-sm font-black text-slate-900">
                      {safeScopeResult.operationalState.primaryState?.replaceAll("_", " ") || "unknown"}
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.operationalState.stateAwarenessSummary}
                    </p>
                    {!!safeScopeResult.operationalState.stateRisks?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.operationalState.stateRisks.slice(0, 3).map((risk: string) => (
                          <li key={risk}>{risk}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {safeScopeResult.humanFactors?.humanFactorsPresent && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Human Factors Intelligence
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.humanFactors.humanFactorsSummary}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                      {[
                        ...(safeScopeResult.humanFactors.behaviorRiskSignals || []),
                        ...(safeScopeResult.humanFactors.visibilitySignals || []),
                        ...(safeScopeResult.humanFactors.lineOfFireSignals || []),
                        ...(safeScopeResult.humanFactors.humanFactorSignals || []),
                      ].slice(0, 4).map((signal: string) => (
                        <li key={signal}>{signal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {safeScopeResult.contradictionIntelligence?.contradictionsDetected && (
                  <div className="mt-4 border-l-4 border-red-300 bg-red-50 px-3 py-3">
                    <p className="text-xs font-black uppercase tracking-wide text-red-700">
                      Contradiction Detection
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-red-900">
                      {safeScopeResult.contradictionIntelligence.reviewImpact}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-red-900">
                      {safeScopeResult.contradictionIntelligence.contradictions
                        .slice(0, 3)
                        .map((item: string) => (
                          <li key={item}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {safeScopeResult.exposurePathIntelligence && (
                  <SafeScopeDrawer
                    title="Exposure Path Intelligence"
                    summary={`Exposure complexity: ${safeScopeResult.exposurePathIntelligence.exposureComplexity || "low"}`}
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.exposurePathIntelligence.exposureSummary}
                    </p>

                    {!!safeScopeResult.exposurePathIntelligence.exposurePathways?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {safeScopeResult.exposurePathIntelligence.exposurePathways.map((pathway: string) => (
                          <span
                            key={pathway}
                            className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                          >
                            {pathway}
                          </span>
                        ))}
                      </div>
                    )}

                    {!!safeScopeResult.exposurePathIntelligence.exposureAmplifiers?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.exposurePathIntelligence.exposureAmplifiers
                          .slice(0, 3)
                          .map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                      </ul>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.hazardGraph && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Hazard Relationship Graph
                    </p>
                    <h4 className="mt-1 text-sm font-black text-slate-900">
                      Graph complexity: {safeScopeResult.hazardGraph.graphComplexity || "low"}
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.hazardGraph.graphSummary}
                    </p>

                    {!!safeScopeResult.hazardGraph.nodes?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {safeScopeResult.hazardGraph.nodes.slice(0, 8).map((node: string) => (
                          <span
                            key={node}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {node.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    {!!safeScopeResult.hazardGraph.cascadeRisks?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.hazardGraph.cascadeRisks
                          .slice(0, 3)
                          .map((risk: string) => (
                            <li key={risk}>{risk}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}

                {safeScopeResult.correlationIntelligence && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                          Correlation Intelligence
                        </p>
                        <h4 className="mt-1 text-sm font-black text-slate-900">
                          Cascade potential: {safeScopeResult.correlationIntelligence.cascadePotential || "low"}
                        </h4>
                      </div>
                      {safeScopeResult.correlationIntelligence.escalationRecommended && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          Escalate
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.correlationIntelligence.recommendation}
                    </p>
                  </div>
                )}

                {safeScopeResult.counterfactualIntelligence && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Counterfactual Reasoning
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.counterfactualIntelligence.counterfactualSummary}
                    </p>
                    {!!safeScopeResult.counterfactualIntelligence.counterfactuals?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.counterfactualIntelligence.counterfactuals
                          .slice(0, 3)
                          .map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}

                {safeScopeResult.siteMemory && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Site Memory Intelligence
                    </p>
                    <h4 className="mt-1 text-sm font-black text-slate-900">
                      Degradation risk: {safeScopeResult.siteMemory.degradationRisk || "low"}
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.siteMemory.siteMemorySummary}
                    </p>
                    {!!safeScopeResult.siteMemory.operationalPatterns?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.siteMemory.operationalPatterns.slice(0, 4).map((item: string) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {safeScopeResult.domainIntelligence && (
                  <SafeScopeDrawer
                    title="Domain Intelligence"
                    summary="Specialized operational domain analysis"
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      SafeScope checked specialized safety domains for deeper operational context.
                    </p>

                    <div className="mt-3 space-y-3">
                      {Object.entries(safeScopeResult.domainIntelligence)
                        .filter(([, value]: any) => Boolean(value))
                        .map(([domain, value]: any) => (
                          <div key={domain} className="rounded-xl bg-slate-50 px-3 py-3">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              {domain.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}
                            </p>

                            <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                              {value.reasoningSummary || "Domain indicators detected."}
                            </p>

                            {!!value.detectedIndicators?.length && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {value.detectedIndicators.slice(0, 6).map((indicator: string) => (
                                  <span
                                    key={indicator}
                                    className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                                  >
                                    {indicator}
                                  </span>
                                ))}
                              </div>
                            )}

                            {!!value.requiredControls?.length && (
                              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                Key controls: {value.requiredControls.slice(0, 4).join(" • ")}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.crossDomainInteraction?.interactions?.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                          Cross-Domain Interaction
                        </p>
                        <h4 className="mt-1 text-sm font-black text-slate-900">
                          Interaction severity: {safeScopeResult.crossDomainInteraction.interactionSeverity || "none"}
                        </h4>
                      </div>
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.crossDomainInteraction.interactionSummary}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {safeScopeResult.crossDomainInteraction.interactions
                        .slice(0, 6)
                        .map((item: string) => (
                          <span
                            key={item}
                            className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                          >
                            {item.replaceAll("_", " ")}
                          </span>
                        ))}
                    </div>

                    {!!safeScopeResult.crossDomainInteraction.escalationRisks?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.crossDomainInteraction.escalationRisks
                          .slice(0, 3)
                          .map((risk: string) => (
                            <li key={risk}>{risk}</li>
                          ))}
                      </ul>
                    )}

                    {!!safeScopeResult.crossDomainInteraction.reviewFocus?.length && (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                        Review focus: {safeScopeResult.crossDomainInteraction.reviewFocus.slice(0, 2).join(" ")}
                      </p>
                    )}
                  </div>
                )}

                {(safeScopeResult.confidenceCalibration || safeScopeResult.reasoningDrift) && (
                  <SafeScopeDrawer
                    title="Reliability Intelligence"
                    summary={`Calibrated confidence: ${Math.round((safeScopeResult.confidenceCalibration?.calibratedConfidence || 0) * 100)}%`}
                    badge={safeScopeResult.confidenceCalibration?.calibrationBand?.replaceAll("_", " ")}
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.confidenceCalibration?.reliabilityStatement}
                    </p>

                    {!!safeScopeResult.confidenceCalibration?.calibrationWarnings?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.confidenceCalibration.calibrationWarnings
                          .slice(0, 3)
                          .map((warning: string) => (
                            <li key={warning}>{warning}</li>
                          ))}
                      </ul>
                    )}

                    {safeScopeResult.reasoningDrift && (
                      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Reasoning drift: {safeScopeResult.reasoningDrift.driftBand || "low"}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.reasoningDrift.driftSummary}
                        </p>
                      </div>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.decisionExplainability && (
                  <SafeScopeDrawer
                    title="Decision Explainability"
                    summary="Why SafeScope made this decision"
                    badge={
                      safeScopeResult.decisionExplainability.supervisorReviewRecommended
                        ? "Supervisor Review"
                        : undefined
                    }
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-700">
                      {safeScopeResult.decisionExplainability.decisionSummary}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Confidence
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.decisionExplainability.confidenceStatement}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Risk Basis
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.decisionExplainability.riskStatement}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Standards Basis
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.decisionExplainability.standardsStatement}
                        </p>
                      </div>
                    </div>

                    {!!safeScopeResult.decisionExplainability.keyEvidence?.length && (
                      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.decisionExplainability.keyEvidence
                          .slice(0, 5)
                          .map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                      </ul>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.energyTransferIntelligence && (
                  <SafeScopeDrawer
                    title="Energy Transfer Intelligence"
                    summary={`Dominant energy: ${safeScopeResult.energyTransferIntelligence.dominantEnergySource || "undetermined"}`}
                    badge={
                      safeScopeResult.energyTransferIntelligence.uncontrolledEnergyLikely
                        ? "Uncontrolled Energy"
                        : undefined
                    }
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.energyTransferIntelligence.energyTransferSummary}
                    </p>

                    {!!safeScopeResult.energyTransferIntelligence.energySources?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {safeScopeResult.energyTransferIntelligence.energySources.map((source: string) => (
                          <span
                            key={source}
                            className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}

                    {!!safeScopeResult.energyTransferIntelligence.releaseMechanisms?.length && (
                      <div className="mt-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Release Mechanism
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.energyTransferIntelligence.releaseMechanisms[0]}
                        </p>
                      </div>
                    )}

                    {!!safeScopeResult.energyTransferIntelligence.missingBarriers?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.energyTransferIntelligence.missingBarriers
                          .slice(0, 3)
                          .map((barrier: string) => (
                            <li key={barrier}>{barrier}</li>
                          ))}
                      </ul>
                    )}

                    {!!safeScopeResult.energyTransferIntelligence.controlLogic?.length && (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.energyTransferIntelligence.controlLogic[0]}
                      </p>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.barrierIntelligence && (
                  <SafeScopeDrawer
                    title="Barrier Intelligence"
                    summary={`Barrier adequacy: ${safeScopeResult.barrierIntelligence.barrierAdequacy?.replaceAll("_", " ") || "unknown"}`}
                  >
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.barrierIntelligence.barrierReasoning}
                    </p>

                    {!!safeScopeResult.barrierIntelligence.barrierTypes?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {safeScopeResult.barrierIntelligence.barrierTypes.map((barrier: string) => (
                          <span
                            key={barrier}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {barrier}
                          </span>
                        ))}
                      </div>
                    )}

                    {!!safeScopeResult.barrierIntelligence.failedOrMissingBarriers?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.barrierIntelligence.failedOrMissingBarriers
                          .slice(0, 4)
                          .map((barrier: string) => (
                            <li key={barrier}>{barrier}</li>
                          ))}
                      </ul>
                    )}

                    {!!safeScopeResult.barrierIntelligence.verificationNeeds?.length && (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.barrierIntelligence.verificationNeeds[0]}
                      </p>
                    )}
                  </SafeScopeDrawer>
                )}

                {safeScopeResult.actionEffectiveness && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                          Corrective Action Effectiveness
                        </p>
                        <h4 className="mt-1 text-sm font-black text-slate-900">
                          Effectiveness: {safeScopeResult.actionEffectiveness.effectivenessScore}/100
                        </h4>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
                        {safeScopeResult.actionEffectiveness.effectivenessBand}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.actionEffectiveness.effectivenessStatement}
                    </p>

                    {!!safeScopeResult.actionEffectiveness.unresolvedElements?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.actionEffectiveness.unresolvedElements
                          .slice(0, 4)
                          .map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                      </ul>
                    )}

                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.actionEffectiveness.recommendedImprovement}
                    </p>
                  </div>
                )}

                {safeScopeResult.controlIntelligence && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                          Control Intelligence
                        </p>
                        <h4 className="mt-1 text-sm font-black text-slate-900">
                          Strongest control: {safeScopeResult.controlIntelligence.strongestControl?.replaceAll("_", " ") || "general"}
                        </h4>
                      </div>

                      {safeScopeResult.controlIntelligence.verificationNeeded && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                          Verify
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.controlIntelligence.hierarchyAssessment}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(safeScopeResult.controlIntelligence.controlTypes || []).map((type: string) => (
                        <span
                          key={type}
                          className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                        >
                          {type.replaceAll("_", " ")}
                        </span>
                      ))}
                    </div>

                    {!!safeScopeResult.controlIntelligence.controlGaps?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                        {safeScopeResult.controlIntelligence.controlGaps
                          .slice(0, 3)
                          .map((gap: string) => (
                            <li key={gap}>{gap}</li>
                          ))}
                      </ul>
                    )}

                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.controlIntelligence.verificationRecommendation}
                    </p>
                  </div>
                )}

                {safeScopeResult.operationalReasoning && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                      Operational Reasoning
                    </p>
                    <h4 className="mt-1 text-sm font-black text-slate-900">
                      Causal chain
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {safeScopeResult.operationalReasoning.reasoningSummary}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Exposure Pathway
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.operationalReasoning.exposurePathways?.[0] ||
                            "Exposure pathway requires confirmation."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Injury Mechanism
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.operationalReasoning.likelyInjuryMechanisms?.[0] ||
                            "Injury mechanism requires review."}
                        </p>
                      </div>
                    </div>

                    {!!safeScopeResult.operationalReasoning.supervisorQuestions?.length && (
                      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Supervisor questions
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                          {safeScopeResult.operationalReasoning.supervisorQuestions
                            .slice(0, 4)
                            .map((question: string) => (
                              <li key={question}>{question}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                  </>
                )}

                  </div>
                )}

                  </div>
                )}

                {safeScopeResult.duplicateIntelligence?.possibleDuplicate && (
                  <div className="mt-4 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold leading-6 text-amber-900">
                    Possible duplicate or repeat finding detected. {safeScopeResult.duplicateIntelligence.recommendedSplitOrMergeAction}
                  </div>
                )}

                {safeScopeResult.risk?.requiresShutdown && (
                  <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-700">
                    Shutdown / immediate control recommended.
                  </p>
                )}
              </div>
            )}

            {!!safeScopeResult?.suggestedStandards?.length && (
              <div className="mb-3 border-y border-slate-200 py-3">
                <div className="mb-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                    Standards Review
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">SafeScope Suggested Standards</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    Select only the standards you want included in the final report. Suggestions are not final until reviewed.
                  </p>
                </div>

                <label className="mb-2 block text-sm font-black text-slate-700">
                  Feedback Notes
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Optional notes for accepting, rejecting, or flagging a standard."
                  className="mb-3 min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
                />
                {safeScopeResult.suggestedStandards.map((standard: any) => {
                  const selected = selectedStandards.some(
                    (item) => getStandardKey(item) === getStandardKey(standard)
                  );

                  return (
                    <div
                      key={standard.citation}
                      className={`mb-3 border-b border-slate-200 py-3 transition ${
                        selected
                          ? "border-[#1D72B8] bg-[#E8F4FF]"
                          : "border-slate-200 bg-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-black text-[#1D72B8]">{standard.citation}</div>

                        {selected && (
                          <span className="rounded-full bg-[#1D72B8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                            Selected for Report
                          </span>
                        )}

                        {(Array.isArray(standard.source) ? standard.source : [standard.source]).filter(Boolean).map((source: string) => (
                          <span
                            key={source}
                            className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {source === "cfr_database" ? "CFR Database" : "Curated"}
                          </span>
                        ))}

                        {standard.score !== undefined && (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                            Score {standard.score}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-600">{standard.rationale}</p>

                      {standard.workspaceLearningAdjustment !== undefined && standard.workspaceLearningAdjustment !== 0 && (
                        <div className="mt-2 border-l-4 border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
                          Workspace learning adjustment: {standard.workspaceLearningAdjustment > 0 ? "+" : ""}{standard.workspaceLearningAdjustment}
                        </div>
                      )}

                      {!!standard.workspaceLearningWarnings?.length && (
                        <div className="mt-2 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                          {standard.workspaceLearningWarnings.join(" • ")}
                        </div>
                      )}

                      {!!standard.matchingReasons?.length && (
                        <div className="mt-2 border-l-4 border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Why SafeScope matched this</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {standard.matchingReasons.slice(0, 6).join(" • ")}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            toggleSelectedStandard(standard);
                            if (!selected) handleFeedback(standard, "accepted");
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${
                            selected
                              ? "bg-[#1D72B8] text-white"
                              : "bg-[#DCFCE7] text-[#166534]"
                          }`}
                        >
                          {selected ? "Remove from Report" : "Select for Report"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFeedback(standard, "rejected")}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFeedback(standard, "flagged")}
                          className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-black text-[#92400E]"
                        >
                          Flag
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(!!safeScopeResult?.excludedStandards?.length || !!safeScopeResult?.additionalHazards?.length) && (
              <div className="mb-3 border-y border-slate-200 py-3">
                <button
                  type="button"
                  onClick={() => setSafeScopeDetailsOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                      Supporting Intelligence
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {safeScopeDetailsOpen ? "Hide secondary SafeScope review details." : "Show excluded standards and additional hazard notes."}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    {safeScopeDetailsOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {safeScopeDetailsOpen && (
                  <div className="mt-3 space-y-4">
                    {!!safeScopeResult?.excludedStandards?.length && (
                      <div>
                        <h3 className="font-black text-slate-700">Excluded Standards</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          These standards were considered but excluded based on selected regulatory scope or context.
                        </p>

                        <div className="mt-2">
                          {safeScopeResult.excludedStandards.map((standard: any) => (
                            <div key={standard.citation} className="border-t border-slate-200 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-slate-800">{standard.citation}</p>

                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                  Excluded
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                {standard.heading ||
                                  standard.title ||
                                  standard.rationale ||
                                  standard.summary ||
                                  "This standard was evaluated during SafeScope review."}
                              </p>

                              {!!standard.text && (
                                <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2">
                                  <p className="text-xs font-semibold leading-5 text-slate-600">
                                    {String(standard.text).slice(0, 500)}
                                    {String(standard.text).length > 500 ? "..." : ""}
                                  </p>
                                </div>
                              )}

                              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                                Exclusion Reason
                              </p>

                              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                {standard.reason || "Lower contextual match confidence."}
                              </p>

                              {!!standard.matchingReasons?.length && (
                                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                  Match indicators: {standard.matchingReasons.slice(0, 5).join(" • ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!!safeScopeResult?.additionalHazards?.length && (
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-900">Multi-Hazard Intelligence</h3>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                              SafeScope detected possible secondary hazards that may need separate review before finalizing the finding.
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            {safeScopeResult.additionalHazards.length} Secondary
                          </span>
                        </div>

                        <div className="mt-3 border-y border-slate-200">
                          {safeScopeResult.additionalHazards.map((hazard: any, index: number) => {
                            const hazardName =
                              hazard.classification ||
                              hazard.name ||
                              hazard.hazard ||
                              `Additional Hazard ${index + 1}`;

                            const riskLabel =
                              hazard.risk?.riskBand ||
                              hazard.risk?.operationalRisk?.matrixBand ||
                              hazard.confidenceBand ||
                              "Review";

                            const standards = hazard.suggestedStandards || [];

                            return (
                              <div key={`${hazardName}-${index}`} className="border-b border-slate-200 py-3 last:border-b-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-black text-slate-900">{hazardName}</p>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                    {riskLabel}
                                  </span>
                                </div>

                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                  {hazard.explanation ||
                                    hazard.reason ||
                                    hazard.rationale ||
                                    "Review this secondary hazard for overlapping controls, standards, or corrective actions."}
                                </p>

                                {!!standards.length && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {standards.slice(0, 4).map((standard: any) => (
                                      <span
                                        key={standard.citation}
                                        className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black text-[#1D72B8]"
                                      >
                                        {standard.citation}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <p className="mt-3 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900">
                          Multi-hazard findings should be split into separate findings when controls, standards, or responsible owners differ.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {currentStep === 4 && isAdvancedMode && (
          <>
            {(() => {
              const activeRiskScale = getActiveRiskScale();

              return (
                <>
                  <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
                    Company matrix: <span className="font-black text-slate-700">{activeRiskScale.label}</span>. Select one cell to confirm severity and likelihood.
                  </p>

                  {safeScopeResult?.risk?.operationalRisk && (
                    <div className="mb-4 border-l-4 border-[#1D72B8] bg-[#E8F4FF] px-3 py-2">
                      <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                        SafeScope Suggested Risk
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        Severity {safeScopeResult.risk.operationalRisk.severity} × Likelihood {safeScopeResult.risk.operationalRisk.likelihood} = {safeScopeResult.risk.operationalRisk.matrixScore} {safeScopeResult.risk.operationalRisk.matrixBand}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const scoreBand = (score: number) => {
                      const max = activeRiskScale.maxScore * activeRiskScale.maxScore;
                      const ratio = score / max;

                      if (ratio >= 0.75) return { label: "Critical", cls: "bg-red-100 text-red-800 border-red-200" };
                      if (ratio >= 0.5) return { label: "High", cls: "bg-orange-100 text-orange-800 border-orange-200" };
                      if (ratio >= 0.25) return { label: "Medium", cls: "bg-amber-100 text-amber-800 border-amber-200" };
                      return { label: "Low", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
                    };

                    const likelihoodValues = [...activeRiskScale.likelihood].reverse();
                    const severityValues = activeRiskScale.severity;

                    return (
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3 className="font-black text-slate-800">Risk Matrix</h3>
                          <p className="text-xs font-bold text-slate-500">
                            Likelihood ↑ / Severity →
                          </p>
                        </div>

                        <div
                          className="grid gap-1"
                          style={{
                            gridTemplateColumns: `44px repeat(${activeRiskScale.maxScore}, minmax(0, 1fr))`,
                          }}
                        >
                          <div />
                          {severityValues.map((s) => (
                            <div key={`s-${s.score}`} className="text-center text-[11px] font-black text-slate-500">
                              S{s.score}
                            </div>
                          ))}

                          {likelihoodValues.map((l) => (
                            <div
                              key={`likelihood-row-${l.score}`}
                              className="contents"
                            >
                              <div key={`l-label-${l.score}`} className="flex items-center justify-center text-[11px] font-black text-slate-500">
                                L{l.score}
                              </div>

                              {severityValues.map((s) => {
                                const score = s.score * l.score;
                                const band = scoreBand(score);
                                const selected = severity === s.score && likelihood === l.score;

                                return (
                                  <button
                                    key={`${s.score}-${l.score}`}
                                    type="button"
                                    onClick={() => {
                                      setSeverity(s.score);
                                      setLikelihood(l.score);
                                    }}
                                    className={`min-h-12 rounded-xl border px-2 py-2 text-center text-xs font-black transition ${band.cls} ${
                                      selected ? "ring-2 ring-[#1D72B8] ring-offset-2" : "hover:scale-[1.02]"
                                    }`}
                                  >
                                    {score}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected Severity</p>
                            <p className="mt-1 text-sm font-black text-slate-800">
                              {severity ? `S${severity}` : "Not selected"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected Likelihood</p>
                            <p className="mt-1 text-sm font-black text-slate-800">
                              {likelihood ? `L${likelihood}` : "Not selected"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">User-Approved Risk</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {severity && likelihood
                        ? `Severity ${severity} × Likelihood ${likelihood} = ${severity * likelihood}`
                        : "Select a matrix cell to confirm the final risk rating."}
                    </p>
                  </div>
                </>
              );
            })()}
          </>
        )}

        {currentStep === 5 && (
          <>
            <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
              Select recommended actions when useful, then add the actual action your team will assign and verify.
            </p>

            {safeScopeResult?.generatedActions?.length ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-black text-slate-900">SafeScope Recommended Actions</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Select any SafeScope action you want included in the final finding.
                  </p>
                </div>
                {safeScopeResult.generatedActions.map((action: any, index: number) => {
                  const actionKey = action.title || action.description || JSON.stringify(action);
                  const selected = selectedGeneratedActions.some(
                    (selectedAction) =>
                      (selectedAction.title || selectedAction.description || JSON.stringify(selectedAction)) === actionKey
                  );

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleGeneratedAction(action)}
                      className={`w-full border-l-4 border-b border-slate-200 px-3 py-4 text-left transition ${
                        selected
                          ? "border-l-[#1D72B8] bg-[#E8F4FF]"
                          : "border-l-slate-200 bg-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
                            selected ? "bg-[#1D72B8]" : "bg-white"
                          }`}>
                            {selected ? "✓" : ""}
                          </span>

                          <h4 className="font-black text-slate-900">{action.title}</h4>
                        </div>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                          {action.priority}
                        </span>
                      </div>

                      <ul className="mt-3 list-disc space-y-1 pl-8 text-sm text-slate-700">
                        {action.suggestedFixes?.map((fix: string, i: number) => (
                          <li key={i}>{fix}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="border-y border-slate-200 py-4 text-sm font-semibold text-slate-600">
                Run SafeScope in Step 3 to generate recommended corrective actions.
              </p>
            )}

            <div className="mt-7 border-t border-slate-200 pt-6">
              <h3 className="font-black text-slate-900">User-Entered Corrective Action</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                Add the actual corrective action your team will assign, track, and verify.
              </p>

              <div className="mt-4 grid gap-3">
                <input
                  value={manualActionTitle}
                  onChange={(event) => setManualActionTitle(event.target.value)}
                  placeholder="Example: Install fixed guard and verify before restart"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={manualActionPriority}
                    onChange={(event) => setManualActionPriority(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>

                  <input
                    type="date"
                    value={manualActionDue}
                    onChange={(event) => setManualActionDue(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                  />
                </div>

                <button
                  type="button"
                  onClick={addManualAction}
                  className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white"
                >
                  Add Corrective Action
                </button>
              </div>

              {!!manualActions.length && (
                <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
                  {manualActions.map((action, index) => (
                    <div key={`${action.title}-${index}`} className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <p className="font-black text-slate-900">{action.title}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Priority: {action.priority} • Due: {action.due}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeManualAction(index)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {currentStep === 6 && (
          <>
            <h2 className="mb-4 text-xl font-black text-slate-900">Finalize Inspection</h2>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-900">Inspection Summary</p>
              <p className="mt-2 text-sm text-slate-600">
                Review saved findings and generate the final inspection report.
              </p>
            </div>

            {findingSaveMessage && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-black text-emerald-700">
                {findingSaveMessage}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-black text-slate-900">Report Customization</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Choose what appears in the final report.
              </p>

              {[
                {
                  label: "Include selected standards",
                  desc: "Show regulatory citations selected by the user.",
                  checked: includeStandardsInReport,
                  toggle: () => setIncludeStandardsInReport(!includeStandardsInReport),
                },
                {
                  label: "Include corrective actions",
                  desc: "Show selected SafeScope actions and user-entered actions.",
                  checked: includeActionsInReport,
                  toggle: () => setIncludeActionsInReport(!includeActionsInReport),
                },
                {
                  label: "Include evidence photos",
                  desc: "Show uploaded/annotated photo evidence in the report.",
                  checked: includePhotosInReport,
                  toggle: () => setIncludePhotosInReport(!includePhotosInReport),
                },
                {
                  label: "Include SafeScope notes",
                  desc: "Show confidence and intelligence notes for internal review.",
                  checked: includeSafeScopeNotesInReport,
                  toggle: () => setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport),
                },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={option.toggle}
                  className="mt-3 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
                >
                  <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${option.checked ? "bg-[#1D72B8]" : "bg-white"}`}>
                    {option.checked ? "✓" : ""}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">{option.label}</span>
                    <span className="block text-xs font-semibold text-slate-500">{option.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={saveFinding}
                className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8] active:scale-[0.98]"
              >
                {editingFindingIndex !== null
                  ? "Update Finding"
                  : currentFindingSaved
                    ? "Update Saved Finding"
                    : "Save Current Finding"}
              </button>

              <button
                onClick={addNewFinding}
                className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition active:scale-[0.98] active:bg-slate-300"
              >
                Add New Finding
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-black text-slate-900">
          {currentStep === 6 ? "Saved Findings" : "Current Entry"}
        </h2>

        {currentStep !== 6 ? (
          <>
            <p className="text-sm font-semibold text-slate-600">
              {description || hazardCategory || location
                ? `${hazardCategory || "Uncategorized"} • ${description || "No description yet"}`
                : "Start entering finding details to build the current entry."}
            </p>
            <p className="mt-2 text-xs font-black text-slate-500">
              Photos: {photos.length} • Risk: {safeScopeResult?.risk?.riskBand || riskScore || "Not rated"} • Selected Standards: {selectedStandards.length}
            </p>

            {!!selectedStandards.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedStandards.map((standard: any) => (
                  <span key={standard.citation} className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                    {standard.citation}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : findings.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">No saved findings yet.</p>
        ) : (
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <div key={finding.id || `finding-${index}-${finding.hazardCategory || "unknown"}`} className="rounded-xl border border-slate-200 p-3">
                <div className="font-black">Finding {index + 1}: {finding.hazardCategory || "Uncategorized"}</div>
                <p className="mt-1 text-sm text-slate-600">{finding.description || "No description provided."}</p>
                {!!finding.location && (
                  <p className="mt-1 text-xs font-bold text-slate-500">Location: {finding.location}</p>
                )}
                <p className="mt-1 text-xs font-black text-slate-500">
                  Photos: {finding.photos?.length || 0} • SafeScope: {finding.safeScopeResult?.classification || "Not run"} • Risk: {finding.safeScopeResult?.risk?.riskBand || finding.riskScore || "Not rated"} • Selected Standards: {finding.selectedStandards?.length || 0}
                </p>

                {!!finding.selectedStandards?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finding.selectedStandards.map((standard: any) => (
                      <span key={standard.citation} className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                        {standard.citation}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => editFinding(index)}
                    className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteFinding(index)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reportValidationMessage && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-black text-red-700">
          {reportValidationMessage}
        </div>
      )}

    </>
  );
}
