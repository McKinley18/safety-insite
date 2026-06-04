import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { HazardType } from './hazard-type.entity';

@Entity()
export class HazardCondition {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('simple-array') keywords!: string[];
  @Column('simple-array') suppressors!: string[];
  @ManyToOne(() => HazardType, t => t.conditions) type!: HazardType;
}
