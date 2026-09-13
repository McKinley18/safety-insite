import { AuditReadyReasoningTraceResult } from './audit-ready-reasoning-trace.types';

export class AuditReadyReasoningTraceValidator {
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

  static validate(result: AuditReadyReasoningTraceResult): string[] {
    const errors: string[] = [];
    
    if (!result.traceId) errors.push('Missing traceId');
    if (!result.traceVersion) errors.push('Missing traceVersion');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    if (result.reviewerChecklist === undefined) errors.push('Missing reviewerChecklist');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
