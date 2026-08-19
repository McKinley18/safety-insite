# Finding Presentation Hierarchy — Implementation

Per `FINDING_PRESENTATION_AUDIT.md`, the finding card's content model was already assessed as "genuinely good" — the right things primary, the right things collapsed. This phase's scope was therefore narrow: fix the specific content-integrity/leakage items the audit flagged, not redesign the card.

## Classification (carried from the source audit, confirmed still accurate)

- **PRIMARY**: finding title, risk level, confidence, primary/candidate standard citation, mechanism chain, corrective action.
- **SECONDARY**: "Evidence Used," hazard-category control — collapsed by default (unchanged).
- **EXPANDABLE**: "View AI Reasoning Trace" (unchanged); standards citation detail (newly interactive this phase, see `ADDITIONAL_QUESTIONS_IMPLEMENTATION.md` / standards sections below).
- **ADVANCED**: raw Finding ID / Analysis ID — **moved from inline-primary to a collapsed `<details>` "Advanced details" disclosure this phase** (`inspection-workspace/page.tsx`).
- **REMOVE_FROM_PRIMARY_FLOW**: the redundant "Attempt finalization now" action (removed, not merely reclassified — see `INSPECTION_FLOW_BEFORE_AFTER.md`).

## Changes made

1. `Status: {enum} · version {n}` → `Status: {Draft|In review|Completed} · revision {n}` (`humanizeInspectionStatus`).
2. Per-finding line: `State: {enum} · Review: ... · Analysis: {uuid}` → primary line `{Finalized|Pending review} · Review {complete|required}`, with `Finding ID` / `Analysis` UUIDs moved into a collapsed "Advanced details" disclosure.
3. Standards card citation heading upgraded from static text to the existing `StandardCitationHeading` interactive component (previously legacy-flow-only — see standards sections below), keeping the finding card's established primary→secondary ordering (citation → official-text availability → HazLenz summary → why-selected → confidence → evidence-gaps).

## Not changed

- The mechanism chain, "Confirm before closure" checklist, multi-hazard sibling-isolation banner, and "View AI Reasoning Trace" disclosure — already correctly hierarchied per the source audit, no defect found.
- Report-page checksum/version display (`Report version {n} · checksum {hash}…`) — out of scope; report redesign is explicitly excluded from this phase.
- Action Details' raw ISO-8601 due-date timestamp — this instance lives in the **legacy flow's** `CorrectiveActionsSection.tsx`/`InspectionStepThree.tsx`, not `/inspection-workspace`; left untouched to avoid unnecessary edits to the protected V5-C05 surface for a flow this phase is deliberately demoting rather than polishing further.
