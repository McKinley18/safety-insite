# Index — L3 Run-2 Zero-Cost Capacity Determination (2026-08-25)

`L3_RUN2_CAPACITY_BLOCKED — ADDITIONAL_CREDIT_REQUIRED` · `RUN2_HOLDOUT_SPENT = FALSE` ·
provider calls **0** · API cost **$0.00**

| Path | What it is |
|---|---|
| `STATUS.md` | The determination, the projections, and the stated uncertainty |
| `NEXT_ACTION.md` | The exact prerequisite: **≥ $1.07** more credit, then five further gates |
| `cost/compute-run2-capacity.js` | Deterministic recompute. Reads Run-1 transport logs only; makes no provider call |
| `cost/CAPACITY_DETERMINATION.txt` | Verbatim output of that script |
| `preservation/PRESERVATION_AND_UNSPENT.txt` | HEAD, holdout SHA, artifact identity — all recomputed from actual files — plus the zero-spend proof |

## Reproduce

```
node verification/hazlenz-l3-run2-capacity-determination-2026-08-25/cost/compute-run2-capacity.js
```

Deterministic, offline, free. It reads
`verification/hazlenz-l3-sealed-acceptance-2026-08-25/transport/transport-{A,B}.jsonl` and nothing
else that costs money.

## Evidence sources, all pre-existing

- **Token accounting** — `hazlenz-l3-sealed-acceptance-2026-08-25/transport/transport-A.jsonl`,
  40 HTTP-200 rows carrying `promptTokens` / `outputTokens`, written by the frozen shim `76d3e039`.
- **Pricing** — `hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/provider/OFFICIAL_DOCUMENTATION.md`
  assertion 13: `$2` / `$10` per MTok, source URL + 2026-08-24 retrieval date.
- **Frozen workload** — `hazlenz-l3-run2-acceptance-holdout-2026-08-25/ACCEPTANCE_ARTIFACT_FREEZE.txt`,
  93 rows × 2 isolated processes = 186 required provider evaluations.
- **Retry policy** — frozen ceiling of one (`runValidatedReasoning`); shim transport retry
  `MAX_ATTEMPTS = 4` on 429/5xx/transport faults only.

## What this package does not do

It does not execute Run-2 acceptance, authorize it, or move it closer to being authorized beyond
answering the single question it was scoped to: **is $16.97 enough financial capacity to risk the
fresh single-use Run-2 corpus?** The answer is **no, by $1.07**.
