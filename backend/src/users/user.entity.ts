import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  type: string; // 'individual', 'pro', 'company'

  @Column({ default: 'basic' })
  planCode: string; // 'basic', 'plus', 'company'

  @Column({ default: 'Auditor' })
  role: string; // 'Owner', 'Auditor', 'Viewer'

  @Column({ default: 'active' })
  subscriptionStatus: string; // 'active', 'past_due', 'canceled', 'trial'

  @Column({ nullable: true })
  nextBillingDate: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Organization, { nullable: true })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;
}
