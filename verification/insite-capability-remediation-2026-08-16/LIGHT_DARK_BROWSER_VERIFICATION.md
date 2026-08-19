# Light/Dark Theme — Live Browser Verification

Verified against the disposable `next dev -p 3001` server (restarted clean after
applying the fix and the `allowedDevOrigins` dev-config change), using
claude-in-chrome against `http://127.0.0.1:3001`, logged in as
`remediate-pro-20260816@example.com` (account created via the backend's public
`/auth/register` — it did not already exist on the connected backend).

All checks below were re-run **after** restoring `frontend-next/app/layout.tsx` to
the committed fix (see `DARK_MODE_ROOT_CAUSE.md`).

## 1. Toggle: Settings page, Light → Dark

- Navigated to `/settings`, confirmed baseline `documentElement.className === "light"`,
  `localStorage.safety_insite_theme === "light"`.
- Clicked the "Dark" selector card.
- Immediately re-checked via `javascript_tool`:
  `{"htmlClass":"dark","htmlDataTheme":"dark","storedTheme":"dark"}`.
- "Dark" card shows `aria-pressed="true"`/`data-selected="true"`; "Light" shows
  `"false"`/`"false"`.
- Screenshot: Settings page, Appearance panel, dark-styled cards and dark background
  visible immediately after the click (captured, not saved to disk — screenshot ID
  `ss_54565g2so`).

## 2. Toggle: Settings page, Dark → Light

- Clicked the "Light" selector card.
- Re-checked: `{"htmlClass":"light","storedTheme":"light"}`.
- Screenshot confirms light background, white cards, "Light" selected (screenshot ID
  `ss_1392s1nx4`).

## 3. Persistence on refresh (hard navigation)

- With theme set to `dark`, did a fresh `navigate()` (full reload, not client-side
  routing) to `/settings`.
- Checked state immediately after load, before any interaction:
  `{"htmlClass":"dark","htmlDataTheme":"dark"}`.
- No flash/race observed via the `beforeInteractive` inline script — the `dark`
  class is present at the point the page is inspectable, matching the intent of the
  restored fix (theme applied while HTML is still parsing, before hydration).

## 4. Persistence across navigation (Settings → Command Center / Home)

- From `/settings` with theme `dark`, navigated to `/command-center`.
- Checked immediately: `{"htmlClass":"dark","htmlDataTheme":"dark"}`.
- Screenshots (dark): hero/header area and stat tiles rendering with dark navy
  background (`#07111F`)-family colors, "1 Issue" Next dev overlay badge visible but
  unrelated (screenshot IDs `ss_684564xc9`, `ss_3858ijr9d`).
- Screenshots (light, same page, after switching back): light slate background
  (screenshot ID `ss_6082ly4kj`).
- Confirmed via `getComputedStyle`:
  - Light: `body` background `rgb(241, 245, 249)`.
  - Dark: `body` background `rgb(7, 17, 31)` (i.e. `#07111F`, the dark theme token).
  This confirms the class change drives a real, visible style difference, not just
  an attribute flip.

## 5. Regression check: click-time behavior independent of the layout.tsx fix

Before restoring `app/layout.tsx`, once the unrelated `allowedDevOrigins`
hydration-blocking issue (see root-cause doc) was fixed, clicking Dark on the
*unpatched* layout already correctly set `documentElement.className` to `"dark"`
synchronously (`setThemePreference` → `applyThemeToDocument` runs directly in the
click handler). This isolates the regression to the pre-hydration/fresh-load path,
consistent with the restored fix being exactly what was needed (and nothing broader).

## Result

- Light → visibly light: confirmed (screenshots + computed background color).
- Dark → visibly dark: confirmed (screenshots + computed background color).
- Refresh persistence: confirmed, no reversion to light on fresh load.
- Cross-page navigation persistence (Settings ↔ Command Center): confirmed.
- `documentElement.className` / `dataset.theme` update correctly and stay correct
  through toggle, refresh, and navigation.

Browser tab used for verification was closed at the end of the session
(`tabs_close_mcp`).
