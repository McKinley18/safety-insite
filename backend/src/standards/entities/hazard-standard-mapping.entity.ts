import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('hazard_standard_mappings')
export class HazardStandardMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hazardCategoryCode: string;

  @Column()
  standardId: string;

  @Column('simple-array', { nullable: true })
  matchTerms: string[];

  @Column({ type: 'int', default: 0 })
  confidenceBoost: number;

  @Column('text', { nullable: true })
  reasoningTemplate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
