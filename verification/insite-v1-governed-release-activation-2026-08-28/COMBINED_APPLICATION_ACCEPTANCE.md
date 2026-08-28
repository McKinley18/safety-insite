# Combined backend + frontend acceptance — 2026-08-28

```
COMBINED_BACKEND_FRONTEND_CHECKPOINT_COHERENT       = TRUE
CONTAMINATED_TSCONFIG_REQUIRED_FOR_ACCEPTED_FRONTEND = FALSE
```

The preservation scope was widened by product-owner decision to the coherent accepted application
state. This is the evidence that the exact composition staged is coherent front-to-back.

## Composition

| set | paths |
|---|---|
| backend / docs / governed + HazLenz evidence | 166 |
| inspection-workflow frontend (12 authorized minus `tsconfig.json`) | 11 |
| **total staged** | **177** |

The earlier "167-path" figure counted the tracked eCFR XML deletion, which must not be staged; the
measured backend contribution is therefore 166. One Finder duplicate
(`ecfr-1910-146 4.xml`) also survived the original `" 2."` filter and was removed — the exclusion
pattern is now `" <digit>."` before the extension.

`backend/scripts/verify-canonical-report-frontend-contract.ts` was written during this operation and
added to the set: it is the gate that proves the `+301/-37` report contract front-to-back.

## The 11 frontend paths, individually

| path | class | relationship to the accepted lifecycle |
|---|---|---|
| `app/inspection-complete/page.tsx` | **new** | the completed-inspection screen; consumes `getReportForInspection`, `transitionPersistedInspection`, `inspectionRecordLabel` |
| `app/inspection-workspace/page.tsx` | +2023/-484 | the field loop: user-authored findings, risk bands, routing to the completion screen |
| `app/inspections/page.tsx` | +22/-8 | `displayNumber`; `openInspection` routes completed records to the completion screen |
| `app/reports/page.tsx` | +109/-70 | report library under the one-report-per-inspection contract; `displayNumber` |
| `components/inspection/RiskReviewSection.tsx` | +15/-7 | renders bands from the mirrored risk-band table |
| `components/layout/AppShell.tsx` | +1 | one nav-highlight route entry for `/inspection-complete` |
| `components/ui/AppButton.tsx` | +1/-1 | a comment correction only |
| `lib/canonicalWorkflowApi.ts` | +129/-27 | the client half: `displayNumber`, `getReportForInspection`, `inspectionRecordLabel`, user-authored types |
| `lib/inspection/riskBands.ts` | **new** | frontend mirror of `backend/src/safescope-v2/risk/risk-profiles.ts` |
| `scripts/check-risk-band-parity.mjs` | **new** | enforces that mirror against the backend source |
| `package.json` | +1 | registers `check:risk-band-parity` |

## B1 — backend build

`rootDir: ./src` pinned · clean `tsc` · `dist/main.js` **present** · `dist/src/main.js` **absent** ·
artifact **boots**, `health=200` · no `src/ → scripts/` import remains.

## B2 / C — frontend build and the tsconfig exclusion

Typecheck run against **HEAD's** tsconfig, extracted to a temporary file and deleted afterwards; the
contaminated working copy was never read as config and its sha256 was verified identical before and
after (`73990cd1…`). Result: **clean**.

Production `next build`: **Compiled successfully**, 29 static pages, `/inspection-complete` present
in the route table. Run with the DEFAULT dist dir on purpose — `NEXT_DIST_DIR` is what injected the
`.next-onereport` globs in the first place. tsconfig sha256 unchanged by the build and by
`next start`.

**`CONTAMINATED_TSCONFIG_REQUIRED_FOR_ACCEPTED_FRONTEND = FALSE`**, proven three ways: no source
file references `.next-onereport`; `.next-onereport` is a **gitignored build-output directory**
(`frontend-next/.gitignore:20 → /.next-*/`); and both the typecheck and the production build succeed
without those globs.

## B3 — the real customer journey, in a browser

Driven with Playwright against the combined stack (built frontend on :3100, backend on :4231,
disposable database `test_c_combined` with the reviewed release ACTIVE):

| step | result |
|---|---|
| sign in reaches the command center | PASS |
| `/inspections` creates a site | PASS |
| start a full inspection and land in the workspace | PASS |
| observation field present under its current label | PASS |
| HazLenz analysis runs and the observation persists | PASS |
| findings materialise for that inspection | PASS |

**6 passed, 0 failed, zero page errors.** Resulting row: `displayNumber = 1`,
`knowledgeReleaseId = null`, findings `{n:1, gov:0}`.

Backend HTTP suites on the same stack: `canonical-workflow` PASS · `persisted-decomposition-findings`
PASS · `user-authored-findings` **47/47** · `offline-sync-idempotency` (clientRequestId) **23/23** ·
`finding-scoped-reviews` PASS · `report-replacement-failure-safety` **16/16** ·
`verify:hazlenz-actionable-workflow` **66/66**.

### Default posture stays legacy

Across everything the combined stack produced in the shipped default posture, with the release
**ACTIVE**: **0 of 25 analyses**, **0 of 35 findings** and **0 of 17 inspections** carry a governed
release id. Governed provenance was separately proven reachable only with mode + allowlist both set
(`verify:release-scoped-customer-workflow` 35/35).

## B4 — canonical one-report-per-inspection contract

`npm run verify:canonical-report-frontend-contract` — **15/15**. Drives the exact four endpoints the
frontend client calls.

| assertion | result |
|---|---|
| report generated, associated with the correct inspection | PASS |
| `GET /inspections/:id/report` returns the one current report | PASS |
| summary carries `inspectionNumber` (the identity the UI renders) | PASS |
| artifact downloads at the no-version-segment URL | PASS |
| library lists exactly one report for the inspection | PASS |
| reopen → regenerate **replaces the same report record** | PASS (`2614c462…` → `2614c462…`) |
| the snapshot identity **did** advance — a real replacement | PASS (`2df33645…` → `5a3f1560…`) |
| library **still** lists exactly one — no duplicate canonical report | PASS |
| retrieval returns the replacement, not the superseded artifact | PASS |
| no per-version download surface exists | PASS (404) |

## B5 — governance floor, unchanged

activation **43/43** · binding **25/25** · reachability **514/514** · precedence **42/42** ·
release-scoped workflow **35/35** · authority **17/17** · integration **19/19** · identity **8/8** ·
KG-5B **102/102** · golden **15/15** · core **37/37 suites, 0 failing** · broad workflow **66/66** ·
backend and frontend `tsc` clean. No gate weakened.

## OPEN-4 — stale frontend check instruments `PRE_PRODUCTION_GOVERNANCE_RECONCILIATION_REQUIRED`

Four **tracked, unmodified** frontend check scripts fail against the committed source. None is a
product defect; each pins a pre-redesign literal. They are NOT repaired here — repairing them is new
frontend work, which this operation does not authorize.

| script | why it fails | property verified to still hold |
|---|---|---|
| `check:free-observation-restore` (23 pass / 4 fail) | pins `function resumeInspection(` and a literal `router.push("/inspection-workspace")`; the function is now `openInspection` and routes completed inspections to `/inspection-complete`. Also pins `setStep("review")` inside the analysis-gated block | resume path exists and is wired (line 595); `persistedInspectionId: inspection.id`; `sentinel_selected_inspection_context` written; workspace route retained for non-completed. Restore no longer sets the step at all — the only transition is a user click gated on a selected risk, which is **stronger** than the property pinned. The load-bearing assertions still pass: observation restore decoupled from analysis restore, not repeated inside the analysis block, and the 402 entitlement gate intact |
| `check:closure-workflow` | waits for `getByLabel('What did you observe?')`; the field is now labelled **"What did you see?"** | the field exists and accepts input — exercised directly in the browser journey above |
| `check:canonical-persistence` | fills `getByLabel('New site name')` without first selecting `__new__` in the new "Saved site" selector | site creation works — exercised directly in the browser journey above |
| `check:phase5-report-release` | inserts a retired `'expert'` entitlement tier, rejected by `entitlement_grants_tier_check` (migration `1800000005900-RetireExpertTier`) | **pre-existing at HEAD**, unrelated to this checkpoint. `check:closure-workflow` was repaired to `'pro'` and explicitly asserts Expert stays rejected; this fixture was never updated |

**Honest limit:** for `check:closure-workflow` and `check:canonical-persistence` the underlying
journey was proven directly in the browser; each individual assertion inside those two scripts was
not re-proven one by one. Both also passed their pre-stall assertions (login, session token
persistence, the retired-Expert negative control).

The next phase should update these instruments to the accepted redesign, or retire them.
