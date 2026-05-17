import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Site } from '../../sites/entities/site.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoPath: string;

  @Column({ default: 'standard_5x5' })
  riskProfileId: string;

  @Column({ default: 'basic' })
  planCode: string; // 'basic', 'plus', 'company'

  @OneToMany(() => Site, site => site.organization)
  sites: Site[];

  @CreateDateColumn()
  createdAt: Date;
}
