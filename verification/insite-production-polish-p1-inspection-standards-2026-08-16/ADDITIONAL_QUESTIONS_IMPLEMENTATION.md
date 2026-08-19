# Suggested / Additional Questions — Implementation

Per `CLARIFICATION_UX_AUDIT.md`, the product already implements the correct three-tier pattern for two of three tiers:

- **Tier 1 (pre-analysis optional context)**: already collapsed by default, labeled "OPTIONAL." Unchanged.
- **Tier 3 ("Additional checks," enrichment-only)**: already collapsed behind a "Show" toggle with honest optional-copy. Unchanged.
- **Tier 2 (post-analysis evidence-gap / decision-critical clarification)**: correctly stays fully expanded — these questions are the reason the standard's confidence is Low; collapsing them would make it easier to miss why HazLenz's output should not be trusted as-is. The audit explicitly judged this the right call and recommended only a legibility fix, not a collapse.

## Change made this phase

Added a compact summary line immediately under the "Essential clarification" heading in `inspection-workspace/page.tsx`:

> "N evidence gap(s) — answer to raise confidence in the standard shown below."

This is computed from the live question count (`analysis.guidedFinding?.clarificationQuestions?.length`), not hardcoded.

## Live verification (real wizard, not a preview route)

Generated a real finding (missing machine guard on a conveyor coupling) through `/inspection-workspace`. Observed:

- **Zero questions**: not applicable to this run (HazLenz retained the observation as materially ambiguous — jurisdiction, energy state, and task were all unconfirmed), so the "3 evidence gaps" case is the one directly exercised.
- **Several evidence-gap questions (3)**: summary line rendered "3 evidence gaps — answer to raise confidence in the standard shown below." above jurisdiction / energy-state / task question blocks. Screenshot captured (dark mode, effective mobile-class viewport ~500×667).
- **One decision-critical clarification**: covered by the same tier-2 mechanism (all tier-2 questions are decision-critical by definition in this product; there is no separate "some tier-2 are decision-critical, some aren't" split to test).
- **Mixed question types**: tier 1 (collapsed, optional) and tier 3 ("Additional checks," collapsed) were confirmed present and unchanged in the legacy flow's `SafeScopeInspectionStep.tsx` (not touched this phase — already correct per the audit).
- **Light mode / dark mode**: confirmed rendering correctly in both (see `LIGHT_DARK_VERIFICATION.md`).
- **Mobile**: no horizontal overflow, question buttons remained full tap-target size at the narrow viewport.

## Not changed

Tier 1 and tier 3 markup/behavior — already correct. Question option-button styling/layout — not flagged by any audit as a defect.
