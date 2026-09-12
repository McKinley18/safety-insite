# Open item 7b — final owner call, and its application

Batch 4 carried open item 7b unresolved: five surviving `forbiddenRationale` texts still argued a
FORBIDDEN classification partly from what the observation did **not** describe. Batch 4 recorded that
**none of them could be tightened on the author's own initiative**, because a rationale is the
reviewable basis of an adjudicated classification. The product owner has now ruled on all five.

## Disposition

**Approved: rationale tightening for all five. Every existing FORBIDDEN classification is retained.**
Only reasoning that treats absence-of-description as affirmative evidence is removed.
`truth.forbiddenHazardFamilies` is unchanged on every row.

## The five replacements, as ruled

### SEM-31 · `electrical` — retained FORBIDDEN

- **Now:** "Chargers are affirmatively described as running normally with their leads seated."
- **Removed:** "and no damaged cord, exposed conductor or open enclosure is described."
- **Owner's reason:** the first clause is an expressly observed operating condition; the removed
  clause infers additional safe conditions from silence.

### SEM-31 · `mobile_equipment` — retained FORBIDDEN

- **Now:** "No trucks were on charge out of their bays, and the observation expressly states that no
  work was in progress in the room."
- **Removed:** "so no travel, lift or pedestrian interaction is described."
- **Owner's reason:** the replacement relies only on facts expressly stated in the observation; the
  trailing clause is unnecessary inference from absence-of-description.

### SEM-32 · `chemical_exposure` — retained FORBIDDEN

- **Now:** "Coolant concentration was affirmatively described as checked and logged that morning at
  the specified ratio."
- **Removed:** "and no mist, dermal contact or unlabelled product is described."
- **Owner's reason:** the calibration/control fact is expressly observed; the removed conditions are
  not expressly negated by the observation.

### SEM-32 · `lockout_tagout` — retained FORBIDDEN

- **Now:** "Loading and unloading are affirmatively described as occurring only at the door with the
  spindle stopped under a proven interlock."
- **Removed:** "and no maintenance task requiring energy isolation is described."
- **Owner's reason:** the observed task and energy state are expressly defined; the removed clause
  relies on silence concerning other possible tasks.

### SEM-34 · `fall_protection` — retained FORBIDDEN

- **Now:** "The kick stool is affirmatively described as stowed under the plan chest."
- **Removed:** "and no climbing, elevated work or unprotected edge is described."
- **Owner's reason:** the stool's stowed state is expressly observed; the removed clause converts
  silence about other fall exposures into affirmative evidence.

SEM-34 `machine_guarding` and SEM-34 `chemical_exposure` needed no change and were not touched.

## Corpus rule recorded by the owner — FORBIDDEN evidence

A FORBIDDEN determination **may** rely on an affirmative statement in the observation, **including an
expressly stated negative fact**. Valid affirmative evidence:

- "The room contains no process equipment."
- "No chemical storage of any kind."
- "No work was in progress at the time of inspection."
- "The kick stool sat under the plan chest, stowed."

A FORBIDDEN determination **may not** rely on the reviewer's inference that, because a condition was
not mentioned, it was absent. Invalid as affirmative evidence:

- "No damaged cord … is described."
- "No mist … is described."
- "No maintenance task … is described."

The distinction is therefore **EXPRESSLY ASSERTED BY THE OBSERVATION** versus **INFERRED FROM THE
OBSERVATION'S SILENCE**. It is *not* positive wording versus negative wording.

This rule is recorded here as an adjudication. The frozen construction policy
(`policy/POLICY-FREEZE.txt`) was **not** modified.

## Application effect and hash surface

Applied in `backend/src/safescope-v2/expert-hazlenz/fixtures/semantic-augmentation-v1.ts`, in the
`forbidden` map of specs SEM-31, SEM-32 and SEM-34 only.

`forbiddenRationale` is an input to the **provenance** hash alone — `manifestSha256` is computed over
`{rowId, observation}` and `truthKeySha256` over `{rowId, truth}`, and neither carries the rationale
text. Verdicts, family classifications and `truth.forbiddenHazardFamilies` are unchanged, so those
two hashes are byte-identical across the change and only `provenanceSha256` is re-sealed.

| Field | Before | After |
| --- | --- | --- |
| `manifestSha256` | `6a2c564c81c79acb5c267963f0b12483684a2a5ce8ad0173c9af663332b0dfdf` | unchanged |
| `truthKeySha256` | `1628f2e4a338a4a96b7eb4ee11acb4ac97963cae495ff5874913eed63d1b50f0` | unchanged |
| `provenanceSha256` | `272cf02b369821524200615fb6703628adac4361e388245a80393caeae609574` | `7489d826d2c8ba171e5c2a548e9b2d94ffe45eadff6220327ccc743ad3ba60dd` |
| corpus module sha256 | `ea430ff30afac83dfab828b0162948513afa44cbd2e69349a683d071588cd7c6` | `b8d4d2db71b111141c3477582d8f0da1d8abb7837ae37fc2f3bdfa2105f6a936` |
| `corpus/SEAL.json` sha256 | `211d2ee94fb25e9664d278fdeed8b56ecc8a179fc68ff30283ce3a241d3ca7d3` | `69fb97c0547fd799c6a9452e9e3f23261948974c2b63b8e046e06a9eb86d067d` |

Re-seal proof: `proofs/semantic-augmentation-open-item-7b-reseal.txt` — 37 passed, 0 failed,
`PROVIDER_INVOCATION_COUNT = 0`, `RESERVED_MATERIAL_OPENED = FALSE`, `FORMAL_COHORT_SPENT = FALSE`,
`P4_PRESPEND_AUTHORIZATION = FALSE`. The original seal proof `proofs/semantic-augmentation.txt` is
preserved unmodified as evidence of the pre-7b state.

`review/SEMANTIC-REVIEW-PACKET.md` was deliberately **not** regenerated. It is the document the
owner's four verdict batches were written against, and regenerating it now — while open items 1–7,
7a and 8 remain unapplied — would destroy that correspondence. Packet regeneration belongs to the
full application pass.

## What remains unapplied

Only 7b has been applied. Open items 1, 2, 3, 4, 5, 6, 7, 7a and 8 from
`HUMAN-REVIEW-VERDICTS-BATCH-4.md` are still pending the application pass. The corpus remains
`CANDIDATE — SEALED, AWAITING INDEPENDENT PRODUCT-OWNER SAFETY REVIEW`; nothing here enters formal
truth, and `FORMAL_COHORT_SPENT = FALSE`.
