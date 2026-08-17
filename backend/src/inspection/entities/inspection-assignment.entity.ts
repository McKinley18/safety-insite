import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Inspection } from '../inspection.entity';

@Entity('inspection_assignments')
@Index('uq_active_inspection_assignment', ['inspectionId', 'userId', 'role'], { unique: true })
export class InspectionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inspectionId: string;

  @ManyToOne(() => Inspection, inspection => inspection.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspectionId' })
  inspection: Inspection;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 24 })
  role: 'collaborator' | 'reviewer';

  @Column({ type: 'uuid' })
  assignedByUserId: string;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
