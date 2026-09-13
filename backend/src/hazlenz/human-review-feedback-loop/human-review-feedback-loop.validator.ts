import { HumanReviewFeedbackResult } from './human-review-feedback-loop.types';

export class HumanReviewFeedbackLoopValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(result: HumanReviewFeedbackResult): string[] {
    const errors: string[] = [];
    
    if (!result.feedbackId) errors.push('Missing feedbackId');
    if (!result.learningDisposition) errors.push('Missing learningDisposition');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
