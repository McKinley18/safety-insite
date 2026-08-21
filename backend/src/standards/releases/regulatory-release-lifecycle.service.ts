import { DataSource, EntityManager } from 'typeorm';
import { computeSnapshotManifest } from './release-manifest';
import { RegulatoryRelease, RegulatoryReleaseStatus } from './regulatory-release.entity';
import { RegulatoryReleaseRecord } from './regulatory-release-record.entity';
import { releaseCitationKey } from './citation-identity';
import { EFFECTIVE_STATE_SQL } from './release-record-review.service';

/**
 * KG-2 -- regulatory release lifecycle and the active-release pointer.
 *
 * This is CONTROL-PLANE ONLY. Nothing here is consumed by HazLenz standards retrieval, and
 * KG-2 deliberately does not wire it in: moving the pointer today changes no analysis, no
 * finding and no report. KG-3 decides, after a mandatory shadow diff, whether the runtime is
 * safe to honour it. Until then the value of this module is that a release can be activated
 * intentionally, gated, atomically, and rolled back to an exact prior release.
 *
 * Lifecycle:  draft -> provisional (finalized) -> active -> superseded | rolled_back
 *
 * Deliberately not exposed over HTTP. Activation is an operator/deployment action, and
 * adding a route would create an authorization surface KG-2 does not need.
 */

export type ActivationGateKey =
  | 'releaseExists'
  | 'statusEligible'
  | 'manifestChecksumWellFormed'
  | 'recordCountPositive'
  | 'releaseRecordsPresent'
  | 'recordCountMatches'
  | 'manifestChecksumVerifies'
  | 'governedRecordsPresent';

export interface ActivationGate {
  key: ActivationGateKey;
  passed: boolean;
  detail: string;
}

export interface ActivationEligibility {
  releaseId: string;
  eligible: boolean;
  alreadyActive: boolean;
  gates: ActivationGate[];
  failedGates: ActivationGateKey[];
}

export interface ReleaseScopeSummary {
  releaseId: string;
  /** Records in this release's immutable snapshot. */
  totalRecords: number;
  /** Records a reviewer actually approved -- what would survive a truthful governed filter. */
  governedRecords: number;
  /** Passed deterministic transformation checks but NOT reviewed. Not governed. */
  mechanicallyValidatedRecords: number;
  unreviewedRecords: number;
  /** Live corpus rows belonging to no release snapshot -- invisible to any release-scoped filter. */
  legacyUnscopedRecords: number;
}

export interface PointerMoveResult {
  outcome: 'activated' | 'already_active' | 'rolled_back';
  releaseId: string;
  previousReleaseId: string | null;
}

export class ReleaseActivationRefused extends Error {
  constructor(message: string, readonly eligibility: ActivationEligibility) {
    super(message);
    this.name = 'ReleaseActivationRefused';
  }
}

/**
 * KG-5B (Phase 16) -- the active pointer was not what the caller believed when the move was
 * about to commit.
 *
 * Distinct from `ReleaseActivationRefused` because it is not a property of the release: the
 * release may be perfectly activatable, and the operator may be perfectly entitled to activate
 * it. What failed is the caller's belief about the state they were acting on, which is a
 * concurrency outcome and needs its own name in the audit log.
 */
export class ReleasePointerConflict extends Error {
  constructor(
    readonly releaseId: string,
    readonly expectedCurrentReleaseId: string | null,
    readonly actualCurrentReleaseId: string | null,
  ) {
    super(
      `Refusing to move the active pointer to ${releaseId}: caller expected the active release to ` +
      `be ${expectedCurrentReleaseId ?? 'none'}, but it is ${actualCurrentReleaseId ?? 'none'}. ` +
      'Re-read the current state and reissue the command.',
    );
    this.name = 'ReleasePointerConflict';
  }
}

/**
 * KG-5B (Phase 16) -- OPTIONAL compare-and-swap precondition for a pointer move.
 *
 * THE DEFECT THIS ANSWERS, measured during KG-5B verification. The operator CLI first read the
 * active pointer, compared it against `--expected-current`, and only then called `activate()` or
 * `rollbackTo()`. Two operators acting on the same stale reading both passed that comparison,
 * both then serialized correctly on the advisory lock, and both committed -- so the second one
 * silently moved the pointer off the release the first had just activated. Every individual
 * transaction was atomic and the end state still had exactly one active release; the system was
 * nonetheless last-writer-wins, which is precisely what Phase 16 forbids.
 *
 * A precondition checked outside the lock is not a precondition. Supplying
 * `expectedCurrentReleaseId` moves the comparison INSIDE the transaction, after
 * `pg_advisory_xact_lock` has been taken, so the value compared is the value that will be
 * replaced. `undefined` (the key absent) means "no belief stated" and preserves the pre-KG-5B
 * behaviour exactly, which is why every existing caller is unaffected. `null` is a real belief --
 * "I expect nothing to be active" -- and is enforced like any other.
 */
export interface PointerMoveOptions {
  expectedCurrentReleaseId?: string | null;
}

const HEX64 = /^[0-9a-f]{64}$/;

export class RegulatoryReleaseLifecycleService {
  constructor(private readonly dataSource: DataSource) {}

  // ---------------------------------------------------------------- read-only surface

  /**
   * The deterministic active-release lookup. Returns null when no release is active, which
   * is the current state of every environment and is not an error.
   */
  async getActiveRelease(manager?: EntityManager): Promise<RegulatoryRelease | null> {
    const repo = (manager ?? this.dataSource.manager).getRepository(RegulatoryRelease);
    return repo.findOne({ where: { status: 'active' } });
  }

  async getRelease(releaseId: string, manager?: EntityManager): Promise<RegulatoryRelease | null> {
    const repo = (manager ?? this.dataSource.manager).getRepository(RegulatoryRelease);
    return repo.findOne({ where: { releaseId } });
  }

  /**
   * KG-3 shadow-diff preparation (read-only, not wired into retrieval).
   *
   * KG-3A: counted from the IMMUTABLE snapshot (`regulatory_release_records`), not from
   * `standards_master`. Counting the live corpus was what made release A appear to lose all its
   * records once release B re-stamped `release_id`.
   *
   * `governedRecords` is the number that would survive a governed filter under TRUTHFUL review
   * semantics -- records a reviewer actually approved. It is deliberately not the old
   * "auto-ingestable" count, which is what made an unreviewed corpus look governed.
   *
   * KG-3B: counted from the EFFECTIVE review state, not the state frozen into the snapshot.
   * Reviewer approval is a post-finalization control state (KG-3B Phase 9), so the frozen
   * `reviewState` column alone can never show an approval -- finalization does not confer one.
   * The effective state is the frozen state overlaid with the latest reviewer decision bound to
   * that record's EXACT checksum, so a decision recorded against a different version of the same
   * citation contributes nothing here.
   *
   * `manager` is threaded so the activation gate evaluates approval state inside the same
   * transaction (and behind the same advisory lock) as the rest of the gates.
   */
  async describeReleaseScope(releaseId: string, manager?: EntityManager): Promise<ReleaseScopeSummary> {
    const runner = manager ?? this.dataSource.manager;
    const [row] = await runner.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE "effectiveState" = 'reviewer_approved') AS governed,
         COUNT(*) FILTER (WHERE "effectiveState" = 'mechanically_validated') AS mechanical,
         COUNT(*) FILTER (WHERE "effectiveState" = 'unreviewed') AS unreviewed
       FROM (${EFFECTIVE_STATE_SQL}) AS effective`,
      [releaseId],
    );
    const [legacy] = await runner.query(
      `SELECT COUNT(*) AS n FROM standards_master
       WHERE id NOT IN (SELECT "standardId" FROM regulatory_release_records WHERE "standardId" IS NOT NULL)`,
    );
    return {
      releaseId,
      totalRecords: Number(row.total),
      governedRecords: Number(row.governed),
      mechanicallyValidatedRecords: Number(row.mechanical),
      unreviewedRecords: Number(row.unreviewed),
      legacyUnscopedRecords: Number(legacy.n),
    };
  }

  /**
   * Resolves a release's immutable records. This is the governed release-scope read interface:
   * it answers "what did this release contain" from the snapshot, so the answer is stable no
   * matter what later releases or re-ingestion do to the live corpus.
   */
  async resolveReleaseRecords(releaseId: string): Promise<RegulatoryReleaseRecord[]> {
    return this.dataSource.getRepository(RegulatoryReleaseRecord).find({
      where: { releaseId },
      order: { agencyCode: 'ASC', citation: 'ASC' },
    });
  }

  /**
   * Resolves ONE logical citation as it stood under a given release. This is what lets a
   * finding recorded under release A keep showing A's text after release B revises the same
   * citation -- the Phase 3 identity separation made usable.
   */
  async resolveCitationInRelease(
    releaseId: string, citation: string,
  ): Promise<RegulatoryReleaseRecord | null> {
    return this.dataSource.getRepository(RegulatoryReleaseRecord).findOne({
      where: { releaseId, citationKey: releaseCitationKey(citation) },
    });
  }

  /**
   * Recomputes the release manifest from the release's own immutable snapshot and compares it
   * against the checksum stored at finalization. This is the tamper/immutability detector used
   * as an activation gate.
   *
   * KG-3A: recomputation reads `regulatory_release_records`, never `standards_master`. A
   * release therefore stays verifiable after the live corpus is re-stamped, re-ingested or
   * edited -- which is the whole point of a snapshot.
   */
  async verifyIntegrity(releaseId: string, manager?: EntityManager) {
    const runner = manager ?? this.dataSource.manager;
    const release = await this.getRelease(releaseId, manager);
    const rows = await runner.query(
      `SELECT "agencyCode", citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`,
      [releaseId],
    );
    const manifest = computeSnapshotManifest(rows);
    return {
      releaseId,
      storedChecksum: release?.manifestChecksum ?? null,
      recomputedChecksum: manifest.manifestChecksum,
      storedRecordCount: release?.recordCount ?? null,
      actualRecordCount: manifest.recordCount,
      matches: !!release && release.manifestChecksum === manifest.manifestChecksum,
    };
  }

  // ---------------------------------------------------------------- activation gates

  /**
   * Evaluates every activation prerequisite and reports each one individually, so a refusal
   * says which gate failed rather than just "not eligible".
   *
   * `eligibleStatuses` differs by operation: a forward activation promotes a finalized
   * (`provisional`) release; a rollback re-activates a release that was previously active
   * (`superseded` / `rolled_back`).
   */
  async evaluateActivation(
    releaseId: string,
    eligibleStatuses: RegulatoryReleaseStatus[],
    manager?: EntityManager,
  ): Promise<ActivationEligibility> {
    const gates: ActivationGate[] = [];
    const release = await this.getRelease(releaseId, manager);

    gates.push({
      key: 'releaseExists',
      passed: !!release,
      detail: release ? `Release ${releaseId} found.` : `No release ${releaseId} exists.`,
    });
    if (!release) {
      return this.summarize(releaseId, gates, false);
    }

    const alreadyActive = release.status === 'active';
    gates.push({
      key: 'statusEligible',
      passed: alreadyActive || eligibleStatuses.includes(release.status),
      detail: `Status is '${release.status}'; eligible: ${eligibleStatuses.join(', ')}.`,
    });
    gates.push({
      key: 'manifestChecksumWellFormed',
      passed: HEX64.test(String(release.manifestChecksum || '').trim()),
      detail: `Stored manifest checksum ${release.manifestChecksum ? 'present' : 'missing'}.`,
    });
    gates.push({
      key: 'recordCountPositive',
      passed: release.recordCount > 0,
      // A release governing nothing would silently empty the corpus if the read path ever
      // scoped to it.
      detail: `Declared recordCount is ${release.recordCount}.`,
    });

    const integrity = await this.verifyIntegrity(releaseId, manager);
    gates.push({
      key: 'releaseRecordsPresent',
      // KG-3A: counted from the release's own immutable snapshot. Under the old model this
      // counted live rows by release_id, so a later finalization could empty a finalized
      // release without anything noticing.
      passed: integrity.actualRecordCount > 0,
      detail: `${integrity.actualRecordCount} immutable snapshot records belong to ${releaseId}.`,
    });
    gates.push({
      key: 'recordCountMatches',
      passed: integrity.actualRecordCount === release.recordCount,
      detail: `Declared ${release.recordCount}, found ${integrity.actualRecordCount}.`,
    });
    gates.push({
      key: 'manifestChecksumVerifies',
      passed: integrity.matches,
      detail: integrity.matches
        ? 'Recomputed manifest matches the checksum stored at finalization.'
        : `Manifest mismatch: stored ${integrity.storedChecksum}, recomputed ${integrity.recomputedChecksum}. ` +
          'Governed content changed after finalization.',
    });

    const scope = await this.describeReleaseScope(releaseId, manager);
    gates.push({
      key: 'governedRecordsPresent',
      passed: scope.governedRecords > 0,
      // A release whose snapshot contains no reviewer-approved record must not govern
      // retrieval: once KG-3 scopes the read path it would reduce regulatory recall to zero.
      // KG-3A makes this stricter and more honest -- `mechanically_validated` records do NOT
      // count, because passing deterministic transformation checks is not substantive review.
      // The gate refuses the activation rather than quietly approving records to pass it.
      //
      // KG-3B gives the gate something it can actually pass: `describeReleaseScope` now counts
      // EFFECTIVE approval, so a release becomes activatable by recording real reviewer
      // decisions through `ReleaseRecordReviewService`. The threshold is deliberately left at
      // "at least one approved record" rather than "every record reviewed": the source registry
      // already distinguishes acquisition policy from review state, and requiring universal
      // review would make the gate a proxy for corpus completeness rather than for governance.
      // What "sufficient approved coverage" means for a customer-facing cutover is a corpus
      // readiness question, measured separately by the KG-3B corpus matrix and migration
      // inventory, not a property of the pointer move.
      detail: `${scope.governedRecords} of ${scope.totalRecords} snapshot records are reviewer-approved ` +
        `(${scope.mechanicallyValidatedRecords} mechanically validated, ${scope.unreviewedRecords} unreviewed).`,
    });

    return this.summarize(releaseId, gates, alreadyActive);
  }

  private summarize(releaseId: string, gates: ActivationGate[], alreadyActive: boolean): ActivationEligibility {
    const failedGates = gates.filter(gate => !gate.passed).map(gate => gate.key);
    return { releaseId, eligible: failedGates.length === 0, alreadyActive, gates, failedGates };
  }

  // ---------------------------------------------------------------- pointer movement

  /**
   * Promotes a finalized release to active.
   *
   * Atomic: the previous active release is retired and the new one activated inside one
   * transaction, so no committed state ever shows two active releases or (given a prior
   * active release existed) zero. Serialized by an advisory lock, and additionally guarded by
   * the partial unique index `uq_regulatory_release_active`, so a race cannot commit two.
   * Idempotent: re-activating the already-active release is a no-op success.
   */
  async activate(
    releaseId: string, actor: string, reason?: string, options?: PointerMoveOptions,
  ): Promise<PointerMoveResult> {
    return this.movePointer(
      'activation', releaseId, ['provisional'], 'superseded', actor, reason, options,
    );
  }

  /**
   * Rolls the pointer back to an EXACT previously-active release. Never "newest minus one":
   * the caller names the release. The release being rolled off is marked `rolled_back` and
   * retained in full -- nothing is deleted, so historical provenance stays resolvable.
   */
  async rollbackTo(
    releaseId: string, actor: string, reason?: string, options?: PointerMoveOptions,
  ): Promise<PointerMoveResult> {
    return this.movePointer(
      'rollback', releaseId, ['superseded', 'rolled_back'], 'rolled_back', actor, reason, options,
    );
  }

  private async movePointer(
    event: 'activation' | 'rollback',
    releaseId: string,
    eligibleStatuses: RegulatoryReleaseStatus[],
    retiredStatus: RegulatoryReleaseStatus,
    actor: string,
    reason?: string,
    options?: PointerMoveOptions,
  ): Promise<PointerMoveResult> {
    // Presence, not truthiness: `null` is the meaningful belief "nothing is active".
    const pointerPreconditionStated =
      !!options && Object.prototype.hasOwnProperty.call(options, 'expectedCurrentReleaseId');
    const expectedCurrentReleaseId = options?.expectedCurrentReleaseId ?? null;
    // Held in an object so the value assigned inside the transaction callback is still
    // visible (and correctly typed) in the catch block below.
    const state: { previousReleaseId: string | null } = { previousReleaseId: null };

    try {
      return await this.dataSource.transaction(async manager => {
        // Serializes concurrent pointer moves. The partial unique index is the hard
        // guarantee; this lock makes contention orderly rather than a constraint violation.
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, ['regulatory-release-pointer']);

        const eligibility = await this.evaluateActivation(releaseId, eligibleStatuses, manager);
        const current = await this.getActiveRelease(manager);
        state.previousReleaseId = current?.releaseId ?? null;

        // The compare-and-swap. Read under the advisory lock, so between this comparison and the
        // UPDATE below no other pointer move can interleave.
        if (pointerPreconditionStated
            && (current?.releaseId ?? null) !== expectedCurrentReleaseId) {
          throw new ReleasePointerConflict(
            releaseId, expectedCurrentReleaseId, current?.releaseId ?? null,
          );
        }

        if (eligibility.alreadyActive) {
          // Idempotent: already the pointer. Nothing to move, nothing to audit as a change.
          return { outcome: 'already_active' as const, releaseId, previousReleaseId: state.previousReleaseId };
        }
        if (!eligibility.eligible) {
          throw new ReleaseActivationRefused(
            `Release ${releaseId} failed activation gates: ${eligibility.failedGates.join(', ')}.`,
            eligibility,
          );
        }

        if (current) {
          await manager.query(
            `UPDATE regulatory_releases
             SET status = $2, "deactivatedAt" = now()
             WHERE "releaseId" = $1 AND status = 'active'`,
            [current.releaseId, retiredStatus],
          );
        }
        await manager.query(
          `UPDATE regulatory_releases
           SET status = 'active', "activatedAt" = now(), "deactivatedAt" = NULL,
               "parentReleaseId" = COALESCE($2, "parentReleaseId")
           WHERE "releaseId" = $1`,
          [releaseId, current?.releaseId ?? null],
        );

        await manager.query(
          `INSERT INTO knowledge_release_events
             (event, outcome, "fromReleaseId", "toReleaseId", actor, reason, details)
           VALUES ($1, 'succeeded', $2, $3, $4, $5, $6)`,
          [event, current?.releaseId ?? null, releaseId, actor, reason ?? null,
            JSON.stringify({ retiredStatus, gates: eligibility.gates })],
        );

        return {
          outcome: (event === 'rollback' ? 'rolled_back' : 'activated') as 'rolled_back' | 'activated',
          releaseId,
          previousReleaseId: state.previousReleaseId,
        };
      });
    } catch (error) {
      // The refusal must be audited, but it cannot be written inside the transaction that
      // rolled back -- the event row would have rolled back with it.
      if (error instanceof ReleaseActivationRefused) {
        await this.dataSource.query(
          `INSERT INTO knowledge_release_events
             (event, outcome, "fromReleaseId", "toReleaseId", actor, reason, details)
           VALUES ($1, 'refused', $2, $3, $4, $5, $6)`,
          [event, state.previousReleaseId, releaseId, actor, reason ?? null,
            JSON.stringify({
              failedGates: error.eligibility.failedGates,
              gates: error.eligibility.gates,
            })],
        );
      }
      // A lost race is an operational event an operator will want to find afterwards, so it is
      // audited on the same terms as a gate refusal.
      if (error instanceof ReleasePointerConflict) {
        await this.dataSource.query(
          `INSERT INTO knowledge_release_events
             (event, outcome, "fromReleaseId", "toReleaseId", actor, reason, details)
           VALUES ($1, 'refused', $2, $3, $4, $5, $6)`,
          [event, error.actualCurrentReleaseId, releaseId, actor, reason ?? null,
            JSON.stringify({
              refusal: 'POINTER_CONFLICT',
              expectedCurrentReleaseId: error.expectedCurrentReleaseId,
              actualCurrentReleaseId: error.actualCurrentReleaseId,
            })],
        );
      }
      throw error;
    }
  }
}
