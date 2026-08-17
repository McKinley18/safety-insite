import { Check, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tasks')
@Check(
  'chk_task_exactly_one_scope',
  '(("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))',
)
@Index('idx_task_org_due', ['organizationId', 'dueDate'])
@Index('idx_task_owner_due', ['ownerUserId', 'dueDate'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedToUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  siteId: string | null;

  @Column({ type: 'uuid', nullable: true })
  inspectionId: string | null;

  @Column({ type: 'uuid', nullable: true })
  correctiveActionId: string | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'varchar', length: 16, default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'varchar', length: 16, default: 'open' })
  status: 'open' | 'completed' | 'cancelled';

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
