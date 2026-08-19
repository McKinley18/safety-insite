# Inspection Simplification Audit

## Current state: two systems, not one

The product currently contains **two parallel inspection journeys** rather than one authoritative one:

1. **Legacy/client-heavy flow** (`/inspection` → `/inspection-review`), reached from the dashboard's primary "Start Inspection" CTA. 5 steps: Hazard Details → HazLenz AI Review → Standards & Actions → Finalize Findings → Generate Report. This flow keeps report state client-side and hit a genuine dead end at PDF export in this audit (payload-too-large on "Save to Cloud," and "Export Final PDF" silently blocked behind an unreachable "snapshot validation" gate).
2. **Canonical/server-saved flow** (`/inspections` → "Full Inspection" → `/inspection-workspace`), reached only via a secondary hub page. 5 stages, explicitly labeled in-product: **Capture → Review → Risk → Action → Complete** — this already matches the audit's target mental model almost exactly. Findings are persisted server-side with real IDs, real state machine (`pending_review` → `finalized`), and a working risk-confirmation action.

**This is the single highest-value simplification opportunity**: collapse to one journey. The canonical, server-saved, 5-stage flow is materially better (real persistence, real finding state, clean "Capture → Review → Risk → Action → Complete" narrative) and should be the *only* path a first-time user can reach from the dashboard.

## Redundancy / friction found within the canonical flow itself
- Clarification questions ("Where did this occur," "Was the equipment running," "Was the worker operating/cleaning/...") are asked once per finding even when two findings originate from the same single observation (`machine_guarding` and `fall_protection` were both generated from one short sentence about a missing guard) — the user answers overlapping context questions twice for what is, from their point of view, one inspection moment.
- A genuine state-management defect was observed: confirming risk on the `machine_guarding` finding instead finalized the `fall_protection` finding, leaving the finding the user actually worked on stuck at `pending_review`. This isn't just a bug — it actively defeats the "simple sequential steps" mental model the product is trying to establish, since the user's action appeared to do nothing (or do something to the wrong item).
- The "Attempt finalization now" button is a real, distinct action from "Confirm risk and finalize finding," sitting one below the other with no visible difference in what each will do until you've tried both — an unnecessary decision point for a first-time user.

## Recommended simplified journey (do not implement in this pass)
1. **Capture** — photo (optional) + one observation text field + location. (Already this simple in the canonical flow.)
2. **HazLenz analyzes** — automatic, no separate "click to review" step needed if evidence is sufficient; keep the explicit trigger only when clarification is genuinely required.
3. **Review findings** — one card per hazard, evidence-gap questions asked once per observation (not once per derived finding) unless the question is genuinely hazard-specific.
4. **Assign risk / corrective action** — keep the 5×5 matrix (it's a strong element) and keep corrective actions, but only after fixing the content-matching defect in `CORRECTIVE_ACTION_UX_AUDIT.md`.
5. **Complete** — single, unambiguous "finalize" action per finding (remove the redundant "Attempt finalization now" vs. "Confirm risk and finalize finding" pair).
6. **Report** — should be reachable in one click from Complete, without a separate dead-ending legacy export path.

## What NOT to change
The individual capture/review/risk screens are already simple, single-purpose, and well laid out. The fix here is architectural (pick one flow) and state-management (fix the finding-swap bug), not visual redesign of the existing screens.
