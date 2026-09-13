import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Observation } from '../../inspection/entities/observation.entity';
import type {
  AnalysisProducer, ExpertExecutionState,
} from './expert-analysis-authority';

/**
 * §261 — THE EXPERT EXECUTION RECORD.
 *
 * ITS PRIMARY PURPOSE IS TO ESTABLISH AUTHORITATIVE EXECUTION IDENTITY BEFORE PROVIDER SPEND.
 *
 * WHY IT EXISTS AT ALL, given that `hazlenz_analyses` already carries a unique
 * (observationId, idempotencyKey). Every existing idempotency guard protects the WRITE, and the
 * write happens after the money is spent. A replayed or concurrent Expert request would find no row
 * to collide with until the provider had already answered — twice, because an admitting analysis
 * makes two provider legs. This row is inserted in ANALYSIS_RUNNING BEFORE the first leg, under the
 * same identity, so a second request discovers a running or completed execution and returns it
 * instead of spending. That is the only genuinely new mechanism in this slice.
 *
 * WHY IT IS A SIBLING TABLE AND NOT MORE COLUMNS ON `hazlenz_analyses`. One analysis may involve
 * two provider legs and several attempts, and these are facts about an EXECUTION rather than about
 * an analysis. `hazlenz_analyses` stays the canonical analysis entity — every downstream foreign
 * key (`inspection_findings.originatingAnalysisId`, `inspection_findings.selectedAnalysisId`,
 * `human_reviews.analysisId`) already points there, and a parallel Expert-analysis table would have
 * orphaned all three.
 *
 * BILLING IS NOT BUILT HERE. The usage columns are the HOOKS §260 section 17 fixes in place — a
 * location to persist and attribute what the adapter's append-only telemetry already measures. No
 * policy, no limits, no metering logic. The `(organizationId, createdAt)` index is what makes
 * workspace usage accounting answerable later.
 *
 * NO PROVIDER CALL OCCURS IN §261. Every column below is written by code that runs before or after
 * a call, never by a call, and the service that owns this table has no provider dependency in this
 * slice.
 */
@Entity('expert_analysis_executions')
/** The pre-spend identity. This unique index IS the duplicate-spend guard. */
@Index('uq_expert_execution_observation_idempotency', ['observationId', 'idempotencyKey'], { unique: true })
@Index('idx_expert_execution_observation_state', ['observationId', 'executionState'])
/** Usage accounting by workspace, per §260 section 17. */
@Index('idx_expert_execution_organization_created', ['organizationId', 'createdAt'])
export class ExpertAnalysisExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // -------------------------------------------------------------- linkage

  @Column({ type: 'uuid' })
  observationId: string;

  @ManyToOne(() => Observation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'observationId' })
  observation: Observation;

  /**
   * The inspection the observation belongs to, denormalized at claim time. Carried because
   * inspection-scoped questions ("what did this inspection spend", "which executions block
   * completion") must be answerable without joining through observations, and because an execution
   * must record which inspection it was authorized against at the time it was authorized.
   */
  @Column({ type: 'uuid' })
  inspectionId: string;

  /**
   * Tenant. NULLABLE, and NULL is honest rather than missing: `inspection` enforces an XOR between
   * `organizationId` and `ownerUserId`, so a personal inspection genuinely has no organization.
   * Fabricating one to make the column NOT NULL would invent a tenant that does not exist.
   */
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  /**
   * The persisted analysis this execution produced. NULL until an authoritative result exists,
   * which is the ordinary state of a running, failed or refused execution.
   */
  @Column({ type: 'uuid', nullable: true })
  analysisId: string | null;

  // -------------------------------------------------------------- identity and idempotency

  /**
   * The client-supplied execution identity. This is an INTENT, not a conclusion: the only thing a
   * client may contribute to an Expert execution is which request this is, so a retry can be
   * recognised as the same one.
   */
  @Column({ type: 'varchar', length: 128 })
  idempotencyKey: string;

  @Column({ type: 'integer' })
  requestVersion: number;

  @Column({ type: 'varchar', length: 48 })
  executionState: ExpertExecutionState;

  // -------------------------------------------------------------- candidate and contract provenance

  /**
   * The §259 successor candidate identity. `engineVersion: "hazlenz-production"` is explicitly
   * insufficient and is not carried forward for Expert: a marketing string cannot distinguish
   * candidate behaviour, and a historical analysis must never silently change meaning when HazLenz
   * is upgraded.
   */
  @Column({ type: 'varchar', length: 128, nullable: true })
  candidateIdentity: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  contractVersion: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  entryVersion: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  admissionVersion: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  projectionVersion: string | null;

  /**
   * WHICH CONFIRMATION RULE PRODUCED THE FLAG STORED ON THE ANALYSIS. Kept here rather than as a
   * fifth column on `hazlenz_analyses`, because §260 froze exactly four additive analysis columns
   * and this is execution provenance in the same sense as the contract versions beside it. Without
   * it, a later rule change would silently reinterpret every historical flag and no one could
   * establish what an earlier reviewer was actually asked to confirm.
   */
  @Column({ type: 'varchar', length: 160, nullable: true })
  confirmationRuleVersion: string | null;

  /**
   * What was actually transmitted, independent of module versions. Two digests rather than a
   * version string, because a version can be bumped without changing the bytes and the bytes can
   * change without bumping the version.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  systemPromptSha: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  wireSchemaSha: string | null;

  // -------------------------------------------------------------- provider attribution

  @Column({ type: 'varchar', length: 80, nullable: true })
  providerId: string | null;

  /** What the provider said it was, which is not necessarily what was requested. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  respondedModel: string | null;

  // -------------------------------------------------------------- the deterministic verdict

  /** ADMIT / REFUSE / PRESERVE_UNRESOLVED. NULL while running or when the provider never answered. */
  @Column({ type: 'varchar', length: 32, nullable: true })
  admission: string | null;

  /**
   * The structured deterministic verdict. Stored as arrays of closed-vocabulary CODES, never as
   * rendered prose, so a future reader can count and group refusals rather than grep sentences.
   */
  @Column({ type: 'jsonb', nullable: true })
  postureRefusalCodes: readonly string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  conformanceViolations: readonly unknown[] | null;

  @Column({ type: 'jsonb', nullable: true })
  roleJustificationCodes: readonly string[] | null;

  /**
   * Per-declaration contained refusals. A contained refusal with an overall ADMIT is a SUCCESS of
   * the architecture, not a failure of it, and the count is surfaced to the reviewer rather than
   * hidden — which is only possible because it is persisted structurally, keyed by declarationId.
   */
  @Column({ type: 'jsonb', nullable: true })
  declarationRefusals: readonly unknown[] | null;

  // -------------------------------------------------------------- verifier leg

  @Column({ type: 'boolean', default: false })
  verifierReached: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  verifierFactKey: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  verifierNotReachedBecause: string | null;

  // -------------------------------------------------------------- cost accounting hooks

  @Column({ type: 'integer', nullable: true })
  firstPassInputTokens: number | null;

  @Column({ type: 'integer', nullable: true })
  firstPassOutputTokens: number | null;

  @Column({ type: 'integer', nullable: true })
  verifierInputTokens: number | null;

  @Column({ type: 'integer', nullable: true })
  verifierOutputTokens: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 6, nullable: true })
  costUsd: string | null;

  @Column({ type: 'integer', nullable: true })
  latencyMs: number | null;

  /**
   * Provider attempts made under this execution. Defaults to 0 and is incremented by the code that
   * makes a call, so an execution that never reached the provider is distinguishable from one that
   * reached it once — a distinction that matters for both billing and retry classification.
   */
  @Column({ type: 'integer', default: 0 })
  attempts: number;

  // -------------------------------------------------------------- raw provider output

  /**
   * The provider output as received, for post-hoc adjudication. Deliberately NOT written into
   * generic audit metadata: the audit event records identity and disposition, and raw model output
   * belongs in one place with the same access controls as the analysis it produced.
   */
  @Column({ type: 'jsonb', nullable: true })
  rawFirstPass: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  rawVerifier: Record<string, unknown> | null;

  // -------------------------------------------------------------- failure

  @Column({ type: 'varchar', length: 80, nullable: true })
  failureKind: string | null;

  @Column({ type: 'text', nullable: true })
  failureDetail: string | null;

  // -------------------------------------------------------------- audit

  /**
   * Who initiated it. NOT NULL: a server-authored execution that cannot name the person who asked
   * for it would defeat the audit requirement this slice exists to satisfy.
   */
  @Column({ type: 'uuid' })
  requestedByUserId: string;

  /**
   * The producer this execution confers. Always `server_authored` — the column exists so the
   * execution record itself states the authority it establishes, rather than leaving the claim to
   * live only on the analysis row it wrote.
   */
  @Column({ type: 'varchar', length: 32, default: 'server_authored' })
  producer: AnalysisProducer;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
