export type HazLenzHazardUniversePriority =
  | 'core'
  | 'high'
  | 'medium'
  | 'future';

export type HazLenzHazardUniverseCoverageStatus =
  | 'covered'
  | 'partial'
  | 'thin'
  | 'gap'
  | 'not_started';

export type HazLenzHazardUniverseRecord = {
  hazardUniverseId: string;
  label: string;
  domain: string;
  priority: HazLenzHazardUniversePriority;
  expectedMechanisms: string[];
  expectedRegulatoryFamilies: string[];
  expectedControlThemes: string[];
  expectedEvidenceThemes: string[];
  typicalScenarioExamples: string[];
  notes: string[];
};
