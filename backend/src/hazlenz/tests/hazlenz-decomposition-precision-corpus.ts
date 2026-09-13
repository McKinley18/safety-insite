// FROZEN EVALUATION CORPUS — secondary-hazard decomposition precision / recall.
//
// Authored 2026-08-27 for the bounded measurement demanded by
// verification/insite-v1-inspection-workflow-2026-08-27/PRECISION_DEFECT_MATERIAL_HANDLING.md
// §4, BEFORE any engine output for these rows was inspected and BEFORE any
// source change. Expectations are authored from safety-domain reasoning about
// what a qualified reviewer would confirm, not from what the engine happens to
// emit. Rows must not be edited to match engine behaviour: a row that fails is
// evidence about the engine, never a defect in the row.
//
// Two independently scored populations:
//
//   Population A — contextual / incidental language that must NOT independently
//   create a hazard. Clauses supplying energy state, exposure, proximity,
//   access, material state, PPE identity, or descriptive/negated/historical
//   context IN SUPPORT OF another hazard (or of nothing at all).
//     `requiredDomains`  families that legitimately own the row's real hazard
//                        and must still be emitted (an A row is also a recall
//                        check: precision must not be bought with suppression).
//     `forbiddenDomains` families that must NOT be emitted from the incidental
//                        language. These are the precision assertions.
//     `allowedDomains`   families that are defensible for this row and are
//                        neither required nor forbidden (not scored).
//
//   Population B — genuine multi-hazard observations where every listed hazard
//   has its own independently sufficient evidence fragment and would require
//   its own finding, standard and corrective action.
//     `required`         groups; a group is satisfied when ANY of its domains
//                        is emitted (some hazards are legitimately expressible
//                        under more than one taxonomy family).
//     `lifeCritical`     a group whose omission is a life-critical omission.
//
// Any domain emitted for a Population A row that is neither required nor
// allowed is a false secondary-hazard promotion.

export interface PopulationARow {
  id: string;
  category: string;
  observation: string;
  requiredDomains: string[];
  forbiddenDomains: string[];
  allowedDomains: string[];
}

export interface PopulationBGroup {
  domains: string[];
  lifeCritical: boolean;
}

export interface PopulationBRow {
  id: string;
  category: string;
  observation: string;
  required: PopulationBGroup[];
  allowedDomains: string[];
}

// ---------------------------------------------------------------------------
// POPULATION A — contextual/incidental language must not create a hazard
// ---------------------------------------------------------------------------

export const POPULATION_A: PopulationARow[] = [
  // --- preserved real failures (defect document §1 and §2) ---
  {
    id: 'A-01',
    category: 'preserved-failure/material-feed incidental to guarding',
    observation:
      'At the crusher drive the guard over the conveyor tail pulley had been removed and was lying on the ground beside the frame. The conveyor was running and material was being fed. No barricade or warning sign was in place, and the walkway passes within about two feet of the exposed pinch point.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: [
      'material_handling',
      'material_handling_storage',
      'walking_working_surfaces',
      'slips_trips_falls',
    ],
    allowedDomains: ['conveyors'],
  },
  {
    id: 'A-02',
    category: 'preserved-failure/PPE shield is not an excavation shield',
    observation: 'A grinder operator was not wearing a face shield while using a bench grinder.',
    requiredDomains: ['ppe'],
    forbiddenDomains: ['excavation_trenching'],
    allowedDomains: ['machine_guarding', 'silica_respirable_dust'],
  },
  {
    id: 'A-03',
    category: 'preserved-failure/welding shield is not an excavation shield',
    observation: 'The welder was not using a welding shield.',
    requiredDomains: [],
    forbiddenDomains: ['excavation_trenching'],
    allowedDomains: ['ppe', 'hot_work', 'welding_cutting', 'welding_fumes'],
  },
  {
    id: 'A-04',
    category: 'preserved-failure/splash shield is not an excavation shield',
    observation: 'A splash shield was missing from the parts washer.',
    requiredDomains: [],
    forbiddenDomains: ['excavation_trenching'],
    allowedDomains: ['ppe', 'machine_guarding', 'hazcom', 'chemical_exposure', 'chemical_release'],
  },

  // --- material / feed / move / handling language incidental to machine operation ---
  {
    id: 'A-05',
    category: 'material-feed incidental to machine operation',
    observation:
      'The point of operation guard on the mechanical shear had been removed while the operator continued feeding material into the machine.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: ['material_handling', 'material_handling_storage'],
    allowedDomains: [],
  },
  {
    id: 'A-06',
    category: 'material-feed incidental to machine operation',
    observation:
      'The screw conveyor at the bagging line was running with its inlet screen removed, exposing an unguarded in-running nip point while material moved along the flight.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: ['material_handling', 'material_handling_storage'],
    allowedDomains: ['conveyors'],
  },
  {
    id: 'A-07',
    category: 'material-feed incidental to energy control',
    observation:
      'An operator cleared a jam by reaching into the baler while it was still energized and material was being fed from the infeed table; no lock or tag had been applied.',
    requiredDomains: ['lockout_tagout'],
    forbiddenDomains: ['material_handling', 'material_handling_storage'],
    allowedDomains: ['machine_guarding'],
  },
  {
    id: 'A-08',
    category: 'material-in-motion incidental to guarding',
    observation:
      'A worker was drawn toward the unguarded tail pulley of the stacker; the belt was carrying material at the time.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: ['material_handling', 'material_handling_storage'],
    allowedDomains: ['conveyors'],
  },

  // --- shield / guard / barrier language that is PPE, machine guarding or civil, not excavation ---
  {
    id: 'A-09',
    category: 'shield vocabulary/electrical arc-flash shield',
    observation:
      'The arc-flash shield on the 480-volt panel door was missing and energized parts were exposed.',
    requiredDomains: ['electrical'],
    forbiddenDomains: ['excavation_trenching'],
    allowedDomains: ['ppe'],
  },
  {
    id: 'A-10',
    category: 'shield vocabulary/thermal heat shield',
    observation: 'The heat shield over the exhaust manifold on the standby generator was missing.',
    requiredDomains: [],
    forbiddenDomains: ['excavation_trenching'],
    allowedDomains: ['hot_work', 'fire_explosion', 'machine_guarding', 'mobile_equipment'],
  },
  {
    id: 'A-11',
    category: 'shield vocabulary/verb form, no hazard',
    observation: 'Operators were shielding their eyes from the low sun at the scale house window.',
    requiredDomains: [],
    forbiddenDomains: ['excavation_trenching', 'ppe'],
    allowedDomains: [],
  },
  {
    id: 'A-12',
    category: 'barrier vocabulary/descriptive site feature',
    observation:
      'A concrete jersey barrier separated the visitor parking area from the office walkway.',
    requiredDomains: [],
    forbiddenDomains: [
      'excavation_trenching',
      'walking_working_surfaces',
      'mobile_equipment',
      'traffic_control',
      'slips_trips_falls',
    ],
    allowedDomains: [],
  },

  // --- vehicle / fork / truck words in unrelated contexts ---
  {
    id: 'A-13',
    category: 'vehicle vocabulary/location descriptor only',
    observation: 'The fire extinguisher bracket in the forklift charging room was empty.',
    requiredDomains: [],
    forbiddenDomains: ['mobile_equipment', 'powered_industrial_trucks', 'forklifts'],
    allowedDomains: ['fire_protection', 'fire_explosion'],
  },
  {
    id: 'A-14',
    category: 'vehicle and pressure vocabulary/location descriptor only',
    observation: 'The emergency eyewash station beside the truck wash bay had no water flow.',
    requiredDomains: [],
    forbiddenDomains: [
      'mobile_equipment',
      'powered_industrial_trucks',
      'pressure_systems',
      'compressed_gas',
    ],
    allowedDomains: ['first_aid_medical', 'hazcom'],
  },
  {
    id: 'A-15',
    category: 'vehicle vocabulary/possessive descriptor only',
    observation: "A first-aid kit was missing from the loader operator's break trailer.",
    requiredDomains: [],
    forbiddenDomains: ['mobile_equipment', 'forklifts', 'powered_industrial_trucks'],
    allowedDomains: ['first_aid_medical'],
  },
  {
    id: 'A-16',
    category: 'vehicle vocabulary/verified-safe administrative record',
    observation:
      'Torque specifications for the fork lift tine retaining pins were posted at the maintenance desk and were current.',
    requiredDomains: [],
    forbiddenDomains: ['mobile_equipment', 'powered_industrial_trucks', 'forklifts'],
    allowedDomains: [],
  },

  // --- pressure / line / hose terminology where no pressure-system hazard exists ---
  {
    id: 'A-17',
    category: 'hose vocabulary/no pressure hazard',
    observation:
      'The garden hose used for dust suppression was coiled on its reel and stowed at the end of the shift.',
    requiredDomains: [],
    forbiddenDomains: ['compressed_gas', 'pressure_systems', 'hydraulic_pneumatic_energy'],
    allowedDomains: [],
  },
  {
    id: 'A-18',
    category: 'line vocabulary/unrelated sense of the word',
    observation: 'Workers were queued in line at the muster point during the evacuation drill.',
    requiredDomains: [],
    forbiddenDomains: ['compressed_gas', 'pressure_systems', 'hydraulic_pneumatic_energy'],
    allowedDomains: ['emergency_egress'],
  },
  {
    id: 'A-19',
    category: 'hydraulic and excavator vocabulary/verified intact',
    observation:
      'The hydraulic hoses on the excavator were inspected last week and were found intact and free of leaks.',
    requiredDomains: [],
    forbiddenDomains: [
      'hydraulic_pneumatic_energy',
      'compressed_gas',
      'pressure_systems',
      'excavation_trenching',
    ],
    allowedDomains: ['mobile_equipment'],
  },
  {
    id: 'A-20',
    category: 'pneumatic vocabulary/energy verified at zero',
    observation:
      'Air pressure to the pneumatic press was isolated, bled to zero and verified before the guard was refitted.',
    requiredDomains: [],
    forbiddenDomains: ['hydraulic_pneumatic_energy', 'compressed_gas', 'lockout_tagout'],
    allowedDomains: [],
  },

  // --- hot / grind / cut words in negated, historical, or irrelevant context ---
  {
    id: 'A-21',
    category: 'hot-work vocabulary/historical and closed out',
    observation:
      "The hot work permit for last month's welding in the pump house was closed out and the fire watch had signed off.",
    requiredDomains: [],
    forbiddenDomains: ['hot_work', 'fire_explosion', 'welding_cutting', 'welding_fumes'],
    allowedDomains: [],
  },
  {
    id: 'A-22',
    category: 'hot-work vocabulary/explicitly negated',
    observation:
      'No welding, cutting or other hot work was taking place anywhere in the tank farm during this inspection.',
    requiredDomains: [],
    forbiddenDomains: ['hot_work', 'fire_explosion', 'welding_cutting', 'welding_fumes'],
    allowedDomains: [],
  },
  {
    id: 'A-23',
    category: 'cutting vocabulary/unrelated sense of the word',
    observation:
      'Employees were cutting their lunch break short in order to attend the toolbox talk.',
    requiredDomains: [],
    forbiddenDomains: ['hot_work', 'welding_cutting', 'silica_respirable_dust', 'combustible_dust'],
    allowedDomains: ['training_competency'],
  },
  {
    id: 'A-24',
    category: 'grinding vocabulary/verified compliant condition',
    observation:
      'The grinding wheel guard on the pedestal grinder was correctly fitted and the tool rest was set at one eighth of an inch.',
    requiredDomains: [],
    forbiddenDomains: ['machine_guarding', 'ppe', 'hot_work', 'silica_respirable_dust'],
    allowedDomains: [],
  },
  {
    id: 'A-25',
    category: 'hot vocabulary/unrelated equipment with current inspection',
    observation:
      'The hot water heater in the office restroom carried a current inspection tag and showed no defects.',
    requiredDomains: [],
    forbiddenDomains: ['hot_work', 'fire_explosion', 'pressure_systems'],
    allowedDomains: [],
  },

  // --- fall / opening / trench words used descriptively but without an active hazard ---
  {
    id: 'A-26',
    category: 'trench vocabulary/completed and backfilled',
    observation:
      'The trench that was excavated last autumn has been fully backfilled, compacted and paved over.',
    requiredDomains: [],
    forbiddenDomains: ['excavation_trenching', 'fall_protection'],
    allowedDomains: [],
  },
  {
    id: 'A-27',
    category: 'opening vocabulary/effectively covered',
    observation:
      'The floor opening at the mezzanine was fitted with a hinged cover that was closed, latched and labelled.',
    requiredDomains: [],
    forbiddenDomains: ['fall_protection', 'walking_working_surfaces', 'slips_trips_falls'],
    allowedDomains: [],
  },
  {
    id: 'A-28',
    category: 'fall vocabulary/unrelated sense of the word',
    observation:
      'Autumn leaf fall around the yard drains is cleared every week under the housekeeping schedule.',
    requiredDomains: [],
    forbiddenDomains: ['fall_protection', 'slips_trips_falls'],
    allowedDomains: ['housekeeping'],
  },
  {
    id: 'A-29',
    category: 'handrail vocabulary/verified sound',
    observation:
      'The stairway handrail was continuous, secure and free of damage on both flights.',
    requiredDomains: [],
    forbiddenDomains: ['fall_protection', 'walking_working_surfaces', 'slips_trips_falls'],
    allowedDomains: [],
  },

  // --- proximity / exposure clauses that are predicates of another hazard ---
  {
    id: 'A-30',
    category: 'proximity clause supporting a guarding hazard',
    observation:
      'The unguarded shaft coupling on the transfer pump was turning at full speed and the walkway passes within two feet of it.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: ['walking_working_surfaces', 'slips_trips_falls'],
    allowedDomains: [],
  },
  {
    id: 'A-31',
    category: 'proximity clause supporting an electrical hazard',
    observation:
      'A 480-volt panel door stood open with live parts exposed, directly beside the main aisle where employees pass.',
    requiredDomains: ['electrical'],
    forbiddenDomains: [
      'walking_working_surfaces',
      'material_handling',
      'material_handling_storage',
      'slips_trips_falls',
    ],
    allowedDomains: [],
  },
  {
    id: 'A-32',
    category: 'energy-state clause supporting a guarding hazard',
    observation:
      'The guard over the drive chain on the elevator head was missing and the machine was running.',
    requiredDomains: ['machine_guarding'],
    forbiddenDomains: ['lockout_tagout', 'hydraulic_pneumatic_energy'],
    allowedDomains: [],
  },
  {
    id: 'A-33',
    category: 'observer-position clause, no hazard stated',
    observation:
      'Two employees were standing on the ground beside the crusher watching the belt run.',
    requiredDomains: [],
    forbiddenDomains: [
      'machine_guarding',
      'fall_protection',
      'walking_working_surfaces',
      'slips_trips_falls',
      'mobile_equipment',
    ],
    allowedDomains: [],
  },
  {
    id: 'A-34',
    category: 'storage vocabulary/verified compliant condition',
    observation:
      'Storage racks in the warehouse were within their posted load limits and all pallets were shrink-wrapped and squared.',
    requiredDomains: [],
    forbiddenDomains: ['material_handling', 'material_handling_storage', 'suspended_loads'],
    allowedDomains: [],
  },
];

// ---------------------------------------------------------------------------
// POPULATION B — genuine multi-hazard observations that MUST continue to split
// ---------------------------------------------------------------------------

export const POPULATION_B: PopulationBRow[] = [
  {
    id: 'B-01',
    category: 'machine guarding + LOTO',
    observation:
      'A millwright reached into the packaging machine to clear a jam while the drive was still energized and no lock or tag had been applied. Separately, the fixed guard over the drive sprocket had been removed and was lying on the floor.',
    required: [
      { domains: ['lockout_tagout'], lifeCritical: true },
      { domains: ['machine_guarding'], lifeCritical: true },
    ],
    allowedDomains: ['conveyors', 'material_handling', 'material_handling_storage'],
  },
  {
    id: 'B-02',
    category: 'electrical + machine guarding',
    observation:
      'The cover of the 480-volt junction box on the mixer was missing, leaving energized conductors exposed. The mixer paddle shaft was also running with its guard removed, exposing an in-running nip point.',
    required: [
      { domains: ['electrical'], lifeCritical: true },
      { domains: ['machine_guarding'], lifeCritical: true },
    ],
    allowedDomains: [],
  },
  {
    id: 'B-03',
    category: 'excavation + fall protection',
    observation:
      'A worker was working in an unshored trench three metres deep with a spoil pile at the edge, and the adjacent elevated platform had an open edge with no guardrail.',
    required: [
      { domains: ['excavation_trenching'], lifeCritical: true },
      { domains: ['fall_protection'], lifeCritical: true },
    ],
    allowedDomains: ['ground_control'],
  },
  {
    id: 'B-04',
    category: 'hot work + fire/explosion',
    observation:
      'A welder was cutting on a pipe stand with no fire watch posted, and combustible cardboard packaging was stacked directly beneath the work within a metre of the falling sparks.',
    required: [
      { domains: ['hot_work', 'welding_cutting'], lifeCritical: true },
      { domains: ['fire_explosion', 'fire_protection'], lifeCritical: true },
    ],
    allowedDomains: ['welding_fumes', 'ppe', 'housekeeping', 'material_handling_storage'],
  },
  {
    id: 'B-05',
    category: 'compressed gas / unsecured cylinder + hot work',
    observation:
      'Unchained oxygen and acetylene cylinders with their valve protection caps removed were standing against the wall of the welding bay, and a cutting torch was in use on steel two metres away with no fire watch.',
    required: [
      { domains: ['compressed_gas'], lifeCritical: true },
      { domains: ['hot_work', 'welding_cutting'], lifeCritical: true },
    ],
    allowedDomains: ['fire_explosion', 'fire_protection', 'welding_fumes'],
  },
  {
    id: 'B-06',
    category: 'mobile equipment + traffic control',
    observation:
      'A haul truck was backing across the plant road with no functioning reverse alarm, and the pedestrian walkway crossing that road had no barricade, no signage and no designated crossing point.',
    required: [
      {
        domains: ['mobile_equipment', 'powered_industrial_trucks', 'forklifts'],
        lifeCritical: true,
      },
      { domains: ['traffic_control'], lifeCritical: false },
    ],
    allowedDomains: ['walking_working_surfaces'],
  },
  {
    id: 'B-07',
    category: 'confined space + atmospheric hazard',
    observation:
      'An employee entered the sludge tank through the side manway with no entry permit and no attendant, and the atmosphere had not been tested for oxygen deficiency or hydrogen sulphide before entry.',
    required: [
      { domains: ['confined_space'], lifeCritical: true },
      {
        domains: ['atmospheric_hazard', 'ventilation_air_quality', 'respiratory_protection'],
        lifeCritical: false,
      },
    ],
    allowedDomains: [],
  },
  {
    id: 'B-08',
    category: 'chemical exposure + PPE',
    observation:
      'A worker was decanting sulphuric acid from a drum into an open tote without goggles or a face shield, and the drum itself was unlabelled with no safety data sheet available at the point of use.',
    required: [
      { domains: ['hazcom', 'chemical_exposure', 'sds_labeling'], lifeCritical: true },
      { domains: ['ppe'], lifeCritical: false },
    ],
    allowedDomains: ['chemical_release', 'environmental_spill'],
  },
  {
    id: 'B-09',
    category: 'suspended load + rigging',
    observation:
      'A load of formwork was left suspended from the crane hook over the work area during the break, and the nylon sling supporting it had a cut through more than half of its width.',
    required: [
      { domains: ['suspended_loads', 'cranes_hoists'], lifeCritical: true },
      { domains: ['rigging_lifting'], lifeCritical: true },
    ],
    allowedDomains: ['material_handling', 'material_handling_storage'],
  },
  {
    id: 'B-10',
    category: 'stored energy + machine guarding',
    observation:
      'The hydraulic press was left with the ram raised and pressure retained in the cylinder while a fitter worked beneath it, and the light curtain guarding the point of operation had been bypassed with a jumper wire.',
    required: [
      { domains: ['hydraulic_pneumatic_energy', 'lockout_tagout'], lifeCritical: true },
      { domains: ['machine_guarding', 'guarding_interlocks'], lifeCritical: true },
    ],
    allowedDomains: ['compressed_gas'],
  },
  {
    id: 'B-11',
    category: 'fall protection + obstructed access',
    observation:
      'Workers on the third-floor deck were within a metre of an open leading edge with no guardrail and no personal fall arrest, and the access path to that area was obstructed by scrap timber and coils of cable.',
    required: [{ domains: ['fall_protection'], lifeCritical: true }],
    allowedDomains: [
      'housekeeping',
      'slips_trips_falls',
      'walking_working_surfaces',
      'emergency_egress',
    ],
  },
  {
    id: 'B-12',
    category: 'electrical + fall protection',
    observation:
      'A damaged extension cord with exposed conductors ran across the wet floor of the wash bay, and the ladder an employee used to reach the light fixture above had two broken rungs.',
    required: [
      { domains: ['electrical'], lifeCritical: true },
      { domains: ['fall_protection'], lifeCritical: true },
    ],
    allowedDomains: ['slips_trips_falls', 'walking_working_surfaces', 'housekeeping'],
  },
  {
    id: 'B-13',
    category: 'respirable silica + respiratory protection',
    observation:
      'Two masons were dry cutting concrete block indoors with no water suppression and no vacuum extraction, and neither was wearing a respirator despite a visible dust cloud in the breathing zone.',
    required: [
      { domains: ['silica_respirable_dust', 'combustible_dust'], lifeCritical: true },
      { domains: ['respiratory_protection', 'ppe', 'ventilation_air_quality'], lifeCritical: false },
    ],
    allowedDomains: [],
  },
  {
    id: 'B-14',
    category: 'excavation + electrical',
    observation:
      'An excavation two and a half metres deep beside the substation was unshored with vertical walls, and an energized 600-volt cable was left exposed and unsupported across the open trench.',
    required: [
      { domains: ['excavation_trenching'], lifeCritical: true },
      { domains: ['electrical'], lifeCritical: true },
    ],
    allowedDomains: ['ground_control', 'fall_protection'],
  },
  {
    id: 'B-15',
    category: 'LOTO + electrical',
    observation:
      'An electrician opened the motor control centre bucket and began replacing the starter while the upstream disconnect remained closed and no lock had been applied, exposing live 480-volt terminals.',
    required: [
      { domains: ['lockout_tagout'], lifeCritical: true },
      { domains: ['electrical'], lifeCritical: true },
    ],
    allowedDomains: ['ppe'],
  },
  {
    id: 'B-16',
    category: 'machine guarding + PPE',
    observation:
      'The pedestal grinder was operated with the tool rest missing and a twelve millimetre gap at the wheel, and the operator wore no eye or face protection.',
    required: [
      { domains: ['machine_guarding'], lifeCritical: false },
      { domains: ['ppe'], lifeCritical: false },
    ],
    allowedDomains: ['silica_respirable_dust', 'hot_work'],
  },
  {
    id: 'B-17',
    category: 'powered industrial truck + material storage',
    observation:
      'A forklift was driven with the forks raised and the load obscuring the operator view, and pallets in the racking above the aisle were stacked past the beam with an unsecured overhang.',
    required: [
      {
        domains: ['powered_industrial_trucks', 'forklifts', 'mobile_equipment'],
        lifeCritical: true,
      },
      { domains: ['material_handling_storage', 'material_handling'], lifeCritical: false },
    ],
    allowedDomains: ['suspended_loads', 'traffic_control'],
  },
  {
    id: 'B-18',
    category: 'confined space + LOTO',
    observation:
      'A maintenance technician entered the mixer vessel through the top hatch to scrape residue while the agitator drive remained energized and unlocked, and no atmospheric test had been performed before entry.',
    required: [
      { domains: ['confined_space'], lifeCritical: true },
      { domains: ['lockout_tagout'], lifeCritical: true },
    ],
    allowedDomains: [
      'machine_guarding',
      'atmospheric_hazard',
      'ventilation_air_quality',
      'respiratory_protection',
    ],
  },
  {
    id: 'B-19',
    category: 'hot work + confined space',
    observation:
      'A contractor was welding inside the empty fuel tank through the manway with no entry permit, no attendant and no ventilation, and no fire watch was posted outside.',
    required: [
      { domains: ['hot_work', 'welding_cutting'], lifeCritical: true },
      { domains: ['confined_space'], lifeCritical: true },
    ],
    allowedDomains: [
      'fire_explosion',
      'fire_protection',
      'welding_fumes',
      'ventilation_air_quality',
      'atmospheric_hazard',
      'respiratory_protection',
      'contractor_coordination',
    ],
  },
  {
    id: 'B-20',
    category: 'fall protection + suspended load',
    observation:
      'A rigger was standing on an unguarded platform edge four metres above the slab to guide a steel beam that was hanging from the crane directly overhead.',
    required: [
      { domains: ['fall_protection'], lifeCritical: true },
      { domains: ['suspended_loads', 'cranes_hoists', 'rigging_lifting'], lifeCritical: true },
    ],
    allowedDomains: ['walking_working_surfaces'],
  },
  {
    id: 'B-21',
    category: 'chemical release + PPE',
    observation:
      'A drum of waste solvent had tipped and was leaking across the yard toward an open storm drain, and two workers were shovelling absorbent into the spill without gloves or respiratory protection.',
    required: [
      { domains: ['environmental_spill', 'chemical_release', 'hazcom'], lifeCritical: true },
      { domains: ['ppe', 'respiratory_protection'], lifeCritical: false },
    ],
    allowedDomains: ['fire_explosion', 'chemical_exposure', 'sds_labeling'],
  },
  {
    id: 'B-22',
    category: 'machine guarding + mobile equipment',
    observation:
      'The conveyor tail pulley at the transfer point was unguarded, and a loader was operating within two metres of the same walkway with no barricade and no spotter.',
    required: [
      { domains: ['machine_guarding', 'conveyors'], lifeCritical: true },
      {
        domains: ['mobile_equipment', 'powered_industrial_trucks', 'forklifts'],
        lifeCritical: true,
      },
    ],
    allowedDomains: ['traffic_control', 'walking_working_surfaces'],
  },
];
