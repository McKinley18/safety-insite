export interface HazardDecomposition {
  hazardId: string;
  domainId: string;
  hazardFamily: string;
  scenarioFamily?: string;
  mechanism?: string;
  observationFragment: string;
  supportingSignals: string[];
  confidence: number;
  possibleOverlapWith: string[];
  requiresHumanReview: boolean;
  evidenceGaps: string[];
  reviewerQuestions: string[];
  conditionState?: 'ACTIVE' | 'UNKNOWN' | 'CONTRADICTORY' | 'SAFE_VERIFIED' | 'HISTORICAL' | 'INTERMITTENT' | 'PLANNED_FUTURE';
  temporalEvidence?: string[];
  currentCondition?: string;
  correctionStatus?: 'not_stated' | 'planned' | 'reported' | 'verified';
}

export interface MultiHazardDecompositionResult {
  version: string;
  originalObservation: string;
  isMultiHazard: boolean;
  hazardCount: number;
  primaryHazard?: HazardDecomposition;
  hazards: HazardDecomposition[];
  decompositionConfidence: number;
  routingNotes: string[];
  evidenceGaps: string[];
  reviewerQuestions: string[];
  advisoryBoundary: string;
}
