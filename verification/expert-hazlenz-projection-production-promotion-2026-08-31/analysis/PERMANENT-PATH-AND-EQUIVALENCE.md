# §119 — The permanent path, the promotion, and the equivalence proof

## Phase 1 — The permanent Expert path, before and after

### Before

```
observation
  → buildEvidenceFacts            (shared-evidence-facts.ts)
  → evaluate                      (evidence-foundation.ts, module-private)
  → applyEvidenceFoundation       → result.applicabilityDecisions   ← COMPUTED, THEN DISCARDED
        ✕  no code reads these into an Expert input  ✕
ExpertAnalysisInput               ← constructed ONLY in fixtures
  → buildExpertUserPrompt         (renders findings, governed records, families)
  → buildAnthropicRequestBody     (canonical schema → strict wrapper → Anthropic strip)
  → AnthropicExpertProvider.analyze
```

Verified this phase, not assumed: `grep -rn "ExpertAnalysisInput" src/` returns only *consumers*
(the two adapters, the replay provider, the prompt builder, the normalizer, the runner) — **no
production constructor**. `grep -rn "runExpertAnalysis" src/` returns only its own declaration:
**zero callers**, consistent with `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. Nothing outside
`expert-hazlenz/` and `expert-hazlenz-adapters/` imports the module at all.

`buildExpertUserPrompt` rendered exactly two shapes for the deterministic result — a positive
finding, or `(none — the deterministic engine established no finding)`. **There was no third shape,
so a family EVALUATED AND EXCLUDED rendered identically to a family never considered.** That is the
§116 root cause the §118 A/B confirmed.

### After

```
… applyEvidenceFoundation → result.applicabilityDecisions
  → projectDeterministicDispositions()        ← NEW, production, pure projection
  → ExpertAnalysisInput.deterministicFamilyDispositions?   ← NEW, optional
  → buildExpertUserPrompt → renderDeterministicDispositionBlock()   ← NEW, appended
  → buildAnthropicRequestBody (UNCHANGED)
  → AnthropicExpertProvider.analyze (UNCHANGED)
```

**No second applicability engine, and no reconstruction of state inside Expert.**
`projectDeterministicDispositions` evaluates no predicate, reads no observation text and reaches no
applicability conclusion; it is a pure projection over decisions the deterministic layer already
produced. Its parameter is structural rather than an `ApplicabilityDecision` import, so the module
carries no dependency on the evidence foundation.

## Phase 2 — The type change

`expert-contract.types.ts` gains `DETERMINISTIC_DISPOSITIONS`
(`ACTIVE`/`CONTROLLED`/`NOT_APPLICABLE`/`UNKNOWN`), `DeterministicControllingFact`,
`DeterministicFamilyDisposition`, and one **optional** field on `ExpertAnalysisInput`:

```ts
deterministicFamilyDispositions?: DeterministicFamilyDisposition[];
```

carrying hazard family, disposition, actionable state, confidence, controlling facts, derived
rationale, evidence quotes and provenance — the accepted §116 semantics, unchanged.

**`EXPERT_CONDITION_STATES` was NOT touched.** `test-expert-contract-foundation.ts` E.3 asserts it
is byte-identical to the Level-3 vocabulary, read as data at runtime; adding `NOT_APPLICABLE` there
would break a frozen shared vocabulary and stop an Expert condition assertion being comparable to a
Level-3 one. The disposition vocabulary is therefore separate and smaller: it describes what the
**deterministic** layer said, not what Expert asserts.

**Citation-free by necessity.** `CITATION_SHAPED_PATTERN` refuses `\d{2} CFR \d+` anywhere in Expert
*output* including prose. The source decision carries `citation: '29 CFR 1910.212(a)(1)'`;
projecting it would invite an echo that gets the entire analysis rejected. The family-label →
Expert-family map keeps the projection citation-free, and an unmapped family is **dropped, not
guessed**.

## Phase 4 — Prompt rendering, and what did NOT change

`EXPERT_PROMPT_VERSION` remains **`hazlenz.expert.prompt.v6`** and `EXPERT_SYSTEM_PROMPT` is
byte-unchanged. Asserted mechanically by gate `F.2`.

**Prompt semantic version: UNCHANGED. Permanent input projection: NOW POPULATED.** What changed is
that a previously-discarded piece of the deterministic *result* is rendered into the per-request
input, beside the observation, the deterministic findings and the governed records — the same class
of thing as those. The frozen instruction text was not revised.

The block is appended **after** the closing instructions with a `\n\n` separator, in exactly the
position the §118-confirmed prototype used. When no dispositions are supplied the block is empty and
`buildExpertUserPrompt` returns exactly what it returned before the field existed.

## Phase 6 — The equivalence gate

`test:expert-projection-equivalence` — **88 assertions, 0 failed.**

Both paths are compared through `buildAnthropicRequestBody`, i.e. the real provider request
including system prompt, user prompt, wire schema, strict wrapper and Anthropic compatibility strip.

| case | full request body byte-identical | permanent request chars | §118 measured chars |
|---|---|---|---|
| `R6` | **YES** | 24,897 | **24,897** |
| `V7` | **YES** | 24,864 | **24,864** |
| `R6-I` | **YES** | 25,391 | **25,391** |
| `V1-CTRL` | **YES** | 24,829 | **24,829** |
| `R6-H` | **YES** | 24,931 | **24,931** |
| `V8` | **YES** | 25,055 | **25,055** |
| `V5` | **YES** | 24,873 | **24,873** |

**`SEMANTIC_REQUEST_EQUIVALENCE = 100%`, and there are no differences to justify.**

Two independent confirmations, not one:

1. **Within this phase** — for every case, the prototype-built body (`buildAnthropicRequestBody` +
   appended prototype block) and the permanent-built body (dispositions on the input, rendered by
   the prompt builder) are `JSON.stringify`-identical, with `model`, `max_tokens`, `system`,
   `tools`, `tool_choice`, `thinking` and the user prompt each asserted separately so a failure
   would name the field.
2. **Across runs** — every permanent request byte-count matches the corresponding **§118 preflight
   measurement of the request actually sent to Anthropic**. The permanent path reproduces the exact
   requests the hosted measurement was taken on.

Gate `A` additionally proves the permanent projector derives row-for-row identical output to the
frozen prototype projector from the same real decisions.

## Phase 7 — R6 permanent-path proof

Derived from the repaired §117 engine, not hand-written:

```
machine_guarding = NOT_APPLICABLE @ 0.96
  provenance      : DERIVED_FROM_PRODUCTION_ENGINE
  controlling fact: moving or accessible energy = CONTRADICTED
  rationale       : "…the observation affirmatively contradicts 'moving or accessible energy',
                     so the conditions this family protects against are not established as present."
```

Rendered into the permanent prompt as:

```
DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED
  These families were EVALUATED by the deterministic engine. This is different from a
  family it never considered — do not treat an assessment below as a gap you must fill.
  - machine_guarding: NOT_APPLICABLE, not actionable, confidence 0.96
      why: …
      controlling fact: moving or accessible energy = CONTRADICTED
```

Gates `C.1`–`C.9`.

## Phase 10 — Projection absence control

| input | rendering |
|---|---|
| field `undefined` | **no section** — byte-identical to a pre-§119 request |
| field `[]` | **no section** — an evaluation that produced nothing projectable says nothing |
| field populated | the assessment section, explicitly marked EVALUATED |

Gates `D.1`–`D.6`, including `D.3` — **an absent projection never synthesises a `NOT_APPLICABLE`
state** — and `D.6`, backward compatibility for a caller that has no deterministic family
evaluation to offer.

## Phase 8 — Anti-rubber-stamp, structural

| case | permanent projection | why it matters |
|---|---|---|
| `V7` | `machine_guarding = ACTIVE @ 0.96` | a stated point-of-operation contact is **not** projected as a false `NOT_APPLICABLE` |
| `R6-I` | `machine_guarding = UNKNOWN @ 0.45` (+ `lockout_tagout`) | a machine returned to operation unguarded is not projected as excluded |
| `R6-H` | `machine_guarding = UNKNOWN @ 0.45` | the stated re-energization transition is not projected as excluded |
| `V5` | `machine_guarding = UNKNOWN @ 0.45` | `UNKNOWN` remains distinguishable and can carry a clarification |
| `V8` | `chemical_exposure` **absent** from the projection | a family the engine never assessed stays fully addable |
| `V1-CTRL` | `lockout_tagout = CONTROLLED @ 0.94 [CONSTRUCTED_FOR_DIAGNOSTIC]` | a failed control reaches Expert in a form it can explicitly override |

Gates `E.*`. The override licence is present verbatim in the rendered block — *"You MAY override any
assessment above, including a NOT_APPLICABLE one"*, *"high deterministic confidence is not a reason
to withhold one"*, and the named `CONTRADICTS_DETERMINISTIC` channel.

**No boundary suppression exists.** Gate `F.1` asserts mechanically that
`expert-normalization.ts` does not so much as mention `deterministicFamilyDispositions` — there is
no code path by which a projected disposition can drop an Expert candidate. Deterministic state is
CONTEXT, and the boundary remains the only thing that refuses output, on grounds unrelated to the
projection.

## Phase 11 — Recording-only instrumentation: deliberately NOT promoted

The state-aware scorer stays in `scripts/lib/expert-state-aware-scoring.ts`.

The authorization permits promoting the minimum recording instrumentation **"IF it belongs in the
permanent evaluation harness."** That harness does not exist yet — the formal 17-measure cohort is
unauthorized and unbuilt — so promoting instrumentation with no consumer would be speculative
production surface, and this phase is implementation of an accepted design, not new design. It
remains available to the cohort harness from `scripts/` exactly as §116 and §118 used it.

**No formal pass/fail threshold changed. No historical score was rewritten.**
`expert-routing-metrics.ts` is byte-unchanged.
