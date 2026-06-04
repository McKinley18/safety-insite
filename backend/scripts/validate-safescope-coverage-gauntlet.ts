import { SafeScopeMechanismIntelligenceService } from '../src/safescope-v2/mechanism-intelligence/mechanism-intelligence.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const scenarios = [
  {
    name: 'Machine guarding conveyor nip point',
    classification: 'Machine Guarding',
    observationText: 'Conveyor tail pulley has exposed nip point and employees clean near moving parts.',
    expectedMechanisms: ['caught_in_or_between', 'crush', 'amputation'],
    expectedEnergy: ['mechanical_motion', 'stored_energy', 'kinetic_energy'],
  },
  {
    name: 'Electrical energized panel',
    classification: 'Electrical',
    observationText: 'Electrical panel cover is missing and energized conductors are exposed near employee work area.',
    expectedMechanisms: ['electrocution_or_shock', 'arc_flash_or_burn'],
    expectedEnergy: ['electrical_energy'],
  },
  {
    name: 'Fall protection roof edge',
    classification: 'Fall Protection',
    observationText: 'Employees are working near an unprotected roof edge without guardrails or fall arrest.',
    expectedMechanisms: ['fall_to_lower_level', 'fall_same_level'],
    expectedEnergy: ['gravity'],
  },
  {
    name: 'Confined space atmospheric hazard',
    classification: 'Confined Space',
    observationText: 'Employee entry into tank with no atmospheric testing, no attendant, and unknown oxygen level.',
    expectedMechanisms: ['asphyxiation', 'inhalation_exposure', 'engulfment'],
    expectedEnergy: ['chemical_energy', 'atmospheric_energy'],
  },
  {
    name: 'Excavation cave-in exposure',
    classification: 'Trenching & Shoring',
    observationText: 'Worker is inside a trench with vertical walls and no visible protective system.',
    expectedMechanisms: ['crush', 'asphyxiation', 'struck_by', 'engulfment'],
    expectedEnergy: ['gravity', 'stored_energy'],
  },
  {
    name: 'Mobile equipment pedestrian exposure',
    classification: 'Mobile Equipment / Traffic',
    observationText: 'Pedestrians are walking through loader travel path with blind spots and no separation.',
    expectedMechanisms: ['struck_by', 'caught_in_or_between', 'crush'],
    expectedEnergy: ['kinetic_energy', 'mechanical_motion'],
  },
  {
    name: 'Hazcom unlabeled solvent',
    classification: 'Hazard Communication',
    observationText: 'Unlabeled secondary container contains solvent near ignition source with no SDS available.',
    expectedMechanisms: ['chemical_burn', 'inhalation_exposure', 'skin_absorption', 'fire_or_explosion'],
    expectedEnergy: ['chemical_energy', 'thermal_energy'],
  },
  {
    name: 'Respirable silica dust',
    classification: 'Respirable Dust / Silica',
    observationText: 'Dry cutting concrete creates visible dust cloud and employees are not using wet methods or local exhaust.',
    expectedMechanisms: ['inhalation_exposure', 'silica_or_dust_disease'],
    expectedEnergy: ['chemical_energy', 'airborne_contaminant'],
  },
  {
    name: 'Hot work fire exposure',
    classification: 'Fire / Hot Work',
    observationText: 'Grinding is occurring near combustible storage with no fire watch or hot work permit.',
    expectedMechanisms: ['fire_or_explosion', 'arc_flash_or_burn', 'inhalation_exposure'],
    expectedEnergy: ['thermal_energy', 'chemical_energy'],
  },
  {
    name: 'Lockout stored energy',
    classification: 'Lockout / Tagout',
    observationText: 'Maintenance is being performed on hydraulic equipment without verified zero energy or blocking.',
    expectedMechanisms: ['caught_in_or_between', 'crush', 'electrocution_or_shock', 'struck_by'],
    expectedEnergy: ['stored_energy', 'pressure', 'gravity', 'electrical_energy'],
  },
  {
    name: 'Ergonomic lifting exposure',
    classification: 'Ergonomics',
    observationText: 'Employees manually lift heavy bags repeatedly from floor level with twisting and extended reaches.',
    expectedMechanisms: ['overexertion', 'sprain_strain'],
    expectedEnergy: ['biomechanical_load'],
  },
  {
    name: 'Heat stress exposure',
    classification: 'Heat Stress',
    observationText: 'Employees are doing heavy work outdoors in high heat with limited shade, water, or acclimatization.',
    expectedMechanisms: ['heat_illness'],
    expectedEnergy: ['thermal_energy'],
  },
  {
    name: 'Noise exposure',
    classification: 'Noise',
    observationText: 'Excessive machinery noise levels with lack of hearing protection.',
    expectedMechanisms: ['noise_induced_hearing_loss'],
    expectedEnergy: ['noise_vibration'],
  },
  {
    name: 'Crane rigging lift',
    classification: 'Cranes and hoists',
    observationText: 'Suspended load over work area with improper rigging.',
    expectedMechanisms: ['struck_by', 'crush'],
    expectedEnergy: ['mechanical_motion', 'kinetic_energy', 'gravity'],
  },
  {
    name: 'Material storage collapse',
    classification: 'Material handling',
    observationText: 'Overloaded storage racks collapsing on workers.',
    expectedMechanisms: ['crush', 'struck_by'],
    expectedEnergy: ['gravity', 'kinetic_energy'],
  },
  {
    name: 'Slip on spill',
    classification: 'Housekeeping and walking surfaces',
    observationText: 'Spill not cleaned in aisle causing slip hazard.',
    expectedMechanisms: ['fall_same_level'],
    expectedEnergy: ['gravity'],
  },
  {
    name: 'Scaffold fall',
    classification: 'Ladders and scaffolds',
    observationText: 'Scaffold missing components leading to instability.',
    expectedMechanisms: ['fall_to_lower_level'],
    expectedEnergy: ['gravity', 'kinetic_energy'],
  },
  {
    name: 'Welding fume inhalation',
    classification: 'Welding health hazard',
    observationText: 'Welding in confined space with no local exhaust.',
    expectedMechanisms: ['inhalation_exposure'],
    expectedEnergy: ['atmospheric_hazard', 'chemical_energy'],
  },
  {
    name: 'Combustible dust explosion',
    classification: 'Combustible dust',
    observationText: 'Dust accumulation with nearby ignition source.',
    expectedMechanisms: ['fire_or_explosion', 'inhalation_exposure'],
    expectedEnergy: ['chemical_energy', 'atmospheric_hazard'],
  },
  {
    name: 'Highwall ground collapse',
    classification: 'Ground control',
    observationText: 'Highwall showing signs of failure near work area.',
    expectedMechanisms: ['crush', 'struck_by'],
    expectedEnergy: ['gravity'],
  },
  {
    name: 'Haul truck traffic hazard',
    classification: 'Powered haulage',
    observationText: 'Haul truck blind spots and traffic management gap near pedestrian.',
    expectedMechanisms: ['struck_by', 'caught_in_or_between'],
    expectedEnergy: ['kinetic_energy'],
  },
  {
    name: 'Hydraulic hose failure',
    classification: 'Pressure systems',
    observationText: 'High-pressure hydraulic hose failure striking worker.',
    expectedMechanisms: ['struck_by', 'laceration'],
    expectedEnergy: ['pressure'],
  },
];

function includesAny(actual: string[], expected: string[]) {
  return expected.some((item) => actual.includes(item));
}

async function main() {
  const service = new SafeScopeMechanismIntelligenceService();

  const results = [];

  for (const scenario of scenarios) {
    const mechanism = service.evaluate({
      classification: scenario.classification,
      observationText: scenario.observationText,
      risk: {
        riskBand: 'High',
        requiresShutdown: false,
      },
      suggestedStandards: [
        {
          citation: 'Coverage gauntlet candidate source',
          summary: 'Scenario-specific standards source placeholder for mechanism validation.',
        },
      ],
      evidenceContract: {
        missingInputs: [],
        reviewTriggers: [],
      },
      expertObservations: {
        humanReviewTriggers: [],
      },
      knowledgeMatches: [],
    } as any);

    assert(mechanism, `${scenario.name}: mechanismIntelligence must be present`);

    assert(
      mechanism.engine === 'safescope_mechanism_intelligence',
      `${scenario.name}: engine must be safescope_mechanism_intelligence`,
    );

    assert(
      includesAny(mechanism.injuryMechanisms, scenario.expectedMechanisms),
      `${scenario.name}: expected injury mechanism missing. Expected one of ${scenario.expectedMechanisms.join(', ')}, got ${mechanism.injuryMechanisms.join(', ')}`,
    );

    assert(
      includesAny(mechanism.primaryEnergySources, scenario.expectedEnergy),
      `${scenario.name}: expected energy source missing. Expected one of ${scenario.expectedEnergy.join(', ')}, got ${mechanism.primaryEnergySources.join(', ')}`,
    );

    assert(
      mechanism.credibleAccidentPathways.length > 0,
      `${scenario.name}: credible accident pathways must be present`,
    );

    assert(
      mechanism.evidenceNeeded.length > 0,
      `${scenario.name}: evidence needs must be present`,
    );

    assert(
      mechanism.canInventCitations === false,
      `${scenario.name}: mechanism intelligence cannot invent citations`,
    );

    assert(
      mechanism.canOverrideStandards === false,
      `${scenario.name}: mechanism intelligence cannot override standards`,
    );

    assert(
      mechanism.canReduceHumanReview === false,
      `${scenario.name}: mechanism intelligence cannot reduce human review`,
    );

    results.push({
      scenario: scenario.name,
      classification: mechanism.classification,
      mechanisms: mechanism.injuryMechanisms,
      energySources: mechanism.primaryEnergySources,
      pathways: mechanism.credibleAccidentPathways.length,
      evidenceNeeded: mechanism.evidenceNeeded.length,
      requiresQualifiedReview: mechanism.requiresQualifiedReview,
    });
  }

  console.log('✅ SafeScope OSHA/MSHA coverage gauntlet passed.');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error('❌ SafeScope OSHA/MSHA coverage gauntlet failed.');
  console.error(error);
  process.exit(1);
});
