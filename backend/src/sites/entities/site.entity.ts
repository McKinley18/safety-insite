import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/user.entity';

@Entity()
@Check(
  'chk_site_exactly_one_owner',
  '(("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))',
)
@Index('idx_site_owner_archived', ['ownerUserId', 'archivedAt'])
@Index('idx_site_organization_archived', ['organizationId', 'archivedAt'])
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, org => org.sites, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerUserId' })
  owner: User;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  /**
   * §309 (SC-2) — DECLARED `timestamp`, BECAUSE THAT IS WHAT THE COLUMN IS.
   *
   * The canonical database holds `timestamp without time zone` here and the entity claimed
   * `timestamptz`. §309 measured what that mismatch actually does, and the measurement is the
   * reason for this direction rather than the other one:
   *
   *   - Under a UTC process the round trip is EXACT either way. Production runs UTC, which is why
   *     nothing has ever gone wrong and why this was an annotation defect rather than a
   *     data-integrity one.
   *   - Under a non-UTC process the instant moves by the offset — and it moves IDENTICALLY whether
   *     the entity says `timestamp` or `timestamptz`. The declaration is not the mechanism. An
   *     offset the column never stored cannot be recovered by claiming it is there.
   *
   * So `timestamptz` here was a claim the storage could not honour. Removing it changes no runtime
   * behaviour whatsoever and makes the contract true. Converting the COLUMN is the only change that
   * would make these instants portable, and that means rewriting stored customer timestamps against
   * an assumed offset — which §305 refused and §309 forbids without evidence. The residual is
   * registered rather than hidden: these are INSTANTS held in naive columns, lossless because the
   * deployment runs UTC.
   *
   * Authorization-sensitive timestamps are NOT affected: `passwordChangedAt`,
   * `passwordResetExpiresAt` and `refresh_tokens.expiresAt` are genuinely `timestamptz` in the
   * database, §307 proved it, and §309 leaves all three untouched.
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  archivedByUserId: string | null;
}
