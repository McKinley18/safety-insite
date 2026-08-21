import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ReleaseRecordReviewState } from './review-state';

/**
 * KG-3A -- the immutable per-release content snapshot (defect C).
 *
 * ROOT CAUSE THIS REPLACES: release membership used to be `standards_master.release_id`, a
 * single mutable scalar column on the live, mutable corpus table. A scalar can only ever name
 * ONE release, so it recorded "the most recent release that included this row", not "which
 * releases contain this row". `finalize-regulatory-release.ts` re-stamped that column on EVERY
 * row (its SELECT has no WHERE clause), so finalizing release B silently emptied release A.
 *
 * Membership alone would not have been enough either: `standards_master` rows are mutable, so a
 * junction table would pin WHICH rows a release contains while their CONTENT kept changing
 * underneath it. A release must be able to answer "what did citation X say under release A"
 * after B has changed it, so the snapshot stores the normalized record itself.
 *
 * Rows here are written once at finalization and never updated. `payload` is exactly the
 * normalized projection the record checksum is taken over, so a release manifest can be
 * re-verified forever without consulting the live corpus.
 */
@Entity('regulatory_release_records')
@Index('uq_regulatory_release_record_citation', ['releaseId', 'citationKey'], { unique: true })
@Index('idx_regulatory_release_record_release', ['releaseId'])
@Index('idx_regulatory_release_record_citation_key', ['citationKey'])
export class RegulatoryReleaseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  releaseId: string;

  /** Provenance link to the standards_master row captured. Nullable: the live row may later be removed. */
  @Column({ type: 'uuid', nullable: true })
  standardId: string | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  agencyCode: string | null;

  /**
   * Logical regulatory identity as published, e.g. `29 CFR 1910.212(a)(1)`. Stable across
   * releases -- this is the citation a finding cites.
   */
  @Column({ type: 'varchar', length: 200 })
  citation: string;

  /**
   * Normalized form of `citation`, used for release-scoped lookup so that formatting
   * differences ("1910.212(a)(1)" vs "29 CFR 1910.212(a)(1)") resolve to the same logical
   * standard. Unique within a release: one version of a citation per release.
   */
  @Column({ type: 'varchar', length: 200 })
  citationKey: string;

  /** sha256 of `payload`. The release-version identity of this record. */
  @Column({ type: 'char', length: 64 })
  recordChecksum: string;

  /** Review state AS AT SNAPSHOT TIME. Frozen with the content it describes. */
  @Column({ type: 'varchar', length: 32 })
  reviewState: ReleaseRecordReviewState;

  @Column({ type: 'text', nullable: true })
  reviewStateReason: string | null;

  /** The exact normalized record the checksum covers. */
  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  /**
   * KG-3F -- the APPROVAL identity, parallel to the manifest identity above.
   *
   * `recordChecksum` answers "was this release tampered with". These answer "does a reviewer's
   * decision still truthfully name this content", which covers a different field set: granularity
   * (`part_number`/`subpart`) and force (`deprecation_status`) are approval-material but were
   * never in the manifest projection, while retrieval/transport metadata is in neither.
   *
   * Split into two axes so that when the digest moves, the carry-forward report can say WHICH
   * kind of change moved it -- a revised regulation needs a fresh legal reading, a re-derivation
   * from a different authoritative edition needs a provenance re-attestation. See
   * `approval-contract.ts`.
   *
   * NULL means the record predates the contract. It is never backfilled: the frozen `payload`
   * does not contain the newly-covered fields, and recomputing them from the mutable live corpus
   * would attest a reviewer to content they may never have seen.
   */
  @Column({ type: 'integer', nullable: true })
  approvalContractVersion: number | null;

  @Column({ type: 'char', length: 64, nullable: true })
  substantiveContentDigest: string | null;

  @Column({ type: 'char', length: 64, nullable: true })
  sourceIdentityDigest: string | null;

  /** What an approval decision names. Composed from the two digests above plus the version. */
  @Column({ type: 'char', length: 64, nullable: true })
  approvalDigest: string | null;

  /** The exact projections the approval digests cover, so v2 is re-verifiable without the corpus. */
  @Column({ type: 'jsonb', nullable: true })
  approvalPayload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
