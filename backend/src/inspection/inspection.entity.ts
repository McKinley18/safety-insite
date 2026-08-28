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

  /**
   * The customer-facing record number for this inspection, e.g. "Inspection #7".
   *
   * Allocated once at creation and never recomputed. The sequence is PER OWNER (per organization
   * for an organization-scoped inspection, per user otherwise) and starts at 1 in each scope, so it
   * discloses only the account's own volume -- a global sequence would leak every other tenant's
   * inspection count and let adjacent numbers be used for cross-account inference.
   *
   * DISPLAY ONLY. It is never an authorization input, never a route parameter, and never a lookup
   * key across scopes; `id` remains the sole identity the server authorizes on. It is deliberately
   * NOT derived from the uuid and NOT derived from any checksum -- a checksum is integrity metadata
   * that changes whenever the report is regenerated, which is the opposite of what a record number
   * must do.
   *
   * NULLABLE only so migration 1800000017000 can be applied before this code is deployed. Every row
   * the allocator writes carries a value.
   */
  @Column({ type: 'integer', nullable: true })
  displayNumber: number | null;

  @Column({ type: 'varchar', length: 24, default: 'draft' })
  status: 'draft' | 'in_review' | 'completed' | 'archived';

  @Column({ type: 'integer', default: 1 })
  version: number;

  /** See INSPECTION_REGULATORY_CONTEXTS. Persisted; inherited by every finding. */
  @Column({ type: 'varchar', length: 32, default: 'unknown' })
  regulatoryContext: InspectionRegulatoryContext;

  /**
   * The governed knowledge release that governs this inspection's regulatory authority.
   *
   * WRITE-ONCE. Acquired the first time an analysis runs under a governed cutover mode with a
   * release active, and never replaced: reopening, re-analysing or regenerating the report
   * reproduces the regulatory basis the customer was originally given, even after a newer release
   * becomes active. Moving an inspection to a newer release is a migration decision a person makes
   * deliberately -- no request path may make it implicitly, so nothing UPDATEs a non-NULL value
   * (see `standards/releases/inspection-release-binding.ts`).
   *
   * NULL is the ordinary state and is honest: no governed release informed this inspection. It is
   * never backfilled -- stamping an id onto an inspection whose retrieval was genuinely unscoped
   * would be the false provenance KG-1 exists to prevent. Sibling of `regulatoryContext`: both are
   * inspection-level regulatory facts every analysis in the workflow inherits.
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  knowledgeReleaseId: string | null;

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
