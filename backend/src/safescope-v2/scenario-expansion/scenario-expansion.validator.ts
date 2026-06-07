import { ScenarioRecord } from './scenario-expansion.types';

export class ScenarioExpansionValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validateRecord(record: ScenarioRecord): string[] {
    const errors: string[] = [];
    if (!record.scenarioId) errors.push('Missing scenarioId');
    if (!record.domainId) errors.push('Missing domainId');
    
    const recordString = JSON.stringify(record).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
      if (recordString.includes(phrase)) {
        errors.push(`Prohibited language detected: ${phrase}`);
      }
    }
    
    return errors;
  }
}
