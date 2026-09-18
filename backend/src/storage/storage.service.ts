import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { EntityManager, In, Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { isUniqueViolation } from '../common/unique-violation';
import { InspectionService } from '../inspection/inspection.service';
import { StorageCategory, StorageObject, StorageStatus } from './storage-object.entity';
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

/**
 * §314 / BR-8. Statuses from which an idempotency replay may NEVER proceed, because the object they
 * name has been retired. Written as a set over the status union rather than as a negated list of the
 * resumable ones, so that adding a status to `StorageStatus` is a decision someone has to make here
 * rather than a resumable default nobody noticed.
 *
 * `quarantined` is included on the same principle as the two erasure states: whatever quarantined an
 * object, an upload replay is not the authority that releases it.
 */
const TERMINAL_REPLAY_STATUSES: ReadonlySet<StorageStatus> = new Set<StorageStatus>([
  'deleted', 'erasure_pending', 'quarantined',
]);

/**
 * §314 / BR-8. The machine-readable half of an idempotency conflict, so a client can tell a spent
 * identifier from a changed payload from a reused one without parsing prose.
 */
export type IdempotencyConflictReason = 'EVIDENCE_RETIRED' | 'OPERATION_MISMATCH' | 'PAYLOAD_MISMATCH';

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
   * Resolves a client-minted idempotency identifier to the row it already names, for THIS user.
   *
   * The scope is `(createdByUserId, clientRequestId)` and it is the same scope the partial unique
   * index `uq_storage_object_client_request` enforces (migration 1800000015000). Application lookup
   * and database constraint agreeing is what makes the concurrency argument below hold: the loser of
   * a race re-reads by exactly the predicate the index rejected it on.
   *
   * It deliberately does NOT filter by status. Every status is classified explicitly in
   * `resolveReplay`, because a lookup that quietly skipped a row would create a SECOND row for an
   * identifier the database has already bound — which is the one thing this mechanism exists to
   * prevent.
   */
  private async findStoredByClientRequestId(user: AuthenticatedUser, clientRequestId: string) {
    return this.objects.findOne({ where: { createdByUserId: user.userId, clientRequestId } });
  }

  /**
   * §314 / BR-8 — THE REPLAY CONTRACT.
   *
   * =================================================================================================
   * THE RULE, AND WHY IT IS ONE RULE RATHER THAN FOUR.
   *
   * A REPLAY MAY DRIVE A PUT ONLY IF THE REPLAYED BYTES ARE THE BYTES THE ROW'S DIGEST ALREADY
   * DESCRIBES. `sha256` is written once, when the row is created, and is never rewritten; so making
   * it the WRITE AUTHORIZATION rather than a passive record closes four separate hazards at once:
   *
   *   SAME ID / DIFFERENT PAYLOAD. Refused, so evidence A can never be replaced by B. BR-8's defect
   *   was precisely that this replay reached `putAndFinalize` and wrote B under sha256(A).
   *
   *   CONCURRENT DUPLICATES. The loser of the unique-index race re-reads the winner and comes back
   *   through here. If its bytes match, the only PUT it can issue is byte-identical to the winner's,
   *   so "last writer wins" cannot change what is stored. If they differ it is refused. Either way
   *   one identifier means one object with a true digest, and no lease or lock is needed to get it.
   *
   *   STALE DIGEST. The digest can never go stale, because no write is permitted that would make it
   *   stale. This is stronger than recomputing the digest after an overwrite: recomputation would
   *   make the metadata agree with an overwrite that should never have happened.
   *
   *   INTERRUPTED FIRST ATTEMPT. A genuine resume — the bytes did not land, or the response was lost
   *   — replays the SAME bytes by definition, so it is admitted and completes normally.
   *
   * =================================================================================================
   * WHY A TERMINAL ROW IS REFUSED BEFORE ANYTHING ELSE IS EVEN CONSIDERED.
   *
   * §314 found that a replayed identifier could reach `putAndFinalize` on a row the customer had
   * already DELETED, writing the bytes back to the erased object's key and flipping the row to
   * `ready`. That is a resurrection of erased evidence through the ordinary upload route, and BR-7 is
   * closed on the guarantee that erasure is final. `deleted`, `erasure_pending` and `quarantined` are
   * therefore terminal here: an identifier that named retired evidence is spent, and no request can
   * un-retire it. `deletedAt` is checked as well as `status` because the two are set together and a
   * row carrying either one has been retired.
   *
   * =================================================================================================
   * WHY THE OPERATION IS CHECKED, AND WHY THAT IS NOT A SCHEMA CHANGE.
   *
   * The index binds an identifier to one row per user; it does not bind it to one OPERATION. §314
   * measured the consequence: replaying an identifier while uploading to a DIFFERENT inspection
   * returned the first inspection's object, so the second photo was never stored and the caller was
   * handed evidence belonging to somewhere else. Refusing the mismatch restores the contract the
   * migration describes without widening the index — a wider index would instead let one identifier
   * legitimately name several rows, which is the opposite of what it is for.
   *
   * =================================================================================================
   * A CONFLICT CANNOT DISCLOSE ANYTHING. The row was found by a predicate that includes
   * `createdByUserId = this caller`, so the only object a caller can ever be told about here is one
   * they created themselves. Another user presenting the same identifier does not reach this method
   * at all; they miss the lookup and create their own row.
   */
  private async resolveReplay(
    user: AuthenticatedUser,
    existing: StorageObject,
    input: { category: StorageCategory; parentType: StorageObject['parentType']; parentId: string; body: Buffer },
    digest: string,
  ) {
    const refuse = (reason: IdempotencyConflictReason, message: string): never => {
      emitOperationalEvent('storage.idempotency_conflict', {
        storageObjectId: existing.id,
        category: existing.category,
        parentType: existing.parentType,
        reason,
      });
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message,
        reason,
      });
    };

    if (existing.deletedAt || TERMINAL_REPLAY_STATUSES.has(existing.status)) {
      refuse('EVIDENCE_RETIRED', 'This upload identifier refers to a file that has been deleted and cannot be restored.');
    }
    if (
      existing.category !== input.category
      || existing.parentType !== input.parentType
      || existing.parentId !== input.parentId
    ) {
      refuse('OPERATION_MISMATCH', 'This upload identifier was already used for a different upload.');
    }
    if (existing.sha256 !== digest) {
      refuse('PAYLOAD_MISMATCH', 'This upload identifier was already used for different file contents.');
    }

    if (existing.status === 'ready') {
      // The completed replay. Observationally idempotent: no PUT, no new row, no digest change, no
      // second audit row, and nothing for the §312 reconciler to see as a new generation.
      emitOperationalEvent('storage.idempotent_replay', {
        storageObjectId: existing.id,
        category: existing.category,
        parentType: existing.parentType,
        outcome: 'RETURNED_COMMITTED',
      });
      return existing;
    }

    // `uploading` and `failed`: the bytes are proven identical to the ones this row already
    // describes, so completing the row cannot make its digest untrue. The row's OWN contentType is
    // used rather than the request's, so the object's stored metadata always matches the ledger.
    emitOperationalEvent('storage.idempotent_replay', {
      storageObjectId: existing.id,
      category: existing.category,
      parentType: existing.parentType,
      outcome: 'RESUMED',
    });
    return this.putAndFinalize(user, existing, input.body, existing.contentType, false);
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

    /**
     * THE DIGEST IS COMPUTED ONCE, HERE, FROM `input.body` — and `input.body` is the same Buffer
     * object that is handed to `provider.put`. Nothing between this line and the PUT re-encodes,
     * re-reads, streams or transforms it, so "the bytes that were hashed" and "the bytes that were
     * stored" are not two things that have to be kept in agreement; they are one value.
     *
     * It is never taken from the caller. A caller-supplied digest would make the integrity claim a
     * restatement of the client's assertion, and `read()` verifies downloads against this column.
     */
    const digest = createHash('sha256').update(input.body).digest('hex');

    // An upload whose response was lost must not store the bytes twice. Replaying the identifier
    // resolves to the row it already named; see `resolveReplay` for what each state means.
    if (clientRequestId) {
      const existing = await this.findStoredByClientRequestId(user, clientRequestId);
      if (existing) {
        return this.resolveReplay(user, existing, {
          category: input.category, parentType: input.parentType, parentId: input.parentId, body: input.body,
        }, digest);
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
        sizeBytes: String(input.body.length), sha256: digest,
        status: 'uploading', createdByUserId: user.userId, clientRequestId,
        expiresAt: input.expiresAt || null, deletedAt: null, deletedByUserId: null,
      }));
    } catch (error) {
      // Concurrent replay: the partial unique index rejected this insert, so another attempt won.
      // The loser resolves through exactly the same contract as a sequential replay, which is why
      // a race cannot produce an outcome a sequential replay could not.
      if (clientRequestId && isUniqueViolation(error)) {
        const winner = await this.findStoredByClientRequestId(user, clientRequestId);
        if (winner) {
          return this.resolveReplay(user, winner, {
            category: input.category, parentType: input.parentType, parentId: input.parentId, body: input.body,
          }, digest);
        }
      }
      throw error;
    }

    return this.putAndFinalize(user, record, input.body, input.contentType, true);
  }

  /**
   * @param createdHere whether THIS call created the row, which decides whether a failure may delete
   *   the object. A first attempt owns the key and cleans up after itself. A RESUME does not: the key
   *   may already hold bytes a previous attempt committed, and since a resume can only ever write
   *   bytes matching the row's digest, those bytes are correct. Deleting them to compensate for a
   *   failure in this request would destroy good evidence — which is what the pre-§314 code did.
   */
  private async putAndFinalize(
    user: AuthenticatedUser,
    record: StorageObject,
    body: Buffer,
    contentType: string,
    createdHere: boolean,
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

    // Which half failed changes what an operator should do, and before §314 both looked the same.
    let stage: 'PUT' | 'FINALIZE' = 'PUT';
    try {
      await provider.put(objectKey, body, contentType);
      stage = 'FINALIZE';
      // update() by id, not save(). A record re-read by client identifier was loaded without the
      // `select: false` objectKey column, and save() round-trips the entity it was handed; a
      // targeted column update cannot disturb a column this code never loaded.
      //
      // `sha256` is deliberately absent from this update and from every other write in this class.
      // The digest is written once at row creation and is never revised, so it cannot be quietly
      // moved to describe bytes that replaced the ones it was computed from.
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
        stage,
        resumable: !createdHere,
      });
      if (createdHere) await provider.delete(objectKey).catch(() => undefined);
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
