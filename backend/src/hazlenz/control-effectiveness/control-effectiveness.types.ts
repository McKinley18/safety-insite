export type HazLenzControlEffectivenessRating =
  | 'effective'
  | 'partially_effective'
  | 'interim_only'
  | 'ineffective'
  | 'insufficient_information';

export type HazLenzControlEffectivenessInput = {
  classification: string;
  observationText: string;
  existingControls?: string[];
  proposedControls?: string[];
  correctiveActions?: any[];
  risk?: any;
  mechanismIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
  causalChain?: any;
};

export type HazLenzControlEffectivenessOutput = {
  engine: 'safescope_control_effectiveness';
  mode: 'deterministic_offline';
  classification: string;
  effectivenessRating: HazLenzControlEffectivenessRating;
  controlsIdentified: string[];
  controlsMissing: string[];
  pathwayInterruptions: string[];
  remainingExposurePathways: string[];
  hierarchyAssessment: string[];
  interimControlsNeeded: string[];
  verificationNeeded: string[];
  recurrencePreventionNotes: string[];
  closureReadinessBlockers: string[];
  requiresQualifiedReview: boolean;
  canAssumeControlEffectiveness: false;
  canCloseWithoutVerification: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
