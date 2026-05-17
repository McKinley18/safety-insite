import { API_BASE_URL } from "./safescope";

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem("sentinel_auth_token") ||
    window.localStorage.getItem("token")
  );
}

export function authHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getOrganizationSettings() {
  const response = await fetch(`${API_BASE_URL}/organization/me/settings`, {
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return {
      name: "",
      logoPath: "",
      riskProfileId: "standard_5x5",
    };
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    return {
      name: "",
      logoPath: "",
      riskProfileId: "standard_5x5",
    };
  }

  return response.json();
}

export async function updateOrganizationSettings(payload: {
  riskProfileId?: string;
  name?: string;
  logoPath?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/organization/me/settings`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to save organization settings.");
  }

  return response.json();
}

export async function getOrganizationMembers() {
  const response = await fetch(`${API_BASE_URL}/organization/me/members`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load organization members.");
  }

  return response.json();
}

export async function getOrganizationInvites() {
  const response = await fetch(`${API_BASE_URL}/organization/me/invites`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load organization invites.");
  }

  return response.json();
}

export async function inviteOrganizationMember(payload: {
  email: string;
  role: string;
}) {
  const response = await fetch(`${API_BASE_URL}/organization/me/invite`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create invitation.");
  }

  return response.json();
}

export async function saveWorkspaceReport(report: any) {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      frontendReportJson: report,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to save report to workspace database.");
  }

  return response.json();
}

export async function getWorkspaceReports() {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load workspace reports.");
  }

  return response.json();
}

export async function addReportAttachment(reportId: string, payload: {
  imageUri: string;
  mimeType?: string;
  fileName?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/attachments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to save report attachment.");
  }

  return response.json();
}

export async function uploadReportAttachment(reportId: string, file: File) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/attachments/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Unable to upload report attachment.");
  }

  return response.json();
}
