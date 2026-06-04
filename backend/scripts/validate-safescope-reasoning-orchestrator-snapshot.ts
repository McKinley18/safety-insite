import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/reports/reasoning-orchestrator-snapshot.json',
);

assert(
  fs.existsSync(snapshotPath),
  'Reasoning orchestrator snapshot does not exist. Run generate-safescope-reasoning-orchestrator-snapshot.ts first.',
);

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

assert(snapshot.engine === 'safescope_reasoning_orchestrator_snapshot', 'Snapshot engine changed.');
assert(snapshot.mode === 'contract_snapshot_test_only', 'Snapshot mode changed.');
assert(Boolean(snapshot.generatedAt), 'Snapshot missing generatedAt.');
assert(Boolean(snapshot.purpose), 'Snapshot missing purpose.');
assert(Boolean(snapshot.sourceBoundary), 'Snapshot missing sourceBoundary.');

const machine = snapshot.scenarios?.machineGuardingSnapshot;
const uncertain = snapshot.scenarios?.uncertainSnapshot;

assert(machine?.engine === 'safescope_reasoning_orchestrator_v1', 'Machine scenario engine changed.');
assert(machine?.mode === 'deterministic_test_only_advisory', 'Machine scenario mode changed.');
assert(machine?.productionReasoningModified === false, 'Machine scenario must not modify production reasoning.');
assert(machine?.jurisdictionAssessment?.likelyJurisdiction === 'msha', 'Machine scenario should assess likely MSHA jurisdiction.');
assert(machine?.hazardClassification?.primaryDomain === 'machine_guarding', 'Machine scenario should classify machine guarding.');
assert(machine?.approvedKnowledgeContext?.enabled === false, 'Approved context must be disabled by default.');
assert(Array.isArray(machine?.approvedKnowledgeContext?.references), 'Approved context references must be an array.');
assert(machine.approvedKnowledgeContext.references.length === 0, 'Disabled approved context must not return references.');
assert(machine?.applicabilityAnalysis?.engine === 'safescope_applicability_analysis_v1', 'Machine scenario must embed applicability analysis.');
assert(machine?.correctiveActionReasoning?.engine === 'safescope_corrective_action_reasoning_v1', 'Machine scenario must embed corrective action reasoning.');
assert(machine?.correctiveActionReasoning?.reasoningBoundary?.doesNotDeclareViolation === true, 'Machine corrective reasoning must not declare violations.');
assert(machine?.correctiveActionReasoning?.reasoningBoundary?.doesNotGuaranteeAbatement === true, 'Machine corrective reasoning must not guarantee abatement.');
assert(machine?.correctiveActionReasoning?.reasoningBoundary?.requiresQualifiedReview === true, 'Machine corrective reasoning must require qualified review.');
assert(machine?.correctiveActionReasoning?.summary?.totalRecommendations >= 1, 'Machine corrective reasoning must include recommendations.');
assert(machine?.conclusionBoundary?.advisoryOnly === true, 'Machine scenario must be advisory only.');
assert(machine?.conclusionBoundary?.doesNotDeclareViolation === true, 'Machine scenario must not declare violations.');
assert(machine?.conclusionBoundary?.doesNotCreateCitation === true, 'Machine scenario must not create citations.');
assert(machine?.conclusionBoundary?.requiresQualifiedReview === true, 'Machine scenario must require qualified review.');

assert(uncertain?.engine === 'safescope_reasoning_orchestrator_v1', 'Uncertain scenario engine changed.');
assert(uncertain?.mode === 'deterministic_test_only_advisory', 'Uncertain scenario mode changed.');
assert(uncertain?.productionReasoningModified === false, 'Uncertain scenario must not modify production reasoning.');
assert(uncertain?.jurisdictionAssessment?.likelyJurisdiction === 'unclear', 'Uncertain scenario should keep jurisdiction unclear.');
assert(uncertain?.hazardClassification?.primaryDomain === 'unknown', 'Uncertain scenario should classify unknown domain.');
assert(uncertain?.confidence?.level === 'low', 'Uncertain scenario should remain low confidence.');
assert(uncertain?.approvedKnowledgeContext?.enabled === false, 'Uncertain approved context must be disabled by default.');
assert(uncertain?.applicabilityAnalysis?.engine === 'safescope_applicability_analysis_v1', 'Uncertain scenario must embed applicability analysis.');
assert(uncertain?.correctiveActionReasoning?.engine === 'safescope_corrective_action_reasoning_v1', 'Uncertain scenario must embed corrective action reasoning.');
assert(uncertain?.correctiveActionReasoning?.reasoningBoundary?.doesNotDeclareViolation === true, 'Uncertain corrective reasoning must not declare violations.');
assert(uncertain?.correctiveActionReasoning?.reasoningBoundary?.doesNotGuaranteeAbatement === true, 'Uncertain corrective reasoning must not guarantee abatement.');
assert(uncertain?.correctiveActionReasoning?.reasoningBoundary?.requiresQualifiedReview === true, 'Uncertain corrective reasoning must require qualified review.');
assert(uncertain?.correctiveActionReasoning?.summary?.verificationCount >= 1, 'Uncertain corrective reasoning must include verification recommendation.');
assert(uncertain?.conclusionBoundary?.advisoryOnly === true, 'Uncertain scenario must be advisory only.');
assert(uncertain?.conclusionBoundary?.doesNotDeclareViolation === true, 'Uncertain scenario must not declare violations.');
assert(uncertain?.conclusionBoundary?.doesNotCreateCitation === true, 'Uncertain scenario must not create citations.');
assert(uncertain?.conclusionBoundary?.requiresQualifiedReview === true, 'Uncertain scenario must require qualified review.');

assert(snapshot.contractAssertions?.orchestratorIsAdvisory === true, 'Contract assertion failed: orchestratorIsAdvisory.');
assert(snapshot.contractAssertions?.doesNotDeclareViolations === true, 'Contract assertion failed: doesNotDeclareViolations.');
assert(snapshot.contractAssertions?.doesNotCreateCitations === true, 'Contract assertion failed: doesNotCreateCitations.');
assert(snapshot.contractAssertions?.productionReasoningUnchanged === true, 'Contract assertion failed: productionReasoningUnchanged.');
assert(snapshot.contractAssertions?.approvedContextDisabledByDefault === true, 'Contract assertion failed: approvedContextDisabledByDefault.');
assert(snapshot.contractAssertions?.applicabilityAnalysisEmbedded === true, 'Contract assertion failed: applicabilityAnalysisEmbedded.');
assert(snapshot.contractAssertions?.correctiveActionReasoningEmbedded === true, 'Contract assertion failed: correctiveActionReasoningEmbedded.');
assert(snapshot.contractAssertions?.correctiveActionReasoningProtected === true, 'Contract assertion failed: correctiveActionReasoningProtected.');
assert(snapshot.contractAssertions?.qualifiedReviewRequired === true, 'Contract assertion failed: qualifiedReviewRequired.');

assert(
  String(snapshot.sourceBoundary).includes('does not wire the reasoning orchestrator into production'),
  'Snapshot sourceBoundary must preserve production boundary.',
);

assert(
  String(snapshot.sourceBoundary).includes('declare violations'),
  'Snapshot sourceBoundary must preserve violation boundary.',
);

console.log('✅ SafeScope reasoning orchestrator snapshot validation passed.');
