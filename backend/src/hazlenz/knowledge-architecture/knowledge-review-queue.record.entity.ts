import { Entity, Column, PrimaryColumn } from 'typeorm';
import { KnowledgeQueueGovernanceTrace } from './knowledge-review-queue.api-types';
import { KnowledgeQueueGuardrails } from './knowledge-review-queue.service';

@Entity('reviewcore_knowledge_review_queue_records')
export class KnowledgeReviewQueueRecordEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column()
  domain!: string;

  @Column('simple-array')
  tags!: string[];

  @Column()
  authorityTier!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  primaryCitation?: string;

  @Column()
  fingerprint!: string;

  @Column('simple-json')
  guardrails!: KnowledgeQueueGuardrails;

  @Column()
  createdBy!: string;

  @Column()
  createdAt!: string;

  @Column()
  updatedAt!: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ nullable: true })
  approvedAt?: string;

  @Column({ nullable: true })
  rejectedBy?: string;

  @Column({ nullable: true })
  rejectedAt?: string;

  @Column({ nullable: true })
  supersededBy?: string;

  @Column({ nullable: true })
  supersededAt?: string;

  @Column({ nullable: true })
  replacementRecordId?: string;

  @Column()
  activeRetrievalEligible!: boolean;

  @Column({ nullable: true })
  activeRetrievalChangedAt?: string;

  @Column('simple-json')
  governanceTrace!: KnowledgeQueueGovernanceTrace;

  @Column('text')
  originalPayload!: string;
}
