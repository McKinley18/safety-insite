# SafeScope Generated Files Policy v1

This document defines which files are source-of-truth and should be committed, and which are generated/local-only and should be restored or ignored.

## Classification Table

| Path Pattern | Type | Policy |
| :--- | :--- | :--- |
| `backend/src/safescope-v2/` | Source | **Source of Truth.** Always commit logic changes. |
| `safescope-data/approved-knowledge/registry/` | Source | **Source of Truth.** Regulatory data. |
| `safescope-data/field-test-scenarios/` | Source | **Source of Truth.** Regression test scenario packs. |
| `safescope-data/benchmarks/*results*.json` | Generated | **Local Churn.** Discard before commit unless updating baseline. |
| `safescope-data/reviewer-candidates/candidates.json` | Generated | **Local Churn.** Discard before commit. |
| `safescope-data/persistence/audit_records.json` | Generated | **Local Churn.** Discard before commit. |
| `project-docs/09-archive-reference/prompts/` | Source | **Source of Truth.** Historical context for AI rebuilds. |

## Why Discard Benchmark Churn?
Validation runs generate performance snapshots that reflect the current local environment and minor logic tweaks. Committing these files for every change creates noise in the git history and can mask real data regressions.

## Safe Cleanup Commands

To reset generated validation data to the known-good baseline before committing:

```bash
git restore \
  safescope-data/benchmarks/safescope-precision-batch-001-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-003-results.v1.json \
  safescope-data/reviewer-candidates/candidates.json \
  safescope-data/persistence/audit_records.json 2>/dev/null || true
```

## Recommended .gitignore Additions
(Future)
- `safescope-data/persistence/audit_records.json` (if moving to mandatory DB)
- `safescope-data/local-reviewer-cache/`
