# First-Time User Journey

Performed as a first-time safety professional, no prior knowledge of the codebase, starting cold from the marketing home page.

## Path taken and friction points

| # | Step | What the user must decide | Classification |
|---|---|---|---|
| 1 | Land on `/` | Nothing required; "Return to Dashboard" CTA is confusing copy for a brand-new visitor (implies a prior session) | UNCLEAR |
| 2 | Click through to Register, choose a plan | Clear 3-tier cards (Free/Pro/Expert) with price + one-line description each | ESSENTIAL, well done |
| 3 | Fill registration form | Straightforward fields + one liability checkbox with well-written copy | ESSENTIAL |
| 4 | Redirected to `/login` after registering | Page greets with "Welcome back." for a user who has never logged in before | UNCLEAR (small, but a real first-impression inconsistency) |
| 5 | Log in | Standard | ESSENTIAL |
| 6 | Land on Dashboard, click "Start Inspection" | This is the **legacy** `/inspection` flow, not the canonical Pro "Full Inspection" flow that lives under `/inspections` | **BLOCKING_CONFUSION at the architecture level** — see below |
| 7 | Capture: photo (skipped, optional), observed condition, location | Clear, single-screen, no ambiguity | ESSENTIAL |
| 8 | Trigger "Review with HazLenz AI" | On a fresh account with no paid entitlement, this returned a raw 500 in the DEV_AUTH_BYPASS-enabled default local config (see `ERROR_EMPTY_LOADING_AUDIT.md`); with bypass off it returned a clean, well-messaged "paid subscription required" fallback with a working "Use Offline Review" escape hatch | BLOCKING under one dev config, ESSENTIAL/graceful under the other |
| 9 | Answer evidence-gap clarification questions | Not visually distinguished from "required" vs. "nice to have" beyond CRITICAL/IMPORTANT tags; fully expanded, takes real scroll distance | SIMPLIFIABLE |
| 10 | Confirm risk on the 5×5 matrix | Clear, well-designed | ESSENTIAL |
| 11 | Review the generated corrective action | Content did not match the finding's hazard category in a multi-hazard scenario (see `CORRECTIVE_ACTION_UX_AUDIT.md`) | BLOCKING_CONFUSION for trust, not for navigation |
| 12 | Save the finding, generate the report package, confirm qualified-person review, export PDF | **Dead end** — export is gated behind "1 HazLenz AI finding(s) still need snapshot validation" with no visible control anywhere on the page to satisfy that gate | **BLOCKING_CONFUSION** |
| 13 | (Discovered separately, not from the primary dashboard CTA) `/inspections` hub has a second, clearly-labeled "Full Inspection" (Pro) entry point that leads to a *different*, server-backed 5-stage workspace (`Capture → Review → Risk → Action → Complete`) with its own working finalize/finalization flow | ESSENTIAL once found, but **not discoverable from the primary dashboard CTA** | BLOCKING_CONFUSION (discoverability) |

## Measured facts
- Primary dashboard CTA ("Start Inspection") leads to a **different, less complete** flow than the one the product itself labels as the "guided Pro workflow with HazLenz AI review, standards support, corrective actions, and report generation" (that copy lives on the `/inspections` hub, one click further in).
- At least **3 distinct entry points** exist for starting inspection work: the dashboard CTA (`/inspection`, legacy/free-flavored), `/inspections` → "Quick Inspection" (Free), and `/inspections` → "Full Inspection" (Pro, canonical/server-saved). A first-time user following the most obvious button on the page (the big blue "Start Inspection" on the dashboard) does not land on the canonical, fully-working path.
- The legacy `/inspection` → `/inspection-review` path's PDF export is a genuine dead end for a HazLenz-AI-generated finding in this environment (see `ERROR_EMPTY_LOADING_AUDIT.md` and `REPORT_VISUAL_AUDIT.md`); the canonical `/inspections` → "Full Inspection" → `/inspection-workspace` path does produce persisted, finalized findings.

## Step-count summary (canonical Pro path, once found)
Capture (1 screen) → Review/HazLenz (1 screen, with an evidence-clarification sub-section) → Risk (1 screen) → Action (not separately exercised to completion in this pass) → Complete (not reached). That is close to the "Capture → HazLenz analyzes → Review findings → Assign risk/corrective action → Complete → Report" ideal the product should be aiming for — see `INSPECTION_SIMPLIFICATION.md`.

## Overall verdict
The **individual screens** are simple and well-designed. The **journey-level architecture** — two parallel inspection systems (legacy client-side vs. canonical server-saved) reachable from different entry points, with the more prominent entry point leading to the weaker/dead-ending path — is the single biggest first-time-user friction point found in this audit.
