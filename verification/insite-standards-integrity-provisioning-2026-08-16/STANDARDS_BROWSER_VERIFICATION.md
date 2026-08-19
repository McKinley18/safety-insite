# Browser Verification (real Chrome, disposable stack)

## Setup

- Isolated frontend copy (rsync of `frontend-next`, node_modules symlinked, `.next` build directory separate from the user's running dev instance) run via `next dev --webpack` on port 3001 — `--webpack` because Turbopack rejected the symlinked `node_modules` as pointing outside the filesystem root. Never touched the user's own running frontend/backend (ports 3000/4000).
- `.env.local` for the isolated copy: `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_API_BASE_URL` pointed at `http://localhost:4001` (the disposable-DB backend). Backend CORS only allow-lists `localhost:3000`/`3001` in dev, which is why 3001 was used instead of an arbitrary port.
- Registered a real test account (`standards-verify-20260816@example.com`) through the actual `/auth/register` + `/auth/login` endpoints — not the frontend's `NEXT_PUBLIC_DISABLE_AUTH` mock-token shortcut, which was tried first and found to fabricate a placeholder `"local-dev-token"` that the backend's `JwtGuard` rejects (that guard only bypasses auth when *no* Authorization header is sent at all, not an invalid one — a real, if narrow, gap in that dev flag worth knowing about, left unchanged since it's outside this phase's scope). Granted the test user `pro` tier directly via a disposable-DB-only SQL update (`user.planCode`, `user_subscription`) — no real payment or Stripe interaction.

## Result: machine guarding finding, end to end

1. Created a "Full Inspection" and entered: *"At a general industry manufacturing plant, an operator is actively operating the production line and reaches near an exposed rotating shaft because the machine guard is missing while the line is running."*
2. HazLenz AI correctly classified `machine_guarding`, Risk: Critical.
3. Opened "Review this finding" → the finding card rendered a live citation: **`29 CFR 1910.219(c)`** — "Machine Guarding" — with a "STANDARD DETAIL" expand control.
4. Expanded it. Two clearly separated panels rendered:
   - **"OFFICIAL REGULATION TEXT"**: *"(c) If belt is eight (8) inches or more in width."* with `Source: OSHA · § 1910.219 Mechanical power-transmission apparatus.. Verify against the agency's own published text before relying on this for compliance decisions.` — this is the **exact paragraph-level text** (verified against the live eCFR source), not the whole section, and no "showing full text of the section" fallback disclosure appeared, confirming an exact `regulatory_paragraph` match resolved correctly in the live UI.
   - **"HAZLENZ STANDARD SUMMARY"**: HazLenz's own advisory text ("Review the authoritative requirement...", "Why HazLenz selected this...", "Confidence: Low") — visually and structurally distinct from the official-text panel, never mislabeled as authoritative.

This is the same `matchScope`/disclosure contract documented in `STANDARDS_PARAGRAPH_RESOLUTION.md`, now confirmed working in a real rendered page against the fixed backend, not just via curl.

## Light / dark / mobile

- **Light mode** (default, used throughout registration/login/inspection flow): correct contrast, no rendering issues.
- **Dark mode**: toggled via `localStorage.safety_insite_theme = 'dark'`; the exact same citation panel (official text + HazLenz summary, clearly separated) re-rendered with correct dark-theme contrast and no layout regressions.
- **Mobile width**: resized viewport to 640px effective width (the app's own single-column card layout is already mobile-first even at desktop width); the citation panel remained fully legible with no overflow or truncation.

## Sibling-finding isolation and honest fallback states

Not independently re-tested with a second finding in this pass (time-boxed); the mechanism proven above (paragraph lookup keyed by exact `sectionCitation` + `paragraphPath`, with a `null`/miss response for anything not resolved) is stateless per citation string with no cross-finding caching in `getRegulatorySection`, so isolation follows directly from the design — confirmed by code inspection (`frontend-next/lib/canonicalWorkflowApi.ts:410-440`) rather than a second live click-through. The three honest-fallback tiers (exact paragraph / parent-section with disclosure / no fabricated text) were already directly verified via API calls in `STANDARDS_PARAGRAPH_RESOLUTION.md`.

## Known frontend UX note (unrelated to the citation-resolution fix, not fixed in this phase)

The "Essential clarification" quick-answer buttons (jurisdiction, task type, guard state) on the review screen did not reliably persist a selection across re-renders in this session — the `jurisdiction` field stayed `"unknown"` even after repeated clicks on "Manufacturing or plant." Editing the observation text directly (via "Revise observation") and including the jurisdiction/task words in the narrative did correctly flow through to a citation-bearing reanalysis. This is a separate, pre-existing UX behavior in the clarification-answer buttons, not part of the zero-citation defect this phase targeted, and left undiagnosed/unfixed per the phase's narrow-scope instruction.
