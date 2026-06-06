import {
  ConfidenceGovernanceInput,
  ConfidenceGovernanceOutput,
  ConfidenceInputs,
  ConfidenceLevel,
} from './confidence-governance.types';

const ORDER: Record<ConfidenceLevel, number> = {
  insufficient: 0,
  low: 1,
  moderate: 2,
  high: 3,
};

export class ConfidenceGovernanceService {
  govern(input: ConfidenceGovernanceInput): ConfidenceGovernanceOutput {
    const evidence = input.evidenceSufficiency || {};
    const causal = input.causalRiskReasoning || {};
    const scenario = input.scenarioIntelligence || {};
    const risk = input.riskReasoning || {};
    const standards = input.standardsReasoning || {};
    const observation = input.observationUnderstanding || {};
    const calibration = input.calibrationMeta || {};
    const fusedText = String(input.fusedText || '').toLowerCase();

    const confidenceInputs: ConfidenceInputs = {
      observationUnderstandingConfidence: this.observationConfidence(observation),
      causalRiskConfidence: this.normalizeLevel(causal?.confidence?.level),
      evidenceSufficiencyLevel: this.levelFromSufficiency(evidence?.sufficiencyLevel),
      evidenceSufficiencyScore: this.numberOrZero(evidence?.overallScore),
      scenarioConfidence: this.levelFromScore(scenario?.confidenceSignals?.score),
      riskConfidence: this.levelFromScore(risk?.confidence),
      standardsConfidence: this.standardsConfidence(standards),
    };

    const decisionTrace: string[] = [
      'Started confidence governance evaluation.',
      'Used evidence sufficiency as the primary confidence gate.',
    ];

    const downgradeReasons: string[] = [];
    const blockingEvidenceGaps = Array.from(new Set([
      ...(evidence?.missingCriticalFacts || []),
      ...(evidence?.weakestFacts || []),
      ...(calibration?.evidenceGaps || []),
    ].filter(Boolean).map(String)));

    let maximumSupportedConfidence = confidenceInputs.evidenceSufficiencyLevel;

    const evidenceMax = this.normalizeLevel(evidence?.confidenceImpact?.maximumSupportedConfidence);
    if (this.isLower(evidenceMax, maximumSupportedConfidence)) {
      maximumSupportedConfidence = evidenceMax;
      downgradeReasons.push(`Evidence sufficiency limits maximum confidence to ${evidenceMax}.`);
    }

    for (const [label, level] of [
      ['causal-risk reasoning', confidenceInputs.causalRiskConfidence],
      ['scenario intelligence', confidenceInputs.scenarioConfidence],
      ['risk reasoning', confidenceInputs.riskConfidence],
    ] as Array<[string, ConfidenceLevel]>) {
      if (this.isLower(level, maximumSupportedConfidence)) {
        maximumSupportedConfidence = level;
        downgradeReasons.push(`Downgraded because ${label} confidence is ${level}.`);
      }
    }

    if (
      this.isLower(confidenceInputs.observationUnderstandingConfidence, maximumSupportedConfidence) &&
      confidenceInputs.observationUnderstandingConfidence === 'insufficient' &&
      evidence?.sufficiencyLevel === 'insufficient'
    ) {
      maximumSupportedConfidence = 'insufficient';
      downgradeReasons.push('Downgraded because observation understanding and evidence sufficiency are insufficient.');
    }

    if (confidenceInputs.standardsConfidence === 'low' || confidenceInputs.standardsConfidence === 'insufficient') {
      downgradeReasons.push('Standards confidence limits standard-family and citation-candidate support, but does not block hazard-control reasoning.');
    }

    const missingText = blockingEvidenceGaps.join(' ').toLowerCase();
    const exposureWeak = missingText.includes('exposure') || evidence?.factScores?.exposureClarity < 0.6;
    const jurisdictionWeak = missingText.includes('jurisdiction') || evidence?.factScores?.jurisdictionClarity < 0.6;
    const supportWeak = missingText.includes('supporting evidence') || evidence?.factScores?.evidenceSupport < 0.45;

    if (exposureWeak && this.isHigher(maximumSupportedConfidence, 'moderate')) {
      maximumSupportedConfidence = 'moderate';
      downgradeReasons.push('Worker exposure is not strong enough to support high confidence.');
    }

    if (jurisdictionWeak) {
      downgradeReasons.push('Jurisdiction is unclear or weak, limiting standards and citation support.');
    }

    if (supportWeak && this.isHigher(maximumSupportedConfidence, 'moderate')) {
      maximumSupportedConfidence = 'moderate';
      downgradeReasons.push('Supporting evidence is weak, limiting final confidence.');
    }

    const highOrCriticalRisk = this.isHighOrCriticalRisk(risk, calibration, causal, fusedText);
    const humanReviewReasons: string[] = [];

    if (highOrCriticalRisk) {
      humanReviewReasons.push('High or critical risk condition requires qualified review.');
    }

    if (blockingEvidenceGaps.length > 0) {
      humanReviewReasons.push('Blocking or weak evidence remains and should be reviewed.');
    }

    if (maximumSupportedConfidence === 'low' || maximumSupportedConfidence === 'insufficient') {
      humanReviewReasons.push('Low or insufficient confidence requires qualified review before reliance.');
    }

    const canSupportStrongRecommendation =
      ['high', 'moderate'].includes(maximumSupportedConfidence) &&
      ['sufficient', 'partially_sufficient'].includes(String(evidence?.sufficiencyLevel || ''));

    const canSupportCorrectiveAction =
      ['high', 'moderate'].includes(maximumSupportedConfidence) &&
      ['sufficient', 'partially_sufficient'].includes(String(evidence?.sufficiencyLevel || ''));

    const canSupportStandardFamilySuggestion =
      ['high', 'moderate'].includes(maximumSupportedConfidence) &&
      !jurisdictionWeak &&
      ['high', 'moderate'].includes(confidenceInputs.standardsConfidence);

    const canSupportCitationCandidate =
      maximumSupportedConfidence === 'high' &&
      evidence?.sufficiencyLevel === 'sufficient' &&
      confidenceInputs.standardsConfidence === 'high' &&
      !jurisdictionWeak &&
      !supportWeak;

    const canSupportReportNarrative =
      maximumSupportedConfidence !== 'insufficient' ||
      evidence?.sufficiencyLevel === 'weak' ||
      evidence?.sufficiencyLevel === 'partially_sufficient';

    decisionTrace.push(`Evidence sufficiency level: ${evidence?.sufficiencyLevel || 'unknown'}.`);
    decisionTrace.push(`Maximum supported confidence: ${maximumSupportedConfidence}.`);
    decisionTrace.push(`Citation candidate support: ${canSupportCitationCandidate ? 'allowed' : 'blocked or limited'}.`);
    decisionTrace.push('Preserved advisory-only boundary and qualified-review requirement.');

    return {
      engine: 'safescope_confidence_governance_core',
      version: '0.1.0',
      finalConfidenceLevel: maximumSupportedConfidence,
      maximumSupportedConfidence,
      confidenceScore: this.scoreForLevel(maximumSupportedConfidence, confidenceInputs.evidenceSufficiencyScore),
      confidenceInputs,
      downgradeReasons: Array.from(new Set(downgradeReasons)),
      blockingEvidenceGaps,
      humanReviewRequired: true,
      humanReviewReasons: Array.from(new Set(humanReviewReasons.length ? humanReviewReasons : ['SafeScope output requires qualified human review.'])),
      outputPermissions: {
        canSupportStrongRecommendation,
        canSupportStandardFamilySuggestion,
        canSupportCitationCandidate,
        canSupportCorrectiveAction,
        canSupportReportNarrative,
      },
      decisionTrace,
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private observationConfidence(observation: any): ConfidenceLevel {
    const scores = [
      observation?.jurisdiction?.confidence?.score,
      observation?.equipment?.confidence?.score,
      observation?.task?.confidence?.score,
      observation?.exposure?.confidence?.score,
      observation?.energy?.confidence?.score,
      observation?.controls?.confidence?.score,
    ].filter((score) => typeof score === 'number');

    if (!scores.length) return 'insufficient';
    return this.levelFromScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private standardsConfidence(standards: any): ConfidenceLevel {
    const score = standards?.topDefensible?.[0]?.defensibilityScore;
    if (typeof score === 'number') return this.levelFromScore(score);
    if (Array.isArray(standards?.topDefensible) && standards.topDefensible.length > 0) return 'moderate';
    return 'low';
  }

  private levelFromSufficiency(level: unknown): ConfidenceLevel {
    if (level === 'sufficient') return 'high';
    if (level === 'partially_sufficient') return 'moderate';
    if (level === 'weak') return 'low';
    return 'insufficient';
  }

  private normalizeLevel(level: unknown): ConfidenceLevel {
    return level === 'high' || level === 'moderate' || level === 'low' || level === 'insufficient'
      ? level
      : 'insufficient';
  }

  private levelFromScore(score: unknown): ConfidenceLevel {
    if (typeof score !== 'number') return 'insufficient';
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'moderate';
    if (score >= 0.4) return 'low';
    return 'insufficient';
  }

  private isLower(a: ConfidenceLevel, b: ConfidenceLevel): boolean {
    return ORDER[a] < ORDER[b];
  }

  private isHigher(a: ConfidenceLevel, b: ConfidenceLevel): boolean {
    return ORDER[a] > ORDER[b];
  }

  private numberOrZero(value: unknown): number {
    return typeof value === 'number' ? value : 0;
  }

  private scoreForLevel(level: ConfidenceLevel, evidenceScore: number): number {
    const cap = level === 'high' ? 0.95 : level === 'moderate' ? 0.79 : level === 'low' ? 0.59 : 0.39;
    return Math.min(cap, Math.max(0, evidenceScore || cap));
  }

  private isHighOrCriticalRisk(risk: any, calibration: any, causal: any, text: string): boolean {
    const combined = [
      risk?.initialRiskLevel,
      calibration?.riskBand,
      causal?.credibleWorstCase,
      causal?.mechanismOfInjury,
      text,
    ].join(' ').toLowerCase();

    return (
      combined.includes('critical') ||
      combined.includes('high') ||
      combined.includes('fatal') ||
      combined.includes('amputation') ||
      combined.includes('fall_from_height') ||
      combined.includes('unexpected_startup') ||
      combined.includes('confined') ||
      combined.includes('suspended load')
    );
  }
}
