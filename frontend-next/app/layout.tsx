import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ClientCacheCleanup from "@/components/system/ClientCacheCleanup";
import ServiceWorkerRegistrar from "@/components/system/ServiceWorkerRegistrar";
import ThemeController from "@/components/system/ThemeController";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { FIXED_LIGHT_THEME_ROUTES } from "@/lib/theme";

// Resolves the theme and stamps it on <html> BEFORE the browser paints.
//
// This must stay a plain synchronous inline <script> in <head>. It was previously a
// `next/script` with strategy="beforeInteractive", which in the App Router does not emit a
// render-blocking script for inline children -- it serialises them into Next's deferred
// `self.__next_s` queue, which only runs once the client runtime boots. The server-rendered
// markup is necessarily `class="light"` (the server cannot know a given user's stored choice),
// so a dark-mode user painted a light screen first and only flipped to dark after hydration:
// measured first paint rgb(241,245,249) -> settled rgb(7,17,31).
// The pinned-light route list is interpolated from lib/theme rather than repeated
// here. This script runs before paint and cannot import at runtime, but it is built
// at module scope, so the array is serialised from the single source of truth --
// which is what stops this copy drifting away from AppShell and ThemeController.
const THEME_INIT = `
(function () {
  try {
    var key = "safety_insite_theme";
    var legacyDarkKey = "sentinel_dark_mode";
    var path = window.location.pathname;
    var fixedPublicPrefixes = ${JSON.stringify(FIXED_LIGHT_THEME_ROUTES)};
    var fixedPublicTheme = path === "/" || fixedPublicPrefixes.some(function (prefix) {
      return path === prefix || path.indexOf(prefix + "/") === 0;
    });
    var stored = window.localStorage.getItem(key);
    if (stored !== "light" && stored !== "dark") {
      var legacyDark = window.localStorage.getItem(legacyDarkKey);
      if (legacyDark === "true") stored = "dark";
      else if (legacyDark === "false") stored = "light";
      else if (stored === null) {
        stored = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        stored = "light";
      }
    }

    if (fixedPublicTheme) stored = "light";
    else window.localStorage.setItem(key, stored);
    window.localStorage.removeItem(legacyDarkKey);
    window.localStorage.removeItem("sentinel_theme_version");

    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(stored);
    root.setAttribute("data-theme", stored);
    root.style.colorScheme = stored;

    var themeColor = stored === "dark" ? "#07111F" : "#F3F7FB";
    var statusBar = stored === "dark" ? "black-translucent" : "default";
    var setMeta = function (name, content) {
      var tag = document.querySelector('meta[name="' + name + '"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    // color-scheme drives UA-painted surfaces (canvas underlay, scrollbars, form controls).
    // It is emitted statically as "light" by the viewport export and was never updated, so a
    // dark session kept light scrollbars and controls permanently -- not just during the flash.
    setMeta("color-scheme", stored);
    setMeta("theme-color", themeColor);
    setMeta("msapplication-TileColor", themeColor);
    setMeta("apple-mobile-web-app-status-bar-style", statusBar);

    // <body> does not exist yet while this runs in <head>; ThemeController keeps it in sync
    // once React mounts. CSS targets html.dark, so the pre-paint class above is what matters.
  } catch (error) {}
})();
`;

// Every route rendered with an empty <title>: the App Router emits none unless a
// `metadata` export supplies one, and neither this layout nor any page had one. Browser
// tabs, bookmarks, history entries and shared links all showed the bare URL.
//
// `title.template` gives each page a "<Page> · Safety InSite" tab name once it exports
// its own `metadata.title`; `default` covers the routes that do not.
export const metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  icons: { icon: "/icon.svg" },
};

// app/manifest.webmanifest is the App Router file convention: Next serves it at
// /manifest.webmanifest and emits the <link rel="manifest"> itself, so it is NOT repeated in the
// `metadata.manifest` field above (that would emit a second, duplicate link).
//
// Installability is what makes the offline application shell reachable after the browser is
// closed: an installed InSite launches at /field-capture, which the service worker can serve from
// cache with no connection. See public/sw.js.

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F3F7FB",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Must be the first thing in <head> so it executes before any paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <meta name="msapplication-TileColor" content="#F3F7FB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <ClientCacheCleanup />
        <ServiceWorkerRegistrar />
        <ThemeController />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
