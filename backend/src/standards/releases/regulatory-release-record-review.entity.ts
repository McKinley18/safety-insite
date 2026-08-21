import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type ReleaseRecordReviewDecision = 'approved' | 'revoked';

/**
 * KG-3B -- the append-only reviewer-decision log.
 *
 * WHY A SEPARATE TABLE RATHER THAN AN UPDATE TO `regulatory_release_records`.
 *
 * KG-3A established that a release snapshot row is written once at finalization and never
 * updated -- that immutability is what lets a release still answer "what did citation X say
 * under release A" after release B revised it. Recording approval by UPDATE-ing
 * `regulatory_release_records.reviewState` would break exactly that property: the frozen row
 * would become mutable, and "was this record approved at the time the report was generated"
 * would be unanswerable because only the latest state would survive.
 *
 * So approval is modelled as a decision ABOUT a frozen record, not as a mutation OF it. Each
 * row here is one reviewer decision, retained forever. The effective review state of a record
 * is the latest decision bound to that record's exact checksum, falling back to the state
 * frozen into the snapshot when no decision exists.
 *
 * VERSION BINDING (the property this table exists to guarantee).
 *
 * A decision names `recordChecksum`, not just `(releaseId, citationKey)`. `recordChecksum` is
 * the release-version identity from KG-3A: the sha256 of the exact normalized payload. So:
 *
 *   - Approving release A's `1910.212(a)(1)` records a decision against A's checksum.
 *   - Release B's `1910.212(a)(1)` with revised text has a DIFFERENT checksum, so A's decision
 *     does not match it and B is not approved. Approval cannot be inherited by a changed
 *     version -- not by policy, but because the decision literally does not name that content.
 *   - If B's normalized payload is byte-identical to A's, the checksums are equal. Whether that
 *     identity may carry approval forward is a deliberate governance decision, made explicitly
 *     in `release-record-review.service.ts` (it does NOT carry forward by default; see
 *     `CARRY_FORWARD_ON_IDENTICAL_CONTENT` there).
 *
 * REVOCATION.
 *
 * Revocation appends a `revoked` decision rather than deleting the `approved` one, so the fact
 * that a record WAS approved -- and by whom, when, and on what grounds -- survives the
 * correction. A report generated while the approval stood can still be explained.
 */
@Entity('regulatory_release_record_reviews')
@Index('idx_release_record_review_lookup', ['releaseId', 'citationKey', 'recordChecksum'])
@Index('idx_release_record_review_release_decided', ['releaseId', 'decidedAt'])
export class RegulatoryReleaseRecordReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  releaseId: string;

  /** Logical identity, matching `regulatory_release_records.citationKey`. */
  @Column({ type: 'varchar', length: 200 })
  citationKey: string;

  /** Citation as published, retained so the log is readable without joining the snapshot. */
  @Column({ type: 'varchar', length: 200 })
  citation: string;

  /**
   * VERSION identity this decision is bound to. A decision applies to this exact content and
   * to nothing else.
   */
  @Column({ type: 'char', length: 64 })
  recordChecksum: string;

  @Column({ type: 'varchar', length: 16 })
  decision: ReleaseRecordReviewDecision;

  /**
   * Stable actor identifier for the reviewer. Deliberately a varchar rather than a platform
   * user uuid, for the same reason `knowledge_release_events.actor` is: a regulatory reviewer
   * is an operator/governance identity, not necessarily a tenant user.
   *
   * This is INTERNAL governance provenance. The governed read contract exposes review STATE and
   * `decidedAt` to customers, never reviewer identity (see KG-3B verification, Phase 3).
   */
  @Column({ type: 'varchar', length: 160 })
  reviewerId: string;

  /** Optional qualification of the reviewer, e.g. `CSP`, `regulatory-analyst`. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  reviewerRole: string | null;

  /** Grounds for the decision. Required for revocation so a correction is always explained. */
  @Column({ type: 'text', nullable: true })
  note: string | null;

  /**
   * Snapshot of the record's frozen state at the moment of the decision, so the log records
   * what the reviewer was actually acting on rather than requiring a join to reconstruct it.
   */
  @Column({ type: 'varchar', length: 32 })
  frozenReviewStateAtDecision: string;

  /**
   * KG-3F -- the approval-contract binding this decision was recorded under.
   *
   * NULL means the decision predates the contract and binds via `recordChecksum` alone. Those
   * rows are never rewritten or reinterpreted: they remain true statements about what a reviewer
   * decided under v1. A v1 approval is simply not carried into v2 automatically; it becomes a
   * reaffirmation CANDIDATE that a reviewer must act on explicitly.
   *
   * The two axis digests are denormalized onto the decision so the log answers "what did this
   * reviewer bind to" without joining the snapshot -- and, more importantly, so that a later
   * divergence can be attributed to the content axis or the source-identity axis after the fact.
   */
  @Column({ type: 'integer', nullable: true })
  approvalContractVersion: number | null;

  @Column({ type: 'char', length: 64, nullable: true })
  approvalDigest: string | null;

  @Column({ type: 'char', length: 64, nullable: true })
  substantiveContentDigest: string | null;

  @Column({ type: 'char', length: 64, nullable: true })
  sourceIdentityDigest: string | null;

  /**
   * Set only on an explicit contract reaffirmation: names the v1 decision whose basis the
   * reviewer re-examined. The prior row is retained unchanged -- this is a forward pointer, not
   * an edit -- so "this approval was carried into v2, by whom, and on what grounds" is answerable
   * without inferring it from timestamps.
   */
  @Column({ type: 'uuid', nullable: true })
  supersedesDecisionId: string | null;

  @Column({ type: 'timestamptz' })
  decidedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
