import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntry } from './audit-entry.entity';

@Entity('audit_sessions')
export class AuditSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  facilityName!: string;

  @Column({ nullable: true })
  siteId?: string;

  @Column({ nullable: true })
  auditorName?: string;

  @Column({ type: 'date', nullable: true })
  auditDate?: string;

  @Column({ default: 'msha_hybrid' })
  standardsMode!: string;

  @Column({ default: 'draft' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  sessionNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @OneToMany(() => AuditEntry, (entry) => entry.auditSession)
  entries!: AuditEntry[];
}
