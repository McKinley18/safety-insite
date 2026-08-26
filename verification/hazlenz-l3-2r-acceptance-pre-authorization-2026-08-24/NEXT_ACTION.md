# L3-2r — the sealed acceptance run `NOT EXECUTED`

> ## `READY_TO_AUTHORIZE_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`
>
> **This phase does not authorize it and does not run it.** Authorization is a separate, explicit
> user act under §29.8.

## What authorizing means, stated plainly before anyone does it

1. **The stride is spent.** Opening it retires it permanently, pass or fail. §37.10 records **366
   independent rows — roughly four runs**, so the budget is finite and visibly counted down.
2. **A failure cannot be tuned away.** The opened stride never becomes a development, tuning or
   regression set, and nothing may be tuned against it and then re-labelled independent acceptance.
3. **Real employer, facility and location names from published regulator records will leave
   `127.0.0.1`** and reach `api.anthropic.com`, covered by the no-training prohibition and by
   non-retention-by-default. **Authorizing is the act that accepts this** (§3.3 residual).
4. **Passing does not deploy anything.** `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`
   through L3-3…L3-6, and `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.

## Before execution — two checks, both trivial, neither performed here

1. **Provide the credential.** `ANTHROPIC_API_KEY` is **absent**. Export it for the run only.
2. **Re-probe identity and callability** — `GET /v1/models/claude-sonnet-5` and one `POST /v1/messages`
   — and record both bodies. `D-69`/§46.2 is why: *listing is not callability, and a documented
   "stable" label is not availability.*

## The recommended command shape — `NOT EXECUTED`

Reuses L3-2o's instruments **byte-unmodified**. Nothing is tuned; `thinking` and
`output_config.effort` stay omitted, exactly as every recorded baseline ran.

```
# 1. record the sealed hashes BEFORE opening
shasum -a 256 safescope-data/gauntlets/safescope-gauntlet.seed.json \
              safescope-data/gauntlets/safescope-gauntlet.source.v1.json \
              safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json

# 2. transport, unchanged: anthropic-ollama-shim.js @ 76d3e039…
ANTHROPIC_MODEL_ID=claude-sonnet-5 node \
  verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js

# 3. ONE stride of the sealed corpus, through the sanctioned builder, one variant per process (§38.3)
#    — the stride selection rule is fixed in
#      verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md
#      and MUST be read and followed rather than re-invented here.

# 4. record the sealed hashes AFTER, and the full §4.1 identity set with the result
```

**Two runs in isolated processes**, per `P-08R` **A**, so material safety-outcome reproducibility is
measured rather than assumed.

## What is scored, and the gate it must clear

| axis | requirement |
|---|---|
| high-consequence misses | **ZERO** |
| clarification | **100 / 100 — precision AND recall** (`D-78`) |
| false ACTIVE | **ZERO** |
| `P-02R` B safety-consequential rejections | **ZERO** |
| `P-02R` F evidence/authority codes | **ZERO** |
| `P-09R` A MUST-NOT-ASK | **ZERO** questions |
| `P-08R` A material safety outcomes | **100% identical** across the two processes |

> **`claude-sonnet-5` measured 5/6 clarification precision on diagnostic material.** It may fail this
> gate. **That outcome would be the process working**, and it must be recorded as measured.

## Explicitly NOT recommended, and NOT done here

Re-running any provider for any other reason · tuning effort, prompt, schema, validator, binder or
clarification behaviour · altering `B08` · **building a name-level redactor now** (it would change the
input bytes and invalidate every recorded baseline) · building the production hosted adapter ·
selecting a production provider · beginning L3-3 · deploying.

## Still required before any CUSTOMER use — not before the exam

The hosted production adapter behind `HazLenzReasoningProvider` (**none exists**, §45.6 — the L3-2o
shim must not become it); **§45.5's name-level redaction decision, which §3.3 explicitly does NOT
close for production**; `P-11` egress telemetry; production credential management and rotation; and
ZDR as defence in depth.
