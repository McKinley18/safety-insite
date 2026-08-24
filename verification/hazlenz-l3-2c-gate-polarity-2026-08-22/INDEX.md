# L3-2c evidence index

> `L3_2C_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

| Document | What it establishes |
|---|---|
| `STATUS.md` | the terminal state, the three-tier measurement, every miss with its stage, and the advancement gate line by line |
| `ROOT_CAUSE.md` | R1/R2/R3 root causes demonstrated against the **unpatched** code, the four discovered defects, and the two places prior attributions were incomplete |
| `HOLDOUT_FREEZE.txt` | the sealed holdout's identity, freeze time, builder hash and overlap result |
| `REPRODUCTION_COMMANDS.md` | every command, in order, with expected values |
| `SECURITY_AND_BOUNDARY.txt` | dependency, credential, egress, seam, database and release-mutation checks |
| `NEXT_ACTION.md` | the two failing gates, root-caused and **not** applied, and the exact next phase |
| `FINAL_STATE.txt` | repository preservation, before and after |
| `preservation-pre.txt` · `preservation-evidence.txt` | HEAD, upstream, worktree hashes, stash identities and prior-phase evidence hashes recorded before any mutation |

| Artifact | Contents |
|---|---|
| `rootcause/proof-pre-patch.json` · `proof-post-patch.json` | the same fixtures before and after the repair |
| `rootcause/clarification-pre-patch.json` · `clarification-post-patch.json` | live-provider clarification behaviour, 1/3 → 3/3 |
| `rootcause/gate-behaviour-diff.json` | the retired gate versus the new gate, per case |
| `results/holdout-run-1.json` · `holdout-run-2.json` | the two sealed-holdout captures |
| `results/holdout-score-1.json` | three tiers, split by provenance |
| `results/reproducibility.json` | 72 of 72 |
| `results/l3-compare.json` | Level-1 versus Level-3, adjudicated against frozen expectations |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 |
| `results/dev-run-1.json` · `dev-score-1.json` | the development set |
| `results/REGRESSION-EVIDENCE-holdout-l32b-*.json` | the **retired** L3-2b holdout under L3-2c code — regression evidence only |
| `results/regression/` | every suite's raw output, including both prerequisite suites from both checkouts |
