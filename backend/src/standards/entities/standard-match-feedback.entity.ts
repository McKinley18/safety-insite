import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('standard_match_feedback')
export class StandardMatchFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id', nullable: true })
  reportId?: string;

  @Column({ name: 'standard_id' })
  standardId: string;

  @Column({ name: 'citation' })
  citation: string;

  @Column({ name: 'query_text', nullable: true })
  queryText: string;

  @Column({ name: 'hazard_category', nullable: true })
  hazardCategory: string;

  @Column()
  action: 'accepted' | 'rejected' | 'changed' | 'flagged';

  @Column({ name: 'replacement_citation', nullable: true })
  replacementCitation?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
