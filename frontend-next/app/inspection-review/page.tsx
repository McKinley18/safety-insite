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
import { getStoredPlanCode } from "@/lib/planEntitlements";

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

export default function InspectionReviewPage() {
  const [report, setReport] = useState<any>(null);
  const [previewPlanCode, setPreviewPlanCode] = useState(getStoredPlanCode());
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [exportWarning, setExportWarning] = useState("");

  useEffect(() => {
    async function loadReport() {
      const latest = await getLatestReport<any>();
      setReport(latest);
    }

    loadReport();
  }, []);

  const reportPackage = getReportPackageForPlan(previewPlanCode);

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
          item.id === nextReport.id ? nextReport : item,
        ),
      );
    }
  }

  async function exportReport() {
    if (!report) return;

    if (!humanReviewConfirmed) {
      setExportWarning(
        "Confirm qualified-person review before exporting this report.",
      );
      return;
    }

    setExportWarning("");

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
      correctiveActions:
        report.includeActionsInReport === false
          ? []
          : finding.correctiveActions || [
              ...(finding.selectedGeneratedActions || []),
              ...(finding.manualActions || []),
            ],
      photos:
        report.includePhotosInReport === false ? [] : finding.photos || [],
      safeScopeResult:
        report.includeSafeScopeNotesInReport === false
          ? null
          : finding.safeScopeResult || null,
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
      ...reports.filter((existing: any) => existing.id !== nextReport.id),
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

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm font-semibold text-slate-500">
          No finalized report found.
        </div>
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

      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
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
      </section>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Report Details
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Inspection information
          </h2>
        </div>
      </div>

      <section className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={editReport}
          aria-label="Edit report details"
          title="Edit report details"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#1D72B8]"
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
        </button>

        <h3 className="truncate pr-10 text-sm font-black tracking-tight text-slate-900">
          {report.organizationName || "Organization"} · {report.siteLocation || "Field Inspection"}
        </h3>

        <div className="mt-3 grid gap-2 lg:grid-cols-3">
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

        {!!report.additionalInspectors?.length && (
          <div className="mt-2 flex h-9 flex-col items-center justify-center rounded-xl bg-slate-50 px-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-wide text-[#1D72B8]">
              Additional Inspectors
            </p>
            <p className="mt-0.5 max-w-full truncate text-xs font-black text-slate-800">
              {report.additionalInspectors.join(", ")}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Preview Report Tier
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Switch report format
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Preview how the same report appears for Basic, Pro, and Company.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              ["basic", "Basic"],
              ["plus", "Pro"],
              ["company", "Company"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreviewPlanCode(value)}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  previewPlanCode === value
                    ? "bg-[#102A43] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Final Report Options
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          Included in export
        </h2>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
          Toggle the items that should appear in the final PDF.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Findings
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Findings Review
            </h2>
          </div>

          <button
            type="button"
            onClick={addFindingToReport}
            className="rounded-xl bg-[#F97316] px-3 py-2 text-xs font-black text-black shadow-sm transition hover:bg-[#EA580C]"
          >
            Add Finding
          </button>
        </div>

        {!findings.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm font-semibold text-slate-500">
            No findings are attached to this report.
          </div>
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

              const actions =
                report.includeActionsInReport === false
                  ? []
                  : finding.correctiveActions || [
                      ...(finding.selectedGeneratedActions || []),
                      ...(finding.manualActions || []),
                    ];

              const photos =
                report.includePhotosInReport === false
                  ? []
                  : finding.photos || [];

              const risk = getFindingRisk(finding);
              const confidence =
                finding.safeScopeResult?.confidenceIntelligence
                  ?.overallConfidence ?? finding.safeScopeResult?.confidence;

              const traceabilityAvailable = Boolean(
                finding.safeScopeResult?.reasoningSnapshotId ||
                  finding.safeScopeResult?.knowledgeBrain?.matches?.length ||
                  finding.safeScopeResult?.knowledgeBrain?.evidenceGaps?.length ||
                  finding.safeScopeResult?.confidenceIntelligence
                    ?.missingCriticalInformation?.length ||
                  finding.safeScopeResult?.confidenceIntelligence?.reviewTriggers
                    ?.length ||
                  finding.safeScopeResult?.trendIntelligence ||
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
                              {action.due || "Not set"} · Evidence:{" "}
                              {action.closureEvidence || "Photo"}
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

                        {!!finding.safeScopeResult?.confidenceIntelligence
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

                        {!!finding.safeScopeResult?.knowledgeBrain?.evidenceGaps
                          ?.length && (
                          <p>
                            Evidence gaps:{" "}
                            {finding.safeScopeResult.knowledgeBrain.evidenceGaps
                              .slice(0, 4)
                              .join(" · ")}
                          </p>
                        )}

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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
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

        <button
          type="button"
          onClick={exportReport}
          disabled={!humanReviewConfirmed}
          className="mx-auto mt-4 flex h-10 w-44 items-center justify-center rounded-xl bg-[#102A43] px-3 text-xs font-black !text-white transition hover:bg-[#1D72B8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:!text-slate-500"
        >
          Export Final PDF
        </button>

        {!humanReviewConfirmed && (
          <p className="mt-2 text-[11px] font-bold text-slate-500">
            Confirm qualified-person review to enable export.
          </p>
        )}
      </section>

    </section>
  );
}
