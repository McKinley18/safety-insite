import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ClientCacheCleanup from "@/components/system/ClientCacheCleanup";
import ThemeController from "@/components/system/ThemeController";
import Script from "next/script";

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
        <meta name="msapplication-TileColor" content="#F3F7FB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var key = "safety_insite_theme";
                var legacyDarkKey = "sentinel_dark_mode";
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

                window.localStorage.setItem(key, stored);
                window.localStorage.removeItem(legacyDarkKey);
                window.localStorage.removeItem("sentinel_theme_version");

                var root = document.documentElement;
                root.classList.remove("light", "dark");
                root.classList.add(stored);
                root.setAttribute("data-theme", stored);
                root.style.colorScheme = stored;

                if (document.body) {
                  document.body.classList.remove("light", "dark");
                  document.body.classList.add(stored);
                  document.body.style.colorScheme = stored;
                }

                var themeColor = stored === "dark" ? "#07111F" : "#F3F7FB";
                var statusBar = stored === "dark" ? "black-translucent" : "default";
                var themeMeta = document.querySelector('meta[name="theme-color"]');
                var tileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
                var statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                if (themeMeta) themeMeta.setAttribute("content", themeColor);
                if (tileMeta) tileMeta.setAttribute("content", themeColor);
                if (statusMeta) statusMeta.setAttribute("content", statusBar);
              } catch (error) {}
            })();
          `}
        </Script>
      </head>
      <body>
        <ClientCacheCleanup />
        <ThemeController />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
