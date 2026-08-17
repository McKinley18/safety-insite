import { Check, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InspectionReportVersion } from './inspection-report-version.entity';

@Entity('inspection_reports')
@Check('chk_inspection_report_exactly_one_scope', '(("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))')
@Index('uq_inspection_report_inspection', ['inspectionId'], { unique: true })
export class InspectionReport {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) inspectionId: string;
  @Column({ type: 'uuid', nullable: true }) organizationId: string | null;
  @Column({ type: 'uuid', nullable: true }) ownerUserId: string | null;
  @Column({ type: 'uuid' }) createdByUserId: string;
  @Column({ type: 'timestamptz', nullable: true }) archivedAt: Date | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @OneToMany(() => InspectionReportVersion, version => version.report) versions: InspectionReportVersion[];
}
