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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  archivedByUserId: string | null;
}
