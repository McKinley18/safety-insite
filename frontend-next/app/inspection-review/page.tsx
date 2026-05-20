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
                  <div key={finding.id || index} className="py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-900">
                          Finding {index + 1}:{" "}
                          {finding.hazardCategory || "Uncategorized"}
                        </h3>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {finding.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {getFindingRisk(finding)}
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editFindingFromReview(index)}
                            className="rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteFindingFromReview(index)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#F97316]">
                          Standards
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {standards.length
                            ? standards
                                .map(
                                  (standard: any) =>
                                    standard.citation || standard,
                                )
                                .join(", ")
                            : "None selected"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#F97316]">
                          Corrective Actions
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {actions.length} selected
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#F97316]">
                          Evidence
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {photos.length} photo(s)
                        </p>
                      </div>
                    </div>

                    {!!actions.length && (
                      <div className="mt-3 space-y-2">
                        {actions.map((action: any, actionIndex: number) => (
                          <div
                            key={actionIndex}
                            className="rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <p className="text-sm font-black text-slate-800">
                              {action.title ||
                                action.description ||
                                "Corrective action"}
                            </p>
                            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                              Priority: {action.priority || "Medium"} · Due:{" "}
                              {action.due || "Not set"} · Closure Evidence:{" "}
                              {action.closureEvidence || "Photo"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
