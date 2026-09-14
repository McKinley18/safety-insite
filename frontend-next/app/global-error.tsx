"use client";

import { useEffect } from "react";

/**
 * §280 (D-034) — THE LAST RESORT.
 *
 * `error.tsx` cannot catch an error thrown by the root layout itself, because it renders inside
 * it. `global-error.tsx` replaces the whole document when that happens.
 *
 * It therefore CANNOT use anything from the application: no root layout, no AppShell, no
 * `globals.css`, no theme class on `<html>`. Next is explicit that this file renders its own
 * document and that app-level styles and the theme attribute do not reach it. So the markup here
 * is deliberately self-contained and the colours are inline, with `prefers-color-scheme` doing the
 * only theming available — and the palette matches the product's own tokens (#F3F7FB / #07111F
 * page, #1D72B8 brand) so that even this screen is recognisably Safety InSite.
 *
 * Being a Client Component it cannot export `metadata`; React's `<title>` element is the
 * documented alternative and is what names the tab.
 *
 * If this screen is ever seen, the application shell itself failed. It offers a full document
 * reload, which is the only recovery available at this level.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error("[Safety InSite] root layout failure", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong · Safety InSite</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#F3F7FB",
          color: "#0f172a",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* The dark variant cannot be expressed in inline styles, and this document has no
            stylesheet of its own, so it is a single scoped <style> rather than a second copy of
            the markup. */}
        <style>{`
          @media (prefers-color-scheme: dark) {
            body { background: #07111F !important; color: #f8fafc !important; }
            .insite-global-error-card { background: #102A43 !important; border-color: #1e3a5f !important; }
            .insite-global-error-body { color: #cbd5e1 !important; }
            .insite-global-error-detail { color: #94a3b8 !important; }
          }
        `}</style>
        <div
          role="alert"
          className="insite-global-error-card"
          style={{
            width: "100%",
            maxWidth: "34rem",
            border: "1px solid #dbe4ee",
            borderRadius: "1rem",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          <div style={{ height: "6px", background: "#1D72B8" }} aria-hidden="true" />
          <div style={{ padding: "1.75rem" }}>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#1D72B8",
              }}
            >
              Safety InSite
            </p>
            <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.6rem", fontWeight: 900 }}>
              Something went wrong
            </h1>
            <p
              className="insite-global-error-body"
              style={{ margin: "0.75rem 0 0", fontWeight: 600, lineHeight: 1.6, color: "#334155" }}
            >
              Safety InSite could not start. Reloading usually resolves it. Inspections, findings
              and reports already saved are held on the server and are not affected.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1.5rem",
                minHeight: "48px",
                padding: "0 1.5rem",
                border: "none",
                borderRadius: "0.75rem",
                background: "#1D72B8",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Reload Safety InSite
            </button>
            {error.digest && (
              <p
                className="insite-global-error-detail"
                style={{
                  margin: "1.5rem 0 0",
                  paddingTop: "1rem",
                  borderTop: "1px solid #dbe4ee",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Reference for support:{" "}
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {error.digest}
                </span>
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
