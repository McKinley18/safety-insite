# KG-3C — browser verification screenshot inventory

Captured 2026-08-19 in real Chromium 148.0.7778.96 (Playwright), deviceScaleFactor 2.
Desktop 1440x1000; mobile 390x844 with `isMobile`/`hasTouch`. Theme is the app's own
`safety_insite_theme` preference (class on `<html>`), matched to the context color scheme.

`*-context.png` are full-viewport captures of the same moment; the unsuffixed files are
element captures of the Standard Detail card (`.guided-standard-card`).

| File | State | View | Expected contract |
|---|---|---|---|
| `approved-light.png` | approved | light | verified badge shown; approved text visible |
| `approved-dark.png` | approved | dark | verified badge shown; approved text visible |
| `approved-mobile.png` | approved | mobile | verified badge shown; approved text visible |
| `approved-mobile-dark.png` | approved | mobile-dark | verified badge shown; approved text visible |
| `unapproved-light.png` | unapproved | light | no badge; summary under "HazLenz standard summary" |
| `unapproved-dark.png` | unapproved | dark | no badge; summary under "HazLenz standard summary" |
| `unapproved-mobile.png` | unapproved | mobile | no badge; summary under "HazLenz standard summary" |
| `unapproved-mobile-dark.png` | unapproved | mobile-dark | no badge; summary under "HazLenz standard summary" |
| `citation-only-light.png` | citation-only | light | no badge; unavailability notice; no body text |
| `citation-only-dark.png` | citation-only | dark | no badge; unavailability notice; no body text |
| `citation-only-mobile.png` | citation-only | mobile | no badge; unavailability notice; no body text |
| `citation-only-mobile-dark.png` | citation-only | mobile-dark | no badge; unavailability notice; no body text |
| `placeholder-1910-36-light.png` | placeholder provenance | light | 1910.36 NOT verified; no `starter-unverified` leak |
| `placeholder-1910-36-dark.png` | placeholder provenance | dark | 1910.36 NOT verified; no `starter-unverified` leak |
| `placeholder-1910-36-mobile.png` | placeholder provenance | mobile | 1910.36 NOT verified; no `starter-unverified` leak |
| `standard-detail-egress.png` | Standard Detail expanded | — | "Official regulation text" panel; finding state preserved |
| `standard-detail-excavation.png` | Standard Detail expanded | — | "Official regulation text" panel; finding state preserved |
| `standard-detail-fall-protection.png` | Standard Detail expanded | — | "Official regulation text" panel; finding state preserved |
| `mobile-standard-detail-open.png` | Standard Detail expanded | — | "Official regulation text" panel; finding state preserved |

Context captures:

- `approved-dark-context.png`
- `approved-light-context.png`
- `approved-mobile-context.png`
- `approved-mobile-dark-context.png`
- `citation-only-dark-context.png`
- `citation-only-light-context.png`
- `citation-only-mobile-context.png`
- `citation-only-mobile-dark-context.png`
- `unapproved-dark-context.png`
- `unapproved-light-context.png`
- `unapproved-mobile-context.png`
- `unapproved-mobile-dark-context.png`

Total: 31 PNG files.
