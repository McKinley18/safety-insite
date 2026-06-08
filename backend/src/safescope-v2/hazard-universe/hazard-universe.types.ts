export type HazardType = 
  | 'acute_safety' 
  | 'chronic_health' 
  | 'mixed' 
  | 'emergency_readiness';

export type HazardFamily = 
  | 'machine_guarding'
  | 'lockout_tagout'
  | 'electrical'
  | 'fall_protection'
  | 'walking_working_surfaces'
  | 'slips_trips_falls_housekeeping'
  | 'mobile_equipment'
  | 'powered_haulage'
  | 'traffic_control'
  | 'material_handling_storage'
  | 'cranes_hoists_rigging'
  | 'suspended_loads'
  | 'excavation_trenching_ground_control'
  | 'confined_space'
  | 'fire_explosion'
  | 'hot_work'
  | 'combustible_dust'
  | 'pressure_systems'
  | 'compressed_gas'
  | 'hydraulic_pneumatic_energy'
  | 'chemical_transfer'
  | 'emergency_egress'
  | 'emergency_equipment'
  | 'personal_protective_equipment'
  | 'silica_respirable_dust'
  | 'welding_fumes'
  | 'noise_exposure'
  | 'heat_stress'
  | 'cold_stress'
  | 'chemical_inhalation_contact'
  | 'respiratory_protection'
  | 'ergonomic_strain'
  | 'biological_exposure'
  | 'illumination_visibility'
  | 'ventilation_air_quality'
  | 'contractor_coordination'
  | 'training_procedure_supervision'
  | 'corrective_action_verification_failure'
  | 'unknown';

export interface HazardDefinition {
  hazardFamily: HazardFamily;
  displayName: string;
  hazardType: HazardType;
  hazardSubtypes: string[];
  mechanismOfHarm: string[];
  hazardousEnergyOrAgent: string[];
  exposurePathways: string[];
  commonFieldIndicators: string[];
  commonControlFailures: string[];
  preferredControlFamilies: string[];
  weakOrInsufficientControls: string[];
  evidenceNeeded: string[];
  relatedJurisdictions: string[];
  relatedStandardFamilies: string[];
  correctiveActionPrinciples: string[];
  verificationEvidence: string[];
  mandatoryReviewTriggers: string[];
  antiRegurgitationGuidance: string;
}
