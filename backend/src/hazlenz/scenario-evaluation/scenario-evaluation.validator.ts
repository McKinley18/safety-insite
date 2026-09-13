import { EvaluatedScenario } from './scenario-evaluation.types';

export class ScenarioEvaluationValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(evaluated: EvaluatedScenario[]): string[] {
    const errors: string[] = [];
    
    for (const scenario of evaluated) {
        if (!scenario.scenarioId) errors.push('Missing scenarioId');
        
        const scenarioString = JSON.stringify(scenario).toLowerCase();
        for (const phrase of this.prohibitedPhrases) {
            if (scenarioString.includes(phrase)) {
                errors.push(`Prohibited language detected: ${phrase}`);
            }
        }
    }
    
    return errors;
  }
}
