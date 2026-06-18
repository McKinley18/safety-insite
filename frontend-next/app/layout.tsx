import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ClientCacheCleanup from "@/components/system/ClientCacheCleanup";

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
    <html lang="en">
      <body>
        <ClientCacheCleanup />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
