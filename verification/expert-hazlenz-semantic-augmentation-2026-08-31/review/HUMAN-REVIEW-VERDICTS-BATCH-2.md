# Independent product-owner safety review — Batch 2 verdicts (SEM-10 … SEM-18)

Plus the **resolution of the SEM-08 contract conflict** raised in Batch 1.
Recorded verbatim. **NOT YET APPLIED** — corrections land in one pass after all 35 rows.

---

## SEM-08 — conflict resolution (supersedes the Batch-1 B verdict)

```
SEM-08 A:APPROVE  B:CHANGE TO ABSENT  C:MODIFY FAMILY PARTITION
```

- Supersedes the prior Batch-1 `B:APPROVE`.
- The confined-space condition is established, but the atmospheric/chemical hazard is deliberately
  unresolved by the row's clarification truth.
- Since the frozen interaction contract requires every participant to be a PRESENT family, chemical
  exposure cannot simultaneously remain DEFENSIBLE and participate in a PRESENT interaction.
- Preserve the clarification: atmospheric verification is decision-critical.
- Do not count SEM-08 as a formal CROSS_HAZARD_INTERACTION opportunity.

Partition: confined space PRESENT; chemical exposure DEFENSIBLE; all others unchanged.

This is **resolution option 2** of the three recorded in Batch 1 — partition stands, interaction
drops — and it is consistent with the SEM-06 principle that a relationship must be established by
the observation rather than authored onto it.

## Batch 2 verdicts as given

```
SEM-10 A:APPROVE  B:APPROVE  C:APPROVE
SEM-11 A:APPROVE  B:APPROVE  C:APPROVE
SEM-12 A:APPROVE  B:APPROVE  C:APPROVE
SEM-13 A:APPROVE  B:MODIFY INTERACTION      C:APPROVE
SEM-14 A:APPROVE  B:CHANGE TO ABSENT        C:MODIFY FAMILY PARTITION
SEM-15 A:MODIFY GAP  B:APPROVE              C:MODIFY FAMILY PARTITION
SEM-16 A:MODIFY GAP  B:APPROVE              C:MODIFY FAMILY PARTITION
SEM-17 A:APPROVE  B:APPROVE  C:APPROVE
SEM-18 A:APPROVE  B:MODIFY INTERACTION      C:MODIFY FAMILY PARTITION
```

**18 of 27 approved as authored. 9 corrections across 5 rows.**

## The corrections, verbatim

### SEM-13 — B: MODIFY INTERACTION
- Keep PRESENT. Keep participants: fall protection + mobile equipment. Keep kind
  `FALL_EXPOSURE_ANCHORAGE` if that is the existing valid closed-vocabulary representation.
- The material relationship is that the personnel lift is both the elevated work platform and the
  structure carrying the manufacturer's designated anchorage; therefore platform stability affects
  the worker's overall elevated-work exposure.
- Remove/replace the statement that outriggers and sound support are what "make the anchor
  trustworthy." The manufacturer-designated anchor is the anchorage; stability controls the
  platform/tip-over exposure, not the anchor's certification itself.
- Do not imply that inspecting the harness alone would necessarily credit an invalid anchorage.

### SEM-14 — B: CHANGE TO ABSENT
- The proposed chemical exposure + confined space interaction is not established because the row
  does not establish a confined space.
- A closed pharmaceutical production suite with active ventilation is an enclosed work area, but
  enclosure or ventilation dependence alone does not satisfy the confined-space classification.
- Do not manufacture another interaction for this row merely to preserve counts.

### SEM-14 — C: MODIFY FAMILY PARTITION
- chemical exposure: PRESENT, unchanged.
- confined space: **PRESENT -> DEFENSIBLE**. Nothing establishes restricted means of entry/exit or
  that the suite is not designed for continuous employee occupancy.
- machine guarding: **FORBIDDEN -> DEFENSIBLE**. The charge-port interlock establishes a
  stopped/interlocked drive condition for the described task, but it does not affirmatively prove
  that every machine-guarding exposure is absent. An interlock is also not itself proof of energy
  isolation.

### SEM-15 — A: MODIFY GAP
- Keep verdict OWED. The missing fact remains the actual outlet pressure of the compressed-air wand.
- The affected decision may remain `APPLICABILITY`, because outlet pressure can determine
  applicability/compliance with the compressed-air cleaning limitation.
- Correct the rationale so it does NOT say that <=30 psi automatically makes the silica blowdown
  practice permissible.
- A low-pressure compressed-air condition may satisfy the general compressed-air pressure
  requirement, but silica-specific controls can independently restrict compressed-air cleaning
  unless the applicable dust-capture/feasibility conditions are met.
- Therefore the answer changes whether an additional compressed-air requirement is violated; it does
  not by itself decide whether the overall silica-cleaning method is acceptable.

### SEM-15 — C: MODIFY FAMILY PARTITION
- machine guarding: **FORBIDDEN -> DEFENSIBLE**. The observation proves that one coupling guard is
  installed and bolted. It does not affirmatively rule out all other machine-guarding exposures at
  the shakeout.

### SEM-16 — A: MODIFY GAP
- Keep verdict OWED. Define the missing fact as whether the proportioner is actually delivering the
  sanitizer at the intended/labeled use dilution. Preserve `HAZARD_SEVERITY`.
- Remove the unsupported assertion that an incorrect concentration is necessarily "corrosive" unless
  the row separately establishes the product's hazard classification.
- The defensible truth is that materially higher-than-intended concentration can change exposure
  severity and required PPE/contact response; the exact consequence depends on the sanitizer
  chemistry.

### SEM-16 — C: MODIFY FAMILY PARTITION
- machine guarding: **FORBIDDEN -> DEFENSIBLE**. Stopped equipment, an open disconnect under a
  departmental lock, and spraying from outside the frame do not affirmatively establish that every
  machine-guarding exposure is absent. FORBIDDEN is too strong.

### SEM-17 — review note accompanying A/B/C APPROVE
- Keep fall protection DEFENSIBLE. A propped roof hatch at the head of a ladder can create an
  opening/fall concern, but this observation does not establish enough geometry/exposure to make
  that family PRESENT.
- B:ABSENT accepted because the electrical and LOTO facts here are parts of the same energy-control
  situation; the row does not establish a separate cross-hazard relationship that needs an
  interaction truth beyond the underlying electrical/isolation assessment.

### SEM-18 — B: MODIFY INTERACTION
- Change **ABSENT -> PRESENT**. Participants: machine guarding + lockout/tagout. Use
  `LOTO_STORED_ENERGY` if that is the existing valid closed-vocabulary kind.
- The workers are placing a tool into the crusher hazard zone. Whether that access is acceptably
  controlled depends directly on whether the drive is positively isolated rather than merely stopped.
- These are not independent co-occurring findings: machine access creates the exposure whose
  acceptability is governed by the energy-isolation state.
- If isolated, the task can proceed subject to the remaining stored/material hazards and procedure.
  If merely stopped, unexpected startup while the bar is in the jaw creates a crushing/struck-by
  mechanism.

### SEM-18 — C: MODIFY FAMILY PARTITION
- fall protection: **FORBIDDEN -> DEFENSIBLE**. Sound grating and a continuous handrail support a
  controlled platform condition, but the observation does not actually state that the workers never
  lean/reach beyond the rail while manipulating the long bar. **The authored rationale added that
  fact.** Therefore FORBIDDEN is not justified.

---

## AUTHORING-QUALITY FINDING, recorded for post-review assessment

Across the eighteen rows reviewed so far, **every FORBIDDEN determination has been overturned** —
five of five: `SEM-09` machine guarding, `SEM-14` machine guarding, `SEM-15` machine guarding,
`SEM-16` machine guarding, `SEM-18` fall protection. Each was rejected on the same ground: the
observation established that *one* control was in place or that *one* item was inaccessible, and I
treated that as affirmatively excluding the whole family.

Six rows carrying forbidden determinations remain unreviewed. **This tally is recorded as evidence
about the authoring, not as guidance for the remaining verdicts, and it should not predispose them.**
Whether the remaining forbidden calls stand is a question about those rows' own text.

The corrections also show a second, related pattern the reviewer named explicitly on SEM-18: *"the
authored rationale added that fact."* The same overreach appears in SEM-06 (evasive path), SEM-04
("looks correct", "worse than not being clipped"), SEM-13 ("make the anchor trustworthy"), SEM-15
(low pressure implies permissible), SEM-16 (concentrate implies corrosive) — six rationales that
asserted more than their observation established. That is now the dominant defect class in this
corpus and will be reported as such.

## Running effect on counts, tracking only — nothing applied

Rows reviewed: 18 of 35.
- Clarification-owed candidates among them: 15 authored → **14** (SEM-06 withdrawn; SEM-15 and
  SEM-16 retained with corrected rationale).
- Interaction candidates countable toward the formal cohort: 11 authored → **9** (SEM-06, SEM-08 and
  SEM-14 withdrawn; SEM-18 added; SEM-09 PRESENT but explicitly not countable pending the vocabulary
  resolution).
- Forbidden-family determinations: 5 authored → **0** surviving.

Batches 3 and 4 remain unreviewed. No count is final and none has been applied.
