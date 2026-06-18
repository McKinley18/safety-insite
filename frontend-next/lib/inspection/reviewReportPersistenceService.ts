import { saveInspectionReportToCloud } from "@/lib/cloudReports";
import {
  getReports,
  setLatestReport,
  setReports,
} from "@/lib/reportStorage";
import { isSamePersistentReport } from "@/lib/inspection/reportReviewHelpers";

export async function persistReviewedReport(
  nextReport: any,
  setReport: (report: any) => void,
) {
  setReport(nextReport);
  await setLatestReport(nextReport);

  const storedReports = await getReports<any>();
  const reports = Array.isArray(storedReports) ? storedReports : [];

  await setReports([
    nextReport,
    ...reports.filter((existing: any) => !isSamePersistentReport(existing, nextReport)),
  ]);
}

export async function saveReportToCloud(input: {
  report: any;
  setCloudSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  setCloudSaveMessage: (msg: string) => void;
  persistReviewedReport: (nextReport: any) => Promise<void>;
}) {
  const { report, setCloudSaveStatus, setCloudSaveMessage, persistReviewedReport } = input;
  if (!report) return;

  setCloudSaveStatus("saving");
  setCloudSaveMessage("Saving report package to cloud...");

  try {
    const saved = await saveInspectionReportToCloud(report);

    const syncedReport = saved?.frontendReportJson || report;

    const nextReport = {
      ...syncedReport,
      cloudReportId: saved?.id || syncedReport.cloudReportId || report.cloudReportId,
      cloudSavedAt: new Date().toISOString(),
      cloudSaveStatus: "saved",
      evidenceCloudSync: syncedReport.evidenceCloudSync || {
        attemptedAt: new Date().toISOString(),
        uploadedCount: saved?.evidenceUploadedCount || 0,
      },
    };

    await persistReviewedReport(nextReport);

    setCloudSaveStatus("saved");
    setCloudSaveMessage(
      saved?.id
        ? `${
            saved?.cloudSaveMode === "updated" ? "Updated" : "Saved"
          } cloud report ${saved.id}. Evidence uploaded: ${
            saved?.evidenceUploadedCount || 0
          }.`
        : "Saved to cloud.",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Cloud report save failed.";

    setCloudSaveStatus("error");
    setCloudSaveMessage(message);
  }
}
