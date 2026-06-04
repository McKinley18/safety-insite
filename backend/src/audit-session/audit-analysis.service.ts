import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditAnalysisService {
  async analyzeEntry(input: { notes?: string; locationText?: string }) {
    const narrative = [input.locationText, input.notes].filter(Boolean).join(' ').toLowerCase();

    const hazardCategoryCode =
      narrative.includes('ladder') || narrative.includes('trip') || narrative.includes('fall')
        ? 'fall_hazard'
        : narrative.includes('electrical') || narrative.includes('wire')
        ? 'electrical'
        : 'general_hazard';

    return {
      title: `Finding: ${hazardCategoryCode.replace(/_/g, ' ')}`,
      observedCondition: input.notes || 'Condition observed during walkthrough.',
      hazardCategoryCode,
      applicableStandards: [],
      severityLevel: hazardCategoryCode === 'electrical' ? 4 : 3,
      suggestedFix:
        hazardCategoryCode === 'electrical'
          ? 'Remove the electrical hazard from service and inspect the surrounding area.'
          : 'Correct the observed condition and secure the area against recurrence.',
      confidenceScore: 0.75,
      aiReasoning: {
        summary: `Draft finding generated for ${hazardCategoryCode}.`,
        methodology: 'RuleBasedAuditAnalysis',
        confidence: 0.75,
      },
      verificationStatus: 'draft',
    };
  }
}
