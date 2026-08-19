# V5-C05 — Phases 7-9: Browser Verification

## Phase 7 — Finding-scoped risk product proof

Live-verified end to end (real browser, real backend against disposable DB, real HazLenz analysis calls,
no mocks). Full walkthrough:

1. Dashboard → "Start Inspection" → `/inspection` (legacy, unchanged route).
2. Entered the same multi-hazard observation used in the P1-01 reproduction; HazLenz decomposition
   returned 4 hazards (electrical 40%, ground control 20%, hydraulic pneumatic energy 78%, lockout tagout
   75%).
3. Reviewed and saved **Finding 1** normally: "Electrical", HIGH, 99% confidence, 29 CFR 1910.303(g)(2)(i).
4. Clicked the new **"Start a finding for this hazard"** button on the "hydraulic pneumatic energy" card.
   Confirmed via screenshot that this correctly saved Finding 1 and seeded the fresh finding's Observed
   Condition field with exactly that hazard's fragment: *"hydraulic pressure remains in the ram"*.
5. Ran "Review with HazLenz AI" on this narrower text. Result: **"Lockout / Stored Energy", HIGH, 26%
   confidence, 29 CFR 1910.147** — genuinely distinct classification, confidence, and standard from
   Finding 1.
6. Saved as **Finding 2**, proceeded to `/inspection-review`.
7. Findings Review section: **Finding 1 "Electrical"** (29 CFR 1910.303(g)(2)(i), "Control stored-energy
   release exposure") vs **Finding 2 "Lockout / Stored Energy"** (implied 1910.147) — different
   classification, different citation, different corrective-action text, each traceable to its own
   independently-scoped HazLenz call.

Screenshots: `screenshots/legacy-flow-shared-risk-defect.jpg` (pre-fix, both findings collapse to
"Electrical"/HIGH), `screenshots/post-fix-finding1-electrical.jpg`,
`screenshots/post-fix-finding2-lockout-stored-energy.jpg` (post-fix, genuinely distinct).

**Finding A → Risk A, Finding B → Risk B, proven live.** Finding A's displayed classification/standard did
not change when Finding B was created — Finding 1 still reads "Electrical"/1910.303(g)(2)(i) after Finding
2 was added, confirmed in the same `/inspection-review` screenshot showing both cards simultaneously.

## Phase 8 — Risk display traceability

`FindingsReviewList.tsx:55` (unmodified by C05): `const risk = finding.safeScopeResult?.risk?.riskBand ||
finding.safeScopeResult?.risk?.operationalRisk?.matrixBand || finding.riskBand || finding.riskScore ||
"Not rated";` — this fallback chain pre-dates C05 and was not touched. Every value in it still traces to
`finding.safeScopeResult`, which is the raw `/safescope-v2/classify` response attached to that specific
finding when it was created. C05 does not add a new fallback, a new default, or any mechanism that could
cause one finding's display to read from another finding's data, a stale cache, or a generic/shared
value — the only thing C05 changes is what **text** produces that `safeScopeResult` for a finding created
via the new button. No new source of risk was introduced; the existing single source (each finding's own
`safeScopeResult`) is unchanged, and it is now populated by hazard-scoped rather than whole-observation
text when the new control is used.

**Acceptable-source requirement:** satisfied. Each finding's risk still derives from a `classify()` call
scoped to that specific finding's own evidence text — never from an observation-level shared object,
another finding's data, a first/last-evaluated fallback, or stale localStorage. No fallback exists that
could "overwrite or masquerade as finding-scoped risk," because C05 introduced no new fallback of any kind.

## Phase 9 — Full canonical/legacy user journeys

| Journey | Method | Result |
|---|---|---|
| 1. Single hazard | Live browser (this session, Finding 1) | Correct: "Electrical", 99% confidence, standard-appropriate |
| 2. Multi-hazard / independent risk | Live browser (this session, Findings 1+2) | **Fixed and verified live** — see Phase 7 above |
| 3. Resume | Code trace (`V5_C05_STATE_COMPATIBILITY.md`) | Unaffected by C05; legacy resume was already non-robust pre-C05, unchanged; canonical resume untouched (0 canonical files modified) |
| 4. Mobile | Live browser at 390×844 viewport | Dashboard and `/inspection` Step 1 render correctly; the new button's containing markup uses the same pre-existing `grid gap-2 sm:grid-cols-2` responsive classes as the hazard cards it lives inside (no new viewport-conditional logic introduced) — confirmed by code inspection; the full multi-hazard-banner interaction was exercised live only at desktop width, not re-clicked at mobile width, given no code path differs by viewport |
| 5. Direct legacy URL | Live browser, direct navigation to `/inspection` (both before and after the fix) | Confirmed intentional, correct behavior: same free, no-picker entry point as the primary CTA reaches, now with the fix in place |

Journey 5 detail: navigating directly to `/inspection` was exercised repeatedly throughout this session
(it is how every reproduction and verification pass was reached). No hidden/obsolete implementation is
reachable through this URL post-fix — it is the same, now-corrected, legacy flow.
