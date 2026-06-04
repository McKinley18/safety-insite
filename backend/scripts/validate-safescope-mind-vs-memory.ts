import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function textOf(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(textOf).join(' ');
  return String(value);
}

function generatedDecisionText(result: any): string {
  return textOf({
    hazardClassification: result.hazardClassification,
    jurisdictionAssessment: result.jurisdictionAssessment,
    applicabilitySignals: result.applicabilitySignals,
    applicabilityAnalysisSummary: result.applicabilityAnalysis?.summary,
    applicabilityConclusionBoundary: result.applicabilityAnalysis?.conclusionBoundary,
    correctiveActionReasoningSummary: result.correctiveActionReasoning?.summary,
    correctiveActionRecommendations: result.correctiveActionReasoning?.recommendations,
    correctiveActionReasoningBoundary: result.correctiveActionReasoning?.reasoningBoundary,
    equipmentReasoningSummary: result.equipmentReasoningSummary,
    missingEvidence: result.missingEvidence,
    confidence: result.confidence,
    recommendedNextQuestions: result.recommendedNextQuestions,
    brainSummary: result.brainSnapshot?.situationalAwarenessPacket?.summary,
    brainAlignment: result.brainSnapshot?.alignment,
    brainBoundary: result.brainSnapshot?.boundary,
  }).toLowerCase();
}

type MindVsMemoryCase = {
  id: string;
  title: string;
  hazardObservation: string;
  siteType: string;
  industryContext: string;
  taskContext: string;
  equipmentInvolved: string;
  photosAvailable: boolean;
  employeeExposureKnown: boolean;
  expectedTerms: string[];
  forbiddenTerms?: string[];
  shouldHaveMissingEvidence?: boolean;
};

const cases: MindVsMemoryCase[] = [
  {
    id: 'MIND-NOVEL-GUARDING-JOG-001',
    title: 'novel conveyor jogging nip-point exposure',
    hazardObservation:
      'A miner was brushing material from a return roller while the belt was being jogged intermittently. No fixed guard was in place and the start control was around the corner.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'cleanup while belt is jogged',
    equipmentInvolved: 'belt conveyor return roller',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['guard', 'roller', 'energy', 'exposure'],
  },
  {
    id: 'MIND-MULTI-ELECTRICAL-WET-001',
    title: 'wet floor plus open electrical cabinet',
    hazardObservation:
      'Electrical cabinet door was open near the crusher MCC. Wires were visible, water from a leaking hose was running across the floor, and employees walked through the area.',
    siteType: 'surface aggregate plant',
    industryContext: 'mining aggregate',
    taskContext: 'plant inspection',
    equipmentInvolved: 'crusher MCC electrical cabinet',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['electrical', 'water', 'restrict', 'exposure'],
  },
  {
    id: 'MIND-FALSE-HOTWORK-001',
    title: 'negative control should not route as hot work',
    hazardObservation:
      'No welding, cutting, brazing, or grinding was occurring. The issue was unlabeled solvent containers stored near the wash bay with no SDS available.',
    siteType: 'maintenance shop',
    industryContext: 'osha general industry',
    taskContext: 'chemical storage inspection',
    equipmentInvolved: 'solvent containers',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['chemical', 'label', 'sds'],
    forbiddenTerms: ['hot work', 'welding correction'],
  },
  {
    id: 'MIND-FALSE-SILICA-DUST-001',
    title: 'dusty observation should not force silica without task support',
    hazardObservation:
      'The floor was dusty near the shipping office from tracked-in dirt. No cutting, drilling, grinding, crushing, or silica-containing material disturbance was observed.',
    siteType: 'warehouse office area',
    industryContext: 'osha general industry',
    taskContext: 'housekeeping inspection',
    equipmentInvolved: 'walking surface',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['dust', 'housekeeping'],
    forbiddenTerms: ['silica standard', 'respirable crystalline silica'],
  },
  {
    id: 'MIND-INCOMPLETE-FALL-001',
    title: 'fall exposure with missing height evidence',
    hazardObservation:
      'Worker was near an unprotected edge on an elevated platform. The photo does not show the platform height and no fall protection is visible.',
    siteType: 'industrial facility',
    industryContext: 'osha general industry',
    taskContext: 'elevated work observation',
    equipmentInvolved: 'work platform',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['fall', 'edge', 'height', 'protection'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-INCOMPLETE-CONFINED-001',
    title: 'partial tank entry with missing atmospheric evidence',
    hazardObservation:
      'Employee had head and shoulders inside a tank opening while pulling a hose. No atmospheric meter, attendant, retrieval setup, or entry permit was visible.',
    siteType: 'industrial facility',
    industryContext: 'osha general industry',
    taskContext: 'tank cleaning observation',
    equipmentInvolved: 'tank vessel',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['confined', 'entry', 'atmosphere', 'permit'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-FALSE-HOTWORK-FIRE-HOUSEKEEPING-001',
    title: 'hot work negated but fire housekeeping issue present',
    hazardObservation:
      'No hot work, welding, torch cutting, or grinding was taking place. The issue was oily rags and cardboard stored next to a space heater.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'maintenance shop inspection',
    equipmentInvolved: 'space heater and combustible storage',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['fire', 'combustible', 'storage'],
    forbiddenTerms: ['hot work correction', 'welding correction'],
  },
  {
    id: 'MIND-WET-FLOOR-ELECTRICAL-UNCERTAIN-001',
    title: 'wet floor near electrical equipment with uncertainty',
    hazardObservation:
      'Standing water was observed near an electrical disconnect cabinet. The door was closed, but employees walk through the area and the source of water was unknown.',
    siteType: 'surface aggregate plant',
    industryContext: 'mining aggregate',
    taskContext: 'plant housekeeping inspection',
    equipmentInvolved: 'electrical disconnect cabinet',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['water', 'electrical', 'verify', 'restrict'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-PPE-GRINDING-NO-TOOL-DEFECT-001',
    title: 'PPE missing during grinding should not become tool defect',
    hazardObservation:
      'Employee was grinding metal without safety glasses or a face shield. The grinder appeared intact and no missing wheel guard or tool defect was observed.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'grinding task observation',
    equipmentInvolved: 'handheld grinder',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['ppe', 'eye', 'face', 'protection'],
    forbiddenTerms: ['remove defective tool', 'missing guard correction'],
  },
  {
    id: 'MIND-GRINDER-MISSING-GUARD-001',
    title: 'grinder missing guard should route to tool guarding',
    hazardObservation:
      'A handheld grinder was being used with the abrasive wheel guard removed. Eye protection was available and the issue was the missing grinder guard.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'grinding task observation',
    equipmentInvolved: 'handheld grinder',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['grinder', 'guard', 'tool'],
  },
  {
    id: 'MIND-FALSE-CONFINED-NO-ENTRY-001',
    title: 'confined space language without actual entry',
    hazardObservation:
      'A tank was labeled as a confined space, but no employee entry occurred. The observation was that the warning sign was faded and the access area needed review.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'area inspection',
    equipmentInvolved: 'tank access point',
    photosAvailable: true,
    employeeExposureKnown: false,
    expectedTerms: ['review', 'evidence', 'entry'],
    forbiddenTerms: ['active entry violation', 'permit required entry occurred'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-FALSE-LOTO-TRAINING-ONLY-001',
    title: 'LOTO mentioned in training context without active exposure',
    hazardObservation:
      'The supervisor was discussing lockout tagout training records. No maintenance or servicing was occurring and no equipment was exposed to unexpected startup.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'training record review',
    equipmentInvolved: 'training records',
    photosAvailable: false,
    employeeExposureKnown: false,
    expectedTerms: ['training', 'review', 'records'],
    forbiddenTerms: ['unexpected startup exposure', 'zero energy correction'],
  },
  {
    id: 'MIND-MULTI-GUARD-LOTO-AMBIGUITY-001',
    title: 'machine guarding plus LOTO ambiguity',
    hazardObservation:
      'Conveyor tail pulley guard was missing while mechanics were preparing to clean around the belt. The belt status and lockout condition were not clear.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'cleanup and maintenance preparation',
    equipmentInvolved: 'belt conveyor tail pulley',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['guard', 'conveyor', 'lockout', 'verify'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-MOBILE-BACKING-PEDESTRIAN-001',
    title: 'mobile equipment backing with pedestrian exposure',
    hazardObservation:
      'Loader was backing through the stockpile area while a ground worker walked behind it. No spotter or pedestrian separation was visible.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'mobile equipment operation',
    equipmentInvolved: 'front end loader',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['mobile', 'pedestrian', 'separation', 'restrict'],
  },
  {
    id: 'MIND-FALSE-MOBILE-NO-PEDESTRIAN-001',
    title: 'mobile equipment present without pedestrian exposure',
    hazardObservation:
      'A parked loader was observed in the yard with no operator, no travel, and no employees on foot nearby. The inspection note only requested routine equipment staging review.',
    siteType: 'surface aggregate mine',
    industryContext: 'mining aggregate',
    taskContext: 'yard inspection',
    equipmentInvolved: 'parked loader',
    photosAvailable: true,
    employeeExposureKnown: false,
    expectedTerms: ['review', 'verify', 'equipment'],
    forbiddenTerms: ['pedestrian strike correction', 'active backing exposure'],
  },
  {
    id: 'MIND-HAZCOM-UNLABELED-SDS-001',
    title: 'unlabeled chemical container with SDS missing',
    hazardObservation:
      'An unlabeled secondary container of solvent was found on a bench. Employees use the solvent and no SDS was available at the work area.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'chemical use inspection',
    equipmentInvolved: 'secondary solvent container',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['chemical', 'label', 'sds'],
  },
  {
    id: 'MIND-CHEMICAL-INCOMPATIBLE-STORAGE-001',
    title: 'chemical storage incompatible materials',
    hazardObservation:
      'Acid and alkaline cleaning chemicals were stored together on the same shelf with no segregation or secondary containment information available.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'chemical storage inspection',
    equipmentInvolved: 'chemical storage shelf',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['chemical', 'segregate', 'storage'],
  },
  {
    id: 'MIND-FIRE-EXTINGUISHER-BLOCKED-NO-HOTWORK-001',
    title: 'blocked fire extinguisher without hot work',
    hazardObservation:
      'A fire extinguisher was blocked by pallets in the warehouse aisle. No welding, cutting, grinding, or other hot work was occurring.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'warehouse inspection',
    equipmentInvolved: 'fire extinguisher',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['fire', 'extinguisher', 'access'],
    forbiddenTerms: ['hot work', 'welding correction'],
  },
  {
    id: 'MIND-COMPRESSED-GAS-UNSECURED-001',
    title: 'compressed gas cylinders not secured',
    hazardObservation:
      'Compressed gas cylinders were standing upright near the maintenance bay without chains, straps, or other restraint.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'compressed gas storage inspection',
    equipmentInvolved: 'compressed gas cylinders',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['cylinder', 'secure', 'restraint'],
  },
  {
    id: 'MIND-OXY-FUEL-GAS-SEPARATION-001',
    title: 'oxygen and fuel gas cylinders stored together',
    hazardObservation:
      'Oxygen cylinders and acetylene cylinders were stored together with no separation distance or noncombustible barrier documented.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'welding cylinder storage inspection',
    equipmentInvolved: 'oxygen and acetylene cylinders',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['oxygen', 'fuel', 'cylinder', 'separation'],
  },
  {
    id: 'MIND-FALSE-ELEVATED-PLATFORM-NO-EXPOSURE-001',
    title: 'elevated platform with no employee exposure',
    hazardObservation:
      'An elevated platform was photographed from the ground. No employee was on or near the platform, and the note did not identify height, edge exposure, or missing fall protection.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'area inspection',
    equipmentInvolved: 'elevated platform',
    photosAvailable: true,
    employeeExposureKnown: false,
    expectedTerms: ['height', 'verify', 'evidence'],
    forbiddenTerms: ['active fall exposure confirmed'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-SUSPENDED-LOAD-FALL-ZONE-001',
    title: 'suspended load with worker in fall zone',
    hazardObservation:
      'A suspended load was being moved by crane while an employee stood inside the fall zone under the load path.',
    siteType: 'construction site',
    industryContext: 'construction',
    taskContext: 'crane lift observation',
    equipmentInvolved: 'crane and suspended load',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['suspended', 'load', 'fall zone', 'restrict'],
  },
  {
    id: 'MIND-RIGGING-DEFECT-NO-SUSPENDED-LOAD-001',
    title: 'rigging defect without suspended-load exposure',
    hazardObservation:
      'A synthetic sling had visible cuts and missing identification during pre-use inspection. No load was suspended and no employee was under a load.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'rigging pre-use inspection',
    equipmentInvolved: 'synthetic sling',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['sling', 'rigging', 'remove', 'inspection'],
    forbiddenTerms: ['employee under suspended load', 'active suspended load exposure'],
  },
  {
    id: 'MIND-NOISE-NO-DOSIMETRY-001',
    title: 'noise observation without dosimetry',
    hazardObservation:
      'Employees reported loud noise near the compressor room. No sound level readings, dosimetry, exposure duration, or hearing conservation review were available.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'noise complaint inspection',
    equipmentInvolved: 'compressor room',
    photosAvailable: false,
    employeeExposureKnown: true,
    expectedTerms: ['noise', 'dosimetry', 'hearing', 'verify'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-HEAT-STRESS-MISSING-WBGT-001',
    title: 'heat stress with missing WBGT and exposure duration',
    hazardObservation:
      'Employees were working outdoors in high heat. The WBGT, heat index, workload, acclimatization status, and exposure duration were not documented.',
    siteType: 'construction site',
    industryContext: 'construction',
    taskContext: 'outdoor work observation',
    equipmentInvolved: 'outdoor work crew',
    photosAvailable: false,
    employeeExposureKnown: true,
    expectedTerms: ['heat', 'hydration', 'wbgt', 'duration'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-COLD-STRESS-MISSING-DURATION-001',
    title: 'cold stress with missing exposure duration',
    hazardObservation:
      'Employees were working outside in freezing conditions. Exposure duration, wind chill, warming breaks, glove condition, and wet clothing status were not documented.',
    siteType: 'surface mine',
    industryContext: 'mining aggregate',
    taskContext: 'outdoor winter work observation',
    equipmentInvolved: 'outdoor work crew',
    photosAvailable: false,
    employeeExposureKnown: true,
    expectedTerms: ['cold', 'warming', 'duration', 'verify'],
    shouldHaveMissingEvidence: true,
  },
  {
    id: 'MIND-HOUSEKEEPING-TRIP-001',
    title: 'housekeeping trip hazard',
    hazardObservation:
      'Loose hoses and scrap material were lying across the pedestrian walkway to the parts room, creating a clear trip hazard.',
    siteType: 'general industry facility',
    industryContext: 'osha general industry',
    taskContext: 'walkway inspection',
    equipmentInvolved: 'walkway and stored materials',
    photosAvailable: true,
    employeeExposureKnown: true,
    expectedTerms: ['trip', 'walkway', 'housekeeping', 'remove'],
  },
  {
    id: 'MIND-UNKNOWN-VAGUE-HOLD-001',
    title: 'unknown vague observation should hold for evidence',
    hazardObservation:
      'The area looked unsafe and employees may have been exposed, but the note did not describe the task, equipment, condition, location, or hazard mechanism.',
    siteType: 'unknown',
    industryContext: 'unknown',
    taskContext: 'unclear observation',
    equipmentInvolved: '',
    photosAvailable: false,
    employeeExposureKnown: false,
    expectedTerms: ['unknown', 'evidence', 'review'],
    shouldHaveMissingEvidence: true,
  },
];

const service = new SafeScopeReasoningOrchestratorService();

async function main() {
  const failures: string[] = [];

  for (const testCase of cases) {
    try {
      const result: any = service.reason({
        hazardObservation: testCase.hazardObservation,
        siteType: testCase.siteType,
        industryContext: testCase.industryContext,
        taskContext: testCase.taskContext,
        equipmentInvolved: testCase.equipmentInvolved,
        photosAvailable: testCase.photosAvailable,
        employeeExposureKnown: testCase.employeeExposureKnown,
        enableApprovedKnowledgeContext: true,
      });

      assert(result, `${testCase.id}: result missing.`);
      assert(result.engine === 'safescope_reasoning_orchestrator_v1', `${testCase.id}: engine mismatch.`);
      assert(result.productionReasoningModified === false, `${testCase.id}: must not modify production reasoning.`);

      assert(result.hazardClassification?.primaryDomain, `${testCase.id}: missing hazard classification.`);
      assert(result.jurisdictionAssessment?.likelyJurisdiction, `${testCase.id}: missing jurisdiction assessment.`);
      assert(result.correctiveActionReasoning?.reasoningBoundary?.requiresQualifiedReview === true, `${testCase.id}: must require qualified review.`);
      assert(result.applicabilityAnalysis?.conclusionBoundary?.doesNotDeclareViolation === true, `${testCase.id}: must not declare violation.`);
      assert(result.applicabilityAnalysis?.conclusionBoundary?.doesNotCreateCitation === true, `${testCase.id}: must not create citation.`);
      assert(Array.isArray(result.correctiveActionReasoning?.recommendations), `${testCase.id}: recommendations must be an array.`);
      assert(result.correctiveActionReasoning.recommendations.length > 0, `${testCase.id}: recommendations must not be empty.`);

      const combined = textOf({
        requestSummary: result.requestSummary,
        hazardClassification: result.hazardClassification,
        jurisdictionAssessment: result.jurisdictionAssessment,
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

      const missingExpected = testCase.expectedTerms.filter(
        (term) => !combined.includes(term.toLowerCase()),
      );

      assert(
        missingExpected.length === 0,
        `${testCase.id}: missing expected reasoning term(s): ${missingExpected.join(', ')}`,
      );

      const generatedReasoningOnly = generatedDecisionText(result);

      const forbiddenMatches = (testCase.forbiddenTerms || []).filter(
        (term) => generatedReasoningOnly.includes(term.toLowerCase()),
      );

      assert(
        forbiddenMatches.length === 0,
        `${testCase.id}: false-positive forbidden term(s) appeared in generated reasoning: ${forbiddenMatches.join(', ')}`,
      );

      if (testCase.shouldHaveMissingEvidence) {
        const missingEvidenceText = textOf({
          missingEvidence: result.missingEvidence,
          equipmentReasoningSummary: result.equipmentReasoningSummary,
          recommendedNextQuestions: result.recommendedNextQuestions,
          confidence: result.confidence,
        }).toLowerCase();

        assert(
          missingEvidenceText.includes('unknown') ||
            missingEvidenceText.includes('missing') ||
            missingEvidenceText.includes('confirm') ||
            missingEvidenceText.includes('verify') ||
            missingEvidenceText.includes('evidence') ||
            missingEvidenceText.includes('height') ||
            missingEvidenceText.includes('atmosphere') ||
            missingEvidenceText.includes('permit'),
          `${testCase.id}: incomplete scenario should surface missing-evidence or verification language.`,
        );
      }

      console.log(
        `✅ ${testCase.id}: ${testCase.title} | ${result.hazardClassification.primaryDomain} | ${result.jurisdictionAssessment.likelyJurisdiction} | ${result.confidence?.level || 'confidence unavailable'}`,
      );
    } catch (error) {
      failures.push(`${testCase.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length) {
    throw new Error(failures.join('\n'));
  }

  console.log('✅ SafeScope Mind vs. Memory validation passed.');
  console.log(`Cases: ${cases.length}`);
}

main().catch((error) => {
  console.error('❌ SafeScope Mind vs. Memory validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
