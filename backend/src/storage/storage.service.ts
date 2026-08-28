import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { isUniqueViolation } from '../common/unique-violation';
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

  /**
   * Resolves a client-minted idempotency identifier to the object it already stored, for THIS user.
   *
   * Only a `ready` object counts as already-stored. An `uploading` or `failed` row is an attempt
   * whose bytes may never have reached the provider, so returning it would report a file as stored
   * that cannot be downloaded. Those are re-attempted instead, which is safe because the row is
   * reused rather than duplicated.
   */
  private async findStoredByClientRequestId(user: AuthenticatedUser, clientRequestId: string) {
    return this.objects.findOne({ where: { createdByUserId: user.userId, clientRequestId } });
  }

  async store(input: {
    user: unknown; category: StorageCategory; parentType: StorageObject['parentType']; parentId: string;
    organizationId: string | null; ownerUserId: string | null; contentType: string;
    downloadName: string; body: Buffer; expiresAt?: Date | null; clientRequestId?: string | null;
  }) {
    const user = requireAuthenticatedUser(input.user);
    if (!TYPES[input.category].has(input.contentType)) throw new BadRequestException('Unsupported file content type.');
    if (!input.body.length || input.body.length > LIMITS[input.category]) throw new BadRequestException('File size is outside the allowed range.');

    const clientRequestId = input.clientRequestId || null;

    // An upload whose response was lost must not store the bytes twice. Replaying the identifier
    // returns the object the earlier attempt produced.
    if (clientRequestId) {
      const existing = await this.findStoredByClientRequestId(user, clientRequestId);
      if (existing && existing.status === 'ready') return existing;
      if (existing) {
        // A row exists but its bytes never landed. Re-drive THAT row rather than creating another.
        return this.putAndFinalize(user, existing, input.body, input.contentType);
      }
    }

    const provider = this.provider();
    const objectKey = `${input.category}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;

    let record: StorageObject;
    try {
      record = await this.objects.save(this.objects.create({
        category: input.category, provider: provider.mode, objectKey,
        organizationId: input.organizationId, ownerUserId: input.ownerUserId,
        parentType: input.parentType, parentId: input.parentId, contentType: input.contentType,
        downloadName: this.downloadName(input.downloadName, input.contentType),
        sizeBytes: String(input.body.length), sha256: createHash('sha256').update(input.body).digest('hex'),
        status: 'uploading', createdByUserId: user.userId, clientRequestId,
        expiresAt: input.expiresAt || null, deletedAt: null, deletedByUserId: null,
      }));
    } catch (error) {
      // Concurrent replay: the partial unique index rejected this insert, so another attempt won.
      if (clientRequestId && isUniqueViolation(error)) {
        const winner = await this.findStoredByClientRequestId(user, clientRequestId);
        if (winner && winner.status === 'ready') return winner;
        if (winner) return this.putAndFinalize(user, winner, input.body, input.contentType);
      }
      throw error;
    }

    return this.putAndFinalize(user, record, input.body, input.contentType);
  }

  private async putAndFinalize(
    user: AuthenticatedUser,
    record: StorageObject,
    body: Buffer,
    contentType: string,
  ) {
    const provider = this.provider();
    // `objectKey` is `select: false`, so a record re-read by identifier does not carry it. Reload
    // it explicitly rather than writing the bytes to `undefined`.
    const objectKey = record.objectKey || (await this.objects
      .createQueryBuilder('object')
      .addSelect('object.objectKey')
      .where('object.id = :id', { id: record.id })
      .getOne())?.objectKey;
    if (!objectKey) throw new BadRequestException('The stored object could not be located.');

    try {
      await provider.put(objectKey, body, contentType);
      // update() by id, not save(). A record re-read by client identifier was loaded without the
      // `select: false` objectKey column, and save() round-trips the entity it was handed; a
      // targeted column update cannot disturb a column this code never loaded.
      await this.objects.update(record.id, { status: 'ready' });
      record.status = 'ready';
      await this.audit(user, 'file_upload_completed', record);
      return record;
    } catch (error) {
      await this.objects.update(record.id, { status: 'failed' });
      record.status = 'failed';
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

  /**
   * Permanently retire a REPORT artifact that a successful replacement has superseded.
   *
   * Distinct from `tombstone` on purpose. `tombstone` is a customer deleting their own file, so it
   * insists the caller is the object's creator. That rule is wrong here: under the
   * one-report-per-inspection contract the superseded PDF is retired by whoever regenerated the
   * report, and in an organization that is routinely a different person from whoever generated the
   * original. Requiring creator identity would leave one obsolete PDF per colleague behind forever.
   *
   * Authorization is not relaxed, it is relocated. The caller has already proven it may regenerate
   * this inspection's report; this method independently re-checks that the object is a `report`
   * artifact in the SAME owner/organization scope as the acting user, so it can never be pointed at
   * evidence, at branding, or at another tenant's file. It is not reachable from any route.
   *
   * Retirement is deliberately idempotent and non-throwing on an already-retired object, because it
   * runs after the replacement has committed: at that point the customer's current report is
   * correct, and a failure to clean up an obsolete file must never be reported as a failed
   * replacement.
   */
  async retireReportArtifact(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    // objectKey is `select: false` on the entity, so the provider delete below needs it added back
    // explicitly -- exactly as findAuthorized does.
    const object = await this.objects.createQueryBuilder('object').addSelect('object.objectKey')
      .where('object.id = :id', { id }).getOne();
    if (!object || object.status === 'deleted' || object.deletedAt) return false;
    if (object.category !== 'report') throw new BadRequestException('Only a report artifact may be retired this way.');
    const inScope = user.organizationId
      ? object.organizationId === user.organizationId
      : object.ownerUserId === user.userId;
    if (!inScope) throw new NotFoundException('File not found.');
    object.status = 'deleted'; object.deletedAt = new Date(); object.deletedByUserId = user.userId;
    await this.objects.save(object);
    await this.provider().delete(object.objectKey);
    await this.audit(user, 'report_artifact_retired', object);
    return true;
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
