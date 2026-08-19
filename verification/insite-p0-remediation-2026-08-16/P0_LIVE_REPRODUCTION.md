# P0 Live Reproduction (Pre-Fix)

Method: real local backend (port 4000) + real Next.js frontend (port 3000) + real Chromium via browser automation, against disposable database `test_p0_20260816`. Test account `p0tester@example.com` (UUID `45c2888d-85d5-4cc3-8cd8-3468b567ba67`), granted a 6-hour `expert` tier via the repo's `grant-test-entitlement.ts` script (disposable-DB-gated, `NODE_ENV=test` required by the script itself).

All three defects were reproduced before any production code was edited.

## Shared reproduction input

Observation text (matches the audit's own reproduction exactly):

> "Missing guard on the rotating shaft near the crusher drive on the west platform. Exposed lockout/tagout point on the same crusher lacks a padlock, and there is loose material buildup creating a slip hazard on the walkway leading to the platform."

Location: "Crusher deck, west platform"

## P0-02 / P0-03 reproduction (legacy `/inspection` flow)

1. Entered the observation at `/inspection` Step 1 → Step 2 "HazLenz AI Review".
2. Ran "Review with HazLenz AI" → primary finding classified **Machine Guarding**, Critical, 93% confidence, `29 CFR 1910.219(c)`.
3. Decomposition surfaced two sibling hazard cards: **Loto** (40% confidence) and **Fall Protection** (20% confidence, fragment: "there is loose material buildup creating a slip hazard on the walkway leading to the platform").
4. Clicked "Start a finding for this hazard" on Fall Protection → returned to Step 1 with the ISOLATED fragment pre-filled (no guard/LOTO language present) → ran HazLenz AI review again → reclassified as **Walking/Working Surfaces**, Moderate, 88% confidence, `29 CFR 1910.22(a)`.
5. At Step 3 (Standards & Actions), inspected each finding's generated corrective action:
   - **Finding 1 (Machine Guarding)**: title "Verify hazardous-energy isolation before servicing" — LOTO/energy-isolation content, not machine-guarding content. **Reproduces P0-03.**
   - **Finding 2 (Walking/Working Surfaces)**: title "Provide edge fall protection", body "Restrict access to the fall exposure until edge protection or fall protection is in place. • Install guardrails, covers, fall-arrest systems…" — fall-protection/edge-hazard content, despite the finding's own isolated evidence containing no fall/edge/guardrail language. **Reproduces P0-03 a second, independent way** (isolated-fragment contamination, not full-text contamination).
6. Both findings saved and carried through to Step 5 Final Review with the same mismatched content intact — confirmed the defect survives into the pre-export report screen.

## P0-01 reproduction (legacy `/inspection-review` export)

1. From the Step 5 Final Review screen, checked "I confirm this report has been reviewed by a qualified person."
2. Cleared network log, clicked "Export Final PDF".
3. **Zero network requests fired** to `localhost:4000` (confirmed via `read_network_requests`).
4. UI displayed: *"2 HazLenz AI finding(s) still need snapshot validation. Export will continue only after you confirm qualified-person review."* — despite the checkbox already being checked.
5. Initially concluded (matching the audit's framing) that export was blocked. Investigation in Phase 2 (see `P0_01_PDF_EXPORT_ROOT_CAUSE.md`) proved this inference was incomplete — see that document for the corrected mechanism and why zero network requests is not itself proof of a dead end for this export path.

## P0-02 reproduction (canonical `/inspection-workspace` flow)

1. Created a new "Full Inspection" (canonical, server-persisted) with the same observation text via `/inspections` → "Full Inspection" → `/inspection-workspace`.
2. HazLenz decomposition persisted 3 real backend findings for the one observation:
   - `machine_guarding` — Finding ID `5f693f2d-8ce3-4fe5-afc6-c2830176e43e`, Critical
   - `lockout_tagout`/`loto` — Finding ID `fb2b3070-71a3-458c-a1e6-4d8c24fc8ed2`, Moderate
   - `fall_protection` — Finding ID `2ddb59d6-d830-40f6-a38a-000092d3afd5`, High
3. Clicked "Review this finding" on `machine_guarding` → the card correctly highlighted as selected → clicked "Continue to risk review" → **candidate-standard panel** ("CANDIDATE STANDARD — 29 CFR 1910.219(c) — Machine Guarding") displayed correctly for this finding.
4. Clicked "Review this finding" on `loto` → the `loto` card correctly became the highlighted/selected finding (Finding ID, State: pending_review text all correct) — but the **candidate-standard panel below it still showed the previous finding's content: "29 CFR 1910.219(c) — Machine Guarding"**, unchanged from step 3. **Reproduces the display-layer mechanism behind P0-02**: a reviewer looking at this screen would see `loto`'s card selected while being shown Machine Guarding's standard and rationale.
5. The risk-confirmation section below the stale panel, by contrast, correctly showed `loto`'s own data (Severity: Minor, Likelihood: Possible, Overall risk: Moderate) — proving the actual backend write path was NOT contaminated, only this one display panel.
6. Confirmed via direct DB queries after each finalize action across all 3 findings (done sequentially, one browser session, after fixing an incidental JWT-expiry confound) that **every finalize call updated the correct, and only the correct, `inspection_findings` row** — no backend identity swap occurred in this build. See `P0_02_FINDING_IDENTITY_TRACE.md` for the full analysis of why the audit's originally-reported symptom (wrong finding finalized) does not reproduce as a backend defect, and what the real, confirmed defect is instead.

## Summary of what reproduced vs. what didn't

| Symptom as originally reported | Reproduced? | Actual confirmed defect |
|---|---|---|
| P0-01: PDF export completely dead-ended, zero requests, no PDF ever produced | Partially — zero requests is real but is *normal* for this export path; a real PDF *was* produced despite the scary warning | Misleading, permanently-stuck "still need snapshot validation" warning driven by a dead field with no UI producer |
| P0-02: confirming risk on Finding A instead finalizes Finding B (backend swap) | No — backend finalize was correctly scoped to the selected finding in every trial run in this build | A real, adjacent display bug: the candidate-standard summary panel does not update when the selected finding changes, showing a sibling's standard/rationale while the reviewer works |
| P0-03: Machine Guarding finding received fall-protection corrective-action content | Yes, exactly as reported, plus a second independent contamination path (isolated-fragment case) not explicitly called out in the original audit | Confirmed, traced, and fixed — see `P0_03_CORRECTIVE_ACTION_TRACE.md` |
