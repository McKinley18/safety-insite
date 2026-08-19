# Root Cause: Zero-Citation Defect in HazLenz Standards Resolution

## Classification of the original 11 critical failures

All 11 cases that failed with "active citations: none" on both the empty and the fully-provisioned disposable DB are classified **REAL_RESOLUTION_DEFECT**. None are `DATA_PROVISIONING_ONLY`, `POLICY_EXPECTATION_MISMATCH`, `STALE_FIXTURE`, or `UNKNOWN` — provisioning real standards_master/knowledge-corpus/regulatory-section data produced a byte-identical failing result (`STANDARDS_19_CASE_BASELINE.md` vs. `STANDARDS_19_CASE_PROVISIONED.md`), which rules out a data gap as the cause. A single, precisely-located code defect (below) fully explains and fixes all 11.

## The defect

**File**: `backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts`, function `standardCandidates()` (used by `enforceHazLenzEvidenceBoundary()`).

**Trigger site**: `backend/src/safescope-v2/safescope-v2.controller.ts`, `classify()` handler (lines 260–268, pre-fix):

```ts
const guided = enforceVerifiedControlDisplay(attachGuidedFindingResponse(ensureVisiblePrimaryCitationContract(
  sanitizeHazLenzDisplayOutput(
    applyFinalizationGate(applyEvidenceFoundation(enforceHazLenzEvidenceBoundary(result, body), body)),
  ),
  body.text,
), body), body.text);
// Re-apply the evidence boundary after the compatibility response adapter
// so legacy serialization cannot reintroduce a suppressed citation.
return enforceHazLenzEvidenceBoundary(guided, body);
```

`enforceHazLenzEvidenceBoundary` is invoked **twice**, with `sanitizeHazLenzDisplayOutput` running in between. That sanitizer deliberately deletes `primaryStandards`/`suggestedStandards`/`standards` from the response object (`hazlenz-display-sanitizer.ts:88-90`, `HIDDEN_STANDARD_OUTPUT_FIELDS`) — by design, since they duplicate the canonical `standardDecisions` field for a smaller API payload.

`standardCandidates()` (the helper `enforceHazLenzEvidenceBoundary` uses to decide what citations exist) read **only** `result.primaryStandards`, `result.suggestedStandards`, `result.standards`, and `result.primaryCitation` — never `result.standardDecisions` itself. On the **first** call these three arrays are still present (correctly populated by `SafescopeV2Service.classify()`), so `standardCandidates()` finds the real citations and `enforceHazLenzEvidenceBoundary` correctly rebuilds `result.standardDecisions` from them. But by the **second** call, `sanitizeHazLenzDisplayOutput` has already deleted all three source arrays. `standardCandidates()` therefore returns an empty list, and `enforceHazLenzEvidenceBoundary` unconditionally overwrites the already-correct `result.standardDecisions` — the one field that *did* survive the sanitizer — with `[]` (`hazlenz-evidence-boundary.ts:109`, pre-fix: `result.standardDecisions = candidates.map(...)` with `candidates = []`).

This reproduces on every one of the 19 cases because the double-call/intervening-strip pattern is unconditional in the controller — it does not depend on hazard family, jurisdiction, or evidence content. Confirmed by direct instrumentation of the live request path (temporary trace logging, added and fully reverted during this investigation): for `osha-gi-operating-unguarded-shaft` (exposed rotating shaft, missing guard), `SafescopeV2Service.classify()` correctly resolved `standardDecisions = [1910.212(a)(1), 1910.219(c), 1910.215]` with `primaryStandards`/`suggestedStandards` = 2 correct entries — all of it discarded by the second `enforceHazLenzEvidenceBoundary` pass before the HTTP response was serialized.

A secondary, related defect in the same function: the rebuilt `standardDecisions` entries were stamped with `status: 'applicable_after_human_review' | 'candidate_pending_evidence'` — values outside the `applicabilityStatus` vocabulary (`confirmed | probable | candidate | needs-more-evidence | not-applicable`) used everywhere else in the pipeline (`SafescopeV2Service.buildDecision()`, `ApplicableStandardsService.hydrateStandardReferences()`, and the independent audit's own `activeStandardObjects()` filter). Even after fixing the data-loss above, citations that did survive would still fail the audit's `/^(confirmed|probable|candidate_standard)$/i` check because `standardCandidates()` also dropped `applicabilityStatus` when re-shaping each candidate record.

## The fix

Both changes are confined to `backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts` — a display/evidence-boundary module, not the protected `safescope-v2.service.ts` classify() body or `standard-applicability.rules.ts` (the 228/228 family-recognition surface). No hazard-family recognition logic was touched.

1. `standardCandidates()` now also sources from `result?.standardDecisions` (the one field never stripped by the display sanitizer), so the second `enforceHazLenzEvidenceBoundary` pass can still see the citations the first pass correctly established.
2. `standardCandidates()` now preserves `applicabilityStatus`/`candidateStatus` from the source record, and the final decision map sets a vocabulary-consistent `applicabilityStatus` (`confirmed`/`probable`/`needs-more-evidence`) alongside the pre-existing human-facing `status` field (`applicable_after_human_review`/`candidate_pending_evidence`, left unchanged since nothing else in the codebase or frontend consumes those exact string values — confirmed via repo-wide search before changing anything).

## Verification

| | Empty DB (baseline) | Provisioned, pre-fix | Provisioned, post-fix |
|---|---|---|---|
| Critical failures | 11/19 | 11/19 (identical) | **0/19** |
| pass / qualified-pass | 3 / 5 | 3 / 5 | 7 / 12 |
| primaryCitationRecall | 0 | 0 | **1.0** |
| primaryCaseRecall | 0 | 0 | **1.0** |
| falsePositiveCount | 0 | 0 | 0 |

Raw reports: `disposable-db-empty-baseline.json`, `disposable-db-provisioned/`, `disposable-db-after-fix-round1/` (this directory).

## Diagnostic method note

Root-causing required temporary `console.log` instrumentation at 7 points along the citation-decision pipeline in `safescope-v2.service.ts` (after `buildStandardDecisions()`, after hydration, after each filter, and at the pre-return state), gated behind an unused env var (`HAZLENZ_TRACE_CITATIONS`) so it never affected default behavior. All 7 lines were removed immediately after the mechanism was confirmed; the file's diff against the pre-existing uncommitted working tree was verified to return to its prior line count (`git diff --stat` before/after matched exactly, minus the 7 added-then-removed lines) before any real fix was applied.
