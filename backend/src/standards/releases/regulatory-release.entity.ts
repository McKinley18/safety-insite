import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * KG-2. Lifecycle states a regulatory release can hold.
 *
 * `draft` and `provisional` already existed: `draft` is the column default and
 * `provisional` is what `standards/seed/finalize-regulatory-release.ts` writes. `provisional`
 * IS this system's "finalized" state -- it is deliberately reused rather than renamed or
 * paralleled by a new `finalized` value, which would create two words for one concept.
 *
 * `active`, `superseded` and `rolled_back` are added by KG-2 and match
 * KNOWLEDGE_VERSIONING_AND_ROLLBACK.md §3.2. The `candidate` / `validated` / `approved`
 * states from that document are deliberately NOT added here: nothing in the system can
 * produce or consume them until the validation battery (KG-12) exists, and unreachable
 * states are worse than absent ones.
 */
export const REGULATORY_RELEASE_STATUSES = [
  'draft',
  'provisional',
  'active',
  'superseded',
  'rolled_back',
] as const;

export type RegulatoryReleaseStatus = typeof REGULATORY_RELEASE_STATUSES[number];

@Entity('regulatory_releases')
@Index('uq_regulatory_release_active', ['status'], { unique: true, where: `status = 'active'` })
export class RegulatoryRelease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  releaseId: string;

  @Column({ type: 'varchar', length: 80 })
  releaseVersion: string;

  @Column({ type: 'varchar', length: 24, default: 'draft' })
  status: RegulatoryReleaseStatus;

  @Column({ type: 'char', length: 64 })
  manifestChecksum: string;

  @Column({ type: 'varchar', length: 80 })
  parserVersion: string;

  @Column({ type: 'integer', default: 0 })
  recordCount: number;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  /**
   * KG-2. The release this one replaced when it became active -- recorded AT activation
   * time, not reconstructed afterwards from timestamps. This is what makes rollback a
   * one-step operation against an exact known release rather than "newest minus one".
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  parentReleaseId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deactivatedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
