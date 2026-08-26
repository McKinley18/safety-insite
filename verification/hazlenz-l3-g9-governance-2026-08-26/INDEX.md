# L3 G9 GOVERNANCE REVIEW + RC-1/RC-2 REMEDIATION PLANNING — INDEX

`L3_G9_GOVERNANCE_AND_REMEDIATION_PLAN_COMPLETE — IMPLEMENTATION_AUTHORIZATION_REQUIRED`
provider calls `0` · API cost `$0.00` · G9 **not amended** · nothing implemented · no corpus opened

| path | what it is |
|---|---|
| **`DECISION_PACKAGE.md`** | the 14 questions, answered |
| `plans/G9_GOVERNANCE_REVIEW.md` | what G9 measures (measured, not assumed), recovered product intent, materiality of the 14, counterfactuals, and the recommendation |
| `plans/REMEDIATION_PLANS.md` | `RC-1` and `RC-2` experiment designs, `RC-3` architecture options table, `RC-4` evidence requirement |
| `plans/TESTING_ECONOMY_AND_CRITICAL_PATH.md` | the six-tier testing hierarchy with exit criteria, the finish-the-app critical path, and the `INSTRUMENT_SELF_REFERENCE_PROHIBITED` standing rule |
| `analysis/g9-materiality.js` | the derivation — asserts all three evidence digests and **throws on drift** |
| `analysis/G9_MATERIALITY.txt` · `.json` | per-row S1/S2/S3 classification and the four diagnostic counterfactuals |
| `preservation/prove-governance-preservation.js` + `PRESERVATION_AND_ZERO_SPEND.txt` | **28 checks, 28 PASS** |

## Reproduction — zero cost, no provider contact

```
node verification/hazlenz-l3-g9-governance-2026-08-26/analysis/g9-materiality.js
node verification/hazlenz-l3-g9-governance-2026-08-26/preservation/prove-governance-preservation.js
```

**Headline findings:** G9 compares three decision fields and **no representational field**, so
`G9-S3` is empty by construction and the "too strict" premise is refuted. `hasCandidate` is provably
redundant and removing it changes **zero** rows. **7 of 14 divergences are safety-decision
divergences.** **No G9 definition turns Run 2 into a pass** — even the most permissive leaves 4 rows
divergent, and six other gates failed independently.
