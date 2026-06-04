import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_citation_hints')
export class SourceCitationHint {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column({ nullable: true }) agency: string;
  @Column() citation: string;
  @Column({ nullable: true }) authorityType: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
