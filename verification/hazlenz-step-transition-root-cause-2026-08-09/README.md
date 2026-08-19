# HazLenz canonical Step 1 → Step 2 transition

This verification isolates and repairs the inspection capture transition. The original reproduction loaded the frontend at `127.0.0.1:3007` in Next development mode. Next rejected the cross-origin development resources, leaving the server-rendered inspection page without hydrated React handlers. A native click was observed, but `InspectionWorkflowHeader.handleNext`, `goToInspectionStep`, and page effects never ran.

The diagnostic run then used the supported same-origin `localhost:3007` route and exposed a second genuine hydration defect: `useNetworkStatus` read `navigator.onLine` during the first client render while the server rendered a different value. The deterministic first-render fix is in `frontend-next/hooks/useNetworkStatus.ts`; the browser reads the live value only in `useEffect`.

The repaired authenticated Chromium run reached Step 2 and invoked the real `/safescope-v2/classify` endpoint. The preserved 20-scenario corpus reached Step 2, kept it stable, exposed `Review with HazLenz AI`, and rendered successful analysis in all 20 cases.
