import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Report } from './report.entity';

@Entity()
export class Finding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  hazardCategory: string;

  @Column({ nullable: true })
  hazard: string;

  @Column('int', { nullable: true })
  severity: number;

  @Column('int', { nullable: true })
  likelihood: number;

  @Column({ type: 'jsonb', nullable: true })
  standards: any[];

  @ManyToOne(() => Report, (report) => report.findings, { onDelete: 'CASCADE' })
  report: Report;
}
