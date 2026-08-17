import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";
import {
  authHeaders,
  dataUrlToFile,
  jsonHeaders,
  normalizeCloudReportRecord,
} from "./inspection/reportCloudHelpers";

// Server error responses (e.g. a body-size rejection from the platform's
// request parser) are not guaranteed to be JSON. Parsing unconditionally
// before checking response.ok let a raw parser error (a SyntaxError quoting
// the server's non-JSON error text) leak to the user in place of a clean
// message. Always parse defensively and fall back to status-based text.
async function parseCloudResponseBody(response: Response) {
  const responseText = await response.text();
  if (!responseText) return null;
  try {
    return JSON.parse(responseText);
  } catch {
    return null;
  }
}

function cloudErrorMessage(data: any, status: number, fallback: string) {
  if (status === 413) {
    return "This report is too large to save (likely due to attached evidence photos). It was kept locally — try removing a photo or saving again with fewer attachments.";
  }

  return data?.message || data?.error || `${fallback} Status ${status}.`;
}

// Photos are captured as base64 data URLs client-side and uploaded through
// the dedicated multipart attachment endpoint (uploadReportPhotosAndAttachMetadata /
// uploadCloudPhoto) immediately after the report record exists. Embedding
// that same base64 data a second time inside the report JSON body is
// unnecessary and, for even a single finding with one photo, routinely
// exceeds the server's JSON body size limit. Strip inline data URLs (and any
// File objects, which are not JSON-serializable) before sending the report
// as JSON; already-uploaded cloud photo references pass through unchanged.
export function stripInlinePhotoData(report: any) {
  if (!report || !Array.isArray(report.findings)) return report;

  return {
    ...report,
    findings: report.findings.map((finding: any) => {
      if (!Array.isArray(finding?.photos)) return finding;

      return {
        ...finding,
        photos: finding.photos.map((photo: any) => {
          if (!photo) return photo;
          const { file, url, ...metadata } = photo;
          const isInlineData = typeof url === "string" && url.startsWith("data:");
          return isInlineData || file ? metadata : photo;
        }),
      };
    }),
  };
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

  const data = await parseCloudResponseBody(response);

  if (!response.ok) {
    throw new Error(cloudErrorMessage(data, response.status, "Evidence upload failed."));
  }

  return data;
}

async function patchCloudReportPackage(reportId: string, report: any) {
  const strippedReport = stripInlinePhotoData(report);

  const response = await apiFetch(
    `${API_BASE_URL}/reports/${reportId}`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({
        frontendReportJson: strippedReport,
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

  const data = await parseCloudResponseBody(response);

  if (!response.ok) {
    throw new Error(cloudErrorMessage(data, response.status, "Cloud report update failed."));
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

  const strippedReport = stripInlinePhotoData(report);

  const response = await apiFetch(
    `${API_BASE_URL}/reports`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        frontendReportJson: strippedReport,
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

  const data = await parseCloudResponseBody(response);

  if (!response.ok) {
    throw new Error(cloudErrorMessage(data, response.status, "Cloud report save failed."));
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

  const data = await parseCloudResponseBody(response);

  if (!response.ok) {
    throw new Error(cloudErrorMessage(data, response.status, "Cloud reports could not be loaded."));
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

  const data = await parseCloudResponseBody(response);

  if (!response.ok) {
    throw new Error(cloudErrorMessage(data, response.status, "Cloud report archive failed."));
  }

  return data;
}
