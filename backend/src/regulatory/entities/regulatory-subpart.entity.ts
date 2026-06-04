import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['agencyCode', 'titleNumber', 'part', 'subpart'])
export class RegulatorySubpart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agencyCode: string;

  @Column()
  titleNumber: string;

  @Column()
  part: string;

  @Column({ nullable: true })
  subpart: string;

  @Column({ nullable: true })
  heading: string;

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
