"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import { getLatestReport, setEditReport } from "@/lib/reportStorage";
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

  async function editReport() {
    if (!report) return;
    await setEditReport(report);
    window.location.href = "/inspection";
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

                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {getFindingRisk(finding)}
                      </span>
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
