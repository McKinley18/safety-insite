# SafeScope Brain Organization Audit

Generated: 2026-06-03T13:20:25.175932Z

## Summary

- Brain directories reviewed: 4
- Files inventoried: 141
- SafeScope validators/audits found: 100
- Production readiness steps found: 28

## Active Entrypoints

- `backend/src/safescope-v2/safescope-v2.service.ts`
- `backend/src/safescope-v2/safescope-v2.controller.ts`
- `backend/src/safescope-v2/brain/query-orchestrator/brain-query-orchestrator.service.ts`
- `backend/src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts`

## Production Readiness Steps

- Production environment readiness
- Reasoning result contract
- Reasoning snapshot equipment fields
- Reasoning snapshot summary contract
- Live equipment snapshot context
- Reasoning snapshot access control
- Supervisor validation workspace scope
- Standards scope-fit ranking
- SafeScope Brain snapshot builder
- SafeScope Brain query orchestrator
- SafeScope Field Readiness Routing
- SafeScope Field Output Contract
- SafeScope Field Output Scenarios
- SafeScope Field Realism Gauntlet
- SafeScope Evidence Brain
- SafeScope Evidence Gap Intelligence
- SafeScope Decision Confidence
- SafeScope Learning Memory
- SafeScope Improvement Candidate Engine
- SafeScope Controls Brain
- SafeScope Mechanism Brain
- SafeScope Regulatory Brain
- SafeScope Scenario Disambiguation
- SafeScope Brain foundation
- SafeScope Brain alignment audit
- SafeScope Brain coverage matrix
- SafeScope finding audit
- Backend TypeScript build

## File Inventory by Category

### api_entrypoint

- `backend/src/safescope-knowledge/safescope-knowledge.controller.ts`

### contract_or_type_definition

- `backend/src/safescope-v2/brain/controls-brain/controls-brain.types.ts`
- `backend/src/safescope-v2/brain/decision-confidence/decision-confidence.types.ts`
- `backend/src/safescope-v2/brain/evidence-brain/evidence-brain.types.ts`
- `backend/src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.types.ts`
- `backend/src/safescope-v2/brain/hazard-universe/hazard-universe.types.ts`
- `backend/src/safescope-v2/brain/improvement-candidate-engine/improvement-candidate-engine.types.ts`
- `backend/src/safescope-v2/brain/learning-memory/learning-memory.types.ts`
- `backend/src/safescope-v2/brain/mechanism-brain/mechanism-brain.types.ts`
- `backend/src/safescope-v2/brain/query-orchestrator/brain-query-orchestrator.types.ts`
- `backend/src/safescope-v2/brain/regulatory-brain/regulatory-brain.types.ts`
- `backend/src/safescope-v2/brain/safescope-brain.types.ts`
- `backend/src/safescope-v2/brain/scenario-disambiguation/scenario-disambiguation.types.ts`
- `backend/src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.types.ts`
- `backend/src/safescope-v2/brain/source-governance/source-governance.types.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/applicability/applicability-analysis.types.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/corrective-actions/corrective-action-reasoning.types.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/domain-candidate.types.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.types.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario.types.ts`
- `backend/src/safescope-v2/knowledge-intake/bridge/approved-knowledge-bridge.types.ts`
- `backend/src/safescope-v2/knowledge-intake/integration/approved-knowledge-integration.types.ts`
- `backend/src/safescope-v2/knowledge-intake/knowledge-intake.types.ts`
- `backend/src/safescope-v2/knowledge-intake/query/approved-knowledge-query.types.ts`
- `backend/src/safescope-v2/knowledge-intake/review/knowledge-review.types.ts`

### documentation

- `backend/src/safescope-v2/brain/README.md`
- `backend/src/safescope-v2/knowledge-intake/docs/APPROVED_KNOWLEDGE_PATHWAY.md`
- `backend/src/safescope-v2/knowledge-intake/docs/RESEARCH_LIBRARY_README.md`
- `backend/src/safescope-v2/knowledge-intake/docs/RESEARCH_PLAN.md`

### knowledge_registry_or_data

- `backend/src/safescope-v2/brain/controls-brain/controls-knowledge.registry.ts`
- `backend/src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry.ts`
- `backend/src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.registry.ts`
- `backend/src/safescope-v2/brain/hazard-universe/hazard-universe.registry.ts`
- `backend/src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry.ts`
- `backend/src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry.ts`
- `backend/src/safescope-v2/brain/scenario-disambiguation/scenario-disambiguation.registry.ts`
- `backend/src/safescope-v2/brain/source-governance/source-authority.registry.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/reports/reasoning-orchestrator-snapshot.json`
- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-coverage-report.json`
- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-maturity-report.json`
- `backend/src/safescope-v2/knowledge-intake/bridge/reports/approved-knowledge-bridge-snapshot.json`
- `backend/src/safescope-v2/knowledge-intake/integration/reports/approved-knowledge-integration-snapshot.json`
- `backend/src/safescope-v2/knowledge-intake/records/approved/approved-knowledge-bundle.json`
- `backend/src/safescope-v2/knowledge-intake/records/quarantined/msha-56-14107-machine-guarding.json`
- `backend/src/safescope-v2/knowledge-intake/records/quarantined/niosh-exposure-assessment-foundation.json`
- `backend/src/safescope-v2/knowledge-intake/records/quarantined/osha-1910-147-lockout-tagout.json`
- `backend/src/safescope-v2/knowledge-intake/records/quarantined/osha-1910-212-machine-guarding.json`
- `backend/src/safescope-v2/knowledge-intake/records/quarantined/sample-msha-record.json`
- `backend/src/safescope-v2/knowledge-intake/reports/knowledge-coverage-report.json`
- `backend/src/safescope-v2/knowledge-intake/source-mods/msha-regulatory-mod.json`
- `backend/src/safescope-v2/knowledge-intake/source-mods/niosh-health-exposure-mod.json`
- `backend/src/safescope-v2/knowledge-intake/source-mods/osha-regulatory-mod.json`
- `backend/src/safescope-v2/knowledge-intake/source-register/source-register.csv`
- `backend/src/safescope-v2/knowledge-intake/source-register/source-register.seed.json`
- `backend/src/safescope-knowledge/ingestion/seed-knowledge-sources.ts`
- `backend/src/safescope-knowledge/ingestion/source-lists/msha-30-cfr-core.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/msha-fatality-urls.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/msha-program-policy-manual.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/msha-safety-alerts.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/niosh-mining-publications.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-directives.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-ecfr-1910.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-ecfr-1926.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-fatality-catastrophe-data.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-incident-database.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-safety-health-topics.json`
- `backend/src/safescope-knowledge/ingestion/source-lists/osha-standard-interpretations.json`
- `backend/src/safescope-knowledge/maintenance/verify-source-expansion-registry.ts`
- `backend/src/safescope-knowledge/seed/safescope-knowledge.seed.ts`
- `backend/src/safescope-knowledge/seed/starter-knowledge.ts`
- `backend/src/safescope-knowledge/sources/safescope-source-registry.ts`
- `backend/src/safescope-knowledge/sources/safescope-source-registry.types.ts`
- `backend/src/safescope-knowledge/sources/source-registry-metadata.ts`
- `backend/src/safescope-knowledge/sources/verify-source-registry.ts`

### reasoning_or_service_module

- `backend/src/safescope-v2/brain/controls-brain/controls-brain.service.ts`
- `backend/src/safescope-v2/brain/decision-confidence/decision-confidence.service.ts`
- `backend/src/safescope-v2/brain/evidence-brain/evidence-brain.service.ts`
- `backend/src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.service.ts`
- `backend/src/safescope-v2/brain/improvement-candidate-engine/improvement-candidate-engine.service.ts`
- `backend/src/safescope-v2/brain/learning-memory/learning-memory.service.ts`
- `backend/src/safescope-v2/brain/mechanism-brain/mechanism-brain.service.ts`
- `backend/src/safescope-v2/brain/query-orchestrator/brain-query-orchestrator.service.ts`
- `backend/src/safescope-v2/brain/regulatory-brain/regulatory-brain.service.ts`
- `backend/src/safescope-v2/brain/scenario-disambiguation/scenario-disambiguation.service.ts`
- `backend/src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.service.ts`
- `backend/src/safescope-v2/brain/source-governance/governance-validator.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/applicability/applicability-analysis.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/corrective-actions/corrective-action-reasoning.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-runner.service.ts`
- `backend/src/safescope-v2/knowledge-intake/bridge/approved-knowledge-bridge.service.ts`
- `backend/src/safescope-v2/knowledge-intake/integration/approved-knowledge-integration-adapter.service.ts`
- `backend/src/safescope-v2/knowledge-intake/knowledge-record-validator.service.ts`
- `backend/src/safescope-v2/knowledge-intake/query/approved-knowledge-query.service.ts`
- `backend/src/safescope-v2/knowledge-intake/review/knowledge-review.service.ts`
- `backend/src/safescope-knowledge/safescope-knowledge.service.ts`

### supporting_file

- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-fixtures.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/scenarios/scenario-coverage-taxonomy.ts`
- `backend/src/safescope-v2/knowledge-intake/knowledge-intake.guardrails.ts`
- `backend/src/safescope-v2/knowledge-intake/knowledge-source-mod-template.ts`
- `backend/src/safescope-knowledge/entities/safescope-knowledge-chunk.entity.ts`
- `backend/src/safescope-knowledge/entities/safescope-knowledge-document.entity.ts`
- `backend/src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity.ts`
- `backend/src/safescope-knowledge/entities/safescope-knowledge-retrieval-log.entity.ts`
- `backend/src/safescope-knowledge/entities/safescope-knowledge-source.entity.ts`
- `backend/src/safescope-knowledge/export/export-knowledge-bundle.ts`
- `backend/src/safescope-knowledge/ingestion/connector-priority-planner.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/msha-30-cfr.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/msha-fatality.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/msha-program-policy-manual.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/msha-safety-alert.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/niosh-mining-publication.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/osha-ecfr.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/osha-incident-database.connector.ts`
- `backend/src/safescope-knowledge/ingestion/connectors/osha-standard-interpretation.connector.ts`
- `backend/src/safescope-knowledge/ingestion/ingestion-control-plane.ts`
- `backend/src/safescope-knowledge/ingestion/ingestion-run-logger.ts`
- `backend/src/safescope-knowledge/ingestion/run-msha-30-cfr-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-msha-fatality-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-msha-program-policy-manual-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-msha-safety-alert-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-niosh-mining-publication-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-osha-ecfr-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-osha-incident-database-ingestion.ts`
- `backend/src/safescope-knowledge/ingestion/run-osha-standard-interpretation-ingestion.ts`
- `backend/src/safescope-knowledge/maintenance/ensure-knowledge-tables.ts`
- `backend/src/safescope-knowledge/safescope-knowledge.module.ts`
- `backend/src/safescope-knowledge/scoring/knowledge-domain-scoring.helper.ts`
- `backend/src/safescope-knowledge/sources/source-governance-helper.ts`
- `backend/src/safescope-knowledge/sources/source-role-helper.ts`
- `backend/src/safescope-knowledge/sources/source-synthesis-helper.ts`

### validator_or_audit

- `backend/src/safescope-knowledge/ingestion/verify-safescope-ingestion-sources.ts`
- `backend/src/safescope-knowledge/maintenance/audit-regulatory-coverage.ts`
- `backend/src/safescope-knowledge/maintenance/verify-connector-priority-planner.ts`
- `backend/src/safescope-knowledge/maintenance/verify-ingestion-control-plane.ts`
- `backend/src/safescope-knowledge/maintenance/verify-knowledge-review-workflow.ts`
- `backend/src/safescope-knowledge/maintenance/verify-knowledge-source-roles.ts`
- `backend/src/safescope-knowledge/maintenance/verify-knowledge-source-synthesis.ts`
- `backend/src/safescope-knowledge/maintenance/verify-msha-30-cfr-ingestion.ts`
- `backend/src/safescope-knowledge/maintenance/verify-osha-ecfr-ingestion.ts`
- `backend/src/safescope-knowledge/maintenance/verify-source-governance.ts`

## Initial Findings

1. SafeScope now has a meaningful brain structure, but it needs a canonical module map before further expansion.
2. The `/brain` directory contains the clearest modular intelligence architecture.
3. The root `safescope-v2` intelligence modules appear broader than the brain directory and should be labeled as active/support/legacy.
4. The field output path is now wired through review, reports, PDF export, and finding persistence.
5. Production readiness coverage is strong, but it should eventually enforce cross-coverage between knowledge records and scenario tests.

## Recommended Next Actions

- Create a canonical SafeScope reasoning pipeline map.
- Label each SafeScope module as active, support, validator, legacy, or candidate.
- Document which modules feed fieldOutput, reports, PDFs, and learning memory.
- Create a hazard-domain coverage matrix tying standards, mechanisms, evidence, controls, and tests together.
- Add a validator that fails when a brain registry has no matching scenario coverage.

## Output Artifacts

- JSON: `safescope-data/benchmarks/safescope-brain-organization-audit.v1.json`
- Markdown: `project-docs/08-audits/SAFESCOPE_BRAIN_ORGANIZATION_AUDIT.md`
