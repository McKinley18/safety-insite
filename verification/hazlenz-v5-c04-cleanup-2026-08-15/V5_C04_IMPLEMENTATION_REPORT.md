# HazLenz V5-C04 — Dead / Placeholder Intelligence Cleanup — Implementation Report

Date: 2026-08-16
Repository: /Users/mckinley/Desktop/Safety_InSite, branch main
HEAD before and after: 24e37703ff37d96b0e42cde4b85ccdef89b2bf2a (unchanged; no commits made)

## Status

V5_C04_CLOSED. Release gate: PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES (unchanged; C04 was
cleanup, not a P0/P1 remediation).

## Summary

Investigated the 4 targets named by the task plus one directly-connected 5th component discovered
via the task's own required consumer-tracing methodology. Used runtime instrumentation (not static
grep alone, per the explicit critical rule) to confirm liveness/deadness of every target before
changing anything.

Two components (`CorrectiveActionControlMapService`, `GovernanceReportAdapterService`) were
confirmed as live placeholder stubs whose fully-hardcoded output was reaching the API response and
persisted `resultSnapshot` on every classify() call, with zero downstream consumers anywhere in the
codebase. Both were removed from the production path and deleted, along with their now-orphaned
unit-validation scripts.

Three components (`SafeScopeActionQualityService`, `SafeScopeControlEffectivenessService`, and
their container `SafeScopeNativeReasoningService`) were confirmed dead via instrumentation but
could not be removed: their only reachable construction site lives inside the hash-protected V4
production file `safescope-v2.service.ts`, which this phase is forbidden to edit. They were left in
place with explicit source-level markers documenting why they're dead and why they weren't removed.

Evidence-sufficiency's top-level verdict was confirmed live and genuinely consumed internally by 6
sibling engines (not dead), but confirmed disconnected from the finalize/clarification decision
(`resultStage`/`mayFinalize`) — a narrower and different problem than "dead code." Per the task's
explicit instruction, this was left unwired (a product-behavior change requiring dedicated
validation, deferred to V5-C02/C03) with an explicit documentation marker at the computation site.

## Files changed

Modified (4):
- `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts` — removed
  `controlMap`/`adapter` computation, their engine fields, their imports, and their keys from the
  returned object; added a documentation comment at the evidence-sufficiency computation site.
- `backend/src/safescope-v2/native-reasoning/native-reasoning.service.ts` — added
  DEFER_WITH_EXPLICIT_MARKER documentation comment above the class declaration.
- `backend/src/safescope-v2/action-quality/action-quality.service.ts` — added
  DEFER_WITH_EXPLICIT_MARKER documentation comment above the class declaration.
- `backend/src/safescope-v2/control-effectiveness/control-effectiveness.service.ts` — added
  DEFER_WITH_EXPLICIT_MARKER documentation comment above the class declaration.

Deleted (6):
- `backend/src/safescope-v2/corrective-action-control-map/corrective-action-control-map.service.ts`
- `backend/src/safescope-v2/corrective-action-control-map/corrective-action-control-map.types.ts`
- `backend/src/safescope-v2/governance-report-adapter/governance-report-adapter.service.ts`
- `backend/src/safescope-v2/governance-report-adapter/governance-report-adapter.types.ts`
- `backend/scripts/validate-safescope-corrective-action-control-map.ts` (orphaned by the above deletion; only ever imported the deleted service)
- `backend/scripts/validate-safescope-governance-report-adapter.ts` (same)

No files under any of the 6 hash-protected paths were touched. No commits were made. `git diff
--check` is clean.

## Behavior intentionally changed

- `POST /safescope-v2/classify` responses no longer contain `controlMap` or `adapter` fields.
  Confirmed via live before/after capture: both fields present pre-fix, both absent post-fix.
- `hazlenz_analyses.resultSnapshot` no longer persists `controlMap`/`adapter` for any classify()
  call made after this change (existing historical rows are unaffected; no data migration was
  performed or required, since these were never read back by any consumer).
- Response payload size reduced ~1.7% (76,608 → 75,324 bytes for the same fixture).

## Behavior intentionally preserved / not changed

- `SafeScopeNativeReasoningService` and its sub-engines remain instantiated (unavoidable given the
  protected-file constraint) but were already producing zero effect on any decision or output; this
  remains true after the change. No functional behavior differs.
- Evidence-sufficiency's internal consumption by 6 sibling engines is untouched. Its
  non-wiring into finalize/clarification gating is untouched (was already unwired; remains
  unwired, now explicitly documented rather than silently disconnected).
- `resultStage`/`mayFinalize` logic, `transition()`'s completion-gate logic (PRA-002), V5-C01's
  finding-scoped `riskSnapshot` computation, `CorrectiveActionBrainService`, `ActionEngineService`,
  `DefensibleCorrectiveActionService`, and `SafeScopeCorrectiveActionReasoningService` (the live
  corrective-action/control engines) were not touched.

## Validation results

See `V5_C04_VALIDATION_RESULTS.json` for full detail. All 12 required checks (C04-01 through
C04-12) PASS. Two pre-existing, unrelated defects were discovered incidentally during the
regression sweep and are documented but not fixed (out of scope for a placeholder-cleanup phase):
a 2-case failure in `validate-safescope-defensible-corrective-action.ts`, and a compile error in
`smoke-corrective-actions-organization-scope.ts` caused by a DTO that gained required fields the
script's fixture doesn't supply. Neither file was touched by any C04 edit; both are confirmed
pre-existing via git status against HEAD and this session's own tool-call history.

## Regressions run

- `test-canonical-workflow.ts` — passed:true
- `test-finding-scoped-reviews.ts` — passed:true (also serves as the direct PRA-002 regression)
- `test-persisted-decomposition-findings.ts` — passed:true
- `test-private-storage-reports.ts` — passed:true
- `validate-safescope-evidence-sufficiency.ts` — 6/6 passed
- `validate-safescope-action-quality-gauntlet.ts` — ran clean (standalone unit-level, unaffected by dead-chain status)
- `validate-safescope-control-effectiveness-gauntlet.ts` — ran clean (same)
- `validate-safescope-corrective-action-reasoning.ts` — passed
- Backend build (`tsc --noEmit`) — clean, before and after
- Frontend build — not run; no shared API type was changed (frontend never referenced
  `controlMap`/`adapter`, confirmed via repo-wide grep with zero matches before this change)
- `git diff --check` — clean

## Protected V4 hashes

Confirmed identical at both the mid-investigation checkpoint and the final checkpoint (post all
edits). No tool call in this session touched any of the 6 protected paths.

- `backend/src/safescope-v2/safescope-v2.service.ts`:
  `f076a568396a76e810191fd3b82b40acb342bd6781ee072ef4254e33ad5c986a`
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`:
  `6e48b3c0fb0f38d651cbc747eb056b78a4aa413b44b2769ed16075febe1828a8`
- `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json`:
  `1d75b2a517d359d59860f00a17868ac2116821a1540df4dea43bbd9da3359470`
- `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json`:
  `8c38d05198fc3bacc88eda436dddea6608680034b972587a11c217744bc12d97`
- `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json`:
  `2a47473a3c3ef82e7ff95be22850b6c1a96e1f3ae3e15346997654370b978604`
- `verification/hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs`:
  `60eb6adc54f43b022b3fdd7f91f63053ff3931ab6b5107b54cc823e641a446b3`

## Disposable infrastructure

Database `phase130_c04_20260816` and disposable backend (port 4300) fully torn down. Scratch
storage directory removed. Original `safescope` database was never targeted by any command in this
session.

## Remaining architecture debt / recommendation for V5-C02

- The dead-but-protected chain (`SafeScopeNativeReasoningService` and its 10 sub-engines, 2 of
  which are the confirmed-dead targets here) cannot be resolved without a phase authorized to edit
  `safescope-v2.service.ts`. A future phase should either (a) delete the dead instantiation from
  that file once it is no longer protected, or (b) deliberately wire it in as a validated,
  intentional second reasoning pass — not leave it in permanent limbo.
- Evidence-sufficiency's verdict is ready to be wired into finalize/clarification gating; this is
  explicitly recommended as V5-C03 scope, not C04's.
- The corrective-action/control engine landscape has 4 confirmed-live engines
  (`CorrectiveActionBrainService`, `ActionEngineService`, `DefensibleCorrectiveActionService`,
  `SafeScopeCorrectiveActionReasoningService`) with overlapping but distinct responsibilities. No
  consolidation was performed here (explicitly out of scope); `V5_C04_ENGINE_DISPOSITION_MAP.json`
  is intended as the starting map for a future dedicated consolidation phase.
- Two pre-existing, unrelated defects (noted above) should be triaged separately.
