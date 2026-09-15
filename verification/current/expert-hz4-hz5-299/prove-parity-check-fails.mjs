#!/usr/bin/env node
/**
 * §299 / HZ-5 — PROOF THAT THE POSTURE PARITY CHECK ACTUALLY FAILS, IN BOTH DIRECTIONS.
 *
 * A gate nobody has ever watched fail is not evidence that anything is held. This builds
 * deliberately broken COPIES of the two contract files in a scratch directory, points
 * `check-299-posture-vocabulary-parity.mjs` at them, and asserts a non-zero exit for each
 * mutation — including the exact shape HZ-5 had.
 *
 * The real source files are never modified. Copies only, under os.tmpdir().
 * No database, no network, no provider call.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const CHECK = resolve(repoRoot, "frontend-next/scripts/check-299-posture-vocabulary-parity.mjs");
const SERVER = resolve(
  repoRoot, "backend/src/hazlenz/expert-hazlenz/contract/expert-233-posture-contract.ts");
const FRONTEND = resolve(repoRoot, "frontend-next/lib/expert/expertPresentation.ts");

const work = mkdtempSync(join(tmpdir(), "posture-parity-"));
const serverSource = readFileSync(SERVER, "utf8");
const frontendSource = readFileSync(FRONTEND, "utf8");

let failures = 0;
function expect(name, { server = serverSource, frontend = frontendSource }, shouldFail) {
  const s = join(work, "server.ts");
  const f = join(work, "frontend.ts");
  writeFileSync(s, server);
  writeFileSync(f, frontend);
  const run = spawnSync(process.execPath, [CHECK], {
    env: { ...process.env, POSTURE_PARITY_SERVER_FILE: s, POSTURE_PARITY_FRONTEND_FILE: f },
    encoding: "utf8",
  });
  const didFail = run.status !== 0;
  const correct = didFail === shouldFail;
  if (!correct) failures += 1;
  console.log(`${correct ? "ok   " : "FAIL "} ${name} -> exit ${run.status} `
    + `(expected ${shouldFail ? "non-zero" : "zero"})`);
  if (!correct) console.log(run.stdout + run.stderr);
}

console.log("\n---- the unmutated pair ----\n");
expect("real server + real frontend agree", {}, false);

console.log("\n---- direction 1: the server emits a posture the frontend cannot name ----\n");
expect("frontend loses STOP (the literal HZ-5 shape)", {
  frontend: frontendSource.replace(
    /  STOP: \{\n    label: "[^"]*",\n    restrictsWork: true,\n  \},\n/, ""),
}, true);
expect("frontend loses HOLD_PENDING_VERIFICATION", {
  frontend: frontendSource.replace(
    /  HOLD_PENDING_VERIFICATION: \{\n    label: "[^"]*",\n    restrictsWork: true,\n  \},\n/, ""),
}, true);
expect("server gains a posture the frontend has never heard of", {
  server: serverSource.replace(
    "  'STOP',\n] as const;", "  'STOP',\n  'EVACUATE_AREA',\n] as const;"),
}, true);

console.log("\n---- direction 2: the frontend names dead vocabulary ----\n");
expect("frontend keeps a retired §210J name (STOP_WORK)", {
  frontend: frontendSource.replace(
    '  STOP: {', '  STOP_WORK: {\n    label: "Stop work (retired name)",\n    restrictsWork: true,\n  },\n  STOP: {'),
}, true);

console.log("\n---- the restrictiveness binding ----\n");
expect("frontend renders STOP as permissive", {
  frontend: frontendSource.replace(
    /(  STOP: \{\n    label: "[^"]*",\n    restrictsWork: )true/, "$1false"),
}, true);
expect("frontend labels STOP with permissive language", {
  frontend: frontendSource.replace(
    /(  STOP: \{\n    label: )"[^"]*"/, '$1"Work may continue"'),
}, true);

console.log(`\n${failures === 0 ? "ALL MUTATIONS BEHAVED AS EXPECTED" : `${failures} MUTATION(S) DID NOT`}\n`);
process.exit(failures === 0 ? 0 : 1);
