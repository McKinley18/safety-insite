import { Entity, Column, PrimaryColumn } from 'typeorm';
import { KnowledgeQueueGovernanceTrace } from './knowledge-review-queue.api-types';
import { KnowledgeQueueGuardrails } from './knowledge-review-queue.service';

@Entity('reviewcore_knowledge_review_queue_audit_events')
export class KnowledgeReviewQueueAuditEntity {
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
  guardrailSnapshot!: KnowledgeQueueGuardrails;

  @Column('simple-json')
  governanceTrace!: KnowledgeQueueGovernanceTrace;

  @Column('text')
  originalPayload!: string;
}
