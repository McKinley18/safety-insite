# §199 — what actually happened

**20 provider calls attempted · 18 reached inference · 18 completed · 2 rejected before inference ·
$0.81666 actual spend · 0 database operations · no customer or production activation.**

## The transport canary reached inference

`SF-01`, a reused capability-absent row, was the first call. It returned `outcome: ANALYZED` with one
structured unresolved-fact declaration that projected cleanly to one `OwedFact`.

**That is the first completed inference of the structured first-pass pipeline in this programme's
history.** §195 never executed; §197 was rejected twelve times before generation; §198 made no calls
at all. The §198 capability-omission remediation is what made the ordinary first-pass request
transportable, and the canary is the evidence.

The canary was **not disposable** and was not treated as one: its output is `SF-01`'s real
experimental result and is scored and adjudicated like every other row.

## Ten of twelve rows completed. The two governed rows did not.

| | rows | result |
|---|---|---|
| capability **ABSENT** | 10 | **all reached inference and completed** |
| capability **PRESENT** | 2 (`SG-01`, `SG-02`) | **both rejected before generation** |

```
HTTP 400  invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

Zero output tokens, $0.00 for both. **This is an execution/infrastructure event, not model
behaviour, and nothing in this package scores it as one.** See
`CAPABILITY-TRANSPORT-DIAGNOSIS.json`.

It is a **different** rejection from §197's. §197 failed on an unsupported keyword (`maxItems`) on
*every* row; §199 fails on grammar size, on *only* the rows that carry the governed-binding
capability. §198 removed the first cause and could not have detected the second, because §198 made
zero provider calls and byte-level schema inspection does not predict a grammar budget.

### The measurement, made offline with no further calls

| | sent-schema bytes |
|---|---|
| v15 baseline | ~15,200 |
| vNext, capability **ABSENT** | ~18,620 — **accepted** |
| vNext, capability **PRESENT** | ~19,060 — **rejected** |

**A margin of roughly 440 bytes separates accepted from rejected.** Byte size is not the provider's
metric — grammar complexity is, and an `enum`-constrained array of strings adds disproportionately
to it. The honest reading: **the vNext first-pass schema is sitting at the edge of this provider's
grammar budget, and the governed-binding capability does not fit inside what is left.**

This does **not** show the capability contract is wrong. §198 case C proved it well formed and §199
case H proved every supplied `sourceId` is visible in its row's prompt. What it shows is that the
resulting request is not transportable to this provider under strict tool-schema mode.

## The circuit breaker behaved exactly as specified — and that is worth examining

`SG-01` failed at position 3 and `SG-02` at position 8, with completed inferences in between. The
breaker requires **two consecutive** identical pre-inference rejections, so it did not trip, and
`consecutive` never exceeded 1.

That is correct against the frozen §198 rule and against §198 case M3, which deliberately asserts
that an inference-reaching attempt breaks a streak — a rule that exists to stop ordinary model
variation from being mistaken for a transport fault.

**But the consequence here is that the second governed row was spent proving what the first had
already established.** The cost was $0.00 because neither reached inference, so nothing was wasted
in money — but the design observation stands and is recorded for the successor:

> a *same-signature-seen-twice-within-a-stage* rule, not requiring adjacency, would have stopped
> after `SG-01`. Adjacency is the right guard against stochastic model failures; it is the wrong
> guard against a **capability-class** failure that only some rows in a cohort can trigger.

**The rule was NOT changed during or after the run.** Changing a frozen stopping rule mid-protocol is
exactly what the preregistration forbids. It is a successor decision.

## Declarations and projection

**9 raw declarations · 8 admitted · 1 refused.**

The single refusal is `SF-05`:

```
REQUIRED_FIELD_MISSING  decisionIfA is empty
REQUIRED_FIELD_MISSING  decisionIfB is empty
```

The model emitted a declaration on the interlock function-versus-appearance row and left **both**
decision-divergence fields empty. The boundary refused it whole and projected nothing — which is the
fail-closed behaviour §196 built, observed for the first time against real model output rather than a
fixture. It is also a genuine first-pass defect, and `SF-05` therefore produced zero projected facts
against a preregistered expectation of one.

## Verifier phase

All eight projected facts were sent to verifier-v3.3. **All eight reached inference and all eight
were admitted.** Verdicts: seven `VERIFIED_AS_IS`, one `NO_CLARIFICATION_REQUIRED` — the latter on
`SF-04`, where the verifier declined to require a clarification for a fact the first pass had
declared on a row whose preregistered expectation was **zero** gaps.

**Zero citation-shaped tokens were emitted across all eight verifier calls.** Since both engineered
governed opportunity rows never reached inference, no verifier call ever saw governed evidence.

## Counts against the preregistered ranges — and what they are not

**7 of 10 executed rows** produced a declaration count inside their preregistered range. The three
outside it:

| row | expected | observed | what it may indicate — **for human adjudication, not decided here** |
|---|---|---|---|
| `SF-05` | 1 | 0 admitted (1 refused) | a structurally malformed declaration on a real gap |
| `SF-04` | 0 | 1 | a possible false gap on a no-gap row — the partner of `SF-06` |
| `SF-02` | 2 | 1 | a possible multi-gap recall miss |

**This is a count comparison, not a correctness verdict.** A row can hit its expected count while
declaring entirely the wrong property, and a row outside the range may still be right. `SF-01`'s
computed key is `FP.HAZARD_SEVERITY.…` where the preregistered expectation was `REQUIRED_CONTROL` —
also a matter for axis G and the human packet.

## Spend

```
ACTUAL PROVIDER SPEND   $0.81666      provider-returned usage only
input tokens            299,671
output tokens            21,732
calls                    20 of a 36 ceiling
```

The two rejected calls contributed **$0.00** to actual spend and their frozen worst case to the
reservation, which governs the ceiling and is never reported as money.
