import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('source_documents')
export class SourceDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) sourceId: string;
  @Column() agency: string;
  @Column() title: string;
  @Column() url: string;
  @Column({ nullable: true }) sourceDate: Date;
  @Column({ default: 'official' }) reliability: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
