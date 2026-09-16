import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  @Index()
  passwordResetTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordResetExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @Column()
  type: string; // 'individual', 'pro', 'company'

  @Column({ default: 'free' })
  planCode: string; // 'free', 'pro' with legacy basic/plus/company/expert values normalized to 'pro'

  @Column({ default: 'Auditor' })
  role: string; // 'Owner', 'Auditor', 'Viewer'

  @Column({ default: 'none' })
  subscriptionStatus: string; // 'none', 'active', 'trialing', 'past_due', 'canceled'

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
  @Column({ type: 'timestamp', nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Organization, { nullable: true })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string | null;
}
