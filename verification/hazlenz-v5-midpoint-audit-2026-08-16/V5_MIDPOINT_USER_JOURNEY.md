# V5 Midpoint Audit — Phase 8: End-to-End User Journey Audit

Method: pure code tracing on the working tree as it stands. No servers started, no database touched, no
files modified. Every claim below is grounded in a specific file.

## Critical architectural finding (governs every scenario below)

**Two parallel, both-live HazLenz UIs coexist, reachable from different entry points, with materially
different explainability quality:**

- **Legacy flow**: the Home dashboard's primary "Start Inspection" button
  (`frontend-next/app/command-center/page.tsx:419`, `href="/inspection"`) — the single most prominent CTA
  in the app — routes into `app/inspection/page.tsx` → `app/inspection-review/page.tsx`, using
  `components/inspection/SafeScope*` panels, `FindingsReviewList.tsx`, `FindingReviewEditor.tsx`,
  `CorrectiveActionsSection.tsx`, `GenerateReportSection.tsx`.
- **Canonical flow**: the bottom-nav "Inspect" tab → `/inspections` (`app/inspections/page.tsx:53,66`) →
  `/inspection-workspace` (a self-contained 1062-line page importing nothing from
  `components/inspection/*`), using `lib/canonicalWorkflowApi.ts`/PRA-002 backend with a richer
  `guidedFinding` contract.

**C01's independent-risk fix (`riskSnapshot`) is wired into the canonical flow only** — it is never read
in `FindingsReviewList.tsx`, `RiskReviewSection.tsx`, or `FindingReviewEditor.tsx` (the legacy flow), which
still fall back to the pre-C01 shared `safeScopeResult.risk` object. Whether a user gets independent
per-finding risk depends on which button they clicked to start — and the more prominent button leads to
the flow *without* the fix.

## Per-scenario findings

**1. Strong single-hazard observation** — Legacy flow: `SafeScopePrimaryDecisionSection.tsx:134-201`
clearly shows classification, risk band, a confidence badge, a mechanism chain, and "Why this was
suggested." Well communicated. Caveat: `native-reasoning.service.ts` is self-documented dead code — its
rich output type exists but never reaches the UI.

**2. Vague observation** — Detected correctly (`safescope-v2.service.ts:1176-1186`, classification forced
to `'Unclassified'`); surfaced via an amber "Confirm before closure" box
(`SafeScopePrimaryDecisionSection.tsx:87-102`), though it falls back to a generic 3-bullet list when
specific evidence-gap arrays are empty.

**3. Multi-hazard observation** — Decomposes correctly; `SafeScopeInspectionStep.tsx:308-333` shows a
clear "Separate hazards detected" banner with per-hazard cards. Gap: nothing downstream forces creation of
separate report findings — "Add Finding" is manual, and the decomposition is never referenced again once
the report is assembled — a silent-loss risk if a user accepts once without noticing the banner.

**4. Hazard with effective control** — The dedicated control-effectiveness engine is dead code
(`control-effectiveness.service.ts:20-24`, never called). The only live downgrade path is a narrow regex
(`safescope-v2.service.ts:4471-4477`) requiring specific phrasing; ordinary phrasing doesn't match. Risk
is computed once, early, control-blind. An effective control produces no visible risk reduction and no
"control worked" acknowledgment.

**5. Hazard with failed control** — Same dead engine. Worse: the risk-engine's likelihood bump only
triggers on literal words `missing|unguarded|live` (`risk-engine.ts:88-90`) — not
`broken|damaged|removed|inadequate` — so "guardrail present but broken" can score *lower* than "guardrail
missing." No structured UI element distinguishes "control present but failed" from a generic finding.

**6. Historical/resolved condition** — Genuinely implemented: temporal-resolution regex clears
classification/standards and sets a red "Historical condition — verify current status" badge
(`safescope-v2.service.ts:4557-4621`, `SafeScopePrimaryDecisionSection.tsx:148-152`). **Bug**: risk is
computed *before* this determination and never recomputed, so the "Risk" stat tile can still show the
original HIGH/CRITICAL band next to a "Historical condition" badge — a visible internal contradiction.

**7. Planned future correction** — Detected (`plannedGeneralNarrative`/`plannedHotWorkNarrative`,
`:4562-4586`), but **no `reviewStateLabel` is ever assigned for `PLANNED_FUTURE`** and it's excluded from
the `historicalHazards` array. It renders identically to an open, unaddressed hazard — no risk adjustment,
no "correction in motion" messaging.

**8. Clarification-required case** — `resultStage: "provisional"` + `clarifyingQuestions[]` computed
correctly; rendered as a visible amber "Follow-up questions" card in the legacy flow
(`SafeScopeInspectionStep.tsx:348-392`). Advisory only: `FinalizeInspectionSection.tsx` and
`FindingReviewEditor.tsx` never read `clarifyingQuestions`/`resultStage` — a user can save/finalize with
clarification outstanding, with no warning.

**9. Multiple findings, independent risk (V5-C01)** — C01 touched only `inspection.service.ts`,
`finding-risk.mapping.ts`, and `app/inspection-workspace/page.tsx` — not `FindingsReviewList.tsx`/
`RiskReviewSection.tsx`/`FindingReviewEditor.tsx`. The legacy flow (reachable from the dashboard's primary
CTA) remains on the pre-C01 shared-risk pattern. Where C01 *is* wired in, the UI appends "(independent of
other findings)" text, but browser evidence in
`verification/hazlenz-v5-c01-finding-risk-2026-08-15/desktop_browser_notes.json` shows both traced
findings' risk badges read identically "Critical" — independence is legible only by reading each finding's
rationale sentence, not from the badge alone.

**10. Finding review and completion workflow** — `resultStage`/`mayFinalize` have zero frontend consumers
anywhere. `FindingReviewEditor.tsx` gates nothing on it; `saveFinding()`
(`app/inspection/page.tsx:627-673`) only checks whether any data was entered plus a confirm-dialog if AI
suggestions were ignored. The canonical flow's `acceptReview()`/`complete()`
(`inspection-workspace/page.tsx:503-680`) are likewise gated purely on user-supplied risk/reason, never on
the AI's own finality assessment. Completion is 100% user judgment with zero visibility into whether
HazLenz itself considers the analysis final vs. still needing evidence.

**11. Corrective-action creation** — The finding↔action link exists in the data model
(`CorrectiveAction.findingId`) and is stamped internally (`ACT-${findingId}-${index}`), but is **never
rendered as visible text** in `CorrectiveActionsSection.tsx` (its `Props` type has no `findingId` at all).
The only "which finding is this for" cue is ambient context from a floating widget, not an explicit label
on the action itself. Auto-generated action titles are generic ("Verify and correct reviewed condition
#1") with no hazard name embedded — even where linkage data exists, a user with multiple findings can't
disambiguate from the rendered text alone.

**12. Report output** — `GenerateReportSection.tsx` shows only counts (findings/standards/actions/photos)
— no risk, confidence, or sufficiency summary. `ReportDetailsPanel.tsx` shows only metadata. Per-finding
risk/confidence badges do appear in `FindingsReviewList.tsx` and carry into the PDF, but the "validation
status" badge shown there (e.g. "HazLenz AI generated — review needed") is a human-reviewer workflow
status, separate from and easily confused with the AI's own evidence-sufficiency/finalization gate, which
never appears in the report at all — confirming the "zero consumers" finding extends through the final
document a user or regulator would read.

## Summary of gaps

**Explainability gaps**
- Control-effectiveness reasoning is entirely dead code; risk scores are control-blind (#4, #5).
- Planned-future-correction state is detected but has no user-facing label or risk treatment at all (#7).
- Historical-condition risk badge can visually contradict the "historical" label (#6).
- Two structurally different "is this done" signals exist (reviewer validation status vs. AI
  evidence-sufficiency gate) using similar-sounding UI language (#10, #12).

**Workflow gaps**
- Two parallel, inconsistent HazLenz flows are both live, with the more prominent one (dashboard CTA)
  lacking C01's fix (architectural finding above).
- Multi-hazard decomposition is well-presented live but not enforced downstream into separate report
  findings (#3).
- Corrective-action UI never renders which finding an action belongs to (#11).

**Safety-decision gaps**
- Clarification-required state is visible but non-blocking — a finding can be finalized with
  `resultStage: "provisional"` and no warning (#8).
- Independent per-finding risk (C01) is correctly computed in one flow but not wired into the flow
  reachable from the primary dashboard CTA (#9).
- `mayFinalize`/`resultStage` are computed but have zero consumers anywhere, including the generated
  report (#10, #12).

## Files most relevant for follow-up

`frontend-next/app/command-center/page.tsx:419`, `frontend-next/app/inspections/page.tsx:53,66`,
`frontend-next/app/inspection/page.tsx`, `frontend-next/app/inspection-workspace/page.tsx`,
`frontend-next/components/inspection/{SafeScopePrimaryDecisionSection,FindingsReviewList,
FindingReviewEditor,CorrectiveActionsSection,GenerateReportSection}.tsx`,
`frontend-next/lib/inspection/reportReviewHelpers.ts`, `backend/src/safescope-v2/safescope-v2.service.ts`
(lines 990, 1176-1186, 4471-4477, 4557-4621), `backend/src/safescope-v2/control-effectiveness/control-
effectiveness.service.ts:20-24`, `backend/src/corrective-actions/entities/corrective-action.entity.ts:18`.
