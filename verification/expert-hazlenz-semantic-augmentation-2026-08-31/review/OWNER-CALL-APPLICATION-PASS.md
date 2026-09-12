# The application pass — every recorded adjudication applied

One controlled pass, applying only decisions already recorded in
`HUMAN-REVIEW-VERDICTS-BATCH-1..4.md`, `OWNER-CALL-OPEN-ITEM-7B.md` and `OWNER-CALL-SEM-27.md`.
No verdict was reinterpreted, redesigned or expanded. Observations were not touched.

**Terminal state: BLOCKED on one named condition** — the validator's F.1/F.2 count assertions
encode the *pre-review candidate-authoring targets* and cannot pass against a post-review corpus.
Full statement at the end of this file. Everything else passes.

---

## 1. Row-by-row application

### SEM-04 — B: MODIFY INTERACTION *(Batch 1)*

PRESENT, participants and kind retained. The two rejected assertions struck.

- `relationship` **now:** "Scissor-lift and platform stability directly governs the elevated-worker
  fall and tip-over exposure. The lanyard is clipped to the lift rail, and the observation does not
  establish that the rail is an acceptable anchorage -- that determination can depend on the lift
  design and manufacturer requirements -- so a stability problem in the lift is an elevated-work
  exposure problem rather than a separate equipment problem."
  **was:** "The anchorage is the machine. The fall-protection system is only as sound as the
  platform it is attached to…"
- `independentLoss` **now:** "Assessed apart, the fall-protection arrangement is recorded only as
  harness on and lanyard clipped, and the lift placement reads as a minor siting issue. Together
  they establish that the platform carrying both the worker and the lanyard attachment is standing
  on a plate of unknown rating, so platform stability governs the elevated-work exposure."
  **was:** "…the fall protection **looks correct** … being clipped to an unstable anchorage is
  **worse than not being clipped at all**."
- `authoringRationale` **now:** "An interaction where the stability of the platform governs the
  exposure the observed control is meant to address…" **was:** "An interaction where the
  **correct-looking control** is the thing at risk…" — struck because it restates the same rejected
  "looks correct" assertion inside the truth key.

### SEM-06 — A: CHANGE TO NOT_OWED · B: CHANGE TO ABSENT *(Batch 1)*

`SEM-06-G1` removed. `MOBILE_EQUIPMENT_PEDESTRIAN` interaction removed. Partition unchanged
(APPROVE). `authoringRationale` replaced — it had asserted the withdrawn interaction ("the escape
route from one hazard leads into the other") — with the reviewer's own reasoning: co-occurrence
because the observation does not establish the shared footprint, and the reverse alarm does not
change the principal safety decision.

### SEM-08 — B: CHANGE TO ABSENT · C: MODIFY PARTITION *(Batch 2, superseding Batch 1 B)*

`CONFINED_SPACE_ATMOSPHERIC` interaction removed. `chemical_exposure` PRESENT → DEFENSIBLE;
`confined_space` PRESENT retained. Gap `SEM-08-G1` preserved (A: APPROVE).
`authoringRationale` extended to state why no interaction is recorded.

> **Contract-forced consequence, applied and flagged.** `chemical_exposure` was also in
> `lifeCriticalHazardFamilies`. `validateCohortRow` raises `LIFE_CRITICAL_NOT_PRESENT` for any
> life-critical family that is not PRESENT, so leaving it would have made the row contract-invalid.
> It was removed; `lifeCritical` is now `['confined_space']`. Batch 2 said "all others unchanged",
> which addressed the three partition buckets; this overlay change is forced by the contract, not
> chosen. **Reported rather than applied silently.**

### SEM-09 — B: vocabulary gap · C: MODIFY PARTITION *(Batch 1)*

`machine_guarding` FORBIDDEN → DEFENSIBLE; the `forbidden` entry removed with the classification.
`negatedOrSafeStateFamilies` retains `machine_guarding` — per the SEM-27 overlay ruling, the overlay
is an independent axis and a partition move implies nothing about it.
**No interaction recorded**, exactly as reviewed: the reviewer holds the semantic verdict is
PRESENT (chemical exposure + electrical, ignition of a flammable solvent atmosphere) but directed
that it not be forced into an inaccurate kind and not be counted. No proxy kind, no `OTHER`.

### SEM-13 — B: MODIFY INTERACTION *(Batch 2)*

PRESENT, participants and `FALL_EXPOSURE_ANCHORAGE` retained.

- `relationship` **now** states that the lift is both platform and the structure carrying the
  manufacturer-designated anchorage, and that outriggers, slab and attendant "control the platform
  and tip-over exposure rather than the anchor's certification itself."
  **was:** "…which is what **makes the anchor trustworthy**."
- `independentLoss` **now:** "Reading the harness and anchor alone would describe only part of the
  arrangement, because the platform condition governs the elevated-work exposure independently of
  the anchor." **was:** "Reading the harness alone would **credit the wrong thing**…"

### SEM-14 — B: CHANGE TO ABSENT · C: MODIFY PARTITION *(Batch 2)*

`CHEMICAL_PPE_VENTILATION` interaction removed. `confined_space` PRESENT → DEFENSIBLE;
`machine_guarding` FORBIDDEN → DEFENSIBLE (entry removed); `chemical_exposure` PRESENT retained.
Overlay `['chemical_exposure','machine_guarding']` retained. `authoringRationale` replaced — it had
called the row "a correctly controlled chemical-ventilation **interaction**" — with the reviewer's
reasoning that enclosure or ventilation dependence alone does not satisfy the confined-space
classification.

### SEM-15 — A: MODIFY GAP · C: MODIFY PARTITION *(Batch 2)*

OWED, missing fact and `APPLICABILITY` all retained. `alternativeOutcomes` rewritten to the
reviewer's substance: low outlet pressure may satisfy the general compressed-air requirement, but
silica-specific controls independently restrict compressed-air cleaning unless the dust-capture and
feasibility conditions are met, so the answer "does not by itself decide whether the overall
silica-cleaning method is acceptable." The rejected implication that ≤30 psi makes the practice
permissible is gone. `machine_guarding` FORBIDDEN → DEFENSIBLE. `authoringRationale` amended: the
guard being fitted is "recorded as an observed controlled condition rather than as affirmative
exclusion of the machine-guarding family" (it had said the guard was "affirmatively defeated").

### SEM-16 — A: MODIFY GAP · C: MODIFY PARTITION *(Batch 2)*

OWED and `HAZARD_SEVERITY` retained. Missing fact redefined as ruled: "whether the proportioner is
actually delivering the sanitiser at its intended labelled use dilution". `alternativeOutcomes`
rewritten — "a materially higher-than-intended concentration can change the exposure severity and
the required PPE and contact response; the exact consequence depends on the sanitiser chemistry,
which this observation does not establish." The unsupported "corrosive spray" assertion is gone.
`machine_guarding` FORBIDDEN → DEFENSIBLE.

### SEM-18 — B: ABSENT → PRESENT · C: MODIFY PARTITION *(Batch 2)*

Interaction added: kind `LOTO_STORED_ENERGY`, participants `machine_guarding` + `lockout_tagout`,
both PRESENT on the row. Relationship and independent-loss written from the reviewer's own text
(machine access creates the exposure whose acceptability is governed by the energy-isolation state;
isolated versus merely stopped changes the outcome). `fall_protection` FORBIDDEN → DEFENSIBLE — the
struck rationale was the one the reviewer identified as having *added* the fact that the workers
never lean past the rail. Overlay `['fall_protection']` retained.

### SEM-19 — A: MODIFY GAP *(Batch 3)*

OWED and `REGULATORY_INTERPRETATION` retained. Missing fact replaced with the two linked regulatory
facts as ruled: the exact identity and applicable concentration sufficient to determine whether the
dye is covered by 29 CFR 1910.1003, and if covered whether the weighing is conducted within the
required regulated-area and control regime. `whyAbsent` rewritten to match the new fact.
`alternativeOutcomes` rewritten: in scope, the standard requires a regulated area and
operation-specific controls (restricted access, continuous local exhaust, protective clothing,
respiratory protection, hygiene/decontamination) and **the observed operation must itself satisfy
them**; out of scope, those obligations do not attach merely because the product is described
generically. **"written exposure control plan" and "With a plan in place … the finding is nil" are
both gone.** `authoringRationale` corrected — it had said the gap was "about whether the governing
programme exists at all."

> The observation still contains the phrase "written exposure control plan", because it is the
> observer's own report of what they could not establish. Observations are manifest material and
> were not touched.

### SEM-20 — A: CHANGE TO NOT_OWED *(Batch 3)*

`SEM-20-G1` removed. `authoringRationale` replaced with the reviewer's reasoning: the observation
does not establish that the vendor must approach, open, operate or rack the cubicle, so the
incident-energy question does not materially change the decision for the task as described. The
speculative "approach path" claim went with the gap.

### SEM-21 — A: MODIFY GAP *(Batch 3)*

OWED, missing fact and `HAZARD_SEVERITY` retained. `alternativeOutcomes` rewritten: the answer can
materially change exposure assessment and respiratory-protection, hygiene, medical-surveillance and
other obligations, and **respirator adequacy cannot be established from the coating composition
alone**. The rejected "shrouded sanding with a disposable mask is proportionate" assertion is gone.

### SEM-22 — A: CHANGE TO NOT_OWED · B: APPROVE ABSENT *(Batch 3)*

`SEM-22-G1` removed, taking the rejected "bounded" claim with it. `authoringRationale` extended with
the reviewer's reasoning: hazardous moving-machine exposure is already occurring with the guard open,
so restart behaviour does not change the required decision. The approved ABSENT reasoning is
retained unchanged.

### SEM-23 — A: CHANGE TO NOT_OWED *(Batch 3)*

`SEM-23-G1` removed. `authoringRationale` replaced with the reviewer's reasoning: the drain-routing
fact affects environmental discharge and compliance rather than the worker safety and health
decision this row's families represent, and the exposure exists regardless of where the drain
discharges.

### SEM-24 — B: ABSENT → PRESENT, kind CONFIRMED *(Batch 3 + Batch 4)*

Interaction added: kind **`LOTO_STORED_ENERGY`** — applied as confirmed, not provisional —
participants `lockout_tagout` + `confined_space`, both PRESENT. Relationship taken from the
reviewer: the steam-header isolation state directly governs whether entry can occur safely, and
isolation failure can admit hazardous steam and process energy into the occupied confined space.

### SEM-25 — A: MODIFY GAP *(Batch 3)*

OWED and `APPLICABILITY` retained. Missing fact redefined as the employee's **representative** noise
exposure, "preferably as an 8-hour time-weighted average or dose rather than a generic instantaneous
noise level". `alternativeOutcomes` rewritten: at or above an 8-hour TWA of 85 dBA the
hearing-conservation-programme requirements are triggered — monitoring, audiometric provisions,
training, availability of protectors — and **mandatory use depends on the specific conditions in
1910.95** rather than following automatically. The subjective "most significant finding" is gone.

### SEM-26 — A: MODIFY GAP, decision CONFIRMED *(Batch 3 + Batch 4)*

OWED and the missing fact retained as ruled. `affectedDecision` **`HAZARD_EXISTENCE` →
`REQUIRED_CONTROL`** — applied as confirmed, not provisional. `alternativeOutcomes` rewritten to
state that the identity "does not decide whether the chemical family exists … it decides what
hazards it presents and what controls are required." The "high-flash … is ordinary practice" and
"fire hazard that does not otherwise exist" assertions are gone.

### SEM-27 — applied previously, see `OWNER-CALL-SEM-27.md`

Not re-touched in this pass. Verified in place: zero PRESENT families, `fall_protection` DEFENSIBLE,
`negatedOrSafeStateFamilies` still `["fall_protection"]`, gap OWED on `REQUIRED_CONTROL`.

### SEM-28 — A: CHANGE TO NOT_OWED · C: MODIFY PARTITION *(Batch 4, open item 3)*

`SEM-28-G1` removed, taking the hypothetical-condition substitution with it. `chemical_exposure`
retained PRESENT and **added to `negatedOrSafeStateFamilies`** (previously empty) to carry the
"PRESENT (recorded safe/controlled)" classification. `authoringRationale` replaced with the
reviewer's own list of observed controls and the finding that no release or oxygen-enriched
atmosphere is established.

### SEM-29 — A: MODIFY GAP · B: rationale · C: MODIFY PARTITION *(Batch 4, open items 4 and 5)*

`machine_guarding` PRESENT → DEFENSIBLE; `mobile_equipment` PRESENT and life-critical retained.
`affectedDecision` **`HAZARD_SEVERITY` → `REQUIRED_CONTROL`**. Missing fact kept substantially as
authored, as ruled. `alternativeOutcomes` rewritten to the reviewer's reasoning: inspection status
does not materially change physical severity; what changes is whether the lifting equipment may
remain in service. `authoringRationale` corrected accordingly and now states that only mobile
equipment remains PRESENT, so no interaction is established.

> **SEM-29 B discharged structurally.** The sentence the reviewer directed be replaced — the one
> asserting that both machine guarding and mobile equipment are PRESENT — is *generated* by
> `emit-semantic-review-packet.ts` from the row's own partition, not stored anywhere in the fixture.
> The partition correction plus packet regeneration discharges it; the post-review packet now reads
> "this row has one hazard present (mobile equipment)".

### SEM-30 — A: MODIFY GAP · C: FINAL OWNER CALL *(Batch 4, open items 6 and 7a)*

Missing fact replaced verbatim as ruled: "whether the ammonia detector heads are currently within
their applicable calibration or functional-verification interval and are considered reliable for
service". `EXPOSURE` unchanged. `alternativeOutcomes` rewritten to the reviewer's reasoning that a
date alone is insufficient unless evaluated against the applicable interval.
`forbiddenRationale.machine_guarding` replaced with the owner's exact text; classification remains
FORBIDDEN.

### SEM-33 — C: FINAL OWNER CALL *(Batch 4, open item 7a)*

`forbiddenRationale.chemical_exposure` replaced with the owner's exact text; classification remains
FORBIDDEN.

### SEM-31, SEM-32, SEM-34 — applied previously under open item 7b

Not re-touched. See `OWNER-CALL-OPEN-ITEM-7B.md`.

### SEM-35 — B: MODIFY INTERACTION *(Batch 4, open items 2 and 8)*

`FALL_EXPOSURE_ANCHORAGE` interaction **removed entirely**. The `interactionKind` field is
enum-constrained and required, so there is no contract-valid way to record a PRESENT interaction
without naming a kind; removing the entry was the alternative to storing a distorted one. No frozen
member covers vehicle movement / platform-position dependency / drive-away effects on fall
protection. `FALL_EXPOSURE_ANCHORAGE`, `MOBILE_EQUIPMENT_PEDESTRIAN`, `OTHER` and any invented kind
were all excluded as directed.

**No exact replacement rationale had been authorized, so the minimum factual correction was made.
Reported verbatim rather than broadened silently:**

- **Was:** "Authored to restore the interaction that SEM-09 cannot record. It is a distinct
  mechanism from SEM-04 and SEM-13 -- there the platform could become unstable, **here the anchorage
  can drive away** -- and the pairing is established by the text rather than by the pattern."
- **Now:** "Authored to restore the interaction that SEM-09 cannot record. The relationship the
  observation establishes is a fall-protection system whose effectiveness depends on the vehicle
  remaining in position: the gangway and cage span from a fixed rack onto a trailer that can move
  under power, and no anchorage is described. The frozen interaction vocabulary has no member naming
  vehicle movement, platform-position dependency or drive-away effects on fall protection, so no
  interaction is recorded rather than forcing a kind that would distort the mechanism. Recorded as a
  vocabulary gap, not repaired."

The rejected anchorage characterization is gone and the sentence "no anchorage is described" now
states the reviewer's own finding.

### Manifest order description *(open item 7)*

`backend/scripts/validate-semantic-augmentation.ts:231` **was:** `'SEM-01 .. SEM-34, authored order,
immutable after seal'`. **Now:** `'SEM-01 .. SEM-30, SEM-35, SEM-31 .. SEM-34 -- the actual sealed
array order, with SEM-35 at index 30. Numeric identifier order is NOT array order. Immutable after
seal.'` The emitted `corpus/SEAL.json` `"order"` field carries the corrected string. Both known
locations corrected. **The fixture was not reordered** — array order is unchanged and verified
below.

---

## 2. Mechanical verification, executed

```
35 unique row ids                : true
array order SEM-01..30,35,31..34 : true
SEM-35 array index               : 30
SEM-27 PRESENT families          : []          (zero: true)
SEM-27 fall_protection DEFENSIBLE: true
SEM-27 negatedOrSafe has fall_p  : true
SEM-24 interaction kind          : ["LOTO_STORED_ENERGY"]
SEM-26 affectedDecision          : ["REQUIRED_CONTROL"]
SEM-09 recordedInteractions      : 0
SEM-35 recordedInteractions      : 0
interaction kinds in corpus      : CHEMICAL_PPE_VENTILATION, CONFINED_SPACE_ATMOSPHERIC,
                                   ELECTRICAL_WET_ENVIRONMENT, FALL_EXPOSURE_ANCHORAGE,
                                   LOTO_STORED_ENERGY
OTHER used anywhere              : false
```

No unauthorized PRESENT-family proxy was introduced: SEM-27 has none, SEM-08 lost
`chemical_exposure`, SEM-14 lost `confined_space`, SEM-29 lost `machine_guarding`, and no family was
added to any row.

### Surviving forbidden determinations — 9, all resting on expressly asserted facts

Re-audited against the owner's test after application. **No further absence-of-description
rationale exists**, so the stop condition on that point was not triggered.

| row · family | basis |
|---|---|
| SEM-30 · machine guarding | guards affirmatively described as fitted *(tightened)* |
| SEM-31 · electrical | chargers affirmatively described running with leads seated *(7b)* |
| SEM-31 · mobile equipment | no trucks out of bays; text expressly states no work in progress *(7b)* |
| SEM-32 · chemical exposure | coolant concentration affirmatively checked and logged *(7b)* |
| SEM-32 · lockout/tagout | loading affirmatively described at the door, spindle stopped *(7b)* |
| SEM-33 · chemical exposure | hoods and storage affirmatively described *(tightened)* |
| SEM-34 · fall protection | kick stool affirmatively described as stowed *(7b)* |
| SEM-34 · machine guarding | "the room contains no process equipment" — clean |
| SEM-34 · chemical exposure | "no chemical storage of any kind" — clean |

---

## 3. Counts — mechanical and reviewed, kept separate

**Mechanical validator counters** (properties of the applied fixture):

| counter | value |
|---|---|
| rows | 35 |
| rows carrying a gap | 22 |
| rows carrying no gap (NOT_OWED controls) | 13 |
| rows carrying an interaction | 12 |
| interaction-negative controls (2+ PRESENT, no interaction) | 10 |
| rows carrying both a gap and an interaction | 9 |
| rows carrying a forbidden family | 5 (9 determinations) |

**Human-reviewed accounting** (the owner's, unchanged by anything measured here):

| clarification | | interaction | |
|---|---|---|---|
| authored OWED | 27 | authored PRESENT | 14 |
| withdrawn | 5 | withdrawn | 3 |
| **surviving OWED** | **22** | promoted | 2 |
| independently authorized | 3 | blocked by vocabulary gaps | 2 |
| **total countable** | **25** | **countable** | **12** |
| frozen minimum | 20 | independently authorized | 5 |
| **margin** | **+5** | **total countable** | **17** |
| | | frozen minimum | 10 |
| | | **margin** | **+7** |

The validator's own section I computes `3 + 22 = 25, margin over 20: 5` and `5 + 12 = 17, margin
over 10: 7` from the applied fixture — arriving independently at the owner's figures.

---

## 4. Taxonomy and vocabulary limitations — carried forward, none repaired

1. **SEM-09 — `ACCEPTED_INTERACTION_TAXONOMY` gap.** Flammable solvent atmosphere plus a competent
   ignition source with ventilation locked out is a real interaction. No frozen kind names
   flammable-atmosphere ignition; `OTHER` is unusable because the token occurs in
   `EXPERT_SYSTEM_PROMPT` as ordinary English and trips the substring truth-leak guard. Left
   unrecorded and uncounted.
2. **SEM-27 — `ACCEPTED_EXPERT_TAXONOMY` lacks a thermal/hot-process family.** The hazard is radiant
   heat and potential hot-material ejection. Not routed through `chemical_exposure` or
   `machine_guarding`; no family created or widened; `toExpertFamily` untouched. The row
   intentionally has no PRESENT family and keeps its OWED clarification.
3. **SEM-35 — `ACCEPTED_INTERACTION_TAXONOMY` lacks a vehicle-movement / platform-position-dependency
   / drive-away kind.** Interaction removed rather than distorted. **The corpus has now lost two
   interaction counts to one frozen-vocabulary defect, and the second loss was the repair attempt
   for the first.**

---

## 5. Hashes

| artifact | before this pass | after | why |
|---|---|---|---|
| `manifestSha256` | `6a2c564c81c79acb5c267963f0b12483684a2a5ce8ad0173c9af663332b0dfdf` | **unchanged** | manifest is `{rowId, observation}`; no observation was touched and no row reordered |
| `truthKeySha256` | `e68757426012e36b5098fa6defdd41bfcce4e64ec375b526ecda7c5f95f978b5` | `2e4377ead15a8c349bdecb389371015185b3023bab706768d32356d333ce9812` | partitions, gaps, decisions, interactions and authoring rationales all changed |
| `provenanceSha256` | `d573798f052509a9adbe2b4d84fcd488b5684c31fbf80245f4a647d7f3e64a99` | `16b76f48e77dc93933e595da50803d0c2de8ba2a69fe62b94b80b5ea62ff13ac` | gap packets, interaction packets and two forbidden rationales changed |
| corpus module | `bd9b6a129d0cd0e038c07ca5a7c68a60157d43299d6790372c8db0a825b36499` | `a6c9a36f1d85db5fd25819f5fd1e764055cc486d85f226aa6c7a26388568a3fa` | the applied edits |
| `corpus/SEAL.json` | `fa84c492832c9f8aede9c93024461ba7a8cce3a1fe264fc99e61fb05782cb28b` | `68c1e17536b4dc843c75d63dea5b0825a24eb9338dbcb3e2f4aa42cec8a7c3e6` | re-emitted: two hashes, the counters, and the corrected order string |
| validator script | `f9a90a2ea1739b167d606d3a7aa51e21867750e2410ca6f0326591321bf53dd7` | `ad98ca709466eb77a6bca5b615ec63ee5ce201d2fc6b39772882e33bafededcf` | **only** the manifest-order description string; no assertion, threshold or semantic changed |
| original packet | `29ec877ccf5fe2277b71a2aa09ee425d5d8d77c4cdbc893eaf9d9a53acba9c59` | **unchanged** | preserved as the document the four verdict batches were written against |
| post-review packet | — | `3da036a159ee94038cc5f94266ed63b087aea345fa2b87594f395c24052ad8d6` | new artifact |

`manifestSha256` holding byte-identical across a pass that rewrote nine partitions, five gaps and
eleven rationales is the mechanical proof that no observation was edited and the array was not
reordered.

---

## 6. Validation — and the one blocking condition

`npx ts-node scripts/validate-semantic-augmentation.ts` → **35 passed, 2 failed**, exit 1.
Proof: `proofs/semantic-augmentation-post-human-review-application.txt`.

```
TRUTH_LEAK = 0 across 105 constructed requests
PROVIDER_INVOCATION_COUNT  = 0
RESERVED_MATERIAL_OPENED   = FALSE
FORMAL_COHORT_SPENT        = FALSE
P4_PRESPEND_AUTHORIZATION  = FALSE
```

Every structural, vocabulary, contract, packet-quality, anti-contamination and canonical-path check
passes — A.1–A.4, B.1–B.7, C.1–C.4, D.1–D.6, E.1–E.6, F.3, F.4, G.1, G.2, H.1–H.4.

**The two failures are F.1 and F.2, and they are the same finding:**

```
FAIL  F.1 CLARIFICATION_OWED candidates 22 >= target 26
FAIL  F.2 CROSS_HAZARD_INTERACTION candidates 12 >= target 14
```

These assert `CANDIDATE_TARGETS` from the frozen construction policy — **26 and 14**. That policy
defines them explicitly:

> *"Candidate-authoring targets carry margin ABOVE the frozen minimums so that independent review
> can reject determinations without immediately re-blocking the cohort. THESE ARE NOT THE FROZEN
> MINIMUMS AND DO NOT CHANGE THEM."*

They measure a property of the **pre-review authoring exercise** — did the author produce enough
candidates to absorb rejections. The review then rejected 5 clarifications and 4 interactions,
exactly the margin those targets existed to provide. A post-review corpus therefore **cannot**
satisfy F.1 or F.2; the assertions are arithmetically unsatisfiable once any material is withdrawn.

**The frozen minimums are met with margin: 25 against 20 (+5), and 17 against 10 (+7).** Nothing
fell below a frozen minimum. Section I of the validator's own output states both figures.

Making these two checks pass would require editing the validator's assertions or the frozen policy's
targets — which the standing instructions forbid, and which would amount to weakening a verification
gate to obtain a green result. **Neither was done.** The validator retains every assertion, threshold
and semantic it had; the only edit to that file is the manifest-order description string.

**This is the named blocking condition. It requires a product-owner decision** — the validator was
built to seal a pre-review candidate corpus and has no post-review mode, so the question is what
verification surface should govern the reviewed corpus. That decision is the owner's, and no
resolution was improvised.
