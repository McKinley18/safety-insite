import {
  Check,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Hazard } from './hazard.entity';
import { InspectionAssignment } from './entities/inspection-assignment.entity';
import { Observation } from './entities/observation.entity';
import { InspectionFinding } from './entities/inspection-finding.entity';

/**
 * Inspection-level regulatory context. Established ONCE at inspection setup and
 * inherited by every observation/finding in the inspection, so HazLenz never has to
 * ask "which jurisdiction?" per finding. Values reuse the exact jurisdiction vocabulary
 * HazLenz's evidence model already speaks (StructuredObservationJurisdiction /
 * buildEvidenceFacts' `jurisdiction` fact) -- not a second competing enum.
 *
 * `unknown` means "Not sure / Let HazLenz determine": HazLenz may infer a likely
 * regime from strong observation evidence (labelled HAZLENZ_INFERRED, never presented
 * as user-confirmed) or honestly keep candidates conditional and ask ONE targeted
 * jurisdiction question, whose answer is then persisted back here.
 */
export const INSPECTION_REGULATORY_CONTEXTS = [
  'osha-general-industry',
  'osha-construction',
  'msha',
  'unknown',
] as const;
export type InspectionRegulatoryContext = (typeof INSPECTION_REGULATORY_CONTEXTS)[number];

/** Provenance is derived, not stored: a non-unknown value can only come from the user. */
export function regulatoryContextProvenance(value: string | null | undefined): 'USER_CONFIRMED' | 'UNKNOWN' {
  return value && value !== 'unknown' && (INSPECTION_REGULATORY_CONTEXTS as readonly string[]).includes(value)
    ? 'USER_CONFIRMED'
    : 'UNKNOWN';
}

@Entity()
@Check(
  'chk_inspection_exactly_one_scope',
  '(("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))',
)
@Index('idx_inspection_site_status', ['siteId', 'status'])
@Index('idx_inspection_org_status', ['organizationId', 'status'])
@Index('idx_inspection_owner_status', ['ownerUserId', 'status'])
// The uniqueness that makes clientRequestId authoritative is a PARTIAL index (WHERE
// "clientRequestId" IS NOT NULL) and is created by migration 1800000015000. TypeORM's decorator
// cannot express a partial index, so it is declared there and only documented here -- do not
// "fix" this by adding @Index([...], { unique: true }), which would try to constrain every NULL
// row and reject the existing corpus.
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'uuid' })
  siteId: string;

  @Column()
  title: string;

  /**
   * Opaque idempotency identity minted by the CLIENT once per local inspection and replayed on
   * every synchronisation attempt. Unique per creating user (partial index
   * `uq_inspection_client_request`, migration 1800000015000), so a create whose response was lost
   * resolves back to the same row instead of producing a duplicate.
   *
   * NULL for every inspection created without one -- the whole online path, and everything that
   * existed before the column. It is an identity, never an authorisation input.
   */
  @Column({ type: 'varchar', length: 128, nullable: true })
  clientRequestId: string | null;

  @Column({ type: 'varchar', length: 24, default: 'draft' })
  status: 'draft' | 'in_review' | 'completed' | 'archived';

  @Column({ type: 'integer', default: 1 })
  version: number;

  /** See INSPECTION_REGULATORY_CONTEXTS. Persisted; inherited by every finding. */
  @Column({ type: 'varchar', length: 32, default: 'unknown' })
  regulatoryContext: InspectionRegulatoryContext;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  completedByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Hazard, (hazard) => hazard.inspection, {
    cascade: true,
  })
  hazards: Hazard[];

  @OneToMany(() => InspectionAssignment, assignment => assignment.inspection)
  assignments: InspectionAssignment[];

  @OneToMany(() => Observation, observation => observation.inspection)
  observations: Observation[];

  @OneToMany(() => InspectionFinding, finding => finding.inspection)
  findings: InspectionFinding[];
}
