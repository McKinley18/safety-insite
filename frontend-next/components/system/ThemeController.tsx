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

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function setThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  window.localStorage.removeItem(LEGACY_DARK_MODE_KEY);
  window.localStorage.removeItem(LEGACY_THEME_VERSION_KEY);
  applyThemeToDocument(preference, getSystemPrefersDark());
  window.dispatchEvent(
    new CustomEvent("safety-insite-themechange", { detail: { preference } }),
  );
}

export default function ThemeController() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyStoredPreference = () => {
      const preference = readThemePreferenceFromStorage(window.localStorage);
      applyThemeToDocument(preference, getSystemPrefersDark());
    };

    applyStoredPreference();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const preference = readThemePreferenceFromStorage(window.localStorage);
      applyThemeToDocument(preference, getSystemPrefersDark());
    };

    media?.addEventListener?.("change", handleMediaChange);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === LEGACY_DARK_MODE_KEY) {
        applyStoredPreference();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      media?.removeEventListener?.("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
