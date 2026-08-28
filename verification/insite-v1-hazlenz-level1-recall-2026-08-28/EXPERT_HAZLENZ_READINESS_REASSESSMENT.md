# Expert HazLenz readiness — reassessment after deterministic Level-1 recall closure

`ARCHITECTURE ONLY. NO PROVIDER CALL WAS IMPLEMENTED OR MADE IN THIS PHASE.`

```
EXPERT_HAZLENZ_IMPLEMENTED        = FALSE
PROVIDER_CALL_IMPLEMENTED         = FALSE
PROVIDER_CALLS_MADE               = 0
LEVEL_1_AUTHORITY                 = DETERMINISTIC
AUTHORIZATION_REQUIRED_TO_PROCEED = TRUE
```

This document supersedes nothing in
`../insite-v1-hazlenz-precision-2026-08-27/EXPERT_HAZLENZ_READINESS_CONTRACT.md`.
Its §1 invariant and §3 attribution requirements stand unchanged and are
restated here by reference. Only the blocker list is reassessed.

## 1. The invariant is unchanged and is now measurably meaningful

Level-1 deterministic authority is the safety floor; Expert HazLenz is additive
and may only add. Provider unavailability, timeout, refusal, malformed output or
quota exhaustion must yield exactly the deterministic output the customer would
have received with Expert HazLenz disabled.

Before this phase that invariant protected a floor with **five life-critical
holes in it** on the bounded corpus, including an MCC bucket opened live with no
lock, for which the deterministic engine produced no hazard at all and labelled
the analysis *Machine Guarding*. A floor with a hole is not a floor, and an
Expert layer sitting on top of it would have been the only thing standing
between that observation and a silent miss.

The floor now measures 43/43 required hazard groups and 35/35 life-critical
groups on the frozen corpus, with Population A precision held at 100.0 %.

## 2. Blocker status

| # | blocker | status |
|---|---|---|
| 1 | **Provider authority governance** — no rule defines when, if ever, Expert output may override, reorder or suppress a Level-1 output | **OPEN.** Policy decision; belongs to the account owner. Until written and governed, Expert output is strictly additive and advisory. |
| 2 | **Attribution schema** — persistence columns and DTO fields for Expert provenance, Expert confidence and Expert-sourced standards | **OPEN.** Not designed, no migration exists. |
| 3 | **Fallback proof** — a test showing a provider timeout, refusal or malformed response yields byte-identical Level-1 output | **OPEN.** Must exist before the first provider call ships. |
| 4 | **Level-1 invariance harness** — assert that enabling Expert HazLenz does not change the deterministic families emitted for any of the 56 corpus rows | **OPEN, but the harness it must extend is now stronger.** Two protected gates exist and both run inside `npm run test:hazlenz-core`: `test:hazlenz-precision` (Population A precision floor and the recall veto) and the new `test:hazlenz-level1-recall` (17 checks: every measured Level-1 omission plus the 8-row hazardous-energy probe family). The invariance assertion still has to be written. |
| 5 | **Cost, latency and offline behaviour** — InSite ships offline field readiness; per-classify cost ceiling undecided | **OPEN.** Product decision. |
| 6 | **Credentials and provider selection** | **OPEN.** No provider configured, no key present. External authorisation; belongs to the account owner. |
| 7 | **The deterministic recall gaps** — 11 required groups, 7 life-critical, missed by decomposition, including B-15 | **RESOLVED BY MEASUREMENT.** Complete Level-1 represents 43/43 required groups and 35/35 life-critical groups; decomposition itself moved 32/43 → 40/43 with life-critical omissions 7 → 2. Precision did not regress. Expert HazLenz is no longer positioned, even implicitly, as the fix for a life-critical deterministic gap. |

**Six of seven blockers remain open. Expert HazLenz implementation is not
authorised.**

## 3. What blocker 7's resolution does and does not mean

It means the account owner's stated precondition is satisfied: a remote provider
would not be establishing the minimum safety floor on this corpus, because the
deterministic engine already does.

It does **not** mean deterministic recall is complete in general. The evidence is
bounded by a 56-row corpus and an 8-row probe family, both authored by this
process rather than drawn from field data. Three required groups are still
recovered only by the primary classifier and therefore never become findings of
their own with their own standard, risk and corrective action (STATUS §8), and
two structural weaknesses — single-winner fragment routing, and the router's
treatment of an absent control as a negated signal — are repaired only where
they were demonstrated, family by family. New wording will find new gaps.

## 4. Additional requirements this phase adds for Expert HazLenz

1. The **hazardous-energy probe family** becomes part of the Expert invariance
   harness alongside the 56-row corpus: with Expert enabled, HE-02, HE-04,
   HE-06, HE-07 and HE-08 must still produce no electrical or hazardous-energy
   finding. An Expert layer that starts finding hazards in a verified lockout or
   in a training record is a worse failure than one that finds too few.
2. Expert HazLenz must not be permitted to satisfy a required hazard group on
   its own in any future recall measurement. Both scorers in this package read
   the deterministic surfaces; any Expert-sourced contribution must be scored on
   its own axis so a regression in the deterministic floor can never be masked
   by provider output.
