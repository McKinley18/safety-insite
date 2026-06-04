import { RISK_MATRIX } from './risk-matrix.seed';
import { bandFromProfileScore, getRiskProfile, scaleScoreToProfile } from './risk-profiles';

export type RiskInput = {
  text: string;
  classification: string;
  environment?: keyof typeof RISK_MATRIX.environmentMultiplier;
  riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  defaultSeverityScore?: number;
  defaultLikelihoodScore?: number;
};

export type RiskBand = 'Low' | 'Moderate' | 'High' | 'Critical';

export type RiskResult = {
  // Backward-compatible fields
  riskScore: number;
  riskBand: RiskBand;
  imminentDanger: boolean;
  fatalityPotential: 'low' | 'medium' | 'high';
  requiresShutdown: boolean;
  reasoning: string[];

  // New structured risk model
  operationalRisk: {
    profileId: string;
    profileLabel: string;
    matrixSize: number;
    severity: number;
    likelihood: number;
    matrixScore: number;
    matrixBand: RiskBand;
  };

  aiRisk: {
    escalationScore: number;
    escalationBand: RiskBand;
    imminentDanger: boolean;
    fatalityPotential: 'low' | 'medium' | 'high';
    requiresShutdown: boolean;
    escalationReasons: string[];
  };
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();

function bandFromMatrixScore(score: number): RiskBand {
  return bandFromProfileScore(score, getRiskProfile("standard_5x5"));
}

export function evaluateRisk(input: RiskInput): RiskResult {
  const text = normalize(input.text || '');
  const classification = input.classification || 'Review Required';
  const profile = getRiskProfile(input.riskProfileId);

  const imminentDanger = RISK_MATRIX.imminentDangerTriggers.some((trigger) =>
    text.includes(trigger),
  );

  let severity = input.defaultSeverityScore
    ? scaleScoreToProfile(input.defaultSeverityScore, profile)
    : scaleScoreToProfile(RISK_MATRIX.severity.moderate, profile);

  let likelihood = input.defaultLikelihoodScore
    ? scaleScoreToProfile(input.defaultLikelihoodScore, profile)
    : scaleScoreToProfile(RISK_MATRIX.likelihood.possible, profile);
  let fatalityPotential: RiskResult['fatalityPotential'] = 'medium';
  const reasoning: string[] = [];

  if (
    ['Electrical', 'Fall', 'Fall Protection', 'Powered Mobile Equipment', 'Mobile Equipment / Traffic', 'Machine', 'Machine Guarding', 'Confined Space', 'Fire / Explosion', 'Lockout / Stored Energy', 'Emergency Egress'].includes(
      classification,
    )
  ) {
    severity = scaleScoreToProfile(RISK_MATRIX.severity.major, profile);
    fatalityPotential = 'high';
    reasoning.push(`${classification} hazards can create serious or fatal exposure.`);
  }

  if (imminentDanger) {
    severity = scaleScoreToProfile(RISK_MATRIX.severity.critical, profile);
    likelihood = scaleScoreToProfile(RISK_MATRIX.likelihood.likely, profile);
    fatalityPotential = 'high';
    reasoning.push('Imminent-danger trigger detected in finding text.');
  }

  if (text.includes('missing') || text.includes('unguarded') || text.includes('live')) {
    likelihood = Math.max(likelihood, scaleScoreToProfile(RISK_MATRIX.likelihood.likely, profile));
    reasoning.push('Condition wording indicates active uncontrolled exposure.');
  }

  if (
    classification === 'Powered Mobile Equipment' &&
    (text.includes('pedestrian') || text.includes('traffic'))
  ) {
    likelihood = Math.max(likelihood, scaleScoreToProfile(RISK_MATRIX.likelihood.likely, profile));
    reasoning.push('Mobile equipment operating near pedestrians increases struck-by exposure.');
  }

  if (
    classification === 'Housekeeping' &&
    (text.includes('spill') || text.includes('walkway') || text.includes('slip'))
  ) {
    severity = Math.max(severity, scaleScoreToProfile(RISK_MATRIX.severity.serious, profile));
    likelihood = Math.max(likelihood, scaleScoreToProfile(RISK_MATRIX.likelihood.possible, profile));
    reasoning.push('Walking-working surface condition creates slip/trip exposure.');
  }

  const matrixScore = severity * likelihood;
  const matrixBand = bandFromProfileScore(matrixScore, profile);

  let escalationScore = matrixScore;
  if (imminentDanger) escalationScore += 5;
  if (fatalityPotential === 'high') escalationScore += 3;
  if (classification === 'Powered Mobile Equipment' && text.includes('pedestrian')) escalationScore += 3;
  if (classification === 'Fall' && (text.includes('open edge') || text.includes('guardrail'))) escalationScore += 3;

  escalationScore = Math.min(profile.maxScore, escalationScore);
  const escalationBand = bandFromProfileScore(escalationScore, profile);

  const activeExposure =
    text.includes('live') ||
    text.includes('energized') ||
    text.includes('exposed') ||
    text.includes('hanging') ||
    text.includes('open edge') ||
    text.includes('unguarded') ||
    text.includes('missing guard') ||
    text.includes('pedestrian') ||
    text.includes('traffic');

  const requiresShutdown =
    imminentDanger ||
    escalationBand === 'Critical' ||
    (
      escalationBand === 'High' &&
      fatalityPotential === 'high' &&
      activeExposure
    );

  return {
    riskScore: escalationScore,
    riskBand: escalationBand,
    imminentDanger,
    fatalityPotential,
    requiresShutdown,
    reasoning,

    operationalRisk: {
      profileId: profile.id,
      profileLabel: profile.label,
      matrixSize: profile.size,
      severity,
      likelihood,
      matrixScore,
      matrixBand,
    },

    aiRisk: {
      escalationScore,
      escalationBand,
      imminentDanger,
      fatalityPotential,
      requiresShutdown,
      escalationReasons: reasoning,
    },
  };
}
