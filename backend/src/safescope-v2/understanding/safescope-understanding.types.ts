export type SafeScopeJurisdiction =
  | 'msha'
  | 'osha_general_industry'
  | 'osha_construction'
  | 'unclear';

export type SafeScopeTaskType =
  | 'operation'
  | 'inspection'
  | 'cleanup'
  | 'maintenance'
  | 'servicing'
  | 'travel'
  | 'transport'
  | 'emergency_response'
  | 'unknown';

export type SafeScopeExposureProximity =
  | 'direct_contact'
  | 'within_reach'
  | 'nearby'
  | 'adjacent'
  | 'not_established'
  | 'unknown';

export type SafeScopeExposureFrequency =
  | 'rare'
  | 'occasional'
  | 'frequent'
  | 'continuous'
  | 'unknown';

export type SafeScopeEnergyType =
  | 'mechanical_rotation'
  | 'mechanical_motion'
  | 'electrical'
  | 'gravity'
  | 'mobile_equipment_kinetic'
  | 'stored_energy'
  | 'hydraulic'
  | 'pneumatic'
  | 'thermal_fire'
  | 'chemical'
  | 'soil_collapse'
  | 'unknown';

export type SafeScopeControlHierarchyLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'guarding_barrier'
  | 'energy_isolation'
  | 'administrative'
  | 'warning'
  | 'ppe'
  | 'verification'
  | 'unknown';

export type SafeScopeUnderstandingConfidence = {
  score: number;
  reasons: string[];
};

export type SafeScopeUnderstandingJurisdiction = {
  detected: SafeScopeJurisdiction;
  evidence: string[];
  needsConfirmation: boolean;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingEquipment = {
  category: string;
  specificEquipment: string;
  component: string;
  motion: string;
  operationalState: string;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingTask = {
  activity: string;
  taskType: SafeScopeTaskType;
  workerRole: string;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingExposure = {
  workerExposed: boolean | 'unclear';
  proximity: SafeScopeExposureProximity;
  exposurePathway: string;
  frequency: SafeScopeExposureFrequency;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingEnergy = {
  sources: SafeScopeEnergyType[];
  primaryEnergySource: SafeScopeEnergyType;
  energyTransferPath: string;
  uncontrolledEnergyLikely: boolean;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingControls = {
  existingControls: string[];
  failedControls: string[];
  missingControls: string[];
  strongestControlLevel: SafeScopeControlHierarchyLevel;
  confidence: SafeScopeUnderstandingConfidence;
};

export type SafeScopeUnderstandingMechanismCandidate = {
  mechanism: string;
  confidence: number;
  reasons: string[];
  competingMechanisms: string[];
};

export type SafeScopeUnderstanding = {
  engine: 'safescope_understanding_engine';
  version: '0.1.0';
  rawText: string;
  normalizedText: string;
  jurisdiction: SafeScopeUnderstandingJurisdiction;
  equipment: SafeScopeUnderstandingEquipment;
  task: SafeScopeUnderstandingTask;
  exposure: SafeScopeUnderstandingExposure;
  energy: SafeScopeUnderstandingEnergy;
  controls: SafeScopeUnderstandingControls;
  mechanismCandidates: SafeScopeUnderstandingMechanismCandidate[];
  evidenceGaps: string[];
  trace: string[];
  advisoryGuardrails: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    requiresQualifiedReview: true;
  };
};
