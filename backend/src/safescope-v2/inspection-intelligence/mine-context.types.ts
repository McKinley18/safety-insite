export type MineType =
  | 'surface_metal_nonmetal'
  | 'underground_metal_nonmetal'
  | 'surface_coal'
  | 'underground_coal'
  | 'unclear_mine'
  | 'not_mine';

export type MineContextAssessment = {
  detected: boolean;
  mineType: MineType;
  confidence: 'low' | 'moderate' | 'high';
  matchedSignals: string[];
  reasons: string[];
  preferredCfrParts: string[];
  evidenceQuestions: string[];
  citationLimitations: string[];
  contractorContext: boolean;
};
