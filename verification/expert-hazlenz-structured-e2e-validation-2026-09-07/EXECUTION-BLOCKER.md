# §197 — the run stopped at the transport, before any inference

**12 provider calls attempted · 0 completed · 0 output tokens · $0.00 actual spend · 0 database
operations · no customer or production activation · no existing runtime file modified.**

Every one of the twelve first-pass requests was rejected by the provider with HTTP 400 **before
generation began**, with the same message on all twelve:

```
tools.0.custom: For 'array' type, property 'maxItems' is not supported
```

**No model behaviour was observed and none is reported.** The authorization is explicit that a
provider API failure before inference is an execution/infrastructure event, not a behavioural
failure, and that an unexecuted inference is never scored as model behaviour. Nothing in this
package scores one.

## Root cause, established deterministically with no further provider call

`TRANSPORT-REJECTION-DIAGNOSIS.json` rebuilds all twelve request bodies offline and compares the
keywords the vNext schema carries against the keywords the v15 schema carries — v15 being the schema
that has executed hosted many times.

**Exactly one keyword is introduced by vNext, and it is `maxItems`.** It occurs once per row, at

```
unresolvedFactDeclarations.items.properties.governedEvidenceSourceIds.maxItems = 0
```

§196 emits `maxItems: 0` there whenever **no governed evidence was supplied** with the request, so
that a model given no governed records has no legal way to name one. Ten of the twelve §197 rows
supply no governed evidence to the first pass, and the other two supply it under opaque handles
(see the second finding below), so all twelve requests carried it.

Anthropic's `strict: true` tool-schema mode rejects `maxItems` on an array and refuses the **whole
request**.

### Why nothing caught this before

`stripAnthropicUnsupportedKeywords` — the §108 compatibility strip — removes `minLength` and
`minItems` and nothing else. Its own comment records why it goes no further:

> it does not touch `minimum`, `maximum`, `pattern`, `maxLength` or `maxItems` (**none exist in this
> schema today**, and none would be touched if they did)

**§196 made that parenthesis false.** It introduced the first `maxItems` in the schema's history, and
nothing connected the new keyword to the adapter that would have had to strip it. §196's deterministic
suite passed 91/91 because it tested the schema as a *document*; the strip only matters for the
schema as a *request*.

## What this falsifies, stated plainly

§196 case **K3** asserted:

> with no governed evidence supplied, the wire schema forbids naming one at all
> — *transport refuses it, and the boundary refuses it again*

**The first half does not hold on the actual hosted transport.** The transport does not refuse the
id; it refuses the entire request. A structural guarantee that cannot be transmitted to the provider
is not a structural guarantee on the hosted path.

**The second half is untouched.** §196 cases K1 and K2 refuse an unsupplied governed `sourceId` at
the projection boundary, deterministically, and nothing here weakens that. The safety property
survives; the claimed *second layer* does not. That is the honest restatement: the two-layer claim
was right about the schema as a document and wrong about the schema as a request.

## Why no repair was applied inside §197

The authorization states:

> Do not modify treatment prompts, schemas, truth or thresholds after the first provider call.

and, for the neighbouring source-integrity case:

> Do not repair and then silently execute under the same preregistered state. Record the failure and
> obtain review if the correction changes any hashed treatment artifact.

Every candidate correction changes the per-row `wireSchemaSha256` frozen in
`PREREGISTRATION.json`. So the failure is **recorded and returned for review** rather than repaired
and re-run.

It is worth being precise about the strength of that argument, because the anti-tuning rule exists to
stop a treatment being changed after seeing how the model behaved, and **here the model behaved not
at all** — zero output tokens on every call. A narrow reading would permit a fix. The wider reading
is taken because the correction changes a hashed treatment artifact, which is the exact case the
authorization routes to review, and because the choice between the corrections below is a protocol
decision rather than a mechanical one.

## The three candidate corrections, for the owner to choose between

| | what it does | what it costs |
|---|---|---|
| **A** | extend the §108 Anthropic strip to remove `maxItems`, as it already removes `minLength` and `minItems` | the field becomes an unbounded array of strings, so the model *could* emit an id and the projection would refuse it as `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET`. The transport-level guarantee is given up; the boundary-level one — where this product's protection has always actually lived — is unchanged. Smallest change, and squarely the §108 precedent applied to a third keyword |
| **B** | omit `governedEvidenceSourceIds` entirely when the supplied set is empty, instead of bounding it at zero | **a stronger guarantee than `maxItems: 0`** — a model given no governed evidence has no field at all — and one the transport accepts. But it is a **vNext protocol revision**, not a transport workaround, and it makes the declaration item shape vary by request (which the schema already does for enums) |
| **C** | always supply the row's real governed `sourceId`s | incomplete on its own: rows with genuinely no governed evidence still need A or B |

My reading is that **B is the better architecture and A is the smaller change**, and that the choice
turns on whether the transport-level guarantee is worth a protocol revision. Either requires a fresh
§197-successor preregistration, because every per-row schema hash moves. **§197 does not make that
choice.**

## Second finding, also pre-spend: the first-pass governed binding is currently unexercisable

Found in Phase 0, before any call, and unrelated to the transport rejection.

`buildExpertUserPrompt` renders governed records to the first pass under **opaque handles** (`R1`,
`R2`, …) with **citations redacted** by `redactCitationTokens`, and never shows a `sourceId`. §139
did that deliberately, to keep the forbidden citation token class out of the model's context.

But §196's `governedEvidenceSourceIds` asks the first pass to name a supplied governed `sourceId`
**that it is never shown**. The binding is therefore *unexercisable at the first pass today* — the
model has no legitimate way to populate it.

§197 handled this by scoping the governed-evidence families to the **verifier** stage, where
`buildVerifierV3UserPrompt` renders `{sourceId, text}` verbatim with citations intact, which is where
§195 found the collision and where v3.3 actually lives. That scoping is sound and needs no change.
The finding stands on its own: **§196 built a first-pass binding that the first-pass prompt cannot
support**, and a future protocol revision that closes it must decide whether to expose `sourceId`s to
the first pass without exposing citations.

## Third finding: a §197 harness defect, reported not hidden

**The executor did not stop after the first identical pre-inference rejection.** It issued all twelve.

Cost was $0.00 because no request reached inference, so nothing was wasted in money — but this is the
§187A failure mode in a new costume, and §192's own preregistration named it: *"a credit rejection
stops the run on FIRST occurrence rather than reproving the account condition 39 times."* §197's
stopping rules covered credit rejection and the call and spend ceilings; they did **not** cover a
systematic pre-inference rejection.

The missing rule, for the successor protocol: **stop on the second consecutive pre-inference
rejection carrying the same provider error message.** One occurrence is an incident; twelve identical
ones establish nothing the first did not.

## Fourth finding: the scorer's own first draft reported green on an empty run

The first version of `score-197-deterministic-2026-09-07.ts` printed

```
P settlement      NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT
HARD FAILS        none triggered
```

on a run where **nothing executed**. Both statements were literally true and both read as passes.

That is the §193 lesson arriving on a different instrument: *an audit that cannot see its subject
must say so rather than return clean.* Every axis result is now routed through a helper that returns
`NOT_EXERCISED` on an empty denominator, and the hard-fail block reports `EVALUABLE: false` with the
note that *"none triggered" on this run means "nothing ran", NOT "the architecture held"*. Recorded
here rather than quietly corrected, because a defect that only the author ever sees teaches nobody.

## What §197 did NOT do

- did not execute the frozen §195 cohort, read it as stimulus, or modify §195 evidence
- did not reopen the §195 preregistration
- did not mutate `owed-fact.types.ts` or any §187-pinned contract
- did not add an owed-property field, and did not fold `missingFact` into `whyUnresolved`
- did not allow provider-authored priority to escalate `UNRESOLVED_SAFETY_STATE`
- did not change production, customer or database state
- did not open reserved formal-acceptance material or execute §189 material
- did not commit, push, tag, branch or deploy
- **did not repair the schema and re-run under the frozen preregistration**
