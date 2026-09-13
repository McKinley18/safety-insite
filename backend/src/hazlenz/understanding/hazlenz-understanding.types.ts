import type { HazLenzScenarioUnderstandingResult } from './scenario-understanding.service';

export type HazLenzJurisdiction =
  | 'msha'
  | 'osha_general_industry'
  | 'osha_construction'
  | 'unclear';

export type HazLenzTaskType =
  | 'operation'
  | 'inspection'
  | 'cleanup'
  | 'maintenance'
  | 'servicing'
  | 'travel'
  | 'transport'
  | 'emergency_response'
  | 'unknown';

export type HazLenzExposureProximity =
  | 'direct_contact'
  | 'within_reach'
  | 'nearby'
  | 'adjacent'
  | 'not_established'
  | 'unknown';

export type HazLenzExposureFrequency =
  | 'rare'
  | 'occasional'
  | 'frequent'
  | 'continuous'
  | 'unknown';

export type HazLenzEnergyType =
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

export type HazLenzControlHierarchyLevel =
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

export type HazLenzUnderstandingConfidence = {
  score: number;
  reasons: string[];
};

export type HazLenzUnderstandingJurisdiction = {
  detected: HazLenzJurisdiction;
  evidence: string[];
  needsConfirmation: boolean;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingEquipment = {
  category: string;
  specificEquipment: string;
  component: string;
  motion: string;
  operationalState: string;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingTask = {
  activity: string;
  taskType: HazLenzTaskType;
  workerRole: string;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingExposure = {
  workerExposed: boolean | 'unclear';
  proximity: HazLenzExposureProximity;
  exposurePathway: string;
  frequency: HazLenzExposureFrequency;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingEnergy = {
  sources: HazLenzEnergyType[];
  primaryEnergySource: HazLenzEnergyType;
  energyTransferPath: string;
  uncontrolledEnergyLikely: boolean;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingControls = {
  existingControls: string[];
  failedControls: string[];
  missingControls: string[];
  strongestControlLevel: HazLenzControlHierarchyLevel;
  confidence: HazLenzUnderstandingConfidence;
};

export type HazLenzUnderstandingMechanismCandidate = {
  mechanism: string;
  confidence: number;
  reasons: string[];
  competingMechanisms: string[];
};

export type HazLenzUnderstanding = {
  engine: 'safescope_understanding_engine';
  version: '0.1.0';
  rawText: string;
  normalizedText: string;
  jurisdiction: HazLenzUnderstandingJurisdiction;
  equipment: HazLenzUnderstandingEquipment;
  task: HazLenzUnderstandingTask;
  exposure: HazLenzUnderstandingExposure;
  energy: HazLenzUnderstandingEnergy;
  controls: HazLenzUnderstandingControls;
  mechanismCandidates: HazLenzUnderstandingMechanismCandidate[];
  scenarioUnderstanding?: HazLenzScenarioUnderstandingResult;
  evidenceGaps: string[];
  trace: string[];
  advisoryGuardrails: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    requiresQualifiedReview: true;
  };
};
