// FROZEN PROBE FAMILY — hazardous-energy / MCC discrimination, and the bounded
// repro set for the Level-1 required-hazard omissions measured in Phase 2 of
// "Deterministic Level-1 Recall Closure Before Expert HazLenz".
//
// Authored 2026-08-28 BEFORE any source change and BEFORE engine output for the
// probe rows was inspected. Expectations come from safety-domain reasoning about
// what a qualified reviewer would confirm, never from what the engine emits. A
// probe row that fails is evidence about the engine, never a defect in the row.
//
// Two parts:
//
//   HAZARDOUS_ENERGY_PROBES — Phase 6. The decomposition layer emitted NOTHING
//     for the frozen corpus row B-15 (an MCC bucket opened with the upstream
//     disconnect closed and no lock applied). Because a single row cannot show
//     whether the engine distinguishes hazardous-energy EXPOSURE from a
//     genuinely isolated safe state, this family pairs each exposure case with
//     its safe counterpart and with wording that must not manufacture an
//     electrical or lockout finding at all.
//
//   LEVEL1_OMISSION_REPROS — Phase 5. The smallest reproducible statement of
//     each required hazard group that the complete deterministic Level-1
//     authority failed to represent, quoted verbatim from the frozen 56-row
//     corpus so the repro and the corpus can never drift apart.

export interface ProbeRow {
  id: string;
  intent: string;
  observation: string;
  /** At least one domain from each listed group must be emitted. */
  requiredGroups: string[][];
  /** None of these may be emitted. */
  forbiddenDomains: string[];
}

export const HAZARDOUS_ENERGY_PROBES: ProbeRow[] = [
  {
    id: 'HE-01',
    intent: 'MCC bucket opened, disconnect closed, no lock — exposure with no energy control',
    observation:
      'An electrician opened the motor control centre bucket and began replacing the starter while the upstream disconnect remained closed and no lock had been applied, exposing live 480-volt terminals.',
    requiredGroups: [['lockout_tagout'], ['electrical']],
    forbiddenDomains: [],
  },
  {
    id: 'HE-02',
    intent: 'Same task after verified isolation and lockout — safe state, no finding',
    observation:
      'An electrician opened the motor control centre bucket to replace the starter after the upstream disconnect was opened, his personal lock was applied and absence of voltage was verified at the terminals.',
    requiredGroups: [],
    forbiddenDomains: ['lockout_tagout', 'electrical'],
  },
  {
    id: 'HE-03',
    intent: 'Energized enclosure open with exposed conductors — electrical exposure',
    observation:
      'The 480-volt distribution panel door was standing open with energized conductors exposed beside the main walkway.',
    requiredGroups: [['electrical']],
    forbiddenDomains: [],
  },
  {
    id: 'HE-04',
    intent: 'Closed enclosure, no work occurring — descriptive, no finding',
    observation:
      'The motor control centre doors were closed and latched and no work was being performed on the equipment.',
    requiredGroups: [],
    forbiddenDomains: ['lockout_tagout', 'electrical'],
  },
  {
    id: 'HE-05',
    intent: 'Disconnect open but absence of voltage never established — verification omitted',
    observation:
      'The disconnect was opened but absence of voltage was not verified before the electrician began work inside the starter enclosure.',
    requiredGroups: [['lockout_tagout', 'electrical']],
    forbiddenDomains: [],
  },
  {
    id: 'HE-06',
    intent: 'Legitimate maintenance with documented LOTO — safe state, no finding',
    observation:
      'The conveyor drive was locked out and tagged by the assigned millwright, zero energy was verified at the motor, and the lockout log was signed before the guard repair began.',
    requiredGroups: [],
    forbiddenDomains: ['lockout_tagout', 'electrical'],
  },
  {
    id: 'HE-07',
    intent: 'Administrative records naming electrical and lockout — no physical condition',
    observation:
      'The electrical safety training matrix and the annual lockout procedure audit were both current at the maintenance office.',
    requiredGroups: [],
    forbiddenDomains: ['lockout_tagout', 'electrical'],
  },
  {
    id: 'HE-08',
    intent: 'Equipment named as stored stock — no energy, no exposure',
    observation:
      'A spare motor control centre bucket was stored on a shelf in the electrical room.',
    requiredGroups: [],
    forbiddenDomains: ['lockout_tagout', 'electrical'],
  },
];

export interface OmissionRepro {
  /** Frozen corpus row this repro is quoted from. */
  corpusRowId: string;
  lifeCritical: boolean;
  observation: string;
  /** At least one of these domains must be emitted. */
  requiredGroup: string[];
}

export const LEVEL1_OMISSION_REPROS: OmissionRepro[] = [
  {
    corpusRowId: 'B-07',
    lifeCritical: false,
    observation:
      'An employee entered the sludge tank through the side manway with no entry permit and no attendant, and the atmosphere had not been tested for oxygen deficiency or hydrogen sulphide before entry.',
    requiredGroup: ['atmospheric_hazard', 'ventilation_air_quality', 'respiratory_protection'],
  },
  {
    corpusRowId: 'B-10',
    lifeCritical: true,
    observation:
      'The hydraulic press was left with the ram raised and pressure retained in the cylinder while a fitter worked beneath it, and the light curtain guarding the point of operation had been bypassed with a jumper wire.',
    requiredGroup: ['hydraulic_pneumatic_energy', 'lockout_tagout'],
  },
  {
    corpusRowId: 'B-13',
    lifeCritical: false,
    observation:
      'Two masons were dry cutting concrete block indoors with no water suppression and no vacuum extraction, and neither was wearing a respirator despite a visible dust cloud in the breathing zone.',
    requiredGroup: ['respiratory_protection', 'ppe', 'ventilation_air_quality'],
  },
  {
    corpusRowId: 'B-15',
    lifeCritical: true,
    observation:
      'An electrician opened the motor control centre bucket and began replacing the starter while the upstream disconnect remained closed and no lock had been applied, exposing live 480-volt terminals.',
    requiredGroup: ['lockout_tagout'],
  },
  {
    corpusRowId: 'B-15',
    lifeCritical: true,
    observation:
      'An electrician opened the motor control centre bucket and began replacing the starter while the upstream disconnect remained closed and no lock had been applied, exposing live 480-volt terminals.',
    requiredGroup: ['electrical'],
  },
  {
    corpusRowId: 'B-16',
    lifeCritical: false,
    observation:
      'The pedestal grinder was operated with the tool rest missing and a twelve millimetre gap at the wheel, and the operator wore no eye or face protection.',
    requiredGroup: ['ppe'],
  },
  {
    corpusRowId: 'B-18',
    lifeCritical: true,
    observation:
      'A maintenance technician entered the mixer vessel through the top hatch to scrape residue while the agitator drive remained energized and unlocked, and no atmospheric test had been performed before entry.',
    requiredGroup: ['lockout_tagout'],
  },
  {
    corpusRowId: 'B-19',
    lifeCritical: true,
    observation:
      'A contractor was welding inside the empty fuel tank through the manway with no entry permit, no attendant and no ventilation, and no fire watch was posted outside.',
    requiredGroup: ['hot_work', 'welding_cutting'],
  },
  {
    corpusRowId: 'A-02',
    lifeCritical: false,
    observation: 'A grinder operator was not wearing a face shield while using a bench grinder.',
    requiredGroup: ['ppe'],
  },
];
