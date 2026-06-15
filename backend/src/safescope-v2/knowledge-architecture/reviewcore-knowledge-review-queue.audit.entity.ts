import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ReviewCoreQueueGovernanceTrace } from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreQueueGuardrails } from './reviewcore-knowledge-review-queue.service';

@Entity('reviewcore_knowledge_review_queue_audit_events')
export class ReviewCoreKnowledgeReviewQueueAuditEntity {
  @PrimaryColumn()
  eventId!: string;

  @Column()
  action!: string;

  @Column()
  actorId!: string;

  @Column()
  actorRole!: string;

  @Column()
  planTier!: string;

  @Column({ nullable: true })
  recordId?: string;

  @Column()
  timestamp!: string;

  @Column()
  allowed!: boolean;

  @Column()
  denied!: boolean;

  @Column({ nullable: true })
  reason?: string;

  @Column('simple-array')
  blockers!: string[];

  @Column({ nullable: true })
  beforeStatus?: string;

  @Column({ nullable: true })
  afterStatus?: string;

  @Column()
  activeRetrievalEligible!: boolean;

  @Column('simple-json')
  guardrailSnapshot!: ReviewCoreQueueGuardrails;

  @Column('simple-json')
  governanceTrace!: ReviewCoreQueueGovernanceTrace;

  @Column('text')
  originalPayload!: string;
}
