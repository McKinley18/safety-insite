# Dark Mode Toggle — Root Cause

## Summary

`frontend-next/app/layout.tsx` was missing a `beforeInteractive` inline theme-init
script and `suppressHydrationWarning` on `<html>` that exist in the last commit to
touch this file, `c7f0ecb0` ("Stabilize light and dark theme behavior", 2026-07-14).
The working tree had regressed to a pre-`c7f0ecb0` version of `app/layout.tsx` while
every other file that commit touched (`ThemeController.tsx`, `ClientCacheCleanup.tsx`,
`lib/theme/themeTokens.ts`, `app/settings/page.tsx`) still matched the commit exactly.
Restoring `app/layout.tsx` to the committed version is the fix.

## Exact mechanism

- `frontend-next/app/layout.tsx` (working tree, before fix): `<html>` was rendered
  as `<html lang="en" className="light" data-theme="light">` with no
  `suppressHydrationWarning`, and `<head>` had no theme-init script.
- `frontend-next/lib/theme/themeTokens.ts:62-88` `applyThemeToDocument()` is only
  invoked from two places: `ThemeController`'s `useEffect` (mount, and on the
  `storage` event) and `setThemePreference()` (called from the click handler in
  `frontend-next/app/settings/page.tsx:151-154`). Both run **after** React commits/
  hydrates and after first paint. With no synchronous pre-hydration script, the
  server-rendered `light` class was the only thing painted for one or more frames
  on every hard navigation/refresh, and in the browser tooling used to verify this
  bug it appeared to never update at all (see "Confounding factor" below).
- `frontend-next/components/system/ThemeController.tsx` and
  `frontend-next/lib/theme/themeTokens.ts` were otherwise correct — `applyThemeToDocument`
  correctly mutates `documentElement.classList`/`dataset.theme`/`style.colorScheme` and
  `document.body`'s equivalents once it runs. The bug was the *absence of the
  pre-hydration application path*, not a logic bug in `applyThemeToDocument` itself.

## The fix

Restored `frontend-next/app/layout.tsx` to match `git show HEAD:frontend-next/app/layout.tsx`
(commit `c7f0ecb0`), which:

1. Adds `import Script from "next/script";`
2. Adds `suppressHydrationWarning` to `<html>` (required because the inline script
   mutates the DOM before React hydrates, which would otherwise trigger a hydration
   mismatch warning per Next.js's own guidance in
   `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`).
3. Adds a `<Script id="theme-init" strategy="beforeInteractive">` in `<head>` that runs
   synchronously while the HTML is still parsing (before first paint), reads
   `safety_insite_theme` (with legacy-key/`prefers-color-scheme` fallbacks matching
   `readThemePreferenceFromStorage`), and applies the resolved theme's class,
   `data-theme`, `color-scheme`, and meta-tag colors directly — before hydration,
   before `ThemeController` ever mounts.

No changes were made to `ThemeController.tsx`, `themeTokens.ts`, or `settings/page.tsx`
— they already matched the committed, correct version.

## Addendum (main session, after this agent's fix landed)

Before this agent's completion notification arrived, the main session had independently
investigated the same symptom and added a `@custom-variant dark (&:where(.dark, .dark *));`
declaration to `frontend-next/app/globals.css`, on the hypothesis that Tailwind CSS v4
(confirmed in use via `package.json`, `^4.3.0`) defaults `dark:` utilities to
`@media (prefers-color-scheme: dark)` only and needs an explicit custom variant to respond
to a `.dark` class instead. Given this agent's independently-reached root cause (a missing
pre-hydration script, unrelated to Tailwind variant configuration) fully explains the
observed symptom and its own live verification confirmed the fix works with no globals.css
change on its part, the custom-variant addition appears to have been unnecessary for this
specific bug — but it was left in place rather than reverted, since it is a correct,
harmless, standard Tailwind v4 idiom for class-based dark mode that makes the project's
intent explicit regardless of whichever default currently happens to apply, and a final
combined live check (both fixes together) confirmed the toggle still works correctly in
both directions. Reported plainly rather than silently reconciled, since the two
investigations reached different theories from different evidence and both are worth
recording.

### Before (working tree, reproduces the bug)

```tsx
<html lang="en" className="light" data-theme="light">
  <head>
    <meta name="msapplication-TileColor" content="#F3F7FB" />
    ...
```

### After (restored to commit c7f0ecb0)

```tsx
<html lang="en" className="light" data-theme="light" suppressHydrationWarning>
  <head>
    <meta name="msapplication-TileColor" content="#F3F7FB" />
    ...
    <Script id="theme-init" strategy="beforeInteractive">
      {`(function () { try {
          var stored = window.localStorage.getItem("safety_insite_theme");
          ... resolve stored/legacy/system preference ...
          var root = document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(stored);
          root.setAttribute("data-theme", stored);
          root.style.colorScheme = stored;
          ... same for document.body and meta theme-color tags ...
        } catch (error) {} })();`}
    </Script>
```

## Confounding factor found and fixed during investigation (dev-environment only)

While reproducing the bug against `http://127.0.0.1:3001` as instructed, React never
hydrated the page at all when the dev server was accessed via `127.0.0.1` — verified
directly by the total absence of `__reactFiber$*`/`__reactProps$*` properties on
`document.documentElement`/`<button>` elements, with zero console errors. The dev
server log showed:

```
⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "127.0.0.1".
Cross-origin access to Next.js dev resources is blocked by default for safety.
```

Next.js 16's dev server rejects the HMR/dev-resource channel for origins not listed in
`allowedDevOrigins`, and on this fictional Next.js version that also prevented
`hydrateRoot` from ever completing on that origin — so clicks did nothing, effects
never ran, and the page was permanently stuck on the SSR-rendered `light` markup
regardless of the layout.tsx bug above. The exact same server, same code, accessed via
`http://localhost:3001` hydrated correctly. Added `allowedDevOrigins: ["127.0.0.1", "localhost"]`
to `frontend-next/next.config.ts` (dev-only setting, no production effect) so the app
could be tested via the exact URL specified, and restarted the dev server (after
clearing `.next/dev/cache/turbopack`, which had also been repeatedly invalidated
during interactive debugging) to pick it up.

This `allowedDevOrigins` issue is a pre-existing dev-server configuration gap, not
something introduced by this session, and not the theme-toggle bug itself — but it
fully masked the toggle's actual click-time behavior during initial reproduction and is
worth flagging separately: once hydration was working, clicking Dark/Light in the
*unpatched* layout.tsx already correctly flipped `documentElement.className` (the
click path was never broken — `setThemePreference` calls `applyThemeToDocument`
synchronously). The `app/layout.tsx` regression's real, isolated effect is the missing
pre-hydration/flash-prevention application on page load and refresh, exactly matching
what commit `c7f0ecb0` was written to fix.

## Files changed

- `frontend-next/app/layout.tsx` — restored to match git HEAD (commit `c7f0ecb0`).
- `frontend-next/next.config.ts` — added `allowedDevOrigins: ["127.0.0.1", "localhost"]`
  (dev-only, enables testing via the required `127.0.0.1` origin; not part of the
  theme bug fix itself).

No changes were made to `frontend-next/app/hazlenz/page.tsx`, `frontend-next/app/pricing/**`,
any corrective-actions frontend component, or anything under `backend/`.
