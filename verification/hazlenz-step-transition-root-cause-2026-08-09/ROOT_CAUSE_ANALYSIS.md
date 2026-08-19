# Root-cause analysis

## Baseline state timeline

1. Chromium navigated to `http://127.0.0.1:3007/inspection`.
2. The server HTML displayed Step 1 and a real `Next` button.
3. Next development resources were blocked as cross-origin (`Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr`).
4. No React handler was attached to the button. A native click listener fired, while the diagnostic buffer remained empty; no `handleNext`, setter, or reset event occurred.
5. The page therefore remained server-rendered Step 1 and no analysis request was possible.

The same-origin reproduction at `http://localhost:3007` attached handlers and advanced to Step 2, proving the original 0/20 result was primarily a browser-origin/hydration setup defect rather than a competing `currentStep` reset.

The full React diagnostic also reproduced a hydration mismatch in `AppShell`: `useNetworkStatus` initialized from `navigator.onLine` on the client but from `true` during SSR. The mismatch changed the Wifi/WifiOff subtree. This was corrected by making the initial state deterministic (`true`) and synchronizing `navigator.onLine` after hydration.

## Post-fix timeline

`render Step 1 → header.handleNext(currentStep=1,target=2) → goToInspectionStep(2) → setCurrentStep(2) → render Step 2`, with no hydration errors and no subsequent reset. The review control then issued POST `/safescope-v2/classify` and rendered the persisted response.
