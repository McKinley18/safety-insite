import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_controls')
export class SourceControl {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column('text') controlText: string;
  @Column({ default: 'recommended' }) controlType: string;
  @Column({ nullable: true }) linkedHazardCategory: string;
  @Column({ nullable: true }) confidence: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
