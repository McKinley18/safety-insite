import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HazardType } from './hazard-type.entity';

@Entity()
export class HazardFamily {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @OneToMany(() => HazardType, type => type.family) types!: HazardType[];
}
