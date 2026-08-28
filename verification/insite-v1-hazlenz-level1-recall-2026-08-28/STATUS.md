# HazLenz deterministic Level-1 recall closure before Expert HazLenz — 2026-08-28

```
TERMINAL = HAZLENZ_DETERMINISTIC_SAFETY_FLOOR_HARDENED
           — EXPERT_HAZLENZ_IMPLEMENTATION_AUTHORIZATION_REQUIRED
```

Scope: determine whether the **complete** deterministic Level-1 authority already
recovers the eleven decomposition-layer omissions recorded by the preceding
precision phase, classify what remains, and repair only what the measurement
proves is genuinely absent from the customer-authoritative safety floor. No
Expert / LLM behaviour was implemented and no provider call was made.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / stash / reset / restore / clean / rebase | **none performed** |
| pre-existing uncommitted work | preserved untouched |
| stashes | 4, untouched |

Frozen evaluation surfaces are unchanged, proved by hash:

| path | SHA-256 | state |
|---|---|---|
| `backend/src/safescope-v2/tests/hazlenz-decomposition-precision-corpus.ts` | `1e61840ad534d75d68e38abf5877975fa660620549e6927899ce6e9e0f3ef77e` | unchanged |
| `backend/src/safescope-v2/tests/hazlenz-decomposition-precision-scorer.ts` | `df6fd22f62dcf00a270e8b252ffe0eb4f1ef7dcb9e924e24bb08e50543863a57` | unchanged |
| `backend/src/safescope-v2/safescope-v2.service.ts` | `1121b36d3284fcd748cb68d85b1a6e48afc8c034b47255e65e9acfc954f7217a` | unchanged in this phase |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `463342909c715d9ca774b7578b5f47c7757685bec883b86e9196711006962422` | **changed by this phase** |

No corpus row, scorer, threshold, expectation or assertion was edited, weakened
or relaxed at any point.

## 2. Phase 1 — the protected precision result was preserved

The accepted 2026-08-27 state was treated as the floor for this phase:
Population A precision 100.0 %, 0 forbidden emissions, and Population B
decomposition recall 32/43 with 7 life-critical omissions. The governing
invariant — *precision may not fall and no previously detected Population-B
required group may be lost* — held by measurement at every step (§6).

## 3. Phase 2 — whole-Level-1 measurement

New measurement instrument:
`backend/src/safescope-v2/tests/hazlenz-level1-recall-scorer.ts`
(SHA-256 `6585e4d10d054416c465f1719cd07084d6fad8c5e1de66b2bfeed82aefddfe71`).

It runs the **complete production classify path** — the real
`SafescopeV2Service.classify()` with the full intelligence orchestrator, the
real weighted classifier, the real knowledge router and shard service, and the
real `ApplicableStandardsService` bound to the development standards corpus
**read-only** (`synchronize: false`, `SELECT` only; no migration, seed or
mutation of any kind was executed against it) — over the same frozen 56 rows,
and scores them against the same frozen expectations with the same
distinct-emission rule.

**The scoring surface was declared before any Level-1 output was inspected**, and
was derived from the product's own data flow rather than from what the engine
happens to emit:

* **FINDINGS** — `multiHazardDecomposition.hazards[]`. This is the *only*
  surface `InspectionService.reconcileDecompositionFindings()` materialises into
  customer `inspection_findings` rows. Nothing anywhere in `classify()` ever adds
  a hazard to this array; the pipeline only filters it. That makes decomposition
  the finding-producing surface for the whole product, which is a stronger
  statement than the preceding phase's note that "the production classify path
  layers further detection above decomposition".
* **PRIMARY** — `family` / `classification` / `hazardCategory` /
  `multiHazardDecomposition.primaryHazard`: the analysis header the inspector
  reads.
* **ADDITIONAL** — `additionalHazards[]`.
* **STANDARDS** — citations, mapped to families by regulatory subject matter,
  **recorded but deliberately not counted**. A citation answers "which rule
  governs the hazard the engine already named"; counting it as proof that the
  hazard was surfaced would inflate recall.

`LEVEL1_REPRESENTED := FINDINGS ∪ PRIMARY ∪ ADDITIONAL`.

Both recorded measurements — `measurements/level1-before.json` and
`measurements/level1-after.json` — were produced by the **same** scorer revision
(SHA-256 above), which is the one in the worktree. An earlier development
revision of its citation→family map lacked a right digit boundary and would have
mis-recorded `1910.1053` as `1910.105`; that map is a **recorded-but-not-counted**
diagnostic and never touched a recall figure, and it was corrected before either
recorded measurement was taken.

### Measured Level-1 baseline (`measurements/level1-before.json`)

| metric | decomposition only | **complete Level-1** |
|---|---|---|
| Population B required-group recall | 74.4 % (32/43) | **81.4 % (35/43)** |
| life-critical recall | 28/35 | **30/35** |
| life-critical omissions | 7 | **5** |
| case-level full recall | 59.1 % | 68.2 % |
| Population A required-hazard omissions | 1 | 1 |

**The complete deterministic Level-1 engine did NOT recover the safety floor.**
Three of the eleven decomposition misses were recovered downstream; eight
survived, five of them life-critical. The Phase 4 gate therefore required
deterministic repair before Expert HazLenz.

### Per-omission determination (all eleven)

| # | row | required group | decomposition | complete Level-1 | determination |
|---|---|---|---|---|---|
| 1 | B-05 | `compressed_gas` (LC) | missed | represented (primary classification `compressed_gas`) | `DECOMPOSITION_MISSED_BUT_LEVEL1_RECOVERED` |
| 2 | B-07 | `atmospheric_hazard\|ventilation_air_quality\|respiratory_protection` | missed | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 3 | B-10 | `hydraulic_pneumatic_energy\|lockout_tagout` (LC) | missed | **absent** (only a `1910.147` citation, not a hazard) | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 4 | B-13 | `respiratory_protection\|ppe\|ventilation_air_quality` | missed | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 5 | B-15 | `lockout_tagout` (LC) | missed (emitted nothing at all) | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 6 | B-15 | `electrical` (LC) | missed | **absent** — the analysis header instead read *Machine Guarding* | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 7 | B-16 | `machine_guarding` | missed | represented (primary classification) | `DECOMPOSITION_MISSED_BUT_LEVEL1_RECOVERED` |
| 8 | B-16 | `ppe` | missed | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 9 | B-18 | `lockout_tagout` (LC) | missed | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 10 | B-19 | `hot_work\|welding_cutting` (LC) | missed | **absent** | `LEVEL1_REQUIRED_HAZARD_OMISSION` |
| 11 | B-20 | `suspended_loads\|cranes_hoists\|rigging_lifting` (LC) | missed | represented (`Lifting & Rigging` classification) | `DECOMPOSITION_MISSED_BUT_LEVEL1_RECOVERED` |

Plus the pre-existing Population-A required omission A-02 (`ppe` for "was not
wearing a face shield"), also absent from complete Level-1.

### B-15 — the MCC case, explicitly

**Before repair the complete deterministic Level-1 authority did not recognise
the hazardous-energy or electrical exposure at all.** Decomposition returned an
empty hazard list, so no finding could be materialised, and the analysis header
the inspector would have read said *Machine Guarding* — for an electrician
opening an MCC bucket with the upstream disconnect closed and no lock applied,
with live 480 V terminals exposed. Every one of the five split fragments routed
to `unknown`. This was the most serious result of the measurement.

## 4. Phase 3 — root causes, traced through the executing code

Each was established by tracing the actual route/predicate decisions, not
inferred from output. Full traces in `ROOT_CAUSE.md`.

| omission | responsible layer | mechanism |
|---|---|---|
| B-15 `electrical`, HE-01 | finding-local electrical-exposure preservation block | source vocabulary listed `terminal` singular while its sibling terms were pluralised, so `exposing live 480-volt **terminals**` failed the `\b…\b` boundary |
| B-15 `lockout_tagout`, HE-01 | cross-clause hazardous-energy detector | `crossClauseIntervention` had no component-replacement verb: "began **replacing** the starter" is not `servic*/maint*/repair*/interven*` |
| HE-05 | same detector | no evidence form for "absence of voltage was **not verified**" |
| B-18 `lockout_tagout` | LOTO control-absence vocabulary | adjectival "remained energized and **unlocked**" is not `no lock` / `not locked` |
| B-10 | hydraulic/pneumatic energy preservation block | pattern covered `retains pressure` and `pressure remains` but not the inverted `**pressure retained** in the cylinder` |
| B-19 `hot_work` | active-hot-work cross-clause detector | its exclusion word `permit` was unscoped, so a **confined-space** entry permit ("with no entry permit") suppressed a live weld inside a fuel tank |
| B-13 `respiratory_protection`, B-16 / A-02 `ppe` | PPE and respirator preservation blocks | deficiency predicates recognised only `without/required + item` or `item + absent/missing/not provided`, never the ordinary negative-possession forms "**wore no** eye or face protection", "**was not wearing** a face shield", "**neither was wearing** a respirator"; the PPE item vocabulary also could not match the coordinated "eye **or face** protection" |
| B-07 | candidate generation | the taxonomy router carries a single entity word (`gas`) for `atmospheric_hazard`, so "the atmosphere had **not been tested** for oxygen deficiency or hydrogen sulphide" produced no candidate — the omitted test *is* the hazard |

Two architectural facts were established and are recorded as standing
weaknesses rather than repaired here (§8): `HazardTaxonomyCoverageService.route()`
is **single-winner** — one fragment yields at most one domain, which is why
"welding inside the **tank**" routed to confined space and lost hot work — and
the router applies **hazard-negation semantics to control nouns**, so "no
respirator", "no fire watch" and "no eye protection" are discarded as negated
signal when they are in fact the affirmative evidence of the hazard.

## 5. Phases 5 and 6 — failing tests first, then the narrowest repairs

Two new evaluation artefacts were authored **before** any source change, and the
failure was demonstrated on the protected engine before a line was edited:

* `backend/src/safescope-v2/tests/hazlenz-level1-recall-probe-corpus.ts`
  (SHA-256 `808b4c6613624819d91c25282c4e29fd7e30157ccd7d50aa11aac3a6ed16cb56`) —
  the frozen hazardous-energy / MCC probe family (8 rows, each exposure case
  paired with its safe counterpart) and the verbatim repro of every Level-1
  omission.
* `backend/src/safescope-v2/tests/hazlenz-level1-recall-regression.ts`
  (SHA-256 `86911ab3a290324f32a992356ea3dab92ef20b8b65a3c57363aacbdaff073e9c`) —
  the protected gate, registered as the 33rd suite of `npm run test:hazlenz-core`
  and as `npm run test:hazlenz-level1-recall`.

**Demonstrated failure before any change: 13 failures across 17 checks.**

One production file was changed: `multi-hazard-decomposition.service.ts`
(230 insertions, 14 deletions).

1. **Evidence-independence guards extended to `electrical` and `lockout_tagout`**
   at `route.confidence <= 0.4` — the identical rule the precision phase applied
   to six other families. A weak router hit must carry the family's own
   *condition* evidence, not merely the family's name.
2. **`terminal` → `terminals?`** in the electrical-exposure source vocabulary.
3. **`replac*` / `install*` / "began work"** added to the cross-clause servicing
   vocabulary. This predicate only opens the detector; a hazardous-energy source
   **and** uncontrolled-energy evidence are still both required.
4. **"absence of voltage was not verified"** added as uncontrolled-energy evidence.
5. **`unlocked` / `un-locked`** added as a control-absence form.
6. **`pressure retained`** added alongside `retains pressure` / `pressure remains`.
7. **Hot-work exclusion scoped to a hot-work permit** rather than any permit.
8. **PPE and respirator deficiency predicates** extended with the negative-possession
   forms, and the PPE item vocabulary extended to the coordinated
   "eye or face protection".
9. **New atmospheric-evaluation preservation block** — a named atmospheric hazard
   plus an explicitly omitted atmospheric test, excluding a tested atmosphere,
   an uncertain statement, and a historically corrected one.

Explicitly **not** done: no remote provider or LLM inference; no global
confidence threshold lowered; no blanket promotion of decomposition candidates;
no weakening of negation, of safe-state detection, or of any precision predicate
added by the previous phase; no scorer, threshold or expectation modified; no
corpus row id or test sentence special-cased.

## 6. Results

### Complete Level-1 (the customer-authoritative safety floor)

| metric | before | after |
|---|---|---|
| Population B required-group recall | 81.4 % (35/43) | **100.0 % (43/43)** |
| life-critical recall | 30/35 | **35/35** |
| life-critical omissions | 5 | **0** |
| case-level full recall | 68.2 % | **100.0 %** |
| Population A required-hazard omissions | 1 | **0** |

`measurements/level1-before.json` → `measurements/level1-after.json`, identical
frozen corpus, identical scorer, both measured through the complete production
classify path.

### Decomposition layer (the finding-producing surface)

| metric | before | after |
|---|---|---|
| **A** forbidden-family count | 0 | **0** |
| **A** rows with a forbidden family | 0 / 34 | **0 / 34** |
| **A** case-level precision | 100.0 % | **100.0 %** |
| **A** unexpected (non-forbidden) families | 5 | 5 |
| **A** required-hazard omissions | 1 | **0** |
| **B** required-group recall | 74.4 % (32/43) | **93.0 % (40/43)** |
| **B** dangerous-omission rate | 25.6 % (11) | **7.0 % (3)** |
| **B** life-critical omissions | 7 | **2** |
| **B** case-level full recall | 59.1 % | **86.4 %** |
| combined dangerous omissions (A+B) | 12 | **3** |

**No Population-B group detected before is lost after, and no forbidden family
appeared.** Precision was preserved by measurement, not by assertion.

### Hazardous-energy / MCC probe family (Phase 6)

All 8 rows pass. The probe was authored before output was inspected and was
recorded as evaluation evidence rather than tuned. It surfaced **two precision
defects the frozen 56-row corpus did not reach**, both measured on the
unmodified engine and both repaired at source rather than excused:

* HE-07 "The electrical safety training matrix and the annual lockout procedure
  audit were both current" emitted `electrical` **and** `lockout_tagout`;
* HE-08 "A spare motor control centre bucket was stored on a shelf in the
  electrical room" emitted `electrical`.

Both now emit nothing, while HE-01 (MCC bucket, disconnect closed, no lock)
emits `electrical` + `lockout_tagout`, HE-03 (open enclosure, exposed energized
conductors) emits `electrical`, and HE-05 (disconnect open, absence of voltage
never verified) emits `lockout_tagout`. The three genuinely safe states —
verified isolation and lockout, closed enclosure with no work, documented LOTO —
emit no electrical or hazardous-energy finding. HE-06 additionally emits
`machine_guarding` for the guard repair it describes, which is correct and is
not a forbidden family for that row.

## 7. Phase 7 — regression

| suite | result |
|---|---|
| `npm run test:hazlenz-core` | **33/33 PASS** (including both protected gates), unrelaxed |
| `npx tsc --noEmit` | clean |
| `npm run test:hazlenz-precision` | PASS |
| `npm run test:hazlenz-level1-recall` | PASS (17 checks) |
| `scripts/validate-safescope-multi-hazard-decomposition-v1.ts` | PASS |
| `scripts/validate-safescope-generalization-intelligence-v1.ts` | PASS |
| `hazlenz-generalization-regression` | PASS |
| `hazlenz-energy-isolation-negation-regression` | PASS |
| `hazlenz-condition-state-invariants-regression` | PASS |
| `hazlenz-vague-candidate-retention-regression` | PASS |
| `hazlenz-primary-citation-visible-contract-regression` | PASS |
| `standard-applicability-regression` | PASS |
| `narrative-quality-regression` | PASS |
| `hazard-understanding-coverage-benchmark` | PASS |
| `golden-domain-intelligence-tests` | PASS |
| `golden-operational-reasoning-tests` | PASS |

**NEW_REGRESSION: none.**

**PRE_EXISTING failures**, adjudicated by *measurement*: the pre-change engine
was reconstructed in place, the four suites re-run against it, and the pre-change
file then restored and verified byte-identical by SHA-256
(`463342909c715d9ca774b7578b5f47c7757685bec883b86e9196711006962422`). The
reconstruction was independently validated by reproducing the phase-entry
decomposition metrics exactly (32/43, 11 omissions, 7 life-critical).

| suite | before | after | log diff |
|---|---|---|---|
| `domain-association-regression` | FAIL | FAIL | identical output |
| `golden-hazard-tests` | FAIL 1/12 | FAIL 1/12 | identical output |
| `hazlenz-vague-candidate-promotion-regression` | FAIL (2) | FAIL (2) | identical but for the dotenv banner |
| `hazlenz-standard-return-contract-regression` | FAIL (9) | FAIL (9) | identical but for the dotenv banner |

**UNVERIFIED** (environmental, not code — reported as unverified, never converted
to PASS):

| suite | reason |
|---|---|
| `golden-standards-tests` | refuses to run: would read the protected `safescope` corpus without the deliberate override. The override was **not** set. |
| `hazlenz-field-gauntlet`, `hazlenz-clarification-gauntlet`, `hazlenz-authentic-capability-gauntlet` | require a running server with a paid `fullSafeScope` entitlement; every request returns HTTP 402 |

## 8. Remaining deterministic weaknesses (not a clean bill of health)

These are measured, are **not** required-hazard omissions at Level-1, and are
recorded so they are not mistaken for closure:

* **Decomposition still misses three required groups** that only the primary
  classifier recovers: B-05 `compressed_gas`, B-16 `machine_guarding`,
  B-20 `suspended_loads`. Because customer `inspection_findings` are
  materialised **only** from decomposition, a hazard recovered solely by the
  analysis header is visible in the analysis but does **not** become its own
  finding with its own standard, risk and corrective action. That is a real
  architectural gap in finding-level completeness, distinct from Level-1 recall.
* **Single-winner routing.** `route()` returns at most one domain per fragment,
  so a clause carrying two hazards loses one unless a family-specific
  preservation block rescues it. The preservation blocks are the compensating
  mechanism and they are per-family, which is why coverage is uneven.
* **Control-noun negation.** The router discards "no respirator" / "no fire
  watch" / "no eye protection" as negated signal. Repaired for PPE, respiratory
  protection and atmospheric evaluation at the preservation layer; the router
  itself is unchanged, because changing it affects every consumer and the
  precision phase demonstrated that this layer is where false positives are
  generated.
* **Dead mechanism tokens.** Coverage-map mechanisms are snake_case identifiers
  (`electrical_shock`, `unexpected_startup`, `eye_injury`) that can never match
  prose, so they contribute nothing to routing. Left unchanged; noted.

## 9. Expert HazLenz readiness

See `EXPERT_HAZLENZ_READINESS_REASSESSMENT.md`. Blocker 7 is resolved by
measurement; six blockers remain and no implementation is authorised.

```
EXPERT_HAZLENZ_IMPLEMENTED = FALSE
PROVIDER_CALL_IMPLEMENTED  = FALSE
PROVIDER_CALLS_MADE        = 0
```
