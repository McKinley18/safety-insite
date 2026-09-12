# Why the cohort could not be frozen — measured, not asserted

**Terminal B.** `FORMAL_COHORT_SEMANTIC_TRUTH_UNAVAILABLE`.

Two frozen composition minimums cannot be met from any authorized source, **and opening the reserved
gauntlet offsets does not change that.** Reserved material was therefore **left unopened**.

## The measurement

`proofs/max-achievable-composition.txt`. Every figure is an **upper bound** computed per class
independently; a real 60-row selection must satisfy all classes *simultaneously* within the same 60
rows, so the achievable numbers are ≤ these. That makes the blocked conclusion robust.

| class | required | max achievable | after opening offsets 2+3 | verdict |
|---|---|---|---|---|
| GOVERNED_RECORD_SUPPLIED | 40 | 60 | 60 | ok |
| NO_GOVERNED_RECORD | 8 | 60 | 60 | ok |
| CLARIFICATION_NOT_OWED | 14 | 37 | 37 | ok |
| **CLARIFICATION_OWED** | **20** | **3** | **3** | **BLOCKED — short 17** |
| FORBIDDEN_FAMILY_NEGATIVE_CONTROL | 48 | 39 | **55** | ok *(only after opening)* |
| LIFE_CRITICAL_PRESENT | 10 | 47 | 47 | ok |
| **CROSS_HAZARD_INTERACTION** | **10** | **5** | **5** | **BLOCKED — short 5** |
| DETERMINISTIC_MISS_RECALL_OPPORTUNITY | 10 | 45 | 45 | ok |
| MULTI_HAZARD | 12 | 39 | 39 | ok |
| NEGATED_OR_SAFE_STATE | 10 | 30 | 30 | ok |
| DISAGREEMENT_OPPORTUNITY | 6 | 60 | 60 | ok |
| DETERMINISTIC_HAZARD_PRESENT | 30 | 81 | 81 | ok |

## Why opening the reserve cannot fix it

`CLARIFICATION_OWED` requires `decisionCriticalGaps` — the *specific missing fact*, not a boolean.
`CROSS_HAZARD_INTERACTION` requires `recordedInteractions` over the closed
`EXPERT_INTERACTION_KINDS` vocabulary. Both are **LEVEL-3 authored safety-domain judgement**.

Field-name inventory of every authorized source, taken from label metadata only:

| source | state | gap label | interaction label |
|---|---|---|---|
| `safescope-gauntlet.seed.json` (45 eligible) | OPENED §122 | **none** | **none** |
| `safescope-gauntlet.source.v1.json` — offsets 2 and 3 | RESERVED | **none** | **none** |
| Population A (34) / Population B (22) | open, supplemental | **none** | B supplies 2 recognised pairs |
| augmentation V2 (16) | reviewed | 3 | 3 |

The offset-2/3 artifact carries `unacceptableStandardFamilies` — which is why it supplies 16
negative-control opportunities — but it has **no gap-level and no interaction-level label at all**.
Opening it closes `FORBIDDEN_FAMILY_NEGATIVE_CONTROL` and nothing else.

So opening both offsets would **irreversibly spend two open-once reserved partitions and still leave
the cohort unfreezable.** Under `COHORT_SIZE_POLICY.onInsufficiency` — *"If 60 rows cannot satisfy
every frozen composition requirement, STOP and report the exact reason"* — the correct action is to
stop with the reserve intact.

```
GAUNTLET_OFFSET_2 = RESERVED, NOT OPENED
GAUNTLET_OFFSET_3 = RESERVED, NOT OPENED
REALISM_OFFSET_1  = RESERVED, NOT OPENED
REALISM_OFFSET_2  = RESERVED, NOT OPENED
RETIRED material  = untouched, permanently closed
```

## The one thing that would close it — and why I did not do it

The 17 missing gaps and 5 missing interactions could be **authored**. I could write them.

I did not, and the reason is not caution for its own sake. Three days ago the same authoring process
produced 16 rows and a self-review that pronounced them sound. Your independent review then
overturned **3 of 14 forbidden-family determinations** — a 21% error rate on exactly this class of
Level-3 safety judgement. `AUG-13` and `AUG-14` had been given forbidden labels that would have
scored a competent inspector's correct reasoning as a false positive.

Gaps and interactions feed **M09** and **M10**, and the same authoring hand feeds **M02, a HARD GATE
at 0.20**. Authoring 22 more Level-3 judgements and freezing them as an answer key — with no
independent review, immediately before spending the cohort — would repeat precisely the error your
review just caught, at scale, and this time inside the frozen key.

That is a decision for you, not a gap for me to quietly fill.

## What would actually unblock this

Three routes. They are not equivalent and I am not neutral between them.

1. **Author the missing Level-3 truth, then have it independently reviewed** — the §125/§126 pattern
   that just worked. ~17 decision-critical gaps and ~5 interactions, authored under a construction
   policy frozen first, then reviewed by you before anything freezes. This is the honest route and
   it is a full operation of its own.
2. **Re-examine whether the minimums are right.** `CLARIFICATION_OWED = 20` against
   `CLARIFICATION_NOT_OWED = 14` is a deliberate design choice, and 20 of 60 rows owing a
   decision-critical question is a demanding shape. **Changing it is a threshold change and I will
   not propose a number** — but if the requirement no longer reflects what you want measured, that
   is a governance decision you can take deliberately, in the open, rather than discovering it as a
   blocker. It is emphatically *not* something to relax in order to reach a green terminal.
3. **Accept a smaller measured scope** — freeze a cohort that does not claim M09/M10 coverage, and
   report those measures as UNMEASURED rather than manufacturing their denominators. The frozen
   contract already says `zeroOpportunity: UNMEASURED_GATE_FAILS`, so this route means the gate
   fails honestly rather than passing on invented truth.

What is not available is a fourth route where the cohort freezes tonight with 22 unreviewed
safety judgements inside the answer key.
