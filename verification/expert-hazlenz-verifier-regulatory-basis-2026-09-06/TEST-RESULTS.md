# §194 — Test results

**48 assertions, 48 passed, 0 failed. Zero provider calls, zero database operations.**

Suite: `backend/scripts/test-expert-194-regulatory-basis.ts`  
Reproduce: `cd backend && npx ts-node -T scripts/test-expert-194-regulatory-basis.ts`

Section A is the twelve-point authorization matrix; B proves v3.2 is derived from v3.1 by
construction; C proves the §191 semantic repairs survive byte-identically; D keeps the determinism
claim honest. Detail in `DETERMINISTIC-ADMISSION-MATRIX.md`.

## One assertion failed on the first run, and it mattered

**D.3** — a citation string inside `regulatoryBasis.proposition` was **not** refused. §193's
`verifierFreeTextStrings` was written before `regulatoryBasis` existed and did not scan the new
field, so a model could have written a citation inside the structure and self-authorised — exactly
what the authorization forbids with *"a model-emitted citation is not evidence merely because it is
structured."*

Closed additively: v3.2's contract scans `proposition` itself with the same canonical pattern,
leaving the §193 module byte-untouched. Recorded rather than quietly fixed, because a proof suite
that catches a real hole in its own design is the evidence that it is doing work.

## Prior suites re-run

```
§193 hardening                46/46 PASS
§191 v3.1 remediation         69/69 PASS
§166 v3 binding protocol      49/49 PASS
Expert grounding contract     41/41 PASS
integrity §188 12/12 · §190 19/19 · §191 21/21 · §192 21/21 · §193 23/23 · §194 21/21
```

## What the suite does not establish

That v3.2 behaves well with a real provider. **v3.2 has no hosted evidence of any kind.** These
are structural and derivational proofs; whether a model declares reliance honestly, uses `NONE`
appropriately, or abstains when no governed evidence supports a proposition are behavioural
questions for the end-to-end cohort, which §194 does not execute.

## Full output

```

A. THE TWELVE-POINT ADMISSION MATRIX

  PASS  1  no reliance + ordinary rationale = ADMITTED
  PASS  2  supplied jurisdiction name alone = ADMITTED
  PASS  3  reasoning that governed evidence is ABSENT = ADMITTED  -- the FV-11 / FV-13 shape that any keyword rule would have false-positived
  PASS  4  raw citation-shaped output outside the structure = REFUSED
  PASS  5  declared reliance on valid supplied evidence = STRUCTURALLY ADMITTED
  PASS  5b and the binding is recorded
  PASS  6  reliance on a nonexistent evidence id = REFUSED
  PASS  7  provider-invented citation string as a source id = REFUSED  -- SOURCE_ID_MALFORMED
  PASS  7b it is refused for shape AND for not being supplied — self-authorisation is closed
  PASS  8  multiple valid supplied references = ADMITTED

  PASS  9  malformed state REFUSED: field absent  -- REGULATORY_BASIS_MISSING
  PASS  9  malformed state REFUSED: not an object  -- REGULATORY_BASIS_NOT_AN_OBJECT
  PASS  9  malformed state REFUSED: unknown reliance mode  -- REGULATORY_RELIANCE_NOT_A_MEMBER
  PASS  9  malformed state REFUSED: sourceIds not an array  -- SOURCE_IDS_NOT_AN_ARRAY
  PASS  9  malformed state REFUSED: ids present under NONE  -- SOURCE_IDS_PRESENT_WITHOUT_RELIANCE
  PASS  9  malformed state REFUSED: reliance with no ids  -- SOURCE_IDS_MISSING_FOR_RELIANCE
  PASS  9  malformed state REFUSED: duplicate id  -- SOURCE_ID_DUPLICATED
  PASS  9  malformed state REFUSED: reliance with no proposition  -- PROPOSITION_MISSING_FOR_RELIANCE
  PASS  9  malformed state REFUSED: proposition under NONE  -- PROPOSITION_PRESENT_WITHOUT_RELIANCE

  PASS  10 a regulatory proposition with no authorized basis is fail-closed  -- the ONLY route to regulatory authority is a supplied sourceId, and there is none
  PASS  10b with zero governed evidence supplied, ANY declared reliance is refused
  PASS  11 existing v3 contract-state hard gates remain intact
  PASS  11b wrong-key and declaration gates still fire
  PASS  12 PROVIDER_SETTLEMENT_AUTHORITY = NEVER remains intact

B. DERIVED FROM v3.1 BY CONSTRUCTION

  PASS  B.1 removing the block reproduces v3.1 BYTE-IDENTICALLY  -- 7e73d1751623 vs 7e73d1751623
  PASS  B.2 v3.1 is byte-unchanged at its §192 prompt hash
  PASS  B.3 v3.1 is byte-unchanged at its §192 schema hash
  PASS  B.4 with regulatoryBasis stripped, the v3.2 schema is IDENTICAL to v3.1
  PASS  B.5 exactly one property was added, and it is required
  PASS  B.6 v3.2 declares its own version
  PASS  B.7 two reliance modes, no more

C. NO SEMANTIC RETUNING — the §191 repairs survive byte-identically

  PASS  C.1 preserved: §191 conjunctive sufficiency block
  PASS  C.1 preserved: §191 weakest-branch rule
  PASS  C.1 preserved: §191 adjacent-property boundary
  PASS  C.1 preserved: §191 inspection-scope clause
  PASS  C.1 preserved: the unseen-control heuristic
  PASS  C.1 preserved: the "usually no" nomination prior
  PASS  C.1 preserved: NO_CLARIFICATION_REQUIRED resolves nothing
  PASS  C.1 preserved: owed-fact targeting
  PASS  C.1 preserved: settlement-authority restriction
  PASS  C.1 preserved: no expected number of questions
  PASS  C.2 the inserted block adds no clarification-frequency directive
  PASS  C.3 and it names NONE as the normal answer
  PASS  C.4 it names the three NONE cases §192 actually produced

D. DETERMINISM NOT OVERCLAIMED

  PASS  D.1 the semantic axes are recorded as REQUIRES_HUMAN_TRUTH
  PASS  D.2 what IS decided is recorded as exact string equality over a closed set
  PASS  D.3 a citation string inside proposition is STILL refused — structure is not authority
  PASS  D.4 every change in the ledger carries evidence and a test section

48 passed, 0 failed
PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0
v3.1 prompt 7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c
v3.2 prompt f2522995f0b08afd3747c9f081bde74e7daf0fe356238d60e3574ec49b96b83f
v3.1 schema d39c86bc2755451fd27bdba34cba82c2bfee5b090134a40d1622e25d199bde65
v3.2 schema 83071b51edc3673896b068277cc447d0a5438be4e95e9603da0fdb315609a54e
STRUCTURAL SOURCE BINDING IS NOT LEGAL VALIDATION. v3.2 is NOT hosted-validated.
```
