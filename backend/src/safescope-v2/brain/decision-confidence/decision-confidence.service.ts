import {
  SafeScopeDecisionConfidenceInput,
  SafeScopeDecisionConfidenceResult,
  SafeScopeDecisionDisposition,
  SafeScopeDecisionConfidenceLevel,
} from './decision-confidence.types';

function sameValue(a?: string, b?: string): boolean {
  return Boolean(a && b && a.trim() === b.trim());
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export class SafeScopeDecisionConfidenceService {
  assess(input: SafeScopeDecisionConfidenceInput): SafeScopeDecisionConfidenceResult {
    let score = 50;
    const reasonCodes: string[] = [];
    const warnings: string[] = [];

    const citationAligned = sameValue(input.nativePrimaryCitation, input.brainLikelyCitation);
    const mechanismAligned = sameValue(input.nativeMechanism, input.brainLikelyMechanism);

    if (citationAligned) {
      score += 20;
      reasonCodes.push('citation-aligned');
    } else {
      score -= 20;
      warnings.push('Native citation and Brain likely citation are not aligned.');
      reasonCodes.push('citation-misaligned');
    }

    if (mechanismAligned) {
      score += 15;
      reasonCodes.push('mechanism-aligned');
    } else {
      score -= 15;
      warnings.push('Native mechanism and Brain likely mechanism are not aligned.');
      reasonCodes.push('mechanism-misaligned');
    }

    if ((input.regulatoryMatchCount || 0) > 0) {
      score += 8;
      reasonCodes.push('source-backed-regulatory-match');
    } else {
      score -= 10;
      warnings.push('No regulatory Brain match was available.');
      reasonCodes.push('no-regulatory-match');
    }

    if ((input.mechanismMatchCount || 0) > 0) {
      score += 5;
      reasonCodes.push('mechanism-brain-match-present');
    }

    if ((input.evidenceMatchCount || 0) > 0) {
      score += 5;
      reasonCodes.push('evidence-brain-match-present');
    }

    if ((input.controlMatchCount || 0) > 0 || (input.likelyControlCount || 0) > 0) {
      score += 5;
      reasonCodes.push('control-brain-match-present');
    } else {
      score -= 8;
      warnings.push('No likely controls were available.');
      reasonCodes.push('no-control-match');
    }

    if ((input.criticalEvidenceQuestionCount || 0) > 0) {
      score += 5;
      reasonCodes.push('critical-evidence-questions-present');
    } else {
      score -= 5;
      warnings.push('No critical evidence questions were generated.');
      reasonCodes.push('no-critical-evidence-questions');
    }

    if (input.scenarioConfidence === 'high') {
      score += 8;
      reasonCodes.push('scenario-disambiguation-high');
    } else if (input.scenarioConfidence === 'moderate') {
      score += 3;
      reasonCodes.push('scenario-disambiguation-moderate');
    } else if (input.scenarioConfidence === 'low') {
      score -= 5;
      warnings.push('Scenario disambiguation confidence is low.');
      reasonCodes.push('scenario-disambiguation-low');
    }

    if (input.scenarioHumanReviewRecommended) {
      score -= 5;
      reasonCodes.push('scenario-human-review-recommended');
    }

    if (input.evidenceGapHighestSeverity === 'critical') {
      score -= 30;
      warnings.push('Critical evidence gap is present.');
      reasonCodes.push('critical-evidence-gap-present');
    } else if (input.evidenceGapHighestSeverity === 'high') {
      score -= 15;
      warnings.push('High-severity evidence gap is present.');
      reasonCodes.push('high-evidence-gap-present');
    } else if (input.evidenceGapHighestSeverity === 'medium') {
      score -= 5;
      reasonCodes.push('medium-evidence-gap-present');
    }

    let recommendedDisposition: SafeScopeDecisionDisposition =
      'proceed_with_advisory_output';

    if (
      input.evidenceGapDisposition === 'hold_for_critical_evidence' ||
      input.evidenceGapHighestSeverity === 'critical'
    ) {
      recommendedDisposition = 'hold_for_critical_evidence';
    } else if (
      input.evidenceGapDisposition === 'proceed_with_human_review' ||
      input.scenarioHumanReviewRecommended ||
      !citationAligned ||
      !mechanismAligned
    ) {
      recommendedDisposition = 'proceed_with_human_review';
    }

    const defensibilityScore = clampScore(score);
    const confidenceLevel = this.resolveConfidenceLevel(
      defensibilityScore,
      recommendedDisposition,
    );

    return {
      engine: 'safescope_decision_confidence_v1',
      mode: 'read_only_defensibility_assessment',
      input,
      confidenceLevel,
      defensibilityScore,
      recommendedDisposition,
      reasonCodes: Array.from(new Set(reasonCodes)),
      warnings: Array.from(new Set(warnings)),
      boundary: {
        readOnly: true,
        advisoryOnly: true,
        canDeclareViolation: false,
        canCreateCitation: false,
        canOverrideRegulation: false,
        canBypassHumanReview: false,
      },
    };
  }

  private resolveConfidenceLevel(
    score: number,
    disposition: SafeScopeDecisionDisposition,
  ): SafeScopeDecisionConfidenceLevel {
    if (disposition === 'hold_for_critical_evidence') return 'hold';
    if (score >= 85) return 'high';
    if (score >= 65) return 'moderate';
    return 'low';
  }
}
