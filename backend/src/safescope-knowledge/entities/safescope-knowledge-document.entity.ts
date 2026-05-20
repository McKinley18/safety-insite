import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SafeScopeKnowledgeChunk } from './safescope-knowledge-chunk.entity';

export type SafeScopeKnowledgeAgency =
  | 'MSHA'
  | 'OSHA'
  | 'NIOSH'
  | 'Internal'
  | 'Other';

export type SafeScopeKnowledgeSourceType =
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

export type SafeScopeKnowledgeApprovalStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived';

@Entity('safescope_knowledge_documents')
export class SafeScopeKnowledgeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 240 })
  title: string;

  @Column({ type: 'varchar', length: 40, default: 'Other' })
  agency: SafeScopeKnowledgeAgency;

  @Column({ type: 'varchar', length: 60, default: 'other' })
  sourceType: SafeScopeKnowledgeSourceType;

  @Column({ type: 'int', default: 5 })
  authorityTier: number;

  @Column({ type: 'varchar', length: 160, nullable: true })
  citation?: string | null;

  @Column({ type: 'text', nullable: true })
  sourceUrl?: string | null;

  @Column({ type: 'date', nullable: true })
  publishedAt?: string | null;

  @Column({ type: 'date', nullable: true })
  reviewedAt?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'draft' })
  approvalStatus: SafeScopeKnowledgeApprovalStatus;

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

  @Column({ type: 'jsonb', default: [] })
  lessonTags: string[];

  @OneToMany(() => SafeScopeKnowledgeChunk, (chunk) => chunk.document, {
    cascade: true,
  })
  chunks: SafeScopeKnowledgeChunk[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
