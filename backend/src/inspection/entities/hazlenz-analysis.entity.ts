import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Observation } from './observation.entity';
import type {
  AnalysisProducer, AnalysisState,
} from '../../safescope-v2/expert-hazlenz-product/expert-analysis-authority';

@Entity('hazlenz_analyses')
@Index('idx_hazlenz_analysis_observation_created', ['observationId', 'createdAt'])
@Index('uq_hazlenz_analysis_observation_idempotency', ['observationId', 'idempotencyKey'], { unique: true })
@Index('uq_hazlenz_analysis_observation_version', ['observationId', 'requestVersion'], { unique: true })
export class HazLenzAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  observationId: string;

  @ManyToOne(() => Observation, observation => observation.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'observationId' })
  observation: Observation;

  @Column({ type: 'varchar', length: 80 })
  engineVersion: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  traceId: string | null;

  /**
   * KG-1. The governed knowledge release/snapshot that actually and deterministically
   * informed this analysis, captured once at analysis persistence time and inherited by
   * every finding derived from it.
   *
   * NULL is a truthful, expected value: it means no single release governed the analysis.
   * The live standards path (ApplicableStandardsService) selects over the whole
   * `standards_master` corpus filtered only by `is_active`/jurisdiction, plus
   * `safescope_knowledge_chunks` and in-code shards -- it does not scope to
   * `release_id`, so no one release can honestly be named. NULL is never backfilled and
   * never replaced by whichever release happens to exist later.
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  knowledgeReleaseId: string | null;

  @Column({ type: 'varchar', length: 128 })
  idempotencyKey: string;

  @Column({ type: 'integer' })
  requestVersion: number;

  @Column({ type: 'varchar', length: 24, default: 'current' })
  status: 'current' | 'superseded';

  @Column({ type: 'jsonb' })
  resultSnapshot: Record<string, unknown>;

  @Column({ type: 'varchar', length: 24, default: 'advisory' })
  advisoryStatus: 'advisory';

  @Column({ type: 'uuid' })
  requestedByUserId: string;

  /**
   * §261 additive column 1 of 4 — THE TRUST BOUNDARY, MADE EXPLICIT IN DATA.
   *
   * `client_supplied` means the snapshot arrived in a request body: the deterministic HazLenz path
   * calls /safescope-v2/classify, holds the result client-side and posts it back, and the server
   * does not establish that what it stores equals what it returned. That is acceptable for the
   * advisory deterministic path and it is what every row in this table was before §261.
   *
   * `server_authored` means the content was produced inside a server-owned Expert execution the
   * server itself initiated under an execution record created before any provider spend.
   *
   * SERVER-AUTHORED PROVENANCE CANNOT BE CONFERRED BY SETTING THIS COLUMN. It is assigned in
   * exactly two places — the legacy persistence path writes `client_supplied`, ExpertAnalysisService
   * writes `server_authored` — and never from a DTO. A client-supplied row does not become
   * authoritative by acquiring an engineVersion, a candidate identity, a confirmation state or this
   * value; provenance arises only from having actually run the server-owned path.
   *
   * DEFAULT `client_supplied` is deliberate and is the weaker claim. It makes the column
   * old-code-safe (any insert that predates §261 lands on the truthful value) and it means a future
   * insert path that forgets to set it fails toward "not authoritative" rather than toward
   * authority.
   */
  @Column({ type: 'varchar', length: 32, default: 'client_supplied' })
  producer: AnalysisProducer;

  /**
   * §261 additive column 2 of 4 — the explicit product analysis state.
   *
   * The state the product did not have is ANALYSIS_AWAITING_CONFIRMATION: the analysis exists and
   * may be shown AS ANALYSIS while its consequential operational conclusion is not yet settled.
   * `advisoryStatus` is not overloaded to carry it (it is fixed at `advisory` and means something
   * else), `status` is not (it means current/superseded), and `human_reviews.decision` is not (it
   * means a reviewer accepted or rejected a FINDING).
   */
  @Column({ type: 'varchar', length: 48, default: 'ANALYSIS_AVAILABLE' })
  analysisState: AnalysisState;

  /**
   * §261 additive column 3 of 4 — PERSISTED ONCE, NEVER RECOMPUTED ON READ.
   *
   * Computed by the deterministic §260 confirmation rule at authoritative persistence time and
   * stored. It is never recomputed when an analysis is read, because a later rule or version change
   * must not silently alter what an earlier reviewer was required to confirm. Which rule produced
   * the stored value is recorded on the execution record's `confirmationRuleVersion`.
   *
   * FALSE on a client-supplied row is a fact, not a default standing in for an unasked question:
   * the legacy path carries no server-authored operational conclusion, so there is nothing for a
   * human to settle and the rule never runs on it.
   */
  @Column({ type: 'boolean', default: false })
  confirmationRequired: boolean;

  /**
   * §261 additive column 4 of 4 — the execution that authored this analysis.
   *
   * NULL on every client-supplied row, which is the ordinary state: there was no server-owned
   * execution. A non-NULL value is therefore itself evidence of server authorship, and the two
   * columns are checked against each other by a database constraint rather than by convention.
   */
  @Column({ type: 'uuid', nullable: true })
  expertExecutionId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
