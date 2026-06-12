import * as natural from 'natural';
import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../../corrective-actions/corrective-action-template.registry';
import { extractTargetEntity, tailorAction } from '../../../action-engine/contextual-control.engine';
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
    
    // Extract situational context using TF-IDF NLP
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(normalize(input.hazardObservation));
    const topTerms = tfidf.listTerms(0).slice(0, 3).map(t => t.term).join(', ');
    const contextStr = topTerms ? ` involving ${topTerms}` : '';
    
    // Find template
    const template = CORRECTIVE_ACTION_TEMPLATE_REGISTRY.find(t => t.domain === input.hazardDomain);
    const targetEntity = extractTargetEntity(input.hazardObservation, input.equipmentInvolved);
    
    if (template) {
        template.immediateControlElements.forEach((el: string) => {
          const action = tailorAction(el, targetEntity);
          recommendations.push({
            controlLevel: 'administrative' as ControlLevel,
            priority: 'immediate' as CorrectiveActionPriority,
            action,
            rationale: `Immediate risk mitigation${contextStr}.`,
            verificationEvidence: [],
            cautions: []
          });
        });
        template.permanentCorrectionElements.forEach((el: string) => {
          const action = tailorAction(el, targetEntity);
          recommendations.push({
            controlLevel: 'engineering' as ControlLevel,
            priority: 'high' as CorrectiveActionPriority,
            action,
            rationale: `Permanent abatement${contextStr}.`,
            verificationEvidence: [],
            cautions: []
          });
        });
        // Include verification evidence as recommendations
        template.verificationEvidence.forEach((el: string) => {
          const action = tailorAction(el, targetEntity);
          recommendations.push({
            controlLevel: 'verification' as ControlLevel,
            priority: 'medium' as CorrectiveActionPriority,
            action,
            rationale: `Verification of abatement${contextStr}.`,
            verificationEvidence: [],
            cautions: []
          });
        });
    } else {
        // Fallback for unknown
        const action = tailorAction('Gather additional facts and assign qualified review.', targetEntity);
        recommendations.push({
            controlLevel: 'verification' as ControlLevel,
            priority: 'medium' as CorrectiveActionPriority,
            action,
            rationale: `Domain unknown, requires situational analysis${contextStr}.`,
            verificationEvidence: [],
            cautions: []
        });
    }

    // AI-Driven Dynamic Evidence Gaps
    if (input.applicabilityAnalysis && input.applicabilityAnalysis.recordAnalyses) {
      input.applicabilityAnalysis.recordAnalyses.forEach(record => {
        if (record.missingEvidenceNeeded && record.missingEvidenceNeeded.length > 0) {
          record.missingEvidenceNeeded.forEach(evidence => {
            if (!recommendations.some(r => r.action.includes(evidence))) {
              recommendations.push({
                controlLevel: 'verification' as ControlLevel,
                priority: 'medium' as CorrectiveActionPriority,
                action: `Verify presence of: ${evidence}`,
                rationale: `AI identified this as critical missing evidence for ${record.citation || 'regulatory compliance'}.`,
                verificationEvidence: [evidence],
                cautions: [`Without ${evidence}, finding cannot be definitively closed.`]
              });
            }
          });
        }
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
