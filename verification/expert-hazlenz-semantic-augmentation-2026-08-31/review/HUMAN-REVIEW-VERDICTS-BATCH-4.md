# Independent product-owner safety review — Batch 4 verdicts (SEM-28 … SEM-35)

The final batch. Also carries the **confirmation of the two provisional selections** flagged in
Batch 3 (SEM-24 interaction kind, SEM-26 affected decision) and a **manifest order correction**.

Recorded verbatim. **NOT YET APPLIED** — corrections land in one pass now that all 35 rows are
reviewed.

**Review status after this batch: 35 of 35 rows reviewed. The independent product-owner safety
review of `FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE` is COMPLETE.**

---

## Verdicts as given

```
SEM-28 A:CHANGE TO NOT_OWED  B:APPROVE ABSENT       C:MODIFY PARTITION
SEM-29 A:MODIFY GAP          B:APPROVE ABSENT       C:MODIFY PARTITION
SEM-30 A:MODIFY GAP          B:APPROVE ABSENT       C:APPROVE AS AUTHORED
SEM-35 A:APPROVE OWED        B:MODIFY INTERACTION   C:APPROVE AS AUTHORED
SEM-31 A:APPROVE NOT_OWED    B:APPROVE ABSENT       C:APPROVE AS AUTHORED
SEM-32 A:APPROVE NOT_OWED    B:APPROVE ABSENT       C:APPROVE AS AUTHORED
SEM-33 A:APPROVE NOT_OWED    B:APPROVE ABSENT       C:APPROVE AS AUTHORED
SEM-34 A:APPROVE NOT_OWED    B:APPROVE ABSENT       C:APPROVE AS AUTHORED
```

**18 of 24 judgements approved as authored. 6 verdict-level corrections across 4 rows** (SEM-28 A,
SEM-28 C, SEM-29 A, SEM-29 C, SEM-30 A, SEM-35 B), **plus three rationale-only corrections on
approved verdicts** (SEM-29 B, and SEM-30 C / SEM-33 C per the final owner calls below). Batch 4
complete.

---

## The corrections, verbatim

### SEM-28 — A: CHANGE TO NOT_OWED

The ventilation-control strategy is not decision-critical to the observation as written.

- No oxygen leak, elevated oxygen concentration, ventilation failure, alarm, or other evidence of
  oxygen enrichment is described.
- Whether the fan cycles or runs continuously may affect protection against a **future** release,
  but it does not determine whether a **current** oxygen-enrichment hazard exists.
- The authored rationale improperly converts *"a leak could accumulate if ventilation were
  inadequate"* into *"the hazard exists if the fan cycles."* **That is a hypothetical-condition
  substitution.**
- The observed cylinder-change activity is otherwise described as controlled: cylinders secured;
  manifold isolation closed; no lubricant; clean fittings; mechanical ventilation operating.

### SEM-28 — C: MODIFY PARTITION

- **chemical exposure:** retain PRESENT, but classify as **PRESENT (recorded safe/controlled)**.
  Oxygen-cylinder changeover establishes the chemical/atmospheric hazard domain, while the observed
  controls describe the activity as controlled. No release or oxygen-enriched atmosphere is
  established.
- All remaining family classifications: **APPROVE AS AUTHORED.**

### SEM-29 — A: MODIFY GAP

- Keep verdict **OWED**.
- Keep the missing fact substantially as authored: whether the overhead crane and applicable
  C-hook/lifting device are within their required inspection/verification intervals and otherwise
  authorized for service.
- Change decision affected from **`HAZARD_SEVERITY`** to **`REQUIRED_CONTROL`**.

Why decision-critical: inspection status does not materially change the physical severity of the
credible consequence — failure while handling a multi-ton suspended coil can already produce
catastrophic injury. What changes is whether the lifting equipment may appropriately remain in
service and whether the operation can continue under the existing controls. If required
inspection/verification is current, assessment can proceed from the observed handling conditions. If
it is overdue or cannot be established, continued use of the lifting assembly may require
suspension, verification, inspection, or other corrective control before the lift proceeds.

> OSHA 29 CFR 1910.179 expressly treats crane inspection as a recurring frequent/periodic inspection
> obligation, including complete periodic inspection at intervals based on service and environment.
> The inspection fact therefore fits equipment acceptability/control status better than physical
> hazard severity.

### SEM-29 — B: APPROVE ABSENT (rationale corrected)

- Replace the explanatory sentence asserting that both *"machine guarding"* and *"mobile equipment"*
  are PRESENT.
- Reason for ABSENT: only one accepted PRESENT family remains after the partition correction below,
  so no cross-hazard interaction is established.

### SEM-29 — C: MODIFY PARTITION

- **machine guarding: PRESENT -> DEFENSIBLE.** The slitter mandrel is stationary and the line is
  stopped. No missing, defeated, open, or inadequate machine guard is described. The proud banding
  strap and suspended-coil hand-guiding conditions do not themselves establish a machine-guarding
  hazard.
- **mobile equipment: APPROVE PRESENT (life-critical).**
- All other families: **APPROVE DEFENSIBLE AS AUTHORED.**

### SEM-30 — A: MODIFY GAP

- Keep verdict **OWED**.
- Replace *"the last calibration date of the ammonia detector heads"* with: **whether the ammonia
  detector heads are currently within their applicable calibration/functional-verification interval
  and are considered reliable for service.**
- Decision affected: **`EXPOSURE`** (unchanged).

Why decision-critical: a date alone is not sufficient unless it can be evaluated against the
applicable calibration/verification interval. If the detection system is current and serviceable,
the no-alarm indication is meaningful evidence supporting the recorded controlled atmospheric state.
If the detector heads are overdue, failed verification, or otherwise unreliable, the no-alarm
indication cannot carry the same evidentiary weight and the atmospheric exposure assessment must
account for the loss of that monitoring control.

### SEM-30 — C: FINAL OWNER CALL (rationale tightening; classification unchanged)

Issued after the author flagged SEM-30's forbidden rationale for confirmation. Verbatim:

> **machine guarding: FORBIDDEN**
>
> Replace rationale with:
>
> *"Compressor guards are affirmatively described as fitted. The observation therefore establishes
> the relevant machine-guarding condition as controlled and provides no contrary guarding
> condition."*
>
> Do not rely on *"no open drive, coupling or point of operation is described"* as the basis for
> FORBIDDEN.
>
> **This is a rationale tightening only. The adjudicated classification remains FORBIDDEN.**

The classification stands exactly as adjudicated. What changes is the ground it rests on: the
determination is now carried entirely by the affirmative description of the guards as fitted, and
the absence-of-description clause is struck.

This also settles the general principle that the six overturned rationales and the nine surviving
ones were splitting on. **FORBIDDEN may rest on an affirmative description of the relevant condition
as controlled. It may not rest on the observation's silence.** SEM-30's original rationale asserted
both, and only the first half was load-bearing.

Application effect: replace `SEMANTIC_ROWS['SEM-30'].forbiddenRationale.machine_guarding`.

- **From:** `"Compressor guards are described as fitted, and no open drive, coupling or point of operation is described anywhere in the room."`
- **To:** `"Compressor guards are affirmatively described as fitted. The observation therefore establishes the relevant machine-guarding condition as controlled and provides no contrary guarding condition."`

`forbiddenRationale` is author-provenance, not truth-key material — it is an input to
`provenanceSha256` but not to `manifestSha256` or `truthKeySha256`, and it is not returned by
`truthOnlyStrings()`. So this edit re-seals provenance and leaves the manifest and truth-key hashes
untouched. `truth.forbiddenHazardFamilies` still contains `machine_guarding` and does not change.

### SEM-33 — C: FINAL OWNER CALL (rationale tightening; classification unchanged)

Issued after the author reported SEM-33 as carrying the same mixed rationale shape as SEM-30.
Verbatim:

> **chemical exposure: FORBIDDEN.** Classification remains unchanged.
>
> Replace rationale:
>
> *"Hoods are certified current with sashes at working height and baffles unobstructed, and storage
> is segregated by compatibility in vented cabinets. No handling, spill or release is described, and
> no work was in progress."*
>
> with:
>
> *"Hoods are affirmatively described as currently certified, with sashes at the marked working
> height and baffles unobstructed. Chemical storage is affirmatively described as segregated by
> compatibility in vented cabinets, and the observation expressly states that no work was in
> progress."*
>
> Reason: FORBIDDEN rests only on affirmative facts establishing the relevant observed
> chemical-exposure condition as controlled. Do not use the absence of a described spill, release, or
> handling condition as evidence for FORBIDDEN.
>
> **This is a rationale tightening only. `truth.forbiddenHazardFamilies` remains unchanged.**

Application effect: replace `SEMANTIC_ROWS['SEM-33'].forbiddenRationale.chemical_exposure` with the
text above. Same hash surface as SEM-30 — `provenanceSha256` only.

**This call sharpens the test in a way the SEM-30 call did not make explicit.** "No work was in
progress" survives into the tightened rationale, while "no handling, spill or release is described"
is struck — and both are negative-sounding. The distinguishing property is not the grammar of the
clause but whether **the observation expressly states the fact**. SEM-33's text does say *"No work
was in progress at the time of inspection"*, so that is an affirmative observed fact stated in the
negative. It never says anything about handling, spills or releases, so that clause is the author
reading the text's silence as evidence. **The test is "does the observation assert it", not "is the
sentence phrased positively."**

### SEM-35 — B: MODIFY INTERACTION

- Retain verdict **PRESENT**.
- Retain participating families: **fall protection + mobile equipment**.
- Retain the authored evidence, relationship, and separate-assessment rationale.
- **Do NOT retain interaction kind `FALL_EXPOSURE_ANCHORAGE`.**

Reason: no anchorage is described. The worker is protected by a gangway/cage system whose
effectiveness depends upon the vehicle remaining in position. Calling that relationship "ANCHORAGE"
changes the physical mechanism and therefore distorts the observation.

- Apply an existing frozen interaction kind **ONLY IF** one expressly covers vehicle movement /
  platform-position dependency / drive-away effects on fall protection.
- If no frozen member names that relationship without distortion, record SEM-35 as an **additional
  `ACCEPTED_INTERACTION_TAXONOMY` vocabulary gap** rather than forcing `FALL_EXPOSURE_ANCHORAGE`.

---

## Provisional selection confirmations (Batch 3 open items, now closed)

### SEM-24 interaction kind — **CONFIRM `LOTO_STORED_ENERGY`**

> Use it because it is the frozen member that represents the hazardous-energy isolation /
> stored-or-process-energy relationship described by that row. Do not create a new kind merely to
> make the label more linguistically exact.

### SEM-26 affected decision — **CONFIRM `REQUIRED_CONTROL`**

> That is the closest frozen decision class to the authored semantic: the unresolved fact changes
> what control must be required, rather than whether the underlying hazard physically exists.

Both provisional readings recorded in Batch 3 are therefore confirmed as given. No further open
selection questions remain from Batches 1–3 except the SEM-27 conditional noted below.

---

## SEM-35 interaction-kind determination — the check the reviewer directed

The reviewer's instruction was conditional: apply a frozen kind **only if** one expressly covers the
relationship. That check has now been performed against the frozen closed vocabulary
(`EXPERT_INTERACTION_KINDS`, `expert-contract.types.ts:208`). All eight members:

| member | expressly covers vehicle movement / platform-position dependency / drive-away? |
|---|---|
| `ELECTRICAL_WET_ENVIRONMENT` | No. |
| `EXCAVATION_UTILITIES` | No. |
| `CONFINED_SPACE_ATMOSPHERIC` | No. |
| `FALL_EXPOSURE_ANCHORAGE` | **Expressly rejected by the reviewer** — no anchorage is described. |
| `LOTO_STORED_ENERGY` | No. Nothing is isolated and no stored-energy control is described. |
| `CHEMICAL_PPE_VENTILATION` | No. |
| `MOBILE_EQUIPMENT_PEDESTRIAN` | **No.** It names a vehicle/person-on-foot relationship. The worker here is not a pedestrian sharing a travel route, and the mechanism is not struck-by; the safety content is that the fall-protection system is only protective while the trailer stays put. Selecting this member would relabel a fall-protection position-dependency as a traffic interaction — the same class of distortion the reviewer forbade for `FALL_EXPOSURE_ANCHORAGE`. |
| `OTHER` | The catch-all exists, but it is unusable as truth. `truthOnlyStrings()` (`expert-cohort-contract.ts:308`) returns `interactionKind` as a truth-only string, and the leak check tests `rendered.includes(secret)` as a plain substring against `EXPERT_SYSTEM_PROMPT` + user prompt + serialized input (`validate-semantic-augmentation.ts:185`). **Verified by execution:** the token `OTHER` already occurs in `EXPERT_SYSTEM_PROMPT` — in the sentence *"THIS IS NOT A RULE THAT ISOLATION OR LOCKOUT/TAGOUT MAKES ANY OTHER HAZARD SAFE"* — as an ordinary English word. The detector is a substring test and cannot distinguish that use from the enum value, so setting `interactionKind: 'OTHER'` trips `TRUTH_LEAK` on every request built for the row. This is the exact defect already reported on SEM-09. **The detector will not be weakened to buy a count.** |

**Determination: no frozen member expressly covers the relationship. Per the reviewer's own
instruction, SEM-35 is recorded as an additional `ACCEPTED_INTERACTION_TAXONOMY` vocabulary gap.**

### The consequence, stated plainly

`recordedInteractions[].interactionKind` is a required field constrained to the closed enum
(`INTERACTION_KIND_INVALID` in `validateCohortRow`). There is no contract-valid way to record a
PRESENT interaction without naming a kind. So the application pass must **remove SEM-35's
`recordedInteractions` entry** — exactly as SEM-09's was left unrecorded — while the semantic
verdict (PRESENT, fall protection + mobile equipment) and the limitation stand on the row.

**SEM-35 was authored specifically to restore the fourteenth interaction that SEM-09 lost to this
same vocabulary defect.** Its own `authoringRationale` says so, and says *"here the anchorage can
drive away"* — the framing the reviewer has now rejected. That rationale must be corrected in the
application pass. The corpus has now lost **two** interaction counts to one frozen-vocabulary
defect, and the second loss was the repair attempt for the first. This is reported, not engineered
around. No kind was forced, `EXPERT_INTERACTION_KINDS` was not widened, and `truthOnlyStrings` was
not touched.

---

## THE FORBIDDEN-FAMILY PATTERN REVERSES IN BATCH 4

Batch 2 recorded that every forbidden determination reviewed so far had been overturned, and
explicitly warned that the tally *"should not predispose"* the remaining verdicts. It did not.

**Batch 4 contains 9 forbidden determinations across 5 rows, and all 9 were approved as authored.**

| row | forbidden families | verdict |
|---|---|---|
| SEM-30 | machine guarding | APPROVE AS AUTHORED |
| SEM-31 | electrical, mobile equipment | APPROVE AS AUTHORED |
| SEM-32 | chemical exposure, lockout/tagout | APPROVE AS AUTHORED |
| SEM-33 | chemical exposure | APPROVE AS AUTHORED |
| SEM-34 | fall protection, machine guarding, chemical exposure | APPROVE AS AUTHORED |

Corpus-wide, verified by enumerating `forbiddenRationale` across the sealed fixture:
**15 forbidden determinations were authored across 11 rows. 6 were overturned (SEM-09, SEM-14,
SEM-15, SEM-16, SEM-18, SEM-27). 9 survive.** Batch 3's line *"6 authored, 6 overturned, zero
surviving"* was true of SEM-01…SEM-27 only and is superseded by the corpus-wide figures here.

The 9 survivors are all on the four `NEITHER — CONTROLS` rows plus SEM-30. The distinguishing
feature is legible: **where the observation affirmatively excludes the family, FORBIDDEN stood;
where the author inferred exclusion from one control being in place, it was overturned.** SEM-34's
rationales quote the text directly ("the room contains no process equipment", "no chemical storage
of any kind"). The six overturned rationales all had the shape "one guard was fitted, therefore the
family is absent."

### One flagged item — RAISED AND NOW RESOLVED BY FINAL OWNER CALL

**SEM-30 machine guarding** was flagged as the weakest of the nine against that distinction. Its
authored rationale combined an affirmative control (*"Compressor guards are described as fitted"*)
with an absence-of-description (*"no open drive, coupling or point of operation is described anywhere
in the room"*), and the second half is the shape that was overturned on SEM-15 and SEM-16.

**Resolved.** The owner's final call keeps the classification at FORBIDDEN and strikes the
absence-of-description clause, so the determination now rests only on the affirmative half. The
verbatim call and the exact rationale replacement are recorded under *SEM-30 — C: FINAL OWNER CALL*
above.

That resolution states the governing principle explicitly, and it is the same line the six
overturned and nine surviving determinations split along: **FORBIDDEN may rest on an affirmative
description of the relevant condition as controlled; it may not rest on the observation's silence.**
The SEM-33 call then sharpened it: the test is whether the observation *expressly asserts* the fact,
not whether the sentence is phrased positively — "no work was in progress" is stated by the text and
survives, "no spill is described" is the author reading silence and does not.

### Audit of all nine surviving rationales against that line

Enumerated from `forbiddenRationale` in the sealed fixture and classified against the owner's test.
**Reported, not rewritten.** Two are adjudicated; two are clean; five carry an
absence-of-description clause and await the owner's call.

| row · family | status |
|---|---|
| SEM-30 · machine guarding | **TIGHTENED** by final owner call |
| SEM-33 · chemical exposure | **TIGHTENED** by final owner call |
| SEM-34 · machine guarding | **CLEAN** — *"The observation states the room contains no process equipment."* Expressly asserted by the text. |
| SEM-34 · chemical exposure | **CLEAN** — *"The observation states the room contains no chemical storage of any kind."* Expressly asserted by the text. |
| SEM-31 · electrical | **MIXED** — *"Chargers are described as running normally with leads seated, **and no damaged cord, exposed conductor or open enclosure is described**."* |
| SEM-31 · mobile equipment | **MIXED** — *"No trucks are on charge out of their bays and no work is in progress in the room, **so no travel, lift or pedestrian interaction is described**."* First two facts are expressly stated; the trailing inference is not. |
| SEM-32 · chemical exposure | **MIXED** — *"Coolant concentration was checked and logged the same morning at its specified ratio, **and no mist, dermal contact or unlabelled product is described**."* |
| SEM-32 · lockout/tagout | **MIXED** — *"Loading and unloading happen at the door with the spindle stopped under a proven interlock, **and no maintenance task requiring energy isolation is described**."* |
| SEM-34 · fall protection | **MIXED** — *"The kick stool is stowed under the plan chest, **and no climbing, elevated work or unprotected edge is described**."* |

Every MIXED entry has the same structure the owner corrected twice: a load-bearing affirmative
clause followed by an absence-of-description clause that is not. In each, the affirmative half
appears sufficient on its own, so the expected disposition is a rationale tightening with the
classification unchanged — **but that is the owner's call on each row's own text, and none has been
made or applied.**

---

## FINAL RECONCILIATION — recomputed from the sealed fixture, superseding the running tallies

The per-batch running counts in Batches 1–3 were the author's tracking notes, not the reviewer's
verdicts. Recomputing them directly from the sealed fixture shows two of them drifted by one row.
**The verbatim verdicts in every batch file are untouched; only the arithmetic below is corrected.**

Authored totals, enumerated from `SEMANTIC_ROWS` and matching `corpus/SEAL.json`:
27 clarification-owed candidates · 8 not-owed controls · 14 interaction candidates ·
15 forbidden determinations across 11 rows.

### Clarification (A)

| | count |
|---|---|
| Authored OWED | **27** |
| Withdrawn to NOT_OWED | **5** — SEM-06, SEM-20, SEM-22, SEM-23, SEM-28 |
| Retained with corrected framing | **9** — SEM-15, SEM-16, SEM-19, SEM-21, SEM-25, SEM-26, SEM-27, SEM-29, SEM-30 |
| **Surviving OWED** | **22** |

Batch 2 recorded 15 authored / 14 surviving through SEM-18; the true figures are 14 / 13. Batch 3
inherited that and recorded 24 / 18 through SEM-27; the true figures are 23 / 19.

Effect on the frozen minimum: independently authorized 3 + 22 = **25 against a frozen minimum of
20, margin +5.**

**SEM-27 is conditional.** The reviewer kept it OWED *"only if"* the truth is narrowed to whether the
garment is actually flame-resistant / thermally protective as required by the task-specific hazard
assessment. If the application pass cannot satisfy that narrowing, SEM-27 drops and the surviving
count is 21 (total 24, margin +4).

### Cross-hazard interaction (B)

| | count |
|---|---|
| Authored PRESENT | **14** |
| Withdrawn to ABSENT | **3** — SEM-06, SEM-08, SEM-14 |
| Authored ABSENT, promoted to PRESENT and countable | **2** — SEM-18, SEM-24 (both `LOTO_STORED_ENERGY`, now confirmed) |
| PRESENT but **NOT countable**, blocked by the frozen vocabulary | **2** — SEM-09, SEM-35 |
| **Countable PRESENT** | **12** — SEM-01, 02, 03, 04, 05, 07, 10, 11, 12, 13, 18, 24 |

Batch 2's "11 authored → 9" and Batch 3's "→ 10" both understated this; the correct running figure
through SEM-27 was 12, and Batch 4 adds none.

Effect on the frozen minimum: independently authorized 5 + 12 = **17 against a frozen minimum of
10, margin +7.** Resolving the interaction-vocabulary defect would return SEM-09 and SEM-35 for 19.

### Family partition (C)

Corrected on 9 rows: SEM-08, SEM-09, SEM-14, SEM-15, SEM-16, SEM-18, SEM-27, SEM-28, SEM-29.

### Bottom line

**Both frozen minima are still met with margin under the reviewed truth. `CLARIFICATION_OWED >= 20`
and `CROSS_HAZARD_INTERACTION >= 10` were not relaxed and did not need to be.** The review cost the
corpus 5 clarification candidates and 4 interaction counts (3 withdrawn, 1 blocked) and did not
break it.

---

## MANIFEST ORDER — descriptive correction, to be recorded during the application pass

The reviewed corpus manifest order is the **actual sealed array order**:

```
SEM-01 ... SEM-30, SEM-35, SEM-31 ... SEM-34
```

**Verified**, not assumed — enumerating `SEMANTIC_ROWS.map(r => r.row.source.rowId)` returns exactly
that sequence, with `SEM-35` at array index 30, between `SEM-30` and `SEM-31`.

- **Do not reorder the sealed source** merely to make the identifier sequence numerical.
- Correct the human-readable description of the order so it no longer implies that numeric SEM
  identifier order and authored/array order are identical.
- The existing seal/hash remains evidence of the original real array order; this correction concerns
  the **manifest description**, not reinterpretation of the sealed hash.

### Where it is written, and why the hashes are unaffected

The description is the string literal `'SEM-01 .. SEM-34, authored order, immutable after seal'` in
two places: `backend/scripts/validate-semantic-augmentation.ts:231` and the emitted
`verification/expert-hazlenz-semantic-augmentation-2026-08-31/corpus/SEAL.json` (`"order"`).

It is wrong in two independent ways: it names a **SEM-34 endpoint for a 35-row corpus**, and it
implies numeric order equals array order.

`manifestSha256` is computed over `rows.map(r => ({ rowId, observation }))` in real array order —
the `order` string is **not an input to any of the three hashes**. It is a sibling descriptive field
in the emitted seal object. So correcting the description leaves `6a2c564c…`, `1628f2e4…` and
`272cf02b…` byte-identical, which is exactly the reviewer's stated position: the seal remains
evidence of the real array order, and only the prose describing it changes.

---

## Open items carried into the application pass

1. **SEM-27 A is conditional** — OWED survives only if the truth is narrowed to garment thermal
   protection. Resolve before counting it.
2. **SEM-35's `recordedInteractions` entry must be removed** and its `authoringRationale` corrected
   to drop the rejected "anchorage can drive away" framing.
3. **SEM-28's gap `SEM-28-G1` is withdrawn**, and `chemical_exposure` is added to that row's
   `negatedOrSafeStateFamilies` (currently empty) to carry the "recorded safe/controlled"
   classification. Contract-checked: `negatedOrSafeStateFamilies` is an overlay, not one of the three
   mutually exclusive buckets, so a family may be both PRESENT and negated/safe — SEM-30, SEM-31 and
   SEM-32 already do this.
4. **SEM-29's `machine_guarding` moves PRESENT -> DEFENSIBLE.** The row records no interaction, so no
   `INTERACTION_PARTICIPANT_NOT_PRESENT` conflict arises. `mobile_equipment` remains PRESENT and
   life-critical, which keeps `LIFE_CRITICAL_NOT_PRESENT` satisfied.
5. **SEM-29's affected decision moves `HAZARD_SEVERITY` -> `REQUIRED_CONTROL`.**
6. **SEM-30's gap description is rewritten** from a calibration *date* to calibration/verification
   *currency and reliability*. `EXPOSURE` is unchanged.
7. **The manifest order description is corrected** in both locations; no hash changes.
7a. **SEM-30's `forbiddenRationale.machine_guarding` and SEM-33's
   `forbiddenRationale.chemical_exposure` are replaced** with the owner's tightened texts. Both
   classifications stay FORBIDDEN. Re-seals `provenanceSha256` only.
7b. **Five surviving forbidden rationales still carry an absence-of-description clause** — SEM-31
   electrical, SEM-31 mobile equipment, SEM-32 chemical exposure, SEM-32 lockout/tagout, SEM-34 fall
   protection. Audited and tabulated above. **Owner call required on each; none may be tightened on
   the author's own initiative**, since a rationale is the reviewable basis of an adjudicated
   classification. SEM-34 machine guarding and SEM-34 chemical exposure need no change.
8. **A second `ACCEPTED_INTERACTION_TAXONOMY` vocabulary gap is recorded** (SEM-35), alongside
   SEM-09's, and the `ACCEPTED_EXPERT_TAXONOMY` thermal-family gap surfaced by SEM-27 in Batch 3.
   Three frozen-vocabulary limitations are now on record, all reported rather than repaired.

Nothing in this file has been applied. The corpus remains sealed at manifest `6a2c564c…`, truth keys
`1628f2e4…`, provenance `272cf02b…`, and `FORMAL_COHORT_SPENT = FALSE`.
