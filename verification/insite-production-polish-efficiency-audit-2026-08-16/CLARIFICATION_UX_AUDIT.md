# Suggested Questions / Clarification UX Audit

## Where clarification UI currently appears (2 distinct locations, different behavior)

**1. Pre-analysis, optional context ("Add context for better accuracy")** — HazLenz AI Review step, before the user clicks "Review with HazLenz AI."
- Correctly presented as an **expandable/collapsible section**, labeled "OPTIONAL," collapsed by default.
- This already matches the audit's requested UX contract almost exactly.

**2. Post-analysis, evidence-gap clarification ("Essential clarification" / CRITICAL / IMPORTANT tagged questions)** — shown after HazLenz returns a result, when confidence is capped by missing facts (e.g., "Was the equipment running, capable of unexpected startup, stopped, deenergized, or locked out?").
- These are **fully expanded by default**, not collapsible, and can run to 3-4 full question blocks (jurisdiction, energy state, task type, control status), each with 5-7 button-style answer options.
- They are visually tagged CRITICAL / IMPORTANT, which does communicate priority, but they are not optional in effect — the standard shown remains "CANDIDATE STANDARD — MORE EVIDENCE REQUIRED" and confidence stays Low until they're answered, so treating them as skippable enrichment would be misleading to the user even though nothing forces an answer.

**3. A third, genuinely optional tier ("Additional checks")** — found further down the same review screen, correctly collapsed behind a "Show" toggle with the copy "Optional checks. Primary finding guidance is shown above."

## Assessment against the requested "Additional questions (3), collapsed" pattern
The product **already has the right pattern implemented** for tier 1 (pre-analysis context) and tier 3 (truly optional additional checks). It is tier 2 — the evidence-gap questions that materially change the standard/confidence — that does not fit the "optional, collapsed, expandable" shape, and **should not** be forced into that shape either: these questions are the reason the standard confidence is Low, so hiding them behind a click would make it easier to miss why HazLenz's output should not be trusted as-is. The current fully-expanded treatment for this tier is defensible from a safety standpoint, but it is currently the single largest visual/scroll cost in the Review step.

## Recommended UX contract (do not implement)
- **Mandatory-if-shown clarification** (tier 2, evidence-gap questions that gate confidence/standard selection): keep expanded, but consider a compact "3 evidence gaps — answer to raise confidence" summary header so the user understands *why* this section is long before scrolling through it, rather than encountering four unlabeled question blocks in sequence.
- **Useful optional clarification** (tier 1, pre-analysis context): keep exactly as-is — already collapsed and clearly optional.
- **Enrichment-only questions** (tier 3, "Additional checks"): keep exactly as-is — already collapsed with a "Show" toggle and honest copy about being optional.

## What is NOT currently true
Nothing in the current implementation lets a first-time user proceed through the flow "without ever seeing" clarification questions, nor does the product currently over-collapse genuinely decision-critical questions. The gap is legibility/labeling of the mandatory tier, not its optionality.
