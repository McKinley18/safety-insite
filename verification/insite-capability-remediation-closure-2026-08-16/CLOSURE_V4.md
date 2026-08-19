# CLOSURE — V4 Family Matrix (Full 228-Case Live Re-Run)

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

## Result: **228 / 228 PASS**

```
positive:  76 / 76 PASS
negative:  76 / 76 PASS
ambiguity: 38 / 38 PASS
safe:      38 / 38 PASS
TOTAL PASS: 228 / 228
```

Zero semantic failures, zero transport/rate-limit failures in the counted run.

## Method

Ran the existing authoritative script unmodified:
`verification/insite-capability-remediation-2026-08-16/v4_regression/run_228.mjs`, scored by the
unmodified `verification/hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs`
against `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json`, single-worker, ~2.2s pace (rate-safe).

Against the disposable backend (port 4320, disposable DB `test_hazlenz_closure_20260816`), using
a freshly registered matrix user granted `fullSafeScope` via the disposable-DB-gated
`grant-test-entitlement.ts` script.

## Note on run history this session

The first attempt (task `bvwnyqxqq`) was interrupted at case ~170/228 when the port-4320 backend
was restarted mid-run (to add `STORAGE_LOCAL_ROOT` for an unrelated report-generation check) —
that run's connection was refused and it exited non-zero. This is recorded for transparency; it
was not a scoring failure, just an infrastructure interruption. The matrix was re-run cleanly
from case 1 immediately after (task `bbr8y9121`), completing all 228 cases with zero interruption,
producing the 228/228 result above. Raw log preserved at
`v4_228_closure_rerun.log` in this directory.

## Regression classification

No failures to classify. This independently reproduces the prior remediation phase's 228/228
result on the current HEAD, after this closure phase's own additional negation/multi-hazard
recheck (see `CLOSURE_NEGATION_MULTIHAZARD.md`) and the report-renderer fix — confirming neither
introduced a V4 regression.
