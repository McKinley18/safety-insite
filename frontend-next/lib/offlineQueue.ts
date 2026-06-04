const OFFLINE_QUEUE_KEY = "sentinel_offline_queue_v1";

export type OfflineQueueItem = {
  id: string;
  type: "report_save" | "api_request";
  createdAt: string;
  status: "pending" | "failed" | "synced";
  payload: any;
  lastError?: string;
};

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setOfflineQueue(items: OfflineQueueItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueOfflineItem(item: Omit<OfflineQueueItem, "id" | "createdAt" | "status">) {
  const existing = await getOfflineQueue();

  const next: OfflineQueueItem = {
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    ...item,
  };

  await setOfflineQueue([next, ...existing]);
  return next;
}

export async function getPendingOfflineQueueCount() {
  const items = await getOfflineQueue();
  return items.filter((item) => item.status === "pending" || item.status === "failed").length;
}

export async function clearOfflineQueue() {
  await setOfflineQueue([]);
}
