# L3-2d evidence index

> `L3_2D_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

| Document | What it establishes |
|---|---|
| `STATUS.md` | terminal state, three-tier measurement, clarification confusion matrix, high-consequence analysis with stage attribution, the advancement gate line by line, and the `DISC` classification |
| `ROOT_CAUSE.md` | D1 and D2 proven independently by controlled ablation against the **unpatched** code, plus two places L3-2c's attribution was wrong |
| `rootcause/PROVEN.txt` | the `D1_ROOT_CAUSE_PROVEN` / `D2_ROOT_CAUSE_PROVEN` markers, recorded before the first implementation edit |
| `HOLDOUT_FREEZE.txt` | the sealed holdout's identity, freeze time, builder hash, overlap result, and the three retired holdouts |
| `REPRODUCTION_COMMANDS.md` | every command in order, with expected values |
| `SECURITY_AND_BOUNDARY.txt` | holdout integrity, dependency, credential, egress, seam, database and release-mutation checks |
| `NEXT_ACTION.md` | the remaining blockers root-caused and **not** applied, and the exact next phase |
| `FINAL_STATE.txt` | repository preservation, before and after |
| `preservation-pre.txt` · `preservation-evidence.txt` | HEAD, upstream, worktree hashes, stash identities, tag targets and prior-phase evidence hashes, recorded before any mutation |

| Artifact | Contents |
|---|---|
| `rootcause/ablation-pre-patch.json` | v2 (L3-2b) vs v3 (L3-2c) on 12 fixtures — the root-cause proof |
| `rootcause/ablation-determinism.json` | three repeats per variant per fixture; 22 of 24 groups identical |
| `rootcause/ablation-post-patch.json` | v4 (L3-2d) on the same fixtures |
| `rootcause/disc-severity.json` | the `DISC-02` / `DISC-03` / `DISC-04` classification, with the invariant analysis |
| `results/holdout-run-1.json` · `holdout-run-2.json` | the two sealed-holdout captures |
| `results/holdout-score-1.json` | three tiers, split by provenance, with the clarification matrix and high-consequence report |
| `results/reproducibility.json` | 77 of 77 |
| `results/l3-compare.json` | Level-1 vs Level-3, adjudicated against frozen expectations |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 |
| `results/dev-run-1.json` · `dev-score-1.json` | the 22-scenario development fixture set — tuning artifact only |
| `results/REGRESSION-EVIDENCE-holdout-l32b-*.json` | the **retired** L3-2b holdout under L3-2d code — 62/62, `H-NG-02` recovered |
| `results/REGRESSION-EVIDENCE-holdout-l32c-*.json` | the **retired** L3-2c holdout under L3-2d code |
| `results/regression/` | every suite's raw output, including both prerequisite suites from both checkouts |
