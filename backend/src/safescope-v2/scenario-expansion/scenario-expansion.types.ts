export interface ScenarioRecord {
  scenarioId: string;
  domainId: string;
  scenarioFamily: string;
  hazardFamily: string;
  plainLanguageObservation: string;
  equipmentOrEnvironment: string;
  taskContext: string;
  energyOrHazardSource: string;
  mechanismOfHarm: string;
  exposurePattern: string;
  likelyControlsMissing: string[];
  evidenceSignals: string[];
  evidenceGaps: string[];
  supervisorQuestions: string[];
  immediateActions: string[];
  durableControls: string[];
  knownFalsePositiveRisks: string[];
  advisoryBoundaryNote: string;
}
