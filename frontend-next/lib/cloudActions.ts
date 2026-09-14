import { getAuthToken } from "./auth";
import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./hazlenzClient";


function getDevOrganizationId() {
  if (typeof window === "undefined") return "";
  if (process.env.NODE_ENV === "production") return "";

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

/**
 * §287 — A TRANSPORT FAILURE IS NOT AN ERROR MESSAGE.
 *
 * Measured: closing an action with no connection surfaced the browser's own `TypeError: Failed to
 * fetch` to the inspector. It is honest and it is useless — it does not say what happened, whether
 * anything was saved, or what to do, and "Failed to fetch" invites exactly the confused re-press
 * that D-054 is about.
 *
 * A transport failure is the ONE case where the client knows the request never reached the server,
 * so it can say the one thing that matters: nothing was saved, and the work is still here. An HTTP
 * error is left alone — the server's own message is more specific than anything invented here.
 */
async function requestActionRoute(url: string, init: RequestInit, failureNoun: string) {
  let response: Response;
  try {
    response = await apiFetch(url, init, { timeoutMs: 30000, retries: 0 });
  } catch {
    throw new Error(
      `Safety InSite could not be reached, so ${failureNoun} was not saved. `
      + "Your changes are still on this screen — try again when you have a connection.",
    );
  }
  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error
      || `${failureNoun.charAt(0).toUpperCase()}${failureNoun.slice(1)} could not be saved. Status ${response.status}.`);
  }
  return data;
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

/**
 * §287 / D-051. The action's due date as a CALENDAR DAY, `YYYY-MM-DD`.
 *
 * The server stores a timestamp and sends an ISO instant. Reading the day out of it with
 * `toISOString().slice(0, 10)` would give the UTC day, which is the §275 projection defect: an
 * action due in the local evening reports as the following day. Built from the LOCAL component
 * getters, so it agrees with what the calendar shows and with what a date input expects.
 */
export function actionDueDateKey(value: unknown): string {
  if (!value) return "";
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * §287 / D-052 — THE LIFECYCLE STATE, COPIED FROM THE SERVER, NEVER DERIVED HERE.
 *
 * The server sends `lifecycleState`, `verified` and `closedWithoutVerification` because deciding
 * whether a closed action counts as verified is exactly the inference that produced the fabricated
 * supervisor sign-off D-052 rejects. A client that re-derived it would be a second place that could
 * get it wrong.
 */
export type CloudActionLifecycleState =
  | "open" | "in_progress" | "completed" | "verified" | "cancelled";

export type CloudAction = ReturnType<typeof normalizeCloudAction>;

export function normalizeCloudAction(action: any) {
  return {
    id: action.id,
    backendActionId: action.id,
    displayId: action.displayId,
    reportId: action.reportId,
    findingId: action.findingId,
    inspectionId: action.inspectionId || null,
    title: action.title || "Corrective action",
    description: action.description || "",
    priority: normalizePriority(action.priorityCode || action.priority),
    status: normalizeStatus(action.statusCode || action.status),
    /** The raw server vocabulary, kept so a write can send back what it was given. */
    statusCode: String(action.statusCode || "open"),
    due: action.dueDate || action.due || "",
    /** The due date as a local calendar day, which is what a date input and the calendar use. */
    dueDateKey: actionDueDateKey(action.dueDate || action.due),
    assignedToName: action.assignedToName || "",
    assignedToUserId: action.assignedToUserId || null,
    closureNotes: action.closureNotes || "",
    closedAt: action.closedAt || null,
    /** Server-derived; see the type above. Never computed on the device. */
    lifecycleState: (action.lifecycleState || "open") as CloudActionLifecycleState,
    verified: Boolean(action.verified),
    closedWithoutVerification: Boolean(action.closedWithoutVerification),
    source: action.source || action.originalSuggestion?.source || "Cloud Sync",
    location: action.siteId || "Field record",
    findingTitle: action.category || action.originalSuggestion?.findingTitle || "Inspection Finding",
    createdAt: action.createdAt || new Date().toISOString(),
    storageSource: "cloud",
  };
}

export async function fetchCloudActions(options: { statusCode?: string; limit?: number } = {}) {
  const query = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.statusCode) query.set("statusCode", options.statusCode);
  // A READ may be retried safely -- unlike the mutations above, repeating it changes nothing.
  let response: Response;
  try {
    response = await apiFetch(
      `${API_BASE_URL}/actions?${query.toString()}`,
      { method: "GET", headers: jsonHeaders() },
      { timeoutMs: 30000, retries: 1 },
    );
  } catch {
    throw new Error("Safety InSite could not be reached, so your corrective actions could not be "
      + "loaded. This is not a sign that you have none.");
  }

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
  /**
   * §287. The TOTAL comes back too, because the server caps `limit` at 100 and a panel that shows
   * the first hundred of two hundred open actions while looking complete is worse than one that
   * says so. The surface reports the shortfall rather than hiding it.
   */
  return {
    actions: actions.map(normalizeCloudAction) as CloudAction[],
    total: Number(data?.meta?.total ?? actions.length),
  };
}

/**
 * §287 / D-051 — EDIT AN ACTION'S FIELDS.
 *
 * `dueDate` is sent as a bare `YYYY-MM-DD`, never as an instant: the server parses a bare date to
 * LOCAL midnight through the shared `parseDueDate`, and sending an instant would re-enter the §275
 * off-by-one that pair of helpers exists to close.
 *
 * Only the fields the caller passes are sent, so moving a due date cannot overwrite a title the
 * screen never displayed.
 */
export async function updateCloudAction(
  actionId: string,
  patch: {
    title?: string;
    description?: string;
    priorityCode?: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    assignedToName?: string;
  },
) {
  // NO RETRIES ON A MUTATION (inside requestActionRoute). A retried PATCH after a lost response is
  // a second write, and this route carries no idempotency key. The caller surfaces the error.
  return normalizeCloudAction(await requestActionRoute(
    `${API_BASE_URL}/actions/${encodeURIComponent(actionId)}`,
    { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(patch) },
    "this change",
  ));
}

export async function updateCloudActionStatus(actionId: string, status: string, closureNotes?: string) {
  return normalizeCloudAction(await requestActionRoute(
    `${API_BASE_URL}/actions/${encodeURIComponent(actionId)}/status`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      /**
       * §287 / D-052. This used to send
       *     closureNotes: "Closed from Safety InSite corrective action tracker."
       * on every close -- a sentence the user never wrote, stored in the field that records what
       * was actually done about the hazard, and indistinguishable afterwards from evidence they
       * did write. Closure notes are now whatever the user supplied, and nothing when they
       * supplied nothing. The direction is explicit that evidence must not be manufactured to
       * satisfy the UI, and an absent note must not be filled in.
       */
      body: JSON.stringify({
        statusCode: toBackendStatus(status),
        ...(closureNotes && closureNotes.trim() ? { closureNotes: closureNotes.trim() } : {}),
      }),
    },
    status === "Completed" ? "this closure" : "this change",
  ));
}

