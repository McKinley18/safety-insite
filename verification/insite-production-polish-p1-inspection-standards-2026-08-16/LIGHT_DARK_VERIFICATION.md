# Light / Dark Mode Verification — Touched Surfaces

Method: real Chromium browser, `Settings → Appearance` toggle (persisted user preference, matching the prior audits' method — not a system-media-query test). Verified `document.documentElement`/`body` carry the `dark` class and `data-theme="dark"` when toggled.

## Surfaces touched this phase

| Surface | Light | Dark | Result |
|---|---|---|---|
| Dashboard "Start Inspection" CTA | Unchanged styling, new target | Unchanged styling, new target | PASS |
| `/inspection-workspace` humanized status line | Clean | Clean | PASS |
| `/inspection-workspace` findings list + "Advanced details" disclosure | Clean, collapsed/expanded both legible | Clean, collapsed/expanded both legible | PASS |
| `/inspection-workspace` "Essential clarification" summary header | Clean | Clean | PASS |
| Standards citation heading (`StandardCitationHeading`, both flows) | Citation link legible, "Standard detail" pill readable | Citation link legible (light blue `#5DB7FF`-family), pill readable | PASS |
| Standards citation expanded panel (official text / parent-section disclosure / not-available fallback) | Not re-screenshotted this phase (unchanged from P1's already-verified light-mode styling) | Verified live: navy panel background, light body text, amber disclosure banner readable | PASS |
| Sticky "Finding Builder" mobile summary card (`CurrentHazardCard.tsx`) | **Unchanged, confirmed correct** (white card, dark text, as before) | **Fixed this phase** — was white-on-near-white (unreadable); now correctly repaints to the dark navy surface (`#0B1320`) with white/light text | FIXED, PASS |

## Root cause of the "Finding Builder" dark-mode defect (found and fixed, not just described)

Confirmed via direct DOM/CSSOM inspection (not guessed): the component's className list included `dark:bg-[#0B1320]/95`. The `dark` class was correctly present on `<html>`, and Tailwind *did* generate a matching `.dark\:bg-\[\#0B1320\]` CSS rule — but a Tailwind v4 utility-layer cascade-ordering issue meant the light-mode `bg-white/95` rule still won at equal specificity, even after trying the trailing-`!` important modifier (which generated a real `!important` rule that *still* lost). This is a Tailwind v4/Turbopack-specific cascade-layering defect with arbitrary-hex-value `dark:` variants, reproduced after a full clean dev-server restart (ruling out an HMR-cache artifact) — not the simple "hardcoded background" the source audit hypothesized, though the audit's *symptom* description was accurate.

**Fix**: added one hand-authored CSS rule (`.dark .finding-builder-surface { background-color: #0b1320 !important; }`) to `globals.css`, alongside the file's existing precedent of similar hand-authored dark-mode overrides for other components, and applied the `finding-builder-surface` class to the component. This guarantees correct cascade regardless of Tailwind's utility-generation ordering. Verified: dark mode now shows the correct navy surface; light mode re-verified unaffected (white card, dark text, unchanged).

## Not touched this phase (explicitly out of scope, documented so it isn't lost)

`PH-2` — Settings → Appearance/Billing cards' white-on-white dark-mode bug — confirmed still present but is not an inspection surface; left for a future general dark-mode polish phase per `P1_POLISH_SCOPE.md`.
