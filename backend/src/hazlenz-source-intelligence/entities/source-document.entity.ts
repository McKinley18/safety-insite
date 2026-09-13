import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('source_documents')
export class SourceDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true, unique: true }) candidateId: string;
  @Column() sourceAgency: string;
  @Column() sourceAuthorityType: string;
  @Column() citationAuthority: string;
  @Column({ type: 'json', nullable: true }) allowedUse: string[];
  @Column({ nullable: true }) sourceType: string;
  @Column() sourceTitle: string;
  @Column({ unique: true }) sourceUrl: string;
  @Column({ nullable: true }) finalUrl: string;
  @Column({ nullable: true }) sourceDate: Date;
  @Column() verificationStatus: string;
  @Column({ nullable: true, type: 'int' }) httpStatus: number;
  @Column({ type: 'text', nullable: true }) verificationEvidence: string;
  @Column({ type: 'text', nullable: true }) reviewerNotes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
