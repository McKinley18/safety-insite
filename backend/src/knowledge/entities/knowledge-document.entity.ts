import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KnowledgeChunk } from './knowledge-chunk.entity';

export type KnowledgeAgency =
  | 'MSHA'
  | 'OSHA'
  | 'NIOSH'
  | 'Internal'
  | 'Other';

export type KnowledgeSourceType =
  | 'regulation'
  | 'policy'
  | 'interpretation'
  | 'directive'
  | 'accident_report'
  | 'fatality_report'
  | 'journal'
  | 'case_study'
  | 'internal_report'
  | 'corrective_action'
  | 'training'
  | 'other';

export type KnowledgeApprovalStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived';

@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 240 })
  title: string;

  @Column({ type: 'varchar', length: 40, default: 'Other' })
  agency: KnowledgeAgency;

  @Column({ type: 'varchar', length: 60, default: 'other' })
  sourceType: KnowledgeSourceType;

  @Column({ type: 'int', default: 5 })
  authorityTier: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  citation?: string | null;

  @Column({ type: 'text', nullable: true })
  sourceUrl?: string | null;

  @Column({ type: 'date', nullable: true })
  publishedAt?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'draft' })
  approvalStatus: KnowledgeApprovalStatus;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  rawText: string;

  @Column({ type: 'jsonb', default: [] })
  hazardTags: string[];

  @Column({ type: 'jsonb', default: [] })
  equipmentTags: string[];

  @Column({ type: 'jsonb', default: [] })
  taskTags: string[];

  @Column({ type: 'jsonb', default: [] })
  standardTags: string[];

  @OneToMany(() => KnowledgeChunk, (chunk) => chunk.document, {
    cascade: true,
  })
  chunks: KnowledgeChunk[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
