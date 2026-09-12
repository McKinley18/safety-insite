# SEM-27 — final owner call, and its application

SEM-27 was the last unresolved semantic adjudication in the 35-row review. Batch 3 recorded
`A:MODIFY GAP  B:APPROVE  C:MODIFY FAMILY PARTITION`, but kept the clarification OWED only
*conditionally* — Batch 4 carried it as open item 1: *"OWED survives only if the truth is narrowed to
garment thermal protection. Resolve before counting it."* No replacement text had ever been drafted;
the re-presentation pass confirmed and reported that. The product owner has now supplied the
narrowing and ruled the row final.

## Final status as ruled

```
CLARIFICATION:        OWED — NARROWED
DECISION:             REQUIRED_CONTROL
INTERACTION:          ABSENT
PRESENT FAMILIES:     NONE
THERMAL TAXONOMY GAP: RECORDED
ROW:                  RETAIN
```

## A — MODIFY GAP, retain OWED

`SEM-27-G1` keeps its id and `affectedDecision: REQUIRED_CONTROL`. Its three texts were replaced
with the owner's, verbatim.

**Exact missing fact — now:**

> Whether the coveralls worn by the technician provide the flame-resistant and/or thermal protection
> required by the task-specific hazard assessment for opening the clinker-cooler inspection door
> while the cooler is operating.

**Was:** *"whether the cotton coveralls in use are flame-resistant rated, given radiant heat and
potential for hot material ejection at the inspection door"*

**Why it is not already in the observation — now:**

> The observation identifies the garments only as standard cotton coveralls and expressly states
> that their flame-resistant status could not be established. Whether those garments have the
> required protective rating or otherwise satisfy the task-specific thermal-protection requirement
> cannot be determined from the observed appearance alone.

**Was:** *"FR rating is established by garment labelling that the observer did not inspect; cotton
coveralls look the same either way."*

**Why decision-critical — now:**

> The observation already establishes significant radiant-heat exposure while an inspection door on
> operating hot-process equipment is open. The unresolved garment-protection fact does not determine
> whether that thermal hazard exists. It determines whether the clothing being worn satisfies the
> garment portion of the protective controls required for that task. If the coveralls provide the
> flame-resistant and/or thermal protection required by the task-specific hazard assessment, no
> additional garment control is established as necessary from this missing fact alone. If they do
> not provide the required protection, the garment portion of the control set is inadequate and
> appropriately protective clothing is required before performing the task under those conditions.
> This clarification does NOT establish that an FR-rated garment alone makes the overall PPE set or
> door-opening procedure adequate. Other controls for radiant heat, hot-material ejection,
> positioning, exposure duration, face/body protection, or the door-opening procedure may still be
> required independently.

**Was:** *"FR-rated coveralls make the observed PPE set proportionate to a hot-face inspection.
Untreated cotton exposed to a hot-material puff can ignite and continue burning, which changes the
required control from a face shield to a full FR garment set and a different door-opening
procedure."*

This satisfies both halves of the Batch 3 condition: the truth is narrowed to whether the garment
meets the task-specific thermal-protection requirement, and the two rejected assertions — that an
FR rating alone makes the PPE set "proportionate", and that untreated cotton determines the entire
corrective action — are gone.

## B — APPROVE ABSENT

The authored ABSENT interaction verdict is retained. `recordedInteractions` remains empty.

## C — MODIFY FAMILY PARTITION

The Batch 3 adjudication applied exactly:

| family | was | now |
| --- | --- | --- |
| machine guarding | PRESENT | **DEFENSIBLE** |
| chemical exposure | PRESENT | **DEFENSIBLE** |
| fall protection | FORBIDDEN | **DEFENSIBLE** |
| confined space | DEFENSIBLE | DEFENSIBLE |
| electrical | DEFENSIBLE | DEFENSIBLE |
| lockout/tagout | DEFENSIBLE | DEFENSIBLE |
| mobile equipment | DEFENSIBLE | DEFENSIBLE |

**SEM-27 now has no PRESENT accepted hazard family.** That is intentional and contract-valid:
`validateCohortRow` requires only that the three buckets be disjoint and covering, and
`lifeCriticalHazardFamilies` is empty so `LIFE_CRITICAL_NOT_PRESENT` cannot fire. No family was
manufactured to carry the thermal hazard.

Because `fall_protection` is no longer FORBIDDEN, its `forbiddenRationale` entry — the one that read
*"…with no elevated edge or opening exposure described"* — is removed with the classification.
SEM-27 now carries no forbidden rationale at all.

Verified after application:

```
present      []
defensible   ["chemical_exposure","confined_space","electrical","fall_protection",
              "lockout_tagout","machine_guarding","mobile_equipment"]
forbidden    []
negatedSafe  ["fall_protection"]
lifeCritical []
gaps         SEM-27-G1 / REQUIRED_CONTROL
interactions 0
```

### The negated / safe-state overlay — adjudicated, retained

`negatedOrSafeStateFamilies` retains `fall_protection`. This was flagged for the owner when the
partition was applied, because the ruling addressed only the three buckets, and it has now been
ruled on directly:

> Retain `negatedOrSafeStateFamilies: ["fall_protection"]`. Do NOT remove `fall_protection` from the
> overlay.
>
> The observation affirmatively states that the walkway is sound and has a handrail. That is valid
> evidence of a locally controlled/safe fall-related condition.
>
> The Batch 3 partition correction changed `fall_protection: FORBIDDEN -> DEFENSIBLE` because those
> facts do not affirmatively exclude every possible fall-protection exposure associated with
> positioning at the inspection door.
>
> Those conclusions are not contradictory. The family partition answers whether the broader hazard
> family is PRESENT, DEFENSIBLE, or FORBIDDEN. `negatedOrSafeStateFamilies` is an independent
> overlay preserving an expressly observed negated/safe/controlled state.
>
> Therefore `fall_protection = DEFENSIBLE` and `fall_protection ∈ negatedOrSafeStateFamilies` may
> coexist on SEM-27. No change is authorized to this field.

The two axes are independent: the partition classifies the **family**, the overlay records an
**expressly observed state**. Consistent with Batch 4 open item 3, which establishes the overlay as
not one of the three mutually exclusive buckets, and with SEM-30, SEM-31 and SEM-32, which already
carry a family as both PRESENT and negated/safe.

No file changed under this call — the field was already in the ruled state, so `manifestSha256`,
`truthKeySha256` and `provenanceSha256` are all unaffected by it.

## Authoring rationale

Replaced as ruled, because the prior text asserted a partition that no longer exists.

**Was:** *"A thermal exposure routed through the chemical/material family available in the closed
taxonomy. The fall family is defeated by an explicit statement rather than by silence."*

**Now:**

> A thermal/hot-process exposure is established by the observation, including significant radiant
> heat at an open inspection door on operating clinker equipment. The frozen accepted hazard-family
> taxonomy has no family that represents this hazard without distortion. Machine guarding, chemical
> exposure, and fall protection therefore remain non-PRESENT rather than being used as proxies. The
> decision-critical clarification is independently retained because the unresolved garment
> thermal-protection requirement can change REQUIRED_CONTROL without requiring a PRESENT
> hazard-family candidate.

## Taxonomy limitation — retained and reported, not repaired

The hazard SEM-27 actually establishes is thermal/hot-process: significant radiant heat, and
potential hot-material ejection from operating clinker equipment. `ACCEPTED_EXPERT_TAXONOMY` has no
family that represents it without semantic distortion. It was **not** routed through
`chemical_exposure` or `machine_guarding`, no family was created or widened, `toExpertFamily` was not
touched, and the frozen taxonomy was not repaired. The limitation is now stated in the row's own
authoring rationale as well as in `HUMAN-REVIEW-VERDICTS-BATCH-3.md:175` and Batch 4 open item 8,
where it stands alongside SEM-09's interaction-vocabulary gap as the second of three recorded
frozen-vocabulary limitations.

## Counting disposition, as ruled by the owner

```
27 authored OWED
 5 withdrawn
22 surviving OWED

Total countable clarification cases  25
Frozen minimum                       20
Margin                               +5
```

This is the reviewed accounting. It is distinct from the validator's mechanical
`clarificationOwedCandidates`, which counts authored candidates in the fixture and remains **27**
because SEM-27 retains its gap.

## Hash surface

The observation was not touched, so `manifestSha256` is byte-identical. Truth changed — the
partition, the gap description and the authoring rationale are all inputs to the truth key — so
`truthKeySha256` is re-sealed for the first time in this review. `provenanceSha256` is re-sealed
again because the gap packet and the forbidden rationale both moved.

| Field | Before this call | After |
| --- | --- | --- |
| `manifestSha256` | `6a2c564c81c79acb5c267963f0b12483684a2a5ce8ad0173c9af663332b0dfdf` | **unchanged** |
| `truthKeySha256` | `1628f2e4a338a4a96b7eb4ee11acb4ac97963cae495ff5874913eed63d1b50f0` | `e68757426012e36b5098fa6defdd41bfcce4e64ec375b526ecda7c5f95f978b5` |
| `provenanceSha256` | `7489d826d2c8ba171e5c2a548e9b2d94ffe45eadff6220327ccc743ad3ba60dd` | `d573798f052509a9adbe2b4d84fcd488b5684c31fbf80245f4a647d7f3e64a99` |
| corpus module sha256 | `b8d4d2db71b111141c3477582d8f0da1d8abb7837ae37fc2f3bdfa2105f6a936` | `bd9b6a129d0cd0e038c07ca5a7c68a60157d43299d6790372c8db0a825b36499` |
| `corpus/SEAL.json` sha256 | `69fb97c0547fd799c6a9452e9e3f23261948974c2b63b8e046e06a9eb86d067d` | `fa84c492832c9f8aede9c93024461ba7a8cce3a1fe264fc99e61fb05782cb28b` |

`truthKeySha256` at the original seal was `1628f2e4…`; open item 7b left it untouched, and this call
is the change that moves it.

Two seal counters moved as a direct consequence of SEM-27 losing both PRESENT families:

| Seal field | Before | After |
| --- | --- | --- |
| `interactionNegativeControls` | 12 | **11** |
| `rowsCarryingForbiddenFamily` | 11 | **10** |

`clarificationOwedCandidates` (27), `clarificationNotOwedControls` (8),
`crossHazardInteractionCandidates` (14) and `rowsCarryingBoth` (10) are unchanged.

## Verification executed

`npx ts-node scripts/validate-semantic-augmentation.ts` — **37 passed, 0 failed**, exit 0.
Proof: `proofs/semantic-augmentation-sem27-adjudication-reseal.txt`.

```
TRUTH_LEAK = 0 across 105 constructed requests
PROVIDER_INVOCATION_COUNT  = 0
RESERVED_MATERIAL_OPENED   = FALSE
FORMAL_COHORT_SPENT        = FALSE
P4_PRESPEND_AUTHORIZATION  = FALSE
```

B.4 (all 35 rows pass the frozen row contract) and C.4 (every family partition disjoint and
covering) both pass with SEM-27 carrying no PRESENT family, which is the mechanical confirmation
that the empty-present outcome is contract-valid.

Earlier proofs are preserved unmodified: `proofs/semantic-augmentation.txt` (original seal) and
`proofs/semantic-augmentation-open-item-7b-reseal.txt` (post-7b).

## Scope — what was not done

Only SEM-27 was applied. `SEMANTIC-REVIEW-PACKET.md` was **not** regenerated (still
`29ec877c…`), the frozen policy was not modified, and the validator was not modified (still
`f9a90a2e…`). Open items **2, 3, 4, 5, 6, 7, 7a and 8** from `HUMAN-REVIEW-VERDICTS-BATCH-4.md`
remain unapplied; open item **1 is now resolved**. The 7b adjudication was not disturbed. The corpus
remains `CANDIDATE — SEALED, AWAITING INDEPENDENT PRODUCT-OWNER SAFETY REVIEW`, and
`FORMAL_COHORT_SPENT = FALSE`.
