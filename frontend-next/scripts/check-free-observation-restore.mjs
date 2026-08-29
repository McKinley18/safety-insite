#!/usr/bin/env node
/**
 * V1-FREEHIST-01 -- Free saved-observation restoration contract.
 *
 * Run: npm run check:free-observation-restore   (from frontend-next/)
 *
 * The defect this pins: the inspection workspace restored a persisted observation and its
 * HazLenz analysis from ONE conditional --
 *
 *     if (persistedObservation && currentAnalysis) { ... setObservation(rawText) ... }
 *
 * HazLenz classification is Pro-gated (POST /safescope-v2/classify answers 402 for Free), so
 * `currentAnalysis` is undefined on Free BY CONSTRUCTION. The whole block was skipped and the
 * observation text -- already fetched and sitting in `persistedObservation.rawText` -- was
 * thrown away. A Free account could save an observation and then never read it back, while
 * /register advertises "saved history".
 *
 * Re-reading your OWN observation is record-keeping, which Free is entitled to. Re-reading an
 * ANALYSIS is a Pro entitlement. The two restores must therefore stay decoupled.
 *
 * No test runner is configured in this workspace, so this is a self-checking script in the same
 * idiom as scripts/check-launch-pricing.mjs: part 1 simulates the restore contract against Free
 * and Pro fixtures, part 2 binds the SHIPPED source to that contract so the simulation cannot
 * drift away from the code it claims to describe.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE = "app/inspection-workspace/page.tsx";

let passes = 0;
let failures = 0;

function assert(condition, label, details) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
  if (details !== undefined) console.error(`     ${details}`);
}

const source = readFileSync(join(frontendRoot, WORKSPACE), "utf8");

// ---------------------------------------------------------------------------
// Part 1 -- the restore contract, simulated.
// ---------------------------------------------------------------------------

// Mirrors the selection expressions in the workspace's restore effect.
function restoreFrom(inspection) {
  const active = (inspection.findings || []).filter((f) => f.status !== "superseded");
  const target = active.find((f) => !f.finalReviewId) || active[0];
  const persistedObservation =
    (target && (inspection.observations || []).find((o) => o.id === target.observationId)) ||
    inspection.observations?.[0];
  const currentAnalysis = persistedObservation?.analyses
    ?.filter((a) => a.status !== "superseded")
    .sort((a, b) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];

  const state = { observation: "", observationId: "", analysis: null, analysisId: "", step: "capture" };
  if (persistedObservation) {
    state.observationId = persistedObservation.id;
    state.observation = persistedObservation.rawText;
  }
  if (persistedObservation && currentAnalysis) {
    state.analysisId = currentAnalysis.id;
    state.analysis = currentAnalysis.resultSnapshot;
    state.step = "review";
  }
  return state;
}

const FREE_TEXT = "Tail pulley guard missing; pinch point exposed from the walkway.";

// FREE: a Quick Capture observation exists and NO analysis can exist (classify -> 402).
const free = restoreFrom({
  findings: [],
  observations: [{ id: "obs-free", rawText: FREE_TEXT, analyses: [] }],
});
assert(free.observation === FREE_TEXT, "FREE: persisted observation text restores with no analysis");
assert(free.observationId === "obs-free", "FREE: observation identity restores with no analysis");
assert(free.analysis === null, "FREE: no analysis is fabricated");
assert(free.analysisId === "", "FREE: no analysis id is set");
assert(free.step === "capture", "FREE: stays on capture -- the review step is analysis-gated");

// PRO: observation + analysis both restore, and the review step is reached.
const PRO_TEXT = "Guard removed during maintenance; LOTO applied.";
const pro = restoreFrom({
  findings: [{ id: "f1", observationId: "obs-pro", status: "active", finalReviewId: null }],
  observations: [
    {
      id: "obs-pro",
      rawText: PRO_TEXT,
      analyses: [
        { id: "an-1", status: "superseded", requestVersion: 1, resultSnapshot: { v: 1 } },
        { id: "an-2", status: "active", requestVersion: 2, resultSnapshot: { v: 2 } },
      ],
    },
  ],
});
assert(pro.observation === PRO_TEXT, "PRO: observation text restores");
assert(pro.observationId === "obs-pro", "PRO: observation identity restores");
assert(pro.analysisId === "an-2", "PRO: newest non-superseded analysis restores");
assert(pro.analysis?.v === 2, "PRO: that analysis's snapshot restores");
assert(pro.step === "review", "PRO: lands on review");

// Regression guard for the original multi-observation bug: restore follows the finding still
// awaiting review, not observations[0].
const multi = restoreFrom({
  findings: [
    { id: "f1", observationId: "obs-1", status: "active", finalReviewId: "review-1" },
    { id: "f2", observationId: "obs-2", status: "active", finalReviewId: null },
  ],
  observations: [
    { id: "obs-1", rawText: "first", analyses: [{ id: "a1", status: "active", requestVersion: 1, resultSnapshot: {} }] },
    { id: "obs-2", rawText: "second", analyses: [{ id: "a2", status: "active", requestVersion: 1, resultSnapshot: {} }] },
  ],
});
assert(multi.observationId === "obs-2", "MULTI: restores the observation still awaiting review");

// ---------------------------------------------------------------------------
// Part 2 -- bind the shipped source to that contract.
// ---------------------------------------------------------------------------

const observationBlock = source.match(
  /if \(persistedObservation\) \{([\s\S]*?)\n\s{8}\}/,
);
assert(
  observationBlock !== null,
  "workspace restores the observation from a condition on persistedObservation ALONE",
  "Expected an `if (persistedObservation) {` block in the restore effect.",
);

const analysisBlock = source.match(
  /if \(persistedObservation && currentAnalysis\) \{([\s\S]*?)\n\s{8}\}/,
);
assert(
  analysisBlock !== null,
  "workspace still restores the analysis only when an analysis exists",
);

if (observationBlock && analysisBlock) {
  const obs = observationBlock[1];
  const ana = analysisBlock[1];

  assert(
    /setObservation\(persistedObservation\.rawText\)/.test(obs),
    "observation rawText restore lives in the observation-only block",
  );
  assert(
    /setRevisionText\(persistedObservation\.rawText\)/.test(obs),
    "revision text restore lives in the observation-only block",
  );
  assert(
    /setObservationId\(persistedObservation\.id\)/.test(obs),
    "observation identity restore lives in the observation-only block",
  );

  // The whole point of the fix: none of these may depend on an analysis existing.
  assert(
    !/setObservation\(/.test(ana) && !/setRevisionText\(/.test(ana),
    "observation restore is NOT repeated inside the analysis-gated block",
    "Re-coupling these is exactly the V1-FREEHIST-01 defect.",
  );

  // ...and analysis state must stay gated, or Free would render a phantom review step.
  for (const [needle, label] of [
    ["setAnalysisId(", "analysis id"],
    ["setAnalysis(", "analysis snapshot"],
  ]) {
    assert(
      ana.includes(needle) && !obs.includes(needle),
      `${label} restore stays gated on an actual analysis`,
    );
  }

  // STEP restore, generalized 2026-08-28. This pinned the literal `setStep("review")` inside the
  // analysis block. The workspace now restores to `setStep("hazlenz")` and reaches review only
  // through a user click gated on a selected risk cell, so the literal no longer appears and the
  // assertion failed against a product that had become SAFER, not broken.
  //
  // The property this existed to protect was never the word "review" — it was that Free, with an
  // observation and no analysis, must not be advanced past capture into a step that presumes an
  // analysis. So it is re-pinned to the property rather than the literal, which also makes it
  // strictly broader: ANY step restoration leaking into the observation-only block now fails it,
  // not just one particular destination.
  assert(
    /setStep\(/.test(ana) && !/setStep\(/.test(obs),
    "step restore stays gated on an actual analysis",
    "Observation-only restore must never advance the step; that is the V1-FREEHIST-01 defect.",
  );
}

// The Pro gate itself must remain untouched by this repair.
assert(
  /isEntitlementRefusal\(error\)/.test(source) && /setAnalysisLocked\(true\)/.test(source),
  "402 entitlement refusal still locks HazLenz analysis for Free",
);

// ---------------------------------------------------------------------------
// Part 3 -- the history half: list + resume.
//
// Restoration alone left "saved history" untruthful: /inspections fetched the list and rendered
// only its .length, so nothing could be reopened and starting a second Quick Capture stranded
// the first. These pin the list-and-resume surface that closed that.
// ---------------------------------------------------------------------------

const inspections = readFileSync(join(frontendRoot, "app/inspections/page.tsx"), "utf8");

assert(
  /persistedInspections\.map\(/.test(inspections),
  "/inspections renders the persisted inspections, not just their count",
  "Rendering only persistedInspections.length is the original V1-FREEHIST-01 history defect.",
);
// The resume entry point was renamed `resumeInspection` -> `openInspection` when reopening a
// COMPLETED inspection became a distinct destination. The name is not the property; the property
// is that a saved inspection can be reopened through the existing selection context. Pinned to
// the current name so the slice below binds to real source again — with a stale anchor,
// `indexOf` returned -1 and every assertion over the slice was evaluating the empty string, so
// three of them were passing or failing for no reason at all.
assert(
  /function openInspection\(/.test(inspections),
  "/inspections exposes a resume path for a saved inspection",
);

const resumeStart = inspections.indexOf("function openInspection(");
const resumeEnd = inspections.indexOf("async function addSite(");
assert(
  resumeStart !== -1 && resumeEnd > resumeStart,
  "the resume path is locatable in source (the slice below is not silently empty)",
);
const resume = inspections.slice(resumeStart, resumeEnd);
assert(
  /persistedInspectionId: inspection\.id/.test(resume),
  "resume selects the chosen inspection by its own id",
);
// Route assertion widened 2026-08-28: a completed inspection now resumes to /inspection-complete
// and everything else to the workspace, so the single literal push no longer matched. Both arms
// are asserted rather than either being dropped — routing a completed inspection back into the
// capture workspace, or an in-progress one to the completed page, are both real defects.
assert(
  /sentinel_selected_inspection_context/.test(resume)
    && /router\.push\(/.test(resume)
    && /"\/inspection-workspace"/.test(resume)
    && /"\/inspection-complete"/.test(resume)
    && /inspection\.status === "completed"/.test(resume),
  "resume reuses the existing selection context, and routes completed vs in-progress distinctly "
    + "(no new subsystem)",
);
assert(
  !/hasPlanEntitlement|planCode|entitlement/i.test(resume),
  "resume does NOT gate on entitlement -- reading back your own record is Free record-keeping",
);
assert(
  /Reopen/.test(inspections),
  "each saved inspection offers a Reopen control",
);

console.log(
  failures === 0
    ? `\nFree observation restore: ${passes} passed, 0 failed — observation restores without an analysis; analysis stays Pro-gated.`
    : `\nFree observation restore: ${passes} passed, ${failures} FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
