import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const service = new SafeScopeReasoningOrchestratorService();

const result = service.reason({
  hazardObservation: 'Unguarded conveyor tail pulley with employee access during cleanup.',
  siteType: 'surface aggregate mine',
  taskContext: 'workplace inspection',
  industryContext: 'mining',
  photosAvailable: true,
  employeeExposureKnown: true,
  equipmentInvolved: 'conveyor tail pulley',
});

assert(result.engine === 'safescope_reasoning_orchestrator_v1', 'Unexpected reasoning engine.');
assert(result.mode === 'deterministic_test_only_advisory', 'Unexpected reasoning mode.');
assert(result.productionReasoningModified === false, 'Reasoning orchestrator must not modify production reasoning.');

assert(result.jurisdictionAssessment.likelyJurisdiction === 'msha', 'Expected MSHA jurisdiction assessment.');
assert(result.jurisdictionAssessment.requiresHumanConfirmation === true, 'Jurisdiction should require human confirmation.');
assert(result.hazardClassification.primaryDomain === 'machine_guarding', 'Expected machine_guarding classification.');

assert(result.approvedKnowledgeContext.enabled === false, 'Approved knowledge context must be disabled by default.');
assert(result.approvedKnowledgeContext.references.length === 0, 'Disabled approved context must not return references.');
assert(result.approvedKnowledgeContext.recordsUsed.length === 0, 'Disabled approved context must not return records.');

assert(result.applicabilitySignals.some((signal) => signal.signal === 'hazard-domain-detected' && signal.matched), 'Expected matched hazard-domain signal.');
assert(result.applicabilitySignals.some((signal) => signal.signal === 'employee-exposure-known' && signal.matched), 'Expected employee exposure signal.');
assert(result.applicabilityAnalysis.engine === 'safescope_applicability_analysis_v1', 'Expected embedded applicability analysis.');
assert(result.applicabilityAnalysis.recordAnalyses.length === 0, 'Disabled approved context should produce no embedded record analyses.');
assert(result.applicabilityAnalysis.conclusionBoundary.doesNotDeclareViolation === true, 'Embedded applicability analysis must not declare violations.');
assert(result.applicabilityAnalysis.conclusionBoundary.doesNotCreateCitation === true, 'Embedded applicability analysis must not create citations.');
assert(result.correctiveActionReasoning.engine === 'safescope_corrective_action_reasoning_v1', 'Expected embedded corrective action reasoning.');
assert(result.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation === true, 'Embedded corrective reasoning must not declare violations.');
assert(result.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true, 'Embedded corrective reasoning must not guarantee abatement.');
assert(result.correctiveActionReasoning.reasoningBoundary.requiresQualifiedReview === true, 'Embedded corrective reasoning must require qualified review.');
assert(result.correctiveActionReasoning.summary.totalRecommendations >= 1, 'Expected at least one corrective action recommendation.');
assert(result.missingEvidence.every((gap) => gap.field !== 'hazardObservation'), 'Hazard observation should not be missing.');

assert(result.conclusionBoundary.advisoryOnly === true, 'Result must be advisory only.');
assert(result.conclusionBoundary.doesNotDeclareViolation === true, 'Result must not declare violations.');
assert(result.conclusionBoundary.doesNotCreateCitation === true, 'Result must not create citations.');
assert(result.conclusionBoundary.requiresQualifiedReview === true, 'Result must require qualified review.');

const uncertain = service.reason({
  hazardObservation: 'Possible issue observed.',
});

assert(uncertain.jurisdictionAssessment.likelyJurisdiction === 'unclear', 'Expected unclear jurisdiction for vague input.');
assert(uncertain.hazardClassification.primaryDomain === 'unknown', 'Expected unknown domain for vague input.');
assert(uncertain.confidence.level === 'low', 'Expected low confidence for vague input.');
assert(uncertain.missingEvidence.length >= 2, 'Expected missing evidence for vague input.');
assert(uncertain.correctiveActionReasoning.summary.verificationCount >= 1, 'Expected verification recommendation for vague input.');
assert(
  uncertain.correctiveActionReasoning.recommendations.some((item) => item.action.toLowerCase().includes('additional facts')),
  'Expected additional facts recommendation for vague input.',
);
assert(uncertain.recommendedNextQuestions.length >= 1, 'Expected recommended next questions.');

const enabledContext = service.reason({
  hazardObservation: 'Unguarded conveyor tail pulley with employee access during cleanup.',
  siteType: 'surface aggregate mine',
  taskContext: 'workplace inspection',
  industryContext: 'mining',
  photosAvailable: true,
  employeeExposureKnown: true,
  equipmentInvolved: 'conveyor tail pulley',
  enableApprovedKnowledgeContext: true,
});

assert(enabledContext.approvedKnowledgeContext.enabled === true, 'Explicit approved context enablement should be reflected.');
assert(enabledContext.approvedKnowledgeContext.adapterUseBoundary.canModifyNativeReasoning === false, 'Approved context must not modify native reasoning.');
assert(enabledContext.applicabilityAnalysis.engine === 'safescope_applicability_analysis_v1', 'Enabled context should include applicability analysis.');
assert(enabledContext.applicabilityAnalysis.conclusionBoundary.doesNotDeclareViolation === true, 'Enabled embedded applicability must not declare violations.');
assert(enabledContext.applicabilityAnalysis.conclusionBoundary.doesNotCreateCitation === true, 'Enabled embedded applicability must not create citations.');
assert(enabledContext.correctiveActionReasoning.engine === 'safescope_corrective_action_reasoning_v1', 'Enabled context should include corrective action reasoning.');
assert(enabledContext.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation === true, 'Enabled embedded corrective reasoning must not declare violations.');
assert(enabledContext.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true, 'Enabled embedded corrective reasoning must not guarantee abatement.');
assert(enabledContext.conclusionBoundary.doesNotDeclareViolation === true, 'Enabled context result still must not declare violations.');
assert(enabledContext.conclusionBoundary.doesNotCreateCitation === true, 'Enabled context result still must not create citations.');

console.log('✅ SafeScope reasoning orchestrator validation passed.');
