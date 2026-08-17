import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Observation } from './observation.entity';

@Entity('hazlenz_analyses')
@Index('idx_hazlenz_analysis_observation_created', ['observationId', 'createdAt'])
@Index('uq_hazlenz_analysis_observation_idempotency', ['observationId', 'idempotencyKey'], { unique: true })
@Index('uq_hazlenz_analysis_observation_version', ['observationId', 'requestVersion'], { unique: true })
export class HazLenzAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  observationId: string;

  @ManyToOne(() => Observation, observation => observation.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'observationId' })
  observation: Observation;

  @Column({ type: 'varchar', length: 80 })
  engineVersion: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  traceId: string | null;

  @Column({ type: 'varchar', length: 128 })
  idempotencyKey: string;

  @Column({ type: 'integer' })
  requestVersion: number;

  @Column({ type: 'varchar', length: 24, default: 'current' })
  status: 'current' | 'superseded';

  @Column({ type: 'jsonb' })
  resultSnapshot: Record<string, unknown>;

  @Column({ type: 'varchar', length: 24, default: 'advisory' })
  advisoryStatus: 'advisory';

  @Column({ type: 'uuid' })
  requestedByUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
