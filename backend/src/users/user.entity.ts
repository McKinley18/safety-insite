import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

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

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Organization, { nullable: true })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string | null;
}
