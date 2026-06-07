"use client";

import { useEffect, useState } from "react";
import {
  getLatestReport,
  getReports,
  setEditReport,
  setLatestReport,
  setReports,
} from "@/lib/reportStorage";
import { localExporter } from "@/lib/localExporter";
import { getReportPackageForPlan } from "@/lib/reportPackages";
import { saveInspectionReportToCloud } from "@/lib/cloudReports";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";

function getReportPersistenceKey(report: any) {
  return String(report?.cloudReportId || report?.id || "");
}

function isSamePersistentReport(a: any, b: any) {
  const aKey = getReportPersistenceKey(a);
  const bKey = getReportPersistenceKey(b);

  if (!aKey || !bKey) return false;

  return aKey === bKey;
}

function getFindingRisk(finding: any) {
  if (finding.safeScopeResult?.risk?.riskBand) {
    return finding.safeScopeResult.risk.riskBand;
  }

  if (finding.safeScopeResult?.risk?.operationalRisk?.matrixBand) {
    return finding.safeScopeResult.risk.operationalRisk.matrixBand;
  }

  if (finding.riskScore) return String(finding.riskScore);

  if (finding.severity && finding.likelihood) {
    return String(finding.severity * finding.likelihood);
  }

  return "Not rated";
}

function getRiskTone(value: string) {
  const risk = String(value || "").toLowerCase();

  if (risk.includes("critical")) return "bg-red-100 text-red-700";
  if (risk.includes("high")) return "bg-orange-100 text-orange-700";
  if (risk.includes("medium") || risk.includes("moderate")) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getFindingTitle(finding: any) {
  return (
    finding.hazardCategory ||
    finding.safeScopeResult?.classification ||
    finding.category ||
    "Uncategorized finding"
  );
}

function getActionTitle(action: any) {
  return (
    action?.title ||
    action?.description ||
    action?.suggestedFixes?.[0] ||
    "Corrective action"
  );
}

function getStandardCitation(standard: any) {
  return standard?.citation || standard?.standard || standard;
}

function getReportPackageLabel(mode?: string) {
  if (mode === "field_summary") return "Field Summary";
  if (mode === "professional_compliance") return "Professional Compliance";
  if (mode === "validation_appendix") return "Full Validation Appendix";
  if (mode === "evidence_centered") return "Evidence-centered package";
  if (mode === "export_ready") return "Export-ready package";
  if (mode === "ask_every_report") return "Ask every report";
  return "Local-first private vault";
}


function formatReviewConfidence(value: any) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const percent = numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  return `${percent}%`;
}

function formatReviewDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function getSafeScopeValidationStatus(finding: any) {
  const status =
    finding?.safeScopeResult?.validationStatus ||
    finding?.safeScopeResult?.snapshotSummary?.validationStatus ||
    finding?.safeScopeResult?.reasoningSnapshotSummary?.validationStatus ||
    "";

  if (status) return String(status);

  if (finding?.safeScopeResult?.reasoningSnapshotId) return "generated";
  if (finding?.safeScopeResult) return "local_unvalidated";
  return "manual";
}

function formatSafeScopeValidationStatus(status: any) {
  const value = String(status || "manual");

  const labels: Record<string, string> = {
    manual: "Manual finding",
    local_unvalidated: "SafeScope local review needed",
    generated: "SafeScope generated — review needed",
    requires_review: "SafeScope review required",
    validated_accepted: "SafeScope accepted by reviewer",
    validated_modified: "SafeScope modified by reviewer",
    validated_rejected: "SafeScope rejected by reviewer",
    requires_escalation: "SafeScope escalated",
    requires_more_evidence: "More evidence required",
  };

  return labels[value] || value.replace(/_/g, " ");
}

function isSafeScopeValidationComplete(status: any) {
  return ["validated_accepted", "validated_modified", "validated_rejected"].includes(
    String(status || ""),
  );
}

function getSafeScopeReviewSummary(findings: any[]) {
  const safeScopeFindings = findings.filter((finding) => finding.safeScopeResult);
  const unvalidated = safeScopeFindings.filter(
    (finding) => !isSafeScopeValidationComplete(getSafeScopeValidationStatus(finding)),
  );
  const escalated = safeScopeFindings.filter((finding) =>
    ["requires_escalation", "requires_more_evidence", "requires_review"].includes(
      getSafeScopeValidationStatus(finding),
    ),
  );

  return {
    total: safeScopeFindings.length,
    unvalidated: unvalidated.length,
    escalated: escalated.length,
  };
}

function asReviewList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

function getFieldOutputActions(finding: any): any[] {
  const actions = finding?.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions
    .filter(Boolean)
    .map((action: any, index: number) => {
      if (typeof action === "string") {
        return {
          title: action,
          description: action,
          priority: finding?.safeScopeResult?.fieldOutput?.priority || "Medium",
          suggestedFixes: [action],
          verification:
            finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
            "Supervisor verification required before closure.",
          closureEvidence:
            finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
            "Supervisor verification",
          source: "SafeScope field output",
        };
      }

      return {
        ...action,
        title:
          action.title ||
          action.description ||
          action.suggestedFixes?.[0] ||
          `SafeScope corrective action ${index + 1}`,
        description:
          action.description ||
          action.suggestedFixes?.[0] ||
          action.title ||
          "SafeScope field-output corrective action.",
        priority:
          action.priority ||
          finding?.safeScopeResult?.fieldOutput?.priority ||
          "Medium",
        closureEvidence:
          action.closureEvidence ||
          action.verification ||
          finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
          "Supervisor verification",
        source: action.source || "SafeScope field output",
      };
    });
}

function getFindingActionsForReview(finding: any, includeActions = true): any[] {
  if (!includeActions) return [];

  const fieldOutputActions = getFieldOutputActions(finding);
  if (fieldOutputActions.length) {
    return [
      ...fieldOutputActions,
      ...(Array.isArray(finding?.manualActions) ? finding.manualActions : []),
    ];
  }

  return finding.correctiveActions || [
    ...(finding.selectedGeneratedActions || []),
    ...(finding.manualActions || []),
    ...(finding.safeScopeResult?.generatedActions || []),
  ];
}

function getFieldOutputEvidenceGaps(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.evidenceGaps);
}

function getFieldOutputSupervisorQuestions(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.supervisorQuestions);
}

function getFieldOutputWarnings(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.warnings);
}

function formatEquipmentReasoningMode(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

function SafeScopeRealImageAnalysisAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const realImage = safeScopeResult?.realImageAnalysis;
  if (!realImage || !realImage.visualSignals?.length) return null;

  return (
    <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 ring-1 ring-indigo-200">
      <p className="text-[10px] font-black uppercase tracking-wide text-indigo-700">
        AI Photo Analysis (Beta)
      </p>

      <div className="mt-2 space-y-2">
        {realImage.visualSignals.map((sig: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2">
            <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
              sig.support === 'supports_observation' ? 'bg-emerald-500' :
              sig.support === 'conflicts_with_observation' ? 'bg-red-500' :
              'bg-amber-500'
            }`} />
            <div>
              <p className="text-xs font-bold text-slate-800">
                {sig.signal.replace(/_/g, " ")} 
                <span className="ml-1 text-[10px] font-black uppercase text-slate-400 italic">
                  ({sig.support.replace(/_/g, " ")})
                </span>
              </p>
              <p className="text-[10px] text-slate-500">Basis: {sig.basis.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>

      {!!realImage.recommendedPhotoFollowups?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-indigo-700">Recommended Follow-ups</p>
          <ul className="mt-1 list-inside list-disc text-[10px] font-semibold text-indigo-800">
            {realImage.recommendedPhotoFollowups.map((f: string) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-2 text-[10px] font-bold leading-relaxed text-slate-400 italic">
        {realImage.advisoryBoundary} {realImage.imageEvidenceLimitations.join(' · ')}
      </p>
    </div>
  );
}

function SafeScopeVisualEvidenceAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const visual = safeScopeResult?.visualEvidenceReasoning;
  if (!visual || visual.visualSupportLevel === 'not_evaluated') return null;

  return (
    <div className="rounded-xl bg-blue-50 px-3 py-2 ring-1 ring-blue-200">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
        Visual evidence analysis
      </p>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <p>
          <span className="font-black text-slate-800">Status:</span>{" "}
          {visual.visualSupportLevel.replace(/_/g, " ")}
        </p>
        <p>
          <span className="font-black text-slate-800">Score:</span>{" "}
          {visual.photoEvidenceScore}/10
        </p>
      </div>

      {!!visual.visualConsistencyFlags?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-red-700">Consistency Conflicts</p>
          <ul className="mt-1 list-inside list-disc text-xs font-bold text-red-800">
            {visual.visualConsistencyFlags.map((f: string) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      {!!visual.missingVisualEvidence?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-amber-700">Missing Views</p>
          <ul className="mt-1 list-inside list-disc text-xs font-semibold text-amber-800">
            {visual.missingVisualEvidence.map((m: string) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500 italic">
        {visual.advisoryBoundary}
      </p>
    </div>
  );
}

function SafeScopeEquipmentReasoningAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const summary = safeScopeResult?.equipmentReasoningSummary;
  const taskContext = safeScopeResult?.equipmentTaskMechanismContext;
  const archetypeContext = safeScopeResult?.equipmentArchetypeContext;

  if (!summary && !taskContext?.matched && !archetypeContext?.matched) {
    return null;
  }

  const primarySpecific = taskContext?.primaryMatch;
  const primaryArchetype = archetypeContext?.primaryMatch;

  const mechanisms = asReviewList(
    primarySpecific?.harmMechanisms || primaryArchetype?.harmMechanisms,
  )
    .slice(0, 5)
    .map((item) => item.replace(/_/g, " "));

  const domains = asReviewList(
    primarySpecific?.likelyHazardDomains || primaryArchetype?.likelyHazardDomains,
  )
    .slice(0, 5)
    .map((item) => item.replace(/_/g, " "));

  const evidenceQuestions = asReviewList(summary?.evidenceGaps).slice(0, 4);
  const cautions = asReviewList(summary?.cautions).slice(0, 3);
  const rankingReasons = asReviewList(summary?.rankingReasons).slice(0, 3);

  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
        Equipment reasoning
      </p>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <p>
          <span className="font-black text-slate-800">Mode:</span>{" "}
          {formatEquipmentReasoningMode(summary?.primaryReasoningMode)}
        </p>

        <p>
          <span className="font-black text-slate-800">Primary context:</span>{" "}
          {summary?.primaryEquipmentContext || "Unknown"}
        </p>

        <p>
          <span className="font-black text-slate-800">Mechanism/archetype:</span>{" "}
          {summary?.primaryMechanismOrArchetype || "Unknown"}
        </p>

        {!!summary?.supportingContext?.length && (
          <p>
            <span className="font-black text-slate-800">Support:</span>{" "}
            {summary.supportingContext.slice(0, 2).join(" · ")}
          </p>
        )}

        {!!mechanisms.length && (
          <p>
            <span className="font-black text-slate-800">Mechanisms:</span>{" "}
            {mechanisms.join(" · ")}
          </p>
        )}

        {!!domains.length && (
          <p>
            <span className="font-black text-slate-800">Domains:</span>{" "}
            {domains.join(" · ")}
          </p>
        )}
      </div>

      {!!rankingReasons.length && (
        <p className="mt-2">
          <span className="font-black text-slate-800">Ranking basis:</span>{" "}
          {rankingReasons.join(" · ")}
        </p>
      )}

      {!!evidenceQuestions.length && (
        <p className="mt-2">
          <span className="font-black text-slate-800">Evidence questions:</span>{" "}
          {evidenceQuestions.join(" · ")}
        </p>
      )}

      {!!cautions.length && (
        <p className="mt-2 font-black text-amber-800">
          Cautions: {cautions.join(" · ")}
        </p>
      )}

      <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">
        Equipment reasoning is context-only and requires qualified review. It
        does not declare violations, create citations, or override regulations.
      </p>
    </div>
  );
}

export default function InspectionReviewPage() {
  const [report, setReport] = useState<any>(null);
  const [planCode, setPlanCode] = useState(getStoredPlanCode());
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [exportWarning, setExportWarning] = useState("");
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [cloudSaveMessage, setCloudSaveMessage] = useState("");

  useEffect(() => {
    async function loadReport() {
      setPlanCode(getStoredPlanCode());
      const latest = await getLatestReport<any>();
      setReport(latest);
    }

    loadReport();
  }, []);

  const reportPackage = getReportPackageForPlan(planCode);

  async function updateReportOption(key: string, value: boolean) {
    if (!report) return;

    const nextReport = {
      ...report,
      [key]: value,
    };

    setReport(nextReport);
    await setLatestReport(nextReport);

    const existingReports = await getReports<any>();
    if (Array.isArray(existingReports) && existingReports.length) {
      await setReports(
        existingReports.map((item: any) =>
          isSamePersistentReport(item, nextReport) ? nextReport : item,
        ),
      );
    }
  }


  async function saveReportToCloud() {
    if (!report) return;

    setCloudSaveStatus("saving");
    setCloudSaveMessage("Saving report package to cloud...");

    try {
      const saved = await saveInspectionReportToCloud(report);

      const syncedReport = saved?.frontendReportJson || report;

      const nextReport = {
        ...syncedReport,
        cloudReportId: saved?.id || syncedReport.cloudReportId || report.cloudReportId,
        cloudSavedAt: new Date().toISOString(),
        cloudSaveStatus: "saved",
        evidenceCloudSync: syncedReport.evidenceCloudSync || {
          attemptedAt: new Date().toISOString(),
          uploadedCount: saved?.evidenceUploadedCount || 0,
        },
      };

      await persistReviewedReport(nextReport);

      setCloudSaveStatus("saved");
      setCloudSaveMessage(
        saved?.id
          ? `${
              saved?.cloudSaveMode === "updated" ? "Updated" : "Saved"
            } cloud report ${saved.id}. Evidence uploaded: ${
              saved?.evidenceUploadedCount || 0
            }.`
          : "Saved to cloud.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cloud report save failed.";

      setCloudSaveStatus("error");
      setCloudSaveMessage(message);
    }
  }

  async function exportReport() {
    if (!report) return;

    const currentFindings = report.findings || [];
    const safeScopeReviewSummary = getSafeScopeReviewSummary(currentFindings);

    if (!humanReviewConfirmed) {
      setExportWarning(
        "Confirm qualified-person review before exporting this report.",
      );
      return;
    }

    if (safeScopeReviewSummary.unvalidated > 0) {
      setExportWarning(
        `${safeScopeReviewSummary.unvalidated} SafeScope finding(s) still need snapshot validation. Export will continue only after you confirm qualified-person review.`,
      );
    } else {
      setExportWarning("");
    }

    const findings = (report.findings || []).map((finding: any) => ({
      category:
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        "Uncategorized",
      description: finding.description || "No description provided.",
      location: finding.location || report.siteLocation || "Field Inspection",
      severity: Number(finding.severity || 1),
      likelihood: Number(finding.likelihood || 1),
      standards:
        report.includeStandardsInReport === false
          ? []
          : finding.selectedStandards ||
            finding.standards ||
            finding.safeScopeResult?.suggestedStandards ||
            [],
      correctiveActions: getFindingActionsForReview(
        finding,
        report.includeActionsInReport !== false,
      ),
      photos:
        report.includePhotosInReport === false ? [] : finding.photos || [],
      safeScopeValidationStatus: getSafeScopeValidationStatus(finding),
      safeScopeValidationStatusLabel: formatSafeScopeValidationStatus(
        getSafeScopeValidationStatus(finding),
      ),
      safeScopeResult:
        report.includeSafeScopeNotesInReport === false
          ? null
          : finding.safeScopeResult
            ? {
                ...finding.safeScopeResult,
                validationStatus: getSafeScopeValidationStatus(finding),
                validationStatusLabel: formatSafeScopeValidationStatus(
                  getSafeScopeValidationStatus(finding),
                ),
              }
            : null,
      reportPackageCode: reportPackage.code,
    }));

    await localExporter.generatePDF({
      reportPackage,
      adminInfo: {
        company: report.organizationName || "Organization Name",
        site: report.siteLocation || "Field Inspection",
        inspector: report.leadInspector || "Inspector",
        date:
          formatReviewDate(report.inspectionDate || report.createdAt),
        isConfidential: Boolean(report.isConfidential),
        confidentialityMarkerText:
          report.confidentialityMarkerText || "Privileged & Confidential",
        companyLogo:
          report.includeLogoOnCover === false ? "" : report.companyLogo || "",
        reportPackageMode: report.reportPackageMode || "local_first",
        reportId: report.id || "",
        findingCount: report.findings?.length || findings.length,
        additionalInspectors: report.additionalInspectors || [],
      },
      findings,
    });
  }

  async function persistReviewedReport(nextReport: any) {
    setReport(nextReport);
    await setLatestReport(nextReport);

    const storedReports = await getReports<any>();
    const reports = Array.isArray(storedReports) ? storedReports : [];

    await setReports([
      nextReport,
      ...reports.filter((existing: any) => !isSamePersistentReport(existing, nextReport)),
    ]);
  }

  async function editReport() {
    if (!report) return;
    await setEditReport(report);
    window.location.href = "/inspection";
  }

  async function addFindingToReport() {
    if (!report) return;

    await setEditReport({
      ...report,
      __editMode: "add_finding",
    });

    window.location.href = "/inspection";
  }

  async function editFindingFromReview(index: number) {
    if (!report) return;

    await setEditReport({
      ...report,
      __editMode: "edit_finding",
      __editFindingIndex: index,
    });

    window.location.href = "/inspection";
  }

  async function deleteFindingFromReview(index: number) {
    if (!report) return;

    const confirmed = window.confirm(
      "Remove this finding from the report? This cannot be undone.",
    );

    if (!confirmed) return;

    const nextFindings = (report.findings || []).filter(
      (_finding: any, findingIndex: number) => findingIndex !== index,
    );

    const nextReport = {
      ...report,
      findings: nextFindings,
      updatedAt: new Date().toISOString(),
    };

    await persistReviewedReport(nextReport);
  }

  if (!report) {
    return (
      <section className="space-y-5">

        <AppPanel variant="dashed" padding="md" className="text-sm font-semibold text-slate-500">
          No finalized report found.
        </AppPanel>
      </section>
    );
  }

  const findings = report.findings || [];
  const evidenceCount = findings.flatMap((finding: any) => finding.photos || []).length;
  const actionCount = findings.flatMap((finding: any) =>
    finding.correctiveActions || [
      ...(finding.selectedGeneratedActions || []),
      ...(finding.manualActions || []),
    ],
  ).length;

  return (
    <section className="space-y-5">

      <HeroPanel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Step 5: Final Review
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight">
              {report.title || "Inspection Report"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              {report.organizationName || "Organization"} ·{" "}
              {report.siteLocation || "Field Inspection"} ·{" "}
              {findings.length} finding(s)
            </p>
          </div>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [String(findings.length), "Findings"],
            [String(evidenceCount), "Evidence Items"],
            [String(actionCount), "Corrective Actions"],
            [reportPackage.shortLabel, "Tier"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center"
            >
              <p className="text-lg font-black tracking-tight text-white">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <SectionHeader
        eyebrow="Report Details"
        title="Inspection information"
      />

      <AppPanel padding="sm" className="relative px-4 py-3">
        <AppButton
          type="button"
          onClick={editReport}
          aria-label="Edit report details"
          title="Edit report details"
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 h-8 w-8 rounded-full px-0 py-0 text-slate-600 shadow-sm hover:text-[#1D72B8]"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </AppButton>

        <h3 className="truncate pr-10 text-sm font-black tracking-tight text-slate-900">
          {report.organizationName || "Organization"} · {report.siteLocation || "Field Inspection"}
        </h3>

        <div className="mt-3 grid gap-2 lg:grid-cols-4">
          {[
            [
              "Date",
              formatReviewDate(report.inspectionDate || report.createdAt),
            ],
            [
              "Lead Inspector",
              report.leadInspector || "Not entered",
            ],
            [
              "Additional Inspectors",
              report.additionalInspectors?.length
                ? report.additionalInspectors.join(", ")
                : "None",
            ],
            [
              "Confidentiality",
              report.isConfidential
                ? report.confidentialityMarkerText || "Privileged & Confidential"
                : "No",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex h-9 flex-col items-center justify-center rounded-xl bg-slate-50 px-3 text-center"
            >
              <p className="text-[9px] font-black uppercase tracking-wide text-[#1D72B8]">
                {label}
              </p>
              <p className="mt-0.5 max-w-full truncate text-xs font-black text-slate-800" title={String(value)}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </AppPanel>

      <SectionHeader
        eyebrow="Final Report Options"
        title="Included in export"
        description="Toggle the items that should appear in the final PDF."
      />

      <AppPanel padding="md">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "includeStandardsInReport",
              "Standards",
              report.includeStandardsInReport !== false,
            ],
            [
              "includeActionsInReport",
              "Actions",
              report.includeActionsInReport !== false,
            ],
            [
              "includePhotosInReport",
              "Photos",
              report.includePhotosInReport !== false,
            ],
            [
              "includeSafeScopeNotesInReport",
              "SafeScope Notes",
              Boolean(report.includeSafeScopeNotesInReport),
            ],
          ].map(([key, label, checked]: any) => (
            <button
              key={key}
              type="button"
              onClick={() => updateReportOption(key, !checked)}
              className={`flex h-11 items-center justify-between rounded-xl border px-3 text-left transition ${
                checked
                  ? "border-[#1D72B8] bg-[#E8F4FF]"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <span className="truncate text-sm font-black text-slate-900">
                {label}
              </span>

              <span
                className={`ml-3 flex h-5 min-w-10 items-center justify-center rounded-full px-2 text-[10px] font-black uppercase tracking-wide ${
                  checked
                    ? "bg-[#1D72B8] text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {checked ? "On" : "Off"}
              </span>
            </button>
          ))}
        </div>
      </AppPanel>

      {getSafeScopeReviewSummary(findings).total > 0 && (
        <AppPanel padding="md" className="border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                SafeScope Review Governance
              </p>
              <h3 className="mt-1 text-base font-black text-slate-900">
                {getSafeScopeReviewSummary(findings).unvalidated
                  ? `${getSafeScopeReviewSummary(findings).unvalidated} SafeScope finding(s) need validation`
                  : "All SafeScope findings show reviewed status"}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                Snapshot validation status is included in the review page and PDF export.
                Qualified-person review is still required before final use.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100">
                <p className="text-[10px] font-black uppercase text-slate-400">SafeScope</p>
                <p className="text-lg font-black text-slate-900">{getSafeScopeReviewSummary(findings).total}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Open</p>
                <p className="text-lg font-black text-amber-700">{getSafeScopeReviewSummary(findings).unvalidated}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Escalated</p>
                <p className="text-lg font-black text-red-700">{getSafeScopeReviewSummary(findings).escalated}</p>
              </div>
            </div>
          </div>
        </AppPanel>
      )}


      <AppPanel padding="md" className="border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Cloud Persistence
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900">
              Save this report package to the backend
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Local encrypted storage remains active. Cloud save creates a backend
              report record with findings and the full review package JSON for
              cross-device access and production persistence.
            </p>
            {cloudSaveMessage && (
              <p
                className={`mt-2 text-sm font-black ${
                  cloudSaveStatus === "error"
                    ? "text-red-700"
                    : cloudSaveStatus === "saved"
                      ? "text-emerald-700"
                      : "text-slate-600"
                }`}
              >
                {cloudSaveMessage}
              </p>
            )}
          </div>

          <AppButton
            type="button"
            onClick={saveReportToCloud}
            variant="accent"
            size="sm"
            disabled={cloudSaveStatus === "saving"}
            className="shadow-sm"
          >
            {cloudSaveStatus === "saving" ? "Saving..." : "Save to Cloud"}
          </AppButton>
        </div>
      </AppPanel>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Findings"
          title="Findings Review"
          action={
            <AppButton
              type="button"
              onClick={addFindingToReport}
              variant="accent"
              size="sm"
              className="shadow-sm"
            >
              Add Finding
            </AppButton>
          }
        />

        {!findings.length ? (
          <AppPanel variant="dashed" padding="md" className="text-sm font-semibold text-slate-500">
            No findings are attached to this report.
          </AppPanel>
        ) : (
          <div className="space-y-3">
            {findings.map((finding: any, index: number) => {
              const standards =
                report.includeStandardsInReport === false
                  ? []
                  : finding.selectedStandards ||
                    finding.standards ||
                    finding.safeScopeResult?.suggestedStandards ||
                    [];

              const actions = getFindingActionsForReview(
                finding,
                report.includeActionsInReport !== false,
              );

              const fieldOutputEvidenceGaps = getFieldOutputEvidenceGaps(finding);
              const fieldOutputSupervisorQuestions =
                getFieldOutputSupervisorQuestions(finding);
              const fieldOutputWarnings = getFieldOutputWarnings(finding);

              const photos =
                report.includePhotosInReport === false
                  ? []
                  : finding.photos || [];

              const risk = getFindingRisk(finding);
              const confidence =
                finding.safeScopeResult?.confidenceIntelligence
                  ?.overallConfidence ?? finding.safeScopeResult?.confidence;

              const safeScopeValidationStatus =
                getSafeScopeValidationStatus(finding);
              const safeScopeValidationLabel = formatSafeScopeValidationStatus(
                safeScopeValidationStatus,
              );
              const safeScopeValidationComplete =
                isSafeScopeValidationComplete(safeScopeValidationStatus);

              const traceabilityAvailable = Boolean(
                finding.safeScopeResult?.reasoningSnapshotId ||
                  finding.safeScopeResult?.knowledgeBrain?.matches?.length ||
                  finding.safeScopeResult?.fieldOutput?.evidenceGaps?.length ||
                  finding.safeScopeResult?.fieldOutput?.supervisorQuestions?.length ||
                  finding.safeScopeResult?.fieldOutput?.warnings?.length ||
                  finding.safeScopeResult?.knowledgeBrain?.evidenceGaps?.length ||
                  finding.safeScopeResult?.confidenceIntelligence
                    ?.missingCriticalInformation?.length ||
                  finding.safeScopeResult?.confidenceIntelligence?.reviewTriggers
                    ?.length ||
                  finding.safeScopeResult?.trendIntelligence ||
                  finding.safeScopeResult?.equipmentReasoningSummary ||
                  finding.safeScopeResult?.equipmentTaskMechanismContext ||
                  finding.safeScopeResult?.equipmentArchetypeContext ||
                  finding.safeScopeResult?.siteMemory ||
                  finding.safeScopeResult?.workspaceLearning ||
                  finding.safeScopeResult?.correlationIntelligence ||
                  finding.safeScopeResult?.reasoningDrift,
              );

              return (
                <details
                  key={finding.id || index}
                  className="group rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                  open={index === 0}
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Finding {index + 1}
                        </p>
                        <h3 className="mt-0.5 text-base font-black leading-tight text-[#102A43]">
                          {getFindingTitle(finding)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-600">
                          {finding.description || "No description provided."}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                          <span>{finding.location || "No location"}</span>
                          <span>•</span>
                          <span>{photos.length} photo(s)</span>
                          <span>•</span>
                          <span>{standards.length || 0} standard(s)</span>
                          <span>•</span>
                          <span>{actions.length || 0} action(s)</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700 group-open:hidden">
                          +
                        </span>
                        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700 group-open:inline-flex">
                          −
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getRiskTone(
                            risk,
                          )}`}
                        >
                          {risk}
                        </span>
                      </div>
                    </div>
                  </summary>

                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                          Selected Standards
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                          {standards.length
                            ? standards
                                .map((standard: any) =>
                                  getStandardCitation(standard),
                                )
                                .join(" · ")
                            : "None selected"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                          Corrective Actions
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                          {actions.length
                            ? actions
                                .slice(0, 3)
                                .map((action: any) => getActionTitle(action))
                                .join(" · ")
                            : "None assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                          Review
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                          {reportPackage.includesConfidence
                            ? confidence !== undefined && confidence !== null
                              ? `${formatReviewConfidence(confidence) || "SafeScope"} confidence`
                              : finding.safeScopeResult
                                ? "SafeScope reviewed"
                                : "Manual"
                            : finding.safeScopeResult
                              ? "SafeScope reviewed"
                              : "Manual"}
                        </p>
                        {finding.safeScopeResult && (
                          <p
                            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                              safeScopeValidationComplete
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {safeScopeValidationLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {!!actions.length && (
                      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Action Details
                        </p>
                        <div className="mt-1 space-y-1">
                          {actions.slice(0, 3).map((action: any, actionIndex: number) => (
                            <p
                              key={actionIndex}
                              className="text-xs font-semibold leading-5 text-slate-600"
                            >
                              <span className="font-black text-slate-800">
                                {getActionTitle(action)}
                              </span>
                              {" "}· Priority: {action.priority || "Medium"} · Due:{" "}
                              {action.due || action.dueDate || "Not set"} · Evidence:{" "}
                              {action.closureEvidence || action.verification || "Photo"}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {traceabilityAvailable &&
                    (reportPackage.includesSafeScopeTraceability ||
                      reportPackage.includesEvidenceGaps ||
                      reportPackage.includesConfidence ||
                      reportPackage.includesRepeatIntelligence) && (
                    <details className="mt-3 rounded-xl border border-slate-200 bg-white">
                      <summary className="cursor-pointer px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        SafeScope appendix
                      </summary>

                      <div className="space-y-2 border-t border-slate-200 px-3 py-3 text-xs font-semibold leading-5 text-slate-600">
                        {finding.safeScopeResult?.reasoningSnapshotId && (
                          <p>
                            Reasoning snapshot:{" "}
                            {finding.safeScopeResult.reasoningSnapshotId}
                          </p>
                        )}

                        {!!fieldOutputWarnings.length && (
                          <p className="font-black text-red-700">
                            Field-output warning(s):{" "}
                            {fieldOutputWarnings.slice(0, 4).join(" · ")}
                          </p>
                        )}

                        {!fieldOutputWarnings.length &&
                          !!finding.safeScopeResult?.confidenceIntelligence
                            ?.reviewTriggers?.length && (
                            <p className="font-black text-red-700">
                              Supervisor review triggered:{" "}
                              {
                                finding.safeScopeResult.confidenceIntelligence
                                  .reviewTriggers.length
                              }{" "}
                              item(s)
                            </p>
                          )}

                        {!!fieldOutputEvidenceGaps.length && (
                          <p>
                            Field evidence gaps:{" "}
                            {fieldOutputEvidenceGaps.slice(0, 4).join(" · ")}
                          </p>
                        )}

                        {!!fieldOutputSupervisorQuestions.length && (
                          <p>
                            Supervisor questions:{" "}
                            {fieldOutputSupervisorQuestions.slice(0, 4).join(" · ")}
                          </p>
                        )}

                        {!fieldOutputEvidenceGaps.length &&
                          !!finding.safeScopeResult?.knowledgeBrain?.evidenceGaps
                            ?.length && (
                            <p>
                              Evidence gaps:{" "}
                              {finding.safeScopeResult.knowledgeBrain.evidenceGaps
                                .slice(0, 4)
                                .join(" · ")}
                            </p>
                          )}

                        <SafeScopeRealImageAnalysisAppendix
                          safeScopeResult={finding.safeScopeResult}
                        />

                        <SafeScopeVisualEvidenceAppendix
                          safeScopeResult={finding.safeScopeResult}
                        />

                        <SafeScopeEquipmentReasoningAppendix
                          safeScopeResult={finding.safeScopeResult}
                        />

                        {!!finding.safeScopeResult?.knowledgeBrain?.matches?.length && (
                          <p>
                            Knowledge matches:{" "}
                            {finding.safeScopeResult.knowledgeBrain.matches.length}
                          </p>
                        )}
                      </div>
                    </details>
                  )}
                </details>
              );
            })}
          </div>
        )}
      </section>

      <AppPanel padding="md" className="text-center">
        <button
          type="button"
          onClick={() => {
            setHumanReviewConfirmed(!humanReviewConfirmed);
            if (exportWarning) setExportWarning("");
          }}
          className="mx-auto flex max-w-2xl items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
              humanReviewConfirmed ? "bg-[#1D72B8]" : "bg-white"
            }`}
          >
            {humanReviewConfirmed ? "✓" : ""}
          </span>

          <span>
            <span className="block text-sm font-black text-slate-900">
              I confirm this report has been reviewed by a qualified person.
            </span>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
              SafeScope outputs, standards, risk ratings, corrective actions,
              and report language have been independently reviewed before export.
              Use of this report remains subject to the Sentinel Safety legal terms.
            </span>

            <a
              href="/legal"
              className="mt-2 inline-block text-xs font-black text-[#1D72B8] underline underline-offset-2"
              onClick={(event) => event.stopPropagation()}
            >
              Review legal terms
            </a>
          </span>
        </button>

        {exportWarning && (
          <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 ring-1 ring-amber-200">
            {exportWarning}
          </p>
        )}

        <AppButton
          type="button"
          onClick={exportReport}
          disabled={!humanReviewConfirmed}
          className="mx-auto mt-4 h-10 w-44 px-3 text-xs"
        >
          Export Final PDF
        </AppButton>

        {!humanReviewConfirmed && (
          <p className="mt-2 text-[11px] font-bold text-slate-500">
            Confirm qualified-person review to enable export.
          </p>
        )}
      </AppPanel>

    </section>
  );
}
