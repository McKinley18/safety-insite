# §196 — the deterministic projection boundary

`backend/scripts/lib/expert-first-pass-owed-fact-projection.ts`

```
StructuredUnresolvedFactDeclaration  →  projectDeclaredOwedFacts  →  OwedFact
```

Pure, total and byte-stable: the same declarations over the same sources produce the same bytes every
time (case **B7**). It contacts nothing, reads no configuration, performs no database operation and
sends no request.

## What the boundary MAY do, and does

| permitted by the authorization | implemented as |
|---|---|
| validate required fields | `REQUIRED_DECLARATION_STRING_FIELDS`, eleven fields, each non-blank |
| validate enum values | `affectedDecision` ∈ `OWED_FACT_AFFECTED_DECISIONS` |
| validate closed-set relationships | `observationSourceId` ∈ supplied sources; every `governedEvidenceSourceIds` member ∈ supplied governed ids, by exact string equality |
| confirm `evidenceSpan` is verbatim from the supplied observation/context | `sourceText.indexOf(span) >= 0` against the source the declaration names |
| confirm referenced governed-evidence ids were actually supplied | `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET` — no fuzzy match, no nearest neighbour |
| confirm `factKey` uniqueness and shape | composed key checked against `FACT_KEY_SHAPE`; a repeat is refused |
| reject malformed states | seventeen named codes in `PROJECTION_REFUSAL_CODES` |
| normalise representation without changing meaning | **whitespace trimming of the span, and nothing else** |
| project a valid declaration into `OwedFact` | via the canonical `owedFact()` constructor, so `modelAuthored` cannot disagree with `source` |

## What the boundary MUST NOT do, and cannot

| forbidden | why it cannot happen here |
|---|---|
| infer an owed fact from prose | the function is never given prose outside the declaration's own validated fields. It does not read `question`, `whyItMatters`, `rationale`, `evidenceGap`, a candidate, or a summary |
| invent branch semantics | `branchA`/`branchB` are required non-blank upstream fields; absence refuses (case D) |
| invent decision divergence | `decisionIfA`/`decisionIfB` likewise; and two decisions that agree are **refused**, not differentiated (case **H2**) |
| invent an evidence span | a span absent from the named source refuses (cases **E1**, **E3**) |
| repair a missing conjunct | a missing branch refuses; case **D3** asserts nothing named `branchB` appears anywhere in the result of a declaration that omitted it |
| guess the intended `factKey` | identity is composed from validated fields; a provider-sent `factKey` is refused (case **B9**) |
| derive safety truth from a natural-language clarification | the clarification link resolves an id to an id and reads no text (`resolveClarificationLinks`) |

**Fail closed** is the whole disposition: where required semantic content is absent, the declaration
is refused and yields **no** `OwedFact` at all (case **D2**). There is no partial projection and no
repair path.

## Refusal is per declaration, and that is a decision

The verifier boundary refuses a verdict **whole**, because a verdict is one object making one
decision, and a partly-valid verdict is not a partly-correct one.

A first-pass response is four — now five — **independent** collections, and `expert-normalization.ts`
has always refused a malformed candidate without destroying its siblings. A malformed declaration
must not take a well-formed independent gap down with it: that would be the displacement failure the
owed-fact layer exists to prevent, arriving through the boundary instead of through the model.

So a refusal names its declaration, yields no fact, and is recorded in `perDeclaration`; the other
declarations are unaffected. Case **C4** proves it: three declarations, one malformed, two facts
projected and one refusal recorded.

Nothing is repaired and nothing is partial. A refused declaration produces no `OwedFact` — the two
statements are not in tension.

## The refusal vocabulary

```
DECLARATION_NOT_AN_OBJECT                              DECLARATION_ID_MALFORMED
DUPLICATE_DECLARATION_ID                               REQUIRED_FIELD_MISSING
AFFECTED_DECISION_NOT_A_MEMBER                         OBSERVATION_SOURCE_UNKNOWN
EVIDENCE_SPAN_NOT_VERBATIM                             BRANCHES_IDENTICAL
DECISIONS_DO_NOT_DIVERGE                               GOVERNED_SOURCE_IDS_NOT_AN_ARRAY
GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET                 GOVERNED_SOURCE_ID_DUPLICATED
PROHIBITED_REGULATORY_CITATION                         PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD
COMPUTED_FACT_KEY_MALFORMED                            DECLARATION_DUPLICATES_ANOTHER_DECLARATION
ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ
```

Each names the class it actually decides. None is a catch-all.

## `acceptableEvidence` — represented, not derived later

The authorization's item 9 asks that settlement guidance be represented explicitly rather than
derived afterwards. The architecture is equally explicit that a provider may **never** emit it:
`acceptableEvidence` is in `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` because it is HazLenz task state
projected *into* a request, and a response echoing it back would be the evaluated component editing
its own settlement criterion.

Both hold at once through the governed binding:

1. the declaration **names** the supplied governed ids that bear on the fact
   (`governedEvidenceSourceIds`), and may name nothing else;
2. HazLenz supplies `acceptableEvidenceBySourceId` — criteria it already holds, in practice from
   `deriveAcceptableEvidence`, which copies a governed record's own vocabulary rather than
   paraphrasing it;
3. the projection **looks one up**. It never authors one, never merges two (merging would author a
   third), and takes the first bound id it holds a criterion for, in declaration order.

`null` is valid, normal, and the answer whenever HazLenz holds nothing (cases **I2**, **I4**). A
declaration that carries a criterion itself is refused (case **I3**). A criterion HazLenz does hold
reaches the fact unaltered (case **I1**), and `createOwedFactLedger` still enforces the production
provenance boundary above this module.

## Verifier handoff

Cases **J1–J5**. Projected facts enter `createOwedFactLedger` unchanged, `projectOwedFactsForVerifier`
strips what a provider may not see, and every semantic string in the verifier projection is
**byte-equal to the declaration that produced it** — nothing was authored between the two stages
(case **J2**). `PROJECTION_FORBIDDEN_FIELDS` are absent from the serialised projection (**J3**), the
computed keys satisfy v3's binding shape (**J5**), and a real v3.2 verdict binding a projected key is
admitted by the unmodified §194 boundary (**J4**).

That closes the loop the authorization asked for: **a projected `OwedFact` enters verifier-v3.2 with
no harness-authored semantic augmentation.**

## The residual limits, recorded as data

`PROJECTION_RESIDUAL_LIMITS`, asserted by case **S2**:

- a genuinely `LIFE_CRITICAL` first-pass gap enters at `OTHER` and does not raise
  `UNRESOLVED_SAFETY_STATE`; escalation is a HazLenz decision needing its own authority
- `OwedFact` has no field for the owed property itself; the property survives implicitly through
  `whyUnresolved` and the two branches
- **that the two branches are genuinely possible, that the divergence is real, and that the span
  actually shows the fact is open are SEMANTIC judgements. Nothing here checks them and the boundary
  never claims to.** A declaration can be perfectly well-formed and completely wrong, and this
  boundary will project it. That is the same division `CLARIFICATION_EVIDENCE_SUFFICIENCY =
  SEMANTIC_JUDGMENT_REQUIRED` already draws, and it is why hosted validation and human sampling
  remain owed
- cross-analysis semantic identity of a fact is not claimed and is not computable here
