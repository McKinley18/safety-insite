import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Standard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  citation: string;

  @Column()
  title: string;

  @Column()
  domain: string;

  @Column("simple-array")
  hazardTags: string[];

  @Column("simple-array")
  keywordTriggers: string[];

  @Column("simple-array", { nullable: true })
  equipmentTags: string[];

  @Column("simple-array", { nullable: true })
  environmentTags: string[];

  @Column("simple-array", { nullable: true })
  severityWeight: string[];

  @Column("text")
  summaryPlain: string;

  @Column("simple-array")
  recommendedActions: string[];
}
