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

  /**
   * §287 / D-052 — THE COMPLETION AXIS.
   *
   * Who closed this action, and when. Until §287 the table had nowhere to record either, so
   * closure wrote to the VERIFICATION pair below and the product then read those columns back and
   * reported that the correction had been independently verified by a supervisor. It had not.
   *
   * Closing writes these. Reopening clears them, because an action that is open again was not
   * closed at the time it now claims.
   */
  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  closedByUserId: string | null;

  /**
   * §287 / D-052 — THE VERIFICATION AXIS, which is a DIFFERENT QUESTION from completion.
   *
   * "The work was done" and "someone independently confirmed the work was done" are two claims,
   * and on a compliance record the second is the one that carries weight. These are written ONLY
   * when a verification actually happens. Closing an action does not set them, and their absence
   * on a closed action is the truthful statement that closure was recorded and verification was
   * not -- never an omission to be filled in by inference.
   */
  @Column({ nullable: true })
  verifiedByUserId: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  /**
   * §287 / D-053. Optional client-generated idempotency key, matching the shape
   * `CreateInspectionDto` and `CreateObservationDto` already use. Scoped unique per
   * (tenantId, ownerUserId) by a partial index; see the migration for why it is partial.
   */
  @Column({ type: 'varchar', nullable: true })
  clientRequestId: string | null;

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
