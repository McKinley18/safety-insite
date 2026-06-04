import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity()
@Unique(['citation'])
export class RegulatorySection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  agencyCode: string;

  @Index()
  @Column()
  titleNumber: string;

  @Index()
  @Column()
  part: string;

  @Column({ nullable: true })
  subpart: string;

  @Column()
  section: string;

  @Column()
  citation: string;

  @Column({ nullable: true })
  heading: string;

  @Column({ type: 'text', nullable: true })
  textPlain: string;

  @Column({ type: 'text', nullable: true })
  summaryPlainLanguage: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column({ nullable: true })
  upToDateAsOf: string;

  @Column({ nullable: true })
  lastAmendedOn: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
