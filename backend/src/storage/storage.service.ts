import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { InspectionService } from '../inspection/inspection.service';
import { StorageCategory, StorageObject } from './storage-object.entity';
import { LocalTestStorageProvider, PrivateStorageProvider, S3PrivateStorageProvider } from './storage-provider';

const TYPES: Record<StorageCategory, Set<string>> = {
  report: new Set(['application/pdf']),
  evidence: new Set(['image/jpeg', 'image/png', 'image/webp']),
  branding: new Set(['image/jpeg', 'image/png', 'image/webp']),
  temporary: new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
};
const LIMITS: Record<StorageCategory, number> = {
  report: 25 * 1024 * 1024, evidence: 10 * 1024 * 1024,
  branding: 2 * 1024 * 1024, temporary: 10 * 1024 * 1024,
};

@Injectable()
export class StorageService {
  private providerInstance?: PrivateStorageProvider;
  constructor(
    @InjectRepository(StorageObject) private readonly objects: Repository<StorageObject>,
    @InjectRepository(SecurityAuditEvent) private readonly audits: Repository<SecurityAuditEvent>,
    private readonly inspections: InspectionService,
  ) {}

  private provider(): PrivateStorageProvider {
    if (this.providerInstance) return this.providerInstance;
    const mode = process.env.STORAGE_PROVIDER || (process.env.NODE_ENV === 'test' ? 'local_test' : 's3');
    if (mode === 'local_test') this.providerInstance = new LocalTestStorageProvider(process.env.STORAGE_LOCAL_ROOT || '');
    else if (mode === 's3') this.providerInstance = new S3PrivateStorageProvider();
    else throw new Error(`Unsupported STORAGE_PROVIDER: ${mode}`);
    return this.providerInstance;
  }

  private downloadName(value: string, type: string) {
    const base = String(value || 'download').replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/^\.+/, '').slice(0, 180) || 'download';
    const ext = type === 'application/pdf' ? '.pdf' : type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg';
    return base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`;
  }

  async store(input: {
    user: unknown; category: StorageCategory; parentType: StorageObject['parentType']; parentId: string;
    organizationId: string | null; ownerUserId: string | null; contentType: string;
    downloadName: string; body: Buffer; expiresAt?: Date | null;
  }) {
    const user = requireAuthenticatedUser(input.user);
    if (!TYPES[input.category].has(input.contentType)) throw new BadRequestException('Unsupported file content type.');
    if (!input.body.length || input.body.length > LIMITS[input.category]) throw new BadRequestException('File size is outside the allowed range.');
    const provider = this.provider();
    const objectKey = `${input.category}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
    const record = await this.objects.save(this.objects.create({
      category: input.category, provider: provider.mode, objectKey,
      organizationId: input.organizationId, ownerUserId: input.ownerUserId,
      parentType: input.parentType, parentId: input.parentId, contentType: input.contentType,
      downloadName: this.downloadName(input.downloadName, input.contentType),
      sizeBytes: String(input.body.length), sha256: createHash('sha256').update(input.body).digest('hex'),
      status: 'uploading', createdByUserId: user.userId, expiresAt: input.expiresAt || null,
      deletedAt: null, deletedByUserId: null,
    }));
    try {
      await provider.put(objectKey, input.body, input.contentType);
      record.status = 'ready';
      await this.objects.save(record);
      await this.audit(user, 'file_upload_completed', record);
      return record;
    } catch (error) {
      record.status = 'failed';
      await this.objects.save(record);
      await provider.delete(objectKey).catch(() => undefined);
      throw error;
    }
  }

  async findAuthorized(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    const object = await this.objects.createQueryBuilder('object').addSelect('object.objectKey')
      .where('object.id = :id', { id }).getOne();
    if (!object || object.status !== 'ready' || object.deletedAt || (object.expiresAt && object.expiresAt <= new Date())) {
      throw new NotFoundException('File not found.');
    }
    try {
      if (object.parentType === 'inspection') await this.inspections.findAccessible(user, object.parentId);
      else if (object.parentType === 'observation') await this.inspections.authorizeObservation(user, object.parentId);
      else {
        const allowed = object.organizationId ? object.organizationId === user.organizationId : object.ownerUserId === user.userId;
        if (!allowed) throw new NotFoundException('File not found.');
      }
    } catch (error) {
      await this.audit(user, 'file_authorization_failed', object);
      throw error;
    }
    return object;
  }

  async read(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    const object = await this.findAuthorized(user, id);
    const body = await this.provider().get(object.objectKey);
    if (createHash('sha256').update(body).digest('hex') !== object.sha256) throw new Error('Stored object integrity check failed.');
    await this.audit(user, 'file_retrieved', object);
    return { object, body };
  }

  async tombstone(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    const object = await this.findAuthorized(user, id);
    if (object.createdByUserId !== user.userId) throw new NotFoundException('File not found.');
    object.status = 'deleted'; object.deletedAt = new Date(); object.deletedByUserId = user.userId;
    await this.objects.save(object);
    await this.provider().delete(object.objectKey);
    await this.audit(user, 'file_deleted', object);
  }

  private async audit(user: AuthenticatedUser, action: string, object: StorageObject) {
    await this.audits.save(this.audits.create({
      actorUserId: user.userId, organizationId: user.organizationId, action,
      resourceType: 'storage_object', resourceId: object.id,
      metadata: { category: object.category, parentType: object.parentType, parentId: object.parentId },
    }));
  }
}
