# Database and invariant results

Disposable database: `phase9_persisted_multihazard`; 32 migrations applied successfully, including `1800000005300-DurableDecompositionFindingIdentity` and `1800000005400-LinkTasksToCorrectiveActions`.

New finding columns: `hazardKey`, `originatingAnalysisId`; nullable final-review/finalizer fields; status supports `superseded`; index `(observationId, hazardKey, status)`. Tasks have nullable `correctiveActionId` with an FK/index.

Focused regression output: initial keys `machine-guarding,hazardous-energy`; active keys after reanalysis `machine-guarding,electrical`; historical key `hazardous-energy`; stale status `409`; passed=true.

Read-only completed-inspection query showed completed disposable scenarios with 2–4 active findings, matching action/task counts for the exercised runs; latest fresh guarding run had two active findings, two actions, two tasks, and one report. No duplicate logical finding was created by replay.
