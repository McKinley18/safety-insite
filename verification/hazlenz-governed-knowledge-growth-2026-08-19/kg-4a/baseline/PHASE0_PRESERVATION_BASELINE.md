# KG-4A — Phase 0 preservation baseline

Captured: 2026-08-21T01:08:59Z

## Git
```
branch:  release/insite-rc-2026-08-18
HEAD:    5f050858227ca11cf90d2f6bf64148e70a018b64
expected: 5f050858227ca11cf90d2f6bf64148e70a018b64
match:   YES
stashes: 4
tags:    23
status entries: 78
```

## Stash list (must remain identical)
```
stash@{0}: On main: hold corrective action routing patch
stash@{1}: On main: leftover hazlenz mechanism-confidence-corrective-action work after companion patch
stash@{2}: On antigravity/render-memory-standards-compression: scratch files before memory merge
stash@{3}: On antigravity/hazlenz-candidate-qa-promotion-plan: antigravity candidate QA WIP
```

## Tags (must remain identical)
```
checkpoint-pre-ui-consolidation-20260528-172809
checkpoint-pre-ui-consolidation-f699d98
checkpoint/pre-modularization-theme-consolidation-20260528-195809
checkpoint/shared-ui-primitives-auth-settings-complete-20260528
checkpoint/shared-ui-primitives-low-risk-pages-20260528
insite-hazlenz-verified-baseline-2026-08-19
insite-inspection-ui-verified-2026-08-19
insite-visual-acceptance-verified-2026-08-19
local-expanded-scoped-knowledge-regressions-20260527
local-msha-scoped-knowledge-retrieval-20260527
local-safescope-knowledge-scoring-checkpoint-20260527
production-standards-engine-live
release-critical-standards-coverage-local
safescope-ai-upgrade-prework-20260528-173000
safescope-brain-green-2026-06-01
safescope-production-classify-working-20260524
safescope-report-workflow-live
safescope-understanding-precision-green-001
safescope-v2-standards-ui-live
safety-insite-cleanup-2026-06-17
theme-overhaul-before-reset-verified
v1-backend-stable
v1.0-condition-engine-verified
```

## git status --short
```
 M backend/package.json
 M backend/scripts/grant-test-entitlement.ts
 M backend/scripts/test-canonical-workflow.ts
 M backend/scripts/test-evidence-foundation.ts
 M backend/scripts/test-guided-finding-response.ts
 M backend/scripts/test-private-storage-reports.ts
 M backend/src/applicable-standards/applicable-standards.service.ts
 M backend/src/database/data-source.ts
 M backend/src/inspection/entities/hazlenz-analysis.entity.ts
 M backend/src/inspection/entities/inspection-finding.entity.ts
 M backend/src/inspection/inspection.service.ts
 M backend/src/reports/canonical-reports.service.ts
 M backend/src/safescope-v2/display/guided-finding-response.ts
 M backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts
 M backend/src/safescope-v2/evidence/evidence-foundation.ts
 M backend/src/safescope-v2/evidence/shared-evidence-facts.ts
 M backend/src/safescope-v2/safescope-v2.service.ts
 M backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts
 M backend/src/standards/seed/finalize-regulatory-release.ts
 M frontend-next/app/about/page.tsx
 M frontend-next/app/command-center/page.tsx
 M frontend-next/app/globals.css
 M frontend-next/app/inspection-workspace/page.tsx
 M frontend-next/app/inspections/page.tsx
 M frontend-next/app/layout.tsx
 M frontend-next/app/page.tsx
 M frontend-next/app/safety-calendar/page.tsx
 M frontend-next/app/settings/page.tsx
 M frontend-next/components/calendar/CalendarViewRenderer.tsx
 M frontend-next/components/calendar/PriorityTodoPanel.tsx
 M frontend-next/components/command-center/WeekAtAGlancePanel.tsx
 M frontend-next/components/inspection/SafeScopeStandardsSection.tsx
 M frontend-next/components/layout/AppShell.tsx
 M frontend-next/components/layout/MobileTabBar.tsx
 M frontend-next/components/system/ThemeController.tsx
 M frontend-next/lib/auth.ts
 M frontend-next/lib/calendar/helpers.ts
 M frontend-next/lib/canonicalWorkflowApi.ts
 M frontend-next/lib/inspection/standardDisplay.ts
 M frontend-next/lib/planEntitlements.ts
?? "Safety InSite Logos/"
?? backend/scripts/measure-suggest-backing-impact.ts
?? backend/scripts/probe-kg3f-retrieval.ts
?? backend/scripts/report-corpus-migration-inventory.ts
?? backend/scripts/report-cutover-coverage-matrix.ts
?? backend/scripts/report-kg3e-work-queue.ts
?? backend/scripts/report-kg3f-family-readiness.ts
?? backend/scripts/report-kg3f-rule-to-corpus.ts
?? backend/scripts/review-regulatory-release-record.ts
?? backend/scripts/shadow-governed-standards.ts
?? backend/scripts/test-approval-contract.ts
?? backend/scripts/test-entitlement-grant-helper.ts
?? backend/scripts/test-governed-corpus-matrix.ts
?? backend/scripts/test-kg3d-corpus-remediation.ts
?? backend/scripts/test-kg3e-citation-granularity.ts
?? backend/scripts/test-kg3f-56-14132-predicate.ts
?? backend/scripts/test-kg3f-customer-path-disconnection.ts
?? backend/scripts/test-kg3f-ranking-adversarial.ts
?? backend/scripts/test-kg3f-retrieval-determinism.ts
?? backend/scripts/test-kg3f-shadow-invariance.ts
?? backend/scripts/test-knowledge-release-provenance.ts
?? backend/scripts/test-regulatory-release-lifecycle.ts
?? backend/scripts/test-release-integrity-and-approval.ts
?? backend/scripts/test-reviewer-approval.ts
?? backend/scripts/test-standards-backing-contract.ts
?? backend/scripts/verify-governed-record-against-source.ts
?? backend/scripts/verify-kg3e-record-against-source.ts
?? backend/src/applicable-standards/citation-structure.ts
?? backend/src/database/migrations/1800000010000-KnowledgeReleaseProvenance.ts
?? backend/src/database/migrations/1800000011000-RegulatoryReleaseLifecycle.ts
?? backend/src/database/migrations/1800000012000-RegulatoryReleaseRecords.ts
?? backend/src/database/migrations/1800000013000-RegulatoryReleaseRecordReviews.ts
?? backend/src/database/migrations/1800000014000-ApprovalProvenanceContract.ts
?? backend/src/inspection/knowledge-release-provenance.ts
?? backend/src/standards/display/
?? backend/src/standards/releases/
?? frontend-next/lib/inspection/__tests__/
?? verification/hazlenz-governed-knowledge-growth-2026-08-19/
```
## Environment at KG-4A start

### Pre-existing local processes (NOT to be disturbed)
```
pid=26809 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/ts-node src/main.ts
pid=37602 node dist/main.js 
pid=69535 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/nodemon src/main.ts
pid=71572 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/nodemon src/main.ts
```

### Listening ports
```
postgres 15690 [::1]:5432
postgres 15690 127.0.0.1:5432
node 26809 *:4000
```

### Databases present at KG-4A start (48)
```
insite_full_qa_20260818
postgres
safescope
safety_insite_test_20260817
sentinel_dev
sentinel_safety
template0
template1
test_hazlenz_qa_20260818
test_kg1_provenance_verify_20260819
test_kg2_regression_20260819
test_kg2_release_lifecycle_20260819
test_kg3a_integrity_20260819
test_kg3a_regression_20260819
test_kg3b_inventory_20260819
test_kg3b_review_20260819
test_kg3c_browser_20260819
test_kg3c_display_20260819
test_kg3c_inventory_20260819
test_kg3c_reports_20260819
test_kg3d_regression_20260819
test_kg3d_remediation_20260819
test_kg3d_reports_20260819
test_kg3e_deltacheck_20260820
test_kg3e_ordering_probe_20260820
test_kg3e_regression_20260820
test_kg3e_remediation_20260820
test_kg3e_reports_20260820
test_kg3f_browser_20260820
test_kg3f_contract_20260820
test_kg3f_contract_run
test_kg3f_det_child_before_parent
test_kg3f_det_citation_asc
test_kg3f_det_citation_desc
test_kg3f_det_original
test_kg3f_det_parent_before_child
test_kg3f_det_random_seed_1
test_kg3f_det_random_seed_2
test_kg3f_det_random_seed_3
test_kg3f_det_reverse_insertion
test_kg3f_entitlement_20260820
test_kg3f_layout_asc
test_kg3f_layout_desc
test_kg3f_regression_20260820
test_kg3f_remediation_20260820
test_kg3f_shadow_child_before_parent
test_kg3f_shadow_citation_desc
test_kg3f_shadow_original
test_kg3f_shadow_random_seed_2
```

PROHIBITED targets: `safescope` (SafeScope development database), `sentinel_dev`, `sentinel_safety`.
Port 4000 carries a pre-existing developer backend — KG-4A never uses port 4000.

---

## FINAL preservation (end of KG-4A)

```
HEAD:    5f050858227ca11cf90d2f6bf64148e70a018b64   (unchanged)
branch:  release/insite-rc-2026-08-18   (unchanged)
stashes: 4   (unchanged — the four pre-existing stashes)
tags:    23   (unchanged)
unrelated frontend files: 18/18 unchanged
```

### KG-3F 20-file manifest

Eighteen of the twenty KG-3F files are byte-identical. Two changed, both intentionally:

| File | Why |
|---|---|
| `applicable-standards/applicable-standards.service.ts` | the Path A governed seam (annotation only, after ranking) |
| `package.json` | six KG-4A script registrations, all prior entries preserved |

### Canonical KG-3F corpus — undamaged

```
test_kg3f_remediation_20260820: 269 records, 0 active releases
```

This is the KG-4A guardrail working: every activation and every fixture decision happened inside
a disposable clone owned by the suite that made it.
