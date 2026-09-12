# §196 — OwedFact field provenance

Every field of the `OwedFact` the projection returns, with the structured field it came from and the
rule that validated it. **No field requires semantic invention.**

The table below is not a hand-kept copy: it is `OWED_FACT_FIELD_PROVENANCE`, exported as data from
`expert-first-pass-owed-fact-projection.ts`, and case **B3** asserts that its rows cover the keys of
a projected `OwedFact` **exactly** — no field without a row, no row without a field. A field added to
`OwedFact` in future without a row here fails the suite. That is the only way a table like this stays
true.

Three provenance kinds, and there is no fourth:

- **EXPLICIT UPSTREAM FIELD** — copied from the declaration, at most whitespace-trimmed
- **MECHANICAL DERIVATION** — computed from already-structured fields by a stated rule
- **HAZLENZ TASK STATE** — supplied by HazLenz, never by the provider, never invented here

| OwedFact field | ← source structured field | kind | ← validation rule |
|---|---|---|---|
| `factKey` | stage prefix + `affectedDecision` + `observationSourceId` + HazLenz-computed span offsets + collision ordinal | MECHANICAL | composed key must match `FACT_KEY_SHAPE` and be unique within the analysis; **there is no wire field to accept one from** |
| `affectedDecision` | `declaration.affectedDecision` | UPSTREAM | exact membership of `OWED_FACT_AFFECTED_DECISIONS` |
| `source` | the declaring stage supplied by the caller | HAZLENZ | member of `DECLARING_STAGES`; no wire field for it |
| `evidenceSpan` | `declaration.observationSpan`, whitespace-trimmed | UPSTREAM | must appear **verbatim** in the text of the named supplied source, by exact string containment; a span that does not is refused, never repaired |
| `whyUnresolved` | `declaration.notEstablishedBecause` | UPSTREAM | non-blank, as `WHY_UNRESOLVED_STATUS_INVARIANT` requires of an `UNRESOLVED` fact |
| `branchA` | `declaration.branchA` | UPSTREAM | non-blank and textually different from `branchB` |
| `branchB` | `declaration.branchB` | UPSTREAM | non-blank and textually different from `branchA` |
| `decisionDivergence` | `declaration.decisionIfA` and `declaration.decisionIfB` | UPSTREAM | both non-blank and textually different from each other; a declaration whose two decisions agree is **refused** rather than given a manufactured difference |
| `priority` | `FIRST_PASS_PROJECTED_PRIORITY`, a stated constant | MECHANICAL | no wire field exists; a provider may not set the value that gates `UNRESOLVED_SAFETY_STATE` |
| `status` | `PROJECTED_STATUS`, the constant `UNRESOLVED` | MECHANICAL | a declared fact is open by definition; `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` |
| `acceptableEvidence` | a criterion HazLenz already holds for a governed `sourceId` the declaration bound, or `null` | HAZLENZ | the declaration may only **name** a supplied governed id; carrying a criterion is refused (`acceptableEvidence` is in `DECLARATION_FORBIDDEN_FIELDS`). Null is valid and normal |
| `modelAuthored` | derived from `source` by `owedFact()`, via `MODEL_AUTHORED_SOURCES` | MECHANICAL | no call site can disagree with the provenance; `owedFactDefects` refuses a mismatch |

Case **B4** asserts every UPSTREAM row is byte-equal to the declaration field it names. Case **B5**
asserts every MECHANICAL row is the stated constant or the stated computation. Case **B6** asserts
the key is reproducible from the declaration alone.

## The two MECHANICAL derivations that are choices, argued

### `priority` = `OTHER`

`priority` decides things. It gates `COVERAGE_PRIORITY_GATE`, it ranks the question budget, and
`LIFE_CRITICAL` is the value that raises `UNRESOLVED_SAFETY_STATE`. §170's rule is that HazLenz
populates every `OwedFact` field that decides anything, so the wire has **no** priority field and a
provider cannot escalate itself.

`OTHER` is the non-escalating floor: a stated constant, not a judgement about any particular fact,
and deliberately the conservative direction — a model cannot manufacture a fail-closed
customer-visible state by calling its own gap life-critical.

**The cost is real and is not hidden.** A genuinely life-critical first-pass gap also enters at
`OTHER` and will not raise the gate. Escalating it is a HazLenz decision that needs its own
authority and its own evidence, and §196 does not invent one. Recorded in
`PROJECTION_RESIDUAL_LIMITS` and asserted by case **S2**.

The three alternatives and why each was not taken:

1. **A model-emitted priority.** Rejected: it hands the provider the gate that decides whether a
   customer sees an unresolved safety state, which is precisely the field §170 reserves.
2. **A deterministic rule from `affectedDecision`.** Rejected: "an `EXPOSURE` gap is life-critical"
   is a safety judgement wearing a lookup table, and it would be wrong on both sides.
3. **Refuse to project until a priority exists.** Rejected: it makes the whole bridge unusable to
   solve a gating question that is separable from it, and would leave the pipeline hole open.

### `status` = `UNRESOLVED`

Not a choice in any real sense: a fact a model has just declared open is open, and the only way a
fact leaves `UNRESOLVED` is a recorded `transition()` carrying one of three authorities, none of
which is "a model said so". Case **O2** asserts the projection records no transition.

## Declaration fields that do NOT reach an OwedFact

Recorded as `NON_PROJECTING_DECLARATION_FIELDS` and asserted by case **S3**. "Every `OwedFact` field
has provenance" must not be mistaken for "every declaration field is used".

| declaration field | role |
|---|---|
| `declarationId` | a within-response handle so a clarification can point at this entry; deliberately not an identity, and dropped once the computed `factKey` exists |
| `observationSourceId` | selects which supplied source the span is checked against, and enters the computed `factKey`; `OwedFact.evidenceSpan` carries the text and not its origin |
| `whyNecessaryNow` | part of the canonical v3 nomination vocabulary this shape reuses; retained on the declaration record for review, and not projected because `OwedFact` has no field for it |
| `governedEvidenceSourceIds` | binds the fact to supplied governed evidence, which is what lets HazLenz supply a criterion it already holds; the ids themselves are not part of the fact |
| **`missingFact`** | **THE OWED PROPERTY ITSELF — and there is no canonical `OwedFact` field for it. See below.** |

## ESCALATED: the owed property has no field

The authorization's item 2 asks the declaration to carry "the exact unresolved property". It does,
in `missingFact`. It cannot be projected, because `OwedFact` carries `whyUnresolved`, two branches
and two decisions, and **nothing that names the property**. The property survives only implicitly
across those five fields.

Three ways to close it, and why §196 closed none of them:

1. **Add a field to `OwedFact`.** That mutates `owed-fact.types.ts`, whose sha256
   (`102d059bc477270d…`) is pinned by §187's `owedFactSourceHashes` and asserted by every integrity
   gate since. Doing it inside §196 would detach §184's and §192's evidence from the contract that
   produced it, to gain a field that no consumer yet reads.
2. **Fold `missingFact` into `whyUnresolved`.** That is composition, and composition is invention —
   the exact thing this bridge exists not to do. `whyUnresolved` is projected in front of a provider
   by `projectOwedFact`, so a composed sentence there is a fabricated sentence shown to the model.
3. **Drop the field from the wire.** That would make the declaration strictly less legible to a
   human reviewer and would break the reuse of the canonical v3 nomination shape, which requires
   `missingFact`.

So it is preserved on the declaration record, recorded, and raised here as a **contract question for
a later authorization**: whether `OwedFact` should gain an explicit owed-property field, and if so,
under what protocol version and with what re-attachment of existing evidence.
