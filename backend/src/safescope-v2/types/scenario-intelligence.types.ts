export type ScenarioIntelligence = {
  scenarioFamilyId: string;
  hazardCategory: string; // Added this
  equipment: string;
  task: string;
  unsafeCondition: string;
  operationalState: string;
  energySource: string;
  mechanismOfInjury: string;
  exposedPersonActivity: string;
  missingOrFailedControls: string[];
  hierarchyLevel: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe' | 'unknown';
  candidateStandardFamily: string;
  evidenceGaps: string[];
  confidenceSignals: {
    score: number;
    reasoning: string[];
  };
  qualifiedReviewRequired: boolean;
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
};
