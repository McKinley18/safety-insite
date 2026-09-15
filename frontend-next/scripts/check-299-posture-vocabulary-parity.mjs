#!/usr/bin/env node
/**
 * §299 / HZ-5 — THE SERVER'S POSTURE VOCABULARY AND THE FRONTEND'S, HELD TOGETHER IN BOTH
 * DIRECTIONS.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS.
 *
 * `frontend-next/lib/expert/expertPresentation.ts` cannot import from `backend/` — the frontend
 * does not build against it — so the posture vocabulary is necessarily restated on the client. HZ-5
 * is what happens when a restated vocabulary goes stale: §233 superseded the §210J / §226 posture
 * names, the frontend table kept the old five, and the two that vanished were exactly the two that
 * restrict work. §298 returned STOP and the deployed panel rendered "The operational posture could
 * not be read".
 *
 * ---------------------------------------------------------------------------------------------
 * BOTH DIRECTIONS, AND THE SECOND ONE IS THE ONE THAT MATTERED.
 *
 *   SERVER -> FRONTEND   a posture the server can emit that the frontend cannot name.
 *                        This is the failure the inspector sees.
 *
 *   FRONTEND -> SERVER   a posture the frontend names that the server can no longer emit.
 *                        This is DEAD VOCABULARY, and it is the direction that would have caught
 *                        HZ-5 on the day §233 landed. Nothing ever asked whether STOP_WORK,
 *                        DO_NOT_START and NO_IMMEDIATE_RESTRICTION still existed, so they sat
 *                        there looking like coverage for three sections.
 *
 * `restrictsWork` is checked member by member as well, against the server's own
 * `POSTURE_PERMITS_CONTINUED_WORK`. A frontend that named every posture but rendered STOP with the
 * calm treatment would pass a names-only check and still tell an inspector the wrong thing.
 *
 * Reads two source files. No database, no network, no build step. Exits non-zero on any mismatch.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

/*
 * The two real files. Both are overridable by environment variable for ONE purpose: proving that
 * this check fails in both directions. A check nobody has ever seen fail is not evidence, so
 * `verification/current/expert-hz4-hz5-299/prove-parity-check-fails.mjs` points these at deliberately
 * broken copies and asserts a non-zero exit. No product path sets them.
 */
const SERVER_CONTRACT = process.env.POSTURE_PARITY_SERVER_FILE ?? resolve(
  repoRoot, "backend/src/hazlenz/expert-hazlenz/contract/expert-233-posture-contract.ts");
const FRONTEND_PRESENTATION = process.env.POSTURE_PARITY_FRONTEND_FILE ?? resolve(
  repoRoot, "frontend-next/lib/expert/expertPresentation.ts");

let failed = false;
const fail = (message) => { console.error(`FAIL  ${message}`); failed = true; };
const ok = (message) => console.log(`ok    ${message}`);

// ---------------------------------------------------------------- the server side

const serverSource = readFileSync(SERVER_CONTRACT, "utf8");

/**
 * The enum, read out of the server's own declaration. Parsed rather than re-typed: a hand-copied
 * list here would be a THIRD copy of the vocabulary and would go stale exactly as the second did.
 */
function serverPostures() {
  const block = /export const IMMEDIATE_SAFETY_POSTURES_233 = \[([\s\S]*?)\] as const;/
    .exec(serverSource);
  if (block === null) {
    fail(`IMMEDIATE_SAFETY_POSTURES_233 was not found in ${SERVER_CONTRACT}. The server contract `
      + "moved or was renamed; this check cannot silently pass.");
    return [];
  }
  return [...block[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
}

/** `POSTURE_PERMITS_CONTINUED_WORK`, read the same way. */
function serverPermitsContinuedWork() {
  const block = /export const POSTURE_PERMITS_CONTINUED_WORK:[\s\S]*?\{([\s\S]*?)\};/
    .exec(serverSource);
  if (block === null) {
    fail(`POSTURE_PERMITS_CONTINUED_WORK was not found in ${SERVER_CONTRACT}.`);
    return {};
  }
  return Object.fromEntries(
    [...block[1].matchAll(/([A-Z_]+):\s*(true|false)/g)].map((m) => [m[1], m[2] === "true"]));
}

// ---------------------------------------------------------------- the frontend side

const frontendSource = readFileSync(FRONTEND_PRESENTATION, "utf8");

/**
 * The frontend table, read out of its declaration. Read from SOURCE rather than imported so this
 * check runs with no TypeScript toolchain and cannot be satisfied by a re-export that hides the
 * real table.
 */
function frontendPresentation() {
  const block = /const POSTURE_PRESENTATION: Record<string, \{ label: string; restrictsWork: boolean \}> = \{([\s\S]*?)\n\};/
    .exec(frontendSource);
  if (block === null) {
    fail(`POSTURE_PRESENTATION was not found in ${FRONTEND_PRESENTATION}.`);
    return {};
  }
  const entries = {};
  for (const m of block[1].matchAll(
    /([A-Z_]+):\s*\{\s*label:\s*"((?:[^"\\]|\\.)*)",\s*restrictsWork:\s*(true|false),/g)) {
    entries[m[1]] = { label: m[2], restrictsWork: m[3] === "true" };
  }
  return entries;
}

// ---------------------------------------------------------------- the comparison

const server = serverPostures();
const permits = serverPermitsContinuedWork();
const frontend = frontendPresentation();

console.log(`\nserver vocabulary   : ${server.join(", ") || "(none read)"}`);
console.log(`frontend vocabulary : ${Object.keys(frontend).join(", ") || "(none read)"}\n`);

if (server.length === 0 || Object.keys(frontend).length === 0) {
  console.error("\nOne side could not be read. Treated as a failure rather than as agreement.");
  process.exit(1);
}

// 1. Every server posture is named by the frontend.
for (const posture of server) {
  if (frontend[posture] === undefined) {
    fail(`The server can emit ${posture} and the frontend has no label for it. It would render as `
      + '"the operational posture could not be read" — this is HZ-5.');
  } else {
    ok(`${posture} has intentional user-facing language: "${frontend[posture].label}"`);
  }
}

// 2. The frontend names nothing the server cannot emit.
for (const posture of Object.keys(frontend)) {
  if (!server.includes(posture)) {
    fail(`The frontend names ${posture}, which the server's current contract cannot emit. Dead `
      + "vocabulary looks like coverage and is how HZ-5 survived three sections unnoticed.");
  }
}
if (Object.keys(frontend).every((p) => server.includes(p))) {
  ok("The frontend names no posture the server cannot emit.");
}

// 3. restrictsWork is the server's own permission, negated, member by member.
for (const posture of server) {
  if (frontend[posture] === undefined) continue;
  if (!Object.prototype.hasOwnProperty.call(permits, posture)) {
    fail(`POSTURE_PERMITS_CONTINUED_WORK has no entry for ${posture}; the server contract is `
      + "internally incomplete and the frontend cannot be checked against it.");
    continue;
  }
  const expected = !permits[posture];
  if (frontend[posture].restrictsWork !== expected) {
    fail(`${posture}: the server says work ${permits[posture] ? "MAY" : "may NOT"} continue, so `
      + `restrictsWork must be ${expected}, but the frontend has ${frontend[posture].restrictsWork}.`);
  } else {
    ok(`${posture}: restrictsWork=${expected} matches the server's POSTURE_PERMITS_CONTINUED_WORK.`);
  }
}

// 4. Every label is distinct, so two postures can never read as the same instruction.
const labels = Object.values(frontend).map((e) => e.label);
if (new Set(labels).size !== labels.length) {
  fail("Two postures share a user-facing label; the inspector cannot tell them apart.");
} else {
  ok("Every posture has a distinct user-facing label.");
}

// 5. A restrictive posture must not be labelled with permissive language.
const PERMISSIVE = /\b(may continue|can continue|no restriction|proceed|cleared|go ahead)\b/i;
for (const [posture, entry] of Object.entries(frontend)) {
  if (entry.restrictsWork && PERMISSIVE.test(entry.label)) {
    fail(`${posture} restricts work but is labelled with permissive language: "${entry.label}"`);
  }
}
ok("No work-restricting posture carries permissive language.");

// 6. The retired §210J / §226 names must not reappear.
for (const retired of ["STOP_WORK", "DO_NOT_START", "NO_IMMEDIATE_RESTRICTION"]) {
  if (frontend[retired] !== undefined) {
    fail(`${retired} is a retired §210J / §226 posture name and must not be in the table.`);
  }
}
ok("None of the retired §210J / §226 posture names are present.");

console.log(failed ? "\nPOSTURE VOCABULARY PARITY FAILED\n" : "\nPOSTURE VOCABULARY PARITY OK\n");
process.exit(failed ? 1 : 0);
