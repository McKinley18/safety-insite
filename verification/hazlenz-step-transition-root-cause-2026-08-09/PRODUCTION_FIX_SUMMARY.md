# Production fix

Changed only `frontend-next/hooks/useNetworkStatus.ts`.

The hook now initializes `isOnline` to a stable SSR/client value and reads `navigator.onLine` in its existing effect. This removes the Wifi/WifiOff hydration mismatch that could prevent reliable client hydration of the inspection shell. No HazLenz inference, standards, finding, review, authorization, report, or persistence code changed.

The browser harness was corrected to use same-origin `localhost` for Next development resources. This is verification configuration, not a production workflow bypass.
