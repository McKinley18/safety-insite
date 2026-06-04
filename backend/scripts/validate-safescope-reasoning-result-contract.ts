import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(value: unknown, message: string): void {
  assert(typeof value === 'string' && value.length > 0, message);
}

function assertBoolean(value: unknown, message: string): void {
  assert(typeof value === 'boolean', message);
}

function assertArray(value: unknown, message: string): void {
  assert(Array.isArray(value), message);
}

function assertObject(value: unknown, message: string): void {
  assert(Boolean(value) && typeof value === 'object' && !Array.isArray(value), message);
}

const allowedEquipmentReasoningModes = [
  'specific_task_mechanism',
  'specific_with_archetype_support',
  'archetype_fallback',
  'insufficient_equipment_context',
];

const allowedConfidenceLevels = ['low', 'moderate', 'high'];

const service = new SafeScopeReasoningOrchestratorService();

const cases = [
  {
    name: 'specific conveyor mechanism',
    request: {
      hazardObservation: 'Missing guard on conveyor tail pulley with employee access to the nip point.',
      siteType: 'surface aggregate mine',
      taskContext: 'inspection',
      industryContext: 'mining',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: 'conveyor tail pulley',
    },
    expectedMode: 'specific_with_archetype_support',
  },
  {
    name: 'archetype fallback rotating machinery',
    request: {
      hazardObservation: 'Guard removed from rotating coupling during cleanup on unknown plant equipment.',
      siteType: 'aggregate plant',
      taskContext: 'cleanup',
      industryContext: 'mining aggregate',
      employeeExposureKnown: true,
    },
    expectedMode: 'archetype_fallback',
  },
  {
    name: 'insufficient equipment context',
    request: {
      hazardObservation: 'There is a concern in the area.',
      siteType: 'general area',
      industryContext: 'general industry',
    },
    expectedMode: 'insufficient_equipment_context',
  },
];

for (const testCase of cases) {
  const result = service.reason(testCase.request);

  assert(result.engine === 'safescope_reasoning_orchestrator_v1', `${testCase.name}: engine mismatch.`);
  assert(result.mode === 'deterministic_test_only_advisory', `${testCase.name}: mode mismatch.`);
  assert(result.productionReasoningModified === false, `${testCase.name}: productionReasoningModified must be false.`);

  assertObject(result.requestSummary, `${testCase.name}: requestSummary required.`);
  assertString(result.requestSummary.hazardObservation, `${testCase.name}: requestSummary.hazardObservation required.`);

  assertObject(result.jurisdictionAssessment, `${testCase.name}: jurisdictionAssessment required.`);
  assertString(result.jurisdictionAssessment.likelyJurisdiction, `${testCase.name}: jurisdiction required.`);
  assertArray(result.jurisdictionAssessment.reasons, `${testCase.name}: jurisdiction reasons required.`);
  assertBoolean(result.jurisdictionAssessment.requiresHumanConfirmation, `${testCase.name}: jurisdiction human confirmation flag required.`);

  assertObject(result.hazardClassification, `${testCase.name}: hazardClassification required.`);
  assertString(result.hazardClassification.primaryDomain, `${testCase.name}: primaryDomain required.`);
  assertArray(result.hazardClassification.reasons, `${testCase.name}: hazard classification reasons required.`);

  assertObject(result.approvedKnowledgeContext, `${testCase.name}: approvedKnowledgeContext required.`);
  assertBoolean(result.approvedKnowledgeContext.enabled, `${testCase.name}: approvedKnowledgeContext.enabled required.`);
  assertArray(result.approvedKnowledgeContext.references, `${testCase.name}: approvedKnowledgeContext.references required.`);
  assertArray(result.approvedKnowledgeContext.recordsUsed, `${testCase.name}: approvedKnowledgeContext.recordsUsed required.`);

  assertArray(result.applicabilitySignals, `${testCase.name}: applicabilitySignals required.`);
  assert(result.applicabilitySignals.length > 0, `${testCase.name}: applicabilitySignals should not be empty.`);

  assertObject(result.applicabilityAnalysis, `${testCase.name}: applicabilityAnalysis required.`);
  assert(result.applicabilityAnalysis.engine === 'safescope_applicability_analysis_v1', `${testCase.name}: applicability analysis engine mismatch.`);
  assert(result.applicabilityAnalysis.conclusionBoundary.doesNotDeclareViolation === true, `${testCase.name}: applicability must not declare violations.`);
  assert(result.applicabilityAnalysis.conclusionBoundary.doesNotCreateCitation === true, `${testCase.name}: applicability must not create citations.`);

  assertObject(result.correctiveActionReasoning, `${testCase.name}: correctiveActionReasoning required.`);
  assert(result.correctiveActionReasoning.engine === 'safescope_corrective_action_reasoning_v1', `${testCase.name}: corrective reasoning engine mismatch.`);
  assert(result.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation === true, `${testCase.name}: corrective reasoning must not declare violations.`);
  assert(result.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true, `${testCase.name}: corrective reasoning must not guarantee abatement.`);
  assert(result.correctiveActionReasoning.reasoningBoundary.requiresQualifiedReview === true, `${testCase.name}: corrective reasoning must require qualified review.`);

  assertObject(result.equipmentTaskMechanismContext, `${testCase.name}: equipmentTaskMechanismContext required.`);
  assertBoolean(result.equipmentTaskMechanismContext.matched, `${testCase.name}: task mechanism matched flag required.`);
  assertArray(result.equipmentTaskMechanismContext.matches, `${testCase.name}: task mechanism matches required.`);
  assertArray(result.equipmentTaskMechanismContext.evidenceGaps, `${testCase.name}: task mechanism evidence gaps required.`);
  assertArray(result.equipmentTaskMechanismContext.cautions, `${testCase.name}: task mechanism cautions required.`);
  assertArray(result.equipmentTaskMechanismContext.detectorNotes, `${testCase.name}: task mechanism detector notes required.`);

  assertObject(result.equipmentArchetypeContext, `${testCase.name}: equipmentArchetypeContext required.`);
  assertBoolean(result.equipmentArchetypeContext.matched, `${testCase.name}: archetype matched flag required.`);
  assertString(result.equipmentArchetypeContext.reasoningMode, `${testCase.name}: archetype reasoning mode required.`);
  assertArray(result.equipmentArchetypeContext.matches, `${testCase.name}: archetype matches required.`);
  assertArray(result.equipmentArchetypeContext.evidenceGaps, `${testCase.name}: archetype evidence gaps required.`);
  assertArray(result.equipmentArchetypeContext.cautions, `${testCase.name}: archetype cautions required.`);
  assertArray(result.equipmentArchetypeContext.detectorNotes, `${testCase.name}: archetype detector notes required.`);

  assertObject(result.equipmentReasoningSummary, `${testCase.name}: equipmentReasoningSummary required.`);
  assert(
    allowedEquipmentReasoningModes.includes(result.equipmentReasoningSummary.primaryReasoningMode),
    `${testCase.name}: unsupported equipment reasoning mode.`,
  );
  assert(
    result.equipmentReasoningSummary.primaryReasoningMode === testCase.expectedMode,
    `${testCase.name}: expected mode ${testCase.expectedMode}, got ${result.equipmentReasoningSummary.primaryReasoningMode}.`,
  );
  assertString(result.equipmentReasoningSummary.primaryEquipmentContext, `${testCase.name}: primary equipment context required.`);
  assertString(result.equipmentReasoningSummary.primaryMechanismOrArchetype, `${testCase.name}: primary mechanism/archetype required.`);
  assertArray(result.equipmentReasoningSummary.supportingContext, `${testCase.name}: supporting context required.`);
  assertArray(result.equipmentReasoningSummary.rankingReasons, `${testCase.name}: ranking reasons required.`);
  assert(result.equipmentReasoningSummary.rankingReasons.length > 0, `${testCase.name}: ranking reasons should not be empty.`);
  assertArray(result.equipmentReasoningSummary.evidenceGaps, `${testCase.name}: summary evidence gaps required.`);
  assertArray(result.equipmentReasoningSummary.cautions, `${testCase.name}: summary cautions required.`);
  assert(result.equipmentReasoningSummary.guardrails.contextOnly === true, `${testCase.name}: summary must be context-only.`);
  assert(result.equipmentReasoningSummary.guardrails.advisoryOnly === true, `${testCase.name}: summary must be advisory-only.`);
  assert(result.equipmentReasoningSummary.guardrails.doesNotDeclareViolation === true, `${testCase.name}: summary must not declare violations.`);
  assert(result.equipmentReasoningSummary.guardrails.doesNotCreateCitation === true, `${testCase.name}: summary must not create citations.`);
  assert(result.equipmentReasoningSummary.guardrails.doesNotOverrideRegulation === true, `${testCase.name}: summary must not override regulation.`);
  assert(result.equipmentReasoningSummary.guardrails.requiresQualifiedReview === true, `${testCase.name}: summary must require qualified review.`);

  assertArray(result.missingEvidence, `${testCase.name}: missingEvidence required.`);

  assertObject(result.confidence, `${testCase.name}: confidence required.`);
  assert(allowedConfidenceLevels.includes(result.confidence.level), `${testCase.name}: confidence level unsupported.`);
  assertArray(result.confidence.reasons, `${testCase.name}: confidence reasons required.`);

  assertObject(result.conclusionBoundary, `${testCase.name}: conclusionBoundary required.`);
  assert(result.conclusionBoundary.advisoryOnly === true, `${testCase.name}: result must be advisory-only.`);
  assert(result.conclusionBoundary.doesNotDeclareViolation === true, `${testCase.name}: result must not declare violations.`);
  assert(result.conclusionBoundary.doesNotCreateCitation === true, `${testCase.name}: result must not create citations.`);
  assert(result.conclusionBoundary.requiresQualifiedReview === true, `${testCase.name}: result must require qualified review.`);

  assertArray(result.recommendedNextQuestions, `${testCase.name}: recommendedNextQuestions required.`);

  console.log(`✅ ${testCase.name}: contract mode ${result.equipmentReasoningSummary.primaryReasoningMode}`);
}

console.log('✅ SafeScope reasoning result contract validation passed.');
