import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { SourceDocument } from './source-document.entity';

@Entity('source_hazard_lessons')
export class SourceHazardLesson {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SourceDocument, (doc) => doc.id) document: SourceDocument;
  @Column('simple-array') hazardFamilies: string[];
  @Column('text') summaryDetailed: string;
}
