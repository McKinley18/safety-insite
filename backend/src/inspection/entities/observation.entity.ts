import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Inspection } from '../inspection.entity';
import { HazLenzAnalysis } from './hazlenz-analysis.entity';
import { HumanReview } from './human-review.entity';
import { InspectionFinding } from './inspection-finding.entity';

@Entity('observations')
@Index('idx_observation_inspection_created', ['inspectionId', 'createdAt'])
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inspectionId: string;

  @ManyToOne(() => Inspection, inspection => inspection.observations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspectionId' })
  inspection: Inspection;

  @Column({ type: 'text' })
  rawText: string;

  @Column({ type: 'varchar', length: 32, default: 'direct_observation' })
  evidenceSource: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  /**
   * Client-minted idempotency identity for one offline observation. Unique per
   * (inspectionId, createdByUserId) -- partial index `uq_observation_client_request`,
   * migration 1800000015000. NULL for the online path and everything predating the column.
   */
  @Column({ type: 'varchar', length: 128, nullable: true })
  clientRequestId: string | null;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => HazLenzAnalysis, analysis => analysis.observation)
  analyses: HazLenzAnalysis[];

  @OneToMany(() => HumanReview, review => review.observation)
  reviews: HumanReview[];

  @OneToMany(() => InspectionFinding, finding => finding.observation)
  findings: InspectionFinding[];
}
