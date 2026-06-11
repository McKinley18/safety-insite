"use client";

import { secureStorage } from "@/lib/secureStorage";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import { localExporter } from "@/lib/localExporter";
import { getReports } from "@/lib/reportStorage";
import { archiveCloudReport, fetchCloudReports } from "@/lib/cloudReports";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";

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
  cloudReportId?: string;
  cloudSavedAt?: string;
  cloudSaveStatus?: "idle" | "saving" | "saved" | "error";
};


function getReportStableKey(report: Report) {
  return String(report.cloudReportId || report.id || "");
}

function mergeReports(localReports: Report[], cloudReports: Report[]) {
  const byKey = new Map<string, Report>();

  for (const report of localReports) {
    const key = getReportStableKey(report);
    if (!key) continue;
    byKey.set(key, {
      ...report,
      storageSource: report.storageSource || "local",
    });
  }

  for (const report of cloudReports) {
    const key = getReportStableKey(report);
    if (!key) continue;

    const existing = byKey.get(key);

    byKey.set(key, {
      ...(existing || {}),
      ...report,
      storageSource: "cloud",
      cloudReportId: report.cloudReportId || existing?.cloudReportId,
      cloudSavedAt: report.cloudSavedAt || existing?.cloudSavedAt,
    });
  }

  return Array.from(byKey.values());
}

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

function getFieldOutputActions(finding: any): any[] {
  const actions = finding?.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions.map((action: any, index: number) => {
    if (typeof action === "string") {
      return {
        title: action,
        description: action,
        priority: finding?.safeScopeResult?.fieldOutput?.priority || "Medium",
        closureEvidence:
          finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
          "Supervisor verification",
        source: "SafeScope field output",
      };
    }

    return {
      ...action,
      title: action.title || action.description || `Field output action ${index + 1}`,
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

function getFindingActionsForReports(finding: any): any[] {
  const fieldOutputActions = getFieldOutputActions(finding);
  if (fieldOutputActions.length) {
    return [
      ...fieldOutputActions,
      ...(Array.isArray(finding.manualActions) ? finding.manualActions : []),
    ];
  }

  return (
    finding.correctiveActions || [
      ...(finding.selectedGeneratedActions || []),
      ...(finding.manualActions || []),
      ...(finding.safeScopeResult?.generatedActions || []),
    ]
  );
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
      getFindingActionsForReports(finding),
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
  const [reportSearch, setReportSearch] = useState("");
  const [reportSortOrder, setReportSortOrder] = useState<"newest" | "oldest">("newest");
  const [cloudLoadStatus, setCloudLoadStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [cloudLoadMessage, setCloudLoadMessage] = useState("");
  const [planCode, setPlanCode] = useState<PlanCode>("basic");

  const canUseWorkspaceReports = hasPlanEntitlement("sharedReports", planCode);

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

      const localMerged: Report[] = [...localReports];

      if (
        latestReport &&
        !localMerged.some((report) => report.id === latestReport?.id)
      ) {
        localMerged.unshift({
          ...latestReport,
          storageSource: latestReport.storageSource || "local",
          title: latestReport.title || "Inspection Report",
          location:
            latestReport.location ||
            latestReport.findings?.[0]?.location ||
            "Field Inspection",
        });
      }

      setReports(localMerged);

      const storedPlan = getStoredPlanCode();
      const workspaceReportsAllowed = hasPlanEntitlement("sharedReports", storedPlan);

      setPlanCode(storedPlan);

      if (!workspaceReportsAllowed) {
        setCloudLoadStatus("idle");
        setCloudLoadMessage("");
        return;
      }

      try {
        setCloudLoadStatus("loading");
        setCloudLoadMessage("Loading workspace reports...");

        const cloudReports = await fetchCloudReports();
        const merged = mergeReports(localMerged, cloudReports);

        setReports(merged);
        setCloudLoadStatus("loaded");
        setCloudLoadMessage(
          cloudReports.length
            ? `${cloudReports.length} workspace report(s) synced.`
            : "No workspace reports found.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Workspace reports could not be loaded.";

        setCloudLoadStatus("error");
        setCloudLoadMessage(message);
      }
    }

    loadReports();
  }, []);

  const sortedReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();

    const filtered = reports.filter((report) => {
      if (!query) return true;

      const searchable = [
        getReportTitle(report),
        getReportLocation(report),
        getReportDate(report),
        report.id,
        report.organizationName,
        report.findings
          ?.map((finding: any) =>
            [
              finding.title,
              finding.hazardTitle,
              finding.location,
              finding.description,
              finding.classification,
            ]
              .filter(Boolean)
              .join(" "),
          )
          .join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.inspectionDate || 0).getTime();
      const bTime = new Date(b.createdAt || b.inspectionDate || 0).getTime();

      return reportSortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [reportSearch, reportSortOrder, reports]);

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

  async function deleteReport(reportId: string) {
    const reportToDelete = reports.find((report) => report.id === reportId);

    const confirmed = window.confirm(
      reportToDelete?.storageSource === "cloud"
        ? "Archive this cloud report from the workspace? Local cached copies will also be removed."
        : "Delete this local report? This cannot be undone.",
    );

    if (!confirmed) return;

    const cloudReportId = reportToDelete?.cloudReportId;

    if (cloudReportId && canUseWorkspaceReports) {
      try {
        await archiveCloudReport(cloudReportId);
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Cloud report could not be archived.",
        );
        return;
      }
    }

    const deleteKey = getReportStableKey(reportToDelete || ({ id: reportId } as Report));
    const nextReports = reports.filter(
      (report) => getReportStableKey(report) !== deleteKey,
    );
    persist(nextReports);

    const latest = secureStorage.get("latest_report", null as any);
    const latestReport =
      typeof latest === "string" ? JSON.parse(latest || "null") : latest;

    if (
      latestReport?.id === reportId ||
      String(latestReport?.cloudReportId || "") === String(cloudReportId || "")
    ) {
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
      correctiveActions: getFindingActionsForReports(finding),
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
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Reports
        </p>
        <h2 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Safety Records
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review saved inspections, report details, evidence, findings, standards, and corrective actions.
        </p>
        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 justify-center gap-2 sm:grid-cols-4">
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
      </HeroPanel>


      {canUseWorkspaceReports && cloudLoadMessage && (
        <AppPanel
          padding="sm"
          className={
            cloudLoadStatus === "error"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-100 bg-blue-50/60"
          }
        >
          <p
            className={`text-sm font-black ${
              cloudLoadStatus === "error" ? "text-amber-800" : "text-blue-800"
            }`}
          >
            {cloudLoadMessage}
          </p>
          {cloudLoadStatus === "error" && (
            <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
              Local encrypted reports are still available. Workspace sync will
              retry the next time this page loads.
            </p>
          )}
        </AppPanel>
      )}

      {!canUseWorkspaceReports && (
        <AppPanel padding="sm" className="border-slate-200 bg-white">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Local Report Vault
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
            Basic and Pro plans can view, edit, review, and export local inspection reports. Company workspaces add shared report sync and organization-wide report visibility.
          </p>
        </AppPanel>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <AppInput
          value={reportSearch}
          onChange={(event) => setReportSearch(event.target.value)}
          placeholder="Search reports"
          fieldSize="sm"
          className="w-full max-w-xs"
        />

        <label className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-600 shadow-sm">
          Sort
          <select
            value={reportSortOrder}
            onChange={(event) =>
              setReportSortOrder(event.target.value as "newest" | "oldest")
            }
            className="bg-transparent text-xs font-black text-slate-900 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      {sortedReports.length === 0 ? (
        <EmptyState
          title={reports.length ? "No reports match your search." : "No reports available."}
          description={
            reports.length
              ? "Try a different report title, location, finding, or record ID."
              : "Completed inspection reports will appear here."
          }
        />
      ) : (
        <div className="space-y-1.5">
          {sortedReports.map((report) => {
            const risk = getRiskLabel(report);
            const firstPhoto = report.findings?.flatMap(
              (finding: any) => finding.photos || [],
            )?.[0];
            const integrity = getReportIntegrity(report);
            const editing = editingReportId === report.id;
            const expanded = expandedReportId === report.id;

            return (
              <AppPanel
                key={report.id}
                as="article"
                padding="sm"
                className="relative overflow-hidden p-0 sm:p-0"
              >
                <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      beginInlineEdit(report);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-black text-[#102A43] shadow-sm hover:border-[#1D72B8]"
                    aria-label="Edit report"
                    title="Edit report"
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteReport(report.id);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-white text-xs font-black text-red-700 shadow-sm hover:bg-red-50"
                    aria-label="Delete report"
                    title="Delete report"
                  >
                    🗑
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedReportId(expanded ? null : report.id)
                  }
                  className="relative flex w-full items-start gap-3 px-3 py-2 pr-[5rem] text-left"
                >
                  <div className="min-w-0">
                    <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex w-fit items-center rounded-md px-1.5 py-0 text-xs font-black uppercase leading-3 tracking-wide ${riskClasses(
                          risk,
                        )}`}
                      >
                        {risk}
                      </span>

                      <span
                        className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0 text-xs font-black uppercase leading-3 tracking-wide ${getStorageClass(
                          report.storageSource,
                        )}`}
                      >
                        {report.storageSource === "cloud"
                          ? "Cloud"
                          : report.storageSource === "seed"
                            ? "Sample"
                            : "Local"}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-black leading-tight text-slate-900">
                      {getReportTitle(report)}
                    </h3>

                    <p className="mt-0.5 text-[11px] font-semibold leading-4 text-slate-500">
                      {getReportDate(report)} · {getReportLocation(report)}
                    </p>
                  </div>

                  <span className="absolute bottom-1.5 right-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8] shadow-sm">
                    {expanded ? "Hide details ▲" : "View details ▼"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200 px-3 py-2.5">
                    {editing ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <AppInput
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          placeholder="Report title"
                        />

                        <AppInput
                          value={editLocation}
                          onChange={(event) =>
                            setEditLocation(event.target.value)
                          }
                          placeholder="Location"
                        />

                        <div className="flex flex-wrap gap-2 md:col-span-2">
                          <AppButton
                            type="button"
                            size="sm"
                            onClick={() => saveEdit(report.id)}
                            className="text-xs"
                          >
                            Save
                          </AppButton>

                          <AppButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingReportId(null)}
                            className="text-xs"
                          >
                            Cancel
                          </AppButton>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2.5 md:grid-cols-[76px_1fr]">
                        {firstPhoto ? (
                          <div className="hidden h-[76px] w-[76px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:block">
                            <AnnotationPreview
                              photoUrl={firstPhoto.url}
                              annotations={firstPhoto.annotations || []}
                            />
                          </div>
                        ) : (
                          <div className="hidden h-[76px] w-[76px] rounded-xl border border-dashed border-slate-300 bg-slate-50 md:block" />
                        )}

                        <div className="min-w-0">
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                                  Report Contents
                                </p>
                                <h4 className="mt-0.5 text-sm font-black text-slate-900">
                                  Inspection record package
                                </h4>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${riskClasses(
                                  risk,
                                )}`}
                              >
                                {risk}
                              </span>
                            </div>

                            <div className="mt-2 grid w-full grid-cols-[repeat(auto-fit,minmax(86px,1fr))] gap-1.5">
                              {[
                                [`${report.findings?.length || 0}`, "Findings"],
                                [`${integrity.evidenceCount}`, "Evidence"],
                                [`${integrity.standardsCount}`, "Standards"],
                                [`${integrity.actionCount}`, "Actions"],
                              ].map(([value, label]) => (
                                <div
                                  key={label}
                                  className="min-w-0 rounded-lg bg-slate-50 px-2 py-1 text-center"
                                >
                                  <p className="text-center text-xs font-black leading-none text-slate-900">
                                    {value}
                                  </p>
                                  <p className="mt-0.5 text-center text-[9px] font-black uppercase tracking-wide text-slate-400">
                                    {label}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold leading-4 text-slate-600">
                              <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                                Record details
                              </p>
                              <p className="mt-1">
                                Created {formatDate(report.createdAt)}.
                              </p>
                              <p className="mt-1 break-all text-[10px] text-slate-400">
                                Record ID: {report.id}
                              </p>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <AppButton
                                type="button"
                                size="sm"
                                onClick={() => startReview(report)}
                                className="text-xs"
                              >
                                Review
                              </AppButton>

                              <AppButton
                                type="button"
                                size="sm"
                                onClick={() => exportReport(report)}
                                className="bg-[#F97316] text-xs text-black hover:bg-[#EA580C]"
                              >
                                Export PDF
                              </AppButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AppPanel>
            );
          })}
        </div>
      )}
    </section>
  );
}
