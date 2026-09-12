# §194 — Deterministic admission matrix

All twelve authorization points, plus derivation and no-retuning proofs. **48 assertions, 48 passed,
zero provider calls.** Suite: `backend/scripts/test-expert-194-regulatory-basis.ts`.

| # | case | result | code |
|---|---|---|---|
| 1 | no reliance + ordinary rationale | **ADMITTED** | — |
| 2 | supplied jurisdiction name alone | **ADMITTED** | — |
| 3 | reasoning that governed evidence is **absent** | **ADMITTED** | — |
| 4 | raw citation-shaped output outside the structure | **REFUSED** | `PROHIBITED_REGULATORY_CITATION` |
| 5 | declared reliance on valid supplied evidence | **ADMITTED** (structurally) | — |
| 6 | reliance on a nonexistent evidence id | **REFUSED** | `SOURCE_ID_NOT_IN_SUPPLIED_SET` |
| 7 | provider-invented citation string as a source id | **REFUSED** | `SOURCE_ID_MALFORMED` + not supplied |
| 8 | multiple valid supplied references | **ADMITTED** | — |
| 9 | nine malformed states | **REFUSED** | see below |
| 10 | regulatory proposition with no authorized basis | **REFUSED** (fail-closed) | `SOURCE_ID_NOT_IN_SUPPLIED_SET` |
| 11 | existing v3 contract-state hard gates | **intact** | `BINDING_DECLARED_BY_A_NON_ADD_VERDICT`, `OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED` |
| 12 | `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` | **intact** | — |

**Case 3 is the one that matters most.** It is the FV-11 / FV-13 shape — *"no governed regulatory
evidence was supplied establishing one, so the observation cannot settle it"* — and it is **admitted**
with `reliance: NONE`. Every keyword approach §193 measured would have refused it. Reasoning about
the absence of governed evidence remains lightweight and legal.

**Case 10b** is the fail-closed heart: with an **empty** supplied governed-evidence set, *any*
declared reliance is refused. There is no route by which a verifier supplies the rule from memory.

## The nine malformed states, each with its own code

```
field absent                  REGULATORY_BASIS_MISSING
not an object                 REGULATORY_BASIS_NOT_AN_OBJECT
unknown reliance mode         REGULATORY_RELIANCE_NOT_A_MEMBER
sourceIds not an array        SOURCE_IDS_NOT_AN_ARRAY
ids present under NONE        SOURCE_IDS_PRESENT_WITHOUT_RELIANCE
reliance with no ids          SOURCE_IDS_MISSING_FOR_RELIANCE
duplicate id                  SOURCE_ID_DUPLICATED
reliance with no proposition  PROPOSITION_MISSING_FOR_RELIANCE
proposition under NONE        PROPOSITION_PRESENT_WITHOUT_RELIANCE
```

Every one refuses the verdict **whole**, as v1/v2/v3/v3.1 do. A partly-valid verdict is not a partly
correct one.

## Derivation and preservation

```
B.1  removing the inserted block reproduces v3.1 BYTE-IDENTICALLY   7e73d1751623 both sides
B.2  v3.1 prompt byte-unchanged at its §192 hash
B.3  v3.1 schema byte-unchanged at its §192 hash
B.4  with regulatoryBasis stripped, the v3.2 schema is IDENTICAL to v3.1
B.5  exactly one property added, and it is required
C.1  ten §191/§166 passages byte-identical in v3.2 (conjunctive sufficiency, weakest-branch rule,
     adjacent-property boundary, inspection-scope clause, unseen-control heuristic, "usually no"
     prior, NO_CLARIFICATION_REQUIRED resolves nothing, owed-fact targeting, settlement restriction,
     no expected number of questions)
C.2  no clarification-frequency directive in the inserted block
```

## Determinism not overclaimed

```
D.1  faithful-paraphrase / source-supports-conclusion / legal-correctness = REQUIRES_HUMAN_TRUTH
D.2  every-sourceId-was-supplied = SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY
D.3  a citation string inside `proposition` is STILL refused — structure is not authority
```

**D.3 was a real hole in the first implementation.** §193's `verifierFreeTextStrings` predates
`regulatoryBasis` and did not scan `proposition`, so a model could have written a citation inside the
structured field and self-authorised. The suite caught it; v3.2's contract now scans that field
itself with the same canonical pattern, leaving the §193 module untouched.

## Also re-run

```
§193 hardening suite            46/46 PASS
§191 v3.1 remediation suite     69/69 PASS
§166 v3 binding protocol        49/49 PASS
Expert grounding contract       41/41 PASS
integrity §188 12/12 · §190 19/19 · §191 21/21 · §192 21/21 · §193 23/23 · §194 21/21
```
