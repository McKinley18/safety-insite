import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditSession } from './audit-session.entity';
import { AuditEntryAttachment } from './entities/audit-entry-attachment.entity';
import { AuditEntryFinding } from './entities/audit-entry-finding.entity';

@Entity('audit_entries')
export class AuditEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auditSessionId: string;

  @ManyToOne(() => AuditSession, (session) => session.entries, { onDelete: 'CASCADE' })
  auditSession: AuditSession;

  @Column({ nullable: true })
  locationText: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'draft' })
  verificationStatus: string;

  @OneToMany(() => AuditEntryAttachment, (attachment) => attachment.auditEntry)
  attachments: AuditEntryAttachment[];

  @OneToMany(() => AuditEntryFinding, (finding) => finding.auditEntry)
  findings: AuditEntryFinding[];
}
