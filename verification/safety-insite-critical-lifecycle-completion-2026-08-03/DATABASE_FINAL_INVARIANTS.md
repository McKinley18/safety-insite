# Database verification

Read-only queries against `phase8_critical_20260803` after the browser and focused regression runs:

| Relation | Count |
|---|---:|
| inspection | 4 |
| observations | 3 |
| hazlenz_analyses | 8 |
| inspection_findings | 2 |
| tasks | 1 |
| inspection_reports | 0 |
| inspection_report_versions | 0 |
| audit_logs | 1 |
| security_audit_events | 2 |

Canonical analysis history included one observation with request versions 1, 2, 3 superseded and version 4 current. A second observation had version 1 current. A third had versions 1 and 2 superseded and version 3 current. The partial unique current-analysis index held throughout. The canonical regression independently verified two findings, one task, one current analysis, and finalized inspection state.

The browser-created split-hazard legacy capture observations do not produce persisted `inspection_findings`/report rows through the current canonical path. This prevents claiming the required three completed multi-hazard inspections and is the principal unresolved lifecycle blocker.

Protected hashes remained unchanged:

```text
8918dab4ce7619b36ee458e4f8bd8cbb352876c47802f90a00f6941f8571cb2f  inspection-citation-ranking.service.ts
4b171bf169047b7e3c3b17cce88716b467311166ec82371980f50fc9c17259e1  inspection-citation-recovery.service.ts
f0fc40e16f16fbd8062d28bb7825f5299ad2107880ce5a71d41aafaa49f44da3  inspection-condition-assessment.service.ts
e8624fb2b35dca52e0dae675087f1e60b49f8f3037164fe00f7271a6063bdfdc  standard-applicability.rules.ts
b7a52eb7e665206c95d28d74fa069d12ab5904da3a77b8a8bf89f41233435ad9  safescope-v2.service.ts
```
