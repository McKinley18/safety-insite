import { CorrectiveActionReasoning } from './corrective-action.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

export class CorrectiveActionBrainService {
  evaluate(
    scenarioIntelligence: ScenarioIntelligence,
    scenarioFamilyId: string
  ): CorrectiveActionReasoning {
    // Corrective Action Reasoning Logic
    // Based on the scenarioIntelligence input, generate structured corrective actions.

    // Placeholder logic for demonstration - will be refined
    const urgency = this.determineUrgency(scenarioIntelligence);
    
    return {
      scenarioFamilyId: scenarioFamilyId,
      hazardDomain: scenarioIntelligence.candidateStandardFamily || 'unknown',
      mechanismOfInjury: scenarioIntelligence.mechanismOfInjury,
      exposurePathway: scenarioIntelligence.exposedPersonActivity,
      missingOrFailedControls: scenarioIntelligence.missingOrFailedControls,
      immediateActions: ['Secure the area immediately', `Implement immediate controls for ${scenarioIntelligence.equipment}`],
      interimControls: ['Restrict access until controls are verified'],
      permanentCorrections: ['Implement engineered physical controls as required'],
      administrativeFollowUps: ['Conduct root cause analysis', 'Train personnel on specific hazard'],
      verificationSteps: ['Verify control functionality', 'Sign-off by supervisor'],
      evidenceNeededBeforeFinalizing: scenarioIntelligence.evidenceGaps,
      responsibleRoleSuggestions: ['Safety Manager', 'Area Supervisor'],
      urgencyLevel: urgency,
      controlHierarchyLevel: scenarioIntelligence.hierarchyLevel,
      standardFamilyReviewLinks: [],
      confidence: scenarioIntelligence.confidenceSignals.score,
      humanReviewTriggers: ['Critical hazard interaction'],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      },
      // Narrative fields
      immediateActionNarrative: 'Immediately secure the affected area, establish a barricade, and notify the supervisor to prevent unauthorized access.',
      interimControlNarrative: 'Implement temporary physical safeguards or increased surveillance until a permanent engineering control is validated.',
      permanentCorrectionNarrative: `Install a permanent engineered solution, such as a physical guard, barrier, or interlock, specifically designed for the ${scenarioIntelligence.equipment}.`,
      administrativeFollowUpNarrative: 'Update the hazard control plan and conduct mandatory training for all personnel affected by this specific hazard.',
      verificationNarrative: 'Verification requires visual confirmation of the engineered control by a competent person, followed by a functional test and a formal safety sign-off.'
    };
  }

  private determineUrgency(intelligence: ScenarioIntelligence): 'low' | 'moderate' | 'high' | 'critical' {
    if (intelligence.confidenceSignals.score > 0.8) return 'high';
    return 'moderate';
  }
}
