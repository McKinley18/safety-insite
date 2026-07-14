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
  {
    id: 'stairs-defect-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'walking_working_surfaces',
    standardCitation: '1910.22(a)(1)',
    standardTitle: 'Walking-working surfaces kept in safe condition',
    appliesWhen: [
      /\b(stair|stairs|stairway|stair tread|tread|riser|landing)\b/i
    ],
    requiredEvidence: [
      /\b(damaged|broken|uneven|loose|cracked|trip hazard|defective|worn)\b/i
    ],
    confidenceBoosters: [
      /\b(access stairs|access stair|platform|landing|step)\b/i,
    ],
    confidenceReducers: [
      /\b(repaired|replaced|good condition|safe)\b/i,
    ],
    doNotSelectWhen: [
      /\b(office lobby|cracked quarry tile|tile is cracked)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.23'],
    followUpQuestions: [
      'What stair tread, riser, landing, or step is damaged or uneven?',
      'Is the stair in active use by employees or isolated from access?',
      'Has the damaged stair component been repaired or removed from service?'
    ],
    mechanismChain: {
      initiatingCondition: 'A stair tread, riser, or landing is damaged, loose, uneven, or otherwise defective.',
      releaseOrFailureMode: 'A worker can misstep, trip, or lose traction on the damaged stair surface.',
      exposurePathway: 'Employees use the access stairs or landing while the defect remains in service.',
      consequences: 'Trip/fall, sprain, fracture, or secondary impact injury.'
    },
    controlPrinciples: [
      'Block access to the damaged stair until repaired.',
      'Repair or replace the damaged tread/riser and verify the repair.',
      'Inspect the stairway for adjacent defects or loose components before reopening.'
    ]
  },
  {
    id: 'ladder-setup-osha-construction',
    jurisdiction: 'osha_construction',
    hazardFamily: 'fall_protection',
    standardCitation: '29 CFR 1926.1053(b)(1)',
    standardTitle: 'Portable ladders used as access equipment must be used properly',
    appliesWhen: [
      /\b(ladder|extension ladder|step ladder|portable ladder)\b/i
    ],
    requiredEvidence: [
      /\b(muddy base|soft base|short distance above the landing|extends? only a short distance above the landing|too far from the top step|unsafe ladder angle|used incorrectly|improperly set|not secured|slipping)\b/i
    ],
    confidenceBoosters: [
      /\b(construction|jobsite|landing|platform|roof|access)\b/i,
    ],
    confidenceReducers: [
      /\b(secured properly|proper angle|tied off|stable)\b/i,
    ],
    doNotSelectWhen: [
      /\b(parked|stored|not in use)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1926.501', '29 CFR 1910.23'],
    followUpQuestions: [
      'How was the ladder positioned and what was wrong with the setup?',
      'Was the ladder on a stable, level base and extended enough above the landing?',
      'Was the ladder in active use or simply stored/parked?'
    ],
    mechanismChain: {
      initiatingCondition: 'A portable ladder is set on an unstable base or does not extend far enough above the landing.',
      releaseOrFailureMode: 'The ladder can slip, tip, or fail to provide secure hand/foot transition.',
      exposurePathway: 'Workers climb or descend the ladder during access to an elevated area.',
      consequences: 'Fall to a lower level, fracture, head injury, or fatal trauma.'
    },
    controlPrinciples: [
      'Remove the ladder from service until the setup is corrected.',
      'Place the ladder on a stable base at a proper angle and extend above the landing.',
      'Use an alternate access method if the required ladder setup cannot be achieved.'
    ]
  },
  {
    id: 'construction-gfci-osha-construction',
    jurisdiction: 'osha_construction',
    hazardFamily: 'electrical',
    standardCitation: '29 CFR 1926.404(b)(1)(ii)',
    standardTitle: 'Ground-fault protection for receptacles',
    appliesWhen: [
      /\b(missing|no|without)\b.*\b(gfci|ground fault)\b/i,
      /\b(temporary power|temporary wiring|construction site)\b.*\b(gfci|ground fault)\b/i,
      /\b(damaged|frayed|cut|exposed insulation)\b.*\b(extension cord|power cord|cord)\b.*\b(energized|in use|wet|damp|water)\b/i,
      /\b(extension cord|power cord|cord)\b.*\b(damaged|frayed|cut|exposed insulation)\b.*\b(energized|in use|wet|damp|water)\b/i,
    ],
    requiredEvidence: [
      /\b(construction site|temporary power|temporary wiring|cord-and-plug tool|receptacle|extension cord|power cord|cord)\b/i
    ],
    confidenceBoosters: [
      /\b(wet|damp|outdoor|handheld tool|portable tool)\b/i,
    ],
    confidenceReducers: [
      /\b(gfci installed|assured grounding program active|protected)\b/i,
    ],
    doNotSelectWhen: [
      /\b(office lobby|cracked quarry tile)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.303(b)(1)'],
    followUpQuestions: [
      'Is the circuit temporary power on a construction site?',
      'Is GFCI protection installed and functional or is an assured-grounding program in place?',
      'Are the cords, receptacles, and tool type appropriate for construction use and the observed conditions?'
    ],
    mechanismChain: {
      initiatingCondition: 'Temporary construction power lacks ground-fault protection for receptacles or cord-and-plug tools.',
      releaseOrFailureMode: 'A fault or wet condition can energize exposed parts or permit current leakage without rapid clearing.',
      exposurePathway: 'Workers using portable tools or temporary circuits may contact energized parts or fault current.',
      consequences: 'Shock, electrocution, arc injury, or secondary fall.'
    },
    controlPrinciples: [
      'Stop use of the temporary circuit until protection is verified.',
      'Install and test GFCI protection or an equivalent construction grounding program as required.',
      'Replace or reroute damaged temporary wiring and maintain construction electrical inspections.'
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
    id: 'workplace-exam-observation-msha',
    jurisdiction: 'msha',
    hazardFamily: 'walking_working_surfaces',
    standardCitation: '30 CFR 56.18002(a)',
    standardTitle: 'Workplace examination and hazard correction',
    appliesWhen: [
      /\b(workplace exam(?:ination)?|pre[- ]?op(?:erational)?|pre[- ]?shift)\b/i
    ],
    requiredEvidence: [
      /\b(uncorrected|not corrected|not documented|failed to document|travelway hazard|crusher|plant|observed condition)\b/i
    ],
    confidenceBoosters: [
      /\b(mine|travelway|crusher|plant|work area|active hazard)\b/i,
    ],
    confidenceReducers: [
      /\b(documented and corrected|no remaining hazard|already corrected)\b/i,
    ],
    doNotSelectWhen: [
      /\b(office only|admin only|training record only)\b/i,
      /\b(clean|clear|swept|orderly)\b/i,
    ],
    commonlyConfusedWith: ['30 CFR 56.20003(a)'],
    followUpQuestions: [
      'What condition or travelway hazard was observed and left uncorrected?',
      'Was a workplace examination performed before the shift or task started?',
      'Did the exam document and correct the observed hazard?'
    ],
    mechanismChain: {
      initiatingCondition: 'A mine workplace examination did not identify or document a hazard that remained in the work/travel area.',
      releaseOrFailureMode: 'The uncorrected condition continues to expose miners during normal travel or work.',
      exposurePathway: 'Employees continue to use the affected area after the missed or incomplete examination.',
      consequences: 'Slip, trip, fall, struck-by, or other injury from the uncorrected condition.'
    },
    controlPrinciples: [
      'Complete and document a workplace examination before continued use of the area.',
      'Correct the observed condition or withdraw miners until it is controlled.',
      'Track hazardous findings and re-examine the area after correction.'
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
    id: 'missing-handrail-open-edge-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'fall_protection',
    standardCitation: '29 CFR 1910.28(b)(1)',
    standardTitle: 'Duty to have fall protection (unprotected sides and edges)',
    appliesWhen: [
      /\b(missing handrail|no handrail|missing guardrail|no guardrail|open edge|unprotected edge|stair landing)\b/i
    ],
    requiredEvidence: [
      /\b(fall hazard|edge|stair|landing|lower level|unguarded)\b/i
    ],
    confidenceBoosters: [
      /\b(height|mezzanine|platform|drop|handrail|guardrail)\b/i,
    ],
    confidenceReducers: [
      /\b(guardrail installed|protected|safe)\b/i,
    ],
    doNotSelectWhen: [
      /\b(office lobby|cracked quarry tile)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.23'],
    followUpQuestions: [
      'What is the fall distance or lower-level exposure at the landing or edge?',
      'Are the handrail/guardrail components missing, damaged, or temporarily removed?',
      'Is this a stair/landing edge or a floor opening requiring a different fall-protection control?'
    ],
    mechanismChain: {
      initiatingCondition: 'A stair landing or open edge lacks a required handrail or guardrail.',
      releaseOrFailureMode: 'A worker can lose balance or step past the protected edge.',
      exposurePathway: 'Employees travel near the edge while using the stairs or landing.',
      consequences: 'Fall to a lower level, fracture, head injury, or fatal trauma.'
    },
    controlPrinciples: [
      'Block access until the edge protection is restored.',
      'Install a compliant temporary handrail/guardrail system.',
      'Repair or replace the permanent edge protection and verify dimensions.'
    ]
  },
  {
    id: 'fall-exposure-msha',
    jurisdiction: 'msha',
    hazardFamily: 'fall_protection',
    standardCitation: '30 CFR 56.15005',
    standardTitle: 'Safety belts and lines (fall protection)',
    appliesWhen: [
      /\b(elevated platform|crusher platform|screen deck|unprotected edge|leading edge|runway|mezzanine|elevated work|safety belt|harness|safety line)\b/i
    ],
    requiredEvidence: [
      /\b(unguarded|no rail|no guardrail|missing guardrail|no barrier|barrier missing|fall hazard|fall exposure|unprotected edge|no safety belt|no harness|no safety line)\b/i
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
  {
    id: 'stored-hydraulic-energy-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding_loto',
    standardCitation: '29 CFR 1910.147',
    standardTitle: 'The control of hazardous energy',
    appliesWhen: [
      /\b(stored hydraulic energy|hydraulic pressure|stored pressure|pressure not relieved|pressurized ram)\b/i
    ],
    requiredEvidence: [
      /\b(hydraulic|pressure|ram|cylinder|stored energy)\b/i,
      /\b(released|not relieved|drop|movement|maintenance|servicing)\b/i
    ],
    confidenceBoosters: [
      /\b(unexpected|release|pin|block|zero energy)\b/i,
    ],
    confidenceReducers: [
      /\b(pressure relieved|zero energy verified|blocked and pinned|safe)\b/i,
    ],
    doNotSelectWhen: [
      /\b(no hydraulic|no pressure)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.212(a)(1)'],
    followUpQuestions: [
      'What hydraulic source, pressure, or stored-energy path remains live?',
      'Has pressure been relieved and has zero-energy status been verified?',
      'Is this maintenance or servicing that requires energy isolation before access?'
    ],
    mechanismChain: {
      initiatingCondition: 'A hydraulic system retains stored pressure after power is removed.',
      releaseOrFailureMode: 'Residual pressure or an uncontrolled drop occurs when the energy is not relieved or blocked.',
      exposurePathway: 'Workers in the work zone can be struck, pinned, or caught by moving hydraulic components.',
      consequences: 'Crushing, struck-by trauma, amputation, or fatal injury.'
    },
    controlPrinciples: [
      'Relieve hydraulic pressure and block the load before access.',
      'Lock out and verify zero energy before servicing or repair.',
      'Repair the system and maintain the blocking/verification procedure for future work.'
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
  },
  {
    id: 'chemical-drain-containment-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'hazardous_materials',
    standardCitation: '29 CFR 1910.1200(f)(6)',
    standardTitle: 'Workplace labeling and container identification for hazardous chemicals',
    appliesWhen: [
      /\b(chemical|container|drum|tank|pail|jug|tote|bucket|used oil|waste oil|solvent|acid|cleaner)\b/i
    ],
    requiredEvidence: [
      /\b(drain|floor drain|secondary containment|containment|near a drain|without secondary containment|release path|spill path)\b/i
    ],
    confidenceBoosters: [
      /\b(unlabeled|missing label|unknown contents|spray bottle|secondary container|workplace label)\b/i,
    ],
    confidenceReducers: [
      /\b(closed cabinet|sealed drum|no drain nearby|contained)\b/i,
    ],
    doNotSelectWhen: [
      /\b(water only|nonhazardous|empty and clean)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.22(a)(2)'],
    followUpQuestions: [
      'What chemical or liquid is stored and what hazard identity is known?',
      'How close is the container or release path to the drain and what containment is present?',
      'Is the container open, uncovered, or in a secondary container that needs a workplace label?'
    ],
    mechanismChain: {
      initiatingCondition: 'A chemical or oily container is stored near a drain or release path without verified containment or identification.',
      releaseOrFailureMode: 'A spill or leak can migrate into the drain or expose workers to unknown contents.',
      exposurePathway: 'Workers handling the container or walking nearby may contact the release path, vapors, or contaminated floor.',
      consequences: 'Chemical exposure, slip/fall, environmental release, or fire/irritation hazard depending on the material.'
    },
    controlPrinciples: [
      'Move the container away from the drain and place it in compatible secondary containment.',
      'Identify the contents and apply required workplace labeling if the container is a secondary container.',
      'Stop the release and clean/protect the drain path before returning the area to use.'
    ]
  },
  {
    id: 'grinder-tongue-guard-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'machine_guarding',
    standardCitation: '29 CFR 1910.215',
    standardTitle: 'Abrasive wheel machinery',
    appliesWhen: [
      /\b(grinder|abrasive wheel|cutoff wheel|cut-off wheel|grinding wheel)\b.*\b(tongue guard|wheel guard|missing guard|guard removed|no guard|damaged guard)\b/i,
      /\b(tongue guard|wheel guard|missing guard|guard removed|no guard|damaged guard)\b.*\b(grinder|abrasive wheel|cutoff wheel|cut-off wheel|grinding wheel)\b/i,
    ],
    requiredEvidence: [
      /\b(grinder|abrasive wheel|cutoff wheel|cut-off wheel|grinding wheel)\b/i,
      /\b(tongue guard|wheel guard|missing guard|guard removed|no guard|damaged guard)\b/i,
    ],
    confidenceBoosters: [
      /\b(line of fire|wheel|fragment|abrasive)\b/i,
    ],
    confidenceReducers: [
      /\b(noise only|hearing only|without guard issue)\b/i,
    ],
    doNotSelectWhen: [
      /\b(guard installed|guard in place|safe)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.212(a)(1)'],
    followUpQuestions: [
      'What grinder or abrasive wheel is in use and which guard is missing?',
      'Is the wheel intact, rated, and set up per the manufacturer?',
      'Is the operator positioned in the line of fire?'
    ],
    mechanismChain: {
      initiatingCondition: 'An abrasive wheel tool is used without the required tongue guard or wheel guard.',
      releaseOrFailureMode: 'The rotating wheel or fragments can contact the operator or nearby workers.',
      exposurePathway: 'The operator stands in the line of fire and within reach of the wheel hazard.',
      consequences: 'Laceration, eye injury, fracture, amputation, or fatal struck-by/contact injury.'
    },
    controlPrinciples: [
      'Stop use and remove the grinder from service until the guard is restored.',
      'Install the correct tongue guard or wheel guard before the tool returns to use.',
      'Verify wheel condition, rating, rest adjustment, and operating position before continued work.'
    ]
  },
  {
    id: 'aerial-lift-tie-off-osha-construction',
    jurisdiction: 'osha_construction',
    hazardFamily: 'fall_protection',
    standardCitation: '29 CFR 1926.453(b)(2)(v)',
    standardTitle: 'Boom and aerial lifts',
    appliesWhen: [
      /\b(aerial lift|boom lift|bucket truck|manlift|mobile elevating work platform|mewp)\b.*\b(not tied off|tie[- ]?off missing|tie[- ]?off not used|harness missing|lanyard missing|leaning out|over the rail|outside the rail|reach over)\b/i,
      /\b(not tied off|tie[- ]?off missing|leaning out|over the rail|outside the rail|reach over)\b.*\b(aerial lift|boom lift|bucket truck|manlift|mobile elevating work platform|mewp)\b/i,
      /\b(aerial lift|boom lift|bucket truck|manlift|mobile elevating work platform|mewp)\b.*\b(harness|lanyard|anchor)\b.*\b(status|condition|use|configuration)\b.*\b(unknown|unclear|not verified|not confirmed)\b/i,
    ],
    requiredEvidence: [
      /\b(aerial lift|boom lift|bucket truck|manlift|mobile elevating work platform|mewp)\b/i,
      /\b(not tied off|tie[- ]?off missing|harness missing|lanyard missing|leaning out|over the rail|outside the rail|reach over|harness|lanyard|anchor)\b/i,
    ],
    confidenceBoosters: [
      /\b(fall|height|elevated|rail)\b/i,
    ],
    confidenceReducers: [
      /\b(inside the platform|tied off|guarded)\b/i,
    ],
    doNotSelectWhen: [
      /\b(aerial lift parked|stored|not in use)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1926.502'],
    followUpQuestions: [
      'What lift type is in use and what fall protection does the manufacturer require?',
      'Was the worker tied off to an approved anchor and is the rail/gate intact?',
      'Was the worker leaning or reaching outside the platform while elevated?'
    ],
    mechanismChain: {
      initiatingCondition: 'A worker is elevated in a lift platform without verified restraint or fall protection.',
      releaseOrFailureMode: 'The occupant may lose balance, climb the rail, or be ejected when the lift moves or the task shifts.',
      exposurePathway: 'The worker is exposed to a lower-level fall and possible platform-impact or entrapment during movement.',
      consequences: 'Serious fall injury, suspension trauma, fracture, or fatality.'
    },
    controlPrinciples: [
      'Keep the occupant inside the platform until the fall-protection requirement is verified.',
      'Use the manufacturer-required restraint/fall-protection system before resuming work.',
      'Use a different access method if the work requires reaching outside the platform envelope.'
    ]
  },
  {
    id: 'elevated-forks-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'mobile_equipment',
    standardCitation: '29 CFR 1910.178',
    standardTitle: 'Powered industrial trucks',
    appliesWhen: [
      /\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b.*\b(elevated forks|raised forks|forks elevated|load elevated)\b/i,
      /\b(elevated forks|raised forks|forks elevated|load elevated)\b.*\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b/i,
    ],
    requiredEvidence: [
      /\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b/i,
      /\b(elevated forks|raised forks|forks elevated|load elevated)\b/i,
    ],
    confidenceBoosters: [
      /\b(pedestrian|travel|blind corner|traffic|strike|struck)\b/i,
    ],
    confidenceReducers: [
      /\b(forks lowered|travel position|parked)\b/i,
    ],
    doNotSelectWhen: [
      /\b(no mobile equipment|no forklift)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1926.602', '30 CFR 56.9100'],
    followUpQuestions: [
      'How high are the forks/load and what travel path is being used?',
      'Are pedestrians, blind corners, or traffic conflicts present?',
      'Are the forks lowered to the travel position?'
    ],
    mechanismChain: {
      initiatingCondition: 'A powered industrial truck or pallet truck is traveling with forks raised above the travel position.',
      releaseOrFailureMode: 'Raised forks reduce stability and increase the chance of striking a worker, load, or obstacle during travel or turning.',
      exposurePathway: 'Workers nearby can be caught in the travel path or struck by the elevated load/forks.',
      consequences: 'Struck-by, crush, or tip-over injury; damage to the load or nearby equipment.'
    },
    controlPrinciples: [
      'Lower the forks to the travel position before movement continues.',
      'Separate pedestrians and equipment and use spotters or route controls where needed.',
      'Adjust travel rules, aisle design, and operator training to keep forks low and travel visible.'
    ]
  },
  {
    id: 'pit-defective-truck-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'mobile_equipment',
    standardCitation: '29 CFR 1910.178(p)(1)',
    standardTitle: 'Powered industrial trucks not in safe operating condition',
    appliesWhen: [
      /\b(forklift|pallet truck|powered industrial truck|industrial truck)\b/i
    ],
    requiredEvidence: [
      /\b(damaged|defective|leaking|leak|worn|unsafe|out of service|pre[- ]?op|pre[- ]?operational|remains in service|in service|backup alarm|audible warning|reverse alarm|horn|warning device)\b/i
    ],
    confidenceBoosters: [
      /\b(hydraulic line|tires|brakes|mast|forks|inspection|service|backup alarm|audible warning|reverse alarm|horn)\b/i,
    ],
    confidenceReducers: [
      /\b(removed from service|repaired|safe to operate)\b/i,
    ],
    doNotSelectWhen: [
      /\b(no forklift|no mobile equipment)\b/i,
    ],
    commonlyConfusedWith: ['30 CFR 56.9100', '29 CFR 1910.178(l)'],
    followUpQuestions: [
      'What defect is present on the forklift or powered industrial truck?',
      'Is the truck still in service or has it been removed from service pending repair?',
      'Has a pre-use inspection or qualified repair evaluation been completed?'
    ],
    mechanismChain: {
      initiatingCondition: 'A powered industrial truck has a defect such as worn tires or a leaking hydraulic line but remains in service.',
      releaseOrFailureMode: 'The defect can reduce control, stability, braking, or hydraulic function during travel or lifting.',
      exposurePathway: 'Operators, pedestrians, and nearby workers remain in the truck’s travel and load zone.',
      consequences: 'Tip-over, struck-by, crush, or loss-of-control injury.'
    },
    controlPrinciples: [
      'Remove the truck from service until the defect is corrected.',
      'Repair or replace the affected components and verify safe operation.',
      'Perform pre-use inspection and defect reporting before return to service.'
    ]
  },
  {
    id: 'excavator-struck-by-osha-construction',
    jurisdiction: 'osha_construction',
    hazardFamily: 'excavation_trenching',
    standardCitation: '29 CFR 1926.651',
    standardTitle: 'Specific excavation requirements',
    appliesWhen: [
      /\b(excavator|backhoe)\b.*\b(struck[- ]by|bucket path|swing radius|swing|workers? near|worker nearby)\b/i,
      /\b(struck[- ]by|bucket path|swing radius|swing)\b.*\b(excavator|backhoe)\b/i,
    ],
    requiredEvidence: [
      /\b(excavator|backhoe)\b/i,
      /\b(struck[- ]by|bucket path|swing radius|swing)\b/i,
    ],
    confidenceBoosters: [
      /\b(exclusion zone|earthmoving|excavation|utility|trench)\b/i,
    ],
    confidenceReducers: [
      /\b(clearly separated|no workers nearby)\b/i,
    ],
    doNotSelectWhen: [
      /\b(not excavator|not backhoe)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.178', '29 CFR 1926.602'],
    followUpQuestions: [
      'What work area, swing radius, and exclusion zone are established around the excavator?',
      'Are workers or spotters inside the bucket path or near an uncontrolled edge?',
      'Is there an excavation or utility context that changes the required controls?'
    ],
    mechanismChain: {
      initiatingCondition: 'An excavator or backhoe is swinging material near workers and the struck-by envelope is not defined.',
      releaseOrFailureMode: 'A bucket, boom, or load can swing into workers or adjacent hazards when the exclusion zone is not controlled.',
      exposurePathway: 'Workers on foot or in vehicles can be struck within the machine swing radius or bucket path.',
      consequences: 'Crush, struck-by trauma, fracture, or fatal injury.'
    },
    controlPrinciples: [
      'Establish a barricaded exclusion area around the swing zone.',
      'Use a spotter or traffic control only after the exclusion zone is defined and enforced.',
      'Reconfigure the work so workers do not enter the bucket path or under handled material.'
    ]
  },
  {
    id: 'blocked-extinguisher-access-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'fire_protection',
    standardCitation: '29 CFR 1910.157(c)(1)',
    standardTitle: 'Portable fire extinguishers',
    appliesWhen: [
      /\b(blocked|obstructed|inaccessible)\b.*\b(fire extinguisher|extinguisher)\b/i,
      /\b(fire extinguisher|extinguisher)\b.*\b(blocked|obstructed|inaccessible)\b/i,
    ],
    requiredEvidence: [
      /\b(fire extinguisher|extinguisher)\b/i,
      /\b(blocked|obstructed|inaccessible)\b/i,
    ],
    confidenceBoosters: [
      /\b(access|visible|mounted|corridor|pallet)\b/i,
    ],
    confidenceReducers: [
      /\b(readily accessible|unobstructed)\b/i,
    ],
    doNotSelectWhen: [
      /\b(no extinguisher|fire extinguisher not present)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.165'],
    followUpQuestions: [
      'How far is the obstruction from the extinguisher and can a worker reach it immediately?',
      'Is the extinguisher mounted, identified, and visible from the access path?',
      'Is the blockage temporary or a routine layout problem?'
    ],
    mechanismChain: {
      initiatingCondition: 'A fire extinguisher is not readily accessible because an object blocks the approach path.',
      releaseOrFailureMode: 'Employees may not be able to reach the extinguisher promptly during an incipient fire.',
      exposurePathway: 'Fire response is delayed while people move the obstruction or search for another device.',
      consequences: 'Fire growth, smoke inhalation, burn injury, or delayed suppression response.'
    },
    controlPrinciples: [
      'Remove the obstruction immediately and keep the extinguisher accessible.',
      'Relocate storage so the approach path stays clear and visible.',
      'Redesign layout or add protection so the access path stays open during normal operations.'
    ]
  },
  {
    id: 'flammable-storage-issue-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'fire_protection',
    standardCitation: '29 CFR 1910.106',
    standardTitle: 'Flammable liquids',
    appliesWhen: [
      /\b(flammable liquids?|flammables?|combustible liquids?)\b.*\b(hallway|corridor|open shelves|near ignition source|ignition source|aisle)\b/i,
      /\b(hallway|corridor|open shelves|aisle)\b.*\b(flammable liquids?|flammables?|combustible liquids?)\b/i,
    ],
    requiredEvidence: [
      /\b(flammable liquids?|flammables?|combustible liquids?)\b/i,
      /\b(storage|hallway|corridor|open shelves|ignition source|aisle)\b/i,
    ],
    confidenceBoosters: [
      /\b(container|cabinet|vapors?|spark|heat)\b/i,
    ],
    confidenceReducers: [
      /\b(closed cabinet|protected storage)\b/i,
    ],
    doNotSelectWhen: [
      /\b(water only|nonflammable)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.157(c)(1)', '29 CFR 1910.1200'],
    followUpQuestions: [
      'What flammable or combustible liquid is stored and what container or quantity is present?',
      'Is the container or cabinet compliant, closed, and separated from ignition sources?',
      'Can the storage location be kept clear of traffic and emergency routes?'
    ],
    mechanismChain: {
      initiatingCondition: 'Flammable or combustible liquid storage is located in a traffic or ignition-exposed area.',
      releaseOrFailureMode: 'An ignition source, spill, or poor storage configuration can allow rapid fire spread.',
      exposurePathway: 'Workers passing through the area or handling the material are exposed to fire, vapor, or smoke conditions.',
      consequences: 'Fire, burn injury, smoke inhalation, or explosion if vapors accumulate.'
    },
    controlPrinciples: [
      'Move the material out of the traffic route and remove ignition sources.',
      'Store the material in the proper closed container or cabinet with controlled access.',
      'Redesign the storage location and ignition-control layout to keep flammables in a protected area.'
    ]
  },
  {
    id: 'respirator-fit-test-osha-gi',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'industrial_hygiene',
    standardCitation: '29 CFR 1910.134',
    standardTitle: 'Respiratory protection',
    appliesWhen: [
      /\b(respirator|respiratory protection)\b.*\b(no fit test|missing fit test|without fit test|no program record|program record missing|not fit tested)\b/i,
      /\b(no fit test|missing fit test|without fit test|no program record|program record missing)\b.*\b(respirator|respiratory protection)\b/i,
    ],
    requiredEvidence: [
      /\b(respirator|respiratory protection)\b/i,
      /\b(fit test|medical clearance|program record|program)\b/i,
    ],
    confidenceBoosters: [
      /\b(dust|fume|vapor|chemical|silica|noise)\b/i,
    ],
    confidenceReducers: [
      /\b(not required|voluntary use only)\b/i,
    ],
    doNotSelectWhen: [
      /\b(no respirator|not a respiratory task)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.132(d)', '29 CFR 1910.1053'],
    followUpQuestions: [
      'What hazard requires the respirator and what contaminant route is present?',
      'Has the user been fit tested and medically cleared for the respirator model?',
      'Is the respirator part of a written program with training, maintenance, and change-out rules?'
    ],
    mechanismChain: {
      initiatingCondition: 'A respirator is being used without verified fit testing or program documentation.',
      releaseOrFailureMode: 'The respirator may not seal or may not be selected within a compliant program.',
      exposurePathway: 'Respirable contaminants can bypass the face seal or overwhelm the protection factor.',
      consequences: 'Inhalation exposure, illness, or reduced protection against dust, fumes, vapors, or other contaminants.'
    },
    controlPrinciples: [
      'Pause the task until respirator program requirements are verified.',
      'Use a properly selected and fit-tested respirator only under the written program.',
      'Substitute or engineer the exposure down so respiratory protection is a last line of defense.'
    ]
  },
  {
    id: 'line-breaking-confined-space-unclear',
    jurisdiction: 'osha_general_industry',
    hazardFamily: 'confined_space',
    standardCitation: '29 CFR 1910.146',
    standardTitle: 'Permit-required confined spaces',
    appliesWhen: [
      /\b(line break(?:ing)?|breaking into|opening the line into|line opening)\b.*\b(vessel|tank|confined space|confined area|manhole|vault)\b/i,
      /\b(vessel|tank|confined space|confined area|manhole|vault)\b.*\b(line break(?:ing)?|opening the line|maintenance)\b/i,
    ],
    requiredEvidence: [
      /\b(vessel|tank|confined space|confined area|manhole|vault)\b/i,
      /\b(line break(?:ing)?|opening the line|maintenance|atmosphere|entry)\b/i,
    ],
    confidenceBoosters: [
      /\b(atmospheric testing|purge|ventilation|isolation|permit)\b/i,
    ],
    confidenceReducers: [
      /\b(adjacent only|not entering|outside the space)\b/i,
    ],
    doNotSelectWhen: [
      /\b(not a space|open room)\b/i,
    ],
    commonlyConfusedWith: ['29 CFR 1910.147', '29 CFR 1910.1200'],
    followUpQuestions: [
      'Is this a confined-space entry or an adjacency/line-break task outside the space?',
      'What atmospheric testing, isolation, purging, and ventilation are verified before opening the line?',
      'Are attendant, rescue, and entry-control requirements active if anyone enters the space?'
    ],
    mechanismChain: {
      initiatingCondition: 'A line break or process opening into a vessel or confined area may release product or atmosphere into the space.',
      releaseOrFailureMode: 'The connected line or vessel can discharge product, vapor, or pressure when isolation and atmospheric controls are incomplete.',
      exposurePathway: 'An entrant or line-break worker may be exposed to a confined or changing atmosphere before the space is classified.',
      consequences: 'Asphyxiation, poisoning, fire/explosion, engulfment, or fatal rescue escalation.'
    },
    controlPrinciples: [
      'Stop the line-break task until entry classification and isolation are verified.',
      'Perform atmospheric testing and isolate or ventilate the space or vessel before opening.',
      'Use the full permit/alternate-entry and line-break procedure when the task enters the confined-space envelope.'
    ]
  }
];
