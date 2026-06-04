import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  actorUserId: string;

  @Column({ default: 'default' })
  tenantId: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  actionCode: string;

  @Column('simple-json', { nullable: true })
  beforeJson: any;

  @Column('simple-json', { nullable: true })
  afterJson: any;

  @Column('simple-json', { nullable: true })
  metadataJson: any;

  @CreateDateColumn()
  createdAt: Date;
}
