import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('corrective_actions')
export class CorrectiveAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  displayId: string;

  @Column({ type: 'uuid', nullable: true })
  reportId: string | null;

  @Column({ type: 'uuid', nullable: true })
  inspectionId: string | null;

  @Column({ nullable: true })
  findingId: string;

  @Column({ default: 'default' })
  tenantId: string;

  @Column({ nullable: true })
  classificationId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  ownerUserId: string;

  @Column({ nullable: true })
  assignedToUserId: string;

  @Column({ nullable: true })
  assignedToName: string;

  @Column()
  priorityCode: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ default: 'open' })
  statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled';

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column('text', { nullable: true })
  closureNotes: string;

  @Column({ nullable: true })
  verifiedByUserId: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Now adding the new fields
  @Column({ nullable: true })
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  originalSuggestion: any;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  source: string;
}
