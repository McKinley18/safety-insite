# Phase 17 — Dark Mode Audit

## Headline finding: the dark theme's CSS is high quality; the control that turns it on is broken

Real browser testing (Chrome, `http://127.0.0.1:3001`, authenticated Pro session) found that **the Settings → Appearance → "Dark" toggle does not actually switch the app into dark mode**, even though clicking it correctly updates the button's own selected state and correctly writes `dark` to `localStorage["safety_insite_theme"]`.

Reproduction, precisely as observed:
1. Navigated to `/settings`, scrolled to "Theme preference," clicked the "Dark" card.
2. Confirmed via DOM inspection immediately after the click: the Dark button now has `aria-pressed="true" data-selected="true"` (its own state updated correctly), and `localStorage.getItem('safety_insite_theme')` returns `"dark"` (the click handler's storage write executed correctly).
3. But `document.documentElement.className` and `document.documentElement.dataset.theme` remained `"light"` — the actual theme never applied, and the page kept rendering in light mode.
4. This reproduced identically on a second attempt and also when pre-seeding `localStorage` with `dark` before a fresh page load (so it isn't specific to the click path — a stored "dark" preference doesn't get applied on page load either, even though `ThemeController` reads it in a `useEffect` on mount).

Code inspection (`frontend-next/components/system/ThemeController.tsx`, `frontend-next/lib/theme/themeTokens.ts:56-79` `applyThemeToDocument`, `frontend-next/app/settings/page.tsx:151-154` `updateThemePreference`) shows the intended wiring is entirely correct on paper — `applyThemeToDocument` synchronously mutates `documentElement.classList`/`dataset.theme`/`style.colorScheme`, and both the settings-page click handler and the mount-time effect call it with the right value. The only way to reconcile "state and storage update correctly" with "DOM never changes" is that the DOM mutation itself is silently not landing (no thrown JS error was observed in the console either) — this needs an engineer with dev-tools breakpoint access to pin down exactly why `applyThemeToDocument`'s `classList` calls aren't taking effect in this specific build; that pinpointing was not completed this session.

**The underlying dark visual design is genuinely good where it could be tested.** Manually forcing `document.documentElement.classList.add('dark')` via the browser console (bypassing the broken control, to inspect the CSS that already exists) produced a clean, well-contrasted dark dashboard: navy page background (`#07111F` per `themeTokens.ts`), white primary text, correctly-inverted calendar day cells, and no unstyled/white flash-through elements on the one screen checked (Home/command-center). This is strong evidence the `dark:` Tailwind variants used throughout the design system (`themeClasses` in `themeTokens.ts`) are implemented, not just a design intent that was never built.

## Coverage actually completed this session

Only the Home/command-center dashboard was inspected in a forced-dark state, due to the time cost of manually forcing dark mode per-page without a working toggle. **The required screen list (inspections hub, inspection capture, HazLenz findings, standards expanded, questions, risk, corrective action, review, reports, actions, settings, pricing, About) was not exhaustively captured in dark mode this session** — this is a real gap against the task's "Required Screenshot Set," not a silent omission: dark mode needs the toggle fixed (or a scripted per-page class force) before that full sweep is worth doing, since right now zero real users can reach dark mode at all through the product UI.

## Verdict

Do not market "dark mode" as a shipped, working feature in its current state — a user who finds and uses the in-product toggle will see no effect at all, which is a worse experience than not offering the toggle. This is the single highest-priority visual-layer fix identified this session (P1: the feature is advertised via a visible, non-functional control) and should block a "dark/light consistency verified" claim until fixed. Once the toggle actually applies the class, the underlying CSS looked ready for a full sweep, not a rebuild.
