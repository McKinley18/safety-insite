"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import {
  getLatestReport,
  getReports,
  setEditReport,
  setLatestReport,
  setReports,
} from "@/lib/reportStorage";
import { localExporter } from "@/lib/localExporter";

function getReportPackageLabel(mode?: string) {
  if (mode === "evidence_centered") return "Evidence-centered package";
  if (mode === "export_ready") return "Export-ready package";
  if (mode === "ask_every_report") return "Ask every report";
  return "Local-first private vault";
}

function getFindingRisk(finding: any) {
  if (finding.safeScopeResult?.risk?.riskBand)
    return finding.safeScopeResult.risk.riskBand;
  if (finding.riskScore) return String(finding.riskScore);
  if (finding.severity && finding.likelihood)
    return String(finding.severity * finding.likelihood);
  return "Not rated";
}

export default function InspectionReviewPage() {
  const [report, setReport] = useState<any>(null);

  async function clearActiveInspectionDraft() {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem("sentinel_editing_report_id");
    window.localStorage.removeItem("sentinel_encrypted_cover_page");
    window.localStorage.removeItem("sentinel_encrypted_edit_report");
    window.localStorage.removeItem("sentinel_secure_cover_page");
    window.localStorage.removeItem("sentinel_secure_edit_report");
  }

  useEffect(() => {
    async function loadReport() {
      const latest = await getLatestReport<any>();
      setReport(latest);
    }

    loadReport();
  }, []);

  async function exportReport() {
    if (!report) return;

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

  return (
    <section className="space-y-6">
      <PageHeader
        title="Inspection Review"
        description="Confirm report details, findings, standards, risk, and corrective actions before export."
      />

      {!report ? (
        <p className="text-sm font-semibold text-slate-500">
          No finalized report found.
        </p>
      ) : (
        <>
          <section className="rounded-[24px] bg-[#0B1320] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-[#F97316]">
                  Final Report
                </p>
                <h2 className="text-2xl font-black text-white">
                  {report.title || "Inspection Report"}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                  {report.organizationName || "Organization"} •{" "}
                  {report.siteLocation || "Field Inspection"} •{" "}
                  {report.findings?.length || 0} finding(s)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addFindingToReport}
                  className="rounded-xl bg-[#F97316] px-4 py-2 text-xs font-black text-white"
                >
                  Add Finding
                </button>

                <button
                  type="button"
                  onClick={editReport}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/20"
                >
                  Edit Report
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {[
              ["Date", report.inspectionDate || "Not entered"],
              ["Lead Inspector", report.leadInspector || "Not entered"],
              [
                "Confidentiality",
                report.isConfidential
                  ? report.confidentialityMarkerText ||
                    "Privileged & Confidential"
                  : "No",
              ],
              [
                "Additional Inspectors",
                report.additionalInspectors?.length
                  ? report.additionalInspectors.join(", ")
                  : "None",
              ],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-slate-200 pb-3">
                <p className="text-xs font-black uppercase tracking-wide text-[#F97316]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
              </div>
            ))}
          </section>

          <section className="border-t border-slate-300 pt-5">
            <h2 className="text-xl font-black text-slate-900">Findings</h2>

            <div className="mt-3 divide-y divide-slate-200">
              {(report.findings || []).map((finding: any, index: number) => {
                const standards =
                  report.includeStandardsInReport === false
                    ? []
                    : finding.selectedStandards || finding.standards || [];
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

                return (
                  <div
                    key={finding.id || index}
                    className="py-6 border-b border-slate-200 last:border-b-0"
                  >
                    {/* Header: Finding Category, Risk Badge, and Actions */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Finding {index + 1}
                        </span>
                        <h3 className="text-lg font-black text-[#102A43] leading-tight">
                          {finding.hazardCategory || "Uncategorized"}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {getFindingRisk(finding)}
                        </span>

                        <button
                          type="button"
                          onClick={() => editFindingFromReview(index)}
                          className="rounded-lg bg-[#102A43] px-3 py-1.5 text-xs font-black text-white hover:bg-[#1D72B8] transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFindingFromReview(index)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* 1. Field Report Summary (Always visible) */}
                    <div className="mt-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Observed Condition
                      </p>
                      <p className="mt-0.5 text-sm font-semibold leading-relaxed text-slate-700">
                        {finding.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#F97316]">
                          Primary Standard
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {standards[0]
                            ? standards[0].citation || standards[0]
                            : "None selected"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#F97316]">
                          Primary Corrective Action
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800 leading-tight">
                          {actions[0]
                            ? actions[0].title ||
                              actions[0].description ||
                              "Corrective action"
                            : "None assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#F97316]">
                          Closure Evidence
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {actions[0]
                            ? actions[0].closureEvidence ||
                              "Photo of completed action"
                            : "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* 2. Detailed Safety Review (Collapsed details) */}
                    <details className="mt-4 group border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <summary className="flex items-center justify-between cursor-pointer bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 select-none group-open:border-b group-open:border-slate-200">
                        <span>Detailed Safety Review</span>
                        <span className="text-slate-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>

                      <div className="p-4 space-y-4 text-slate-700">
                        {/* Evidence count, SafeScope confidence, supervisor triggers */}
                        <div className="grid gap-4 sm:grid-cols-3 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Evidence Count
                            </span>
                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                              {photos.length} photo(s)
                            </p>
                          </div>
                          {finding.safeScopeResult?.confidence !==
                            undefined && (
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                SafeScope Confidence
                              </span>
                              <p className="mt-0.5 text-sm font-bold text-slate-800">
                                {finding.safeScopeResult.confidence}%
                              </p>
                            </div>
                          )}
                          {!!finding.safeScopeResult?.confidenceIntelligence
                            ?.reviewTriggers?.length && (
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                                Supervisor Review
                              </span>
                              <p className="mt-0.5 text-xs font-black text-red-700">
                                ⚠️ Triggered (
                                {
                                  finding.safeScopeResult.confidenceIntelligence
                                    .reviewTriggers.length
                                }
                                )
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Matching Reasons */}
                        {(() => {
                          const allSuggested =
                            finding.safeScopeResult?.suggestedStandards || [];
                          const reasons = standards.flatMap((selected: any) => {
                            const cit = selected.citation || selected;
                            const sug = allSuggested.find(
                              (s: any) => s.citation === cit,
                            );
                            return (
                              sug?.matchingReasons ||
                              selected.matchingReasons ||
                              []
                            );
                          });

                          if (reasons.length === 0) return null;
                          return (
                            <div className="border-b border-slate-100 pb-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Matching Reasons
                              </span>
                              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                                {Array.from(new Set(reasons))
                                  .slice(0, 6)
                                  .join(" • ")}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Additional Selected Standards */}
                        {(() => {
                          const additionalStandards = standards.slice(1);
                          return (
                            <div className="border-b border-slate-100 pb-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Additional Selected Standards
                              </span>
                              <p className="mt-0.5 text-sm font-semibold text-slate-600">
                                {additionalStandards.length
                                  ? additionalStandards
                                      .map((s: any) => s.citation || s)
                                      .join(", ")
                                  : "None"}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Additional Corrective Actions */}
                        {(() => {
                          const additionalActions = actions.slice(1);
                          return (
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Additional Corrective Actions
                              </span>
                              {additionalActions.length ? (
                                <div className="mt-2 space-y-2">
                                  {additionalActions.map(
                                    (action: any, actionIndex: number) => (
                                      <div
                                        key={actionIndex}
                                        className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2"
                                      >
                                        <p className="text-sm font-black text-slate-800">
                                          {action.title ||
                                            action.description ||
                                            "Corrective action"}
                                        </p>
                                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                                          Priority:{" "}
                                          {action.priority || "Medium"} · Due:{" "}
                                          {action.due || "Not set"} · Evidence:{" "}
                                          {action.closureEvidence || "Photo"}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p className="mt-0.5 text-sm font-semibold text-slate-500">
                                  None
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </details>

                    {/* 3. Audit Appendix / Traceability (Collapsed details) */}
                    {(() => {
                      const hasSnapshot =
                        !!finding.safeScopeResult?.reasoningSnapshotId;
                      const matches =
                        finding.safeScopeResult?.knowledgeBrain?.matches || [];
                      const evidenceGaps =
                        finding.safeScopeResult?.knowledgeBrain?.evidenceGaps ||
                        finding.safeScopeResult?.confidenceIntelligence
                          ?.missingCriticalInformation ||
                        [];
                      const caution =
                        finding.safeScopeResult?.knowledgeBrain?.caution ||
                        finding.safeScopeResult?.confidenceIntelligence
                          ?.caution;

                      if (
                        !hasSnapshot &&
                        matches.length === 0 &&
                        evidenceGaps.length === 0 &&
                        !caution
                      )
                        return null;

                      return (
                        <details className="mt-3 group border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <summary className="flex items-center justify-between cursor-pointer bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 select-none group-open:border-b group-open:border-slate-200">
                            <span>Audit Appendix & Traceability</span>
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>

                          <div className="p-4 space-y-4 text-slate-700">
                            {/* Snapshot ID */}
                            {finding.safeScopeResult?.reasoningSnapshotId && (
                              <div className="border-b border-slate-100 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  SafeScope Snapshot ID
                                </span>
                                <div className="mt-1">
                                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                                    {
                                      finding.safeScopeResult
                                        .reasoningSnapshotId
                                    }
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Knowledge Brain matches count */}
                            {finding.safeScopeResult?.knowledgeBrain && (
                              <div className="border-b border-slate-100 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Knowledge Brain Reference
                                </span>
                                <p className="mt-0.5 text-sm font-bold text-slate-800">
                                  {matches.length} source(s) retrieved with{" "}
                                  {Math.round(
                                    (finding.safeScopeResult.knowledgeBrain
                                      .confidence || 0) * 100,
                                  )}
                                  % base confidence.
                                </p>
                                {!!matches.length && (
                                  <div className="mt-2 space-y-2">
                                    {matches
                                      .slice(0, 3)
                                      .map((match: any, matchIdx: number) => (
                                        <div
                                          key={matchIdx}
                                          className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs"
                                        >
                                          <p className="font-black text-slate-800">
                                            {match.title ||
                                              "Knowledge Reference"}
                                          </p>
                                          <p className="mt-0.5 font-bold text-slate-500">
                                            {match.agency} · Tier{" "}
                                            {match.authorityTier} ·{" "}
                                            {match.citation}
                                          </p>
                                          {match.reason && (
                                            <p className="mt-1 font-semibold text-slate-600">
                                              Why matched: {match.reason}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Evidence Gaps info */}
                            {!!evidenceGaps.length && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                  Evidence Gaps Identified
                                </span>
                                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs font-bold leading-relaxed text-amber-900">
                                  {evidenceGaps
                                    .slice(0, 4)
                                    .map((gap: string, gapIdx: number) => (
                                      <li key={gapIdx}>{gap}</li>
                                    ))}
                                </ul>
                              </div>
                            )}

                            {/* Source-aware caution/confidence note */}
                            {caution && (
                              <p className="text-[10px] font-bold leading-relaxed text-slate-500 italic border-t border-slate-100 pt-2">
                                ⚠️ {caution}
                              </p>
                            )}
                          </div>
                        </details>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportReport}
              className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white"
            >
              Export PDF
            </button>

            <button
              type="button"
              onClick={editReport}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
            >
              Edit Report
            </button>

            <Link
              href="/reports"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
            >
              View Reports
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
