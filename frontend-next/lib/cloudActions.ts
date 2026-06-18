import { getAuthToken } from "./auth";
import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";


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

function normalizePriority(value: any) {
  const priority = String(value || "medium").toLowerCase();

  if (priority === "urgent" || priority === "critical") return "Critical";
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Medium";
}

function normalizeStatus(value: any) {
  const status = String(value || "open").toLowerCase();

  if (status === "closed" || status === "completed") return "Completed";
  if (status === "in_progress" || status === "in progress") return "In Progress";
  if (status === "cancelled" || status === "canceled") return "Blocked";
  return "Open";
}

function toBackendStatus(value: string) {
  if (value === "Completed") return "closed";
  if (value === "In Progress") return "in_progress";
  if (value === "Blocked") return "cancelled";
  return "open";
}

export function normalizeCloudAction(action: any) {
  return {
    id: action.id,
    backendActionId: action.id,
    displayId: action.displayId,
    reportId: action.reportId,
    findingId: action.findingId,
    title: action.title || "Corrective action",
    description: action.description || "",
    priority: normalizePriority(action.priorityCode || action.priority),
    status: normalizeStatus(action.statusCode || action.status),
    due: action.dueDate || action.due || "",
    source: action.source || action.originalSuggestion?.source || "Cloud Sync",
    location: action.siteId || "Field record",
    findingTitle: action.category || action.originalSuggestion?.findingTitle || "Inspection Finding",
    createdAt: action.createdAt || new Date().toISOString(),
    storageSource: "cloud",
  };
}

export async function fetchCloudActions() {
  const response = await apiFetch(
    `${API_BASE_URL}/actions?limit=250`,
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
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Cloud actions could not be loaded. Status ${response.status}.`,
    );
  }

  const actions = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return actions.map(normalizeCloudAction);
}

export async function updateCloudActionStatus(actionId: string, status: string) {
  const response = await apiFetch(
    `${API_BASE_URL}/actions/${actionId}/status`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({
        statusCode: toBackendStatus(status),
        closureNotes:
          status === "Completed"
            ? "Closed from Safety InSite corrective action tracker."
            : undefined,
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
        `Cloud action could not be updated. Status ${response.status}.`,
    );
  }

  return normalizeCloudAction(data);
}
