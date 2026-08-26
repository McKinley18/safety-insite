export type ThemePreference = "light" | "dark";

export const THEME_STORAGE_KEY = "safety_insite_theme";
export const LEGACY_DARK_MODE_KEY = "sentinel_dark_mode";
export const LEGACY_THEME_VERSION_KEY = "sentinel_theme_version";

/**
 * Routes that always render on the fixed light brand palette, whatever the
 * signed-in theme preference is: the public account journey, the marketing pages,
 * and /upgrade (which renders the same fixed-light PricingContent as /pricing).
 *
 * This list is the single source of truth. It previously existed as three
 * independent copies -- in `AppShell`, in `ThemeController`, and as a literal array
 * inside the pre-paint script in `app/layout.tsx` -- and they drifted: /upgrade was
 * pinned by two of the three, so `<html>` resolved to light while
 * `applyThemeToDocument` still stamped `dark` on `<body>`, leaving a light card on a
 * dark page background. Anything that pins the palette must read it from here.
 */
export const FIXED_LIGHT_THEME_ROUTES = [
  "/login",
  "/register",
  "/create-account",
  "/forgot-password",
  "/reset-password",
  "/unlock",
  "/about",
  "/legal",
  "/security",
  "/hazlenz",
  "/pricing",
  "/upgrade",
] as const;

export function usesFixedLightTheme(pathname: string) {
  return (
    pathname === "/" ||
    FIXED_LIGHT_THEME_ROUTES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export const themePreferenceLabels: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
};

export const themeClasses = {
  page:
    "bg-slate-50 text-slate-950 dark:bg-[#07111F] dark:text-white",
  pageShell: "sentinel-page-shell",
  panel: "app-card",
  panelMuted: "app-surface-muted",
  panelStrong: "app-surface-strong",
  panelSoft: "app-surface",
  sectionTitle: "text-slate-950 dark:text-white",
  sectionSubtitle: "text-slate-700 dark:text-slate-200",
  textPrimary: "text-slate-950 dark:text-white",
  textSecondary: "text-slate-700 dark:text-slate-200",
  textMuted: "text-slate-600 dark:text-slate-300",
  textInverse: "text-white",
  border: "border-slate-200 dark:border-white/10",
  borderStrong: "border-slate-300 dark:border-white/15",
  brand: "text-[#1D72B8] dark:text-[#5DB7FF]",
  brandSoft:
    "bg-[#E8F4FF] text-[#102A43] dark:bg-[#102A43] dark:text-slate-100",
  brandBackground:
    "bg-[#1D72B8] text-white dark:bg-[#5DB7FF] dark:text-[#07111F]",
  subtleBackground:
    "bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
  elevatedBackground:
    "bg-white text-slate-950 dark:bg-[#102A43] dark:text-white",
  mutedBackground:
    "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100",
  pageBackground:
    "bg-slate-50 text-slate-950 dark:bg-[#07111F] dark:text-white",
} as const;

export function readThemePreferenceFromStorage(storage: Storage | null): ThemePreference {
  if (!storage) return "light";

  const stored = storage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const legacyDarkMode = storage.getItem(LEGACY_DARK_MODE_KEY);
  if (legacyDarkMode === "true") return "dark";
  if (legacyDarkMode === "false") return "light";

  return "light";
}

export function resolveThemePreference(preference: ThemePreference) {
  return preference === "dark";
}

export function applyThemeToDocument(theme: ThemePreference | null) {
  if (typeof document === "undefined") return false;

  const resolvedTheme: ThemePreference = theme === "dark" ? "dark" : "light";
  const shouldUseDark = resolvedTheme === "dark";
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
  document.body.classList.remove("light", "dark");
  document.body.classList.add(resolvedTheme);
  document.body.style.colorScheme = resolvedTheme;

  const themeColor = resolvedTheme === "dark" ? "#07111F" : "#F3F7FB";
  const metaSelectors = [
    'meta[name="theme-color"]',
    'meta[name="msapplication-TileColor"]',
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  ];
  for (const selector of metaSelectors) {
    const element = document.querySelector<HTMLMetaElement>(selector);
    if (!element) continue;
    element.setAttribute("content", selector.includes("apple-mobile") ? (shouldUseDark ? "black-translucent" : "default") : themeColor);
  }
  return shouldUseDark;
}
