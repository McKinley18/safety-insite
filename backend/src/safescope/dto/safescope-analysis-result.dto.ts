import { GovernanceFlags } from '../interfaces/governance-flags.interface';
import { AuditTrace } from '../interfaces/audit-trace.interface';

export class SafeScopeAnalysisResultDto {
  analysisId: string;
  classification: Record<string, unknown> | null;
  standardsMatches: unknown[];
  sourceIntelligenceMatches: unknown[];
  riskAssessment: Record<string, unknown> | null;
  correctiveActionRecommendations: unknown[];
  executiveSummaryText: string;
  reviewRequired: boolean;
  confidence: number;
  governanceFlags: GovernanceFlags;
  auditTrace: AuditTrace;
}
