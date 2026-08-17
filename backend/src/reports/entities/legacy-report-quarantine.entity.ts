import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('legacy_report_quarantine')
@Index('uq_legacy_report_quarantine_source', ['sourceTable', 'sourceId'], { unique: true })
export class LegacyReportQuarantine {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 80 }) sourceTable: string;
  @Column({ type: 'varchar', length: 160 }) sourceId: string;
  @Column({ type: 'varchar', length: 50 }) classification: string;
  @Column({ type: 'text' }) reason: string;
  @Column({ type: 'char', length: 64 }) sourcePayloadSha256: string;
  @Column({ type: 'varchar', length: 24, default: 'pending_review' }) reviewStatus: string;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, unknown> | null;
  @CreateDateColumn({ type: 'timestamptz' }) quarantinedAt: Date;
}
