import { EvidenceWeightingResult } from './field-evidence-weighting.types';

export class FieldEvidenceWeightingValidator {
    static validate(result: EvidenceWeightingResult): string[] {
        const errors: string[] = [];
        if (result.evidenceStrengthScore === undefined) errors.push('Missing evidenceStrengthScore');
        if (result.finalEvidenceConfidence === undefined) errors.push('Missing finalEvidenceConfidence');
        if (result.evidenceGrade === undefined) errors.push('Missing evidenceGrade');
        if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
        return errors;
    }
}
