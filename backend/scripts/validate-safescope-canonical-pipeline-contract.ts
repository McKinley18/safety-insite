import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(textOf).join(' ');
  return String(value);
}

function assertNonEmptyString(value: unknown, message: string) {
  assert(typeof value === 'string' && value.trim().length > 0, message);
}

function assertArray(value: unknown, message: string) {
  assert(Array.isArray(value), message);
}

function assertObject(value: unknown, message: string) {
  assert(Boolean(value) && typeof value === 'object' && !Array.isArray(value), message);
}

const service = new SafeScopeReasoningOrchestratorService();

type CanonicalPipelineCase = {
  id: string;
  hazardObservation: string;
  siteType: string;
  industryContext: string;
  taskContext: string;
  equipmentInvolved: string;
  expectedTerms: string[];
};

const cases: CanonicalPipelineCase[] = [
  {
    id: 'PIPELINE-MSHA-GUARDING-001',
    hazardObservation: 'Conveyor tail pulley guard missing while miners clean spillage near the nip point.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'cleanup inspection',
    equipmentInvolved: 'conveyor tail pulley',
    expectedTerms: ['guard', 'pulley'],
  },
  {
    id: 'PIPELINE-OSHA-FORKLIFT-001',
    hazardObservation: 'Forklift operating near pedestrians at warehouse doorway with no separation or spotter.',
    siteType: 'warehouse',
    industryContext: 'osha general industry',
    taskContext: 'mobile equipment operation',
    equipmentInvolved: 'forklift',
    expectedTerms: ['forklift', 'pedestrian'],
  },
  {
    id: 'PIPELINE-SILICA-001',
    hazardObservation: 'Contractor dry cutting concrete with visible dust cloud and no vacuum or water suppression.',
    siteType: 'construction site',
    industryContext: 'osha construction',
    taskContext: 'concrete cutting',
    equipmentInvolved: 'concrete saw',
    expectedTerms: ['dust', 'silica'],
  },
  {
    id: 'PIPELINE-LOTO-001',
    hazardObservation: 'Crew clearing jam from belt with breaker off but no lock, tag, or zero-energy verification visible.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'jam clearing maintenance',
    equipmentInvolved: 'belt conveyor',
    expectedTerms: ['lock', 'energy'],
  },
  {
    id: 'PIPELINE-MULTI-GUARD-LOTO-001',
    hazardObservation: 'Belt tail pulley guard missing during cleanup, belt was supposed to be off but no lock or tag was visible and miners were near the pinch point.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'cleanup and jam clearing',
    equipmentInvolved: 'belt conveyor tail pulley',
    expectedTerms: ['guard', 'lock', 'energy', 'exposure'],
  },
  {
    id: 'PIPELINE-MOBILE-VISIBILITY-001',
    hazardObservation: 'Loader backing near shop doorway while employees walk through the same travel path, no cones, no spotter, and mirror was dirty.',
    siteType: 'surface mine shop area',
    industryContext: 'mining aggregate',
    taskContext: 'mobile equipment operation',
    equipmentInvolved: 'front end loader',
    expectedTerms: ['mobile', 'pedestrian', 'traffic', 'separation'],
  },
  {
    id: 'PIPELINE-ELECTRICAL-WET-001',
    hazardObservation: 'Electrical cabinet door open by crusher MCC with wires visible, wet floor nearby from hose leak, and no barricade.',
    siteType: 'surface aggregate plant',
    industryContext: 'mining aggregate',
    taskContext: 'electrical inspection',
    equipmentInvolved: 'crusher MCC electrical cabinet',
    expectedTerms: ['electrical', 'energized', 'restrict', 'verify'],
  },
  {
    id: 'PIPELINE-HAZCOM-UNKNOWN-CONTAINER-001',
    hazardObservation: 'Unmarked five gallon pail leaking clear liquid under parts washer, no label, no SDS found, employees stepped around it.',
    siteType: 'maintenance shop',
    industryContext: 'osha general industry',
    taskContext: 'chemical storage inspection',
    equipmentInvolved: 'parts washer chemical container',
    expectedTerms: ['chemical', 'label', 'sds', 'leak'],
  },
  {
    id: 'PIPELINE-FALL-INCOMPLETE-001',
    hazardObservation: 'Worker near edge on elevated platform, rail missing on one side, height unknown and no fall protection visible from photo.',
    siteType: 'industrial work platform',
    industryContext: 'osha general industry',
    taskContext: 'elevated work inspection',
    equipmentInvolved: 'elevated work platform',
    expectedTerms: ['fall', 'rail', 'height', 'protection'],
  },
  {
    id: 'PIPELINE-CONFINED-INCOMPLETE-001',
    hazardObservation: 'Employee reached into tank opening to pull hose, head and shoulders inside, no meter reading or entry permit seen.',
    siteType: 'industrial facility',
    industryContext: 'osha general industry',
    taskContext: 'tank entry observation',
    equipmentInvolved: 'tank vessel',
    expectedTerms: ['confined', 'entry', 'atmosphere', 'permit'],
  },
];

async function main() {
  const failures: string[] = [];

  for (const testCase of cases) {
    if (!testCase) continue;

    try {
      const result: any = service.reason({
        hazardObservation: testCase.hazardObservation,
        siteType: testCase.siteType,
        taskContext: testCase.taskContext,
        industryContext: testCase.industryContext,
        equipmentInvolved: testCase.equipmentInvolved,
        photosAvailable: true,
        employeeExposureKnown: true,
        enableApprovedKnowledgeContext: true,
      });

      assert(result, `${testCase.id}: result is missing.`);
      assert(result.engine === 'safescope_reasoning_orchestrator_v1', `${testCase.id}: engine mismatch.`);
      assert(result.productionReasoningModified === false, `${testCase.id}: productionReasoningModified must be false.`);

      assertObject(result.requestSummary, `${testCase.id}: requestSummary missing.`);
      assertNonEmptyString(result.requestSummary.hazardObservation, `${testCase.id}: hazardObservation missing.`);

      assertObject(result.hazardClassification, `${testCase.id}: hazardClassification missing.`);
      assertNonEmptyString(result.hazardClassification.primaryDomain, `${testCase.id}: primaryDomain missing.`);

      assertObject(result.jurisdictionAssessment, `${testCase.id}: jurisdictionAssessment missing.`);
      assertNonEmptyString(result.jurisdictionAssessment.likelyJurisdiction, `${testCase.id}: likelyJurisdiction missing.`);

      assertArray(result.applicabilitySignals, `${testCase.id}: applicabilitySignals must be an array.`);
      assertObject(result.applicabilityAnalysis, `${testCase.id}: applicabilityAnalysis missing.`);
      assert(result.applicabilityAnalysis.conclusionBoundary?.doesNotDeclareViolation === true, `${testCase.id}: applicability must not declare violations.`);
      assert(result.applicabilityAnalysis.conclusionBoundary?.doesNotCreateCitation === true, `${testCase.id}: applicability must not create citations.`);

      assertObject(result.correctiveActionReasoning, `${testCase.id}: correctiveActionReasoning missing.`);
      assert(result.correctiveActionReasoning.reasoningBoundary?.requiresQualifiedReview === true, `${testCase.id}: corrective action reasoning must require qualified review.`);
      assert(result.correctiveActionReasoning.reasoningBoundary?.doesNotDeclareViolation === true, `${testCase.id}: corrective action reasoning must not declare violations.`);

      assertObject(result.equipmentTaskMechanismContext, `${testCase.id}: equipmentTaskMechanismContext missing.`);
      assertObject(result.equipmentArchetypeContext, `${testCase.id}: equipmentArchetypeContext missing.`);
      assertObject(result.equipmentReasoningSummary, `${testCase.id}: equipmentReasoningSummary missing.`);
      assertArray(result.equipmentReasoningSummary.evidenceGaps, `${testCase.id}: equipment evidenceGaps missing.`);

      assertObject(result.brainSnapshot, `${testCase.id}: brainSnapshot missing.`);
      assertObject(result.brainSnapshot.situationalAwarenessPacket, `${testCase.id}: situationalAwarenessPacket missing.`);

      assertArray(result.missingEvidence, `${testCase.id}: missingEvidence must be an array.`);
      assertObject(result.confidence, `${testCase.id}: confidence missing.`);
      assertNonEmptyString(result.confidence.level, `${testCase.id}: confidence.level missing.`);
      assertArray(result.recommendedNextQuestions, `${testCase.id}: recommendedNextQuestions must be an array.`);

      const combined = textOf({
        requestSummary: result.requestSummary,
        jurisdictionAssessment: result.jurisdictionAssessment,
        hazardClassification: result.hazardClassification,
        applicabilitySignals: result.applicabilitySignals,
        applicabilityAnalysis: result.applicabilityAnalysis,
        correctiveActionReasoning: result.correctiveActionReasoning,
        equipmentTaskMechanismContext: result.equipmentTaskMechanismContext,
        equipmentArchetypeContext: result.equipmentArchetypeContext,
        equipmentReasoningSummary: result.equipmentReasoningSummary,
        brainSnapshot: result.brainSnapshot,
        missingEvidence: result.missingEvidence,
        confidence: result.confidence,
        recommendedNextQuestions: result.recommendedNextQuestions,
      }).toLowerCase();

      const missingTerms = testCase.expectedTerms.filter(
        (term) => !combined.includes(term.toLowerCase()),
      );

      assert(
        missingTerms.length === 0,
        `${testCase.id}: missing expected connected pipeline term(s): ${missingTerms.join(', ')}`,
      );

      console.log(
        `✅ ${testCase.id}: ${result.hazardClassification.primaryDomain} | ${result.jurisdictionAssessment.likelyJurisdiction} | ${result.confidence.level}`,
      );
    } catch (error) {
      failures.push(`${testCase.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length) {
    throw new Error(failures.join('\n'));
  }

  console.log('✅ SafeScope canonical pipeline contract validation passed.');
  console.log(`Cases: ${cases.length}`);
}

main().catch((error) => {
  console.error('❌ SafeScope canonical pipeline contract validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
