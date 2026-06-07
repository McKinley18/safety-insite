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
