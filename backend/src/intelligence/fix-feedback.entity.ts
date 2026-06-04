import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('fix_feedback')
export class FixFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id' })
  reportId: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb', name: 'original_suggestion' })
  originalSuggestion: any;

  @Column({ type: 'jsonb', name: 'user_action' })
  userAction: any;

  @Column({ default: false })
  approved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
