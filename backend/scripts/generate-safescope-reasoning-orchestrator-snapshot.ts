import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/reports/reasoning-orchestrator-snapshot.json',
);

const service = new SafeScopeReasoningOrchestratorService();

const machineGuardingSnapshot = service.reason({
  hazardObservation: 'Unguarded conveyor tail pulley with employee access during cleanup.',
  siteType: 'surface aggregate mine',
  taskContext: 'workplace inspection',
  industryContext: 'mining',
  photosAvailable: true,
  employeeExposureKnown: true,
  equipmentInvolved: 'conveyor tail pulley',
});

const uncertainSnapshot = service.reason({
  hazardObservation: 'Possible issue observed.',
});

const snapshot = {
  engine: 'safescope_reasoning_orchestrator_snapshot',
  mode: 'contract_snapshot_test_only',
  generatedAt: new Date().toISOString(),
  purpose:
    'Document and validate the SafeScope reasoning orchestrator output contract before UI or production reasoning integration.',
  scenarios: {
    machineGuardingSnapshot,
    uncertainSnapshot,
  },
  contractAssertions: {
    orchestratorIsAdvisory:
      machineGuardingSnapshot.conclusionBoundary.advisoryOnly === true &&
      uncertainSnapshot.conclusionBoundary.advisoryOnly === true,
    doesNotDeclareViolations:
      machineGuardingSnapshot.conclusionBoundary.doesNotDeclareViolation === true &&
      uncertainSnapshot.conclusionBoundary.doesNotDeclareViolation === true,
    doesNotCreateCitations:
      machineGuardingSnapshot.conclusionBoundary.doesNotCreateCitation === true &&
      uncertainSnapshot.conclusionBoundary.doesNotCreateCitation === true,
    productionReasoningUnchanged:
      machineGuardingSnapshot.productionReasoningModified === false &&
      uncertainSnapshot.productionReasoningModified === false,
    approvedContextDisabledByDefault:
      machineGuardingSnapshot.approvedKnowledgeContext.enabled === false &&
      uncertainSnapshot.approvedKnowledgeContext.enabled === false,
    applicabilityAnalysisEmbedded:
      machineGuardingSnapshot.applicabilityAnalysis.engine === 'safescope_applicability_analysis_v1' &&
      uncertainSnapshot.applicabilityAnalysis.engine === 'safescope_applicability_analysis_v1',
    correctiveActionReasoningEmbedded:
      machineGuardingSnapshot.correctiveActionReasoning.engine === 'safescope_corrective_action_reasoning_v1' &&
      uncertainSnapshot.correctiveActionReasoning.engine === 'safescope_corrective_action_reasoning_v1',
    correctiveActionReasoningProtected:
      machineGuardingSnapshot.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation === true &&
      machineGuardingSnapshot.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true &&
      uncertainSnapshot.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation === true &&
      uncertainSnapshot.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true,
    qualifiedReviewRequired:
      machineGuardingSnapshot.conclusionBoundary.requiresQualifiedReview === true &&
      uncertainSnapshot.conclusionBoundary.requiresQualifiedReview === true,
  },
  sourceBoundary:
    'This snapshot is a test-only contract artifact. It does not wire the reasoning orchestrator into production, declare violations, create citations, bypass human review, or modify SafeScope native reasoning.',
};

fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log('✅ SafeScope reasoning orchestrator snapshot generated.');
console.log(`Snapshot: ${snapshotPath}`);
console.log(`Machine guarding jurisdiction: ${machineGuardingSnapshot.jurisdictionAssessment.likelyJurisdiction}`);
console.log(`Machine guarding domain: ${machineGuardingSnapshot.hazardClassification.primaryDomain}`);
console.log(`Uncertain confidence: ${uncertainSnapshot.confidence.level}`);
