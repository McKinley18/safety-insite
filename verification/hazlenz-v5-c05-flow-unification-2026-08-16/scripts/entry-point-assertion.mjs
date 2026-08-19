#!/usr/bin/env node
// V5-C05 Phase 16 — reproducible entry-point assertion.
//
// Fails if a future change silently regresses the primary "Start Inspection" entry point
// away from an implementation that carries finding-scoped (hazard-independent) risk.
//
// Run from the repository root: node verification/hazlenz-v5-c05-flow-unification-2026-08-16/scripts/entry-point-assertion.mjs

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
const fail = [];
const pass = [];

function read(relPath) {
  const abs = resolve(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    fail.push(`Missing expected file: ${relPath}`);
    return "";
  }
  return readFileSync(abs, "utf8");
}

function assert(condition, message) {
  if (condition) pass.push(message);
  else fail.push(message);
}

// 1. Identify the primary "Start Inspection" CTA target.
const commandCenter = read("frontend-next/app/command-center/page.tsx");
const ctaMatch = commandCenter.match(/href="([^"]+)"[^>]*>\s*Start Inspection/);
const ctaTarget = ctaMatch ? ctaMatch[1] : null;

assert(
  ctaTarget === "/inspection",
  `Primary dashboard CTA target is "${ctaTarget}" (expected "/inspection" per the current, reviewed C05 decision — if this changed intentionally, update this assertion's expected value in the same change).`,
);

// 2. The known entry-flow implementations must each carry their own finding-scoped-risk mechanism.
//    /inspection (legacy, fixed in C05): the multi-hazard banner must offer a per-hazard
//    "start a finding" control that seeds the next finding from that hazard's own fragment text.
const safeScopeInspectionStep = read(
  "frontend-next/components/inspection/SafeScopeInspectionStep.tsx",
);
assert(
  safeScopeInspectionStep.includes("onUseHazardFragment") &&
    safeScopeInspectionStep.includes("hazard.observationFragment"),
  '/inspection\'s hazard-decomposition banner still wires a per-hazard "start a finding" control to that hazard\'s own observationFragment (the C05 fix).',
);

const inspectionPage = read("frontend-next/app/inspection/page.tsx");
assert(
  inspectionPage.includes("useHazardFragmentForNewFinding"),
  "/inspection's page component still defines the hazard-fragment-seeding handler introduced by C05.",
);

//    /inspection-workspace (canonical, fixed in C01): must still read riskSnapshot per finding.
const inspectionWorkspace = read("frontend-next/app/inspection-workspace/page.tsx");
assert(
  inspectionWorkspace.includes("riskSnapshot"),
  "/inspection-workspace still consumes per-finding riskSnapshot (the C01 fix).",
);

// 3. Whichever route the primary CTA targets must be one of the known-fixed implementations.
const knownFixedRoutes = new Set(["/inspection", "/inspection-workspace", "/inspections"]);
assert(
  ctaTarget !== null && knownFixedRoutes.has(ctaTarget),
  `Primary CTA target "${ctaTarget}" is a recognized, verified-fixed entry point (one of ${[...knownFixedRoutes].join(", ")}). If this fails, a navigation change has pointed the primary CTA at an unverified implementation and must be re-audited before release.`,
);

console.log("PASS:");
pass.forEach((m) => console.log(`  ✅ ${m}`));
if (fail.length) {
  console.log("FAIL:");
  fail.forEach((m) => console.log(`  ❌ ${m}`));
  console.log(`\n${pass.length} passed, ${fail.length} failed.`);
  process.exit(1);
}
console.log(`\n${pass.length} passed, 0 failed.`);
process.exit(0);
