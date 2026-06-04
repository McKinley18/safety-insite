import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Inspection } from './inspection.entity';

@Entity()
export class Hazard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  severity: string;

  @ManyToOne(() => Inspection, (inspection) => inspection.hazards, {
    onDelete: 'CASCADE',
  })
  inspection: Inspection;
}
