"use client";

import { useEffect } from "react";
import {
  applyThemeToDocument,
  readThemePreferenceFromStorage,
  THEME_STORAGE_KEY,
  LEGACY_DARK_MODE_KEY,
  LEGACY_THEME_VERSION_KEY,
  type ThemePreference,
} from "@/lib/theme";

export function setThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") return;

  const normalizedPreference: ThemePreference = preference === "dark" ? "dark" : "light";
  window.localStorage.setItem(THEME_STORAGE_KEY, normalizedPreference);
  window.localStorage.removeItem(LEGACY_DARK_MODE_KEY);
  window.localStorage.removeItem(LEGACY_THEME_VERSION_KEY);
  applyThemeToDocument(normalizedPreference);
  window.dispatchEvent(
    new CustomEvent("safety-insite-themechange", { detail: { preference: normalizedPreference } }),
  );
}

export default function ThemeController() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyStoredPreference = () => {
      const preference = readThemePreferenceFromStorage(window.localStorage);
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      window.localStorage.removeItem(LEGACY_DARK_MODE_KEY);
      window.localStorage.removeItem(LEGACY_THEME_VERSION_KEY);
      applyThemeToDocument(preference);
    };

    applyStoredPreference();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === LEGACY_DARK_MODE_KEY) {
        applyStoredPreference();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
