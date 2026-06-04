import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('risk_scores')
export class RiskScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @Column()
  classificationId: string;

  @Column({ type: 'int' })
  severityScore: number;

  @Column({ type: 'int' })
  recurrenceScore: number;

  @Column({ type: 'int' })
  trendScore: number;

  @Column({ type: 'int' })
  controlFailureScore: number;

  @Column({ type: 'float' })
  confidenceModifier: number;

  @Column({ type: 'int' })
  compositeRiskScore: number;

  @Column()
  riskBand: 'low' | 'medium' | 'high' | 'critical';

  @CreateDateColumn()
  calculatedAt: Date;
}
