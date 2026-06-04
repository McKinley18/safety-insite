import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('decision_governance_logs')
export class DecisionGovernanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @Column('text')
  inputText: string;

  @Column()
  predictedCategory: string;

  @Column('float')
  confidence: number;

  @Column('float')
  riskScore: number;

  @Column()
  selectedStandard: string;

  @Column('text')
  recommendedAction: string;

  @Column()
  decisionSource: "RULE" | "FUZZY" | "LEARNED" | "CONTEXT";

  @Column({ default: false })
  overrideApplied: boolean;

  @Column({ nullable: true })
  overrideReason: string;

  @Column({ default: false })
  userReviewed: boolean;

  @Column({ nullable: true })
  finalOutcome: "accepted" | "modified" | "rejected";

  @Column({ type: 'jsonb', nullable: true })
  originalAiDecision: any;

  @Column({ type: 'jsonb', nullable: true })
  finalHumanDecision: any;

  @CreateDateColumn()
  createdAt: Date;
}
