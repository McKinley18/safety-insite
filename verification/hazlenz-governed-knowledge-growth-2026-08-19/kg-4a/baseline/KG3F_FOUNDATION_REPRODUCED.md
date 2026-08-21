# KG-4A Phase 0 — KG-3F foundation reproduced before any KG-4A edit

Run against the canonical KG-3F corpus `test_kg3f_remediation_20260820` (34 records,
`federal-core-2026-08-20.5`, 41 reviewer-approval decisions, **no release in `active`**).

| KG-3F result | Expected | Reproduced | Command |
|---|---|---|---|
| Retrieval determinism, 9 physical layouts | 170/170 | **170/170** | `SOURCE_DB=test_kg3f_remediation_20260820 ts-node scripts/test-kg3f-retrieval-determinism.ts` |
| Mirrored ranking adversarial | 54/54 | **54/54** | `test:kg3f-ranking-adversarial` |
| 56.14132 predicate matrix | 16/16 | **16/16** | `test:kg3f-56-14132-predicate` |
| Citation granularity | 48/48 | **48/48** | `test-kg3e-citation-granularity.ts federal-core-2026-08-20.5` |
| Approval contract | 57/57 | **57/57** | `test:approval-contract` (own DB: `test_kg3f_contract_20260820` → disposable `test_kg3f_contract_run`) |
| Governed shadow invariance | 7/7 | **7/7** | `test:kg3f-shadow-invariance` |
| Shadow report digest | `29469550cea4d2fd…` | **`29469550cea4d2fd`** on all 4 layouts | byte-identical; KG-3F evidence regenerated identically, not damaged |
| Customer-path disconnection | 9/9 | **9/9** | `test:kg3f-customer-path-disconnection` |

Emitted coverage 23/23/23 and family readiness (27 families, 0 blocked) are carried forward from
the KG-3F artifacts; they are properties of the same corpus, which is verified unchanged above.

---

## Material change to the MEANING of KG-3F Phase 16 (CP-8)

**This must be read before relying on the 9/9 above.**

`test:kg3f-customer-path-disconnection` still reports 9/9 after KG-4A's wiring, and the pass is
**technically correct but no longer means what it meant in KG-3F**:

* CP-8 enumerates importers of `standards/releases/governed-corpus-lookup` and excludes anything
  under `standards/` as "the governed subsystem itself". KG-4A's resolver lives at
  `standards/cutover/governed-resolution.ts`, so it is excluded by that rule and is reported as a
  permitted importer.
* CP-7 looks for a governed feature flag read **from a customer directory**. KG-4A reads
  `GOVERNED_CUTOVER_MODE` inside `standards/cutover/`, so CP-7 does not see it.
* Meanwhile `safescope-v2/` and `applicable-standards/` now **do** import
  `standards/cutover/governed-cutover-context`, which transitively reaches the governed resolver.

So the KG-3F claim that survives is the narrow one: **no customer module imports the governed
resolver, lifecycle, review service or approval contract directly** — the connection is exactly one
named seam. The broader KG-3F claim, *governed data is unreachable from the customer path*, is
**deliberately superseded by KG-4A**, which exists to build that reachability under control.

`test:kg4a-default-off` replaces it with the stronger, mode-aware claim and asserts transitive
reachability explicitly. The KG-3F suite is left **unmodified** — it is KG-3F evidence, and
rewriting it to describe KG-4A's architecture would destroy the record of what was true before.
