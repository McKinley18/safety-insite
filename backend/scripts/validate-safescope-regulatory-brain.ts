import { STANDARDS_APPLICABILITY_REGISTRY } from '../src/safescope-v2/standards/standards-applicability.registry';
import { SAFESCOPE_REGULATORY_BRAIN_REGISTRY } from '../src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry';
import { SafeScopeRegulatoryBrainService } from '../src/safescope-v2/brain/regulatory-brain/regulatory-brain.service';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const recordIds = new Set<string>();

for (const record of SAFESCOPE_REGULATORY_BRAIN_REGISTRY) {
  assert(record.recordId, 'Every Regulatory Brain record must have a recordId.');
  assert(!recordIds.has(record.recordId), `Duplicate Regulatory Brain recordId: ${record.recordId}`);
  recordIds.add(record.recordId);

  assert(record.title, `${record.recordId} must have a title.`);
  const citation = record.citation ?? '';
  const sourceReference = record.sourceReference ?? '';
  const standardPart = record.standardPart ?? '';

  const representsCfr =
    /^(29|30) CFR /.test(citation) ||
    /^(29|30) CFR /.test(sourceReference) ||
    /^(29|30) CFR /.test(standardPart);

  if (representsCfr) {
    assert(record.authorityTier === 'tier_1_binding_regulation', `${record.recordId} must be tier 1 if it represents CFR.`);
  } else {
    assert(
      record.authorityTier === 'tier_3_authoritative_guidance',
      `${record.recordId} must be tier 3 guidance if it does not represent CFR.`,
    );
  }
  assert(record.verificationStatus.startsWith('approved_'), `${record.recordId} must be approved for read-only use.`);
  assert(record.jurisdiction, `${record.recordId} must have jurisdiction.`);
  assert(record.industryScope, `${record.recordId} must have industryScope.`);
  assert(record.citation, `${record.recordId} must have citation.`);
  assert(record.sourceReference, `${record.recordId} must have sourceReference.`);
  assert(record.hazardDomains.length > 0, `${record.recordId} must have hazard domains.`);
  assert(record.mechanisms.length > 0, `${record.recordId} must have mechanisms.`);
  assert(record.applicabilityTriggers.length > 0, `${record.recordId} must have applicability triggers.`);
  assert(record.requiredControls.length > 0, `${record.recordId} must have required controls.`);
  assert(record.correctiveActionPatterns.length > 0, `${record.recordId} must have corrective action patterns.`);
  assert(record.verificationEvidence.length > 0, `${record.recordId} must have verification evidence.`);
  assert(record.evidenceQuestions.length > 0, `${record.recordId} must have evidence questions.`);

  assert(record.boundary.canCreateCitation === false, `${record.recordId} may not create citations.`);
  assert(record.boundary.canDeclareViolation === false, `${record.recordId} may not declare violations.`);
  assert(record.boundary.canOverrideRegulation === false, `${record.recordId} may not override regulations.`);
  assert(record.boundary.canBypassHumanReview === false, `${record.recordId} may not bypass human review.`);
  assert(record.boundary.canInfluenceReasoning === false, `${record.recordId} may not influence reasoning yet.`);
  assert(record.boundary.requiresQualifiedReview === true, `${record.recordId} must require qualified review.`);
}

const standardsCitations = Array.from(new Set(STANDARDS_APPLICABILITY_REGISTRY.map((entry) => entry.primaryCitation)));
const brainCitations = new Set(SAFESCOPE_REGULATORY_BRAIN_REGISTRY.map((record) => record.citation));

const missingFromBrain = standardsCitations.filter((citation) => !brainCitations.has(citation));
assert(
  missingFromBrain.length === 0,
  `Regulatory Brain missing standards registry citations: ${missingFromBrain.join(', ')}`,
);

const service = new SafeScopeRegulatoryBrainService();

const scaffoldQuery = service.query({
  jurisdiction: 'osha_construction',
  hazardDomain: 'fall_protection',
  text: 'scaffold missing guardrail toprail midrail',
  approvedOnly: true,
  limit: 3,
});
assert(scaffoldQuery.matches.length > 0, 'Scaffold/fall query should return matches.');
assert(
  scaffoldQuery.matches.some((match) => match.record.citation === '29 CFR 1926.451(g)(4)'),
  'Scaffold query should include 29 CFR 1926.451(g)(4).',
);

const undergroundGuardingQuery = service.query({
  jurisdiction: 'msha',
  mineScope: 'metal_nonmetal_underground',
  hazardDomain: 'machine_guarding',
  text: 'underground metal nonmetal conveyor guarding moving machine parts',
  approvedOnly: true,
  limit: 3,
});
assert(
  undergroundGuardingQuery.matches[0]?.record.citation === '30 CFR 57.14107',
  'Underground MNM guarding query should rank 30 CFR 57.14107 first.',
);

const forkliftQuery = service.query({
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'mobile_equipment',
  mechanism: 'pedestrian_strike',
  text: 'forklift pedestrian powered industrial truck traffic',
  approvedOnly: true,
  limit: 3,
});
assert(
  forkliftQuery.matches[0]?.record.citation === '29 CFR 1910.178(l)',
  'Forklift pedestrian query should rank 29 CFR 1910.178(l) first.',
);

console.log('✅ SafeScope Regulatory Brain validation passed.');
console.log(`Regulatory Brain records: ${SAFESCOPE_REGULATORY_BRAIN_REGISTRY.length}`);
console.log(`Standards primary citations covered: ${standardsCitations.length}`);
console.log(`Top scaffold query: ${scaffoldQuery.matches[0]?.record.citation}`);
console.log(`Top underground guarding query: ${undergroundGuardingQuery.matches[0]?.record.citation}`);
console.log(`Top forklift query: ${forkliftQuery.matches[0]?.record.citation}`);
