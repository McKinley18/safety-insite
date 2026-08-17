import { SafeScopeNarrative, NarrativeMode } from './narrative.types';
import { SafeScopeIntelligenceResult } from '../../types/safescope-intelligence.types';

export class NarrativeGeneratorService {
  generate(result: SafeScopeIntelligenceResult, mode: NarrativeMode): SafeScopeNarrative {
    const title = result.scenarioIntelligence?.scenarioFamilyId || 'General Finding';
    const scenario = result.scenarioIntelligence;
    const mechanism = this.humanizeMechanism(scenario?.mechanismOfInjury);
    const activity = scenario?.exposedPersonActivity || 'people in the affected area';
    const gaps = result.evidenceGapQuestions || [];

    return {
      findingTitle: `Review of ${title}`,
      findingSummary: `The observation supports ${scenario?.hazardCategory || title} involving ${scenario?.equipment || 'the identified equipment'}${scenario?.task ? ` during ${scenario.task}` : ''}. The available evidence indicates ${mechanism} exposure for ${activity}.`,
      scenarioExplanation: `Observed condition: ${scenario?.unsafeCondition || 'the specific unsafe condition remains to be confirmed'}. Operational context: ${scenario?.operationalState || 'not established'}. Energy or source context: ${scenario?.energySource || 'not established'}.`,
      mechanismOfInjuryNarrative: this.mechanismNarrative(mechanism, activity),
      exposureNarrative: `${activity} may be exposed through ${mechanism}; the conclusion is limited to the facts supplied in the observation.`,
      evidenceGapNarrative: gaps.length
        ? `The following material facts remain unresolved: ${gaps.map(q => q.question).filter(Boolean).join(' ')}`
        : 'The current evidence supports the described hazard mechanism; qualified review should confirm site-specific conditions.',
      followUpQuestionNarrative: gaps.map(q => q.question).filter(Boolean).join(' '),
      standardFamilyReviewNarrative: scenario?.candidateStandardFamily && scenario.candidateStandardFamily !== 'unknown'
        ? `The ${scenario.candidateStandardFamily} standard family is a candidate because the observed condition and mechanism are consistent with that scope; applicability and jurisdiction still require qualified confirmation.`
        : 'No specific standard family is promoted because the applicability predicates are not established by the supplied evidence.',
      citationCandidateReviewNarrative: 'Citations are advisory candidates only and should be confirmed against jurisdiction, task, equipment, and current site evidence.',
      correctiveActionNarrative: 'Use the immediate, permanent, and verification actions below to address the identified mechanism and failed controls.',
      immediateActionNarrative: 'Restrict or pause avoidable exposure to the identified mechanism while a qualified person confirms the condition and interim controls.',
      interimControlNarrative: 'Use the least disruptive effective interim control supported by the evidence, such as access restriction, isolation, barricading, or warning of the affected path.',
      permanentCorrectionNarrative: 'Prioritize elimination, substitution, or an engineered safeguard matched to the confirmed mechanism before relying on administrative controls or PPE.',
      administrativeFollowUpNarrative: 'Document the responsible person, affected equipment or area, evidence reviewed, and conditions required before returning to normal operation.',
      verificationNarrative: 'Verify the control at the point of exposure, test its function where applicable, and retain objective closure evidence before removing interim restrictions.',
      confidenceNarrative: `${Math.round((scenario?.confidenceSignals?.score || 0) * 100)}% scenario confidence based on the supplied evidence; unresolved gaps or contradictions should lower certainty rather than be filled by assumption.`,
      qualifiedReviewDisclaimer: 'This finding is for advisory purposes only and requires qualified review.',
      auditAppendixNarrative: 'Audit details include source provenance and scenario mapping.'
    };
  }

  private humanizeMechanism(value: unknown): string {
    const raw = String(value || '').trim();
    if (!raw) return 'an undetermined mechanism';
    return raw.replaceAll('_', ' ').replace(/\s+/g, ' ').trim();
  }

  private mechanismNarrative(mechanism: string, activity: string): string {
    const lower = mechanism.toLowerCase();
    if (/rotat|nip|entangle|caught/.test(lower)) {
      return `Exposed moving components can draw clothing, tools, or a body part into the rotating or nip point interface while ${activity} is in the affected path, causing caught-in, crushing, or amputation injury.`;
    }
    if (/electrical|shock|arc|energ/.test(lower)) {
      return `Contact with the supplied energized electrical parts, or an arc across the available path, could transfer electrical energy to ${activity} and cause shock, burns, or fatal injury.`;
    }
    if (/fall|gravity|edge/.test(lower)) {
      return `Loss of balance or an unprotected edge could allow ${activity} to fall to a lower level, causing impact or serious injury.`;
    }
    if (/chemical|toxic|solvent|corros|inhal/.test(lower)) {
      return `The described release or contact pathway could expose ${activity} through skin contact, eye contact, or inhalation; the specific severity depends on the confirmed substance and exposure conditions.`;
    }
    if (/struck|mobile|vehicle|impact/.test(lower)) {
      return `Vehicle or moving-object energy could contact ${activity} in the described path, causing struck-by or caught-between injury.`;
    }
    if (/stored|pressure|unexpected/.test(lower)) {
      return `Residual or unexpectedly released energy could move the equipment or component into ${activity}'s path, causing impact, crushing, or other energy-transfer injury.`;
    }
    return `The supplied evidence indicates ${mechanism} could expose ${activity}; the initiating event and contact pathway remain limited to the facts provided and require qualified confirmation.`;
  }

  enrich(
    narrative: SafeScopeNarrative,
    context: {
      scenarioIntelligence?: any;
      correctiveActionReasoning?: any;
      riskReasoning?: any;
      standardFamilyCandidates?: any[];
      evidenceGapQuestions?: any[];
    },
  ): SafeScopeNarrative {
    const actions = context.correctiveActionReasoning || {};
    const risk = context.riskReasoning || {};
    const standards = (context.standardFamilyCandidates || [])
      .map((candidate: any) => candidate?.citation || candidate?.standardFamily || candidate?.family)
      .filter(Boolean)
      .slice(0, 3);
    const questions = (context.evidenceGapQuestions || []).map((q: any) => q?.question).filter(Boolean);
    return {
      ...narrative,
      immediateActionNarrative: actions.immediateActionNarrative || actions.immediateActions?.[0] || narrative.immediateActionNarrative,
      interimControlNarrative: actions.interimControlNarrative || actions.interimControls?.[0] || narrative.interimControlNarrative,
      permanentCorrectionNarrative: actions.permanentCorrectionNarrative || actions.permanentCorrections?.[0] || narrative.permanentCorrectionNarrative,
      administrativeFollowUpNarrative: actions.administrativeFollowUpNarrative || actions.administrativeFollowUps?.[0] || narrative.administrativeFollowUpNarrative,
      verificationNarrative: actions.verificationNarrative || actions.verificationSteps?.[0] || risk.verificationRequirements?.[0] || narrative.verificationNarrative,
      correctiveActionNarrative: actions.permanentCorrections?.length
        ? `Recommended correction: ${actions.permanentCorrections.slice(0, 2).join(' ')} Verification: ${(actions.verificationSteps || []).slice(0, 2).join(' ')}`
        : narrative.correctiveActionNarrative,
      standardFamilyReviewNarrative: standards.length
        ? `Candidate references for qualified applicability review: ${standards.join(', ')}. These are not declarations of violation.`
        : narrative.standardFamilyReviewNarrative,
      evidenceGapNarrative: questions.length
        ? `Material evidence gaps: ${questions.join(' ')}`
        : narrative.evidenceGapNarrative,
      followUpQuestionNarrative: questions.join(' ') || narrative.followUpQuestionNarrative,
      confidenceNarrative: risk.initialRiskLevel
        ? `${narrative.confidenceNarrative} Initial advisory risk is ${risk.initialRiskLevel}; credible worst case: ${risk.credibleWorstCaseOutcome || 'confirm during qualified review'}.`
        : narrative.confidenceNarrative,
    };
  }
}
