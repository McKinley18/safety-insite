# §198 — successor cohort reuse: a decision note, not a decision

**No provider execution may occur until the product owner makes this choice.** §198 prepares the
comparison and takes no position on which option to adopt.

## The classification the authorization fixed

The twelve §197 scenarios are:

```
BEHAVIORALLY_UNSPENT     0 completed inference calls, 0 model outputs, 0 semantic observations
PROTOCOL_EXPOSED         used in protocol debugging and seen by the development team
```

Both halves are true and they pull in opposite directions. That is why this is a decision note
rather than a default.

## What is actually established about the twelve rows

| | status |
|---|---|
| seen by any model | **no** — every request was rejected before generation |
| output tokens produced | 0 |
| semantic observations | 0 |
| adjudicated | none; the §197 packet is `NOT_ADJUDICABLE` with 48 empty slots |
| used to debug the protocol | **yes** — all twelve were rebuilt offline for the keyword diff, and are rebuilt again in §198's `REQUEST-COMPATIBILITY.json` |
| authored by | AI-assisted; `PRODUCT_OWNER_REVIEWED = FALSE`, never the semantic oracle |
| design integrity | 3 matched gap/no-gap pairs balanced on equipment and vocabulary, a two-gap row, a conjunctive row, a governed-quotation opportunity, an unsupplied-citation containment opportunity, 10–11 expected owed facts |

**What "protocol exposed" does and does not mean here.** The exposure is to the *development
process*, not to a model. No output conditioned on these observations exists anywhere. The risk it
creates is familiarity in the *authors* — the rows were designed once, then re-read repeatedly while
diagnosing a transport defect, and a row an author has stared at is a row an author may have quietly
started designing toward.

Concretely, the rows most exposed to protocol work are the two carrying governed evidence — **SF-09**
and **SF-10** — because §198's capability split, the `AVAILABLE GOVERNED EVIDENCE` renderer and the
request-compatibility report all turn on exactly those two. The other ten were rebuilt mechanically
and their *content* played no part in any design decision.

## The three options

### OPTION 1 — reuse the exact §197 cohort under a fresh preregistration

**For.** No model has seen it. The design work is done and is good: matched pairs balanced on
surface features, a genuine multi-gap row, a conjunctive row with a preregistered *range* rather
than a forced single count, and two governed opportunities. Re-authoring risks producing a weaker
cohort. It is also the cheapest path to the semantic evidence §197 was convened to gather and still
has not produced.

**Against.** The authors have now read these twelve rows many times while fixing a protocol. Nothing
in the §198 changes was *chosen* to suit them — the capability split is driven by a provider error,
not by a scenario — but that is an argument from intent, and intent is not evidence.

**Cost.** A fresh preregistration only.

### OPTION 2 — construct a fresh matched cohort

**For.** Eliminates protocol-development familiarity entirely. The authored-truth discipline is now
well established and a second cohort would be quicker to build than the first.

**Against.** Discards sound design for a risk that is real but unquantified, and re-authoring is
where authored-truth defects enter — a fresh cohort is *new* truth, not *verified* truth. It also
delays the semantic evidence again, and §195, §197 and now §198 have each ended without it.

**Cost.** Fresh authoring, a fresh design-defect check, and a fresh preregistration.

### OPTION 3 — reuse most, replace the most protocol-sensitive rows

Replace **SF-09** and **SF-10** — the two governed-evidence rows, which are the rows §198's
capability work actually turned on — and reuse the other ten.

**For.** Targets the exposure that is arguable rather than the exposure that is nominal. Keeps the
three matched pairs, the multi-gap row and the conjunctive row intact, which are the parts hardest
to re-author well.

**Against.** Two fresh rows must be authored to the same standard as the ten they sit beside, and a
partly-fresh cohort is harder to describe honestly than a wholly-fresh or wholly-reused one. The
governed-evidence families are also the ones whose design is most constrained, so a replacement
would look substantially like the original.

**Cost.** Two rows of fresh authoring plus a fresh preregistration.

## What must be true of the successor preregistration under any option

- a **new protocol id**, because §197's is retired;
- **two** system-prompt hashes — one per capability variant — since the prompt is now capability-dependent;
- **per-row** `wireSchemaSha256`, since the schema is per-request and now also per-capability;
- the remediated user-prompt hash per row, since the `AVAILABLE GOVERNED EVIDENCE` block changes it
  on capability-present rows;
- the circuit breaker wired into the executor, with its stop rule preregistered;
- reuse, if chosen, **declared explicitly before spend** with this exposure recorded alongside it —
  never assumed because §197 produced no inference.

## The one thing §198 will say plainly

Reuse is **not** automatically authorized by the absence of inference, and discard is **not**
automatically required by protocol exposure. `Q2` in the §198 suite proves every §197 per-row schema
hash has moved, so no path avoids a fresh preregistration; the only question is whether the
scenarios inside it are the same twelve.
