import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity()
@Unique(['sectionCitation', 'textPlain'])
export class RegulatoryParagraph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  sectionCitation: string;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  paragraphPath: string;

  @Column({ type: 'text' })
  textPlain: string;

  @Column({ type: 'text', nullable: true })
  summaryPlainLanguage: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
