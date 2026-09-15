/**
 * §299 / HZ-5 — EVERY CURRENT SERVER POSTURE, THROUGH THE FRONTEND PRESENTATION MAPPING.
 *
 * Runs with `npm run test:299-posture-presentation`.
 * No network, no database, no provider call. Reads one frozen evidence file.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS PROVES THAT THE PARITY CHECK DOES NOT.
 *
 * `scripts/check-299-posture-vocabulary-parity.mjs` reads the two SOURCE files and proves the
 * vocabularies agree. It cannot prove that a response carrying a given posture actually renders it:
 * a presentation module could hold a perfect table and never consult it. This exercises
 * `presentExpertAnalysis()` end to end on a real server-shaped response for every posture, and on
 * a synthetic unknown one.
 *
 * ---------------------------------------------------------------------------------------------
 * THE §298 CASE IS THE REAL PERSISTED RESULT, NOT A FIXTURE.
 *
 * `verification/current/expert-activation-298/EXPERT-RESULT-298.json` is the response the deployed
 * server actually returned for the one Expert analysis that has ever run in production. It is read
 * from disk and pushed through the same `readFromExecution()` the panel uses. Hand-authoring a
 * STOP-shaped fixture would prove the module handles a shape someone imagined; §265's acceptance
 * made exactly that mistake with its request bodies and it is why §267 existed.
 *
 * NO PROVIDER CALL IS MADE. The file is the §298 execution, replayed.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  PRESENTABLE_POSTURES,
  POSTURE_RESTRICTS_WORK,
  posturePresentation,
  posturePresentationLabel,
  presentExpertAnalysis,
  readFromExecution,
} from "../expertPresentation";
import type { ExpertAnalysisExecuted } from "../expertTypes";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..", "..");
const SECTION_298_RESULT = resolve(
  repoRoot, "verification/current/expert-activation-298/EXPERT-RESULT-298.json");

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

/**
 * THE VOCABULARY, RESTATED HERE AS AN INDEPENDENT ASSERTION.
 *
 * Deliberately NOT read from the module under test — that would make this file agree with whatever
 * the module happens to say. The parity check binds this list to the server; this test binds the
 * module to this list. The two together bind the module to the server.
 */
const CURRENT_SERVER_POSTURES = [
  "CONTINUE", "CONTINUE_WITH_CONTROLS", "HOLD_PENDING_VERIFICATION", "STOP",
] as const;

/** The postures on which work may not continue, per §233's POSTURE_PERMITS_CONTINUED_WORK. */
const RESTRICTIVE = new Set<string>(["HOLD_PENDING_VERIFICATION", "STOP"]);

/** Language that must never label a posture the server said does not permit work. */
const PERMISSIVE_LANGUAGE =
  /\b(may continue|can continue|no restriction|no immediate restriction|proceed|cleared|safe to)\b/i;

/** The sentence HZ-5 put on screen above a STOP. */
const HZ5_FALLBACK_STEM = /could not be read/i;

// ================================================================ 1. the mapping itself

console.log("\n---- 1. every current server posture has intentional language ----\n");

for (const posture of CURRENT_SERVER_POSTURES) {
  const view = posturePresentation(posture);
  check(view.known, `${posture} is in the presentation vocabulary.`);
  check(!HZ5_FALLBACK_STEM.test(view.label),
    `${posture} does not render the unreadable fallback. (label: "${view.label}")`);
  check(view.label.trim().length > 0, `${posture} has a non-empty label.`);
  check(view.restrictsWork === RESTRICTIVE.has(posture),
    `${posture} restrictsWork=${RESTRICTIVE.has(posture)}.`);
}

check(PRESENTABLE_POSTURES.length === CURRENT_SERVER_POSTURES.length
  && CURRENT_SERVER_POSTURES.every((p) => PRESENTABLE_POSTURES.includes(p)),
  "The module's vocabulary is exactly the four current server postures — no more, no fewer. "
  + `(saw: ${PRESENTABLE_POSTURES.join(", ")})`);

for (const retired of ["STOP_WORK", "DO_NOT_START", "NO_IMMEDIATE_RESTRICTION"]) {
  check(!PRESENTABLE_POSTURES.includes(retired),
    `The retired §210J / §226 name ${retired} is gone from the vocabulary.`);
}

// ================================================================ 2. restrictive postures look restrictive

console.log("\n---- 2. every work-restricting posture is visibly restrictive ----\n");

for (const posture of CURRENT_SERVER_POSTURES.filter((p) => RESTRICTIVE.has(p))) {
  const view = posturePresentation(posture);
  check(view.restrictsWork === true, `${posture} carries restrictsWork, which drives the alert treatment.`);
  check(!PERMISSIVE_LANGUAGE.test(view.label),
    `${posture} is not labelled with permissive language. (label: "${view.label}")`);
}

check(/\bstop\b/i.test(posturePresentationLabel("STOP")),
  "STOP is labelled in words an inspector reads as stopping.");
check(/\bhold\b/i.test(posturePresentationLabel("HOLD_PENDING_VERIFICATION")),
  "HOLD_PENDING_VERIFICATION is labelled in words an inspector reads as holding.");
check(POSTURE_RESTRICTS_WORK.CONTINUE === false
  && POSTURE_RESTRICTS_WORK.CONTINUE_WITH_CONTROLS === false,
  "Neither permissive posture is marked restrictive — the repair did not become blanket alarm.");

// ================================================================ 3. unknown fails closed

console.log("\n---- 3. an unknown posture fails closed ----\n");

const SYNTHETIC_UNKNOWN = [
  "EVACUATE_AREA",   // a plausible future addition to the server contract
  "STOP_WORK",       // a retired §210J name the server no longer emits
  "continue",        // the right word in the wrong case: the lookup is exact, not fuzzy
  "",                // empty
];

for (const value of SYNTHETIC_UNKNOWN) {
  const view = posturePresentation(value);
  check(view.known === false, `${JSON.stringify(value)} is not treated as a known posture.`);
  check(HZ5_FALLBACK_STEM.test(view.label),
    `${JSON.stringify(value)} renders the explicit unreadable/requires-review presentation.`);
  check(view.restrictsWork === true,
    `${JSON.stringify(value)} FAILS CLOSED: it is presented as restricted, never as permissive.`);
  check(!PERMISSIVE_LANGUAGE.test(view.label),
    `${JSON.stringify(value)} does not borrow permissive language.`);
  check(view.label !== posturePresentationLabel("CONTINUE")
    && view.label !== posturePresentationLabel("CONTINUE_WITH_CONTROLS"),
    `${JSON.stringify(value)} does not default to a permissive posture's label.`);
}

// ================================================================ 4. through presentExpertAnalysis

console.log("\n---- 4. through the whole presentation path ----\n");

/** The §298 response, used as the response SHAPE so nothing here is imagined. */
const section298 = JSON.parse(readFileSync(SECTION_298_RESULT, "utf8")) as ExpertAnalysisExecuted;

function presentWithPosture(posture: string) {
  const mutated = JSON.parse(JSON.stringify(section298)) as ExpertAnalysisExecuted;
  const analysis = mutated.analysis as Record<string, unknown>;
  (analysis.posture as Record<string, unknown>).posture = posture;
  return presentExpertAnalysis(readFromExecution(mutated));
}

for (const posture of [...CURRENT_SERVER_POSTURES, ...SYNTHETIC_UNKNOWN]) {
  if (posture === "") continue; // an empty posture yields no posture block at all; covered below
  const p = presentWithPosture(posture);
  check(p.posture !== null, `${JSON.stringify(posture)} produces a posture block.`);
  check(p.posture?.value === posture,
    `${JSON.stringify(posture)} carries the server's own value through untouched.`);
  const known = (CURRENT_SERVER_POSTURES as readonly string[]).includes(posture);
  check(p.posture?.known === known,
    `${JSON.stringify(posture)} is marked ${known ? "known" : "unknown"} end to end.`);
  check(p.posture?.restrictsWork === (known ? RESTRICTIVE.has(posture) : true),
    `${JSON.stringify(posture)} reaches the panel with the correct restrictiveness.`);
}

const emptyPosture = presentWithPosture("");
check(emptyPosture.posture === null,
  "An absent posture value renders no posture block at all, rather than an empty one.");

/*
 * WHITESPACE IS NORMALISED, AND THAT IS NOT A GUESS.
 *
 * `asText()` has trimmed every string read off the analysis jsonb since §265, so a posture arriving
 * as "STOP " resolves to STOP. This is asserted rather than left implicit because it is the one
 * place the lookup is not byte-exact, and the reason it is safe is that trimming can only ever
 * produce the SAME token the server meant -- it cannot turn one posture into another, and it cannot
 * turn an unrecognised value into a recognised one. The lookup itself stays exact: "continue" and
 * "Stop" are asserted unknown above.
 */
for (const padded of ["STOP ", " STOP", "  CONTINUE_WITH_CONTROLS  "]) {
  const p = presentWithPosture(padded);
  check(p.posture?.known === true,
    `${JSON.stringify(padded)} is normalised to its exact posture rather than failing to read.`);
  check(p.posture?.value === padded.trim(),
    `${JSON.stringify(padded)} resolves to ${JSON.stringify(padded.trim())} and to nothing else.`);
}

// ================================================================ 5. the exact §298 result

console.log("\n---- 5. the exact persisted §298 result ----\n");

const analysis298 = section298.analysis as Record<string, unknown>;
const posture298 = (analysis298.posture as Record<string, unknown>).posture;
check(posture298 === "STOP",
  `The persisted §298 analysis carries posture STOP. (saw ${JSON.stringify(posture298)})`);

const presented298 = presentExpertAnalysis(readFromExecution(section298));
console.log(`      label          : ${presented298.posture?.label}`);
console.log(`      restrictsWork  : ${presented298.posture?.restrictsWork}`);
console.log(`      whatHappensNow : ${presented298.posture?.whatHappensNow?.slice(0, 110)}...`);

check(presented298.posture !== null, "The §298 result renders a posture block.");
check(!HZ5_FALLBACK_STEM.test(presented298.posture?.label ?? ""),
  'The §298 result NO LONGER renders "The operational posture could not be read" — this is HZ-5.');
check(/\bstop\b/i.test(presented298.posture?.label ?? ""),
  "The §298 result renders as a stop instruction.");
check(presented298.posture?.restrictsWork === true,
  "The §298 result is marked work-restricting, so the panel gives it the restrictive treatment.");
check((presented298.posture?.whatHappensNow ?? "").length > 0,
  "The server's own whatHappensNow prose is still carried, unchanged, beneath the label.");
check(presented298.mayPresentAsSettled === true,
  "The §298 authority copy is unaffected by the HZ-5 repair — it remains the server's "
  + "settledForUse, not a locally derived expression.");

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
