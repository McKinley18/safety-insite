import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { HazardFamily } from './hazard-family.entity';
import { HazardCondition } from './hazard-condition.entity';

@Entity()
export class HazardType {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @ManyToOne(() => HazardFamily, f => f.types) family!: HazardFamily;
  @OneToMany(() => HazardCondition, c => c.type) conditions!: HazardCondition[];
}
