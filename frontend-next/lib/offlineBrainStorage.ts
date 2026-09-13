const BRAIN_BUNDLE_STORAGE_KEY = "sentinel_safescope_brain_bundle_v1";
const BRAIN_BUNDLE_META_KEY = "sentinel_safescope_brain_bundle_meta_v1";

export type HazLenzOfflineBrainBundle = {
  version: string;
  generatedAt: string;
  source?: string;
  approvedOnly?: boolean;
  safetyGate?: string;
  documents: any[];
  chunks: any[];
  indexes?: {
    hazards?: Record<string, string[]>;
    standards?: Record<string, string[]>;
    equipment?: Record<string, string[]>;
  };
};

export function saveOfflineBrainBundle(bundle: HazLenzOfflineBrainBundle) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(BRAIN_BUNDLE_STORAGE_KEY, JSON.stringify(bundle));

  window.localStorage.setItem(
    BRAIN_BUNDLE_META_KEY,
    JSON.stringify({
      version: bundle.version,
      generatedAt: bundle.generatedAt,
      savedAt: new Date().toISOString(),
      documents: bundle.documents?.length || 0,
      chunks: bundle.chunks?.length || 0,
      approvedOnly: bundle.approvedOnly === true,
    }),
  );
}

export function loadOfflineBrainBundle(): HazLenzOfflineBrainBundle | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(BRAIN_BUNDLE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.chunks)) return null;
    if (parsed.approvedOnly !== true) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function getOfflineBrainBundleMeta() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(BRAIN_BUNDLE_META_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearOfflineBrainBundle() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(BRAIN_BUNDLE_STORAGE_KEY);
  window.localStorage.removeItem(BRAIN_BUNDLE_META_KEY);
}
