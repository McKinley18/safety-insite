import { API_BASE_URL } from "./safescope";
import { apiFetch } from "./apiFetch";
import { lockSession } from "./pinSecurity";
import { stripInlinePhotoData } from "./cloudReports";

export const AUTH_TOKEN_KEYS = ["sentinel_auth_token"] as const;
export const AUTH_USER_KEY = "sentinel_auth_user";
export const AUTH_REFRESH_TOKEN_KEY = "sentinel_auth_refresh_token";
export const LOCAL_DEV_AUTH_TOKEN = "local-dev-token";

const SENSITIVE_LOCAL_STORAGE_KEYS = [
  AUTH_USER_KEY,
  "sentinel_user",
  "sentinel_profile",
  "sentinel_workspace",
  "safescope_user",
  "safescope_profile",
  "insite_user",
  "insite_profile",
  "insite_workspace",
  "sentinel_plan_code",
  "sentinel_effective_plan_code",
  "sentinel_selected_inspection_context",
  "sentinel_editing_report_id",
  "sentinel_latest_cloud_report_id",
  "sentinel_latest_report",
  "sentinel_report_package_mode",
  "sentinel_report_storage_mode",
  "sentinel_risk_profile",
  "sentinel_company_risk_profile",
  "sentinel_regulatory_scope",
  "sentinel_company_logo",
  "sentinel_include_logo_on_cover",
  "sentinel_default_include_cover_page",
  "sentinel_default_confidential_marker",
  "sentinel_confidential_marker_text",
  "sentinel_company_assigned_work",
  "sentinel_inspection_program_v1",
  "sentinel_encrypted_actions",
  "sentinel_encrypted_activity",
  "sentinel_offline_queue_v1",
  "sentinel_dev_organization_id",
  "sentinel_workspace_id",
  "sentinel_safescope_brain_bundle_v1",
  "sentinel_safescope_brain_bundle_meta_v1",
];

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
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  for (const key of AUTH_TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (!token) continue;

    if (token === LOCAL_DEV_AUTH_TOKEN && !isLocalDevAuthBypassEnabled()) {
      continue;
    }

    return token;
  }

  return null;
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function setAuthSession(
  token: string,
  refreshTokenOrUser?: string | SentinelAuthUser | null,
  maybeUser?: SentinelAuthUser | null,
) {
  if (typeof window === "undefined") return;

  // Accepts either (token, user) [local-dev bypass, no real refresh token]
  // or (token, refreshToken, user) [real backend session].
  const refreshToken = typeof refreshTokenOrUser === "string" ? refreshTokenOrUser : null;
  const user = typeof refreshTokenOrUser === "string" ? maybeUser : refreshTokenOrUser;

  clearAuthSession();

  for (const key of AUTH_TOKEN_KEYS) {
    window.localStorage.setItem(key, token);
  }

  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

let refreshInFlight: Promise<boolean> | null = null;

// Silently exchanges the stored refresh token for a new access token +
// rotated refresh token. Callers (apiFetch's 401 handler) retry their
// original request once this resolves true. De-duped via refreshInFlight
// so concurrent 401s from several in-flight requests share one refresh call
// instead of racing to rotate the same token.
export async function refreshAuthSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isLocalDevAuthBypassEnabled()) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          clearAuthSession();
          return false;
        }

        const data = await response.json();
        if (!data?.token || !data?.refreshToken) {
          clearAuthSession();
          return false;
        }

        setAuthSession(data.token, data.refreshToken, data.user);
        return true;
      } catch {
        return false;
      }
    })();
  }

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

// Revokes the refresh token server-side (best-effort) before clearing local
// session state, so "Sign Out" actually ends the session rather than just
// hiding the token client-side while it remains usable to mint new access
// tokens until it expires.
export async function logout() {
  if (typeof window === "undefined") return;

  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort: local session state is cleared regardless below.
    }
  }

  clearAuthSession();
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
  window.localStorage.removeItem("token");
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);

  SENSITIVE_LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));

  lockSession();
}

export function authHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyProfile() {
  const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    throw new Error("Unable to load your profile.");
  }

  return (await response.json()) as SentinelAuthUser;
}

export async function updateMyProfile(payload: { firstName?: string; lastName?: string }) {
  const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Unable to update your profile.";
    try {
      const parsed = await response.json();
      if (typeof parsed?.message === "string") message = parsed.message;
      else if (Array.isArray(parsed?.message) && parsed.message.length) {
        message = String(parsed.message[0]);
      }
    } catch {
      // Non-JSON error body: keep the generic message.
    }
    throw new Error(message);
  }

  return (await response.json()) as SentinelAuthUser;
}

export async function getOrganizationSettings() {
  const response = await apiFetch(`${API_BASE_URL}/organization/me/settings`, {
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
  const response = await apiFetch(`${API_BASE_URL}/organization/me/settings`, {
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
  const response = await apiFetch(`${API_BASE_URL}/organization/me/members`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load organization members.");
  }

  return response.json();
}

export async function getOrganizationInvites() {
  const response = await apiFetch(`${API_BASE_URL}/organization/me/invites`, {
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
  const response = await apiFetch(`${API_BASE_URL}/organization/me/invite`, {
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
  const response = await apiFetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      frontendReportJson: stripInlinePhotoData(report),
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to save report to workspace database.");
  }

  return response.json();
}

export async function getWorkspaceReports() {
  const response = await apiFetch(`${API_BASE_URL}/reports`, {
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
  const response = await apiFetch(`${API_BASE_URL}/reports/${reportId}/attachments`, {
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

  const response = await apiFetch(`${API_BASE_URL}/reports/${reportId}/attachments/upload`, {
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
