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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var key = "safety_insite_theme";
                var legacyDarkKey = "sentinel_dark_mode";
                var stored = window.localStorage.getItem(key);
                if (stored !== "light" && stored !== "dark" && stored !== "system") {
                  var legacyDark = window.localStorage.getItem(legacyDarkKey);
                  if (legacyDark === "true") stored = "dark";
                  else if (legacyDark === "false") stored = "light";
                  else stored = "light";
                }

                var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                var shouldUseDark = stored === "dark" || (stored === "system" && prefersDark);
                document.documentElement.classList.toggle("dark", shouldUseDark);
                document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
                document.body && document.body.classList.toggle("dark", shouldUseDark);
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
