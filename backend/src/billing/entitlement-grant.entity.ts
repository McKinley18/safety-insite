import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('entitlement_grants')
@Index('idx_entitlement_grant_user_status_expiry', ['userId', 'status', 'endsAt'])
export class EntitlementGrant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 32 })
  source: 'pilot' | 'test' | 'support';

  @Column({ type: 'varchar', length: 32, default: 'pro' })
  tier: 'pro';

  @Column({ type: 'varchar', length: 24, default: 'active' })
  status: 'active' | 'revoked' | 'expired';

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @Column({ type: 'uuid', nullable: true })
  issuedByUserId: string | null;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
