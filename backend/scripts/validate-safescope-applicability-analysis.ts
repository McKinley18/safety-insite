import { SafeScopeApplicabilityAnalysisService } from '../src/safescope-v2/reasoning-orchestrator/applicability/applicability-analysis.service';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const service = new SafeScopeApplicabilityAnalysisService();

const approvedMachineGuardingRecord: KnowledgeRecord = {
  recordId: 'fixture-applicability-machine-guarding',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding fixture',
  sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.212',
  retrievedAt: '2026-05-30T10:00:00Z',
  jurisdiction: 'US_FEDERAL',
  hazardDomains: ['mechanical'],
  applicabilityTriggers: ['machine guarding', 'unguarded pulley', 'employee exposure', 'point of operation'],
  standardIntent: 'Guard machine parts that expose employees to injury.',
  evidenceNeeded: ['employee exposure', 'guard condition', 'equipment operating state'],
  nonApplicabilityQuestions: ['Is the moving part isolated from employee access?'],
  sourceBoundary: 'mandatory',
  reviewStatus: 'approved_by_human',
  approvedForUse: true,
};

const likely = service.analyze({
  hazardObservation:
    'Unguarded pulley on conveyor with employee exposure during cleanup. Guard condition is missing and equipment operating state was observed.',
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'machine_guarding',
  approvedRecords: [approvedMachineGuardingRecord],
  missingEvidence: [],
});

assert(likely.engine === 'safescope_applicability_analysis_v1', 'Unexpected applicability engine.');
assert(likely.mode === 'deterministic_test_only_advisory', 'Unexpected applicability mode.');
assert(likely.productionReasoningModified === false, 'Applicability analysis must not modify production reasoning.');
assert(likely.recordAnalyses.length === 1, 'Expected one record analysis.');
assert(likely.recordAnalyses[0].status === 'likely_applicable', 'Expected likely_applicable status.');
assert(likely.recordAnalyses[0].triggerMatches.length >= 2, 'Expected trigger matches.');
assert(likely.recordAnalyses[0].confidenceScore >= 70, 'Expected high confidence score.');
assert(likely.summary.likelyApplicableCount === 1, 'Expected one likely applicable record.');
assert(likely.conclusionBoundary.advisoryOnly === true, 'Applicability result must be advisory only.');
assert(likely.conclusionBoundary.doesNotDeclareViolation === true, 'Applicability result must not declare violations.');
assert(likely.conclusionBoundary.doesNotCreateCitation === true, 'Applicability result must not create citations.');
assert(likely.conclusionBoundary.requiresQualifiedReview === true, 'Applicability result must require qualified review.');

const insufficient = service.analyze({
  hazardObservation: 'Possible machine issue.',
  jurisdiction: 'unclear',
  hazardDomain: 'unknown',
  approvedRecords: [approvedMachineGuardingRecord],
  missingEvidence: [
    {
      field: 'siteType',
      reason: 'Site type is needed for jurisdiction.',
      importance: 'high',
    },
    {
      field: 'employeeExposureKnown',
      reason: 'Employee exposure is unknown.',
      importance: 'high',
    },
  ],
});

assert(
  insufficient.recordAnalyses[0].status === 'insufficient_evidence' ||
    insufficient.recordAnalyses[0].status === 'not_applicable_based_on_known_facts',
  'Expected insufficient or not-applicable status for vague input.',
);
assert(insufficient.recordAnalyses[0].confidenceScore < 70, 'Expected lower confidence for vague input.');
assert(insufficient.conclusionBoundary.doesNotDeclareViolation === true, 'Vague input still must not declare violations.');

const noRecords = service.analyze({
  hazardObservation: 'Unguarded conveyor pulley.',
  jurisdiction: 'msha',
  hazardDomain: 'machine_guarding',
  approvedRecords: [],
  missingEvidence: [],
});

assert(noRecords.recordAnalyses.length === 0, 'Expected no analyses when no approved records are supplied.');
assert(noRecords.summary.likelyApplicableCount === 0, 'Expected zero likely applicable records with no approved records.');

console.log('✅ SafeScope applicability analysis validation passed.');
