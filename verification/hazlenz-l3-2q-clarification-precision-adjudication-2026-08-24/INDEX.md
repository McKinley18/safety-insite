# L3-2q — evidence index

`CLARIFICATION_PRECISION_QUALITY_GATE — RECALL_REMAINS_HARD_SAFETY_GATE`
`FINAL_ACCEPTANCE_PROVIDER_ELIGIBLE — ANTHROPIC — claude-sonnet-5`
blueprint **§49** · decisions **`D-76`**, **`D-77`**, **`D-78`** · HEAD `a7b21a26` ·
**zero inference · $0.00 · no sealed corpus opened · `B08` not altered**

| file | what it is |
|---|---|
| `STATUS.md` | the adjudication: the `D-78` correction to L3-2p, the architectural purpose of clarification, why recall and precision differ on deterministic containability, the pole census, `B08`'s A–G consequence checklist, the `P-09R` text, the safety audit, eligibility and readiness |
| `NEXT_ACTION.md` | what is settled, the five non-engineering prerequisites, and what is explicitly not recommended |
| `analysis/clarification.js` | the derivation. Reads **only** frozen run artifacts plus the locked cohort's own pole definitions in `ablate-l32g-state-separation.ts`. Calls no provider. Re-runnable at zero cost |
| `analysis/CLARIFICATION_DATA.json` | its output: the pole census, per-provider MUST-NOT-ASK / recall / precision posture, and `B08` across all six runs |
| `regression/` | the unchanged-code proof: 15 suites, 1,085 assertions, 0 failed, `tsc` clean |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, upstream, tags, stashes, digests, sealed-corpus hashes, the zero-egress record, and the documentation-change accounting |

**Adjudication only. Nothing implemented. No production, prompt, schema, validator, binder, scorer or
harness byte changed. `B08` not altered. No provider called. No credential read. `P-02R` and `P-08R`
neither re-derived nor modified. Historical precision measurements preserved exactly.**
