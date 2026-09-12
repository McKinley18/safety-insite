# TOKEN-BASELINE-210A

Reconstructed from the frozen `CALL-LEDGER-208.jsonl` and `CALL-LEDGER-208B.jsonl`. Zero provider
calls were made to produce it. Machine-readable form: `TOKEN-BASELINE-210A.json`.

**Authoritative stack** = §208 first pass + §208 governed stage + **§208B recovered verifier**. The
§208 verifier leg is `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE`; its figures are listed once, clearly
separated, and excluded from every total.

## Measured baseline, 24-case cohort

| Stage | Calls | Input tokens | Median | p95 | Output tokens | Cost |
|---|---|---|---|---|---|---|
| FIRST_PASS | 24 | 586,555 | 24,440 | 24,493 | 52,398 | $1.6971 |
| GOVERNED_STAGE | 1 | 2,778 | 2,778 | 2,778 | 145 | $0.0070 |
| VERIFIER (§208B) | 24 | 217,911 | 9,106 | 9,493 | 17,625 | $0.6121 |
| **Authoritative total** | **49** | **807,244** | — | — | **70,168** | **$2.3162** |
| *(excluded: §208 verifier, defective input)* | *24* | *207,019* | *8,613* | *8,753* | *19,042* | *$0.6045* |

**Cost per executed observation: $0.0965.** Pricing solved from the ledger itself — **$2.00/Mtok
input, $10.00/Mtok output** — and it reproduces every recorded `costUsd` to the cent with zero
residual across all 24 first-pass rows.

## Call ratios

- Calls per observation: first pass **1.00**, verifier **1.00**, governed **0.04**
- Calls per admitted OwedFact: **1.00** (24 verifier calls / 24 admitted facts)
- **Deterministically elided calls, already working today:** verifier skipped on AC-04, AC-06, AC-23,
  AC-24 (zero admitted facts); governed skipped on AC-23, AC-24. TBR-4 is already satisfied at this
  boundary.

## The dominant finding: input is almost entirely static

| Stage | Min input | Max input | Spread across the whole cohort |
|---|---|---|---|
| FIRST_PASS | 24,388 | 24,512 | **124 tokens (0.5%)** |
| VERIFIER | 8,759 | 9,553 | **794 tokens (9.1%)** |

Twenty-four observations of genuinely different workplaces, hazards and text produce first-pass
requests that differ by **124 tokens in 24,400**. The case-specific payload is therefore bounded above
by 124 tokens; **at least 99.5% of every first-pass request is the same instruction and schema block
re-sent.** For the verifier the static floor is at least 8,759 tokens, ≥91% of the request.

This is a bound, not a decomposition: the ledgers record whole-request `inputTokens` only. The bound
is what the evidence supports and no finer attribution is claimed.

## Caching is available and is not being used

| Identity | Distinct values across 24 calls |
|---|---|
| Verifier system prompt | **1** |
| Verifier schema | **1** |
| Verifier wrapper | **1** |
| Verifier user prompt | 24 |
| First-pass transmitted schema sha256 | **24** |
| First-pass grammar id | 3 |

The verifier's entire static half is **byte-identical across all 24 calls** and was re-sent in full
every time. No cache-read or cache-write token field exists anywhere in the ledgers, so caching was
not merely ineffective — it was not instrumented at all.

The first pass has the opposite problem: **24 distinct schema hashes** (the schema embeds
case-specific hazard-family enums), so a naive prefix cache breaks on every call even though the
instruction prose is stable. Three distinct grammar ids across the cohort, grouped
`8b9847471b4812ce` (6 cases) / `c0df75103834b03c` (17) / `0248677c838b44b3` (AC-24).

## Modelled saving from caching alone — no semantic change

At Anthropic cache pricing (write 1.25x, read 0.1x), holding all content identical and only
reordering so the stable block is a strict prefix:

| Stage | Static tokens re-sent today | Cached equivalent | Saving |
|---|---|---|---|
| FIRST_PASS | 585,312 | ~86,600 | ~498,700 tokens ≈ **$1.00** |
| VERIFIER | 210,216 | ~31,100 | ~179,100 tokens ≈ **$0.36** |
| **Total** | | | **≈ $1.36 of $2.32 — about 59% of run cost** |

**This is the largest single saving available and it removes no semantic information whatsoever.** It
is a transmission-order and instrumentation change, not a content change.

## Honestly unavailable

- **Cached input tokens** — no cache-read/cache-write field exists in either ledger. No cached-token
  baseline exists and none is inferred. TBR-15 is `NOT_YET_MEASURED` for this reason.
- **Per-component token attribution inside a request** — bounded by cohort spread, not measured.
- **Governed-stage detail** — one executed call; no distribution can be reported from n=1.
- **Latency/cost under caching** — not measurable without executing, which §210A forbids.
