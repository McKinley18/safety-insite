import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('safescope_supervisor_validations')
export class SafeScopeSupervisorValidation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  reasoningSnapshotId!: string;

  @Column({ nullable: true })
  reportId?: string;

  @Column({ nullable: true })
  workspaceId?: string;

  @Column({ nullable: true })
  reviewerName?: string;

  @Column({
    default: 'accepted',
  })
  validationDecision!:
    | 'accepted'
    | 'modified'
    | 'rejected'
    | 'escalated'
    | 'insufficient_evidence';

  @Column({ type: 'text', nullable: true })
  reviewerNotes?: string;

  @Column({ type: 'jsonb', nullable: true })
  modifiedClassification?: any;

  @Column({ type: 'jsonb', nullable: true })
  modifiedStandards?: any;

  @Column({ type: 'jsonb', nullable: true })
  modifiedRiskAssessment?: any;

  @Column({ type: 'jsonb', nullable: true })
  validationMetadata?: any;

  @CreateDateColumn()
  createdAt!: Date;
}
