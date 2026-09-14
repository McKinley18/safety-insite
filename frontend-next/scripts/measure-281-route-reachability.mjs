// §281 (D-038.6) — THE ROUTE INVENTORY, DERIVED FROM CUSTOMER REACHABILITY.
//
// ==================== WHY THIS EXISTS ====================
//
// §280 found that `PAGE-BY-PAGE-PRODUCT-REVIEW.md` listed three routes as active customer-facing
// pages that no customer can reach, and that batch 1 had reviewed one of them as an active page.
// The inventory was wrong because it was built the way inventories usually are: by listing the
// directories under `app/`. A `page.tsx` on disk proves a route COMPILES. It proves nothing
// whatever about whether a customer can arrive at it.
//
// The product owner's direction at §281 is explicit: classify by REACHABILITY FROM ACTUAL CUSTOMER
// ENTRY AND NAVIGATION, not by filesystem presence.
//
// ==================== WHY A BROWSER CRAWL ALONE IS NOT ENOUGH ====================
//
// The first version of this script was a crawl and nothing else, and it reported EIGHT orphans —
// including `/inspection-workspace`, the single most important surface in the product. A crawl
// follows visible anchors from where it happens to stand, so it silently under-reports:
//
//   - `/inspection-workspace` is entered by `router.push` from a row button on /inspections;
//   - `/profile` is an anchor inside an account menu that is not in the DOM until it is opened;
//   - `/upgrade` is an anchor that renders only in an entitlement-limited state;
//   - `/unlock` is pushed by the PIN guard;
//   - `/reset-password` is entered from an emailed link, from outside the product entirely.
//
// Reporting those five as orphans would have been the §280 defect in reverse: the crawl's silence
// treated as proof of absence. So this instrument uses TWO passes and requires BOTH to agree
// before it will call anything an orphan — which is the standard D-033 actually applied.
//
// ==================== THE METHOD ====================
//
//   PASS 1  FILESYSTEM. Every `app/**/page.tsx`. The denominator.
//
//   PASS 2  BROWSER CRAWL. A real signed-in session, breadth-first over every visible `<a href>`
//           from the product's two real entry points. This is POSITIVE evidence: a route the
//           crawl reaches is reachable, full stop. Its silence is not negative evidence.
//
//   PASS 3  SOURCE REACHABILITY FIXPOINT. Every inbound navigation reference in the codebase —
//           `href="/x"`, `router.push("/x")`, `router.replace("/x")`, `window.location = "/x"` —
//           attributed to the file that contains it. A route is SOURCE-REACHABLE when something
//           navigates to it FROM A FILE THAT IS ITSELF REACHABLE. That last clause is the whole
//           point: it is what stops a closed cycle from proving its own reachability by pointing
//           at itself, which is exactly how `/inspection` -> `/inspection-review` -> `/inspection`
//           survived every previous inventory.
//
//           The fixpoint is seeded with the crawl's results and the app's public entry points, and
//           grows until nothing new is added. A route left outside it is referenced only from code
//           that is itself unreachable, or not referenced at all.
//
// A route is LEGACY_ORPHAN only when the crawl did not reach it AND the fixpoint does not contain
// it. Anything reachable by one but not the other is reported with which pass found it, because
// that disagreement is usually informative rather than an error.
//
// Usage: APP_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT=<file> node scripts/measure-281-route-reachability.mjs

import { chromium } from "playwright";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL = process.env.VAL_EMAIL || "";
const PASSWORD = process.env.VAL_PASSWORD || "";
const OUT = process.env.OUT || "/tmp/insite-281-reachability.json";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SRC_EXT = [".tsx", ".ts", ".jsx", ".js", ".mjs"];
const SRC_DIRS = ["app", "components", "lib", "hooks", "types", "contexts"];

// The two places a customer can arrive from outside the product, plus the surfaces the auth guard
// itself sends people to. These seed the fixpoint: nothing needs to link to them for them to be
// reachable, because the world outside the app reaches them directly.
const EXTERNAL_ENTRY_POINTS = {
  "/": "the marketing entry point — the deployed root URL",
  "/login": "the sign-in URL, and where AppShell's guard sends an unauthenticated visitor",
  "/register": "the sign-up URL, linked from marketing and shared directly",
  "/forgot-password": "linked from /login",
  "/reset-password": "entered from a password-reset EMAIL — an entry point outside the product",
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (SRC_EXT.includes(extname(entry.name))) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- PASS 1: the filesystem
function routesOnDisk(dir, prefix = "") {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) found.push(prefix || "/");
      continue;
    }
    // Route groups `(name)` do not appear in the URL.
    if (entry.name.startsWith("(")) found.push(...routesOnDisk(join(dir, entry.name), prefix));
    else found.push(...routesOnDisk(join(dir, entry.name), `${prefix}/${entry.name}`));
  }
  return found;
}

// ---------------------------------------------------------------- the module import graph
function resolveSpec(spec, fromFile) {
  let base;
  if (spec.startsWith("@/")) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  for (const e of SRC_EXT) if (existsSync(base + e) && statSync(base + e).isFile()) return base + e;
  if (existsSync(base) && statSync(base).isDirectory()) {
    for (const e of SRC_EXT) if (existsSync(join(base, "index" + e))) return join(base, "index" + e);
  }
  if (existsSync(base) && statSync(base).isFile()) return base;
  return null;
}

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;
// Navigation to a LITERAL in-app path. Template literals with an interpolated id are matched up to
// the first `${`, which is what makes `/inspection-workspace?x=${id}` count as navigation to it.
const NAV_RE = /(?:href\s*=\s*["'`]|router\.(?:push|replace)\s*\(\s*["'`]|window\.location(?:\.href)?\s*=\s*["'`]|location\.assign\(\s*["'`])(\/[A-Za-z0-9\-_/]*)/g;

(async () => {
  const disk = routesOnDisk(join(ROOT, "app")).sort();
  const files = SRC_DIRS.flatMap((d) => walk(join(ROOT, d)));

  const imports = new Map();
  const navRefs = new Map();   // route -> [{ file, snippet }]
  for (const file of files) {
    const src = readFileSync(file, "utf8");

    const deps = new Set();
    IMPORT_RE.lastIndex = 0;
    let m;
    while ((m = IMPORT_RE.exec(src))) {
      const r = resolveSpec(m[1] || m[2] || m[3], file);
      if (r) deps.add(r);
    }
    imports.set(file, deps);

    NAV_RE.lastIndex = 0;
    while ((m = NAV_RE.exec(src))) {
      const route = (m[1] || "").replace(/\/$/, "") || "/";
      if (!disk.includes(route)) continue;
      if (!navRefs.has(route)) navRefs.set(route, []);
      const line = src.slice(0, m.index).split("\n").length;
      navRefs.get(route).push({ file: relative(ROOT, file), line });
    }
  }

  // The module closure of one route: its page, its layout, and everything they transitively import.
  function routeClosure(route) {
    const dir = route === "/" ? join(ROOT, "app") : join(ROOT, "app", route.slice(1));
    const seeds = ["page.tsx", "page.ts", "layout.tsx", "layout.ts"]
      .map((f) => join(dir, f)).filter(existsSync);
    const seen = new Set();
    const stack = [...seeds];
    while (stack.length) {
      const f = stack.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      for (const d of imports.get(f) || []) if (!seen.has(d)) stack.push(d);
    }
    return seen;
  }
  const closures = new Map(disk.map((r) => [r, routeClosure(r)]));

  // The app shell and the root layout are on EVERY page, so a link in them is reachable from
  // everywhere the shell renders. They seed the fixpoint's file set rather than any one route's.
  const alwaysRenderedFiles = new Set();
  for (const f of ["app/layout.tsx", "components/layout/AppShell.tsx"].map((p) => join(ROOT, p))) {
    if (!existsSync(f)) continue;
    for (const d of closures.get("/") || []) void d;
    const stack = [f];
    while (stack.length) {
      const cur = stack.pop();
      if (alwaysRenderedFiles.has(cur)) continue;
      alwaysRenderedFiles.add(cur);
      for (const d of imports.get(cur) || []) if (!alwaysRenderedFiles.has(d)) stack.push(d);
    }
  }

  // ---------------------------------------------------------------- PASS 2: the browser crawl
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const signedOut = await crawl(page, "/");

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);

  const signedIn = await crawl(page, "/command-center");
  await browser.close();

  const crawlReached = new Set([...signedOut.reached, ...signedIn.reached].filter((r) => disk.includes(r)));

  // ---------------------------------------------------------------- PASS 3: the fixpoint
  const sourceReachable = new Set([...Object.keys(EXTERNAL_ENTRY_POINTS), ...crawlReached]
    .filter((r) => disk.includes(r)));
  const sourceBasis = {};
  for (const r of sourceReachable) {
    sourceBasis[r] = EXTERNAL_ENTRY_POINTS[r] ? `entry point — ${EXTERNAL_ENTRY_POINTS[r]}` : "reached by the browser crawl";
  }

  let grew = true;
  while (grew) {
    grew = false;
    // The set of files that a reachable route (or the always-rendered shell) can execute.
    const reachableFiles = new Set(alwaysRenderedFiles);
    for (const r of sourceReachable) for (const f of closures.get(r) || []) reachableFiles.add(f);

    for (const [route, refs] of navRefs) {
      if (sourceReachable.has(route)) continue;
      const proof = refs.find((ref) => reachableFiles.has(join(ROOT, ref.file)));
      if (proof) {
        sourceReachable.add(route);
        sourceBasis[route] = `navigated to from ${proof.file}:${proof.line}, which is itself reachable`;
        grew = true;
      }
    }
  }

  // ---------------------------------------------------------------- classification
  const classified = disk.map((route) => {
    const byCrawl = crawlReached.has(route);
    const bySource = sourceReachable.has(route);
    let classification;
    let basis;

    if (byCrawl) {
      classification = "ACTIVE_REACHABLE";
      basis = `browser crawl reached it from ${signedIn.via[route] || signedOut.via[route] || "an entry point"}`;
    } else if (bySource && EXTERNAL_ENTRY_POINTS[route]) {
      classification = "ACTIVE_REACHABLE";
      basis = sourceBasis[route];
    } else if (bySource) {
      classification = "ACTIVE_DEEP_LINK";
      basis = `NOT anchor-crawlable (behind a disclosure, a state, or a programmatic push); ${sourceBasis[route]}`;
    } else {
      classification = "LEGACY_ORPHAN";
      basis = navRefs.has(route)
        ? `referenced only from code that is itself unreachable: ${navRefs.get(route).map((r) => `${r.file}:${r.line}`).join(", ")}`
        : "no inbound navigation reference anywhere in app/, components/, lib/, hooks/ or types/, and not reached by either crawl";
    }
    return { route, classification, basis, byCrawl, bySource };
  });

  const result = {
    instrument: "§281 D-038.6 route reachability",
    measuredAt: new Date().toISOString(),
    appUrl: APP_URL,
    method: {
      pass1: "filesystem — every app/**/page.tsx",
      pass2: "browser crawl — breadth-first over visible <a href>, signed out from / and signed in from /command-center",
      pass3: "source reachability fixpoint — a route counts only when navigated to from a file a reachable route can execute",
      orphanRule: "LEGACY_ORPHAN requires BOTH passes to miss it. A crawl's silence alone is not evidence.",
    },
    diskRouteCount: disk.length,
    crawlReached: [...crawlReached].sort(),
    sourceReachable: [...sourceReachable].sort(),
    classified,
    counts: classified.reduce((acc, r) => ({ ...acc, [r.classification]: (acc[r.classification] || 0) + 1 }), {}),
    orphans: classified.filter((r) => r.classification === "LEGACY_ORPHAN").map((r) => r.route),
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2));

  console.log(`routes on disk        ${disk.length}`);
  console.log(`crawl-reached         ${crawlReached.size}`);
  console.log(`source-reachable      ${sourceReachable.size}`);
  for (const [k, v] of Object.entries(result.counts)) console.log(`  ${k.padEnd(20)} ${v}`);
  if (result.orphans.length) console.log(`\nLEGACY_ORPHAN: ${result.orphans.join(", ")}`);
  console.log(`\n${OUT}`);

  async function crawl(activePage, start) {
    const reached = new Set();
    const via = {};
    const queue = [start];
    const visited = new Set();

    while (queue.length) {
      const path = queue.shift();
      if (visited.has(path)) continue;
      visited.add(path);

      await activePage.goto(`${APP_URL}${path}`, { waitUntil: "domcontentloaded" });
      await activePage.waitForTimeout(1800);

      // Where the product ACTUALLY put us. A guard redirect means this path is not reachable as
      // itself, and recording the requested path rather than the landed one is how a redirect
      // gets mistaken for a reachable page.
      const landed = new URL(activePage.url()).pathname.replace(/\/$/, "") || "/";
      reached.add(landed);
      visited.add(landed);

      const hrefs = await activePage.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]"))
          .filter((a) => {
            const style = getComputedStyle(a);
            return style.display !== "none" && style.visibility !== "hidden";
          })
          .map((a) => a.getAttribute("href") || ""),
      );

      for (const href of hrefs) {
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        const next = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
        if (visited.has(next) || queue.includes(next)) continue;
        via[next] = landed;
        queue.push(next);
      }
    }
    return { reached, via };
  }
})();
