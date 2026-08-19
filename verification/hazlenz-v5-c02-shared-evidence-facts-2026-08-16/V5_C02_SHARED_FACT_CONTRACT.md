# V5-C02 Shared Evidence-Fact Contract

## Location

`backend/src/safescope-v2/evidence/shared-evidence-facts.ts` (new file).

## Why this scope, not more

The capability audit's own complexity score for full C02 is 5/5 ("highest architectural leverage... marked P0 despite complexity"). The consumer census (`V5_C02_EVIDENCE_CONSUMER_CENSUS.md`) found that almost every other live raw-text consumer is either a precision-tuned regex surface directly responsible for the 228/228 V4 recognition record (`standard-applicability.service.ts`, `inspection-condition-assessment.service.ts`, `scenario-intelligence.service.ts`) or a multi-hop chain whose full behavior could not be safely characterized this pass. The task instructs: "Do not migrate a consumer merely because duplication exists," "no weakening of existing precision protections," "do not create a second competing hazard-classification engine." Given that, the contract below is deliberately the *extraction primitive only* — not a rewrite of any downstream decision engine.

## Types (moved verbatim from `evidence-foundation.ts`, zero semantic change)

```ts
type FactStatus = 'observed' | 'confirmed' | 'inferred' | 'unknown' | 'contradicted' | 'corrected';

interface EvidenceFact {
  id: string;
  type: string;
  value: string | number | boolean | string[] | null;
  unit?: string;
  source: 'user_text' | 'user_confirmation' | 'photo_model' | 'site_context' |
    'inspection_context' | 'clarification' | 'qualified_review' | 'system_inference';
  confidence: number;
  status: FactStatus;
  temporalState: 'current' | 'previously_observed' | 'corrected_before_review' | 'unknown';
  reviewerStatus: 'unreviewed' | 'user_confirmed' | 'qualified_confirmed' | 'rejected';
  contradictedBy?: string[];
  supersedesFactId?: string;
}
```

This already covers every field the task's Phase 2 listed as an example: observed condition / equipment / control present-absent-ineffective-unknown (via `type`+`value`+`status`), temporal state, negation state (via `status: 'contradicted'` + `currentHazardNegated`), uncertainty/ambiguity (`status: 'unknown'`), source evidence traceability (`source` + `id`, consumed via `factIds()`), and confidence. No new fields were invented; the existing model already satisfied the brief.

## Functions

- `buildEvidenceFacts(input: SharedEvidenceFactInput): ExtractedEvidenceFacts` — the ONE authoritative, deterministic extraction path. `SharedEvidenceFactInput` is a **structural** (not nominal) subset of `ClassifyDto` — only `text` is required, every other field (`structuredObservation`, `scopes`, `evidenceSnapshot`, `clarificationAnswers`) is optional and purely additive, so a caller with only raw text (e.g. an orchestrator stage, or a single decomposed hazard's evidence fragment) still gets a valid, narrower fact set rather than an error or a fabricated one.
- `hasFact(e, type, value?)` / `factIds(e, type)` — the two read-only predicates every consumer needs; both already existed inside `evidence-foundation.ts` as private `has()`/`ids()`, now exported for reuse.
- `buildHazardScopedEvidenceFacts(hazardText, scopes?)` — **new** capability, additive only, not wired into any existing decision path in C02. Re-invokes the same authoritative `buildEvidenceFacts()` on a hazard-scoped text fragment only (mirroring V5-C01's `computeFindingRisk` discipline of building from `hazard.observationFragment + hazard.mechanism + hazard.supportingSignals`, never sibling-hazard data or the whole fused text). This is what Phase 6's multi-hazard attribution test uses, and is the prerequisite a future finding-scoped-facts phase (V5-C06) would build on — but nothing in C02 wires it into `resultStage`, `mayFinalize`, or any persisted decision.

## Invariants preserved

- A fact whose value is genuinely unknown is never silently converted to `present`/`absent` — `buildEvidenceFacts` only ever pushes a fact when a specific regex/structured-field condition matched; it never defaults a missing signal to a guessed value.
- `PRESENT` / `ABSENT` / `UNKNOWN` / `NEGATED` / `AMBIGUOUS` distinctions are preserved via `status` (`observed|confirmed` vs `unknown` vs `contradicted`) and value polarity (e.g. `guardState: 'present_and_effective'` vs `'absent_or_ineffective'`), exactly as before the refactor — no new collapsing was introduced.
- Temporal distinctions (`current` / `previously_observed` / `corrected_before_review` / `unknown`) are untouched.
- No network dependency, no persistence requirement, no external model call — pure synchronous TypeScript, identical to the code it was extracted from.

## What is explicitly NOT part of this contract

Regulatory-predicate evaluation (`ApplicabilityDecision`, `evaluate()`, `decision()`), clarification-question authoring (`questionFor()`), and the risk/standards response-shaping logic in `applyEvidenceFoundation()` remain in `evidence-foundation.ts` as domain logic built *on top of* the shared facts — they are not part of the reusable primitive, and were not moved, to keep the shared module minimal and avoid entangling unrelated business logic with the fact-extraction contract other consumers need.
