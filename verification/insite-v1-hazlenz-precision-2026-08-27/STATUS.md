# HazLenz deterministic precision measurement and bounded remediation — 2026-08-27

```
TERMINAL = HAZLENZ_DETERMINISTIC_PRECISION_HARDENED
           — EXPERT_HAZLENZ_IMPLEMENTATION_AUTHORIZATION_REQUIRED
```

Scope: measure, root-cause and (only where justified by measurement) repair the
deterministic secondary-hazard decomposition precision defect recorded in
`../insite-v1-inspection-workflow-2026-08-27/PRECISION_DEFECT_MATERIAL_HANDLING.md`.
The accepted inspection lifecycle is untouched and remains frozen. No Expert /
LLM behaviour was implemented.

---

## 1. Baseline freeze

The HazLenz production-authority surface was verified clean against `HEAD`
(`d67d6456`) before any measurement, with these SHA-256 hashes:

| path | SHA-256 (pre-change) |
|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `7fef5221039e4188fe8304b665356c514f7b77cf085e3cc37fa5505804404227` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `f94ebe07420926bd7bd57b64126a16b285e24121b0981067a963b0d481f6f79e` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.types.ts` | `7c48c4e9f93270523934d1b5c83bbbd61dfc1975c4a606e28dfebcd55da905c2` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.validator.ts` | `d0e324774577651713be82efdeb2ca48254125dbc00d2324929e13f69765c493` |
| `backend/src/safescope-v2/hazard-taxonomy-coverage/hazard-taxonomy-coverage.service.ts` | `693ed4902a510ab799cdcbae7926516926d3a1ccecb0f557ee591c59e99a2883` |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `e03c792f8adce2de573dde712325d0fb1702c82c219e89d41afb5c48fa27b31b` |
| `backend/src/safescope-v2/reasoning-orchestrator/negation-context.util.ts` | `4c1b651485946e1528769045520b158596ee8c60b262f86a108f80f6a01e9f27` |
| `backend/src/safescope-v2/taxonomy.seed.ts` | `b605f86308479c0bb1e0162552dcf37e4ef065fa6e509444c5a6c41821b561cf` |

Governing rule for the whole phase: **precision may improve, dangerous hazard
recall may not regress.** No engine change was made before the corpus and
scorer existed.

## 2. The bounded corpus

`backend/src/safescope-v2/tests/hazlenz-decomposition-precision-corpus.ts`
(SHA-256 `1e61840ad534d75d68e38abf5877975fa660620549e6927899ce6e9e0f3ef77e`).

Authored in full **before** any engine output for these rows was inspected.
Expectations come from safety-domain reasoning about what a qualified reviewer
would confirm, never from what the engine happened to emit. No row was edited
after measurement.

* **Population A — 34 rows.** Contextual / incidental language that must not
  independently create a hazard. Includes all five preserved real failures
  (`material was being fed`, `the walkway passes within about two feet`,
  `face shield`, `welding shield`, `splash shield`) plus every category
  required: material/feed language incidental to machine operation;
  shield/guard/barrier language that is PPE, machine, arc-flash or thermal
  guarding; vehicle/fork/truck words as location or role descriptors;
  pressure/line/hose terminology with no pressure hazard; hot/grind/cut words
  negated, historical or idiomatic; and fall/opening/trench words used
  descriptively or in a verified-safe state. Each row declares required,
  allowed and specifically forbidden families. A Population A row is also a
  recall check: precision must not be bought by suppressing the row's real
  hazard.
* **Population B — 22 rows, 43 required hazard groups, 35 of them
  life-critical.** Genuine multi-hazard observations in which every listed
  hazard has its own independently sufficient evidence fragment: guarding+LOTO,
  electrical+guarding, excavation+fall, hot work+fire, compressed gas+hot work,
  mobile equipment+traffic control, confined space+atmosphere, chemical+PPE,
  suspended load+rigging, stored energy+guarding, and others. No keyword soup.

## 3. Predeclared metrics and scorer

`backend/src/safescope-v2/tests/hazlenz-decomposition-precision-scorer.ts`
(SHA-256 `df6fd22f62dcf00a270e8b252ffe0eb4f1ef7dcb9e924e24bb08e50543863a57`).

Population A: forbidden-family count, false secondary-promotion rate,
case-level precision, unexpected-family count, required-hazard omissions.
Population B: required secondary-hazard recall, dangerous-omission rate,
life-critical omission count, case-level full-hazard recall.

**Primary safety veto**, predeclared before any source change: a candidate is
inadmissible if the Population B dangerous-omission rate rises above baseline,
if any new life-critical omission appears, if Population B recall falls, or if
Population A required-hazard omissions rise.

Two adjudication rules were added to the scorer *before* the engine change, and
apply identically to the baseline and to every candidate:

1. **Taxonomy alias resolution.** The decomposition layer draws ids from two
   vocabularies (the taxonomy coverage map: `ppe`, `material_handling`, `noise`;
   and the engine's own canonical families: `personal_protective_equipment`,
   `material_handling_storage`, `noise_exposure`), several of which
   `src/safescope-v2/taxonomy/canonical-taxonomy-aliases.ts` already declares
   to be the same family. Both engine output and corpus labels are mapped
   through one table. This widens the forbidden sets exactly as much as the
   required/allowed sets, so it cannot hide a false positive. Genuinely
   distinct families are deliberately not merged. Where alias closure puts one
   canonical id in both the permitted and forbidden set for a single row, the
   row's explicit permission wins and the collision is printed
   (one occurrence: `A-28:slips_trips_falls_housekeeping`).
2. **Distinct-emission matching in Population B.** One emitted family can
   satisfy at most one required group, because two independently actionable
   hazards require two distinct findings.

## 4. Baseline measurement (unmodified engine)

`measurements/baseline.json`

| metric | baseline |
|---|---|
| Population A forbidden-family count | **24** |
| Population A rows carrying a forbidden family | **21 / 34** |
| Population A false secondary-promotion rate | **61.8 %** |
| Population A case-level precision | **38.2 %** |
| Population A required-hazard omissions | 1 |
| Population B required secondary-hazard recall | **74.4 % (32/43)** |
| Population B dangerous-omission rate | **25.6 % (11)** |
| Population B life-critical omissions | **7** |
| Population B case-level full-hazard recall | 59.1 % |

## 5. Root causes

Every Population A failure traced to the smallest deterministic rule
responsible. Full trace in `ROOT_CAUSE.md`.

| case | emitted family | triggering rule | evidence used | why invalid |
|---|---|---|---|---|
| A-01, A-05…A-07, A-31 | `material_handling` @0.2 | taxonomy router single bare-substring hit on entity `material` / `aisle`; no family evidence predicate downstream | "material was being fed", "the main aisle where employees pass" | material *state* and *location* are predicates of the guarding / electrical hazard, not handling or storage hazards |
| A-01, A-12, A-30 | `walking_working_surfaces` @0.2 | same router path on entity `walkway` | "the walkway passes within about two feet of the exposed pinch point" | proximity establishes exposure for another hazard; no surface deficiency is stated |
| A-02, A-03, A-04, A-09, A-10, A-11 | `excavation_trenching` @**0.85** | invalid lexical alias `shield(?:ing)?` in the excavation preservation block | "face shield", "welding shield", "splash shield", "arc-flash shield", "heat shield", "shielding their eyes" | the trench sense is always *trench shield / trench box*; every other field use is PPE, machine, arc-flash or thermal guarding, or the verb. A genuine unshored trench scored **0.60**, lower than these false positives |
| A-13 | `powered_industrial_trucks` @0.65 | `explicitPoweredTruck` fires on the bare word `forklift` anywhere in the text | "the forklift charging room" | an attributive location name, not a truck operating or defective |
| A-13, A-15 | `mobile_equipment` @0.2 | router bare-entity hit on `forklift` / `loader` | "the loader operator's break trailer" | a role and location descriptor |
| A-23 | `hot_work` @0.4 | `grindCutActivity` verb-form alternative matches any "were cutting" | "cutting their lunch break short" | idiomatic English with no physical sense |
| A-24 | `machine_guarding` @0.2 | router bare-entity hit on `guard`; no verified-safe exclusion at weak confidence | "the guard was correctly fitted" | an affirmative statement of compliance |
| A-26 | `excavation_trenching` @0.2 | router bare-entity hit on `trench`; no completed-condition exclusion | "the trench … has been fully backfilled, compacted and paved over" | a closed condition, not an active cave-in hazard |
| A-27 | `walking_working_surfaces` @0.4, `fall_protection` @0.8 | fall/opening preservation block's "effectively covered" exclusion matched only the participle `covered` within 40 characters | "the floor opening … was fitted with a hinged cover that was closed" | the opening is protected |
| A-28, A-29 | `fall_protection` @0.2/0.4 | router bare-entity hits on `fall`, `handrail`, `stairway` | "autumn leaf fall", "the stairway handrail was continuous, secure and free of damage" | an unrelated sense of the word, and a verified-sound fixture |

The dominant mechanism is one rule, not ten: `HazardTaxonomyCoverageService.route()`
scores a **single bare substring hit at confidence 0.2** and two at 0.4, and
`decompose()` promoted *any* non-`unknown` route into a finding. The engine
already carried family-relative false-current guards at `confidence <= 0.4` for
about twelve families; the defective families simply had none. The second
mechanism is a small set of specific lexical/predicate bugs, of which the
`shield` alias is by far the most damaging because it bypasses the router
entirely at 0.85.

## 6. Remediation

Two production files changed; 135 insertions, 4 deletions.

`backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`
(SHA-256 `e15cfc95de0302eed1cf7b30dac34eeb8aad27cd941b28ace774c8308e844186`)

1. **Family-keyed evidence-independence predicates at `route.confidence <= 0.4`**
   for `material_handling` / `material_handling_storage`,
   `walking_working_surfaces` / `slips_trips_falls` / `housekeeping`,
   `fall_protection`, `machine_guarding` / `conveyors` / `guarding_interlocks`
   (verified-sound assertion without any deficiency word),
   `mobile_equipment` / `forklifts` / `powered_industrial_trucks` /
   `powered_haulage`, and `excavation_trenching` (completed / backfilled).
   This follows the file's existing, accepted false-current guard pattern and is
   confined to routes that rest entirely on entity-word coincidence. **It is not
   a global confidence threshold**: a route arriving with its own family
   evidence is untouched, and no family's strong, independently preserved
   detection path is affected.
2. **Removed the invalid `shield(?:ing)?` excavation alias**, replaced with
   `(?:trench|excavation)\s+shield(?:ing)?|shield\s+box`. `shor(?:e|ing)` is
   unaffected. A completed / backfilled exclusion was added to the same block.
3. **Fall/opening protection exclusion widened** to recognise an opening fitted
   with a cover, lid, grating, plate, guardrail or barrier that is closed,
   latched or in place.
4. **Hot-work verb-form narrowed** by an idiomatic-object exclusion only
   ("cutting their lunch break short", "cutting costs", "cut corners"). A
   physical grinding or cutting task whose workpiece is unstated ("grinding
   nearby") remains hot work — sparks do not depend on the inspector naming the
   material.
5. **`explicitPoweredTruck` now requires operating, movement or defect context**,
   so a truck word used only to name a place or a person no longer manufactures
   a struck-by finding.

`backend/src/safescope-v2/safescope-v2.service.ts`
(SHA-256 `1121b36d3284fcd748cb68d85b1a6e48afc8c034b47255e65e9acfc954f7217a`)

6. The two generic evidence-gap fallbacks now honour the **`administrativeOnlyText`
   predicate the file already applies to `additionalInformationNeeded`**, so an
   administrative or records statement answers the same way on both
   clarification surfaces. This repairs a contract break that the precision fix
   exposed rather than caused — see §8.

Explicitly **not** done: no genuine multi-hazard observation was collapsed; no
regulatory terminology is demanded of the user; no global confidence threshold
was raised; no Level-1 coverage was weakened; no Expert/LLM inference was added;
no scorer, threshold, expectation or gold-set was modified.

## 7. Before / after

`measurements/baseline.json` vs `measurements/candidate.json`, identical frozen
corpus and identical scorer.

| metric | baseline | candidate | movement |
|---|---|---|---|
| **A** forbidden-family count | 24 | **0** | −24 |
| **A** rows with a forbidden family | 21 / 34 | **0 / 34** | −21 |
| **A** false secondary-promotion rate | 61.8 % | **0.0 %** | −61.8 pts |
| **A** case-level precision | 38.2 % | **100.0 %** | +61.8 pts |
| **A** unexpected (non-forbidden) families | 5 | 5 | unchanged |
| **A** required-hazard omissions | 1 | 1 | **unchanged** |
| **B** required secondary-hazard recall | 74.4 % (32/43) | 74.4 % (32/43) | **unchanged** |
| **B** dangerous-omission rate | 25.6 % (11) | 25.6 % (11) | **unchanged** |
| **B** life-critical omissions | 7 | 7 | **unchanged** |
| **B** case-level full-hazard recall | 59.1 % | 59.1 % | **unchanged** |
| combined dangerous omissions (A+B) | 12 | 12 | **unchanged** |

**Cases repaired (21):** A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-09, A-10,
A-11, A-12, A-13, A-15, A-23, A-24, A-26, A-27, A-28, A-29, A-30, A-31.
**New false promotions: none. Cases lost in Population B: none. New
life-critical omissions: none.**

Every Population B row emits exactly what it emitted before. The recall veto is
satisfied not by a margin but by identity.

### Recall gaps that existed before this work and still exist

These are baseline properties of the decomposition layer, **not** caused by this
change, and are recorded so they are not mistaken for a clean bill of health.
Eleven required hazard groups (seven life-critical) are missed by the
decomposition layer on Population B:

* B-05 misses `compressed_gas` (unchained cylinders, caps removed) — life-critical
* B-07 misses the atmospheric-hazard group beside `confined_space`
* B-10 misses the stored-energy group (raised ram, pressure retained) — life-critical
* B-13 misses the respiratory-protection group beside `silica_respirable_dust`
* B-15 emits **nothing** for an MCC bucket opened with the disconnect closed and
  no lock applied — life-critical, and the most serious of these
* B-16 emits nothing for a pedestal grinder with tool rest missing and no eye protection
* B-18 misses `lockout_tagout` beside `confined_space` — life-critical
* B-19 misses `hot_work` (welding inside a tank, "no fire watch" reads as
  negation) — life-critical
* B-20 misses the suspended-load / rigging group — life-critical
* A-02 does not emit a PPE finding for "not wearing a face shield while using a
  bench grinder"

These are measured on the **decomposition layer in isolation**, which is the
correct surface for this defect class (the preserved crusher-guard reproduction
matches it exactly). They are not a measurement of whole-product recall: the
production classify path layers further detection above decomposition, and
several of these families are recovered there. They are nonetheless real
decomposition-layer gaps, they are life-critical in seven cases, and closing
them is recall work that this precision-scoped operation deliberately did not
attempt.

## 8. Protected regression

`npm run test:hazlenz-core` — **31/31 suites PASS**, unrelaxed, plus the new
precision gate now registered as a 32nd suite. `npx tsc --noEmit` clean.

Additional suites run individually against the candidate:

| suite | result |
|---|---|
| `scripts/validate-safescope-multi-hazard-decomposition-v1.ts` | PASS |
| `hazlenz-generalization-regression` | PASS |
| `hazlenz-vague-candidate-retention-regression` | PASS |
| `hazlenz-primary-citation-visible-contract-regression` | PASS |
| `standard-applicability-regression` | PASS |
| `narrative-quality-regression` | PASS |
| `hazard-understanding-coverage-benchmark` | PASS |
| `golden-domain-intelligence-tests` | PASS |
| `golden-operational-reasoning-tests` | PASS |

**Two regressions were found during this work and repaired, not rationalised.**
Both were adjudicated by re-running the suite against the pristine `HEAD` engine
restored in place, so the attribution is measured rather than assumed:

* `validate-safescope-multi-hazard-decomposition-v1` — the first hot-work fix
  required a named workpiece, which suppressed a genuine `hot_work` emission on
  "grinding nearby". That is a recall loss, so the fix was replaced with the
  narrower idiomatic-object exclusion. Suite restored to PASS.
* `hazlenz-generalization-regression` "Lookalike non-hazard phrase" — this
  contract (`shouldHaveAdditionalInfo: false` for
  *"The fall safety meeting is scheduled for Monday and the training record is
  current."*) had been passing **because of the defect**: the spurious
  `fall_protection` finding from the bare word "fall" set
  `hasSpecificActiveFinding`, which suppressed the generic evidence-gap
  fallback. Removing the false promotion exposed the fallback. Repaired at
  source by reusing the file's own `administrativeOnlyText` predicate; the
  contract was not weakened. Suite restored to PASS.

**Failures confirmed pre-existing** (identical failure on the pristine `HEAD`
engine, therefore untouched by this work and out of scope here):

| suite | HEAD | candidate |
|---|---|---|
| `domain-association-regression` | FAIL | FAIL (same assertion) |
| `golden-hazard-tests` | FAIL 1/12 (LOTO confidence high→low) | FAIL 1/12 (same) |
| `hazlenz-vague-candidate-promotion-regression` | FAIL (2) | FAIL (2, same) |
| `hazlenz-standard-return-contract-regression` | FAIL (9) | FAIL (9, same) |

**Not executed** (environmental, not code): `golden-standards-tests` refuses to
run because it would read the protected `safescope` development database;
`hazlenz-field-gauntlet` and `hazlenz-clarification-gauntlet` require a running
server with a paid `fullSafeScope` entitlement and returned HTTP 402. These
remain unverified against this change.

## 9. Customer-labelled signals

Inspected, documented, **not** trained on and not used to tune anything. See
`EVALUATION_SIGNAL_CONTRACT.md`.

```
SIGNAL_CLASS = EVALUATION_SIGNAL
SIGNAL_CLASS != GROUND_TRUTH
ENGINE_TUNED_FROM_SIGNALS = FALSE
CUSTOMER_FINDINGS_ALTERED  = FALSE
```

## 10. Expert HazLenz readiness

See `EXPERT_HAZLENZ_READINESS_CONTRACT.md`. No provider call was implemented.

## 11. Worktree state

No commit, push, branch, tag, stash, reset, restore or clean was performed. The
repository's substantial pre-existing uncommitted work is untouched. Files
changed by this operation:

* modified: `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`
* modified: `backend/src/safescope-v2/safescope-v2.service.ts`
* modified: `backend/src/safescope-v2/tests/hazlenz-core-regression.ts` (one suite appended)
* modified: `backend/package.json` (two scripts appended)
* modified: `docs/INSITE_ENGINEERING_BLUEPRINT.md`, `docs/INSITE_CURRENT_STATE.json` (additive)
* new: the three precision test files and this verification package
