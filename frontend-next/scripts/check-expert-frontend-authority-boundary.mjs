#!/usr/bin/env node
/**
 * §265 — THE FRONTEND EXPERT AUTHORITY BOUNDARY, CHECKED IN THE SOURCE.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A SOURCE CHECK AND NOT ONLY A BEHAVIOURAL TEST.
 *
 * `lib/expert/__tests__/expertPresentation.test.ts` proves that the presentation module reports
 * what the server said for the responses it is given. It cannot prove the ABSENCE of a second
 * derivation somewhere else in the Expert frontend — a component that quietly computes
 * `state === "CONFIRMED"` to decide whether to show a posture as final would pass every one of
 * those assertions, because the module it tests would still be honest.
 *
 * This reads the Expert frontend files and fails on the PATTERNS that constitute recreating server
 * authority in the browser. It is a structural check in the same spirit as the backend's
 * no-provider-call harness: the property is "this code cannot do X", and the evidence is that the
 * construct does not appear.
 *
 * Reads sources only. No database, no network, no build step.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** Every Expert frontend file. A file added to this feature must be added here too. */
const EXPERT_FILES = [
  "lib/expert/expertTypes.ts",
  "lib/expert/expertApi.ts",
  "lib/expert/expertPresentation.ts",
  "components/inspection/expert/ExpertAnalysisPanel.tsx",
  "components/inspection/expert/ExpertConfirmationCard.tsx",
];

let failed = false;
function fail(message) {
  console.error(`FAIL  ${message}`);
  failed = true;
}
function pass(message) {
  console.log(`ok    ${message}`);
}

/**
 * Comments are stripped before every pattern check.
 *
 * These files explain at length WHY they do not do certain things, and several of those
 * explanations name the construct they forbid. A check that read the prose would fail on the
 * sentence that promises the behaviour it is looking for — the same trap the backend's §261 P0-A
 * assertion documents, which is why that one reads the import graph rather than the text.
 */
function strip(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const sources = new Map();
for (const relative of EXPERT_FILES) {
  try {
    sources.set(relative, strip(readFileSync(resolve(root, relative), "utf8")));
  } catch {
    fail(`${relative} is listed as an Expert frontend file but does not exist`);
  }
}

// ---------------------------------------------------------------- 1. no locally derived authority

/**
 * THE FORBIDDEN CONSTRUCTS.
 *
 * Each is a way a browser could form its own opinion about whether an Expert conclusion may be
 * acted on. The server serves `effectiveDecision.settledForUse`, `confirmationRequired` and
 * `confirmationSubject`; a client that computes any of them has two answers to one question.
 */
const FORBIDDEN = [
  {
    // ASSIGNMENT ONLY, never comparison: `=` not followed by `=`. An object literal uses `:` and a
    // comparison uses `===`, so this fires on exactly the construct that would let a browser
    // produce its own value for a field the server owns.
    pattern: /\bsettledForUse\s*=(?!=)/,
    why: "`settledForUse` is assigned in the client; it is a server field and may only be copied",
  },
  {
    pattern: /\bconfirmationRequired\s*=(?!=)/,
    why: "`confirmationRequired` is assigned in the client rather than read from the response",
  },
  {
    // A state-name comparison used to decide whether a conclusion may be ACTED ON. State
    // comparisons that select a LAYOUT are fine and are how the total view map works; what is
    // forbidden is a comparison that produces an authority answer.
    pattern: /(mayPresentAsSettled|isSettled|isAuthoritative|canFinalize|isApproved)\s*[=:]\s*[^;\n]*ANALYSIS_/,
    why: "an authority flag is derived from an analysis state name in the browser",
  },
  {
    pattern: /driverRole|UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION|UNRESOLVED_RESPONSE_OR_FOLLOW_UP/,
    why: "the internal driver-role vocabulary appears in the client, which means the confirmation "
      + "rule is being reimplemented or its terminology exposed",
  },
  {
    pattern: /deriveConfirmationRequired|resolveConfirmationSubject|deriveEffectiveDecision/,
    why: "a server authority function is being reimplemented under its own name",
  },
  {
    pattern: /producer\s*=\s*["']server_authored["']/,
    why: "the client assigns Expert provenance, which only the server may confer",
  },
];

for (const [relative, source] of sources) {
  for (const { pattern, why } of FORBIDDEN) {
    if (pattern.test(source)) fail(`${relative}: ${why}`);
  }
}
if (!failed) pass("no Expert frontend file derives server authority locally");

// ---------------------------------------------------------------- 2. the authority copy is a copy

const presentation = sources.get("lib/expert/expertPresentation.ts") ?? "";
if (!/const\s+mayPresentAsSettled\s*=\s*decision\?\.settledForUse\s*===\s*true\s*;/.test(presentation)) {
  fail("expertPresentation.ts no longer copies `effectiveDecision.settledForUse` verbatim into "
    + "`mayPresentAsSettled`; any expression there is a second opinion about authority");
} else {
  pass("`mayPresentAsSettled` is a direct copy of the server's `settledForUse`");
}

if (!/const\s+humanSettled\s*=\s*decision\?\.humanSettled\s*===\s*true\s*;/.test(presentation)) {
  fail("expertPresentation.ts no longer copies `effectiveDecision.humanSettled` verbatim");
} else {
  pass("`humanSettled` is a direct copy of the server's field");
}

// ---------------------------------------------------------------- 3. the view map is total

const STATES = [
  "ANALYSIS_RUNNING", "ANALYSIS_FAILED", "ANALYSIS_REFUSED", "ANALYSIS_UNRESOLVED",
  "ANALYSIS_AVAILABLE", "ANALYSIS_AWAITING_CONFIRMATION", "ANALYSIS_CONFIRMED",
  "ANALYSIS_OVERRIDDEN",
];
const viewMap = presentation.match(/VIEW_FOR_STATE[^=]*=\s*\{([\s\S]*?)\n\};/);
if (!viewMap) {
  fail("expertPresentation.ts no longer declares VIEW_FOR_STATE as a literal map");
} else {
  const missing = STATES.filter((state) => !new RegExp(`\\b${state}\\s*:`).test(viewMap[1]));
  if (missing.length > 0) {
    fail(`VIEW_FOR_STATE does not cover ${missing.join(", ")}; an uncovered state would fall `
      + "through to whatever the lookup returns");
  } else {
    pass(`VIEW_FOR_STATE covers all ${STATES.length} server states`);
  }
}

// ---------------------------------------------------------------- 4. only accepted fields are sent

const api = sources.get("lib/expert/expertApi.ts") ?? "";
const SERVER_OWNED = [
  "producer", "analysisState", "confirmationRequired", "expertExecutionId", "candidateIdentity",
  "engineVersion", "resultSnapshot", "posture", "admission", "reviewedByUserId", "reviewId",
];
const bodyAssignments = [...api.matchAll(/body\.(\w+)\s*=/g)].map((match) => match[1]);
const declaredInline = [...api.matchAll(/^\s{4}(\w+):\s/gm)].map((match) => match[1]);
const sent = new Set([...bodyAssignments, ...declaredInline]);
const leaked = SERVER_OWNED.filter((field) => sent.has(field));
if (leaked.length > 0) {
  fail(`expertApi.ts sends server-owned field(s): ${leaked.join(", ")}`);
} else {
  pass("expertApi.ts sends only the accepted §262/§264 request fields");
}

// ---------------------------------------------------------------- 5. the legacy path is not reused

for (const [relative, source] of sources) {
  if (/saveAnalysisSnapshot/.test(source)) {
    fail(`${relative} uses saveAnalysisSnapshot, which is the legacy client-supplied persistence `
      + "path; routing a server-authored Expert result through it would hand the client authorship");
  }
}
pass("no Expert frontend file routes an Expert result through the legacy snapshot path");

// ---------------------------------------------------------------- 6. no settled vocabulary

/**
 * An unsettled conclusion may never be labelled approved, final, cleared or safe to proceed. The
 * behavioural test covers the presentation module's own table; this covers the two components,
 * whose literal strings that test never sees.
 */
const SETTLED_WORDS = /\b(approved|finali[sz]ed|safe to proceed|cleared for work|signed off)\b/i;
for (const relative of [
  "components/inspection/expert/ExpertAnalysisPanel.tsx",
  "components/inspection/expert/ExpertConfirmationCard.tsx",
]) {
  const source = sources.get(relative) ?? "";
  const strings = [...source.matchAll(/["'`]([^"'`\n]{12,})["'`]/g)].map((match) => match[1]);
  const offending = strings.filter((text) => SETTLED_WORDS.test(text));
  if (offending.length > 0) {
    fail(`${relative} contains settled-conclusion vocabulary: ${JSON.stringify(offending[0])}`);
  }
}
pass("no Expert component labels a conclusion approved, final, cleared or safe to proceed");

// ---------------------------------------------------------------- 7. the qualifier is present

const panel = sources.get("components/inspection/expert/ExpertAnalysisPanel.tsx") ?? "";
if (!/!presentation\.mayPresentAsSettled\s*&&/.test(panel)) {
  fail("ExpertAnalysisPanel.tsx no longer qualifies the posture on `!mayPresentAsSettled`; an "
    + "unsettled posture would render as though it were a conclusion");
} else {
  pass("the panel qualifies an unsettled posture rather than presenting it bare");
}

if (failed) {
  console.error("\nEXPERT FRONTEND AUTHORITY BOUNDARY: FAIL");
  process.exitCode = 1;
} else {
  console.log("\nEXPERT FRONTEND AUTHORITY BOUNDARY: PASS");
}
