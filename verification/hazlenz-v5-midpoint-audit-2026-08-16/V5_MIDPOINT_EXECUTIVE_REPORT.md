# HazLenz V5 Midpoint Capability / Product-Integration / Release-Readiness Audit — Executive Report

Date: 2026-08-16. Repository: `/Users/mckinley/Desktop/Safety_InSite`, branch `main`.
Diagnosis only — no production code modified, no commits, no pushes, no deploys, no production access,
no database mutation.

## 1. Audit status

**V5_MIDPOINT_AUDIT_COMPLETE.**

## 2. Recommended release gate

`PRODUCTION_READY_WITH_TRACKED_P1_ISSUES` (revised down from the prior
`PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`, whose stated P1: 0 is no longer accurate). Full
reasoning: `V5_MIDPOINT_RELEASE_GATE.md`.

## 3–6. Issue counts

- **P0: 0**
- **P1: 2** — (a) C01's independent-risk fix does not reach the flow behind the app's primary
  "Start Inspection" CTA; (b) an uncommitted regression in `corrective-action.service.ts` causes a
  generic domain block to shadow the component-aware narrative generator, confirmed by 3/4 benchmark
  scenarios failing.
- **P2: 6** — control-effectiveness dead code/risk-blind scoring; historical-condition risk-badge
  staleness; planned-future-correction has no UI treatment; clarification non-enforcement; two confirmed
  evidence-sufficiency scoring defects; corrective-action UI missing finding linkage.
- **P3: 3** — orphaned `resultStage`/`mayFinalize` fields; `DefensibleCorrectiveActionService`
  stale-test false positive; stale corrective-action DTO smoke-test fixture.

## 7. Capability-map summary

Full trace: `V5_MIDPOINT_CAPABILITY_MAP.md`. Pipeline: observation → decomposition → shared evidence
facts (C02) → standards/applicability → evidence sufficiency → resultStage/mayFinalize gate (C03) →
clarification → finding-scoped risk (C01, canonical flow only) → control reasoning → corrective-action
intelligence → persistence → review/completion → report → frontend. No LLM call anywhere; fully
deterministic TypeScript.

## 8. LIVE_PRODUCTIZED capabilities

Hazard decomposition; standards/applicability suggestion and citation; finding-scoped risk (C01,
canonical `/inspection-workspace` flow only); singular `clarificationQuestions`; corrective-action
generated actions (`ActionEngineService`); historical-condition badge (with a display bug, see P2).

## 9. LIVE_API_ONLY capabilities

`resultStage`, `mayFinalize`, `finalizationGate` (C03) — correct, response-carrying, zero consumers.

## 10. LIVE_BACKEND_ONLY capabilities

Shared evidence facts / `evidenceFactTrace` (C02); `CorrectiveActionBrainService`,
`DefensibleCorrectiveActionService`, `SafeScopeCorrectiveActionReasoningService` (feed the merged output
but aren't independently surfaced); control-effectiveness domain intelligence (computed, never rendered).

## 11. Unreachable / deferred intelligence

`SafeScopeControlEffectivenessService`, `SafeScopeActionQualityService` — both instantiated only inside
the never-invoked `SafeScopeNativeReasoningService`. Both classified **REDUNDANT**/`NEEDS_CALIBRATION`
against already-live engines (`ActionEffectivenessService`, `ControlIntelligenceService`,
`HazardDomainIntelligenceService`) — see `V5_MIDPOINT_DEFERRED_INTELLIGENCE.md`.

## 12. Largest productization gap

The **flow fork**: V5-C01's independent-risk fix, closed and verified, is fully absent from the flow
reachable via the app's primary CTA. This single architectural fact is also the root cause of several
smaller gaps (control-effectiveness, planned-future treatment, clarification enforcement all differ or
are missing depending on which flow a user lands in).

## 13. resultStage consumers

None in `frontend-next/`, `backend/src/inspection/**`, `backend/src/corrective-actions/**`, or
`backend/src/reports/**`. Confirmed by full-tree grep. Details: `V5_MIDPOINT_FINALIZATION_SIGNAL_AUDIT.md`.

## 14. mayFinalize consumers

Same as above — none beyond two backend test scripts.

## 15. Recommended frontend treatment of finalization

Option A (informational indicator only), ranked above clarification-focused UI (B), no-integration (D),
and blocking (C, not recommended until calibration work lands). Full ranking and rationale:
`V5_MIDPOINT_FINALIZATION_SIGNAL_AUDIT.md`.

## 16. Evidence-sufficiency calibration result

13-category corpus run directly against `EvidenceSufficiencyService`. The narrow C03 gate holds (0/13
false-insufficient) but two scoring-composition defects were confirmed (negation-blind fallback scorers)
and one coverage gap (5-hardcoded-ID `safetyDecisiveIds` allowlist does not generalize). Full results:
`V5_MIDPOINT_SUFFICIENCY_CALIBRATION.md`.

## 17. False-insufficient findings

0 of 13 corpus categories were wrongly blocked by the C03 gate.

## 18. False-sufficient findings

No tier flip observed in this corpus, but cases 12 (jurisdiction-only uncertainty) and 13 (optional
enrichment) scored their relevant dimension in the wrong direction due to negation-blind keyword matching,
and case 6 (unknown control status) demonstrates the narrow gate provides zero protection for
safety-decisive unknowns outside 5 hardcoded hazard-family IDs.

## 19. Is the current C03 gate defensible?

Yes, for its narrow stated purpose (catching near-total absence of hazard signal). It is not a general
evidence-sufficiency safety net and should not be treated as one.

## 20. Finding-scoped sufficiency feasibility

**FOUNDATION_INCOMPLETE.** Finding identity/keying is proven reusable (C01 precedent), and one traced
multi-hazard case shows real value (a genuinely vague sibling finding masked inside a well-evidenced
whole-text score). But several hazard-family detectors (`contractor_coordination`,
`corrective_action_verification_failure`, hydraulic/LOTO cross-clause fallbacks) produce
whole-text-contaminated fragments, and no per-finding citation attribution exists anywhere. Implementing
now would convert a disclosed limitation into an undisclosed false-precision defect. Details:
`V5_MIDPOINT_FINDING_SCOPE_FEASIBILITY.md`.

## 21. SafeScopeActionQualityService recommendation

KEEP_DEFERRED (NEEDS_CALIBRATION). Redundant with live engines except for a narrow owner/due-date
completeness check, which is worth extracting on its own if ever prioritized (LOW backlog item).

## 22. SafeScopeControlEffectivenessService recommendation

KEEP_DEFERRED, candidate for REMOVE_LATER. Fully redundant with `ControlIntelligenceService` +
`HazardDomainIntelligenceService` + `ActionEffectivenessService`. The real control-effectiveness gap
(risk scoring is control-blind) should be closed by wiring those *already-live* engines into
`risk-engine.ts`, not by reviving this service.

## 23. Corrective-action benchmark triage

**REAL_PRODUCT_DEFECT.** Uncommitted change to `corrective-action.service.ts` shadows the
component-aware narrative generator for guarding/electrical/fall/mobile/walking domains. 3/4 scenarios
fail. Moderate severity — output stays valid and safety-appropriate but loses specificity. Classified
P1 due to being a live, user-facing regression sitting in the current working tree.

## 24. DefensibleCorrectiveActionService triage

**STALE_TEST.** The validation script's substring check flags the service's own "we are withholding
citation language" disclaimer as prohibited content. Pre-existing, previously documented, unaffected by
the current diff. Low severity — output never reaches a live user.

## 25. Stale DTO fixture triage

**FIXTURE_DRIFT.** `smoke-corrective-actions-organization-scope.ts` still uses a non-UUID `reportId`
placeholder against an entity column recently changed to `uuid`. Not executed (no disposable DB target
verified); finding is static-analysis only. Low severity, confined to a verification script.

## 26. End-to-end user-journey findings

12 scenarios traced. Headline finding: two parallel, live frontends with materially different fidelity —
see item 12 above and `V5_MIDPOINT_USER_JOURNEY.md` for the full per-scenario breakdown, including a
historical-condition risk-badge display bug and a completely unlabeled planned-future-correction state.

## 27. Explainability gaps

Control-effectiveness reasoning entirely dead/unsurfaced; planned-future-correction has no label;
historical risk badge not recomputed; evidence-sufficiency reasons stripped from the interactive review
UI; observation-level confidence/uncertainty not surfaced alongside per-standard confidence.

## 28. Reporting gaps

The canonical/versioned report renders only `conclusion`/`status`/`riskBand` — no standards reasoning,
confidence, evidence-sufficiency, or finalization state. A separate, non-canonical legacy PDF exporter
carries more of this, but is not the durable report artifact.

## 29. Workflow gaps

Two divergent HazLenz flows; multi-hazard decomposition not enforced into separate findings downstream;
corrective-action UI never displays finding linkage despite data-model support.

## 30. Safety-decision gaps

Clarification-required state is non-blocking; independent per-finding risk (C01) doesn't reach the
primary-CTA flow; `resultStage`/`mayFinalize` have zero consumers anywhere including the final report.

## 31. V4 regression status

No regression detected. Both backend (`tsc`) and frontend (`next build`) complete cleanly. Protected V4
files (`safescope-v2.service.ts`, `multi-hazard-decomposition.service.ts`, standards-applicability
engines) were read-traced only, not modified, and no phase (including this audit) altered them.

## 32. V5-C01 status

Implementation confirmed correct and working as designed **within the canonical flow only**. Not fully
delivered product-wide — see P1 #1. Recommend treating C01 as "code-complete, rollout-incomplete" rather
than fully closed until the flow-unification NEXT phase lands.

## 33. V5-C02 status

Confirmed correct, additive, and non-regressive. Shared evidence facts power two live consumers
(`evidence-foundation.ts`, `EvidenceSufficiencyService`'s trace argument); the deliberate non-migration of
precision-sensitive V4 raw-text consumers remains intact and appropriate.

## 34. V5-C03 status

Confirmed correct and narrowly scoped as designed. Zero product/workflow/report consumers, unchanged
since the prior audit — this phase produced a correct signal without productizing it, which is expected
per its own stated scope but leaves real value on the table (see item 15).

## 35. V5-C04 status

Confirmed correct. Both placeholder engines remain deleted; both genuinely-implemented deferred engines
remain unreachable and are now classified REDUNDANT rather than merely deferred, narrowing future
disposition options to KEEP_DEFERRED/REMOVE_LATER.

## 36. Protected hashes

Recorded in `V5_MIDPOINT_BASELINE.md`. No protected file was modified during this audit.

## 37. Backend build

`cd backend && npm run build` (`tsc`) — **EXIT 0**, no errors.

## 38. Frontend build

`cd frontend-next && npm run build` — **EXIT 0**, no errors, all routes prerendered successfully.

## 39. git diff --check

Clean — no whitespace errors, exit 0.

## 40. HEAD before/after

`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` before and after. Unchanged; no commits made.

## 41. Working-tree preservation

Confirmed unchanged: 97 modified / 15 deleted files both before and after this audit (identical counts).
The only addition is this audit's own directory (`verification/hazlenz-v5-midpoint-audit-2026-08-16/`,
untracked, as expected). No `git reset`/`restore`/`checkout --`/`stash`/`clean` was run at any point.

## 42. Disposable infrastructure teardown

No database was created, connected to, or mutated during this audit. The two verification scripts written
(`scripts/evidence-sufficiency-corpus.ts`, `scripts/finding-scoped-feasibility-trace.ts`) are pure
in-memory computations with no DB dependency and remain in the audit directory as reproducible artifacts;
nothing requires teardown. One temporary probe script created during corrective-action-brain triage was
deleted within the same command and is confirmed absent from `git status`.

## 43. Revised V5 backlog

Full ranked list: `V5_MIDPOINT_BACKLOG.md`. Summary: NEXT = flow unification; HIGH = control/domain
intelligence wired into risk scoring, corrective-action regression fix, C03 Option-A frontend indicator,
historical/planned-future display fixes; MEDIUM = sufficiency calibration, clarification enforcement,
corrective-action linkage UI, report alignment; LOW = action-quality completeness-check extraction, dual
standards-engine reconciliation, two stale-test fixes; DROP = wiring either C04-deferred service as-is,
implementing finding-scoped sufficiency now.

## 44. Recommended NEXT phase

**HazLenz Flow Unification** — backport C01's `riskSnapshot` consumption into the legacy
`FindingsReviewList.tsx`/`RiskReviewSection.tsx`/`FindingReviewEditor.tsx` components, or redirect the
legacy `/inspection` entry point into the canonical `/inspection-workspace` flow.

## 45. Reason this phase outranks the alternatives

Every other candidate phase (C03 frontend consumption, sufficiency calibration, control-effectiveness
wiring, finding-scoped sufficiency, explainability/reporting UI) is a *new* capability or refinement built
on top of the existing frontend surface. But that surface is currently forked, and the fork is not
cosmetic — it determines whether a real user receives a safety-relevant fix (C01's independent risk) that
was already built, verified, and marked closed. Building further product-facing work on top of an
unresolved fork means either duplicating every future UI change across two flows or repeating exactly the
gap this audit found. Flow unification is also comparatively low-risk to execute (the richer surface
already exists in the canonical flow; C01 already proved the underlying data path works) and is a strict
prerequisite for confidently evaluating Options B/C for C03 signal consumption, control-effectiveness
surfacing, or any other frontend-facing item in the backlog. It resolves the highest-value mismatch across
safety correctness, product behavior, user understanding, workflow integrity, and release quality
simultaneously — the exact decision rule this audit was asked to apply.
