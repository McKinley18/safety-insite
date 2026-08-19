# V5 Midpoint Audit — Phase 6: Reassess C04-Deferred Intelligence

## SafeScopeControlEffectivenessService and SafeScopeActionQualityService

**(1) Wiring status — confirmed still dead.** Grep across `backend/src/safescope-v2/**`,
`backend/src/corrective-actions/**`, `backend/src/inspection/**` shows each is constructed exactly once,
inside `SafeScopeNativeReasoningService` (`native-reasoning.service.ts:42,44`), which is itself
constructed but never invoked from `safescope-v2.service.ts:52`. Matches the C04 disposition map
verbatim; unchanged in the current working tree.

**(2)/(3) Capability vs. what's already live.** Both engines are honest keyword-matching heuristics
(`includesAny` substring checks, `sourceBoundary`/guardrail disclosure, `mode: "deterministic_offline"`) —
the same pattern as live engines, not stubs. Three already-live, already-wired engines cover most of the
same ground:

- **`ActionEffectivenessService`** (live, `intelligence-orchestrator.service.ts:32,104`) already scores
  corrective actions against exposure pathways, energy sources, barriers, and verification presence
  (`action-effectiveness.service.ts:20-58`) — functionally overlapping both deferred engines' "does the
  action address the hazard / is verification present" logic.
- **`ControlIntelligenceService`** (live, `:25,97`) already implements the same
  elimination>engineering>administrative>PPE hierarchy ranking (`control-intelligence.service.ts:14-46,
  101-103`) that both deferred engines independently reimplement as `getStrongestControlLevel`.
- **`HazardDomainIntelligenceService`** (live, 608 lines) already carries a richer, per-domain taxonomy
  with explicit `weakOrInsufficientControls` lists (e.g. `['PPE only', 'Warning sign only', ...]` for
  machine guarding, `:46-57`), superseding control-effectiveness's crude
  `includesAny(classification, ['machine','guarding'])` domain checks.

Both deferred services are substantially **redundant** with live, wired engines. The one narrow gap not
covered elsewhere: `action-quality`'s owner/due-date completeness check — no live engine currently flags a
missing assignee or due date on a corrective action.

**(4) Trustworthiness.** No crashes, no fake/hardcoded constants, no C04-style dead-path pattern (e.g.
`CorrectiveActionControlMapService`'s literal dummy args). Logic is genuine, just shallow and largely
overlapping with what already runs live.

**(5) Classification:**

- **SafeScopeControlEffectivenessService → REDUNDANT.** Its hierarchy assessment duplicates
  `ControlIntelligenceService`; its domain-specific control checks duplicate/underperform
  `HazardDomainIntelligenceService`; its pathway/verification logic duplicates
  `ActionEffectivenessService`. Wiring it would add near-duplicate output, not new value.
- **SafeScopeActionQualityService → NEEDS_CALIBRATION (leaning REDUNDANT).** Most of it duplicates the
  same trio; the owner/due-date completeness check is a genuine, small, non-overlapping gap. Not worth
  wiring the whole service; if ever revived, only that narrow slice is worth extracting into an existing
  live engine.

Neither is `WIRE_HIGH_VALUE` — the product value these two would add is already produced by the live
orchestrator through other engines.

## Important distinction for the backlog

Wiring these two specific deferred services is **not** the fix for the real control-effectiveness gap
found in Phase 2/Phase 8 (risk scoring is control-blind; a failed vs. effective control produces no
visible risk differentiation). That gap exists because `risk-engine.ts` computes risk once, early, without
consulting *any* control/domain-intelligence engine — including the live, already-wired
`ControlIntelligenceService` and `HazardDomainIntelligenceService`. The fix, if pursued, is wiring the
**live** engines' output into risk scoring, not reviving the two dead/redundant C04-deferred services. See
`V5_MIDPOINT_BACKLOG.md`.

## Recommendation

- `SafeScopeControlEffectivenessService`: **KEEP_DEFERRED**, candidate for `REMOVE_LATER` once its
  redundancy is confirmed by whoever owns the control-effectiveness roadmap item.
- `SafeScopeActionQualityService`: **KEEP_DEFERRED**; extract only the owner/due-date completeness check
  into an existing live corrective-action validation path if that gap is ever prioritized, rather than
  wiring the full service.
