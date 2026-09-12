# §193 — Deterministic test results

**46 assertions, 46 passed, 0 failed. Zero provider requests, zero database operations.**

Suite: `backend/scripts/test-expert-193-hardening.ts`  
Reproduce: `cd backend && npx ts-node -T scripts/test-expert-193-hardening.ts`

The two repairs are tested independently and never mixed: sections **A–D** are citation
containment on the verifier admission path; sections **E–G** are `AUDIT_TOOLING_RELIABILITY` and
touch no verifier behaviour. Section **H** proves nothing else moved.

| section | covers | result |
|---|---|---|
| A–B | citation boundary positive cases — refusal in rationale, proposed question, challengeReason, nominatedFact; pattern variants; statelessness | 10/10 |
| C | negative cases — 11 categories of legitimate content that must not be refused, plus full field coverage | 13/13 |
| D | persisted §192 replay — 39/39, and **FV-07 not refused** | 8/8 |
| E | NUL detection, escape preserved, grep restored | 5/5 |
| F | silent-clean prevention — UNAUDITABLE vs zero-match distinguishable | 5/5 |
| G | source sweeps, 681 + 43 files | 2/2 |
| H | v3, v3.1 prompt/schema, admission validator and §192 raw outputs unchanged | 4/4 |

## The assertions that carry the findings

**A.3 / B.2** — the same verdict containing `29 CFR 1910.212(a)(1)` is **ADMITTED by the unchanged
v3 boundary** and **REFUSED by the new one**. That is the enforcement gap, demonstrated rather than
described.

**D.6** — FV-07 R1 and R3 are **not** refused by the corrected boundary. The suite asserts this as
a pass, because it is the honest outcome under the canonical definition. A suite that only
demonstrated successes would have hidden the §193 finding.

**F.4 / F.5** — a genuine zero-match on a readable file returns `SEARCHED` with an empty array; an
unreadable file returns `UNAUDITABLE`. The two outcomes that were previously indistinguishable now
differ by construction.

**H.2 / H.3** — the v3.1 prompt and schema hash to exactly the values §192 preregistered, so the
thirty-nine §192 executions remain attached to the protocol that produced them and no v3.2 was
needed.

## Existing suites re-run after the repair

```
§166 v3 binding protocol (imports the repaired module)   49/49 PASS
§191 v3.1 remediation proof suite                        69/69 PASS
§192 mechanical gates rescore                            39/39 behavioural, contractInvalid 0 PASS
§192 model semantic gates rescore                        ALL PASS (unchanged)
§188 integrity 12/12 · §190 19/19 · §191 21/21 · §192 21/21 · §193 23/23
```

## What the suite does not establish

That the citation prohibition as written is enforceable. It is not, for the prose-assertion class,
and sections C and D are the evidence for that rather than against it.

## Full output

```

A. CITATION BOUNDARY — POSITIVE CASES (must refuse)

  PASS  A.1 citation in rationale is REFUSED
  PASS  A.2 and raises PROHIBITED_REGULATORY_CITATION
  PASS  A.3 the same verdict was ADMITTED by the unchanged v3 boundary — this is the gap
  PASS  B.1 citation in proposedClarification.question is REFUSED
  PASS  B.2 the unchanged v3 boundary admitted it
  PASS  B.3 citation in challengeReason is REFUSED
  PASS  B.4 citation inside nominatedFact is REFUSED
  PASS  B.5 spacing and case variants match the canonical pattern
  PASS  B.6 the canonical pattern is not global, so .test is stateless

C. CITATION BOUNDARY — NEGATIVE CASES (must NOT refuse)

  PASS  C.1 not refused: ordinary measurement  -- "The gap must be within 1/8 inch of the wheel"
  PASS  C.1 not refused: two-digit number then a word  -- "The valve was tested 24 months ago at the la"
  PASS  C.1 not refused: a date  -- "The certificate was issued on 12 March 2026 "
  PASS  C.1 not refused: a pressure and a duration  -- "The gauge read 0 bar and was held for 2 minu"
  PASS  C.1 not refused: a percentage  -- "Capture velocity fell to 60% of the design f"
  PASS  C.1 not refused: a factKey containing digits  -- "The fact owed:generic:vessel_drained_and_con"
  PASS  C.1 not refused: an identifier  -- "Analysis a-1 replicate 3 block 2 sequence 14"
  PASS  C.1 not refused: the word regulation without a citation  -- "No governed regulatory evidence was supplied"
  PASS  C.1 not refused: the jurisdiction token  -- "The jurisdiction is osha-general-industry as"
  PASS  C.1 not refused: a standard named without CFR shape  -- "The written scheme examination certificate i"
  PASS  C.1 not refused: CFR far from a number  -- "The CFR was not consulted because no evidenc"
  PASS  C.2 a clean ADD_OR_REPLACE with a measurement in the question is admitted
  PASS  C.3 every free-text field is actually scanned, not just rationale  -- 13 strings

D. PERSISTED §192 REPLAY — the honest result

  PASS  D.1 all 39 persisted executions replayed
  PASS  D.2 OLD admission 39/39 — the §192 historical result, unchanged
  PASS  D.3 NEW admission 39/39 — the boundary rejects none of the cohort
  PASS  D.4 no execution changed admission
  PASS  D.5 zero canonical citation violations across the cohort
  PASS  D.6 FV-07 R1 and R3 are NOT refused — they do not meet the canonical definition  -- this is the §193 finding, not a defect in the boundary
  PASS  D.7 the replay is labelled diagnostic and does not rewrite §192
  PASS  D.8 the rule classification records the undecidable classes explicitly

E. AUDIT TOOLING — NUL DETECTION (AUDIT_TOOLING_RELIABILITY)

  PASS  E.1 the repaired diff module carries zero NUL bytes  -- 20210 bytes
  PASS  E.2 and is textually auditable
  PASS  E.3 the intended delimiter semantics survive as the \0 ESCAPE
  PASS  E.4 grep can now find content it previously could not
  PASS  E.5 a NUL-bearing file is detected as unauditable

F. AUDIT TOOLING — SILENT-CLEAN PREVENTION

  PASS  F.1 a grep over an unauditable file returns UNAUDITABLE, never zero matches
  PASS  F.2 and names why
  PASS  F.3 the throwing form aborts rather than reporting clean
  PASS  F.4 a genuine zero-match on a READABLE file is SEARCHED, not UNAUDITABLE
  PASS  F.5 so "no matches" and "could not read" are now distinguishable outcomes

G. SOURCE SWEEP

  PASS  G.1 no unauditable file remains under backend/scripts  -- 682 files scanned
  PASS  G.2 no unauditable file under the expert-hazlenz source tree  -- 43 files scanned

H. NOTHING ELSE MOVED

  PASS  H.1 the v3 admission validator is byte-unchanged
  PASS  H.2 the v3.1 PROMPT is unchanged — §192 stays attached to its hash
  PASS  H.3 the v3.1 SCHEMA is unchanged — this was runtime logic, not a protocol change
  PASS  H.4 §192 raw outputs are untouched

46 passed, 0 failed
PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0
CITATION ENFORCEMENT closes the citation-LAUNDERING class only. The prose-assertion
class that FV-07 fell into is NOT deterministically decidable and is escalated.
```
