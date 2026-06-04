export interface ExposureIntelligenceInput {
  classification: string;
  observationText: string;
  contaminantOrAgent?: string;
  concentrationValue?: number;
  concentrationUnit?: string;
  durationMinutes?: number;
  shiftLengthHours?: number;
  frequency?: string;
  taskPattern?: string;
  numberOfExposedEmployees?: number;
  controlStatus?: string;
  ppeStatus?: string;
  samplingBasis?: 'personal sample' | 'area sample' | 'direct reading' | 'qualitative observation' | 'historical data' | 'unknown';
}

export interface ExposureIntelligenceOutput {
  exposureRoute: 'inhalation' | 'dermal' | 'ingestion' | 'injection' | 'noise' | 'vibration' | 'heat/cold' | 'radiation' | 'mixed' | 'unknown';
  estimatedTwa?: number;
  estimatedDosePercent?: number;
  calculationPossible: boolean;
  calculationLimitations: string[];
  missingExposureInputs: string[];
  exposureUncertainty: 'low' | 'medium' | 'high';
  healthSeverityConcerns: string[];
  recommendedSamplingOrVerification: string[];
  requiresIndustrialHygieneReview: boolean;
  sourceBoundary: string;
  canInventExposureLimit: false;
  canDeclareComplianceWithoutSampling: false;
  canReduceHumanReview: false;
}
