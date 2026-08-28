"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  downloadPersistedReport,
  getPersistedInspection,
  getReportForInspection,
  inspectionRecordLabel,
  listPersistedSites,
  regulatoryContextLabel,
  transitionPersistedInspection,
  type InspectionReportSummary,
  type PersistedFinding,
  type PersistedInspection,
} from "@/lib/canonicalWorkflowApi";
import { RISK_BAND_DUE_DAYS, governedDueDate, type RiskBandLabel } from "@/lib/inspection/riskBands";

/**
 * THE COMPLETED INSPECTION.
 *
 * Where the customer lands after finishing, and the answer to a conceptual error in the previous
 * behaviour: finishing an inspection dropped the customer into a generic report library, where the
 * inspection itself disappeared and the report became the only object they could see.
 *
 * The inspection is the operational record, and it has ONE report: the report represents the
 * inspection's current completed state. Reopening, editing and finishing again REPLACES that
 * report. There is deliberately no customer-facing version history here -- no "Report v2", no
 * "Version 1 · Previous", nothing superseded -- because the customer should never have to reason
 * about which of several reports is the real one. Nothing here is a second source of truth: every
 * value is read from the canonical inspection and its current report.
 *
 * Identity is the inspection's RECORD NUMBER ("Inspection #7"). The checksum stays under Technical
 * details as integrity metadata: it proves the file was not altered, it changes whenever the report
 * is regenerated, and presenting it as the record's name would teach the customer that their
 * inspection is renamed whenever its report is.
 *
 * Viewing is allowed while completed. EDITING REQUIRES REOPENING, which is an explicit lifecycle
 * transition through the existing backend, not a frontend edit mode.
 */

function selectedInspectionId() {
  try {
    const value = JSON.parse(
      window.localStorage.getItem("sentinel_selected_inspection_context") || "{}",
    );
    return typeof value.persistedInspectionId === "string" ? value.persistedInspectionId : "";
  } catch {
    return "";
  }
}

function findingRiskBand(finding: PersistedFinding) {
  const snapshot = finding.riskSnapshot as { overallRisk?: string; riskBand?: string } | null;
  return snapshot?.overallRisk || snapshot?.riskBand || "Risk not set";
}

/** The standards the engine attached to this finding, strongest first. */
function findingStandards(finding: PersistedFinding) {
  const raw = finding.sourceCandidate?.standardCandidates;
  if (!Array.isArray(raw)) return [] as Array<{ citation: string; title?: string; applicability: string }>;
  return (raw as Array<{ citation: string; title?: string; applicability: string; confidence?: number }>)
    .filter((candidate) => candidate?.citation && candidate.applicability !== "excluded")
    .sort((a, b) => {
      if (a.applicability !== b.applicability) return a.applicability === "direct" ? -1 : 1;
      return (b.confidence || 0) - (a.confidence || 0);
    });
}

const ACTION_LABELS: Record<string, string> = {
  immediateAction: "Immediate",
  permanentCorrection: "Permanent",
  verificationStep: "Verify",
};

/**
 * The reviewer-confirmed remediation plan, read back from the review that finalized the finding.
 * One plan per finding, matching the domain model.
 */
function reviewedPlan(inspection: PersistedInspection | null, finding: PersistedFinding) {
  const observation = (inspection?.observations || []).find((item) => item.id === finding.observationId);
  const review = (observation?.reviews || []).find((item) => item.id === finding.finalReviewId) as
    | { reviewedConclusion?: { correctiveAction?: Record<string, unknown> } }
    | undefined;
  const action = review?.reviewedConclusion?.correctiveAction || {};
  const lines = (["immediateAction", "permanentCorrection", "verificationStep"] as const)
    .map((key) => {
      // Older records carry their own kind label inside the value; stripped for display rather
      // than rewritten, because the stored review is a record of what the reviewer confirmed.
      const text = String(action[key] || "").trim()
        .replace(/^(Immediate protective action|Permanent correction|Verification step):\s*/i, "");
      return text ? `${ACTION_LABELS[key]}: ${text}` : "";
    })
    .filter(Boolean);
  return { lines, responsible: String(action.responsiblePerson || "").trim() };
}

export default function InspectionCompletePage() {
  const router = useRouter();
  const [inspection, setInspection] = useState<PersistedInspection | null>(null);
  const [siteName, setSiteName] = useState("");
  const [report, setReport] = useState<InspectionReportSummary | null>(null);
  const [status, setStatus] = useState("Loading the completed inspection…");
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmingReopen, setConfirmingReopen] = useState(false);

  const load = useCallback(async () => {
    const id = selectedInspectionId();
    if (!id) {
      setStatus("No inspection is selected.");
      return;
    }
    try {
      const [loaded, reportSummary, sites] = await Promise.all([
        getPersistedInspection(id),
        getReportForInspection(id).catch(() => null),
        listPersistedSites().catch(() => ({ data: [], meta: { total: 0 } })),
      ]);
      setInspection(loaded);
      setReport(reportSummary);
      setSiteName(sites.data.find((site) => site.id === loaded.siteId)?.name || "");
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The inspection could not be loaded.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Only genuine findings. A dismissed HazLenz proposal is not part of the customer's record.
  const findings = (inspection?.findings || []).filter((finding) => finding.status === "finalized");

  const riskCounts = findings.reduce<Record<string, number>>((counts, finding) => {
    const band = findingRiskBand(finding);
    counts[band] = (counts[band] || 0) + 1;
    return counts;
  }, {});


  const recordLabel = inspectionRecordLabel(inspection);

  async function reopen() {
    if (!inspection) return;
    setBusy(true);
    setStatus("Reopening the inspection…");
    try {
      // The authoritative backend lifecycle transition. There is no frontend edit mode: the
      // inspection genuinely returns to draft. The existing report is NOT touched by reopening --
      // it is replaced only when the inspection is finished again and a replacement has been
      // generated successfully, so a reopen the customer abandons leaves their report intact.
      await transitionPersistedInspection(inspection.id, "draft", inspection.version);
      router.push("/inspection-workspace");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The inspection was not reopened.");
      setBusy(false);
    }
  }

  async function download() {
    if (!report) return;
    setDownloading(true);
    try {
      const blob = await downloadPersistedReport(report.reportId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      // Named for the record the customer knows, not for a version counter or a uuid.
      anchor.download = `${recordLabel ? recordLabel.replace(/[#\s]+/g, "-").toLowerCase() : "inspection"}-report.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The report could not be downloaded.");
    } finally {
      setDownloading(false);
    }
  }

  const completedAt = (inspection as { completedAt?: string | null } | null)?.completedAt;

  return (
    <main className="guided-page mx-auto max-w-4xl space-y-5 px-4 py-8">
      {status && (
        <p role="status" aria-live="polite" className="guided-info">{status}</p>
      )}

      {inspection && (
        <>
          <header className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950">
            <p className="text-xs font-black uppercase tracking-widest">
              {inspection.status === "completed" ? "Inspection complete" : "Inspection reopened"}
            </p>
            <h1 className="mt-2 text-3xl font-black">
              {siteName ? `${siteName} — ${inspection.title}` : inspection.title}
            </h1>
            {/* The record number is the customer's identity for this inspection: short, stable,
                readable aloud. The uuid stays out of the ordinary UI entirely. */}
            {recordLabel && (
              <p className="mt-1 text-sm font-black tracking-wide" data-testid="inspection-record-number">
                {recordLabel}
              </p>
            )}
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {completedAt && (
                // Named "Inspection completed", never a bare "Created": the customer would
                // reasonably read a generic date on this page as the date of the inspection.
                <div className="flex gap-2">
                  <dt className="font-bold">Inspection completed</dt>
                  <dd>{new Date(completedAt).toLocaleString(undefined, {
                    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="font-bold">Findings</dt>
                <dd>{findings.length}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-bold">Jurisdiction</dt>
                <dd>{regulatoryContextLabel(inspection.regulatoryContext)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-bold">Report</dt>
                <dd>{report ? "Ready" : "Not generated"}</dd>
              </div>
            </dl>
            {Object.keys(riskCounts).length > 0 && (
              <p className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                {(["Critical", "High", "Moderate", "Low"] as const)
                  .filter((band) => riskCounts[band])
                  .map((band) => (
                    <span key={band} className="rounded-full bg-white px-3 py-1 text-emerald-900 ring-1 ring-emerald-300">
                      {riskCounts[band]} {band}
                    </span>
                  ))}
              </p>
            )}
          </header>

          {/* THE REPORT. One report, representing the inspection's current completed state.
              No version list, no "current vs previous", nothing superseded: the replacement
              sequence that keeps the old report safe until the new one exists is a correctness
              property of the server, not a concept the customer is asked to hold. */}
          <section className="guided-card space-y-3" data-testid="report-section">
            <h2 className="text-xl font-black">Inspection report</h2>
            {!report && (
              <p className="guided-muted text-sm">No report has been generated for this inspection.</p>
            )}
            {report && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-300 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black">Report ready</p>
                  {/* Distinct from "Inspection completed" above. They differ whenever the
                      inspection was reopened and finished again, and both are useful. */}
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {report.reportUpdatedAt
                      ? `Report updated ${new Date(report.reportUpdatedAt).toLocaleString(undefined, {
                        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                      })}`
                      : "Not yet generated"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={downloading || report.status !== "generated"}
                  onClick={() => void download()}
                  data-testid="download-report"
                  className="min-h-11 rounded-xl bg-sky-700 px-5 font-bold text-white disabled:opacity-50"
                >
                  {downloading ? "Downloading…" : "Download PDF"}
                </button>
              </div>
            )}
            {/* Integrity metadata and internal identifiers. The checksum lives here because that is
                what it is -- proof the file was not altered -- and it is never labelled as a
                report id. */}
            {report && (
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">Technical details</summary>
                <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                  <li>
                    Checksum (SHA-256){" "}
                    {report.checksum ? `${report.checksum.slice(0, 16)}…` : "none"}
                    {report.sizeBytes ? ` · ${report.sizeBytes} bytes` : ""}
                  </li>
                  <li>Inspection record {inspection.id}</li>
                </ul>
              </details>
            )}
          </section>

          {/* THE FINDINGS, readable without opening the PDF. */}
          <section className="space-y-3">
            <h2 className="text-xl font-black">
              Findings ({findings.length})
            </h2>
            {findings.length === 0 && (
              <p className="guided-card guided-muted text-sm">This inspection recorded no findings.</p>
            )}
            {findings.map((finding) => {
              const band = findingRiskBand(finding);
              const standards = findingStandards(finding);
              const plan = reviewedPlan(inspection, finding);
              return (
                <article key={finding.id} className="guided-card space-y-2" data-testid="completed-finding">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-lg font-black">
                      {finding.hazardCategory && !/^[a-z0-9_-]+$/.test(finding.hazardCategory)
                        ? finding.hazardCategory
                        : String(finding.hazardCategory || finding.hazardKey).replace(/[_-]+/g, " ")
                          .replace(/^\w/, (letter) => letter.toUpperCase())}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-black uppercase text-slate-800">
                      {band}
                    </span>
                  </div>

                  {finding.source === "user_authored" && (
                    <p className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                      Identified by you · not proposed by HazLenz
                    </p>
                  )}

                  <p className="text-sm">
                    {standards.length ? (
                      <>
                        <strong>{standards[0].citation}</strong>
                        {standards[0].title ? ` — ${standards[0].title}` : ""}
                        {standards.length > 1 ? ` +${standards.length - 1} more` : ""}
                      </>
                    ) : (
                      <span className="guided-muted">
                        {finding.source === "user_authored"
                          ? "No standard matched — you identified this hazard"
                          : "No standard established"}
                      </span>
                    )}
                  </p>

                  {plan.lines.length > 0 ? (
                    <ul className="space-y-0.5 text-sm">
                      {plan.lines.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  ) : (
                    <p className="guided-muted text-sm">No corrective action recorded.</p>
                  )}

                  <p className="text-sm">
                    <span className="font-bold">Responsible: </span>
                    {plan.responsible || <span className="guided-muted">Unassigned</span>}
                    {RISK_BAND_DUE_DAYS[band as RiskBandLabel] !== undefined && completedAt && (
                      <>
                        {" · "}
                        <span className="font-bold">Due: </span>
                        {governedDueDate(band as RiskBandLabel, new Date(completedAt))
                          .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </>
                    )}
                  </p>
                </article>
              );
            })}
          </section>

          {/* REOPEN. Editing a completed inspection requires crossing the lifecycle boundary
              explicitly; there is no inline mutation of a completed record. */}
          <section className="guided-card space-y-3">
            <h2 className="text-xl font-black">Need to change something?</h2>
            {!confirmingReopen ? (
              <>
                <p className="guided-muted text-sm">
                  A completed inspection is read-only. Reopen it to add a finding you missed or to
                  change one you recorded.
                </p>
                <button
                  type="button"
                  disabled={busy || inspection.status !== "completed"}
                  onClick={() => setConfirmingReopen(true)}
                  className="guided-secondary-button"
                  data-testid="reopen-inspection"
                >
                  Reopen inspection
                </button>
              </>
            ) : (
              <>
                <p className="font-bold">Reopen inspection?</p>
                <p className="guided-muted text-sm">
                  This makes the inspection editable again.
                  {report
                    ? " Your current report stays available while you edit. When you finish again, it is replaced by a report of the updated inspection."
                    : " Finishing again creates the report for this inspection."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void reopen()}
                    className="guided-primary-button"
                    data-testid="confirm-reopen"
                  >
                    {busy ? "Reopening…" : "Reopen inspection"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmingReopen(false)}
                    className="guided-secondary-button"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}
