import { ExpertApplicabilityRule } from './standard-applicability.types';

export const EXPERT_APPLICABILITY_RULES: ExpertApplicabilityRule[] = [
  // 1. Electrical exposed live parts
  {
    id: 'elec-exposed-live-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'electrical',
    standardCitation: '29 CFR 1910.303(g)(2)(i)',
    standardTitle: 'Guarding of live parts (nominal voltage 50V or more)',
    appliesWhen: [
      /\b(panel|breaker|fuse|switch|wir\w*|enclosure|energiz\w*|live part|electrical)\b/i
    ],
    requiredEvidence: [
      /\b(expos\w*|bare|naked|missing cover|cover\s+(?:is\s+)?missing|missing panel|panel cover\s+(?:is\s+)?missing|enclosure cover\s+(?:is\s+)?missing|open\w* cover|open\w* enclosure|open\w* slot|open\w* breaker|expos\w* live|expos\w* energiz\w*)\b/i
    ],
    confidenceBoosters: [
      /\b(warehouse|manufacturing|shop|room|unqualified|accessible|touch|contact)\b/i,
      /\b(50V|120V|240V|480V|voltage)\b/i
    ],
    confidenceReducers: [
      /\b(low voltage|5V|12V|24V|communication|ethernet|data line)\b/i,
      /\b(qualified person only|restricted access)\b/i
    ],
    doNotSelectWhen: [
      /\b(closed|intact|labeled|clear access|access is clear|no exposed|no live parts|de-energized|safe)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.303(g)(1)'],
    followUpQuestions: [
      'Are energized/live parts visible or accessible, or are electrical enclosure parts missing or damaged?',
      'Is the cover or door fully closed, intact, and latched?',
      'Are unqualified persons able to access or contact this panel/enclosure?',
      'Has a qualified electrical professional evaluated the enclosure status?',
      'What voltage is present in this equipment?'
    ],
    mechanismChain: {
      initiatingCondition: 'An electrical enclosure cover is missing, open, or has unused breaker openings exposing live parts.',
      releaseOrFailureMode: 'Accidental contact or tool entry bridges energized parts to ground or phase-to-phase.',
      exposurePathway: 'Employees working near or operating panels can touch live contacts or initiate an arc flash.',
      consequences: 'Severe shock, electrocution, or arc flash burns.'
    },
    controlPrinciples: [
      'Restrict access to the area immediately.',
      'Have a qualified electrical person de-energize the circuit or install listed corrective parts.',
      'Provide listed temporary barriers under qualified supervision.',
      'Install permanent listed electrical enclosure parts or covers.'
    ]
  },
  {
    id: 'elec-exposed-live-osha-const',
    jurisdiction: 'osha_construction',
    hazardFamily: 'electrical',
    standardCitation: '29 CFR 1926.403(i)(2)(i)',
    standardTitle: 'Guarding of live parts (construction nominal voltage 50V or more)',
    appliesWhen: [
      /\b(panel|breaker|fuse|switch|wir\w*|enclosure|energiz\w*|live part|electrical)\b/i
    ],
    requiredEvidence: [
      /\b(expos\w*|bare|naked|missing cover|cover\s+(?:is\s+)?missing|missing panel|panel cover\s+(?:is\s+)?missing|enclosure cover\s+(?:is\s+)?missing|open\w* cover|open\w* enclosure|open\w* slot|open\w* breaker|expos\w* live|expos\w* energiz\w*)\b/i
    ],
    confidenceBoosters: [
      /\b(construction site|temporary power|jobsite|unqualified|accessible|touch)\b/i
    ],
    confidenceReducers: [
      /\b(low voltage|restricted access)\b/i
    ],
    doNotSelectWhen: [
      /\b(closed|intact|labeled|clear access|no exposed|no live parts|de-energized)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1926.403(i)(1)'],
    followUpQuestions: [
      'Are energized/live parts visible or accessible, or are electrical enclosure parts missing or damaged?',
      'Is the cover or door fully closed, intact, and latched?',
      'Are unqualified persons able to access or contact this panel/enclosure?',
      'Has a qualified electrical professional evaluated the enclosure status?',
      'What voltage is present in this equipment?'
    ],
    mechanismChain: {
      initiatingCondition: 'Temporary construction panel or electrical enclosure is left open or missing faceplates.',
      releaseOrFailureMode: 'Accidental contact or tool entry bridges energized parts to ground or phase-to-phase.',
      exposurePathway: 'Construction workers near panel can touch live contacts or initiate an arc flash.',
      consequences: 'Severe shock, electrocution, or arc flash burns.'
    },
    controlPrinciples: [
      'Restrict access to the area immediately.',
      'Have a qualified electrical person de-energize the circuit or install listed corrective parts.',
      'Provide listed temporary barriers under qualified supervision.',
      'Install permanent listed electrical enclosure parts or covers.'
    ]
  },
  {
    id: 'elec-exposed-live-msha',
    jurisdiction: 'msha',
    hazardFamily: 'electrical',
    standardCitation: '30 CFR 56.12032',
    standardTitle: 'Cover plates on electrical equipment',
    appliesWhen: [
      /\b(panel|breaker|fuse|switch|wir\w*|enclosure|energiz\w*|live part|electrical)\b/i
    ],
    requiredEvidence: [
      /\b(expos\w*|bare|naked|missing cover|cover\s+(?:is\s+)?missing|missing panel|panel cover\s+(?:is\s+)?missing|enclosure cover\s+(?:is\s+)?missing|open\w* cover|open\w* enclosure|open\w* slot|open\w* breaker|expos\w* live|expos\w* energiz\w*)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|quarry|mill|plant|crusher|substation|unqualified|accessible)\b/i
    ],
    confidenceReducers: [
      /\b(qualified person only|restricted access)\b/i
    ],
    doNotSelectWhen: [
      /\b(closed|intact|labeled|clear access|no exposed|no live parts|de-energized)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.12018'],
    followUpQuestions: [
      'Are energized/live parts visible or accessible, or are electrical enclosure parts missing or damaged?',
      'Is the cover or door fully closed, intact, and latched?',
      'Are unqualified persons able to access or contact this panel/enclosure?',
      'Has a qualified electrical professional evaluated the enclosure status?',
      'What voltage is present in this equipment?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mine electrical equipment cover plate is missing or open, exposing internal contacts.',
      releaseOrFailureMode: 'Accidental contact or moisture/conductive dust entry bridges energized parts to ground.',
      exposurePathway: 'Miners working near or operating equipment can contact live parts.',
      consequences: 'Severe shock, electrocution, or arc flash burns.'
    },
    controlPrinciples: [
      'De-energize and lock out power to the enclosure immediately.',
      'Have a qualified electrician inspect and replace/install the cover plate.',
      'Ensure enclosure doors are securely closed and locked.'
    ]
  },

  // 2. Electrical working clearance
  {
    id: 'elec-clearance-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'electrical',
    standardCitation: '29 CFR 1910.303(g)(1)',
    standardTitle: 'Space about electric equipment (working clearance)',
    appliesWhen: [
      /\b(panel|breaker|clearance|workspace|working space|working clearance|electrical panel)\b/i
    ],
    requiredEvidence: [
      /\b(block\w*|obstruct\w*|stor\w*|clutter\w*|materials in front|no clearance|less than 3 feet|in front of)\b/i
    ],
    confidenceBoosters: [
      /\b(access|egress|aisle|blocked access|front of panel)\b/i,
      /\b(pallet|box|cart|ladder|trash|material)\b/i
    ],
    confidenceReducers: [
      /\b(clearance maintained|3 feet clear|unobstructed)\b/i
    ],
    doNotSelectWhen: [
      /\b(clear access|access is clear|unobstructed|no storage|clean)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.303(g)(2)(i)'],
    followUpQuestions: [
      'Is there storage, clutter, or materials placed in front of the electrical panel?',
      'What is the measured clearance distance in front of the panel (is it less than 3 feet)?',
      'Is the storage temporary or persistent?',
      'Does the panel require servicing, inspection, or emergency access?'
    ],
    mechanismChain: {
      initiatingCondition: 'Materials, pallets, or clutter are stored within the working clearance space of an electrical panel.',
      releaseOrFailureMode: 'Obstruction prevents rapid access during an electrical emergency or causes worker contact with enclosure during maintenance.',
      exposurePathway: 'Personnel cannot safely reach disconnects in an emergency, or are forced into unsafe positions during servicing.',
      consequences: 'Delayed emergency isolation leading to fire/injury, or increased risk of shock during servicing.'
    },
    controlPrinciples: [
      'Remove all materials and storage from the workspace immediately.',
      'Mark the floor to visually designate the required 3-foot clearance zone.',
      'Establish administrative controls prohibiting storage in front of electrical panels.'
    ]
  },
  {
    id: 'elec-clearance-msha',
    jurisdiction: 'msha',
    hazardFamily: 'electrical',
    standardCitation: '30 CFR 56.12018',
    standardTitle: 'Clearance about electrical equipment',
    appliesWhen: [
      /\b(panel|breaker|clearance|workspace|working space|working clearance|electrical panel)\b/i
    ],
    requiredEvidence: [
      /\b(block\w*|obstruct\w*|stor\w*|clutter\w*|materials in front|no clearance|less than 3 feet|in front of)\b/i
    ],
    confidenceBoosters: [
      /\b(crusher|substation|mill|plant|access|obstructed)\b/i
    ],
    confidenceReducers: [
      /\b(clearance maintained|unobstructed)\b/i
    ],
    doNotSelectWhen: [
      /\b(clear access|access is clear|unobstructed|no storage|clean)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.12032'],
    followUpQuestions: [
      'Is there storage, clutter, or materials placed in front of the electrical panel?',
      'What is the measured clearance distance in front of the panel?',
      'Does the panel require servicing, inspection, or emergency access?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mining electrical switchgear or control panels are obstructed by stored parts, tools, or spillage.',
      releaseOrFailureMode: 'Miners cannot rapidly access disconnects to shut down equipment in an emergency.',
      exposurePathway: 'Miners are exposed to arc flash risk or electrical contact when trying to work around obstructions.',
      consequences: 'Delayed shutdown during emergency, electrical shock, or burns.'
    },
    controlPrinciples: [
      'Remove obstructions and clear the workspace immediately.',
      'Ensure clear access paths to all electrical switch panels.',
      'Implement shift-based inspections to keep electrical workspaces clear.'
    ]
  },

  // 3. Damaged cords / temporary wiring
  {
    id: 'damaged-cords-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'electrical',
    standardCitation: '29 CFR 1910.305(g)(2)(iii)',
    standardTitle: 'Flexible cords and cables (splices and strain relief)',
    appliesWhen: [
      /\b(cord|cable|extension cord|power cord|temporary wir\w*)\b/i
    ],
    requiredEvidence: [
      /\b(damag\w*|fray\w*|cut|expos\w* insulation|expos\w* conductor|splic\w*|tape|taped|outer jacket|broken|conductors visible)\b/i
    ],
    confidenceBoosters: [
      /\b(exposed copper|conductors|wet area|puddle|floor|trip|plug)\b/i
    ],
    confidenceReducers: [
      /\b(outer jacket scrape only|superficial|de-energized)\b/i
    ],
    doNotSelectWhen: [
      /\b(intact|good condition|undamaged|inspected|new|no damage)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.334(a)(2)(ii)'],
    followUpQuestions: [
      'What damage is visible on the cord (is it frayed, cut, or are conductors exposed)?',
      'Is the cord currently energized and in use?',
      'Is the cord used as a substitute for permanent wiring?',
      'Is the cord exposed to moisture, water, or physical traffic?',
      'Does the cord have a grounding pin missing?'
    ],
    mechanismChain: {
      initiatingCondition: 'A flexible cord insulation is damaged, exposing conductors or internal wiring jacket.',
      releaseOrFailureMode: 'Current leaks from exposed conductors or arcing occurs through damaged section.',
      exposurePathway: 'Workers handling the cord or touching connected equipment contact energized parts, or moisture bridges the fault.',
      consequences: 'Severe electrical shock, electrocution, or localized electrical fire.'
    },
    controlPrinciples: [
      'De-energize the cord and remove it from service immediately.',
      'Tag the cord as defective or cut the plug off to prevent reuse.',
      'Replace the cord or install permanent correctly rated wiring.'
    ]
  },
  {
    id: 'damaged-cords-msha',
    jurisdiction: 'msha',
    hazardFamily: 'electrical',
    standardCitation: '30 CFR 56.12013',
    standardTitle: 'Flexible cords (insulation and connection)',
    appliesWhen: [
      /\b(cord|cable|extension cord|power cord|temporary wir\w*)\b/i
    ],
    requiredEvidence: [
      /\b(damag\w*|fray\w*|cut|expos\w* insulation|expos\w* conductor|splic\w*|tape|taped|outer jacket|broken|conductors visible)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|plant|quarry|crusher|shuttle car|hand tool|power tool|water|puddle|wet)\b/i
    ],
    confidenceReducers: [
      /\b(de-energized|jacket repair only)\b/i
    ],
    doNotSelectWhen: [
      /\b(intact|good condition|undamaged|inspected|new)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.12004'],
    followUpQuestions: [
      'What damage is visible on the cord?',
      'Is the cord currently energized and in use?',
      'Is the cord located in a wet or damp mining environment?',
      'Is it equipped with proper strain relief and insulation fitting?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mining portable tool or pump cord has cut insulation, exposing conductors to wet or abrasive mine ground.',
      releaseOrFailureMode: 'Energized conductor contacts water, wet ground, or worker.',
      exposurePathway: 'Miner handling tool or pump contacts current path.',
      consequences: 'Electrocution, severe shock, or arcing ignites nearby combustibles.'
    },
    controlPrinciples: [
      'Disconnect power immediately and remove the cord from the mine area.',
      'Apply MSHA-approved vulcanized splices or replace the entire cable assembly.',
      'Implement routine pre-shift cord inspections.'
    ]
  },

  // 4. Machine guarding / rotating parts
  {
    id: 'machine-guarding-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.219(c)',
    standardTitle: 'Guarding horizontal, vertical, or inclined shafting',
    appliesWhen: [
      /\b(rotating|shaft|coupling|pulley|belt|gear\w*|sprocket|drive shaft|fan blade|flywheel|moving part|machinery|sheave|screen)\b/i
    ],
    requiredEvidence: [
      /\b(unguard\w*|no guard|missing guard|removed guard|guard.*missing|no barrier|expos\w*|access\w*|nip point|pinch point)\b/i
    ],
    confidenceBoosters: [
      /\b(accessible|height|worker reach|within reach|within 7 feet|floor level)\b/i,
      /\b(pump|motor|fan|conveyor|lathe|drill press)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|out of reach|elevated more than 7 feet)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed|interlocked)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.212(a)(1)'],
    followUpQuestions: [
      'Is the rotating part, shaft, or coupling completely exposed or missing a guard?',
      'Is the moving part within 7 feet of the floor or working platform (accessible to contact)?',
      'What type of equipment is involved (pump, conveyor drive, motor shaft)?',
      'Are personnel exposed during normal operation, clean-up, or servicing?'
    ],
    mechanismChain: {
      initiatingCondition: 'A rotating mechanical shaft, coupling, or belt drive is unguarded and within worker reach.',
      releaseOrFailureMode: 'Rotating shaft catches loose clothing, hair, gloves, or body parts.',
      exposurePathway: 'Worker reaches near the unguarded component or slips/falls into the rotating mechanism.',
      consequences: 'Entanglement, caught-in, crushing, amputation, or fatal trauma.'
    },
    controlPrinciples: [
      'Shut down the equipment and lock out power immediately.',
      'Install a securely fastened, non-removable protective guard over the rotating component.',
      'Ensure the guard design prevents reaching through or under the barrier.'
    ]
  },
  {
    id: 'machine-guarding-msha',
    jurisdiction: 'msha',
    hazardFamily: 'machine_guarding',
    standardCitation: '30 CFR 56.14107(a)',
    standardTitle: 'Moving machine parts (guarding)',
    appliesWhen: [
      /\b(rotating|shaft|coupling|pulley|belt|gear\w*|sprocket|drive shaft|fan blade|flywheel|moving part|machinery|sheave|screen)\b/i
    ],
    requiredEvidence: [
      /\b(unguard\w*|no guard|missing guard|removed guard|guard.*missing|no barrier|expos\w*|access\w*|nip point|pinch point)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|quarry|plant|crusher|mill|screen|conveyor|cleanup|pulley|tail pulley|head pulley)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|high elevation|restricted zone)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|enclosed|safe)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.14109'],
    followUpQuestions: [
      'Is the moving machine part or rotating component unguarded?',
      'Can miners contact this moving part during their daily tasks, cleaning, or maintenance?',
      'What specific equipment and component are exposed (e.g. pump coupling, alternator belt, crusher flywheels)?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mine equipment drive or rotating part is missing its protective screen or enclosure.',
      releaseOrFailureMode: 'High-torque rotational force catches miner clothing or tools.',
      exposurePathway: 'Miners working in narrow aisles or performing cleanup near the moving part are drawn in.',
      consequences: 'Severe amputation, entanglement, or fatal crushing.'
    },
    controlPrinciples: [
      'Stop the machine and verify LOTO before accessing the danger zone.',
      'Install an MSHA-compliant fixed guard that prevents physical contact.',
      'Review pre-shift inspection records to detect missing guards early.'
    ]
  },
  {
    id: 'general-machine-guarding-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.212(a)(1)',
    standardTitle: 'Types of guarding (general machine guarding requirement)',
    appliesWhen: [
      /\b(fan blade|fan|auger|drill press|press|shear\w*|point of operation|nip point|pinch point|rotating|moving part|machinery|blade|flywheel|coupling|shaft)\b/i
    ],
    requiredEvidence: [
      /\b(unguard\w*|no guard|missing guard|removed guard|guard.*missing|no barrier|expos\w*|access\w*|pinch point|nip point)\b/i
    ],
    confidenceBoosters: [
      /\b(accessible|within reach|operator reach|employee reach|floor level)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|out of reach|elevated)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed|interlocked)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.219(c)'],
    followUpQuestions: [
      'Is the machine rotating part, fan blade, or auger unguarded or exposed?',
      'Are employees exposed to contact during operation, adjustment, or cleaning?',
      'Is the machine equipped with an interlock or safety device?'
    ],
    mechanismChain: {
      initiatingCondition: 'Machine components, fan blades, or augers are unguarded within employee reach.',
      releaseOrFailureMode: 'Employee hands or clothing are drawn into rotating parts or point of operation.',
      exposurePathway: 'Worker operates or walks near unguarded machinery.',
      consequences: 'Severe cuts, crushing, or amputation.'
    },
    controlPrinciples: [
      'Stop the machine and lock out power immediately.',
      'Install fixed enclosure guards or interlocked guards.'
    ]
  },
  {
    id: 'general-machine-guarding-osha-gi-poi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.212(a)(3)(ii)',
    standardTitle: 'Point of operation guarding requirement',
    appliesWhen: [
      /\b(press|shear\w*|point of operation|nip point|pinch point|blade|die|cutter|machinery)\b/i
    ],
    requiredEvidence: [
      /\b(unguard\w*|no guard|missing guard|removed guard|guard.*missing|no barrier|expos\w*|access\w*|pinch point|nip point)\b/i
    ],
    confidenceBoosters: [
      /\b(accessible|within reach|operator reach|employee reach|floor level)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|out of reach|elevated)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed|interlocked)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.212(a)(1)'],
    followUpQuestions: [
      'Is the point of operation unguarded or exposed?',
      'Are employees exposed to contact during operation, adjustment, or cleaning?'
    ],
    mechanismChain: {
      initiatingCondition: 'Machine point of operation is unguarded within employee reach.',
      releaseOrFailureMode: 'Employee hands are drawn into point of operation.',
      exposurePathway: 'Worker operates or feeds parts into unguarded machinery.',
      consequences: 'Severe cuts, crushing, or amputation.'
    },
    controlPrinciples: [
      'Stop the machine and lock out power immediately.',
      'Install fixed enclosure guards or interlocked guards.'
    ]
  },
  {
    id: 'general-machine-guarding-osha-const',
    jurisdiction: 'osha_construction',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1926.300(b)(2)',
    standardTitle: 'Guarding of moving parts of equipment (construction)',
    appliesWhen: [
      /\b(fan blade|fan|auger|drill press|press|shear\w*|point of operation|nip point|pinch point|rotating|moving part|machinery|blade|flywheel|coupling|shaft)\b/i
    ],
    requiredEvidence: [
      /\b(unguard\w*|no guard|missing guard|removed guard|guard.*missing|no barrier|expos\w*|access\w*|pinch point|nip point)\b/i
    ],
    confidenceBoosters: [
      /\b(accessible|within reach|operator reach|employee reach|floor level)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|out of reach|elevated)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed|interlocked)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1926.300(b)(1)'],
    followUpQuestions: [
      'Is the machine rotating part, fan blade, or auger unguarded or exposed?',
      'Are employees exposed to contact during operation, adjustment, or cleaning?'
    ],
    mechanismChain: {
      initiatingCondition: 'Machine components, fan blades, or augers are unguarded within employee reach on construction site.',
      releaseOrFailureMode: 'Employee hands or clothing are drawn into rotating parts or point of operation.',
      exposurePathway: 'Worker operates or walks near unguarded machinery on construction site.',
      consequences: 'Severe cuts, crushing, or amputation.'
    },
    controlPrinciples: [
      'Stop the machine and lock out power immediately.',
      'Install fixed enclosure guards or interlocked guards.'
    ]
  },

  // 5. Conveyor guarding, OSHA and MSHA
  {
    id: 'conveyor-guarding-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.212(a)(1)',
    standardTitle: 'Machine guarding (conveyors and rotating components)',
    appliesWhen: [
      /\b(conveyor|tail pulley|head pulley|take-up pulley|nip point)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no guard|missing guard|removed guard|accessible pulley|exposed belt|pinch point)\b/i
    ],
    confidenceBoosters: [
      /\b(tail pulley|head pulley|nip point|return idler|pinch point|feed belt|warehouse|packaging)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|high elevation|restricted area)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.219(c)'],
    followUpQuestions: [
      'Is the conveyor tail pulley, head pulley, or nip point unguarded?',
      'Are employees exposed to contact during cleaning, scraping, or tracking adjustments?',
      'Is the conveyor interlocked or equipped with emergency pull cords?',
      'What distance exists between the floor and the accessible pulley?'
    ],
    mechanismChain: {
      initiatingCondition: 'Conveyor pulley nip point is unguarded, leaving the intake point between the belt and pulley accessible.',
      releaseOrFailureMode: 'Nip point draws in tools, hands, or clothing during operation or cleanup.',
      exposurePathway: 'Workers shovel material or adjust belt alignment while the conveyor runs.',
      consequences: 'Severe hand/arm crushing, entanglement, or amputation.'
    },
    controlPrinciples: [
      'Stop the conveyor and lock out all energy sources before any work.',
      'Install fixed side-guards or enclosure shields that prevent reaching the nip point.',
      'Provide emergency stop pull cords along the entire conveyor route.'
    ]
  },
  {
    id: 'conveyor-guarding-msha',
    jurisdiction: 'msha',
    hazardFamily: 'machine_guarding',
    standardCitation: '30 CFR 56.14107(a)',
    standardTitle: 'Moving machine parts (conveyors and pulleys)',
    appliesWhen: [
      /\b(conveyor|tail pulley|head pulley|take-up pulley|nip point)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no guard|missing guard|removed guard|accessible pulley|exposed belt|pinch point|cleanup|cleaning)\b/i
    ],
    confidenceBoosters: [
      /\b(tail pulley|head pulley|return idler|pinch point|shoveling|spillage|aggregate|quarry|crusher)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|high elevation)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.14109'],
    followUpQuestions: [
      'Is the conveyor tail pulley, head pulley, or take-up pulley unguarded?',
      'Are miners exposed to contact during cleanup of spillage, shoveling, or servicing?',
      'Is the conveyor shut down and locked out (LOTO) during cleanup?'
    ],
    mechanismChain: {
      initiatingCondition: 'Conveyor head or tail pulley nip point is unguarded at a mine site.',
      releaseOrFailureMode: 'The belt draws a shovel, tool, or gloved hand into the pulley.',
      exposurePathway: 'Miner clears spillage under or around running conveyor pulley.',
      consequences: 'Severe crushing, arm amputation, or fatal entrapment.'
    },
    controlPrinciples: [
      'Enforce zero-energy lockout/tagout/blocking before any cleanup or servicing.',
      'Install substantial fixed guards or safety screens over tail and head pulleys.',
      'Conduct regular hazard recognition training on conveyor safety.'
    ]
  },

  // 6. Walking-working surfaces / housekeeping
  {
    id: 'housekeeping-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'walking_working_surfaces',
    standardCitation: '29 CFR 1910.22(a)',
    standardTitle: 'General requirements (housekeeping and clean walkways)',
    appliesWhen: [
      /\b(floor|walkway|aisle|travelway|passageway|housekeeping|debris|clutter|boxes|cords on floor|spill|oil on floor|snow|ice|icy|winter|quarry tile|tile)\b/i
    ],
    requiredEvidence: [
      /\b(clutter|debris|boxes|tripping|trip|slip|slippery|wet|water|spill|spilled|leak|leaking|accumulation|mess|untidy|cords across|obstruction|cracked|crack|broken tile|snow|ice|icy|tracked snow|winter weather)\b/i
    ],
    confidenceBoosters: [
      /\b(warehouse|aisleway|exit route|spill|oil|grease|water|cords|pallet|trip hazard|entry|weather|tracked snow)\b/i
    ],
    confidenceReducers: [
      /\b(storage area only|marked staging|non-travelway)\b/i
    ],
    doNotSelectWhen: [
      /\b(clean|clear|swept|orderly|dry|no hazard|safe)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.22(b)'],
    followUpQuestions: [
      'What specific material or obstruction is on the floor/walkway?',
      'Is this condition blocking a designated travelway or emergency exit route?',
      'Is there an active liquid leak (water, oil, chemical) creating a slip hazard?',
      'Are warning signs or barricades currently deployed?'
    ],
    mechanismChain: {
      initiatingCondition: 'Walkways, aisles, or work areas accumulate debris, boxes, cords, or spilled fluids.',
      releaseOrFailureMode: 'Worker catches foot on debris or loses traction on a slippery surface.',
      exposurePathway: 'Personnel walking through the area travel across the contaminated or cluttered floor.',
      consequences: 'Slips, trips, falls, sprains, fractures, or secondary contact injuries.'
    },
    controlPrinciples: [
      'Clean up the debris, trash, or spill immediately.',
      'Reroute extension cords or cables overhead or cover them with rated protective ramps.',
      'Maintain designated, marked storage areas clear of walkways.'
    ]
  },
  {
    id: 'housekeeping-msha',
    jurisdiction: 'msha',
    hazardFamily: 'walking_working_surfaces',
    standardCitation: '30 CFR 56.20003(a)',
    standardTitle: 'Housekeeping (clean mine workplaces)',
    appliesWhen: [
      /\b(floor|walkway|aisle|travelway|passageway|housekeeping|debris|clutter|boxes|cords on floor|spill|oil on floor|quarry tile|tile)\b/i
    ],
    requiredEvidence: [
      /\b(clutter|debris|boxes|tripping|trip|slip|slippery|wet|water|spill|spilled|leak|leaking|accumulation|mess|untidy|cords across|obstruction|cracked|crack|broken tile)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|quarry|mill|plant|crusher|spillage|hoses|tools|rock|coal|dust accumulation)\b/i
    ],
    confidenceReducers: [
      /\b(temporary work in progress|cleanup underway)\b/i
    ],
    doNotSelectWhen: [
      /\b(clean|clear|swept|orderly|dry|no hazard)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.20003(b)'],
    followUpQuestions: [
      'What specific material, spillage, or clutter is present in the travelway?',
      'Is the clutter located in a miner workplace or passageway?',
      'Does the accumulation create an immediate slip/trip hazard or obstruct egress?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mine walkway or crusher platform has accumulated rock spillage, scrap metal, or hoses.',
      releaseOrFailureMode: 'Miner trips or slips, falling onto hard rock, steel structures, or moving equipment.',
      exposurePathway: 'Miners access the area to perform screen inspection, adjustments, or lubrication.',
      consequences: 'Sprains, lacerations, fractures, or severe fall injuries.'
    },
    controlPrinciples: [
      'Clear spillage and store loose tools, hoses, and trash immediately.',
      'Establish a regular cleanup routine for high-spillage areas.',
      'Provide secondary spill containment under conveyor drives.'
    ]
  },

  {
    id: 'mobile-equipment-traffic-msha',
    jurisdiction: 'msha',
    hazardFamily: 'mobile_equipment',
    standardCitation: '30 CFR 56.9100',
    standardTitle: 'Traffic control and rules governing movement of mobile equipment',
    appliesWhen: [
      /\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|powered industrial truck|dozer|skid steer|excavator|backhoe|front-end loader|front end loader)\b.*\b(pedestrian|walkway|aisle|travelway|traffic|stockpile|haul road|blind corner|separation|spotter|traffic control|right of way)\b/i,
      /\b(pedestrian|walkway|aisle|travelway|traffic|stockpile|haul road|blind corner|separation|spotter|traffic control|right of way)\b.*\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|powered industrial truck|dozer|skid steer|excavator|backhoe|front-end loader|front end loader)\b/i,
    ],
    requiredEvidence: [
      /\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|powered industrial truck|dozer|skid steer|excavator|backhoe|front-end loader|front end loader)\b/i,
      /\b(pedestrian|walkway|aisle|travelway|traffic|stockpile|haul road|blind corner|separation|spotter|traffic control|right of way)\b/i,
    ],
    confidenceBoosters: [
      /\b(no traffic control|no separation|same aisle|same route|backing|turning|operating area|mine|quarry|plant|aggregate)\b/i,
    ],
    confidenceReducers: [
      /\b(separated|barriers? in place|traffic plan implemented)\b/i,
    ],
    doNotSelectWhen: [
      /\b(pedestrian walkway only|pedestrian route only|no mobile equipment|no vehicle)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i,
    ],
    commonlyConfusedWith: ['30 CFR 56.14132(a)', '30 CFR 56.14207'],
    followUpQuestions: [
      'What mobile equipment or vehicle is moving, and where are pedestrians or other traffic exposed?',
      'Are routes physically separated or otherwise controlled to prevent contact?',
      'Are traffic rules, spotters, alarms, right-of-way rules, and haul-road controls in place?'
    ],
    mechanismChain: {
      initiatingCondition: 'Mine mobile equipment and pedestrian or vehicle traffic occupy an overlapping route without confirmed separation.',
      releaseOrFailureMode: 'A driver may not see or stop for a pedestrian or other vehicle before entering the path.',
      exposurePathway: 'Workers on foot or in other vehicles are exposed in the equipment travel or turning zone.',
      consequences: 'Struck-by, run-over, pinned-between, or collision injury.'
    },
    controlPrinciples: [
      'Separate pedestrian and equipment traffic immediately.',
      'Use barriers, controlled crossings, spotters, alarms, and right-of-way rules.',
      'Verify traffic-plan implementation, visibility, and operator/pedestrian understanding.'
    ]
  },

  {
    id: 'spill-release-walking-surface-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'walking_working_surfaces',
    standardCitation: '29 CFR 1910.22(a)(2)',
    standardTitle: 'Walking-working surfaces free of spill or release contamination',
    appliesWhen: [
      /\b(open|uncovered|leaking|spill(?:ed)?|release|residue|open container)\b.*\b(used[- ]oil|waste[- ]oil|oil|oily waste|oily residue|liquid)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/i,
      /\b(used[- ]oil|waste[- ]oil|oil|oily waste|oily residue|liquid)\b.*\b(open|uncovered|leaking|spill(?:ed)?|release|residue)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/i,
      /\b(oily|residue|spill(?:ed)?|leak(?:ing)?|release)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/i,
      /\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b.*\b(oily|residue|spill(?:ed)?|leak(?:ing)?|release)\b/i,
    ],
    requiredEvidence: [
      /\b(open|uncovered|leaking|spill(?:ed)?|release|residue)\b/i,
      /\b(used[- ]oil|waste[- ]oil|oil|oily waste|oily residue|liquid)\b/i,
      /\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/i,
    ],
    confidenceBoosters: [
      /\b(label|secondary containment|cleanup|absorbent|drain)\b/i,
    ],
    confidenceReducers: [
      /\b(closed|sealed|capped|shelf only)\b/i,
    ],
    doNotSelectWhen: [
      /\b(office lobby|commercial retail|cracked quarry tile|tile is cracked)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.1200(f)(1)', '29 CFR 1910.1200(f)(6)'],
    followUpQuestions: [
      'What liquid or oily material is released, and how far has it spread across the floor or route?',
      'Is the affected area a designated walkway, aisle, travelway, or pedestrian path?',
      'Can the release reach a drain or other migration path, and what containment is present?'
    ],
    mechanismChain: {
      initiatingCondition: 'An open or leaking oil/liquid container releases material onto a floor, walkway, or drain path.',
      releaseOrFailureMode: 'The liquid spreads across the walking surface or migrates toward the drain.',
      exposurePathway: 'Employees walking through the area contact the contaminated surface or track the liquid farther.',
      consequences: 'Same-level slip or fall, strain, and possible environmental release or contamination.'
    },
    controlPrinciples: [
      'Stop the release, clean the area, and barricade the contaminated path.',
      'Move the source away from the route and place it in compatible secondary containment.',
      'Correct the source, drainage, and housekeeping process that allowed the release to reach the route.'
    ]
  },


  // 7. Floor openings / fall exposure
  {
    id: 'fall-exposure-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'fall_protection',
    standardCitation: '29 CFR 1910.28(b)(1)',
    standardTitle: 'Duty to have fall protection (unprotected edges and floor holes)',
    appliesWhen: [
      /\b(floor opening|floor hole|open hatch|wall opening|elevated platform|unprotected edge|leading edge|runway|mezzanine)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no rail|no guardrail|missing guardrail|fall hazard|fall exposure|unprotected edge|open hole|open hatch|no cover)\b/i
    ],
    confidenceBoosters: [
      /\b(fall distance|height|4 feet|4ft|elevated edge|mezzanine|pit|shaft|hatch|hole)\b/i
    ],
    confidenceReducers: [
      /\b(less than 4 feet|under 4 feet|completed guardrails)\b/i
    ],
    doNotSelectWhen: [
      /\b(guardrail installed|railings present|cover secured|closed hatch|protected|safe)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.28(b)(3)'],
    followUpQuestions: [
      'Is the floor opening, hole, or elevated edge unguarded by rails or covers?',
      'What is the measured height/fall distance to the lower level (is it 4 feet or more)?',
      'Are workers actively accessing the platform or working near the edge?',
      'Is a personal fall arrest system (PFAS) or safety net present/used?'
    ],
    mechanismChain: {
      initiatingCondition: 'An elevated mezzanine edge, platform, or floor hole lacks guardrails or secured covers.',
      releaseOrFailureMode: 'Worker loses balance, trips, or steps backward through the opening or off the edge.',
      exposurePathway: 'Personnel conduct tasks near the edge or step onto an unrated cover/hole.',
      consequences: 'Severe impact injury, spinal trauma, fracture, or fatal fall to a lower level.'
    },
    controlPrinciples: [
      'Stop work in the area and install temporary barricades or danger tape immediately.',
      'Install standard 42-inch high guardrails with midrails and toeboards.',
      'Install a secure, rated cover marked "HOLE" or "COVER" capable of supporting twice the expected load.'
    ]
  },
  {
    id: 'fall-exposure-msha',
    jurisdiction: 'msha',
    hazardFamily: 'fall_protection',
    standardCitation: '30 CFR 56.15005',
    standardTitle: 'Safety belts and lines (fall protection)',
    appliesWhen: [
      /\b(elevated platform|unprotected edge|leading edge|runway|mezzanine|elevated work|safety belt|harness|safety line)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no rail|no guardrail|missing guardrail|fall hazard|fall exposure|unprotected edge|no safety belt|no harness|no safety line)\b/i
    ],
    confidenceBoosters: [
      /\b(height|mine|crusher top|screen deck|high wall|bin|silo|working from heights)\b/i
    ],
    confidenceReducers: [
      /\b(completed guardrails|fall protection not required)\b/i
    ],
    doNotSelectWhen: [
      /\b(guardrail installed|railings present|harness worn|safety line secured)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.11012'],
    followUpQuestions: [
      'Are miners working at an elevated location where there is danger of falling?',
      'Are standard guardrails missing, and are miners wearing safety belts and lines?',
      'Is there a secure anchorage point available for fall protection hookup?'
    ],
    mechanismChain: {
      initiatingCondition: 'Miner works on a screen deck edge or bin wall without guardrails or safety harness/line.',
      releaseOrFailureMode: 'Miner slips on wet steel or loses footing due to screen vibration and falls off the deck.',
      exposurePathway: 'Working directly at the unprotected edge of the bin or screen.',
      consequences: 'Fatal fall to concrete floor or into bin/hopper.'
    },
    controlPrinciples: [
      'Stop work and ensure miners are equipped with inspected harnesses and secured safety lines.',
      'Install compliant guardrails or safety gates at access points.',
      'Verify anchorage ratings before securing safety lines.'
    ]
  },

  // 8. LOTO / unexpected energization
  {
    id: 'loto-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding_loto',
    standardCitation: '29 CFR 1910.147',
    standardTitle: 'The control of hazardous energy (lockout/tagout)',
    appliesWhen: [
      /\b(lockout|loto|tagout|maintenance|servicing|cleaning machine|clearing jam|unjamming|energized machine|unexpected startup)\b/i
    ],
    requiredEvidence: [
      /\b((?:without lockout|no loto|not locked out|unexpected startup|energy isolation|de-energized|deenergized|isolated|hazardous energy|stored energy)\b|(?:maintenance|servicing|cleaning machine|clearing jam|unjamming).{0,40}(?:without lockout|no loto|not locked out|unexpected startup|energy isolation|de-energized|deenergized|isolated|hazardous energy|stored energy)\b|(?:without lockout|no loto|not locked out).{0,40}(?:maintenance|servicing|cleaning machine|clearing jam|unjamming)\b)/i
    ],
    confidenceBoosters: [
      /\b(lock|tag|padlock|power switch|breaker|energy source|mechanical movement|pneumatic|hydraulic)\b/i
    ],
    confidenceReducers: [
      /\b(normal production operations|minor servicing exception|de-energized and locked)\b/i
    ],
    doNotSelectWhen: [
      /\b(locked out|isolated|zero energy verified|de-energized|safe)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.333'],
    followUpQuestions: [
      'Is maintenance, servicing, setup, cleaning, or unjamming being performed on the machine?',
      'Are workers exposed to unexpected energization, startup, or release of stored energy?',
      'Have individual locks and tags been applied to all energy isolating devices?',
      'Has zero-energy status been verified before starting the task?'
    ],
    mechanismChain: {
      initiatingCondition: 'A worker performs servicing, unjamming, or maintenance inside a machine without locking out the power source.',
      releaseOrFailureMode: 'Unexpected startup or release of stored kinetic/pneumatic energy occurs.',
      exposurePathway: 'Worker hands, arms, or body are within the machine danger zone (pinch points, blades).',
      consequences: 'Severe crushing, amputation, or fatal caught-in injury.'
    },
    controlPrinciples: [
      'Stop all servicing immediately and clear employees from the machine.',
      'Implement the equipment-specific lockout/tagout procedure (LOTO).',
      'Isolate all energy sources (electrical, mechanical, pneumatic, hydraulic, gravity).',
      'Apply individual padlocks and tags, dissipate stored energy, and test to verify zero-energy status.'
    ]
  },
  {
    id: 'loto-msha',
    jurisdiction: 'msha',
    hazardFamily: 'machine_guarding_loto',
    standardCitation: '30 CFR 56.12016',
    standardTitle: 'Work on electrically powered equipment (lockout)',
    appliesWhen: [
      /\b(lockout|loto|tagout|maintenance|servicing|cleaning machine|clearing jam|unjamming|energized machine|unexpected startup)\b/i
    ],
    requiredEvidence: [
      /\b((?:without lockout|no loto|not locked out|unexpected startup|energy isolation|de-energized|deenergized|isolated|hazardous energy|stored energy)\b|(?:maintenance|servicing|cleaning machine|clearing jam|unjamming).{0,40}(?:without lockout|no loto|not locked out|unexpected startup|energy isolation|de-energized|deenergized|isolated|hazardous energy|stored energy)\b|(?:without lockout|no loto|not locked out).{0,40}(?:maintenance|servicing|cleaning machine|clearing jam|unjamming)\b)/i
    ],
    confidenceBoosters: [
      /\b(mine|quarry|plant|crusher|conveyor|switchgear|disconnected|power switch|tag|padlock)\b/i
    ],
    confidenceReducers: [
      /\b(locked out|isolated|de-energized)\b/i
    ],
    doNotSelectWhen: [
      /\b(locked out|isolated|zero energy verified|de-energized)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.14105'],
    followUpQuestions: [
      'Is electrical power disconnected and locked out before mechanical work begins?',
      'Are individual locks and tags applied to the disconnect switches by each worker?',
      'Has the power switch been tested to verify the circuit is de-energized?'
    ],
    mechanismChain: {
      initiatingCondition: 'Miner services or cleans a conveyor or crusher without disconnecting and locking out the main power switch.',
      releaseOrFailureMode: 'Another employee starts the conveyor from the control booth or remote control.',
      exposurePathway: 'Miner is inside the conveyor tail pulley guard zone or crusher box.',
      consequences: 'Fatal crushing, entanglement, or amputation.'
    },
    controlPrinciples: [
      'De-energize the equipment and pull the disconnect immediately.',
      'Each worker must apply their own padlock and tag to the disconnect lever.',
      'Test the start button to verify zero energy before beginning work.'
    ]
  },

  // 9. Chemical containers / unlabeled or open containers
  {
    id: 'chemical-container-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'hazardous_materials',
    standardCitation: '29 CFR 1910.1200(f)(6)',
    standardTitle: 'Workplace labeling (hazard communication)',
    appliesWhen: [
      /\b(chemical|container|drum|tank|pail|jug|tote|bucket|solvent|paint|acid|can|bottle|used oil|waste oil)\b/i
    ],
    requiredEvidence: [
      /\b(unlabeled|no label|missing label|open container|uncovered|no cover)\b/i
    ],
    confidenceBoosters: [
      /\b(secondary container|spray bottle|solvent drum|unidentified liquid|workplace label|warning pictograms|chemical identity)\b/i
    ],
    confidenceReducers: [
      /\b(original manufacturer label intact|immediate use container|water bottle labeled)\b/i
    ],
    doNotSelectWhen: [
      /\b(labeled|closed container|capped|sealed|covered|safe)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.1200(f)(1)'],
    followUpQuestions: [
      'Is the chemical container lacking a label identifying its contents and hazards?',
      'Is the container open, uncovered, or missing its lid?',
      'Is the chemical in a secondary container (like a spray bottle or jar) transferred from a bulk drum?',
      'Is the container intended for immediate use by the employee who transferred it?'
    ],
    mechanismChain: {
      initiatingCondition: 'A chemical container is stored without a label indicating contents/hazards, or is left open.',
      releaseOrFailureMode: 'Workers misidentify the chemical, mix incompatible substances, or the chemical spills/evaporates.',
      exposurePathway: 'Workers handle unidentified chemicals without proper PPE, or inhale toxic vapors from open containers.',
      consequences: 'Chemical burns, toxic inhalation, fires from flammables, or accidental ingestion.'
    },
    controlPrinciples: [
      'Isolate the container immediately and check SDS to identify the contents.',
      'Install a secure lid or cover to close the container.',
      'Apply a compliant HazCom workplace label indicating chemical identity and hazards.',
      'Store in compatible secondary containment if near drains.'
    ]
  },
  {
    id: 'chemical-container-msha',
    jurisdiction: 'msha',
    hazardFamily: 'hazardous_materials',
    standardCitation: '30 CFR 56.20012',
    standardTitle: 'Labeling of toxic substances',
    appliesWhen: [
      /\b(chemical|container|drum|tank|pail|jug|tote|bucket|solvent|paint|acid|can|bottle|used oil|waste oil)\b/i
    ],
    requiredEvidence: [
      /\b(unlabeled|no label|missing label|open container|uncovered|no cover)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|mill|quarry|shop|reagent|solvent|flammable|toxic|hazcom|secondary container)\b/i
    ],
    confidenceReducers: [
      /\b(original label intact|water only)\b/i
    ],
    doNotSelectWhen: [
      /\b(labeled|closed container|capped|sealed|covered)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 47.41'],
    followUpQuestions: [
      'Is the container labeled with the identity of the chemical and warnings?',
      'Is the container open or uncovered, risking spills in the workshop?',
      'Are safety data sheets (SDS) available for the chemical at the mine?'
    ],
    mechanismChain: {
      initiatingCondition: 'Toxic chemical container in mine shop is unlabeled or open.',
      releaseOrFailureMode: 'Miner contacts toxic chemical thinking it is water/inert, or spills it on shop floor.',
      exposurePathway: 'Skin contact or breathing fumes in enclosed workshop.',
      consequences: 'Chemical burns, poisoning, or skin irritation.'
    },
    controlPrinciples: [
      'Close container lid and apply a workplace identification label.',
      'Ensure SDS is accessible in the workshop database.',
      'Train mine mechanics on secondary container labeling rules.'
    ]
  },

  // 10. Compressed gas cylinders
  {
    id: 'gas-cylinders-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'compressed_gas',
    standardCitation: '29 CFR 1910.101(b)',
    standardTitle: 'Compressed gases (general safety requirements and securing)',
    appliesWhen: [
      /\b(cylinder|compressed gas|oxygen cylinder|acetylene cylinder|argon|nitrogen cylinder)\b/i
    ],
    requiredEvidence: [
      /\b(unsecured|not secured|no chain|no strap|missing cap|cap missing|missing valve protection cap|valve protection cap missing|valve cap missing|without cap|no cap|exposed to traffic|traffic impact|pedestrian walkway|walkway|aisle|travelway|stored together|oxygen and acetylene|freestanding|free standing)\b/i
    ],
    confidenceBoosters: [
      /\b(oxygen|acetylene|freestanding|no restraint|tipped|cart|valve exposed|missing valve protection cap|cap missing|regulator attached|storage area|pedestrian walkway|walkway|aisle|traffic)\b/i
    ],
    confidenceReducers: [
      /\b(in use on cart with regulator|fully chained|manifold connection)\b/i
    ],
    doNotSelectWhen: [
      /\b(secured|chained|strapped|cap installed|capped)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.252(a)(2)(iv)', '29 CFR 1926.350(a)'],
    followUpQuestions: [
      'Are the cylinders stored upright and secured with chains, straps, or racks to prevent falling?',
      'Are the protective valve caps installed on all cylinders not in active use?',
      'Are oxygen cylinders separated from fuel-gas cylinders by at least 20 feet or a 5-foot fire barrier?',
      'Are cylinders exposed to potential vehicle or traffic impact?'
    ],
    mechanismChain: {
      initiatingCondition: 'A high-pressure compressed gas cylinder is unsecured, stored without a valve cap, or co-located with incompatibles.',
      releaseOrFailureMode: 'Cylinder tips over, shearing off the high-pressure valve, or fuel/oxidizer mix ignites.',
      exposurePathway: 'Cylinder becomes a rocket projectile traveling through the workspace, or fires intensify rapidly.',
      consequences: 'Severe blunt-force impact, crushing, explosion trauma, or rapid fire spread.'
    },
    controlPrinciples: [
      'Secure the cylinder upright with a chain, strap, or rack immediately.',
      'Install the threaded valve protective cap.',
      'Segregate oxygen cylinders from fuel gas cylinders by 20 feet or a 5-foot 1/2-hour fire-resistant wall.'
    ]
  },
  {
    id: 'gas-cylinders-msha',
    jurisdiction: 'msha',
    hazardFamily: 'compressed_gas',
    standardCitation: '30 CFR 56.16005',
    standardTitle: 'Securing gas cylinders',
    appliesWhen: [
      /\b(cylinder|compressed gas|oxygen cylinder|acetylene cylinder|argon|nitrogen cylinder)\b/i
    ],
    requiredEvidence: [
      /\b(unsecured|not secured|no chain|no strap|missing cap|cap missing|missing valve protection cap|valve protection cap missing|valve cap missing|without cap|no cap|exposed to traffic|traffic impact|pedestrian walkway|walkway|aisle|travelway|stored together|oxygen and acetylene|freestanding|free standing)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|quarry|shop|welding cart|oxygen|acetylene|no chain|no strap|cap missing|missing valve protection cap|pedestrian walkway|walkway|traffic)\b/i
    ],
    confidenceReducers: [
      /\b(chained securely|capped and secured)\b/i
    ],
    doNotSelectWhen: [
      /\b(secured|chained|strapped|cap installed|capped)\b/i,
      /\b(office lobby|cracked quarry tile|tile is cracked|commercial|retail)\b/i
    ],
    commonlyConfusedWith: ['30 CFR 56.16006'],
    followUpQuestions: [
      'Are gas cylinders secured in an upright position with chains or restraints?',
      'Are valve protection caps in place when the regulator is not attached?',
      'Are cylinders stored away from mobile equipment traffic?'
    ],
    mechanismChain: {
      initiatingCondition: 'High pressure gas cylinder at mine shop is freestanding or lacks a valve cover cap.',
      releaseOrFailureMode: 'Cylinder falls or is struck by vehicle, shearing the brass valve.',
      exposurePathway: 'Miners in shop struck by cylinder projectile or released gas.',
      consequences: 'Fatal impact or severe burns.'
    },
    controlPrinciples: [
      'Secure the cylinder upright with chains in a designated rack immediately.',
      'Install the valve protection cap when not in use.',
      'Keep welding carts parked in protected areas.'
    ]
  },
  {
    id: 'conveyor-guarding-osha-gi-3ii',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.212(a)(3)(ii)',
    standardTitle: 'Point of operation guarding (conveyors and rotating parts)',
    appliesWhen: [
      /\b(conveyor|tail pulley|head pulley|take-up pulley|nip point)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no guard|missing guard|removed guard|accessible pulley|exposed belt|pinch point)\b/i
    ],
    confidenceBoosters: [
      /\b(tail pulley|head pulley|nip point|return idler|pinch point|feed belt|warehouse|packaging)\b/i
    ],
    confidenceReducers: [
      /\b(guarded by location|high elevation|restricted area)\b/i
    ],
    doNotSelectWhen: [
      /\b(guarded|guard in place|fully enclosed)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.219(c)', '29 CFR 1910.212(a)(1)'],
    followUpQuestions: [
      'Is the conveyor tail pulley, head pulley, or nip point unguarded?',
      'Are employees exposed to contact during cleaning, scraping, or tracking adjustments?'
    ],
    mechanismChain: {
      initiatingCondition: 'Conveyor pulley nip point is unguarded, leaving the intake point between the belt and pulley accessible.',
      releaseOrFailureMode: 'Nip point draws in tools, hands, or clothing during operation or cleanup.',
      exposurePathway: 'Workers shovel material or adjust belt alignment while the conveyor runs.',
      consequences: 'Severe hand/arm crushing, entanglement, or amputation.'
    },
    controlPrinciples: [
      'Stop the conveyor and lock out all energy sources before any work.',
      'Install fixed side-guards or enclosure shields that prevent reaching the nip point.',
      'Provide emergency stop pull cords along the entire conveyor route.'
    ]
  },
  {
    id: 'chemical-container-osha-gi-f1',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'hazardous_materials',
    standardCitation: '29 CFR 1910.1200(f)(1)',
    standardTitle: 'Manufacturer chemical labeling (hazard communication)',
    appliesWhen: [
      /\b(chemical|container|drum|solvent|paint|acid|can|bottle|used oil)\b/i
    ],
    requiredEvidence: [
      /\b(unlabeled|no label|missing label|open container|uncovered|no cover)\b/i
    ],
    confidenceBoosters: [
      /\b(secondary container|spray bottle|solvent drum|unidentified liquid|workplace label|warning pictograms|chemical identity)\b/i
    ],
    confidenceReducers: [
      /\b(original manufacturer label intact|immediate use container|water bottle labeled)\b/i
    ],
    doNotSelectWhen: [
      /\b(labeled|closed container|capped|sealed|covered|safe)\b/i,
      /\b(office lobby|cracked quarry tile)\b/i
    ],
    commonlyConfusedWith: ['29 CFR 1910.1200(f)(6)'],
    followUpQuestions: [
      'Is the chemical container lacking a label identifying its contents and hazards?'
    ],
    mechanismChain: {
      initiatingCondition: 'A chemical container is stored without a label indicating contents/hazards, or is left open.',
      releaseOrFailureMode: 'Workers misidentify the chemical, mix incompatible substances, or the chemical spills/evaporates.',
      exposurePathway: 'Workers handle unidentified chemicals without proper PPE, or inhale toxic vapors from open containers.',
      consequences: 'Chemical burns, toxic inhalation, fires from flammables, or accidental ingestion.'
    },
    controlPrinciples: [
      'Isolate the container immediately and check SDS to identify the contents.',
      'Apply a compliant HazCom workplace label indicating chemical identity and hazards.'
    ]
  }
];
