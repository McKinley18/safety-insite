import { getOfflineQueue } from "./offlineQueue";
import { getReports } from "./reportStorage";

export type LocalVaultStatus = {
  encryptedStorageEnabled: boolean;
  localReportCount: number;
  pendingSyncCount: number;
  failedSyncCount: number;
  storageMode: "local" | "cloud" | "ask";
  lastLocalSave?: string | null;
};

export async function getLocalVaultStatus(): Promise<LocalVaultStatus> {
  if (typeof window === "undefined") {
    return {
      encryptedStorageEnabled: false,
      localReportCount: 0,
      pendingSyncCount: 0,
      failedSyncCount: 0,
      storageMode: "local",
      lastLocalSave: null,
    };
  }

  const reports = await getReports<any>();
  const queue = await getOfflineQueue();

  const storageMode =
    (window.localStorage.getItem("sentinel_report_storage_mode") as "local" | "cloud" | "ask" | null) ||
    "local";

  const lastLocalSave =
    reports
      .map((report: any) => report.updatedAt || report.createdAt || report.generatedAt || report.date)
      .filter(Boolean)
      .sort()
      .reverse()[0] || null;

  return {
    encryptedStorageEnabled: !!window.crypto?.subtle,
    localReportCount: Array.isArray(reports) ? reports.length : 0,
    pendingSyncCount: queue.filter((item) => item.status === "pending").length,
    failedSyncCount: queue.filter((item) => item.status === "failed").length,
    storageMode,
    lastLocalSave,
  };
}
