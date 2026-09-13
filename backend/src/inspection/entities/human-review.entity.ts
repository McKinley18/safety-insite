import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Observation } from './observation.entity';
import { HazLenzAnalysis } from './hazlenz-analysis.entity';
import { InspectionFinding } from './inspection-finding.entity';

@Entity('human_reviews')
@Index('idx_human_review_observation_created', ['observationId', 'createdAt'])
@Index('idx_human_review_finding_created', ['findingId', 'createdAt'])
@Index('idx_human_review_finding_status', ['findingId', 'status'])
export class HumanReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  observationId: string;

  @ManyToOne(() => Observation, observation => observation.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'observationId' })
  observation: Observation;

  @Column({ type: 'uuid', nullable: true })
  findingId: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  idempotencyKey: string | null;

  @ManyToOne(() => InspectionFinding, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'findingId' })
  finding: InspectionFinding | null;

  @Column({ type: 'uuid', nullable: true })
  analysisId: string | null;

  @ManyToOne(() => HazLenzAnalysis, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'analysisId' })
  analysis: HazLenzAnalysis | null;

  /**
   * §264 extended this vocabulary with two values rather than overloading the original four.
   *
   * `accepted` means a reviewer accepted a FINDING. `classification_confirmed` means a reviewer
   * settled the operational classification of a server-authored Expert analysis. Collapsing them
   * would destroy the distinction between "a human reviewed this finding" and "a human settled the
   * operational conclusion", which is the whole boundary §255 established.
   *
   * The two settlement values can only appear on a row naming a server-authored analysis, enforced
   * by `ck_hazlenz_analysis_settlement` on the other side of the link.
   */
  @Column({ type: 'varchar', length: 32 })
  decision:
    | 'accepted' | 'edited' | 'overridden' | 'dismissed'
    | 'classification_confirmed' | 'classification_changed';

  @Column({ type: 'varchar', length: 24, default: 'current' })
  status: 'current' | 'superseded' | 'invalidated';

  @Column({ type: 'text' })
  rationale: string;

  @Column({ type: 'jsonb', nullable: true })
  reviewedConclusion: Record<string, unknown> | null;

  @Column({ type: 'uuid' })
  reviewedByUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
