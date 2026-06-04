import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class RegulatoryProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-array', default: ['MSHA'] })
  enabledAgencies: string[];

  @Column({ type: 'simple-array', default: ['56', '57'] })
  enabledMshaParts: string[];

  @Column({ type: 'simple-array', default: ['1910', '1926'] })
  enabledOshaParts: string[];

  @Column({ nullable: true })
  defaultAgency: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
