import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SafeScopeKnowledgeDocument } from './safescope-knowledge-document.entity';

@Entity('safescope_knowledge_chunks')
export class SafeScopeKnowledgeChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SafeScopeKnowledgeDocument, (document) => document.chunks, {
    onDelete: 'CASCADE',
  })
  document: SafeScopeKnowledgeDocument;

  @Column({ type: 'uuid' })
  documentId: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'varchar', length: 220, nullable: true })
  sectionHeading?: string | null;

  @Column({ type: 'text' })
  chunkText: string;

  @Column({ type: 'text', nullable: true })
  chunkSummary?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  citation?: string | null;

  @Column({ type: 'int', default: 5 })
  authorityTier: number;

  @Column({ type: 'jsonb', default: [] })
  hazardTags: string[];

  @Column({ type: 'jsonb', default: [] })
  equipmentTags: string[];

  @Column({ type: 'jsonb', default: [] })
  taskTags: string[];

  @Column({ type: 'jsonb', default: [] })
  standardTags: string[];

  @Column({ type: 'jsonb', default: [] })
  lessonTags: string[];

  @Column({ type: 'float', default: 0 })
  confidenceWeight: number;

  @CreateDateColumn()
  createdAt: Date;
}
