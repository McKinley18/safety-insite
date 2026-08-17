export const RISK_POLICY_VERSION = 'categorical-risk-v1';

export type CanonicalRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskUrgencyPolicy {
  modelVersion: typeof RISK_POLICY_VERSION;
  riskLevel: CanonicalRiskLevel;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDays: number;
  closeoutEvidenceRequired: boolean;
}

export function normalizeRiskLevel(value: unknown): CanonicalRiskLevel {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('critical')) return 'critical';
  if (normalized.includes('high') || normalized.includes('serious')) return 'high';
  if (normalized.includes('moderate') || normalized.includes('medium')) return 'moderate';
  return 'low';
}

export function urgencyForRisk(value: unknown): RiskUrgencyPolicy {
  const riskLevel = normalizeRiskLevel(value);
  switch (riskLevel) {
    case 'critical':
      return {
        modelVersion: RISK_POLICY_VERSION,
        riskLevel,
        priority: 'urgent',
        dueDays: 1,
        closeoutEvidenceRequired: true,
      };
    case 'high':
      return {
        modelVersion: RISK_POLICY_VERSION,
        riskLevel,
        priority: 'urgent',
        dueDays: 3,
        closeoutEvidenceRequired: true,
      };
    case 'moderate':
      return {
        modelVersion: RISK_POLICY_VERSION,
        riskLevel,
        priority: 'high',
        dueDays: 7,
        closeoutEvidenceRequired: true,
      };
    default:
      return {
        modelVersion: RISK_POLICY_VERSION,
        riskLevel,
        priority: 'low',
        dueDays: 14,
        closeoutEvidenceRequired: false,
      };
  }
}

export function materialRiskChanged(
  proposed: Record<string, unknown>,
  reviewed: Record<string, unknown>,
): boolean {
  return ['severity', 'likelihood', 'exposure', 'overallRisk']
    .some(field => String(proposed[field] || '') !== String(reviewed[field] || ''));
}
