export type Report = {
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
