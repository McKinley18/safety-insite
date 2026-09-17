import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { EntityManager, In, Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { isUniqueViolation } from '../common/unique-violation';
import { InspectionService } from '../inspection/inspection.service';
import { StorageCategory, StorageObject } from './storage-object.entity';
import { LocalTestStorageProvider, PrivateStorageProvider, S3PrivateStorageProvider } from './storage-provider';
import { emitOperationalEvent } from '../observability/operational-events';

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
      // §268. Storage failure is the one platform dependency §266 measured as already blocking the
      // product (report generation returns 500 with no bucket configured), so it gets a signal of
      // its own. The object id and kind only: a download name or key can carry customer content.
      emitOperationalEvent('storage.operation_failed', {
        storageObjectId: record.id,
        parentType: record.parentType,
        failureKind: error instanceof Error ? error.name : 'UnknownError',
      });
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

  /**
   * §313 / BR-7 — PHASE 1 OF ACCOUNT-DELETION EVIDENCE ERASURE. Runs INSIDE the account-deletion
   * transaction and touches the database only.
   *
   * ===================================================================================================
   * WHY THE INTENT IS RECORDED BEFORE ANY BYTE IS TOUCHED.
   *
   * R2 cannot join a PostgreSQL transaction, so the two systems are reconciled by ORDER rather than by
   * atomicity. Recording the intent first means a crash at any point afterwards leaves a precise,
   * queryable work item — `status = 'erasure_pending'` — rather than an object nobody knows should
   * have been erased. The opposite order (delete the bytes, then record it) loses the work list
   * exactly when it is needed.
   *
   * It is also why account deletion does NOT destroy ownership. Anonymisation rewrites the `user` row;
   * it never touches `storage_objects.ownerUserId`, so the deleted account's objects remain findable
   * by their owner id indefinitely and a retry can always re-derive the same set.
   *
   * ===================================================================================================
   * THE OWNERSHIP PREDICATE IS RELATIONAL AND NARROW, deliberately.
   *
   * `ownerUserId = :userId AND organizationId IS NULL`. Never a key, never a prefix, never a filename,
   * never a digest — BR-8 means a stored digest can be stale, so digests may not be an ownership
   * authority. The `organizationId IS NULL` clause is redundant against the table's exactly-one-scope
   * check constraint and is written anyway: organisation-scoped evidence belongs to an organisation
   * that may have other members, and one member closing their account must never erase it. Production
   * holds such objects today, so this is a live case rather than a hypothetical one.
   *
   * `downloadName` is scrubbed here because a filename is customer-supplied text that can itself carry
   * personal information, and there is no reason to retain it past the erasure request.
   */
  async markOwnedEvidenceForErasure(manager: EntityManager, userId: string, now: Date) {
    const owned = await manager
      .createQueryBuilder(StorageObject, 'object')
      .where('object.ownerUserId = :userId', { userId })
      .andWhere('object.organizationId IS NULL')
      .andWhere('object.deletedAt IS NULL')
      .getMany();

    if (!owned.length) return { marked: 0, ids: [] as string[] };

    await manager.update(
      StorageObject,
      { id: In(owned.map((o) => o.id)) },
      { status: 'erasure_pending', deletedAt: now, deletedByUserId: userId, downloadName: 'erased' },
    );
    return { marked: owned.length, ids: owned.map((o) => o.id) };
  }

  /**
   * §313 / BR-7 — PHASE 2. Runs AFTER the transaction has committed, and is idempotent by construction.
   *
   * It re-derives its work from the database every time — every row still at `erasure_pending` for this
   * owner — so calling it once, twice, or after a crash produces the same end state. An object already
   * absent from the bucket is a SUCCESS, not an error: both storage providers treat a missing key as a
   * no-op, which is what makes a retry safe after a partial run.
   *
   * A row moves to `deleted` only after its bytes are confirmed gone. Anything that throws is left at
   * `erasure_pending` and reported, so the caller can tell the customer the truth rather than claiming
   * a completion it did not achieve.
   */
  async eraseMarkedEvidence(userId: string) {
    const pending = await this.objects
      .createQueryBuilder('object')
      .addSelect('object.objectKey')
      .where('object.ownerUserId = :userId', { userId })
      .andWhere('object.organizationId IS NULL')
      .andWhere('object.status = :status', { status: 'erasure_pending' })
      .getMany();

    const provider = this.provider();
    let erased = 0;
    const failed: string[] = [];

    for (const object of pending) {
      try {
        await provider.delete(object.objectKey);
        await this.objects.update(object.id, { status: 'deleted' });
        await this.audits.save(this.audits.create({
          actorUserId: userId,
          organizationId: null,
          // The action the §312 recovery reconciler treats as erasure-authoritative. It is distinct
          // from `file_deleted` so the audit trail says WHY the object went, and distinct from
          // `report_artifact_retired`, which is operational housekeeping and carries no erasure intent.
          action: 'account_evidence_erased',
          resourceType: 'storage_object',
          resourceId: object.id,
          metadata: { category: object.category, parentType: object.parentType },
        }));
        erased += 1;
      } catch (error) {
        failed.push(object.id);
        // The object identifier and the failure KIND only. A key or a download name can carry
        // customer content, and an operational event is not the place for it.
        emitOperationalEvent('storage.operation_failed', {
          storageObjectId: object.id,
          parentType: object.parentType,
          failureKind: error instanceof Error ? error.name : 'UnknownError',
        });
      }
    }

    return { attempted: pending.length, erased, failed: failed.length, remaining: failed.length, complete: failed.length === 0 };
  }

  /** How much evidence is still awaiting erasure for this owner. The retry and monitoring signal. */
  async pendingErasureCount(userId: string) {
    return this.objects.count({ where: { ownerUserId: userId, status: 'erasure_pending' } });
  }

  private async audit(user: AuthenticatedUser, action: string, object: StorageObject) {
    await this.audits.save(this.audits.create({
      actorUserId: user.userId, organizationId: user.organizationId, action,
      resourceType: 'storage_object', resourceId: object.id,
      metadata: { category: object.category, parentType: object.parentType, parentId: object.parentId },
    }));
  }
}
