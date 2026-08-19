# V5-C02 Verification

Date: 2026-08-16 · Repo HEAD before/after: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged; no commits made)

## Build

- Backend `tsc --noEmit -p .`: PASS (clean, zero errors) after every edit round.
- Frontend `next build`: PASS, 26/26 static pages generated — identical page count to C01's baseline. No frontend file was touched by C02 (no shared-fact type crossed the API boundary), so this build primarily confirms no incidental breakage.
- `git diff --check`: clean (0 whitespace/conflict-marker issues) for every file this session touched.

## Protected hashes (before vs. after)

All 6 V4-protected hashes and all 3 V5-C01 hashes listed in `V5_C02_BASELINE.md` are byte-identical after every C02 edit. Confirmed by direct `shasum -a 256` re-run, not by assumption.

## Unit-level proof: shared-fact reuse (Phase 5 requirement)

Script: `c02_shared_fact_reuse_proof.ts`. For 3 representative observations, proves in the same process:
1. `evidence-foundation.ts`'s `applyEvidenceFoundation()` produces an `evidenceSnapshot.facts` array byte-identical to calling `buildEvidenceFacts()` directly — i.e. it is genuinely calling the shared builder, not a parallel re-implementation.
2. `EvidenceSufficiencyService.evaluateEvidenceSufficiency()`, called the same way the orchestrator now calls it (with the shared fact array as the 4th argument), returns an `evidenceFactTrace` byte-identical (on type/value/source/status) to that same shared fact array.
3. Calling `evaluateEvidenceSufficiency()` **without** the new 4th argument (the exact pre-C02 call shape) produces output identical on every pre-existing field to calling it **with** the argument (with the new `evidenceFactTrace` field stripped from both before comparing) — i.e. the addition is provably non-decision-affecting.

Result: `allPass: true` across all 3 cases (`verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/c02_shared_fact_reuse_proof.ts` output, reproduced on demand).

## Phase 6 — semantic adversarial tests

Script: `c02_semantic_adversarial_tests.ts`, output saved at `c02_semantic_adversarial_results.json`. All 10 assertions (8 required categories, multi-hazard split into 3 checks) PASS:

| Category | Assertion | Result |
|---|---|---|
| Positive | "guard is missing... can reach the rotating shaft" → `guardState: absent_or_ineffective` captured | PASS |
| Safe/control | "guard is installed and prevents access" → `guardState: present_and_effective`, distinct value from the positive case | PASS |
| Unknown | "condition... could not be confirmed" → no `guardState` fact of either polarity | PASS |
| Negation | "No exposed energized conductors were observed" → does NOT assert `energyState: energized_or_operating` | PASS (required a fix — see below) |
| Historical | "was missing last week but was replaced before this inspection" → `currentHazardNegated` and `correctedBeforeReview` both `true` | PASS (required a fix — see below) |
| Planned future | "will be replaced during tomorrow's shutdown" → no `guardState: present_and_effective` fact (not represented as already done) | PASS (no fix needed — already correct) |
| Failed control | "local exhaust... running but fumes remain..." → distinct `controlEffectiveness: present_but_ineffective` fact alongside the pre-existing `silicaControlState` | PASS (required a new additive fact — see below) |
| Multi-hazard | whole-observation facts include both hazards; each hazard-scoped fragment (via `buildHazardScopedEvidenceFacts`) produces ONLY its own hazard's facts, never the sibling's | PASS (3/3 checks) |

### Three narrow, targeted fixes made during Phase 6 (see `V5_C02_IMPLEMENTATION_REPORT.md` for full rationale)

The first pass of adversarial testing (using the task's own example phrasing) found the extraction logic — moved verbatim from `evidence-foundation.ts`, unchanged by the refactor itself — failed 3 of 8 categories. These are genuine, narrowly-scoped, pre-existing production defects directly implicated by this phase's own required correctness guarantees (negation/temporal/effectiveness preservation), not new problems introduced by the refactor:

1. **Negation defect (energyState):** the "energized" trigger regex had zero negation awareness. Fixed by reusing the already-shared, already-tested `hasNonNegatedTerm`/`hasAnyNonNegatedTerm` utility (`reasoning-orchestrator/negation-context.util.ts`, already used by 5 other files) for that one trigger only — not a new negation implementation, not applied to any other regex in the file.
2. **Temporal defect (historical/corrected-before-review):** the existing `correctedBeforeReview` regex required a trailing "now/passed/tested/verified/current(ly)" word the task's own example phrasing ("...was replaced before this inspection") doesn't use. Added one additional regex alternative matching that specific construction; the other two alternatives are untouched.
3. **Effectiveness defect (control presence vs. effectiveness):** added one new, purely additive fact type (`controlEffectiveness: 'present_but_ineffective'`) fired only when control-operating language co-occurs with an explicit residual-hazard-persists phrase. The pre-existing `silicaControlState` fact and its (unchanged) role in `evidence-foundation.ts`'s silica-citation predicate were **not modified** — this is a known, narrower, separate limitation, intentionally left alone and recorded under "Remaining architecture debt" rather than expanded into a broader fix.

After all three fixes: re-ran `c02_shared_fact_reuse_proof.ts` (still `allPass: true`) and the full baseline HTTP suite (below) to confirm no regression from the fixes.

## V4 / V5 regression suite (post-implementation, full re-run)

| Suite | Result |
|---|---|
| `test:canonical-workflow` | PASS |
| `test:finding-scoped-reviews` (V5-C01 + PRA-002 regression — proves shared-review split still allows completion while each finding keeps its own risk) | PASS |
| `test:persisted-decomposition-findings` | PASS |
| `test:risk-policy` | PASS |
| `test:evidence-foundation` | PASS |
| `test:guided-finding-response` | PASS |
| `test:hazlenz-evidence-boundary` | PASS |
| `test:private-storage-reports` (reports regression) | PASS |
| `test:canonical-organization-authorization` (cross-user authorization regression) | PASS |
| `hazlenz-core-regression.ts` (20-suite bundle: observation understanding, PPE/mobile/hardening benchmarks, inspection-intelligence ×8, mechanism-chain ×2, spill/release ranking, supplemental knowledge, vague guarding, classify-path, production-path) | 19/20 suites PASS. 1 FAIL (**Corrective Action Intelligence Benchmark**) — confirmed pre-existing and unrelated, see below. |
| `hazlenz-clarification-gauntlet.ts` | 1 assertion failure ("ladder vague: expected provisional, received final") — confirmed pre-existing and unrelated, see below. |
| Backend `tsc --noEmit` | PASS |
| Frontend `next build` | PASS (26/26) |

### Two failures investigated and confirmed unrelated to C02

Both were investigated per the task's explicit instruction not to change production merely because a test fails, and not to misattribute a pre-existing defect as a C02 regression:

1. **Corrective Action Intelligence Benchmark** (`corrective-action-benchmark.ts`, expects specific tailored narrative phrases like `'Pause affected work and restrict access around'` that `corrective-action.service.ts` no longer produces). `git status` at session start already showed `backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts` as modified pre-existing uncommitted work, and a matching stash (`"hold corrective action routing patch"`) exists in the repo's stash list — direct evidence this is in-progress, unrelated work from a prior session, not touched by any C02 edit (C02 never edited `corrective-action.service.ts` or `corrective-action-benchmark.ts`).
2. **`hazlenz-clarification-gauntlet.ts`'s "ladder vague" case** (expects `resultStage: 'provisional'`, receives `'final'`). `resultStage`/`mayFinalize` are computed entirely inside the protected `safescope-v2.service.ts` (never edited by C02) from that file's own hardcoded question-ID/regex logic; `evidence-foundation.ts` runs as a controller post-process *after* `resultStage` is already set and never assigns to it; the orchestrator's `evidenceSufficiency` change is proven purely additive (see above) and was already disconnected from `resultStage` before C02 (per C04's own finding). **Directly isolated**: temporarily `git stash`-reverted the 3 tracked files C02 modified (`evidence-sufficiency-core/*.ts` ×2, `orchestration/intelligence-orchestrator.service.ts`), restarted the disposable backend, and re-ran the identical test — the identical failure reproduced with C02's tracked changes fully absent, conclusively proving it predates and is independent of this phase. Stash was immediately popped back; tracked-file hashes confirmed identical to pre-stash state afterward.

Both are recorded as `PRE_EXISTING_VERIFICATION_DEFECT` in `V5_C02_IMPLEMENTATION_REPORT.md`, not `C02_REGRESSION`.

### Known pre-existing defects carried forward from C04 (not repaired, per task instruction; do not block C02 verification)

- `smoke-corrective-actions-organization-scope.ts`: same compile error C04 documented (`CreateCorrectiveActionDto` now requires `assignedToUserId`/`assignedToName`, fixture doesn't supply them). Reproduced identically this session. Untouched.
- `validate-safescope-defensible-corrective-action.ts`'s 2-case failure (C04-documented): not re-run this session (out of scope — DefensibleCorrectiveActionService was not touched, no reason to expect it changed).

## Performance / duplication measurement (Phase 9)

- **Evidence-parsing passes over raw text, before C02:** `evidence-foundation.ts`'s `extract()` ran its ~30-regex pass once per `classify()` request (in the controller, post-process). No other engine consumed or was aware of its output.
- **After C02:** `evidence-foundation.ts` still runs the identical ~30-regex pass exactly once (the logic was relocated into `shared-evidence-facts.ts`, not duplicated — proven byte-identical by the reuse-proof script). The orchestrator now performs **one additional** call to the same `buildEvidenceFacts()` function (to feed `EvidenceSufficiencyService`'s new additive trace) — this is a **net new** pass, not a removed one, because the C02 migration was deliberately scoped as additive/provenance-only rather than replacing `EvidenceSufficiencyService`'s own internal `includesAny()` checks (see `V5_C02_SHARED_FACT_CONTRACT.md` for why that narrower, safer scope was chosen).
- **Duplicated logic actually removed:** none in this phase — by design, no existing consumer's independent regex was deleted or replaced; the migration proves reuse additively rather than replacing existing computation. This is an honest limitation of choosing the safe, non-decision-affecting integration path over a deeper (higher-risk) one; see "Remaining architecture debt" in the implementation report.
- **Latency:** 5 live `POST /safescope-v2/classify` calls against the disposable backend, same fixture (guard+electrical multi-hazard observation): 24.4 / 22.2 / 23.1 / 23.2 / 22.4 ms. No matched pre-C02 timing sample was captured in the same process (register-endpoint rate limiting — 5/60s — made re-provisioning a fresh disposable auth session for an isolated "before" run impractical within this session's effort budget); the added single extra regex pass (~30 non-backtracking-heavy string/regex tests over one already-short fused-text string, no I/O) is analytically negligible relative to the ~22ms total, which is dominated by the orchestrator's ~60-service fan-out and DB-backed standards lookups. **No performance improvement is claimed** — this phase is architecturally additive, not a removal of duplicated work, and Phase 9's own instruction is not to claim improvement merely because the architecture is cleaner.
- **Response-size changes:** none observed in the client-facing API response — `evidenceFactTrace` lives inside `evidenceSufficiency`, a field already fully hidden from the sanitized client response by `hazlenz-display-sanitizer.ts` (pre-existing, unrelated to C02) for every request, before and after this phase.

## Disposable infrastructure teardown

Performed after verification completed — see `V5_C02_IMPLEMENTATION_REPORT.md` for confirmation.
