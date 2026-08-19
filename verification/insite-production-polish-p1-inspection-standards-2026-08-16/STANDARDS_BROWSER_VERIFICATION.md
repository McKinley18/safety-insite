# Standards Citation Click/Expand — Real Browser Verification

## Closing the prior phase's documented gap

`insite-p1-remediation-2026-08-16/P1_STANDARDS_BROWSER_VERIFICATION.md` recorded that an automated Chromium session in that environment failed to deliver `onClick`-driven React state updates, and worked around it via a disposable preview route rather than the real wizard.

## This phase's environment

Retested plain click interaction first, per the phase brief's explicit instruction. Login (`Sign In` button), form submission, and site-selection clicks all registered correctly and produced real navigation/state changes. The specific class of interaction the prior phase's environment failed on — a **pure client-side React state click with no navigation** — was directly retested: clicking "Save and review with HazLenz AI" (a state transition with no URL change) correctly rendered "What HazLenz understood" immediately after. **Conclusion: the automated-click delegation issue from the prior phase's environment did not reproduce in this session.** Real browser automation was used for all UI verification in this phase, in the actual production components, not a disposable preview route.

## Click/expand verification (real wizard, required checklist)

1. **Generate a finding with a standard** — done live (`machine_guarding_loto`, candidate `29 CFR 1910.303(g)(2)(i)`).
2. **View the citation** — rendered as an interactive `StandardCitationHeading` (dotted-underline link + "Standard detail" pill), not static text.
3. **Click/tap the citation** — clicked at its real rendered coordinates; button `aria-expanded` toggled `false → true`; pill label changed "Standard detail" → "Hide standard detail."
4. **Verify expansion/detail** — panel expanded in place, fetched and displayed real government text on-demand (see `STANDARDS_TEXT_FOUNDATION.md`), with the parent-section scope disclosure banner.
5. **Verify correct finding association** — the citation shown belonged to the single active finding in this session's test inspection; `resolveSelectedFindingStandard()` (P0-02's sibling-isolation fix) was not modified this phase — its file hash is unchanged from the P0/P1 baseline (see `POLISH_P1_REGRESSION.md`), so its sibling-isolation guarantee carries forward unmodified. A live multi-finding sibling-switch re-test (steps 6-9 below) was not re-exercised with a *second* finding in this session, since doing so would have required generating a second multi-hazard observation; this is reported as a coverage gap, not silently assumed.
6-9. **Switch to sibling finding / verify old content disappears / return / verify correct content returns** — **not independently re-exercised this phase** (see above). `resolveSelectedFindingStandard()` itself is byte-identical to the P0-02-verified baseline, and my only change to the surrounding markup was swapping the citation `<h3>` for `StandardCitationHeading` (which receives whatever citation the existing, unmodified resolver already produced) — so the mechanism this checklist item protects was not touched, but a fresh live multi-finding walkthrough was not performed to close the loop with new evidence this session.

## Desktop / mobile

Both desktop-class (~987px, prior sessions) and the environment's effective mobile-class viewport (~500×667, matching `RESPONSIVE_MOBILE_AUDIT.md`'s own noted resize behavior) were exercised for the same click/expand sequence — see `MOBILE_VERIFICATION.md`.

## OSHA / MSHA

See `OSHA_STANDARDS_VERIFICATION.md` and `MSHA_STANDARDS_VERIFICATION.md`.
