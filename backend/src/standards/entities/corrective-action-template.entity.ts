import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('corrective_action_templates')
export class CorrectiveActionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hazardCategoryCode: string;

  @Column({ nullable: true })
  standardId: string;

  @Column()
  title: string;

  @Column('text')
  recommendedAction: string;

  @Column('text', { nullable: true })
  lowCostOption: string;

  @Column('text', { nullable: true })
  bestPracticeOption: string;

  @Column('text', { nullable: true })
  verificationSteps: string;

  @Column({ type: 'int', default: 0 })
  estimatedRiskReduction: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
