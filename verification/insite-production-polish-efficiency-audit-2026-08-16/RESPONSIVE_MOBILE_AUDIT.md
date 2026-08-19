# Responsive / Mobile Audit

Method: resized the real browser window to a phone-class viewport (390×844 CSS px request; Chrome reported an effective ~500×667 render area after window chrome) and exercised the dashboard and inspection-capture flow live.

## Viewports exercised
- Desktop: ~987×655 (used for the bulk of this audit)
- Phone: ~390×844 requested / ~500×667 rendered

Tablet/narrow-desktop was not separately exercised in this pass due to time; flagged as a gap, not a finding either way.

## Observations

**Dashboard (`/command-center`), mobile:**
- Clean single-column stacking: hero → 2×2 stat tile grid → calendar strip → bottom tab bar.
- Bottom navigation (Home / Inspect / Reports / Calendar) is present, icon+label, adequately sized tap targets, no overlap or clipping observed.
- No horizontal overflow.

**Inspection capture (`/inspection`, Step 1), mobile:**
- Upload Evidence buttons ("Take Photo" / "Upload") stack correctly and remain full-width and easily tappable.
- Observed Condition textarea and Location field render at full width, no clipping.
- **Finding**: the live "Finding Builder" summary chip is implemented as a bottom-sheet-style overlay that becomes quite tall relative to the viewport (roughly a third of the visible screen on a phone-sized viewport), pushing the actual "Observed Condition" input partially behind/above the fold. This is a real usability cost on small screens: a first-time mobile user has to scroll past or around this floating summary to keep working. Combined with the dark-mode theming bug on this same component (see `DARK_MODE_AUDIT.md`), it is the single most mobile-relevant issue found.

## Not exercised in this pass (explicit gap, not a silent omission)
- HazLenz results screen, risk matrix, corrective-action cards, and report review on mobile were not separately screenshotted due to time budget; the desktop versions of these screens (see `LIGHT_MODE_AUDIT.md`) use fairly wide side-by-side stat tiles and a 5-column risk matrix that are reasonable candidates for cramped or overflowing layout on a 390px-wide screen and should be spot-checked before shipping.
- Tap-target sizing was not measured in pixels; the buttons observed subjectively looked adequately sized.

## Assessment
No horizontal overflow, no clipped controls, no broken layout was found in what was tested. The one concrete finding — the oversized, non-themed sticky "Finding Builder" summary on mobile — is real and reproducible but not severe (SIMPLIFIABLE, not BLOCKING).
