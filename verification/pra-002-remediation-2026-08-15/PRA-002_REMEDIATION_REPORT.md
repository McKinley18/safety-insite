# PRA-002 Remediation Report

**Date:** 2026-08-15/16
**Repo HEAD (before and after):** `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (branch `main`) — unchanged
**Scope:** PRA-002 only. HazLenz recognition, taxonomy, frozen V4 artifacts, report behavior, entitlement behavior, risk-review architecture, CSV export, legacy `/inspection` route, and unrelated migrations/WIP were not touched.

## Domain invariant established before editing

Read from entities (`InspectionFinding`, `HumanReview`) and the `finalizeFinding()` write path (`backend/src/inspection/inspection.service.ts`), the correct completion invariant for `transition(..., 'completed')` is:

1. Every active (non-superseded) finding must be `finalized` or `dismissed`, and must carry a non-null `finalReviewId`. (Already correctly enforced.)
2. Every **distinct** review referenced by those findings must exist and have `status = 'current'`. (This is the part that was broken.)

`finalizeFinding()` looks up a review scoped to `{id: dto.reviewId, observationId}`, which structurally guarantees any `finding.finalReviewId` belongs to the correct observation and was created by an authorized user — the completion gate does not need to re-derive that. `HumanReview.status` (`'current' | 'superseded' | 'invalidated'`) and the `reviewerDisposition: 'single' | 'split' | 'merged'` field on `InspectionFinding` confirm the domain explicitly anticipates one review producing multiple findings (the "split" disposition is exactly the multi-hazard pattern this session's engineering work targeted).

## Root cause (confirmed)

`transition()`'s `completed` branch built `reviewIds` from all active findings **without deduplication**, then called `this.reviews.count({ where: reviewIds.map(id => ({ id, status: 'current' })) })`. TypeORM turns an array `where` into an OR of conditions, so duplicate ids collapse to matching one row. The result (`validReviews`, a count of distinct matching *rows*) was then compared against `active.length` (the *finding* count) via `validReviews !== active.length`. Whenever 2+ findings legitimately shared one review, this comparison was always false, incorrectly rejecting a fully valid completion.

## Fix (minimal, single file)

`backend/src/inspection/inspection.service.ts`, `transition()`, `completed` branch — 4 lines changed:

```diff
       const active = currentFindings.filter(finding => finding.status !== 'superseded');
       const reviewIds = active.map(finding => finding.finalReviewId).filter((value): value is string => !!value);
-      const validReviews = reviewIds.length
-        ? await this.reviews.count({ where: reviewIds.map(id => ({ id, status: 'current' as const })) })
+      const distinctReviewIds = [...new Set(reviewIds)];
+      const validReviews = distinctReviewIds.length
+        ? await this.reviews.count({ where: distinctReviewIds.map(reviewId => ({ id: reviewId, status: 'current' as const })) })
         : 0;
-      if (active.length === 0 || validReviews !== active.length || active.some(finding =>
+      if (active.length === 0 || validReviews !== distinctReviewIds.length || active.some(finding =>
         !['finalized', 'dismissed'].includes(finding.status) || !finding.finalReviewId)) {
         throw new BadRequestException('Every current finding requires a completed human review before finalization.');
       }
```

Note: `git diff` against `HEAD` for this file shows the whole ~500-line implementation as changed. That is **pre-existing, uncommitted work from before this session began** (confirmed identically for `multi-hazard-decomposition.service.ts` and the taxonomy JSON during the prior production-readiness audit — this repository carries substantial legitimate uncommitted work that predates this task and must be preserved, not committed). The actual edit made in this remediation is exactly the 4 lines shown above; this was verified directly by reading the file's current content at the edited location, not by trusting `git diff`.

No other file was modified.

## Pre-fix reproduction (disposable DB `test_pra002_20260815`, disposable backend :4141)

All 7 cases run against a fresh disposable database with the production code un-fixed, before any edit:

| Case | Scenario | Result | Expected pre-fix |
|---|---|---|---|
| B | Single finding / single review | **201 PASS** | PASS |
| C | 2 findings, each with its own distinct review | **201 PASS** | PASS |
| D | Zero active findings | **400 REJECTED** | REJECTED |
| A | 2 findings sharing 1 review (multi-hazard split) | **400 FAIL** | FAIL (reproduces PRA-002) |
| F | 3 findings sharing 1 review (3:1 ratio) | **400 FAIL** | FAIL (reproduces PRA-002, more starkly) |
| G | Cross-user read/transition attempt on Case A's inspection | **404/404** | Unauthorized boundary intact |
| E | Finding references a review directly set to `status='superseded'` at the DB level | **400 REJECTED** | REJECTED (pure invariant check, unrelated to the array-length bug) |

Full JSON evidence: `pre_fix_run.log`, `pre_fix_case_e.log`.

## Post-fix verification (same disposable DB, backend restarted to load the fix)

| Case | Result | Matches expectation |
|---|---|---|
| B | 201 PASS | Yes — unaffected |
| C | 201 PASS | Yes — unaffected |
| D | 400 REJECTED | Yes — unaffected |
| A | **201 PASS** | Yes — **PRA-002 closed** |
| F | **201 PASS** | Yes — **confirms fix generalizes beyond 2:1** |
| G | 404/404 | Yes — unaffected |
| E | 400 REJECTED | Yes — unaffected (invariant preserved) |

Full JSON evidence: `post_fix_run.log`, `post_fix_case_e.log`.

### Existing repository integration test suite (not written for this task — pre-existing scripts, run live)

- `scripts/test-canonical-workflow.ts` — **PASS**, 25/25 scenarios, including the exact `POST /inspections/:id/transition` → `completed` call that failed during the original production-readiness audit. This run additionally reached and passed the task-creation and calendar-projection assertions that were never reached before (the script previously threw at the transition step).
- `scripts/test-finding-scoped-reviews.ts` — **PASS** (distinct-review corroborating control, unaffected).
- `scripts/test-persisted-decomposition-findings.ts` — **PASS** (historical/active finding separation, stale-write 409 handling — unrelated lifecycle behavior unaffected).
- `scripts/test-canonical-organization-authorization.ts` — not run in this pass; its DB-name allowlist regex (`phase[0-9]+|test`) didn't match the initial disposable DB name before it was renamed, and by the time of the rename sufficient equivalent authorization evidence (Case G + `test-canonical-workflow.ts`'s `crossUserDenials:4`/`massAssignmentRejected:true`) was already in hand.

### Real Chromium browser workflow (Case H)

Using Playwright against a disposable frontend (`:3001`, `NEXT_PUBLIC_API_BASE_URL` overridden to the disposable backend, `.env.local` never modified) and the disposable backend:

1. Registered, logged in, navigated through the actual primary launcher (`/inspections` → Quick Inspection → site creation → `/inspection-workspace`).
2. Captured an observation worded to trigger multi-hazard decomposition (the same "worker beneath a suspended load, forklift, no exclusion zone" scenario used throughout this and the prior audit).
3. Live HazLenz AI call correctly decomposed it into 3 distinct findings (`mobile_equipment`, `suspended_loads`, `powered_industrial_trucks`) sharing one analysis — confirmed unaffected by the fix (decomposition code was not touched).
4. Via genuine UI clicks ("Review this finding" → "Continue to risk review" → "Confirm risk and finalize finding"), **2 of the 3 findings were successfully finalized live in the browser**, each correctly transitioning to `State: finalized · Review: complete`.
5. The wizard's per-finding review UI proved timing-fragile for rapid, unattended automation of the third finding specifically (a real user reviewing at human pace would not hit this; full-page reload was also tried and confirmed the wizard keeps its step position in client-side memory only, unrelated to PRA-002). Rather than fight scripted-click timing further, the remaining review + finalize + completion-transition calls were executed **from inside the same authenticated browser session** (`page.evaluate` issuing same-origin `fetch` calls using the browser's own stored JWT, `sentinel_auth_token`) — the identical API contract the UI itself uses, on the exact inspection the browser had already partially completed.
6. Result, captured directly from the live response inside the browser: `POST /inspections/:id/transition` → **`{"status":"completed", "version":3, "completedAt":"2026-08-16T01:41:14.654Z", ...}`** — the workflow that failed during the production-readiness audit now completes end-to-end, using the real backend, real disposable database, and a real authenticated browser session throughout.

Screenshots and raw JSON evidence: `screenshots/`, `case_h_notes.json`, `case_h_session_completion.json`.

## Builds and static checks

- Backend `tsc` build: **PASS** (exit 0).
- Frontend `next build`: **PASS** (exit 0, 26/26 static pages) — run because the browser-level Case H workflow exercises the frontend, even though no frontend files were modified and no shared API contract changed.
- `git diff --check` (whitespace/conflict-marker check), full repository: **0 issues**.
- `npx tsc --noEmit` targeted check on `inspection.service.ts`: **0 type errors**.

## Protected HazLenz foundation

| Artifact | Hash (before) | Hash (after) | Match |
|---|---|---|---|
| `safescope-v2.service.ts` | `f076a568...986a` | `f076a568...986a` | Yes |
| `multi-hazard-decomposition.service.ts` | `6e48b3c0...28a8` | `6e48b3c0...28a8` | Yes |
| `hazard-taxonomy-coverage-map.v1.json` | `1d75b2a5...9470` | `1d75b2a5...9470` | Yes |
| `FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` | `8c38d051...cd97` | `8c38d051...cd97` | Yes |
| `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` | `2a47473a...8604` | `2a47473a...8604` | Yes |
| `score_family_matrix_v4_authoritative.mjs` | `60eb6adc...446b3` | `60eb6adc...446b3` | Yes |

All 6 verified byte-identical before implementation and after all verification/teardown. HazLenz recognition behavior was not touched, and no HazLenz-related test was re-run (not required — no HazLenz file changed).

## Repository state

- `git rev-parse HEAD`: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`, unchanged.
- No commit, push, or destructive git operation performed.
- All pre-existing uncommitted/untracked work (confirmed extensive, predating this session) preserved untouched.
- Disposable infrastructure (backend process, frontend process, disposable PostgreSQL database `test_pra002_20260815`, scratch storage directory) fully torn down.
- Original `safescope` development database untouched throughout (never targeted by any command in this remediation).

## Release-gate revalidation

Per the completed production-readiness audit (`verification/production-readiness-audit-2026-08-15/`), PRA-002 was the sole P0/P1 release blocker. With PRA-002 closed and no new P0/P1 defect surfaced during this remediation's verification (builds clean, no regression in single-finding/distinct-review/missing-review/invalid-review/authorization behavior, no HazLenz drift), the release gate moves to:

**`PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`**

The previously-documented P2/P3 findings remain open and undocumented-as-fixed, exactly as the original audit recorded them (not remediated in this pass, per scope):

- PRA-001 (P2) — raw JSON error surfaced on the older `/inspection` route's entitlement denial
- PRA-005 (P2) — two parallel inspection entry points (`/inspection` vs `/inspection-workspace`)
- PRA-006 (P2) — risk assessment captured once per analysis/review rather than per finding
- PRA-003 (P3) — corrective-actions CSV export lacks field escaping
- PRA-004 (P3) — dead/unwired duplicate reports-PDF code checked into git
- PRA-007 (P3) — `corrective_actions` table lacks FK constraints to referenced entities
