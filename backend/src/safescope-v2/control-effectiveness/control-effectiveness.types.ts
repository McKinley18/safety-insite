export type SafeScopeControlEffectivenessRating =
  | 'effective'
  | 'partially_effective'
  | 'interim_only'
  | 'ineffective'
  | 'insufficient_information';

export type SafeScopeControlEffectivenessInput = {
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

export type SafeScopeControlEffectivenessOutput = {
  engine: 'safescope_control_effectiveness';
  mode: 'deterministic_offline';
  classification: string;
  effectivenessRating: SafeScopeControlEffectivenessRating;
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
