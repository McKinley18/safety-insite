import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../../corrective-actions/corrective-action-template.registry';
import {
  CorrectiveActionReasoningInput,
  CorrectiveActionReasoningResult,
  CorrectiveActionRecommendation,
  CorrectiveActionPriority,
  ControlLevel,
} from './corrective-action-reasoning.types';

function normalize(value: unknown): string {
  return String(value || '').toLowerCase();
}

export class SafeScopeCorrectiveActionReasoningService {
  reason(input: CorrectiveActionReasoningInput): CorrectiveActionReasoningResult {
    const recommendations = this.buildRecommendations(input);
    const summary = {
      totalRecommendations: recommendations.length,
      immediateCount: recommendations.filter((item) => item.priority === 'immediate').length,
      engineeringCount: recommendations.filter((item) => item.controlLevel === 'engineering').length,
      administrativeCount: recommendations.filter((item) => item.controlLevel === 'administrative').length,
      ppeCount: recommendations.filter((item) => item.controlLevel === 'ppe').length,
      verificationCount: recommendations.filter((item) => item.controlLevel === 'verification').length,
    };

    return {
      engine: 'safescope_corrective_action_reasoning_v1',
      mode: 'deterministic_test_only_advisory',
      productionReasoningModified: false,
      jurisdiction: input.jurisdiction,
      hazardDomain: input.hazardDomain,
      recommendations,
      summary,
      reasoningBoundary: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotGuaranteeAbatement: true,
        requiresQualifiedReview: true,
        requiresSiteSpecificValidation: true,
      },
    };
  }

  private buildRecommendations(input: CorrectiveActionReasoningInput): CorrectiveActionRecommendation[] {
    const recommendations: CorrectiveActionRecommendation[] = [];
    
    // Find template
    const template = CORRECTIVE_ACTION_TEMPLATE_REGISTRY.find(t => t.domain === input.hazardDomain);
    
    if (template) {
        template.immediateControlElements.forEach((el: string) => recommendations.push({
            controlLevel: 'administrative' as ControlLevel,
            priority: 'immediate' as CorrectiveActionPriority,
            action: el,
            rationale: 'Immediate risk mitigation.',
            verificationEvidence: [],
            cautions: []
        }));
        template.permanentCorrectionElements.forEach((el: string) => recommendations.push({
            controlLevel: 'engineering' as ControlLevel,
            priority: 'high' as CorrectiveActionPriority,
            action: el,
            rationale: 'Permanent abatement.',
            verificationEvidence: [],
            cautions: []
        }));
        // Include verification evidence as recommendations
        template.verificationEvidence.forEach((el: string) => recommendations.push({
            controlLevel: 'verification' as ControlLevel,
            priority: 'medium' as CorrectiveActionPriority,
            action: el,
            rationale: 'Verification of abatement.',
            verificationEvidence: [],
            cautions: []
        }));
    } else {
        // Fallback for unknown
        recommendations.push({
            controlLevel: 'verification' as ControlLevel,
            priority: 'medium' as CorrectiveActionPriority,
            action: 'Gather additional facts and assign qualified review.',
            rationale: 'Domain unknown.',
            verificationEvidence: [],
            cautions: []
        });
    }

    if (input.hazardDomain === 'health_exposure') {
        const alreadyHasSamplingRecommendation = recommendations.some((item) =>
            normalize(item.action).includes('sampling') ||
            normalize(item.action).includes('exposure monitoring') ||
            normalize(item.action).includes('dosimetry')
        );

        if (!alreadyHasSamplingRecommendation) {
            recommendations.push({
                controlLevel: 'verification' as ControlLevel,
                priority: 'high' as CorrectiveActionPriority,
                action: 'Perform exposure sampling or equivalent exposure monitoring before making high-confidence health-exposure conclusions.',
                rationale: 'Health exposure findings often require quantitative or documented objective exposure data before determining exposure severity, adequacy of controls, or compliance posture.',
                verificationEvidence: [
                    'industrial hygiene sampling result',
                    'exposure monitoring record',
                    'task duration and frequency documentation',
                    'control-method verification',
                ],
                cautions: [
                    'Do not declare exposure-limit compliance or noncompliance without adequate sampling, objective data, or qualified industrial hygiene review.',
                ],
            });
        }

        const alreadyHasQualifiedReview = recommendations.some((item) =>
            normalize(item.action).includes('industrial hygiene') ||
            normalize(item.action).includes('qualified health') ||
            normalize(item.action).includes('qualified review')
        );

        if (!alreadyHasQualifiedReview) {
            recommendations.push({
                controlLevel: 'verification' as ControlLevel,
                priority: 'medium' as CorrectiveActionPriority,
                action: 'Route the health exposure finding for qualified industrial hygiene or qualified safety professional review.',
                rationale: 'Industrial hygiene review helps verify exposure route, contaminant or agent identity, duration, frequency, controls, PPE selection, and defensibility of conclusions.',
                verificationEvidence: [
                    'qualified reviewer note',
                    'exposure assessment documentation',
                    'sampling plan or objective data review',
                ],
                cautions: [
                    'Visible dust, noise, fumes, vapors, heat, or chemical exposure indicators should remain advisory until exposure basis is verified.',
                ],
            });
        }
    }

    return recommendations;
  }
}
