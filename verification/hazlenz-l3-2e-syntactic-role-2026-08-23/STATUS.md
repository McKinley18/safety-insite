# L3-2e — Syntactic-Role Semantic Support + Observation-Availability Discrimination

> ## `L3_2E_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`
> ### `L3_2E_SCOPE_CONTRADICTION` — recorded, not acted on (see `rootcause/SCOPE_CONTRADICTION.txt`)

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged and equal to
`origin/release/insite-rc-2026-08-18`. Nothing committed, pushed, merged, rebased or reset. No
production operation, migration, release mutation, deployment, SHADOW or CUTOVER. Dependency graph
and `package-lock.json` byte-identical to HEAD.

## Why PARTIAL, in one paragraph

**Both authorized repairs work, and the clarification gate — the one that has moved every phase since
L3-2b — is now perfect on fresh sealed evidence: TP 3, FP 0, FN 0, precision 100%, recall 100%.**
Every E1 syntactic-role fixture passes, all seven proven defects are closed, and all six paired
counter-fixtures still refuse. `DISC-03` and `DISC-04` no longer delete `D-FLD-175`'s class, and the
L3-2c holdout recovers from 47/54 to **53/54**. Sealed family coverage went from 15 of 24 taxonomy
families to **23 of 24**. But the fresh holdout still records **two high-consequence misses**, both at
the provider stage, and the gate is zero. Separately, the sealed set exposed **two new defects
introduced by the E1 repair** and one **scope contradiction**: `D-NG-04` is now deleted at the binder
by `negation-scope.ts`, a module this phase is forbidden to touch, because the E2 repair made the
model quote correctly enough to reach it.

## The fresh sealed holdout

`backend/src/safescope-v2/reasoning-l3/eval/holdout-l32e.json`
sha256 **`b9da20bacb9548167b80f0da6a55e5f3059a5318e809ba23a204706702818e06`**, 84 scenarios, frozen at
`2026-08-23T00:22:27Z` — **before the repair code was written** — and byte-identical after execution.

| part | n | source |
|---|---|---|
| A `INDEPENDENT` | 40 | field dataset, stride `i % 5 === 1` — the rule L3-2d named in advance. Brings in `fall_protection`, one of the two field families no prior sealed set used |
| B `AUTHORED_COMPLEMENT` | 32 | syntactic-role 12, observation-availability 9, negative control 5, condition state 4, multi-hazard 2 |
| C `TARGETED_FAMILY_COMPLEMENT` | 12 | **family coverage only**, reported separately everywhere |

Overlap against all four prior sealed sets and both development sets, enforced by a throw:
**0 id clashes, 0 text clashes, 0 internal duplicates.** L3-2b `i%5===0`, L3-2c `i%5===2`, L3-2d
`i%5===4` and L3-2e `i%5===1` are pairwise disjoint by construction.

Part C exists for one reason, recorded before it was written: a coverage inventory across the four
prior sealed sets found **nine of twenty-four taxonomy families had never appeared in any sealed
evaluation**, and two more appeared with no high-consequence example. The field dataset carries six
families in total, so no deterministic sampling rule can close that gap.

## The measurement, at three tiers

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 63/66 | 63/66 | **62/66** |
| High-consequence misses (35 HC) | 2 | 2 | **2** |
| False ACTIVE (18 non-active) | 0 | 0 | **0** |
| **Negative-control false ACTIVE (7)** | **0** | **0** | **0** |
| Condition-state accuracy | 96.4% | 96.4% | **95.2%** |
| Corrected/control-state accuracy | 4/4 | 4/4 | **4/4** |
| Family accuracy | 64/66 | 64/66 | 62/66 |
| Multi-hazard within tolerance | 2/2 | 2/2 | **2/2** |
| Fabricated quotations | — | — | **0 of 83** |
| Evidence-binding rejections | — | **0** | **0** |
| Contradiction-check rejections | — | — | **1** |
| State-support rejections | — | — | **2** |
| Reproducibility | — | — | **84/84 (100%)** |

### Reported separately

| | INDEPENDENT (40) | AUTHORED (32) | TARGETED (12) |
|---|---|---|---|
| Hazard detection (SHIPPED) | 39/40 | 13/14 | 10/12 |
| High-consequence misses | 1 — `E-FLD-147` | 1 — `E-OA-07` | 0 |
| Negative-control false ACTIVE | n/a (set contains none) | 0 of 7 | n/a |
| Clarification | not testable (no cases) | TP 3 · FP 0 · FN 0 | n/a |

## Clarification confusion matrix — identical at all three tiers

| | TP | FP | FN | TN | precision | recall |
|---|---|---|---|---|---|---|
| RAW / POST-VALIDATOR / **SHIPPED** | **3** | **0** | **0** | **81** | **100%** | **100%** |

**Every gate the clarification axis carries is met on fresh sealed evidence.** No question was
attached to a decided state, none was withheld where one was owed, and the deterministic
clarification-scope gate had nothing to drop — the provider never produced a misplaced question.

## High-consequence analysis — 35 scenarios, 2 lost, both provider-stage

| id | provenance | provider | post-validator | shipped | stage | cause |
|---|---|---|---|---|---|---|
| `E-FLD-147` | INDEPENDENT | 1 candidate, `CONTROLLED` | 1 | 0 | **provider** | *"An active floor opening is marked with standard warning tape next to an unprotected edge."* The model classified warning tape as a control. The binder then refused `CONTROLLED` — correctly, since no control-in-place language is asserted — leaving nothing |
| `E-OA-07` | AUTHORED | **0 candidates** | 0 | 0 | **provider** | *"The methane monitor read zero at the face, and the roof bolter was operating under a section of unsupported roof that had already taken weight."* The clause-position class, not fully repaired on `msha` ground-control wording |

`E-FLD-147` was measured against the retired presence-based rule and is **`UNCHANGED_AND_CORRECT`** —
L3-2d would have refused `CONTROLLED` on the same text. It is not an L3-2e regression.

The other 33 high-consequence scenarios carried an ACTIVE candidate with bound evidence through every
stage. **Stage attribution across all shipped losses: provider 3, binder 1, validator 0, clarification
gate 0, integration 0.** The validator rejected nothing in 84 scenarios; the provider never failed,
timed out, retried or emitted malformed output.

## `DISC-03` analysis — the negated-hazard path

| case | old rule | new rule | verdict |
|---|---|---|---|
| "without **hazard** warning labels" | fires (substring) | does not fire — NP head is `labels` | **IMPROVED_BY_L3_2E** |
| "found no **damage** and no exposed conductors" | fires | fires — NP head **is** `damage` | UNCHANGED_AND_CORRECT |
| "no **damage** … **although** the earth conductor has been cut back" | fires | does not fire — contrastive clause follows | **IMPROVED_BY_L3_2E** |
| "no **deficiencies** against the storage standard" | fires | **does not fire** | **REGRESSED_BY_L3_2E** |
| "no hearing protection **issued**" (`E-FAM-04`) | fires | **still fires** | UNCHANGED_PRE_EXISTING_GAP |

Two problems remain in the head extraction, both measured:

* **`NP_TERMINATORS` is incomplete.** `against` is missing, so "deficiencies against the storage
  standard" resolves its head to `standard` and a genuinely negated hazard is no longer refused. A
  **precision regression introduced by L3-2e**; it did not manifest on this holdout (0 false ACTIVE)
  but it is a real weakening.
* **The head test is still a SUBSTRING test.** `issued` contains `issue`, and a post-modifying
  participle was taken as the head, so `E-FAM-04`'s noise-exposure finding is still deleted. The
  defect L3-2e set out to close survives in this one form.

## `DISC-04` analysis — the correction/removal path

All five reproduced deletions are closed and all four paired halves still refuse:

| case | role | outcome |
|---|---|---|
| `discarded` in "a pile of discarded conveyor rollers" | attributive modifier | **survives** |
| `discarded` in "was discarded before we left" | asserted predicate | still refused |
| `applied` in "no lockout is applied" | negated predicate | **survives** |
| `applied` in "a full lockout was applied" | asserted predicate | still refused |
| `removed` in "the chain guard has been removed" | predicate, subject is the control | **survives** |
| `removed from service` in full | unambiguous service withdrawal | still refused |

One new defect: `CORRECTED` on **"drew a replacement from the store"** is now refused
(`REGRESSED_BY_L3_2E`). The correction is expressed as a **noun phrase**, and requiring an asserted
predicate is too strict in that direction. The scenario still scores correctly — it was expected
non-active either way — but the state quality dropped.

## Observation-availability analysis

| id | unobserved fact | other predicate establishes the hazard? | deciding? | expected state | actual | expected question | actual |
|---|---|---|---|---|---|---|---|
| `E-OA-01` | whether any were clipped on | no | **yes** | non-active | INSUFFICIENT_EVIDENCE | yes | **yes** |
| `E-OA-02` | whether the switch was off | no | **yes** | non-active | INSUFFICIENT_EVIDENCE | yes | **yes** |
| `E-OA-03` | the asset number | **yes** | no | ACTIVE | ACTIVE | no | **no** |
| `E-OA-04` | which day it was opened | **yes** | no | ACTIVE | ACTIVE | no | **no** |
| `E-OA-05` | the last service record | **yes** | no | ACTIVE | ACTIVE | no | **no** |
| `E-OA-06` | none (clause-position trap) | **yes** | n/a | ACTIVE | ACTIVE | no | **no** |
| `E-OA-07` | none (clause-position trap) | **yes** | n/a | ACTIVE | **none** | no | no |
| `E-OA-08` | none | no | n/a | non-active | INSUFFICIENT_EVIDENCE | yes | **yes** |
| `E-OA-09` | none | no | n/a | non-active | none | no | **no** |

**Eight of nine correct.** `could not observe` is no longer collapsed into `insufficient evidence` in
either direction: an unobserved detail that decides nothing leaves the hazard ACTIVE with no
question, and an unobserved control that decides everything produces INSUFFICIENT_EVIDENCE with one.
The single failure, `E-OA-07`, carries no observation-availability wording at all — it is the
clause-position residue.

The deterministic detector recorded 3 observation gaps across the run, **advisory only**: it changed
no state and removed no candidate, by design.

## Family coverage

| | before L3-2e | after |
|---|---|---|
| Taxonomy families with sealed evidence | **15 of 24** | **23 of 24** |
| Families with no sealed example at all | 9 | **1** |

Newly covered: `compressed_air_hose_safety`, `drowning_hazards`, `emergency_egress`,
`fire_explosion`, `first_aid_eyewash_safety_shower_access`, `lifting_rigging`, `noise_exposure`,
`respirable_dust_silica`, `welding_cutting_hot_work`.

**`noise_exposure` remains `NOT_YET_SEALED_VALIDATED`** — its one scenario was deleted by the
surviving `DISC-03` substring defect described above, not by absence of coverage.

Reported honestly and separately: eight families passed their scenario under a **permitted
alternative label** rather than under their own (`confined_space`, `ground_control`,
`hazard_communication`, `lifting_rigging`, `material_handling`, `personal_protective_equipment`,
`welding_cutting_hot_work`, `noise_exposure`). The hazard was established; the specific label was not
exercised. That is coverage of the scenario, not of the label, and the distinction is kept.

## Advancement gate

| Gate | Result |
|---|---|
| High-consequence misses = 0 | **FAIL** — 2 (`E-FLD-147`, `E-OA-07`), both provider-stage |
| Negative-control false ACTIVE = 0 | **PASS** — 0 of 7 |
| Fabricated quotations = 0 | **PASS** — 0 of 83 |
| Clarification recall = 100% | **PASS** — 3 of 3 |
| Unnecessary clarifications = 0 | **PASS** — 0 |
| Clarification precision = 100% | **PASS** |
| Reproducibility = 100% | **PASS** — 84 of 84 |
| Customer-authoritative non-volatile differences = 0 | **PASS** — 0 over 66 |
| `D-FLD-175` failure class repaired generally | **PASS** — by role, no phrase exception; L3-2c set recovers 47→53 of 54 |
| `D-NG-04` / `D-CR-04` class repaired generally | **PARTIAL** — 8 of 9 observation-availability cases; `E-OA-07` remains |
| `DISC-03` non-predicate-role behaviour | **PARTIAL** — label-NP and contrastive cases closed; the substring/post-modifier case survives |
| `DISC-04` negated / non-predicate behaviour | **PASS** — all five closed, all four paired halves intact |
| H-AM-05 · H-FLD-141 · H-NG-02 · B08 · C11 · B10 · RC-08 | **PASS** — all seven |
| No new high-consequence regression | **PASS** — neither miss is new; `E-FLD-147` measured `UNCHANGED_AND_CORRECT` |
| No previously green Level-3 contract regression | **PASS** — 575 offline assertions, 0 failed |

**Thresholds were not lowered, clarification labels were not redefined after execution, the sealed
holdout was not modified, and no replacement holdout was built.**

## Family-coverage gate

**23 of 24 sealed-validated; `noise_exposure` classified `NOT_YET_SEALED_VALIDATED`.** The reasoning
system is **not** called validated as a whole. One family lacks sealed evidence, and eight more have
had their scenario pass without their own label being exercised — worth closing, but it is the
high-consequence gate rather than coverage that blocks L3-3.

## `DISC-02` status — unchanged, and deliberately

Still open. No deterministic check owns the complete ACTIVE-vs-control-in-place distinction. It can
only let a provider error stand, never delete a hazard, and across **five** sealed holdouts the
provider has not made that error. **Zero measured losses. Not remediated, as the entry contract
required.** No evidence appeared that it causes any L3-2e gate failure.

## Newly discovered defects

| id | defect | severity | provenance |
|---|---|---|---|
| `L3-2E-DISC-05` | `NP_TERMINATORS` omits `against`, so "no deficiencies **against** the storage standard" resolves its head to `standard` and a genuinely negated hazard is no longer refused | precision; 0 measured false ACTIVE | **new, introduced by L3-2e** |
| `L3-2E-DISC-06` | the NP-head test is still a **substring** match and takes a post-modifying participle as the head: `issued` matches `issue`, deleting `E-FAM-04`'s noise-exposure finding | recall; cost one family's sealed validation | **pre-existing; L3-2e failed to close it** |
| `L3-2E-DISC-07` | `CORRECTED` requires an asserted predicate, so a **nominal** correction — "drew a replacement from the store" — is refused | state quality; no scenario mis-scored | **new, introduced by L3-2e** |
| `L3_2E_SCOPE_CONTRADICTION` | `negation-scope.ts::hasPredicate()` cannot see lexical finite verbs (`went`, `climbed`), so a negation swallows the following clause and deletes `D-NG-04` at the binder | high-consequence recall | pre-existing; **inside the fenced module** — recorded, not acted on |

All four were found **after** the sealed holdout was opened and are therefore specified and
deliberately **not implemented**, the same refusal L3-2b made for `H-AM-05`, L3-2c for `DISC-03` and
L3-2d for its own two blockers. That refusal is the only reason the numbers above mean anything.

## Customer authority

> ### `CUSTOMER_AUTHORITY_UNCHANGED`

Pristine `git archive` of `1feda622` versus the same archive plus every uncommitted L3-1…L3-2e file,
through the real customer pipeline on a disposable database. Volatility **derived empirically** from
two same-code runs — the same 7 per-run id/timestamp paths every prior phase derived. **0 scenarios
with a non-volatile difference over 66.**

Structural corroboration: `diff -rq` over the two checkouts' `backend/src` reports exactly one
difference — the **added** `reasoning-l3` directory. Zero Nest or repository decorators inside it,
zero importers outside it, seam and `backend/src/standards/` byte-unchanged. Level 3 holds no
persistence authority, no reporting authority and no governed-content authority.

## Verification actually executed

| Check | Result |
|---|---|
| `test:l32e-syntactic-role` (new) | **82 passed, 0 failed** |
| `test:l32d-clarification-scope` | **71 passed, 0 failed** |
| `test:l32c-gate-polarity` | **86 passed, 0 failed** |
| `test:l32b-binder-precision` | **105 passed, 0 failed** |
| `test:l32-semantic-contract` | **183 passed, 0 failed** (up from 179 — it now audits the two new modules) |
| `test:l31-reasoning-contract` | **48 passed, 0 failed** |
| `npm run build` | exit 0 |
| `test:hazlenz-core` | **28 / 30** — the two documented failures only, no third |
| KG contracts | kg4a 146/146 · 51/51, kg4b-shadow 123/123, kg3f 16/16 · 170/170, evidence-foundation 35 |
| prerequisite-dependent suites | failures **byte-identical to pristine HEAD**, confirmed by executing both checkouts |
| Customer-authority invariance | **0 non-volatile differences over 66** |
| Reproducibility | **84 of 84 (100%)** |

Two prior-phase assertions were **rebound to their guarantees** and recorded: a prompt-version pin
that each phase legitimately advances, and L3-2d's clause rule, which L3-2e **generalised** from
"a negation governs only its own clause" to "evaluate every clause, not only the first" after the
ablation showed the defect was never about negation. Both guarantees are strictly broader now.

## Regression evidence on the retired sealed sets

> `REGRESSION_EVIDENCE` only. None of these can establish L3-2e advancement.

| set | hazards (SHIPPED) | HC misses | false ACTIVE | condition state | clarification |
|---|---|---|---|---|---|
| L3-2b | **62 / 62** | **0** | 0 of 19 | **100%** | TP 3 · FP 0 · FN 0 |
| L3-2c | **53 / 54** (was 47 at L3-2c, 49 at L3-2d) | **0** | 0 of 18 | 98.6% | TP 2 · FP 0 · FN 1 |
| L3-2d | 55 / 56 | 1 — `D-NG-04` | 1 of 21 | 97.4% | TP 5 · FP 0 · FN 1 |

The L3-2c recovery is the clearest measure of E1: the four `DISC-03`/`DISC-04` hazcom deletions that
cost that phase its detection are gone. `D-NG-04`'s reappearance on the L3-2d set is the scope
contradiction, not a regression in anything L3-2e changed.

## `L3_COMPARE` on the fresh holdout

| Classification | n |
|---|---|
| **Level-3 correct, Level-1 incorrect** | **41** |
| Both correct | 39 |
| Both incorrect | 3 |
| Level-1 correct, Level-3 incorrect | 1 |

Level 3 attached a verified evidence span to **73** findings; Level 1 to **0**. Level 1 raised 70
clarifications across 84 scenarios; Level 3 raised 3, all correct.
