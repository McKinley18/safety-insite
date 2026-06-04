import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("sentinel_auth_token") ||
    window.localStorage.getItem("token") ||
    ""
  );
}

function getDevOrganizationId() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("sentinel_dev_organization_id") ||
    window.localStorage.getItem("sentinel_workspace_id") ||
    "workspace-alpha"
  );
}

function jsonHeaders() {
  const token = getAuthToken();
  const devOrganizationId = getDevOrganizationId();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(devOrganizationId ? { "x-dev-organization-id": devOrganizationId } : {}),
  };
}

function authHeaders() {
  const token = getAuthToken();
  const devOrganizationId = getDevOrganizationId();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(devOrganizationId ? { "x-dev-organization-id": devOrganizationId } : {}),
  };
}

function dataUrlToFile(dataUrl: string, fileName: string, mimeType = "image/jpeg") {
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

async function uploadCloudPhoto(reportId: string, photo: any) {
  const file =
    photo?.file instanceof File
      ? photo.file
      : typeof photo?.url === "string" && photo.url.startsWith("data:")
        ? dataUrlToFile(
            photo.url,
            photo.name || "evidence-photo.jpg",
            photo.mimeType || photo.type || "image/jpeg",
          )
        : null;

  if (!file) {
    if (photo?.cloudImageUri || photo?.imageUri || photo?.url) {
      return {
        id: photo.cloudAttachmentId || null,
        imageUri: photo.cloudImageUri || photo.imageUri || photo.url,
        mimeType: photo.mimeType || photo.type || "image/jpeg",
        fileName: photo.name || "evidence-photo",
        metadataOnly: true,
      };
    }

    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(
    `${API_BASE_URL}/reports/${reportId}/attachments/upload`,
    {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    },
    {
      timeoutMs: 30000,
      retries: 1,
    },
  );

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Evidence upload failed with status ${response.status}.`,
    );
  }

  return data;
}

async function patchCloudReportPackage(reportId: string, report: any) {
  const response = await apiFetch(
    `${API_BASE_URL}/reports/${reportId}`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({
        frontendReportJson: report,
        report,
        company: report.organizationName,
        site: report.siteLocation,
        inspector: report.leadInspector,
        confidential: Boolean(report.isConfidential),
      }),
    },
    {
      timeoutMs: 30000,
      retries: 1,
    },
  );

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Cloud report update failed with status ${response.status}.`,
    );
  }

  return data;
}

async function uploadReportPhotosAndAttachMetadata(reportId: string, report: any) {
  const findings = Array.isArray(report?.findings) ? report.findings : [];
  let uploadedCount = 0;

  const nextFindings = [];

  for (const finding of findings) {
    const photos = Array.isArray(finding?.photos) ? finding.photos : [];
    const nextPhotos = [];

    for (const photo of photos) {
      if (photo?.cloudImageUri && photo?.cloudAttachmentId) {
        nextPhotos.push(photo);
        continue;
      }

      try {
        const attachment = await uploadCloudPhoto(reportId, photo);

        if (attachment?.imageUri) {
          uploadedCount += attachment.metadataOnly ? 0 : 1;
          nextPhotos.push({
            ...photo,
            cloudAttachmentId: attachment.id || photo.cloudAttachmentId,
            cloudImageUri: attachment.imageUri,
            cloudUploadedAt: new Date().toISOString(),
            cloudMimeType: attachment.mimeType || photo.mimeType,
            cloudFileName: attachment.fileName || photo.name,
          });
          continue;
        }
      } catch {
        // Keep local encrypted photo intact if upload fails.
      }

      nextPhotos.push(photo);
    }

    nextFindings.push({
      ...finding,
      photos: nextPhotos,
    });
  }

  return {
    report: {
      ...report,
      findings: nextFindings,
      evidenceCloudSync: {
        attemptedAt: new Date().toISOString(),
        uploadedCount,
      },
    },
    uploadedCount,
  };
}

export async function saveInspectionReportToCloud(report: any) {
  if (!report) {
    throw new Error("No report is available to save.");
  }

  const existingCloudReportId = report.cloudReportId || report.backendReportId || null;

  if (existingCloudReportId) {
    const synced = await uploadReportPhotosAndAttachMetadata(
      existingCloudReportId,
      report,
    );

    const updatedReport = {
      ...synced.report,
      cloudReportId: existingCloudReportId,
      cloudSavedAt: new Date().toISOString(),
      cloudUpdatedAt: new Date().toISOString(),
      storageSource: "cloud",
    };

    const updatedCloudRecord = await patchCloudReportPackage(
      existingCloudReportId,
      updatedReport,
    );

    return {
      ...updatedCloudRecord,
      id: existingCloudReportId,
      frontendReportJson: updatedReport,
      evidenceUploadedCount: synced.uploadedCount,
      cloudSaveMode: "updated",
    };
  }

  const response = await apiFetch(
    `${API_BASE_URL}/reports`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        frontendReportJson: report,
        report,
        company: report.organizationName,
        site: report.siteLocation,
        inspector: report.leadInspector,
        confidential: Boolean(report.isConfidential),
        findings: Array.isArray(report.findings) ? report.findings : [],
      }),
    },
    {
      timeoutMs: 30000,
      retries: 1,
    },
  );

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Cloud report save failed with status ${response.status}.`,
    );
  }

  const reportId = data?.id;

  if (!reportId) {
    return data;
  }

  const synced = await uploadReportPhotosAndAttachMetadata(reportId, report);
  const updatedReport = {
    ...synced.report,
    cloudReportId: reportId,
    cloudSavedAt: new Date().toISOString(),
    storageSource: "cloud",
  };

  const updatedCloudRecord = await patchCloudReportPackage(reportId, updatedReport);

  return {
    ...data,
    ...updatedCloudRecord,
    id: reportId,
    frontendReportJson: updatedReport,
    evidenceUploadedCount: synced.uploadedCount,
    cloudSaveMode: "created",
  };
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

export async function fetchCloudReports() {
  const response = await apiFetch(
    `${API_BASE_URL}/reports`,
    {
      method: "GET",
      headers: jsonHeaders(),
    },
    {
      timeoutMs: 30000,
      retries: 1,
    },
  );

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : [];

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Cloud reports could not be loaded. Status ${response.status}.`,
    );
  }

  return Array.isArray(data) ? data.map(normalizeCloudReportRecord) : [];
}


export async function archiveCloudReport(reportId: string) {
  if (!reportId) {
    throw new Error("No cloud report id is available to archive.");
  }

  const response = await apiFetch(
    `${API_BASE_URL}/reports/${reportId}/archive`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
    },
    {
      timeoutMs: 30000,
      retries: 1,
    },
  );

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Cloud report archive failed with status ${response.status}.`,
    );
  }

  return data;
}
