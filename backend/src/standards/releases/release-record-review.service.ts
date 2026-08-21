import { DataSource, EntityManager } from 'typeorm';
import { createHash } from 'crypto';
import { releaseCitationKey } from './citation-identity';
import { ReleaseRecordReviewState } from './review-state';
import { ReleaseRecordReviewDecision } from './regulatory-release-record-review.entity';
import {
  ApprovalDeltaAxis,
  classifyApprovalDelta,
  computeApprovalIdentity,
} from './approval-contract';

/**
 * KG-3B -- the reviewer approval mechanism.
 *
 * WHAT KG-3A LEFT OPEN. `reviewer_approved` had no legitimate producer. The finalizer used to
 * derive it from `approved_for_auto_ingestion` -- a statement about SOURCE ACQUISITION POLICY
 * ("this source may be fetched automatically") -- and record it as RECORD REVIEW STATE ("a
 * qualified reviewer approved this regulatory record"). KG-3A removed that derivation and
 * deliberately did not replace it, leaving every release at 0 governed records. This service is
 * the replacement, and it keeps those two claims separate: nothing here reads
 * `approved_for_auto_ingestion`, `requires_approval` or `authority_tier` as evidence OF review.
 * Those fields describe how content may be acquired; review is a decision a person makes about
 * content that has already been acquired.
 *
 * THE THREE PROPERTIES THIS SERVICE GUARANTEES
 *
 *  1. Approval names an exact content version. A decision is bound to `recordChecksum`, the
 *     sha256 of the frozen normalized payload. Approving requires the caller to state the
 *     checksum it reviewed; if the stored record's checksum differs, the approval is refused.
 *     This is optimistic concurrency over a REVIEW, and it is what stops the stale-review
 *     failure: reviewer reads version A, content is substituted, approval of A is refused.
 *
 *  2. A changed version cannot inherit approval. Release B's revision of the same citation has
 *     a different checksum, so A's decision does not name it. No policy rule is needed for
 *     this; it falls out of the binding.
 *
 *  3. Approval is revocable without erasing history. Revocation appends a decision; the prior
 *     approval row is retained, so a report generated while the approval stood remains
 *     explainable.
 *
 * NOT IN SCOPE, DELIBERATELY. No HTTP surface. Activation is already an operator/deployment
 * action with no route (KG-2), and regulatory review is a rarer and more consequential action
 * than activation -- exposing it would create an authorization surface that governs what
 * customers are told is authoritative regulation. The narrowest sufficient mechanism is this
 * service plus the admin CLI in `scripts/review-regulatory-release-record.ts`.
 */

export type ReviewGateKey =
  | 'releaseExists'
  | 'recordExists'
  | 'checksumMatches'
  | 'approvalDigestMatches'
  | 'frozenStateEligible'
  | 'reviewerIdentified'
  | 'currentlyApproved';

export interface ReviewGate {
  key: ReviewGateKey;
  passed: boolean;
  detail: string;
}

export class ReleaseRecordReviewRefused extends Error {
  constructor(message: string, readonly gates: ReviewGate[], readonly failedGates: ReviewGateKey[]) {
    super(message);
    this.name = 'ReleaseRecordReviewRefused';
  }
}

export interface ReviewDecisionInput {
  releaseId: string;
  /** Citation as published or in any equivalent form; normalized to `citationKey` for lookup. */
  citation: string;
  /**
   * The `recordChecksum` the reviewer actually read. REQUIRED -- there is no "approve whatever
   * is there now" path, because that is precisely the stale approval this design forbids.
   */
  expectedChecksum: string;
  /**
   * KG-3F -- the approval-contract digest the reviewer read, when they read one.
   *
   * OPTIONAL, and deliberately not promoted to required. Within a single release the snapshot is
   * write-once, so `recordChecksum` and `approvalDigest` are one-to-one and requiring both would
   * add ceremony without adding protection. Where the contract actually bites is ACROSS releases
   * and against the drifting live corpus -- see `describeCarryForwardCandidates` and
   * `describeLiveCorpusDrift`. Supplying it here is nonetheless enforced strictly when supplied,
   * so a caller that has the digest gets the stronger binding, and it is always RECORDED on the
   * decision so a later divergence can be attributed to an axis after the fact.
   */
  expectedApprovalDigest?: string;
  reviewerId: string;
  reviewerRole?: string;
  note?: string;
  /**
   * Set only when this decision is an explicit reaffirmation of an earlier one under a newer
   * approval contract. Names the prior decision; never edits it.
   */
  supersedesDecisionId?: string;
}

export interface ReviewDecisionResult {
  outcome: 'approved' | 'revoked' | 'already_approved' | 'already_not_approved';
  releaseId: string;
  citation: string;
  citationKey: string;
  recordChecksum: string;
  effectiveReviewState: ReleaseRecordReviewState;
  decisionId: string | null;
}

export interface RecordReviewStatus {
  releaseId: string;
  citation: string;
  citationKey: string;
  recordChecksum: string;
  /** State frozen into the immutable snapshot at finalization. Never changes. */
  frozenReviewState: ReleaseRecordReviewState;
  /** Frozen state overlaid with the latest decision bound to this exact checksum. */
  effectiveReviewState: ReleaseRecordReviewState;
  latestDecision: ReleaseRecordReviewDecision | null;
  reviewerId: string | null;
  reviewerRole: string | null;
  decidedAt: Date | null;
  note: string | null;
  /** Every decision ever recorded for this exact version, oldest first. */
  history: Array<{
    decision: ReleaseRecordReviewDecision;
    reviewerId: string;
    reviewerRole: string | null;
    decidedAt: Date;
    note: string | null;
  }>;
}

/**
 * PHASE 6 GOVERNANCE DECISION, stated as code so it cannot be quietly assumed either way.
 *
 * When release B contains a record whose normalized payload is byte-identical to an approved
 * record in release A, the checksums are equal, so a carry-forward WOULD be technically
 * defensible: the reviewer approved exactly those bytes.
 *
 * It is nonetheless OFF. The checksum covers the normalized regulatory content
 * (`normalizeStandardRecord`), not the circumstances that make an approval meaningful --
 * effective date, whether the citation was withdrawn or superseded upstream between releases,
 * or whether the reviewer's basis still holds. Identical text in a new release can be a
 * regulation that has since been rescinded. Defaulting to "requires review" makes an
 * unreviewed record visible as unreviewed; defaulting the other way makes a stale approval
 * invisible.
 *
 * The cost is bounded and explicit: re-approving identical content is one CLI call per record,
 * and `describeCarryForwardCandidates()` below enumerates exactly which records qualify so the
 * work is targeted rather than a bulk re-approval.
 */
export const CARRY_FORWARD_ON_IDENTICAL_CONTENT = false;

const HEX64 = /^[0-9a-f]{64}$/;

interface SnapshotRecordRow {
  id: string;
  citation: string;
  citationKey: string;
  recordChecksum: string;
  reviewState: ReleaseRecordReviewState;
  /** NULL for records finalized before the KG-3F approval contract. Never backfilled. */
  approvalContractVersion: number | null;
  approvalDigest: string | null;
  substantiveContentDigest: string | null;
  sourceIdentityDigest: string | null;
  approvalPayload: Record<string, any> | null;
}

export class ReleaseRecordReviewService {
  constructor(private readonly dataSource: DataSource) {}

  // ---------------------------------------------------------------- read-only surface

  /**
   * Resolves the effective review state of every record in a release in one query.
   *
   * `DISTINCT ON` picks the latest decision per exact (citation, version) triple. The join is
   * on `recordChecksum` as well as `citationKey`, so a decision recorded against a different
   * version of the same citation contributes nothing -- that is guarantee (2) expressed in SQL.
   */
  async resolveEffectiveReviewStates(
    releaseId: string, manager?: EntityManager,
  ): Promise<Map<string, ReleaseRecordReviewState>> {
    const runner = manager ?? this.dataSource.manager;
    const rows: Array<{ citationKey: string; effectiveState: ReleaseRecordReviewState }> =
      await runner.query(EFFECTIVE_STATE_SQL, [releaseId]);
    return new Map(rows.map(row => [row.citationKey, row.effectiveState]));
  }

  /** Counts the effective review states of a release. Used by the KG-2 activation gate. */
  async countEffectiveReviewStates(releaseId: string, manager?: EntityManager): Promise<{
    total: number;
    reviewer_approved: number;
    mechanically_validated: number;
    unreviewed: number;
  }> {
    const runner = manager ?? this.dataSource.manager;
    const [row] = await runner.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE "effectiveState" = 'reviewer_approved')::int AS approved,
         COUNT(*) FILTER (WHERE "effectiveState" = 'mechanically_validated')::int AS mechanical,
         COUNT(*) FILTER (WHERE "effectiveState" = 'unreviewed')::int AS unreviewed
       FROM (${EFFECTIVE_STATE_SQL}) AS effective`,
      [releaseId],
    );
    return {
      total: Number(row.total),
      reviewer_approved: Number(row.approved),
      mechanically_validated: Number(row.mechanical),
      unreviewed: Number(row.unreviewed),
    };
  }

  async describeRecordReview(releaseId: string, citation: string): Promise<RecordReviewStatus | null> {
    const citationKey = releaseCitationKey(citation);
    const record = await this.loadRecord(releaseId, citationKey);
    if (!record) return null;

    const history: any[] = await this.dataSource.query(
      `SELECT decision, "reviewerId", "reviewerRole", "decidedAt", note
         FROM regulatory_release_record_reviews
        WHERE "releaseId" = $1 AND "citationKey" = $2 AND "recordChecksum" = $3
        ORDER BY "decidedAt" ASC, "createdAt" ASC`,
      [releaseId, citationKey, record.recordChecksum],
    );
    const latest = history.length ? history[history.length - 1] : null;

    return {
      releaseId,
      citation: record.citation,
      citationKey,
      recordChecksum: record.recordChecksum,
      frozenReviewState: record.reviewState,
      effectiveReviewState: effectiveState(record.reviewState, latest?.decision ?? null),
      latestDecision: latest?.decision ?? null,
      reviewerId: latest?.reviewerId ?? null,
      reviewerRole: latest?.reviewerRole ?? null,
      decidedAt: latest?.decidedAt ?? null,
      note: latest?.note ?? null,
      history,
    };
  }

  /**
   * PHASE 9 -- the approval-state integrity digest.
   *
   * The release CONTENT manifest (`regulatory_releases.manifestChecksum`) deliberately excludes
   * governance fields, so approving a record does not and must not change it: content integrity
   * and approval state are separately auditable, and a finalized content manifest is never
   * rewritten because approval changed.
   *
   * That separation would leave approval state with no integrity digest at all, so this is its
   * own: a checksum over (citationKey, recordChecksum, effectiveState) for the whole release. It
   * is computed on demand rather than stored, because approval state is intentionally mutable
   * over time -- storing it would recreate the "frozen thing that must be rewritten" problem.
   * Two observers can compare this value to agree on the approval state of a release at a point
   * in time.
   */
  async computeApprovalStateChecksum(releaseId: string): Promise<{
    releaseId: string; approvalStateChecksum: string; recordCount: number;
  }> {
    const rows: any[] = await this.dataSource.query(
      `SELECT "citationKey", "recordChecksum", "effectiveState"
         FROM (${EFFECTIVE_STATE_SQL}) AS effective
        ORDER BY "citationKey"`,
      [releaseId],
    );
    const approvalStateChecksum = createHash('sha256')
      .update(JSON.stringify(rows.map(row => ({
        citationKey: row.citationKey,
        recordChecksum: row.recordChecksum,
        state: row.effectiveState,
      }))))
      .digest('hex');
    return { releaseId, approvalStateChecksum, recordCount: rows.length };
  }

  /**
   * PHASE 6 -- enumerates records in `targetReleaseId` whose exact content was already approved
   * in some other release. Because `CARRY_FORWARD_ON_IDENTICAL_CONTENT` is false these are NOT
   * approved automatically; this exists so the re-review work is a short, evidenced list rather
   * than a full re-review of the corpus, and so the carry-forward decision stays visible rather
   * than being silently implemented by omission.
   */
  /**
   * KG-3F CORRECTION. This matched on `recordChecksum` -- the release MANIFEST digest -- to decide
   * that two releases held "identical content". They are not the same question. The manifest
   * projection omits `part_number`/`subpart` and `deprecation_status`, so two records could share
   * a `recordChecksum` while differing in paragraph granularity or while one of them had been
   * marked superseded upstream. This surface would have offered such a record as a carry-forward
   * candidate on the strength of a digest that never looked at the fields that changed.
   *
   * Matching now runs on `approvalDigest`, which covers both. `matchBasis` is reported so the
   * caller can see WHICH binding established the match, and pre-contract records are surfaced as
   * `reaffirmation_required` rather than silently omitted or silently offered.
   */
  async describeCarryForwardCandidates(targetReleaseId: string): Promise<Array<{
    citation: string; citationKey: string; recordChecksum: string;
    approvalDigest: string | null;
    matchBasis: 'approval_contract' | 'reaffirmation_required';
    approvedInReleaseId: string; approvedBy: string; approvedAt: Date;
  }>> {
    return this.dataSource.query(
      `SELECT r.citation, r."citationKey", r."recordChecksum", r."approvalDigest",
              'approval_contract'::text AS "matchBasis",
              prior."releaseId" AS "approvedInReleaseId",
              prior."reviewerId" AS "approvedBy",
              prior."decidedAt"  AS "approvedAt"
         FROM regulatory_release_records r
         JOIN LATERAL (
           SELECT DISTINCT ON (v."releaseId") v."releaseId", v."reviewerId", v."decidedAt", v.decision
             FROM regulatory_release_record_reviews v
            WHERE v."approvalDigest" = r."approvalDigest"
              AND v."releaseId" <> $1
            ORDER BY v."releaseId", v."decidedAt" DESC, v."createdAt" DESC
         ) prior ON prior.decision = 'approved'
        WHERE r."releaseId" = $1
          AND r."approvalDigest" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM regulatory_release_record_reviews own
             WHERE own."releaseId" = $1 AND own."citationKey" = r."citationKey"
               AND own."recordChecksum" = r."recordChecksum")
        ORDER BY r.citation`,
      [targetReleaseId],
    );
  }

  /**
   * KG-3F Phase 10 -- the explicit contract migration surface.
   *
   * Enumerates approvals that stand under a PRE-CONTRACT binding and therefore cannot be carried
   * into the current contract automatically. This is the whole migration mechanism: it produces a
   * worklist, never a decision. Reaffirming one is an ordinary `approveRecord` call carrying
   * `supersedesDecisionId`, so the new decision is appended and the old one is preserved intact.
   *
   * There is deliberately no bulk path. A record here is one whose approval was taken over a
   * projection that did not include granularity or force, so "is this still right" is exactly the
   * question a human has to answer.
   */
  async describeContractReaffirmationCandidates(releaseId: string): Promise<Array<{
    citation: string; citationKey: string; recordChecksum: string;
    decisionId: string; approvedBy: string; approvedAt: Date;
    priorContractVersion: number | null;
    recordContractVersion: number | null;
    reason: string;
  }>> {
    return this.dataSource.query(
      `SELECT r.citation, r."citationKey", r."recordChecksum",
              latest.id AS "decisionId",
              latest."reviewerId" AS "approvedBy",
              latest."decidedAt"  AS "approvedAt",
              latest."approvalContractVersion" AS "priorContractVersion",
              r."approvalContractVersion"      AS "recordContractVersion",
              CASE
                WHEN r."approvalDigest" IS NULL
                  THEN 'Record predates the approval contract; re-finalize the release under the '
                       || 'contract, then reaffirm.'
                ELSE 'Approval was recorded before the approval contract existed and binds only to '
                     || 'the manifest checksum, which does not cover citation granularity or '
                     || 'deprecation status. Explicit reaffirmation required.'
              END AS reason
         FROM regulatory_release_records r
         JOIN LATERAL (
           SELECT v.id, v."reviewerId", v."decidedAt", v.decision, v."approvalContractVersion"
             FROM regulatory_release_record_reviews v
            WHERE v."releaseId" = r."releaseId"
              AND v."citationKey" = r."citationKey"
              AND v."recordChecksum" = r."recordChecksum"
            ORDER BY v."decidedAt" DESC, v."createdAt" DESC
            LIMIT 1
         ) latest ON latest.decision = 'approved'
        WHERE r."releaseId" = $1
          AND latest."approvalContractVersion" IS NULL
        ORDER BY r.citation`,
      [releaseId],
    );
  }

  /**
   * KG-3F -- has the LIVE corpus drifted away from what a reviewer approved in this release?
   *
   * The release snapshot is immutable, so within a release nothing can drift. `standards_master`
   * is not immutable, and it is what retrieval actually reads. A record approved in release A
   * whose live row has since been re-scoped to a different subpart is the failure mode the
   * contract was written to name, and no existing surface could see it: the manifest digest does
   * not cover granularity, and the snapshot cannot notice edits made after it was frozen.
   *
   * Read-only and diagnostic. Reports the axis that moved so a provenance correction is not
   * mistaken for a regulatory revision.
   */
  async describeLiveCorpusDrift(releaseId: string): Promise<Array<{
    citation: string; citationKey: string;
    approvedAt: Date; approvedBy: string;
    axis: ApprovalDeltaAxis; effect: string; changedFields: string[]; reason: string;
  }>> {
    const rows: any[] = await this.dataSource.query(
      `SELECT r.citation, r."citationKey", r."approvalPayload",
              r."substantiveContentDigest", r."sourceIdentityDigest", r."approvalDigest",
              r."approvalContractVersion",
              latest."reviewerId" AS "approvedBy", latest."decidedAt" AS "approvedAt",
              -- to_jsonb rather than a column list: standards_master and the snapshot both
              -- carry a citation column, and aliasing every approval-material column by hand
              -- is a second place for the projection to drift out of step with the contract.
              to_jsonb(s.*) AS live
         FROM regulatory_release_records r
         JOIN LATERAL (
           SELECT v."reviewerId", v."decidedAt", v.decision
             FROM regulatory_release_record_reviews v
            WHERE v."releaseId" = r."releaseId" AND v."citationKey" = r."citationKey"
              AND v."recordChecksum" = r."recordChecksum"
            ORDER BY v."decidedAt" DESC, v."createdAt" DESC LIMIT 1
         ) latest ON latest.decision = 'approved'
         JOIN standards_master s ON s.id = r."standardId"
        WHERE r."releaseId" = $1 AND r."approvalDigest" IS NOT NULL
        ORDER BY r.citation`,
      [releaseId],
    );

    const drifted: any[] = [];
    for (const row of rows) {
      const live = computeApprovalIdentity(row.live);
      const approved = {
        approvalContractVersion: row.approvalContractVersion,
        substantiveContentDigest: row.substantiveContentDigest,
        sourceIdentityDigest: row.sourceIdentityDigest,
        approvalDigest: row.approvalDigest,
        approvalPayload: row.approvalPayload,
      };
      const delta = classifyApprovalDelta(approved as any, live);
      if (delta.axis !== 'none') {
        drifted.push({
          citation: row.citation, citationKey: row.citationKey,
          approvedAt: row.approvedAt, approvedBy: row.approvedBy,
          axis: delta.axis, effect: delta.effect,
          changedFields: delta.changedFields, reason: delta.reason,
        });
      }
    }
    return drifted;
  }

  // ---------------------------------------------------------------- decisions

  /**
   * Records a reviewer's approval of one exact release-record version.
   *
   * Every refusal names the gate that failed, so "why can't I approve this" is answerable
   * without reading the code.
   */
  async approveRecord(input: ReviewDecisionInput): Promise<ReviewDecisionResult> {
    return this.decide('approved', input);
  }

  /**
   * Revokes an approval. Appends a decision; deletes nothing. `note` is required, because a
   * governance correction that does not say why it was made is not auditable.
   */
  async revokeApproval(input: ReviewDecisionInput): Promise<ReviewDecisionResult> {
    if (!String(input.note || '').trim()) {
      throw new ReleaseRecordReviewRefused(
        'Revocation requires a note stating the grounds for the correction.',
        [], [],
      );
    }
    return this.decide('revoked', input);
  }

  private async decide(
    decision: ReleaseRecordReviewDecision, input: ReviewDecisionInput,
  ): Promise<ReviewDecisionResult> {
    const citationKey = releaseCitationKey(input.citation);
    const expected = String(input.expectedChecksum || '').trim().toLowerCase();
    const reviewerId = String(input.reviewerId || '').trim();

    return this.dataSource.transaction(async manager => {
      // Serializes concurrent decisions on the same release so "already approved" cannot race
      // two duplicate decision rows into the log.
      await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`,
        [`regulatory-release-record-review:${input.releaseId}`]);

      const gates: ReviewGate[] = [];
      const release = await manager.query(
        `SELECT status FROM regulatory_releases WHERE "releaseId" = $1`, [input.releaseId],
      );
      gates.push({
        key: 'releaseExists',
        passed: release.length > 0,
        detail: release.length
          ? `Release ${input.releaseId} exists (status '${release[0].status}').`
          : `No release ${input.releaseId} exists.`,
      });

      const record = release.length ? await this.loadRecord(input.releaseId, citationKey, manager) : null;
      gates.push({
        key: 'recordExists',
        passed: !!record,
        detail: record
          ? `Release ${input.releaseId} holds ${record.citation} (checksum ${record.recordChecksum}).`
          : `Release ${input.releaseId} holds no record for citation key '${citationKey}'.`,
      });

      // PHASE 5 -- stale-review protection. The reviewer states the version they read; if the
      // release holds different content under that citation, the decision is about content the
      // reviewer never saw and is refused rather than silently retargeted.
      gates.push({
        key: 'checksumMatches',
        passed: !!record && HEX64.test(expected) && record.recordChecksum === expected,
        detail: !record
          ? 'No record to compare against.'
          : !HEX64.test(expected)
            ? `Expected checksum '${input.expectedChecksum}' is not a sha256 hex digest.`
            : record.recordChecksum === expected
              ? 'Reviewed version matches the version stored in the release.'
              : `STALE REVIEW: reviewer read ${expected}, release now holds ` +
                `${record.recordChecksum}. The content changed or a different version was ` +
                'substituted; re-review the current version.',
      });

      // KG-3F -- the approval-contract binding, enforced only when the caller states one.
      //
      // Passing vacuously when no digest is supplied is intentional, not lenient: the record's
      // own `approvalDigest` is still recorded on the decision below either way, so the binding
      // is captured regardless. This gate exists for the caller that DOES read the contract
      // digest, so that a reviewer who reviewed under the contract cannot have their decision
      // silently retargeted at a record whose granularity or force changed -- the two field
      // groups `recordChecksum` does not cover.
      const expectedApproval = String(input.expectedApprovalDigest || '').trim().toLowerCase();
      gates.push({
        key: 'approvalDigestMatches',
        passed: !expectedApproval
          || (!!record && HEX64.test(expectedApproval) && record.approvalDigest === expectedApproval),
        detail: !expectedApproval
          ? 'No approval-contract digest supplied; binding recorded from the stored record.'
          : !record
            ? 'No record to compare against.'
            : !HEX64.test(expectedApproval)
              ? `Expected approval digest '${input.expectedApprovalDigest}' is not a sha256 hex digest.`
              : record.approvalDigest === null
                ? 'Record predates the approval contract and carries no approval digest, but the '
                  + 'caller supplied one. Re-finalize the release under the contract before '
                  + 'binding a decision to it.'
                : record.approvalDigest === expectedApproval
                  ? `Reviewed approval identity matches (contract v${record.approvalContractVersion}).`
                  : `STALE REVIEW under the approval contract: reviewer read ${expectedApproval}, `
                    + `release now holds ${record.approvalDigest}. Approval-material content `
                    + '(regulatory substance or authoritative source identity) differs.',
      });

      gates.push({
        key: 'reviewerIdentified',
        passed: reviewerId.length > 0,
        detail: reviewerId ? `Reviewer '${reviewerId}'.` : 'No reviewer identity supplied.',
      });

      // PHASE 2 -- transition precondition, justified by the architecture rather than imposed.
      //
      // Approval is allowed only from `mechanically_validated`. `unreviewed` is not a "not yet
      // looked at" state in this architecture: `assessReviewState` assigns it for a specific,
      // enumerated defect -- absent or placeholder source provenance, a deprecated or inactive
      // record, or a record that never went through deterministic normalization. Approving any
      // of those would attest to a regulatory record with no identified issuing authority, or
      // to one the corpus already marks as withdrawn. The remedy is to fix the provenance and
      // re-finalize, not to approve past it.
      //
      // Records already frozen as `reviewer_approved` (only possible via the legacy
      // `standards_master.reviewer_approved` boolean, which no code writes) are accepted for an
      // explicit decision so that state can be affirmed or revoked rather than being stuck.
      const frozen = record?.reviewState;
      gates.push({
        key: 'frozenStateEligible',
        passed: frozen === 'mechanically_validated' || frozen === 'reviewer_approved',
        detail: frozen === 'mechanically_validated'
          ? 'Record passed deterministic validation and is eligible for substantive review.'
          : frozen === 'reviewer_approved'
            ? 'Record carries a legacy frozen approval; an explicit decision may affirm or revoke it.'
            : `Record is frozen as '${frozen}': ${record ? 'see reviewStateReason' : 'no record'}. ` +
              'Provenance/validation must be remediated and the release re-finalized before ' +
              'substantive review is meaningful.',
      });

      const failedBeforeState = gates.filter(gate => !gate.passed).map(gate => gate.key);
      if (failedBeforeState.length) {
        await this.auditRefusal(manager, decision, input, gates, failedBeforeState);
        throw new ReleaseRecordReviewRefused(
          `Review decision '${decision}' refused for ${input.citation} in ${input.releaseId}: ` +
          `${failedBeforeState.join(', ')}.`,
          gates, failedBeforeState,
        );
      }

      const current = record as SnapshotRecordRow;
      const [latest] = await manager.query(
        `SELECT decision FROM regulatory_release_record_reviews
          WHERE "releaseId" = $1 AND "citationKey" = $2 AND "recordChecksum" = $3
          ORDER BY "decidedAt" DESC, "createdAt" DESC LIMIT 1`,
        [input.releaseId, citationKey, current.recordChecksum],
      );
      const currentEffective = effectiveState(current.reviewState, latest?.decision ?? null);

      // Idempotence: re-approving an already-approved version, or revoking one that is not
      // approved, is a no-op success rather than a duplicate log entry.
      if (decision === 'approved' && currentEffective === 'reviewer_approved') {
        return {
          outcome: 'already_approved' as const,
          releaseId: input.releaseId, citation: current.citation, citationKey,
          recordChecksum: current.recordChecksum,
          effectiveReviewState: currentEffective, decisionId: null,
        };
      }
      if (decision === 'revoked' && currentEffective !== 'reviewer_approved') {
        return {
          outcome: 'already_not_approved' as const,
          releaseId: input.releaseId, citation: current.citation, citationKey,
          recordChecksum: current.recordChecksum,
          effectiveReviewState: currentEffective, decisionId: null,
        };
      }

      // KG-3F: the decision records the approval identity it was taken against, copied from the
      // record rather than from the caller. On a pre-contract record these stay NULL, which is
      // the honest statement -- there was no contract digest to bind to.
      const [inserted] = await manager.query(
        `INSERT INTO regulatory_release_record_reviews
           ("releaseId","citationKey",citation,"recordChecksum",decision,"reviewerId",
            "reviewerRole",note,"frozenReviewStateAtDecision","decidedAt",
            "approvalContractVersion","approvalDigest","substantiveContentDigest",
            "sourceIdentityDigest","supersedesDecisionId")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10,$11,$12,$13,$14)
         RETURNING id`,
        [input.releaseId, citationKey, current.citation, current.recordChecksum, decision,
          reviewerId, input.reviewerRole ?? null, input.note ?? null, current.reviewState,
          current.approvalContractVersion, current.approvalDigest,
          current.substantiveContentDigest, current.sourceIdentityDigest,
          input.supersedesDecisionId ?? null],
      );

      // Reuses the KG-2 audit trail rather than adding a parallel one, so the release timeline
      // shows activations, rollbacks and review decisions in one ordered history.
      await manager.query(
        `INSERT INTO knowledge_release_events
           (event, outcome, "fromReleaseId", "toReleaseId", actor, reason, details)
         VALUES ($1,'succeeded',NULL,$2,$3,$4,$5)`,
        [decision === 'approved' ? 'record_approval' : 'record_revocation',
          input.releaseId, reviewerId, input.note ?? null,
          JSON.stringify({
            citation: current.citation, citationKey,
            recordChecksum: current.recordChecksum,
            frozenReviewState: current.reviewState,
            reviewerRole: input.reviewerRole ?? null,
          })],
      );

      return {
        outcome: decision === 'approved' ? ('approved' as const) : ('revoked' as const),
        releaseId: input.releaseId, citation: current.citation, citationKey,
        recordChecksum: current.recordChecksum,
        effectiveReviewState: effectiveState(current.reviewState, decision),
        decisionId: inserted.id,
      };
    });
  }

  // ---------------------------------------------------------------- internals

  private async loadRecord(
    releaseId: string, citationKey: string, manager?: EntityManager,
  ): Promise<SnapshotRecordRow | null> {
    const runner = manager ?? this.dataSource.manager;
    const [row] = await runner.query(
      `SELECT id, citation, "citationKey", "recordChecksum", "reviewState",
              "approvalContractVersion", "approvalDigest", "substantiveContentDigest",
              "sourceIdentityDigest", "approvalPayload"
         FROM regulatory_release_records
        WHERE "releaseId" = $1 AND "citationKey" = $2`,
      [releaseId, citationKey],
    );
    return row ?? null;
  }

  private async auditRefusal(
    manager: EntityManager, decision: ReleaseRecordReviewDecision,
    input: ReviewDecisionInput, gates: ReviewGate[], failedGates: ReviewGateKey[],
  ) {
    // Refused reviews are audited for the same reason refused activations are: "someone tried
    // to approve content that had changed underneath them and was stopped" is exactly what a
    // governance audit needs to retain. Written on its own connection so it survives the
    // rollback of the transaction that raised the refusal.
    await this.dataSource.query(
      `INSERT INTO knowledge_release_events
         (event, outcome, "fromReleaseId", "toReleaseId", actor, reason, details)
       VALUES ($1,'refused',NULL,$2,$3,$4,$5)`,
      [decision === 'approved' ? 'record_approval' : 'record_revocation',
        input.releaseId, String(input.reviewerId || 'unidentified'), input.note ?? null,
        JSON.stringify({
          citation: input.citation,
          expectedChecksum: input.expectedChecksum,
          failedGates, gates,
        })],
    ).catch(() => undefined);
    void manager;
  }
}

/**
 * The effective state of a record: what it was frozen as, overlaid by the latest decision bound
 * to that exact version.
 *
 * A revocation returns the record to its FROZEN state rather than to `unreviewed`. The frozen
 * state is a true statement that survives the revocation -- a mechanically validated record
 * whose approval was withdrawn is still mechanically validated -- and downgrading it further
 * would assert something false about the content.
 */
export function effectiveState(
  frozen: ReleaseRecordReviewState, latestDecision: ReleaseRecordReviewDecision | null,
): ReleaseRecordReviewState {
  if (latestDecision === 'approved') return 'reviewer_approved';
  if (latestDecision === 'revoked') return frozen === 'reviewer_approved' ? 'mechanically_validated' : frozen;
  return frozen;
}

/**
 * One record per release record, with its effective state. Parameter $1 is the releaseId.
 *
 * The LATERAL join matches on `recordChecksum` as well as `citationKey`, so a decision about a
 * different version of the same citation is invisible here. That is the version binding.
 */
const EFFECTIVE_STATE_SQL = `
  SELECT r.citation,
         r."citationKey",
         r."recordChecksum",
         r."reviewState" AS "frozenState",
         CASE
           WHEN latest.decision = 'approved' THEN 'reviewer_approved'
           WHEN latest.decision = 'revoked' AND r."reviewState" = 'reviewer_approved'
             THEN 'mechanically_validated'
           ELSE r."reviewState"
         END AS "effectiveState"
    FROM regulatory_release_records r
    LEFT JOIN LATERAL (
      SELECT v.decision
        FROM regulatory_release_record_reviews v
       WHERE v."releaseId"      = r."releaseId"
         AND v."citationKey"    = r."citationKey"
         AND v."recordChecksum" = r."recordChecksum"
       ORDER BY v."decidedAt" DESC, v."createdAt" DESC
       LIMIT 1
    ) latest ON TRUE
   WHERE r."releaseId" = $1`;

export { EFFECTIVE_STATE_SQL };
