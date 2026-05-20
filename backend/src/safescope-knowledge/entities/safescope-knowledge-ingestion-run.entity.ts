import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type SafeScopeKnowledgeIngestionStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed';

@Entity('safescope_knowledge_ingestion_runs')
export class SafeScopeKnowledgeIngestionRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  sourceId?: string | null;

  @Column({ type: 'varchar', length: 160 })
  sourceName: string;

  @Column({ type: 'varchar', length: 40 })
  agency: string;

  @Column({ type: 'varchar', length: 80 })
  sourceType: string;

  @Column({ type: 'varchar', length: 40, default: 'queued' })
  status: SafeScopeKnowledgeIngestionStatus;

  @Column({ type: 'int', default: 0 })
  discoveredCount: number;

  @Column({ type: 'int', default: 0 })
  ingestedCount: number;

  @Column({ type: 'int', default: 0 })
  pendingReviewCount: number;

  @Column({ type: 'int', default: 0 })
  approvedCount: number;

  @Column({ type: 'int', default: 0 })
  skippedCount: number;

  @Column({ type: 'jsonb', default: [] })
  warnings: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadataJson: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
