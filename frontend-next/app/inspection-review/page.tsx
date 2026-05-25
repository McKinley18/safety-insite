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
import SafeScopeDisclaimer from "@/components/compliance/SafeScopeDisclaimer";

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

export default function InspectionReviewPage() {
  const [report, setReport] = useState<any>(null);
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [exportWarning, setExportWarning] = useState("");

  useEffect(() => {
    async function loadReport() {
      const latest = await getLatestReport<any>();
      setReport(latest);
    }

    loadReport();
  }, []);

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
    }));

    await localExporter.generatePDF({
      adminInfo: {
        company: report.organizationName || "Organization Name",
        site: report.siteLocation || "Field Inspection",
        inspector: report.leadInspector || "Inspector",
        date:
          report.inspectionDate ||
          new Date(report.createdAt).toLocaleDateString(),
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
              Final Report Review
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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addFindingToReport}
              className="rounded-xl bg-[#F97316] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#EA580C]"
            >
              Add Finding
            </button>

            <button
              type="button"
              onClick={editReport}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/20"
            >
              Edit Report
            </button>

            <button
              type="button"
              onClick={exportReport}
              className="rounded-xl bg-[#1D72B8] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#5DB7FF]"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [String(findings.length), "Findings"],
            [String(evidenceCount), "Evidence Items"],
            [String(actionCount), "Corrective Actions"],
            [getReportPackageLabel(report.reportPackageMode), "Package"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3"
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Date", report.inspectionDate || "Not entered"],
          ["Lead Inspector", report.leadInspector || "Not entered"],
          [
            "Confidentiality",
            report.isConfidential
              ? report.confidentialityMarkerText || "Privileged & Confidential"
              : "No",
          ],
          [
            "Additional Inspectors",
            report.additionalInspectors?.length
              ? report.additionalInspectors.join(", ")
              : "None",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
              {label}
            </p>
            <p className="mt-1 text-sm font-black leading-5 text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </section>

      <SafeScopeDisclaimer compact tone="warning" />

      <section className="rounded-xl border border-slate-200 bg-white px-3 py-3">
        <button
          type="button"
          onClick={() => setHumanReviewConfirmed(!humanReviewConfirmed)}
          className="flex w-full items-start gap-3 text-left"
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
            </span>
          </span>
        </button>

        {exportWarning && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">
            {exportWarning}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Findings
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Final finding cards
            </h2>
          </div>

          <button
            type="button"
            onClick={addFindingToReport}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                <article
                  key={finding.id || index}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Finding {index + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-black leading-tight text-[#102A43]">
                        {getFindingTitle(finding)}
                      </h3>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {finding.location || "No location"} · {photos.length} photo(s)
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getRiskTone(
                          risk,
                        )}`}
                      >
                        Risk: {risk}
                      </span>

                      <button
                        type="button"
                        onClick={() => editFindingFromReview(index)}
                        className="rounded-lg bg-[#102A43] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFindingFromReview(index)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Observed Condition
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                      {finding.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                        Primary Standard
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {standards[0]
                          ? getStandardCitation(standards[0])
                          : "None selected"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                        Primary Action
                      </p>
                      <p className="mt-1 text-sm font-black leading-5 text-slate-800">
                        {actions[0] ? getActionTitle(actions[0]) : "None assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                        Review Status
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {finding.safeScopeResult ? "SafeScope reviewed" : "Manual"}
                      </p>
                    </div>
                  </div>

                  <details className="mt-3 rounded-xl border border-slate-200 bg-white">
                    <summary className="cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wide text-slate-600">
                      Details: standards, actions, confidence
                    </summary>

                    <div className="space-y-3 border-t border-slate-200 px-3 py-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Standards
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
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
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Actions
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                            {actions.length
                              ? `${actions.length} action(s) linked`
                              : "None assigned"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Confidence
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                            {confidence !== undefined && confidence !== null
                              ? `${confidence}%`
                              : "Not available"}
                          </p>
                        </div>
                      </div>

                      {!!actions.length && (
                        <div className="space-y-2">
                          {actions.slice(0, 4).map((action: any, actionIndex: number) => (
                            <div
                              key={actionIndex}
                              className="rounded-xl bg-slate-50 px-3 py-2"
                            >
                              <p className="text-sm font-black text-slate-800">
                                {getActionTitle(action)}
                              </p>
                              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                                Priority: {action.priority || "Medium"} · Due:{" "}
                                {action.due || "Not set"} · Evidence:{" "}
                                {action.closureEvidence || "Photo"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>

                  {traceabilityAvailable && (
                    <details className="mt-3 rounded-xl border border-slate-200 bg-white">
                      <summary className="cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wide text-slate-600">
                        SafeScope traceability appendix
                      </summary>

                      <div className="space-y-3 border-t border-slate-200 px-3 py-3 text-sm font-semibold leading-6 text-slate-600">
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

                        {(finding.safeScopeResult?.trendIntelligence ||
                          finding.safeScopeResult?.siteMemory ||
                          finding.safeScopeResult?.workspaceLearning ||
                          finding.safeScopeResult?.correlationIntelligence ||
                          finding.safeScopeResult?.reasoningDrift) && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                              SafeScope Intelligence
                            </p>

                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {finding.safeScopeResult?.trendIntelligence && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                  <p className="text-xs font-black text-slate-900">
                                    Trend / Recurrence
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                    Risk:{" "}
                                    {finding.safeScopeResult.trendIntelligence
                                      .recurrenceRisk || "Not flagged"}
                                    {finding.safeScopeResult.trendIntelligence
                                      .escalationRecommended
                                      ? " · Escalation recommended"
                                      : ""}
                                  </p>
                                </div>
                              )}

                              {finding.safeScopeResult?.siteMemory && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                  <p className="text-xs font-black text-slate-900">
                                    Site Memory
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                    {finding.safeScopeResult.siteMemory
                                      .siteMemorySummary ||
                                      "Site pattern intelligence available."}
                                  </p>
                                </div>
                              )}

                              {finding.safeScopeResult?.workspaceLearning && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                  <p className="text-xs font-black text-slate-900">
                                    Workspace Learning
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                    Similar findings:{" "}
                                    {finding.safeScopeResult.workspaceLearning
                                      .repeatedSimilarFindingCount ?? 0}
                                  </p>
                                </div>
                              )}

                              {finding.safeScopeResult?.correlationIntelligence && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                  <p className="text-xs font-black text-slate-900">
                                    Correlation
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                    {finding.safeScopeResult.correlationIntelligence
                                      .cascadePotential
                                      ? "Cascade potential detected."
                                      : "No major cascade signal detected."}
                                  </p>
                                </div>
                              )}

                              {finding.safeScopeResult?.reasoningDrift && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                  <p className="text-xs font-black text-slate-900">
                                    Reasoning Drift
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                    Band:{" "}
                                    {finding.safeScopeResult.reasoningDrift
                                      .driftBand || "Not detected"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
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
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={exportReport}
          className="w-full rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
        >
          Export Final PDF
        </button>
      </section>
    </section>
  );
}
