import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import {
  CALENDAR_MIGRATED_LOCAL_IDS_KEY,
  enqueueOutbox,
  flushOutbox,
  outboxEntryToEvent,
  readCalendarCache,
  readMigratedLocalIds,
  readOutbox,
  recordMigratedLocalIds,
  removeOutboxEntry,
  updateOutboxEntry,
  writeCalendarCache,
  type CalendarOutboxEntry,
} from "@/lib/calendar/calendarOutbox";
import {
  createServerTask,
  deleteServerTask,
  readServerCalendar,
  serverEventToCalendarEvent,
  setServerTaskStatus,
  toServerPriority,
  updateServerTask,
  type ServerCalendarEvent,
} from "@/lib/calendar/serverCalendar";
import type {
  SafetyCalendarEvent,
  SafetyCalendarEventStatus,
  SafetyCalendarEventType,
  SafetyCalendarPriority,
} from "@/types/safetyCalendar";

/**
 * §276 / D-007 — ONE RECONCILED USER CALENDAR.
 *
 * ==================== THE DEFECT THIS EXISTS TO FIX ====================
 *
 * §275 drove a Pro inspection end to end, which wrote two corrective actions and two
 * follow-up tasks to the server. It then opened the Safety Calendar — whose own subtitle
 * promises "corrective actions, follow-ups, reminders, and due work in one lightweight
 * schedule" — and the page read **0 EVENTS, 0 OPEN, 0 OVERDUE** against **nine** rows on
 * the server.
 *
 * The cause was structural, not a bug in any one function: the WRITE path went to the
 * server and the READ path composed three device-local stores. `getSafetyCalendarEvents`
 * never called `GET /calendar` at all. Neither half was broken; they had simply never
 * been connected, so no amount of correct local code could have produced a right answer.
 *
 * ==================== THE RULE (D-007) ====================
 *
 * Server-persisted state is authoritative. The device may be an offline cache, a
 * pending-write queue and an optimistic presentation layer. It may NOT be an independent
 * authoritative calendar whose contents can disagree with persisted Safety InSite state.
 *
 *   server events + temporarily unsynced local events -> ONE reconciled user calendar
 *
 * After a successful synchronization the two copies collapse to one event. That is true
 * here by construction rather than by de-duplication: a synced item is REMOVED from the
 * outbox when the server accepts it, so there is never a second copy to collapse.
 *
 * ==================== WHAT THE DEVICE STILL HOLDS ====================
 *
 * `safety_insite_calendar_outbox`  items created while the server was unreachable.
 *                                  Rendered as `pending` and never as saved.
 * `safety_insite_calendar_cache`   the last successful server read, so an offline
 *                                  calendar still shows persisted work.
 *
 * The three pre-reconciliation stores are no longer calendar SOURCES. Two of them still
 * have live writers — the legacy personal-task store (`PERSONAL_CALENDAR_EVENTS_KEY`) and
 * the legacy stored-action store — so their records are migrated into the outbox once
 * each — tracked by id in
 * `safety_insite_calendar_migrated_local_ids` — and thereby onto the server. Nothing a
 * user created is dropped, and nothing is migrated twice.
 */

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
/**
 * The pre-§276 personal-task store. Exported so the one literal lives in one place: it is a
 * register-documented compatibility identifier (renaming it discards a user's calendar
 * entries), and repeating the string is how a single retained key becomes several.
 */
export const PERSONAL_CALENDAR_EVENTS_KEY = "auditally_personal_calendar_events";

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

/**
 * A `YYYY-MM-DD` key rendered the way a person reads a date.
 *
 * §275. Date KEYS are an internal storage format and were reaching the interface as-is
 * ("Add task for 2026-09-13"). Formatting goes through `parseLocalCalendarDate` rather
 * than `new Date(key)` deliberately: the latter parses a bare date string as UTC, so
 * every user west of Greenwich would be shown the PREVIOUS day.
 */
export function formatCalendarDateLabel(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" },
) {
  const parsed = parseLocalCalendarDate(dateKey);
  return parsed ? parsed.toLocaleDateString(undefined, options) : dateKey;
}

function normalizePriority(value?: string): SafetyCalendarPriority {
  if (value === "Critical" || value === "High" || value === "Low") return value;
  return "Medium";
}

function normalizeStatus(value?: string): SafetyCalendarEventStatus {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "in progress" || normalized === "in_progress" || normalized === "progress") return "In Progress";
  if (normalized === "blocked") return "Blocked";
  if (normalized === "completed" || normalized === "done" || normalized === "complete") return "Completed";
  if (normalized === "overdue") return "Overdue";

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

function isCompletedStatus(value?: string) {
  return normalizeStatus(value) === "Completed";
}

/**
 * Whether the calendar itself may edit, complete or delete this event.
 *
 * The SERVER answers this — `editable` is copied off the wire, not derived here — for the
 * same reason the Expert frontend copies `settledForUse` rather than computing it: a
 * browser that decides for itself what it is allowed to change will eventually decide
 * wrong. Work generated by an inspection is part of that inspection's record and is
 * managed from it; a pending item is the user's own and is always theirs to change.
 *
 * Replaces the pre-§276 `isPersonalCalendarEvent`, which answered the same question by
 * looking for an id prefix in a device-local store.
 */
export function isCalendarManagedEvent(
  event: Pick<SafetyCalendarEvent, "origin" | "editable"> | null | undefined,
) {
  if (!event) return false;
  if (event.origin === "pending") return true;
  return event.editable === true;
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

function getLegacyPersonalCalendarEvents(): SafetyCalendarEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PERSONAL_CALENDAR_EVENTS_KEY) || "[]",
    );

    return Array.isArray(parsed) ? (parsed as SafetyCalendarEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * Move every pre-reconciliation local record onto the outbox exactly once.
 *
 * Not a one-shot migration flag but a per-record ledger, because the legacy `/inspection`
 * route still writes `sentinel_encrypted_actions` and a one-shot flag would strand
 * anything written after it fired. Recording the id BEFORE enqueuing is deliberate: a
 * crash between the two loses one record from the calendar, where the other order would
 * duplicate it on the server, and a duplicate on a compliance record is the worse failure.
 *
 * `sentinel_company_assigned_work` is deliberately NOT migrated. Nothing in the product
 * writes it — it is a fixture of a removed feature — so promoting its contents into real
 * server rows would manufacture due work nobody scheduled.
 */
function migrateLegacyLocalRecords(storedActions: StoredAction[]) {
  if (typeof window === "undefined") return;

  const alreadyMigrated = new Set(readMigratedLocalIds());
  const queued: string[] = [];

  for (const event of getLegacyPersonalCalendarEvents()) {
    const ledgerId = `personal:${event.id}`;
    if (!event.id || alreadyMigrated.has(ledgerId)) continue;
    const parsed = parseLocalCalendarDate(event.date);
    if (!parsed) continue;
    recordMigratedLocalIds([ledgerId]);
    enqueueOutbox({
      title: event.title || "Personal safety task",
      date: toDateKey(parsed),
      priority: normalizePriority(event.priority),
      location: event.location,
      migratedFrom: "personal_task",
    });
    queued.push(ledgerId);
  }

  for (const action of storedActions) {
    const ledgerId = `action:${action.id}`;
    if (!action.id || alreadyMigrated.has(ledgerId)) continue;
    const parsed = parseLocalCalendarDate(action.due);
    if (!parsed) continue;
    recordMigratedLocalIds([ledgerId]);
    enqueueOutbox({
      title: action.title || action.findingTitle || "Corrective action",
      date: toDateKey(parsed),
      priority: normalizePriority(action.priority),
      location: action.location,
      migratedFrom: "stored_action",
    });
    queued.push(ledgerId);
  }

  return queued;
}

export type SafetyCalendarSnapshot = {
  events: SafetyCalendarEvent[];
  /** False means the authoritative calendar could not be read, NOT that it is empty. */
  serverReachable: boolean;
  /** True when the server events shown came from the cache rather than a live read. */
  servedFromCache: boolean;
  pendingCount: number;
  /** Items the server refused repeatedly. They need a person, not another retry. */
  blockedCount: number;
  reason?: "no_session" | "unreachable" | "unauthorized";
};

function sortEvents(events: SafetyCalendarEvent[]) {
  const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}

function pendingEvents(entries: CalendarOutboxEntry[]) {
  return entries.map((entry) => {
    const event = outboxEntryToEvent(entry);
    return { ...event, status: isPastDue(event.date, event.status) ? ("Overdue" as const) : event.status };
  });
}

/**
 * The reconciled calendar, and an honest account of how it was produced.
 *
 * Order matters: flush first, then read. Flushing afterwards would return a calendar that
 * omits the item the user just created even though it has now been saved, which is the
 * §275 failure in miniature.
 */
export async function getSafetyCalendarSnapshot(): Promise<SafetyCalendarSnapshot> {
  const storedActions = await getStoredActions();
  migrateLegacyLocalRecords(storedActions);

  let read = await readServerCalendar();

  if (read.reachable) {
    const flush = await flushOutbox();
    if (flush.synced > 0) {
      read = await readServerCalendar();
    }
  }

  const outbox = readOutbox();
  const blockedCount = outbox.filter((entry) => (entry.failures || 0) >= 3).length;

  if (read.reachable && read.events) {
    writeCalendarCache(read.events);
    return {
      events: sortEvents([
        ...read.events.map(serverEventToCalendarEvent),
        ...pendingEvents(outbox),
      ]),
      serverReachable: true,
      servedFromCache: false,
      pendingCount: outbox.length,
      blockedCount,
    };
  }

  // Not reachable. The cache is the last thing the server actually said, so it is still a
  // truer picture than an empty page — but it is labelled, because a stale calendar
  // presented as current is how a user misses a due date.
  const cached = readCalendarCache() as ServerCalendarEvent[];
  return {
    events: sortEvents([
      ...cached.filter((row) => row && row.date).map(serverEventToCalendarEvent),
      ...pendingEvents(outbox),
    ]),
    serverReachable: false,
    servedFromCache: cached.length > 0,
    pendingCount: outbox.length,
    blockedCount,
    reason: read.reason,
  };
}

export async function getSafetyCalendarEvents() {
  const snapshot = await getSafetyCalendarSnapshot();
  return snapshot.events;
}

/**
 * Schedule a task.
 *
 * The server is tried FIRST and the local queue is the fallback, not the other way round.
 * Writing locally and syncing later would reintroduce the window in which the device and
 * the server disagree, and it is exactly that window §275 found had become permanent.
 */
export async function createPersonalCalendarTask(input: {
  title: string;
  date: string;
  priority: SafetyCalendarPriority;
  status?: SafetyCalendarEventStatus;
  location?: string;
}): Promise<SafetyCalendarEvent> {
  const date = parseLocalCalendarDate(input.date);
  if (!date) {
    throw new Error("Choose a valid task date.");
  }

  const dateKey = toDateKey(date);
  const title = input.title.trim() || "Personal safety task";
  const priority = normalizePriority(input.priority);

  try {
    const created = await createServerTask({
      title,
      dueDate: dateKey,
      priority: toServerPriority(priority),
    });

    return {
      id: `server-task-${created.id}`,
      type: "custom",
      title,
      date: dateKey,
      owner: "You",
      location: input.location?.trim() || "Scheduled work",
      priority,
      status: isPastDue(dateKey, "Open") ? "Overdue" : "Open",
      source: "personal_task",
      sourceId: created.id,
      sourceLabel: "Task",
      createdAt: new Date().toISOString(),
      origin: "server",
      serverKind: "task",
      editable: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // A server that ANSWERED and refused is not an outage. Queuing a refused item would
    // promise the user it will sync when it never can.
    if (/refused this change \(4\d\d\)/.test(message)) {
      throw error;
    }
    const entry = enqueueOutbox({
      title,
      date: dateKey,
      priority,
      location: input.location,
    });
    const event = outboxEntryToEvent(entry);
    return { ...event, status: isPastDue(event.date, event.status) ? "Overdue" : event.status };
  }
}

function outboxRefFor(event: SafetyCalendarEvent) {
  return event.origin === "pending" ? event.clientRef || event.id : null;
}

/** Edit a calendar-managed event. Server-backed events go to the server; pending ones to the queue. */
export async function updateCalendarEvent(
  event: SafetyCalendarEvent,
  updates: { title?: string; date?: string; priority?: SafetyCalendarPriority; location?: string },
): Promise<SafetyCalendarEvent | null> {
  if (!isCalendarManagedEvent(event)) return null;

  const nextDate = updates.date ? parseLocalCalendarDate(updates.date) : parseLocalCalendarDate(event.date);
  if (!nextDate) throw new Error("Choose a valid task date.");
  const dateKey = toDateKey(nextDate);
  const title = (updates.title ?? event.title).trim() || "Personal safety task";
  const priority = normalizePriority(updates.priority ?? event.priority);

  const ref = outboxRefFor(event);
  if (ref) {
    const updated = updateOutboxEntry(ref, {
      title,
      date: dateKey,
      priority,
      location: updates.location ?? event.location,
    });
    return updated ? outboxEntryToEvent(updated) : null;
  }

  if (event.serverKind !== "task") return null;

  await updateServerTask(event.sourceId, {
    title,
    dueDate: dateKey,
    priority: toServerPriority(priority),
  });

  return {
    ...event,
    title,
    date: dateKey,
    priority,
    location: updates.location ?? event.location,
    status: isPastDue(dateKey, event.status === "Overdue" ? "Open" : event.status)
      ? "Overdue"
      : event.status === "Overdue"
        ? "Open"
        : event.status,
  };
}

export async function completeCalendarEvent(event: SafetyCalendarEvent): Promise<SafetyCalendarEvent | null> {
  if (!isCalendarManagedEvent(event)) return null;

  const ref = outboxRefFor(event);
  if (ref) {
    // A pending item has no server row to complete. Completing it locally and syncing it
    // later would create an OPEN row on the server and then need a second write to close
    // it; the honest answer is that it cannot be completed until it is saved.
    throw new Error("This task has not been saved to your account yet. It will sync when you are back online.");
  }

  if (event.serverKind !== "task") return null;
  await setServerTaskStatus(event.sourceId, "completed");
  return { ...event, status: "Completed", completedAt: new Date().toISOString() };
}

export async function reopenCalendarEvent(event: SafetyCalendarEvent): Promise<SafetyCalendarEvent | null> {
  if (!isCalendarManagedEvent(event)) return null;
  if (outboxRefFor(event)) return null;
  if (event.serverKind !== "task") return null;
  await setServerTaskStatus(event.sourceId, "open");
  return {
    ...event,
    status: isPastDue(event.date, "Open") ? "Overdue" : "Open",
    completedAt: undefined,
  };
}

export async function deleteCalendarEvent(event: SafetyCalendarEvent): Promise<boolean> {
  if (!isCalendarManagedEvent(event)) return false;

  const ref = outboxRefFor(event);
  if (ref) return removeOutboxEntry(ref);

  if (event.serverKind !== "task") return false;
  await deleteServerTask(event.sourceId);
  return true;
}

/** Delete every completed task the calendar is allowed to manage. Returns how many went. */
export async function clearCompletedCalendarEvents(events: SafetyCalendarEvent[]): Promise<number> {
  const completed = events.filter(
    (event) => isCalendarManagedEvent(event) && isCompletedStatus(event.status) && event.origin === "server",
  );

  let removed = 0;
  for (const event of completed) {
    try {
      await deleteServerTask(event.sourceId);
      removed += 1;
    } catch {
      /* One refusal must not abandon the rest. */
    }
  }
  return removed;
}

/**
 * Pre-§276 company-assignment fixtures, kept only so a surface that still wants to show
 * them can, clearly separated from the reconciled calendar. Nothing writes this store.
 */
export function getLegacyCompanyAssignedWork(): SafetyCalendarEvent[] {
  return getCompanyAssignedWork()
    .map((item): SafetyCalendarEvent | null => {
      const due = parseLocalCalendarDate(item.dueDate);
      if (!due) return null;
      const dateKey = toDateKey(due);
      const status = normalizeStatus(item.status);
      return {
        id: `company-${item.id}`,
        type: normalizeType(item.type),
        title: item.title || item.type || "Assigned safety work",
        date: dateKey,
        owner: item.owner || "Unassigned",
        location: item.location || "Unassigned location",
        priority: normalizePriority(item.priority),
        status: isPastDue(dateKey, status) ? ("Overdue" as const) : status,
        source: "company_assignment" as const,
        sourceId: item.id,
        sourceLabel: item.type || "Company Assignment",
        findingTitle: item.findingTitle,
        createdAt: item.createdAt,
        origin: "local" as const,
        editable: false,
      };
    })
    .filter((event): event is SafetyCalendarEvent => Boolean(event));
}

export { CALENDAR_MIGRATED_LOCAL_IDS_KEY };
