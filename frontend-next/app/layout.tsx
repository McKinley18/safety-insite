import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ClientCacheCleanup from "@/components/system/ClientCacheCleanup";

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
