import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntry } from './audit-entry.entity';

@Entity('audit_entry_attachments')
export class AuditEntryAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auditEntryId: string;

  @ManyToOne(() => AuditEntry, (entry) => entry.attachments, { onDelete: 'CASCADE' })
  auditEntry: AuditEntry;

  @Column()
  imageUri: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  fileName: string;
}
