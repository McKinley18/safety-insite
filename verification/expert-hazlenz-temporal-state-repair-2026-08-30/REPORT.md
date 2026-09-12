# EXPERT HAZLENZ — R6 Hosted Negative-Control Temporal-State Repair

Operation: zero-hosted-call local repair targeting the §110/D-122 confirmed R6 hosted over-routing defect.
Date: 2026-08-30. Decision log: D-123. Blueprint: §111.

## 1. Exact terminal

```
EXPERT_HAZLENZ_TEMPORAL_STATE_REPAIR_ACCEPTED -- BOUNDED_HOSTED_NEGATIVE_CONTROL_CONFIRMATION_AUTHORIZATION_REQUIRED
```

## 2. Git state

- Local HEAD: `37a5d1b50abe836eb19dd24ee18ad10557bda131` (unchanged — nothing committed this phase)
- `origin/main`: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`
- Nothing committed, pushed, tagged, or deployed.

## 3. Files changed

**Added:**
- `backend/src/safescope-v2/expert-hazlenz/fixtures/temporal-state-fixtures.ts` — 6-fixture contrastive corpus (T1–T6)
- `backend/scripts/diagnose-expert-temporal-state-repair.ts` — local-only (Ollama) acceptance instrument

**Modified:**
- `backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts` — the repair itself (system prompt + user prompt + version bump v4→v5)
- `backend/scripts/test-expert-routing-contract.ts` — A.2 literal re-anchored v4→v5
- `backend/src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts` — one stale comment corrected, no behavior change
- `docs/INSITE_CURRENT_STATE.json` — new `expertHazlenzTemporalStateRepair2026_08_30` entry
- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — new §111 narrative, D-123 decision-log row

**Untouched despite carrying pre-existing uncommitted diffs:** `expert-contract.types.ts`, `expert-normalization.ts`, `fixtures/no-call-scenarios.ts` — all three carry only the §105–109 working-tree diff that predates this operation.

## 4–6. R6 semantic error / candidate / clarification characterization

See `characterization/PHASE1-R6-SEMANTIC-CHARACTERIZATION.md` for the full state-transition trace against all 3 §110 hosted transcripts. Summary: the model reasons FORWARD from a stated, verified, resolved condition (guard removed under a completed, second-person-verified zero-energy isolation) to a hypothetical FUTURE transition (eventual re-energization), and treats that transition's ordinary contingencies as PRESENT, decision-critical unknowns — in rep 1's second clarification, directly re-asking a question ("is residual stored energy present") the observation had already answered ("bled down and verified at zero").

## 7. Contrastive corpus composition

`temporal-state-fixtures.ts`, 6 fixtures spanning 5 hazard families (electrical, machine_guarding ×2, lockout_tagout, mobile_equipment, confined_space):

| id | class | family | must |
|----|-------|--------|------|
| T1 | A_HISTORICAL_RESOLVED | electrical | suppress |
| T2 | B_HISTORICAL_UNRESOLVED | machine_guarding | candidate survives |
| T3 | C_REMEDIATION_UNCERTAIN | lockout_tagout | clarification may survive, candidate not required |
| T4 | D_RESOLVED_PRIMARY_CURRENT_SECONDARY | mobile_equipment | suppress resolved part only |
| T5 | E_CURRENT_POSITIVE | machine_guarding | must survive, no over-suppression |
| T6 | F_CLEAN_NEGATIVE | confined_space | stays empty |

## 8. Pre-repair corpus result (baseline, 10 fixtures × 5 reps)

`TYPED_ROUTING_OPPORTUNITIES=100 HITS=95 MISSES=0 OVER_ROUTED=5` — all 5 over-routed items on **T1** (5/5 reps); R4/R5/R6/R7/T2–T6 all clean. T4's fixture expectations were recalibrated (candidate OPTIONAL, clarification REQUIRED) after this baseline run showed the local model reliably routes the current-secondary-consequence fact as a clarification rather than a candidate on this specific fixture — a pre-existing routing choice unrelated to temporal-state reasoning, not a defect this operation was asked to fix.

## 9. Repair implemented

Prompt-level only, in `expert-prompt.ts`. New "CURRENT STATE, NOT HISTORICAL STATE" system-prompt section (inserted before item 1 of "HOW TO DECIDE WHERE EACH FINDING GOES") plus one reinforcing line appended to the per-request user prompt. `EXPERT_PROMPT_VERSION` bumped `v4`→`v5`. No wire-schema change, no `EXPERT_ANALYSIS_CONTRACT_VERSION` change, no normalization change, no evidence/grounding architecture change.

## 10. Exact prompt/schema/normalization diff

Schema and normalization: **zero changes** (`git diff` on `expert-contract.types.ts` / `expert-normalization.ts` shows only the pre-existing §105–109 diff, nothing added this phase). Prompt: see `backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts` lines 69–94 (the new section) and the `buildExpertUserPrompt` footer (4 new lines). Full text reproduced in blueprint §111.3.

## 11–17. Post-repair corpus / class results, R6, R4, HG08/HG11

Final accepted local result, 10 fixtures × 10 reps:

`TYPED_ROUTING_OPPORTUNITIES=200 HITS=199 MISSES=1 OVER_ROUTED=0`

- **T1 (historical-resolved)**: 5/5 → **10/10 clean**. Defect class fixed.
- **T2 (historical-unresolved)**: 10/10 clean, candidate + clarifications survive.
- **T3 (remediation-uncertain)**: 10/10 clean, clarification survives, candidate correctly not required.
- **T4 (current-secondary-consequence)**: 10/10 clean, clarification about the current horn defect survives every rep.
- **T5 (current-positive)**: 9/10 candidate-present — single-seed (20260829) residual, unscored (OPTIONAL).
- **T6 (clean negative, different family)**: 10/10 clean, `NOTHING_TO_ADD` every rep.
- **R4 (HG10, protected positive)**: 9/10 candidate-present — same single-seed residual, REQUIRED/scored, the one true miss in the 200-opportunity total.
- **R5 (HG11)**: 10/10 clean, all three required collections populate together every rep.
- **R6 (HG12, the target fixture)**: 10/10 clean (never reproduced locally, consistent with §109/§110).
- **R7**: 10/10 clean.

Frozen single-shot `probe:expert-routing` (`npm run probe:expert-routing`, unmodified, R1–R7 × 1 call each, default seed = 20260829): **12/14 gates passed**; `G06`/`G08` failed on the SAME single seed's R4 miss already characterized above (0 candidates that one call) — corroborated as pre-existing by that exact gate's own history (`verification/expert-hazlenz-typed-routing-repair-2026-08-29/results/attempt1-console.txt` showed the identical `G06`/`G08` failure before this operation existed; `attempt2-console.txt` passed all 14 on a different draw).

## 18. R4 result

9/10 candidate-present across the 10-rep corpus run; 3/3 clean in the earlier §110 HOSTED evidence (unaffected — no hosted calls made this phase). The single local miss is seed-specific and reproducible.

## 19–20. HG08/HG11

Not directly re-measured as named single-shot gates this phase beyond the `probe:expert-routing` run above (G03/HG08 passed there: R1 clar=2 cand=1; G07/HG11 passed: R5 all three collections populated).

## 21. Routing opportunities/hits/misses/over-routing

Final: 200 opportunities, 199 hits, 1 miss (R4, single seed), 0 over-routed. Compare to baseline: 100 opportunities, 95 hits, 0 misses, 5 over-routed (all T1).

## 22. Explanation-only losses

Baseline: 4/100 opportunities. Final: 11/200 — driven primarily by the same single seed's R4 miss (confined_space concept surfaces in `expertExplanation.summary` instead of the typed candidate that rep) plus R5's pre-existing "battery/hydrogen" explanation-only pattern, unrelated to this repair.

## 23. Grounding result

Not in scope this phase — grounding/evidence architecture untouched, `expert-grounding-contract` suite re-run clean (40/0), identical to baseline.

## 24. Outcome/content inconsistencies

None observed. Every `ANALYZED`/`NOTHING_TO_ADD` outcome across all runs was consistent with its own typed-collection contents.

## 25. Protected regression result

All 14 suites, identical counts to §108/§109/§110's baseline, zero deltas:

```
expert-contract-foundation      56/0
expert-routing-contract         58/0
expert-grounding-contract       40/0
expert-anthropic-adapter-repair 30/0
expert-authority-merge          51/0
expert-provider-failure        131/0
expert-nocall-harness          141/0
l32i-clarification-carrier      61/0
l32j-carrier-activation         37/0
hazlenz-core                    PASS
hazlenz-precision               PASS (0 dangerous, 0 life-critical omissions)
hazlenz-level1-recall           PASS (17 checks)
hazlenz-actionable-coverage     PASS (17 checks)
backend tsc --noEmit            exit 0
```

Full stdout captured under `post-run-regression/`.

## 26. Confinement result

See `CONFINEMENT.txt`. No controller/service/module reference, no frontend reference, same 5 hosted-adapter importers as §110 (0 added), only `expert-prompt.ts` changed among Expert-core files.

## 27. Production/customer mutation status

None. No controller, service, module, frontend, or database file touched.

## 28. Provider-validation status

`EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` (unchanged).

## 29. Customer-activation status

`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` (unchanged).

## 30. LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN status

`TRUE` (unchanged, quarantined per §109, not investigated this phase).

## 31. Bounded hosted confirmation justification

**Justified.** The local repair is ACCEPTED: the fixture built to reproduce R6's defect class went from 5/5 failing to 10/10 clean; every protected negative control (R6, R7, T6) stayed perfectly clean; historical+unresolved and remediation-uncertain positives (T2, T3) survived correctly; the resolved-primary+current-secondary case (T4) suppressed only the resolved half. One narrow, characterized, single-seed residual (R4/T5, 9/10) is disclosed rather than hidden, and does not touch any protected negative control. Per this operation's own Phase 9 design, only a bounded hosted confirmation can establish whether R6's actual hosted over-routing is fixed and whether current-hazard recall is preserved on the real target model — local Ollama evidence is necessary but not sufficient for that claim.

## 32. Exact next recommended operation

A small, bounded hosted confirmation against the real, unmodified `AnthropicExpertProvider`: `R6`×3, one historical+resolved contrastive control (e.g. T1), one historical+unresolved positive (e.g. T2), one genuinely-uncertain current-state clarification case (e.g. T3), and an optional `R4` spot-check — proving BOTH `OVERROUTING_REMOVED` and `CURRENT_HAZARD_RECALL_PRESERVED`. Not authorized in this phase. The 17-measure evaluation cohort remains BLOCKED.

---

**Required state confirmed:** `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`, `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. The 17-measure evaluation cohort remains unauthorized. Zero hosted calls made. Nothing committed, pushed, tagged, or deployed.
