import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('safescope_reasoning_snapshots')
export class SafeScopeReasoningSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  reportId?: string;

  @Column({ nullable: true })
  workspaceId?: string;

  @Column({ nullable: true })
  classification?: string;

  @Column({ nullable: true })
  engineVersion?: string;

  @Column({ type: 'jsonb', nullable: true })
  intelligenceMetadata?: any;

  @Column({ type: 'jsonb', nullable: true })
  confidenceCalibration?: any;

  @Column({ type: 'jsonb', nullable: true })
  reasoningDrift?: any;

  @Column({ type: 'jsonb', nullable: true })
  workspaceLearning?: any;

  @Column({ type: 'jsonb', nullable: true })
  operationalReasoning?: any;

  @Column({ type: 'jsonb', nullable: true })
  standardsReasoning?: any;

  @Column({ type: 'jsonb', nullable: true })
  decisionExplainability?: any;

  @Column({ type: 'jsonb', nullable: true })
  equipmentReasoningSummary?: any;

  @Column({ type: 'jsonb', nullable: true })
  equipmentTaskMechanismContext?: any;

  @Column({ type: 'jsonb', nullable: true })
  equipmentArchetypeContext?: any;

  @Column({ type: 'jsonb', nullable: true })
  fullIntelligenceSnapshot?: any;

  @Column({ default: 'generated' })
  validationStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
