# §202 — the adjudication session

**Zero provider calls. Zero database operations. No §199 row re-run. No §195–§201 evidence modified.**

## Read this first

§200 built a worksheet with 152 slots and left every semantic verdict null, on the standing rule that a verdict supplied by the evaluated component makes it its own examiner. That rule is unchanged here. What §202 adds is the machinery: the same evidence regrouped into self-contained review units so the verdicts can be supplied out loud, and a recording function that is the only way a verdict enters the worksheet.

**No model may supply a verdict, and in this worksheet none can.** `recordVerdict` requires `attribution === "PRODUCT_OWNER"` and refuses every other value. There is no second entry point and no flag that relaxes it.

## The counts, unchanged from §200

| | count |
|---|---|
| total slots | **152** |
| structurally pre-filled | **24** |
| genuinely open | **128** |
| supplied | **0** |
| remaining | **128** |

12 rows x 4 row axes = 48, plus 8 projected facts x 13 fact axes = 104, total 152. 24 of the 104 are the governed axes N, S and T pre-filled NOT_EXERCISED. 48 + 80 = 128 genuinely open. This is §200's arithmetic, reproduced, not recomputed differently.

56 verifier sub-axis fields plus 2 refused-declaration questions. §200 leaves all 58 null and counts none of them in its 152. They are carried here so they are not lost, and counted separately so the frozen 152/24/128 split is preserved exactly.

## How the session runs

1. The orchestrator reads one review unit from `ADJUDICATION-PRESENTATION-PACKET.md` — the observation, the frozen expectation, the provenance disclosure, the raw model output, the declarations, admission or refusal, the projected fact, the verifier output and the neutral observations — and then the unit's questions with their allowed answers.
2. The product owner answers each question. The orchestrator may explain any axis in as much depth as is wanted. It does not choose a verdict, suggest one, or nudge toward one, including if asked what it thinks the answer is.
3. The orchestrator records each answer with `recordVerdict(worksheet, slotId, verdict, "PRODUCT_OWNER")`. The supplied string is stored verbatim. A value outside the slot's vocabulary is refused rather than coerced.
4. A `TRUTH_SPECIFICATION_DEFECT` is recorded ADDITIVELY on the unit with `recordAdditive(worksheet, unitId, "truthSpecificationDefect", text, "PRODUCT_OWNER")`. It is not a member of any slot vocabulary and never replaces a verdict. The frozen preregistration is never rewritten, and the model is not forced to fail against bad truth.

## What the recording function refuses

| refusal | when |
|---|---|
| `ATTRIBUTION_MUST_BE_PRODUCT_OWNER` | any attribution other than the exact string `PRODUCT_OWNER` |
| `STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE` | any of the 24 carried-forward `NOT_EXERCISED` slots |
| `VALUE_NOT_IN_ALLOWED_VOCABULARY` | any string not exactly in that slot's vocabulary — no trimming, no case folding, no aliasing |
| `UNKNOWN_SLOT` | a slot id that does not exist |
| `CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG` | a different verdict over an already-supplied one, without an explicit revision |

Re-supplying the identical verdict for the same slot succeeds and changes nothing, so a session that is interrupted and resumed cannot double-count or corrupt an answer.

## Review units

Rows are ordered by ascending rowId, except that a row named as an earlier row's matched partner is placed immediately after that row, because §199's matched-pair design requires the pair to be read together. Within a row: the row unit first, then one unit per projected fact in the order §200 lists them, then any refused-declaration unit. THE ORDER IS MECHANICAL AND CARRIES NO INFORMATION ABOUT ANY UNIT'S CONTENT.

| unit | kind | row | factKey / declarationId | open questions |
|---|---|---|---|---|
| `U01` | ROW_FIRST_PASS_BEHAVIOUR | `SF-01` | `—` | 4 |
| `U02` | PROJECTED_FACT | `SF-01` | `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | 17 |
| `U03` | ROW_FIRST_PASS_BEHAVIOUR | `SF-03` | `—` | 4 |
| `U04` | ROW_FIRST_PASS_BEHAVIOUR | `SF-02` | `—` | 4 |
| `U05` | PROJECTED_FACT | `SF-02` | `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` | 17 |
| `U06` | ROW_FIRST_PASS_BEHAVIOUR | `SF-04` | `—` | 4 |
| `U07` | PROJECTED_FACT | `SF-04` | `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` | 17 |
| `U08` | ROW_FIRST_PASS_BEHAVIOUR | `SF-06` | `—` | 4 |
| `U09` | PROJECTED_FACT | `SF-06` | `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` | 17 |
| `U10` | ROW_FIRST_PASS_BEHAVIOUR | `SF-05` | `—` | 4 |
| `U11` | REFUSED_DECLARATION | `SF-05` | `decl1` | 2 |
| `U12` | ROW_FIRST_PASS_BEHAVIOUR | `SF-12` | `—` | 4 |
| `U13` | ROW_FIRST_PASS_BEHAVIOUR | `SF-07` | `—` | 4 |
| `U14` | PROJECTED_FACT | `SF-07` | `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | 17 |
| `U15` | ROW_FIRST_PASS_BEHAVIOUR | `SF-08` | `—` | 4 |
| `U16` | PROJECTED_FACT | `SF-08` | `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | 17 |
| `U17` | PROJECTED_FACT | `SF-08` | `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` | 17 |
| `U18` | ROW_FIRST_PASS_BEHAVIOUR | `SF-11` | `—` | 4 |
| `U19` | PROJECTED_FACT | `SF-11` | `FP.EXPOSURE.OBS-SF-11.357-406.1` | 17 |
| `U20` | ROW_FIRST_PASS_BEHAVIOUR | `SG-01` | `—` | 4 |
| `U21` | ROW_FIRST_PASS_BEHAVIOUR | `SG-02` | `—` | 4 |

## Questions that belong to the product owner and are not settled here

- ROW-AXIS SLOTS ON SG-01 AND SG-02. §200 counts 4 open row-axis slots on each of the two rows that were rejected before inference, and those 8 slots are inside the frozen 128. The same §200 worksheet records notAdjudicableReason on both rows: "No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted." §202 has carried the slots forward unfilled and unchanged rather than resolve the tension in either direction. Whether those 8 slots are answered NOT_EXERCISED, or excluded from the denominator, is a product-owner decision.
- THE 58 SUPPLEMENTARY FIELDS. §200 leaves 56 verifier sub-axis fields and 2 refused-declaration questions null, and its completeness block counts none of them in the 152. §202 carries all 58 as supplementary slots with their own counters so they are not silently dropped. Whether they are answered in this session is a product-owner decision.
- VOCABULARY FOR R_PRIORITY_FLOOR_IMPACT. §200 enumerates a scale for the safety classification half of axis R and none for the floor-impact half. §202 proposes three members and flags every slot that uses them as SECTION_202_PROPOSED. They require confirmation before use.
- VOCABULARY FOR THE 58 SUPPLEMENTARY FIELDS. §200 enumerates none. §202 applies the global §200 verdict vocabulary and flags the source. It requires confirmation before use.
- AXIS O. The §200 session states that "Axes N, O, S and T are NOT_EXERCISED for every fact". The §200 worksheet defines no axis O, carries no O slot, and pre-fills exactly three axes per fact — N, S and T, giving the 24. §202 reproduces the worksheet, not the sentence.

## Files

- `ADJUDICATION-PRESENTATION-PACKET.md` — the read-aloud material, one review unit at a time.
- `ADJUDICATION-WORKSHEET-202.json` — every slot with its axis, question, allowed vocabulary and provenance; open slots null, the 24 structural slots carried forward.
- `backend/scripts/lib/expert-202-adjudication-grouping.ts` — the grouping and the recording function.
- `backend/scripts/build-202-adjudication-session.ts` — the deterministic builder.
- `backend/scripts/test-202-adjudication-grouping.ts` — the proof suite.

```json
// frozen sources
{
  "section200Worksheet": "verification/expert-hazlenz-semantic-adjudication-2026-09-07/ADJUDICATION-WORKSHEET.json",
  "section200WorksheetSha256": "07dbb1707fa7bca43438ad2e7daade8c53d39acf0af9ea10513b1b37af9900f2",
  "section200Session": "verification/expert-hazlenz-semantic-adjudication-2026-09-07/ADJUDICATION-SESSION.md",
  "section200SessionSha256": "ea70f67c2e297114f711ab1796550e1c00855ddeef1fa109bb809a2fa3e31278",
  "section199RawFirstPass": "verification/expert-hazlenz-successor-structured-e2e-2026-09-07/RAW-FIRST-PASS-OUTPUTS.jsonl",
  "section199RawFirstPassSha256": "eafc0f2e2d4385c43f3c6a8fad480075a6d9e867a5b31f2efaa0d7a9ff052204",
  "section199RawVerifier": "verification/expert-hazlenz-successor-structured-e2e-2026-09-07/RAW-VERIFIER-OUTPUTS.jsonl",
  "section199RawVerifierSha256": "351d52c47d6be6d7ce6cf5998f18a644a982c2191ad697c24108913f4470684c",
  "section199PreregistrationSha256": "ddd6f63d56de4e6e62037457bed06b3de59b1100d169ec1b28d427d6f3d4fea4"
}
```

Built by `hazlenz.expert.202.adjudication-grouping.v1`.
