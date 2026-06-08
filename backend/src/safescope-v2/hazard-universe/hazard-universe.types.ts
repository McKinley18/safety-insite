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
  | 'cranes_rigging_suspended_loads'
  | 'excavation_trenching_ground_control'
  | 'confined_space'
  | 'hazcom_chemical_exposure'
  | 'respiratory_dust_fume_exposure'
  | 'noise_hearing_conservation'
  | 'heat_cold_stress'
  | 'fire_prevention_hot_work'
  | 'combustible_dust'
  | 'emergency_egress_response'
  | 'ppe'
  | 'ergonomics'
  | 'pressure_hydraulic_pneumatic_energy'
  | 'contractor_coordination'
  | 'training_procedure_supervision'
  | 'corrective_action_verification_failure'
  | 'unknown';

export interface HazardDefinition {
  hazardFamily: HazardFamily;
  hazardSubtypes: string[];
  mechanismOfHarm: string[];
  hazardousEnergyOrAgent: string[];
  exposurePathways: string[];
  commonControlFailures: string[];
  preferredControlFamilies: string[];
  weakOrInsufficientControls: string[];
  evidenceRequired: string[];
  relatedJurisdictions: string[];
  relatedStandardFamilies: string[];
  correctiveActionPrinciples: string[];
  verificationEvidence: string[];
  humanReviewTriggers: string[];
}
