# §198 — the governed-binding contract, in two cases

## The rule §197 found being broken

> Do not ask the first pass to name an identifier it cannot observe.

`buildExpertUserPrompt` renders governed records to the first pass under **opaque handles** — `R1`,
`R2` — with their citations replaced by `[citation withheld]`. §139 did that deliberately, so the
forbidden citation token class never enters the model's context. The renderer has never shown a
`sourceId`.

§196 then added `governedEvidenceSourceIds` to the declaration schema and asked the model to name a
supplied governed `sourceId`. **The model was never shown one.** A compliant producer had no
legitimate value to write, and the binding was unexercisable in principle, not merely in practice.

## CASE 1 — zero supplied governed sources

**The capability is absent.** Not empty, not bounded, not a sentinel.

```
wire schema      governedEvidenceSourceIds is not in `properties` and not in `required`
system prompt    the governedEvidenceSourceIds paragraph is not in the declaration block
user prompt      no AVAILABLE GOVERNED EVIDENCE section
parser           the field is unavailable for this treatment; its absence is the normal shape
provider output  a declaration introducing the field fails closed at both layers
```

Asserted by cases **A1–A8** and **B1–B3**.

## CASE 2 — one or more supplied governed sources

**The capability is present and the exact permissible ids are rendered.**

The user prompt gains an appended block:

```
AVAILABLE GOVERNED EVIDENCE — these sourceIds and no others
  - sourceId: GOV-ABRASIVE-01
      text: Work rests shall be kept adjusted closely to the wheel with a maximum opening of
            one-eighth inch. Governing text: [citation withheld].
  Name one of these ids in governedEvidenceSourceIds when a record bears on a fact.
  Copy the id character for character. There are no other permissible ids, and an id
  you invent or respell discards the declaration that carries it.
```

and the schema gains `items: { type: 'string', enum: [<exactly the supplied ids>] }`.

### Every requirement the authorization set, and where it is proven

| requirement | how | case |
|---|---|---|
| exact `sourceId` must be provider-visible | rendered verbatim as `sourceId: <id>` | **C2**, **D1** |
| only supplied ids may be exposed | the renderer is given the supplied records and nothing else; no unsupplied id appears | **D3** |
| the id→text mapping must be deterministic | pure function of the supplied records; same input, same bytes | **F2** |
| no cross-pairing | each id's text follows its own id, checked line-adjacently | **F1** |
| no hidden internal identifier may be substituted | the opaque handles `R1`/`R2` are not reused in this block | **F4** |
| the provider must not invent or normalize ids | schema `enum` is the closed set; the boundary re-checks by exact equality | **C3**, **E1**, **E2** |
| downstream admission must verify every referenced id was supplied | unchanged `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET` | **E1**, **E4** |
| citation containment outside the authorized supplied evidence unchanged | v15 redaction, first-pass citation refusal, and the v3.3 verifier rule are all untouched | **G2**, **H1**, **H2**, **G4** |

### Two refusals the renderer makes rather than papering over

- a **duplicate** supplied id aborts (case **D4**) — silently de-duplicating would hide a caller
  error in the supply of governed evidence;
- an id that is **not a legal id** aborts (case **D5**) rather than being normalised, because
  quietly rewriting an identifier is how two different records end up sharing one. The shape is the
  same narrow `GOVERNED_SOURCE_ID_SHAPE` used for keys everywhere else.

## The one thing that is NOT exposed, and why

**The evidence text is still rendered through `redactCitationTokens`, exactly as v15 renders it.**

The authorization requires the exact `sourceId` to be provider-visible and requires citation
containment *outside the authorized supplied evidence* to remain unchanged. It does not require the
evidence **text** to arrive with its citations intact — and showing them would be actively wrong
here:

- v15's `HARD PROHIBITIONS` block still tells the first pass that reproducing a number from its own
  input is the same violation as inventing one;
- §196 gave the **first pass** no supplied-source citation-reuse allowance, and the projection
  refuses a citation-shaped string in any declaration field (case **H1**).

So a first pass shown a citation could only be punished for repeating it. The id is what the
contract needs, and the id is exposed exactly. The mapping stays deterministic because the rendered
text is a pure function of the supplied text.

**The residual, stated rather than implied:** a first pass cannot quote a governed citation. That is
v15's rule and not a §198 invention, and the supplied-source reuse allowance §196 built lives on the
**verifier** path, where the record arrives with `{sourceId, text}` and its citation intact. Case
**G4** confirms that path is unaffected.

If a future slice wants the first pass to quote governed citations, that is a decision about v15's
HARD PROHIBITIONS and §196's first-pass no-reuse rule together — a protocol question, not a
rendering one. §198 does not take it.

## What this does not change

The verifier path, the v3.3 supplied-source citation reuse rule, the identity computation, the
provenance table, the priority floor, and all three open §196 contract questions. §198 is transport
and protocol remediation only.
