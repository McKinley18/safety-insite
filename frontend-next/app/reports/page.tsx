"use client";

import { secureStorage } from "@/lib/secureStorage";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import { localExporter } from "@/lib/localExporter";
import { getReports, setReports as persistReports } from "@/lib/reportStorage";

type Report = {
  id: string;
  createdAt: string;
  title?: string;
  location?: string;
  findings?: any[];
  storageSource?: "local" | "cloud" | "seed";
};


function getRiskLabel(report: Report) {
  const scores = report.findings?.map((f) => Number(f.riskScore || 0)) || [];
  const max = Math.max(0, ...scores);

  if (max >= 20) return "Critical";
  if (max >= 12) return "High";
  if (max >= 6) return "Moderate";
  return "Low";
}

function riskClasses(risk: string) {
  switch (risk) {
    case "Critical":
      return "bg-red-100 text-red-700";
    case "High":
      return "bg-orange-100 text-orange-700";
    case "Moderate":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStorageLabel(source?: Report["storageSource"]) {
  if (source === "cloud") return "Workspace Sync";
  if (source === "seed") return "Sample Record";
  return "Local Vault";
}

function getStorageClass(source?: Report["storageSource"]) {
  if (source === "cloud") return "bg-blue-50 text-blue-700 border-blue-100";
  if (source === "seed") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

function getReportIntegrity(report: Report) {
  const findings = report.findings || [];
  const evidenceCount = findings.flatMap((finding: any) => finding.photos || []).length;
  const safeScopeCount = findings.filter((finding: any) => finding.safeScopeResult).length;
  const actionCount = findings.flatMap((finding: any) =>
    finding.correctiveActions || finding.safeScopeResult?.generatedActions || []
  ).length;

  return {
    evidenceCount,
    safeScopeCount,
    actionCount,
    hasEvidence: evidenceCount > 0,
    hasSafeScope: safeScopeCount > 0,
    hasActions: actionCount > 0,
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");

  useEffect(() => {
    async function loadReports() {
      const rawReports = await getReports<any>();
      const parsedReports: Report[] = Array.isArray(rawReports)
        ? rawReports
        : typeof rawReports === "string"
          ? JSON.parse(rawReports || "[]")
          : [];

      const localReports = parsedReports.map((report) => ({
        ...report,
        storageSource: report.storageSource || "local",
      }));

      const latest = secureStorage.get("latest_report", null as any);
      const latestReport: Report | null = latest ? JSON.parse(latest) : null;

      const merged: Report[] = [...localReports];

      if (latestReport && !merged.some((report) => report.id === latestReport.id)) {
        merged.unshift({
          ...latestReport,
          storageSource: latestReport.storageSource || "local",
          title: latestReport.title || "Inspection Report",
          location:
            latestReport.location ||
            latestReport.findings?.[0]?.location ||
            "Field Inspection",
        });
      }

      setReports(merged);
    }

    loadReports();
  }, []);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reports]);

  function persist(nextReports: Report[]) {
    setReports(nextReports);
    secureStorage.set("reports", JSON.stringify(nextReports));
  }

  function startEdit(report: Report) {
    secureStorage.set("edit_report", JSON.stringify(report));
    router.push("/inspection-review");
  }

  function saveEdit(reportId: string) {
    const nextReports = reports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            title: editTitle.trim() || "Inspection Report",
            location: editLocation.trim() || "Field Inspection",
          }
        : report
    );

    persist(nextReports);
    setEditingReportId(null);
    setEditTitle("");
    setEditLocation("");
  }

  function deleteReport(reportId: string) {
    const confirmed = window.confirm("Delete this report? This cannot be undone.");
    if (!confirmed) return;

    const nextReports = reports.filter((report) => report.id !== reportId);
    persist(nextReports);

    const latest = secureStorage.get("latest_report", null as any);
    if (latest) {
      const latestReport = latest;
      if (latestReport.id === reportId) {
        secureStorage.remove("latest_report");
      }
    }
  }

  async function exportReport(report: Report) {
    const coverPage = secureStorage.get("cover_page", {} as any);

    const normalizedFindings = (report.findings || []).map((finding: any) => ({
      category:
        finding.hazardCategory ||
        finding.category ||
        finding.safeScopeResult?.classification ||
        "Uncategorized",
      description:
        finding.description ||
        finding.hazard ||
        finding.observedCondition ||
        "No description provided.",
      location: finding.location || report.location || "Field Inspection",
      severity: Number(finding.severity || finding.severityScore || 1),
      likelihood: Number(finding.likelihood || finding.likelihoodScore || 1),
      standards:
        finding.standards ||
        finding.safeScopeResult?.suggestedStandards ||
        finding.safeScopeResult?.standards ||
        [],
      correctiveActions:
        finding.correctiveActions ||
        finding.safeScopeResult?.generatedActions ||
        [],
      photos: finding.photos || [],
      safeScopeResult: finding.safeScopeResult || null,
    }));

    await localExporter.generatePDF({
      adminInfo: {
        company:
          coverPage.organizationName ||
          coverPage.company ||
          (report as any).company ||
          "Organization Name",
        site:
          coverPage.siteLocation ||
          coverPage.site ||
          report.location ||
          "Field Inspection",
        inspector:
          coverPage.leadInspector ||
          coverPage.inspector ||
          (report as any).inspector ||
          "Inspector",
        date:
          coverPage.inspectionDate ||
          new Date(report.createdAt).toLocaleDateString(),
        isConfidential:
          Boolean(coverPage.isConfidential || (report as any).confidential),
      },
      findings: normalizedFindings,
    });
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Reports"
        description="Defensible inspection records, evidence packages, SafeScope reasoning, and export-ready operational reports."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Report Integrity
        </p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
          Reports are stored in the Local Vault unless workspace sync is selected. Exported records remain portable for audits, investigations, client delivery, or internal retention.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-sm font-black text-slate-900">Local-first</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Data stays on device unless exported or synced.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-sm font-black text-slate-900">Evidence-centered</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Photos, notes, findings, and actions stay tied to the record.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-sm font-black text-slate-900">Export-ready</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">PDF exports support retention and review workflows.</p>
          </div>
        </div>
      </section>

      {sortedReports.length === 0 ? (
        <div className="border-y border-slate-200 py-6">
          <p className="font-semibold text-slate-600">No reports available.</p>
        </div>
      ) : (
        <div className="border-y border-slate-200">
          {sortedReports.map((report) => {
            const risk = getRiskLabel(report);
            const firstPhoto = report.findings?.flatMap((f) => f.photos || [])?.[0];
            const integrity = getReportIntegrity(report);

            return (
              <div key={report.id} className="border-b border-slate-200 py-4 last:border-b-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    {firstPhoto && (
                      <div className="hidden w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:block">
                        <AnnotationPreview
                          photoUrl={firstPhoto.url}
                          annotations={firstPhoto.annotations || []}
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {editingReportId === report.id ? (
                        <div className="space-y-3">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                            placeholder="Report title"
                          />

                          <input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                            placeholder="Location"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-black text-slate-900">
                              {report.title || "Inspection Report"}
                            </h2>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${riskClasses(
                                risk
                              )}`}
                            >
                              {risk}
                            </span>

                            <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStorageClass(report.storageSource)}`}>
                              {getStorageLabel(report.storageSource)}
                            </span>

                            {report.storageSource !== "cloud" && (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                Confidential Local Copy
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-3 text-xs font-black text-slate-500">
                            <span>{report.location || "Field Inspection"}</span>
                            <span>{report.findings?.length || 0} Findings</span>
                            <span>{integrity.evidenceCount} Evidence Item(s)</span>
                            <span>{integrity.actionCount} Action(s)</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="mt-3 grid gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500 sm:grid-cols-3">
                            <span className={`rounded-lg px-2.5 py-2 ${integrity.hasEvidence ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              Evidence {integrity.hasEvidence ? "Attached" : "Pending"}
                            </span>
                            <span className={`rounded-lg px-2.5 py-2 ${integrity.hasSafeScope ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                              SafeScope {integrity.hasSafeScope ? "Reviewed" : "Not Run"}
                            </span>
                            <span className={`rounded-lg px-2.5 py-2 ${integrity.hasActions ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                              Corrective Actions {integrity.hasActions ? "Linked" : "Pending"}
                            </span>
                          </div>

                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                                  Report Defensibility
                                </p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                  Evidence, findings, timestamps, and corrective actions remain connected to the inspection record for export and review workflows.
                                </p>
                              </div>

                              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700 border border-slate-200">
                                Audit Ready
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              Timestamped Record
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              Evidence Linked
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              Local Vault Encryption
                            </span>

                            {report.storageSource === "cloud" && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                Workspace Synced
                              </span>
                            )}
                          </div>

                          <p className="mt-3 break-all text-[10px] font-semibold text-slate-400">
                            Record ID: {report.id}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {editingReportId === report.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(report.id)}
                          className="rounded-lg bg-[#1D72B8] px-3 py-2 text-xs font-black text-white"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditingReportId(null)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(report)}
                          className="rounded-lg bg-[#E8F4FF] px-3 py-2 text-xs font-black text-[#1D72B8]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => exportReport(report)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                        >
                          Export PDF
                        </button>

                        <button
                          onClick={() => deleteReport(report.id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
