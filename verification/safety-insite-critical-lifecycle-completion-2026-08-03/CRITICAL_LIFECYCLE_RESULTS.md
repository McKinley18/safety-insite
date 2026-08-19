# Critical lifecycle execution

## Environment

- Database: `phase8_critical_20260803` (fresh disposable PostgreSQL; 30 migrations applied).
- Backend: NestJS `127.0.0.1:4230`, `DEV_AUTH_BYPASS=false`.
- Frontend: production Next.js build at `127.0.0.1:3001`.
- Browser: real Chromium via Playwright, normal login and entitlement.
- Evidence: supported PNG upload (`inspection-capture.png`).

## Browser results

The real browser completed capture, upload, analysis, clarification selection, reanalysis, and separate hazard-card rendering for all three scenarios:

| Scenario | Separate cards | Clarification/reanalysis | Persisted full lifecycle |
|---|---:|---:|---:|
| Electrical + fall | PASS (prior valid evidence) | PASS (prior valid evidence) | NOT PROVEN in this phase |
| Machine guarding + hazardous energy | PASS | PASS; energy-state source became user confirmation | NOT PROVEN in this phase |
| Hot work + compressed gas | PASS | PASS; no invented leak/damage/condition | NOT PROVEN in this phase |

The canonical workspace was also exercised with normal login, site selection, Full Inspection creation, PNG upload, realistic observation text, analysis, and a machine-energy clarification. It produced a server-saved advisory snapshot and persisted a canonical draft inspection/observation/analysis. The canonical UI currently represents a single persisted finding in the review/finalization path; it does not expose a complete persisted split-finding workflow for the three two-hazard scenarios. Therefore risk/action/task/finalization/report completion for the split hazards is not claimed.

## Exit result

The phase exit criteria fail because the application does not yet provide an authentic, end-to-end persisted split-hazard browser lifecycle with per-hazard finalization and PDF grouping. This is a product-scope/UI persistence gap, not a failure of the decomposition engine.
