import {
  SafeScopeHazardDomainConfidence,
  SafeScopeHazardDomainIntelligenceInput,
  SafeScopeHazardDomainIntelligenceOutput,
  SafeScopeHazardDomainProfile,
} from './hazard-domain-intelligence.types';

function cleanText(value: any): string {
  return String(value || '').trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(cleanText).filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasPhraseOrWord(text: string, term: string): boolean {
  const normalized = term.toLowerCase().trim();
  if (!normalized) return false;

  // Multi-word phrases should match as phrases.
  if (normalized.includes(' ')) {
    return text.includes(normalized);
  }

  // Single-word terms must match as standalone words to avoid guard matching guardrail,
  // hot matching hot work/heat stress incorrectly, etc.
  return new RegExp(`\\b${escapeRegex(normalized)}\\b`, 'i').test(text);
}

function matchedTerms(text: string, terms: string[]): string[] {
  return terms.filter((term) => hasPhraseOrWord(text, term));
}

const DOMAIN_PROFILES: SafeScopeHazardDomainProfile[] = [
  {
    domain: 'Machine Guarding',
    aliases: ['guarding', 'machine guard', 'unguarded equipment'],
    keywords: ['machine', 'guard', 'unguarded', 'conveyor', 'pulley', 'belt', 'nip', 'pinch', 'rotating', 'shaft', 'gear', 'sprocket', 'blade'],
    hazardFamilies: ['physical safety', 'machine safety', 'line of fire'],
    hazardousEnergies: ['mechanical_motion', 'kinetic_energy', 'stored_energy', 'electrical_energy'],
    injuryMechanisms: ['caught_in_or_between', 'crush', 'amputation', 'laceration', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['direct_contact_with_moving_parts'],
    commonFailureModes: ['missing_guard', 'inadequate_guard_coverage', 'bypassed_interlock', 'guard_removed_for_maintenance', 'cleanup_near_motion'],
    additionalHazardsToConsider: ['Lockout / Tagout', 'Electrical', 'Housekeeping', 'Maintenance Access', 'Emergency Stop / Pull Cord'],
    evidenceNeeded: ['Guard condition', 'Moving part exposed', 'Employee access path', 'Equipment operating state', 'Task being performed', 'Energy-control status'],
    mitigationStrategies: ['Fixed guard', 'Interlocked guard', 'Barrier guard', 'Isolation', 'Lockout/tagout', 'Zero-energy verification', 'Emergency stop verification'],
    weakOrInsufficientControls: ['PPE only', 'Warning sign only', 'Verbal warning only', 'Training only without guarding', 'Painted line only'],
    verificationEvidence: ['Before/after photos', 'Guard coverage photo', 'Access path photo', 'Supervisor verification', 'Functional interlock verification', 'Energy isolation evidence'],
    closureRequirements: ['Exposure to moving parts eliminated or controlled', 'Guard installed and verified', 'Energy state documented', 'Responsible person and completion date documented'],
    humanReviewTriggers: ['Body-part access to moving parts', 'Uncertain energy state', 'Guard removed or bypassed', 'High-severity rotating equipment exposure'],
  },
  {
    domain: 'Lockout / Tagout',
    aliases: ['LOTO', 'hazardous energy control', 'energy isolation'],
    keywords: ['lockout', 'tagout', 'loto', 'energized', 'de-energized', 'isolation', 'stored energy', 'try test', 'zero energy', 'maintenance', 'service', 'repair', 'cleanup'],
    hazardFamilies: ['hazardous energy', 'maintenance safety', 'line of fire'],
    hazardousEnergies: ['stored_energy', 'electrical_energy', 'mechanical_motion', 'pressure', 'gravity', 'thermal_energy', 'chemical_energy'],
    injuryMechanisms: ['caught_in_or_between', 'crush', 'electrocution_or_shock', 'chemical_burn', 'struck_by', 'amputation'],
    healthMechanisms: [],
    exposureRoutes: ['release_of_uncontrolled_energy'],
    commonFailureModes: ['incomplete_isolation', 'no_try_test', 'missing_lock_or_tag', 'stored_energy_not_relieved', 'wrong_energy_source_identified', 'group_lockout_gap'],
    additionalHazardsToConsider: ['Machine Guarding', 'Electrical', 'Pressure Systems', 'Confined Space', 'Material Handling'],
    evidenceNeeded: ['Task type', 'Energy source list', 'Isolation points', 'Locks/tags applied', 'Stored energy relieved', 'Try/test verification', 'Affected employees'],
    mitigationStrategies: ['Full de-energization', 'Isolation', 'Blocking', 'Bleeding', 'Lockout/tagout', 'Try/test verification', 'Group lockout procedure'],
    weakOrInsufficientControls: ['Switch off only', 'Verbal instruction only', 'Tag without lock where lock is feasible', 'Assumed zero energy', 'No try/test'],
    verificationEvidence: ['Lock/tag photos', 'Isolation point documentation', 'Try/test record', 'Authorized employee verification', 'Stored-energy release documentation'],
    closureRequirements: ['All energy sources identified and controlled', 'Zero-energy state verified', 'Affected employees protected', 'Release from lockout documented'],
    humanReviewTriggers: ['Maintenance near hazardous energy', 'Stored pressure/gravity load', 'Group lockout', 'Unclear equipment state', 'Unexpected startup potential'],
  },
  {
    domain: 'Electrical',
    aliases: ['electrical safety', 'energized electrical work'],
    keywords: ['electrical', 'energized', 'panel', 'breaker', 'conductor', 'voltage', 'arc flash', 'arc', 'shock', 'cord', 'grounding', 'disconnect'],
    hazardFamilies: ['electrical safety', 'fire', 'line of fire'],
    hazardousEnergies: ['electrical_energy', 'thermal_energy'],
    injuryMechanisms: ['electrocution_or_shock', 'arc_flash_or_burn', 'fire_or_explosion', 'secondary_fall'],
    healthMechanisms: [],
    exposureRoutes: ['electrical_contact', 'arc_flash_exposure'],
    commonFailureModes: ['exposed_conductor', 'missing_cover', 'damaged_cord', 'improper_grounding', 'unqualified_access', 'poor_labeling', 'no_disconnect_identified'],
    additionalHazardsToConsider: ['Lockout / Tagout', 'Fire / Hot Work', 'PPE', 'Fall Protection'],
    evidenceNeeded: ['Energized/de-energized state', 'Voltage if known', 'Panel/cover condition', 'Access restrictions', 'Qualified person involvement', 'Labels and disconnects'],
    mitigationStrategies: ['De-energize', 'Cover exposed parts', 'Restrict access', 'Qualified-person review', 'Arc-rated PPE where applicable', 'Verify disconnects and labels'],
    weakOrInsufficientControls: ['Tape only', 'Warning sign only', 'Unqualified troubleshooting', 'Assumed de-energized', 'PPE without hazard control'],
    verificationEvidence: ['Panel photo', 'Cover/label photo', 'Qualified review note', 'Test-before-touch record', 'Corrected cord/equipment photo'],
    closureRequirements: ['Electrical exposure eliminated or guarded', 'Qualified review completed', 'Energized work justified and controlled if applicable'],
    humanReviewTriggers: ['Energized exposure', 'Exposed conductor', 'Arc flash potential', 'Unknown voltage', 'Unqualified access'],
  },
  {
    domain: 'Fall Protection',
    aliases: ['falls', 'working at heights'],
    keywords: ['fall', 'edge', 'roof', 'height', 'elevated', 'opening', 'hole', 'guardrail', 'tie off', 'harness', 'lanyard', 'anchor'],
    hazardFamilies: ['falls', 'gravity', 'walking-working surfaces'],
    hazardousEnergies: ['gravity', 'kinetic_energy'],
    injuryMechanisms: ['fall_to_lower_level', 'fall_same_level', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['fall_path'],
    commonFailureModes: ['unprotected_edge', 'missing_guardrail', 'uncovered_hole', 'improper_anchor', 'no_rescue_plan', 'poor_access'],
    additionalHazardsToConsider: ['Ladders and Scaffolds', 'Housekeeping and Walking Surfaces', 'Material Handling', 'Emergency Rescue'],
    evidenceNeeded: ['Work height', 'Edge/opening condition', 'Fall protection used', 'Anchor point', 'Access route', 'Rescue considerations'],
    mitigationStrategies: ['Eliminate elevated work', 'Guardrails', 'Covers', 'Travel restraint', 'Fall arrest', 'Scaffold/platform', 'Rescue plan'],
    weakOrInsufficientControls: ['Warning line only where inadequate', 'Harness not tied off', 'Unrated anchor', 'Training only', 'PPE without rescue plan'],
    verificationEvidence: ['Edge/opening photos', 'Guardrail/cover photos', 'Anchor documentation', 'Tie-off photo', 'Rescue plan confirmation'],
    closureRequirements: ['Fall exposure eliminated or controlled', 'System verified suitable', 'Rescue planning addressed'],
    humanReviewTriggers: ['Unprotected edge', 'Fall arrest reliance', 'Unknown height', 'Improvised anchor', 'Open hole'],
  },
  {
    domain: 'Confined Space',
    aliases: ['permit space', 'confined spaces'],
    keywords: ['confined', 'permit space', 'entrant', 'attendant', 'rescue', 'oxygen', 'atmosphere', 'engulfment', 'tank', 'vessel', 'silo'],
    hazardFamilies: ['confined space', 'atmospheric hazard', 'rescue'],
    hazardousEnergies: ['atmospheric_hazard', 'chemical_energy', 'mechanical_motion', 'engulfment_material'],
    injuryMechanisms: ['asphyxiation', 'inhalation_exposure', 'engulfment', 'caught_in_or_between'],
    healthMechanisms: ['toxic_exposure', 'oxygen_deficiency', 'oxygen_enrichment'],
    exposureRoutes: ['inhalation', 'engulfment', 'entrapment'],
    commonFailureModes: ['no_permit', 'no_atmospheric_test', 'no_attendant', 'no_rescue_plan', 'poor_isolation', 'poor_ventilation'],
    additionalHazardsToConsider: ['Lockout / Tagout', 'Hazard Communication', 'Hot Work', 'Respiratory Protection', 'Emergency Rescue'],
    evidenceNeeded: ['Space classification', 'Atmospheric readings', 'Calibration status', 'Isolation points', 'Ventilation', 'Attendant', 'Permit', 'Rescue method'],
    mitigationStrategies: ['Eliminate entry', 'Permit system', 'Atmospheric testing', 'Ventilation', 'Isolation', 'Attendant', 'Retrieval/rescue plan'],
    weakOrInsufficientControls: ['Smell test', 'No calibrated meter', 'Buddy system only', 'Entry without rescue plan', 'Ventilation assumed effective'],
    verificationEvidence: ['Permit', 'Atmospheric readings', 'Meter calibration record', 'Ventilation setup photo', 'Rescue plan confirmation'],
    closureRequirements: ['Space hazards evaluated', 'Permit controls implemented where required', 'Atmosphere verified', 'Rescue plan available'],
    humanReviewTriggers: ['Entry planned or occurring', 'Unknown atmosphere', 'Engulfment potential', 'Rescue uncertainty', 'Hot work in space'],
  },
  {
    domain: 'Trenching & Shoring',
    aliases: ['excavation', 'trenching'],
    keywords: ['trench', 'excavation', 'cave-in', 'shoring', 'shield', 'benching', 'sloping', 'spoil pile', 'competent person'],
    hazardFamilies: ['excavation', 'ground failure', 'gravity'],
    hazardousEnergies: ['gravity', 'stored_energy', 'kinetic_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['crush', 'asphyxiation', 'engulfment', 'struck_by'],
    healthMechanisms: ['oxygen_deficiency', 'toxic_atmosphere'],
    exposureRoutes: ['cave_in_path', 'engulfment', 'atmospheric_exposure'],
    commonFailureModes: ['no_protective_system', 'spoil_too_close', 'water_accumulation', 'no_access_egress', 'no_competent_person_inspection'],
    additionalHazardsToConsider: ['Mobile Equipment / Traffic', 'Confined Space', 'Utilities', 'Fall Protection'],
    evidenceNeeded: ['Depth', 'Soil condition', 'Protective system', 'Access/egress', 'Spoil pile location', 'Water', 'Competent person inspection'],
    mitigationStrategies: ['Sloping', 'Benching', 'Shoring', 'Shielding', 'Spoil setback', 'Safe access/egress', 'Competent person inspection'],
    weakOrInsufficientControls: ['Visual check only', 'No protective system', 'Ladder absent', 'Spoil at edge', 'Assumed stable soil'],
    verificationEvidence: ['Trench photos', 'Protective system photos', 'Access/egress photo', 'Inspection record', 'Spoil setback photo'],
    closureRequirements: ['Protective system verified', 'Access/egress provided', 'Competent person review documented'],
    humanReviewTriggers: ['Employee in trench', 'No protective system', 'Water present', 'Nearby equipment vibration', 'Unknown depth/soil'],
  },
  {
    domain: 'Mobile Equipment / Traffic',
    aliases: ['traffic control', 'pedestrian mobile equipment'],
    keywords: ['mobile equipment', 'truck', 'haul', 'loader', 'forklift', 'traffic', 'pedestrian', 'blind spot', 'backup', 'berm', 'roadway'],
    hazardFamilies: ['struck-by', 'powered mobile equipment', 'traffic management'],
    hazardousEnergies: ['kinetic_energy', 'mechanical_motion', 'gravity'],
    injuryMechanisms: ['struck_by', 'caught_in_or_between', 'crush', 'rollover'],
    healthMechanisms: [],
    exposureRoutes: ['vehicle_pedestrian_interaction', 'collision_path'],
    commonFailureModes: ['no_separation', 'poor_visibility', 'poor_communication', 'inadequate_berm', 'poor_road_condition', 'uncontrolled_backing'],
    additionalHazardsToConsider: ['Powered Haulage', 'Ground Control', 'Housekeeping', 'Visibility / Lighting', 'Material Handling'],
    evidenceNeeded: ['Traffic pattern', 'Pedestrian interaction', 'Visibility', 'Spotter/use of signals', 'Road condition', 'Berms', 'Speed control'],
    mitigationStrategies: ['Segregated routes', 'Berms', 'Traffic management plan', 'Spotters', 'Cameras/alarms', 'Speed control', 'Lighting'],
    weakOrInsufficientControls: ['Be careful instruction', 'High-vis only', 'Uncontrolled mixed traffic', 'Spotter without defined communication'],
    verificationEvidence: ['Traffic route photos', 'Berm photos', 'Signage/lighting photos', 'Traffic plan', 'Spotter communication method'],
    closureRequirements: ['Traffic exposure controlled', 'Pedestrian/equipment separation verified', 'Road/berm conditions corrected'],
    humanReviewTriggers: ['Pedestrian near equipment', 'Backing exposure', 'Berm deficiency', 'Blind spot', 'High traffic density'],
  },
  {
    domain: 'Powered Haulage',
    aliases: ['haul trucks', 'mine haulage'],
    keywords: ['powered haulage', 'haul truck', 'dump truck', 'crusher feed', 'stockpile', 'berm', 'highwall road', 'mine road'],
    hazardFamilies: ['mining', 'powered haulage', 'struck-by'],
    hazardousEnergies: ['kinetic_energy', 'mechanical_motion', 'gravity'],
    injuryMechanisms: ['struck_by', 'crush', 'rollover', 'caught_in_or_between'],
    healthMechanisms: [],
    exposureRoutes: ['haulage_collision_path'],
    commonFailureModes: ['berm_failure', 'poor_dump_point_control', 'limited_visibility', 'road_grade_issue', 'truck_pedestrian_interaction'],
    additionalHazardsToConsider: ['Mobile Equipment / Traffic', 'Ground Control', 'Highwall', 'Material Handling'],
    evidenceNeeded: ['Dump point', 'Berm height/condition', 'Traffic controls', 'Visibility', 'Road grade/surface', 'Pedestrian access'],
    mitigationStrategies: ['Adequate berms', 'Traffic separation', 'Dump point control', 'Spotter procedures', 'Road maintenance', 'Lighting/visibility aids'],
    weakOrInsufficientControls: ['Operator caution only', 'High-vis only', 'Unmarked travelways', 'Berm not verified'],
    verificationEvidence: ['Berm photos', 'Roadway photos', 'Traffic control plan', 'Dump point photo', 'Supervisor verification'],
    closureRequirements: ['Berms/travelways verified', 'Traffic controls implemented', 'Exposure zones controlled'],
    humanReviewTriggers: ['Dump point deficiency', 'Pedestrian exposure', 'Rollover potential', 'Berm uncertainty'],
  },
  {
    domain: 'Hazard Communication',
    aliases: ['hazcom', 'chemical labeling', 'SDS'],
    keywords: ['hazcom', 'chemical', 'solvent', 'container', 'label', 'sds', 'gHS', 'unlabeled', 'spill', 'flammable', 'corrosive'],
    hazardFamilies: ['chemical safety', 'health exposure', 'fire'],
    hazardousEnergies: ['chemical_energy', 'thermal_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['chemical_burn', 'inhalation_exposure', 'skin_absorption', 'fire_or_explosion'],
    healthMechanisms: ['acute_toxicity', 'chronic_toxicity', 'sensitization', 'corrosive_injury'],
    exposureRoutes: ['inhalation', 'skin_contact', 'eye_contact', 'ingestion'],
    commonFailureModes: ['unlabeled_container', 'missing_sds', 'unknown_chemical_identity', 'poor_storage', 'incompatible_storage', 'spill_not_controlled'],
    additionalHazardsToConsider: ['PPE', 'Fire / Hot Work', 'Respiratory Protection', 'Ventilation', 'Emergency Response'],
    evidenceNeeded: ['Chemical identity', 'Label condition', 'SDS availability', 'Container condition', 'Storage compatibility', 'Exposure route', 'PPE/ventilation'],
    mitigationStrategies: ['Label container', 'Provide SDS', 'Substitute safer chemical', 'Ventilation', 'Secondary containment', 'Compatible storage', 'Spill response'],
    weakOrInsufficientControls: ['Unknown chemical left in use', 'PPE without SDS', 'Handwritten vague label', 'Training only without identification'],
    verificationEvidence: ['Label photo', 'SDS record', 'Storage photo', 'Corrected container photo', 'Spill cleanup documentation'],
    closureRequirements: ['Chemical identified', 'Label/SDS corrected', 'Exposure and storage controls verified'],
    humanReviewTriggers: ['Unknown chemical', 'Potential acute toxicity', 'Flammable/corrosive material', 'Spill/release', 'Employee symptoms'],
  },
  {
    domain: 'Respirable Dust / Silica',
    aliases: ['silica', 'respirable crystalline silica', 'dust exposure'],
    keywords: ['silica', 'respirable dust', 'dust', 'cutting', 'grinding', 'drilling', 'sawing', 'sand', 'quartz', 'crystalline silica'],
    hazardFamilies: ['industrial hygiene', 'respiratory health', 'chronic disease'],
    hazardousEnergies: ['atmospheric_hazard'],
    injuryMechanisms: ['inhalation_exposure'],
    healthMechanisms: ['silica_or_dust_disease', 'silicosis', 'lung_cancer_risk', 'copd_risk'],
    exposureRoutes: ['inhalation'],
    commonFailureModes: ['dry_cutting', 'no_wet_method', 'no_local_exhaust', 'poor_housekeeping', 'no_sampling', 'incorrect_respirator'],
    additionalHazardsToConsider: ['Respiratory Protection', 'Housekeeping', 'PPE', 'Ventilation', 'Exposure Monitoring'],
    evidenceNeeded: ['Material/task', 'Dust generation', 'Duration/frequency', 'Controls used', 'Sampling data', 'Respirator use', 'Housekeeping method'],
    mitigationStrategies: ['Wet methods', 'Local exhaust', 'Enclosure', 'Substitution', 'HEPA vacuum', 'Restricted access', 'Respiratory protection when required'],
    weakOrInsufficientControls: ['Dry sweeping', 'Dust mask only', 'No exposure assessment', 'Respirator without fit test', 'Water available but unused'],
    verificationEvidence: ['Control method photos', 'Sampling records', 'Respirator fit test', 'HEPA housekeeping evidence', 'Task documentation'],
    closureRequirements: ['Dust source controlled', 'Exposure assessment completed where needed', 'Respiratory controls verified', 'Housekeeping method appropriate'],
    humanReviewTriggers: ['Visible dust cloud', 'No sampling basis', 'Respirator reliance', 'Dry cutting/grinding', 'Chronic health exposure'],
  },
  {
    domain: 'Noise',
    aliases: ['occupational noise', 'hearing conservation'],
    keywords: ['noise', 'decibel', 'dba', 'dosimetry', 'hearing', 'audiogram', 'sound level', 'hearing protection'],
    hazardFamilies: ['industrial hygiene', 'physical agent', 'hearing conservation'],
    hazardousEnergies: ['noise_vibration'],
    injuryMechanisms: ['noise_induced_hearing_loss'],
    healthMechanisms: ['hearing_loss', 'tinnitus'],
    exposureRoutes: ['noise_dose'],
    commonFailureModes: ['no_noise_survey', 'no_dosimetry', 'inadequate_hearing_protection', 'no_audiometric_program', 'poor_fit'],
    additionalHazardsToConsider: ['PPE', 'Engineering Controls', 'Maintenance', 'Training'],
    evidenceNeeded: ['dBA level', 'Duration', 'Task/equipment source', 'Dosimetry or survey data', 'Hearing protection used', 'Audiometric program status'],
    mitigationStrategies: ['Engineering noise control', 'Isolation', 'Maintenance', 'Administrative rotation', 'Hearing protection', 'Hearing conservation program'],
    weakOrInsufficientControls: ['Earplugs without exposure data', 'Training only', 'Assumed protection', 'No fit/selection basis'],
    verificationEvidence: ['Noise survey', 'Dosimetry record', 'Hearing protection selection', 'Audiometric program record', 'Control installation evidence'],
    closureRequirements: ['Noise exposure characterized', 'Controls implemented', 'Hearing protection/program needs addressed'],
    humanReviewTriggers: ['Unknown dBA/dose', 'High-noise equipment', 'Employee symptoms', 'No monitoring data'],
  },
  {
    domain: 'Heat Stress',
    aliases: ['heat illness', 'thermal stress'],
    keywords: ['heat', 'hot', 'heat stress', 'heat illness', 'wbgt', 'hydration', 'acclimatization', 'shade'],
    hazardFamilies: ['occupational health', 'environmental stress'],
    hazardousEnergies: ['thermal_energy', 'environmental_stress'],
    injuryMechanisms: ['heat_illness'],
    healthMechanisms: ['heat_exhaustion', 'heat_stroke', 'dehydration'],
    exposureRoutes: ['thermal_stress'],
    commonFailureModes: ['no_acclimatization', 'no_rest_breaks', 'no_water', 'heavy_workload', 'poor_shade', 'no_emergency_response'],
    additionalHazardsToConsider: ['PPE', 'Emergency Response', 'Work Planning', 'Ergonomics'],
    evidenceNeeded: ['Temperature/heat index/WBGT', 'Workload', 'Duration', 'Acclimatization', 'Water/rest/shade', 'Symptoms', 'Emergency plan'],
    mitigationStrategies: ['Hydration', 'Rest breaks', 'Shade/cooling', 'Acclimatization', 'Work-rest schedule', 'Buddy system', 'Emergency response'],
    weakOrInsufficientControls: ['Water only without rest/shade', 'No acclimatization', 'No symptom response plan', 'PPE increases heat load without controls'],
    verificationEvidence: ['Heat index/WBGT record', 'Work-rest plan', 'Water/rest/shade photo', 'Training/emergency plan'],
    closureRequirements: ['Heat exposure assessed', 'Controls implemented', 'Emergency response readiness verified'],
    humanReviewTriggers: ['Symptoms reported', 'High heat index/WBGT', 'New worker', 'Heavy PPE/workload', 'Remote work area'],
  },
  {
    domain: 'Fire / Hot Work',
    aliases: ['hot work', 'fire prevention'],
    keywords: ['hot work', 'welding', 'cutting', 'grinding', 'spark', 'fire', 'flammable', 'combustible', 'torch'],
    hazardFamilies: ['fire', 'explosion', 'thermal energy'],
    hazardousEnergies: ['thermal_energy', 'chemical_energy'],
    injuryMechanisms: ['fire_or_explosion', 'arc_flash_or_burn', 'inhalation_exposure'],
    healthMechanisms: ['smoke_inhalation', 'fume_exposure'],
    exposureRoutes: ['thermal_contact', 'inhalation'],
    commonFailureModes: ['no_hot_work_permit', 'combustibles_nearby', 'no_fire_watch', 'poor_gas_cylinder_control', 'inadequate_ventilation'],
    additionalHazardsToConsider: ['Welding Health Hazard', 'Confined Space', 'Combustible Dust', 'Hazard Communication', 'Emergency Response'],
    evidenceNeeded: ['Hot work task', 'Combustibles nearby', 'Permit/fire watch', 'Ventilation', 'Cylinder control', 'Fire extinguisher availability'],
    mitigationStrategies: ['Eliminate ignition source', 'Hot work permit', 'Remove combustibles', 'Fire watch', 'Ventilation', 'Extinguishers', 'Gas cylinder controls'],
    weakOrInsufficientControls: ['Fire extinguisher only', 'Verbal fire watch', 'No permit in high-risk area', 'No combustible inspection'],
    verificationEvidence: ['Permit', 'Fire watch documentation', 'Combustible clearance photos', 'Extinguisher photo', 'Ventilation photo'],
    closureRequirements: ['Ignition/fire exposure controlled', 'Fire watch/permit completed where needed', 'Combustibles controlled'],
    humanReviewTriggers: ['Hot work near combustibles', 'Confined space hot work', 'Combustible dust area', 'Flammable atmosphere/material'],
  },
  {
    domain: 'Welding Health Hazard',
    aliases: ['welding fumes', 'metal fumes'],
    keywords: ['welding', 'fume', 'manganese', 'hexavalent chromium', 'stainless', 'galvanized', 'cutting torch', 'brazing'],
    hazardFamilies: ['industrial hygiene', 'respiratory health', 'hot work'],
    hazardousEnergies: ['atmospheric_hazard', 'chemical_energy', 'thermal_energy'],
    injuryMechanisms: ['inhalation_exposure', 'fire_or_explosion', 'arc_flash_or_burn'],
    healthMechanisms: ['metal_fume_fever', 'respiratory_irritation', 'chronic_neurological_or_lung_effects'],
    exposureRoutes: ['inhalation', 'eye_contact'],
    commonFailureModes: ['no_local_exhaust', 'poor_ventilation', 'wrong_respirator', 'no_fit_test', 'unknown_base_metal_or_consumable'],
    additionalHazardsToConsider: ['Fire / Hot Work', 'Confined Space', 'Respiratory Protection', 'PPE', 'Hazard Communication'],
    evidenceNeeded: ['Base metal/consumable', 'Coating', 'Ventilation', 'Task duration', 'Respirator use', 'Sampling basis', 'Confined space status'],
    mitigationStrategies: ['Local exhaust', 'General ventilation', 'Substitution', 'Process change', 'Respiratory protection when needed', 'Hot work controls'],
    weakOrInsufficientControls: ['Fan blowing across face only', 'Dust mask only', 'No metal identification', 'No confined-space evaluation'],
    verificationEvidence: ['Ventilation photo', 'SDS/consumable info', 'Respirator fit test', 'Sampling record', 'Hot work permit'],
    closureRequirements: ['Fume exposure controlled', 'Ventilation/PPE verified', 'Material hazards identified'],
    humanReviewTriggers: ['Confined space welding', 'Stainless/galvanized metals', 'Visible fumes', 'No ventilation', 'Respirator reliance'],
  },
  {
    domain: 'Cranes and Hoists',
    aliases: ['rigging', 'lifting operations'],
    keywords: ['crane', 'hoist', 'rigging', 'sling', 'load', 'lift', 'suspended load', 'hook', 'shackle', 'tagline'],
    hazardFamilies: ['material handling', 'gravity', 'struck-by'],
    hazardousEnergies: ['gravity', 'mechanical_motion', 'kinetic_energy'],
    injuryMechanisms: ['struck_by', 'crush', 'caught_in_or_between'],
    healthMechanisms: [],
    exposureRoutes: ['dropped_load_path', 'swing_radius'],
    commonFailureModes: ['under_load_exposure', 'damaged_rigging', 'unknown_load_weight', 'poor_signal_communication', 'no_lift_plan'],
    additionalHazardsToConsider: ['Material Handling', 'Mobile Equipment / Traffic', 'Fall Protection', 'Electrical'],
    evidenceNeeded: ['Load weight', 'Rigging condition', 'Lift plan', 'Signal person', 'Exclusion zone', 'Ground/surface condition'],
    mitigationStrategies: ['Lift plan', 'Inspect rigging', 'Exclusion zone', 'Qualified operator/rigger', 'Taglines', 'Communication protocol'],
    weakOrInsufficientControls: ['Stand clear instruction only', 'No load weight', 'No rigging inspection', 'Improvised rigging'],
    verificationEvidence: ['Rigging inspection', 'Lift plan', 'Exclusion zone photo', 'Load rating documentation', 'Operator/rigger confirmation'],
    closureRequirements: ['Lift hazards controlled', 'Rigging verified', 'Personnel kept out of line of fire'],
    humanReviewTriggers: ['Suspended load over people', 'Critical lift', 'Damaged rigging', 'Unknown load weight'],
  },
  {
    domain: 'Housekeeping and Walking Surfaces',
    aliases: ['walking-working surfaces', 'slips trips falls'],
    keywords: ['housekeeping', 'walking surface', 'spill', 'trip', 'slip', 'clutter', 'aisle', 'floor', 'stairs', 'platform'],
    hazardFamilies: ['slips trips falls', 'walking-working surfaces'],
    hazardousEnergies: ['gravity', 'kinetic_energy'],
    injuryMechanisms: ['fall_same_level', 'fall_to_lower_level', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['walking_path'],
    commonFailureModes: ['spill_not_cleaned', 'blocked_aisle', 'poor_lighting', 'uneven_surface', 'unsecured_material', 'missing_handrail'],
    additionalHazardsToConsider: ['Fall Protection', 'Material Handling', 'Emergency Egress', 'Chemical Spill'],
    evidenceNeeded: ['Surface condition', 'Walking path', 'Lighting', 'Material storage', 'Spill identity', 'Egress impact'],
    mitigationStrategies: ['Clean spill', 'Maintain aisles', 'Repair surface', 'Improve lighting', 'Secure materials', 'Provide handrails/guardrails'],
    weakOrInsufficientControls: ['Cone only without cleanup', 'Verbal warning only', 'Recurring spill not corrected', 'No root source correction'],
    verificationEvidence: ['Before/after photos', 'Surface repair evidence', 'Aisle clearance photo', 'Spill cleanup documentation'],
    closureRequirements: ['Walking path restored', 'Source of slip/trip controlled', 'Egress maintained'],
    humanReviewTriggers: ['Fall to lower level potential', 'Chemical spill', 'Blocked emergency route', 'Recurring condition'],
  },
  {
    domain: 'Pressure Systems',
    aliases: ['hydraulic energy', 'pneumatic energy', 'compressed air'],
    keywords: ['hydraulic', 'pneumatic', 'pressure', 'hose', 'compressed air', 'steam', 'line', 'rupture', 'pin hole', 'injection'],
    hazardFamilies: ['pressure energy', 'stored energy', 'line of fire'],
    hazardousEnergies: ['pressure', 'stored_energy', 'thermal_energy', 'chemical_energy'],
    injuryMechanisms: ['struck_by', 'laceration', 'chemical_burn', 'injection_injury', 'burn'],
    healthMechanisms: ['injection_toxicity', 'thermal_burn'],
    exposureRoutes: ['pressure_release_path', 'skin_injection', 'thermal_contact'],
    commonFailureModes: ['damaged_hose', 'no_pressure_relief', 'line_not_depressurized', 'poor_guarding', 'wrong_fitting'],
    additionalHazardsToConsider: ['Lockout / Tagout', 'Machine Guarding', 'PPE', 'Maintenance Access'],
    evidenceNeeded: ['Pressure source', 'Line/hose condition', 'Depressurization status', 'Stored energy control', 'Fluid/media type', 'Employee line of fire'],
    mitigationStrategies: ['Depressurize', 'Bleed/block', 'Replace damaged hose', 'Guard/route hoses', 'Pressure relief', 'Lockout/tagout'],
    weakOrInsufficientControls: ['PPE only', 'Tape on hose', 'Assumed pressure relieved', 'No bleed verification'],
    verificationEvidence: ['Hose/line photo', 'Pressure relief verification', 'Replacement documentation', 'Isolation/bleed record'],
    closureRequirements: ['Pressure hazard controlled', 'Damaged components corrected', 'Stored energy verified relieved'],
    humanReviewTriggers: ['High pressure', 'Injection injury potential', 'Unknown media', 'Maintenance exposure'],
  },
  {
    domain: 'Ground Control',
    aliases: ['highwall', 'ground failure', 'slope stability'],
    keywords: ['ground control', 'highwall', 'slope', 'bench', 'falling rock', 'ground failure', 'rock fall', 'unstable ground'],
    hazardFamilies: ['mining', 'ground failure', 'struck-by'],
    hazardousEnergies: ['gravity', 'kinetic_energy', 'stored_energy'],
    injuryMechanisms: ['crush', 'struck_by', 'engulfment'],
    healthMechanisms: [],
    exposureRoutes: ['falling_ground_path'],
    commonFailureModes: ['unstable_highwall', 'poor_scaling', 'working_under_highwall', 'no_exclusion_zone', 'water/erosion_undermining'],
    additionalHazardsToConsider: ['Powered Haulage', 'Mobile Equipment / Traffic', 'Fall Protection', 'Emergency Response'],
    evidenceNeeded: ['Ground condition', 'Cracks/sloughing', 'Water/erosion', 'Work location', 'Exclusion zone', 'Inspection record'],
    mitigationStrategies: ['Scale/remove loose material', 'Establish exclusion zone', 'Bench/slope control', 'Barricade', 'Inspect after weather/blasting'],
    weakOrInsufficientControls: ['Visual awareness only', 'No barricade', 'Working below unstable ground', 'No inspection after change'],
    verificationEvidence: ['Highwall/slope photos', 'Barricade photo', 'Inspection record', 'Corrective scaling evidence'],
    closureRequirements: ['Ground hazard evaluated', 'Exclusion/control zone established', 'Competent review documented where needed'],
    humanReviewTriggers: ['Worker below highwall', 'Visible cracks/sloughing', 'Recent weather/blast', 'Unknown stability'],
  },
  {
    domain: 'Combustible Dust',
    aliases: ['dust explosion', 'explosive dust'],
    keywords: ['combustible dust', 'dust explosion', 'grain dust', 'wood dust', 'metal dust', 'dust accumulation', 'deflagration'],
    hazardFamilies: ['fire', 'explosion', 'industrial hygiene'],
    hazardousEnergies: ['chemical_energy', 'thermal_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['fire_or_explosion', 'inhalation_exposure', 'burn'],
    healthMechanisms: ['respiratory_irritation'],
    exposureRoutes: ['dust_cloud_explosion_path', 'inhalation'],
    commonFailureModes: ['dust_accumulation', 'ignition_source', 'poor_housekeeping', 'inadequate_ventilation', 'no_dust_hazard_analysis'],
    additionalHazardsToConsider: ['Fire / Hot Work', 'Housekeeping', 'Electrical', 'Ventilation'],
    evidenceNeeded: ['Dust type', 'Accumulation level', 'Ignition sources', 'Ventilation/collection', 'Housekeeping method', 'Process equipment'],
    mitigationStrategies: ['Dust control', 'Housekeeping with safe methods', 'Ignition control', 'Explosion venting/suppression where applicable', 'Bonding/grounding'],
    weakOrInsufficientControls: ['Dry sweeping/blowing', 'No ignition control', 'No dust characterization', 'Cleaning only without source control'],
    verificationEvidence: ['Dust accumulation photos', 'Housekeeping records', 'Dust collector condition', 'Ignition source controls', 'DHA if applicable'],
    closureRequirements: ['Dust accumulation controlled', 'Ignition sources addressed', 'Housekeeping/source controls verified'],
    humanReviewTriggers: ['Visible combustible dust', 'Hot work nearby', 'Unknown dust explosibility', 'Dust collector/process involvement'],
  },
  {
    domain: 'Ergonomics',
    aliases: ['manual material handling', 'musculoskeletal risk'],
    keywords: ['ergonomic', 'lifting', 'repetitive', 'awkward posture', 'overexertion', 'force', 'manual handling', 'twisting'],
    hazardFamilies: ['ergonomics', 'human factors', 'musculoskeletal'],
    hazardousEnergies: ['biomechanical_load', 'ergonomic_force'],
    injuryMechanisms: ['overexertion', 'sprain_strain', 'cumulative_trauma'],
    healthMechanisms: ['musculoskeletal_disorder'],
    exposureRoutes: ['biomechanical_loading'],
    commonFailureModes: ['excessive_weight', 'awkward_reach', 'repetitive_task', 'poor_work_height', 'no_mechanical_assist'],
    additionalHazardsToConsider: ['Material Handling', 'Housekeeping', 'PPE', 'Work Planning'],
    evidenceNeeded: ['Load weight', 'Frequency', 'Posture/reach', 'Duration', 'Worker symptoms', 'Mechanical aids available'],
    mitigationStrategies: ['Eliminate lift', 'Mechanical assist', 'Team lift', 'Workstation redesign', 'Reduce frequency/force', 'Adjust height/reach'],
    weakOrInsufficientControls: ['Training only', 'Back belt reliance', 'Rotate only without reducing force', 'Team lift without planning'],
    verificationEvidence: ['Task photos/video', 'Load data', 'Mechanical assist photo', 'Workstation change documentation'],
    closureRequirements: ['Force/posture/frequency reduced', 'Mechanical or design control verified', 'Worker exposure reduced'],
    humanReviewTriggers: ['High force lift', 'Repetitive high-risk task', 'Symptoms reported', 'No feasible mechanical aid evaluated'],
  },
  {
    domain: 'Bloodborne Pathogens / Sharps',
    aliases: ['bloodborne pathogens', 'bloodborne', 'sharps exposure', 'needle exposure', 'biohazard'],
    keywords: ['bloodborne', 'blood borne', 'blood', 'bodily fluid', 'bodily fluids', 'opim', 'sharp', 'sharps', 'needle', 'used needle', 'biohazard', 'exposure control plan', 'sharps container', 'needlestick', 'cleanup procedure'],
    hazardFamilies: ['health exposure', 'biological exposure', 'bloodborne pathogens'],
    hazardousEnergies: ['biological_contamination', 'puncture_exposure'],
    injuryMechanisms: ['puncture_wound', 'needlestick', 'contact_exposure'],
    healthMechanisms: ['bloodborne_pathogen_exposure', 'infectious_material_exposure'],
    exposureRoutes: ['percutaneous_puncture', 'skin_contact', 'mucous_membrane_contact', 'cleanup_contact'],
    commonFailureModes: ['uncontrolled_sharp', 'no_sharps_container', 'cleanup_by_untrained_personnel', 'missing_ppe', 'unknown_exposure_control_plan', 'exposure_not_reported'],
    additionalHazardsToConsider: ['PPE', 'Housekeeping', 'Waste Handling', 'Exposure Reporting'],
    evidenceNeeded: ['Needlestick or contact exposure status', 'Whether blood or OPIM is present or suspected', 'Cleanup assignment', 'Trained cleanup personnel', 'PPE used', 'Sharps container availability', 'Area restriction', 'Exposure control plan status', 'Exposure reporting if contact occurred'],
    mitigationStrategies: ['Restrict area', 'Use trained cleanup personnel', 'Use puncture-resistant sharps container', 'Use appropriate PPE', 'Decontaminate affected area', 'Document exposure evaluation if contact occurred', 'Verify disposal'],
    weakOrInsufficientControls: ['Bare-hand cleanup', 'Trash disposal without sharps container', 'Training only without cleanup controls', 'Assumed no exposure without verification', 'PPE without disposal procedure'],
    verificationEvidence: ['Sharps container photo', 'Cleanup record', 'PPE verification', 'Exposure control plan', 'Training record', 'Disposal/decontamination confirmation'],
    closureRequirements: ['Sharp removed and disposed in approved container', 'Area decontaminated where needed', 'Exposure status evaluated', 'Cleanup performed by trained personnel', 'Exposure-control procedure reviewed'],
    humanReviewTriggers: ['Used needle or contaminated sharp', 'Possible needlestick', 'Unknown blood or OPIM status', 'Unclear cleanup assignment', 'Missing sharps container', 'Exposure-control plan not confirmed'],
  },
  {
    domain: 'PPE',
    aliases: ['personal protective equipment'],
    keywords: ['ppe', 'glove', 'respirator', 'hard hat', 'safety glasses', 'face shield', 'hearing protection', 'fall harness'],
    hazardFamilies: ['personal protective equipment', 'last line of defense'],
    hazardousEnergies: ['varies_by_hazard'],
    injuryMechanisms: ['varies_by_hazard'],
    healthMechanisms: ['varies_by_hazard'],
    exposureRoutes: ['varies_by_hazard'],
    commonFailureModes: ['wrong_ppe', 'poor_fit', 'damaged_ppe', 'ppe_used_as_primary_control', 'no_hazard_assessment'],
    additionalHazardsToConsider: ['Hazard Communication', 'Noise', 'Respirable Dust / Silica', 'Welding Health Hazard', 'Fall Protection'],
    evidenceNeeded: ['Hazard requiring PPE', 'PPE type', 'Fit/condition', 'Training', 'Compatibility with task', 'Higher-order controls considered'],
    mitigationStrategies: ['Select correct PPE', 'Fit test where required', 'Inspect/maintain PPE', 'Train users', 'Use PPE after higher-order controls'],
    weakOrInsufficientControls: ['PPE only for high-risk source hazard', 'Wrong rating', 'No fit test', 'Damaged PPE', 'No hazard assessment'],
    verificationEvidence: ['PPE condition photo', 'Fit test record', 'Hazard assessment', 'Training record', 'Selection basis'],
    closureRequirements: ['Correct PPE selected and verified', 'Higher-order controls considered', 'Use/fit/training documented'],
    humanReviewTriggers: ['Respirator reliance', 'Fall arrest PPE', 'Arc-rated PPE', 'Chemical PPE uncertainty', 'PPE used instead of source control'],
  },
];

export class SafeScopeHazardDomainIntelligenceService {
  evaluate(input: SafeScopeHazardDomainIntelligenceInput): SafeScopeHazardDomainIntelligenceOutput {
    const classification = cleanText(input.classification) || 'Unclassified';
    const observationText = cleanText(input.observationText);
    const evidenceText = (input.evidenceTexts || []).map(cleanText).join(' ');
    const standardText = (input.suggestedStandards || [])
      .map((standard: any) => `${standard?.citation || ''} ${standard?.title || ''} ${standard?.summary || ''} ${standard?.rationale || ''}`)
      .join(' ');

    const combined = `${classification} ${observationText} ${evidenceText} ${standardText}`.toLowerCase();

    const scored = DOMAIN_PROFILES.map((profile) => {
      const normalizedClassification = classification.toLowerCase();
      const normalizedDomain = profile.domain.toLowerCase();

      const exactClassificationHit = normalizedClassification === normalizedDomain;
      const aliasClassificationHit = profile.aliases.some((alias) =>
        normalizedClassification === alias.toLowerCase() ||
        normalizedClassification.includes(alias.toLowerCase()),
      );

      const domainClassificationHit =
        normalizedDomain.includes(normalizedClassification) &&
        normalizedClassification.length >= 5;

      const keywordHits = matchedTerms(combined, profile.keywords);
      const aliasHits = matchedTerms(combined, profile.aliases);

      let score = keywordHits.length;
      if (exactClassificationHit) score += 12;
      if (aliasClassificationHit) score += 8;
      if (domainClassificationHit) score += 5;
      if (aliasHits.length) score += aliasHits.length * 2;

      return { profile, score, keywordHits };
    })
      // Keep direct classification matches, or require at least two meaningful hits.
      // This prevents weak accidental matches from broad words.
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score);

    const primary = scored[0]?.profile || this.getFallbackProfile(classification);
    const matchedProfiles = scored.length ? scored.slice(0, 5).map((item) => item.profile) : [primary];

    const relatedDomains = unique([
      ...matchedProfiles.slice(1).map((profile) => profile.domain),
      ...primary.additionalHazardsToConsider,
      ...this.deriveCrossDomainRelationships(combined),
    ]).filter((domain) => domain !== primary.domain);

    const highRisk =
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    const matchedKeywordCount = scored.reduce((sum, item) => sum + item.keywordHits.length, 0);

    const confidence = this.getConfidence({
      matchedDomainCount: scored.length,
      matchedKeywordCount,
      hasObservation: Boolean(observationText),
    });

    const humanReviewTriggers = unique([
      ...matchedProfiles.flatMap((profile) => profile.humanReviewTriggers),
      highRisk ? 'High-risk or high-consequence condition requires qualified review.' : '',
      confidence !== 'high' ? 'Domain confidence is not high enough for unattended finalization.' : '',
      input.evidenceSufficiency?.sufficientForClosure === false ? 'Evidence sufficiency layer indicates closure is not yet supported.' : '',
      input.controlEffectiveness?.rating && input.controlEffectiveness.rating !== 'effective'
        ? 'Control effectiveness layer indicates controls may not fully interrupt the hazard pathway.'
        : '',
    ]);

    return {
      engine: 'safescope_hazard_domain_intelligence',
      mode: 'deterministic_offline',
      classification,
      primaryDomain: primary.domain,
      relatedDomains,
      hazardFamilies: unique(matchedProfiles.flatMap((profile) => profile.hazardFamilies)),
      hazardousEnergies: unique(matchedProfiles.flatMap((profile) => profile.hazardousEnergies)),
      injuryMechanisms: unique(matchedProfiles.flatMap((profile) => profile.injuryMechanisms)),
      healthMechanisms: unique(matchedProfiles.flatMap((profile) => profile.healthMechanisms)),
      exposureRoutes: unique(matchedProfiles.flatMap((profile) => profile.exposureRoutes)),
      commonFailureModes: unique(matchedProfiles.flatMap((profile) => profile.commonFailureModes)),
      additionalHazardsToConsider: relatedDomains,
      evidenceNeeded: unique(matchedProfiles.flatMap((profile) => profile.evidenceNeeded)),
      mitigationStrategies: unique(matchedProfiles.flatMap((profile) => profile.mitigationStrategies)),
      weakOrInsufficientControls: unique(matchedProfiles.flatMap((profile) => profile.weakOrInsufficientControls)),
      verificationEvidence: unique(matchedProfiles.flatMap((profile) => profile.verificationEvidence)),
      closureRequirements: unique(matchedProfiles.flatMap((profile) => profile.closureRequirements)),
      humanReviewTriggers,
      confidence,
      matchedDomainCount: scored.length,
      matchedKeywordCount,
      requiresQualifiedReview: Boolean(highRisk) || confidence !== 'high' || humanReviewTriggers.length > 0,
      canInventStandards: false,
      canOverrideRegulations: false,
      canFinalizeWithoutHumanReview: false,
      sourceBoundary:
        'SafeScope hazard domain intelligence provides deterministic safety-and-health domain understanding, related hazard awareness, evidence needs, mitigation patterns, and closure requirements. It cannot invent standards, override OSHA/MSHA requirements, or finalize compliance decisions without qualified human review.',
    };
  }

  private deriveCrossDomainRelationships(combined: string): string[] {
    const related: string[] = [];

    if (includesAny(combined, ['maintenance', 'service', 'repair', 'cleanup', 'adjustment'])) {
      related.push('Lockout / Tagout', 'Maintenance Access');
    }

    if (includesAny(combined, ['confined', 'tank', 'vessel', 'silo'])) {
      related.push('Confined Space', 'Respiratory Protection', 'Emergency Rescue');
    }

    if (includesAny(combined, ['welding', 'cutting', 'grinding', 'hot work'])) {
      related.push('Fire / Hot Work', 'Welding Health Hazard', 'PPE');
    }

    if (includesAny(combined, ['dust', 'silica', 'fume', 'vapor', 'gas', 'chemical', 'solvent'])) {
      related.push('Hazard Communication', 'PPE', 'Ventilation', 'Exposure Monitoring');
    }

    if (includesAny(combined, ['truck', 'loader', 'forklift', 'mobile equipment', 'haul'])) {
      related.push('Mobile Equipment / Traffic', 'Powered Haulage', 'Pedestrian Exposure');
    }

    if (includesAny(combined, ['fall', 'edge', 'ladder', 'scaffold', 'opening', 'hole'])) {
      related.push('Fall Protection', 'Housekeeping and Walking Surfaces');
    }

    return related;
  }

  private getConfidence(input: {
    matchedDomainCount: number;
    matchedKeywordCount: number;
    hasObservation: boolean;
  }): SafeScopeHazardDomainConfidence {
    if (!input.hasObservation || input.matchedDomainCount === 0 || input.matchedKeywordCount === 0) return 'low';
    if (input.matchedKeywordCount >= 4 || input.matchedDomainCount >= 2) return 'high';
    return 'medium';
  }

  private getFallbackProfile(classification: string): SafeScopeHazardDomainProfile {
    return {
      domain: cleanText(classification) || 'Unclassified',
      aliases: [],
      keywords: [],
      hazardFamilies: ['unclassified safety or health concern'],
      hazardousEnergies: ['unknown'],
      injuryMechanisms: ['unknown'],
      healthMechanisms: [],
      exposureRoutes: ['unknown'],
      commonFailureModes: ['insufficient_information'],
      additionalHazardsToConsider: ['Qualified Human Review'],
      evidenceNeeded: ['Detailed observation', 'Employee exposure', 'Task being performed', 'Hazard source', 'Existing controls', 'Photos or measurements'],
      mitigationStrategies: ['Control the hazard source after qualified review', 'Capture sufficient evidence before closure'],
      weakOrInsufficientControls: ['Unverified corrective action', 'Assumptions without evidence', 'PPE-only control without source evaluation'],
      verificationEvidence: ['Photos', 'Measurements', 'Supervisor verification', 'Corrective-action closure evidence'],
      closureRequirements: ['Hazard domain clarified', 'Controls verified', 'Qualified review completed'],
      humanReviewTriggers: ['Unclassified or low-context safety concern requires qualified review'],
    };
  }
}
