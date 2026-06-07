import { Injectable } from '@nestjs/common';
import { RetrievalOutput } from './approved-knowledge-retrieval-output-v1.types';

@Injectable()
export class ApprovedKnowledgeRetrievalOutputV1Validator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(output: RetrievalOutput): string[] {
    const errors: string[] = [];

    if (!output.version) errors.push('Missing version');
    if (!output.advisoryBoundaries || output.advisoryBoundaries.length === 0) {
      errors.push('Missing advisory boundaries');
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
