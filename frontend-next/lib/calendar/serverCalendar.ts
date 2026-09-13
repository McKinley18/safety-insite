import { authHeaders, getAuthToken } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/lib/hazlenzClient";
import type {
  SafetyCalendarEvent,
  SafetyCalendarEventStatus,
  SafetyCalendarEventType,
  SafetyCalendarPriority,
} from "@/types/safetyCalendar";

/**
 * §276 / D-007 — THE SERVER-BACKED CALENDAR READ PATH.
 *
 * ==================== WHAT THIS EXISTS TO FIX ====================
 *
 * §275 measured nine pieces of persisted due work on the server — including the two
 * corrective actions the inspection had just created — against **0 EVENTS, 0 OPEN,
 * 0 OVERDUE** on the Safety Calendar. The write path was server-side; the read path was
 * three device-local stores; the two never met.
 *
 * D-007 settles the authority question: server-persisted state is authoritative. The
 * device may cache it, queue writes for it and present optimistically — it may not be a
 * second calendar whose contents can disagree with it.
 *
 * This module is the server half. `lib/safetyCalendar.ts` reconciles it with the local
 * outbox and cache.
 */

/** The wire shape of `GET /calendar`, one row per piece of dated, uncancelled due work. */
export type ServerCalendarEvent = {
  kind: "task" | "corrective_action";
  sourceId: string;
  /** `YYYY-MM-DD`, already projected onto the local calendar day by the server. */
  date: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  owner: string | null;
  inspectionId: string | null;
  correctiveActionId: string | null;
  findingId: string | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  version: number | null;
  /** Whether the calendar itself may edit or delete this row. Inspection work is not. */
  editable: boolean;
};

export type ServerCalendarRead =
  | { reachable: true; events: ServerCalendarEvent[] }
  /**
   * The server was not reached, or the session is not usable. Deliberately distinct from
   * an empty result: "the server says you have nothing" and "we could not ask" must not
   * render the same, because the second one is what §275's zero-event calendar looked
   * like from the inside.
   */
  | { reachable: false; events: null; reason: "no_session" | "unreachable" | "unauthorized" };

function normalizePriority(value: string | null | undefined): SafetyCalendarPriority {
  switch (String(value || "").toLowerCase()) {
    case "urgent":
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "low":
      return "Low";
    default:
      return "Medium";
  }
}

function normalizeStatus(value: string | null | undefined): SafetyCalendarEventStatus {
  switch (String(value || "").toLowerCase().replace(/\s+/g, "_")) {
    case "completed":
    case "closed":
    case "done":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "scheduled":
      return "Scheduled";
    default:
      return "Open";
  }
}

function todayDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Overdue is derived, never stored.
 *
 * The server records what a row IS — open, completed, cancelled. Whether an open row is
 * late is a function of the day the reader is looking at it on, so it is computed here
 * against the local day rather than persisted and allowed to go stale.
 */
function withOverdue(dateKey: string, status: SafetyCalendarEventStatus): SafetyCalendarEventStatus {
  if (status === "Completed") return status;
  return dateKey < todayDateKey() ? "Overdue" : status;
}

function eventType(row: ServerCalendarEvent): SafetyCalendarEventType {
  if (row.kind === "corrective_action") return "corrective_action";
  // A task bound to a corrective action or an inspection is follow-up on that record.
  if (row.correctiveActionId || row.inspectionId) return "follow_up";
  return "custom";
}

/**
 * A stable identity for a server row, used as the calendar event id AND as the key the
 * local outbox records once its write is accepted. One row, one id, on both sides — that
 * is what makes "collapse to ONE event after sync" a lookup rather than a heuristic.
 */
export function serverEventId(kind: ServerCalendarEvent["kind"], sourceId: string) {
  return `server-${kind === "task" ? "task" : "action"}-${sourceId}`;
}

export function serverEventToCalendarEvent(row: ServerCalendarEvent): SafetyCalendarEvent {
  const status = withOverdue(row.date, normalizeStatus(row.status));

  return {
    id: serverEventId(row.kind, row.sourceId),
    type: eventType(row),
    title: row.title || (row.kind === "task" ? "Task" : "Corrective action"),
    date: row.date,
    owner: row.owner || "Unassigned",
    location: row.inspectionId ? "Field inspection" : "Scheduled work",
    priority: normalizePriority(row.priority),
    status,
    source: row.kind === "corrective_action" ? "corrective_action" : "personal_task",
    sourceId: row.sourceId,
    sourceLabel: row.kind === "corrective_action" ? "Corrective Action" : "Task",
    createdAt: row.createdAt || undefined,
    completedAt: row.completedAt || undefined,
    origin: "server",
    serverKind: row.kind,
    editable: row.editable,
    inspectionId: row.inspectionId || undefined,
  };
}

/**
 * Read the authoritative calendar.
 *
 * Never throws. A calendar that cannot reach its server has to render something, and the
 * caller needs to know WHICH of "nothing is due" and "we could not ask" it is looking at,
 * so both outcomes come back as data.
 */
export async function readServerCalendar(): Promise<ServerCalendarRead> {
  if (typeof window === "undefined") {
    return { reachable: false, events: null, reason: "no_session" };
  }
  if (!getAuthToken()) {
    return { reachable: false, events: null, reason: "no_session" };
  }

  try {
    const response = await apiFetch(`${API_BASE_URL}/calendar`, { headers: authHeaders() });
    if (response.status === 401 || response.status === 403) {
      return { reachable: false, events: null, reason: "unauthorized" };
    }
    if (!response.ok) {
      return { reachable: false, events: null, reason: "unreachable" };
    }
    const body = await response.json();
    if (!Array.isArray(body)) {
      return { reachable: false, events: null, reason: "unreachable" };
    }
    return { reachable: true, events: body as ServerCalendarEvent[] };
  } catch {
    return { reachable: false, events: null, reason: "unreachable" };
  }
}

async function mutate(path: string, init: RequestInit) {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
  }, { retries: 0 });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new Error(message || `The server refused this change (${response.status}).`);
  }

  return response.json().catch(() => ({}));
}

export async function createServerTask(input: {
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  description?: string;
}) {
  return mutate("/tasks", { method: "POST", body: JSON.stringify(input) }) as Promise<{ id: string }>;
}

export async function updateServerTask(
  id: string,
  patch: { title?: string; dueDate?: string; priority?: "low" | "medium" | "high" | "urgent"; description?: string },
) {
  return mutate(`/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function setServerTaskStatus(id: string, status: "open" | "completed" | "cancelled") {
  return mutate(`/tasks/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteServerTask(id: string) {
  return mutate(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** The product's priority vocabulary is title case; the server's is lower case. */
export function toServerPriority(value: SafetyCalendarPriority): "low" | "medium" | "high" | "urgent" {
  if (value === "Critical") return "urgent";
  if (value === "High") return "high";
  if (value === "Low") return "low";
  return "medium";
}
