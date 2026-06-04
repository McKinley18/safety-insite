import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('standard_feedback')
export class StandardFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  standardId: string;

  @Column()
  citation: string;

  @Column()
  action: 'accepted' | 'rejected' | 'changed' | 'flagged';

  @Column({ nullable: true })
  replacementCitation?: string;

  @Column({ nullable: true })
  text?: string;

  @Column({ nullable: true })
  reportId?: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
