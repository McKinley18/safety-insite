import { Injectable } from '@nestjs/common';
import {
  EligibilityLevel,
  HumanReviewLearningGovernanceOutput,
  ReviewPriority,
} from './hrlg.types';

@Injectable()
export class HumanReviewLearningGovernanceService {
  private readonly engineVersion = '0.1.0';

  async evaluateHRLG(
    confidenceGovernance: any,
    evidenceSufficiency: any,
    causalRiskReasoning: any,
    defensibleCorrectiveAction: any,
    observationUnderstanding: any,
    calibrationMeta: any,
    outputPolicy: any
  ): Promise<HumanReviewLearningGovernanceOutput> {
    const textBundle = [
      calibrationMeta?.hazardFamily,
      calibrationMeta?.scenarioFamily,
      calibrationMeta?.riskBand,
      causalRiskReasoning?.mechanismOfInjury,
      causalRiskReasoning?.credibleWorstCase,
      causalRiskReasoning?.failedOrMissingControl,
      outputPolicy?.allowedLanguageStrength,
      confidenceGovernance?.maximumSupportedConfidence,
      evidenceSufficiency?.sufficiencyLevel,
      ...(evidenceSufficiency?.missingCriticalFacts || []),
      ...(evidenceSufficiency?.weakestFacts || []),
    ].filter(Boolean).join(' ').toLowerCase();

    const evidenceLevel = String(evidenceSufficiency?.sufficiencyLevel || 'insufficient');
    const outputStrength = String(outputPolicy?.allowedLanguageStrength || 'questions_only');
    const maxConfidence = String(confidenceGovernance?.maximumSupportedConfidence || 'insufficient');
    const mechanism = this.value(causalRiskReasoning?.mechanismOfInjury || calibrationMeta?.mechanism);
    const jurisdiction = this.value(observationUnderstanding?.jurisdiction?.detected || calibrationMeta?.jurisdiction);
    const exposureKnown = observationUnderstanding?.exposure?.workerExposed === true;
    const riskBand = String(calibrationMeta?.riskBand || '').toLowerCase();

    const highRisk = this.includesAny(textBundle, [
      'critical',
      'high',
      'fatal',
      'fatality',
      'amputation',
      'unexpected_startup',
      'fall_from_height',
      'confined',
      'engulfment',
      'suspended_load',
      'electrical_shock',
      'cave_in',
    ]);

    const evidenceInsufficient = evidenceLevel === 'insufficient';
    const evidenceWeak = evidenceLevel === 'weak';
    const questionsOnly = outputStrength === 'questions_only';
    const jurisdictionUnclear = jurisdiction === 'unknown' || jurisdiction === 'unclear' || textBundle.includes('jurisdiction');
    const exposureUnclear = !exposureKnown || textBundle.includes('worker exposure') || textBundle.includes('exposure is not clearly');
    const mechanismUnknown = mechanism === 'unknown' || mechanism === 'unclear';
    const moderateOrPartial =
      evidenceLevel === 'partially_sufficient' ||
      maxConfidence === 'moderate' ||
      outputStrength === 'moderate' ||
      outputStrength === 'cautious';

    const reviewFocusAreas = Array.from(new Set([
      'qualified reviewer final decision',
      highRisk ? 'high-risk or critical exposure review' : undefined,
      evidenceInsufficient || evidenceWeak ? 'missing evidence review' : undefined,
      exposureUnclear ? 'worker exposure and proximity confirmation' : undefined,
      jurisdictionUnclear ? 'jurisdiction/site-type confirmation' : undefined,
      mechanismUnknown ? 'mechanism-of-injury confirmation' : undefined,
      'corrective-action appropriateness review',
      'learning eligibility review',
    ].filter(Boolean) as string[]));

    const requiredReviewerConfirmations = Array.from(new Set([
      'Confirm whether SafeScope output is accepted, edited, rejected, escalated, or requires more evidence.',
      exposureUnclear ? 'Confirm worker exposure, access path, and proximity before relying on learning capture.' : undefined,
      jurisdictionUnclear ? 'Confirm jurisdiction/site type before allowing any future learning candidate.' : undefined,
      mechanismUnknown ? 'Confirm mechanism of injury before allowing any future learning candidate.' : undefined,
      evidenceInsufficient || evidenceWeak ? 'Confirm missing evidence before allowing learning eligibility.' : undefined,
      'Confirm any corrected hazard family, mechanism, exposure, controls, jurisdiction, standard family, and corrective actions.',
    ].filter(Boolean) as string[]));

    const blockedReasons: string[] = [];
    if (evidenceInsufficient) blockedReasons.push('Evidence is insufficient.');
    if (questionsOnly) blockedReasons.push('Output policy is questions_only.');
    if (jurisdictionUnclear) blockedReasons.push('Jurisdiction is unclear.');
    if (exposureUnclear) blockedReasons.push('Worker exposure is unclear.');
    if (mechanismUnknown) blockedReasons.push('Mechanism of injury is unknown.');
    blockedReasons.push('Learning is blocked until qualified reviewer approval is recorded.');

    let eligibilityLevel: EligibilityLevel = 'blocked';
    let eligibleForLearningCandidate = false;

    if (
      evidenceLevel === 'sufficient' &&
      ['high', 'moderate'].includes(maxConfidence) &&
      outputStrength !== 'questions_only' &&
      !jurisdictionUnclear &&
      !exposureUnclear &&
      !mechanismUnknown
    ) {
      eligibilityLevel = 'approved_candidate';
      eligibleForLearningCandidate = true;
    } else if (
      !evidenceInsufficient &&
      !questionsOnly &&
      !jurisdictionUnclear &&
      !mechanismUnknown &&
      moderateOrPartial
    ) {
      eligibilityLevel = 'review_required';
      eligibleForLearningCandidate = false;
    }

    const reviewPriority: ReviewPriority =
      highRisk || riskBand === 'critical' ? 'critical' :
      riskBand === 'high' || evidenceInsufficient || questionsOnly ? 'high' :
      moderateOrPartial ? 'medium' :
      'low';

    const correctionCapture = {
      shouldCaptureCorrectedHazardFamily: true,
      shouldCaptureCorrectedMechanism: mechanismUnknown || moderateOrPartial || evidenceWeak || evidenceInsufficient,
      shouldCaptureCorrectedExposure: exposureUnclear || moderateOrPartial || evidenceWeak || evidenceInsufficient,
      shouldCaptureCorrectedControls: true,
      shouldCaptureCorrectedJurisdiction: jurisdictionUnclear || moderateOrPartial || evidenceWeak || evidenceInsufficient,
      shouldCaptureCorrectedStandardFamily: jurisdictionUnclear || moderateOrPartial || evidenceWeak || evidenceInsufficient,
      shouldCaptureCorrectedCorrectiveActions: true,
    };

    const auditTrailRequirements = [
      'Record SafeScope engine versions and output snapshot.',
      'Record reviewer identity, decision, timestamp, and edits.',
      'Record original SafeScope recommendation and final reviewer-approved correction.',
      'Record evidence used for the decision.',
      'Record whether learning candidate remains blocked, review-required, or approved-candidate.',
      'Record confirmation that no automatic approved-knowledge update occurred.',
    ];

    const governanceWarnings = Array.from(new Set([
      'Do not automatically update approved knowledge from this output.',
      'Reviewer approval is required before any future learning candidate can be used.',
      evidenceInsufficient || evidenceWeak ? 'Weak or missing evidence limits learning eligibility.' : undefined,
      jurisdictionUnclear ? 'Unclear jurisdiction blocks learning eligibility.' : undefined,
      exposureUnclear ? 'Unclear exposure blocks or limits learning eligibility.' : undefined,
      questionsOnly ? 'Questions-only output blocks learning eligibility.' : undefined,
    ].filter(Boolean) as string[]));

    const decisionTrace = [
      'Evaluated human review and learning governance.',
      `Evidence sufficiency level: ${evidenceLevel}.`,
      `Output policy language strength: ${outputStrength}.`,
      `Maximum supported confidence: ${maxConfidence}.`,
      `Review priority assigned: ${reviewPriority}.`,
      `Learning eligibility assigned: ${eligibilityLevel}.`,
      'Confirmed that learning output is governance-only and does not persist approved knowledge.',
      'Preserved advisory-only boundary and qualified-review requirement.',
    ];

    return {
      engine: 'safescope_human_review_learning_governance_core',
      version: this.engineVersion,
      reviewRequired: true,
      reviewPriority,
      reviewerDecisionOptions: {
        accept: !evidenceInsufficient && !questionsOnly,
        acceptWithEdits: true,
        reject: true,
        needsMoreEvidence: evidenceInsufficient || evidenceWeak || exposureUnclear || jurisdictionUnclear,
        escalate: highRisk || reviewPriority === 'critical',
      },
      reviewFocusAreas,
      requiredReviewerConfirmations,
      correctionCapture,
      learningEligibility: {
        eligibleForLearningCandidate,
        eligibilityLevel,
        blockedReasons: eligibilityLevel === 'blocked' ? Array.from(new Set(blockedReasons)) : ['Qualified reviewer approval is still required before any future knowledge update.'],
        requiredApprovals: [
          'Qualified safety reviewer approval',
          'Evidence review approval',
          'Governance approval before any approved-knowledge update',
        ],
      },
      auditTrailRequirements,
      governanceWarnings,
      decisionTrace,
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private value(value: unknown): string {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || 'unknown';
  }

  private includesAny(text: string, tokens: string[]): boolean {
    return tokens.some((token) => text.includes(token));
  }
}
