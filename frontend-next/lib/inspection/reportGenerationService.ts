import {
  addReportAttachment,
  saveWorkspaceReport,
  uploadReportAttachment,
} from "@/lib/auth";
import { addActivityEvent } from "@/lib/activityStorage";
import { enqueueOfflineItem } from "@/lib/offlineQueue";
import {
  getCoverPage,
  getReports,
  setLatestReport,
  setReports,
} from "@/lib/reportStorage";
import { buildInspectionReport } from "./reportBuilder";

export type ReportStorageMode = "local" | "cloud" | "ask";

export async function generateInspectionReportPackage(input: {
  finalizedFindings: any[];
  activeEditReport: any;
  includeStandardsInReport: boolean;
  includeActionsInReport: boolean;
  includePhotosInReport: boolean;
  includeSafeScopeNotesInReport: boolean;
}) {
  const coverPage = (await getCoverPage<any>()) || {};

  const reportPackageMode =
    window.localStorage.getItem("sentinel_report_package_mode") ||
    "professional_compliance";

  const builtReport = buildInspectionReport({
    coverPage,
    findings: input.finalizedFindings,
    includeStandardsInReport: input.includeStandardsInReport,
    includeActionsInReport: input.includeActionsInReport,
    includePhotosInReport: input.includePhotosInReport,
    includeSafeScopeNotesInReport: input.includeSafeScopeNotesInReport,
    reportPackageMode,
  });

  const report: any = input.activeEditReport?.id
    ? {
        ...builtReport,
        id: input.activeEditReport.id,
        cloudReportId: input.activeEditReport.cloudReportId,
        cloudSavedAt: input.activeEditReport.cloudSavedAt,
        cloudUpdatedAt: input.activeEditReport.cloudUpdatedAt,
        storageSource: input.activeEditReport.storageSource || "local",
        createdAt: input.activeEditReport.createdAt || builtReport.createdAt,
        updatedAt: new Date().toISOString(),
      }
    : builtReport;

  const storageMode =
    (window.localStorage.getItem("sentinel_report_storage_mode") as
      | ReportStorageMode
      | null) || "local";

  let shouldSaveLocal = storageMode !== "cloud";

  if (storageMode === "ask") {
    shouldSaveLocal = window.confirm(
      "Save this report locally in this browser?\n\nSelect Cancel to use cloud storage only.",
    );
  }

  if (shouldSaveLocal) {
    await saveReportLocally(report);
  }

  if (storageMode === "cloud" || storageMode === "ask") {
    try {
      await saveReportToCloud(report, input.finalizedFindings);
    } catch (error) {
      await queueCloudReportSaveFailure({
        report,
        storageMode,
        error,
      });

      alert(
        "Report could not be saved to cloud storage. It was saved locally and queued for retry.",
      );

      await saveReportLocally(report, {
        matchByCloudOrLocalId: false,
      });
    }
  }

  await addActivityEvent({
    type: "Report",
    title: `Inspection report ${report.id} generated`,
    detail: `${input.finalizedFindings.length} finding(s)`,
  });

  return report;
}

async function saveReportLocally(
  report: any,
  options: { matchByCloudOrLocalId?: boolean } = {},
) {
  const existingReportsRaw = await getReports<any>();
  const existingReports = Array.isArray(existingReportsRaw)
    ? existingReportsRaw
    : [];

  const matchByCloudOrLocalId = options.matchByCloudOrLocalId ?? true;

  const nextReports = [
    report,
    ...existingReports.filter((existing: any) => {
      if (!matchByCloudOrLocalId) return existing.id !== report.id;

      return (
        String(existing.cloudReportId || existing.id) !==
        String(report.cloudReportId || report.id)
      );
    }),
  ];

  await setLatestReport(report);
  await setReports(nextReports);
}

async function saveReportToCloud(report: any, finalizedFindings: any[]) {
  const savedCloudReport = await saveWorkspaceReport(report);

  const attachmentPayloads = finalizedFindings.flatMap((finding: any) =>
    (finding.photos || []).map((photo: any) => ({
      imageUri: photo.url || photo.imageUri || photo.id,
      mimeType: photo.mimeType || photo.type || "image/jpeg",
      fileName: photo.name || "evidence-photo",
    })),
  );

  const uploadedPhotoFiles = finalizedFindings.flatMap((finding: any) =>
    (finding.photos || []).filter((photo: any) => photo.file),
  );

  await Promise.allSettled(
    uploadedPhotoFiles.map((photo: any) =>
      uploadReportAttachment(savedCloudReport.id, photo.file),
    ),
  );

  const metadataOnlyAttachments = attachmentPayloads.filter(
    (attachment: any) => !String(attachment.imageUri || "").startsWith("data:"),
  );

  await Promise.allSettled(
    metadataOnlyAttachments.map((attachment: any) =>
      addReportAttachment(savedCloudReport.id, attachment),
    ),
  );

  window.localStorage.setItem(
    "sentinel_latest_cloud_report_id",
    savedCloudReport.id,
  );

  window.localStorage.setItem(
    "sentinel_latest_report",
    JSON.stringify(savedCloudReport.frontendReportJson || report),
  );

  return savedCloudReport;
}

async function queueCloudReportSaveFailure(input: {
  report: any;
  storageMode: ReportStorageMode;
  error: unknown;
}) {
  await enqueueOfflineItem({
    type: "report_save",
    payload: {
      report: input.report,
      storageMode: input.storageMode,
      reason: "cloud_save_failed",
    },
    lastError:
      input.error instanceof Error
        ? input.error.message
        : "Unknown cloud save failure",
  });
}
