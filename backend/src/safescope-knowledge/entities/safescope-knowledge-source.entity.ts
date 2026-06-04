import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SafeScopeKnowledgeSourceStatus =
  | 'active'
  | 'paused'
  | 'disabled';

export type SafeScopeKnowledgeSourceTrustLevel =
  | 'official'
  | 'research'
  | 'internal'
  | 'external_review_required';

@Entity('safescope_knowledge_sources')
export class SafeScopeKnowledgeSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 40 })
  agency: string;

  @Column({ type: 'varchar', length: 80 })
  sourceType: string;

  @Column({ type: 'varchar', length: 80, default: 'official' })
  trustLevel: SafeScopeKnowledgeSourceTrustLevel;

  @Column({ type: 'int', default: 3 })
  defaultAuthorityTier: number;

  @Column({ type: 'text' })
  baseUrl: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'active' })
  status: SafeScopeKnowledgeSourceStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulIngestionAt?: Date | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  lastKnownVersion?: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadataJson: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
