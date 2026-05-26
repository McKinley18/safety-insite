import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_gauntlet_links')
@Unique(['scenarioId'])
export class SourceGauntletLink {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column() scenarioId: string;
  @Column() sourceId: string;
}
