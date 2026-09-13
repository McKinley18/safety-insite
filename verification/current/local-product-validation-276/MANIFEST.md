# §276 evidence package — whole-product local acceptance remediation

Produced 2026-09-13 on `beta/expert-hazlenz-validated-candidate-2026-09-12`, by driving the
running product on localhost with the development bypasses off.

No customer data. No secrets. All test data carries a `VALIDATION-276` prefix and lives in
the disposable `test_insite_validation_275` database, which is not the development database.
`safescope` was never written to.

Supersedes nothing: `local-product-validation-275/` is retained unchanged, and every §275
status is preserved inside `project-docs/current/WHOLE-PRODUCT-VALIDATION.json`.

## Contents

| Path | What it is |
|---|---|
| `results/walkthrough.json` | The final clean uninterrupted walkthrough — 25 steps, timings, console errors, failed requests |
| `results/walkthrough-observed-text.txt` | The rendered text of every stage of that walkthrough, as the reviewer saw it |
| `results/gap-closure-api.json` | Areas A (workspace isolation), B (storage and images) and C (idempotency) — 34 checks |
| `results/gap-closure-ui.json` | Areas D (settings), E (clarification) and F (performance sanity) — 29 checks, timings, per-visit request counts |
| `results/clarification-before-answer.txt` / `-after-answer.txt` | The in-product clarification screen either side of the answer |
| `results/clarification-jurisdiction.json` | The decision-critical jurisdiction clarification, before and after, over the classify contract the workflow posts to |
| `results/hazlenz-product-paths.json` | The five new product paths with their per-path concision scorecard |
| `results/expert-before-settlement.json` / `-after-settlement.json` | The Expert read payload either side of the human settlement |
| `results/expert-confirmation-subject.json` | The two classification entries the SERVER named for the reviewer to settle |
| `results/expert-settlement.json` | The settlement run — 11 checks, zero provider calls |
| `results/report-acceptance.json` | Four report shapes, 92 checks, per-artifact hashes and page counts |
| `results/provider-accounting.json` | Every Expert execution across §§275–276, each refusal classified by its own cause |
| `results/db-reconciliation.json` | Row counts for every populated table at the end of the run |
| `results/calendar-before-restart.txt` / `-after-restart.txt` | The calendar digest either side of a full stack restart |
| `six-gap-completion-matrix.json` | The six §275 NOT_EXECUTED areas, what was driven, and what it found |
| `concision-evaluation.json` | The concision scorecard per path, the presentation changes made, and the content-design limitations recorded |
| `defect-register.json` | Every §275 defect retested, and the nine §276 defects with their severity reasoning |
| `reports/` | Two report artifacts and their extracted text: a multiple-findings report, and a post-repair report carrying reviewer-confirmed severity diverging from HazLenz |
| `screenshots/` | A deliberate subset: the walkthrough stages, settings and profile, the clarification panel, and each product path |
| `DIGEST.txt` | sha256 of every file in this package |

## Reading the results

`PASS`, `NOTE`, `FAIL` and `NOT_EXERCISED` are four different outcomes and none is a synonym
for another. `NOT_EXERCISED` in particular means the transition could not be driven — Expert
settlement is one-way, so a second run against a settled analysis records it rather than
scoring a pass or a failure.

## Reading the report artifacts

`inspection-32-reviewer-confirmed-severity.txt` is the D-008 proof. Its finding reads

```
Risk:              Moderate
                   Severity Serious · Likelihood Possible · Reviewer-confirmed · HazLenz analysis: Critical
```

The band is the reviewer's. HazLenz's escalation is retained and named as HazLenz's. No
number on that line is the system matrix's — that is the second false attribution §276
found, and `inspection-6-multiple-findings.txt` still shows the earlier form because a
renderer correction does not re-issue an already-issued report (D-028).

## Commands

```
# the disposable database and the guarded entitlement grant
NODE_ENV=test DATABASE_URL=postgresql://…/test_insite_validation_275 \
  npx ts-node scripts/grant-test-entitlement.ts <user-uuid> 8

# the browser passes, from frontend-next/
node scripts/validate-276-product-walkthrough.mjs
node scripts/validate-276-gaps-api.mjs
node scripts/validate-276-gaps-ui.mjs
node scripts/validate-276-hazlenz-product-paths.mjs      # EXPERT=1 spends provider legs
node scripts/validate-276-expert-settlement.mjs
node scripts/validate-276-report-acceptance.mjs

# the release gates added by §276
npm run test:effective-severity                 # backend, D-008, 48 checks
npm run test:276-calendar-reconciliation:db     # backend, D-007, 39 checks
npm run test:hazlenz-scoped-evidence            # backend, D-009, 22 checks
npm run test:calendar-reconciliation            # frontend, D-007 browser half, 34 checks
npm run check:effective-severity-parity         # frontend, holds the two copies of the rule together
```

## Provider accounting

Three Expert executions across §§275–276, **$0.375220** of the $1.50 cumulative ceiling, of
six allowed analyses. Two refused by deterministic structural admission — with different
cause lists, recorded separately — and one admitted, which is what made the human
confirmation path drivable. No call was spent to replace an unfavourable answer, and no
Expert prompt, schema, admission rule or verifier was changed.
