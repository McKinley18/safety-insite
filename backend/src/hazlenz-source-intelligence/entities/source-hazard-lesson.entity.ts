import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_hazard_lessons')
export class SourceHazardLesson {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column() hazardCategory: string;
  @Column({ type: 'text', nullable: true }) hazardDescription: string;
  @Column({ type: 'json', nullable: true }) secondaryHazardCategories: string[];
  @Column({ nullable: true }) equipmentInvolved: string;
  @Column({ type: 'json', nullable: true }) rootCauseThemes: string[];
  @Column({ type: 'json', nullable: true }) controlFailures: string[];
  @Column({ type: 'text', nullable: true }) severityNotes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
