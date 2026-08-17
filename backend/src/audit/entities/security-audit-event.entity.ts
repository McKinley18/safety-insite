import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('security_audit_events')
@Index('idx_security_audit_actor_created', ['actorUserId', 'createdAt'])
@Index('idx_security_audit_organization_created', ['organizationId', 'createdAt'])
export class SecurityAuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ type: 'varchar', length: 80 })
  resourceType: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
