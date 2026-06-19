"use client";

import { secureStorage } from "@/lib/secureStorage";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { localExporter } from "@/lib/localExporter";
import { getReports } from "@/lib/reportStorage";
import { archiveCloudReport, fetchCloudReports } from "@/lib/cloudReports";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportFilterControls } from "@/components/reports/ReportFilterControls";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";
import { type Report } from "@/lib/inspection/inspectionTypes";
import {
  getReportStableKey,
  mergeReports,
  getFindingActionsForReports,
  getReportTitle,
  getReportLocation,
  getReportDate,
} from "@/lib/inspection/reportListService";



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
        setCloudLoadMessage("Loading cloud reports...");

        const cloudReports = await fetchCloudReports();
        const merged = mergeReports(localMerged, cloudReports);

        setReports(merged);
        setCloudLoadStatus("loaded");
        setCloudLoadMessage(
          cloudReports.length
            ? `${cloudReports.length} cloud report(s) synced.`
            : "No cloud reports found.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Cloud reports could not be loaded.";

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
        ? "Archive this cloud report? Local cached copies will also be removed."
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
    <section className="sentinel-mobile-page space-y-4 sm:space-y-4">
      <HeroPanel align="center" className="rounded-xl px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Reports
        </p>
        <h2 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-[-0.055em] sm:text-4xl">
          Reports
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Find, review, edit, and export saved inspection reports.
        </p>
        <div className="mx-auto mt-4 grid max-w-2xl grid-cols-2 justify-center gap-2 sm:grid-cols-4">
          {[
            [String(reportTotals.reports), "Reports"],
            [String(reportTotals.findings), "Findings"],
            [String(reportTotals.evidenceCount), "Evidence Items"],
            [String(reportTotals.actionCount), "Actions"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-center shadow-none backdrop-blur"
            >
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
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
        <div
          className={`rounded-xl border px-4 py-3 shadow-none ${
            cloudLoadStatus === "error"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-100 bg-blue-50/60"
          }`}
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
              Local encrypted reports are still available. Cloud sync will
              retry the next time this page loads.
            </p>
          )}
        </div>
      )}

      {!canUseWorkspaceReports && (
        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-none ring-1 ring-white/70 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Saved Reports
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
            View, edit, review, and export saved inspection reports.
          </p>
        </div>
      )}

      <ReportFilterControls
        reportSearch={reportSearch}
        setReportSearch={setReportSearch}
        reportSortOrder={reportSortOrder}
        setReportSortOrder={setReportSortOrder}
      />

      {sortedReports.length === 0 ? (
        <EmptyState
          title={reports.length ? "No reports match your search." : "No reports available."}
          description={
            reports.length
              ? "Try a different report title, location, finding, or record ID."
              : "Start an inspection to create your first saved report."
          }
        />
      ) : (
        <div className="space-y-3">
          {sortedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              editing={editingReportId === report.id}
              expanded={expandedReportId === report.id}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editLocation={editLocation}
              setEditLocation={setEditLocation}
              onToggleExpanded={() =>
                setExpandedReportId(expandedReportId === report.id ? null : report.id)
              }
              onBeginEdit={() => beginInlineEdit(report)}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingReportId(null)}
              onDelete={deleteReport}
              onReview={startReview}
              onExport={exportReport}
            />
          ))}
        </div>
      )}
    </section>
  );
}
