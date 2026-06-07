import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuditRecordType } from './persistence.types';

@Entity('safescope_audit_records')
export class SafeScopeAuditRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type!: AuditRecordType;

  @Column({ nullable: true })
  workspaceId?: string;

  @Column({ nullable: true })
  inspectionId?: string;

  @Column({ nullable: true })
  observationId?: string;

  @Column({ nullable: true })
  traceId?: string;

  @Column({ nullable: true })
  actorId?: string;

  @Column({ nullable: true })
  actorRole?: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ type: 'jsonb' })
  payload!: any;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
