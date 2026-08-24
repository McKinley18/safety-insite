# L3-2e evidence index

> `L3_2E_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> `L3_2E_SCOPE_CONTRADICTION` — recorded, not acted on
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

| Document | What it establishes |
|---|---|
| `STATUS.md` | terminal state, three-tier measurement, DISC-03/04 analyses, observation-availability table, clarification matrix, family coverage, the advancement and coverage gates line by line |
| `ROOT_CAUSE.md` | E1 and E2 proven independently against the **unpatched** code, the 4-cell discriminator matrix, and the clause-position ablation that contradicts §34.5 |
| `rootcause/PROVEN.txt` | the `E1_ROOT_CAUSE_PROVEN` / `E2_ROOT_CAUSE_PROVEN` markers, recorded before the first edit |
| `rootcause/SCOPE_CONTRADICTION.txt` | why `negation-scope.ts` was left untouched despite executable evidence implicating it |
| `HOLDOUT_FREEZE.txt` | the sealed holdout's identity, freeze time, builder hash, composition, overlap result, and the four retired holdouts |
| `REPRODUCTION_COMMANDS.md` | every command in order, with expected values |
| `SECURITY_AND_BOUNDARY.txt` | holdout integrity, dependency graph, credentials, egress, seam, databases, release mutation |
| `NEXT_ACTION.md` | the five remaining blockers root-caused and **not** applied, and the exact next phase |
| `FINAL_STATE.txt` | repository preservation, before and after |

| Artifact | Contents |
|---|---|
| `rootcause/e1-proof-pre-patch.json` · `e1-proof-post-patch.json` | 12 paired role fixtures, before and after |
| `rootcause/e2-proof-pre-patch.json` · `e2-proof-post-patch.json` | the 4-cell observation-availability matrix |
| `rootcause/e2-clause-position-ablation.json` | the ablation that identified clause position as the mechanism |
| `rootcause/check-behaviour-diff.json` | retired presence rules vs role-aware rules, per case |
| `results/holdout-run-1.json` · `holdout-run-2.json` | the two sealed-holdout captures |
| `results/holdout-score-1.json` | three tiers, split by provenance, with the syntactic-role and observation-availability reports |
| `results/family-coverage.json` | the 24-family matrix across all five sealed sets |
| `results/reproducibility.json` | 84 of 84 |
| `results/l3-compare.json` | Level-1 vs Level-3 |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 |
| `results/dev-run-1.json` · `dev-score-1.json` | the 38-scenario development set — tuning artifact only |
| `results/REGRESSION-EVIDENCE-holdout-l32{b,c,d}-*.json` | the three **retired** sealed sets under L3-2e code |
| `results/regression/` | every suite's raw output, including both prerequisite suites from both checkouts |
