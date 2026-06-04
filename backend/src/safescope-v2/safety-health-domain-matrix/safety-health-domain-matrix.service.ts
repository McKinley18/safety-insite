import {
  SafeScopeDomainMatrixDomain,
  SafeScopeSafetyHealthDomainMatrixInput,
  SafeScopeSafetyHealthDomainMatrixOutput,
  SafeScopeDomainMatrixConfidence,
} from './safety-health-domain-matrix.types';

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

const DOMAIN_MATRIX: SafeScopeDomainMatrixDomain[] = [
  {
    domain: 'Machine Guarding',
    aliases: ['machine', 'guard', 'conveyor', 'belt', 'pulley', 'nip point', 'pinch point', 'rotating', 'auger', 'crusher', 'sprocket', 'chain drive'],
    hazardFamilies: ['physical safety', 'machine safety', 'line of fire'],
    hazardousEnergies: ['mechanical_motion', 'kinetic_energy', 'stored_energy', 'electrical_energy'],
    injuryMechanisms: ['caught_in_or_between', 'crush', 'amputation', 'laceration', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['direct_contact_with_moving_parts'],
    commonFailureModes: ['missing_guard', 'inadequate_guard_coverage', 'bypassed_interlock', 'guard_removed_for_maintenance', 'cleanup_near_motion'],
    relatedDomains: ['Lockout / Tagout', 'Electrical', 'Housekeeping', 'Maintenance Access', 'Emergency Stop / Pull Cord'],
    evidenceRequired: ['guard condition', 'moving part exposed', 'employee access path', 'equipment operating state', 'task being performed', 'energy-control status'],
    strongControls: ['fixed guarding', 'interlocked guarding', 'barrier guarding', 'isolation', 'lockout/tagout', 'zero-energy verification'],
    weakControls: ['PPE only', 'warning sign only', 'verbal warning only', 'training only without guarding', 'painted line only'],
    mitigationStrategies: ['install fixed guard', 'verify no body-part access', 'interlock access panels', 'isolate hazardous motion', 'lock/tag before servicing', 'verify emergency stop or pull cord where applicable'],
    verificationRequirements: ['before/after photos', 'guard coverage photo', 'access path photo', 'supervisor verification', 'functional interlock verification', 'energy isolation evidence'],
    closureRequirements: ['exposure to moving parts eliminated or controlled', 'guard installed and verified', 'energy state documented', 'responsible person and completion date documented'],
    humanReviewTriggers: ['body-part access to moving parts', 'uncertain energy state', 'guard removed or bypassed', 'high-severity rotating equipment exposure'],
    regulatoryCautionNotes: ['Do not cite machine-guarding compliance without verifying employee exposure, guard adequacy, and applicable jurisdiction.'],
  },
  {
    domain: 'Lockout / Tagout',
    aliases: ['lockout', 'tagout', 'loto', 'zero energy', 'de-energized', 'stored energy', 'isolation', 'maintenance', 'service', 'repair', 'try test'],
    hazardFamilies: ['hazardous energy control', 'maintenance safety', 'stored energy'],
    hazardousEnergies: ['electrical_energy', 'mechanical_motion', 'stored_energy', 'pressure', 'gravity', 'thermal_energy', 'chemical_energy'],
    injuryMechanisms: ['caught_in_or_between', 'crush', 'amputation', 'electrocution_or_shock', 'burn', 'chemical_burn', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['unexpected_startup', 'stored_energy_release'],
    commonFailureModes: ['incomplete_isolation', 'no_try_test', 'missing_lock_or_tag', 'stored_energy_not_relieved', 'wrong_energy_source_identified', 'group_lockout_gap'],
    relatedDomains: ['Machine Guarding', 'Electrical', 'Pressure Systems', 'Confined Space', 'Maintenance Access'],
    evidenceRequired: ['equipment state', 'energy source list', 'isolation points', 'locks/tags applied', 'stored energy relieved', 'try/test verification', 'affected employee notification'],
    strongControls: ['full de-energization', 'lockout/tagout', 'blocking', 'bleeding', 'try/test verification', 'group lockout control'],
    weakControls: ['tag only where lock is feasible', 'verbal instruction only', 'shutoff switch without lock', 'assumption of zero energy'],
    mitigationStrategies: ['identify all energy sources', 'isolate each source', 'apply locks/tags', 'relieve stored energy', 'verify zero energy', 'document release from lockout'],
    verificationRequirements: ['lock/tag photos', 'isolation checklist', 'try/test record', 'supervisor verification', 'affected employee communication record'],
    closureRequirements: ['all hazardous energy controlled', 'zero energy verified', 'work scope documented', 'release process documented'],
    humanReviewTriggers: ['high energy equipment', 'multiple energy sources', 'contractor or group lockout', 'uncertain isolation boundary'],
    regulatoryCautionNotes: ['SafeScope must distinguish maintenance/service exposure from normal operation and cannot assume LOTO adequacy without verification.'],
  },
  {
    domain: 'Electrical',
    aliases: ['electrical', 'energized', 'panel', 'breaker', 'conductor', 'arc flash', 'shock', 'cord', 'grounding', 'disconnect', 'voltage'],
    hazardFamilies: ['electrical safety', 'energy control', 'fire'],
    hazardousEnergies: ['electrical_energy', 'thermal_energy'],
    injuryMechanisms: ['electrocution_or_shock', 'arc_flash_or_burn', 'fire_or_explosion', 'secondary_fall'],
    healthMechanisms: [],
    exposureRoutes: ['direct_contact', 'arc_flash', 'thermal_burn', 'secondary_fall_from_startle'],
    commonFailureModes: ['exposed_conductor', 'missing_cover', 'damaged_cord', 'improper_grounding', 'unqualified_access', 'wet_location_use', 'overloaded_circuit'],
    relatedDomains: ['Lockout / Tagout', 'Fire / Hot Work', 'PPE', 'Maintenance Access'],
    evidenceRequired: ['energized/de-energized state', 'voltage if known', 'cover/enclosure condition', 'labeling', 'access restriction', 'qualified person involvement', 'PPE if energized work is justified'],
    strongControls: ['de-energization', 'verified absence of voltage', 'enclosure restoration', 'qualified-person control', 'GFCI where required', 'proper grounding'],
    weakControls: ['warning sign only', 'tape over damaged cord', 'unverified shutoff', 'unqualified troubleshooting'],
    mitigationStrategies: ['de-energize when feasible', 'restore covers', 'repair damaged wiring', 'restrict access', 'verify grounding/GFCI', 'use qualified electrical review'],
    verificationRequirements: ['panel/cover photos', 'de-energization verification', 'repair documentation', 'qualified person signoff'],
    closureRequirements: ['electrical exposure eliminated or controlled', 'enclosure integrity restored', 'qualified review documented when required'],
    humanReviewTriggers: ['energized work', 'exposed conductor', 'arc flash potential', 'unknown voltage', 'unqualified employee exposure'],
    regulatoryCautionNotes: ['Electrical findings often require qualified-person review before final applicability or closure.'],
  },
  {
    domain: 'Fall Protection',
    aliases: ['fall', 'edge', 'roof', 'platform', 'opening', 'hole', 'guardrail', 'harness', 'anchor', 'elevated', 'scaffold', 'ladder'],
    hazardFamilies: ['falls', 'gravity', 'walking-working surfaces'],
    hazardousEnergies: ['gravity', 'kinetic_energy'],
    injuryMechanisms: ['fall_to_lower_level', 'fall_same_level', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['fall_to_lower_level', 'fall_same_level', 'falling_object'],
    commonFailureModes: ['unprotected_edge', 'missing_guardrail', 'improper_anchor', 'uncovered_hole', 'poor_access', 'incomplete_scaffold', 'ladder_not_secured'],
    relatedDomains: ['Ladders and Scaffolds', 'Housekeeping and Walking Surfaces', 'Material Handling', 'Emergency Rescue'],
    evidenceRequired: ['work height', 'edge/opening condition', 'walking surface condition', 'guardrail or cover status', 'tie-off method', 'anchor point', 'rescue plan'],
    strongControls: ['guardrails', 'covers', 'travel restraint', 'work platforms', 'scaffold compliance', 'fall arrest with verified anchor', 'rescue planning'],
    weakControls: ['be careful instruction', 'harness without anchor verification', 'warning line alone where inadequate', 'PPE without rescue plan'],
    mitigationStrategies: ['install guardrails/covers', 'use proper platform/scaffold', 'verify anchor and tie-off', 'secure ladders', 'remove slip/trip hazards', 'plan rescue'],
    verificationRequirements: ['height measurement/photo', 'guardrail/cover photo', 'anchor verification', 'scaffold/ladder inspection', 'rescue method documented'],
    closureRequirements: ['fall exposure eliminated or protected', 'access method verified', 'fall system inspected', 'rescue considerations addressed'],
    humanReviewTriggers: ['unprotected fall exposure', 'uncertain height', 'fall arrest reliance', 'scaffold or ladder structural concerns'],
    regulatoryCautionNotes: ['Fall protection applicability depends on jurisdiction, height, work type, surface, and protection method.'],
  },
  {
    domain: 'Confined Space',
    aliases: ['confined', 'permit space', 'entry', 'entrant', 'attendant', 'atmosphere', 'oxygen', 'engulfment', 'rescue', 'tank', 'bin', 'silo'],
    hazardFamilies: ['confined space', 'atmospheric hazard', 'rescue', 'engulfment'],
    hazardousEnergies: ['atmospheric_hazard', 'chemical_energy', 'mechanical_motion', 'engulfment_material'],
    injuryMechanisms: ['asphyxiation', 'inhalation_exposure', 'engulfment', 'caught_in_or_between'],
    healthMechanisms: ['acute poisoning', 'oxygen deficiency', 'toxic exposure'],
    exposureRoutes: ['inhalation', 'engulfment', 'entrapment', 'mechanical_contact'],
    commonFailureModes: ['no_space_classification', 'no_atmospheric_test', 'poor_ventilation', 'uncontrolled_energy', 'no_attendant', 'inadequate_rescue_plan'],
    relatedDomains: ['Lockout / Tagout', 'Hazard Communication', 'Respiratory Protection', 'Emergency Rescue', 'Fire / Hot Work'],
    evidenceRequired: ['space classification', 'entry purpose', 'atmospheric readings', 'calibration/bump test', 'ventilation', 'isolation points', 'attendant', 'permit', 'rescue method'],
    strongControls: ['non-entry method', 'permit system', 'continuous monitoring', 'ventilation', 'isolation', 'attendant', 'retrieval/rescue plan'],
    weakControls: ['sniff test', 'entry without testing', 'no attendant', 'rescue by unplanned coworker entry'],
    mitigationStrategies: ['eliminate entry when feasible', 'classify space', 'test atmosphere', 'ventilate', 'isolate hazards', 'assign attendant', 'provide rescue capability'],
    verificationRequirements: ['meter readings', 'calibration record', 'permit', 'ventilation setup photo', 'rescue plan', 'isolation documentation'],
    closureRequirements: ['entry hazards evaluated and controlled', 'permit/monitoring/rescue documentation retained', 'entrant exposure closed out'],
    humanReviewTriggers: ['oxygen or toxic atmosphere uncertainty', 'engulfment potential', 'hot work in space', 'rescue uncertainty'],
    regulatoryCautionNotes: ['Confined-space determinations are fact-specific and should remain review-gated.'],
  },
  {
    domain: 'Trenching & Shoring',
    aliases: ['trench', 'excavation', 'shoring', 'cave-in', 'slope', 'bench', 'shield', 'soil', 'spoils', 'competent person'],
    hazardFamilies: ['excavation', 'ground failure', 'engulfment'],
    hazardousEnergies: ['gravity', 'stored_energy', 'kinetic_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['crush', 'asphyxiation', 'engulfment', 'struck_by', 'fall_to_lower_level'],
    healthMechanisms: ['oxygen deficiency', 'toxic atmosphere'],
    exposureRoutes: ['cave_in', 'engulfment', 'fall_into_excavation', 'struck_by_spoils_or_equipment'],
    commonFailureModes: ['no_protective_system', 'spoils_too_close', 'water_accumulation', 'no_access_egress', 'no_competent_person_inspection', 'undermined_surface'],
    relatedDomains: ['Mobile Equipment / Traffic', 'Confined Space', 'Fall Protection', 'Utility/Electrical'],
    evidenceRequired: ['depth', 'soil/rock condition', 'protective system', 'spoil pile distance', 'water condition', 'access/egress', 'nearby loads', 'competent person inspection'],
    strongControls: ['sloping', 'benching', 'shielding', 'shoring', 'safe access/egress', 'spoil setback', 'daily competent-person inspection'],
    weakControls: ['visual check only', 'worker judgment only', 'partial shielding', 'no documented inspection'],
    mitigationStrategies: ['install protective system', 'move spoils back', 'provide ladder/ramp', 'remove water', 'control nearby loads', 'inspect after changes'],
    verificationRequirements: ['depth photo/measurement', 'protective system photo', 'inspection record', 'spoil setback photo', 'access/egress photo'],
    closureRequirements: ['protective system verified', 'access/egress provided', 'competent person review documented'],
    humanReviewTriggers: ['employee in trench', 'depth/protective system uncertainty', 'water or surcharge load', 'adjacent utility hazard'],
    regulatoryCautionNotes: ['Excavation requirements depend on depth, soil, exposure, protective system, and competent-person findings.'],
  },
  {
    domain: 'Mobile Equipment / Powered Haulage',
    aliases: ['mobile equipment', 'haul truck', 'loader', 'forklift', 'traffic', 'pedestrian', 'blind spot', 'berm', 'roadway', 'backing', 'spotter', 'powered haulage'],
    hazardFamilies: ['struck-by', 'powered mobile equipment', 'traffic management'],
    hazardousEnergies: ['kinetic_energy', 'mechanical_motion', 'gravity'],
    injuryMechanisms: ['struck_by', 'caught_in_or_between', 'crush', 'rollover'],
    healthMechanisms: [],
    exposureRoutes: ['vehicle_pedestrian_interaction', 'collision', 'rollover', 'runover'],
    commonFailureModes: ['poor_separation', 'limited_visibility', 'no_spotter', 'poor_berm', 'bad_road_condition', 'speed_control_gap', 'communication_failure'],
    relatedDomains: ['Powered Haulage', 'Ground Control', 'Housekeeping', 'Visibility / Lighting', 'Material Handling'],
    evidenceRequired: ['traffic pattern', 'pedestrian route', 'visibility', 'backup alarms/cameras', 'berms', 'road grade/condition', 'spotter/control method', 'lighting'],
    strongControls: ['physical separation', 'traffic plan', 'berms', 'designated walkways', 'speed controls', 'proximity detection', 'spotter protocols', 'lighting'],
    weakControls: ['high-vis vest only', 'horn only', 'informal eye contact', 'verbal instruction without traffic design'],
    mitigationStrategies: ['separate pedestrians and equipment', 'design routes', 'repair roads/berms', 'improve lighting', 'verify alarms/cameras', 'control backing and blind spots'],
    verificationRequirements: ['traffic layout photo', 'berm condition photo', 'visibility assessment', 'alarm/camera check', 'roadway inspection'],
    closureRequirements: ['traffic conflict controlled', 'visibility and communication verified', 'route/berm/road condition corrected'],
    humanReviewTriggers: ['pedestrian exposure to equipment', 'haulage interaction', 'berm or road failure potential', 'limited visibility'],
    regulatoryCautionNotes: ['Powered haulage findings often involve operational controls, roadway design, and task-specific exposure.'],
  },
  {
    domain: 'Hazard Communication',
    aliases: ['hazcom', 'chemical', 'container', 'label', 'SDS', 'solvent', 'flammable', 'corrosive', 'toxic', 'unlabeled'],
    hazardFamilies: ['chemical safety', 'health exposure', 'fire'],
    hazardousEnergies: ['chemical_energy', 'thermal_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['chemical_burn', 'inhalation_exposure', 'skin_absorption', 'fire_or_explosion'],
    healthMechanisms: ['acute toxicity', 'chronic toxicity', 'sensitization', 'respiratory irritation', 'dermatitis'],
    exposureRoutes: ['inhalation', 'skin_contact', 'eye_contact', 'ingestion'],
    commonFailureModes: ['unlabeled_container', 'missing_sds', 'unknown_identity', 'poor_storage', 'incompatible_storage', 'no_employee_training'],
    relatedDomains: ['PPE', 'Fire / Hot Work', 'Respiratory Protection', 'Ventilation', 'Emergency Response', 'Exposure Monitoring'],
    evidenceRequired: ['chemical identity', 'label status', 'SDS availability', 'container condition', 'use task', 'quantity', 'storage location', 'exposure route'],
    strongControls: ['proper labeling', 'SDS access', 'substitution', 'closed transfer', 'ventilation', 'compatible storage', 'training', 'spill response'],
    weakControls: ['guessing contents', 'PPE without SDS review', 'handwritten vague label', 'training only without identity'],
    mitigationStrategies: ['identify chemical', 'label container', 'obtain SDS', 'segregate incompatible chemicals', 'control ventilation', 'verify PPE', 'train affected employees'],
    verificationRequirements: ['label photo', 'SDS record', 'storage photo', 'chemical inventory update', 'training/spill response documentation'],
    closureRequirements: ['chemical identity known', 'container labeled', 'SDS available', 'storage/use controls verified'],
    humanReviewTriggers: ['unknown chemical', 'acute toxicity', 'flammable/corrosive/reactive material', 'employee symptoms or exposure'],
    regulatoryCautionNotes: ['Hazcom classification must not assume chemical hazards without identity/SDS or credible evidence.'],
  },
  {
    domain: 'Respirable Dust / Silica',
    aliases: ['silica', 'respirable dust', 'dust', 'cutting', 'grinding', 'drilling', 'sand', 'quartz', 'concrete', 'stone', 'sweeping'],
    hazardFamilies: ['industrial hygiene', 'respiratory health', 'chronic disease'],
    hazardousEnergies: ['atmospheric_hazard'],
    injuryMechanisms: ['inhalation_exposure'],
    healthMechanisms: ['silicosis', 'lung cancer risk', 'COPD', 'respiratory irritation'],
    exposureRoutes: ['inhalation'],
    commonFailureModes: ['dry_cutting', 'no_water_suppression', 'no_local_exhaust', 'poor_housekeeping', 'no_sampling_data', 'respirator_program_gap'],
    relatedDomains: ['Respiratory Protection', 'Housekeeping', 'PPE', 'Ventilation', 'Exposure Monitoring'],
    evidenceRequired: ['task', 'material', 'dust generation', 'controls used', 'duration', 'frequency', 'sampling data if available', 'respirator program status'],
    strongControls: ['wet method', 'local exhaust', 'enclosure', 'substitution', 'process isolation', 'HEPA housekeeping', 'exposure monitoring'],
    weakControls: ['dry sweeping', 'dust mask only', 'respirator without assessment', 'no sampling where needed'],
    mitigationStrategies: ['use wet cutting', 'add local exhaust', 'use HEPA vacuum', 'limit exposure duration', 'conduct sampling', 'verify respiratory protection program'],
    verificationRequirements: ['control photo', 'task description', 'sampling record', 'respirator fit/training records', 'housekeeping method evidence'],
    closureRequirements: ['dust generation controlled', 'exposure basis documented', 'respiratory protection verified if used'],
    humanReviewTriggers: ['visible dust plume', 'no exposure data', 'respirator reliance', 'worker symptoms or chronic exposure potential'],
    regulatoryCautionNotes: ['Compliance with exposure limits cannot be declared without adequate exposure assessment or sampling basis.'],
  },
  {
    domain: 'Noise',
    aliases: ['noise', 'loud', 'hearing', 'audiogram', 'decibel', 'dba', 'sound level', 'hearing protection'],
    hazardFamilies: ['industrial hygiene', 'hearing conservation'],
    hazardousEnergies: ['noise_vibration'],
    injuryMechanisms: ['noise_induced_hearing_loss'],
    healthMechanisms: ['permanent threshold shift', 'tinnitus', 'hearing loss'],
    exposureRoutes: ['auditory_exposure'],
    commonFailureModes: ['no_noise_survey', 'no_hearing_protection', 'poor_fit', 'no_audiometric_program', 'high_noise_equipment'],
    relatedDomains: ['PPE', 'Exposure Monitoring', 'Equipment Maintenance'],
    evidenceRequired: ['noise source', 'duration', 'sound level if measured', 'employee proximity', 'hearing protection type/fit', 'audiometric program status'],
    strongControls: ['engineering noise control', 'enclosure', 'damping', 'maintenance', 'administrative rotation', 'hearing conservation program'],
    weakControls: ['earplugs without fit/training', 'unverified noise assumption', 'PPE only for high exposures'],
    mitigationStrategies: ['measure noise', 'control source', 'maintain equipment', 'provide hearing protection', 'fit/train employees', 'include in hearing conservation if required'],
    verificationRequirements: ['sound survey', 'equipment maintenance record', 'PPE fit/training record', 'audiometric program evidence'],
    closureRequirements: ['noise exposure evaluated', 'controls documented', 'hearing protection and program requirements verified'],
    humanReviewTriggers: ['unknown sound level', 'extended high-noise exposure', 'hearing protection reliance', 'employee symptoms'],
    regulatoryCautionNotes: ['Noise compliance requires exposure assessment; SafeScope cannot infer dose from qualitative description alone.'],
  },
  {
    domain: 'Heat Stress',
    aliases: ['heat', 'heat stress', 'hot environment', 'heat illness', 'WBGT', 'hydration', 'acclimatization', 'shade'],
    hazardFamilies: ['environmental stress', 'occupational health'],
    hazardousEnergies: ['environmental_stress', 'thermal_energy'],
    injuryMechanisms: ['heat_illness'],
    healthMechanisms: ['heat exhaustion', 'heat stroke', 'dehydration', 'rhabdomyolysis'],
    exposureRoutes: ['whole_body_heat_load'],
    commonFailureModes: ['no_acclimatization', 'no_water_rest_shade', 'heavy_workload', 'PPE_heat_burden', 'no_emergency_response'],
    relatedDomains: ['PPE', 'Emergency Response', 'Work Planning'],
    evidenceRequired: ['temperature/heat index/WBGT', 'workload', 'duration', 'PPE/clothing', 'hydration/rest/shade', 'acclimatization', 'symptoms'],
    strongControls: ['work/rest schedule', 'shade/cooling', 'hydration', 'acclimatization', 'buddy system', 'medical response plan'],
    weakControls: ['drink water reminder only', 'no monitoring', 'no acclimatization for new workers'],
    mitigationStrategies: ['measure heat stress', 'adjust work/rest', 'provide cooling/shade/water', 'train supervisors', 'monitor symptoms', 'prepare emergency response'],
    verificationRequirements: ['heat metric record', 'work/rest plan', 'water/shade photo', 'training record', 'incident response plan'],
    closureRequirements: ['heat stress controls implemented', 'workers monitored', 'emergency response understood'],
    humanReviewTriggers: ['symptoms reported', 'high heat index/WBGT', 'new/unacclimatized workers', 'heavy PPE burden'],
    regulatoryCautionNotes: ['Heat-risk conclusions depend on environment, workload, acclimatization, clothing, and worker condition.'],
  },
  {
    domain: 'Fire / Hot Work',
    aliases: ['fire', 'hot work', 'welding', 'cutting', 'grinding', 'spark', 'flammable', 'combustible', 'burn', 'permit'],
    hazardFamilies: ['fire', 'explosion', 'thermal energy'],
    hazardousEnergies: ['thermal_energy', 'chemical_energy', 'electrical_energy'],
    injuryMechanisms: ['fire_or_explosion', 'arc_flash_or_burn', 'inhalation_exposure', 'burn'],
    healthMechanisms: ['smoke inhalation', 'metal fume exposure'],
    exposureRoutes: ['thermal_contact', 'inhalation', 'blast_pressure'],
    commonFailureModes: ['no_hot_work_permit', 'combustibles_nearby', 'no_fire_watch', 'poor_gas_cylinder_control', 'inadequate_ventilation'],
    relatedDomains: ['Hazard Communication', 'Respiratory Protection', 'Confined Space', 'Fire Protection', 'PPE'],
    evidenceRequired: ['hot work task', 'nearby combustibles', 'flammables', 'permit status', 'fire watch', 'extinguisher', 'ventilation', 'gas cylinder condition'],
    strongControls: ['remove combustibles', 'hot work permit', 'fire watch', 'extinguishers', 'gas testing where needed', 'ventilation', 'cylinder control'],
    weakControls: ['watch for sparks only', 'no documented permit', 'extinguisher not accessible', 'PPE only'],
    mitigationStrategies: ['clear combustibles', 'issue permit', 'assign fire watch', 'verify extinguishers', 'ventilate fumes', 'secure cylinders', 'test atmosphere if needed'],
    verificationRequirements: ['permit', 'fire watch documentation', 'area photo', 'extinguisher photo', 'ventilation evidence'],
    closureRequirements: ['hot work hazards controlled', 'fire watch completed where needed', 'combustibles/flammables controlled'],
    humanReviewTriggers: ['hot work near flammables', 'confined space hot work', 'combustible dust potential', 'inadequate ventilation'],
    regulatoryCautionNotes: ['Hot work hazards often overlap with fire, atmospheric, confined-space, and chemical controls.'],
  },
  {
    domain: 'Combustible Dust',
    aliases: ['combustible dust', 'dust explosion', 'grain dust', 'coal dust', 'wood dust', 'metal dust', 'dust accumulation', 'deflagration'],
    hazardFamilies: ['fire', 'explosion', 'industrial hygiene'],
    hazardousEnergies: ['chemical_energy', 'thermal_energy', 'atmospheric_hazard'],
    injuryMechanisms: ['fire_or_explosion', 'arc_flash_or_burn', 'inhalation_exposure'],
    healthMechanisms: ['respiratory irritation', 'toxic dust exposure'],
    exposureRoutes: ['inhalation', 'explosion_blast', 'thermal_burn'],
    commonFailureModes: ['dust_accumulation', 'poor_housekeeping', 'ignition_source', 'no_explosion_venting', 'inadequate_dust_collection'],
    relatedDomains: ['Fire / Hot Work', 'Housekeeping', 'Ventilation', 'Electrical', 'Explosion Protection'],
    evidenceRequired: ['dust type', 'accumulation depth/area', 'ignition sources', 'collection system', 'housekeeping method', 'enclosure/venting'],
    strongControls: ['dust collection', 'housekeeping', 'ignition control', 'bonding/grounding', 'explosion venting/suppression', 'process enclosure'],
    weakControls: ['dry sweeping', 'compressed air cleaning', 'no dust characterization', 'PPE only'],
    mitigationStrategies: ['characterize dust', 'remove accumulations', 'control ignition sources', 'maintain collectors', 'use safe cleaning methods', 'verify explosion protection'],
    verificationRequirements: ['dust accumulation photos', 'housekeeping record', 'collector inspection', 'ignition source review', 'dust characterization if needed'],
    closureRequirements: ['dust accumulation controlled', 'ignition sources addressed', 'collection/housekeeping verified'],
    humanReviewTriggers: ['explosive dust potential', 'hot work near dust', 'large accumulation', 'unknown dust properties'],
    regulatoryCautionNotes: ['Combustible dust determinations require material/process knowledge and should be review-gated.'],
  },
  {
    domain: 'Pressure Systems / Hydraulics',
    aliases: ['pressure', 'hydraulic', 'pneumatic', 'hose', 'compressed air', 'line rupture', 'stored pressure', 'injection injury', 'cylinder'],
    hazardFamilies: ['pressure energy', 'stored energy', 'line of fire'],
    hazardousEnergies: ['pressure', 'stored_energy', 'thermal_energy', 'chemical_energy'],
    injuryMechanisms: ['struck_by', 'laceration', 'chemical_burn', 'injection_injury', 'burn'],
    healthMechanisms: ['fluid injection toxicity', 'chemical exposure'],
    exposureRoutes: ['fluid_injection', 'line_of_fire', 'spray_contact', 'stored_energy_release'],
    commonFailureModes: ['damaged_hose', 'missing_whip_check', 'unrelieved_pressure', 'poor_inspection', 'improper_fitting', 'line_of_fire_position'],
    relatedDomains: ['Lockout / Tagout', 'Machine Guarding', 'PPE', 'Maintenance Access'],
    evidenceRequired: ['pressure source', 'hose/fitting condition', 'stored pressure status', 'employee position', 'isolation/bleed method', 'fluid type'],
    strongControls: ['pressure relief', 'isolation', 'hose inspection/replacement', 'guarding/shielding', 'whip checks', 'line-of-fire exclusion'],
    weakControls: ['PPE only', 'hand check for leaks', 'unverified depressurization', 'warning sign only'],
    mitigationStrategies: ['relieve pressure', 'replace damaged hose', 'install restraints/shields', 'exclude employees from line of fire', 'verify compatible fittings'],
    verificationRequirements: ['hose/fitting photos', 'pressure relief evidence', 'replacement record', 'shield/restraint photo'],
    closureRequirements: ['pressure source controlled', 'defective parts replaced', 'line-of-fire exposure eliminated'],
    humanReviewTriggers: ['high pressure', 'injection risk', 'unknown fluid hazard', 'maintenance under pressure'],
    regulatoryCautionNotes: ['Pressure hazards require energy-control verification; do not assume safe state from equipment being off.'],
  },
  {
    domain: 'Cranes / Hoists / Rigging',
    aliases: ['crane', 'hoist', 'rigging', 'sling', 'hook', 'load', 'lift', 'overhead lift', 'rated capacity', 'tag line'],
    hazardFamilies: ['struck-by', 'crush', 'material handling', 'gravity'],
    hazardousEnergies: ['gravity', 'kinetic_energy', 'mechanical_motion'],
    injuryMechanisms: ['struck_by', 'crush', 'caught_in_or_between'],
    healthMechanisms: [],
    exposureRoutes: ['dropped_load', 'swing_radius', 'pinch_point', 'overload_failure'],
    commonFailureModes: ['damaged_sling', 'unknown_capacity', 'poor_rigging_angle', 'standing_under_load', 'no_signal_person', 'unstable_load'],
    relatedDomains: ['Material Handling', 'Mobile Equipment / Traffic', 'Fall Protection'],
    evidenceRequired: ['load weight', 'rigging condition', 'capacity tags', 'lift path', 'employee position', 'signal method', 'ground/support condition'],
    strongControls: ['rated rigging', 'inspection', 'exclusion zone', 'qualified rigger/signal', 'tag lines', 'lift plan for critical lifts'],
    weakControls: ['visual guess of weight', 'standing clear instruction only', 'untagged sling', 'no exclusion zone'],
    mitigationStrategies: ['inspect rigging', 'verify capacity', 'establish exclusion zone', 'control load path', 'use qualified rigger/signal', 'remove damaged gear'],
    verificationRequirements: ['rigging photo', 'capacity tag photo', 'lift area photo', 'inspection record', 'lift plan if needed'],
    closureRequirements: ['rigging verified', 'employees clear of load path', 'lift controls documented'],
    humanReviewTriggers: ['critical lift', 'damaged/untagged rigging', 'unknown load weight', 'employees under/suspended load'],
    regulatoryCautionNotes: ['Rigging/lift safety depends on capacity, configuration, inspection, load path, and personnel positioning.'],
  },
  {
    domain: 'Material Handling',
    aliases: ['material handling', 'storage', 'stack', 'rack', 'pallet', 'manual handling', 'lift', 'load', 'falling material', 'collapse'],
    hazardFamilies: ['struck-by', 'crush', 'ergonomics'],
    hazardousEnergies: ['gravity', 'kinetic_energy', 'mechanical_motion', 'biomechanical_load'],
    injuryMechanisms: ['struck_by', 'crush', 'overexertion', 'sprain_strain'],
    healthMechanisms: ['musculoskeletal disorder'],
    exposureRoutes: ['falling_object', 'manual_lift', 'collapse', 'pinch_point'],
    commonFailureModes: ['unstable_stack', 'overloaded_rack', 'poor_storage', 'manual_lift_overload', 'blocked_aisle'],
    relatedDomains: ['Ergonomics', 'Mobile Equipment / Traffic', 'Housekeeping', 'Cranes / Hoists / Rigging'],
    evidenceRequired: ['load size/weight', 'storage stability', 'rack condition/capacity', 'aisle clearance', 'handling method', 'employee body position'],
    strongControls: ['engineered storage', 'capacity labeling', 'mechanical assist', 'stable stacking', 'aisle control', 'team lift/process redesign'],
    weakControls: ['lift carefully instruction', 'PPE only', 'unverified rack capacity', 'unstable temporary stack'],
    mitigationStrategies: ['stabilize storage', 'verify rack capacity', 'use mechanical aids', 'clear aisles', 'reduce manual force', 'train on revised process'],
    verificationRequirements: ['storage/rack photo', 'capacity label', 'aisle photo', 'mechanical aid evidence', 'corrected stack photo'],
    closureRequirements: ['material secured', 'storage capacity verified', 'handling exposure reduced'],
    humanReviewTriggers: ['unstable heavy material', 'rack damage', 'overhead storage', 'high-force manual lift'],
    regulatoryCautionNotes: ['Material handling may overlap with powered equipment, rigging, housekeeping, and ergonomics.'],
  },
  {
    domain: 'Housekeeping / Walking-Working Surfaces',
    aliases: ['housekeeping', 'slip', 'trip', 'spill', 'walking surface', 'floor', 'aisle', 'debris', 'cord', 'clutter'],
    hazardFamilies: ['slip/trip/fall', 'walking-working surfaces'],
    hazardousEnergies: ['gravity', 'kinetic_energy'],
    injuryMechanisms: ['fall_same_level', 'fall_to_lower_level', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['same_level_fall', 'trip', 'slip', 'blocked_access'],
    commonFailureModes: ['spill_not_cleaned', 'debris_in_aisle', 'cord_across_walkway', 'poor_lighting', 'uneven_surface', 'blocked_exit'],
    relatedDomains: ['Fall Protection', 'Emergency Response', 'Material Handling'],
    evidenceRequired: ['walking path condition', 'spill/debris source', 'employee route', 'lighting', 'drainage', 'temporary controls', 'exit/access impact'],
    strongControls: ['remove spill/debris', 'repair surface', 'route cords', 'improve drainage/lighting', 'barrier until corrected', 'inspection schedule'],
    weakControls: ['wet floor sign only', 'verbal warning only', 'cleanup later without barricade'],
    mitigationStrategies: ['clean spill', 'remove trip hazards', 'repair surface', 'barricade area', 'fix source of leak/debris', 'verify access/egress'],
    verificationRequirements: ['before/after photos', 'source correction evidence', 'walkway/aisle photo', 'inspection record'],
    closureRequirements: ['walking surface restored', 'source controlled', 'access/egress clear'],
    humanReviewTriggers: ['fall from elevation potential', 'blocked emergency route', 'recurring spill/leak', 'high traffic area'],
    regulatoryCautionNotes: ['Housekeeping findings should consider source control, not just cleanup.'],
  },
  {
    domain: 'Ladders / Scaffolds',
    aliases: ['ladder', 'scaffold', 'scaffolding', 'platform', 'plank', 'brace', 'tie-off', 'access ladder'],
    hazardFamilies: ['falls', 'temporary access', 'structural support'],
    hazardousEnergies: ['gravity', 'kinetic_energy'],
    injuryMechanisms: ['fall_to_lower_level', 'fall_same_level', 'struck_by'],
    healthMechanisms: [],
    exposureRoutes: ['fall_from_access', 'platform_failure', 'falling_object'],
    commonFailureModes: ['damaged_ladder', 'improper_angle', 'unsecured_ladder', 'missing_guardrail', 'incomplete_scaffold', 'poor_foundation', 'no_inspection'],
    relatedDomains: ['Fall Protection', 'Housekeeping', 'Material Handling'],
    evidenceRequired: ['ladder/scaffold type', 'condition', 'setup angle/base', 'height', 'guardrails/planks', 'access method', 'inspection status'],
    strongControls: ['proper setup', 'inspection', 'secure ladder', 'complete scaffold components', 'guardrails', 'stable foundation', 'fall protection where needed'],
    weakControls: ['hold ladder instruction', 'incomplete scaffold allowed briefly', 'unverified inspection'],
    mitigationStrategies: ['remove damaged equipment', 'secure ladder', 'correct scaffold components', 'verify foundation', 'install guardrails', 'document inspection'],
    verificationRequirements: ['setup photo', 'component photo', 'inspection tag/record', 'base/foundation photo', 'guardrail photo'],
    closureRequirements: ['access equipment inspected and corrected', 'fall exposure controlled', 'defective components removed'],
    humanReviewTriggers: ['height exposure', 'incomplete scaffold', 'damaged ladder', 'unknown capacity/foundation'],
    regulatoryCautionNotes: ['Scaffold and ladder requirements depend on type, height, use, condition, and access configuration.'],
  },
  {
    domain: 'Ground Control / Highwall',
    aliases: ['ground control', 'highwall', 'slope', 'bench', 'falling rock', 'rockfall', 'rib', 'roof', 'ground failure'],
    hazardFamilies: ['ground failure', 'struck-by', 'crush'],
    hazardousEnergies: ['gravity', 'kinetic_energy', 'stored_energy'],
    injuryMechanisms: ['struck_by', 'crush', 'engulfment'],
    healthMechanisms: [],
    exposureRoutes: ['falling_material', 'slope_failure', 'collapse'],
    commonFailureModes: ['loose_material', 'unsupported_ground', 'poor_scaling', 'working_below_highwall', 'water_undermining', 'no_examination'],
    relatedDomains: ['Mobile Equipment / Traffic', 'Excavation', 'Material Handling'],
    evidenceRequired: ['ground condition', 'bench/highwall condition', 'loose material', 'employee/equipment location', 'weather/water', 'examination record'],
    strongControls: ['scaling', 'exclusion zone', 'ground support', 'bench maintenance', 'examination', 'equipment standoff'],
    weakControls: ['visual awareness only', 'work below loose material', 'no documented exam'],
    mitigationStrategies: ['remove loose material', 'barricade danger zone', 'inspect ground', 'maintain bench/slope', 'relocate workers/equipment'],
    verificationRequirements: ['highwall/ground photos', 'exam record', 'barricade/standoff evidence', 'corrected condition photo'],
    closureRequirements: ['ground hazard evaluated and controlled', 'exclusion/standoff maintained', 'exam documented'],
    humanReviewTriggers: ['loose ground above workers', 'active mining near highwall', 'water/undermining', 'recent ground movement'],
    regulatoryCautionNotes: ['Ground-control findings require competent/qualified review based on site conditions.'],
  },
  {
    domain: 'Ergonomics',
    aliases: ['ergonomic', 'lifting', 'repetitive', 'awkward posture', 'force', 'overexertion', 'strain', 'sprain', 'manual handling'],
    hazardFamilies: ['ergonomics', 'musculoskeletal disorder'],
    hazardousEnergies: ['biomechanical_load', 'ergonomic_force'],
    injuryMechanisms: ['overexertion', 'sprain_strain'],
    healthMechanisms: ['musculoskeletal disorder', 'cumulative trauma'],
    exposureRoutes: ['forceful_exertion', 'repetition', 'awkward_posture', 'contact_stress'],
    commonFailureModes: ['heavy_manual_lift', 'repetitive_task', 'poor_work_height', 'long_reach', 'twisting', 'no_mechanical_assist'],
    relatedDomains: ['Material Handling', 'Work Design'],
    evidenceRequired: ['task frequency', 'load weight', 'posture', 'reach distance', 'duration', 'available mechanical aids', 'symptoms/injury history'],
    strongControls: ['mechanical assist', 'work redesign', 'adjustable height', 'load reduction', 'rotation with exposure control', 'two-person lift where appropriate'],
    weakControls: ['lift with legs reminder', 'back belt only', 'training without task redesign'],
    mitigationStrategies: ['reduce weight/force', 'use mechanical aid', 'raise/lower work height', 'reduce repetition', 'redesign layout', 'evaluate symptoms'],
    verificationRequirements: ['task photo/video', 'load measurement', 'mechanical aid evidence', 'revised layout photo'],
    closureRequirements: ['force/posture/repetition exposure reduced', 'new process verified', 'employees trained on revised method'],
    humanReviewTriggers: ['injury symptoms', 'high-force task', 'repetitive high-duration task', 'no feasible controls identified'],
    regulatoryCautionNotes: ['Ergonomic risk often requires task analysis rather than citation-only evaluation.'],
  },
  {
    domain: 'Respiratory Protection / PPE',
    aliases: ['respirator', 'respiratory protection', 'PPE', 'gloves', 'goggles', 'face shield', 'hearing protection', 'fit test', 'cartridge'],
    hazardFamilies: ['PPE', 'last-line control', 'health protection'],
    hazardousEnergies: ['varies_by_hazard'],
    injuryMechanisms: ['varies_by_hazard'],
    healthMechanisms: ['inhalation exposure reduction', 'skin/eye protection', 'hearing protection'],
    exposureRoutes: ['inhalation', 'skin_contact', 'eye_contact', 'auditory_exposure'],
    commonFailureModes: ['wrong_ppe', 'poor_fit', 'no_fit_test', 'no_training', 'expired_cartridge', 'PPE_used_as_primary_control'],
    relatedDomains: ['Hazard Communication', 'Respirable Dust / Silica', 'Noise', 'Hot Work', 'Chemical Safety'],
    evidenceRequired: ['hazard requiring PPE', 'PPE type', 'selection basis', 'fit/training', 'condition', 'program records', 'exposure assessment'],
    strongControls: ['properly selected PPE', 'fit testing', 'training', 'maintenance/replacement', 'program oversight', 'higher-order controls first'],
    weakControls: ['PPE only where engineering control feasible', 'wrong cartridge', 'voluntary/unverified respirator use', 'damaged PPE'],
    mitigationStrategies: ['identify hazard', 'select proper PPE', 'verify fit/training', 'maintain/replace PPE', 'prioritize engineering controls'],
    verificationRequirements: ['PPE photo', 'fit test record', 'training record', 'selection basis/SDS or exposure assessment'],
    closureRequirements: ['PPE selected and verified', 'program requirements met', 'higher-order controls considered'],
    humanReviewTriggers: ['respirator reliance', 'unknown exposure', 'incorrect PPE suspected', 'high-consequence chemical/health exposure'],
    regulatoryCautionNotes: ['PPE should not be treated as proof of compliance without hazard assessment and program verification.'],
  },
  {
    domain: 'Emergency Response / Rescue',
    aliases: ['emergency', 'rescue', 'first aid', 'eyewash', 'shower', 'evacuation', 'alarm', 'fire extinguisher', 'spill response'],
    hazardFamilies: ['emergency response', 'mitigation failure', 'severity reduction'],
    hazardousEnergies: ['varies_by_hazard'],
    injuryMechanisms: ['delayed_rescue', 'secondary_exposure', 'worsened_injury'],
    healthMechanisms: ['delayed treatment', 'chemical exposure progression', 'heat illness progression'],
    exposureRoutes: ['emergency_condition', 'delayed_response'],
    commonFailureModes: ['no_rescue_plan', 'blocked_egress', 'missing_eyewash', 'expired_extinguisher', 'no_drill_or_training', 'rescue_by_untrained_worker'],
    relatedDomains: ['Confined Space', 'Fire / Hot Work', 'Hazard Communication', 'Heat Stress', 'Fall Protection'],
    evidenceRequired: ['emergency scenario', 'response equipment', 'access/egress', 'training', 'inspection status', 'communication method', 'rescue capability'],
    strongControls: ['planned rescue', 'available response equipment', 'trained responders', 'clear egress', 'drills', 'inspection schedule'],
    weakControls: ['call 911 only where immediate rescue required', 'untrained coworker rescue', 'blocked equipment', 'expired equipment'],
    mitigationStrategies: ['develop response plan', 'inspect equipment', 'clear access/egress', 'train responders', 'conduct drills', 'verify communication'],
    verificationRequirements: ['equipment inspection', 'training/drill record', 'egress/access photo', 'response plan'],
    closureRequirements: ['response equipment available', 'access clear', 'training/rescue plan verified'],
    humanReviewTriggers: ['confined space rescue', 'fall rescue', 'chemical exposure emergency', 'fire/explosion potential'],
    regulatoryCautionNotes: ['Emergency readiness supports severity reduction but does not replace hazard prevention controls.'],
  },
];

export class SafeScopeSafetyHealthDomainMatrixService {
  evaluate(input: SafeScopeSafetyHealthDomainMatrixInput): SafeScopeSafetyHealthDomainMatrixOutput {
    const classification = cleanText(input.classification) || 'Unclassified';
    const evidenceText = (input.evidenceTexts || []).join(' ');
    const standardsText = (input.suggestedStandards || [])
      .map((standard: any) => `${standard?.citation || ''} ${standard?.summary || ''} ${standard?.rationale || ''}`)
      .join(' ');

    const combined = `${classification} ${input.observationText || ''} ${evidenceText} ${standardsText}`.toLowerCase();

    const matched = DOMAIN_MATRIX
      .map((domain) => ({
        domain,
        score: this.scoreDomain(combined, classification, domain),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const selected = matched.length
      ? matched.slice(0, 5).map((item) => item.domain)
      : [this.unclassifiedDomain()];

    const matchedKeywordCount = matched.reduce((sum, item) => sum + item.score, 0);

    const highRisk =
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    const upstreamReviewSignals = [
      input.hazardDomainIntelligence?.requiresQualifiedReview,
      input.mechanismIntelligence?.requiresQualifiedReview,
      input.exposureIntelligence?.requiresIndustrialHygieneReview,
      input.evidenceSufficiency?.sufficientForClosure === false,
      input.actionQuality?.requiresSupervisorReview,
      input.causalChain?.requiresQualifiedReview,
      input.controlEffectiveness?.requiresQualifiedReview,
    ].some(Boolean);

    const primaryDomain = selected[0]?.domain || 'Unclassified';

    const relatedDomains = unique([
      ...selected.flatMap((domain) => domain.relatedDomains),
      ...(Array.isArray(input.hazardDomainIntelligence?.relatedDomains) ? input.hazardDomainIntelligence.relatedDomains : []),
    ]).filter((domain) => domain !== primaryDomain);

    const humanReviewTriggers = unique([
      ...selected.flatMap((domain) => domain.humanReviewTriggers),
      ...(highRisk ? ['High-risk or high-consequence condition requires qualified review.'] : []),
      ...(input.evidenceSufficiency?.sufficientForClosure === false ? ['Evidence sufficiency layer indicates closure is not yet supported.'] : []),
      ...(input.controlEffectiveness?.effectivenessRating && input.controlEffectiveness.effectivenessRating !== 'effective'
        ? ['Control effectiveness layer indicates controls are not fully verified as effective.']
        : []),
    ]);

    const confidence = this.getConfidence({
      matchedDomainCount: matched.length,
      matchedKeywordCount,
      selectedCount: selected.length,
      classification,
    });

    return {
      engine: 'safescope_safety_health_domain_matrix',
      mode: 'deterministic_offline',
      classification,
      matchedDomains: selected.map((domain) => domain.domain),
      primaryDomain,
      relatedDomains,
      hazardFamilies: unique(selected.flatMap((domain) => domain.hazardFamilies)),
      hazardousEnergies: unique([
        ...selected.flatMap((domain) => domain.hazardousEnergies),
        ...(Array.isArray(input.mechanismIntelligence?.primaryEnergySources) ? input.mechanismIntelligence.primaryEnergySources : []),
      ]),
      injuryMechanisms: unique([
        ...selected.flatMap((domain) => domain.injuryMechanisms),
        ...(Array.isArray(input.mechanismIntelligence?.injuryMechanisms) ? input.mechanismIntelligence.injuryMechanisms : []),
      ]),
      healthMechanisms: unique(selected.flatMap((domain) => domain.healthMechanisms)),
      exposureRoutes: unique([
        ...selected.flatMap((domain) => domain.exposureRoutes),
        input.exposureIntelligence?.exposureRoute,
      ]),
      commonFailureModes: unique([
        ...selected.flatMap((domain) => domain.commonFailureModes),
        ...(Array.isArray(input.mechanismIntelligence?.failureModes) ? input.mechanismIntelligence.failureModes : []),
      ]),
      additionalHazardsToConsider: relatedDomains,
      evidenceRequired: unique([
        ...selected.flatMap((domain) => domain.evidenceRequired),
        ...(Array.isArray(input.evidenceSufficiency?.recommendedEvidenceToCapture) ? input.evidenceSufficiency.recommendedEvidenceToCapture : []),
      ]),
      strongControls: unique(selected.flatMap((domain) => domain.strongControls)),
      weakControls: unique(selected.flatMap((domain) => domain.weakControls)),
      mitigationStrategies: unique(selected.flatMap((domain) => domain.mitigationStrategies)),
      verificationRequirements: unique([
        ...selected.flatMap((domain) => domain.verificationRequirements),
        ...(Array.isArray(input.controlEffectiveness?.verificationNeeded) ? input.controlEffectiveness.verificationNeeded : []),
      ]),
      closureRequirements: unique([
        ...selected.flatMap((domain) => domain.closureRequirements),
        ...(Array.isArray(input.controlEffectiveness?.closureReadinessBlockers) ? input.controlEffectiveness.closureReadinessBlockers : []),
      ]),
      humanReviewTriggers,
      regulatoryCautionNotes: unique(selected.flatMap((domain) => domain.regulatoryCautionNotes)),
      confidence,
      matchedDomainCount: matched.length,
      matchedKeywordCount,
      matrixDomainCount: DOMAIN_MATRIX.length,
      requiresQualifiedReview:
        Boolean(highRisk) ||
        upstreamReviewSignals ||
        confidence !== 'high' ||
        Boolean(humanReviewTriggers.length),
      canInventStandards: false,
      canOverrideRegulations: false,
      canFinalizeWithoutHumanReview: false,
      sourceBoundary:
        'SafeScope safety-health domain matrix provides deterministic cross-domain safety and health understanding, including hazard mechanisms, related hazards, evidence needs, strong and weak controls, mitigation patterns, verification requirements, and closure requirements. It cannot invent standards, override regulations, or finalize compliance decisions without qualified human review.',
    };
  }

  getDomainMatrix(): SafeScopeDomainMatrixDomain[] {
    return DOMAIN_MATRIX;
  }

  private scoreDomain(text: string, classification: string, domain: SafeScopeDomainMatrixDomain): number {
    const classificationLower = classification.toLowerCase();
    let score = 0;

    if (classificationLower === domain.domain.toLowerCase()) {
      score += 20;
    }

    if (classificationLower.includes(domain.domain.toLowerCase()) || domain.domain.toLowerCase().includes(classificationLower)) {
      score += 10;
    }

    for (const alias of domain.aliases) {
      if (text.includes(alias.toLowerCase())) {
        score += 1;
      }
    }

    if (includesAny(text, domain.commonFailureModes)) {
      score += 2;
    }

    return score;
  }

  private getConfidence(input: {
    matchedDomainCount: number;
    matchedKeywordCount: number;
    selectedCount: number;
    classification: string;
  }): SafeScopeDomainMatrixConfidence {
    if (!input.matchedDomainCount || input.classification.toLowerCase() === 'unclassified') return 'low';
    if (input.matchedKeywordCount >= 4 || input.selectedCount >= 2) return 'high';
    return 'medium';
  }

  private unclassifiedDomain(): SafeScopeDomainMatrixDomain {
    return {
      domain: 'Unclassified',
      aliases: [],
      hazardFamilies: ['unclassified safety or health concern'],
      hazardousEnergies: ['unknown'],
      injuryMechanisms: ['unknown'],
      healthMechanisms: ['unknown'],
      exposureRoutes: ['unknown'],
      commonFailureModes: ['insufficient_context'],
      relatedDomains: ['Qualified Human Review'],
      evidenceRequired: ['clear observation description', 'task being performed', 'employee exposure', 'energy or agent involved', 'controls present', 'photos or measurements'],
      strongControls: ['qualified review', 'additional evidence capture', 'interim exposure control'],
      weakControls: ['finalizing without context', 'assuming standard applicability', 'generic corrective action'],
      mitigationStrategies: ['stop and gather evidence', 'identify exposed worker/task', 'identify energy or agent', 'document controls', 'route for qualified review'],
      verificationRequirements: ['supplemental notes', 'photos', 'supervisor review'],
      closureRequirements: ['hazard classified', 'exposure documented', 'control verified', 'review completed'],
      humanReviewTriggers: ['unclassified or low-context condition'],
      regulatoryCautionNotes: ['Do not infer compliance requirements without adequate classification, evidence, and qualified review.'],
    };
  }
}
