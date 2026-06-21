import { buildContextualControls } from '../../action-engine/contextual-control.engine';
import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { resolveCanonicalHazardFamily } from '../taxonomy/canonical-taxonomy-aliases';

type BenchmarkScenario = {
  id: string;
  observation: string;
  siteType?: string;
  expectedDomain: string;
  mechanismTokens: string[];
  evidenceTokens: string[];
  actionTokens: string[];
  forbiddenCitation?: RegExp;
};

const scenarios: BenchmarkScenario[] = [
  { id: 'compressed-gas', observation: 'Oxygen cylinder stored unsecured near a walkway.', siteType: 'general industry facility', expectedDomain: 'compressed_gas', mechanismTokens: ['cylinder', 'gas_release', 'projectile'], evidenceTokens: ['cylinder', 'restraint', 'valve'], actionTokens: ['secure', 'upright', 'valve'], forbiddenCitation: /1910\.22|1910\.104|1910\.253/i },
  { id: 'hazcom', observation: 'A secondary chemical container has no label.', siteType: 'general industry facility', expectedDomain: 'hazard_communication', mechanismTokens: ['chemical', 'unknown'], evidenceTokens: ['substance', 'chemical', 'label'], actionTokens: ['identify', 'label', 'sds'], forbiddenCitation: /1910\.101|1910\.22/i },
  { id: 'electrical', observation: 'Electrical panel has an open breaker slot exposing energized parts.', siteType: 'general industry facility', expectedDomain: 'electrical', mechanismTokens: ['shock', 'arc'], evidenceTokens: ['exposure', 'photo'], actionTokens: ['restrict access', 'filler', 'qualified electrical'], forbiddenCitation: /1910\.1200|1910\.22/i },
  { id: 'machine-guarding', observation: 'Rotating shaft is exposed on a running conveyor drive.', expectedDomain: 'machine_guarding', mechanismTokens: ['rotating', 'entanglement', 'caught'], evidenceTokens: ['guard', 'exposure'], actionTokens: ['guard', 'moving parts', 'lockout'] },
  { id: 'conveyor', observation: 'Tail pulley is unguarded and miners clean near the moving belt.', siteType: 'surface aggregate mine', expectedDomain: 'machine_guarding', mechanismTokens: ['nip', 'caught', 'rotating'], evidenceTokens: ['guard', 'exposure'], actionTokens: ['guard', 'lockout', 'stop'] },
  { id: 'loto', observation: 'Maintenance employee clears a jam without locking out the equipment.', expectedDomain: 'lockout_tagout', mechanismTokens: ['startup', 'energy', 'caught'], evidenceTokens: ['energy', 'isolation', 'exposure'], actionTokens: ['stop', 'lockout', 'zero energy'] },
  { id: 'walking-surface', observation: 'Oil spilled across the walkway.', expectedDomain: 'walking_working_surfaces', mechanismTokens: ['trip', 'slip', 'fall'], evidenceTokens: ['exposure', 'photo'], actionTokens: ['clean', 'barricade', 'source'], forbiddenCitation: /1910\.101/i },
  { id: 'fall-protection', observation: 'Employee works near an unprotected roof edge.', expectedDomain: 'fall_protection', mechanismTokens: ['fall'], evidenceTokens: ['fall', 'exposure'], actionTokens: ['guardrail', 'fall protection', 'restrict access'] },
  { id: 'mobile-equipment', observation: 'Loader operates near pedestrians without separation.', expectedDomain: 'mobile_equipment', mechanismTokens: ['struck', 'mobile'], evidenceTokens: ['exposure', 'site'], actionTokens: ['separate', 'traffic control', 'exclusion zone'] },
  { id: 'flammable-hot-work', observation: 'Flammable liquid container stored near hot work.', expectedDomain: 'fire_protection', mechanismTokens: ['ignition', 'fire'], evidenceTokens: ['exposure', 'site'], actionTokens: ['ignition', 'flammable', 'hot-work'] },
  { id: 'egress', observation: 'Emergency exit is blocked by stacked materials.', expectedDomain: 'emergency_egress', mechanismTokens: ['evacuation', 'egress'], evidenceTokens: ['exposure', 'photo'], actionTokens: ['remove', 'exit route', 'unobstructed'] },
  { id: 'confined-space', observation: 'Worker enters a tank with unknown atmosphere.', expectedDomain: 'confined_space', mechanismTokens: ['atmosphere', 'asphyx', 'toxic'], evidenceTokens: ['atmosphere', 'exposure'], actionTokens: ['stop entry', 'test the atmosphere', 'rescue'] },
  { id: 'excavation', observation: 'Worker is in a trench with vertical unprotected walls.', siteType: 'construction site', expectedDomain: 'excavation_trenching', mechanismTokens: ['cave', 'collapse', 'engulf'], evidenceTokens: ['trench', 'soil', 'protective'], actionTokens: ['remove workers', 'shoring', 'competent person'] },
  { id: 'ppe-eye-face', observation: 'Employee grinding metal without a face shield.', expectedDomain: 'personal_protective_equipment', mechanismTokens: ['flying', 'eye', 'particle'], evidenceTokens: ['exposure', 'photo'], actionTokens: ['ppe', 'face', 'equipped'] },
  { id: 'silica', observation: 'Worker dry cuts concrete indoors with visible dust.', expectedDomain: 'respirable_dust_silica', mechanismTokens: ['silica', 'inhal'], evidenceTokens: ['exposure', 'measurement'], actionTokens: ['wet cutting', 'dust collection', 'respiratory'] },
  { id: 'noise', observation: 'Employees work near loud crushing equipment without hearing protection.', expectedDomain: 'noise_exposure', mechanismTokens: ['hearing', 'noise'], evidenceTokens: ['noise', 'sound level', 'dose'], actionTokens: ['hearing protection', 'sound level', 'source'] },
  { id: 'heat-stress', observation: 'Crew works in high heat with no shade or water nearby.', expectedDomain: 'heat_stress', mechanismTokens: ['heat'], evidenceTokens: ['heat', 'water', 'shade'], actionTokens: ['water', 'shade', 'acclimatization'] },
  { id: 'ergonomics', observation: 'Employee repeatedly lifts heavy boxes from floor level.', expectedDomain: 'ergonomics', mechanismTokens: ['overexert', 'strain'], evidenceTokens: ['weight', 'frequency', 'posture'], actionTokens: ['lift aids', 'pickup height', 'team lift'] },
  { id: 'rigging', observation: 'Load is lifted with a damaged sling.', expectedDomain: 'cranes_rigging_hoisting', mechanismTokens: ['rigging', 'dropped'], evidenceTokens: ['exposure', 'site'], actionTokens: ['remove', 'sling', 'qualified rigger'] },
  { id: 'welding-fire-watch', observation: 'Welding occurs near combustible material without fire watch.', expectedDomain: 'fire_protection', mechanismTokens: ['ignition', 'fire'], evidenceTokens: ['exposure', 'site'], actionTokens: ['combustible', 'fire-watch', 'hot-work'] },
  { id: 'forklift', observation: 'Forklift travels with elevated load near pedestrians.', expectedDomain: 'mobile_equipment', mechanismTokens: ['struck', 'mobile'], evidenceTokens: ['exposure', 'site'], actionTokens: ['separate', 'pedestrian', 'travel'] },
  { id: 'dropped-object', observation: 'Tools are stored loose on an elevated platform.', expectedDomain: 'dropped_objects', mechanismTokens: ['falling', 'struck'], evidenceTokens: ['elevation', 'secure', 'below'], actionTokens: ['exclusion zone', 'secure tools', 'toe boards'] },
  { id: 'ground-control', observation: 'Loose material is visible on a highwall near work area.', siteType: 'surface mine', expectedDomain: 'ground_control', mechanismTokens: ['ground', 'material'], evidenceTokens: ['highwall', 'scaling', 'examination'], actionTokens: ['barricade', 'scale', 'competent person'] },
  { id: 'water-drowning', observation: 'Employee works near open water without flotation protection.', expectedDomain: 'water_drowning', mechanismTokens: ['water', 'drowning'], evidenceTokens: ['water', 'flotation', 'rescue'], actionTokens: ['flotation', 'rescue', 'barrier'] },
  { id: 'environmental-release', observation: 'Used oil container is open near a floor drain.', expectedDomain: 'environmental_release', mechanismTokens: ['release', 'drain'], evidenceTokens: ['material', 'drain', 'containment'], actionTokens: ['close', 'drain', 'secondary containment'] },
];

function includesAny(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

function run(): void {
  const service = new SafeScopeReasoningOrchestratorService();
  const failures: string[] = [];

  for (const scenario of scenarios) {
    const result = service.reason({
      hazardObservation: scenario.observation,
      siteType: scenario.siteType,
    });
    const canonicalDomain = resolveCanonicalHazardFamily(
      result.hazardClassification.primaryDomain,
      scenario.observation,
    );
    const mechanism = result.resolvedMechanism?.mechanismId || '';
    const evidenceText = JSON.stringify({ gaps: result.missingEvidence, questions: result.recommendedNextQuestions });
    const controls = buildContextualControls({
      classification: result.hazardClassification.primaryDomain,
      text: scenario.observation,
    });
    const actionText = JSON.stringify(controls);

    if (canonicalDomain !== scenario.expectedDomain) failures.push(`${scenario.id}: domain ${canonicalDomain}`);
    if (!includesAny(mechanism, scenario.mechanismTokens)) failures.push(`${scenario.id}: mechanism ${mechanism || 'missing'}`);
    if (!includesAny(evidenceText, scenario.evidenceTokens)) failures.push(`${scenario.id}: relevant evidence gap missing`);
    if (!scenario.actionTokens.every((token) => actionText.toLowerCase().includes(token.toLowerCase()))) failures.push(`${scenario.id}: corrective action coverage missing`);
    if (scenario.forbiddenCitation?.test(result.primaryCitation || '')) failures.push(`${scenario.id}: forbidden citation ${result.primaryCitation}`);
    if (!result.conclusionBoundary.advisoryOnly || !result.conclusionBoundary.requiresQualifiedReview || result.conclusionBoundary.doesNotDeclareViolation !== true || result.conclusionBoundary.doesNotCreateCitation !== true) {
      failures.push(`${scenario.id}: advisory governance boundary missing`);
    }

    console.log(`${failures.some((failure) => failure.startsWith(`${scenario.id}:`)) ? '❌' : '✅'} ${scenario.id}: ${canonicalDomain} / ${mechanism || 'unknown'}`);
  }

  if (failures.length) {
    throw new Error(`Hazard understanding benchmark failed:\n${failures.join('\n')}`);
  }
  console.log(`HazLenz hazard understanding benchmark: ${scenarios.length}/${scenarios.length} passed.`);
}

run();
