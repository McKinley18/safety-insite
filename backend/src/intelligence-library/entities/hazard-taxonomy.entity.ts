import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class HazardTaxonomy {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  family: string; // e.g., Guarding, Electrical
  @Column()
  conditionId: string;
  @Column('simple-array')
  synonyms: string[];
  @Column('simple-array')
  triggerPhrases: string[];
  @Column({ type: 'jsonb', nullable: true })
  regulatoryCrosswalk: object; // Citation mapping
}
