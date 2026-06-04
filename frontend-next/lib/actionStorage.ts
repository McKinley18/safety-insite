import { encryptJson, decryptJson } from "./encryption";

const ACTIONS_KEY = "sentinel_encrypted_actions";

export type StoredAction = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due?: string;
  source: string;
  location?: string;
  findingTitle?: string;
  createdAt: string;
};

export async function getStoredActions(): Promise<StoredAction[]> {
  if (typeof window === "undefined") return [];

  const encrypted = window.localStorage.getItem(ACTIONS_KEY);

  return decryptJson<StoredAction[]>(encrypted, []);
}

export async function saveStoredActions(actions: StoredAction[]) {
  if (typeof window === "undefined") return;

  const encrypted = await encryptJson(actions);
  window.localStorage.setItem(ACTIONS_KEY, encrypted);
}

export function createActionId() {
  return `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
