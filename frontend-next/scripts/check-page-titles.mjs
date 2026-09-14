// §280 (D-031) — EVERY CUSTOMER-FACING PAGE HAS A NAME, AND IT COMES FROM ONE TABLE.
//
// ==================== WHAT WAS WRONG ====================
//
// Every authenticated page in Safety InSite shared one `<title>`: "Safety InSite — Field safety
// intelligence powered by HazLenz AI." Five open tabs were indistinguishable, every bookmark and
// history entry carried the same sentence, and a screen reader announced it again on arrival at
// every page.
//
// ==================== WHAT THIS CHECKS, AND WHY EACH PART EXISTS ====================
//
//   1. EVERY ROUTE WITH A PAGE HAS A NAME. A new route added without one falls silently back to
//      the product default, which is precisely the defect — silently, because nothing is broken
//      and nobody looks at a tab title during development.
//   2. EVERY NAMED ROUTE HAS A LAYOUT THAT ASKS FOR IT. A name in the table that no layout reads
//      is a name nobody sees.
//   3. NO LAYOUT WRITES A TITLE OF ITS OWN. One hard-coded `title:` string is how the table stops
//      being the single source of truth, and the second one is how the convention dies.
//   4. NO TWO ROUTES SHARE A NAME. Two tabs called the same thing is the original complaint.
//
// It is static. The runtime half — that the served HTML actually carries the name — is measured in
// the browser by the page-review instrument, because a check that reads the source cannot tell
// whether the framework overwrote the result. That distinction is not hypothetical here: the first
// implementation of D-031 set `document.title` from a client component, passed every static check
// that could have been written for it, and did not work on a full page load.
//
// Run: node scripts/check-page-titles.mjs

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];

// ---- the table, read as text so this script needs no TypeScript loader
const source = readFileSync("lib/pageTitles.ts", "utf8");
const tableBody = source.slice(
  source.indexOf("export const PAGE_TITLES"),
  source.indexOf("};", source.indexOf("export const PAGE_TITLES")),
);
const NAMES = new Map();
for (const match of tableBody.matchAll(/"(\/[^"]*)":\s*"([^"]+)"/g)) {
  NAMES.set(match[1], match[2]);
}
if (NAMES.size === 0) failures.push("could not read PAGE_TITLES out of lib/pageTitles.ts");

// ---- every route that has a page
function routesWithPages(dir = "app", prefix = "") {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    // Route groups and private folders are not URL segments.
    if (entry.startsWith("_") || entry.startsWith("(")) continue;
    const route = `${prefix}/${entry}`;
    if (existsSync(join(full, "page.tsx"))) out.push(route);
    out.push(...routesWithPages(full, route));
  }
  return out;
}
const routes = routesWithPages().sort();

// ---- 1 & 2
for (const route of routes) {
  const name = NAMES.get(route);
  if (!name) {
    failures.push(
      `NO NAME: ${route} has a page but no entry in PAGE_TITLES, so its tab falls back to the ` +
        `product default and is indistinguishable from every other page.`,
    );
    continue;
  }
  const layout = `app${route}/layout.tsx`;
  if (!existsSync(layout)) {
    failures.push(
      `NO LAYOUT: ${route} is named "${name}" in the table, but has no layout.tsx to export it. ` +
        `The page is a Client Component and cannot carry metadata itself, so the name never reaches the browser.`,
    );
    continue;
  }
  const text = readFileSync(layout, "utf8");
  if (!text.includes(`routeMetadata("${route}")`)) {
    failures.push(`WRONG ROUTE: ${layout} does not call routeMetadata("${route}").`);
  }
  // ---- 3
  const hardCoded = text.match(/title:\s*["'`]/);
  if (hardCoded) {
    failures.push(
      `HARD-CODED TITLE: ${layout} writes a title string of its own. Names live in ` +
        `lib/pageTitles.ts and nowhere else — a second copy is how the convention drifts.`,
    );
  }
}

// ---- 4
const byName = new Map();
for (const [route, name] of NAMES) {
  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(route);
}
for (const [name, sharing] of byName) {
  if (sharing.length > 1) {
    failures.push(`DUPLICATE NAME: "${name}" is used by ${sharing.join(" and ")}.`);
  }
}

// ---- a named route whose page no longer exists
for (const route of NAMES.keys()) {
  if (!routes.includes(route)) {
    failures.push(`STALE NAME: PAGE_TITLES names ${route}, which has no page. Remove it.`);
  }
}

console.log(`§280 D-031 — page titles\n`);
console.log(`  ${routes.length} routes with a page, ${NAMES.size} named.\n`);
for (const route of routes) {
  const name = NAMES.get(route);
  console.log(`  ${name ? "ok  " : "FAIL"} ${route.padEnd(24)} ${name ? `"${name} · Safety InSite"` : "(no name)"}`);
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nPAGE TITLES: PASS — every page is named, and every name comes from one table.");
