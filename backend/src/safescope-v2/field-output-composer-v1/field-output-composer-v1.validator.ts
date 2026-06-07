import { FieldOutputV1 } from './field-output-composer-v1.types';

export class FieldOutputComposerV1Validator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(output: FieldOutputV1): string[] {
    const errors: string[] = [];

    if (!output.version) errors.push('Missing version');
    if (!output.advisoryBoundaries || output.advisoryBoundaries.length === 0) {
      errors.push('Missing advisory boundaries');
    }
    if (!output.cannotDeclareViolation || !output.cannotCreateCitation) {
      errors.push('Guardrails missing');
    }

    const outputString = JSON.stringify(output).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
      if (outputString.includes(phrase)) {
        errors.push(`Prohibited language detected: ${phrase}`);
      }
    }

    return errors;
  }
}
