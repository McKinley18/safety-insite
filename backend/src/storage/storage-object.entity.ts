import { Check, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type StorageCategory = 'report' | 'evidence' | 'branding' | 'temporary';
export type StorageStatus = 'uploading' | 'ready' | 'quarantined' | 'deleted' | 'failed';

@Entity('storage_objects')
@Check('chk_storage_object_exactly_one_scope', '(("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))')
@Index('idx_storage_object_scope', ['organizationId', 'ownerUserId', 'status'])
@Index('idx_storage_object_parent', ['parentType', 'parentId'])
export class StorageObject {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 24 }) category: StorageCategory;
  @Column({ type: 'varchar', length: 24 }) provider: 's3' | 'local_test';
  @Column({ type: 'varchar', length: 500, unique: true, select: false }) objectKey: string;
  @Column({ type: 'uuid', nullable: true }) organizationId: string | null;
  @Column({ type: 'uuid', nullable: true }) ownerUserId: string | null;
  @Column({ type: 'varchar', length: 40 }) parentType: 'inspection' | 'observation' | 'report_version' | 'organization' | 'temporary';
  @Column({ type: 'uuid' }) parentId: string;
  @Column({ type: 'varchar', length: 160 }) contentType: string;
  @Column({ type: 'varchar', length: 255 }) downloadName: string;
  @Column({ type: 'bigint' }) sizeBytes: string;
  @Column({ type: 'char', length: 64 }) sha256: string;
  @Column({ type: 'varchar', length: 24, default: 'uploading' }) status: StorageStatus;
  @Column({ type: 'uuid' }) createdByUserId: string;
  @Column({ type: 'timestamptz', nullable: true }) expiresAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) deletedAt: Date | null;
  @Column({ type: 'uuid', nullable: true }) deletedByUserId: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}
