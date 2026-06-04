import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classification_rules')
export class ClassificationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'int' })
  severity: number;

  @Column('simple-array')
  keywords: string[];

  @Column({ default: true })
  isActive: boolean;
}
