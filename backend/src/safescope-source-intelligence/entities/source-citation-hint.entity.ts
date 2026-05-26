import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_citation_hints')
export class SourceCitationHint {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column() citation: string;
}
