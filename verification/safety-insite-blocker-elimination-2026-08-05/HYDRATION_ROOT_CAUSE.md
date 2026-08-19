# Hydration root cause and fix

## Reproduction

The prior production browser run reported minified React error #418 while navigating the authenticated inspection workflow. The root route was rendered with a server `<html class="light" data-theme="light">`, while a `beforeInteractive` script synchronously read `localStorage`/`prefers-color-scheme` and changed those attributes before React hydrated. A dark stored preference therefore made the server DOM and the client’s expected root DOM differ.

## Fix

`frontend-next/app/layout.tsx` now leaves the root element deterministic (`class="light" data-theme="light"`) and removes the pre-hydration DOM mutation and `suppressHydrationWarning`. `ThemeController` applies the persisted preference in a post-hydration `useEffect`, preserving theme behavior without hiding a mismatch.

## Evidence

- Development Chromium at `/login`, fresh dark-preference context, produced no hydration warning or page exception. The only console error was the development HMR WebSocket handshake caused by the headless execution environment.
- Production Chromium at `/login`, fresh and reloaded mobile contexts, produced no console messages, no page exceptions, and no React hydration error in both light and dark browser settings.
- Production build and TypeScript compilation pass after the change.
