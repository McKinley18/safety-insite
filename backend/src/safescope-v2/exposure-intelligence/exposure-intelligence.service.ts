import { Injectable } from '@nestjs/common';
import { ExposureIntelligenceInput, ExposureIntelligenceOutput } from './exposure-intelligence.types';

@Injectable()
export class ExposureIntelligenceService {
  evaluate(input: ExposureIntelligenceInput): ExposureIntelligenceOutput {
    const missingInputs: string[] = [];
    if (!input.contaminantOrAgent) missingInputs.push("contaminant/agent");
    if (input.concentrationValue === undefined) missingInputs.push("concentration value");
    if (!input.durationMinutes) missingInputs.push("duration");

    const calculationPossible = missingInputs.length === 0 && input.samplingBasis !== 'qualitative observation';
    
    // Deterministic formula for TWA: (C1*T1 + C2*T2) / TotalTime
    // Here simplifying to: C * (T/Shift)
    let estimatedTwa: number | undefined;
    if (calculationPossible && input.concentrationValue && input.durationMinutes && input.shiftLengthHours) {
        estimatedTwa = (input.concentrationValue * input.durationMinutes) / (input.shiftLengthHours * 60);
    }

    return {
      exposureRoute: this.determineRoute(input.classification, input.observationText),
      calculationPossible,
      calculationLimitations: calculationPossible ? [] : ["Missing inputs or qualitative data only"],
      missingExposureInputs: missingInputs,
      exposureUncertainty: calculationPossible ? 'medium' : 'high',
      healthSeverityConcerns: ["Monitor for acute symptoms and chronic exposure risks."],
      recommendedSamplingOrVerification: ["Perform quantitative industrial hygiene sampling."],
      requiresIndustrialHygieneReview: true,
      estimatedTwa,
      sourceBoundary: "SafeScope exposure-dose intelligence",
      canInventExposureLimit: false,
      canDeclareComplianceWithoutSampling: false,
      canReduceHumanReview: false,
    };
  }

  private determineRoute(classification: string, observationText: string): ExposureIntelligenceOutput['exposureRoute'] {
    const combined = (classification + " " + observationText).toLowerCase();
    if (combined.includes('noise')) return 'noise';
    if (combined.includes('welding') || combined.includes('dust') || combined.includes('fume')) return 'inhalation';
    return 'unknown';
  }
}
