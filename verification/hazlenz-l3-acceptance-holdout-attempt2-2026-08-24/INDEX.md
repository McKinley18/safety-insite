# L3 acceptance holdout construction, attempt 2 — evidence index

`L3_ACCEPTANCE_HOLDOUT_FROZEN — PROVIDER_GATE_REQUIRED_BEFORE_ACCEPTANCE_AUTHORIZATION`
blueprint **§56** · decision **`D-89`** · HEAD `a7b21a26` ·
**zero inference · zero provider probes · zero credential access · zero egress · $0.00 · holdout built, NOT spent**

| file | what it is |
|---|---|
| `STATUS.md` | the full result: the one plan annotation, the pre-selection `D-F` gate, the 92-row holdout, triple-derived gate memberships, 100 structural checks, byte-identical rebuild, 38 synthetic scorer cases, and the two builder defects found and corrected before freezing |
| `NEXT_ACTION.md` | the exact next prerequisite — a provider-readiness gate that sends zero holdout rows |
| `HOLDOUT_FREEZE.txt` | Attempt 2's construction freeze `a0d97b3f…`, written **before** the builder existed and never rewritten |
| `ACCEPTANCE_ARTIFACT_FREEZE.txt` | the complete frozen acceptance package: plan, freeze, holdout, rebuild, proofs, scorer, configuration, single-use state |
| `ACCEPTANCE_ARTIFACT_MANIFEST.txt` | the 16-artifact manifest and the acceptance-artifact identity `189a3cbf…` |
| `builder/authored-controls.js` | Attempt 2's own 25 controls, authored from the frozen F1–F8 table **alone with the positive stride unopened** |
| `builder/build-holdout.js` | the deterministic builder — S-5 drift guard, S-2 distinctness, D-A/D-B selection, table-lookup truth, throw-enforced overlap |
| `holdout/holdout-l3-acceptance-attempt2.json` | **the frozen holdout** `69665e41…`, 92 rows, 105561 bytes |
| `rebuild/holdout-l3-acceptance-attempt2.json` | the independent rebuild — **byte-for-byte identical** |
| `validation/validate-holdout.js` · `STRUCTURAL_VALIDATION.txt` | 100 structural checks, 100 PASS — **structural only, no semantic inspection** |
| `validation/REBUILD_PROOF.txt` | `FIRST_MATERIALIZATION == REBUILD`, 0 differing bytes |
| `validation/OVERLAP_SURFACES.txt` | the 49 contamination surfaces actually evaluated, 0 collisions |
| `scorer/acceptance-scorer.js` | the deterministic scorer — `G1`–`G10` and §53.4 exactly, `G4` denominator **21**, no new policy |
| `scorer/synthetic-scorer-tests.js` · `SYNTHETIC_SCORER_VALIDATION.txt` | 38 synthetic cases, 38 PASS — **no provider, no inference, no holdout semantics consumed** |
| `analysis/PHASE4_DF_PRESELECTION_GATE.txt` | the `D-F` gate, **39/39 MATCH**, run before any selection code |
| `analysis/phase7-authored-controls.js` · `PHASE7_AUTHORED_CONTROLS.txt` | 26/26 from Attempt 2's own controls: 25 · `G3` 6 · `G4` 21 · `G7` 11 · closure 25 |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, tags, stashes, sources before/after, Attempt-1 immutability, the network-primitive audit and the unspent proof |

**Attempt 1 (`hazlenz-l3-acceptance-holdout-frozen-2026-08-24/`) is untouched.** Its freeze
`f0e33f14…` remains invalidated historical evidence, was never reused as this attempt's identity,
and its authored controls were admitted to no holdout — Attempt 2 authored its own.

**No acceptance measurement exists. No provider was called. `claude-sonnet-5`'s qualification
(`D-70`, `D-77`) is unchanged and untested here. This is not a model result.**
