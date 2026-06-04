import {
  MechanismIntelligenceInput,
  MechanismIntelligenceOutput,
  SafeScopeEnergySource,
  SafeScopeInjuryMechanism,
} from "./mechanism-intelligence.types";

type MechanismDomain = {
  keys: string[];
  energySources: SafeScopeEnergySource[];
  injuryMechanisms: SafeScopeInjuryMechanism[];
  accidentPathways: string[];
  lineOfFireFactors: string[];
  failureModes: string[];
  evidenceNeeded: string[];
  severityAmplifiers: string[];
  controlStrategyNotes: string[];
  verificationFocus: string[];
};

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items.filter(Boolean)));
}

const MECHANISM_DOMAINS: MechanismDomain[] = [
  // ... existing domains ...
  {
    keys: ["machine", "guarding", "conveyor", "rotating", "pinch", "nip", "unguarded"],
    energySources: ["mechanical_motion", "stored_energy", "kinetic_energy"],
    injuryMechanisms: ["caught_in_or_between", "crush", "amputation", "laceration"],
    accidentPathways: [
      "Worker reaches into or near moving equipment during operation, cleanup, adjustment, troubleshooting, or maintenance.",
      "Unexpected startup or release of stored energy exposes a worker to rotating, reciprocating, shearing, or pinch-point motion.",
    ],
    lineOfFireFactors: ["worker_access_to_moving_parts", "unguarded_motion", "unexpected_startup", "stored_energy", "cleanup_or_adjustment_near_motion"],
    failureModes: ["missing_guard", "inadequate_guard_coverage", "bypassed_interlock", "unverified_zero_energy", "production_pressure_shortcut"],
    evidenceNeeded: ["Confirm equipment state.", "Confirm whether employees can reach the hazard zone.", "Document guard coverage and access path.", "Verify lockout/tagout or zero-energy state for service, cleanup, or adjustment."],
    severityAmplifiers: ["high speed rotation", "unguarded nip point", "stored energy", "automatic cycling", "body-part access to point of operation"],
    controlStrategyNotes: ["Prefer fixed guarding, interlocked guarding, isolation, lockout/tagout, and verified zero energy over warnings or PPE."],
    verificationFocus: ["Guard condition", "Point of operation", "Access path", "Equipment state", "Isolation points", "Try/test verification"],
  },
  {
    keys: ["electrical", "energized", "panel", "conductor", "arc", "breaker", "disconnect"],
    energySources: ["electrical_energy", "thermal_energy"],
    injuryMechanisms: ["electrocution_or_shock", "arc_flash_or_burn", "fire_or_explosion"],
    accidentPathways: [
      "Worker contacts energized conductors or exposed components during inspection, troubleshooting, repair, or unauthorized access.",
      "Electrical fault or damaged equipment creates arc flash, burn, ignition, or secondary fall potential.",
    ],
    lineOfFireFactors: ["energized_parts", "open_panel", "damaged_insulation", "wet_location", "unqualified_access"],
    failureModes: ["missing_cover", "damaged_cord_or_insulation", "poor_labeling", "no_disconnect_control", "no_verification_of_deenergization"],
    evidenceNeeded: ["Confirm energized/de-energized state.", "Document covers, labels, disconnects, grounding, and access restrictions.", "Confirm qualified-person controls and task being performed."],
    severityAmplifiers: ["unknown voltage", "wet conditions", "exposed energized components", "arc flash potential", "unqualified worker access"],
    controlStrategyNotes: ["Prefer de-energization, enclosure integrity, guarding, access restriction, and qualified-person review before PPE reliance."],
    verificationFocus: ["Panel condition", "Covers", "Labels", "Disconnect status", "Qualified-person review", "Evidence of de-energization"],
  },
  {
    keys: ["fall", "elevated", "edge", "roof", "ladder", "scaffold", "opening", "hole"],
    energySources: ["gravity", "kinetic_energy"],
    injuryMechanisms: ["fall_to_lower_level", "fall_same_level", "struck_by"],
    accidentPathways: [
      "Worker loses balance, slips, trips, missteps, or is displaced near an unprotected edge, opening, ladder, scaffold, or elevated work surface.",
      "Dropped objects or falling materials expose workers below to struck-by injury.",
    ],
    lineOfFireFactors: ["unprotected_edge", "unstable_surface", "poor_access", "improper_tie_off", "inadequate_anchor", "dropped_object_zone"],
    failureModes: ["missing_guardrail", "uncovers_or_unsecured_hole", "poor_ladder_angle_or_condition", "improper_anchor", "no_rescue_plan"],
    evidenceNeeded: ["Measure or estimate fall distance.", "Document edge/opening protection.", "Verify anchor, tie-off, ladder/scaffold setup, and rescue considerations."],
    severityAmplifiers: ["greater fall distance", "hard landing surface", "impalement hazards", "suspended work", "poor rescue access"],
    controlStrategyNotes: ["Prefer eliminating elevated work, guardrails, covers, platforms, and travel restraint before relying on personal fall arrest alone."],
    verificationFocus: ["Work height", "Guardrails/covers", "Tie-off method", "Anchor point", "Access method", "Rescue plan"],
  },
  {
    keys: ["confined", "permit space", "atmosphere", "engulfment", "oxygen", "entrant"],
    energySources: ["atmospheric_hazard", "chemical_energy", "mechanical_motion"],
    injuryMechanisms: ["asphyxiation", "inhalation_exposure", "engulfment", "caught_in_or_between"],
    accidentPathways: [
      "Entrant is exposed to oxygen deficiency/enrichment, toxic gas, flammable atmosphere, engulfment, entrapment, or delayed rescue.",
      "Material flow, mechanical energy, or poor isolation creates secondary fatality potential during entry.",
    ],
    lineOfFireFactors: ["hazardous_atmosphere", "engulfment_material", "restricted_entry_exit", "uncontrolled_energy", "delayed_rescue"],
    failureModes: ["no_atmospheric_testing", "no_permit", "poor_isolation", "missing_attendant", "inadequate_rescue_plan"],
    evidenceNeeded: ["Document space classification.", "Document atmospheric readings and monitor calibration.", "Verify isolation, ventilation, attendant, rescue plan, and permit controls."],
    severityAmplifiers: ["oxygen deficiency", "toxic atmosphere", "flammable atmosphere", "engulfment potential", "non-entry rescue not available"],
    controlStrategyNotes: ["Prefer eliminating entry, remote inspection, isolation, ventilation, and engineered access before PPE-based entry."],
    verificationFocus: ["Atmospheric readings", "Calibration status", "Permit", "Isolation points", "Ventilation", "Attendant", "Rescue plan"],
  },
  {
    keys: ["trench", "excavation", "shoring", "sloping", "shield", "cave-in"],
    energySources: ["gravity", "stored_energy", "kinetic_energy", "atmospheric_hazard"],
    injuryMechanisms: ["crush", "asphyxiation", "struck_by", "engulfment"],
    accidentPathways: [
      "Soil, rock, water, equipment, or spoil pile movement collapses into the excavation and traps or crushes workers.",
      "Worker cannot exit due to inadequate access/egress or changing excavation conditions.",
    ],
    lineOfFireFactors: ["unprotected_excavation_wall", "spoil_pile_near_edge", "water_accumulation", "nearby_vehicle_loads", "poor_egress"],
    failureModes: ["no_protective_system", "incorrect_sloping_or_shoring", "shield_not_used_correctly", "no_competent_person_inspection", "water_or_vibration_not_controlled"],
    evidenceNeeded: ["Document excavation depth.", "Document soil/rock condition.", "Document protective system, access/egress, spoil placement, water control, and competent-person inspection."],
    severityAmplifiers: ["depth greater than worker height", "water accumulation", "vibration or nearby loads", "spoil near edge", "no protective system"],
    controlStrategyNotes: ["Prefer preventing entry, engineered protective systems, sloping/benching, shielding, and shoring before administrative controls."],
    verificationFocus: ["Depth", "Soil condition", "Protective system", "Spoil pile distance", "Water", "Access/egress", "Competent-person inspection"],
  },
  {
    keys: ["mobile equipment", "traffic", "haul truck", "loader", "forklift", "pedestrian", "vehicle"],
    energySources: ["kinetic_energy", "mechanical_motion", "gravity"],
    injuryMechanisms: ["struck_by", "caught_in_or_between", "crush"],
    accidentPathways: [
      "Pedestrian enters equipment travel path, blind spot, backing zone, swing radius, dump zone, or loading area.",
      "Vehicle instability, poor berms, grade, ground condition, or operator visibility creates rollover, runover, or collision potential.",
    ],
    lineOfFireFactors: ["blind_spot", "backing_zone", "swing_radius", "dump_zone", "pedestrian_equipment_interaction", "poor_berm_or_ground_condition"],
    failureModes: ["no_traffic_separation", "poor_visibility", "missing_alarm_or_lights", "inadequate_berm", "no_spotter_control", "uncontrolled_backing"],
    evidenceNeeded: ["Document traffic pattern and pedestrian routes.", "Document visibility, alarms, berms, lights, communication, ground condition, and operator controls."],
    severityAmplifiers: ["large equipment mass", "limited visibility", "reverse travel", "slope or unstable ground", "pedestrian proximity"],
    controlStrategyNotes: ["Prefer physical separation, route redesign, barriers, berms, proximity controls, and engineered visibility improvements over verbal instructions."],
    verificationFocus: ["Traffic layout", "Pedestrian separation", "Equipment condition", "Alarms/lights", "Berms", "Visibility", "Ground condition"],
  },
  {
    keys: ["chemical", "hazcom", "label", "sds", "solvent", "corrosive", "flammable", "container"],
    energySources: ["chemical_energy", "thermal_energy"],
    injuryMechanisms: ["chemical_burn", "inhalation_exposure", "skin_absorption", "fire_or_explosion"],
    accidentPathways: [
      "Worker is exposed through unlabeled container use, incompatible storage, spill, splash, vapor generation, poor ventilation, or wrong PPE.",
      "Chemical identity is unknown, causing incorrect handling, storage, emergency response, or exposure control.",
    ],
    lineOfFireFactors: ["unlabeled_container", "incompatible_storage", "poor_ventilation", "splash_zone", "flammable_vapor", "incorrect_ppe"],
    failureModes: ["missing_sds", "unlabeled_secondary_container", "poor_storage_compatibility", "no_secondary_containment", "wrong_gloves_or_eye_protection"],
    evidenceNeeded: ["Identify the chemical.", "Verify label and SDS.", "Document storage, compatibility, ventilation, PPE, spill control, and worker communication."],
    severityAmplifiers: ["corrosive material", "flammable vapor", "unknown chemical", "confined or poorly ventilated area", "splash potential"],
    controlStrategyNotes: ["Prefer substitution, closed transfer, isolation, ventilation, compatible storage, and containment before PPE-only reliance."],
    verificationFocus: ["Label", "SDS", "Chemical identity", "Storage compatibility", "Ventilation", "PPE", "Spill controls"],
  },
  {
    keys: ["respirable", "silica", "dust", "fume", "mist", "gas", "vapor", "airborne", "respiratory"],
    energySources: ["atmospheric_hazard", "chemical_energy"],
    injuryMechanisms: ["inhalation_exposure", "silica_or_dust_disease", "asphyxiation"],
    accidentPathways: [
      "Worker inhales dust, fume, mist, vapor, gas, aerosol, or oxygen-displacing atmosphere during task performance.",
      "Chronic exposure accumulates when source controls, ventilation, wet methods, housekeeping, or exposure assessment are missing.",
    ],
    lineOfFireFactors: ["visible_dust_or_fume", "poor_ventilation", "dry_sweeping", "enclosed_area", "respirator_program_gap"],
    failureModes: ["no_exposure_assessment", "ineffective_wet_method", "poor_local_exhaust", "wrong_respirator", "no_fit_test", "poor_housekeeping"],
    evidenceNeeded: ["Identify contaminant and task.", "Document visible emissions, ventilation, wet methods, housekeeping, respirator selection, fit testing, and monitoring history."],
    severityAmplifiers: ["visible cloud", "known toxic contaminant", "silica-generating task", "confined area", "long duration or repeated exposure"],
    controlStrategyNotes: ["Prefer elimination, substitution, enclosure, local exhaust, wet methods, process changes, and housekeeping before respirators."],
    verificationFocus: ["Task", "Material", "Visible emissions", "Ventilation", "Wet controls", "Housekeeping", "Respirator program", "Exposure monitoring"],
  },
  {
    keys: ["fire", "hot work", "welding", "cutting", "grinding", "flammable", "combustible", "explosion"],
    energySources: ["thermal_energy", "chemical_energy"],
    injuryMechanisms: ["fire_or_explosion", "arc_flash_or_burn", "inhalation_exposure"],
    accidentPathways: [
      "Ignition source contacts combustible or flammable material, vapor, dust, residue, or uncontrolled atmosphere.",
      "Hot work creates fire, explosion, burn, fume, or oxygen-displacement exposure without adequate isolation and monitoring.",
    ],
    lineOfFireFactors: ["ignition_source", "combustibles_nearby", "flammable_vapor", "poor_gas_testing", "no_fire_watch", "cylinder_or_fuel_source"],
    failureModes: ["no_hot_work_permit", "combustibles_not_removed_or_shielded", "no_fire_watch", "poor_ventilation", "no_post_work_inspection", "poor_cylinder_control"],
    evidenceNeeded: ["Document ignition source, combustibles, flammables, gas testing, permit, fire watch, extinguisher, ventilation, and post-work inspection."],
    severityAmplifiers: ["flammable atmosphere", "combustible dust", "confined space", "fuel gas cylinders", "nearby occupied area"],
    controlStrategyNotes: ["Prefer eliminating hot work, relocating work, isolating combustibles, gas testing, fire watch, and ventilation before administrative controls alone."],
    verificationFocus: ["Hot work permit", "Fire watch", "Combustible clearance", "Gas testing", "Extinguisher", "Ventilation", "Post-work inspection"],
  },
  {
    keys: ["lockout", "tagout", "loto", "hazardous energy", "stored energy", "de-energize"],
    energySources: ["stored_energy", "electrical_energy", "mechanical_motion", "pressure", "gravity", "thermal_energy"],
    injuryMechanisms: ["caught_in_or_between", "crush", "electrocution_or_shock", "chemical_burn", "struck_by", "amputation"],
    accidentPathways: [
      "Hazardous energy is not fully isolated, relieved, blocked, locked, tagged, and verified before service, maintenance, clearing, adjustment, or cleanup.",
      "Stored energy releases after workers enter the danger zone.",
    ],
    lineOfFireFactors: ["uncontrolled_energy", "stored_pressure", "gravity_load", "unexpected_startup", "group_lockout_gap", "unclear_task_scope"],
    failureModes: ["incomplete_isolation", "no_try_test", "missing_lock_or_tag", "stored_energy_not_relieved", "wrong_energy_source_identified", "production_mode_shortcut"],
    evidenceNeeded: ["Identify energy sources.", "Document isolation points, locks/tags, stored-energy control, blocking/bleeding, try/test verification, and release authorization."],
    severityAmplifiers: ["multiple energy sources", "gravity or suspended load", "hydraulic/pneumatic pressure", "automatic cycling", "multiple workers or contractors"],
    controlStrategyNotes: ["Prefer full de-energization, isolation, blocking, bleeding, lockout/tagout, and try/test verification before any work in the danger zone."],
    verificationFocus: ["Energy source list", "Isolation points", "Locks/tags", "Stored energy", "Try/test", "Affected employees", "Release authorization"],
  },
  {
    keys: ["ergonomic", "ergonomics", "lifting", "strain", "sprain", "repetition", "awkward posture"],
    energySources: ["ergonomic_force", "biomechanical_load", "mechanical_motion"],
    injuryMechanisms: ["overexertion", "sprain_strain"],
    accidentPathways: [
      "Worker experiences acute or cumulative musculoskeletal loading from force, repetition, awkward posture, vibration, reach, duration, or inadequate recovery.",
    ],
    lineOfFireFactors: ["high_force", "awkward_posture", "long_reach", "high_repetition", "heavy_load", "poor_recovery"],
    failureModes: ["poor_task_design", "excessive_weight", "no_mechanical_aid", "twisting_or_extended_reach", "insufficient_staffing", "training_only_control"],
    evidenceNeeded: ["Document load, frequency, posture, reach, duration, recovery period, mechanical aids, and worker feedback."],
    severityAmplifiers: ["high load weight", "frequent repetition", "sustained awkward posture", "vibration", "fatigue"],
    controlStrategyNotes: ["Prefer redesign, mechanical aids, lift assists, workstation changes, and material-flow changes before training-only controls."],
    verificationFocus: ["Load weight", "Frequency", "Posture", "Reach", "Duration", "Mechanical aid", "Worker feedback"],
  },
  {
    keys: ["heat", "cold", "temperature", "thermal", "heat stress", "cold stress"],
    energySources: ["environmental_stress", "thermal_energy"],
    injuryMechanisms: ["heat_illness", "cold_stress"],
    accidentPathways: [
      "Worker develops heat or cold illness due to environmental conditions, workload, clothing/PPE, acclimatization, hydration, wind/moisture, or poor recovery.",
    ],
    lineOfFireFactors: ["high_workload", "poor_acclimatization", "no_water_rest_shade", "ppe_heat_burden", "cold_wind_or_moisture", "symptoms_ignored"],
    failureModes: ["no_acclimatization_plan", "inadequate_work_rest_cycle", "poor_supervisor_monitoring", "no_emergency_response_plan", "no_recovery_area"],
    evidenceNeeded: ["Document temperature or weather conditions, workload, duration, PPE/clothing, acclimatization, water/rest/shade or warm-up access, symptoms, and emergency readiness."],
    severityAmplifiers: ["symptoms present", "high humidity or radiant heat", "heavy PPE", "new or unacclimatized worker", "remote work area"],
    controlStrategyNotes: ["Prefer schedule changes, mechanization, reduced workload, shade/cooling/warming, work/rest cycles, and symptom monitoring."],
    verificationFocus: ["Conditions", "Workload", "Break schedule", "Water/rest/shade or warm-up", "Acclimatization", "Symptoms", "Emergency response"],
  },
  {
    keys: ["ppe", "personal protective", "respirator", "glove", "eye protection", "hearing protection"],
    energySources: ["unknown"],
    injuryMechanisms: ["unknown"],
    accidentPathways: [
      "Worker remains exposed because PPE is absent, incorrect, damaged, poorly fitted, contaminated, or used as the only control where higher-level controls are feasible.",
    ],
    lineOfFireFactors: ["wrong_ppe", "poor_fit", "damaged_ppe", "no_hazard_assessment", "ppe_only_control"],
    failureModes: ["wrong_ppe_type", "no_hazard_assessment", "no_fit_testing", "poor_training", "no_replacement_schedule", "higher_level_controls_not_evaluated"],
    evidenceNeeded: ["Document hazard assessment, PPE type, condition, fit, training, task exposure, and higher-level controls considered."],
    severityAmplifiers: ["respiratory hazard", "chemical splash", "high noise", "impact hazard", "thermal exposure"],
    controlStrategyNotes: ["PPE is the last line of defense and should not replace feasible engineering or administrative controls."],
    verificationFocus: ["Hazard assessment", "PPE selection", "Fit", "Condition", "Training", "Replacement", "Higher-level controls"],
  },
  // NEW DOMAINS START HERE
  {
    keys: ["noise", "hearing", "db", "decibel", "sound", "auditory"],
    energySources: ["noise_vibration"],
    injuryMechanisms: ["noise_induced_hearing_loss"],
    accidentPathways: [
      "Worker is exposed to excessive noise levels without adequate engineering controls, administrative rotation, or properly fitted hearing protection, leading to cumulative hearing damage."
    ],
    lineOfFireFactors: ["excessive_noise_levels", "lack_of_hearing_protection", "inadequate_engineering_controls"],
    failureModes: ["no_noise_assessment", "hearing_protection_not_worn", "protection_inadequate_for_db_level"],
    evidenceNeeded: ["Document noise levels (db), task duration, worker exposure time, hearing protection used, and engineering controls present."],
    severityAmplifiers: ["high decibel level", "long exposure duration", "lack of hearing protection"],
    controlStrategyNotes: ["Prefer engineering controls (e.g., sound dampening, equipment isolation) and administrative rotation before reliance on hearing protection."],
    verificationFocus: ["Noise level (db)", "Exposure duration", "Hearing protection type/fit", "Engineering controls"],
  },
  {
    keys: ["crane", "hoist", "rigging", "suspended", "load", "hook", "sling", "lift"],
    energySources: ["mechanical_motion", "kinetic_energy", "gravity"],
    injuryMechanisms: ["struck_by", "crush"],
    accidentPathways: [
      "Suspended load falls due to rigging failure, crane malfunction, operator error, or environmental factors.",
      "Worker enters the line-of-fire of a moving or suspended load."
    ],
    lineOfFireFactors: ["under_suspended_load", "rigging_failure", "crane_instability", "unclear_load_path"],
    failureModes: ["improper_rigging", "overloaded_crane", "unstable_load", "damaged_sling", "unauthorized_entry_to_lift_zone"],
    evidenceNeeded: ["Document load weight vs. crane capacity, rigging method, sling condition, load path, and lift zone security."],
    severityAmplifiers: ["large load weight", "high lift height", "pedestrian proximity"],
    controlStrategyNotes: ["Prefer physical exclusion zones, engineered lift plans, and certified rigging before reliance on operator vigilance alone."],
    verificationFocus: ["Load weight", "Crane capacity", "Rigging condition", "Lift zone security", "Load path"],
  },
  {
    keys: ["material handling", "storage", "stacking", "load", "lift", "pallet"],
    energySources: ["mechanical_motion", "kinetic_energy", "gravity"],
    injuryMechanisms: ["crush", "overexertion", "struck_by"],
    accidentPathways: [
      "Improperly stacked materials collapse on workers.",
      "Manual handling of heavy loads causes overexertion.",
      "Materials fall during handling or storage."
    ],
    lineOfFireFactors: ["unstable_stack", "overloaded_shelf", "manual_handling_high_force", "improper_lifting_technique"],
    failureModes: ["improper_stacking", "overloaded_storage", "lack_of_mechanical_aids", "poor_housekeeping_in_storage"],
    evidenceNeeded: ["Document stack height, material stability, mechanical aids used, and lifting task specifics."],
    severityAmplifiers: ["heavy load", "unstable stack", "poor reach"],
    controlStrategyNotes: ["Prefer mechanical aids, engineered storage, reduced stack heights, and ergonomic handling before relying on manual lifting techniques."],
    verificationFocus: ["Stack stability", "Storage load limits", "Mechanical aids", "Lifting technique"],
  },
  {
    keys: ["slip", "trip", "housekeeping", "walking", "working surface", "floor", "aisle", "spill", "debris"],
    energySources: ["gravity", "kinetic_energy"],
    injuryMechanisms: ["fall_same_level", "fall_to_lower_level"],
    accidentPathways: [
      "Worker slips on floor surface (e.g., spill, poor traction).",
      "Worker trips on uneven surface, debris, tools, cables, or poorly designed aisleways."
    ],
    lineOfFireFactors: ["spill", "uneven_surface", "aisle_obstruction", "poor_lighting", "inadequate_traction"],
    failureModes: ["poor_housekeeping", "spill_not_cleaned", "missing_warning_sign", "damaged_floor", "aisle_blocked"],
    evidenceNeeded: ["Document floor condition, spills, debris, lighting, aisle obstruction, and traction indicators."],
    severityAmplifiers: ["hard floor surface", "sharp objects", "tripping hazard density"],
    controlStrategyNotes: ["Prefer effective housekeeping, spill containment, non-slip surfaces, and clear, unobstructed aisles before reliance on worker awareness."],
    verificationFocus: ["Floor surface", "Housekeeping", "Spills", "Aisle clearance", "Lighting"],
  },
  {
    keys: ["ladder", "scaffold", "fall", "elevation", "platform"],
    energySources: ["gravity", "kinetic_energy"],
    injuryMechanisms: ["fall_to_lower_level"],
    accidentPathways: [
      "Ladder slips, collapses, or is improperly angled, leading to a fall.",
      "Scaffold is missing components, improperly anchored, or overloaded, leading to fall or collapse."
    ],
    lineOfFireFactors: ["unprotected_edge", "unstable_ladder", "scaffold_instability", "improper_access"],
    failureModes: ["ladder_unsecured", "missing_scaffold_guardrail", "scaffold_overloaded", "lack_of_toe_boards", "incorrect_ladder_angle"],
    evidenceNeeded: ["Document ladder condition/angle/securing, scaffold component integrity/anchoring/loading, and access/egress."],
    severityAmplifiers: ["fall distance", "landing surface"],
    controlStrategyNotes: ["Prefer safe ladder angles, secured ladders, fully planked and guardrailed scaffolds, and proper scaffold tagging before fall protection alone."],
    verificationFocus: ["Ladder condition/angle", "Scaffold guardrails/planking", "Scaffold anchoring", "Loading"],
  },
  {
    keys: ["welding", "fume", "metal fume", "inhalation", "exposure", "breathe", "respiratory"],
    energySources: ["chemical_energy", "atmospheric_hazard"],
    injuryMechanisms: ["inhalation_exposure"],
    accidentPathways: [
      "Worker inhales metal fumes (e.g., manganese, chromium) during welding, leading to acute metal fume fever or chronic respiratory damage."
    ],
    lineOfFireFactors: ["insufficient_ventilation", "welding_in_confined_space", "poor_local_exhaust"],
    failureModes: ["no_local_exhaust", "incorrect_respirator", "no_fit_test", "inadequate_ventilation"],
    evidenceNeeded: ["Document task, contaminant, ventilation (local/general), respirator usage, fit test records, and exposure monitoring."],
    severityAmplifiers: ["confined space", "known toxic metals", "high welding intensity"],
    controlStrategyNotes: ["Prefer local exhaust ventilation, process changes, and engineering controls before reliance on respirators."],
    verificationFocus: ["Ventilation (local exhaust)", "Respirator fit", "Task exposure assessment"],
  },
  {
    keys: ["combustible", "dust", "explosion", "accumulation", "powder", "ignition"],
    energySources: ["chemical_energy", "atmospheric_hazard"],
    injuryMechanisms: ["fire_or_explosion", "inhalation_exposure"],
    accidentPathways: [
      "Combustible dust accumulates, is dispersed by an ignition source, and causes a secondary dust explosion.",
      "Inhalation of airborne dust causes respiratory illness."
    ],
    lineOfFireFactors: ["dust_accumulation", "ignition_source", "inadequate_housekeeping", "lack_of_dust_control"],
    failureModes: ["lack_of_dust_collection", "poor_housekeeping_routine", "ignition_source_near_dust", "inadequate_explosion_venting"],
    evidenceNeeded: ["Document dust accumulation, collection systems, ignition sources, housekeeping practices, and explosion protection."],
    severityAmplifiers: ["confined space", "large accumulation", "highly combustible material"],
    controlStrategyNotes: ["Prefer dust collection at source, stringent housekeeping, elimination of ignition sources, and explosion venting before PPE/mitigation."],
    verificationFocus: ["Dust accumulation", "Housekeeping", "Dust collection", "Ignition source control"],
  },
  {
    keys: ["ground control", "highwall", "roof", "rib", "collapse", "excavation", "rock fall"],
    energySources: ["gravity", "kinetic_energy"],
    injuryMechanisms: ["crush", "engulfment", "struck_by"],
    accidentPathways: [
      "Unstable rock, earth, highwall, roof, or rib collapses onto workers.",
      "Failure of ground control measures (e.g., bolts, mesh, support) leads to unexpected ground movement."
    ],
    lineOfFireFactors: ["unsupported_ground", "inadequate_support", "geologic_hazard", "vibration", "unauthorized_entry"],
    failureModes: ["failure_of_support_system", "lack_of_scaling", "inadequate_ground_mapping", "geologic_stress", "vibration_triggers"],
    evidenceNeeded: ["Document ground conditions, support system integrity, scaling practices, geologic hazards, and monitoring data."],
    severityAmplifiers: ["deep underground", "weak geologic material", "large unsupported area"],
    controlStrategyNotes: ["Prefer ground support systems, scaling, hazard mapping, and restricted entry before reliance on observational techniques."],
    verificationFocus: ["Support system integrity", "Scaling", "Geologic hazards", "Entry restrictions"],
  },
  {
    keys: ["haulage", "mining road", "truck", "haul truck", "road", "vehicle", "mine"],
    energySources: ["mechanical_motion", "kinetic_energy", "gravity"],
    injuryMechanisms: ["struck_by", "crush", "caught_in_or_between"],
    accidentPathways: [
      "Haul truck collides with other vehicle, pedestrian, or infrastructure due to poor traffic control, road condition, or blind spots.",
      "Truck rolls over due to grade, surface condition, or berm failure."
    ],
    lineOfFireFactors: ["pedestrian_equipment_interaction", "poor_road_condition", "limited_visibility", "unstable_berm", "steep_grade"],
    failureModes: ["no_traffic_separation", "poor_road_maintenance", "inadequate_berm", "driver_visibility_blind_spot", "ineffective_communication"],
    evidenceNeeded: ["Document traffic rules, road width/grade/condition, berm integrity, visibility, and pedestrian interaction controls."],
    severityAmplifiers: ["large truck size", "steep grade", "limited visibility", "high traffic density"],
    controlStrategyNotes: ["Prefer segregated traffic, engineered road designs, berms, traffic management systems, and operator training before reliance on visibility alone."],
    verificationFocus: ["Traffic management", "Road maintenance", "Berm integrity", "Visibility/signage"],
  },
  {
    keys: ["pressure", "compressed air", "hydraulic", "hose", "valve", "high pressure"],
    energySources: ["pressure", "mechanical_motion"],
    injuryMechanisms: ["struck_by", "crush", "laceration", "chemical_burn"],
    accidentPathways: [
      "High-pressure fluid or air releases (e.g., hose rupture, valve failure, improper coupling) striking or injecting the worker.",
      "Sudden release of hydraulic energy moves unexpected mechanical components."
    ],
    lineOfFireFactors: ["high_pressure_zone", "damaged_hose", "unprotected_coupling", "unexpected_release"],
    failureModes: ["hose_failure", "improper_connection", "no_relief_valve", "no_pressure_verification", "damaged_fitting"],
    evidenceNeeded: ["Document system pressure, hose condition, fittings/couplings, relief valves, and pressure control procedures."],
    severityAmplifiers: ["very high pressure", "high flow rate", "toxic or hot fluid"],
    controlStrategyNotes: ["Prefer pressure reduction, secondary containment, hose restraints, proper fittings, relief valves, and pressure verification before maintenance."],
    verificationFocus: ["Pressure level", "Hose/fitting condition", "Relief valves", "Control procedures"],
  },
];

export class SafeScopeMechanismIntelligenceService {
  evaluate(input: MechanismIntelligenceInput): MechanismIntelligenceOutput {
    const classification = input.classification || "Unclassified";
    const normalizedText = [
      classification,
      input.observationText || "",
      ...(input.expertObservations?.relatedHazardObservations || []),
      ...(input.expertObservations?.relatedHealthObservations || []),
      ...(input.expertObservations?.likelyExposurePathways || []),
      ...(input.expertObservations?.likelyFailureModes || []),
    ]
      .join(" ")
      .toLowerCase();

    const selectedDomains = MECHANISM_DOMAINS.filter((domain) =>
      domain.keys.some((key) => normalizedText.includes(key.toLowerCase())),
    );

    if (!selectedDomains.length) {
      selectedDomains.push({
        keys: ["general"],
        energySources: ["mechanical_motion", "kinetic_energy"],
        injuryMechanisms: ["unknown"],
        accidentPathways: [
          "A worker is exposed to an uncontrolled energy source, hazardous condition, or failed control during the task.",
        ],
        lineOfFireFactors: [
          "unclear_exposure_pathway",
          "unknown_energy_source",
          "incomplete_task_context",
        ],
        failureModes: [
          "missing_or_ineffective_control",
          "incomplete_verification",
          "unclear_worker_exposure",
        ],
        evidenceNeeded: [
          "Clarify task, worker exposure, energy source, controls present, and verification evidence.",
        ],
        severityAmplifiers: [
          "unknown exposure duration",
          "unclear control effectiveness",
          "incomplete evidence",
        ],
        controlStrategyNotes: [
          "Apply the hierarchy of controls and require qualified review before finalizing.",
        ],
        verificationFocus: [
          "Task",
          "Exposure pathway",
          "Energy source",
          "Controls present",
          "Verification evidence",
        ],
      });
    }

    const evidenceNeeded = unique([
      ...selectedDomains.flatMap((domain) => domain.evidenceNeeded),
      ...(input.evidenceContract?.missingInputs || []).map(
        (item: string) => `Clarify missing evidence: ${item}`,
      ),
    ]);

    const uncertaintyFlags = unique([
      ...(input.evidenceContract?.reviewTriggers || []),
      ...(input.evidenceContract?.unsupportedClaims || []),
      ...(input.expertObservations?.humanReviewTriggers || []),
      !input.evidenceContract || Object.keys(input.evidenceContract).length === 0
        ? "Evidence contract is missing or incomplete."
        : "",
      input.evidenceContract?.missingInputs?.length
        ? "Critical context or evidence is incomplete."
        : "",
    ]);

    const isHighRisk =
      input.risk?.riskBand === "High" ||
      input.risk?.riskBand === "Critical" ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    return {
      engine: "safescope_mechanism_intelligence",
      mode: "deterministic_offline",
      classification,
      primaryEnergySources: unique(
        selectedDomains.flatMap((domain) => domain.energySources),
      ),
      injuryMechanisms: unique(
        selectedDomains.flatMap((domain) => domain.injuryMechanisms),
      ),
      credibleAccidentPathways: unique(
        selectedDomains.flatMap((domain) => domain.accidentPathways),
      ),
      lineOfFireFactors: unique(
        selectedDomains.flatMap((domain) => domain.lineOfFireFactors),
      ),
      failureModes: unique(selectedDomains.flatMap((domain) => domain.failureModes)),
      evidenceNeeded,
      severityAmplifiers: unique(
        selectedDomains.flatMap((domain) => domain.severityAmplifiers),
      ),
      controlStrategyNotes: unique(
        selectedDomains.flatMap((domain) => domain.controlStrategyNotes),
      ),
      verificationFocus: unique(
        selectedDomains.flatMap((domain) => domain.verificationFocus),
      ),
      uncertaintyFlags,
      requiresQualifiedReview:
        Boolean(isHighRisk) ||
        Boolean(uncertaintyFlags.length) ||
        Boolean(input.expertObservations?.humanReviewTriggers?.length),
      canInventCitations: false,
      canOverrideStandards: false,
      canReduceHumanReview: false,
      sourceBoundary:
        "SafeScope mechanism intelligence explains credible injury pathways, energy transfer, exposure mechanisms, and verification needs. It cannot invent citations, override OSHA/MSHA requirements, reduce required human review, or finalize compliance decisions.",
    };
  }
}
