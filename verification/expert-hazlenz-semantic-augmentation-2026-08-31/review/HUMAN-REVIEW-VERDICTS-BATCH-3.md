# Independent product-owner safety review — Batch 3 verdicts (SEM-19 … SEM-27)

Recorded verbatim. **NOT YET APPLIED.**

---

## SEM-19 — deferred, re-presented, then judged

Initially returned `A:DEFERRED B:DEFERRED C:DEFERRED` because the Batch-3 presentation appeared to
begin inside SEM-19 A without the observation / where-what section, with the instruction: **do not
infer approval from the proposed truth**, re-present in full first.

*Presentation note, recorded for accuracy and not as a dispute:* the Batch-3 message as sent did
contain the SEM-19 heading, where/what line and full observation blockquote; the truncation was on
the receiving side. The deferral was honoured regardless — SEM-19 was re-presented verbatim and
unmodified, with the reviewer's own 29 CFR 1910.1003 note deliberately NOT used to pre-correct the
candidate before judgement.

### Final SEM-19 verdict

```
SEM-19 A:MODIFY GAP  B:APPROVE  C:APPROVE
```

**A: MODIFY GAP** — keep verdict OWED. Replace the missing fact with **two linked regulatory facts**:

1. the exact identity and applicable concentration of the "benzidine-family" dye, sufficient to
   determine whether it is one of the substances/mixtures actually covered by 29 CFR 1910.1003; and
2. if covered, whether the weighing operation is being conducted within the required
   regulated-area/control regime applicable to that operation.

Decision affected: `REGULATORY_INTERPRETATION`.

Why decision-critical: the drum description "benzidine-family" is not enough to establish that
1910.1003 applies — the standard covers specifically named carcinogens and contains concentration
exclusions for certain mixtures. If the material is within scope, the standard requires a regulated
area and operation-specific controls; for transfer/charging-type operations those controls can
include restricted access, continuous local exhaust, protective clothing, respiratory protection,
hygiene/decontamination and other measures. If the material is outside the standard's scope, those
specific 1910.1003 obligations do not attach merely because the product is described generically as
"benzidine-family."

**Remove the phrase "written exposure control plan"** unless another authoritative standard
applicable to this exact substance independently requires that specific written document.

**Also remove "With a plan in place ... the finding is nil."** Even if a compliant program/regime
exists, the observed operation itself must satisfy the applicable controls. Documentation alone
cannot make the observed task compliant.

**B: APPROVE** — keep ABSENT; only chemical exposure is established as a PRESENT family.

**C: APPROVE** — chemical exposure PRESENT; all listed other families remain DEFENSIBLE.

## Verdicts as given

```
SEM-19 A:MODIFY GAP           B:APPROVE   C:APPROVE   (deferred, re-presented, then judged)
SEM-20 A:CHANGE TO NOT_OWED   B:APPROVE   C:APPROVE
SEM-21 A:MODIFY GAP           B:APPROVE   C:APPROVE
SEM-22 A:CHANGE TO NOT_OWED   B:APPROVE   C:APPROVE
SEM-23 A:CHANGE TO NOT_OWED   B:APPROVE   C:APPROVE
SEM-24 A:APPROVE              B:MODIFY INTERACTION   C:APPROVE
SEM-25 A:MODIFY GAP           B:APPROVE   C:APPROVE
SEM-26 A:MODIFY GAP           B:APPROVE   C:APPROVE
SEM-27 A:MODIFY GAP           B:APPROVE   C:MODIFY FAMILY PARTITION
```

**18 of 27 judgements approved as authored. 9 corrections across 8 rows. Batch 3 complete.**

## The corrections, verbatim

### SEM-20 — A: CHANGE TO NOT_OWED
The observation establishes a load-bank test underway; energized generator equipment; the breaker
cubicle closed and latched; the vendor standing at the load bank. It does **not** establish that the
vendor must approach, open, operate, rack, or otherwise interact with the breaker cubicle during the
observed task. Knowing incident energy and an arc-flash boundary could be useful for planning future
interaction with the cubicle, but it does not materially change the safety decision for the task as
actually described. Remove the speculative claim that high incident energy would automatically make
the cable routing across an "approach path" a finding — the observation does not establish such a
path or an exposed person entering it.

### SEM-21 — A: MODIFY GAP
Keep OWED. Keep the missing fact: whether the coating/substrate being sanded contains lead and/or
hexavalent chromium. Keep `HAZARD_SEVERITY` or an equivalent existing decision type. Correct the
rationale: the answer can materially change exposure assessment, respiratory-protection, hygiene,
medical-surveillance and other regulatory/control obligations. **Remove the assertion that a modern
lead-free coating automatically makes "shrouded sanding with a disposable mask proportionate"** —
respirator adequacy cannot be established from that fact alone; it depends on the actual airborne
exposure and the respirator/protection program.

### SEM-22 — A: CHANGE TO NOT_OWED
The principal hazardous condition already exists: the belt is running, the drum guard is open, the
millwright is reaching to the take-up area. Whether the system can subsequently return automatically
to full speed may increase severity, but it does not change the basic required decision that
hazardous moving-machine exposure is occurring while the guard is open. **The authored distinction
that a slowly moving belt with a hand near the take-up is an acceptably "bounded" condition is not
established.**

### SEM-22 — B: APPROVE (with reasoning recorded)
Keep ABSENT. Visible grain dust and moving machinery are both present, but the row does not establish
a hot bearing, spark, static discharge or other ignition relationship between them. Do not infer a
combustible-dust interaction from co-location alone.

### SEM-23 — A: CHANGE TO NOT_OWED
The missing drain-routing fact affects environmental discharge/compliance, not the worker
safety/health decision represented by the row's stated hazard families. The worker's exposure to
antifouling residue exists regardless of whether the drain reaches an interceptor or the basin.
**Unless the frozen Expert evaluation explicitly includes environmental compliance as a formal
reasoning domain, do not use this as an M09 decision-critical safety clarification.**

### SEM-24 — B: MODIFY INTERACTION
Change **ABSENT -> PRESENT**. Participants: lockout/tagout + confined space. Use the existing valid
interaction kind that represents hazardous-energy isolation / stored or process-energy control, if
one exists without semantic distortion. The steam-header isolation state directly governs whether
entry into the boiler can occur safely. These hazards are not merely co-located: failure of the
isolation can admit hazardous steam/process energy into the occupied confined space. The isolation is
therefore part of the confined-space entry safety state.

> **Kind selection, provisional and flagged for confirmation at application time.** Of the frozen
> `EXPERT_INTERACTION_KINDS`, `LOTO_STORED_ENERGY` is the only member representing hazardous-energy
> isolation and stored/process energy, and it appears to fit without distortion — the steam header is
> precisely stored process energy that isolation must control. This has NOT been applied and is
> recorded as the author's reading of the reviewer's instruction, for the reviewer to confirm.

### SEM-25 — A: MODIFY GAP
Keep OWED. Define the missing fact as the employee's **representative** noise exposure during normal
sort-platform work, preferably 8-hour TWA/dose or equivalent exposure data rather than a generic
instantaneous "noise level." Keep `APPLICABILITY`. Correct the rationale: at or above an 8-hour TWA
of 85 dBA the OSHA hearing-conservation-program requirements are triggered. **Do not say that hearing
protection is categorically required for every employee merely because exposure reaches 85 dBA** — at
that level the program includes monitoring, audiometric provisions, training, availability of hearing
protectors and other requirements; mandatory use depends on the specific conditions in 1910.95.
Remove the subjective statement that this would automatically become "the most significant finding."

### SEM-26 — A: MODIFY GAP
Keep OWED. Keep the missing fact as the identity/properties of the material in the unlabelled squeeze
bottle, including relevant flammability information. **Change the affected-decision framing from
`HAZARD_EXISTENCE`** to `HAZARD_SEVERITY` / `REQUIRED_CONTROL` / `APPLICABILITY`, whichever exact
frozen vocabulary best represents it. Reason: a chemical exposure already exists because an
unidentified solvent is being used by hand; its identity does not decide whether the chemical family
exists, it decides what hazards it presents and what controls are required. Also remove the assertion
that a "high-flash" solvent automatically makes the practice ordinary/acceptable with general
ventilation, and the assertion that the fire hazard otherwise does not exist.

> **Decision selection, provisional and flagged.** `REQUIRED_CONTROL` appears to be the closest fit
> to the reviewer's own words ("what hazards it presents and what controls are required"). NOT
> applied; recorded for confirmation.

### SEM-26 — B: APPROVE (with reasoning recorded)
Keep ABSENT. A solvent/machine ignition interaction could become real depending on the missing
chemical identity, but the answer is currently unknown. **Do not assert a formal interaction
participant whose defining property has not yet been established.**

### SEM-27 — A: MODIFY GAP
Keep OWED **only if** the formal clarification truth is narrowed to whether the garment is actually
flame-resistant / thermally protective as required by the task-specific hazard assessment. The
observation establishes significant radiant-heat exposure at an open inspection door on operating
hot-process equipment. Remove the assertion that FR-rated coveralls alone make the PPE set
"proportionate" or complete, and any implication that untreated cotton necessarily determines the
entire corrective action. The garment rating can materially affect PPE adequacy, but other
thermal/hot-material controls may still be required.

### SEM-27 — C: MODIFY FAMILY PARTITION
- machine guarding: **PRESENT -> DEFENSIBLE.** Opening an inspection door on operating clinker
  equipment establishes a process/thermal exposure, but the observation does not establish accessible
  moving parts, a nip, point of operation, or other guarding exposure.
- chemical exposure: **PRESENT -> DEFENSIBLE.** Radiant heat and potential hot clinker ejection are
  thermal/process hazards; they do not establish a chemical-exposure family from the text given.
- fall protection: **FORBIDDEN -> DEFENSIBLE.** Sound walkway and handrail are evidence of a
  controlled walking surface, but they do not affirmatively rule out every possible fall exposure
  associated with positioning at the inspection door.

---

## A SECOND TAXONOMY LIMITATION, surfaced by the SEM-27 correction

Applied as instructed, SEM-27 has **no PRESENT hazard family at all** — both proxies are withdrawn —
while still carrying an owed clarification about garment thermal protection. That is contract-valid:
`decisionCriticalGaps` do not require a hazard candidate, and the row's `lifeCriticalHazardFamilies`
is already empty, so nothing breaks.

But it makes a limitation explicit. **The actual hazard on SEM-27 is thermal — radiant heat and hot
material ejection — and `ACCEPTED_EXPERT_TAXONOMY` has no family that can name it.** I had routed it
through `machine_guarding` and `chemical_exposure` as proxies, and the reviewer correctly rejected
both as unestablished by the text. The honest consequence is that the closed seven-family taxonomy
cannot represent a thermal/hot-process hazard.

This is structurally the same class of finding as SEM-09's interaction-vocabulary gap: **a real
hazard the frozen closed vocabulary cannot express.** Recorded, not repaired. No family was widened
and `toExpertFamily` was not touched.

## Running effect on counts, tracking only — nothing applied

Rows reviewed: **27 of 35**. 8 unreviewed (SEM-28 … SEM-35).
- Clarification-owed candidates: 24 authored across reviewed rows → **18 surviving** (withdrawn:
  SEM-06, SEM-20, SEM-22, SEM-23; retained with corrected framing: SEM-15, SEM-16, SEM-19, SEM-21,
  SEM-25, SEM-26, SEM-27).
- Interaction candidates countable toward the formal cohort: → **10** (SEM-18 and SEM-24 added;
  SEM-06, SEM-08, SEM-14 withdrawn; SEM-09 PRESENT but not countable pending vocabulary resolution).
- **Forbidden-family determinations: 6 authored, 6 overturned. Zero surviving.**

No count is final and none has been applied.
