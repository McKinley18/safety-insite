export type SafeScopeCausalChainConfidence = 'low' | 'medium' | 'high';

export type SafeScopeCausalChainInput = {
  classification: string;
  observationText: string;
  risk?: any;
  mechanismIntelligence?: any;
  exposureIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
  suggestedStandards?: any[];
};

export type SafeScopeCausalChainOutput = {
  engine: 'safescope_causal_chain';
  mode: 'deterministic_offline';
  classification: string;
  hazardCondition: string;
  exposedPersonOrTask: string;
  initiatingEvents: string[];
  energyOrExposureTransfer: string[];
  injuryOrIllnessMechanisms: string[];
  likelyConsequences: string[];
  failedOrMissingControls: string[];
  causalPathways: string[];
  criticalBreakPoints: string[];
  evidenceNeededToConfirmChain: string[];
  correctiveControlTargets: string[];
  uncertaintyFlags: string[];
  confidence: SafeScopeCausalChainConfidence;
  requiresQualifiedReview: boolean;
  canInventCausation: false;
  canDetermineRootCauseWithoutEvidence: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
