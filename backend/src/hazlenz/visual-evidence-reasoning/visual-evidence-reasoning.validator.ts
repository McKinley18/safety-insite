import { VisualEvidenceReasoningResult } from './visual-evidence-reasoning.types';

export class VisualEvidenceReasoningValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation",
    "final legal compliance",
    "legal determination",
    "definitive violation"
  ];

  static validate(result: VisualEvidenceReasoningResult): string[] {
    const errors: string[] = [];
    
    if (result.version !== 'visual_evidence_reasoning_v1') errors.push('Invalid version');
    if (!result.evidencePresence) errors.push('Missing evidencePresence');
    if (!result.visualSupportLevel) errors.push('Missing visualSupportLevel');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    if (result.photoEvidenceScore === undefined) errors.push('Missing photoEvidenceScore');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
