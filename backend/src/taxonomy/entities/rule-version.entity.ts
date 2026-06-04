import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classification_rule_versions')
export class ClassificationRuleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ruleId: string;

  @Column({ type: 'int' })
  version: number;

  @Column('simple-json')
  snapshot: Record<string, any>;

  @Column({ default: 'published' })
  status: string;
}
