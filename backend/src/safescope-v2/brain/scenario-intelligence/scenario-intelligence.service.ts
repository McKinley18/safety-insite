import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';
import { SCENARIO_FAMILY_REGISTRY } from '../scenario-family-knowledge/scenario-family.registry';

export class ScenarioIntelligenceService {
  evaluate(input: {
    text: string;
    classification: any;
    operationalReasoning: any;
    risk: any;
    suggestedStandards: any[];
    evidenceGaps: string[];
    confidence: number;
  }): ScenarioIntelligence {
    const text = input.text.toLowerCase();

    // Find best matching scenario family
    const matchedFamily = SCENARIO_FAMILY_REGISTRY.find(family =>
      family.commonObservationPhrases.some(phrase => text.includes(phrase)) ||
      family.equipmentIndicators.some(indicator => text.includes(indicator))
    );

    if (matchedFamily) {
      return {
        scenarioFamilyId: matchedFamily.id,
        equipment: matchedFamily.equipmentIndicators[0] || 'unknown',
        task: matchedFamily.taskIndicators[0] || 'unknown',
        unsafeCondition: matchedFamily.unsafeConditionIndicators[0] || 'unknown',
        operationalState: matchedFamily.operationalStateIndicators[0] || 'unknown',
        energySource: matchedFamily.energySourceIndicators[0] || 'unknown',
        mechanismOfInjury: matchedFamily.mechanismOfInjuryIndicators[0] || 'unknown',
        exposedPersonActivity: matchedFamily.exposureIndicators[0] || 'unknown',
        missingOrFailedControls: matchedFamily.missingOrFailedControlIndicators,
        hierarchyLevel: 'unknown', // Needs better mapping
        candidateStandardFamily: matchedFamily.candidateStandardFamilies[0] || 'unknown',
        evidenceGaps: matchedFamily.evidenceGaps,
        confidenceSignals: {
          score: input.confidence || 0.5,
          reasoning: ['Matched against scenario family: ' + matchedFamily.title]
        },
        qualifiedReviewRequired: matchedFamily.requiresQualifiedReview,
        advisoryOnly: matchedFamily.advisoryOnly,
        doesNotDeclareViolation: matchedFamily.doesNotDeclareViolation
      };
    }
    
    // Fallback if no match
    return {
      scenarioFamilyId: 'unknown',
      equipment: 'unknown',
      task: 'unknown',
      unsafeCondition: 'unknown',
      operationalState: 'unknown',
      energySource: 'unknown',
      mechanismOfInjury: input.classification?.mechanism || 'unknown',
      exposedPersonActivity: 'unknown',
      missingOrFailedControls: input.operationalReasoning?.missingControls || [],
      hierarchyLevel: 'unknown',
      candidateStandardFamily: input.suggestedStandards?.[0]?.family || 'unknown',
      evidenceGaps: input.evidenceGaps || [],
      confidenceSignals: {
        score: input.confidence || 0,
        reasoning: ['Inferred from fused operational reasoning and observation.']
      },
      qualifiedReviewRequired: true,
      advisoryOnly: true,
      doesNotDeclareViolation: true,
    };
  }
}
