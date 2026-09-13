import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_gauntlet_links')
@Unique(['scenarioId'])
export class SourceGauntletLink {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column() scenarioId: string;
  @Column() sourceId: string;
  @Column({ default: 'candidate_match' }) linkType: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
