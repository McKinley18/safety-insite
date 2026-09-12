# Independent product-owner safety review — verdicts

**Reviewer:** the product owner (account owner), acting as the independent safety-domain reviewer.
**Corpus reviewed:** `FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1`, sealed at
manifest `b2e96cc5…bf64`, truth keys `51afb054…b620`, provenance `e33fb8df…0339`.
**Packet issued:** `review/AUGMENTATION-REVIEW-PACKET.md`, `614e2dec…0a08`.
**Date:** 2026-08-31.
**Status:** FINAL. Declared by the reviewer as their final independent safety-review verdicts.

This supersedes the §125 authoring self-review as the approval of record. The §125 review remains on
file as what it was: a self-review by the agent that authored the cases, explicitly not independent.

---

## Verdicts, exactly as given

```
AUG-01 APPROVE
AUG-02 APPROVE
AUG-03 APPROVE
AUG-04 APPROVE
AUG-05 APPROVE
AUG-06 APPROVE
AUG-07 APPROVE
AUG-08 REJECT/CORRECT — fall protection → DEFENSIBLE
AUG-09 APPROVE
AUG-10 APPROVE
AUG-11 APPROVE
AUG-12 APPROVE
AUG-13 REJECT/CORRECT — electrical → DEFENSIBLE
AUG-14 REJECT/CORRECT — fall protection → DEFENSIBLE
AUG-15 APPROVE
AUG-16 APPROVE
```

**13 approved. 3 corrected. 0 rows rewritten to recover a label.**

## The three corrections and what each changes

| row | family | was | now | effect on that row |
|---|---|---|---|---|
| `AUG-08` | `fall_protection` | FORBIDDEN | **DEFENSIBLE** | still carries `lockout_tagout` as forbidden, so the row **retains** forbidden-family truth |
| `AUG-13` | `electrical` | FORBIDDEN | **DEFENSIBLE** | was the row's only forbidden family — the row now carries **no** forbidden truth |
| `AUG-14` | `fall_protection` | FORBIDDEN | **DEFENSIBLE** | was the row's only forbidden family — the row now carries **no** forbidden truth |

Reading the reviewer's judgement, for the record and without arguing it: a tripod-and-winch retrieval
rig at an open wet-well hole (`AUG-08`), an energised heater cord in a flammable-vapour room even
when stowed (`AUG-13`), and a reversing forklift at a dock face (`AUG-14`) are each situations where
a competent safety professional could legitimately raise the family that was marked forbidden.
Forbidding them would have scored correct reasoning as a false positive. That is exactly the class of
error this review exists to catch, and it is the reason an authoring self-review could not stand in
for it.

## Applied under the frozen rule

- The corrections were applied **exactly as written**. No family was substituted, restored, added or
  moved anywhere other than to `DEFENSIBLE`, on any row.
- No row's observation text was altered. No `present`, `negatedOrSafe`, `lifeCritical`, gap or
  interaction truth was altered.
- `defensibleHazardFamilies` is **derived** (taxonomy − present − forbidden), so each corrected
  family lands in `DEFENSIBLE` automatically and the totality rule stays satisfied by construction
  rather than by hand.
- **No row was rewritten to win back a lost opportunity**, and none will be. The corpus absorbs the
  cost of the review.

## Cost of the review

`ROWS_WITH_FORBIDDEN_FAMILY_TRUTH`: **14 → 12.** `AUG-13` and `AUG-14` leave the negative-control
population; `AUG-08` stays in it.

Both remain above the frozen construction-policy floor of 10, so the corrected corpus is still valid
under the policy it was authored against.

## Identity

The corrected corpus is a **different corpus** and is recorded as
`FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V2`. V1's sealed hashes remain meaningful as the
pre-review state and are preserved unmodified in
`state/SEAL-V1-PREREVIEW-BACKUP.json` (`97bb5e67…b6d3`) and in the §125 operation directory.
Post-review hashes are recorded in `state/SEAL-V2-POSTREVIEW.json`.
