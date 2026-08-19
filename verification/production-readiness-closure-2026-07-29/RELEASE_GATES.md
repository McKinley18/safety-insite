# Release Gates

| Gate | Result |
|---|---|
| Backend build/typecheck | PASS |
| Frontend production build/typecheck | PASS |
| Modified frontend lint | PASS |
| `git diff --check` | PASS |
| Fresh migrations | PASS, 26/26 |
| Two-clone legacy adoption | PASS on fresh clones |
| Core authenticated inspection workflow | PASS |
| Tenant isolation/private files | PASS for canonical workflow; historical matrix incomplete |
| Private S3 protocol | PASS against TLS MinIO |
| Immutable reports | PASS |
| Billing/entitlements | PASS |
| HazLenz authentic safety threshold | FAIL |
| Production external email/hosted storage | NOT VERIFIED |
| Critical/high exploitable dependencies | No high/critical in current production audits; four moderate backend |

Verdict: **NOT READY** for a general release candidate.
