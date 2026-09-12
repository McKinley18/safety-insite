# §210D — EXECUTOR DEFECT REGISTER

Defects in the §210D **executor and its derived views**, recorded separately from model behaviour so
neither is read as the other. No defect here changed a request body, so no case was executed with
the wrong content and no case required a second draw.

## EXECUTOR_DEFECT_1 — the clarification back-reference was read under the wrong field name

**Severity: DERIVED VIEW ONLY. No provider request affected. No re-draw required.**

`execute-210d-confirmation.ts` projected the clarification back-reference as
`relatesToDeclarationId`. The contract's field is `answersUnresolvedFactDeclarationId`. The executor
therefore wrote `PROPERTY_ABSENT` for every clarification on every case, which is an artefact of the
projection and says nothing about what the model authored.

The defect was in the **derived projection only**. The request bodies were unaffected: they carry
the schema built by `buildExpertVNextWireSchema`, which names the field correctly, so every case was
transmitted exactly as frozen. The raw provider responses were persisted **before** any derivation,
so the correct values were recoverable by reading them.

**Correction.** `reproject-210d-from-raw.ts` re-derives the projection from the persisted raw. The
original `PROJECTION-210D.jsonl` is **preserved and never deleted**, following the §208 precedent
(`PROJECTION-208-CORRECTED.jsonl`). Adjudication reads `PROJECTION-210D-CORRECTED.jsonl`. Nothing
was repaired, inferred or rewritten: every value is copied verbatim, and a field the model did not
write is recorded as `FIELD_NOT_AUTHORED_BY_MODEL` rather than filled in.

**What the correction changed in the adjudication.** It changed one verdict, and it changed it
against the instruction under test rather than in its favour. Under the artefact every case looked
unbound; under the corrected projection D1, D4 and D5 bound their clarifications correctly and
**D2 genuinely did not**, which is the D2.Q2 failure recorded in the adjudication. Had the artefact
gone unnoticed, axis F would have been reported as failing on four cases instead of one.

| Case | Clarifications | Bound to an emitted declaration |
|---|---:|---:|
| D1 | 1 | 1 |
| D2 | 1 | **0** |
| D3 | 0 | 0 |
| D4 | 2 | 2 |
| D5 | 1 | 1 |

**Why this is recorded rather than quietly fixed.** A projection defect found after execution is the
same class of event as §208's executor parameterisation defect, and the same rule applies: preserve
the original, re-derive from raw, and record the defect beside the evidence. Silently overwriting the
projection would have destroyed the record of what the run first reported.

## Not defects

- **D2's placeholder branches are MODEL output, not an executor artefact.** The strings `unused` and
  `placeholder` appear verbatim in the persisted raw provider response. They are a semantic failure
  and are adjudicated as one.
- **`stripAnthropicUnsupportedKeywords` removes `minLength`**, which is why a one-word placeholder
  satisfies the transmitted schema. That is the frozen §108 transport adaptation, unchanged since
  §199, and it is not a §210D defect. It is noted because it explains why the structural failure
  class was `NO_FAILURE` on a semantically empty declaration.
