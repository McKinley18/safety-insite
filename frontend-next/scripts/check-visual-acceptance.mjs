// Whole-application visual acceptance sweep.
//
// Captures every customer-facing route at desktop light, desktop dark, and
// mobile, and records rendered diagnostics (horizontal overflow, first-paint
// background, root theme class, heading structure, console errors) so that a
// PASS is backed by an inspected screenshot plus measured page state rather
// than by "no exception was thrown".
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  APP_URL,
  VIEWPORTS,
  applyTheme,
  connectDb,
  createProAccount,
  inspectRoute,
  signIn,
} from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/visual-acceptance";
const shotDir = `${outDir}/screenshots`;
mkdirSync(shotDir, { recursive: true });

// Authoritative customer-facing route inventory, derived from app/**/page.tsx
// and cross-checked against inbound links in the shipped navigation.
const ROUTES = [
  { path: "/", id: "home", cls: "PUBLIC", auth: false },
  { path: "/about", id: "about", cls: "PUBLIC", auth: false },
  { path: "/pricing", id: "pricing", cls: "PUBLIC", auth: false },
  { path: "/legal", id: "legal", cls: "PUBLIC", auth: false },
  { path: "/hazlenz", id: "hazlenz", cls: "PUBLIC", auth: false },
  { path: "/login", id: "login", cls: "AUTH", auth: false },
  { path: "/register", id: "register", cls: "AUTH", auth: false },
  { path: "/forgot-password", id: "forgot-password", cls: "AUTH", auth: false },
  { path: "/reset-password", id: "reset-password", cls: "AUTH", auth: false },
  { path: "/command-center", id: "command-center", cls: "PRIMARY_PRODUCT", auth: true },
  { path: "/inspections", id: "inspections", cls: "PRIMARY_PRODUCT", auth: true },
  { path: "/reports", id: "reports", cls: "PRIMARY_PRODUCT", auth: true },
  { path: "/safety-calendar", id: "safety-calendar", cls: "PRIMARY_PRODUCT", auth: true },
  { path: "/settings", id: "settings", cls: "SETTINGS_ACCOUNT", auth: true },
  { path: "/profile", id: "profile", cls: "SETTINGS_ACCOUNT", auth: true },
  { path: "/upgrade", id: "upgrade", cls: "SECONDARY_PRODUCT", auth: true },
  { path: "/unlock", id: "unlock", cls: "SECONDARY_PRODUCT", auth: true },
  // Legacy inspection cluster: still routable by direct URL but no longer
  // reachable from shipped navigation (both launchers now target
  // /inspection-workspace). Captured for classification, not polished.
  { path: "/inspection", id: "legacy-inspection", cls: "LEGACY", auth: true },
  { path: "/inspection-quick", id: "legacy-inspection-quick", cls: "LEGACY", auth: true },
  { path: "/inspection-review", id: "legacy-inspection-review", cls: "LEGACY", auth: true },
  { path: "/inspection-cover", id: "legacy-inspection-cover", cls: "LEGACY", auth: true },
];

const results = [];
const db = await connectDb();
const browser = await chromium.launch({ headless: true });

async function sweep(theme, viewportName) {
  const viewport = VIEWPORTS[viewportName];
  const context = await browser.newContext({ viewport });
  await applyTheme(context, theme);
  // The dev server injects <nextjs-portal> (the floating "N" dev-tools badge).
  // It is not part of the product, so it is hidden rather than left to appear in
  // every acceptance screenshot and be mistaken for a clipped UI element.
  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal{display:none !important}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 200)}`));

  // Authenticated routes need a real session against the disposable backend.
  const account = await createProAccount(page, db, "visual");
  await signIn(page, account.email, account.password);

  for (const route of ROUTES) {
    const before = consoleErrors.length;
    let finalUrl = route.path;
    let diag = null;
    let error = null;
    try {
      const resp = await page.goto(`${APP_URL}${route.path}`, {
        waitUntil: "networkidle",
        timeout: 45000,
      });
      await page.waitForTimeout(900);
      finalUrl = new URL(page.url()).pathname;
      diag = await inspectRoute(page);
      diag.status = resp ? resp.status() : null;
      const name = `${route.id}-${viewportName}-${theme}.png`;
      await page.screenshot({ path: `${shotDir}/${name}`, fullPage: true });
      diag.screenshot = name;
    } catch (e) {
      error = String(e).slice(0, 200);
    }
    results.push({
      route: route.path,
      id: route.id,
      classification: route.cls,
      requiresAuth: route.auth,
      theme,
      viewport: viewportName,
      finalUrl,
      redirected: finalUrl !== route.path,
      consoleErrors: consoleErrors.slice(before),
      error,
      ...(diag || {}),
    });
    console.log(
      `[${theme}/${viewportName}] ${route.path} -> ${finalUrl}` +
        (diag ? ` overflow=${diag.overflow} bg=${diag.bg} h1=${diag.h1Count}` : ` ERROR ${error}`),
    );
  }
  await context.close();
}

try {
  await sweep("light", "desktop");
  await sweep("dark", "desktop");
  await sweep("light", "mobile");
  await sweep("dark", "mobile");
} finally {
  await browser.close();
  await db.end();
}

writeFileSync(`${outDir}/visual-sweep.json`, JSON.stringify({ results }, null, 2));

const overflowHits = results.filter((r) => r.overflow > 0);
const errorHits = results.filter((r) => r.error || (r.consoleErrors || []).length);
console.log(`\n=== summary ===`);
console.log(`captures: ${results.length}`);
console.log(`horizontal overflow: ${overflowHits.length}`);
for (const r of overflowHits) {
  console.log(`  ${r.route} [${r.theme}/${r.viewport}] overflow=${r.overflow}px ${JSON.stringify(r.offenders)}`);
}
console.log(`console/page errors: ${errorHits.length}`);
for (const r of errorHits) {
  console.log(`  ${r.route} [${r.theme}/${r.viewport}] ${r.error || r.consoleErrors.join(" | ").slice(0, 200)}`);
}
