import { SAFESCOPE_EVIDENCE_BRAIN_REGISTRY } from '../src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry';
import { SafeScopeEvidenceBrainService } from '../src/safescope-v2/brain/evidence-brain/evidence-brain.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const ids = new Set<string>();

for (const record of SAFESCOPE_EVIDENCE_BRAIN_REGISTRY) {
  assert(record.evidenceId.trim().length > 0, 'Every evidence record must have an evidenceId.');
  assert(!ids.has(record.evidenceId), `Duplicate evidenceId: ${record.evidenceId}`);
  ids.add(record.evidenceId);

  assert(record.hazardDomains.length > 0, `${record.evidenceId} must map to at least one hazard domain.`);
  assert(record.question.trim().endsWith('?'), `${record.evidenceId} question must be phrased as a question.`);
  assert(record.whyItMatters.trim().length > 0, `${record.evidenceId} must explain why it matters.`);
  assert(record.defensibilityImpact.trim().length > 0, `${record.evidenceId} must include defensibility impact.`);
  assert(record.acceptableEvidenceTypes.length > 0, `${record.evidenceId} must define acceptable evidence types.`);

  if (record.importance === 'critical') {
    assert(
      record.defensibilityImpact.toLowerCase().includes('confidence') ||
        record.defensibilityImpact.toLowerCase().includes('defensible') ||
        record.defensibilityImpact.toLowerCase().includes('review') ||
        record.defensibilityImpact.toLowerCase().includes('conclusion'),
      `${record.evidenceId} critical records must explain confidence, defensibility, review, or conclusion impact.`,
    );
  }
}

const service = new SafeScopeEvidenceBrainService();

const machineGuardingQuery = service.query({
  hazardDomain: 'machine_guarding',
  mechanism: 'rotating_equipment_nip_point',
  text: 'unguarded conveyor tail pulley nip point exposed to miners',
  limit: 3,
});
assert(
  machineGuardingQuery.matches[0]?.record.evidenceId === 'evidence-machine-guarding-exposure',
  'Machine guarding query should rank machine guarding exposure evidence first.',
);

const undergroundGuardingQuery = service.query({
  hazardDomain: 'machine_guarding',
  mechanism: 'rotating_equipment',
  text: 'underground metal nonmetal conveyor guarding rotating equipment',
  limit: 5,
});
assert(
  undergroundGuardingQuery.matches.some((match) => match.record.evidenceId === 'evidence-underground-mnm-guarding-scope'),
  'Underground MNM guarding query should return underground scope evidence.',
);

const silicaQuery = service.query({
  hazardDomain: 'health_respiratory',
  mechanism: 'silica_inhalation',
  text: 'construction dry cutting silica dust exposure wet methods respiratory protection sampling',
  limit: 3,
});
assert(
  silicaQuery.matches[0]?.record.evidenceId === 'evidence-silica-exposure-controls',
  'Silica query should rank silica exposure controls evidence first.',
);

const confinedQuery = service.query({
  hazardDomain: 'confined_space',
  mechanism: 'asphyxiation',
  text: 'confined space atmospheric testing permit attendant rescue oxygen deficiency',
  limit: 3,
});
assert(
  confinedQuery.matches[0]?.record.evidenceId === 'evidence-confined-space-entry-controls',
  'Confined space query should rank entry-control evidence first.',
);

const escapewayQuery = service.query({
  hazardDomain: 'emergency_preparedness',
  mechanism: 'egress_blockage',
  text: 'underground coal blocked escapeway obstruction lifeline emergency route',
  limit: 3,
});
assert(
  escapewayQuery.matches[0]?.record.evidenceId === 'evidence-escapeway-egress-clearance',
  'Escapeway query should rank egress clearance evidence first.',
);

const mobileQuery = service.query({
  hazardDomain: 'mobile_equipment',
  mechanism: 'pedestrian_strike',
  text: 'forklift pedestrian interaction employees on foot missing separation',
  limit: 3,
});
assert(
  mobileQuery.matches[0]?.record.evidenceId === 'evidence-mobile-equipment-pedestrian-interface',
  'Mobile equipment query should rank pedestrian interface evidence first.',
);

const electricalQuery = service.query({
  hazardDomain: 'electrical',
  mechanism: 'shock_arc_flash',
  text: 'damaged electrical cable exposed conductor energized shock arc flash',
  limit: 3,
});
assert(
  electricalQuery.matches[0]?.record.evidenceId === 'evidence-electrical-exposed-live-parts',
  'Electrical query should rank exposed live parts evidence first.',
);

console.log('✅ SafeScope Evidence Brain validation passed.');
console.log(`Evidence Brain records: ${SAFESCOPE_EVIDENCE_BRAIN_REGISTRY.length}`);
console.log(`Top machine guarding query: ${machineGuardingQuery.matches[0]?.record.evidenceId}`);
console.log(`Top silica query: ${silicaQuery.matches[0]?.record.evidenceId}`);
console.log(`Top confined-space query: ${confinedQuery.matches[0]?.record.evidenceId}`);
console.log(`Top escapeway query: ${escapewayQuery.matches[0]?.record.evidenceId}`);
console.log(`Top mobile-equipment query: ${mobileQuery.matches[0]?.record.evidenceId}`);
console.log(`Top electrical query: ${electricalQuery.matches[0]?.record.evidenceId}`);
