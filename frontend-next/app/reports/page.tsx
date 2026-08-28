"use client";

import EmptyState from "@/components/ui/EmptyState";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import {
  downloadPersistedReport,
  listPersistedReports,
  regulatoryContextLabel,
  type PersistedReport,
} from "@/lib/canonicalWorkflowApi";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * THE REPORT LIBRARY.
 *
 * One card per inspection, because an inspection has ONE report. Finishing a reopened inspection
 * replaces that report rather than adding a version beside it, so there is no version list here,
 * nothing marked superseded, and no choice for the customer to make about which report is real.
 *
 * Each card is explicitly a report OF an inspection: it carries the inspection's record number,
 * title and site, when the inspection was completed, how many findings it recorded, its
 * jurisdiction, and when the report itself was last updated -- and it links back to the source
 * inspection. Raw uuids and checksums are not customer identity and are not shown; the Inspections
 * area, not this page, remains the inspection library.
 *
 * There is deliberately no delete action. The previous "Delete Report" button only set
 * `archivedAt`, which hid the report permanently with no way for the customer to get it back --
 * a destructive-sounding control with neither destructive nor reversible semantics. A report is an
 * output of its inspection, not a disposable object to be removed from underneath it.
 */
function formatMoment(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    + " · "
    + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<PersistedReport[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      setReports(await listPersistedReports());
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Reports could not be loaded.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void listPersistedReports()
      .then((persisted) => {
        if (!active) return;
        setReports(persisted);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Reports could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function download(report: PersistedReport) {
    setDownloading(report.id);
    setMessage("");
    try {
      const blob = await downloadPersistedReport(report.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      // Named for the customer's record number, never for a uuid or a version counter.
      anchor.download = report.inspection?.displayNumber
        ? `inspection-${report.inspection.displayNumber}-report.pdf`
        : "inspection-report.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report download failed.");
    } finally {
      setDownloading("");
    }
  }

  /**
   * Open the completed inspection this report was produced from.
   *
   * Writes the same selection context every other entry point into the inspection writes, so the
   * completed-inspection page re-reads the record from the server. Nothing about access changes:
   * this report already passed the server's owner/organization scope filter to appear here.
   */
  function viewInspection(report: PersistedReport) {
    if (!report.inspection) return;
    window.localStorage.setItem(
      "sentinel_selected_inspection_context",
      JSON.stringify({
        persistedInspectionId: report.inspectionId,
        persistenceState: "saved",
        inspectionTitle: report.inspection.title,
        regulatoryContext: report.inspection.regulatoryContext,
        agency: regulatoryContextLabel(report.inspection.regulatoryContext),
      }),
    );
    router.push("/inspection-complete");
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <HeroPanel align="center" className="mb-4 sm:mb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Server-backed records
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl">
          Inspection Reports
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Every completed inspection has one report. Finishing an inspection again replaces its
          report, so what you download here is always the current record.
        </p>
      </HeroPanel>

      {message && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {message}
        </p>
      )}

      {status === "loading" && (
        <AppPanel aria-live="polite" className="generated-report-card">
          <p className="text-sm font-semibold text-app-text-muted">Loading reports…</p>
        </AppPanel>
      )}

      {status === "error" && (
        <EmptyState
          className="generated-report-card"
          title="Reports are unavailable"
          description="Nothing local is being shown as a successful report. Retry after the server connection is restored."
          actionLabel="Retry"
          onAction={() => void load()}
        />
      )}

      {status === "ready" && reports.length === 0 && (
        <EmptyState
          className="generated-report-card"
          icon={FileText}
          title="No reports yet"
          description="Finish an inspection and its report appears here."
        />
      )}

      {status === "ready" && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <AppPanel key={report.id} as="article" className="generated-report-card space-y-4" data-testid="report-card">
              <div>
                <h2 className="text-base font-black text-app-text">
                  {report.inspection?.title || "Inspection"}
                  {report.inspection?.siteName ? ` · ${report.inspection.siteName}` : ""}
                </h2>
                {report.inspection?.displayNumber ? (
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-app-text-muted">
                    Inspection #{report.inspection.displayNumber}
                  </p>
                ) : null}
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs font-semibold text-app-text-muted sm:grid-cols-2">
                  {report.inspection?.completedAt && (
                    <div className="flex gap-2">
                      <dt className="font-black">Inspection completed</dt>
                      <dd>{formatMoment(report.inspection.completedAt)}</dd>
                    </div>
                  )}
                  {/* Distinct from the completion date on purpose: they differ whenever the
                      inspection was reopened and finished again. */}
                  {report.reportUpdatedAt && (
                    <div className="flex gap-2">
                      <dt className="font-black">Report updated</dt>
                      <dd>{formatMoment(report.reportUpdatedAt)}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="font-black">Findings</dt>
                    <dd>{report.inspection?.findingCount ?? 0}</dd>
                  </div>
                  {report.inspection && (
                    <div className="flex gap-2">
                      <dt className="font-black">Jurisdiction</dt>
                      <dd>{regulatoryContextLabel(report.inspection.regulatoryContext)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="flex flex-wrap gap-3">
                <AppButton
                  size="sm"
                  disabled={report.status !== "generated" || downloading === report.id}
                  onClick={() => void download(report)}
                >
                  {downloading === report.id ? "Downloading…" : "Download PDF"}
                </AppButton>
                <AppButton
                  size="sm"
                  variant="secondary"
                  disabled={!report.inspection}
                  onClick={() => viewInspection(report)}
                >
                  View inspection
                </AppButton>
              </div>
            </AppPanel>
          ))}
        </div>
      )}
    </main>
  );
}
