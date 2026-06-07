import { Injectable } from '@nestjs/common';
import { ObservationNarrativeSynthesisInput, ObservationNarrativeSynthesisResult } from './observation-narrative-synthesis.types';

@Injectable()
export class ObservationNarrativeSynthesisService {

  async synthesize(input: ObservationNarrativeSynthesisInput): Promise<ObservationNarrativeSynthesisResult> {
    const { observationText, evidenceWeighting, multiHazardAnalysis, evaluatedScenarios, approvedKnowledgeMatches } = input;
    
    const version = 'v1';
    const advisoryBoundary = 'SafeScope provides advisory information only. Requires human verification.';
    
    // 1. Determine Confidence Label
    let confidenceLabel = '';
    switch (evidenceWeighting.evidenceGrade) {
      case 'strong':
        confidenceLabel = 'SafeScope has enough observation detail to support a high-confidence advisory assessment.';
        break;
      case 'moderate':
        confidenceLabel = 'SafeScope has enough detail for a preliminary advisory assessment, but reviewer confirmation is still needed.';
        break;
      case 'weak':
        confidenceLabel = 'SafeScope has limited detail and the assessment should be treated as tentative.';
        break;
      case 'insufficient':
        confidenceLabel = 'SafeScope does not have enough information to make a reliable advisory assessment.';
        break;
      case 'conflicting':
        confidenceLabel = 'The observation contains conflicting facts, so SafeScope cannot provide a confident assessment until the conflict is resolved.';
        break;
      default:
        confidenceLabel = 'SafeScope assessment confidence is currently undetermined.';
    }

    // 2. Primary and Secondary Concerns
    const hazards = multiHazardAnalysis.hazards;
    const primaryConcern = hazards.length > 0 ? `Potential hazard in ${hazards[0].domainId} domain.` : 'Unknown hazard domain.';
    const secondaryConcerns = hazards.slice(1).map(h => `Additional potential hazard in ${h.domainId} domain.`);

    // 3. Narrative Summary
    let narrativeSummary = '';
    if (multiHazardAnalysis.isMultiHazard) {
      narrativeSummary = `Multiple potential hazards were identified: ${hazards.map(h => h.domainId).join(', ')}. `;
    } else if (hazards.length > 0) {
      narrativeSummary = `A potential ${hazards[0].domainId} hazard was identified. `;
    } else {
      narrativeSummary = `An observation was analyzed but no specific hazard domain could be definitively mapped. `;
    }
    narrativeSummary += confidenceLabel;

    // 4. Evidence Basis
    const evidenceBasis = `The assessment is supported by ${evidenceWeighting.supportingSignals.length} evidence signals: ${evidenceWeighting.supportingSignals.join(', ')}.`;

    // 5. Uncertainty and Contradiction
    const contradictionStatement = evidenceWeighting.detectedContradictions.length > 0
      ? `Contradictory evidence detected: ${evidenceWeighting.detectedContradictions.join('; ')}.`
      : 'No major evidence contradictions were detected.';

    const missingInformationStatement = evidenceWeighting.missingCriticalFacts.length > 0
      ? `Missing critical information: ${evidenceWeighting.missingCriticalFacts.join('; ')}.`
      : 'No major information gaps were identified in the primary text.';

    const uncertaintyStatement = evidenceWeighting.evidenceGrade === 'weak' || evidenceWeighting.evidenceGrade === 'insufficient'
      ? 'Due to limited detail, SafeScope cannot provide a high-certainty analysis.'
      : 'SafeScope analysis is based on available observation text.';

    // 6. Action and Question Narratives
    const topScenario = evaluatedScenarios.length > 0 ? evaluatedScenarios[0] : null;
    
    let immediateActionNarrative = '';
    if (evidenceWeighting.evidenceGrade === 'conflicting') {
        immediateActionNarrative = 'Immediate action should focus on clarifying the situation and restricting access to the area until facts are verified.';
    } else if (topScenario && topScenario.evidenceStrengthScore > 5) {
        immediateActionNarrative = `Based on the identified scenario (${topScenario.title}), consider reviewing area safety and ensuring standard controls are in place.`;
    } else {
        immediateActionNarrative = 'Assess the area for immediate hazards and follow standard safety procedures.';
    }

    let reviewerQuestionNarrative = 'Reviewers should verify the accuracy of the observation and check for any missing details.';
    if (evidenceWeighting.reviewerQuestions.length > 0) {
        reviewerQuestionNarrative = `Recommended verification questions: ${evidenceWeighting.reviewerQuestions.join('; ')}`;
    }

    return {
      version,
      narrativeSummary,
      primaryConcern,
      secondaryConcerns,
      evidenceBasis,
      uncertaintyStatement,
      contradictionStatement,
      missingInformationStatement,
      immediateActionNarrative,
      reviewerQuestionNarrative,
      advisoryBoundary,
      confidenceLabel,
      reasoningTrace: multiHazardAnalysis.routingNotes
    };
  }
}
