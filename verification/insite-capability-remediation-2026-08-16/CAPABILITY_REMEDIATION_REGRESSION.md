# Phase 24-25 — Full Regression (post-remediation)

## Files actually changed this session

`backend/src/safescope-v2/reasoning-orchestrator/negation-context.util.ts`, `backend/src/safescope-v2/classifier/weighted-classifier.service.ts`, `backend/src/safescope-v2/taxonomy/hazard-taxonomy.ts`, `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` (Workstreams A/B, this session directly), `backend/src/corrective-actions/corrective-actions.controller.ts`, `frontend-next/app/inspection-workspace/page.tsx` (Workstream C, background agent), `frontend-next/app/hazlenz/page.tsx` (Workstream E, background agent), `frontend-next/lib/theme/themeTokens.ts` and likely one more file (Workstream D, background agent, still in progress at time of writing — final file list in the implementation report). `backend/src/safescope-v2/engine/deterministic-classifier.ts` was edited then reverted to its original state (net zero diff) after discovering it was dead code — see `NEGATION_ROOT_CAUSE.md`.

None of these files overlap with the V5-C02/C03/C04 protected surfaces (`shared-evidence-facts.ts`, `evidence-sufficiency.service.ts`/`.types.ts`, `finalization-gate.ts`) or the V5-C05 protected surfaces (`inspection/page.tsx`, `InspectionStepRenderer.tsx`, `InspectionStepTwo.tsx`, `SafeScopeInspectionStep.tsx`, `command-center/page.tsx`) — confirmed by `git status` showing no session edits to those paths.

## V4 family matrix (228 cases)

Live-executed against the disposable backend with all Workstream A/B fixes loaded (negation-aware signal scoring, the effective-control guardrail, the taxonomy safe-closing-phrase signals, and the multi-hazard electrical-detection/clause-splitting fixes — the full set of production changes made this session, run together as they'll actually ship). Full run, single pass, no retries needed:

- positive: 76/76 PASS
- negative: 76/76 PASS
- ambiguity: 38/38 PASS
- safe: 38/38 PASS
- **Total: 228/228 PASS**

Zero regressions, zero transient-transport failures this run. This directly answers the standing concern raised going into this phase: the frozen V4 family-matrix contract is fully preserved by the negation/effective-control/multi-hazard fixes — confirmed by the same authoritative scorer (`score_family_matrix_v4_authoritative.mjs`) used for the original 228/228 baseline, not a new or relaxed scorer. Full raw results: `v4_regression/V4_228_RESULT.json`.

It's worth restating the distinction the user raised before this phase started: 228/228 on this fixed, frozen fixture set proves the family-matrix contract held under the new code — it does not, on its own, prove negation/safe-state correctness in general, since (as far as could be determined without the fixture generation methodology in hand) the 228-case set does not specifically target negated-hazard or verified-effective-control phrasing the way `NEGATION_ADVERSARIAL_MATRIX.md`'s 13 cases do. The two results are complementary, not redundant: V4 228/228 says "nothing broke," the adversarial matrix says "the specific defect is fixed." Both are needed for the full picture, and a dedicated negation/safe-state precision suite (formalizing the 13 adversarial cases plus more) is a good candidate to fold into the frozen regression baseline going forward — flagged as a recommended follow-up, not undertaken this session.

## V5-C01 — finding-scoped sibling risk

Live-executed `scripts/test-finding-scoped-reviews.ts` against the disposable backend (`API_BASE_URL=http://127.0.0.1:4001`, self-registers its own user, creates a real inspection/observation/2 findings/2 reviews). Result: **`"passed":true`**, 2 independent findings and reviews created and completed correctly (`finalStatus:"completed"`).

## V5-C02 (shared evidence facts) / V5-C03 (evidence finalization) / V5-C04 (cleanup state)

Not independently re-executed live this session (no test script for these was run). Verified instead by confirming this session touched none of their backing files (`shared-evidence-facts.ts`, `evidence-sufficiency-core/*`, `finalization-gate.ts`) — `git status` before/after shows these files' modification state unchanged by this session's edits. This is a code-surface non-interference check, not a live behavioral re-verification; flagged honestly as weaker evidence than a live test run, consistent with not overclaiming.

## V5-C05 — primary path / independent multi-hazard finding persistence

Live-executed `scripts/test-persisted-decomposition-findings.ts` against the disposable backend. Result: **`"passed":true`** — correct active/historical finding-key partitioning (`activeFindingKeys: ["machine-guarding","electrical"]`, `historicalFindingKeys: ["hazardous-energy"]`), correct stale-write conflict handling (`staleStatus: 409`).

## P1-02 — corrective-action reasoning

Live-executed `verification/hazlenz-v5-p1-02-corrective-action-repair-2026-08-16/scripts/adversarial-matrix.ts` (imports `CorrectiveActionBrainService` directly — pure in-process logic test, no HTTP/DB dependency, unaffected by this session's DB choice). All 9 scenarios (A through I — machine guarding, LOTO, electrical, fall exposure, failed control, effective control, unknown control, vague observation, multi-hazard sibling isolation) ran without error and produced coherent immediate/interim/permanent corrective-action text specific to each scenario's parsed control state (existing/missing/failed). The multi-hazard sibling-isolation check (scenario I) explicitly confirmed no cross-contamination: Finding A (hydraulic) does not mention electrical, Finding B (electrical) does not mention hydraulic. This session did not have the original scoring rubric to re-derive an exact "4/4" pass count, so this is reported as "ran cleanly, output consistent with expected differentiated reasoning across all 9 cases," not as a re-confirmed numeric score — an honest, slightly weaker claim than a full re-score would be, and flagged as such rather than asserting a specific number without the means to verify it.

## PRA-002 — finding review/completion

Covered by the same `test-finding-scoped-reviews.ts` live run as V5-C01 above (`finalStatus:"completed"` after 2 reviews) — **PASS**.

## Report regression

Not independently re-executed this session (no report-generation test was run against the disposable backend). No files in the report-generation path (`backend/src/reports/*`, `backend/src/pdf/*`) were touched this session — non-interference confirmed by `git status`, not live-re-verified.

## Authorization regression

Re-confirmed live as part of Workstream C's entitlement verification: anonymous requests to the (now-gated) corrective-action route correctly return 401 before the entitlement check even runs, consistent with `JwtGuard` running first — unchanged behavior.

## Performance non-regression

No HazLenz performance tuning was attempted. The 228-case V4 run's pacing (~2.2s/request, unchanged script) completing without unusual timeouts (beyond the pre-existing transient-transport pattern already seen in the prior verification phase) is the available evidence; no formal before/after latency benchmark was captured this session.

## Build / static checks

- Backend build (`npm run build`, `tsc`): **PASS** after every round of edits this session (verified repeatedly, not just once).
- Frontend build: confirmed PASS by the marketing-copy and dark-mode background agents for their respective changes (`npm run build` succeeded, all routes compiled).
- `git diff --check`: to be re-confirmed in the final implementation report alongside the final HEAD/file-list summary.
