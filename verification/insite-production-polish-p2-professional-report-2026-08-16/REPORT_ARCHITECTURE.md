# Production Polish P2 — Report Architecture Trace

## Three independent report/PDF systems found

| # | Entry flow | Trigger | Renderer | Output |
|---|---|---|---|---|
| 1 | `/inspection` → `GenerateReportSection.tsx` → `generateInspectionReportPackage` | "Generate" button | Saves a report object locally/cloud (`reportStorage.ts`/`cloudReports.ts`); no PDF produced at this step | JSON report record, viewed later via `ReportCard.tsx`'s "Export PDF" |
| 2 | `/inspection-review` (legacy) → `reportExportService.ts` | "Export Final PDF" | `frontend-next/lib/localExporter.ts` — **client-side jsPDF** | Browser-downloaded PDF, immediately |
| 3 | `/inspections` → `/inspection-workspace` (canonical) → `/reports` | `POST /inspections/:id/reports` | `backend/src/reports/canonical-reports.service.ts` → `canonical-report-pdf-renderer.ts` — **server-side pdfkit** | Immutable, versioned, checksummed, private-storage-backed PDF, downloaded via authorized route |

System 3 is the one Production Polish P1 promoted as the primary path (dashboard CTA → canonical `/inspections`), and is what this phase's redesign targets. System 2 received narrower, targeted improvements (see implementation report) since P0-01/02/03 already brought it to a working, reasonably-designed state. System 1 is a save-only step feeding into system 3's data model; no separate renderer.

## Full lifecycle (system 3, canonical)

```
POST /inspections                          → Inspection (draft)
POST /inspections/:id/observations         → Observation (rawText)
POST /observations/:id/analyses            → HazLenzAnalysis (resultSnapshot = raw classify response)
                                              → reconcileDecompositionFindings() auto-creates one
                                                InspectionFinding per decomposed hazard
                                                (system_generated riskSnapshot, independent per hazard)
POST /observations/:id/reviews             → HumanReview (decision, rationale) — per finding
POST /observations/:id/findings            → finalizes the InspectionFinding (conclusion, optional
                                                riskAssessment override), status → 'finalized'
POST /actions                              → CorrectiveAction (title, description, owner, due, status,
                                                priority) — linked via findingId
POST /inspections/:id/transition           → draft → in_review → completed
POST /inspections/:id/reports              → CanonicalReportsService.generate():
                                                1. snapshotInspection() — immutable JSON snapshot of
                                                   inspection + observations + findings + analyses +
                                                   reviews + corrective actions + (this phase) site +
                                                   preparedBy, fingerprinted (SHA-256) and persisted
                                                   verbatim to InspectionReportVersion.sourceSnapshot
                                                2. renderInspectionReportPdf(snapshot) — pdfkit render
                                                3. StorageService.store() — private, checksummed object
GET  /inspection-reports/:id/versions/:v/download → authorized, private-file download
```

## Authoritative data source per section (system 3)

| Section | Source |
|---|---|
| Site / facility | `Site.name`, resolved once at generation time via `inspection.siteId` (this phase — previously absent entirely) |
| Inspector | `User.name`, resolved via `inspection.ownerUserId` (this phase — previously absent) |
| Finding numbering | Array index within the immutable snapshot's finding list, in creation order (stable, deterministic per generated version) |
| Risk (severity/likelihood/band/score) | `InspectionFinding.riskSnapshot`, computed once by `InspectionService.computeFindingRisk()` (protected V5-C01 surface) at reconciliation/finalization time — **never recalculated by the renderer** |
| Standard | Extracted read-only from the finding's originating `HazLenzAnalysis.resultSnapshot` (`executiveJudgment.topStandard` / `standardsReasoning.topDefensible[0]` / `primaryCitation`) — never fabricated; omitted entirely when absent |
| Qualified-person review | `InspectionFinding.finalReviewId`, resolved against the parent observation's already-loaded `HumanReview` rows |
| Corrective action | `CorrectiveAction` rows filtered by `findingId`, fetched once per inspection |

## Client/server rendering responsibility

100% server-side for system 3 (the canonical path): the frontend only triggers generation and downloads the finished, immutable PDF — it does not participate in layout, pagination, or content selection. This is a stronger integrity guarantee than the client-side jsPDF path (system 2), since the rendered document is byte-identical to what was fingerprinted and audit-logged at generation time, and cannot be altered by client-side state after the fact.

## Duplicated transformations found and removed

`frontend-next/lib/localExporter.ts` imported `renderCoverPage`/`renderExecutiveSummary` from `pdfSummaryBuilders.ts` but never called them — it reimplemented the identical logic inline instead (~150 lines of dead-but-shadowed duplication). Left as-is this phase (legacy path, not the primary redesign target; removing dead imports there was judged out of the narrow scope this phase needed, and is noted here as a small, low-risk cleanup opportunity for a future pass rather than actioned now).

## Fields generated but never displayed (pre-fix, system 3)

`observation.evidenceSource`, `inspection.version`, `inspection.organizationId` were captured in the snapshot but never shown to the reader in any useful form — the old renderer printed raw `Inspection ID` and `Version` instead of anything a manager would want. Post-fix, the raw ID is present only as a small, de-emphasized "Record reference" (first 8 characters, cover page footer) — never as the primary identifier — and `version`/`organizationId` are not surfaced (internal/technical, not report content).

## Fields displayed but not reliably persisted

None found for system 3 — every field the redesigned renderer displays is read directly from the persisted, fingerprinted snapshot; nothing is computed ad hoc in the renderer itself.
