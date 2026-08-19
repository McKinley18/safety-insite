# HazLenz learning from professional corrections — current capability and governed path

Date: 2026-08-18. Scope: Section L of the core-closure/standards-validation phase. This document
records what the production code actually does today (verified by reading the code, not inferred)
and the narrowest governed design for learning from user corrections. **No self-learning was
implemented in this phase, and none exists in production today.**

## What exists today (verified in code)

| Layer | Where | What it records | Consumed by the reasoning path? |
|---|---|---|---|
| Per-finding human review | `inspection.service.ts` `addReview()` → `human_reviews` (`decision: accepted / edited / overridden / dismissed`, `rationale`, `reviewedConclusion` incl. `reviewerRisk`, `correctiveAction`, `segmentationDecision`) | The reviewer's decision, rationale and edited conclusion for ONE finding, tied to `findingId` + `analysisId` | **No.** Persisted for audit/finalization only. `finalizeFinding()` requires a current review; the classifier never reads reviews. |
| Reviewer-confirmed risk | `finalizeFinding()` → `inspection_findings.riskSnapshot.source = 'reviewer_confirmed'` (V5-C01) | The overridden risk per finding | **No.** Report/UI only. |
| Standards feedback API | `safescope-v2/feedback` (`SafeScopeFeedback` entity: `classification`, `citation`, `action` accept/reject/flag/change, `replacementCitation`, `reason`, `confidenceBefore`, `reviewerRole`) | Explicit thumbs-up/down/replace on a citation | **No.** `getWorkspaceStandardAdjustments()` aggregates accepted/rejected/flagged/changed counts per citation into an "adjustment" number, but the only callers are the feedback controller's own GET endpoints. `safescope-v2.service.ts` does not read it. The frontend helper `sendHazLenzFeedback` exists (`lib/hazlenz.ts`) but is not wired into the canonical `/inspection-workspace` flow. |
| Legacy standards feedback tables | `standard_match_feedback`, `classification_feedback` (standards module) | Older per-report match feedback | **No.** Not read by HazLenz v2. |
| Security audit events | `security_audit_events` (`finding_materially_changed`, `finding_review_finalized`, `inspection_regulatory_context_set`, …) | Immutable event trail | **No** (audit only). |
| Governed knowledge review queue | `safescope-v2/knowledge-architecture/reviewcore-*` (ingestion → normalizer → approval service → review-queue audit) | Human approval workflow for *knowledge records* (documents/rules) before they become retrievable | Yes for retrieval-tier knowledge; **not** connected to any of the correction sources above. |
| Regression corpus | `src/safescope-v2/tests/*` (golden hazard/standards/domain suites, `hazlenz-core-regression.ts` runner, this phase's `hazlenz-inspection-context-autonomy-regression.ts`, gold set) | Frozen expected behaviours | Gate for code changes (CI/manual), not connected to user corrections. |

**Conclusion:** corrections are captured durably and are traceable to the finding, analysis, reviewer and
rationale, but nothing aggregates them into adjudicated evidence, and nothing — correctly — mutates
production rules/models from them.

## Recommended governed path (narrowest connection of existing pieces)

```
HazLenz recommendation (analysis snapshot: standardCandidates, risk, corrective action, provenance)
  → user correction/override (already persisted: human_reviews.decision/rationale/reviewedConclusion,
    riskSnapshot.source='reviewer_confirmed', SafeScopeFeedback action/replacementCitation)
  → structured feedback record            [NEW, small] a single "correction_event" projection joining
                                            analysis snapshot ⇄ review ⇄ finding ⇄ inspection.regulatoryContext
                                            (what HazLenz said, what the human said, why, under which context)
  → aggregation                            [EXISTS in embryo] getWorkspaceStandardAdjustments() pattern,
                                            generalized: per (regime, hazard family, citation, question id)
                                            counts of accept/edit/override/dismiss + rationale text
  → adjudication/validation                [EXISTS] reviewcore knowledge review queue + approval service:
                                            a safety professional adjudicates an aggregated correction as
                                            (a) HazLenz defect, (b) taxonomy/alias issue, (c) invalid correction,
                                            or (d) genuine rule/knowledge gap -- with a recorded rationale
  → regression case                        [EXISTS] every accepted adjudication becomes a frozen case in the
                                            golden/gold-set suites (expected answer from authoritative text,
                                            never copied from HazLenz output or from the raw correction)
  → approved knowledge update              [EXISTS] code/rule/taxonomy change shipped through the normal
                                            review + hazlenz-core-regression gate; corpus rows through
                                            sync-standards-intelligence-to-master --apply + finalize-regulatory-release
```

Design constraints that must hold:

- **User corrections are evidence, not ground truth.** Aggregation and adjudication sit between a correction
  and any change. A single reviewer's override never changes behaviour for anyone.
- **No runtime mutation.** The classifier, `evaluate()` rules, taxonomy map and corpus are only changed by
  reviewed, versioned commits/seeds that pass the regression gate. Workspace-level "adjustments" (if ever
  surfaced) must be presented as *this workspace's reviewers' history*, never as a change to regulatory
  applicability.
- **Provenance travels with the correction.** The correction event must carry `inspection.regulatoryContext`
  and the analysis's `regulatoryContext.provenance` (USER_CONFIRMED / HAZLENZ_INFERRED / UNKNOWN), so an
  "override" made under an unknown jurisdiction is not mistaken for a rule error.
- **Minimum new code:** one read-model/projection (correction events) and one aggregation query; everything
  downstream already exists (review queue, regression suites, seed pipeline).

## What NOT to build (and was not built)

- No automatic re-weighting of citations from thumbs-up/down.
- No per-workspace rule mutation.
- No LLM fine-tuning or prompt mutation from corrections.
