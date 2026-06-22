import { API_BASE_URL } from "./safescope";

export const AUTH_TOKEN_KEYS = ["sentinel_auth_token", "token"] as const;
export const AUTH_USER_KEY = "sentinel_auth_user";
export const LOCAL_DEV_AUTH_TOKEN = "local-dev-token";

export type SentinelAuthUser = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  type?: string;
  [key: string]: unknown;
};

export function isLocalDevAuthBypassEnabled() {
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  for (const key of AUTH_TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function setAuthSession(token: string, user?: SentinelAuthUser | null) {
  if (typeof window === "undefined") return;

  clearAuthSession();

  for (const key of AUTH_TOKEN_KEYS) {
    window.localStorage.setItem(key, token);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function getAuthUser<T extends SentinelAuthUser = SentinelAuthUser>() {
  if (typeof window === "undefined") return {} as T;

  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || "{}") as T;
  } catch {
    return {} as T;
  }
}

export function setAuthUser(user: SentinelAuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  for (const key of AUTH_TOKEN_KEYS) {
    window.localStorage.removeItem(key);
  }

  [
    AUTH_USER_KEY,
    "sentinel_user",
    "sentinel_profile",
    "sentinel_workspace",
    "safescope_user",
    "safescope_profile",
    "insite_user",
    "insite_profile",
    "insite_workspace",
  ].forEach((key) => window.localStorage.removeItem(key));
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
      regulatoryScope: "all",
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
      regulatoryScope: "all",
    };
  }

  return response.json();
}

export async function updateOrganizationSettings(payload: {
  riskProfileId?: string;
  regulatoryScope?: string;
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

export async function createCheckoutSession(planCode: "pro" | "plus" = "pro") {
  const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ planCode: planCode === "plus" ? "pro" : planCode }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Billing checkout could not be started.");
  }

  return response.json();
}
