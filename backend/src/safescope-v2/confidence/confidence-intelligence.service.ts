export type ConfidenceBand = 'low' | 'medium' | 'high';

export type ConfidenceIntelligence = {
  overallConfidence: number;
  confidenceBand: ConfidenceBand;
  strengths: string[];
  missingCriticalInformation: string[];
  conflictingSignals: string[];
  recommendedFollowup: string[];
  reasonCodes: string[];
  reviewTriggers: string[];
  supervisorReviewRecommended: boolean;
};

function band(score: number): ConfidenceBand {
  if (score >= 0.8) return 'high';
  if (score >= 0.55) return 'medium';
  return 'low';
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export class ConfidenceIntelligenceService {
  evaluate(input: {
    text: string;
    classification: string;
    classifierConfidence?: number;
    evidenceTexts?: string[];
    evidenceTokens?: string[];
    ambiguityWarnings?: string[];
    expandedContext?: any;
    suggestedStandards?: any[];
    photosAttached?: boolean;
  }): ConfidenceIntelligence {
    const text = (input.text || '').toLowerCase();
    const strengths: string[] = [];
    const missingCriticalInformation: string[] = [];
    const conflictingSignals: string[] = [];
    const recommendedFollowup: string[] = [];
    const reasonCodes: string[] = [];
    const reviewTriggers: string[] = [];

    let score = input.classifierConfidence ?? 0.5;

    if ((input.evidenceTokens || []).length >= 3) {
      score += 0.06;
      strengths.push('Multiple direct hazard signals were detected.');
      reasonCodes.push('MULTIPLE_DIRECT_HAZARD_SIGNALS');
    }

    if ((input.suggestedStandards || []).length > 0) {
      score += 0.06;
      strengths.push('Applicable standards were identified.');
      reasonCodes.push('STANDARDS_IDENTIFIED');
    }

    if ((input.suggestedStandards || []).some((s) => Array.isArray(s.source) && s.source.includes('curated') && s.source.includes('cfr_database'))) {
      score += 0.08;
      strengths.push('At least one standard was supported by both curated mapping and CFR database matching.');
      reasonCodes.push('CURATED_AND_CFR_STANDARD_SUPPORT');
    }

    if ((input.evidenceTexts || []).some(Boolean)) {
      score += 0.04;
      strengths.push('Evidence notes were included.');
      reasonCodes.push('EVIDENCE_NOTES_INCLUDED');
    }

    if (input.photosAttached) {
      score += 0.04;
      strengths.push('Photo evidence was attached.');
      reasonCodes.push('PHOTO_EVIDENCE_ATTACHED');
    }

    if ((input.ambiguityWarnings || []).length > 0) {
      score -= 0.12;
      conflictingSignals.push(...(input.ambiguityWarnings || []));
      reasonCodes.push('AMBIGUITY_WARNINGS_PRESENT');
      reviewTriggers.push('Conflicting or ambiguous hazard signals detected.');
    }

    const contextBand = input.expandedContext?.contextConfidence?.band;
    if (contextBand === 'low') {
      score -= 0.08;
      missingCriticalInformation.push('Context details are limited.');
      reasonCodes.push('LIMITED_CONTEXT');
    }

    if (!includesAny(text, ['employee', 'worker', 'operator', 'pedestrian', 'person', 'persons'])) {
      score -= 0.04;
      missingCriticalInformation.push('Employee exposure is not clearly described.');
      reasonCodes.push('MISSING_EMPLOYEE_EXPOSURE');
    }

    if (!includesAny(text, ['near', 'within reach', 'contact', 'exposed', 'working', 'operating', 'using'])) {
      score -= 0.04;
      missingCriticalInformation.push('Exposure distance or interaction with the hazard is unclear.');
      reasonCodes.push('MISSING_EXPOSURE_DISTANCE_OR_INTERACTION');
    }

    if (!includesAny(text, ['location', 'area', 'shop', 'plant', 'pit', 'walkway', 'platform', 'conveyor', 'panel', 'tank'])) {
      score -= 0.03;
      missingCriticalInformation.push('Specific location or equipment context is limited.');
      reasonCodes.push('MISSING_LOCATION_OR_EQUIPMENT_CONTEXT');
    }

    if (
      ['Machine Guarding', 'Lockout / Stored Energy', 'Electrical'].includes(input.classification) &&
      !includesAny(text, ['locked out', 'lockout', 'de-energized', 'energized', 'running', 'operating', 'shut down'])
    ) {
      score -= 0.06;
      missingCriticalInformation.push('Energy state is not clearly documented.');
      reasonCodes.push('MISSING_ENERGY_STATE');
      reviewTriggers.push('Energy-control status requires supervisor verification.');
      recommendedFollowup.push('Confirm whether the equipment was operating, shut down, de-energized, or locked out.');
    }

    if (
      input.classification === 'Fall Protection' &&
      !includesAny(text, ['height', 'feet', 'elevated', 'platform', 'edge', 'guardrail'])
    ) {
      score -= 0.05;
      missingCriticalInformation.push('Fall height or edge condition is not clearly documented.');
      reasonCodes.push('MISSING_FALL_HEIGHT_OR_EDGE_CONDITION');
      reviewTriggers.push('Fall exposure details require supervisor verification.');
      recommendedFollowup.push('Document approximate height and whether guardrails, covers, or fall protection were present.');
    }

    if (
      input.classification === 'Confined Space' &&
      !includesAny(text, ['atmospheric testing', 'attendant', 'permit', 'rescue', 'ventilation'])
    ) {
      score -= 0.08;
      missingCriticalInformation.push('Critical confined space controls are not documented.');
      reasonCodes.push('MISSING_CONFINED_SPACE_CONTROLS');
      reviewTriggers.push('Confined space controls require supervisor verification.');
      recommendedFollowup.push('Confirm permit status, atmospheric testing, attendant, ventilation, and rescue provisions.');
    }

    if (missingCriticalInformation.length > 0) {
      recommendedFollowup.push('Add missing context before relying on final standard selection.');
    }

    if (missingCriticalInformation.length >= 2) {
      reviewTriggers.push('Multiple critical context gaps detected.');
      reasonCodes.push('MULTIPLE_CRITICAL_CONTEXT_GAPS');
      score = Math.min(score, 0.88);
    } else if (missingCriticalInformation.length === 1) {
      score = Math.min(score, 0.93);
    }

    if (conflictingSignals.length > 0) {
      score = Math.min(score, 0.82);
    }

    score = Math.max(0, Math.min(0.99, Number(score.toFixed(2))));

    if (score < 0.7) {
      reviewTriggers.push('Overall SafeScope confidence is below supervisor-review threshold.');
      reasonCodes.push('LOW_CONFIDENCE_BELOW_REVIEW_THRESHOLD');
    }

    const uniqueReviewTriggers = Array.from(new Set(reviewTriggers));

    return {
      overallConfidence: score,
      confidenceBand: band(score),
      strengths: Array.from(new Set(strengths)),
      missingCriticalInformation: Array.from(new Set(missingCriticalInformation)),
      conflictingSignals: Array.from(new Set(conflictingSignals)),
      recommendedFollowup: Array.from(new Set(recommendedFollowup)),
      reasonCodes: Array.from(new Set(reasonCodes)),
      reviewTriggers: uniqueReviewTriggers,
      supervisorReviewRecommended: uniqueReviewTriggers.length > 0 || score < 0.7,
    };
  }
}
