import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type FeedbackAction =
  | 'accepted'
  | 'rejected'
  | 'flagged'
  | 'changed';

@Entity('safescope_feedback')
@Index(['workspaceId'])
@Index(['classification'])
@Index(['citation'])
export class SafeScopeFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  reportId?: string;

  @Column({ nullable: true })
  findingId?: string;

  @Column()
  classification: string;

  @Column()
  citation: string;

  @Column({
    type: 'varchar',
  })
  action: FeedbackAction;

  @Column({ nullable: true })
  replacementCitation?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'float', nullable: true })
  confidenceBefore?: number;

  @Column({ nullable: true })
  riskProfileId?: string;

  @Column({ nullable: true })
  reviewerRole?: string;

  @Column({ default: 'v2' })
  safeScopeVersion: string;

  @Column({ default: false })
  expertReviewed: boolean;

  @Column({ default: false })
  promotedToGlobal: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
