import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InspectionReport } from './inspection-report.entity';

export type InspectionReportStatus = 'generating' | 'generated' | 'failed' | 'superseded' | 'quarantined';

@Entity('inspection_report_versions')
@Index('uq_inspection_report_version', ['reportId', 'version'], { unique: true })
export class InspectionReportVersion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) reportId: string;
  @ManyToOne(() => InspectionReport, report => report.versions, { onDelete: 'RESTRICT' })
  report: InspectionReport;
  @Column({ type: 'integer' }) version: number;
  @Column({ type: 'varchar', length: 24 }) status: InspectionReportStatus;
  @Column({ type: 'integer' }) sourceInspectionVersion: number;
  @Column({ type: 'char', length: 64, nullable: true }) sourceFingerprint: string | null;
  @Column({ type: 'jsonb' }) sourceSnapshot: Record<string, unknown>;
  @Column({ type: 'uuid', nullable: true }) storageObjectId: string | null;
  @Column({ type: 'char', length: 64, nullable: true }) sha256: string | null;
  @Column({ type: 'bigint', nullable: true }) sizeBytes: string | null;
  @Column({ type: 'varchar', length: 80 }) generatorVersion: string;
  @Column({ type: 'uuid' }) generatedByUserId: string;
  @Column({ type: 'timestamptz', nullable: true }) generatedAt: Date | null;
  @Column({ type: 'text', nullable: true }) failureReason: string | null;
  @Column({ type: 'uuid', nullable: true }) supersededByVersionId: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
