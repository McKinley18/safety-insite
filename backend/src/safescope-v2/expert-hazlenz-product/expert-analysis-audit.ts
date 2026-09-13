import type { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import type { ExpertAnalysisExecution } from './expert-analysis-execution.entity';

/**
 * §261 — THE ANALYSIS-CREATION AUDIT EVENT.
 *
 * THE GAP THIS CLOSES. `addAnalysis` wrote no SecurityAuditEvent, while finding materialization,
 * finding supersession and human reviews all did. The one act that creates the record every finding
 * is derived from was the one act with no audit trail, so "who caused this analysis to exist, and
 * when" was unanswerable — including for the analysis a report ultimately cites.
 *
 * ONE ACTION NAME ACROSS BOTH PRODUCERS. The legacy client-supplied path and the server-authored
 * Expert path emit the SAME action, so one query answers the question for the whole table, and the
 * `producer` field in the metadata is what distinguishes them. Two action names would mean every
 * future audit query had to know both, and would silently under-report whichever one it forgot.
 *
 * WHAT IS DELIBERATELY NOT IN HERE. No raw provider payload, no observation text, no analysis
 * content, no prose from the model. `security_audit_events.metadata` is a generic jsonb field read
 * by a broader audience than the analysis itself, and §261 requires existing logging and privacy
 * conventions be preserved. Raw first-pass and verifier output live on the execution record, under
 * the same access controls as the analysis they produced. Everything below is an IDENTIFIER, a
 * VERSION or a closed-vocabulary DISPOSITION — facts about the event, never its content.
 */
export const ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION = 'analysis_created' as const;

/** The resource an analysis-creation event is about. */
export const ANALYSIS_AUDIT_RESOURCE_TYPE = 'hazlenz_analysis' as const;

/**
 * Metadata for a SERVER-AUTHORED analysis creation. Carries enough identity to establish who
 * initiated it, which workspace/inspection/observation it belongs to, the execution and analysis
 * identities, candidate and contract provenance, the resulting state and the confirmation
 * requirement — which is exactly the §261 list, and nothing beyond it.
 */
export function auditMetadataForAnalysisCreation(context: {
  readonly observationId: string;
  readonly inspectionId: string;
  readonly analysis: HazLenzAnalysis;
  readonly execution: ExpertAnalysisExecution;
  readonly confirmationRuleVersion: string;
  readonly confirmationTriggerCount: number;
  readonly confirmationFailedClosed: boolean;
}): Record<string, unknown> {
  return {
    producer: context.analysis.producer,
    analysisId: context.analysis.id,
    observationId: context.observationId,
    inspectionId: context.inspectionId,
    organizationId: context.execution.organizationId,
    executionId: context.execution.id,
    idempotencyKey: context.execution.idempotencyKey,
    requestVersion: context.analysis.requestVersion,
    analysisState: context.analysis.analysisState,
    confirmationRequired: context.analysis.confirmationRequired,
    confirmationRuleVersion: context.confirmationRuleVersion,
    /**
     * HOW MANY ENTRIES TRIGGERED THE RULE, not which text they contained. A count establishes that
     * the determination had a basis and lets an auditor find the analysis to inspect; the entries
     * themselves are on the analysis row, where they are already access-controlled.
     */
    confirmationTriggerCount: context.confirmationTriggerCount,
    /**
     * TRUE means the rule could not read the structure and required confirmation because it could
     * not establish that none was needed. Recorded separately from `confirmationRequired` because a
     * failed-closed TRUE is a defect signal and must be findable without re-deriving the rule.
     */
    confirmationFailedClosed: context.confirmationFailedClosed,
    candidateIdentity: context.execution.candidateIdentity,
    contractVersion: context.execution.contractVersion,
    entryVersion: context.execution.entryVersion,
    admission: context.execution.admission,
    providerId: context.execution.providerId,
    respondedModel: context.execution.respondedModel,
    verifierReached: context.execution.verifierReached,
  };
}

/**
 * Metadata for a CLIENT-SUPPLIED analysis creation — the legacy deterministic path.
 *
 * It records fewer facts because fewer facts exist, and that asymmetry is the honest signal: there
 * is no execution identity, no candidate identity and no confirmation determination, because no
 * server-owned execution ran. `engineVersion` is included precisely BECAUSE it is what the client
 * asserted; it is recorded as a client claim, not as provenance the server established.
 */
export function auditMetadataForClientSuppliedAnalysisCreation(context: {
  readonly observationId: string;
  readonly inspectionId: string;
  readonly analysis: HazLenzAnalysis;
}): Record<string, unknown> {
  return {
    producer: context.analysis.producer,
    analysisId: context.analysis.id,
    observationId: context.observationId,
    inspectionId: context.inspectionId,
    requestVersion: context.analysis.requestVersion,
    analysisState: context.analysis.analysisState,
    confirmationRequired: context.analysis.confirmationRequired,
    /** What the CLIENT asserted the engine was. Not established by the server; see §260 section 1. */
    clientAssertedEngineVersion: context.analysis.engineVersion,
    knowledgeReleaseId: context.analysis.knowledgeReleaseId,
    executionId: null,
    candidateIdentity: null,
    confirmationRuleVersion: null,
  };
}
