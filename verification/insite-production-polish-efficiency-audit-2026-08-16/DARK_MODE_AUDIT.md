# Dark Mode Visual Audit

Method: toggled `Settings → Appearance → Dark` in the real running app (a persisted user preference, not a system-media-query test), then re-visited the same screens used in the light-mode pass.

## Screens reviewed

| Screen | Classification | Notes |
|---|---|---|
| Dashboard (`/command-center`) | POLISHED | Hero card was already dark-navy in light mode, so it carries over seamlessly. Stat tiles, "Week at a glance" calendar (today highlighted blue, task day highlighted amber with a legible count badge) all read cleanly against the dark background. |
| Inspection capture (`/inspection`, Step 1) | POLISHED | Upload Evidence / Observed Condition / Location cards all correctly repainted to dark surfaces with light text and legible placeholder copy. |
| Settings (`/settings`) — Appearance & Billing cards | **BROKEN** | **Severe, confirmed contrast bug.** The "Appearance" and "Billing & plan" cards keep a **white card background** while their heading/label text switches to a **near-white dark-mode color** — the result is white-on-white text that is genuinely unreadable ("Theme preference" heading and "APPEARANCE" eyebrow label are essentially invisible; zoomed screenshot confirms near-zero contrast). The yellow "Billing is not configured..." warning banner has the same problem: dark text was not repainted for the light-yellow banner background it still sits on, so the two together produce very low effective contrast. |
| Mobile inspection capture (dark mode + narrow viewport) | NEEDS_REFINEMENT | The sticky "Finding Builder" summary card at the bottom of the viewport did **not** repaint to the dark theme — it stayed on a white/light card floating over an otherwise fully dark page, visually inconsistent and covering roughly a third of the visible mobile viewport. |

## Consistency matrix (light vs. dark)

| Surface | Light | Dark | Consistent? |
|---|---|---|---|
| Dashboard hero + stat tiles | Polished | Polished | Yes |
| Calendar strip | Polished | Polished | Yes |
| Inspection capture form | Polished | Polished | Yes |
| Settings → Plan/Storage/Risk tiles | Polished | Not directly re-verified after the Appearance-card bug was found (see below) | Unknown — flagged for follow-up |
| Settings → Appearance card | N/A (only visible once switched) | **Broken (white-on-white)** | **No** |
| Settings → Billing card | Polished | **Broken (illegible warning banner)** | **No** |
| Sticky "Finding Builder" mobile summary | Polished | **Not re-themed (white card on dark page)** | **No** |

## Root-cause hypothesis (not verified by code inspection — flagged for the polish backlog, not fixed in this pass)
The pattern across all three dark-mode defects is the same: a **card container's background color did not participate in the dark-theme token swap**, while the **text color did**. This points to a specific class of card component (or a shared card wrapper used by Settings' Appearance/Billing sections and the inspection workspace's sticky summary) that hardcodes a light background rather than using the app's dark-mode-aware surface token. This is a plausible, testable hypothesis for engineering to confirm — not confirmed against source in this audit pass, since Phase 27/Do-not-fix rules limit this pass to browser-observed behavior.

## Overall dark-mode assessment
Mixed. The primary inspection workflow (the highest-traffic surface) is well dark-themed. Settings and at least one mobile-only sticky component have a severe, easily reproduced contrast defect that would look broken to any user who switches to dark mode and visits Settings.
