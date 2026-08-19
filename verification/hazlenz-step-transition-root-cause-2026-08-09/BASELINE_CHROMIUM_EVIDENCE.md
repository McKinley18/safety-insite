# Baseline browser evidence

At `127.0.0.1:3007`, the server-rendered Step 1 page displayed a real Next button, but a native click listener fired without any React trace event or state transition. Next development output explicitly reported that cross-origin dev resources from `127.0.0.1` were blocked. This explains the prior 0/20 result. The same page at `localhost:3007` hydrated and the exact same click transitioned to Step 2.

The diagnostic also captured a React hydration mismatch in `AppShell` caused by `useNetworkStatus` reading `navigator.onLine` only on the client. That mismatch is fixed and no hydration errors occurred in the repaired 20-scenario run.
