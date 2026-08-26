# Index — L3 Run-2 Capacity Reclassification After Funding Increase (2026-08-25)

`READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5` ·
`PROVIDER_CAPACITY = PASS` · `RUN2_HOLDOUT_SPENT = FALSE` · provider calls **0** · API cost **$0.00**

| Path | What it is |
|---|---|
| `STATUS.md` | The reclassification, the re-derivation proof, and the unchanged uncertainty |
| `NEXT_ACTION.md` | The one outstanding gate — **explicit user authorization** — plus the `D-K` wiring still owed at execution time |
| `cost/reclassify-run2-capacity.js` | The derivation. Changes **one** input ($16.97 → $40.00), re-derives the requirement from primary evidence, **fails closed** if it does not reproduce |
| `cost/CAPACITY_RECLASSIFICATION.txt` | Verbatim output of that script |
| `preservation/PRESERVATION_AND_UNSPENT.txt` | HEAD, Run-2 identities recomputed from actual files, the prior package verified 6/6 intact, the credential presence probe, and the zero-spend proof |

## Reproduce

```
node verification/hazlenz-l3-run2-capacity-reclassification-2026-08-25/cost/reclassify-run2-capacity.js
```

Deterministic, offline, free. It reads the prior phase's script digest and the Run-1 transport log,
and nothing that costs money.

## Relationship to the prior phase

`verification/hazlenz-l3-run2-capacity-determination-2026-08-25/` — the `$16.97` determination — is
**NOT REWRITTEN**. All six of its files verify byte-identical against its own `PACKAGE_MANIFEST.txt`.
That determination was **correct on its input** and was **superseded by a funding change, not
amended**. This package supersedes only its *classification*, never its arithmetic: `A`, `B` and the
`$18.038745` requirement are re-derived here and **reproduce exactly**.

## What was deliberately not re-done

- **No provider callability test.** `D-93` (§60) already proved it and §61 corroborated it across 40
  HTTP-200 calls. Funding changing is not a reason to re-buy existing evidence.
- **No model-identity re-probe.** `respondedModel = claude-sonnet-5` on every one of those 40 calls.
- **No execution-path re-traversal.** Prompt, schema, binder and validator traversal already measured.
- **No token re-analysis.** The frozen figures reproduced, so re-deriving them from scratch would have
  added nothing.

The only new measurement is a **zero-cost, non-transmitting credential presence probe** with a
positive control — run solely to confirm the configuration had not materially changed.

## What this package does not do

It does not execute Run-2 acceptance and it does not authorize it. `READY_TO_AUTHORIZE` means the
financial gate passed and the remaining gate is a **user decision**.
