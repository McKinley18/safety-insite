# SafeScope Backend Service Inventory Audit

## 1. Executive Summary

This audit inventories existing backend service, controller, and module files that may eventually be used by the SafeScope Orchestrator. The purpose is to identify integration targets before writing adapter code.

The SafeScope Orchestrator must sit above existing engines. It should coordinate outputs through adapters and must not replace, rewrite, or directly override existing production logic.

## 2. Inspection Scope

The audit scope includes:

- `backend/src/safescope/`
- `backend/src/safescope-v2/`
- `backend/src/safescope-source-intelligence/`
- `backend/src/standards/`
- `backend/src/risk/`
- `backend/src/corrective-actions/`
- `backend/src/reports/`
- `backend/src/reviews/`
- `backend/src/audit/`
- `backend/src/dashboards/`
- `backend/src/applicable-standards/`

## 3. Existing SafeScope Module Warning

`backend/src/safescope/safescope.module.ts` exists and appears to be existing production SafeScope wiring.

It currently imports and provides:

- `SafeScopeController`
- `SafeScopeService`
- `MatcherService`
- `ScorerService`
- `KeywordService`
- `BehaviorService`
- `RiskService`
- `FeedbackService`
- `AiService`
- `StandardsService`
- `TypeOrmModule.forFeature([FeedbackEntity])`

This file must not be replaced, overwritten, or simplified during orchestrator work.

The new isolated orchestrator contract module exists separately at:

- `backend/src/safescope/safescope-orchestrator-contract.module.ts`

That file is the correct place for isolated stub/contract work until production wiring is explicitly reviewed.

## 4. Service Inventory Table

| Area | Files Found | Likely Responsibility |
| :--- | :--- | :--- |
| Legacy SafeScope | `backend/src/safescope/safescope.service.ts`, `backend/src/safescope/engine/*.service.ts`, `backend/src/safescope/ai/ai.service.ts`, `backend/src/safescope/standards/standards.service.ts` | Existing SafeScope production services, matching, scoring, keyword/behavior/risk/feedback logic, AI helper logic, and standards support. |
| SafeScope v2 | `backend/src/safescope-v2/**/*.service.ts` | Advanced intelligence services including weighted classification, evidence fusion, confidence, standards reasoning, trend intelligence, operational reasoning, reference intelligence, site memory, supervisor validation, and orchestration. |
| Source Intelligence | `backend/src/safescope-source-intelligence/*.service.ts` | Source intelligence status, ingestion preview validation, read-only retrieval contract, and governance rules. |
| Standards | `backend/src/standards/standards.service.ts`, `backend/src/standards/standards-seed.service.ts` | Standards repository and standards seeding/management. |
| Applicable Standards | `backend/src/applicable-standards/applicable-standards.service.ts` | Likely coordination layer for applicable standards matching against reports/findings. |
| Risk | `backend/src/risk/risk.service.ts` | Risk scoring and risk-related endpoint support. |
| Corrective Actions | `backend/src/corrective-actions/corrective-actions.service.ts` | Corrective action creation, status, ownership, and tracking workflow. |
| Reports | `backend/src/reports/reports.service.ts`, `backend/src/reports/executive/executive.service.ts`, `backend/src/reports/pdf/pdf.service.ts` | Report lifecycle, executive summary generation, and PDF output. |
| Reviews | `backend/src/reviews/reviews.service.ts` | Human review queue and review lifecycle. |
| Audit | `backend/src/audit/audit.service.ts` | Audit log creation and audit trail support. |
| Dashboards | `backend/src/dashboards/dashboard.service.ts` | Dashboard summaries and analytics-oriented reporting. |

## 5. Controller Inventory Table

| Area | Controllers Found | Likely Responsibility |
| :--- | :--- | :--- |
| SafeScope | `backend/src/safescope/safescope.controller.ts` | Existing SafeScope production endpoints. |
| SafeScope v2 | `backend/src/safescope-v2/safescope-v2.controller.ts`, `feedback/safescope-feedback.controller.ts`, `snapshots/reasoning-snapshot.controller.ts`, `validation/supervisor-validation.controller.ts` | SafeScope v2 intelligence, feedback, reasoning snapshots, and supervisor validation endpoints. |
| Source Intelligence | `backend/src/safescope-source-intelligence/source-intelligence.controller.ts` | Non-mutating source intelligence status/search/preview validation endpoints. |
| Standards | `backend/src/standards/standards.controller.ts` | Standards management/search endpoints. |
| Applicable Standards | `backend/src/applicable-standards/applicable-standards.controller.ts` | Applicable standards endpoints. |
| Risk | `backend/src/risk/risk.controller.ts` | Risk scoring endpoints. |
| Corrective Actions | `backend/src/corrective-actions/corrective-actions.controller.ts` | Corrective action endpoints. |
| Reports | `backend/src/reports/reports.controller.ts`, `backend/src/reports/executive/executive.controller.ts` | Report and executive summary endpoints. |
| Reviews | `backend/src/reviews/review-queue.controller.ts` | Review queue endpoints. |
| Audit | `backend/src/audit/audit.controller.ts` | Audit endpoints. |
| Dashboards | `backend/src/dashboards/dashboard.controller.ts` | Dashboard endpoints. |

## 6. Module Inventory Table

| Module File | Integration Note |
| :--- | :--- |
| `backend/src/safescope/safescope.module.ts` | Existing production SafeScope module. Must not be overwritten. |
| `backend/src/safescope/safescope-orchestrator-contract.module.ts` | Isolated orchestrator contract/stub module. Safe for non-production contract work. |
| `backend/src/safescope-v2/safescope-v2.module.ts` | Existing SafeScope v2 module. Candidate for adapter-based access only after inspection. |
| `backend/src/safescope-source-intelligence/source-intelligence.module.ts` | Source Intelligence Library module. Current retrieval is read-only/stubbed. |
| `backend/src/standards/standards.module.ts` | Standards module. Regulatory authority must remain here. |
| `backend/src/applicable-standards/applicable-standards.module.ts` | Likely standards coordination module. Candidate adapter target. |
| `backend/src/risk/risk.module.ts` | Risk module. Candidate adapter target. |
| `backend/src/corrective-actions/corrective-actions.module.ts` | Corrective action module. Candidate adapter target. |
| `backend/src/reports/reports.module.ts` | Reports/executive summary module. Candidate adapter target. |
| `backend/src/reviews/reviews.module.ts` | Review/governance module. Candidate adapter target. |
| `backend/src/audit/audit.module.ts` | Audit module. Candidate adapter target for audit trail persistence. |
| `backend/src/dashboards/dashboards.module.ts` | Dashboard/trend reporting module. Candidate future analytics adapter target. |

## 7. Likely Orchestrator Adapter Targets

The first adapter targets should be read-only or low-risk:

1. `backend/src/safescope-source-intelligence/source-retrieval.service.ts`
   - Use for verified source evidence retrieval.
   - Must remain read-only until database ingestion and governance are complete.

2. `backend/src/safescope-v2/classifier/weighted-classifier.service.ts`
   - Candidate hazard classification adapter target.
   - Must not replace existing classifier behavior.

3. `backend/src/safescope-v2/standards-reasoning/standards-reasoning.service.ts`
   - Candidate standards reasoning adapter target.
   - Must not reduce standards authority or citation precision.

4. `backend/src/applicable-standards/applicable-standards.service.ts`
   - Candidate applicable standards bridge.
   - Should be inspected before use because it may already coordinate classification + standards.

5. `backend/src/risk/risk.service.ts`
   - Candidate risk scoring adapter target.

6. `backend/src/corrective-actions/corrective-actions.service.ts`
   - Candidate corrective action adapter target.
   - Should not create actions automatically during analysis unless a user confirms or review flow requires it.

7. `backend/src/reviews/reviews.service.ts`
   - Candidate review/governance adapter target.

8. `backend/src/audit/audit.service.ts`
   - Candidate audit logging adapter target.
   - Audit writes should be introduced only after explicit review.

## 8. Method Signature Findings

A full method-level adapter design should be completed in a separate pass. This inventory confirms that the project already contains a substantial set of service classes and controllers.

Before any integration code is written, inspect public method signatures in:

- `weighted-classifier.service.ts`
- `standards-reasoning.service.ts`
- `standards-bridge.service.ts`
- `applicable-standards.service.ts`
- `risk.service.ts`
- `corrective-actions.service.ts`
- `reviews.service.ts`
- `audit.service.ts`
- `source-retrieval.service.ts`

## 9. Production Safety Risks

The following risks must be controlled:

- Replacing `backend/src/safescope/safescope.module.ts` would break existing production SafeScope wiring.
- Wiring the new Orchestrator directly into `AppModule` too early could expose stub logic as production behavior.
- Letting Source Intelligence override Standards Matching would weaken regulatory authority.
- Direct database writes from analysis flow could bypass review/governance.
- Calling corrective action creation automatically could create unintended operational records.
- Modifying existing engine internals could regress working classification, standards, or report flows.

## 10. Recommended Adapter Strategy

Use an adapter-first strategy:

1. Keep all existing production services unchanged.
2. Create narrow adapter interfaces around selected services.
3. Each adapter returns normalized Orchestrator-friendly objects.
4. The Orchestrator consumes adapter outputs only.
5. Existing engines remain authoritative for their own domain.
6. Feature-flag any live orchestration path.
7. Add tests before AppModule or endpoint wiring.

Recommended future adapter location:

- `backend/src/safescope/adapters/`

## 11. Immediate Next Steps

1. Commit this corrected service inventory audit.
2. Create a method-signature audit for the likely adapter target files.
3. Define adapter interfaces without implementing live service calls.
4. Add tests around adapter output shapes.
5. Only then consider read-only Orchestrator integration behind a disabled feature flag.

## 12. Non-Negotiable Integration Rules

- Do not overwrite `backend/src/safescope/safescope.module.ts`.
- Do not replace existing SafeScope production services.
- Do not wire the Orchestrator into `AppModule` until reviewed.
- Do not expose a production Orchestrator endpoint until tests pass.
- Do not let Source Intelligence override regulatory Standards Matching.
- Do not ingest unreviewed source intelligence.
- Do not create corrective actions automatically from analysis without explicit workflow approval.
- Do not add analysis-time database writes except reviewed audit logging in a later phase.
- Use adapters to integrate; never bypass established service boundaries.

## Final Rule

SafeScope Orchestrator integration must be adapter-first, feature-gated, and authority-preserving.
