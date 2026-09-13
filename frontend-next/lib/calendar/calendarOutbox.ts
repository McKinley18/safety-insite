import type { SafetyCalendarEvent, SafetyCalendarPriority } from "@/types/safetyCalendar";
import { createServerTask, toServerPriority } from "./serverCalendar";

/**
 * §276 / D-007 — THE PENDING-WRITE QUEUE.
 *
 * D-007 permits the device to be an offline cache, a pending-write queue and an
 * optimistic presentation layer. It forbids the device being a second authoritative
 * calendar. This module is the queue, and it is deliberately the ONLY place a calendar
 * item may exist without a server row behind it.
 *
 * An entry leaves the queue when — and only when — the server has accepted it and
 * returned an id. That is what makes "collapse to ONE event after synchronization" true
 * by construction rather than by de-duplication guesswork: a synced item is not in the
 * queue at all, so there is nothing left to duplicate it with.
 */

export const CALENDAR_OUTBOX_KEY = "safety_insite_calendar_outbox";
export const CALENDAR_CACHE_KEY = "safety_insite_calendar_cache";
export const CALENDAR_MIGRATED_LOCAL_IDS_KEY = "safety_insite_calendar_migrated_local_ids";

export type CalendarOutboxEntry = {
  clientRef: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string;
  priority: SafetyCalendarPriority;
  location?: string;
  description?: string;
  createdAt: string;
  /**
   * How many times flushing this entry has been refused by a REACHABLE server. A refusal
   * is not a network failure: the entry is malformed or not permitted, and retrying it
   * forever would make the calendar permanently wrong while claiming to be syncing.
   */
  failures?: number;
  lastError?: string;
  /** Set when the entry came from a pre-reconciliation device store rather than a new action. */
  migratedFrom?: "personal_task" | "stored_action";
};

/** A refused-by-the-server entry stops being retried after this many attempts and says so. */
export const OUTBOX_MAX_FAILURES = 3;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* A full or unavailable store must not take the calendar down. */
  }
}

export function readOutbox(): CalendarOutboxEntry[] {
  const entries = readJson<CalendarOutboxEntry[]>(CALENDAR_OUTBOX_KEY, []);
  return Array.isArray(entries) ? entries.filter((entry) => entry && entry.clientRef && entry.date) : [];
}

export function writeOutbox(entries: CalendarOutboxEntry[]) {
  writeJson(CALENDAR_OUTBOX_KEY, entries);
}

export function enqueueOutbox(entry: Omit<CalendarOutboxEntry, "clientRef" | "createdAt"> & { clientRef?: string }) {
  const full: CalendarOutboxEntry = {
    clientRef: entry.clientRef || `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  writeOutbox([...readOutbox(), full]);
  return full;
}

export function updateOutboxEntry(clientRef: string, patch: Partial<CalendarOutboxEntry>) {
  const entries = readOutbox();
  const index = entries.findIndex((entry) => entry.clientRef === clientRef);
  if (index === -1) return null;
  const next = { ...entries[index], ...patch, clientRef };
  entries[index] = next;
  writeOutbox(entries);
  return next;
}

export function removeOutboxEntry(clientRef: string) {
  const entries = readOutbox();
  const next = entries.filter((entry) => entry.clientRef !== clientRef);
  if (next.length === entries.length) return false;
  writeOutbox(next);
  return true;
}

export function outboxEntryToEvent(entry: CalendarOutboxEntry): SafetyCalendarEvent {
  const blocked = (entry.failures || 0) >= OUTBOX_MAX_FAILURES;

  return {
    id: entry.clientRef,
    type: "custom",
    title: entry.title || "Task",
    date: entry.date,
    owner: "You",
    location: entry.location?.trim() || "Not synced yet",
    priority: entry.priority,
    // A pending item is genuinely open work. Overdue is still derived from its date by
    // the reconciler, so a pending item that is late is not quietly presented as on time.
    status: "Open",
    source: "personal_task",
    sourceId: entry.clientRef,
    sourceLabel: blocked ? "Not saved — needs attention" : "Pending sync",
    createdAt: entry.createdAt,
    origin: "pending",
    editable: true,
    clientRef: entry.clientRef,
  };
}

export type OutboxFlushResult = {
  attempted: number;
  synced: number;
  stillPending: number;
  blocked: number;
};

/**
 * Push every queued item at the server, oldest first.
 *
 * A refusal (the server answered and said no) increments the entry's failure count; a
 * transport failure does not, because the entry is still perfectly good and the network
 * is not. The two are told apart by whether the error carries a status — `createServerTask`
 * throws a message built from the response body when the server answered.
 */
export async function flushOutbox(): Promise<OutboxFlushResult> {
  const entries = readOutbox();
  if (!entries.length) return { attempted: 0, synced: 0, stillPending: 0, blocked: 0 };

  let synced = 0;
  let blocked = 0;

  for (const entry of entries) {
    if ((entry.failures || 0) >= OUTBOX_MAX_FAILURES) {
      blocked += 1;
      continue;
    }

    try {
      await createServerTask({
        title: entry.title,
        dueDate: entry.date,
        priority: toServerPriority(entry.priority),
        ...(entry.description ? { description: entry.description } : {}),
      });
      removeOutboxEntry(entry.clientRef);
      synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed.";
      const refused = /refused this change \(\d+\)/.test(message) || /must be|should not|Unauthorized/i.test(message);
      if (refused) {
        const failures = (entry.failures || 0) + 1;
        updateOutboxEntry(entry.clientRef, { failures, lastError: message });
        if (failures >= OUTBOX_MAX_FAILURES) blocked += 1;
      } else {
        // Transport. Stop the pass: the rest will fail the same way, and hammering the
        // queue against a down server turns one outage into N timeouts.
        break;
      }
    }
  }

  const remaining = readOutbox();
  return {
    attempted: entries.length,
    synced,
    stillPending: remaining.length,
    blocked,
  };
}

/** The last successful server read, so an offline calendar still shows persisted work. */
export function readCalendarCache(): unknown[] {
  const cached = readJson<unknown[]>(CALENDAR_CACHE_KEY, []);
  return Array.isArray(cached) ? cached : [];
}

export function writeCalendarCache(rows: unknown[]) {
  writeJson(CALENDAR_CACHE_KEY, rows);
}

export function readMigratedLocalIds(): string[] {
  const ids = readJson<string[]>(CALENDAR_MIGRATED_LOCAL_IDS_KEY, []);
  return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
}

export function recordMigratedLocalIds(ids: string[]) {
  if (!ids.length) return;
  const existing = new Set(readMigratedLocalIds());
  ids.forEach((id) => existing.add(id));
  writeJson(CALENDAR_MIGRATED_LOCAL_IDS_KEY, Array.from(existing));
}
