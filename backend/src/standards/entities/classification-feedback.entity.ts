import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classification_feedback')
export class ClassificationFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column('text')
  hazardDescription: string;

  @Column({ nullable: true })
  suggestedStandardId: string;

  @Column({ nullable: true })
  selectedStandardId: string;

  @Column({ default: false })
  accepted: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
