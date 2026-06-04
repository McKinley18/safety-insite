import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntry } from './audit-entry.entity';

@Entity('audit_entry_findings')
export class AuditEntryFinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auditEntryId: string;

  @ManyToOne(() => AuditEntry, (entry) => entry.findings, { onDelete: 'CASCADE' })
  auditEntry: AuditEntry;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  observedCondition: string;

  @Column({ nullable: true })
  hazardCategory: string;

  @Column('simple-json', { nullable: true })
  applicableStandards: any;

  @Column({ type: 'int', nullable: true })
  severityLevel: number;

  @Column({ type: 'text', nullable: true })
  suggestedFix: string;

  @Column({ type: 'float', default: 0 })
  confidenceScore: number;

  @Column('simple-json', { nullable: true })
  aiReasoning: Record<string, any>;

  @Column({ default: 'draft' })
  verificationStatus: string;
}
