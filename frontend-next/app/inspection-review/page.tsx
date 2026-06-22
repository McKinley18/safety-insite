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
import { saveInspectionReportToCloud } from "@/lib/cloudReports";
import { runInspectionExport } from "@/lib/inspection/reportExportService";
import {
  persistReviewedReport,
  saveReportToCloud,
} from "@/lib/inspection/reviewReportPersistenceService";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import {
  SafeScopeRealImageAnalysisAppendix,
  SafeScopeVisualEvidenceAppendix,
  SafeScopeEquipmentReasoningAppendix,
} from "@/components/inspection/SafeScopeResultAppendix";
import { SafeScopeOfflineNotice } from "@/components/inspection/SafeScopeOfflineNotice";
import { ReportDetailsPanel } from "@/components/inspection/ReportDetailsPanel";
import { ReportExportOptionsPanel } from "@/components/inspection/ReportExportOptionsPanel";
import { FindingsReviewList } from "@/components/inspection/FindingsReviewList";
import { ReviewExportPanel } from "@/components/inspection/ReviewExportPanel";
import {
  deleteFindingFromReport,
  getAddFindingState,
  getEditFindingState,
} from "@/lib/inspection/reviewFindingManagementService";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  getSafeScopeReviewSummary,
  formatReviewDate,
  isSamePersistentReport,
} from "@/lib/inspection/reportReviewHelpers";

// ... imports ...

// ... other code ...


export default function InspectionReviewPage() {
  const [report, setReport] = useState<any>(null);
  const [planCode, setPlanCode] = useState(getStoredPlanCode());
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [exportWarning, setExportWarning] = useState("");
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [cloudSaveMessage, setCloudSaveMessage] = useState("");

  useEffect(() => {
    async function loadReport() {
      setPlanCode(getStoredPlanCode());
      const latest = await getLatestReport<any>();
      setReport(latest);
    }

    loadReport();
  }, []);

  const reportPackage = getReportPackageForPlan(planCode);

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
          isSamePersistentReport(item, nextReport) ? nextReport : item,
        ),
      );
    }
  }


  async function saveReportToCloudHandler() {
    await saveReportToCloud({
      report,
      setCloudSaveStatus,
      setCloudSaveMessage,
      persistReviewedReport: persistReviewedReportHandler,
    });
  }

  async function exportReport() {
    if (!report) return;

    await runInspectionExport({
      report,
      reportPackage,
      humanReviewConfirmed,
      setExportWarning,
      formatReviewDate,
    });
  }

  async function persistReviewedReportHandler(nextReport: any) {
    await persistReviewedReport(nextReport, setReport);
  }

  async function editReport() {
    if (!report) return;
    await setEditReport(report);
    window.location.href = "/inspection";
  }

  async function addFindingToReport() {
    if (!report) return;

    await setEditReport(getAddFindingState(report));

    window.location.href = "/inspection";
  }

  async function editFindingFromReview(index: number) {
    if (!report) return;

    await setEditReport(getEditFindingState(report, index));

    window.location.href = "/inspection";
  }

  async function deleteFindingFromReview(index: number) {
    if (!report) return;

    const confirmed = window.confirm(
      "Remove this finding from the report? This cannot be undone.",
    );

    if (!confirmed) return;

    const nextReport = deleteFindingFromReport(report, index);

    await persistReviewedReportHandler(nextReport);
  }

  if (!report) {
    return (
      <section className="sentinel-page-shell space-y-4">

        <AppPanel variant="dashed" padding="md" className="text-sm font-semibold text-slate-700 dark:text-slate-700">
          No finalized report found.
        </AppPanel>
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
    <section className="space-y-4">

      <HeroPanel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center"
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
      </HeroPanel>

      <SectionHeader
        eyebrow="Report Details"
        title="Inspection information"
      />

      <ReportDetailsPanel report={report} onEdit={editReport} />

      <SectionHeader
        eyebrow="Final Report Options"
        title="Included in export"
        description="Toggle the items that should appear in the final PDF."
      />

      <ReportExportOptionsPanel report={report} updateReportOption={updateReportOption} />

      {getSafeScopeReviewSummary(findings).total > 0 && (
        <AppPanel padding="md" className="border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                HazLenz AI Review Status
              </p>
              <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                {getSafeScopeReviewSummary(findings).unvalidated
                  ? `${getSafeScopeReviewSummary(findings).unvalidated} HazLenz AI finding(s) need qualified review`
                  : "All HazLenz AI findings show reviewed status"}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                Review status is included in the review page and PDF export.
                Qualified-person review is still required before final use.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100 dark:bg-slate-950 dark:ring-amber-900/60">
                <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">HazLenz AI</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">{getSafeScopeReviewSummary(findings).total}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100 dark:bg-slate-950 dark:ring-amber-900/60">
                <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">Open</p>
                <p className="text-lg font-black text-amber-700">{getSafeScopeReviewSummary(findings).unvalidated}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100 dark:bg-slate-950 dark:ring-amber-900/60">
                <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">Escalated</p>
                <p className="text-lg font-black text-red-700">{getSafeScopeReviewSummary(findings).escalated}</p>
              </div>
            </div>
          </div>
        </AppPanel>
      )}


      <AppPanel padding="md" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Cloud Persistence
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
              Save this report package to the backend
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              Local encrypted storage remains active. Cloud save creates a backend
              report record with findings and the full review package JSON for
              cross-device access and production persistence.
            </p>
            {cloudSaveMessage && (
              <p
                className={`mt-2 text-sm font-black ${
                  cloudSaveStatus === "error"
                    ? "text-red-700"
                    : cloudSaveStatus === "saved"
                      ? "text-emerald-700"
                      : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {cloudSaveMessage}
              </p>
            )}
          </div>

          <AppButton
            type="button"
            onClick={saveReportToCloudHandler}
            variant="accent"
            size="sm"
            disabled={cloudSaveStatus === "saving"}
            className="shadow-none"
          >
            {cloudSaveStatus === "saving" ? "Saving..." : "Save to Cloud"}
          </AppButton>
        </div>
      </AppPanel>

      <FindingsReviewList
        findings={findings}
        report={report}
        reportPackage={reportPackage}
        addFindingToReport={addFindingToReport}
      />

      <ReviewExportPanel
        humanReviewConfirmed={humanReviewConfirmed}
        setHumanReviewConfirmed={setHumanReviewConfirmed}
        exportWarning={exportWarning}
        setExportWarning={setExportWarning}
        exportReport={exportReport}
      />

    </section>
  );
}
