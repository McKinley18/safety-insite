"use client";
import SafeScopeDisclaimer from "@/components/compliance/SafeScopeDisclaimer";

import { secureStorage } from "@/lib/secureStorage";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import { localExporter } from "@/lib/localExporter";
import { getReports } from "@/lib/reportStorage";
import { getReportPackageForPlan } from "@/lib/reportPackages";

type Report = {
  id: string;
  createdAt: string;
  inspectionDate?: string;
  title?: string;
  location?: string;
  siteLocation?: string;
  organizationName?: string;
  findings?: any[];
  storageSource?: "local" | "cloud" | "seed";
};

function formatDate(value?: string) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not dated";
  return date.toLocaleDateString();
}

function getRiskLabel(report: Report) {
  const scores =
    report.findings?.map((finding: any) => {
      const matrixScore =
        finding.riskScore ||
        finding.safeScopeResult?.risk?.riskScore ||
        finding.safeScopeResult?.risk?.operationalRisk?.matrixScore ||
        0;

      return Number(matrixScore);
    }) || [];

  const bands =
    report.findings?.map((finding: any) =>
      String(
        finding.safeScopeResult?.risk?.riskBand ||
          finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
          "",
      ).toLowerCase(),
    ) || [];

  const max = Math.max(0, ...scores);

  if (bands.some((band) => band.includes("critical")) || max >= 20) {
    return "Critical";
  }

  if (bands.some((band) => band.includes("high")) || max >= 12) {
    return "High";
  }

  if (
    bands.some((band) => band.includes("medium") || band.includes("moderate")) ||
    max >= 6
  ) {
    return "Moderate";
  }

  return "Low";
}

function riskClasses(risk: string) {
  switch (risk) {
    case "Critical":
      return "bg-red-100 text-red-700";
    case "High":
      return "bg-orange-100 text-orange-700";
    case "Moderate":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-emerald-50 text-emerald-700";
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
      finding.correctiveActions || [
        ...(finding.selectedGeneratedActions || []),
        ...(finding.manualActions || []),
        ...(finding.safeScopeResult?.generatedActions || []),
      ],
  ).length;

  const standardsCount = findings.flatMap(
    (finding: any) =>
      finding.selectedStandards ||
      finding.standards ||
      finding.safeScopeResult?.suggestedStandards ||
      [],
  ).length;

  return {
    evidenceCount,
    safeScopeCount,
    actionCount,
    standardsCount,
    hasEvidence: evidenceCount > 0,
    hasSafeScope: safeScopeCount > 0,
    hasActions: actionCount > 0,
  };
}

function getReportTitle(report: Report) {
  return report.title || "Inspection Report";
}

function getReportLocation(report: Report) {
  return (
    report.location ||
    report.siteLocation ||
    report.findings?.[0]?.location ||
    "Field Inspection"
  );
}

function getReportDate(report: Report) {
  return formatDate(report.inspectionDate || report.createdAt);
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
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
      let latestReport: Report | null = null;

      if (latest) {
        latestReport = typeof latest === "string" ? JSON.parse(latest) : latest;
      }

      const merged: Report[] = [...localReports];

      if (
        latestReport &&
        !merged.some((report) => report.id === latestReport?.id)
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
      if (merged[0]?.id) setExpandedReportId(merged[0].id);
    }

    loadReports();
  }, []);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reports]);

  const reportTotals = useMemo(() => {
    const findings = reports.flatMap((report) => report.findings || []);
    const evidenceCount = findings.flatMap(
      (finding: any) => finding.photos || [],
    ).length;
    const actionCount = findings.flatMap(
      (finding: any) =>
        finding.correctiveActions || [
          ...(finding.selectedGeneratedActions || []),
          ...(finding.manualActions || []),
          ...(finding.safeScopeResult?.generatedActions || []),
        ],
    ).length;

    return {
      reports: reports.length,
      findings: findings.length,
      evidenceCount,
      actionCount,
    };
  }, [reports]);

  function persist(nextReports: Report[]) {
    setReports(nextReports);
    secureStorage.set("reports", JSON.stringify(nextReports));
  }

  function startReview(report: Report) {
    secureStorage.set("edit_report", JSON.stringify(report));
    router.push("/inspection-review");
  }

  function beginInlineEdit(report: Report) {
    setEditingReportId(report.id);
    setExpandedReportId(report.id);
    setEditTitle(getReportTitle(report));
    setEditLocation(getReportLocation(report));
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
    const latestReport =
      typeof latest === "string" ? JSON.parse(latest || "null") : latest;

    if (latestReport?.id === reportId) {
      secureStorage.remove("latest_report");
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
      location: finding.location || getReportLocation(report),
      severity: Number(finding.severity || finding.severityScore || 1),
      likelihood: Number(finding.likelihood || finding.likelihoodScore || 1),
      standards:
        finding.selectedStandards ||
        finding.standards ||
        finding.safeScopeResult?.suggestedStandards ||
        finding.safeScopeResult?.standards ||
        [],
      correctiveActions:
        finding.correctiveActions || [
          ...(finding.selectedGeneratedActions || []),
          ...(finding.manualActions || []),
          ...(finding.safeScopeResult?.generatedActions || []),
        ],
      photos: finding.photos || [],
      safeScopeResult: finding.safeScopeResult || null,
    }));

    await localExporter.generatePDF({
      adminInfo: {
        company:
          coverPage.organizationName ||
          coverPage.company ||
          (report as any).organizationName ||
          (report as any).company ||
          "Organization Name",
        site:
          coverPage.siteLocation ||
          coverPage.site ||
          getReportLocation(report),
        inspector:
          coverPage.leadInspector ||
          coverPage.inspector ||
          (report as any).leadInspector ||
          (report as any).inspector ||
          "Inspector",
        date: coverPage.inspectionDate || getReportDate(report),
        isConfidential: Boolean(
          coverPage.isConfidential || (report as any).confidential,
        ),
      },
      findings: normalizedFindings,
    });
  }

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Records
        </p>
        <h2 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Safety records.
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review saved inspection records, expand report details, and export PDF
          packages.
        </p>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [String(reportTotals.reports), "Reports"],
            [String(reportTotals.findings), "Findings"],
            [String(reportTotals.evidenceCount), "Evidence Items"],
            [String(reportTotals.actionCount), "Actions"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-center"
            >
              <p className="text-lg font-black tracking-tight text-white sm:text-xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SafeScopeDisclaimer compact tone="notice" />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Current Report Package
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          {getReportPackageForPlan().label}
        </h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
          Report depth is based on plan tier. Basic keeps reports field-ready;
          Pro adds SafeScope rationale; Company adds operational accountability
          and traceability.
        </p>
      </section>

      <p className="-mt-2 text-xs font-semibold italic leading-5 text-slate-500">
        Reports follow your selected workspace storage and export settings.
        Evidence, findings, standards, and corrective actions remain tied to the
        inspection record.
      </p>

      {sortedReports.length === 0 ? (
        <EmptyState
          title="No reports available."
          description="Completed inspection reports will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sortedReports.map((report) => {
            const risk = getRiskLabel(report);
            const firstPhoto = report.findings?.flatMap(
              (finding: any) => finding.photos || [],
            )?.[0];
            const integrity = getReportIntegrity(report);
            const editing = editingReportId === report.id;
            const expanded = expandedReportId === report.id;

            return (
              <article
                key={report.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedReportId(expanded ? null : report.id)
                  }
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${riskClasses(
                          risk,
                        )}`}
                      >
                        {risk} Risk
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getStorageClass(
                          report.storageSource,
                        )}`}
                      >
                        {getStorageLabel(report.storageSource)}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-black leading-tight text-slate-900">
                      {getReportTitle(report)}
                    </h3>

                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                      {getReportDate(report)} · {getReportLocation(report)}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-[#102A43] shadow-sm">
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200 px-4 py-4">
                    {editing ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                          placeholder="Report title"
                        />

                        <input
                          value={editLocation}
                          onChange={(event) =>
                            setEditLocation(event.target.value)
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                          placeholder="Location"
                        />

                        <div className="flex flex-wrap gap-2 md:col-span-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(report.id)}
                            className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingReportId(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-[96px_1fr]">
                        {firstPhoto ? (
                          <div className="hidden h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:block">
                            <AnnotationPreview
                              photoUrl={firstPhoto.url}
                              annotations={firstPhoto.annotations || []}
                            />
                          </div>
                        ) : (
                          <div className="hidden h-24 w-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 md:block" />
                        )}

                        <div className="min-w-0">
                          <div className="grid gap-2 sm:grid-cols-4">
                            {[
                              [`${report.findings?.length || 0}`, "Findings"],
                              [`${integrity.evidenceCount}`, "Evidence"],
                              [`${integrity.standardsCount}`, "Standards"],
                              [`${integrity.actionCount}`, "Actions"],
                            ].map(([value, label]) => (
                              <div
                                key={label}
                                className="rounded-xl bg-slate-50 px-3 py-2"
                              >
                                <p className="text-sm font-black text-slate-900">
                                  {value}
                                </p>
                                <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                  {label}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                            <span
                              className={
                                integrity.hasEvidence
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }
                            >
                              Evidence{" "}
                              {integrity.hasEvidence ? "Attached" : "Pending"}
                            </span>
                            <span
                              className={
                                integrity.hasSafeScope
                                  ? "text-blue-700"
                                  : "text-slate-400"
                              }
                            >
                              SafeScope{" "}
                              {integrity.hasSafeScope ? "Reviewed" : "Not Run"}
                            </span>
                            <span
                              className={
                                integrity.hasActions
                                  ? "text-orange-700"
                                  : "text-slate-400"
                              }
                            >
                              Actions {integrity.hasActions ? "Linked" : "Pending"}
                            </span>
                          </div>

                          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                            Created {formatDate(report.createdAt)}. Evidence,
                            findings, standards, and corrective actions remain
                            connected to this inspection record.
                          </p>

                          <p className="mt-2 break-all text-[10px] font-semibold text-slate-400">
                            Record ID: {report.id}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startReview(report)}
                              className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                            >
                              Review
                            </button>

                            <button
                              type="button"
                              onClick={() => beginInlineEdit(report)}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                            >
                              Rename
                            </button>

                            <button
                              type="button"
                              onClick={() => exportReport(report)}
                              className="rounded-xl bg-[#F97316] px-4 py-2 text-xs font-black text-black transition hover:bg-[#EA580C]"
                            >
                              Export PDF
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteReport(report.id)}
                              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
