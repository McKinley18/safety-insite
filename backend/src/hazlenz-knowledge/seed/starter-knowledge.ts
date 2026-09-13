export type StarterKnowledgeDocument = {
  title: string;
  agency: 'MSHA' | 'OSHA' | 'NIOSH' | 'Internal' | 'Other';
  sourceType:
    | 'regulation'
    | 'policy'
    | 'interpretation'
    | 'directive'
    | 'accident_report'
    | 'fatality_report'
    | 'journal'
    | 'case_study'
    | 'internal_report'
    | 'corrective_action'
    | 'training'
    | 'other';
  authorityTier: number;
  citation: string;
  sourceUrl?: string;
  approvalStatus: 'approved';
  hazardTags: string[];
  equipmentTags: string[];
  taskTags: string[];
  standardTags: string[];
  lessonTags: string[];
  summary: string;
  rawText: string;
};

export const starterKnowledge: StarterKnowledgeDocument[] = [
  {
    title: 'Machine Guarding Hazard Recognition Starter Reference',
    agency: 'MSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-MSHA-MACHINE-GUARDING-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['machine guarding', 'unguarded moving parts', 'pinch point', 'entanglement'],
    equipmentTags: ['conveyor', 'pulley', 'belt', 'chain', 'sprocket', 'rotating shaft'],
    taskTags: ['inspection', 'maintenance', 'cleanup', 'normal operation'],
    standardTags: ['guarding', 'moving machine parts'],
    lessonTags: ['contact hazard', 'entanglement', 'access exposure', 'guard bypass'],
    summary:
      'Moving machine parts create contact, pinch-point, and entanglement hazards when guards are missing, damaged, bypassed, or when access is possible from travelways or work areas.',
    rawText:
      'Machine guarding hazards are indicated when moving machine parts such as conveyor pulleys, belts, chains, sprockets, rotating shafts, gears, fan blades, or other motion points are exposed to employee or miner contact. SafeScope should treat missing, damaged, bypassed, or inadequate guarding as a serious exposure condition, especially when the component is accessible from a walkway, travelway, work platform, cleanup area, or maintenance position. Important evidence includes whether the equipment is energized, whether the guard is missing or removed, whether the exposed part is reachable during normal work, and whether lockout/tagout or blocking is required before correction. Recommended controls include restricting access, stopping exposure, repairing or installing guarding, verifying energy isolation where maintenance is involved, and documenting closure with photo evidence.',
  },
  {
    title: 'Lockout Tagout Energy Control Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-LOTO-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['lockout tagout', 'hazardous energy', 'unexpected startup', 'stored energy'],
    equipmentTags: ['machine', 'conveyor', 'press', 'motor', 'electrical panel', 'hydraulic system'],
    taskTags: ['maintenance', 'servicing', 'repair', 'clearing jam', 'adjustment'],
    standardTags: ['energy control', 'lockout tagout', 'loto'],
    lessonTags: ['unexpected energization', 'stored energy release', 'maintenance exposure'],
    summary:
      'LOTO concerns arise when servicing, maintenance, jam clearing, adjustment, or repair may expose workers to unexpected startup or release of stored energy.',
    rawText:
      'Hazardous energy control should be considered when employees perform servicing, maintenance, repair, adjustment, cleaning, jam clearing, or troubleshooting where unexpected energization, startup, movement, or release of stored electrical, mechanical, hydraulic, pneumatic, thermal, chemical, or gravitational energy could cause injury. SafeScope should ask whether the task is normal operation or servicing, whether guards or interlocks are removed, whether the machine can start unexpectedly, whether stored energy remains, and whether locks, tags, blocks, or verification steps are in place. Recommended controls include de-energizing equipment, isolating all energy sources, applying locks and tags, releasing or restraining stored energy, verifying zero energy, and requiring closure evidence such as lockout verification, supervisor sign-off, and photos.',
  },
  {
    title: 'Mobile Equipment and Pedestrian Interaction Starter Reference',
    agency: 'MSHA',
    sourceType: 'case_study',
    authorityTier: 3,
    citation: 'SAFE-SCOPE-MOBILE-EQUIPMENT-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['mobile equipment', 'struck by', 'blind spot', 'pedestrian exposure'],
    equipmentTags: ['loader', 'haul truck', 'forklift', 'pickup truck', 'mobile equipment'],
    taskTags: ['travel', 'loading', 'dumping', 'spotting', 'maintenance'],
    standardTags: ['traffic control', 'mobile equipment', 'workplace examination'],
    lessonTags: ['line of fire', 'blind area', 'pedestrian separation', 'spotter control'],
    summary:
      'Mobile equipment hazards increase when pedestrians, light vehicles, spotters, or maintenance workers enter travel paths, blind spots, or loading/dumping zones.',
    rawText:
      'Mobile equipment hazards are indicated when workers, pedestrians, spotters, mechanics, or light vehicles are exposed to haul trucks, loaders, forklifts, service trucks, or other powered mobile equipment. SafeScope should identify struck-by, caught-between, run-over, backing, dumping, berm, visibility, and blind-spot concerns. Critical evidence includes traffic pattern, pedestrian route, lighting, backup alarms, cameras, spotter location, radio communication, berm condition, grade, speed, and whether workers are in the line of fire. Recommended controls include separating pedestrians and equipment, establishing traffic control, using spotters safely, improving visibility, verifying alarms and cameras, maintaining berms, setting exclusion zones, and documenting corrective actions.',
  },
  {
    title: 'Fall Hazard Recognition Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-FALL-HAZARD-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['fall hazard', 'unprotected edge', 'ladder', 'platform', 'elevated work'],
    equipmentTags: ['ladder', 'platform', 'scaffold', 'mezzanine', 'roof', 'guardrail'],
    taskTags: ['elevated work', 'access', 'maintenance', 'inspection'],
    standardTags: ['fall protection', 'guardrails', 'ladders'],
    lessonTags: ['fall from elevation', 'unprotected opening', 'access hazard'],
    summary:
      'Fall hazards exist where workers may fall from elevation, through openings, from ladders, or from platforms lacking adequate protection.',
    rawText:
      'Fall hazards are indicated when workers are exposed to unprotected edges, floor holes, wall openings, ladders, platforms, scaffolds, roofs, elevated maintenance points, unstable access, or missing guardrails. SafeScope should ask for height, surface condition, access method, guardrail or fall protection status, worker task, duration of exposure, and rescue considerations. Recommended controls include guardrails, covers, safe access, ladder correction, fall arrest or restraint systems, anchor verification, housekeeping at elevated surfaces, and closure evidence showing the corrected edge, cover, ladder, or protection system.',
  },
  {
    title: 'Electrical Hazard Recognition Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-ELECTRICAL-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['electrical', 'shock', 'arc flash', 'exposed conductor', 'damaged cord'],
    equipmentTags: ['panel', 'cord', 'junction box', 'breaker', 'disconnect', 'temporary wiring'],
    taskTags: ['inspection', 'maintenance', 'troubleshooting', 'temporary power'],
    standardTags: ['electrical safety', 'guarding live parts', 'wiring methods'],
    lessonTags: ['shock exposure', 'arc flash exposure', 'damaged insulation'],
    summary:
      'Electrical hazards include exposed live parts, damaged wiring, missing covers, improper temporary wiring, wet-location issues, and unsafe access to energized equipment.',
    rawText:
      'Electrical hazards are indicated when conductors, terminals, panels, junction boxes, disconnects, cords, temporary wiring, damaged insulation, missing covers, water intrusion, overloaded circuits, or poor electrical clearances expose workers to shock, burn, arc flash, or fire risk. SafeScope should ask whether parts are energized, whether covers are missing, whether damage is visible, whether qualified electrical work is required, whether wet conditions are present, and whether temporary wiring is being used properly. Recommended controls include restricting access, de-energizing when required, replacing damaged cords, installing covers, correcting wiring methods, maintaining working clearances, using qualified personnel, and documenting electrical correction with photos and sign-off.',
  },
  {
    title: 'Confined Space Recognition Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-CONFINED-SPACE-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['confined space', 'permit required confined space', 'atmospheric hazard', 'engulfment'],
    equipmentTags: ['tank', 'silo', 'vessel', 'vault', 'pit', 'manhole'],
    taskTags: ['entry', 'cleaning', 'inspection', 'maintenance'],
    standardTags: ['confined space', 'permit space', 'atmospheric testing'],
    lessonTags: ['oxygen deficiency', 'toxic atmosphere', 'engulfment', 'rescue planning'],
    summary:
      'Confined space concerns arise when spaces have limited entry or exit, are not designed for continuous occupancy, and may contain hazardous atmosphere or other serious hazards.',
    rawText:
      'Confined space hazards are indicated when workers enter or may enter tanks, vessels, silos, pits, vaults, manholes, hoppers, ducts, or similar spaces with limited entry or exit and not designed for continuous occupancy. SafeScope should ask whether atmospheric testing was performed, whether ventilation is needed, whether engulfment, mechanical, electrical, or chemical hazards exist, whether entry permit controls are required, whether an attendant is present, and whether rescue planning is adequate. Recommended controls include space evaluation, permit system where required, atmospheric testing, isolation, ventilation, attendant assignment, communication, rescue capability, and closure evidence such as permit verification or supervisor sign-off.',
  },
  {
    title: 'Housekeeping Slips Trips and Material Storage Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-HOUSEKEEPING-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['housekeeping', 'slip', 'trip', 'material storage', 'blocked walkway'],
    equipmentTags: ['walkway', 'stairs', 'aisle', 'floor', 'storage rack'],
    taskTags: ['inspection', 'walking working surfaces', 'material handling'],
    standardTags: ['housekeeping', 'walking working surfaces'],
    lessonTags: ['slip trip fall', 'blocked egress', 'poor storage'],
    summary:
      'Housekeeping hazards include blocked walkways, spills, debris, poor material storage, uneven surfaces, and conditions that create slip, trip, fall, or emergency access risks.',
    rawText:
      'Housekeeping hazards are indicated when aisles, walkways, stairs, platforms, exits, work areas, or travel paths are blocked, slippery, cluttered, uneven, poorly drained, or obstructed by materials, hoses, cords, debris, tools, pallets, or spilled substances. SafeScope should ask whether the path is a required travelway or emergency route, whether the condition creates slip or trip exposure, whether materials are stored securely, and whether immediate cleanup or barricading is needed. Recommended controls include cleaning spills, removing obstructions, securing cords and hoses, improving drainage, marking walkways, correcting storage, and documenting closure with before-and-after photos.',
  },
  {
    title: 'Trenching and Excavation Hazard Starter Reference',
    agency: 'OSHA',
    sourceType: 'regulation',
    authorityTier: 1,
    citation: 'SAFE-SCOPE-OSHA-TRENCHING-STARTER',
    approvalStatus: 'approved',
    hazardTags: ['trenching', 'excavation', 'cave in', 'protective system'],
    equipmentTags: ['trench', 'excavation', 'trench box', 'shoring', 'ladder'],
    taskTags: ['excavation', 'utility work', 'entry', 'soil work'],
    standardTags: ['excavation protection', 'competent person', 'protective system'],
    lessonTags: ['cave in', 'soil instability', 'egress failure'],
    summary:
      'Excavation hazards include cave-in exposure, missing protective systems, poor access/egress, spoil pile hazards, water accumulation, and lack of competent person evaluation.',
    rawText:
      'Trenching and excavation hazards are indicated when workers enter or work near excavations where soil collapse, cave-in, water accumulation, falling loads, mobile equipment, underground utilities, or poor access could cause injury. SafeScope should ask depth, soil condition, protective system status, spoil pile location, water condition, access ladder placement, competent person inspection, nearby traffic, and utility controls. Recommended controls include stopping entry until evaluated, using sloping, benching, shoring, or shielding as required, keeping spoil and equipment back, providing safe egress, controlling water, and documenting competent person review and protective system correction.',
  },
];
