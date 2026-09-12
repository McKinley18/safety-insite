# §200 — circuit-breaker: prospective recommendation

**The frozen §199 rule is not changed retroactively. §199's evidence stands exactly as recorded.**

## What §199 observed

`SG-01` failed pre-inference at sequence position 3. `SG-02` failed pre-inference at position 8 with
the **identical** normalised signature. Between them sat four completed inferences.

The rule requires **two consecutive** identical pre-inference rejections. They were not consecutive,
`consecutive` never exceeded 1, and the breaker correctly did not trip.

**The rule worked as specified. The specification is what is in question.**

The cost was $0.00 — neither call reached inference — so nothing was wasted in money. What was spent
is a **cohort row**: `SG-02` was consumed rediscovering what `SG-01` had already established.

## Why adjacency was the right guard, and why it is not enough

Adjacency exists to stop **stochastic model failure** from being read as a transport fault. Two rows
that both happen to produce malformed output are ordinary variation; a run that halted on them would
destroy the observations it was convened to collect. §198 case M3 asserts this deliberately.

But a **capability-class** failure is not distributed randomly across a cohort. It fires on exactly
the rows carrying the capability, and those rows can sit anywhere in a randomised order. Adjacency is
the wrong instrument for a fault whose incidence is determined by row *class* rather than by chance.

Both are true at once, which is why the answer is not "replace the rule".

## The recommendation

**Keep adjacency. Add a stage-local signature memory beside it, and gate that memory on whether the
rejection is contract-deterministic.**

```
STOP when EITHER

  (a) two CONSECUTIVE attempts share a normalised pre-inference signature      [the §198 rule]

  (b) a normalised pre-inference signature has ALREADY occurred for the same
      execution stage + request-contract class + wire-schema class
      AND the rejection is classified DETERMINISTIC_CONTRACT_REJECTION          [new]
```

Under (b), `SG-02` is never issued: `SG-01` already established the outcome for that
request-contract class, and an identical grammar produces an identical compilation result.

### The classification the new clause depends on

| class | meaning | example | breaker treatment |
|---|---|---|---|
| **DETERMINISTIC_CONTRACT_REJECTION** | the same request would be rejected the same way every time; the cause is in *our* request | *"The compiled grammar is too large"*; *"property 'maxItems' is not supported"*; an unknown tool name | **(b) applies** — never spend a second row |
| **TRANSIENT_INFRASTRUCTURE_FAILURE** | the same request might succeed later; the cause is not in our request | 429, 5xx, timeout, connection reset | **(b) does NOT apply**; only the consecutive rule (a) can fire |
| **ACCOUNT_STATE_REJECTION** | deterministic until an account changes | credit exhausted, model access denied | already stops on first occurrence |

**Classification must be conservative: unknown ⇒ TRANSIENT.** Misclassifying a transient failure as
deterministic truncates a run over a blip, and that is the more expensive error — it destroys
behavioural evidence, where the opposite error only wastes a row at $0.00.

Anchoring the class on `httpStatus` plus the provider's own `error.type` is not sufficient on its
own: §197's `maxItems` rejection and a hypothetical rate-limit both arrive as HTTP 400/4xx
`invalid_request_error` in some providers' encodings. The classification should key on the
**normalised message shape**, with an explicit allow-list of deterministic patterns and everything
else defaulting to transient.

### The risk of the new clause, stated plainly

**(b) can stop a run on a single observation.** If a provider ever returned a grammar-size rejection
non-deterministically — under load, say — clause (b) would halt a cohort that a retry would have
completed. I think that risk is small and the mitigation is cheap: the run stops, records
`SYSTEMATIC_PRE_INFERENCE_REJECTION` with the signature, preserves everything already obtained, and a
successor re-authorization can re-issue. Nothing is lost that a fresh authorization cannot recover,
and the $0.00 cost of the alternative is not the real currency — **cohort rows are.**

### What would have happened in §199 under the recommended rule

`SG-01` rejected at position 3 → classified `DETERMINISTIC_CONTRACT_REJECTION` → signature recorded
for `stage=firstpass, contract=<capability-present schema hash>` → `SG-02` **not issued** at position
8 → the run continues through the remaining capability-ABSENT rows, which is exactly what happened
anyway.

**Same evidence, one fewer row spent.** Note what this does *not* change: `SG-02` would still be
unexercised, and axes S, N, O and T would still be `NOT_EXERCISED`. The recommendation saves a row,
not a result.

## Implementation status

**Not implemented.** §200 authorises no code change to the breaker. This is a prospective
recommendation for whichever successor slice next issues provider calls, and it should be frozen in
that slice's preregistration rather than added quietly to the module.
