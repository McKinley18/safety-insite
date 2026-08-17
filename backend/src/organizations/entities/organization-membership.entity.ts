import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Organization } from './organization.entity';

export type OrganizationRole = 'member' | 'manager' | 'organization_admin';
export type MembershipStatus = 'invited' | 'active' | 'suspended' | 'ended';

@Entity('organization_memberships')
@Index('idx_membership_organization_status', ['organizationId', 'status'])
@Index('idx_membership_user_status', ['userId', 'status'])
export class OrganizationMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 32, default: 'member' })
  role: OrganizationRole;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: MembershipStatus;

  @Column({ type: 'uuid', nullable: true })
  invitedByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  joinedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
