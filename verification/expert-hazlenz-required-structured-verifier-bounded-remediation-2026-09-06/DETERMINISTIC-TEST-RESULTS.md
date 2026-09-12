# §191 — Deterministic test results

**69 assertions, 69 passed, 0 failed. Zero provider requests, zero database operations.**

Suite: `backend/scripts/test-expert-verifier-v3-1-remediation.ts`  
Reproduce: `cd backend && npx ts-node -T scripts/test-expert-verifier-v3-1-remediation.ts`

| section | covers | assertions |
|---|---|---|
| **A** | contract state discipline — admission still refuses the §187B shapes; the three clarification states are distinguishable from the schema descriptions alone | 17 |
| **B** | conjunctive sufficiency — the rule is present, generic, and free of every cohort term | 10 |
| **C** | adjacent-property containment — all six distinctions, stated as principle not keyword list | 11 |
| **D** | preservation regression — v3 byte-unchanged; v3.1 minus the two blocks reproduces v3 exactly; nine good-behaviour passages intact; no frequency directive added | 18 |
| **E** | root-cause-to-diff review — every change maps to recorded evidence of a declared class | 13 |

## The three load-bearing assertions

**D.1** — removing the two inserted blocks from v3.1 reproduces v3 **byte-identically**
(`678160c95bc7` on both sides). This is what makes "bounded" a measured property rather than a
claim: nothing was edited, only inserted.

**D.7** — with `description` keys stripped, the v3.1 schema serialises **identically** to v3. The
schema change is confined to prose; no field, enum, `required` entry or `additionalProperties`
setting moved.

**A.1–A.4** — the exact §187B refused shape, rebuilt on a generic key, is still refused whole with
all four original codes, and still refused under the other non-ADD verdict. The deterministic
guard was not weakened to make the remediation look better.

## Two assertions worth singling out

**B.9** scans the conjunctive rule for fifteen §187 cohort terms — *auger, isolator, lockout,
dryer, accumulator, burner, debarker, interlock, conveyor, guard, torque, flame, hydraulic, HR-0,
HR-1* — and fails if any appears. The authorization required the fix be general, and this measures
it rather than asserting it.

**D.6** scans the inserted text against eight frequency-directive patterns (*ask more*, *always
propose*, *prefer clarification*, *when in doubt ask*, *err on the side of asking*, *should ask*,
*more questions*, *raise a clarification whenever*). None appears. `CLARIFICATION_POLICY` stays
`INCONCLUSIVE` and the remediation does not quietly become a volume change.

## What the suite deliberately does NOT establish

That v3.1 behaves better. An instruction change is a change to a string; whether that string
produces better judgement is behavioural and needs a fresh prospective hosted cohort, which §191
does not authorize. Sections B and C prove the rules are **present, correctly scoped and
generically stated** — never that they work. The suite prints this limit in its own output.

Specifically unmeasured: whether v3.1 over-triggers and starts replacing the already-sufficient
first-pass questions on HR-01, HR-06 and HR-09. Section D proves the surrounding text survives
byte-identically, which is context preservation, not behaviour preservation.

## Full output

```

A. CONTRACT STATE DISCIPLINE

  PASS  A.1 the §187B refused shape is still REFUSED
  PASS  A.2 refusal still raises BINDING_DECLARED_BY_A_NON_ADD_VERDICT
  PASS  A.2 refusal still raises SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION
  PASS  A.2 refusal still raises BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION
  PASS  A.2 refusal still raises BOUND_DECLARATION_WITHOUT_A_CLARIFICATION
  PASS  A.3 a refused verdict settles nothing
  PASS  A.4 the illegal binding is refused under NO_CLARIFICATION_REQUIRED too
  PASS  A.5 STILL_UNRESOLVED under VERIFIED_AS_IS is ADMITTED — the route v3.1 names
  PASS  A.6 a proposed clarification WITH a binding is ADMITTED
  PASS  A.7 and its binding is admitted
  PASS  A.8 bindingFactKey is scoped to THIS response
  PASS  A.9 bindingFactKey states a first-pass question is not a binding
  PASS  A.10 clarificationSourceMode no longer carries the bare "null otherwise" contradiction
  PASS  A.11 declaration now HAS a description
  PASS  A.12 declaration names all three states: proposed / already-asked / challenge
  PASS  A.13 v3 declaration carried NO description — the defect being repaired
  PASS  A.14 the admission validator source is unchanged

B. CONJUNCTIVE SUFFICIENCY

  PASS  B.1 the rule is present in the v3.1 prompt
  PASS  B.2 it requires listing every separate thing the fact requires
  PASS  B.3 it requires testing the question against EACH requirement on its own
  PASS  B.4 sufficiency requires EVERY conjunct, not some
  PASS  B.5 partial coverage is explicitly NOT sufficient
  PASS  B.6 a disjunctive question is read as its WEAKEST branch
  PASS  B.7 trade shorthand may not supply a missing conjunct
  PASS  B.8 the "did only one of them" test is stated concretely
  PASS  B.9 no §187 cohort term appears in the conjunctive rule
  PASS  B.10 generic conjunctive fixture declares more than one conjunct

C. ADJACENT PROPERTY CONTAINMENT

  PASS  C.1 the rule is present in the v3.1 prompt
  PASS  C.2 it is attached as the BOUNDARY on the unseen-control heuristic
  PASS  C.3 visible component does not equal checked property
  PASS  C.4 presence does not equal securement
  PASS  C.5 inspection settles only its stated scope
  PASS  C.6 an earlier check does not establish the current state
  PASS  C.7 a related control does not establish a separate one
  PASS  C.8 absence of a recorded anomaly does not establish the property
  PASS  C.9 the rule is stated at the owed-property/evidence level
  PASS  C.10 it is a principle, not a keyword list — no exported matcher exists
  PASS  C.11 the generic adjacent pairs cover every distinction the rule must preserve

D. PRESERVATION REGRESSION

  PASS  D.1 removing the two blocks reproduces v3 BYTE-IDENTICALLY  -- 678160c95bc7 vs 678160c95bc7
  PASS  D.2 v3 itself is byte-unchanged at its frozen §187 hash
  PASS  D.3 the v3 schema is byte-unchanged at its frozen §187 hash
  PASS  D.4 v3.1 adds lines and removes none
  PASS  D.5 preserved: the unseen-control heuristic itself
  PASS  D.5 preserved: step 3's existing sufficiency test
  PASS  D.5 preserved: the "usually no" nomination prior
  PASS  D.5 preserved: NO_CLARIFICATION_REQUIRED resolves nothing
  PASS  D.5 preserved: one fact does not cover another
  PASS  D.5 preserved: the settlement-authority restriction
  PASS  D.5 preserved: no expected number of questions
  PASS  D.5 preserved: the magnitude exclusion
  PASS  D.5 preserved: the detail-with-control exclusion
  PASS  D.6 no frequency directive was added — CLARIFICATION_POLICY stays INCONCLUSIVE
  PASS  D.7 with descriptions stripped, the v3.1 schema is IDENTICAL to v3
  PASS  D.8 exactly three descriptions differ
  PASS  D.9 no enum member, source mode or declaration token was added
  PASS  D.10 PROVIDER_SETTLEMENT_AUTHORITY is untouched — no settlement field exists in v3.1

E. ROOT-CAUSE-TO-DIFF REVIEW (every change maps to evidence)

  PASS  E.1 the change ledger has one entry per change made
  PASS  E.2 "schema field descriptions x3" carries evidence
  PASS  E.3 "schema field descriptions x3" maps to a test section
  PASS  E.2 "adjacent-property boundary block in step 2" carries evidence
  PASS  E.3 "adjacent-property boundary block in step 2" maps to a test section
  PASS  E.2 "conjunctive sufficiency block in step 3" carries evidence
  PASS  E.3 "conjunctive sufficiency block in step 3" maps to a test section
  PASS  E.4 description repair "bindingFactKey" names its defect and evidence
  PASS  E.4 description repair "clarificationSourceMode" names its defect and evidence
  PASS  E.4 description repair "owedFactDeclarations[].declaration" names its defect and evidence
  PASS  E.5 exactly one change rests on mechanical evidence alone (the schema descriptions)
  PASS  E.6 the two instruction changes are labelled MODEL_DIAGNOSTIC, not mechanical
  PASS  E.7 v3.1 declares its own version

69 passed, 0 failed
PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0
v3   system prompt sha256  678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88
v3.1 system prompt sha256  7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c
v3   schema sha256         1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a
v3.1 schema sha256         d39c86bc2755451fd27bdba34cba82c2bfee5b090134a40d1622e25d199bde65
BEHAVIOURAL EFFICACY IS NOT ESTABLISHED BY THIS SUITE. It requires a fresh
prospective hosted cohort, which §191 does not authorize.
```
