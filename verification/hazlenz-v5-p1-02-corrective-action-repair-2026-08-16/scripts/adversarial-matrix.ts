import { CorrectiveActionBrainService } from '../../../backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service';
import { ObservationUnderstandingService } from '../../../backend/src/safescope-v2/understanding/observation-understanding.service';

const engine = new CorrectiveActionBrainService();
const understanding = new ObservationUnderstandingService();

type Case = {
  name: string;
  text: string;
  scenarioFamilyId: string;
  hazardDomain: string;
  mechanismOfInjury: string;
  missingControls: string[];
  hierarchyLevel: string;
};

const cases: Case[] = [
  {
    name: 'A. Machine guarding — specific missing guard',
    text: 'Unguarded rotating shaft near conveyor drive with no fixed guard installed. Employees work within reach of moving parts.',
    scenarioFamilyId: 'conveyor-cleanup',
    hazardDomain: 'machine_guarding',
    mechanismOfInjury: 'rotating_equipment_entanglement',
    missingControls: ['guarding'],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'B. Lockout/tagout — uncontrolled hazardous energy',
    text: 'A mechanic reached into the baler to clear a jam. No lockout was applied and stored hydraulic energy remains in the ram.',
    scenarioFamilyId: 'loto-servicing',
    hazardDomain: 'lockout_tagout',
    mechanismOfInjury: 'uncontrolled_hazardous_energy_release',
    missingControls: ['energy_isolation'],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'C. Electrical — exposed/unsafe condition',
    text: 'Live wire hanging from open junction box with exposed conductor and damaged insulation near the work area.',
    scenarioFamilyId: 'damaged-cord-wet-location',
    hazardDomain: 'electrical',
    mechanismOfInjury: 'electrical_shock',
    missingControls: ['electrical_integrity'],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'D. Fall exposure — supported fall hazard',
    text: 'Missing guardrail on elevated platform creates unprotected edge exposure at the loading dock.',
    scenarioFamilyId: 'elevated-fall',
    hazardDomain: 'fall_protection',
    mechanismOfInjury: 'fall_from_height',
    missingControls: ['fall_protection_or_edge_protection'],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'E. Failed existing control — guard present but damaged',
    text: 'The machine guard over the rotating shaft is damaged and cracked, no longer fully covering the nip point.',
    scenarioFamilyId: 'conveyor-cleanup',
    hazardDomain: 'machine_guarding',
    mechanismOfInjury: 'rotating_equipment_entanglement',
    missingControls: [],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'F. Effective existing control — guard present and working',
    text: 'The rotating shaft near the conveyor drive has a guard installed and functioning correctly; barrier present around the nip point.',
    scenarioFamilyId: 'conveyor-cleanup',
    hazardDomain: 'machine_guarding',
    mechanismOfInjury: 'rotating_equipment_entanglement',
    missingControls: [],
    hierarchyLevel: 'engineering',
  },
  {
    name: 'G. Unknown control state — not stated either way',
    text: 'A worker was observed servicing the conveyor drive near the rotating shaft area.',
    scenarioFamilyId: 'conveyor-cleanup',
    hazardDomain: 'machine_guarding',
    mechanismOfInjury: 'rotating_equipment_entanglement',
    missingControls: [],
    hierarchyLevel: 'unknown',
  },
  {
    name: 'H. Vague observation — no specific hazard signal',
    text: 'Something unsafe was noted near the equipment area.',
    scenarioFamilyId: 'unclassified',
    hazardDomain: 'unknown',
    mechanismOfInjury: '',
    missingControls: [],
    hierarchyLevel: 'unknown',
  },
];

console.log('P1-02 Adversarial Corrective-Action Matrix\n');

for (const c of cases) {
  const obs = understanding.evaluate(c.text);
  const scenarioIntelligence: any = {
    scenarioFamilyId: c.scenarioFamilyId,
    candidateStandardFamily: c.hazardDomain,
    mechanismOfInjury: c.mechanismOfInjury,
    exposedPersonActivity: 'maintenance or operations',
    missingOrFailedControls: c.missingControls,
    hierarchyLevel: c.hierarchyLevel,
    confidenceSignals: { score: 0.9 },
  };
  const result = engine.evaluate(scenarioIntelligence, [], obs);
  console.log(`--- ${c.name} ---`);
  console.log(`  text: "${c.text}"`);
  console.log(`  parsed controls: existing=${JSON.stringify(obs.controls?.existingControls)} missing=${JSON.stringify(obs.controls?.missingControls)} failed=${JSON.stringify(obs.controls?.failedControls)}`);
  console.log(`  Immediate: ${result.immediateActionNarrative}`);
  console.log(`  Interim:   ${result.interimControlNarrative}`);
  console.log(`  Permanent: ${result.permanentCorrectionNarrative}`);
  console.log('');
}

// Multi-hazard case: two findings from one multi-hazard observation, each scoped to its
// own hazard fragment (mirrors the C05 fix's fragment-scoping approach), verifying each
// finding's corrective action stays bound to its own evidence, not its sibling's.
console.log('--- I. Multi-hazard — sibling evidence isolation ---');
const combinedText =
  'A mechanic reached into the baler to clear a jam while hydraulic pressure remains in the ram, and a nearby employee walked past an open electrical panel with exposed energized bus bars.';
const fragmentA = 'hydraulic pressure remains in the ram';
const fragmentB = 'a nearby employee walked past an open electrical panel with exposed energized bus bars';

const obsA = understanding.evaluate(fragmentA);
const resultA = engine.evaluate(
  {
    scenarioFamilyId: 'loto-servicing',
    candidateStandardFamily: 'lockout_tagout',
    mechanismOfInjury: 'uncontrolled_hazardous_energy_release',
    exposedPersonActivity: 'maintenance',
    missingOrFailedControls: ['energy_isolation'],
    hierarchyLevel: 'engineering',
    confidenceSignals: { score: 0.9 },
  } as any,
  [],
  obsA,
);

const obsB = understanding.evaluate(fragmentB);
const resultB = engine.evaluate(
  {
    scenarioFamilyId: 'damaged-cord-wet-location',
    candidateStandardFamily: 'electrical',
    mechanismOfInjury: 'electrical_shock',
    exposedPersonActivity: 'walking near panel',
    missingOrFailedControls: ['electrical_integrity'],
    hierarchyLevel: 'engineering',
    confidenceSignals: { score: 0.9 },
  } as any,
  [],
  obsB,
);

console.log(`  Full observation: "${combinedText}"`);
console.log(`  Finding A fragment: "${fragmentA}"`);
console.log(`  Finding A Immediate: ${resultA.immediateActionNarrative}`);
console.log(`  Finding B fragment: "${fragmentB}"`);
console.log(`  Finding B Immediate: ${resultB.immediateActionNarrative}`);
console.log(`  Cross-contamination check: A mentions electrical? ${/electrical|wire|bus bar|conductor/i.test(resultA.immediateActionNarrative + resultA.permanentCorrectionNarrative)}`);
console.log(`  Cross-contamination check: B mentions hydraulic/ram? ${/hydraulic|ram\b/i.test(resultB.immediateActionNarrative + resultB.permanentCorrectionNarrative)}`);
