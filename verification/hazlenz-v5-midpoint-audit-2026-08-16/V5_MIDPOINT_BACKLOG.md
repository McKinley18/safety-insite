# V5 Midpoint Audit — Phase 10: Backlog Re-Ranking

Re-ranked from current repository state, not the original numerical V5 order.

## NEXT

### HazLenz Flow Unification — deliver C01 (and future signals) product-wide

- **Problem**: two parallel, live HazLenz frontends exist. The canonical `/inspection-workspace` flow has
  C01's independent-risk fix; the legacy `/inspection`→`/inspection-review` flow (reachable from the app's
  most prominent CTA) does not.
- **Evidence**: `frontend-next/app/command-center/page.tsx:419` routes the primary CTA to `/inspection`;
  `FindingsReviewList.tsx`/`RiskReviewSection.tsx`/`FindingReviewEditor.tsx` read the pre-C01 shared
  `safeScopeResult.risk` object, confirmed by grep and by C01's own implementation report listing only
  canonical-flow files as touched.
- **Affected user behavior**: majority of real users (primary-CTA path) do not receive independent
  per-finding risk; a closed, verified V5 phase does not actually reach most production traffic.
- **Safety significance**: high — this is the exact sibling-risk-contamination defect C01 was built to
  close, still live for most users.
- **Engineering risk**: moderate — either backport `riskSnapshot` consumption into the three legacy
  components, or redirect the legacy flow's entry points to the canonical workspace. The canonical flow
  already has the richer, already-verified surface built.
- **Regression risk**: moderate but bounded, especially if done as a redirect rather than a parallel
  patch — a redirect also prevents this fork from reproducing itself on the next signal (C03, future
  control-effectiveness work, etc.).
- **Prerequisite**: none.
- **Disposition: NEXT.** Resolves the highest-value mismatch across safety correctness, product behavior,
  and release quality, and is the precondition for safely building any further frontend surfacing —
  building new UI treatments into only one of two flows would repeat the same mistake.

## HIGH

1. **Wire live control/domain-intelligence into risk scoring** (not the dead C04-deferred services —
   see `V5_MIDPOINT_DEFERRED_INTELLIGENCE.md`). Problem: `risk-engine.ts` computes risk once, early,
   without consulting the already-live `ControlIntelligenceService` or `HazardDomainIntelligenceService`,
   so effective vs. failed vs. absent controls are not reliably distinguished in the risk score a user
   sees. Safety significance: high (direct effect on the risk band shown to the user). Engineering risk:
   moderate — touches the protected-adjacent risk-scoring path. Prerequisite: none strictly, but should
   follow flow unification so the fix reaches both surfaces at once (or reaches only the surviving one).
2. **Fix the corrective-action-brain narrative regression** (P1, currently uncommitted — see
   `V5_MIDPOINT_CORRECTIVE_ACTION_TRIAGE.md`). Narrow, low-risk, quick fix; should happen before or
   independent of any phase sequencing, since it is sitting in the working tree today.
3. **Frontend consumption of the C03 finalization signal — Option A (informational indicator only)**.
   Low regression risk, purely additive, gives real product value to already-completed work. Should not
   attempt Option C (blocking) until the calibration work below lands.
4. **Fix historical-condition risk-badge staleness and add planned-future-correction UI treatment.**
   Both are narrow, localized display/sequencing bugs in `safescope-v2.service.ts`'s reclassification
   logic and the corresponding UI components. Safety significance: moderate (visible contradiction /
   missing signal); engineering risk: low.

## MEDIUM

1. **Evidence-sufficiency calibration fixes** — port `hasAnyNonNegatedTerm` into
   `EvidenceSufficiencyService`'s fallback scorers; reconsider the unweighted 9-dimension composition;
   widen (or explicitly re-scope) the 5-hardcoded-ID `safetyDecisiveIds` allowlist. Should land before or
   alongside Option B/C-level frontend consumption of the finalization signal (see
   `V5_MIDPOINT_FINALIZATION_SIGNAL_AUDIT.md`), since those options depend on trusting the scores more
   than Option A does.
2. **Clarification-answer enforcement** — track whether a clarification question was actually resolved
   before allowing finding/inspection completion. Depends on flow unification landing first (both flows
   would otherwise need the fix independently).
3. **Corrective-action UI: show finding linkage explicitly** (title/label, not just ambient context) and
   give auto-generated action titles hazard-specific text instead of generic "condition #N" phrasing.
4. **Report/PDF explainability alignment** — bring confidence, sufficiency, and finalization-state summary
   into the canonical/versioned report artifact, not just the live workspace UI.

## LOW

1. **`SafeScopeActionQualityService` owner/due-date completeness check** — extract only this narrow,
   non-redundant slice into an existing live validation path, rather than wiring the full service.
2. **Dual standards-applicability engine reconciliation** — pre-existing ad hoc reconciliation between
   `ApplicableStandardsService` and `StandardApplicabilityService`; out of V5 scope but noted as
   architecture debt.
3. **`DefensibleCorrectiveActionService` validation test fix** — correct the blunt substring check so it
   distinguishes "we blocked citation language" from "we emitted a citation." No live impact; low
   urgency.
4. **`smoke-corrective-actions-organization-scope.ts` fixture fix** — update the placeholder `reportId` to
   a UUID to match the entity's current column type. Confined to a verification script.

## DROP

1. **Wiring `SafeScopeControlEffectivenessService` as-is** — REDUNDANT with already-live
   `ControlIntelligenceService`/`HazardDomainIntelligenceService`/`ActionEffectivenessService`; wiring it
   would add near-duplicate output, not new capability. The real gap (risk-scoring control-blindness) is
   addressed by the HIGH-ranked item above instead.
2. **Wiring `SafeScopeActionQualityService` in full** — same redundancy; only its narrow completeness
   check (LOW, above) is worth keeping.
3. **Finding-scoped evidence sufficiency implementation** — classified `FOUNDATION_INCOMPLETE` in Phase 5;
   several hazard-family detectors produce whole-text-contaminated fragments that would make a naive
   implementation look authoritative while silently re-scoring whole-text evidence under a misleading
   per-finding label. Revisit only after (a) fragment-quality is fixed/allowlisted per hazard family and
   (b) a finding-scoped citation-attribution design exists. Not ranked LOW because attempting it now would
   actively create a new, undisclosed defect class, not merely under-deliver value.
