import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from './report.entity';

@Entity('report_attachments')
export class ReportAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, (report) => report.attachments, { onDelete: 'CASCADE' })
  report: Report;

  @Column()
  imageUri: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  fileName: string;

  @CreateDateColumn()
  createdAt: Date;
}
