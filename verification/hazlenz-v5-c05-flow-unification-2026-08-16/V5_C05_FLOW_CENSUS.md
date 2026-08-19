# V5-C05 — Phase 2: Complete Flow / Route Census

## Legacy family

| Entry point | Route | Component tree (key) | State source | Persistence | Risk source | Next nav | Classification |
|---|---|---|---|---|---|---|---|
| Dashboard primary CTA | `command-center/page.tsx:419` `href="/inspection"` | direct link, no gate | — | — | — | `/inspection` | **COMPATIBILITY_REQUIRED** — primary CTA target; zero entitlement gating (see Diff doc) |
| `/inspection-cover` "Start Inspection" | `inspection-cover/page.tsx:221-228` | `getCoverPage`/`setCoverPage` (`reportStorage.ts`) | `sentinel_encrypted_cover_page` | — | — | `/inspection` | **CANONICALIZE_LINK** — thin wrapper, trivially retargetable |
| `/inspection` | `app/inspection/page.tsx` (939 ln) | `InspectionWorkflowHeader`, `InspectionStepRenderer` → `InspectionStepTwo` → `SafeScopeInspectionStep` (multi-hazard banner), `InspectionStepThree`, `FinalizeInspectionSection`, `GenerateReportSection`, `CurrentHazardCard` | `@/lib/inspection/inspectionContext`, `offlineInspectionWiring`, `secureStorage`, `reportStorage` | reads `sentinel_selected_inspection_context` (196), writes `sentinel_inspection_autosave` (290-333, **write-only, zero readers repo-wide**), writes offline snapshots via `offlineInspectionWiring.ts` (**also write-only** — zero consumers outside the store file itself) | `finding.safeScopeResult.risk` — observation-level, shared across findings created from the same/similar narrative (confirmed live, `V5_C05_P1_REPRODUCTION.md`); no `riskSnapshot`, no multi-hazard-decomposition-aware scoring | `/inspection-review` or `/inspection-cover` | **COMPATIBILITY_REQUIRED** |
| `/inspection-review` | `app/inspection-review/page.tsx` (327 ln) | `ReportDetailsPanel`, `FindingsReviewList`, `ReviewExportPanel` | `reportStorage.ts` (`getLatestReport`) | `sentinel_encrypted_reports`/`latest_report` (encrypted localStorage) | reads `finding.safeScopeResult?.risk?.riskBand` per finding (`FindingsReviewList.tsx:55`) | Edit → `/inspection`; local PDF export; "Save to Cloud" → separate legacy `/reports` REST resource | **COMPATIBILITY_REQUIRED** — sole reader of locally-stored encrypted reports; no canonical replacement exists |
| `/inspection-quick` | none (zero inbound references anywhere in `frontend-next/app` or `frontend-next/components`, confirmed by repo-wide grep) | self-contained: `quickReviewService.ts`, `evidenceStorage.ts`, `actionStorage.ts` | own localStorage keys | writes into the **same** `reportStorage.ts` keys as legacy; on save does `router.push("/inspection-review")` (`inspection-quick/page.tsx:205`) | N/A (unreachable) | `/inspection-review` if ever reached | **DEAD** — confirmed orphaned; no middleware, no dynamic route table, no bookmark mechanism reaches it |

## Canonical family

| Entry point | Route | Component tree | State source | Persistence | Risk source | Next nav |
|---|---|---|---|---|---|---|
| Bottom nav "Inspect" tab | `MobileTabBar.tsx:9` → `/inspections` | — | — | — | — | `/inspections` |
| `/inspections` | `app/inspections/page.tsx` (424 ln) | site picker, two workflow cards ("Quick Inspection", "Full Inspection") | `canonicalWorkflowApi.ts` (`listPersistedSites`, `createPersistedInspection`) | server; on workflow start writes `sentinel_selected_inspection_context` (149-167 — **same localStorage key the legacy `/inspection` page reads**, a cross-flow coupling worth noting for Phase 5) | — | both cards route to `/inspection-workspace` (53, 66), gated by `hasPlanEntitlement(workflow.entitlement, planCode)` (134, 287) |
| `/inspection-workspace` | `app/inspection-workspace/page.tsx` (1062 ln) | single-file guided flow: capture → review → risk → followup → complete | `canonicalWorkflowApi.ts` exclusively — every mutating action is a bare `fetch`, no offline path | 100% server; resumes via `sentinel_selected_inspection_context.persistedInspectionId` on mount (25-36) | reads `finding.riskSnapshot` per finding (`riskSnapshotToReviewerRisk()`, 57-84, 826, 833) — independently computed per hazard (C01) | `/reports` (1055) |
| `/reports` | `app/reports/page.tsx` | `listPersistedReports`/`downloadPersistedReport` | server (canonical only) | — | — | download PDF |

## Dead/write-only infrastructure (does not block any strategy — noted for completeness)

`offlineInspectionWiring.ts`/`offlineInspectionStore.ts` (sync-queue types, `enqueueInspectionSyncItem`,
`listLocalInspections`, `listLocalFindings`, `getInspectionSyncQueue`) look like active offline-resilience
infrastructure inside the legacy `/inspection` page but are **write-only** — nothing repo-wide reads any
of their outputs. Likewise `sentinel_inspection_autosave`. These do not currently protect a user from data
loss on reload, and are not a capability a consolidation strategy needs to preserve or port — they should
not be mistaken for working functionality during Phase 14 cleanup.

## Legacy cloud-report resource (orphaned, distinct from canonical persistence)

`inspection-review/page.tsx`'s "Save to Cloud" button calls into `cloudReports.ts` (`saveInspectionReportToCloud`),
a **separate legacy `/reports` REST resource** distinct from the canonical `/inspections`/`/reports`
persistence path. The only frontend consumer of `fetchCloudReports` (`ReportCard.tsx`) is itself
unreferenced from any page — so reports saved this way are, in practice, **write-only** from the current
frontend's perspective: nothing in the live UI lists or re-displays them. This is a second, independent
orphaned-data risk to account for in Phase 5 (state preservation) if `/inspection-review` is ever retired
without a migration path.
