import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * KG-3B adds `record_approval` / `record_revocation`. Reviewer decisions are recorded in this
 * same trail rather than a parallel one, so a release's timeline -- activations, rollbacks and
 * the reviews that made activation eligible in the first place -- reads in one ordered history.
 * The column carries no CHECK constraint, so the vocabulary extends without a schema change.
 */
export type KnowledgeReleaseEventType =
  | 'activation'
  | 'rollback'
  | 'record_approval'
  | 'record_revocation';
export type KnowledgeReleaseEventOutcome = 'succeeded' | 'refused';

/**
 * KG-2 audit trail for movements of the active-release pointer.
 *
 * A separate table rather than the existing `security_audit_events` because that table is
 * user/organization-scoped: its `resourceId` and `actorUserId` are `uuid` columns, and a
 * release is identified by a varchar releaseId (`federal-core-2026-07-30.1`) acted on by a
 * system/operator identity that is not a platform user. Squeezing releases into it would
 * mean storing a non-uuid identity in a uuid column. `knowledge_release_events` is also the
 * structure named by KNOWLEDGE_VERSIONING_AND_ROLLBACK.md §5 and the KG-2 backlog entry, so
 * this follows the authoritative design rather than inventing a parallel one.
 *
 * Refused attempts are recorded as well as successful ones: "someone tried to activate a
 * tampered release and was stopped" is exactly the kind of event an audit needs to retain.
 */
@Entity('knowledge_release_events')
@Index('idx_knowledge_release_event_to_created', ['toReleaseId', 'createdAt'])
export class KnowledgeReleaseEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 24 })
  event: KnowledgeReleaseEventType;

  @Column({ type: 'varchar', length: 16 })
  outcome: KnowledgeReleaseEventOutcome;

  /** The release that was active before this event. NULL for a first activation. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  fromReleaseId: string | null;

  /** The release this event targeted. */
  @Column({ type: 'varchar', length: 120 })
  toReleaseId: string;

  @Column({ type: 'varchar', length: 160 })
  actor: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  /** Gate results as actually evaluated -- the evidence for a refusal. */
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
