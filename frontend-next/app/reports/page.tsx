"use client";

import { secureStorage } from "@/lib/secureStorage";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import EmptyState from "@/components/ui/EmptyState";
import OperationalRow from "@/components/ui/OperationalRow";
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
  const evidenceCount = findings.flatMap(
    (finding: any) => finding.photos || [],
  ).length;
  const safeScopeCount = findings.filter(
    (finding: any) => finding.safeScopeResult,
  ).length;
  const actionCount = findings.flatMap(
    (finding: any) =>
      finding.correctiveActions ||
      finding.safeScopeResult?.generatedActions ||
      [],
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

      if (
        latestReport &&
        !merged.some((report) => report.id === latestReport.id)
      ) {
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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
        : report,
    );

    persist(nextReports);
    setEditingReportId(null);
    setEditTitle("");
    setEditLocation("");
  }

  function deleteReport(reportId: string) {
    const confirmed = window.confirm(
      "Delete this report? This cannot be undone.",
    );
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
        isConfidential: Boolean(
          coverPage.isConfidential || (report as any).confidential,
        ),
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

      <p className="-mt-2 text-xs font-semibold italic leading-5 text-slate-500">
        * Reports follow your selected workspace storage and export settings.
        Evidence, findings, standards, and corrective actions remain tied to the
        inspection record.
      </p>

      {sortedReports.length === 0 ? (
        <EmptyState
          title="No reports available."
          description="Completed inspection reports will appear here."
        />
      ) : (
        <div className="border-y border-slate-200">
          {sortedReports.map((report) => {
            const risk = getRiskLabel(report);
            const firstPhoto = report.findings?.flatMap(
              (f) => f.photos || [],
            )?.[0];
            const integrity = getReportIntegrity(report);

            return (
              <OperationalRow
                key={report.id}
                title={
                  editingReportId === report.id
                    ? "Editing Report"
                    : report.title || "Inspection Report"
                }
                subtitle={
                  editingReportId === report.id
                    ? "Update report title and location."
                    : report.location || "Field Inspection"
                }
                metadata={[
                  `${report.findings?.length || 0} Findings`,
                  `${integrity.evidenceCount} Evidence Item(s)`,
                  `${integrity.actionCount} Action(s)`,
                  new Date(report.createdAt).toLocaleDateString(),
                  getStorageLabel(report.storageSource),
                  `Risk: ${risk}`,
                ]}
                actions={
                  editingReportId === report.id ? (
                    <>
                      <PrimaryButton onClick={() => saveEdit(report.id)}>
                        Save
                      </PrimaryButton>

                      <SecondaryButton onClick={() => setEditingReportId(null)}>
                        Cancel
                      </SecondaryButton>
                    </>
                  ) : (
                    <>
                      <PrimaryButton onClick={() => startEdit(report)}>
                        Edit
                      </PrimaryButton>

                      <SecondaryButton onClick={() => exportReport(report)}>
                        Export PDF
                      </SecondaryButton>

                      <button
                        onClick={() => deleteReport(report.id)}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </>
                  )
                }
              >
                {editingReportId === report.id ? (
                  <div className="grid gap-3 md:grid-cols-2">
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
                  <div className="grid gap-3 md:grid-cols-[96px_1fr]">
                    {firstPhoto ? (
                      <div className="hidden w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:block">
                        <AnnotationPreview
                          photoUrl={firstPhoto.url}
                          annotations={firstPhoto.annotations || []}
                        />
                      </div>
                    ) : (
                      <div className="hidden w-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 md:block" />
                    )}

                    <div>
                      <div className="grid gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500 sm:grid-cols-3">
                        <span>
                          Evidence{" "}
                          {integrity.hasEvidence ? "Attached" : "Pending"}
                        </span>
                        <span>
                          SafeScope{" "}
                          {integrity.hasSafeScope ? "Reviewed" : "Not Run"}
                        </span>
                        <span>
                          Actions {integrity.hasActions ? "Linked" : "Pending"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                        Evidence, findings, timestamps, and corrective actions
                        remain connected to this inspection record for export
                        and review workflows.
                      </p>

                      <p className="mt-2 break-all text-[10px] font-semibold text-slate-400">
                        Record ID: {report.id}
                      </p>
                    </div>
                  </div>
                )}
              </OperationalRow>
            );
          })}
        </div>
      )}
    </section>
  );
}
