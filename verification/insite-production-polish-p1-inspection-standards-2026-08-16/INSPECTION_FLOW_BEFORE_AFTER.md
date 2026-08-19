# Inspection Flow — Before / After

## Before

- Dashboard primary CTA ("Start Inspection") linked to `/inspection` (legacy, client-side flow) — the weaker of the two full-inspection systems, per `FIRST_TIME_USER_JOURNEY.md` / `INSPECTION_SIMPLIFICATION.md` / `INFORMATION_ARCHITECTURE_AUDIT.md`.
- The canonical, server-saved flow (`/inspections` → "Full Inspection" → `/inspection-workspace`) was reachable only via a secondary hub page, one click further in, not discoverable from the primary CTA.
- On the Risk step of the canonical flow, two adjacent, visually-similar buttons ("Attempt finalization now" and "Confirm risk and finalize finding") had no legible distinction — the former silently transitioned the whole *inspection* to `completed` (skipping the corrective-action/task creation that `complete()` performs), the latter finalized the specific *finding* being reviewed. `INSPECTION_SIMPLIFICATION.md` named this pairing directly as unnecessary friction.
- `/inspection-workspace` printed raw technical state directly in the primary flow: `Status: {enum} · version {n}`, raw `Finding ID: <uuid>` and `Analysis: <uuid>` inline in the findings list.
- Tier-2 ("Essential clarification") evidence-gap questions rendered as 3-4 unlabeled question blocks with no explanation of why the section was long before the user scrolled through it.

## After

- Dashboard "Start Inspection" now links to `/inspections`, the hub where Quick (Free) vs. Full (Pro) is an explicit in-flow choice — matching all three audits' recommended fix. The legacy `/inspection` route is **not deleted**; it remains reachable directly and via `/inspection-cover`'s own internal flow, so no in-flight legacy-flow data or bookmark is orphaned. Verified live: clicking the dashboard CTA now lands on `/inspections`; navigating directly to `/inspection` still works.
- `/inspection-workspace`'s Risk step now has a single finalize action ("Confirm risk and finalize finding"). The redundant "Attempt finalization now" button and its dead-end handler were removed — it operated at the wrong level (whole inspection vs. the finding under review) and duplicated functionality already reachable correctly from the Complete stage.
- `Status: {enum}` is now humanized ("Draft" / "In review" / "Completed"); the findings list shows "{Finalized|Pending review} · Review {complete|required}" as the primary line, with the raw Finding ID / Analysis ID moved behind a collapsed "Advanced details" `<details>` disclosure (verified expand/collapse live).
- "Essential clarification" now opens with a compact summary line ("N evidence gaps — answer to raise confidence in the standard shown below") before the question blocks, per `CLARIFICATION_UX_AUDIT.md`'s own explicit recommendation. The questions themselves remain fully expanded (not collapsed) since they are decision-critical to confidence/standard selection, matching the audit's safety judgment.

## What was not changed

- The legacy `/inspection` flow's own screens and its internal cover-page → capture sequence.
- The overall 5-stage Capture → Review → Risk → Action → Complete architecture of the canonical flow (already matched the target mental model per the source audit).
- Free/Quick Inspection path.
