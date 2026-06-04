import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HazardTaxonomy {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  family: string; // Guarding, Electrical
  @Column()
  condition: string; // Conveyor Guarding
  @Column('simple-json')
  triggerPhrases: string[];
  @Column('simple-array')
  clarifyingQuestions: string[];
  @Column('simple-array')
  likelyCitations: string[];
}
