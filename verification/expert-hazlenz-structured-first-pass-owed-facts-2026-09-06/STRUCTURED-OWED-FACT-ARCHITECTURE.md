# §196 — the structured unresolved-fact representation

## The shape is not new, and that is the point

The authorization asked for the *smallest* prospective protocol extension that can truthfully
generate an `OwedFact` without semantic reconstruction, reusing existing repository concepts and not
duplicating `OwedFact` under an unrelated parallel schema.

The repository already had a model-emitted owed-fact representation. §166's verifier v3 wire schema
carries `nominatedFact`, nine required fields, validated by rules that are exactly the rules an
owed fact needs:

```
missingFact · observationSpan · notEstablishedBecause · affectedDecision
branchA · decisionIfA · branchB · decisionIfB · whyNecessaryNow
```

A first-pass unresolved fact **is that object**, produced one stage earlier and carrying a different
`source`. So `unresolvedFactDeclarations` is the v3 nomination shape with three additions the first
pass genuinely needs and the verifier does not:

| added field | why the verifier does not need it |
|---|---|
| `observationSourceId` | the verifier reasons over one observation; the first pass over several `authoritativeSources`, so the span must say which it came from |
| `governedEvidenceSourceIds` | the verifier declares reliance in `regulatoryBasis`; the first pass had no structured route to bind a fact to a supplied governed record |
| `declarationId` | a **within-response handle** so a clarification can point at an entry. It is not the fact's identity — see below |

One consequence worth stating plainly: **a first-pass declaration and a verifier nomination now
project through the same code**, `projectDeclaredOwedFacts`, parameterised only by the declaring
stage. One projection, two sources.

## What the provider is given no field for

`factKey` · `priority` · `status` · `source` · `modelAuthored` · `acceptableEvidence`

Every one of them decides something, and §170's rule is that HazLenz populates every field of an
`OwedFact` that decides anything. A field that does not exist cannot be filled — the same reasoning
that made `decisionCriticalClarifications` a sibling collection rather than a candidate-owned one,
and that removed v1's `whatIsMissing` free-text twin rather than instructing the model not to use it.

A declaration that sends one of these anyway is **refused with a countable code**
(`PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD`), not sanitised. Sanitising teaches nothing and hides a
provider trying to write governance state; refusing produces something the evaluation phase can
count. Proven by cases B9, I3 and O4.

## Fact identity

The authorization set five preferred properties. What the design achieves, and what it does not:

| property | achieved | how |
|---|---|---|
| deterministic stability for the same structured property | **yes, within an analysis** | the key is a pure function of the declaration and the supplied source text |
| no dependence on free-form rationale prose | **yes** | no rationale, question, explanation or `missingFact` text enters the key |
| closed namespace where practical | **yes** | `FP.` / `VN.` stage prefix, closed-vocabulary decision, supplied source id, HazLenz-computed offsets |
| no provider ability to impersonate a supplied fact | **yes, structurally** | there is no `factKey` field on the wire. A provider cannot name a fact at all |
| compatible with verifier exact-binding semantics | **yes** | the composed key is checked against v3's own `KEY_SHAPE`; case J4 admits a real v3.2 verdict binding a projected key |

The key is composed as

```
FP.<affectedDecision>.<observationSourceId>.<startOffset>-<endOffset>.<ordinal>
```

for example `FP.REQUIRED_CONTROL.OBS-1.95-144.1`.

Each part is either a closed vocabulary or externally anchored. The offsets are **HazLenz's own
measurement** of the model's span — computed with `indexOf` over the supplied source, the same
mechanism `bindWireAnalysis` already uses for candidate quotes — not a number the model sent. The
ordinal disambiguates two genuinely different facts that share one anchor, which multi-gap rows
require.

The composed key is **checked** against `FACT_KEY_SHAPE`, never sanitised into it. A supplied id
carrying a character the shape excludes is refused, because quietly rewriting an identifier is how
two different facts end up sharing one.

### What identity does NOT claim, recorded in code as `FACT_IDENTITY_CLAIMS`

```
SEMANTIC_IDENTITY_ACROSS_ANALYSES: false
```

Two draws that phrase the same unresolved property differently, or anchor it to a different span,
produce **different keys**. No deterministic function of model output can decide that two
differently-worded facts are the same fact — that is the semantic matcher this programme retired at
§160 FINDING 1. `OwedFact` requires identity "unique within the analysis" and that is exactly what is
delivered; cross-analysis identity is a human or measurement question and is not smuggled in under a
hash. The authorization warned against precisely that: *"Do not hash arbitrary generated prose and
call the problem solved if semantic identity remains unstable."* Nothing here hashes prose, and the
instability that remains is named rather than concealed.

### Duplicate identity

Two rules, both byte checks:

- **`DUPLICATE_DECLARATION_ID`** — two entries claiming the same handle. The second is refused.
- **`DECLARATION_DUPLICATES_ANOTHER_DECLARATION`** — same decision, same span, and the same two
  branches and two decisions after whitespace-and-case normalisation. A restatement is refused.

Two *different* facts anchored to the same sentence both survive, with `.1` and `.2` ordinals — case
F3. Deduplicating them would be the displacement failure the owed-fact ledger exists to prevent.

## The carrier stays uncoupled

`D-56` recorded what candidate-owned carriers cost: a clarification with nowhere to live in exactly
the zero-candidate case that most needed one. L3-2i added a proposal-level carrier; L3-2j then
measured that the shipped prompt never used it, so the coupling survived as a shape after the
capability existed.

`unresolvedFactDeclarations` is a **fifth top-level sibling**. It is not a field on a hazard
candidate and not a field on a clarification. Cases Q1 and Q2 assert both halves: the schema carries
no candidate-owned or clarification-owned declaration property, and a declaration projects
successfully with zero candidates and zero clarifications present.

The link between a question and a fact runs in the direction that cannot create a dependency: the
clarification carries an **optional** `answersUnresolvedFactDeclarationId`, never in `required`.
This is the `relatesToCandidateKey` mechanism reused verbatim, including its failure behaviour — an
id naming no declaration is stripped, recorded as unresolved, and **the question survives**
(cases Q3–Q6). A question with no declaration is a legitimate question; a declaration with no
question is a legitimate declaration. Neither list is a quota and neither is filled to match the
other, and the prompt block says so.

## Multi-gap and additive behaviour

- 0, 1 and many unresolved facts are all representable and all proven — cases A, B, C.
- A malformed declaration is refused **per declaration**; its well-formed siblings survive — case C4.
- A conjunctive `A AND B` branch survives with both conjuncts intact, and nothing splits a branch on
  a conjunction — cases G1, G2.
- Nothing here settles, covers or resolves anything. Every projected fact enters `UNRESOLVED`, the
  projection records no transition, and `firstPassProjectionEffect()` is false on every axis —
  cases O1–O5. **`PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is unchanged.**
