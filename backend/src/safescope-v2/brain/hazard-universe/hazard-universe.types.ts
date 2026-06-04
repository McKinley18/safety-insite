export type SafeScopeHazardUniversePriority =
  | 'core'
  | 'high'
  | 'medium'
  | 'future';

export type SafeScopeHazardUniverseCoverageStatus =
  | 'covered'
  | 'partial'
  | 'thin'
  | 'gap'
  | 'not_started';

export type SafeScopeHazardUniverseRecord = {
  hazardUniverseId: string;
  label: string;
  domain: string;
  priority: SafeScopeHazardUniversePriority;
  expectedMechanisms: string[];
  expectedRegulatoryFamilies: string[];
  expectedControlThemes: string[];
  expectedEvidenceThemes: string[];
  typicalScenarioExamples: string[];
  notes: string[];
};
