import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['agencyCode', 'titleNumber', 'part'])
export class RegulatoryPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agencyCode: string;

  @Column()
  titleNumber: string;

  @Column()
  part: string;

  @Column()
  heading: string;

  @Column({ nullable: true })
  customerPack: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
