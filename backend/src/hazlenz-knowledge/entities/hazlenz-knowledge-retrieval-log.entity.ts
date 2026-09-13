import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('safescope_knowledge_retrieval_logs')
export class SafeScopeKnowledgeRetrievalLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  workspaceId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  reportId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  findingId?: string | null;

  @Column({ type: 'text' })
  queryText: string;

  @Column({ type: 'jsonb', default: [] })
  retrievedChunkIds: string[];

  @Column({ type: 'jsonb', default: [] })
  selectedChunkIds: string[];

  @Column({ type: 'float', default: 0 })
  confidence: number;

  @Column({ type: 'jsonb', default: {} })
  reasoningJson: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
