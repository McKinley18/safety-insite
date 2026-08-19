# P0-01 — Export Contract

## Contract

| State | Behavior |
|---|---|
| Qualified-person-review checkbox unchecked | Export button `disabled`; clicking (impossible via UI, but the underlying function also guards this) shows "Confirm qualified-person review before exporting this report." and does not export. **DISABLED_WITH_ACTIONABLE_REASON.** |
| Checkbox checked | Export proceeds via the existing client-side `jsPDF` generator; a real PDF downloads. **AVAILABLE.** |
| (Removed) "N HazLenz AI finding(s) still need snapshot validation" | No longer shown. This state was never satisfiable and never actually blocked export — it only produced a false "export is being held" impression after export had already silently succeeded. |

No `BLOCKED_SERVER_SIDE` state applies to this path — it has no server component by design (the one server-side legacy PDF route is intentionally retired and returns `410 Gone`).

## Implementation

`frontend-next/lib/inspection/reportExportService.ts`: removed the `unvalidated`-driven warning branch and its now-unused `getSafeScopeReviewSummary` import/call. `humanReviewConfirmed` remains the single, correctly-wired gate. On success, `setExportWarning("")` unconditionally clears any prior warning before building the PDF.

No backend change was made or needed — the legitimate gate (`humanReviewConfirmed`) already existed and worked correctly; only the misleading, non-functional second check was removed. The retired `/legacy/pdf/:id` backend route was left untouched (out of scope — it is correctly retired, not a P0).
