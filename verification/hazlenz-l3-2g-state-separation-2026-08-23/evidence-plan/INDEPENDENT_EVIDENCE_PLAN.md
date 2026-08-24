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

Its value is a field the other source does not have: **`shouldHaveMissingEvidence`, declared on 92
rows**, plus `photosAvailable` and `employeeExposureKnown`. That is a *pre-existing, independently
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
2. **Deterministic selection, declared before execution.** Sort by `scenarioId`; take a fixed stride
   over the gauntlet source and a fixed stride over the realism pack. Record the rule in the freeze
   record. **Reserve the unused strides** — the field corpus was exhausted precisely because that
   was not planned. Budget explicitly: `gauntlet.source.v1` 150 + `gauntlet.seed` 99 (measured
   disjoint) + `field-realism-pack-v2` 117 = **366 independent rows**, enough for roughly four
   future acceptance runs at L3-2f's scale if each takes a stride rather than the whole file.
3. **Intended holdout size ~90–100**, matching L3-2f's 97: roughly 45 independent gauntlet rows,
   ~20 independent realism-pack ambiguity rows, ~25 authored negative/corrected complement, plus a
   separately-reported targeted complement only where a family is otherwise unreachable.
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
