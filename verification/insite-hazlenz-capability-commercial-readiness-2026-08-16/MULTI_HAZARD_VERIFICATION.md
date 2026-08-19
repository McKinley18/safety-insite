# Phase 3 — Multi-Hazard Stress Verification (live)

Two live `POST /safescope-v2/classify` calls, each describing a fixed, known number of independent hazards in one observation, so the decomposition output can be checked against ground truth exactly.

## Case A — 3 independent hazards

Observation: "...the guard on the conveyor drive pulley had been removed, exposing the moving chain and sprocket; a solvent container near the walkway was actively leaking onto the floor; and a worker was standing directly under a suspended crane load without wearing a hard hat."

Ground truth: 3 hazards (machine guarding, chemical release, PPE/struck-by).

`multiHazardDecomposition.isMultiHazard: true`, `hazardCount: 7`.

Actual fragments returned:
1. "...the guard on the conveyor drive pulley had been removed" — correct, hazard 1
2. "a solvent container near the walkway was actively leaking onto the floor" — correct, hazard 2
3. "a worker was standing directly under a suspended crane load without wearing a hard hat" — correct, hazard 3
4-7. **The entire original sentence, byte-for-byte, repeated as four additional standalone fragments** (fragments 4 and 5 are exact duplicates of each other; 6 and 7 are exact duplicates of each other and differ from 4/5 only by a trailing period).

**Result: FAIL on fragment quality.** Decomposition correctly identified and separated all 3 real hazards (no false negative), but reported `hazardCount: 7` — more than double the real count — because of 4 duplicate full-text fragments. If these render as separate finding cards in the UI (see browser verification in `DARK_MODE_COMPLETE_AUDIT.md` / `LIGHT_MODE_COMPLETE_AUDIT.md`), an inspector would see 4 phantom duplicate findings alongside the 3 real ones.

`additionalHazards` tags returned: `machine_guarding, walking_working_surfaces, suspended_loads, personal_protective_equipment, chemical_transfer, chemical_release, hazcom` — 7 tags for 3 described hazards, consistent with over-decomposition, though several of these (walking_working_surfaces, hazcom, chemical_transfer) are plausible secondary/derived tags rather than pure noise (e.g. a chemical spill legitimately touches both `chemical_release` and `hazcom`).

## Case B — 4 independent hazards

Observation: "...the pulley guard on the conveyor drive was missing, exposing moving parts; a chemical container was actively leaking onto the floor near the aisle; a worker under a suspended load was not wearing a hard hat; and temporary wiring ran through a doorway with the outer insulation stripped away, exposing bare conductors."

Ground truth: 4 hazards (machine guarding, chemical release, PPE/struck-by, electrical).

`multiHazardDecomposition.isMultiHazard: true`, `hazardCount: 5`.

Actual fragments returned:
1. "...the pulley guard on the conveyor drive was missing" — correct, hazard 1
2. "a chemical container was actively leaking onto the floor near the aisle" — correct, hazard 2
3. "a worker under a suspended load was not wearing a hard hat" — correct, hazard 3
4-5. The full original sentence duplicated twice more (same pattern as Case A).

**The 4th hazard — exposed bare electrical conductors — was never extracted as its own fragment at all.** It only appears buried inside the duplicated full-text blobs, not as an independently identified, evidence-linked finding. `additionalHazards` for this case (`machine_guarding, hazcom, suspended_loads, chemical_transfer, chemical_release`) contains **no `electrical` tag whatsoever**, confirming the drop is not just a fragment-labeling quirk — the electrical hazard is genuinely absent from the decomposition's hazard-family output.

Separately, the top-line `classification`/`explanation` for this case read `"HazLenz AI matched weighted Walking/Working Surfaces signals"` while `guidedFinding.hazardCategory` in the same response says `"Lockout / Stored Energy"` — two different primary-hazard labels disagreeing with each other inside a single response, neither of which is one of the 4 hazards actually described.

**Result: FAIL.** One of four real, independent, clearly-worded hazards was silently dropped rather than decomposed into its own finding, on top of the same duplicate-fragment defect as Case A.

## Sibling-contamination check

Within the 3 real fragments in both cases, evidence text stayed correctly scoped to its own fragment (no cross-fragment text bleed observed) — this specific failure mode (findings borrowing each other's evidence) was **not** observed. The defects found are fragment duplication (phantom findings) and fragment loss (a real hazard silently missing), not sibling identity contamination.

## Verdict

"Decomposes multiple hazards from one observation into independent findings" is **PARTIALLY_PROVEN**: real, distinct hazards up to 3-per-observation were correctly separated with no evidence bleed between them, which is the core mechanism working. But hazard count reliability is not proven — both stress cases produced an inflated `hazardCount` from duplicate full-text fragments, and the 4-hazard case additionally dropped one real hazard entirely. Marketing language should not claim exhaustive or exact multi-hazard counts ("identifies every hazard," "always finds N hazards") without this being fixed; "identifies multiple hazards from one observation" (without a completeness/count guarantee) remains accurate for the 2-3 hazard range tested.
