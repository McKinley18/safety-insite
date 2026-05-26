import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_controls')
export class SourceControl {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column() controlDescription: string;
  @Column() correctiveActionTheme: string;
}
