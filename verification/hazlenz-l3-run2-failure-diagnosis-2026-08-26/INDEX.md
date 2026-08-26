# L3 RUN-2 ACCEPTANCE FAILURE — ROOT-CAUSE DIAGNOSIS — INDEX

`L3_RUN2_FAILURE_DIAGNOSIS_COMPLETE — REMEDIATION_DECISION_REQUIRED`
provider calls `0` · API cost `$0.00` · frozen acceptance result **UNCHANGED**

| path | what it is |
|---|---|
| `STATUS.md` | the diagnosis: attribution headline, the seven questions answered from evidence, and why another paid run is **not** currently justified |
| `ROOT_CAUSE_CONSOLIDATION.md` | the four root causes, the two independent defect families, and the remediation decision matrix |
| `NEXT_ACTION.md` | what is now decidable, what is blocked, and what remains forbidden |
| `PACKAGE_MANIFEST.txt` | `sha256  relative-path` for every file in this package |
| **`analysis/build-failure-ledger.js`** | builds the row-level ledger. Transcribes the frozen scorer's predicates to identify **which rows** it counted, and **FAILS CLOSED** — it refuses to emit a ledger if any derived count disagrees with the frozen scorer's own number |
| **`analysis/FAILURE_LEDGER.json`** | 30 distinct failing rows with truth, both processes, validator, binder, carriers, and the exact deterministic reason the scorer counted each |
| `analysis/attribute-root-causes.js` | pipeline attribution, applying the rule in **both** directions |
| `analysis/ATTRIBUTION.txt` · `ATTRIBUTION.json` | per-row attribution with cited evidence, and per-layer counts |
| `preservation/prove-diagnosis-preservation.js` + `PRESERVATION_AND_ZERO_SPEND.txt` | **34 checks, 34 PASS** — frozen evidence unchanged, verdict unchanged, nothing tuned, zero provider contact, worktree intact |

## Reproduction — all zero-cost, none contacts a provider

```
node verification/hazlenz-l3-run2-failure-diagnosis-2026-08-26/analysis/build-failure-ledger.js
node verification/hazlenz-l3-run2-failure-diagnosis-2026-08-26/analysis/attribute-root-causes.js
node verification/hazlenz-l3-run2-failure-diagnosis-2026-08-26/preservation/prove-diagnosis-preservation.js
```

The ledger builder asserts the frozen holdout and both raw-result digests at start-up and **throws
on drift**, so it cannot be run against altered evidence.
