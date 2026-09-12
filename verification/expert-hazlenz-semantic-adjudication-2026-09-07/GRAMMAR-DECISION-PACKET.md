# §200 — governed-grammar remediation: four directions, side by side

**Nothing here is implemented. §200 makes no grammar change and no provider call.**

## The finding being remediated

Both capability-PRESENT §199 rows were rejected before generation:

```
HTTP 400  invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

Offline: capability-ABSENT sends ~18,620 bytes and is **accepted** on all ten rows;
capability-PRESENT sends ~19,060 and is **rejected** on both.

**The byte delta is not the threshold and must not be reported as one.** The provider's error names
*compiled grammar complexity*. An `enum`-constrained array of strings expands into far more grammar
than its serialised length suggests, and the true limit is undocumented. The only sound reading is
qualitative: **the schema is near a limit we cannot see, and the governed-binding capability does not
fit inside what remains.**

## What must not be destabilised

The ordinary capability-ABSENT structured first pass **has now completed hosted inference on ten of
ten rows.** That is the first working end-to-end path this programme has had. Any option that
perturbs it is buying the governed arm at the cost of the arm that works.

---

## Option A — shorten the vNext schema descriptions

**Change.** Cut the length of the `description` strings in the vNext wire schema until the
capability-present request fits.

| | |
|---|---|
| ordinary capability-ABSENT first pass changes? | **YES — every row, including the ten that just worked** |
| first-pass prompt changes? | no |
| wire schema changes? | yes, on every row |
| expected grammar reduction | proportional to text removed; **unquantifiable in advance** |
| depends on an undocumented provider threshold? | **YES, entirely — it is a shave-to-fit** |
| governed sourceId binding stays model-authored? | yes |
| governed evidence text visible to first pass? | no change |
| interaction with v15 citation restrictions | none |
| deterministic boundary changes | none |
| new semantic authority granted to the model | none |
| additional hosted validation required | **substantial** — descriptions are load-bearing treatment |
| reversibility | easy to revert, but the behavioural evidence gathered under the shortened text does not carry back |
| coupling | **unchanged — the monolith stays a monolith** |
| provider portability | **poor** — tuned to one provider's current limit |
| safety consequences | indirect but real: §104, §105 and §138 each *measured* first-pass behaviour changing with description wording |

**Assessment.** This is the option that most directly contradicts the owner's stated preference. It
buys nothing structural, it puts the ten working rows at risk, and it leaves the next capability
addition facing the same wall — closer to it.

---

## Option B — drop the `enum`, keep an unconstrained string array

**Change.** `governedEvidenceSourceIds` becomes `items: { type: 'string' }`; the boundary alone
enforces membership.

| | |
|---|---|
| ordinary capability-ABSENT first pass changes? | **no — the property is absent there anyway** |
| first-pass prompt changes? | no (the ids are already rendered in the user prompt) |
| wire schema changes? | only on capability-PRESENT rows |
| expected grammar reduction | **large and targeted** — the enum alternation is the expensive construct |
| depends on an undocumented threshold? | partly — it removes the *likely* cause without proving sufficiency |
| governed sourceId binding stays model-authored? | yes |
| governed evidence text visible to first pass? | no change |
| interaction with v15 citation restrictions | none |
| deterministic boundary changes | **none** — `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET` already refuses by exact set membership |
| new semantic authority granted to the model | **none** |
| additional hosted validation required | the governed arm only |
| reversibility | trivial |
| coupling | unchanged |
| provider portability | good — no provider-specific construct |
| safety consequences | **none demonstrable.** The transport-level closed set is given up; the boundary-level one is untouched, and §198 already established that the boundary is where this protection has always actually lived |

**Assessment.** The smallest change that plausibly works, and it costs nothing the product depends
on. Its weakness is that it is still a *fit-under-the-limit* move — it does not reduce coupling, and
it leaves the monolith near the ceiling.

---

## Option C — a separate smaller governed-binding contract / stage

**Change.** The governed binding leaves the first-pass schema entirely. The first pass emits
declarations exactly as it does today — **byte-identical to the path that just succeeded** — and a
second, small, strict-schema call binds already-declared facts to supplied governed `sourceId`s.

| | |
|---|---|
| ordinary capability-ABSENT first pass changes? | **NO — literally unchanged, including its hash** |
| first-pass prompt changes? | **no** — the governed paragraph and the `AVAILABLE GOVERNED EVIDENCE` block move to the new stage |
| wire schema changes? | the first-pass schema loses the capability branch entirely; a new, much smaller schema appears |
| expected grammar reduction | **largest** — the new contract carries a handful of fields, not the whole analysis |
| depends on an undocumented threshold? | **least of the four** — a small schema is far from any plausible limit |
| governed sourceId binding stays model-authored? | yes |
| governed evidence text visible to first pass? | **no — and that becomes a clean architectural statement** rather than a redaction compromise |
| interaction with v15 citation restrictions | **improves** — the first pass need not be shown governed text at all, so the v15 prohibition stops being in tension with the capability |
| deterministic boundary changes | new admission boundary for the binding stage; the existing projection is unchanged |
| new semantic authority granted to the model | **none** — binding is still declaration-plus-validation against a closed set |
| additional hosted validation required | **most** — a new stage needs its own protocol, preregistration and hosted validation |
| reversibility | high, because it is additive: the working path is untouched |
| coupling | **reduces it** — this is the only option that does |
| provider portability | **best** — small schemas are portable; it also removes the near-limit monolith as a standing risk |
| safety consequences | the fact and its binding become separable, so a fact can exist unbound; that is arguably *more* honest than a binding smuggled into the same emission |

**Assessment.** The only option that answers the owner's stated preference — *reduce structural
coupling and provider-visible grammar complexity rather than shave syntax to fit*. It also resolves
the §199 first-pass tension where the model is shown a `sourceId` but a redacted text. Its cost is
real and should not be minimised: a new stage is a new protocol, a new preregistration, and a new
hosted validation, and it makes the analysis non-atomic across two calls.

**It also composes with B.** If a small binding stage still needed headroom, dropping the enum inside
it is a one-line follow-up.

---

## Option D — abandon strict tool-schema mode for the first pass

**Change.** Send the first pass without `strict: true`.

| | |
|---|---|
| ordinary capability-ABSENT first pass changes? | **YES — fundamentally, on every row** |
| wire schema changes? | the schema stops being enforced at all |
| expected grammar reduction | total — there is no compiled grammar |
| depends on an undocumented threshold? | no |
| deterministic boundary changes | none, but the boundary becomes the **only** validation |
| new semantic authority granted to the model | none formally, but every transport-level guarantee disappears at once — enums, required fields, `additionalProperties: false` |
| additional hosted validation required | **very substantial** — every §104/§105 finding about schema-driven output shape would need re-establishing |
| reversibility | easy to revert; the evidence does not carry back |
| coupling | unchanged |
| provider portability | good |
| safety consequences | **the largest of the four.** §104 measured `EVIDENCE_QUOTES_EMITTED = 0` when omission was free; §105 measured one-participant insights when the schema under-specified. Strict mode is doing measurable work |

**Assessment.** Solves the stated problem and creates a larger one. Recorded for completeness; I
would not put it forward as a serious candidate on this evidence.

---

## Against the owner's stated preference

> *Prefer reducing structural coupling and provider-visible grammar complexity over merely shaving
> enough schema syntax to fit beneath the current provider limit.*
>
> *Explicitly evaluate whether governed-source binding should become a separate smaller contract /
> stage rather than an optional branch inside the already near-limit monolithic first-pass schema.*

| option | reduces coupling? | reduces grammar complexity? | shave-to-fit? | risks the proven path? |
|---|---|---|---|---|
| A shorten descriptions | no | marginally | **yes** | **yes** |
| B drop the enum | no | yes, targeted | partly | no |
| C separate stage | **yes** | **yes, structurally** | no | **no** |
| D drop strict mode | no | n/a | no | **yes** |

**On the preference as stated, C is the answer and B is the pragmatic fallback.** C is the only
option that reduces coupling; B is the only other one that leaves the ten working rows untouched.

Two things I would not let pass without saying:

1. **C's cost is a whole new validation cycle**, and this programme has now spent §195, §197, §198
   and §199 without a semantic result. If the priority is getting the *governed arm* exercised
   quickly, B does that with far less ceremony and can be superseded by C later — B is not a
   commitment against C.
2. **Neither B nor C is proven to fit.** The threshold is undocumented. Any option should be
   validated by an offline request build followed by a **single-row transport canary**, exactly as
   §199 did — that pattern worked and cost one call.

**§200 does not choose.** This is the decision packet the authorization asked for, and the choice is
the owner's.

## What this packet does not do

No grammar remediation is implemented. No schema, prompt, boundary or contract is modified. No
provider call was made to produce any figure here — the byte measurements were rebuilt offline from
the frozen §199 request construction.
