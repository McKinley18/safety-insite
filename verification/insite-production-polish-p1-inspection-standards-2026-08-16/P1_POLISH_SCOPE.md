# Production Polish P1 — Exact Scope Selection

Selected from `PRODUCTION_POLISH_BACKLOG.md` + the ten audit docs, restricted to items that touch: starting an inspection, capturing observations, HazLenz analysis, finding review, standards, suggested questions/clarifications, inspection navigation, light/dark inspection surfaces, mobile inspection surfaces. All P0/P1 items are already closed (see `insite-p0-remediation-2026-08-16`, `insite-p1-remediation-2026-08-16`) and are not re-touched here except where this phase's own changes require re-verifying them.

## WILL change

### 1. PH-1 — Two parallel inspection systems, weaker one is the primary entry point
Named as the single highest-value finding by three independent audits (`FIRST_TIME_USER_JOURNEY.md`, `INSPECTION_SIMPLIFICATION.md`, `INFORMATION_ARCHITECTURE_AUDIT.md`). Point the dashboard's primary "Start Inspection" CTA at the canonical `/inspections` hub (or directly at the Full Inspection flow) instead of the legacy `/inspection` flow. The legacy flow and its route are **not deleted** — existing bookmarks/links and any in-flight legacy-flow data remain reachable — only the primary CTA's target changes. This is a navigation change, not a rewrite.

### 2. PL-1 / PM-4 — Redundant/ambiguous finalize actions
`/inspection-workspace`: "Attempt finalization now" and "Confirm risk and finalize finding" sit adjacent with no visible distinction in effect. Per `INSPECTION_SIMPLIFICATION.md`'s explicit recommendation ("single, unambiguous 'finalize' action per finding"), collapse to one clearly-labeled action per finding state, or make the distinction between the two legible if they are in fact functionally different. Also add explicit success/failure feedback on the action (PM-4) so it is never a silent no-op.

### 3. PH-3 (inspection-workspace subset) — Raw technical identifiers leaking into user-facing UI
On `/inspection-workspace` only (in scope; the Report-page checksum instance is excluded, see below): format the raw ISO-8601 due-date timestamp in Action Details as a human-readable date; move raw `Finding ID` / `Analysis` UUIDs and the raw `Status: {enum} · version {n}` line behind a clearly-labeled secondary/advanced disclosure rather than printing them inline in primary flow. Content, not layout, change.

### 4. PM-3 — Sticky "Finding Builder" mobile summary not dark-themed, oversized
`CurrentHazardCard.tsx`: repaint the sticky mobile summary card to use the app's dark-mode surface tokens (currently hardcodes a light background per the audit's root-cause hypothesis — will confirm against source before editing) and reduce its default collapsed height on narrow viewports so it does not obscure the Observed Condition input.

### 5. Clarification UX legibility (Phase 5 target, tier-2 evidence-gap questions)
Per `CLARIFICATION_UX_AUDIT.md`: tier 1 (pre-analysis optional context) and tier 3 ("Additional checks") already match the target collapsed/optional pattern exactly and are **not touched**. Tier 2 (evidence-gap questions that gate confidence/standard selection) correctly stays expanded (removing it would hide why HazLenz's output shouldn't be trusted as-is — a decision-critical clarification must stay visible) but gets a compact summary header ("N evidence gaps — answer to raise confidence") so the user understands why the section is long before scrolling through it. This is the audit's own explicit recommendation, implemented narrowly.

### 6. Standards presentation — verify, not rebuild
P1-2/P1-3 already relabeled `standardText` to "HazLenz standard summary" and made the citation an interactive expand/collapse with an honest "not currently available" panel (`P1_STANDARDS_INTEGRITY_CONTRACT.md`). This phase re-verifies that surface live in a real browser (closing the P1 phase's own documented click-automation gap) rather than re-implementing it. No new production change planned here unless live verification finds a regression.

### 7. Authoritative standards text — investigate, likely defer honestly
Phase 7 investigation of whether the `regulatory_section` migration + existing eCFR/MSHA connectors can be safely wired into the live citation path this phase, without fabricating text or mixing summary/authoritative content. If the existing architecture is not safely completable within this phase's scope, this closes as `AUTHORITATIVE_TEXT_FOUNDATION_DEFERRED` per the task brief's own explicit escape valve — not silently skipped.

## WILL NOT change (explicitly out of scope for this phase)

- **PH-2 (Settings Appearance/Billing dark-mode white-on-white)** — real, confirmed bug, but `/settings` is not an inspection surface; the task brief scopes this phase to inspection/standards/finding-review surfaces. Left for a future general dark-mode polish phase. Documented here so it isn't silently dropped from the backlog.
- **PM-1 (homepage hydration mismatch)**, **PM-2 ("Welcome back." on first login)** — marketing/auth surfaces, not inspection surfaces.
- **PL-2 (registration plan-selection Stripe-less indication)** — registration surface, not inspection.
- **Final report redesign** — explicitly out of scope per task brief; the `/inspection-review` → PDF export path and `/reports` page content model are not touched beyond what item 3 above already covers on `/inspection-workspace` (a different surface).
- **General HazLenz recognition/efficiency optimization** — explicitly out of scope; no edits to the protected V4 core files.
- **Deleting the legacy `/inspection` flow** — the audits recommend consolidating the *primary entry point*, not removing the legacy system outright (would orphan any legacy-flow data/links); full retirement is a separate, larger decision left to product judgment.
- **Settings vs. Profile consolidation** (`INFORMATION_ARCHITECTURE_AUDIT.md` open question) — not an inspection surface, and the audit itself says this needs a deeper look before recommending a specific consolidation.

## Risk notes carried into implementation

- Item 1 (PH-1) is the only Medium-regression-risk item selected; will be implemented as a routing/target change only, verified against both flows still functioning afterward.
- All other selected items are Small effort / Low regression risk per the backlog's own classification.
