# Production Polish P2 — Regression

## Scope-of-change argument

This phase's production edits are confined to five files (see `REPORT_P2_IMPLEMENTATION_REPORT.md`), all within `backend/src/reports/` and two narrow frontend files (`localExporter.ts`, `inspection-workspace/page.tsx`). None belong to any protected surface, confirmed via `git status`/`git diff --stat` immediately before closing this phase.

| Protected surface | Status | Evidence |
|---|---|---|
| HazLenz V4 authoritative matrix (228 cases) | **228/228** (76/76 positive, 76/76 negative, 38/38 ambiguity, 38/38 safe) | Re-run live against the disposable DB with the phase's own report-redesign changes present. `run_228_paced.log`, `P1_228_PACED_RESULT.json`. |
| V5-C01 (finding-scoped risk) / C02 (shared evidence facts) / C03 (evidence finalization) | Untouched | Not in this session's diff; additionally, the renderer only *reads* `riskSnapshot`, never recomputes it (`REPORT_DATA_INTEGRITY.md`). |
| V5-C04 (dead/placeholder cleanup) | Untouched | No files re-added/removed. |
| V5-C05 (primary inspection flow) | Untouched | Not in this session's diff; the full inspection lifecycle (create → observe → classify → review → finalize → transition → complete) was exercised live, repeatedly, and successfully while generating Reports A/B/C — a stronger check than a hash comparison alone. |
| P1-02 (corrective-action benchmark) | Untouched | `corrective-actions.*` files not in this session's diff. |
| P0 remediation (P0-01/02/03) | Preserved | `frontend-next/lib/inspection/reportExportService.ts` (P0-01 fix location) and `frontend-next/app/inspection-workspace/page.tsx`'s finding-selection logic (P0-02 fix location) not touched by this phase's edits (the one edit to that file was a UX copy string in the *completion* panel, unrelated to the finding-selection code); `backend/src/safescope-v2/safescope-v2.service.ts` (P0-03 fix location) not touched. |
| Prior P1 remediation | Preserved | Not in this session's diff. |
| Production Polish P1 (inspection/standards) | Preserved | Not in this session's diff. |
| AUTH-P1 (auth guard fix) | Preserved | `backend/src/auth/guards/jwt.guard.ts` not touched this phase (confirmed via source read: token-precedence logic and structurally-valid synthetic UUID both intact). Live evidence: every one of the hundreds of authenticated API calls made while generating Reports A/B/C and running the 228 matrix succeeded with real, valid JWTs — the exact code path AUTH-P1 fixed. |
| PRA-002 (finding review/completion) | Preserved | `inspection.service.ts` not touched; live-exercised repeatedly and successfully this phase (every finding finalize call in Reports A/B/C). |

## Additional regression checks run this phase

- `npx ts-node src/billing/billing-regression.ts` (disposable DB): **24/24 passed**.
- Backend `npm run build`: PASS.
- Frontend `npm run build`: PASS.
- `git diff --check`: PASS.

## Authorization

No guard/auth/ownership code touched this phase. Two-user cross-authorization was not re-exercised in this phase (already closed and verified in AUTH-P1, same session) — not re-run here since nothing in this phase's change set could plausibly affect it (report generation reads `req.user` only to resolve `inspectionId` ownership via the existing, untouched `InspectionService.findAccessible`/`accessibleReport` checks).

## PDF export (P0-01)

Confirmed closed and unaffected: `reportExportService.ts` untouched; the *canonical* path's export (this phase's primary subject) was exercised successfully dozens of times generating Reports A/B/C and their regenerated versions.
