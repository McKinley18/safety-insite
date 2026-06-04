import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('outcomes')
export class Outcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionId: string;

  @Column()
  category: string;

  @Column('jsonb')
  originalRecommendation: any;

  @Column('jsonb')
  userActionTaken: any;

  @CreateDateColumn()
  completionTimestamp: Date;

  @Column({
    type: 'varchar',
    default: 'UNVERIFIED',
  })
  verificationStatus: "UNVERIFIED" | "VERIFIED_STRONG" | "VERIFIED_MODERATE" | "WEAK_VALIDATION";

  @Column({
    type: 'varchar',
    nullable: true,
  })
  verificationMethod: "FOLLOW_UP_INSPECTION" | "PHOTO_EVIDENCE" | "SUPERVISOR_SIGNOFF";

  @Column({ default: false })
  recurrenceDetected: boolean;

  // 🔷 VCL FIELDS
  @Column('float', { default: 0 })
  verificationConfidence: number;

  @Column({ default: 0 })
  observationWindowDays: number;

  @Column({ default: 0 })
  inspectionsPerformed: number;

  @Column('float', { default: 1.0 })
  exposureLevelAtLocation: number;
}
