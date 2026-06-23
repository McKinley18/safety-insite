import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';
import { VagueInputAnalysis, VagueHazardFamily } from './vague-input-intelligence.types';

type VagueRule = {
  id: string;
  matches: RegExp[];
  domain: SafeScopeReasoningDomain;
  observedFact: string;
  possibilities: string[];
  missingFacts: string[];
  questions: string[];
  controls: string[];
};

const VAGUE_RULES: VagueRule[] = [
  {
    id: 'vague-electrical',
    matches: [
      /\b(panel looks bad|electrical issue|cord problem|breaker problem|wire exposed maybe|breaker issue|fuse issue|energized issue|high voltage concern|exposed wire|outlet issue|panel issue|electrical hazard|power cord issue)\b/i
    ],
    domain: 'electrical',
    observedFact: 'Unspecified electrical component or enclosure condition concern reported.',
    possibilities: [
      'Exposed live electrical parts within panels or enclosures.',
      'Damaged cord insulation or compromised conductors.',
      'Overloaded electrical circuits or unrated temporary wiring.',
      'Blocked workspace access or inadequate clearance in front of electrical panels.'
    ],
    missingFacts: [
      'Voltage level and equipment type involved.',
      'Whether energized/live parts are exposed to touch.',
      'Cover, dead-front, or enclosure rating and physical condition.',
      'Employee proximity, accessibility, and tasks conducted near the equipment.'
    ],
    questions: [
      'Is there an exposed energized part, missing cover, damaged cord, or blocked panel access?',
      'What voltage or equipment is involved, and can unqualified employees access or contact it?',
      'Has a qualified electrical person evaluated this condition?'
    ],
    controls: [
      'Restrict access to the area and warn employees to stay clear of the electrical panel or component.',
      'Do not touch exposed enclosures, breaker slots, or damaged wiring.',
      'Have a qualified electrical person de-energize the equipment or install proper covers.'
    ]
  },
  {
    id: 'vague-fall',
    matches: [
      /\b(fall hazard|ladder issue|open hole maybe|fall concern|stairs issue|stairway problem|ladder concern)\b/i
    ],
    domain: 'fall_protection',
    observedFact: 'Unspecified elevated fall hazard, ladder condition, or opening concern reported.',
    possibilities: [
      'Fall from heights due to unguarded platform edges, floor openings, or defective ladders.',
      'Defective portable or fixed ladders.',
      'Unguarded stairways or open floor holes.'
    ],
    missingFacts: [
      'Fall height, opening dimensions, or edge proximity.',
      'Worker task context, training, and PPE (harness/lanyard) used.',
      'Specific ladder defect or stairway guarding condition.'
    ],
    questions: [
      'What fall height is involved, or is this a same-level slip/trip/housekeeping concern?',
      'Is this a floor hole, platform edge, roof edge, ladder, scaffold, or obstructed walkway?',
      'What fall protection, guarding, or housekeeping controls are currently in place?'
    ],
    controls: [
      'Isolate the area or block access to the elevated edge, floor opening, or defective ladder.',
      'Tag defective ladders out of service and remove them from the work area.',
      'Ensure proper guardrails, covers, or personal fall arrest systems are deployed.'
    ]
  },
  {
    id: 'vague-walking',
    matches: [
      /\b(trip hazard|slip issue|bad housekeeping|housekeeping issue|slippery|blocked walkway|blocked travelway|blocked aisle|access issue|blocked access|clutter|debris)\b/i
    ],
    domain: 'walking_working_surfaces',
    observedFact: 'Unspecified walking surface condition, slip/trip risk, or walkway obstruction reported.',
    possibilities: [
      'Slip/trip hazards from accumulated debris, spills, or cord routing.',
      'Blocked emergency egress or access routes to work areas.'
    ],
    missingFacts: [
      'Walking surface contamination type (oil, water, dust) or material accumulation details.',
      'Worker travel path, task context, and frequency of use.',
      'Current safety barriers or warning signs present.'
    ],
    questions: [
      'What is the specific walking surface defect or housekeeping issue?',
      'Is this an obstructed walkway, emergency exit, or slippery floor?',
      'What housekeeping, cleanup, or warning controls are currently in place?'
    ],
    controls: [
      'Isolate the area or block access to the slippery walkway.',
      'Clean up any spills, dust, or debris immediately, and route cords out of travel paths.',
      'Deploy proper warning signs and restore clear access pathways.'
    ]
  },
  {
    id: 'vague-chemical-env',
    matches: [
      /\b(chemical issue|open container|container not right|spill|leak near drain|odor in area|chemical spill|chemical leak|oil leak|drum issue|tank issue|unlabeled container|no label)\b/i
    ],
    domain: 'hazard_communication',
    observedFact: 'Unspecified chemical container, labeling, or environmental release concern reported.',
    possibilities: [
      'Unlabeled chemical container causing identification failure.',
      'Open container causing chemical evaporation, spill, or exposure.',
      'Liquid release migrating to stormwater drains, soil, or water systems.',
      'Hazardous vapor/odor accumulation in an enclosed space.'
    ],
    missingFacts: [
      'Substance identity, chemical concentration, and hazard properties.',
      'Container volume, material compatibility, and closure status.',
      'Proximity to stormwater drains, soil pathways, or ignition sources.',
      'Availability of the corresponding Safety Data Sheet (SDS).'
    ],
    questions: [
      'What is the container type and what substance/material is stored inside?',
      'Is the container labeled, compatible, closed, and placed in secondary containment?',
      'Are drains, soil, or worker exposure pathways nearby, and is an SDS available?'
    ],
    controls: [
      'Do not handle the container or spill unless the chemical identity is confirmed.',
      'Ensure the container is closed, and place it in compatible secondary containment.',
      'Protect nearby drains and ensure appropriate spill response materials are available.'
    ]
  },
  {
    id: 'vague-guarding',
    matches: [
      /^\s*missing guard\s*$/i,
      /^\s*guard issue\s*$/i,
      /^\s*guarding issue\s*$/i,
      /^\s*guard missing\s*$/i,
      /^\s*missing guard\s*$/i,
    ],
    domain: 'machine_guarding_loto',
    observedFact: 'An unspecified guarding concern was reported.',
    possibilities: [
      'Missing machine guard on a rotating part, nip point, or point of operation.',
      'Missing guardrail or opening protection at an elevated edge or floor opening.',
      'Missing barrier or cover where access to moving parts or an opening exists.',
    ],
    missingFacts: [
      'What equipment, opening, or edge is missing the guard?',
      'Is the equipment operating, energized, or otherwise accessible to workers?',
      'Which jurisdiction applies: OSHA General Industry, OSHA Construction, or MSHA?',
    ],
    questions: [
      'What equipment, opening, edge, or moving part is missing the guard?',
      'Is the equipment operating or energized, and are workers exposed to contact or a fall/opening hazard?',
      'Is this OSHA General Industry, OSHA Construction, or MSHA?'
    ],
    controls: [
      'Keep workers away from the exposed hazard until a qualified review is completed.',
      'Stop or isolate moving equipment if motion is involved, and apply LOTO where required.',
      'Install or replace the appropriate guard, cover, or guardrail after qualified verification.'
    ]
  },
  {
    id: 'vague-machine-loto',
    matches: [
      /\b(guard issue|machine unsafe|conveyor problem|maintenance hazard|lockout concern|rotating part maybe exposed|guarding issue|pulley issue|loto issue|lockout problem|pinch point|nip point|guard missing maybe|machine guard issue)\b/i
    ],
    domain: 'machine_guarding_loto',
    observedFact: 'Unspecified machine guarding, lockout/tagout, or mechanical servicing concern reported.',
    possibilities: [
      'Accessible rotating parts, shaft couplings, or belt pulleys.',
      'Missing or loose guards on active machinery or conveyors.',
      'Unexpected startup or energy release during cleanup/maintenance tasks.'
    ],
    missingFacts: [
      'Equipment operating state (running, idle, under repair).',
      'The specific rotating part, shaft, coupling, or guard defect.',
      'Application of lockout/tagout (LOTO) and zero-energy verification.',
      'Exposure of hands, clothing, or tools to dangerous moving parts.'
    ],
    questions: [
      'Is the machine or conveyor energized, operating, or being cleaned/serviced?',
      'Which pulley, rotating shaft, or nip point is unguarded or accessible?',
      'What lockout, blocking, and zero-energy verification has been applied?'
    ],
    controls: [
      'Stop work and keep workers clear of moving parts until guarding is verified.',
      'Isolate all energy sources and apply personal locks/tags before servicing or cleanup.',
      'Ensure fixed guards are securely installed and prevent body contact before restarting.'
    ]
  },
  {
    id: 'vague-mobile-traffic',
    matches: [
      /\b(forklift area unsafe|traffic issue|truck backing concern|pedestrians near equipment|blind corner|blind turn|pedestrian safety|vehicle issue|traffic concern|loader issue|haul road issue|haul truck issue)\b/i
    ],
    domain: 'mobile_equipment',
    observedFact: 'Unspecified mobile equipment operation or pedestrian traffic conflict concern reported.',
    possibilities: [
      'Pedestrians entering active mobile equipment operating zones without visibility.',
      'Sight-distance limitations at blind corners on equipment routes.',
      'Backing vehicles without functioning alarms or spotters.'
    ],
    missingFacts: [
      'Type of equipment moving and speed/frequency of traffic.',
      'Presence of physical barriers, warning signs, or designated walkways.',
      'Operator visibility (mirrors, cameras) and positive communication status.',
      'Worker pedestrian training and traffic rules enforcement.'
    ],
    questions: [
      'What mobile equipment is moving, and are pedestrians or other vehicles nearby?',
      'Are physical barriers, alarms, mirrors, signs, or spotters in use at conflict areas?',
      'Are operators authorized and are pedestrians trained on the traffic plan?'
    ],
    controls: [
      'Separate pedestrian routes from active equipment travel ways using physical barriers.',
      'Require operators to sound horns, use spotters, and verify pedestrian clearance.',
      'Verify that backup alarms, beacons, and mirrors are clean and functional.'
    ]
  },
  {
    id: 'vague-msha-mine',
    matches: [
      /\b(mine safety issue|berm problem|crusher area dusty|highwall concern|screen plant problem|conveyor issue at pit|pit safety|quarry safety|mine hazard|msha concern|berm issue|highwall issue)\b/i
    ],
    domain: 'ground_control',
    observedFact: 'Unspecified mining context, highwall stability, berm condition, or pit safety concern reported.',
    possibilities: [
      'Drop-offs or haul road edges lacking adequate berms or safety barriers.',
      'Loose rock or highwall instability creating falling material hazards.',
      'Airborne dust exposure at mine processing equipment (crushers, screens).'
    ],
    missingFacts: [
      'Haul road edge drop-off height or berm height relative to vehicle wheel size.',
      'Highwall height, slope, scaling status, and miner proximity.',
      'Dust concentration, processing task, and respiratory protection used.',
      'Specific mine jurisdiction (MSHA surface/underground metal/nonmetal or coal).'
    ],
    questions: [
      'Is this a surface or underground mine, and does MSHA or OSHA apply?',
      'What is the berm height relative to the largest vehicle wheel, or what is the highwall condition?',
      'Are miners exposed to dust, falling material, or unguarded equipment?'
    ],
    controls: [
      'Restrict vehicles from traveling near edge drop-offs with inadequate berms.',
      'Establish a safe buffer zone near highwalls and inspect ground stability daily.',
      'Minimize dust exposure through local wet suppression or enclosed cabs with HEPA filters.'
    ]
  },
  {
    id: 'vague-ih-exposure',
    matches: [
      /\b(dust in area|too loud|heat concern|fumes|respirator issue|noise concern|air quality|dust issue|loud noise|heat stress|ventilation issue|ppe issue|wearing ppe)\b/i
    ],
    domain: 'industrial_hygiene',
    observedFact: 'Unspecified environmental exposure, noise, dust, fume, or PPE concern reported.',
    possibilities: [
      'Hazardous occupational dust or fume inhalation.',
      'Excessive noise exposure exceeding safety thresholds.',
      'Heat stress risks in high-temperature work environments.',
      'Inadequate or missing personal protective equipment (PPE).'
    ],
    missingFacts: [
      'Dust or fume chemical identity and concentration level.',
      'Noise decibel level and continuous/intermittent exposure duration.',
      'Workroom temperature, humidity, ventilation rate, and workload.',
      'Specific task being performed and required/available PPE.'
    ],
    questions: [
      'What substance, dust, or noise source is present, and what is the exposure duration?',
      'Has environmental monitoring or decibel testing been conducted in the area?',
      'What ventilation, engineering controls, or personal protective equipment (PPE) are in use?'
    ],
    controls: [
      'Restrict occupancy and limit exposure duration in high-noise, dust, or heat areas.',
      'Provide and enforce use of properly fitted PPE (hearing protection, respirators, heat shields).',
      'Ensure ventilation equipment is active and verify water availability in hot areas.'
    ]
  },
  {
    id: 'vague-training',
    matches: [
      /\b(training concern|training issue|possible training issue)\b/i
    ],
    domain: 'training_procedure_gap',
    observedFact: 'Unspecified task training, certification, or procedure compliance concern reported.',
    possibilities: [
      'Workers executing tasks without required safety or task training.',
      'Missing task training records or uncertified equipment operators.'
    ],
    missingFacts: [
      'Worker role, assigned task, regulatory jurisdiction, and required training records.',
      'Specific equipment being operated and operator certification status.'
    ],
    questions: [
      'What specific task, equipment, or role requires verified training?',
      'Are training records or operator certifications available for review?',
      'Has task-specific safety instruction been completed before starting work?'
    ],
    controls: [
      'Verify training and certification records before assigning tasks.',
      'Suspend unauthorized or untrained personnel from executing specialized tasks.',
      'Provide immediate safety briefing or task instruction under direct supervision.'
    ]
  }
];

const GENERAL_VAGUE_KEYWORDS = [
  'unsafe',
  'needs fixed',
  'hazard noted',
  'safety concern',
  'something wrong here',
  'something wrong',
  'hazard',
  'safety issue',
  'issue',
  'concern',
  'bad',
  'not right',
  'broken',
  'damaged',
  'problem'
];

// Inputs containing these specific indicators are deemed to have "enough evidence" to bypass vagueness.
const SUFFICIENT_EVIDENCE_CUES = [
  /\bopen breaker slot\b/i,
  /\bexposing energized parts\b/i,
  /\bunlabeled chemical container\b/i,
  /\bforklift operating next to pedestrians\b/i,
  /\bmissing guard on conveyor tail pulley\b/i,
  /\bblocked emergency exit\b/i,
  /\bexposing live parts\b/i,
  /\bmissing panel cover\b/i,
  /\bopen electrical panel\b/i,
  /\bexposed live\b/i,
  /\bexposed insulation\b/i,
  /\bexposed conductor\b/i,
  /\bfrayed extension cord\b/i,
  /\bfrayed power cord\b/i,
  /\bwater exposure\b/i,
  /\boil spilled across\b/i,
  /\bspilled oil\b/i,
  /\bextension cord stretched across walkway\b/i,
  /\bcreate(s|d|ing)? a trip hazard\b/i,
  /\bmissing guardrail\b/i,
  /\bfloor opening\b/i,
  /\bopen floor hole\b/i,
  /\bconveyor tail pulley\b/i,
  /\brotating shaft\b/i,
  /\bmissing guard on conveyor\b/i
];

const FALSE_POSITIVE_PATTERNS = [
  /\bfall meeting\b|\bfall planning meeting\b|\bfall schedule\b/,
  /\bhot work permit\b.*\b(filed|complete|completed|approved|closed)\b/,
  /\btraining (record|records)\b.*\b(reviewed|complete|current|verified)\b/,
  /\bnoise complaint\b.*\b(office conversation|conversation|meeting|email)\b/,
  /\bdust cover\b.*\b(installed|in place|closed|secured)\b/,
  /\blocked out of (the |my |an )?(account|system|application|app)\b/,
  /\bguard (assigned|posted|at)\b.*\b(gate|entrance|door)\b|\bguard at front gate\b/i,
  /\bchemical inventory\b.*\b(complete|completed|current|reviewed)\b/,
  /\bcoal[- ]colored\b|\bcoal color(ed)?\b/,
  /\bpit stop\b|\binspection pit\b/,
  /\bquarry tile\b/,
  /\baggregate data\b|\bdata aggregation\b/,
  /\bmine the data\b|\bdata mining\b|\btext mining\b/,
  /\bcoal tar\b/,
];

export class VagueInputIntelligenceService {
  isVague(observation: string): boolean {
    const text = String(observation || '').trim().toLowerCase();
    if (!text) return false;

    // Check false positive patterns
    const matchesFalsePositive = FALSE_POSITIVE_PATTERNS.some(pat => pat.test(text));
    if (matchesFalsePositive) return false;

    // Check if it matches any sufficient evidence cues.
    const hasSufficientEvidence = SUFFICIENT_EVIDENCE_CUES.some(cue => cue.test(text));
    if (hasSufficientEvidence) return false;

    // Check if it explicitly matches a vague rule.
    const matchesVagueRule = VAGUE_RULES.some(rule =>
      rule.matches.some(p => p.test(text))
    );
    if (matchesVagueRule && text.length <= 50) return true;

    // Check if it is a general vague input.
    const isVeryShort = text.length <= 35;
    const hasVagueKeyword = GENERAL_VAGUE_KEYWORDS.some(kw => text.includes(kw));
    if (isVeryShort && hasVagueKeyword) return true;

    // Single-word or two-word very generic terms.
    if (text.split(/\s+/).length <= 2 && GENERAL_VAGUE_KEYWORDS.some(kw => text.includes(kw))) {
      return true;
    }

    return false;
  }

  analyze(observation: string, primaryDomain: SafeScopeReasoningDomain): VagueInputAnalysis {
    const text = String(observation || '').trim().toLowerCase();
    const isVague = this.isVague(text);

    if (!isVague) {
      return {
        isVague: false,
        observedFacts: [],
        inferredPossibilities: [],
        missingCriticalFacts: [],
        likelyHazardFamilies: [],
        immediateSafetyQuestions: [],
        conservativeInterimControls: []
      };
    }

    // Specific overrides for vague inputs to ensure downstream coherence
    if (text.includes('panel') && (text.includes('bad') || text.includes('issue') || text.includes('problem'))) {
      return {
        isVague: true,
        observedFacts: ['Unspecified electrical panel or enclosure condition concern reported.'],
        inferredPossibilities: ['Exposed live parts inside the panel', 'Missing cover or open breaker slots', 'Blocked workspace clearance'],
        missingCriticalFacts: ['Cover status', 'Energized exposure', 'Employee access'],
        likelyHazardFamilies: [{ domain: 'electrical', confidence: 'low', rationale: 'Observed wording suggests electrical panel concern.' }],
        immediateSafetyQuestions: [
          'Is the cover missing, damaged, open, or intact?',
          'Are energized parts exposed or accessible?',
          'Is the panel blocked or physically damaged?',
          'Can employees access or contact the panel?',
          'Has a qualified electrical person evaluated it?'
        ],
        conservativeInterimControls: [
          'Keep personnel from touching or opening the panel until evaluated.',
          'Restrict access if damage or exposed energized parts are suspected.',
          'Have a qualified electrical person inspect the condition.'
        ],
        immediateControls: [
          'Keep personnel from touching or opening the panel until evaluated.',
          'Restrict access if damage or exposed energized parts are suspected.',
          'Have a qualified electrical person inspect the condition.'
        ],
        interimControls: [
          'Mark/flag the concern and collect photos/details.',
          'Maintain access control pending qualified review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Enclosure integrity, live parts exposure, and access clearance are unconfirmed.'
      };
    }

    if (text.includes('electrical') && (text.includes('issue') || text.includes('hazard') || text.includes('concern'))) {
      return {
        isVague: true,
        observedFacts: ['Unspecified electrical system or equipment concern reported.'],
        inferredPossibilities: ['Damaged cables/insulation', 'Exposed live parts', 'Inadequate electrical grounding'],
        missingCriticalFacts: ['Component type', 'Energized exposure', 'Site condition'],
        likelyHazardFamilies: [{ domain: 'electrical', confidence: 'low', rationale: 'Observed wording suggests general electrical concern.' }],
        immediateSafetyQuestions: [
          'Is there an exposed energized part, missing cover, damaged cord, or blocked panel access?',
          'What voltage or equipment is involved, and can unqualified employees access or contact it?',
          'Has a qualified electrical person evaluated this condition?'
        ],
        conservativeInterimControls: [
          'Keep personnel clear of the affected electrical exposure.',
          'Have a qualified electrical person inspect the condition.'
        ],
        immediateControls: [
          'Keep personnel clear of the affected electrical exposure.',
          'Have a qualified electrical person inspect the condition.'
        ],
        interimControls: [
          'Maintain access control pending qualified review.',
          'Mark/flag the concern and collect photos/details.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Voltage level, exposure pathway, and component type are unconfirmed.'
      };
    }

    if (text.includes('cord')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified flexible cord condition or routing concern reported.'],
        inferredPossibilities: ['Damaged outer jacket or conductor insulation', 'Wet/conductive exposure location', 'Trip hazard in travelway'],
        missingCriticalFacts: ['Insulation damage', 'Wet location exposure', 'GFCI protection status'],
        likelyHazardFamilies: [{ domain: 'electrical', confidence: 'low', rationale: 'Observed wording suggests cord concern.' }],
        immediateSafetyQuestions: [
          'Is the cord damaged, frayed, cut, or spliced?',
          'Is it used in a wet or damp location, or outdoors?',
          'Are bare conductors or exposed wiring visible?',
          'Is GFCI protection in use, or does the cord cross a travel path?'
        ],
        conservativeInterimControls: [
          'De-energize or remove the cord from service if damage is suspected.',
          'Keep workers clear of suspected cord damage.'
        ],
        immediateControls: [
          'De-energize or remove the cord from service if damage is suspected.',
          'Keep workers clear of suspected cord damage.'
        ],
        interimControls: [
          'Flag the concern and tag the cord out of service pending qualified review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Cord insulation status, GFCI presence, and exposure location are unconfirmed.'
      };
    }

    if (text.includes('breaker')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified circuit breaker or breaker panel concern reported.'],
        inferredPossibilities: ['Missing breaker filler plate or open slot', 'Exposed energized electrical busbar', 'Frequent tripping/overload'],
        missingCriticalFacts: ['Panel cover integrity', 'Energized exposure', 'Load/overload status'],
        likelyHazardFamilies: [{ domain: 'electrical', confidence: 'low', rationale: 'Observed wording suggests breaker panel concern.' }],
        immediateSafetyQuestions: [
          'Is there a missing breaker cover, open slot, or exposed energized parts?',
          'Is the breaker frequently tripping, warm to touch, or physically damaged?',
          'Has a qualified electrician inspected the panel enclosure?'
        ],
        conservativeInterimControls: [
          'Restrict access to the breaker area until the enclosure is verified.',
          'Do not touch or operate breakers showing signs of damage.'
        ],
        immediateControls: [
          'Restrict access to the breaker area until the enclosure is verified.',
          'Do not touch or operate breakers showing signs of damage.'
        ],
        interimControls: [
          'Maintain access control pending qualified review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Enclosure integrity, slot opening status, and live parts exposure are unconfirmed.'
      };
    }

    if (text.includes('machine') && text.includes('unsafe')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified machinery guarding or mechanical safety concern reported.'],
        inferredPossibilities: ['Accessible rotating shaft, belt, pulley, or gear', 'Missing or loose machine guards', 'Servicing without energy isolation (LOTO)'],
        missingCriticalFacts: ['Equipment state', 'Exposure to moving parts', 'LOTO status'],
        likelyHazardFamilies: [{ domain: 'machine_guarding_loto', confidence: 'low', rationale: 'Observed wording suggests machinery safety concern.' }],
        immediateSafetyQuestions: [
          'Is a fixed machine guard missing, loose, bypassed, or damaged?',
          'Are workers performing maintenance, cleanup, or servicing where energy isolation (LOTO) is required?',
          'Are rotating parts, pulleys, or pinch points accessible during operation?'
        ],
        conservativeInterimControls: [
          'Stop work and keep workers clear of moving parts until guarding/LOTO is verified.',
          'Have a qualified person inspect the machine condition.'
        ],
        immediateControls: [
          'Stop work and keep workers clear of moving parts until guarding/LOTO is verified.',
          'Have a qualified person inspect the machine condition.'
        ],
        interimControls: [
          'Restrict equipment operation pending competent review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Equipment operational state, guard integrity, and body exposure are unconfirmed.'
      };
    }

    if (text === 'missing guard' || text === 'guard issue' || text === 'guarding issue' || text === 'guard missing') {
      return {
        isVague: true,
        observedFacts: ['Unspecified guarding concern reported.'],
        inferredPossibilities: [
          'Missing machine guard on a rotating part or point of operation.',
          'Missing guardrail or cover at an elevated edge or floor opening.',
          'Worker exposure to an unprotected hazard area.'
        ],
        missingCriticalFacts: [
          'Equipment or opening type',
          'Whether the equipment is operating or energized',
          'Jurisdiction and exposure pathway'
        ],
        likelyHazardFamilies: [
          { domain: 'machine_guarding_loto', confidence: 'low', rationale: 'Observed wording suggests a guarding concern, but the guard type is not identified.' }
        ],
        immediateSafetyQuestions: [
          'What equipment, opening, edge, or moving part is missing the guard?',
          'Is the equipment operating or energized, and are workers exposed to a nip point, rotating part, fall edge, or floor opening?',
          'Is this OSHA General Industry, OSHA Construction, or MSHA?'
        ],
        conservativeInterimControls: [
          'Keep workers away from the exposed hazard until a qualified review is completed.',
          'Stop or isolate moving equipment if motion is involved, and apply LOTO where required.'
        ],
        immediateControls: [
          'Keep workers away from the exposed hazard until a qualified review is completed.',
          'Stop or isolate moving equipment if motion is involved, and apply LOTO where required.'
        ],
        interimControls: [
          'Barricade the exposed area and collect photos/details for qualified review.'
        ],
        permanentEngineeringControls: [
          'Install or replace the appropriate guard, cover, or guardrail after qualified verification.'
        ],
        uncertaintyReason: 'Guard type, exposed component, and jurisdiction are not specified.'
      };
    }

    if (text.includes('conveyor')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified conveyor mechanical or guarding concern reported.'],
        inferredPossibilities: ['Exposed tail pulley, head pulley, or rollers', 'Cleanup/servicing without energy isolation (LOTO)', 'Accumulated materials near rotating parts'],
        missingCriticalFacts: ['Conveyor operational state', 'Guarding status', 'LOTO status'],
        likelyHazardFamilies: [{ domain: 'machine_guarding_loto', confidence: 'low', rationale: 'Observed wording suggests conveyor safety concern.' }],
        immediateSafetyQuestions: [
          'Is there a missing guard on the conveyor tail pulley, head pulley, or drive shaft?',
          'Are workers exposed to nip points, moving belts, or rotating parts during cleanup or maintenance?',
          'Has lockout/tagout (LOTO) been applied and zero energy verified before temporary access?'
        ],
        conservativeInterimControls: [
          'Stop work and keep workers clear of moving parts until guarding/LOTO is verified.',
          'Have a qualified person inspect the conveyor condition.'
        ],
        immediateControls: [
          'Stop work and keep workers clear of moving parts until guarding/LOTO is verified.',
          'Have a qualified person inspect the conveyor condition.'
        ],
        interimControls: [
          'Restrict conveyor area access pending competent review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Conveyor operational state, guard integrity, and LOTO status are unconfirmed.'
      };
    }

    if (text.includes('forklift')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified forklift or mobile equipment operation concern reported.'],
        inferredPossibilities: ['Pedestrian-equipment conflict on shared routes', 'Blind spot or corner travel hazard', 'Failed backup alarm or horns'],
        missingCriticalFacts: ['Pedestrian proximity', 'Alarms/controls status', 'Traffic plan enforcement'],
        likelyHazardFamilies: [{ domain: 'mobile_equipment', confidence: 'low', rationale: 'Observed wording suggests forklift safety concern.' }],
        immediateSafetyQuestions: [
          'Are pedestrians physically separated from active forklift and vehicle travel routes?',
          'Are backup alarms, horns, mirrors, or flashing lights operational?',
          'Are spotters or traffic signs used at blind spots or intersections?'
        ],
        conservativeInterimControls: [
          'Separate pedestrian routes from active forklift travel ways.',
          'Verify operator and pedestrian awareness of traffic rules.'
        ],
        immediateControls: [
          'Separate pedestrian routes from active forklift travel ways.',
          'Verify operator and pedestrian awareness of traffic rules.'
        ],
        interimControls: [
          'Establish pedestrian exclusion zones and post warning signs.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Operator visibility, pedestrian separation, and alarm operation are unconfirmed.'
      };
    }

    if (text.includes('chemical') && (text.includes('issue') || text.includes('hazard') || text.includes('concern'))) {
      return {
        isVague: true,
        observedFacts: ['Unspecified chemical handling or container concern reported.'],
        inferredPossibilities: ['Unlabeled secondary container', 'Open or leaking container', 'Incompatible chemical storage'],
        missingCriticalFacts: ['Substance identity', 'Container labeling status', 'SDS availability'],
        likelyHazardFamilies: [{ domain: 'hazard_communication', confidence: 'low', rationale: 'Observed wording suggests chemical hazard communication concern.' }],
        immediateSafetyQuestions: [
          'What chemical or material is in the container, and is it a secondary container or original?',
          'Is the container labeled with GHS hazards, closed, and placed in secondary containment?',
          'Are there nearby drains, soil, or worker exposure pathways, and is SDS available?'
        ],
        conservativeInterimControls: [
          'Remove unknown or unlabeled chemical containers from active use.',
          'Have a qualified person identify the chemical contents.'
        ],
        immediateControls: [
          'Remove unknown or unlabeled chemical containers from active use.',
          'Have a qualified person identify the chemical contents.'
        ],
        interimControls: [
          'Ensure container is closed and placed in secondary containment.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Chemical identity, GHS label compliance, and container storage integrity are unconfirmed.'
      };
    }

    if (text.includes('drain') || (text.includes('leak') && text.includes('drain'))) {
      return {
        isVague: true,
        observedFacts: ['Unspecified leak near drain or environmental release concern reported.'],
        inferredPossibilities: ['Chemical release migrating to floor/storm drains', 'Spill contaminating soil or water', 'Inadequate containment controls'],
        missingCriticalFacts: ['Released material type', 'Drain pathway connectivity', 'Quantity leaked'],
        likelyHazardFamilies: [{ domain: 'hazard_communication', confidence: 'low', rationale: 'Observed wording suggests possible environmental release concern.' }],
        immediateSafetyQuestions: [
          'What material or chemical is leaking, and what is the approximate quantity?',
          'Does the leak have a pathway to reach storm/floor drains, soil, or water systems?',
          'Are spill containment, absorbents, or drain protection covers deployed?'
        ],
        conservativeInterimControls: [
          'Restrict access to the leak area and protect nearby drains immediately.',
          'Identify leak source and deploy spill response materials.'
        ],
        immediateControls: [
          'Restrict access to the leak area and protect nearby drains immediately.',
          'Identify leak source and deploy spill response materials.'
        ],
        interimControls: [
          'Apply absorbents and block drain pathways pending review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Liquid identity, drain protection status, and spill volume are unconfirmed.'
      };
    }

    if (text.includes('fall')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified elevated fall or walking surface edge concern reported.'],
        inferredPossibilities: ['Unprotected platform, roof, or mezzanine edge', 'Defective ladder or scaffold setup', 'Open floor hole or opening'],
        missingCriticalFacts: ['Fall height', 'Surface type', 'Guardrail/PFAS status'],
        likelyHazardFamilies: [{ domain: 'fall_protection', confidence: 'low', rationale: 'Observed wording suggests elevated fall concern.' }],
        immediateSafetyQuestions: [
          'What is the fall height (in feet) to the lower level?',
          'Is this an unprotected platform edge, floor opening, roof, ladder, or scaffold?',
          'Are guardrails, covers, travel restraint, or personal fall arrest systems in use?'
        ],
        conservativeInterimControls: [
          'Restrict access to the elevated edge, floor opening, or area.',
          'Have a competent person inspect the fall hazard area.'
        ],
        immediateControls: [
          'Restrict access to the elevated edge, floor opening, or area.',
          'Have a competent person inspect the fall hazard area.'
        ],
        interimControls: [
          'Install barricades or warning signs at the fall exposure area.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Fall height, surface edge configuration, and guardrail/arrest system use are unconfirmed.'
      };
    }

    if (text.includes('mine safety') || text.includes('mine hazard') || text.includes('quarry safety')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified mining safety or MSHA compliance concern reported.'],
        inferredPossibilities: ['Haul road edge lacking safety berms', 'Highwall instability or loose rock', 'Dust or noise exposure near processing plant'],
        missingCriticalFacts: ['Mine type', 'Specific safety defect', 'Miner exposure level'],
        likelyHazardFamilies: [{ domain: 'ground_control', confidence: 'low', rationale: 'Observed wording suggests mine safety concern.' }],
        immediateSafetyQuestions: [
          'Is this a surface or underground mine, and what type of mining task is being performed?',
          'What equipment, mobile machinery, or miner exposure is involved in the safety concern?',
          'Are safety berms, highwalls, or ground stability controls currently being monitored?'
        ],
        conservativeInterimControls: [
          'Restrict access to the suspected mine hazard area.',
          'Have a qualified mine safety professional inspect the condition.'
        ],
        immediateControls: [
          'Restrict access to the suspected mine hazard area.',
          'Have a qualified mine safety professional inspect the condition.'
        ],
        interimControls: [
          'Mark the area with warning signs or barriers.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Mining activity, specific ground control/berm status, and MSHA jurisdiction are unconfirmed.'
      };
    }

    if (text.includes('dusty') || text.includes('crusher')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified dust or environmental exposure concern reported.'],
        inferredPossibilities: ['Respirable silica dust inhalation', 'Excessive noise levels near crusher', 'Failed local ventilation or wet suppression'],
        missingCriticalFacts: ['Contaminant concentration', 'Exposure monitoring', 'Respirator usage status'],
        likelyHazardFamilies: [{ domain: 'industrial_hygiene', confidence: 'low', rationale: 'Observed wording suggests industrial hygiene exposure concern.' }],
        immediateSafetyQuestions: [
          'Is this an MSHA or OSHA regulated site, and what material is being crushed?',
          'Are miners exposed to airborne dust, and is dust control (wet suppression/ventilation) active?',
          'Has personal exposure monitoring or dust sampling been performed?'
        ],
        conservativeInterimControls: [
          'Restrict occupancy and limit exposure duration in the dusty area.',
          'Ensure appropriate personal protective equipment (PPE/respirators) is used.'
        ],
        immediateControls: [
          'Restrict occupancy and limit exposure duration in the dusty area.',
          'Ensure appropriate personal protective equipment (PPE/respirators) is used.'
        ],
        interimControls: [
          'Activate local dust controls or wet suppression pending review.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Dust concentration, silica content, and engineering control operation are unconfirmed.'
      };
    }

    if (text.includes('training')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified training, certification, or instruction concern reported.'],
        inferredPossibilities: ['Task assignment to untrained workers', 'Expired equipment operator license', 'Inadequate task-safety instruction'],
        missingCriticalFacts: ['Role/task context', 'Training records', 'Applicable regulatory rules'],
        likelyHazardFamilies: [{ domain: 'training_procedure_gap', confidence: 'low', rationale: 'Observed wording suggests safety training concern.' }],
        immediateSafetyQuestions: [
          'What specific task, equipment, or role requires verified training?',
          'Are training records or operator certifications available for review?',
          'What jurisdiction (OSHA vs MSHA) applies to the training requirement?'
        ],
        conservativeInterimControls: [
          'Verify training and certification records before assigning tasks.',
          'Suspend untrained personnel from executing specialized tasks.'
        ],
        immediateControls: [
          'Verify training and certification records before assigning tasks.',
          'Suspend untrained personnel from executing specialized tasks.'
        ],
        interimControls: [
          'Provide immediate safety briefing or direct supervision.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Worker qualifications, task assignment scope, and regulatory training requirements are unconfirmed.'
      };
    }

    if (text.includes('blocked') && (text.includes('access') || text.includes('egress') || text.includes('walkway') || text.includes('aisle') || text.includes('exit'))) {
      return {
        isVague: true,
        observedFacts: ['Unspecified walkway, egress, or emergency exit blockage reported.'],
        inferredPossibilities: ['Emergency exit route obstructed by stored materials', 'Blocked access to electrical panel or fire extinguisher', 'Trip hazard across travel path'],
        missingCriticalFacts: ['Obstruction target', 'Emergency exit status', 'Aisleway width'],
        likelyHazardFamilies: [{ domain: 'walking_working_surfaces', confidence: 'low', rationale: 'Observed wording suggests access or housekeeping concern.' }],
        immediateSafetyQuestions: [
          'What specific access is blocked: emergency exit, electrical panel, fire extinguisher, eyewash, or general travelway?',
          'What material, vehicle, or equipment is obstructing the access path?',
          'How quickly can the obstruction be removed to restore clear access?'
        ],
        conservativeInterimControls: [
          'Identify and mark the obstructed access route.',
          'Restore clear travel paths immediately where possible.'
        ],
        immediateControls: [
          'Identify and mark the obstructed access route.',
          'Restore clear travel paths immediately where possible.'
        ],
        interimControls: [
          'Provide alternative routing and alert personnel.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Blocked component type, egress route location, and obstruction size are unconfirmed.'
      };
    }

    if (text.includes('open container')) {
      return {
        isVague: true,
        observedFacts: ['Unspecified open chemical or waste container reported.'],
        inferredPossibilities: ['Hazardous chemical evaporation or spill risk', 'Unlabeled container contents', 'Secondary container lack of secondary containment'],
        missingCriticalFacts: ['Substance identity', 'Label presence', 'SDS availability'],
        likelyHazardFamilies: [{ domain: 'hazard_communication', confidence: 'low', rationale: 'Observed wording suggests container hazard communication concern.' }],
        immediateSafetyQuestions: [
          'What chemical or material is in the container, and is it a secondary container or original?',
          'Is the container labeled with GHS hazards, closed, and placed in secondary containment?',
          'Are there drains, soil, or worker exposure pathways nearby, and is SDS available?'
        ],
        conservativeInterimControls: [
          'Close the container immediately and check for chemical labeling.',
          'Move the container to secondary containment if leaks are possible.'
        ],
        immediateControls: [
          'Close the container immediately and check for chemical labeling.',
          'Move the container to secondary containment if leaks are possible.'
        ],
        interimControls: [
          'Ensure container contents are verified and properly closed.'
        ],
        permanentEngineeringControls: [
          'Repair or replace components identified by qualified review.'
        ],
        uncertaintyReason: 'Chemical contents identity, label presence, and SDS availability are unconfirmed.'
      };
    }

    // Find matching rule.
    const matchedRule = VAGUE_RULES.find(rule =>
      rule.matches.some(p => p.test(text))
    );

    if (matchedRule) {
      const likelyHazardFamilies: VagueHazardFamily[] = [
        {
          domain: matchedRule.domain,
          confidence: 'low',
          rationale: 'Observed wording suggests this hazard domain.'
        }
      ];

      return {
        isVague: true,
        observedFacts: [matchedRule.observedFact],
        inferredPossibilities: matchedRule.possibilities,
        missingCriticalFacts: matchedRule.missingFacts,
        likelyHazardFamilies,
        immediateSafetyQuestions: matchedRule.questions,
        conservativeInterimControls: matchedRule.controls,
        immediateControls: matchedRule.controls,
        interimControls: ['Apply temporary physical barrier or administrative restriction.'],
        permanentEngineeringControls: ['Repair or replace components identified by qualified review.'],
        uncertaintyReason: matchedRule.missingFacts[0]
      };
    }

    // Generic vague input fallback.
    const fallbackDomain = primaryDomain && primaryDomain !== 'unknown' ? primaryDomain : 'unknown';
    const likelyFamilies: VagueHazardFamily[] = [];
    likelyFamilies.push({
      domain: fallbackDomain,
      confidence: 'low',
      rationale: fallbackDomain !== 'unknown'
        ? 'Based on initial deterministic classification.'
        : 'No specific hazard domain could be identified from the observation.'
    });

    return {
      isVague: true,
      observedFacts: ['General safety or hazard concern reported with insufficient detail.'],
      inferredPossibilities: [
        'Unspecified physical defect or unsafe worker behavior.',
        'Equipment mechanical, electrical, or structural malfunction.',
        'Housekeeping, egress, or workplace access obstruction.'
      ],
      missingCriticalFacts: [
        'Specific physical condition, defect description, or observed failure mode.',
        'Equipment name, type, and operational state (running vs servicing).',
        'Employee proximity, tasks performed, and duration of exposure.',
        'Applicable regulatory jurisdiction (OSHA General Industry, OSHA Construction, or MSHA).'
      ],
      likelyHazardFamilies: likelyFamilies,
      immediateSafetyQuestions: [
        'What specific equipment, task, or physical condition is unsafe?',
        'Are employees currently exposed to the condition?',
        'What site type (mine, plant, construction) is involved?'
      ],
      conservativeInterimControls: [
        'Isolate the area and warn employees to stay clear of the suspected hazard.',
        'Restrict access to unauthorized personnel until a proper review is conducted.',
        'Have a qualified safety professional inspect the condition.'
      ],
      immediateControls: [
        'Isolate the area and warn employees to stay clear of the suspected hazard.',
        'Restrict access to unauthorized personnel until a proper review is conducted.',
        'Have a qualified safety professional inspect the condition.'
      ],
      interimControls: [
        'Apply temporary physical barrier or administrative restriction.'
      ],
      permanentEngineeringControls: [
        'Repair or replace components identified by qualified review.'
      ],
      uncertaintyReason: 'Specific physical condition, defect description, or observed failure mode is not stated.'
    };
  }
}
