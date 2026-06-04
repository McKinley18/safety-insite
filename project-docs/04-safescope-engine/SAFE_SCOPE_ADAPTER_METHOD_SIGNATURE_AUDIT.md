# SafeScope Adapter Method Signature Audit

## 1. Executive Summary

This audit inspects likely SafeScope Orchestrator adapter target services and records visible service classes, constructor dependencies, and public-looking method signatures. It is documentation-only and does not modify backend, frontend, package, or dataset files.

The integration recommendation remains adapter-first: the Orchestrator should call narrow adapter interfaces, and adapters should translate existing engine/service outputs into Orchestrator-safe contracts without replacing existing production logic.

## 2. Files Inspected

- `backend/src/safescope-source-intelligence/source-retrieval.service.ts` — FOUND
- `backend/src/safescope-v2/classifier/weighted-classifier.service.ts` — FOUND
- `backend/src/safescope-v2/standards-reasoning/standards-reasoning.service.ts` — FOUND
- `backend/src/safescope-v2/standards-bridge.service.ts` — FOUND
- `backend/src/applicable-standards/applicable-standards.service.ts` — FOUND
- `backend/src/risk/risk.service.ts` — FOUND
- `backend/src/corrective-actions/corrective-actions.service.ts` — FOUND
- `backend/src/reviews/reviews.service.ts` — FOUND
- `backend/src/audit/audit.service.ts` — FOUND
- `backend/src/reports/executive/executive.service.ts` — FOUND
- `backend/src/reports/reports.service.ts` — FOUND

## 3. Service Method Inventory Table

| File | Exported Class | Constructor Dependencies | Public-Looking Method | Adapter Use | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/src/safescope-source-intelligence/source-retrieval.service.ts` | `SourceRetrievalService` | `None visible` | `searchVerifiedSources(query: SourceIntelligenceSearchDto)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/safescope-v2/classifier/weighted-classifier.service.ts` | `WeightedClassifierService` | `None visible` | `classify(text: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/safescope-v2/standards-reasoning/standards-reasoning.service.ts` | `StandardsReasoningService` | `None visible` | `evaluate(input: {
    classification: string;
    standards?: any[];
    operationalReasoning?: any;
    expandedContext?: any;
    risk?: any;
    domainIntelligence?: any;
    crossDomainInteraction?: any;
  })` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/safescope-v2/standards-bridge.service.ts` | `StandardsBridgeService` | `None visible` | `getSuggestedStandards(classification: string, scopes?: string[])` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/applicable-standards/applicable-standards.service.ts` | `ApplicableStandardsService` | `@InjectRepository(Standard) private readonly standardRepo: Repository<Standard>, @Optional() @InjectRepository(SafeScopeKnowledgeChunk) private readonly knowledgeChunkRepo?: Repository<SafeScopeKnowledgeChunk>,` | `suggest(description: string,
    hazardCategory?: string,
    source?: string,
    limit = 5,)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/risk/risk.service.ts` | `RiskService` | `None visible` | `calculate(severity: number, likelihood: number)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `findAll(authHeader: string,
    options: { page: number; limit: number; statusCode?: string; priorityCode?: string; assignedToMe?: boolean },)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `export(statusCode?: string, priorityCode?: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `create(authHeader: string, dto: CreateCorrectiveActionDto)` | Avoid direct Orchestrator call during read-only analysis unless explicitly reviewed | Mutation/workflow-write risk |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `updateStatus(authHeader: string,
    id: string,
    body: { statusCode: 'open' \| 'in_progress' \| 'closed' \| 'cancelled'; closureNotes?: string },)` | Avoid direct Orchestrator call during read-only analysis unless explicitly reviewed | Mutation/workflow-write risk |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `generateDueDateAlerts(authHeader: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `@InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>, private auditService: AuditService, private notificationsService: NotificationsService, private fixFeedbackService: FixFeedbackService` | `close(id: string, dto: CloseCorrectiveActionDto)` | Avoid direct Orchestrator call during read-only analysis unless explicitly reviewed | Mutation/workflow-write risk |
| `backend/src/reviews/reviews.service.ts` | `ReviewsService` | `@InjectRepository(Classification) private classificationRepo: Repository<Classification>, @InjectRepository(Review) private reviewRepo: Repository<Review>, private auditService: AuditService,` | `getReviewQueue()` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/reviews/reviews.service.ts` | `ReviewsService` | `@InjectRepository(Classification) private classificationRepo: Repository<Classification>, @InjectRepository(Review) private reviewRepo: Repository<Review>, private auditService: AuditService,` | `review(classificationId: string, action: any, notes: string, reviewerUserId: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/audit/audit.service.ts` | `AuditService` | `@InjectRepository(AuditLog) private auditRepository: Repository<AuditLog>,` | `log(data: Partial<AuditLog>)` | Avoid direct Orchestrator call during read-only analysis unless explicitly reviewed | Mutation/workflow-write risk |
| `backend/src/audit/audit.service.ts` | `AuditService` | `@InjectRepository(AuditLog) private auditRepository: Repository<AuditLog>,` | `getAuditByEntityId(entityId: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/audit/audit.service.ts` | `AuditService` | `@InjectRepository(AuditLog) private auditRepository: Repository<AuditLog>,` | `getAuditByTenant(tenantId: string)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/reports/executive/executive.service.ts` | `ExecutiveService` | `None visible` | `generateExecutiveSummary(report: any)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/reports/reports.service.ts` | `ReportsService` | `@InjectRepository(Report) private reportRepo: Repository<Report>, @InjectRepository(Finding) private findingRepo: Repository<Finding>, @InjectRepository(ReportAttachment) private attachmentRepo: Repository<ReportAttachme` | `create(body: any, user?: any)` | Avoid direct Orchestrator call during read-only analysis unless explicitly reviewed | Mutation/workflow-write risk |
| `backend/src/reports/reports.service.ts` | `ReportsService` | `@InjectRepository(Report) private reportRepo: Repository<Report>, @InjectRepository(Finding) private findingRepo: Repository<Finding>, @InjectRepository(ReportAttachment) private attachmentRepo: Repository<ReportAttachme` | `addAttachment(reportId: string, body: any, user?: any)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/reports/reports.service.ts` | `ReportsService` | `@InjectRepository(Report) private reportRepo: Repository<Report>, @InjectRepository(Finding) private findingRepo: Repository<Finding>, @InjectRepository(ReportAttachment) private attachmentRepo: Repository<ReportAttachme` | `findAll(user?: any)` | Potential read/analysis adapter target | Low/unknown |
| `backend/src/reports/reports.service.ts` | `ReportsService` | `@InjectRepository(Report) private reportRepo: Repository<Report>, @InjectRepository(Finding) private findingRepo: Repository<Finding>, @InjectRepository(ReportAttachment) private attachmentRepo: Repository<ReportAttachme` | `findOne(id: string, user?: any)` | Potential read/analysis adapter target | Low/unknown |

## 4. Adapter Candidate Table

| Adapter Interface | Source Service Area | Purpose |
| :--- | :--- | :--- |
| `SourceIntelligenceRetrievalAdapter` | `source-retrieval.service.ts` | Normalize verified source intelligence matches for Orchestrator use. |
| `HazardClassificationAdapter` | `weighted-classifier.service.ts` | Normalize classification output into hazard family/subtype/confidence/reasons. |
| `StandardsMatchingAdapter` | `standards-reasoning.service.ts / standards-bridge.service.ts / applicable-standards.service.ts` | Normalize OSHA/MSHA citation candidates while preserving standards authority. |
| `RiskAssessmentAdapter` | `risk.service.ts` | Normalize severity/likelihood/exposure/urgency/escalation output. |
| `CorrectiveActionRecommendationAdapter` | `corrective-actions.service.ts` | Use only recommendation-safe methods first; avoid automatic record creation. |
| `ReviewGovernanceAdapter` | `reviews.service.ts` | Surface review requirements and governance state without changing review records initially. |
| `AuditTraceAdapter` | `audit.service.ts` | Add audit persistence later only after explicit review; keep initial adapter non-writing. |
| `ReportSummaryAdapter` | `executive.service.ts / reports.service.ts` | Normalize report/executive summary text generation after analysis is reviewed. |

## 5. Methods to Avoid During Read-Only Orchestration

| File | Class | Method | Reason |
| :--- | :--- | :--- | :--- |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `create(authHeader: string, dto: CreateCorrectiveActionDto)` | Method name suggests mutation or workflow write. |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `updateStatus(authHeader: string,
    id: string,
    body: { statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled'; closureNotes?: string },)` | Method name suggests mutation or workflow write. |
| `backend/src/corrective-actions/corrective-actions.service.ts` | `CorrectiveActionsService` | `close(id: string, dto: CloseCorrectiveActionDto)` | Method name suggests mutation or workflow write. |
| `backend/src/audit/audit.service.ts` | `AuditService` | `log(data: Partial<AuditLog>)` | Method name suggests mutation or workflow write. |
| `backend/src/reports/reports.service.ts` | `ReportsService` | `create(body: any, user?: any)` | Method name suggests mutation or workflow write. |

## 6. Recommended Adapter Interfaces

- `HazardClassificationAdapter`
- `StandardsMatchingAdapter`
- `SourceIntelligenceRetrievalAdapter`
- `RiskAssessmentAdapter`
- `CorrectiveActionRecommendationAdapter`
- `ReviewGovernanceAdapter`
- `AuditTraceAdapter`
- `ReportSummaryAdapter`

Adapters should live in a future isolated location such as `backend/src/safescope/adapters/` and should not modify existing engine internals.

## 7. Missing Information / Requires Manual Review

- All requested target files were found.
- TypeScript method detection is heuristic. Before implementation, manually inspect the exact input/output DTOs and method bodies of each selected service.
- Any method that writes data, creates corrective actions, modifies review records, imports source intelligence, or persists audit logs should remain outside read-only Orchestrator flow until explicitly approved.

## 8. Immediate Next Steps

1. Commit this method-signature audit.
2. Create adapter interface DTOs only, without injecting existing services yet.
3. Add adapter test fixtures with mocked outputs.
4. Implement read-only adapters one at a time behind feature gates.
5. Do not wire the Orchestrator into `AppModule` or production endpoints until tests and governance review pass.

## 9. Non-Negotiable Adapter Rules

- Do not overwrite `backend/src/safescope/safescope.module.ts`.
- Do not call mutation/workflow-write methods during read-only Orchestrator analysis.
- Do not let Source Intelligence override Standards Matching.
- Do not ingest unreviewed source intelligence.
- Do not create corrective actions automatically during analysis.
- Do not add database writes from Orchestrator until explicitly reviewed.
- Preserve each engine's authority and use adapters only as translation boundaries.

## Final Rule

SafeScope adapters must translate existing engine outputs into Orchestrator contracts without changing engine authority, mutating workflow state, or bypassing governance.
