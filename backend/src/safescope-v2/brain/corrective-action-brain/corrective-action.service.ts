import { CorrectiveActionReasoning } from './corrective-action.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

export class CorrectiveActionBrainService {
  evaluate(
    scenarioIntelligence: ScenarioIntelligence,
    evidenceGaps: string[]
  ): CorrectiveActionReasoning {
    const isCritical = scenarioIntelligence.mechanismOfInjury.includes('rotating_equipment') || scenarioIntelligence.mechanismOfInjury.includes('electrical_shock');
    const isHighRisk = scenarioIntelligence.missingOrFailedControls.length > 0;
    
    let urgency: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
    if (isCritical) urgency = 'critical';
    else if (isHighRisk) urgency = 'high';

    const immediateActions = isCritical 
        ? ['Immediately stop all work in the affected zone', 'Lock out and tag out all energy sources']
        : ['Assess current hazard exposure', 'Secure the area'];

    const interimControls = isHighRisk 
        ? ['Implement temporary physical barriers', 'Assign a dedicated safety spotter']
        : ['Restrict access until controls are verified'];

    const permanentCorrections = scenarioIntelligence.scenarioFamilyId === 'conveyor-cleanup' 
        ? ['Install permanent interlocked guarding system', 'Develop authorized lockout procedures']
        : ['Implement permanent engineered solutions specific to hazard'];

    return {
      scenarioFamilyId: scenarioIntelligence.scenarioFamilyId,
      hazardDomain: scenarioIntelligence.candidateStandardFamily || 'unknown',
      mechanismOfInjury: scenarioIntelligence.mechanismOfInjury,
      exposurePathway: scenarioIntelligence.exposedPersonActivity,
      missingOrFailedControls: scenarioIntelligence.missingOrFailedControls,
      immediateActions: immediateActions,
      interimControls: interimControls,
      permanentCorrections: permanentCorrections,
      administrativeFollowUps: ['Perform hazard analysis update', 'Conduct targeted tool-box safety briefing'],
      verificationSteps: ['Competent person verification of controls', 'Document functional test results'],
      evidenceNeededBeforeFinalizing: evidenceGaps,
      responsibleRoleSuggestions: ['Safety Manager', 'Operations Supervisor'],
      urgencyLevel: urgency,
      controlHierarchyLevel: scenarioIntelligence.hierarchyLevel,
      standardFamilyReviewLinks: [],
      confidence: scenarioIntelligence.confidenceSignals.score,
      humanReviewTriggers: ['Qualified safety review required due to high hazard complexity'],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      },
      // Narrative fields
      immediateActionNarrative: isCritical ? 'Halt all operations in the affected area immediately and initiate emergency energy isolation procedures.' : 'Secure the area to prevent further hazard exposure and notify the area supervisor.',
      interimControlNarrative: 'Deploy temporary physical safeguards or implement strict access restrictions until permanent engineered controls are validated.',
      permanentCorrectionNarrative: `Implement permanent engineered controls, such as ${scenarioIntelligence.missingOrFailedControls.join(' or ')}, to eliminate exposure to ${scenarioIntelligence.mechanismOfInjury}.`,
      administrativeFollowUpNarrative: 'Review and update the hazard control plan; conduct a mandatory safety briefing for all personnel affected by this work activity.',
      verificationNarrative: 'Perform a formal inspection and functional verification by a competent person before removing interim controls or resuming normal operations.'
    };
  }
}
