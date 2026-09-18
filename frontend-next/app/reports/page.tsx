"use client";

import EmptyState from "@/components/ui/EmptyState";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import {
  downloadPersistedReport,
  downloadPersistedReportRevision,
  listPersistedReports,
  listReportRevisions,
  regulatoryContextLabel,
  type PersistedReport,
  type ReportRevisionHistory,
} from "@/lib/canonicalWorkflowApi";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * THE REPORT LIBRARY.
 *
 * One card per inspection. Each card is explicitly a report OF an inspection: it carries the
 * inspection's record number, title and site, when the inspection was completed, how many findings
 * it recorded, its jurisdiction, when the report itself was last issued -- and it links back to the
 * source inspection. The Inspections area, not this page, remains the inspection library.
 *
 * ==================== §286 / D-046 — WHAT CHANGED, AND WHY ====================
 *
 * This page used to state, as product intent:
 *
 *     "Every completed inspection has one report. Finishing an inspection again replaces its
 *      report, so what you download here is always the current record."
 *
 * That has not been what the server does since §277 / D-028. Finishing a reopened inspection ADDS
 * a revision: the previously issued artifact is retained, marked superseded, linked to the revision
 * that replaced it, and remains downloadable and byte-identical to what was issued. §285 verified
 * all five of those guarantees on the server and then measured that the client called neither
 * `GET /inspection-reports/:id/revisions` nor the per-revision download -- so from the customer's
 * side, of D-028's five requirements, retained was YES, byte-identical was YES, and downloadable,
 * marked-superseded and linked-to-successor were all NO.
 *
 * The consequence was concrete and was the principal product-owner decision out of §285: an
 * inspector who had filed revision 1 with a client could not see that it existed, could not tell
 * which revision they had filed, and could not retrieve it -- while a screen told them the earlier
 * report had been REPLACED.
 *
 * D-028 is NOT redesigned here. The server's revision model is already authoritative and already
 * correct; this exposes it. What the customer can now determine, per the product-owner direction:
 * the current revision, which revisions were superseded, each revision's number and issue time,
 * which revision replaced which, and a download of the current revision AND of every retained
 * superseded one.
 *
 * ==================== IDENTITY: NUMBERS, NOT UUIDS ====================
 *
 * A revision's customer-facing identity is its NUMBER and its issue time. `revisionId` is a uuid,
 * is used only as a React key, and is never rendered -- which is why the server sends
 * `supersededByRevision` (a number) beside `supersededByRevisionId`, so "Replaced by Revision 2"
 * never has to print one. The checksum IS shown inside the history, deliberately and labelled as
 * integrity metadata: it is the only way a customer holding a filed copy can prove which revision
 * it is. It is not offered as the record's name.
 *
 * ==================== TOUCH TARGETS ====================
 *
 * Every control on this page is at least 44x44 CSS pixels (`min-h-11`). The product's own floor is
 * 36px (§73.3) and `AppButton`'s `sm` meets it, so this is not a defect being repaired against the
 * product standard -- it is the App-Format guideline the product-owner direction registered, applied
 * to the controls D-046 introduces from inception and, because the change is one utility class on
 * one page, to the two controls already here. `AppButton` itself is untouched: raising a shared
 * button size across the product is the App-Format gate's decision, not this section's.
 */
function formatMoment(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    + " · "
    + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * 44x44 minimum on every control this page renders. See the header.
 *
 * Paired with `size="md"` rather than `size="sm"` deliberately: `sm` already carries `min-h-9`,
 * and stacking `min-h-11` on top of it would leave the winner to CSS source order rather than to
 * anything stated here. `md` sets no min-height, so this class is the only rule in play.
 */
const TOUCH = "min-h-11";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Named for the customer's record number and the revision, never for a uuid or a checksum. */
function reportFilename(report: PersistedReport, revision: number | null) {
  const record = report.inspection?.displayNumber
    ? `inspection-${report.inspection.displayNumber}`
    : "inspection";
  return revision === null
    ? `${record}-report.pdf`
    : `${record}-report-revision-${revision}.pdf`;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<PersistedReport[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");
  /**
   * Revision history, per report, fetched on demand.
   *
   * Not folded into the library read: a history is ~one row per revision and most reports have
   * exactly one, so fetching every history up front would turn a list of twenty reports into
   * twenty-one requests to render a control most cards do not show. The card already carries
   * `issuedRevisionCount`, which is all that is needed to decide whether the control is meaningful.
   */
  const [openHistory, setOpenHistory] = useState("");
  const [histories, setHistories] = useState<Record<string, ReportRevisionHistory>>({});
  const [historyState, setHistoryState] = useState<Record<string, "loading" | "ready" | "error">>({});

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

  async function toggleHistory(report: PersistedReport) {
    if (openHistory === report.id) {
      setOpenHistory("");
      return;
    }
    setOpenHistory(report.id);
    setMessage("");
    // Re-read on every open. A revision issued in another tab or by a colleague must not be
    // invisible here because this tab cached the history before it existed.
    setHistoryState((current) => ({ ...current, [report.id]: "loading" }));
    try {
      const history = await listReportRevisions(report.id);
      setHistories((current) => ({ ...current, [report.id]: history }));
      setHistoryState((current) => ({ ...current, [report.id]: "ready" }));
    } catch (error) {
      setHistoryState((current) => ({ ...current, [report.id]: "error" }));
      setMessage(error instanceof Error ? error.message : "Revision history could not be loaded.");
    }
  }

  async function download(report: PersistedReport) {
    setDownloading(report.id);
    setMessage("");
    try {
      downloadBlob(await downloadPersistedReport(report.id), reportFilename(report, report.revision));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report download failed.");
    } finally {
      setDownloading("");
    }
  }

  /** One specific revision, including a superseded one. See the header. */
  async function downloadRevision(report: PersistedReport, revision: number) {
    const key = `${report.id}:${revision}`;
    setDownloading(key);
    setMessage("");
    try {
      downloadBlob(
        await downloadPersistedReportRevision(report.id, revision),
        reportFilename(report, revision),
      );
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
    <div className="insite-page py-4 sm:py-6">
      <HeroPanel align="center" className="mb-4 sm:mb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Server-backed records
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl">
          Inspection Reports
        </h1>
        {/* §286 / D-046. The previous sentence -- "Finishing an inspection again replaces its
            report" -- described behaviour the server has not had since §277. Every issued revision
            is retained, and this now says so. */}
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Each completed inspection has one current report. Finishing an inspection again issues a
          new revision and keeps the one it replaced, so a report you have already filed stays
          available exactly as it was issued.
        </p>
        {/*
          * §319 (SR-1). A report is where a HazLenz conclusion leaves the product and is shown to
          * someone else, so it is a decision-relevant surface by SR-1's own test. The generated PDF
          * already carries the boundary in its "Basis and Limitations" block; the LIBRARY that
          * hands those reports out did not say it anywhere. One sentence, at the point of
          * distribution.
          */}
        <p className="mx-auto mt-2 max-w-2xl text-xs font-semibold leading-5 text-slate-400">
          Reports record what this inspection captured and what a qualified person reviewed. HazLenz
          assists the analysis; it does not assess conditions that were not recorded, and it does not
          determine compliance.
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
          {reports.map((report) => {
            const historyId = `revision-history-${report.id}`;
            const hasHistory = report.issuedRevisionCount > 1;
            const history = histories[report.id];
            const historyStatus = historyState[report.id];
            return (
            <AppPanel key={report.id} as="article" className="generated-report-card space-y-4" data-testid="report-card">
              <div>
                <h2 className="text-base font-black text-app-text">
                  {report.inspection?.title || "Inspection"}
                  {report.inspection?.siteName ? ` · ${report.inspection.siteName}` : ""}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {report.inspection?.displayNumber ? (
                    <p className="text-xs font-black uppercase tracking-wide text-app-text-muted">
                      Inspection #{report.inspection.displayNumber}
                    </p>
                  ) : null}
                  {/* THE CURRENT REVISION, stated on the card itself. The customer's first
                      question about a report they may have already sent to a client is "which one
                      is this?", and it must not require opening anything to answer. */}
                  {report.revision !== null && (
                    <span
                      className="rounded-full border border-app-border bg-app-surface-muted px-2 py-0.5 text-xs font-black text-app-text"
                      data-testid="report-current-revision"
                    >
                      Revision {report.revision} · Current
                    </span>
                  )}
                </div>
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
                      <dt className="font-black">Revision issued</dt>
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
                  size="md"
                  className={TOUCH}
                  disabled={report.status !== "generated" || downloading === report.id}
                  onClick={() => void download(report)}
                >
                  {downloading === report.id ? "Downloading…" : "Download PDF"}
                </AppButton>
                <AppButton
                  size="md"
                  variant="secondary"
                  className={TOUCH}
                  disabled={!report.inspection}
                  onClick={() => viewInspection(report)}
                >
                  View inspection
                </AppButton>
                {/* Offered only where there is history to show. A control that opens an empty
                    panel on every single-revision report teaches the customer to ignore it. */}
                {hasHistory && (
                  <AppButton
                    size="md"
                    variant="secondary"
                    className={TOUCH}
                    aria-expanded={openHistory === report.id}
                    aria-controls={historyId}
                    data-testid="revision-history-toggle"
                    onClick={() => void toggleHistory(report)}
                  >
                    {openHistory === report.id ? "Hide revision history" : "Revision history"}
                    {" "}
                    ({report.issuedRevisionCount})
                  </AppButton>
                )}
              </div>

              {hasHistory && openHistory === report.id && (
                <section
                  id={historyId}
                  aria-label={`Revision history for ${report.inspection?.title || "this report"}`}
                  className="rounded-xl border border-app-border bg-app-surface-muted p-3"
                  data-testid="revision-history"
                >
                  <h3 className="text-xs font-black uppercase tracking-wide text-app-text-muted">
                    Revision history
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-app-text-muted">
                    Every revision issued for this report is retained exactly as it was issued. A
                    superseded revision is no longer the current record, and it is still available
                    for a copy you have already filed.
                  </p>

                  {historyStatus === "loading" && (
                    <p aria-live="polite" className="mt-3 text-xs font-semibold text-app-text-muted">
                      Loading revision history…
                    </p>
                  )}
                  {historyStatus === "error" && (
                    <p role="alert" className="mt-3 text-xs font-semibold text-red-700">
                      Revision history could not be loaded.
                    </p>
                  )}

                  {historyStatus === "ready" && history && (
                    <ol className="mt-3 space-y-3">
                      {history.revisions.map((revision) => (
                        <li
                          key={revision.revisionId}
                          className="rounded-lg border border-app-border bg-app-surface p-3"
                          data-testid="revision-history-entry"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-app-text">
                              Revision {revision.revision}
                            </span>
                            {/* Status is carried by the WORD, not by colour. A reader who cannot
                                distinguish the two tints still reads "Current" and "Superseded". */}
                            <span
                              className={
                                revision.isCurrent
                                  ? "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-800"
                                  : "rounded-full border border-app-border bg-app-surface-muted px-2 py-0.5 text-xs font-black text-app-text-muted"
                              }
                            >
                              {revision.isCurrent
                                ? "Current"
                                : revision.downloadable
                                  ? "Superseded"
                                  : "Not issued"}
                            </span>
                          </div>
                          <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs font-semibold text-app-text-muted sm:grid-cols-2">
                            <div className="flex gap-2">
                              <dt className="font-black">Issued</dt>
                              <dd>{formatMoment(revision.generatedAt) || "Not issued"}</dd>
                            </div>
                            {/* "Which revision replaced which" -- by NUMBER, never by uuid. Shown
                                only where it adds something: the current revision was replaced by
                                nothing, and saying so would be noise. */}
                            {revision.supersededByRevision !== null && (
                              <div className="flex gap-2">
                                <dt className="font-black">Replaced by</dt>
                                <dd>Revision {revision.supersededByRevision}</dd>
                              </div>
                            )}
                            {revision.checksum && (
                              <div className="flex gap-2 sm:col-span-2">
                                <dt className="font-black">Checksum (SHA-256)</dt>
                                {/* Integrity metadata, so a customer can match a filed copy to
                                    this record. Never the record's identity -- that is the
                                    revision number above. */}
                                <dd className="break-all font-mono">{revision.checksum}</dd>
                              </div>
                            )}
                            {revision.failureReason && (
                              <div className="flex gap-2 sm:col-span-2">
                                <dt className="font-black">Not issued because</dt>
                                <dd>{revision.failureReason}</dd>
                              </div>
                            )}
                          </dl>
                          {revision.downloadable && (
                            <div className="mt-3">
                              <AppButton
                                size="md"
                                variant="secondary"
                                className={TOUCH}
                                disabled={downloading === `${report.id}:${revision.revision}`}
                                onClick={() => void downloadRevision(report, revision.revision)}
                              >
                                {downloading === `${report.id}:${revision.revision}`
                                  ? "Downloading…"
                                  : `Download revision ${revision.revision}`}
                              </AppButton>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              )}
            </AppPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
