# §182 — STATE TRANSITION PROOFS

48 checks, 0 failures, 0 provider calls, 0 database operations. Full output in
`SECTION-182-TESTS.txt`. Each proof below was driven through the real modules.

---

## The path, proven end to end

```
ArbitrationRequest (CHALLENGE_FACT_VALIDITY, settles:false)
        |  consumeSettlementClaims          -> ledgerUnchanged: true, status UNRESOLVED   [P3]
        v
SettlementClaim (AWAITING_HUMAN_REVIEW)
        |  mintSettlementAuthority          -> requires APPROVE + HUMAN_REVIEW            [P2,P4,P5,P6]
        v
SettlementAuthority (branded, single-use)
        |  settleByReviewedEvidence         -> transition(..., ADMISSIBLE_EVIDENCE)       [P14]
        v
SETTLED_BY_EVIDENCE
```

## The 22 required proofs

| # | requirement | result | evidence |
|---|---|---|---|
| 1 | feature-off current path invariant unchanged | PASS | P1, P1b — a bound declaration still yields `COVERED` via `ADMITTED_BINDING` only |
| 2 | provider cannot mint `ADMISSIBLE_EVIDENCE` | PASS | P2 — all five refused provenances rejected with `REVIEW_PROVENANCE_NOT_HUMAN` |
| 3 | provider challenge alone cannot settle a fact | PASS | P3 — `ledgerUnchanged: true`, fact still `UNRESOLVED` |
| 4 | human `APPROVE_SETTLEMENT` mints narrow authority | PASS | P4 — `SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE`, `impliesFutureSufficiency: false` |
| 5 | `REJECT_SETTLEMENT` mints nothing | PASS | P5 — `DECISION_DOES_NOT_APPROVE_SETTLEMENT` |
| 6 | `LEAVE_UNRESOLVED` mints nothing | PASS | P6 |
| 7 | authority is factKey-bound | PASS | P7 — `FACT_KEY_MISMATCH` |
| 8 | authority is claim-bound | PASS | P8 — `CLAIM_ID_MISMATCH` |
| 9 | sibling cannot consume the authority | PASS | P9 — both facts left `UNRESOLVED` |
| 10 | duplicate review fails closed without widening | PASS | P10 — `CLAIM_ALREADY_APPLIED` + `FACT_NOT_UNRESOLVED` |
| 11 | wrong claim/fact binding fails closed | PASS | P11, P11b–P11f |
| 12 | HR-04 securement unresolved before review | PASS | P12 |
| 13 | HR-04 reject branch stays unresolved | PASS | P13 |
| 14 | HR-04 approval branch reaches `SETTLED_BY_EVIDENCE` | PASS | P14, P14b |
| 15 | HR-05/HR-07 adjacent facts remain separate | PASS | D1–D6 |
| 16 | `acceptableEvidence = null` supported | PASS | P16, P16b — absence visible, review still possible |
| 17 | coarse criterion does not auto-settle | PASS | P17, P17b — preserved verbatim with a caveat |
| 18 | no semantic matcher/scorer introduced | PASS | P18, P18b, P18c |
| 19 | no adjudication label reaches provider input | PASS | P19, P19b |
| 20 | no governed record modified | PASS | P20 — three registry files byte-identical to §181 |
| 21 | source TypeScript passes | PASS | `tsc --noEmit` — 0 errors |
| 22 | existing §170/§181 proofs remain green | PASS | see below |

## Requirement 22, with one honest re-anchor

Re-run and green: `test:expert-v3-development-integration` (40), `test:expert-verifier-v3-protocol`
(49), `test:expert-bounded-reliability` (44), `test:expert-nocall-harness` (141),
`test:expert-clarification-settlement` (148). The §181 governed alignment audit is unchanged —
21/4/1/2/0 across 28 questions.

**The §181 A0 replay required one re-anchor, and it is recorded rather than quietly applied.** Its
check F1.b asserted *"src/ mints ADMISSIBLE_EVIDENCE nowhere"*. That was a true statement about the
pre-§182 tree, and §182 authorized exactly one producer — so the assertion now reads:

> **F1.b — src/ mints ADMISSIBLE_EVIDENCE only from the §182 authorized producer**
> `[settlement-review.ts]`

This is a **stricter** check than the original, not a weaker one: "none exists" becomes "the one
authorized producer exists and nothing else does". The property that mattered was never *zero*; it
was *no unauthorized producer*, and that still holds. Same class of move as §178's version-ceiling
re-anchor, and recorded the same way.

## The HR-04 branches

Both are in `HR04-REPLAY.json`, generated from the real modules.

```
initial              securement UNRESOLVED · presence UNRESOLVED
after consumption    securement UNRESOLVED · AWAITING_HUMAN_REVIEW · ledgerUnchanged true

BRANCH A  REJECT_SETTLEMENT   authorityMinted false   securement UNRESOLVED
BRANCH B  APPROVE_SETTLEMENT  authorityMinted true    securement SETTLED_BY_EVIDENCE
                              presence still UNRESOLVED · transition authority ADMISSIBLE_EVIDENCE
```

**Branch B is an architecture proof and nothing more.** It does not claim a human ought to approve
HR-04. The frozen product-owner truth for HR-04 remains **REQUIRED**, and §181's audit found the only
governed criterion available for that fact offers `physical_inspection` — which a reviewer should
judge incapable of settling securement. The approval branch exists to prove the state is reachable
through the authorized path, not to suggest it should be taken.

## The displaced-fact proofs

`DISPLACED-FACT-PROOFS.json`, all six requirements:

1. A settled fact A is not reopened by a claim about adjacent fact B.
2. B cannot inherit A's claim or authority — `AUTHORITY_NOT_FOR_THIS_FACT`.
3. B must be separately reviewed; a second human decision is required.
4. An authority minted for A cannot settle B.
5. An authority minted for B cannot alter A — A stays `UNRESOLVED`.
6. A challenge against an ineligible fact is structurally refused with `FACT_NOT_IN_LEDGER`, not
   silently quarantined.
