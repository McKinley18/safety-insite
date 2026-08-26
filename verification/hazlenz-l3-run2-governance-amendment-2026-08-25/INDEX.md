# INDEX — L3 Run-2 Governance Amendment (2026-08-25)

Terminal: **`L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED_V3 — RUN2_HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`**

| path | what it is |
|---|---|
| `STATUS.md` | root cause, the five amendments, monotonicity, the three preserved Run-1 statements |
| `NEXT_ACTION.md` | the Run-2 construction sequence, still unauthorized |
| `FINAL_STATE.txt` | terminal, state bits, identities, counts |
| `rootcause/ROOT_CAUSE_BEFORE_REMEDIATION.txt` | **Phase 2** — why `scorable: true` was possible, and the per-gate propagation of the 52 unevaluated rows |
| `rootcause/prove-scorability-defect.js` | the read-only proof that produced it |
| `preservation/RUN1_IMMUTABLE_HISTORY.txt` | **Phase 1** — the three statements and why they coexist without contradiction |
| `preservation/PRESERVATION.txt` | repository state, the append-only proof, frozen digests, execution accounting |
| `scorer/acceptance-scorer-v2.js` | the validity gate — **requires and calls** the frozen scorer, digest-asserted, throws on drift |
| `scorer/synthetic-v2-tests.js` · `SYNTHETIC_V2_VALIDATION.txt` | **70 assertions, 70 PASS, 0 FAIL** |
| `executability/derive-run2-schedule.js` · `DECLARED_VS_DERIVED.txt` | **Phase 6/9** — **33/33 MATCH**, sort keys and counts only, no observation read |
| `executability/executability-review.js` · `EXECUTABILITY_REVIEW.txt` | **Phase 9** — **43 checks, 43 OK, 0 defects** |
| `PACKAGE_MANIFEST.txt` | sha256 of every artifact |

**The amendment itself lives in the governing plan**, appended:
`verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md`
→ `a7da57e4…` (Amendment 3, `D-G`…`D-K`).

**Not in this package, because it was not done:** any Run-2 holdout, any selected row, any observation,
any provider call, any modification of the frozen scorer or of the Run-1 evidence.
