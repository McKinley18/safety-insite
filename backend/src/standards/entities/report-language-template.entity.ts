import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('report_language_templates')
export class ReportLanguageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hazardCategoryCode: string;

  @Column('text')
  findingTemplate: string;

  @Column('text')
  standardReasoningTemplate: string;

  @Column('text')
  correctiveActionTemplate: string;

  @Column('text')
  professionalSummaryTemplate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
