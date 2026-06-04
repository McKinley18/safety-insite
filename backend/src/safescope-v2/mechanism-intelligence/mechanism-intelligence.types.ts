export type SafeScopeEnergySource =
  | "mechanical_motion"
  | "stored_energy"
  | "electrical_energy"
  | "gravity"
  | "thermal_energy"
  | "chemical_energy"
  | "pressure"
  | "kinetic_energy"
  | "atmospheric_hazard"
  | "biological_exposure"
  | "noise_vibration"
  | "ergonomic_force"
  | "biomechanical_load"
  | "radiation"
  | "environmental_stress"
  | "unknown";

export type SafeScopeInjuryMechanism =
  | "caught_in_or_between"
  | "struck_by"
  | "struck_against"
  | "fall_to_lower_level"
  | "fall_same_level"
  | "electrocution_or_shock"
  | "arc_flash_or_burn"
  | "chemical_burn"
  | "inhalation_exposure"
  | "skin_absorption"
  | "engulfment"
  | "asphyxiation"
  | "crush"
  | "amputation"
  | "laceration"
  | "overexertion"
  | "sprain_strain"
  | "heat_illness"
  | "cold_stress"
  | "fire_or_explosion"
  | "noise_induced_hearing_loss"
  | "silica_or_dust_disease"
  | "unknown";

export type MechanismIntelligenceInput = {
  classification: string;
  observationText?: string;
  risk?: any;
  suggestedStandards?: any[];
  evidenceContract?: any;
  expertObservations?: any;
  knowledgeMatches?: any[];
};

export type MechanismIntelligenceOutput = {
  engine: "safescope_mechanism_intelligence";
  mode: "deterministic_offline";
  classification: string;
  primaryEnergySources: SafeScopeEnergySource[];
  injuryMechanisms: SafeScopeInjuryMechanism[];
  credibleAccidentPathways: string[];
  lineOfFireFactors: string[];
  failureModes: string[];
  evidenceNeeded: string[];
  severityAmplifiers: string[];
  controlStrategyNotes: string[];
  verificationFocus: string[];
  uncertaintyFlags: string[];
  requiresQualifiedReview: boolean;
  canInventCitations: false;
  canOverrideStandards: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
