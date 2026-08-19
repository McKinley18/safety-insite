# Information Architecture Audit

## Primary navigation (bottom tab bar, present on all screens tested)
Home · Inspect · Reports · Calendar — 4 items, clearly labeled, consistent across desktop and mobile. This part of the IA is clean and not in question.

## Duplicate / overlapping destinations found
1. **Two inspection systems reachable from different places**, already detailed in `FIRST_TIME_USER_JOURNEY.md` and `INSPECTION_SIMPLIFICATION.md`: the dashboard's "Start Inspection" CTA and the "Inspect" tab bar item do not lead to the same place as `/inspections`'s "Full Inspection" card. This is the single clearest IA defect found — two systems for the same job, discoverable through different routes, with different completeness.
2. **`/inspection-review` vs. `/inspection-workspace`** are two entirely separate "final review" surfaces belonging to the two different inspection systems above — a user (or a developer bookmarking a URL) has no way to know which one corresponds to which flow without already knowing the architecture.
3. **Reports** (`/reports`, "server-backed records... immutable, versioned") is a clean, single destination — no duplication found here.

## Account/settings area
- `/settings` and `/profile` are both reachable and both plausible-sounding as "where do I manage my account" — not exercised deeply enough in this pass to say whether they overlap in content, but the existence of two similarly-named destinations (Settings vs. Personal account / Profile) is worth a deliberate check rather than assuming they're cleanly separated.

## Legacy terminology in routes
Route names still carry legacy internal naming in a few places not visible to the end user (e.g., `/inspection-cover`, `/inspection-quick`) — these are implementation details, not user-facing labels, and were not flagged as user-visible problems; see `COPY_TERMINOLOGY_AUDIT.md` for the user-visible copy sweep.

## Recommended clean hierarchy (not implemented)
- **One** "Start an inspection" entry point from the dashboard, leading to the canonical server-saved flow only. Retain "Quick" vs. "Full" as an explicit in-flow choice (as `/inspections` already presents it) rather than as separate systems with separate review/report surfaces.
- Fold `/inspection-review` functionality into `/inspection-workspace`'s "Complete" stage once the legacy path is retired, so there is exactly one "final review before export" screen.
- Confirm and, if needed, consolidate Settings vs. Profile into a single "Account" destination with clear sub-sections, rather than two top-level pages.

## Not broadened
This audit does not recommend adding new navigation items or destinations — the fix here is consolidation of what already exists, per the brief's instruction not to broaden the product unnecessarily.
