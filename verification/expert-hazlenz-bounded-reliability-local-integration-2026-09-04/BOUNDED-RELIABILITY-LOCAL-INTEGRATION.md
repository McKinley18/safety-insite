# Expert HazLenz — bounded reliability and target coverage: local integration

**§165, 2026-09-04. LOCAL ONLY. 0 provider calls, $0.00, 0 database operations, 0 files changed
under `backend/src/`.**

Implements the `PROVABLE_LOCAL` portion of the §164 architecture. Everything §164 classified
`REQUIRES_HUMAN_TRUTH`, `REQUIRES_HOSTED_VALIDATION` or `DO_NOT_AUTOMATE` is left unimplemented, and
the modules refuse to let a caller reach it by accident.

---

## 1. What was built

Seven modules under `backend/scripts/lib/`, one proof suite and one pre-spend preflight under
`backend/scripts/`.

| file | lines | what it owns |
|---|---|---|
| `lib/expert-semantic-outcome-v2.ts` | 294 | the nine-member taxonomy, and the human-authority door |
| `lib/expert-owed-facts.ts` | 393 | `owedFact`, the append-only ledger, status transitions, the population boundary |
| `lib/expert-owed-fact-binding.ts` | 331 | the closed-set binding contract and the additive-nomination rule |
| `lib/expert-target-coverage.ts` | 157 | `TARGET_COVERAGE_WARNING` as a set difference |
| `lib/expert-question-budget.ts` | 239 | preserve-first ranking, declared-field combination, fail-closed |
| `lib/expert-bounded-reliability-state-machine.ts` | 404 | policy C, the four call channels, the composition order |
| `lib/expert-reliability-observability.ts` | 255 | the append-only record and its seventeen reconstruction obligations |
| `test-expert-bounded-reliability-architecture.ts` | 819 | proof matrix A–T, adversarial X1–X14, replays R1–R2 |
| `preflight-binding-falsification-harness-2026-09-04.ts` | 443 | the §164 12-call experiment's pre-spend gate |

`npm run test:expert-bounded-reliability` · `npm run preflight:binding-falsification`

---

## 2. The one idea, and what it replaced

§164's move is to stop asking what a question **means** and require a **declaration** that can be
checked by set membership. That is implemented literally:

```
owedFacts built BEFORE the verifier runs, each with a stable factKey
        ↓
every clarification declares  BOUND_TO_OWED_FACT(coversFactKey)  or  NOMINATED_NEW(proof)
        ↓
coverage = { unresolved facts } \ { keys named by admitted bindings }
```

`evaluateTargetCoverage()` takes fact keys and statuses. **It is never given the question text, so it
cannot consult it** — the restriction lives in the type signature rather than in a rule that could be
relaxed. `COVERAGE_DECISION_INPUTS` names the five fields a coverage decision may read, and proof
case **X10** greps both modules to establish that no similarity, embedding, keyword or overlap
machinery exists in either, and that the admission rule never reads `.question`.

The verbatim `evidenceSpan` check is performed and is not an exception: byte equality against the
observation is not a semantic judgement, and it is the same check the v2 nomination contract and the
first-pass quote binder already run.

---

## 3. Semantic outcome taxonomy — `hazlenz.expert.verifier.semantic-outcome.v2`

Nine members, implemented with their §164 recall/precision properties as data rather than as
branches. **§163 is not rescored and remains under v1.**

| member | owed-target recall | clarification precision | assignable by code? |
|---|---|---|---|
| `TARGET_REACHED` | PASS | pass | **no** |
| `VALID_BUT_TARGET_DISPLACED` | MISS | **not a defect** | **no** |
| `INVALID_WRONG_FACT` | MISS | defect | **no** |
| `SETTLED_SILENCE` | MISS | defect | yes — structural |
| `WRONG_AFFECTED_DECISION` | MISS | defect | **no** |
| `BOUNDARY_REJECTION` | not scoreable | execution | yes |
| `CONTRACT_INVALID` | not scoreable | execution | yes |
| `DEGENERATE_OUTPUT` | not scoreable | execution | yes |
| `TRANSPORT_FAILURE` | not scoreable | execution | yes |

`classifyDeterministically()` returns an execution-class member, `SETTLED_SILENCE`, or the recorded
state `UNKNOWN_SEMANTIC_VALIDITY`. It **cannot** return any of the four human-authority members.
`assignHumanAdjudicatedOutcome()` is the only other entry point and refuses any provenance but
`HUMAN_ADJUDICATION` and any unnamed adjudicator.

`SETTLED_SILENCE` is decidable automatically because it reads no question text: no clarification was
emitted and an owed fact existed. That is a structural fact.

**Rule 1 is enforced, not written down.** `summariseOutcomes()` returns `recall` and `precision` as
separate objects with no combined accuracy field, and `assertRecallAndPrecisionNotNetted()` throws if
a displaced outcome has been counted as a recall success (proof **X9**).

---

## 4. `owedFacts` — contract and provenance

```
owedFact {
  factKey · affectedDecision · source · evidenceSpan · whyUnresolved
  branchA · branchB · decisionDivergence{ifA,ifB} · priority · status · modelAuthored
}
status  ∈ UNRESOLVED | COVERED | SETTLED_BY_EVIDENCE | REJECTED_BY_ARBITRATION
source  ∈ DETERMINISTIC | GOVERNED_EVIDENCE | FIRST_PASS_MODEL | VERIFIER_NOMINATION
                                            | DEVELOPMENT_HUMAN_TRUTH
```

`modelAuthored` is derived from `source` by the `owedFact()` constructor, so no call site can
disagree with the provenance it declared.

### The population boundary

`PRODUCTION_PERMITTED_SOURCES` omits `DEVELOPMENT_HUMAN_TRUTH`. Both entry points —
`createOwedFactLedger('PRODUCTION', …)` and `addOwedFact()` — **throw**
`DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION` rather than filtering, because silently dropping
the fact would let a caller believe it was represented. Proof case **R**.

Human-authored fixture truth is the standard the system is measured against. Seeding production owed
facts from it would make the ruler part of the thing being measured — the exact failure
`docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md` exists to prevent. **Development instrumentation and
production architecture share the structure and never share the population step.**

A production fact sourced from model output carries `modelAuthored: true`, and
`modelAuthoredOnlyFailClosedKeys()` reports a fail-closed state resting on model-authored facts alone
(proof **R2**). It can raise a question; it cannot assert a hazard.

---

## 5. Binding contract

Two modes and no third. A declaration binds one member of the closed set, or nominates additively
with the full two-branch divergence proof.

Refusal codes: `BOUND_KEY_NOT_IN_CLOSED_SET`, `BOUND_FACT_NOT_UNRESOLVED`,
`TWO_DECLARATIONS_BIND_THE_SAME_FACT`, `NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT`,
`NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM`, `NOMINATION_BRANCHES_IDENTICAL`,
`NOMINATION_DECISIONS_DO_NOT_DIVERGE`, `MORE_THAN_ONE_NOMINATION`, and eight more. A declaration is
refused **whole** on any violation, which leaves every owed fact where it was.

**Additive, never substitutive.** `applyAdmittedDeclarations()` calls `nominateAdditiveFact()`, whose
signature has nowhere to name a fact to drop. Replacement is not forbidden by a check; it is
unrepresentable. A binding transitions **exactly its own key** to `COVERED`, so a sibling fact — same
equipment, same hazard family, same affected decision — is untouched (`bindingSideEffects()` proves
the absence of implicit coverage).

---

## 6. Coverage postcondition

```
TARGET_COVERAGE_WARNING = TRUE
  when any owedFact remains UNRESOLVED and no admitted declaration binds its factKey
```

`COVERAGE_COMPUTATION_METHOD = DETERMINISTIC_CLOSED_SET_MEMBERSHIP_OVER_DECLARED_BINDINGS`.

### Two thresholds, both reported

§164 §8 gates the warning on `LIFE_CRITICAL` and `REQUIRED_CONTROL`. The §165 authorization states it
over **every** fact that remains `UNRESOLVED`. These differ on an uncovered `OTHER`-priority gap.

The module implements the **stricter §165 form** as `TARGET_COVERAGE_WARNING` and reports the §164
form alongside it as `priorityGatedWarning`. Choosing the looser rule silently would relax a
governance surface; choosing the stricter one without saying so would misreport §164.

Permitted responses, ordered and bounded: one targeted re-check naming the uncovered keys →
arbitration with a recorded reason → fail closed. There is no "accept anyway" member (proof **C6**).
`unexplainedCoverageClearances()` catches a warning that went from TRUE to FALSE with no recorded
transition (proof **X13**).

---

## 7. Preservation invariants

| # | invariant | where enforced | proof |
|---|---|---|---|
| 1 | a nomination never deletes an owed fact | `nominateAdditiveFact` signature | A, E |
| 2 | one binding never implicitly covers a sibling | `applyAdmittedDeclarations` names one key | C |
| 3 | `UNRESOLVED → COVERED` requires an admitted binding | `REQUIRED_AUTHORITY.COVERED` | J |
| 4 | `→ SETTLED_BY_EVIDENCE` requires evidence provenance | `REQUIRED_AUTHORITY` | K |
| 5 | `→ REJECTED_BY_ARBITRATION` requires a recorded reason | `transition()` justification check | L |
| 6 | salience cannot mutate the owed set | no authority member for it | S |
| 7 | deduplication is exact identity only | `dedupeByIdentity` compares `factKey` alone | M, N |
| 8 | a model explanation changes no status | `TRANSITION_AUTHORITIES` has three members | S |
| 9 | a life-critical gap cannot vanish to a budget | `selectQuestions` fail-closed branch | O |

`preservationViolations()` compares two ledger states and reports deletion, terminal-status mutation,
identity mutation, transition-ledger truncation and transition rewriting. Proof **X7** builds a
successor ledger by hand with the owed fact deleted and shows it is caught.

---

## 8. Question budget skeleton

`survivingInternally` (every unresolved fact, unbounded) / `selected` (bounded) / `deferred`
(recorded). Ranking runs over the surviving set and cannot shrink it.

Combination requires **all four** declared conditions — same `affectedDecision`, same declared
`equipmentOrTaskKey`, and both facts declared `independentlyAnswerableInOneReply`. An absent
declaration means no combination. There is no heuristic fallback and nothing reads question text
(proof **X14**).

A `LIFE_CRITICAL` gap is never dropped. If one cannot be presented, the result carries
`UNRESOLVED_SAFETY_STATE: true`, names the keys, and records
`deterministicFindingsStillShown: true` — the deterministic HazLenz findings stand and are still
shown (proof **O**).

**Not implemented, deliberately:** semantic ranking, and similarity-based deduplication. §164
classified both `REQUIRES_HUMAN_TRUTH`.

---

## 9. Policy C state machine

```
DRAW_1
├─ execution-invalid / degenerate      → DEGENERATE_POLICY_PATH (existing policy governs)
├─ contract refused                    → PROCEED_TO_COVERAGE_CHECK
├─ verdict ≠ NO_CLARIFICATION_REQUIRED → PROCEED_TO_COVERAGE_CHECK   (R3, not repetition)
├─ not trigger-positive                → PROCEED_TO_COVERAGE_CHECK
├─ no unresolved owed fact             → PROCEED_TO_COVERAGE_CHECK
└─ otherwise                           → SECOND_DRAW_ELIGIBLE (exactly one)
```

Maximum two draws. No majority rule. No loops — `runBoundedDraws()` contains no `while`, no recursion
and no retry.

### Two NOs prove nothing, and there is no branch to relax

`resolveDrawOutcome()` returns, for two admitted silences: `SETTLED_SILENCE` with `drawCount: 2`,
`mayClearOwedFact: false`, `coverageWarningMayClear: false`, and `consensusClaimed` typed as the
literal `false` so a caller cannot set it. There is no path from two silences to `COVERED`, to
`VERIFIED_AS_IS`, or to a cleared warning.

The reason is recorded in the module: the draws are two samples from one distribution §163 measured
to be centred on silence — 8 of 10 on HS-E1 — so two silences is the most likely outcome (~64%)
whether or not the silence is correct. Agreement between samples of a biased distribution is evidence
about the mode, not about the truth. Proofs **H**, **I**.

---

## 10. Composition with the degenerate policy, and the call cap

`DEGENERATE_OUTPUT_POLICY_STATUS = PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION` — unchanged, not
reopened, semantics untouched. Proof **C1** re-runs `decideDegeneratePolicy` and confirms
`REISSUE_ONCE` then `FAIL_CLOSED_AFTER_REISSUE`, and shows the reliability gate returns
`DEGENERATE_POLICY_PATH` on a degenerate response — it declines jurisdiction rather than reissuing.

```
TRANSPORT → RESPONSE_STATE_CLASSIFICATION → DEGENERATE_HANDLING → CONTRACT_ADMISSION
  → SEMANTIC_RELIABILITY_DRAW_HANDLING → OWED_FACT_COVERAGE → ARBITRATION
  → QUESTION_BUDGET → FINAL_AUGMENTATION
```

Four **separate** call channels, each with its own ceiling and no borrowing:

| channel | ceiling |
|---|---|
| `FIRST_PASS` | 1 |
| `DEGENERATE_REISSUE` | 1 |
| `RELIABILITY_DRAW` | 2 |
| `COVERAGE_RECHECK` | 1 |
| **total** | **5, hard-capped** |

`assertCallCapInternallyConsistent()` proves the channels sum to the published maximum and that the
maximum is still 5. Proof **Q** shows exhaustion in one channel neither blocks nor unlocks another in
either direction, and that the second-draw gate refuses when its own channel is spent.

---

## 11. Observability

Seventeen reconstruction obligations, mapped to record fields by `RECONSTRUCTION_FIELD_MAP` so the
obligation names and the field names stay distinguishable. `appendAttempt()` spreads and never
indexes; counters are recomputed from the attempt list rather than incremented, so a counter cannot
disagree with the ledger it summarises. `observabilityViolations()` compares against a prior snapshot
and reports `ATTEMPT_OVERWRITTEN`, `ATTEMPT_HISTORY_TRUNCATED`, `TRANSITION_REWRITTEN`,
`INITIAL_OWED_FACTS_MUTATED`, `ATTEMPT_SEQ_REUSED` and counter disagreement. Proofs **T**, **T2**.

---

## 12. Local proof matrix — 44/44 PASS, 0 provider calls

Full transcript: `PROOF-MATRIX-RESULT.txt`.

| case | result |
|---|---|
| A owed fact survives an additive nomination | pass — present, `UNRESOLVED`, 0 removed |
| B both facts coexist | pass — 2 facts in one ledger |
| C binding the auger fact does not cover the flame fact | pass — auger `COVERED`, flame `UNRESOLVED` |
| D flame key remains in `uncoveredFactKeys` | pass — warning TRUE, 1 uncovered key |
| E additive nomination preserves the original | pass — 0 violations, object byte-identical |
| F HS-E1 silence raises the warning | pass |
| G trigger-positive silence → one second draw | pass — `T_WHOLLY_EMPTY_ANALYSIS` fired |
| H second silence clears nothing | pass |
| I two NOs produce no `COVERED` and clear no warning | pass — 0 state-machine violations |
| J explicit binding → `COVERED`, warning clears | pass — via `ADMITTED_BINDING`, 1 transition |
| K evidence settlement uses the evidence path | pass — a binding authority is refused |
| L arbitration rejection needs a recorded reason | pass — an empty reason is refused |
| M exact identity deduplicates | pass |
| N unrelated facts do not deduplicate | pass — both survive |
| O budget never silently drops a life-critical gap | pass — `UNRESOLVED_SAFETY_STATE` |
| P call cap is 5 and the sixth call is refused | pass |
| Q the two retry budgets cannot loop into each other | pass — both directions |
| R development human truth cannot enter production | pass — both entry points throw |
| R2 model-authored-only fail-closed is reported | pass |
| S a model explanation is not an authority | pass — no such member exists |
| T raw attempt history is append-only | pass — overwrite raises a violation |
| T2 all 17 reconstruction obligations satisfied | pass — 0 gaps |

**Adversarial:** X1 binding outside the closed set · X2 binding an already-covered fact · X3 a
nomination renaming an unresolved owed fact · X4 two declarations binding one fact · X5 a
non-verbatim evidence span · X6 non-diverging decisions · X7 a hand-deleted fact · X8 a forged
adjudication provenance · X9 netted recall · X10 no semantic matcher in either module · X11 a third
draw · X12 an over-budget selection · X13 an unexplained coverage clearance · X14 unjustified
combination. **All 14 refused or caught.**

### Replays of the real §163 draws

Both replays map a draw's **recorded `sourceMode`** — a field the provider emitted and §163
persisted — onto the binding mode it corresponds to. Nothing reads question text, and no claim is
made that any §163 draw "bound" anything; binding did not exist when those draws were made.

| replay | result |
|---|---|
| **R1 HS-A1**, 10 stored draws | **0 erasures** · 7 draws carried both facts · 3 bound the owed key · `TARGET_COVERAGE_WARNING` true on 7/10 |
| **R2 HS-E1**, 10 stored draws | **0 erasures** · 0 draws bound the owed key · `TARGET_COVERAGE_WARNING` true on 10/10 |

R1 is the §164 claim, measured: the seven draws that silently displaced the owed target in §163 leave
it `UNRESOLVED` and named in `uncoveredFactKeys` in every one of the seven.

---

## 13. Confinement proof

| property | evidence |
|---|---|
| nothing under `backend/src/` was created, modified or deleted | `git status` for `backend/src/` is byte-identical to the session-start snapshot; the only `src/` entries are pre-existing uncommitted work from earlier operations |
| production cannot import the new modules | `backend/tsconfig.json` sets `rootDir: "./src"` and `include: ["src/**/*"]`. A `src/` file importing `scripts/lib/` is a **compile error**, not a convention |
| `SOURCE_PROJECT_TSC` | `npx tsc --noEmit` → **exit 0, clean** |
| the new modules import nothing from `src/` | proof **C3** — 7 modules, 0 `src/` imports |
| the new modules cannot reach a provider | proof **C3** — 0 occurrences of any network, credential or provider token |
| hosted execution is refused by default | proof **C4** — `REFUSING_DRAW_FUNCTION` throws `HOSTED_EXECUTION_NOT_AUTHORIZED`; `ACTIVATION_STATUS = DEVELOPMENT_INACTIVE` |
| the preflight cannot spend | gate **E.7** — no `fetch`, no credential read, no HTTP client |
| zero behaviour change under existing configuration | no `src/` file changed and no runtime configuration was touched, so there is no path by which customer behaviour could differ |

---

## 14. Protected regression — all green

Full transcript: `PROTECTED-REGRESSION.txt`.

| suite | result |
|---|---|
| `SOURCE_PROJECT_TSC` (`npx tsc --noEmit`) | **exit 0, clean** |
| `test:expert-bounded-reliability` *(new)* | **44/44** |
| `test:expert-reliability-architecture` | 69 passed, 0 failed |
| `test:expert-verifier-v2-contract` | 46 passed, 0 failed |
| `test:expert-contract-foundation` | 56 passed, 0 failed |
| `test:expert-routing-contract` | 67 passed, 0 failed |
| `test:expert-measurement-layer` | 66 passed, 0 failed |
| `test:expert-fixture-hardening` | 76 passed, 0 failed |
| `test:expert-clarification-settlement` | 148 passed, 0 failed |
| `test:expert-affected-decision-arbitration` | 41 passed, 0 failed |
| `test:expert-unsupported-settlement` | 129 passed, 0 failed |
| `test:expert-retention-bridge` | 123 passed, 0 failed |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `test:hazlenz-guarding-applicability` | 16 cases, 0 failures, 0 dangerous failures |
| `test:governed-kill-switch-authority` | 115 passed, 0 failed |

No database was contacted. No migration, seed or schema command was issued.

---

## 15. Pre-spend preflight — `FALSIFICATION_HARNESS_READY = FALSE`

24 of 26 gates pass. **Nothing was spent; $0.00.** Full transcript:
`FALSIFICATION-HARNESS-PREFLIGHT.txt` · machine-readable: `FALSIFICATION-HARNESS-PREFLIGHT.json`.

Passing: the §156 blinded packet unchanged · verifier instruction v2 byte-identical · contract v2 the
one under test · the v13 first-pass prompt module byte-identical · the v9 fixture byte-identical ·
both authoritative cases present · §162 human targets deep-equal and their cues not satisfied by
either observation · truth not broadened · no draw shown another draw's output · the
displaced/invalid split unassignable by code · recall independent of precision · 9 leak patterns and
0 matches on both requests · one frozen semantic request hash per case · no sampling control · 12
requests with zero retries and zero reruns · a 4000-token output ceiling · the runtime call cap ·
the store clean · the frozen formal count intact · the preflight unable to issue a request.

### Blocker 1 — the manipulation is not expressible under frozen material

This is not asserted. Gate **F.1** constructs the additive verdict falsifier C requires — one that
binds the supplied flame-failure fact **and** carries the auger nomination alongside it, with every
proof field present — submits it to the frozen `checkVerifierV2Output`, and records the result:

```
REFUSED — NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE
```

Gate **F.2**: the frozen v2 response schema's fields are `verdict`, `rationale`,
`aboutUnresolvedFactRef`, `clarificationSourceMode`, `proposedClarification`, `nominatedFact`. There
is no field in which a binding could be declared.

Gate **F.3**: the frozen v2 system prompt contains **0 of 7** binding tokens — no `factKey`, no
`bind to`, no `owed fact`, no `closed set`, no `in addition to`. There is no binding step for the
verifier to execute.

**Consequence.** The binding-enabled arm cannot be delivered to the provider without new instruction
and schema material. §165 Phase 13 forbids changing verifier instruction v2 and forbids creating a
v3, so the remediation belongs to the next authorization rather than to this operation. Falsifier
**C** is not measurable under frozen material, and the "binding required" manipulation falsifier
**B** depends on is not deliverable either.

### Blocker 2 — the published cost cap is not a prospective bound

§164 states "12 calls, ≈$0.30 at measured cost". That is the **expected** cost: at §163's measured
per-case means it is **$0.25231**. Every spend gate on this programme is evaluated *before* a request
against the worst case that request could cost, because final token usage is unknowable until the
response returns. At the 4000-token ceiling the worst case is **$0.59798** — roughly double.

A cap checked against expected spend can always be overshot. Raising the cap to at least $0.60, or
lowering the output ceiling, is a product-owner decision and is **not** taken here.

### The §164 falsifiers are preserved unchanged

A, B, C, D, E, F stand exactly as written, including their thresholds. **None was weakened because
the local implementation cannot yet exercise them.** B and D remain the decisive pair.

---

## 16. What remains unproven, stated plainly

| question | status |
|---|---|
| does binding reduce displacement **in practice** | `REQUIRES_HOSTED_VALIDATION` — unmeasured |
| does the conditional second draw improve silence recovery | `REQUIRES_HOSTED_VALIDATION` — unmeasured |
| is a given binding **truthful** | `REQUIRES_HUMAN_TRUTH` — human sampling of bound pairs, not a runtime component |
| is a nominated fact genuinely decision-critical | `REQUIRES_HUMAN_TRUTH` |
| are two differently-worded owed facts the same fact | `REQUIRES_HUMAN_TRUTH` |
| would the question burden stay acceptable | unmeasured — falsifier F |

The local proofs establish that displacement is **structurally unrepresentable** and that the owed
set survives every path in the implemented architecture. They establish nothing about how a hosted
model behaves when handed a binding contract, because no hosted call was made.

---

## 17. Exact next authorization required

Two decisions, in this order:

1. **Authorize a verifier instruction and response-schema revision** that adds (a) a binding
   declaration naming a supplied `factKey`, and (b) permission to carry one additive nomination
   alongside a binding. This is new frozen semantic material and cannot be created under §165
   Phase 13. Without it the §164 experiment cannot test what it was designed to test.
2. **Resolve the cost cap**: raise the 12-call prospective ceiling to at least $0.60, or lower the
   output ceiling — noting that lowering it below 4000 breaks byte-identity with §158/§163 and
   forfeits direct comparability with the frozen baseline.

Only after both may the 12-call binding falsification experiment be authorized. It remains
unexecuted, and $0.00 has been spent.
