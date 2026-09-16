import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

/**
 * §304 (SE-6) — THE ENTITY NOW STATES THE COLUMN TYPES IT DEPENDS ON.
 *
 * This class used to declare `@Column() organizationId: string` and a bare
 * `@ManyToOne(() => Organization)` with no `@JoinColumn`. Both omissions mattered.
 *
 *   - `@Column()` on a `string` property infers `character varying`. The migration history took
 *     that literally and created the column as varchar, while `organization.id` is `uuid`, so the
 *     relation join became `uuid = character varying` — invalid SQL, and a guaranteed HTTP 500 on
 *     every invitation verification against any database built from migrations. That is SE-6.
 *   - Without `@JoinColumn`, nothing in the entity says which column carries the relation, so the
 *     property and the foreign key were only implicitly connected.
 *
 * Declaring `type: 'uuid'` and naming the join column makes the entity, the migration and the
 * running join state the SAME contract, which is what stops it drifting back the next time someone
 * regenerates or hand-writes a migration for this table.
 */
@Entity()
@Index('idx_invitation_organization_id', ['organizationId'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  /**
   * The invitation secret. Opaque and server-generated (16 random bytes, hex) — never derived from
   * the email address, the organization or anything else a caller could predict.
   *
   * Unique because `verifyInvitation` resolves a single invitation by this value: without the
   * constraint, "find one by token" is a silent non-determinism rather than a lookup.
   */
  @Column({ unique: true })
  token: string;

  @Column({ default: 'Auditor' })
  role: string; // 'Auditor', 'Viewer'

  /**
   * `RESTRICT` because an invitation is a membership-granting credential. An organization that
   * still has invitations outstanding must not be deletable: CASCADE would erase the evidence that
   * they were issued, and a dangling reference could later be reissued to a different organization.
   * This matches `OrganizationMembership`, `site`, `inspection` and `corrective_actions`.
   */
  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
