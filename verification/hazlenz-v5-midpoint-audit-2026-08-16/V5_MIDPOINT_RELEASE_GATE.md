# V5 Midpoint Audit — Phase 9: Release-Gate Reassessment

## Prior gate

`PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`, stated P0: 0, P1: 0.

## Reassessment

The prior gate's **P1: 0** claim is no longer accurate. This audit found two issues that meet a P1 bar —
materially misleading or safety-relevant in a normal production workflow — neither of which corrupts data,
crashes the system, or blocks a build (so neither is P0).

### P0 — 0

No crash, data-corruption, build-breaking, or destructive-workflow defect was found. Both backend
(`tsc`) and frontend (`next build`) complete cleanly on the current working tree.

### P1 — 2

1. **C01's independent-risk fix does not reach the flow behind the app's primary CTA.** The dashboard's
   most prominent "Start Inspection" button routes to `/inspection` → `/inspection-review` (the legacy
   flow), which still reads the pre-C01 shared `safeScopeResult.risk` object in `FindingsReviewList.tsx`,
   `RiskReviewSection.tsx`, and `FindingReviewEditor.tsx`. V5-C01 is marked CLOSED with browser-verified
   evidence, but that verification exercised only the canonical `/inspection-workspace` flow. For the
   majority of real users (those who click the primary CTA), sibling-finding risk contamination — the
   exact defect C01 was built to close — is still live in production today. This is materially misleading
   in a normal production workflow: a reviewer using the legacy flow has no way to know their findings'
   risk scores may be cross-contaminated by unrelated sibling hazards in the same observation.
2. **Corrective-action narrative benchmark regression, currently uncommitted.** A working-tree change to
   `corrective-action.service.ts` causes a new generic domain-boilerplate block to shadow the
   pre-existing component-aware narrative generator for guarding/electrical/fall/mobile/walking domains,
   confirmed by 3/4 benchmark scenarios failing. Output remains valid and safety-appropriate but loses
   real specificity. This is P1 because it is a regression in a live, user-facing intelligence field
   (`correctiveActionReasoning`) sitting uncommitted in the tree the audit was asked to evaluate — it
   should be resolved (or its intent confirmed as deliberate) before landing, not carried forward
   silently.

### P2 — 6

1. Control-effectiveness intelligence is dead code on both flows; risk scoring is control-blind, so an
   effective control produces no visible risk reduction and a failed control isn't reliably distinguished
   from "no control" (pre-existing, not a new V5 regression).
2. Historical-condition risk badge is not recomputed after reclassification — can visibly contradict the
   "Historical condition" badge shown beside it.
3. Planned-future-correction detection has no UI label or risk treatment at all — renders identically to
   an unaddressed hazard.
4. Clarification-required state is non-enforcing — a finding can be finalized with outstanding
   clarification questions and no warning.
5. Evidence-sufficiency scoring has confirmed negation-blind keyword defects (two of 13 test categories
   scored in the wrong direction) and a narrow finalization-gate coverage limit (5 hardcoded hazard IDs).
6. Corrective-action UI never displays which finding an action belongs to, despite the data model
   supporting it.

### P3 — 3

1. `resultStage`/`mayFinalize`/`finalizationGate` are correct but fully orphaned (zero consumers) —
   wasted computation, not a misleading signal, since nothing currently displays it incorrectly.
2. `DefensibleCorrectiveActionService` validation test has a stale/blunt assertion (STALE_TEST, no live
   impact — output is sanitized out of the API response).
3. `smoke-corrective-actions-organization-scope.ts` fixture uses a non-UUID `reportId` placeholder against
   a now-`uuid`-typed column (FIXTURE_DRIFT, confined to a verification script).

### Architecture debt

- Two parallel, independently-maintained HazLenz frontend flows (legacy `/inspection-review` vs. canonical
  `/inspection-workspace`) is the root cause of P1 #1 and several P2s. Continuing to build new backend
  signals without a plan to reach both flows (or retire one) will keep reproducing this class of gap.
- Dual standards-applicability engines reconciled ad hoc (pre-existing, out of V5 scope, noted for
  completeness).

### Test debt

- Corrective Action Intelligence Benchmark: 3/4 currently failing (tracks P1 #2, will resolve when that
  regression is fixed).
- `DefensibleCorrectiveActionService` validation script: 2 pre-existing false-positive failures
  (STALE_TEST, P3).

### UX debt

- Report and PDF surfaces omit most explainability signals (sufficiency, confidence-at-observation-level,
  finalization state) that the live review UI does or should show.

## Verdict

**Does any current issue make the product unsafe or materially misleading in a normal production
workflow? Yes** — P1 #1. A reviewer using the app's primary, most-discoverable entry point does not
receive the independent-risk correction that V5-C01 was built and verified to deliver.

**Revised gate: `PRODUCTION_READY_WITH_TRACKED_P1_ISSUES`** — not a clean `PRODUCTION_READY_WITH_KNOWN_
NON_BLOCKING_ISSUES` gate as previously stated. The product remains broadly usable and safe in its
canonical flow, no P0 exists, and neither P1 is a crash/corruption/build-blocker — but the "P1: 0" claim in
the prior gate is corrected to P1: 2, and the highest-value next phase (see
`V5_MIDPOINT_BACKLOG.md`) should close P1 #1 before further V5 capability work is layered on top of a
forked, inconsistently-patched frontend.
