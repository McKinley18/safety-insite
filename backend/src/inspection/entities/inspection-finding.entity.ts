import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Inspection } from '../inspection.entity';
import { Observation } from './observation.entity';
import { HumanReview } from './human-review.entity';

@Entity('inspection_findings')
@Index('idx_inspection_finding_inspection_status', ['inspectionId', 'status'])
@Index('uq_inspection_finding_segment_revision', ['observationId', 'segmentKey', 'revision'], { unique: true })
@Index('idx_inspection_finding_observation_hazard', ['observationId', 'hazardKey', 'status'])
export class InspectionFinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inspectionId: string;

  @ManyToOne(() => Inspection, inspection => inspection.findings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspectionId' })
  inspection: Inspection;

  @Column({ type: 'uuid' })
  observationId: string;

  @ManyToOne(() => Observation, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'observationId' })
  observation: Observation;

  @Column({ type: 'uuid', nullable: true })
  selectedAnalysisId: string | null;

  @Column({ type: 'uuid', nullable: true })
  finalReviewId: string | null;

  @ManyToOne(() => HumanReview, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'finalReviewId' })
  finalReview: HumanReview | null;

  @Column({ type: 'varchar', length: 24 })
  status: 'pending_review' | 'finalized' | 'dismissed' | 'superseded';

  @Column({ type: 'varchar', length: 160, nullable: true })
  hazardCategory: string | null;

  @Column({ type: 'varchar', length: 120, default: 'primary' })
  segmentKey: string;

  /** Stable, machine-derived identity for a decomposition hazard. */
  @Column({ type: 'varchar', length: 120, default: 'primary' })
  hazardKey: string;

  @Column({ type: 'uuid', nullable: true })
  originatingAnalysisId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  sourceCandidate: Record<string, unknown> | null;

  /**
   * Finding-scoped risk (V5-C01). Computed independently per decomposed hazard at
   * reconciliation time (system_generated) and optionally overridden per finding at
   * finalization time (reviewer_confirmed). Never shared across sibling findings from
   * the same observation/review -- see PRA-006.
   */
  @Column({ type: 'jsonb', nullable: true })
  riskSnapshot: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 16, default: 'single' })
  reviewerDisposition: 'single' | 'split' | 'merged';

  @Column({ type: 'text' })
  conclusion: string;

  @Column({ type: 'integer', default: 1 })
  revision: number;

  @Column({ type: 'uuid', nullable: true })
  finalizedByUserId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
