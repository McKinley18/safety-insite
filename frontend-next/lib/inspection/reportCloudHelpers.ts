import { getAuthToken } from "../auth";

export function getDevOrganizationId() {
  if (typeof window === "undefined") return "";
  if (process.env.NODE_ENV === "production") return "";

  return (
    window.localStorage.getItem("sentinel_dev_organization_id") ||
    window.localStorage.getItem("sentinel_workspace_id") ||
    "workspace-alpha"
  );
}

export function jsonHeaders() {
  const token = getAuthToken();
  const devOrganizationId = getDevOrganizationId();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(devOrganizationId ? { "x-dev-organization-id": devOrganizationId } : {}),
  };
}

export function authHeaders() {
  const token = getAuthToken();
  const devOrganizationId = getDevOrganizationId();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(devOrganizationId ? { "x-dev-organization-id": devOrganizationId } : {}),
  };
}

export function dataUrlToFile(dataUrl: string, fileName: string, mimeType = "image/jpeg") {
  const [header, base64] = dataUrl.split(",");
  const detectedMime =
    header?.match(/data:([^;]+);base64/)?.[1] || mimeType || "image/jpeg";

  const binary = window.atob(base64 || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fileName || "evidence-photo.jpg", {
    type: detectedMime,
  });
}

export function normalizeCloudReportRecord(record: any) {
  const frontendReport = record?.frontendReportJson || record?.report || record || {};

  return {
    ...frontendReport,
    id: frontendReport.id || record.id,
    cloudReportId: record.id,
    cloudSavedAt:
      frontendReport.cloudSavedAt ||
      record.reportedDatetime ||
      record.createdAt ||
      new Date().toISOString(),
    createdAt:
      frontendReport.createdAt ||
      record.reportedDatetime ||
      record.createdAt ||
      new Date().toISOString(),
    title:
      frontendReport.title ||
      (record.company ? `${record.company} Inspection Report` : "Inspection Report"),
    organizationName:
      frontendReport.organizationName ||
      record.company ||
      "",
    siteLocation:
      frontendReport.siteLocation ||
      record.site ||
      "",
    leadInspector:
      frontendReport.leadInspector ||
      record.inspector ||
      "",
    isConfidential:
      frontendReport.isConfidential ??
      record.confidential ??
      false,
    findings:
      Array.isArray(frontendReport.findings) && frontendReport.findings.length
        ? frontendReport.findings
        : Array.isArray(record.findings)
          ? record.findings
          : [],
    storageSource: "cloud",
  };
}
