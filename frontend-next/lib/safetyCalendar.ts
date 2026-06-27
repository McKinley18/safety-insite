import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import type {
  SafetyCalendarEvent,
  SafetyCalendarEventStatus,
  SafetyCalendarEventType,
  SafetyCalendarPriority,
} from "@/types/safetyCalendar";

type CompanyAssignedWork = {
  id: string;
  type?: string;
  title?: string;
  owner?: string;
  location?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
  findingTitle?: string;
};

const COMPANY_ASSIGNED_WORK_KEY = "sentinel_company_assigned_work";
const PERSONAL_CALENDAR_EVENTS_KEY = "auditally_personal_calendar_events";

export function parseLocalCalendarDate(value?: string) {
  if (!value || value === "No due date" || value === "Not set") return null;

  const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return toDateKey(new Date());
}

function normalizePriority(value?: string): SafetyCalendarPriority {
  if (value === "Critical" || value === "High" || value === "Low") return value;
  return "Medium";
}

function normalizeStatus(value?: string): SafetyCalendarEventStatus {
  if (
    value === "Scheduled" ||
    value === "In Progress" ||
    value === "Blocked" ||
    value === "Completed" ||
    value === "Overdue"
  ) {
    return value;
  }

  return "Open";
}

function normalizeType(value?: string): SafetyCalendarEventType {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("inspection follow")) return "follow_up";
  if (normalized.includes("inspection")) return "inspection";
  if (normalized.includes("supervisor") || normalized.includes("review")) {
    return "supervisor_review";
  }
  if (normalized.includes("corrective")) return "corrective_action";

  return "custom";
}

function isPastDue(dateKey: string, status: SafetyCalendarEventStatus) {
  if (status === "Completed") return false;
  return dateKey < getTodayDateKey();
}

function getPersonalCalendarEventIds() {
  return new Set(
    getPersonalCalendarEvents()
      .flatMap((event) => [event.id, event.sourceId])
      .filter((value): value is string => Boolean(value)),
  );
}

export function isPersonalCalendarEvent(
  event: Pick<SafetyCalendarEvent, "id" | "source" | "sourceId">,
) {
  if (!event) return false;

  if (event.source === "personal_task") return true;

  if (String(event.id || "").startsWith("personal-")) return true;
  if (String(event.sourceId || "").startsWith("personal-")) return true;

  if (typeof window === "undefined") return false;

  const personalEventIds = getPersonalCalendarEventIds();
  return personalEventIds.has(event.id) || personalEventIds.has(event.sourceId);
}

function normalizePersonalCalendarEvent(
  event: SafetyCalendarEvent,
): SafetyCalendarEvent {
  const date = parseLocalCalendarDate(event.date);
  const dateKey = date ? toDateKey(date) : event.date || getTodayDateKey();
  const status = normalizeStatus(event.status);

  return {
    ...event,
    id: event.id || `personal-${Date.now()}`,
    type: event.type || "custom",
    title: event.title?.trim() || "Personal safety task",
    date: dateKey,
    owner: event.owner?.trim() || "Current user",
    location: event.location?.trim() || "Personal task",
    priority: normalizePriority(event.priority),
    status: isPastDue(dateKey, status) ? "Overdue" : status,
    source: "personal_task",
    sourceId: event.sourceId || event.id || `personal-${Date.now()}`,
    sourceLabel: event.sourceLabel || "Personal Task",
    createdAt: event.createdAt || new Date().toISOString(),
  };
}

function getCompanyAssignedWork(): CompanyAssignedWork[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(COMPANY_ASSIGNED_WORK_KEY) || "[]",
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getPersonalCalendarEvents(): SafetyCalendarEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PERSONAL_CALENDAR_EVENTS_KEY) || "[]",
    );

    return Array.isArray(parsed)
      ? parsed.map((event) => normalizePersonalCalendarEvent(event))
      : [];
  } catch {
    return [];
  }
}

export function savePersonalCalendarEvents(events: SafetyCalendarEvent[]) {
  if (typeof window === "undefined") return;
  const normalized = events.map((event) => normalizePersonalCalendarEvent(event));
  window.localStorage.setItem(PERSONAL_CALENDAR_EVENTS_KEY, JSON.stringify(normalized));
}

export function deletePersonalCalendarEvent(eventId: string) {
  if (typeof window === "undefined") return false;

  const current = getPersonalCalendarEvents();
  const next = current.filter((event) => !isPersonalCalendarEvent(event) || event.id !== eventId);

  if (next.length === current.length) return false;

  savePersonalCalendarEvents(next);
  return true;
}

export function updatePersonalCalendarEvent(
  eventId: string,
  updates: Partial<SafetyCalendarEvent>,
): SafetyCalendarEvent | null {
  if (typeof window === "undefined") return null;

  const current = getPersonalCalendarEvents();
  const index = current.findIndex(
    (event) => isPersonalCalendarEvent(event) && event.id === eventId,
  );

  if (index === -1) return null;

  const existing = current[index];
  const updated = normalizePersonalCalendarEvent({
    ...existing,
    ...updates,
    id: existing.id,
    source: "personal_task",
    sourceId: existing.sourceId || existing.id,
    sourceLabel: existing.sourceLabel || "Personal Task",
  });

  const next = [...current];
  next[index] = updated;
  savePersonalCalendarEvents(next);
  return updated;
}

export function completePersonalCalendarEvent(eventId: string): SafetyCalendarEvent | null {
  return updatePersonalCalendarEvent(eventId, { status: "Completed" });
}

export function reopenPersonalCalendarEvent(eventId: string): SafetyCalendarEvent | null {
  return updatePersonalCalendarEvent(eventId, { status: "Open" });
}

export function createPersonalCalendarTask(input: {
  title: string;
  date: string;
  priority: SafetyCalendarPriority;
  status?: SafetyCalendarEventStatus;
  location?: string;
}) {
  const date = parseLocalCalendarDate(input.date);
  if (!date) {
    throw new Error("Choose a valid task date.");
  }

  const dateKey = toDateKey(date);
  const status = normalizeStatus(input.status || "Open");

  const task: SafetyCalendarEvent = {
    id: `personal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "custom",
    title: input.title.trim() || "Personal safety task",
    date: dateKey,
    owner: "Current user",
    location: input.location?.trim() || "Personal task",
    priority: normalizePriority(input.priority),
    status: isPastDue(dateKey, status) ? "Overdue" : status,
    source: "personal_task",
    sourceId: `personal-${Date.now()}`,
    sourceLabel: "Personal Task",
    createdAt: new Date().toISOString(),
  };

  const next = [normalizePersonalCalendarEvent(task), ...getPersonalCalendarEvents()];
  savePersonalCalendarEvents(next);
  return normalizePersonalCalendarEvent(task);
}

function companyAssignmentToCalendarEvent(
  item: CompanyAssignedWork,
): SafetyCalendarEvent | null {
  const due = parseLocalCalendarDate(item.dueDate);
  if (!due) return null;

  const dateKey = toDateKey(due);
  const status = normalizeStatus(item.status);
  const type = normalizeType(item.type);

  return {
    id: `company-${item.id}`,
    type,
    title: item.title || item.type || "Assigned safety work",
    date: dateKey,
    owner: item.owner || "Unassigned",
    location: item.location || "Unassigned location",
    priority: normalizePriority(item.priority),
    status: isPastDue(dateKey, status) ? "Overdue" : status,
    source: "company_assignment",
    sourceId: item.id,
    sourceLabel: item.type || "Company Assignment",
    findingTitle: item.findingTitle,
    createdAt: item.createdAt,
  };
}

function storedActionToCalendarEvent(
  action: StoredAction,
): SafetyCalendarEvent | null {
  const due = parseLocalCalendarDate(action.due);
  if (!due) return null;

  const dateKey = toDateKey(due);
  const status = normalizeStatus(action.status);

  return {
    id: `action-${action.id}`,
    type: "corrective_action",
    title: action.title || action.findingTitle || "Corrective action",
    date: dateKey,
    owner: action.owner || action.assignedTo || "Unassigned",
    location: action.location || "Field Inspection",
    priority: normalizePriority(action.priority),
    status: isPastDue(dateKey, status) ? "Overdue" : status,
    source: "corrective_action",
    sourceId: action.id,
    sourceLabel: action.source || "Corrective Action",
    findingTitle: action.findingTitle,
    createdAt: action.createdAt,
  };
}

export async function getSafetyCalendarEvents() {
  const manualAssignments = getCompanyAssignedWork()
    .map(companyAssignmentToCalendarEvent)
    .filter(Boolean) as SafetyCalendarEvent[];

  const storedActions = await getStoredActions();

  const actionEvents = storedActions
    .map(storedActionToCalendarEvent)
    .filter((event): event is SafetyCalendarEvent => Boolean(event))
    .filter(
      (actionEvent) =>
        !manualAssignments.some(
          (manualEvent) => manualEvent.id === `company-action-${actionEvent.sourceId}`,
        ),
    );

  const personalEvents = getPersonalCalendarEvents();

  return [...personalEvents, ...manualAssignments, ...actionEvents].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);

    const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}
