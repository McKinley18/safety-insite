import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity';

@Entity('knowledge_chunks')
export class KnowledgeChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => KnowledgeDocument, (document) => document.chunks, {
    onDelete: 'CASCADE',
  })
  document: KnowledgeDocument;

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

  @Column({ type: 'varchar', length: 120, nullable: true })
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

  @Column({ type: 'float', default: 0 })
  confidenceWeight: number;

  @CreateDateColumn()
  createdAt: Date;
}
