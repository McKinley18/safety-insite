import { RealImageAnalysisResult } from './real-image-analysis.types';

export class RealImageAnalysisValidator {
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

  static validate(result: RealImageAnalysisResult): string[] {
    const errors: string[] = [];
    
    if (result.version !== "real_image_analysis_v1") errors.push('Invalid version');
    if (result.imageCount === undefined) errors.push('Missing imageCount');
    if (!result.visualSignals) errors.push('Missing visualSignals');
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
