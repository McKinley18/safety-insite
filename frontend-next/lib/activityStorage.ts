import { decryptJson, encryptJson } from "./encryption";

const ACTIVITY_KEY = "sentinel_encrypted_activity";

export type ActivityEvent = {
  id: string;
  type: string;
  title: string;
  detail?: string;
  createdAt: string;
};

export async function getActivityEvents(): Promise<ActivityEvent[]> {
  if (typeof window === "undefined") return [];

  const encrypted = window.localStorage.getItem(ACTIVITY_KEY);
  return decryptJson<ActivityEvent[]>(encrypted, []);
}

export async function saveActivityEvents(events: ActivityEvent[]) {
  if (typeof window === "undefined") return;

  const encrypted = await encryptJson(events);
  window.localStorage.setItem(ACTIVITY_KEY, encrypted);
}

export async function addActivityEvent(event: Omit<ActivityEvent, "id" | "createdAt">) {
  const existing = await getActivityEvents();

  const nextEvent: ActivityEvent = {
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...event,
  };

  await saveActivityEvents([nextEvent, ...existing].slice(0, 100));

  return nextEvent;
}
