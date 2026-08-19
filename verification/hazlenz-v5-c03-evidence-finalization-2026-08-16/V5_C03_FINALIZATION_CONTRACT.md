# V5-C03 Finalization Contract

Date: 2026-08-16

## Three concepts, kept explicitly distinct (per task instruction)

1. **Analysis finalization** (`resultStage` / `mayFinalize`, produced by `POST /safescope-v2/classify`) — does HazLenz have enough evidence to present *this specific classify() response* as sufficiently resolved, versus needing another clarification round? Scoped to one request/response, computed fresh on every call.
2. **Finding review** (`HumanReview`, PRA-002) — has a qualified user reviewed each *persisted* `InspectionFinding`? Scoped per finding, tracked in `inspection.service.ts`, entirely separate persistence and entities from (1).
3. **Inspection completion** (`Inspection.status`, PRA-002 `transition()`) — may the whole inspection become `completed`? Gated on every active finding having a current review, tracked in `inspection.service.ts`.

**Architectural fact established in Phase 2 (not a design choice, a discovered constraint):** today, (2) and (3) do not read (1) at all — `inspection.service.ts` has zero references to `resultStage`/`mayFinalize`. This means C03's integration of evidence sufficiency into (1) **cannot, by construction, alter (2) or (3)** unless a future phase deliberately wires them together. C03 does not perform that wiring (out of scope per the task's explicit "do not rewrite PRA-002 completion semantics"). This is the strongest possible form of "evidence sufficiency must not bypass or replace finding-scoped review" — they remain structurally unconnected.

## The gate

A new, explicit, pure decision function — not a scattered boolean — implemented in a new non-protected file, consumed by the controller as one more post-process step alongside the existing `applyEvidenceFoundation()`:

```ts
type FinalizationDecision = {
  mayFinalize: boolean;
  resultStage: 'final' | 'provisional';
  blockedBy: 'evidence_sufficiency' | 'protected_gate' | null;
  reason: string | null;
};

function evaluateFinalizationGate(
  protectedResultStage: 'final' | 'provisional',
  protectedMayFinalize: boolean,
  evidenceSufficiency: EvidenceSufficiencyOutput | undefined,
  primaryCitation: string,
): FinalizationDecision
```

Rules (all narrower-than-the-protected-gate — this function can only *tighten*, never loosen, what the protected file already decided):

1. If the protected file already produced `resultStage: 'provisional'` (its own hardcoded-allowlist or `unresolvedContradictions` logic fired), that decision is preserved unchanged — this gate never flips `provisional` back to `final`.
2. Else, if `evidenceSufficiency` is present, its `sufficiencyLevel === 'insufficient'`, **and** no `primaryCitation` was independently established (belt-and-suspenders — see `V5_C03_SUFFICIENCY_REASON_CLASSIFICATION.md` for why both conditions are required rather than the sufficiency tier alone), the gate downgrades to `resultStage: 'provisional'`, `mayFinalize: false`, `blockedBy: 'evidence_sufficiency'`, with a `reason` string.
3. Else (including when `evidenceSufficiency` is absent — e.g. the heap-guarded degraded path, or when the protected file's own tier already produced a citation), the protected file's original `resultStage`/`mayFinalize` pass through completely unchanged.

This is a strict, provable narrowing: for every input, the new gate's `mayFinalize` is `<=` the protected gate's `mayFinalize` (boolean AND), never the reverse. No existing "final" case with a real citation or a non-`insufficient` sufficiency verdict can be newly blocked; only the specific, narrow, empirically-validated case (genuinely vague/no-hazard-signal observation, no citation, bottom-tier sufficiency) is newly caught.

## Clarification-question integration

`evidence-foundation.ts`'s `applyEvidenceFoundation()` already produces `clarificationQuestions` from `ApplicabilityDecision.missingPredicates` — this is the field the frontend actually renders (see `V5_C03_FINALIZATION_PIPELINE.md`). C03 adds exactly one new, narrow clarification question, emitted **only** when the new gate fires (`blockedBy: 'evidence_sufficiency'`) and **only** when `evidence-foundation.ts` itself produced zero clarification questions of its own (i.e., never displaces a real, targeted, predicate-derived question — it is a fallback for the specific case where nothing else asked anything and the observation is still too vague to finalize). This keeps the previously-closed C02 clarification behavior (targeted, capped-at-3, predicate-derived questions) completely untouched for every case where it already produces output.

## Non-goals honored

- No change to `unresolvedContradictions` detection or the 5-ID `safetyDecisiveIds` allowlist (both inside the protected file, both untouched).
- No per-finding evidence-sufficiency scoring is fabricated — `EvidenceSufficiencyService` runs once per observation today (confirmed in Phase 2/C02 tracing); the finalization gate is correspondingly scoped to the whole analysis, not a specific decomposed hazard. See `V5_C03_DECISION_MATRIX.md` for the multi-hazard test proving this does not cause a well-evidenced hazard to be blocked by a sibling's vagueness (and documenting the residual limitation honestly).
- No change to `inspection.service.ts`, `reconcileDecompositionFindings()`, `addReview()`, `finalizeFinding()`, or `transition()` — PRA-002 and finding review remain untouched, by construction (see "architectural fact" above).
- No new evidence-text parser — the gate consumes `EvidenceSufficiencyOutput` and `primaryCitation`, both already computed; it does not re-derive anything from raw text.
