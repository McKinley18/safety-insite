import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RecommendationFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hazard: string;

  @Column()
  action: string; // accepted | rejected | modified

  @Column({ nullable: true })
  replacementText?: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
