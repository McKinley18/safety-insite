"use client";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import {
  archivePersistedReport,
  downloadPersistedReport,
  listPersistedReports,
  regulatoryContextLabel,
  type PersistedReport,
} from "@/lib/canonicalWorkflowApi";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<PersistedReport[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");
  const [deleting, setDeleting] = useState("");

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

  async function download(report: PersistedReport, version: number) {
    const key = `${report.id}:${version}`;
    setDownloading(key);
    setMessage("");
    try {
      const blob = await downloadPersistedReport(report.id, version);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `inspection-${report.inspectionId}-v${version}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report download failed.");
    } finally {
      setDownloading("");
    }
  }

  async function deleteReport(report: PersistedReport) {
    const confirmed = window.confirm(
      `Delete "${report.inspection?.title || "Inspection"}${report.inspection?.siteName ? ` · ${report.inspection.siteName}` : ""}" from your reports list? This removes it from view; it is not permanently erased.`,
    );
    if (!confirmed) return;

    setDeleting(report.id);
    setMessage("");
    try {
      await archivePersistedReport(report.id);
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report could not be deleted.");
    } finally {
      setDeleting("");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <PageHeader
        eyebrow="Server-backed records"
        title="Inspection reports"
        description="Generated reports are immutable, versioned, and retrieved through an authorized private-file route."
      />

      {message && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {message}
        </p>
      )}

      {status === "loading" && (
        <AppPanel aria-live="polite">
          <p className="text-sm font-semibold text-app-text-muted">Loading persisted reports…</p>
        </AppPanel>
      )}

      {status === "error" && (
        <EmptyState
          title="Reports are unavailable"
          description="Nothing local is being shown as a successful report. Retry after the server connection is restored."
          actionLabel="Retry"
          onAction={() => void load()}
        />
      )}

      {status === "ready" && reports.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No generated reports"
          description="Complete an inspection and generate a report to create the first durable version."
        />
      )}

      {status === "ready" && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <AppPanel key={report.id} as="article" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-app-text">
                    {report.inspection?.title || "Inspection"}
                    {report.inspection?.siteName ? ` · ${report.inspection.siteName}` : ""}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-app-text-muted">
                    {report.inspection ? `${regulatoryContextLabel(report.inspection.regulatoryContext)} · ` : ""}
                    created {new Date(report.createdAt).toLocaleString()}
                  </p>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[11px] font-semibold text-app-text-muted">Record IDs</summary>
                    <p className="text-[11px] text-app-text-muted">Inspection {report.inspectionId} · Report {report.id}</p>
                  </details>
                </div>
                <AppButton
                  size="sm"
                  variant="danger"
                  disabled={deleting === report.id}
                  onClick={() => void deleteReport(report)}
                >
                  {deleting === report.id ? "Deleting…" : "Delete Report"}
                </AppButton>
              </div>
              <ul className="space-y-2">
                {[...report.versions].sort((a, b) => b.version - a.version).map((version) => {
                  const key = `${report.id}:${version.version}`;
                  const available = version.status === "generated" || version.status === "superseded";
                  return (
                    <li key={version.version} className="flex flex-col gap-3 rounded-xl border border-app-border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-app-text">Version {version.version}</p>
                        <p className="text-xs font-semibold text-app-text-muted">
                          {version.status}
                          {version.generatedAt ? ` · ${new Date(version.generatedAt).toLocaleString()}` : ""}
                          {version.sha256 ? ` · checksum ${version.sha256.slice(0, 12)}…` : ""}
                        </p>
                      </div>
                      <AppButton
                        size="sm"
                        disabled={!available || downloading === key}
                        onClick={() => void download(report, version.version)}
                      >
                        {downloading === key ? "Downloading…" : "Download PDF"}
                      </AppButton>
                    </li>
                  );
                })}
              </ul>
            </AppPanel>
          ))}
        </div>
      )}
    </main>
  );
}
