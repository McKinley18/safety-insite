import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Finding } from './finding.entity';
import { ReportAttachment } from './attachment.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ nullable: true })
  createdByUserId: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  inspector: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  confidential: boolean;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  severity: string;

  @Column({ type: 'jsonb', nullable: true })
  likelyStandards: any[];

  @Column({ type: 'jsonb', nullable: true })
  narrative: any;

  @Column({ type: 'jsonb', nullable: true })
  frontendReportJson: any;

  @Column({ nullable: true })
  eventTypeCode: string;

  @Column({ nullable: true })
  aiStatus: string;

  @CreateDateColumn()
  reportedDatetime: Date;

  @OneToMany(() => Finding, (finding) => finding.report, {
    cascade: true,
    eager: true,
  })
  findings: Finding[];

  @OneToMany(() => ReportAttachment, (attachment) => attachment.report)
  attachments: ReportAttachment[];
}
