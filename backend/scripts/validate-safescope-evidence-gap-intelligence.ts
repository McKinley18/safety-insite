import { SafeScopeEvidenceGapIntelligenceService } from '../src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.service';
import { SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY } from '../src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.registry';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeEvidenceGapIntelligenceService();

for (const record of SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY) {
  assert(record.gapId.trim().length > 0, 'Evidence gap record must have gapId.');
  assert(record.label.trim().length > 0, `${record.gapId} must have label.`);
  assert(record.hazardDomains.length > 0, `${record.gapId} must have hazard domains.`);
  assert(record.mechanisms.length > 0, `${record.gapId} must have mechanisms.`);
  assert(record.triggerTerms.length > 0, `${record.gapId} must have trigger terms.`);
  assert(record.missingEvidenceTerms.length > 0, `${record.gapId} must have missing evidence terms.`);
  assert(record.inspectorQuestion.trim().length > 0, `${record.gapId} must have inspector question.`);
  assert(record.whyItMatters.trim().length > 0, `${record.gapId} must explain why it matters.`);
}

const guarding = service.query({
  text: 'Conveyor tail pulley has missing guard and exposed nip point near employee access route.',
  jurisdiction: 'msha',
  hazardDomain: 'machine_guarding',
  mechanism: 'rotating_equipment_nip_point',
});

assert(
  guarding.matches[0]?.record.gapId === 'machine-guarding-exposure-confirmation',
  `Expected machine guarding evidence gap first, got ${guarding.matches[0]?.record.gapId}.`,
);

const electrical = service.query({
  text: 'Exposed energized conductor and damaged wiring near work area.',
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'electrical',
  mechanism: 'shock_arc_flash',
});

assert(
  electrical.recommendedDisposition === 'hold_for_critical_evidence',
  `Expected electrical to hold for critical evidence, got ${electrical.recommendedDisposition}.`,
);

const mobile = service.query({
  text: 'Forklift operating near pedestrians in warehouse aisle with no separation.',
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'mobile_equipment',
  mechanism: 'pedestrian_strike',
});

assert(
  mobile.criticalQuestions.some((question) => question.toLowerCase().includes('pedestrians')),
  'Expected mobile equipment evidence questions to mention pedestrians.',
);

const loto = service.query({
  text: 'Maintenance performed with lockout/tagout concern and possible stored energy.',
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'machine_guarding_loto',
  mechanism: 'unexpected_startup',
});

assert(
  loto.highestSeverity === 'critical',
  `Expected LOTO highest severity critical, got ${loto.highestSeverity}.`,
);

for (const result of [guarding, electrical, mobile, loto]) {
  assert(result.boundary.readOnly === true, 'Evidence Gap Intelligence must be read-only.');
  assert(result.boundary.advisoryOnly === true, 'Evidence Gap Intelligence must be advisory only.');
  assert(result.boundary.canDeclareViolation === false, 'Evidence Gap Intelligence must not declare violations.');
  assert(result.boundary.canCreateCitation === false, 'Evidence Gap Intelligence must not create citations.');
  assert(result.boundary.canBypassHumanReview === false, 'Evidence Gap Intelligence must not bypass human review.');
}

console.log('✅ SafeScope Evidence Gap Intelligence v1 validation passed.');
console.log(`Evidence gap records: ${SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY.length}`);
console.log(`Guarding top gap: ${guarding.matches[0]?.record.gapId}`);
console.log(`Electrical disposition: ${electrical.recommendedDisposition}`);
console.log(`Mobile top gap: ${mobile.matches[0]?.record.gapId}`);
console.log(`LOTO highest severity: ${loto.highestSeverity}`);
