# Root-cause analysis

The original 0/20 result had two harness defects: it navigated to `/inspection-workspace` without a selected persisted inspection, and the UI login session was not retained by the stale frontend process. Those defects were corrected in the audit harness by authenticating against the disposable backend, creating a persisted inspection/site, setting the canonical inspection context, and navigating to `/inspection`.

The corrected run reached the real capture page for 20 scenarios. However, the tested Next transition still did not reach Step 2 / HazLenz review. The browser rendered `Step 1: Hazard Details`, capture fields, and `Next →`, but no HazLenz review control became available. The first proven failure is therefore frontend lifecycle transition/state behavior, before analysis invocation; there is no evidence that backend HazLenz reasoning caused the block.

No production fix was applied because the disposable frontend process ended before a clean instrumented trace of the click handler could be captured. The next implementation must add a focused browser regression around `InspectionWorkflowHeader.handleNext`, `goToInspectionStep`, and the Step 1-to-Step 2 state transition, then fix only the confirmed state/reset or event issue.
