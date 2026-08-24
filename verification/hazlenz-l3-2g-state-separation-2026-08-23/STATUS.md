# L3-2g — STRUCTURAL STATE SEPARATION, BINDER CLOSURE, INDEPENDENT-EVIDENCE PLAN

> ## `L3_2G_PARTIAL — STRUCTURAL_STATE_DECISION_INCONCLUSIVE`
> ## `BINDER_RESIDUAL` — **CLOSED**
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged. Nothing committed, pushed,
merged, rebased or deployed. Dependency graph and `package-lock.json` byte-identical to HEAD.

**Terminal state is D of the four the entry contract offered.** The reasoning is in §"The decision"
below, and it is deliberately not the most flattering reading of the evidence.

---

## 1. What was measured, in one table

| question | answer | evidence |
|---|---|---|
| Can the state decision be represented structurally? | **YES, and the contract supports it** | control-reading correct **23/24** in isolation |
| Does structural separation remove prompt-order sensitivity? | **NO** | one block moved → **3/24** outcomes change, noise floor **0/24** |
| Does it fix the high-consequence axis? | **YES, completely and stably** | HC **12/12** under every variant and every resolver ordering |
| Does it fix the clarification axis? | **NO** | that axis absorbs all the residual instability |
| Is the residual a contract limit? | **NO** | ruled out — the facts come back individually correct |
| Is the residual a provider limit? | **INDICATED, NOT PROVEN** | self-contradiction on separated questions, but **n=1 model** |

---

## 2. The architecture result

`state-facts.ts` replaces the single ranked `conditionState` enum with six independently-emitted
semantic facts and a deterministic resolver. The ablation
(`scripts/ablate-l32g-state-separation.ts`) held model, digest, temperature, seed, `num_ctx`,
timeout, user prompt, observation text and evidence constant and varied only the representation.

**Noise floor first, because nothing below is readable without it.** `V_S_STRUCT` and
`V_S_STRUCT_REPEAT` are byte-identical prompts: **0/24 differing at both the model-label and derived
tiers.** Reproducibility on the new schema is perfect, so every difference reported here is an
effect and not variance.

### 2.1 What structural separation FIXED

**`F-WC-09` — PPE issued against a two-hand control strapped down with tape — is recovered.**
Both ladder variants returned **no ACTIVE candidate at all**; every structural variant returns
ACTIVE, via `controlReading: DEFEATED`. §36.6 called this "the strongest form of the error" and
§36.11 listed it as unfixed. Asking the control question *directly* closes it, and it stays closed
under every block ordering and every resolver ordering tested.

**The high-consequence axis is completely stable: 12/12 under all four structural variants and all
three resolver orderings.** Under the best resolver ordering the two §36.7 poles are satisfied
*simultaneously* for the first time in the programme:

| | HC | false ACTIVE | clarification precision | clarification recall |
|---|---|---|---|---|
| §36.7 variant A (ladder) | — | — | 88.9% | — |
| §36.7 variant B (ladder, shipped) | — | — | 100% | — |
| **V_S_STRUCT + R1_MISSING_FIRST** | **12/12** | **0/7** | **100%** | 75% |

### 2.2 What it did NOT fix — and this is why the phase closes PARTIAL

**Order sensitivity did not go away. On a size-matched manipulation it got worse.**

| pair | manipulation | scenarios differing | above noise? |
|---|---|---|---|
| ladder A vs B | ONE block moved | **1 / 24** | yes |
| structural, canonical vs MOVE1 | ONE block moved | **3 / 24** | yes |
| structural, canonical vs INVERTED | SIX blocks reversed | 3 / 24 | yes |

`V_S_STRUCT_MOVE1` exists precisely so this comparison is fair — comparing a six-block reversal
against §36.7's one-block move would have made structural separation look worse purely as an
artefact of perturbation size. Matched against matched, **the structural prompt is more
order-sensitive than the ladder, not less.**

All three differing scenarios are on the clarification axis (`F-CL-01`, `F-CL-03`, `C-CS-05`); none
is high-consequence. **The §36.7 trade was not resolved so much as RELOCATED**: the
high-consequence pole became robust and the uncertainty pole absorbed the whole of the instability.

### 2.3 The deterministic resolver — Question B

Tested over **frozen provider facts**, so provider variance is zero by construction and every
difference is attributable to the rule. The resolver as first written (`R0_HAZARD_FIRST`) was
**wrong**, and the ablation caught it: it resolved an asserted hazard before consulting a missing
decision-critical fact, so `F-OA-01` and `F-OA-02` lost their clarifications entirely (0% recall).
`R1_MISSING_FIRST` — §35.2's rule taken literally — gives 100% precision, 75% recall, 0 false ACTIVE.

> **The ranking did not disappear; it MOVED.** It is now in auditable code with a fixed, testable
> order rather than in prose that shifts when a paragraph is edited. That is a real improvement in
> kind — §36.7's four phases of accidental drift become impossible — but it is not the same thing as
> eliminating the ranking, and this phase should not be read as claiming it was.

`R1` was selected against **known** cases. It is tuned on diagnostic evidence and carries **no**
generalisation claim.

### 2.4 Question C — provider, contract, or prompt-order bound?

**`CONTRACT_OR_ARCHITECTURE_LIMIT` is RULED OUT, with direct evidence.** The provider answers
§36.4's control question correctly in isolation on **23 of 24** runs — `WARNS_ONLY` for warning
tape, a sign and a briefing; `DEFEATED` for the strapped-down two-hand control; `ABSENT` for
"unsupported roof"; `PREVENTS_CONTACT` for a fitted blanking plate. (The single miss reads
`F-WC-02`'s pit as `ABSENT` rather than `WARNS_ONLY`; both derive ACTIVE, so it costs nothing.)
`L3_CONTROL_HIERARCHY_LEVELS` has carried this distinction since L3-1 and the contract can express
it.

**The residual points at the provider, and the pointer is direct rather than merely eliminative.**
`4–12%` of candidates carry an INTERNAL contradiction — most often `framing: CONDITIONAL` together
with `hazardAsserted: true` about the same text. These are two separated, non-competing questions;
no ranking can be blamed for an answer that contradicts itself. On `C-CS-05` the model emitted
`asserted=false, framing=CONDITIONAL` under one ordering and `asserted=true, framing=CONDITIONAL`
under another — the same isolated question, answered both ways.

**But it is not PROVEN**, and that word is the reason this phase does not close on option B. The
attribution rests on **one model**. §31.1's finding still holds — no hosted-provider credential is
resolvable on this machine, and `qwen3-coder:30b` is the only model pulled — so no second provider
could be run. `PROVIDER_CAPABILITY_LIMIT_PROVEN` would overstate a single-model result on 24
diagnostic scenarios.

---

## 3. The decision

> ### `L3_2G_PARTIAL — STRUCTURAL_STATE_DECISION_INCONCLUSIVE`

Against the entry contract's four options:

* **Not A.** The success criterion requires the known clarification cases preserved **"without
  relying on their prompt block position."** They still rely on it: 3/24 above a 0/24 floor.
  Declaring A would authorise burning the new independent corpus on a configuration whose numbers do
  not reproduce under a different, equally arbitrary block ordering — the precise failure §36.7
  warns against.
* **Not B.** Well-supported for the residual, and it is the closest fit operationally, but
  `PROVEN` is not available from one provider.
* **Not C.** Affirmatively ruled out by §2.4.

**D states the situation exactly: C is eliminated; A and B cannot be separated without a second
provider.** The single missing experiment is named in `NEXT_ACTION.md`.

D's operational content — **do not consume fresh acceptance evidence** — is also the correct call
independently of the labelling.

---

## 4. Binder residual — CLOSED

`BINDER_RESIDUAL_ROOT_CAUSE` `BINDER_RESIDUAL_FIX` `BINDER_RESIDUAL_REGRESSION_PASS`

Proven before and after, independently of the provider experiment, with no inference involved
(`rootcause/binder-residual-{pre,post}-patch.json`).

**The audit the L3-2f exit contract asked for found nine more tokens of `F-WC-02`'s shape, not one.**
Pre-patch **20/30** fixtures holding; ten ambiguous tokens each deleted a correct high-consequence
ACTIVE. Post-patch **26/30**, with **zero unexplained deviations** — all four remaining are declared
accepted costs whose expectations were left at their pre-repair values rather than relabelled.

**The line is at SENSE, not at OBJECT, and measurement forced that distinction.** A first pass
removed every token whose non-correction reading had been demonstrated, and it broke two
prior-phase gates that are *right* (`test:l32b` "unhandled contradiction is fatal" — the guard
itself was replaced; `test:l32e` "PAIR/unnegated correction" — a full lockout was applied). Seven
different-sense tokens leave the rejection half (`fixed` `destroyed` `reset` `addressed`
`closed out` `resolved` `restored`); the same-sense-different-object tokens stay.

`checkStateSupported` keeps `CORRECTION_TOKENS` in full — §35.1's asymmetry, and the reason the
removal is safe.

**Known residual, recorded not closed:** same-sense-different-object still deletes under a broad
quote. `DISC-02`-shaped, bounded by the prompt's shortest-span rule, asserted in the suite so it
cannot change silently.

---

## 5. Multi-hazard scoring harness — CORRECTED

`build-l32f-holdout.ts` wrote `minimumCandidates`; `score-l32f-reasoning.ts` read `minCandidates`.
The type declared both. `decompositionScored` never incremented and every L3-2f tier reported
`multiHazardWithinTolerance: "n/a"` — the scorer never ran.

**The frozen holdout was NOT edited.** sha256 `47f92dae…` verified byte-identical; the READER now
accepts the key the frozen artifact carries. Re-scoring L3-2f's recorded run: **1 of 1 at all three
tiers**, agreeing with §36.5's direct inspection. Diffed against the original score file, **exactly
six keys changed, all `multiHazardWithinTolerance`** — every other L3-2f number byte-identical.

---

## 6. Regression — 715 assertions, 0 failed

| suite | result |
|---|---|
| l32g-state-separation | **57**, 0 failed *(incl. a 120-combination exhaustive `L3-INV-04` proof)* |
| l32f · l32e · l32d · l32c · l32b · l32 · l31 | 77 · 82 · 71 · 86 · 105 · 189 · 48, all 0 failed |
| **total** | **715, 0 failed** |
| `test:hazlenz-core` | **206 pass / 2 fail — identical to L3-2f**, the two §13.1 failures only, no third |
| kg4a-cutover-contract · kg4a-default-off · kg4b-shadow · kg3f-predicate · kg3f-determinism | 146 · 51 · 123 · 16 · 170, all unchanged |
| evidence-foundation | 35 assertions, passed |

Two prior-phase suites failed mid-phase and **both were my own over-broad first pass**, not
pre-existing; diagnosed against an unpatched copy, and closed by narrowing the repair rather than by
weakening the assertions.

## 7. Customer authority — MEASURED, UNCHANGED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1…L3-2g work, through the real
customer pipeline on a **disposable** database (`test_l32g_invariance_20260823`, created by
`createdb -T`, resolved target verified before execution, dropped after). Volatility derived
empirically from two identical-code runs.

**0 scenarios with a non-volatile difference over 66.** The 7 empirically-derived volatile paths and
6 volatile field roles are the **identical set** every prior phase derived. Verdict
`CUSTOMER_AUTHORITY_UNCHANGED`. `diff -rq` over the two checkouts' `backend/src`: exactly one
difference, the **added** `reasoning-l3` directory.

The original `safescope` development database was never a target and is untouched.

## 8. Boundary — `SECURITY_AND_BOUNDARY.txt`

Zero importers of `reasoning-l3` outside itself · zero importers of `state-facts` outside the L3-2g
scripts · zero Nest/TypeORM decorators inside `reasoning-l3` · the seam
(`intelligence-orchestrator.service.ts`), its call site (`safescope-v2.service.ts`) and
`backend/src/standards/` byte-unmodified vs HEAD · the only reachable network destination is
`http://127.0.0.1:11434` · the shipped prompt and runner do not reference `state-facts` at all.

`state-facts.ts` is `ARCHITECTURE_SELECTION_EVIDENCE_ONLY` and is on no customer path.

## 9. Weak fixtures · independent evidence

`X-NC-03` and `X-WC-02` classified `AMBIGUOUS_DIAGNOSTIC_FIXTURE`, excluded from hard-gate use,
**text and labels byte-unchanged**; `X-WC-02` additionally returned **three different outcomes
across three L3-2f runs**, which settles it independently of any interpretation. Both guards retain
full coverage through unambiguous fixtures. See `WEAK_FIXTURE_DISPOSITION.md`.

Independent source identified and characterised: **`safescope-gauntlet.source.v1.json`** — 150 rows
derived from **real regulator records** (66 fatality reports, 51 inspection violations, 33
investigation summaries; OSHA 84 / MSHA 66; 139 critical-or-high; 21 families; **0 overlap**),
authored **ten weeks before L3-2 began**. Ambiguity complement:
`safescope-field-realism-pack-v2.v1.json`, 92 rows carrying a pre-existing
`shouldHaveMissingEvidence` flag. Negative controls remain unavailable independently and must still
be authored — measured, not assumed. See `evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md`.

## 10. L3-3 eligibility

**Not eligible.** The high-consequence gate has not been demonstrated at zero on fresh sealed
evidence, and no fresh sealed evidence was consumed by this phase. Family coverage remains complete
at 24 of 24.
