# §250 — Executable Successor Driver-Role Hosted Confirmation: Final Report

Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_DRIVER_ROLE_CONFIRMATION_INVALID —
    PRODUCT_OWNER_REVIEW_REQUIRED

The pre-spend gate passed and execution proceeded. All six frozen cases were rejected by the provider
with HTTP 400 **before generation**, so no case reached inference and no driver-role evidence exists.
This is an execution-integrity failure before valid measurement, not a capability result.

## Required report fields

| Field | Value |
|---|---|
| Pre-spend gate | **PASS** — 13 / 13 |
| Cases transmitted | **6 / 6** |
| Provider calls | 6 confirmation, plus 7 diagnostic |
| Transport contingencies | 0 |
| Spend | **USD 0.00** on the confirmation; all six rejected pre-generation with zero tokens billed |
| Frozen spend ceiling | USD 2.00 (executor), design estimate under USD 1.00 |
| Executable Candidate Identity | `e59cbf26b67a030068a091e8df84f57333c7b19dda28c8718a749d757c8993e6` — matched live |
| Confirmation instrument | `e45fc33843e71b778b0f2af8c41356855bf670de80e719b8371f21f894269b9f` — unchanged |
| Actual prompt | `build247SystemPrompt` |
| Actual schema | `buildExpert247WireSchema` |
| roleJustification transmitted | **YES** — present in the assembled request |
| K6 schema | **6 admissible / 0 inadmissible** |
| Strict schema | **ENABLED** |
| Role-presence coherence | **not measured** |
| Required | 5 / 6 |
| Hard gates passed | **not measured** — 0 of 6 evaluable |
| Unsafe under-restrictions | not measured |
| Over-restrictions | not measured |
| Manufactured controlling/cessation facts | not measured |
| Controlling-vs-follow-up errors | not measured |
| K6-invalid generated structures | not measured — nothing was generated |
| Deterministic consistency rejections | **0** — the deterministic layer never ran |
| Authority regressions | 0 |
| Driver-role confirmation | **NOT MEASURED** |
| §243 changed | NO |
| §248 changed | NO |
| Successor candidate frozen | NO |
| Database operations | 0 |
| Commit / push / tag / deploy | NONE |

Every "not measured" is exactly that. None is a pass, none is a zero result, and none may later be
read as either.

## What happened

The gate passed on all thirteen checks, including a live re-derivation of the executable identity
matching the frozen digest. The six frozen observations were transmitted once each through the
canonical production path. Every one returned HTTP 400 in under half a second, never reaching
inference, with no tokens billed.

## Two distinct causes, and the second is the serious one

**C1 — the §247 schema exceeds the provider's union-type limit.** The provider's message:

> Schemas contains too many parameters with union types (20 parameters with type arrays or anyOf).
> This causes exponential compilation cost. Reduce the number of nullable or union-typed parameters
> (limit: 16 parameters with union types).

`JUSTIFICATION_SCHEMA_247` declares four nullable fields as `type: ['string','null']`. The K6 union
replicates the justification object across five role branches, so twenty union-typed parameters reach
the provider against a limit of sixteen. The §246 offline probe never caught this because it
exercised only `ref`, `refKind` and `driverRole` and never included the justification object. A
single nullable field transmits fine, which is why any isolated check would have passed.

**C2 — the §239 base schema is also rejected, and this is independent of §247.** The provider's
message:

> The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas
> or reduce the number of strict tools.

Grammar compilation happens only under a strict tool schema. Both schemas transmit successfully with
`strict` off and both fail with it on, verified by bisection:

| Schema | strict | Result |
|---|---|---|
| §239 full wire schema | true | 400 — grammar too large |
| §247 full wire schema | true | 400 — 20 union-typed parameters |
| §239 full wire schema | false | 200 |
| §247 full wire schema | false | 200 |

So **§243 transmitted successfully precisely because it omitted the strict flag** — the omission §244
called a defect and §246/§247 repaired. Enabling strict enforcement is what surfaced a size limit the
Expert wire schema has presumably exceeded for some time. The repair was correct as a parity fix and
it has made the contract untransmittable in its current shape.

## Classification, stated carefully

This is a **PROVIDER STRUCTURAL/CONTRACT FAILURE**. It is not a provider role-selection failure,
because no model ever saw a case. It is not correct fail-closed containment, because the deterministic
layer never ran. It is not a transport failure, because the rejection is deterministic and
reproducible, which is also why no contingency retry was spent: identical bytes would return 400
again.

The §247 stopping rule is **not** triggered. That rule fires when the confirmation runs and fails its
role-coherence condition. Nothing was measured, so the driver-role representation has still received
no hosted confirmation.

## What I did not do

I did not remediate. No schema, prompt, envelope, contract or instrument was modified, and the
instrument is preserved for a successor freeze. I did not retry any case, tune anything, or reduce
the schema to make a call succeed.

Diagnostics used a synthetic prompt. **No frozen observation was transmitted in any diagnostic call**,
so the six observations remain unspent as hosted stimuli in the sense that matters: the model has
never been asked any of them. Five diagnostic calls were rejected at no charge; two returned 200 with
a ten-token prompt and minimal output whose usage I did not capture, estimated well under one cent.

## Evidence integrity

§243 stands at D HOLD RELEASE. §247, §248 and §249 are preserved byte for byte; nothing prior was
retroactively altered. This §250 package is new and additive.

## The decision this returns

The Expert wire schema cannot be transmitted under strict structured-output enforcement. That is a
product architecture question, not a driver-role question, and it has to be settled before any
confirmation of any representation can run. Three shapes it could take, none of which I have
authority to choose:

1. Reduce the transmitted schema below the provider's grammar and union-type limits, which is a
   contract-size change and touches semantics.
2. Run without strict enforcement and accept the five structural failure modes §244 attributed to its
   absence, recording that as a known limitation.
3. Split the request into smaller strict tools, or move part of the contract off the tool schema,
   which is a request-architecture change.

Whichever is chosen, the §247 justification object also needs its union-typed parameter count brought
under sixteen, and any future offline schema probe must exercise the **whole** transmitted schema
rather than the fragment under active development.

STOP.
