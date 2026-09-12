# Independent product-owner safety review — Batch 1 verdicts (SEM-01 … SEM-09)

**Reviewer:** the product owner, acting as the independent safety-domain reviewer.
**Corpus:** `FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE`, sealed at manifest `6a2c564c…`,
truth keys `1628f2e4…`, provenance `272cf02b…`.
**Packet:** `review/SEMANTIC-REVIEW-PACKET.md`, `29ec877c…`.
**Status:** recorded verbatim. **NOT YET APPLIED** — the corpus stays sealed until the full 35-row
review is complete, so corrections land in one pass rather than churning the seal four times.

---

## Verdicts as given

```
SEM-01 A:APPROVE  B:APPROVE  C:APPROVE
SEM-02 A:APPROVE  B:APPROVE  C:APPROVE
SEM-03 A:APPROVE  B:APPROVE  C:APPROVE
SEM-04 A:APPROVE  B:MODIFY INTERACTION  C:APPROVE
SEM-05 A:APPROVE  B:APPROVE  C:APPROVE
SEM-06 A:CHANGE TO NOT_OWED  B:CHANGE TO ABSENT  C:APPROVE
SEM-07 A:APPROVE  B:APPROVE  C:APPROVE
SEM-08 A:APPROVE  B:APPROVE  C:MODIFY FAMILY PARTITION
SEM-09 A:APPROVE  B:MODIFY INTERACTION  C:MODIFY FAMILY PARTITION
```

**19 of 27 judgements approved as authored. 6 corrections across 5 rows.**

## The corrections, verbatim

### SEM-04 — B: MODIFY INTERACTION
- Keep PRESENT.
- Keep participating families: fall protection + mobile equipment.
- The material interaction is that scissor-lift/platform stability directly governs the
  elevated-worker fall/tip-over exposure.
- Remove the assertions that the fall-protection arrangement "looks correct" and that being clipped
  to the unstable lift is necessarily "worse than not being clipped at all."
- The observation does not establish that clipping the lanyard to the lift rail is an acceptable
  anchorage, and that determination can depend on the lift design/manufacturer requirements.

### SEM-06 — A: CHANGE TO NOT_OWED
- Whether the reverse alarm functions is useful information, but it does not change the principal
  safety decision established by the observation.
- Pedestrians and a reversing loader already share the same travel line, no segregation is
  described, and an open floor opening is already present.
- A working reverse alarm would not make that arrangement adequately controlled or materially change
  the required corrective action.
- Therefore this is not a sufficiently decision-critical unknown for the formal CLARIFICATION_OWED
  truth set.

### SEM-06 — B: CHANGE TO ABSENT
- The observation establishes both a mobile-equipment hazard and a fall/opening hazard, but it does
  not establish that the opening is actually in the pedestrians' evasive path or that avoiding the
  loader directs them toward the opening.
- "The open grating is directly in the path people take to get out of the way" is an authored
  inference not contained in the observation.
- Treat as co-occurrence unless the observation itself establishes the shared footprint/causal
  relationship.

### SEM-08 — C: MODIFY FAMILY PARTITION
- confined space: PRESENT
- chemical exposure: **DEFENSIBLE, not PRESENT**
- other classifications unchanged.

Reason: the row's own clarification truth says the oxygen/CO2 condition is unknown and that the
answer determines HAZARD_EXISTENCE. Residual CO2 is entirely plausible and important enough to
require atmospheric verification, but the observation does not establish the actual concentration.
Marking chemical exposure PRESENT while simultaneously saying its existence depends on the missing
atmospheric measurement overstates the truth.

Additional review note: breaking the plane of a confined-space opening with any part of the body can
constitute entry; full-body entry is not required. The author's stated full-body uncertainty should
therefore not drive the truth classification.

### SEM-09 — B: MODIFY INTERACTION
- The semantic verdict should be **PRESENT**, not ABSENT.
- participating families: chemical exposure + electrical
- material relationship: an energized electrical fitting can provide the ignition source for the
  flammable solvent-vapor atmosphere, with booth exhaust unavailable during the task.
- This is not mere co-occurrence.
- Do NOT force it into an inaccurate existing interaction kind.
- Because the frozen closed vocabulary apparently cannot encode this interaction truth without
  abusing OTHER or tripping truth-leak detection, flag SEM-09 as exposing a genuine
  interaction-vocabulary/contract limitation.
- Do not count its interaction truth in the formal cohort until that representation issue is
  separately resolved.

### SEM-09 — C: MODIFY FAMILY PARTITION
- machine guarding: change **FORBIDDEN -> DEFENSIBLE**.

Reason: the observation says the exhaust fan is off and locked out. It does not affirmatively
establish that there are no accessible machine-guarding hazards or that the fan is the only relevant
mechanical equipment. FORBIDDEN requires affirmative exclusion, and that burden is not met here.

---

## A CONFLICT THAT MUST BE RESOLVED BEFORE APPLICATION

**SEM-08.** Judgement B was APPROVED — a `CONFINED_SPACE_ATMOSPHERIC` interaction whose participants
are *confined space + chemical exposure*. Judgement C moves **chemical exposure out of PRESENT** and
into DEFENSIBLE.

The frozen row contract requires every interaction participant to be a PRESENT family on its own row
(`INTERACTION_PARTICIPANT_NOT_PRESENT` in `validateCohortRow`). Applied together as written, SEM-08
becomes contract-invalid: the approved interaction names a participant the corrected partition says
is not present.

This is **not** something to resolve silently. Three coherent resolutions exist, and the choice is
the reviewer's:

1. **Interaction stands, participant restored** — chemical exposure returns to PRESENT. This
   reinstates exactly what C rejected, so it is only coherent if the C correction is withdrawn.
2. **Partition stands, interaction drops to ABSENT** — chemical exposure is DEFENSIBLE and SEM-08
   records no interaction. Consistent with the C reasoning, and consistent with the SEM-06 principle
   that a relationship must be established by the text.
3. **Both stand, and the contract is the problem** — the row is genuinely one where an interaction
   exists between an established hazard and a *plausible but unverified* one, and the contract has no
   way to say that. This would be a second contract limitation alongside SEM-09's.

Recorded here and carried as an open item. No option has been applied.

## Effect on Batch 1 counts, for tracking only

Of the nine rows reviewed: clarification-owed candidates 9 → **8** (SEM-06 withdrawn); interaction
candidates countable toward the formal cohort 8 → **7** (SEM-06 withdrawn; SEM-09 now PRESENT but
explicitly NOT countable pending the vocabulary resolution; SEM-08 unresolved pending the conflict
above). Forbidden-family determinations 1 → **0** in this batch (SEM-09 corrected).

Batches 2, 3 and 4 remain unreviewed. No count here is final and none has been applied.
