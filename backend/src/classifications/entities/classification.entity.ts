import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('classifications')
export class Classification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @Column()
  classifierType: string;

  @Column()
  classifierVersion: string;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'modified', 'rejected'], default: 'pending' })
  classificationStatus: string;

  @Column()
  eventTypeCode: string;

  @Column({ nullable: true })
  hazardCategoryCode: string;

  @Column({ nullable: true })
  hazardSubcategoryCode: string;

  @Column({ nullable: true })
  rootCauseCategoryCode: string;

  @Column({ nullable: true })
  rootCauseSubcategoryCode: string;

  @Column({ type: 'int', nullable: true })
  severityLevel: number;

  @Column({ nullable: true })
  likelihoodLevel: string;

  @Column({ nullable: true })
  areaTypeCode: string;

  @Column('simple-array', { nullable: true })
  regulationRefs: string[];

  @Column('simple-json', { nullable: true })
  extractedEntities: any;

  @Column('simple-json', { nullable: true })
  reasoningSummary: Record<string, any>;

  @Column({ type: 'float', default: 0 })
  confidenceScore: number;

  @Column({ default: false })
  requiresHumanReview: boolean;

  @Column({ nullable: true })
  reviewReason: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
