# L3-2g — the independent evidence source for the next acceptance run

`§36.10 CURRENT_FIELD_CORPUS_EXHAUSTED_FOR_FRESH_EVALUATION` — all five strides of
`safescope-field-validation-dataset.v1.json` are opened, and no prior field scenario may be reused.
This plan identifies the replacement, characterises it, and states the sealing procedure. **It is a
plan. Nothing here was opened for evaluation, and no acceptance run was performed.**

Machine-readable survey: `source-survey.json` (produced by `scripts/survey-l32g-evidence-sources.ts`).

---

## The methodological weakness this has to close

§36.10 states it plainly: *"five phases running, every precision, clarification and family-coverage
number rests on scenarios the implementer wrote."* The independent strides only ever supplied
positive hazard cases; **every** negative control, corrected state, clarification case and family
complement in L3-2b…L3-2f was authored by the phase whose defects it was measuring.

So the requirement is not merely "a new corpus". It is a corpus whose text was **fixed before the
defects existed**, so it cannot have been shaped by them.

---

## Recommended source — `safescope-gauntlet.source.v1.json`

`safescope-data/gauntlets/safescope-gauntlet.source.v1.json`
sha256 `a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4`, mtime **2026-06-11**, which is
**ten weeks before L3-2 began on 2026-08-22**.

**Provenance is the reason to prefer it, and it is the strongest available anywhere in this
repository.** These are not authored scenarios at all — they are derived from real regulator
records, and each row carries its own `sourceId` and `sourceType`:

| property | value |
|---|---|
| rows carrying observation text | **150** |
| `sourceType` | `fatality_report` **66** · `inspection_violation` **51** · `investigation_summary` **33** |
| `agency` | OSHA **84** · MSHA **66** — both regimes, no synthetic jurisdiction balance |
| `severityExpectation` | `critical` **103** · `high` **36** · `medium` 11 |
| distinct `primaryHazardFamily` | **21** |
| overlap with all opened sealed + development sets | **0 ids, 0 texts** |
| overlap with the exhausted field corpus | **0 ids, 0 texts** |

Family spread (top): Electrical 19 · Machine Guarding 18 · Ground Control/Highwall/Roof Fall 16 ·
Powered Mobile Equipment 15 · Chemical Storage 13 · Trenching & Shoring 9 · Fall Protection 9 ·
Hazard Communication 9 · Fire/Explosion 8 · Emergency Egress 7 · Lockout/Stored Energy 6 ·
Scaffolds 6 · Material Handling 4 · Lifting & Rigging 2 · Confined Space 2 · Ladders 2 · +5 more.

**139 of 150 rows are `critical` or `high`.** The gate that blocks L3-3 is high-consequence misses,
and this source is overwhelmingly high-consequence material of exactly the kind that gate is about.

> **It cannot have been authored to satisfy a known failure.** Its text predates L3-2 by ten weeks
> and derives from published regulator records rather than from anyone's judgement about what this
> engine finds hard. That is the property §36.10 says the programme has never had.

## Ambiguity complement — `safescope-field-realism-pack-v2.v1.json`

`safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json`, sha256 `6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb`, mtime **2026-06-15**, also
pre-programme. 117 rows, 0 overlap, 36 high-consequence-ish.

Its value is a field the other source does not have: ~~**`shouldHaveMissingEvidence`, declared on 92
rows**~~, plus `photosAvailable` and `employeeExposureKnown`.

> **`SUPERSEDED BY AMENDMENT D-C` — the figure `92` was never a count of this field.** It is the
> `ambiguityish` **heuristic text signal** from `source-survey.json`, promoted here into a claim about
> declared truth metadata. **Measured directly from the unmodified source at `6f6897f1…`:
> `=== true` on **87** rows · `=== false` on **2** · field **absent** on **28** · present on **89 / 117**.**
> The source is byte-identical and was never edited; the *record* was wrong. See **Amendment D-C**.

That field is a *pre-existing, independently
authored* ambiguity/clarification complement — the axis that has been 100% implementer-authored for
five phases. Its rows are written as genuinely partial observations ("the note says guarding may be
incomplete, but the photo angle does not clearly show whether a fixed guard is installed").

## What still has to be authored, and why that is not a failure of the plan

**Negative controls remain unavailable from any independent source.** The survey measured this
directly: negative-control-like text scored **0** across all twelve candidates. The reason is
structural and was already recorded at §32.3 — regulator records document violations and incidents,
so a corpus of real findings contains, by construction, almost no "the audit found nothing wrong"
rows. Corrected states are nearly as scarce (3 in the realism pack, 0 in the gauntlet).

So the next acceptance run's composition must be, and must be reported as:

| stratum | source | provenance class | gates? |
|---|---|---|---|
| positive / high-consequence | `gauntlet.source.v1` | **INDEPENDENT — real regulator records** | yes |
| ambiguity / clarification recall | `field-realism-pack-v2` | **INDEPENDENT — pre-programme authored** | yes |
| negative controls, corrected states | authored by the phase | AUTHORED | yes, reported **separately** |

**Authored rows may supplement but must never constitute the independent source**, and the
by-provenance table L3-2f introduced (§36.5) must be kept so the independent number is always
readable on its own.

---

## Sampling and sealing procedure

1. **Freeze the source hashes first.** Record sha256 of both files in the phase's `HOLDOUT_FREEZE.txt`
   **before** any selection code runs, as L3-2b…L3-2f did.
2. **Deterministic selection, declared before execution.** ~~Sort by `scenarioId`; take a fixed stride
   over the gauntlet source and a fixed stride over the realism pack.~~ Record the rule in the freeze
   record. **`SUPERSEDED BY AMENDMENTS D-A AND D-B`** — this clause named no modulus, no offset and no
   reservation schedule, and its sort key `scenarioId` **does not exist on any of the 117 realism-pack
   rows**. The binding rule is now **Amendment D-A** (gauntlet) and **Amendment D-B** (realism pack). **Reserve the unused strides** — the field corpus was exhausted precisely because that
   was not planned. Budget explicitly: `gauntlet.source.v1` 150 + `gauntlet.seed` 99 (measured
   disjoint) + `field-realism-pack-v2` 117 = **366 independent rows**, enough for roughly four
   future acceptance runs at L3-2f's scale if each takes a stride rather than the whole file.
3. **Intended holdout size ~90–100**, matching L3-2f's 97: ~~roughly 45 independent gauntlet rows,
   ~20 independent realism-pack ambiguity rows, ~25 authored negative/corrected complement~~, plus a
   separately-reported targeted complement only where a family is otherwise unreachable.
   **`SUPERSEDED BY AMENDMENTS D-A, D-B AND D-D` — the approximate counts are now exact:
   38 gauntlet + 29 realism-pack + 25 authored = 92**, inside the ~90–100 band this clause set.
4. **Overlap enforced by a throw at build time**, against every prior sealed set, every development
   set, the exhausted field corpus, **and now both new sources' previously-used strides** — the
   builder pattern L3-2b established and every phase since has kept.
5. **Freeze before the repair code is written.** The holdout file is hashed, the hash recorded, and
   the hash re-verified byte-identical after execution. Every phase from L3-2b onward did this and
   it is the only reason their numbers mean anything.
6. **Translate observations without editing them.** The gauntlet rows carry `observation` plus rich
   metadata; only the observation text may reach the model, and it must be carried verbatim. Any
   normalisation is a text edit and must be recorded as one.
7. **Open once, then retire.** Opened sets become development evidence, never gate evidence again.

## Eligibility of the source is established; its CONTENT stays sealed

This survey read ids, families, severities, `sourceType`, mtimes and hashes, and computed overlap
over normalised text. It printed **no observation text** and ran **no inference and no scoring**.
The rows remain unopened for evaluation purposes.

## Sources considered and not recommended

| source | why not |
|---|---|
| `safescope-gauntlet.seed.json` | 100 rows (99 with text), eligible, same regulator-derived schema. **Measured DISJOINT from `.source.v1`: 0 of 99 normalised texts intersect**, so it is a genuine second tranche rather than a subset. Held as the reserve for the phase after next. |
| `safescope-finding-audit.v1.json` | 50 rows, eligible, only 10 high-consequence-ish; useful as a supplementary stratum, too small to carry a run. |
| `safescope-scenario-expansion-pack.v1.json` | 60 rows, but the observations are templated (*"Observation for machine_guarding scenario 0"*) and carry no real field language. **Not usable.** |
| `full-hazard-coverage-expansion-v1`, `generalization-unseen-scenarios-v1`, `failure-mode-calibration-pack-v1`, `precision-batch-001/2/3` | 10–30 rows each; too small individually, and all pre-programme authored rather than independently sourced. Reserve as family complements. |
| `safescope-field-validation-dataset.v1.json` | **EXHAUSTED** — all five strides opened (§36.10). Ineligible by contract. |

---
---

# AMENDMENT 1 — `D-A` … `D-D` (2026-08-24) `BINDING`

`L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED — HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`

This amendment resolves defects `E-1`…`E-4` recorded by the blocked construction phase
(`verification/hazlenz-l3-acceptance-holdout-construction-2026-08-24/`, `D-85`). **It is a
specification. No holdout was constructed, no row was selected, no observation text was inspected and
no control was authored under it.**

**Governing principle.** Everything below is mechanical. A construction phase executing this
amendment exercises **no semantic judgment whatsoever**: it reads bytes, sorts by a total comparator,
takes an arithmetically derived offset, and assigns truth metadata by table lookup from fields the
frozen sources already carry. **Where this amendment leaves a choice, that is a defect in this
amendment and the construction phase must STOP rather than choose.**

**Nothing here changes `G1`…`G10`.** They remain exactly as pre-registered at `D-84`, fixed while
zero sealed rows had been seen by anyone. This amendment defines only *what the holdout contains* and
*what the truth metadata is*, never what a gate requires.

---

## Shared definitions

### S-1 · Canonical text normalization `NORM(s)`

Applied **only** for duplicate and overlap comparison. **It never alters the text carried to the
model**, which is always verbatim source bytes (see `S-4`).

```
NORM(s) = String(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
```

**Verified**: `NORM` reproduces the evidence inventory of record exactly — distinct texts
`gauntlet.source.v1` **150**, `gauntlet.seed` **99**, `field-realism-pack-v2` **117**, **total 366**,
with **0** intersections across all three pairs. It is byte-compatible with the `source-survey.json`
normalizer, which used the same lowercase/whitespace/trim rule; the added `NFC` step changes no count.

### S-2 · Canonical key comparator `CMP(a, b)`

```
CMP(a, b) = Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'))
```

Lexicographic over **UTF-8 bytes**, ascending, shorter proper prefix first. **No case folding, no
locale collation, no Unicode normalization, no numeric-suffix awareness.** Sorting is ascending by
`CMP` over the declared sort key.

**Totality requirement.** The builder MUST assert that the sort keys are **pairwise distinct** before
sorting. If any two rows share a sort key, `CMP` is not a strict total order and the builder **MUST
THROW**. Verified at amendment time: `gauntlet.source.v1` **150 distinct of 150**;
`field-realism-pack-v2` **117 distinct of 117**; `CMP` strict-total on both.

### S-3 · Canonical offset derivation `OFFSET(digest, m)`

```
OFFSET(digest, m) = parseInt(digest.slice(-8), 16) % m
```

where `digest` is the **lowercase 64-character hex SHA-256 of the whole source file's bytes**, and
`digest.slice(-8)` is its **last 8 hex characters**, read as a **big-endian unsigned 32-bit integer**
in base 16.

**This is the entire offset rule.** The offset is *derived*, never chosen. **Inspecting the semantic
composition of any partition — its families, severities, ambiguity flags or text — before, during or
after offset derivation is PROHIBITED, and cannot change the offset in any case**, because the offset
is a pure function of bytes that were frozen months before this programme began.

### S-4 · Verbatim carriage

Exactly one field per source reaches the model, copied **byte-for-byte** with **no normalization, no
trimming, no case change and no re-encoding**. Every other source field is **withheld** from the
model and retained only as truth metadata for the scorer. Any deviation is a text edit and must be
recorded as one (`§37.10`, step 6 of the original procedure).

### S-5 · Source-drift guard

Before any selection, the builder MUST verify, for every source it reads, that the **SHA-256 and the
physical row count** equal the values frozen in this amendment. **If either differs, the builder MUST
THROW.** It MUST NOT rescale a modulus, re-derive an offset, resize a partition or adapt in any other
way. A changed source invalidates this amendment and requires a new one.

---

## `D-A` — `gauntlet.source.v1` reservation rule `BINDING`

Resolves **`E-1`**.

| # | element | value |
|---|---|---|
| 1 | source | `safescope-data/gauntlets/safescope-gauntlet.source.v1.json` |
| 1 | frozen sha256 | `a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4` |
| 1 | frozen physical rows | **150** |
| 2 | sort field | **`scenarioId`** — present and distinct on 150/150 |
| 3 | comparator | **`CMP`** (`S-2`), ascending |
| 4 | normalization applied to the sort key | **NONE.** The raw `scenarioId` string is compared |
| 5 | index | `i` = **0-based** position in the ascending sorted array |
| 6 | modulus | **`m = 4`** |
| 7 | selection predicate | **`i % 4 === k`** |
| 8 | offset derivation | `k = OFFSET(a95e…adb4, 4)` = `parseInt("22f0adb4", 16) % 4` = `586198452 % 4` = **`0`** |
| 9 | **acceptance offset (run 1)** | **`k = 0`** → **38 rows** |
| 10 | partition sizes | offset `0` → **38** · `1` → **38** · `2` → **37** · `3` → **37** · Σ = 150 |
| 11 | reservation schedule | **`0` → `1` → `2` → `3`**, cyclic from `k`; run *n* uses offset `(0 + n − 1) mod 4` |
| 12 | verbatim carrier | **`observation`** (`S-4`) |
| 13 | scenario identifier | **`scenarioId`** |

**Reservation is immutable.** Offsets `1`, `2`, `3` are reserved for acceptance runs 2, 3 and 4 in
that order. **A reservation may never be reassigned on the basis of semantic composition, family
balance, difficulty, or any observed model performance.** An offset opened for an acceptance run is
**spent** and is retired permanently (`§29.8`), whatever the result.

**Duplicate handling.** Sort keys must be pairwise distinct (`S-2`) or **THROW**. Within the selected
partition, if any two rows share `NORM(observation)`, **THROW** — no silent de-duplication, no
replacement.

**No discretionary replacement.** A selected row that is inconvenient, ambiguous, malformed, or
likely to cause a gate failure **remains selected**. There is no mechanism in this amendment by which
a row may be dropped, swapped, or substituted.

**Source-size change** → `S-5`: **THROW**.

---

## `D-B` — `field-realism-pack-v2` field mapping and reservation rule `BINDING`

Resolves **`E-2`** and the selection half of **`E-3`**.

### D-B.1 Field mapping — the plan's original keys do not exist on this source

| plan's original key | present on | **canonical mapping** |
|---|---|---|
| `scenarioId` | **0 of 117** | → **`id`** (present and distinct on 117/117) |
| `observation` | **0 of 117** | → **`hazardObservation`** (present on 117/117) |

- **Canonical scenario identifier: `id`.**
- **Canonical verbatim observation carrier: `hazardObservation`**, and **it alone** reaches the model.
- **Explicitly WITHHELD from the model** (retained as truth metadata only): `title`, `expectedTerms`,
  `taskContext`, `equipmentInvolved`, `siteType`, `industryContext`, `photosAvailable`,
  `employeeExposureKnown`, `shouldHaveMissingEvidence`.

### D-B.2 Reservation rule

| # | element | value |
|---|---|---|
| 1 | source | `safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json` |
| 1 | frozen sha256 | `6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb` |
| 1 | frozen physical rows | **117** |
| 2 | **stride population** | **THE ENTIRE 117-ROW PHYSICAL SOURCE.** See D-B.3 |
| 3 | sort field | **`id`** |
| 4 | comparator | **`CMP`** (`S-2`), ascending; raw key, no normalization |
| 5 | index | `i` = **0-based** position in the ascending sorted array |
| 6 | modulus | **`m = 4`** |
| 7 | selection predicate | **`i % 4 === k`** |
| 8 | offset derivation | `k = OFFSET(6f68…a9cb, 4)` = `parseInt("5231a9cb", 16) % 4` = `1378986443 % 4` = **`3`** |
| 9 | **acceptance offset (run 1)** | **`k = 3`** → **29 rows** |
| 10 | partition sizes | offset `0` → **30** · `1` → **29** · `2` → **29** · `3` → **29** · Σ = 117 |
| 11 | reservation schedule | **`3` → `0` → `1` → `2`**, cyclic from `k` |
| 12 | verbatim carrier | **`hazardObservation`** (`S-4`) |
| 13 | scenario identifier | **`id`** |

### D-B.3 Ambiguity status MUST NOT gate selection `PROTECTED`

> **Selection strides the full 117-row population. `shouldHaveMissingEvidence` — and every other
> ambiguity heuristic — is FORBIDDEN as a selection criterion.**

Striding only the flag-true subset would let the holdout's builder choose its own `G3` denominator,
which is precisely the failure `E-3` identified. **Ambiguity status is read *after* selection, from
frozen source metadata, solely to compute the already-registered `G3` denominators (`D-C`, and the
predicates in `G3-DEN`).** It never decides whether a row enters the stride.

**Consequence, accepted in advance:** the number of `CLARIFICATION_REQUIRED` rows in the reserved
partition is whatever the frozen metadata makes it. **That number was not computed at amendment time
and must not be**; it is a property of the partition, discovered by the scorer at run time, and it
may not be used to revisit the offset, the modulus or the population.

### D-B.4 Duplicate, missing-field and drift behaviour

- Sort keys pairwise distinct (`S-2`) or **THROW**.
- Two selected rows sharing `NORM(hazardObservation)` → **THROW**.
- A selected row whose `hazardObservation` is **absent, non-string, or empty after `NORM`** → **THROW**.
  It is **not** skipped and **not** replaced — a missing carrier means the source is not what this
  amendment froze.
- `shouldHaveMissingEvidence` **absent** on a selected row is **NOT** an error: it is a declared,
  meaningful state handled by `G3-DEN` below.
- Source sha256 or row count differs → `S-5`: **THROW**.

---

## `D-C` — the ambiguity record, corrected `BINDING`

Resolves the factual half of **`E-3`**.

### D-C.1 The authoritative measurement

Measured directly from the **unmodified, hash-identical** source `6f6897f1…`:

| `shouldHaveMissingEvidence` | rows |
|---|---|
| `=== true` | **87** |
| `=== false` | **2** |
| field **absent** | **28** |
| **field present** | **89 / 117** |
| total | **117** |

**This is the authoritative truth metadata.** `§37.10` and this plan's own body previously recorded
*"declared on 92 rows"*; **that claim is withdrawn as a statement about this field.**

### D-C.2 The provenance of `92`, preserved

**`92` was a real measurement and is not deleted — it was simply never a count of this field.** It is
`source-survey.json`'s `complementSignals.ambiguityish`, a **heuristic text signal** computed by
`survey-l32g-evidence-sources.ts` over normalised prose. The plan promoted the heuristic into a claim
about declared truth metadata, and `§37.10` inherited it as a `PROTECTED_DECISION`.

> **`ambiguityish` is a discovery aid. It is NOT truth metadata and MUST NOT be used by any scorer,
> builder or gate.** The only ambiguity truth source is the declared `shouldHaveMissingEvidence`
> field on the frozen row.

### D-C.3 Scope of the correction

- It changes **documentation only**, to match a source that was **already hashed and never edited**.
- It modifies **no source artifact**; all three protected hashes are unchanged.
- It **does not relax `G3`**. `G3` remains **clarification recall = 100% on both registered
  denominators**, exactly as pre-registered at `D-84`. Correcting the *size* of a denominator's
  candidate pool is not a change to the *threshold*, and no threshold is touched.
- It is recorded as a **new** decision. `D-79`…`D-85` are not rewritten.

---

## `G3-DEN` — both `G3` denominators, as executable predicates `BINDING`

Resolves **Phase 6**. Written so a scorer can implement them without choosing an interpretation.

### G3-DEN.0 Per-row derived truth

Every holdout row carries a `provenanceClass` ∈ `{INDEPENDENT_GAUNTLET, INDEPENDENT_REALISM,
AUTHORED_CONTROL}` and a `pole` (see `D-D.3`). The clarification truth flag is derived **once**, at
build time, by this table — **no other rule may set it**:

| provenanceClass | `clarificationExpected` |
|---|---|
| `INDEPENDENT_GAUNTLET` | **`false`** — this source declares no ambiguity field and none may be inferred |
| `INDEPENDENT_REALISM` | **`row.shouldHaveMissingEvidence === true`** — strict identity. `false` → `false`; **absent → `false`** |
| `AUTHORED_CONTROL` | **the value frozen for its family** in `D-D.3`. Never inferred from text |

> **Absent is not unknown, and absent is not true.** The 28 realism rows without the field are
> `clarificationExpected: false` by this rule. Treating absence as ambiguity would silently enlarge a
> hard-gated denominator with rows whose truth nobody declared.

### G3-DEN.1 Denominator A — **scenario-level** recall `ADVANCEMENT-RELEVANT`

```
DEN_A  = { r ∈ holdout : r.clarificationExpected === true }
NUM_A  = { r ∈ DEN_A   : provider raised a clarification on r }
recall_A = |NUM_A| / |DEN_A|
```

- **Eligible provenance classes: ALL THREE.** Independent and authored rows both count.
- **A zero-candidate provider output on a row in `DEN_A` is a MISS**, counted in the denominator and
  excluded from the numerator. This is the defining property of the scenario-level metric (`§40.2`,
  `D-58`) and it may not be softened.
- **Malformed record** — a row whose provider output fails schema validation after the permitted
  retry — **remains in `DEN_A` and counts as a MISS.** It is never dropped from the denominator.

### G3-DEN.2 Denominator B — **candidate-conditioned** recall `DIAGNOSTIC, STILL HARD-GATED`

```
DEN_B  = { r ∈ DEN_A : provider emitted at least one candidate on r }
NUM_B  = { r ∈ DEN_B : provider raised a clarification on r }
recall_B = |NUM_B| / |DEN_B|
```

- Same eligible provenance classes.
- **A zero-candidate row is EXCLUDED from `DEN_B`** — that exclusion is the metric's definition
  (`§40.2`), and it is exactly why `DEN_A` exists alongside it.
- **Malformed record**: excluded from `DEN_B` if and only if it emitted no candidate; otherwise it
  remains and counts as a MISS.

### G3-DEN.3 Binding rules on both

- **`G3` passes only if `recall_A === 1.0` AND `recall_B === 1.0`.** Both are hard gates (`P-09R` C,
  `D-84`). Neither substitutes for the other and **they are never merged into one number** (`D-58`).
- **Cardinalities `|DEN_A|` and `|DEN_B|` are computed at scoring time from frozen truth metadata.**
  They were deliberately **not** computed at amendment time.
- **`|DEN_A| = 0` is a construction failure, not a pass.** If the reserved partition plus the authored
  controls yield an empty scenario-level denominator, the builder **MUST THROW** — a vacuous 100% is
  not evidence. `D-D` guarantees a non-empty floor of **6** authored `CLARIFICATION_REQUIRED` rows.
- **No row may be added to, removed from, or reclassified between these denominators after any
  provider output has been observed** (`D-72`, `D-84`).

---

## `D-D` — the authored negative / corrected complement `BINDING`

Resolves **`E-4`**. This specification is **complete before any control is authored and before any
selected positive row is semantically inspected.**

### D-D.1 Exact count — `25`

**The total is exactly `25`. It is not approximate and it is not adjustable.** Combined holdout:

| stratum | provenance class | rows |
|---|---|---|
| `gauntlet.source.v1`, offset `0` | `INDEPENDENT_GAUNTLET` | **38** |
| `field-realism-pack-v2`, offset `3` | `INDEPENDENT_REALISM` | **29** |
| authored complement | `AUTHORED_CONTROL` | **25** |
| **total** | | **92** |

**67 of 92 rows (72.8%) are INDEPENDENT**, inside the plan's `~90–100` band, and the by-provenance
table (`§36.5`) reports the independent number on its own.

### D-D.2 Independence of authoring `PROTECTED`

> **Controls are authored from the family specifications in `D-D.3` ALONE.**

- **The selected positive stride MUST NOT be read, previewed, or semantically inspected before or
  during authoring.** Controls are **not** derived by taking a selected acceptance row and modifying
  it.
- **No control may be added, removed, retitled, re-allocated or re-poled in response to any provider
  output.** Truth labels are fixed by `D-D.3` before the model sees any row.
- Authoring may draw on the **already-open, already-spent** development material of L3-2b…L3-2f for
  *shape*, since that material is retired for gate use and its defects are already public.
- **`G7` membership follows from the family (`D-D.3`), never from observed behaviour.**

### D-D.3 Families, allocation and truth assignment `FROZEN`

`hazardEstablished`, `conditionState` / `acceptableStates`, `clarificationExpected`, `pole`,
`highConsequence` are the frozen truth fields, using the vocabulary already proven in
`holdout-l32f.json`.

| # | family | n | construction rule | `conditionState` / `acceptableStates` | `ACTIVE` prohibited | clarification | `pole` | G3 | G7 | G4 |
|---|---|---|---|---|---|---|---|---|---|---|
| **F1** | **explicit safe / negated condition** | **4** | Observation asserts the hazard-bearing condition is **absent or negated** in plain declarative form ("the guard **is** installed and secured"). No hedging, no partial evidence | `NEGATED` | **YES** | **PROHIBITED** | `CLARIFICATION_MUST_NOT_ASK` | no | **YES** | **YES** |
| **F2** | **corrected / remediated condition** | **4** | Observation states a previously deficient condition was **corrected before the close of the observation** ("the missing cover **was refitted** during the walk") | `CORRECTED` ∈ `{CORRECTED, REMOVED_FROM_SERVICE}` | **YES** | **PROHIBITED** | `CLARIFICATION_MUST_NOT_ASK` | no | **YES** | **YES** |
| **F3** | **insufficient evidence** | **3** | Observation names a hazard-bearing condition but the **decision-critical fact is explicitly not observable** ("the photo angle does not show whether the interlock is fitted") | `INSUFFICIENT_EVIDENCE` | **YES** | **REQUIRED** | `CLARIFICATION_REQUIRED` | **YES** | no | **YES** |
| **F4** | **subjective / non-factual observation** | **3** | Observation records an **evaluative impression with no verifiable predicate** ("the area felt disorganised"). No specific missing fact exists to ask about | `UNKNOWN` ∈ `{UNKNOWN, INSUFFICIENT_EVIDENCE}` | **YES** | neither required nor gated | `DECIDED_NON_ACTIVE` | no | no | **YES** |
| **F5** | **conditional / hypothetical language** | **3** | Observation frames the condition as **contingent or counterfactual** ("**if** the barrier were removed, the drop would be exposed"). Nothing is asserted as realised | `HYPOTHETICAL` | **YES** | neither required nor gated | `DECIDED_NON_ACTIVE` | no | no | **YES** |
| **F6** | **absent decision-critical fact** | **3** | Hazard **is** established, but a fact that **decides the state** is simply **not present in the text** (exposure, energisation, occupancy) — absence by omission, not by explicit statement | `INSUFFICIENT_EVIDENCE` | **YES** | **REQUIRED** | `CLARIFICATION_REQUIRED` | **YES** | no | **YES** |
| **F7** | **sufficient evidence — clarification MUST NOT be asked** | **3** | Hazard **is** established **and** every decision-critical fact **is explicitly present**. A complete, decidable `ACTIVE` finding with no boundary | `ACTIVE` | no — `ACTIVE` is **correct** | **PROHIBITED** | `CLARIFICATION_MUST_NOT_ASK` | no | **YES** | no |
| **F8** | **paired positive / negative state distinction** | **2** | **One matched pair**, minimally different: **F8a** asserts the condition realised; **F8b** negates that same condition using the same lexical head. Tests state separation, not lexical presence | **F8a** `ACTIVE` · **F8b** `NEGATED` | **F8a** no · **F8b** **YES** | **PROHIBITED** on both | **F8a** `REGRESSION_ACTIVE` · **F8b** `NEGATIVE_CONTROL` | no | no | **F8b** only |
| | **TOTAL** | **25** | | | | | | **6** | **11** | **18** |

**Allocation is frozen**: `4 + 4 + 3 + 3 + 3 + 3 + 3 + 2 = 25`. **Per-family counts may not be
re-allocated**, and the total may not drift.

**Derived gate memberships, fixed here and not recomputable later:**

- **`G3` (`CLARIFICATION_REQUIRED`) from authored rows: exactly `6`** — F3 (3) + F6 (3). These join
  whatever `INDEPENDENT_REALISM` rows carry `shouldHaveMissingEvidence === true`, and they guarantee
  `|DEN_A| ≥ 6`, so `G3` can never pass vacuously.
- **`G7` (`CLARIFICATION_MUST_NOT_ASK`) pole: exactly `11`** — F1 (4) + F2 (4) + F7 (3).
- **`G4` (false `ACTIVE`) denominator: exactly `18`** — every authored row whose truth state is
  non-`ACTIVE`: F1, F2, F3, F4, F5, F6 and F8b.

  > **`SUPERSEDED BY AMENDMENT 2` / `D-E` — the governing `G4` cardinality is `21`, and `G4`
  > membership is UNCHANGED.** The line above is preserved verbatim, including its original
  > declared value `18`. That value is an arithmetic slip: the enumerated membership it states —
  > `F1, F2, F3, F4, F5, F6 and F8b` — is exact and sums to `4+4+3+3+3+3+1 = 21`.
  > `NON_NORMATIVE_SUPERSESSION_ANNOTATION` — navigation only. It introduces no rule, changes no
  > frozen membership, no truth state, no scorer gate, no allocation and no selection rule.

**Evidence / authority behaviour.** F3 and F6 must be resolvable **only** by a question, never by
asserting an unobserved fact: a row that asserts `ACTIVE` on either is a `G4` false-`ACTIVE` **and**
a `G3` recall miss. F1, F2 and F8b must not have their negation "recovered" into an active hazard.
No control may induce a `NON_RETRYABLE_VALIDATION_REASONS` code; any such code on an authored row is
a `G6` failure and is reported, never suppressed.

### D-D.4 `G7` / MUST-NOT-ASK governance `PROTECTED`

> ### `G7 MEMBERSHIP IS A PROPERTY OF THE FAMILY SPECIFICATION. IT IS NEVER SELF-AUTHORED AFTER INFERENCE.`

`L3-INV-06`: a clarification is permitted **only at a decision boundary**. A family is intrinsically
`CLARIFICATION_MUST_NOT_ASK` **if and only if its construction rule guarantees no decision boundary
exists** — every fact needed to decide the state is present in the observation.

| family | why it is intrinsically MUST-NOT-ASK |
|---|---|
| **F1** | The condition is **explicitly negated**. The state is decided by the text itself; nothing is outstanding |
| **F2** | The remediation is **explicitly stated as completed**. Precedent: `C-CS-05`, a corrected-state row, is one of the two locked `MUST_NOT_ASK` members (`§49.3`) |
| **F7** | Hazard **and** every decision-critical fact are **explicitly present**. Precedent: `F-CL-04`, the other locked member |

**F4, F5 and F8 are deliberately EXCLUDED from `G7`.** They are `expectClarification: false`, but
`§49.3` is explicit that `expectClarification: false` is **not** the same as MUST-NOT-ASK — on a
non-`MUST_NOT_ASK` pole the flag means *"this scenario does not require a question"*, whereas on the
`MUST_NOT_ASK` pole it means *"a question here is a regression"*. **Only rows whose `pole` is literally
`CLARIFICATION_MUST_NOT_ASK` enter `G7`.** Conflating the two is the `D-58` error, and `D-76`
identified it as live in the existing precision metric; this amendment does not repeat it.

**No `INDEPENDENT_GAUNTLET` or `INDEPENDENT_REALISM` row may ever be assigned the
`CLARIFICATION_MUST_NOT_ASK` pole.** Doing so would require judging, semantically, that a regulator
record contains every decision-critical fact — exactly the discretion this amendment exists to
remove. **`G7`'s pole is therefore composed exclusively of the 11 authored rows named above.**

### D-D.5 Provenance marking `BINDING`

Every holdout row carries, verbatim:

| field | domain |
|---|---|
| `provenanceClass` | `INDEPENDENT_GAUNTLET` · `INDEPENDENT_REALISM` · `AUTHORED_CONTROL` |
| `source` | the source filename **and** its frozen sha256, or `"authored by the L3 acceptance holdout construction phase under INDEPENDENT_EVIDENCE_PLAN Amendment 1 D-D"` |
| `sourceId` | the frozen `scenarioId` / `id`; for authored rows, `AC-<family>-<nn>` (e.g. `AC-F1-01`) |
| `selectionRule` | e.g. `"gauntlet.source.v1 · CMP(scenarioId) asc · i % 4 === 0"` |
| `pole` | as `D-D.3` |
| `family` | `F1`…`F8` for authored rows; `null` otherwise |

**The by-provenance table (`§36.5`) is mandatory**, and every gated metric is reported **both**
overall **and** split by `provenanceClass`, so the independent number is always readable on its own.
**Authored rows supplement and never constitute the independent evidence.**

### D-D.6 Duplicate and overlap rejection `THROW ON VIOLATION`

Comparison key: **`NORM(carrier)`** (`S-1`). The builder **MUST THROW** — never skip, never
de-duplicate silently, never replace — if any authored control's `NORM` text collides with:

1. any observation in **`gauntlet.source.v1`** (all 150 rows, not merely the selected 38);
2. any observation in **`field-realism-pack-v2`** (all 117 rows);
3. any observation in **`gauntlet.seed`** (all 100 rows — the reserved tranche);
4. **any other authored control** in this holdout;
5. any row of **every prior sealed holdout** — `holdout-l32{,b,c,d,e,f}.json`;
6. any row of **every development set** — including the `l32d` and `l32f` devsets;
7. any row of the **exhausted field corpus** `safescope-field-validation-dataset.v1.json`;
8. any observation from a **previously spent acceptance offset** of either source, once such offsets
   exist.

The builder MUST **additionally** throw if any two rows **within the assembled 92-row holdout** share
`NORM(carrier)`, or if any two share a `sourceId`.

> **`gauntlet.seed` is checked but NOT drawn from.** It is the reserve tranche (`§37.10`), and it
> carries **one internal duplicate text pair** — 100 physical rows, **99 distinct texts**. A future
> amendment that opens it must state its duplicate policy explicitly; this one does not open it.

---

## Evidence inventory — physical rows vs distinct texts `BINDING`

**These two numbers are different and must never be conflated.**

| source | **physical rows** | **distinct `NORM` texts** |
|---|---|---|
| `gauntlet.source.v1` | **150** | **150** |
| `gauntlet.seed` | **100** | **99** — one internal duplicate pair |
| `field-realism-pack-v2` | **117** | **117** |
| **total** | **367** | **366** |

**The `366` of record is the DISTINCT-TEXT count, not the physical row count.** All prior statements
of *"366 independent rows"* are correct as a distinct-text inventory and **must not be restated as a
physical row count**. Reservation arithmetic uses **physical rows** (150 and 117); evidence-budget
statements use whichever is named, explicitly.

---

## What this amendment does NOT do

It does **not** construct the holdout · does **not** write `HOLDOUT_FREEZE.txt` · does **not** select
or materialise any row identity · does **not** author any control · does **not** create a builder or
a scorer · does **not** open, preview or semantically inspect any sealed observation · does **not**
change `G1`…`G10`, the prompt, the schema, the validator, the binder or the sanctioned input builder ·
does **not** select a production provider · does **not** begin `L3-3` · does **not** change customer
authority.

> **The next phase must be separately authorized to construct and freeze the holdout under this
> amended plan.**

---
---

# AMENDMENT 2 — `D-E` G4 DENOMINATOR RECONCILIATION (2026-08-24) `BINDING`

`L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED_V2 — HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`

**Amendment 1 is not rewritten and not erased.** This amendment is append-only and changes **exactly
one number**. Deterministic construction Attempt 1 discovered that Amendment 1 states the `G4`
denominator two incompatible ways (`D-87`, §54); that attempt is **invalidated**, no holdout was
created, and **no reserved acceptance row was selected or materialised**.

---

## `D-E` — the `G4` denominator is `21`

### D-E.1 The frozen membership is UNCHANGED

`G4`'s denominator remains *"every authored row whose truth state is non-`ACTIVE`"* — the same
enumerated membership Amendment 1 already froze:

| family | truth state | rows |
|---|---|---|
| **F1** | `NEGATED` | **4** |
| **F2** | `CORRECTED` | **4** |
| **F3** | `INSUFFICIENT_EVIDENCE` | **3** |
| **F4** | `UNKNOWN` | **3** |
| **F5** | `HYPOTHETICAL` | **3** |
| **F6** | `INSUFFICIENT_EVIDENCE` | **3** |
| **F8b** | `NEGATED` | **1** |
| **G4 DENOMINATOR** | | **21** |

```
4 + 4 + 3 + 3 + 3 + 3 + 1  =  21
```

**Closure, verified:** the four `ACTIVE`-truth authored rows — F7 (3) and F8a (1) — are the exact
complement, and `21 + 4 = 25`, the frozen authored total. The partition is **exhaustive and disjoint**.

### D-E.2 What this amendment changes

> ### `G4 DECLARED CARDINALITY: 18 → 21. NOTHING ELSE.`

**It does NOT:** add or remove a `G4` family · change **F6**'s membership · change any authored
control · change any authored truth state · change the definition of false `ACTIVE` · change
`G1`…`G10` · change any source-selection rule · change any positive stride · change any realism rule
· change any contamination rule · change any provider gate · change any scorer gate other than the
corrected expected `G4` cardinality.

### D-E.3 What is explicitly preserved

> **An `ACTIVE` result on **F3** or **F6** is a `G4` false-`ACTIVE` failure under the frozen
> truth-state semantics.** Amendment 1's evidence/authority clause stands verbatim: *"a row that
> asserts `ACTIVE` on either is a `G4` false-`ACTIVE` **and** a `G3` recall miss."*

`G4` itself remains a **hard zero gate** (`D-84`): false `ACTIVE` = **ZERO**. Correcting the size of a
denominator is not a change to a threshold, and no threshold is touched.

### D-E.4 The nature of the defect being corrected

**`18` was an arithmetic contradiction, not a competing substantive `G4` membership rule.** When
Amendment 1's derived memberships were written, the total was computed as
`F1 4 + F2 4 + F3 3 + F4 3 + F5 3 + F8b 1 = 18`, **silently omitting F6's 3**, while the same sentence
enumerated F6 explicitly and two further clauses (the `D-D.3` family table's F6 row, and the
evidence/authority clause) independently placed F6 inside `G4`.

**Three of the four clauses already agreed; only the arithmetic disagreed.** Adopting `21` is
therefore a correction *to* Amendment 1's own stated membership, not a departure from it. Adopting
`18` would have required removing F6 from `G4` — contradicting two clauses and meaning that asserting
`ACTIVE` where the deciding fact is absent is not a false `ACTIVE`, which is precisely what `G4`
exists to catch.

---

## `D-F` — THE DERIVED-CARDINALITY CONSISTENCY INVARIANT `AMENDMENT-LEVEL, BINDING`

> ### `FOR EVERY FROZEN ACCEPTANCE SET WHOSE MEMBERSHIP IS SPECIFIED BY AN ENUMERATION OR A DETERMINISTIC PREDICATE AND WHOSE EXPECTED CARDINALITY IS DECLARED, THE MEMBERSHIP AND ITS CARDINALITY MUST BE INDEPENDENTLY DERIVED AND REQUIRED TO MATCH EXACTLY — BEFORE CONSTRUCTION IS AUTHORIZED.`

**This invariant is general. It is not limited to `G4`.**

### D-F.1 Scope — every declared gate-bearing count

At minimum, and re-derived on every future amendment or construction attempt: the authored-control
total · each **F1–F8** family allocation · both **`G3`** denominators · the **`G4`** denominator ·
the **`G7`** pole · the positive-source (`D-A`) allocation · the realism-source (`D-B`) allocation ·
the total expected holdout cardinality · the independent/authored split · the physical-row and
distinct-text inventories · and any other declared gate-bearing count.

### D-F.2 The rule

For each quantity, record **`DECLARED`**, **`DERIVED`**, **`MATCH`/`MISMATCH`**, and **the frozen
membership source used to derive it**.

- **A declared number must NEVER be accepted merely because it appeared in a previous amendment.**
- Gate memberships must be derived from **truth semantics** (e.g. `G4` = truth state ≠ `ACTIVE`) and
  **cross-checked** against any declared per-family flag. **A disagreement between the two is itself
  a contradiction**, not a preference.
- Where a set and its complement are both declared, the **closure check** must hold: the two must be
  disjoint and exhaust the total.
- Derivation must use the **frozen membership rule**, never a hard-coded total.

### D-F.3 On failure

**STOP.** Terminal: `INTERNAL_CONTRADICTION`. **Do not repair a second contradiction
opportunistically**, and do not adjust members, allocations or authored controls to make a declared
number fit. A contradiction is a new amendment, decided by the user (`D-72`).

### D-F.4 Why this invariant exists

Amendment 1's formal executability review returned **50 checks, 50 YES** and still shipped this
defect. That review verified each derived membership was **predeclared**; it never cross-checked a
derived **cardinality** against the **enumerated set that produces it**. The review was correct about
determinism — the `D-A`/`D-B` rules were re-proved by Attempt 1 — but **incomplete about internal
consistency**. `D-F` closes exactly that gap, and it is the reason this amendment's review re-runs
every criterion rather than inheriting a prior verdict.

---

## Construction Attempt 1 — status under this amendment

**Invalidated, and retained as immutable failed-attempt evidence.**

| artifact | status |
|---|---|
| `HOLDOUT_FREEZE.txt` `f0e33f14…` | **historical evidence only.** **MUST NEVER be reused as the freeze identity for Attempt 2**, and must never be rewritten |
| `builder/authored-controls.js` `4237fc3b…` | structural artifact only — **not admitted to any holdout** |
| the holdout | **DOES NOT EXIST.** No row was selected; no identifier was materialised |

**Attempt 2 requires a NEW construction authorization and a NEW freeze record**, written under
base plan + Amendment 1 + Amendment 2, **before any selection code runs**, with the `D-F` checks
performed **before any source row is selected**.

**`HOLDOUT_SPENT` remains `false`. All reserved offsets remain available** — gauntlet `0`,`1`,`2`,`3`;
realism `0`,`1`,`2`,`3`; the entire `gauntlet.seed` reserve. **Nothing is retired.**

---

## What Amendment 2 does NOT do

It does **not** construct the holdout · does **not** create a freeze record · does **not** select or
materialise any row · does **not** inspect reserved semantic evidence · does **not** change
Amendment 1's selection rules, offsets, composition, `D-C` correction, `G3` predicates, `G7`
membership or contamination rules · does **not** change `G1`…`G10` · does **not** access an Anthropic
credential · does **not** probe a provider · does **not** perform inference · does **not** spend the
holdout · does **not** begin `L3-3` · does **not** change customer authority.

> **The next phase must be separately authorized to construct and freeze the holdout as Attempt 2,
> under base plan + Amendment 1 + Amendment 2.**

---
---

# AMENDMENT 3 — `D-G` … `D-K` (2026-08-25) `BINDING`

`L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED_V3 — RUN2_HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`

This amendment resolves the defects exposed by **Acceptance Run 1** (`D-94`, §61), in which the
single-use Attempt-2 corpus was **permanently spent** while the provider rejected **144 of 184**
calls, and the frozen scorer nonetheless reported `scorable: true` and emitted a substantive
`L3_ACCEPTANCE_FAILED` terminal over a corpus that was never evaluated.

**It is a specification. No holdout was constructed, no row was selected, no observation text was
inspected, no control was authored, and no provider was contacted under it.**

**Amendments 1 and 2 are preserved verbatim and are not rewritten or erased.** `D-A`…`D-F` are
unchanged. **`G1`…`G10` remain exactly as pre-registered at `D-84`** — this amendment adds a
*validity precondition* to scoring and changes no gate, no threshold, no denominator and no truth
label.

> **Run 1 is immutable historical evidence.** `HOLDOUT_SPENT = TRUE`, gauntlet offset `0` and
> realism offset `3` **RETIRED**, permanently. Nothing here rewrites Run 1 as unspent, reuses its
> rows, replaces its raw results, or removes its literal frozen-scorer output.

---

## `D-G` — COMPLETE PROVIDER EVALUATION IS A PRECONDITION OF SUBSTANTIVE SCORING `BINDING`

### D-G.1 The defect this closes `ROOT_CAUSE_ESTABLISHED_BEFORE_REMEDIATION`

The frozen scorer's invalidity vocabulary — `MALFORMED_RESULT_RECORD`, `MISSING_RESULTS`,
`EXTRA_RESULTS`, `DUPLICATE_RESULTS`, `DEN_A_EMPTY` — asks only **result-set-shape** questions. It
has **no predicate for whether a provider answered**.

**The underlying cause is representational, not arithmetic.** Every field of the frozen
result-record contract encodes "not evaluated" **in band**, using a value a genuinely evaluated row
could also produce: `schemaValid:false`, `retries:0`, `candidates:[]`, `raisedClarification:false`,
`assertedState:null`, `nonRetryableValidationReasons:[]`, `safetyConsequentialRejection:false`,
`decisionBoundaryCodes:[]`. **The scorer cannot distinguish "the model answered and asserted
nothing" from "the model was never asked."**

Measured consequence on Run 1, and it runs in **both** directions:

| gate | effect of a non-evaluated row | Run-1 evidence |
|---|---|---|
| `G1` | counted as a substantive high-consequence **MISS** | all 38 happened to be evaluated — an accident of *where* the provider failed |
| `G2` | silently **leaves the denominator** | denominator collapsed to 2 raised rows |
| `G3` | counted as a substantive recall **MISS** (`DEN_A` is frozen truth and does not shrink) | 27 of 29 `DEN_A` rows unevaluated → recall `1/29` |
| `G4` | cannot trip the violation → **vacuous PASS** | **0 of 21 evaluated**, reported `0` violations, PASSED |
| `G5` `G6` `G8` | cannot trip the violation → **vacuous PASS** | vacuous on 52 rows |
| `G7` | cannot trip the violation → **vacuous PASS** | **0 of 11 evaluated**, reported `0` violations, PASSED |
| `G9` | two unevaluated rows **compare equal** → vacuous agreement; one-sided evaluation → fabricated divergence | 52 rows "reproducible" about nothing; 40 "divergent" about nothing |
| `G10` | counted as non-conforming | `40/92` |

> **A gate result is meaningful only over rows the provider actually evaluated.** On an incomplete
> run the hard-zero gates drift toward a **fabricated PASS**, the recall and conformance gates
> toward a **fabricated FAILURE**, and `G9` toward **both at once**.

### D-G.2 The validity gate `BINDING`

A sealed acceptance run is eligible for **substantive `G1`…`G10` model interpretation only if**:

```
EXPECTED_ROWS            = N
PROVIDER_EVALUATED_ROWS  = N
PROVIDER_EVALUATED_ROW_IDS = EXPECTED_ROW_IDS      (set equality, not cardinality alone)
```

for **every** required acceptance process, including the second isolated process `G9` requires.

If it does not hold: **`SCORABLE = FALSE`**, and the terminal is
**`L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION`** — **never** a substantive model
`PASS` and **never** a substantive model `FAIL`. `MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED`.

The scorer **may still emit its arithmetic** for diagnosis, but on an invalid run that arithmetic is
**explicitly `NON-AUTHORITATIVE` for model acceptance** and no value in it is a model result.

### D-G.3 `PROVIDER_EVALUATED`, defined mechanically `PROTECTED`

> **`PROVIDER_EVALUATED(row) = TRUE` if and only if the provider returned HTTP 200 through the
> frozen shim AND the response reached the frozen response/schema boundary.**

Against the frozen transport taxonomy of `hazlenz-reasoning-provider.ts`:

| provider result | `PROVIDER_EVALUATED` | why |
|---|---|---|
| `{ok:true, proposal}` | **TRUE** | the model produced output and it bound |
| `MALFORMED_STRUCTURED_OUTPUT` | **TRUE** | **the model produced output**; it failed at the boundary. `G10` exists to measure exactly this, and excluding it would let a provider escape `G10` by emitting garbage |
| `PROVIDER_REFUSAL` | **TRUE** | a refusal is model behaviour |
| `TIMEOUT` | **FALSE** | no response |
| `UNAVAILABLE` | **FALSE** | transport exception |
| `TRANSIENT_ERROR` | **FALSE** | 429 / 5xx — rejected before output |
| `PERMANENT_CONFIGURATION_ERROR` | **FALSE** | 4xx — billing, authentication, workspace, model access — rejected before output |

**It is NEVER inferred from:** a request having been transmitted · a row having been attempted · an
error placeholder existing · a scorer-input record existing.

**FAIL-CLOSED.** A result record that does not **declare** `providerEvaluated` is treated as **not
evaluated** and additionally raises `PROVIDER_EVALUATION_NOT_DECLARED`. **Silence can never buy a
pass.**

### D-G.4 Monotonicity `PROTECTED`

```
pass_v2 = pass_frozen AND completeProviderEvaluation
```

`completeProviderEvaluation` is `true` for every complete run, so **`pass_v2 ≡ pass_frozen` on every
complete run**. Where it is false, `pass_v2` is false.

> **This amendment may prevent an incomplete run from being read as a substantive `PASS` or `FAIL`.
> It can NEVER turn a substantive model failure into a `PASS`, weaken a `G1`…`G10` threshold, remove
> a hard-zero requirement, alter a truth label, alter a denominator for a complete valid run, or
> improve a complete model result.** The frozen scorer `ea5e50ae…` is **required and called**, not
> reimplemented and not modified; a drifted digest **THROWS**.

---

## `D-H` — CORPUS SPEND AND SCORABILITY ARE INDEPENDENT STATE DIMENSIONS `BINDING`

`HOLDOUT_SPENT` and `SCORABLE` are **orthogonal**. Neither implies the other.

**The first transmission of any sealed holdout observation permanently sets `HOLDOUT_SPENT = TRUE`
and retires the selected independent tranche**, and that remains true even if: provider evaluation
is incomplete · `SCORABLE = FALSE` · the run is `INVALID` · billing fails · the network fails · a
process crashes · model identity fails after spend · the scorer cannot run at all.

> ### `INVALID MUST NEVER IMPLY UNSPENT.`

Spend is caused by **transmission**, and is recorded **before** the first observation leaves the
runner. It is never caused, reverted or conditioned by a scoring outcome. **No scorer, at any
version, may carry a field capable of reverting it** — the scorer is a pure function of
`(holdout, results)` and has no such authority.

---

## `D-I` — RUN-2 AUTHORED CONTROLS MUST BE FRESH `BINDING`

Run 2 **MUST NOT reuse any of the 25 authored controls of the spent Run-1 holdout.** A fresh set of
**exactly 25** is authored **only during the separately authorized Run-2 construction phase** — not
in this amendment, and not before that authorization.

**The frozen family allocation is unchanged** and is re-derived, not restated:

| F1 | F2 | F3 | F4 | F5 | F6 | F7 | F8 | total |
|---|---|---|---|---|---|---|---|---|
| 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | **25** |

**Family semantics, truth-state semantics and gate-membership derivation are unchanged** (`D-D.3`,
`D-D.4`, `D-E`): `G3` authored members **6** (F3, F6) · `G7` pole **11** (F1, F2, F7) · `G4`
denominator **21** (F1, F2, F3, F4, F5, F6, F8b). **No `G3`/`G4`/`G7` membership rule changes.**

Every fresh control **MUST** pass the existing `D-D.6` overlap protections in full, against **the
spent Run-1 holdout**, all prior sealed holdouts, all development sets and every other already
protected surface, with **THROW** on any collision.

> **The overlap rule is NOT weakened because Run-1's authored controls went unanswered.**
> **Membership in a spent sealed corpus is by itself sufficient to prohibit reuse.** A tranche is
> retired *whatever the result* (§29.8); relaxing a protected rule because a failure made reuse
> convenient is exactly what `D-72` forbids.

---

## `D-J` — RUN-2 INDEPENDENT OFFSET SCHEDULE `DERIVED, NOT CHOSEN`

**No row is selected by this amendment.** The schedule below was **re-derived from the frozen rules**
(`S-2` comparator, `S-3` offset derivation, `D-A.11` and `D-B.11` cyclic reservation) by reading
**sort keys and counts only** — **no observation text was read** — and every value was compared
against the value declared in the authorizing statement.

| | source | derived offset | derived rows |
|---|---|---|---|
| run 1 *(spent, retired)* | `gauntlet.source.v1` | `0` | 38 |
| run 1 *(spent, retired)* | `field-realism-pack-v2` | `3` | 29 |
| **RUN 2** | `gauntlet.source.v1` | **`1`** | **38** |
| **RUN 2** | `field-realism-pack-v2` | **`0`** | **30** |
| **RUN 2** | authored complement (`D-I`) | — | **25** |
| **RUN 2 total** | | | **93** |

**68 of 93 = 73.1% INDEPENDENT**, and 93 is inside the plan's `~90–100` band. Still reserved after
run 2: gauntlet offsets `2`, `3`; realism offsets `1`, `2`; and the entire unopened 100-row
`gauntlet.seed` tranche.

**Declared-vs-derived: 33 quantities, 33 MATCH, 0 MISMATCH.** Had the frozen schedule derived
anything different, this amendment would **STOP and report the contradiction** rather than adopt the
authorization's numbers.

> **`|DEN_A|` FOR RUN 2 IS UNKNOWN AND MUST REMAIN SO.** `D-B.3` requires the ambiguity population
> be discovered from frozen metadata **after** authorized selection. Estimating it now would let the
> amendment see its own `G3` denominator before selection — **precisely defect `E-3`**. No
> `shouldHaveMissingEvidence` value was read by this amendment.
> **`RUN2_DEN_A = UNKNOWN_UNTIL_AFTER_AUTHORIZED_SELECTION`.**

---

## `D-K` — SYSTEMIC PERMANENT-PROVIDER-FAILURE ABORT `BINDING`

### D-K.1 The classification, taken from the frozen transport layer

| class | frozen membership | frozen handling |
|---|---|---|
| `TRANSIENT_TRANSPORT_FAILURE` | `TIMEOUT`, `TRANSIENT_ERROR` (429 / ≥500), `MALFORMED_STRUCTURED_OUTPUT` — i.e. `RETRYABLE_PROVIDER_FAILURES` | the **existing frozen retry ceiling of one** applies, unchanged |
| `PERMANENT_PROVIDER_REJECTION` | `PERMANENT_CONFIGURATION_ERROR` — the frozen non-retryable provider class, reached on 404 and on any other non-429/non-5xx 4xx: billing/credit exhaustion, authentication rejection, account or workspace restriction, model-access rejection | **no retry**, as already frozen |

**Not every 4xx is assumed systemic by fiat** — the class is exactly the one the frozen provider
already computes. **No new retry is added and no existing retry is removed.**

### D-K.2 The abort predicate `MECHANICAL, CONTENT-BLIND`

> **After spend, the run ABORTS at the first required row that ends `PROVIDER_EVALUATED = FALSE`
> once the frozen retry policy for that row is exhausted.**

**Why this is the narrowest correct rule, and why it needs no threshold, streak length or tuning
constant:** by `D-G.2`, a single unevaluated required row already forces `SCORABLE = FALSE`. From
that moment **every further request is provably incapable of changing the terminal.** The rule is
therefore derived, not chosen — it fires exactly when continuing became pointless.

The predicate reads **only** the frozen transport/provider failure classification. It **never**
inspects whether an answer is good or bad, nor observation semantics, hazard family, expected truth,
gate membership, or any prior model performance.

### D-K.3 Behaviour on fire `PROTECTED`

Stop issuing further provider requests · **preserve all completed and raw evidence** · record the
abort row, its failure kind and the classification · and then:

```
HOLDOUT_SPENT = TRUE            (unchanged — D-H)
selected offsets                RETIRED, permanently
SCORABLE                        FALSE
terminal                        L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION
MODEL_ACCEPTANCE_RESULT         NOT_ESTABLISHED
automatic rerun                 NONE
```

> **The abort rule exists to reduce waste, and it does nothing else.** It does **not** restore the
> spent corpus, does **not** preserve a reservation, does **not** make a run scorable, and does
> **not** authorize a rerun. Applied to Run 1 it would have stopped at row 41 instead of issuing
> **143 further doomed calls** — and the corpus would have been spent all the same.

---

## What Amendment 3 does NOT do

It does not construct the Run-2 holdout · select or open any Run-2 source row · spend any further
independent evidence · contact or probe a provider · perform inference · change any substantive
`G1`–`G10` model-performance requirement · weaken any threshold · reinterpret Run 1 as a model
failure or a model pass · reuse the spent Run-1 holdout, gauntlet offset `0` or realism offset `3` ·
select a production provider · begin `L3-3` · change customer authority.

> **Run-2 holdout construction remains UNAUTHORIZED and requires a separate authorization.**
