# CLOSURE — Negation / Multi-Hazard Confidence Recheck

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` at start of this
phase (three narrow production fixes made during this phase, detailed below; `git diff --check`
clean throughout, no commits made).

## Fresh fixture set (new text, not reused from prior sessions) — first pass, before this phase's fixes

| Case | Result (before) |
|---|---|
| Negated electrical | PASS — 1 hazard, `electrical`, confidence 0.2 (low). No positive high-confidence finding. |
| Effective guarding | PASS — no hazard flagged at all (stronger than "low confidence" — correctly silent). |
| Failed guard | PASS — 1 hazard, `machine_guarding`, confidence 0.2 (low but present — "still recognized"). |
| 3-hazard | **FAIL — 1/3 recovered** (only `machine_guarding`; electrical and hydraulic dropped). |
| 4-hazard | **FAIL — 2/4 recovered** (`machine_guarding`, `fall_protection`; electrical and hydraulic dropped). |
| 5-hazard | Partial — 4/5 recovered. |
| Mixed negation + active | **FAIL — 0 hazards returned** (the active electrical sibling was also suppressed, not just the negated guard condition). |

## Root cause: three narrow regex-completeness gaps in the multi-hazard-decomposition electrical/hydraulic detectors, not a regression in the negation logic itself

Investigated via the raw `/safescope-v2/classify` response (`multiHazardDecomposition.hazards`,
`excludedHazards`). None of these are negation-classifier defects — the negation/effective-control
work from the main remediation phase is untouched and behaves correctly (confirmed by the
negated-electrical/effective-guarding/failed-guard rows above, all correct both before and after).
The dropped hazards were a **separate, pre-existing gap** in
`backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`'s
`electricalExposureFragment` and `addHydraulicEnergyFinding` detectors, each requiring narrow
regex matches that ordinary inspection phrasing didn't hit:

1. **Plural mismatch**: `\bbare conductor\b`, `\bexposed conductor\b`, `\bconductor\b` etc. used
   trailing `\b` boundaries with no `s?`, so the extremely common plural phrasing "bare
   conductors" / "exposed wires" never matched (`\bconductor\b` fails against "conductors" because
   there is no word boundary between "r" and the following "s"). This is exactly the phrasing the
   prior remediation phase's own fix targeted ("stripped insulation," "bare conductor") but the
   fix was written singular-only.
2. **Tense mismatch**: `pressure\s+remains?` and `energy\s+remains?` matched present tense
   ("remains"/"remain") but not the equally common past tense "remained" — ordinary
   inspection-report phrasing ("hydraulic pressure remained in the ram"). Notably, the adjacent
   `retain(?:s|ed)?\s+pressure` pattern two words earlier in the *same* regex already handled this
   correctly, showing the omission was an inconsistency, not an intentional restriction.
3. **Missing common term**: "junction box" — an everyday way to describe an exposed electrical
   enclosure — was absent from the electrical-source word list (`panel|disconnect|conductor|...`),
   so a clause like "a nearby open junction box had exposed live parts" failed the source-word
   condition even with an explicit "live" energized-state word present.

The "mixed negation + active" failure was a **downstream consequence** of gap 1/3: the active
electrical sibling clause ("a nearby open junction box had exposed live parts with stripped
insulation") failed to register as an electrical finding for the same plural/junction-box reasons,
so with the guard condition correctly negated-away, nothing was left to report at all — not a
negation-suppression-goes-too-far defect.

## Fixes applied (three narrow regex edits, same file, same detectors already touched by the
prior remediation phase's own dropped-hazard fix — not a new subsystem)

- `\bconductor\b` → `\bconductors?\b`, `\bwire\b` → `\bwires?\b` (source-word list); `bare
  conductor`/`bare wire`/`exposed conductor`/`exposed wire` → same with `s?` (implicit-energized
  phrase list).
- `pressure\s+remains?` → `pressure\s+remain(?:s|ed)?`, `energy\s+remains?` → `energy\s+remain(?:s|ed)?`
  in the two hydraulic/pneumatic detector regexes (fragment-level and whole-observation-level).
- Added `junction\s+box` to the electrical-source word list.

No clause-splitting logic, negation logic, or unrelated detector was touched. Backend `tsc` build:
clean after each edit. `git diff --check`: clean.

## Fresh fixture set — after fixes (same text, re-run live)

| Case | Result (after) |
|---|---|
| Negated electrical | PASS — unchanged, 0.2 low confidence. |
| Effective guarding | PASS — unchanged, no hazard flagged. |
| Failed guard | PASS — unchanged, still recognized at low confidence. |
| **3-hazard** | **FIXED — 3/3 recovered** (`machine_guarding`, `hydraulic_pneumatic_energy`, `electrical`). |
| **4-hazard** | **FIXED — 4/4 recovered** (`machine_guarding`, `fall_protection`, `hydraulic_pneumatic_energy`, `electrical`). |
| 5-hazard | 5 real hazards + 1 extra tag (`hot_work`) — see below. Recorded, not blindly "fixed." |
| **Mixed negation + active** | **FIXED — negated guard condition correctly suppressed (0 findings for that clause), active electrical sibling correctly recovered (1 finding, confidence 0.9)** — exactly the required "negated condition suppressed while active siblings remain" behavior. |

### 5-hazard: actual behavior recorded (per task instruction, not forced to a clean result)

Text described 5 real hazards (machine guarding, electrical, hydraulic energy, fall protection,
respiratory). Live result: 6 tags — the 5 real hazards plus one `hot_work` tag from the word
"grinding" in "workers were grinding metal ... without respiratory protection," via a pre-existing
ignition-source detector (`grind(?:ing)?` is a recognized hot-work/ignition term) unrelated to this
phase's fixes. This is a plausible secondary tag (grinding can produce sparks) rather than an
obvious false positive, and it was present before this phase's changes too (the detector is
untouched) — recorded as observed behavior, not chased further, consistent with the prior
session's own note about a similar 5-hazard "open question" (`fall_protection` double-entry) not
being blindly fixed either.

## Regression check: V4 228-case matrix re-run after these fixes

Required before treating these fixes as safe — see `CLOSURE_V4.md` for the full result. Re-ran
228/228 after all three regex edits: **228/228 PASS**, confirming the widened plural/tense/term
matching did not introduce any new false positive against the frozen V4 fixture set.
