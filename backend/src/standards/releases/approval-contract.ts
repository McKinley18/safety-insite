import { createHash } from 'crypto';
import { StandardsMasterRow } from './release-manifest';

/**
 * KG-3F (Phases 8-10) -- the explicit approval/provenance contract.
 *
 * THE DEFECT THIS ANSWERS. KG-3E measured that editing `source_url` or `retrieval_date` did not
 * change the reviewer-bound checksum, and left open whether that was correct. It was neither
 * correct nor incorrect -- it was UNDECIDED. `normalizeStandardRecord` (v1) was written to attest
 * to a release manifest, not to answer "what exactly did a reviewer approve", and the two
 * questions have different field sets. Because approval reused the manifest checksum, the
 * approval contract was whatever the manifest projection happened to contain. That is how
 * `part_number`/`subpart` -- GRANULARITY, the thing KG-3E and KG-3F both proved is legally
 * load-bearing -- ended up outside the reviewer's binding, while `keywords` ended up inside it by
 * accident rather than by decision.
 *
 * This module states the contract instead of inheriting it, and it is deliberately derived from
 * what the fields MEAN, not from what v1 already did.
 *
 * THE MODEL: Option 2 -- two digests, composed into one versioned approval digest.
 *
 * A single digest can say "something changed"; it cannot say WHAT KIND of thing changed, and the
 * two kinds have different remedies. If the regulation's text changed, the reviewer's legal
 * conclusion may no longer hold and a human must read it again. If the record was re-derived from
 * a different authoritative edition, the conclusion may still hold but its provenance no longer
 * matches what was attested. Collapsing both into one opaque hash forces every provenance
 * correction through a full regulatory re-review, which is the pressure that produces bulk
 * rubber-stamping. Splitting them lets the carry-forward mechanism report the reason.
 *
 *   substantiveContentDigest -- the regulatory obligation itself
 *   sourceIdentityDigest     -- the authoritative artifact/edition it was drawn from
 *   approvalDigest           -- digest(version + both), the thing an approval names
 *
 * Transport metadata is in NEITHER, by decision (see AXIS C).
 *
 * RELATIONSHIP TO v1. `normalizeStandardRecord` and `recordChecksum` are NOT modified. They are
 * the release MANIFEST identity, and every finalized release's integrity proof depends on them
 * byte-for-byte. The approval contract is a second, parallel identity over the same row. A record
 * therefore carries both: `recordChecksum` proves the release was not tampered with, and
 * `approvalDigest` proves the reviewer's decision still names this content.
 */

/** The contract version. Bump ONLY with a migration and an explicit carry-forward pass. */
export const APPROVAL_CONTRACT_VERSION = 2;

/**
 * A KEY-ORDER-INDEPENDENT digest. This is why the approval contract does not reuse the manifest's
 * `digest()`.
 *
 * The manifest digest is `sha256(JSON.stringify(value))`, which depends on key insertion order.
 * That is safe for v1 because a manifest is only ever recomputed from freshly-projected rows, in
 * code, in one order. The approval contract has a harder requirement: an approval must be
 * re-verifiable FOREVER from the frozen `approvalPayload` alone, without the live corpus -- and
 * that payload round-trips through a `jsonb` column, which does not preserve key order. Postgres
 * re-orders jsonb keys by length then bytewise on write, so a payload read back and re-stringified
 * produces a different string, and therefore a different sha256, from the one stored beside it.
 *
 * This was not a theoretical risk: the Phase 8 matrix caught it as a hard failure (DB-2) on the
 * first run. Sorting keys recursively before hashing makes the digest a function of the CONTENT,
 * which is what it was always supposed to attest to.
 *
 * `digest()` in `release-manifest.ts` is deliberately left alone -- changing it would move every
 * finalized release's manifest checksum.
 */
export function canonicalDigest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>).sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson((value as any)[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Extra `standards_master` columns the approval contract reads beyond the manifest projection.
 * Appended to the manifest SELECT. Adding columns to a SELECT cannot change a v1 digest, because
 * `normalizeStandardRecord` reads its fields by name.
 */
export const APPROVAL_CONTRACT_SELECT_COLUMNS = `effective_date, revision_date, deprecation_status,
             superseded_by_citation, applicability_schema_version, source_publication_date,
             source_document_checksum, transformation_version, source_url, retrieval_date`;

/**
 * AXIS A -- THE SUBSTANTIVE REGULATORY ARTIFACT.
 *
 * What a reviewer actually adjudicates: which obligation this is, on whom it falls, what it
 * requires, and whether it is still in force. Any change here means the reviewer's legal
 * conclusion was reached about different content, so approval MUST become ineffective.
 *
 * Beyond v1, this adds four groups that v1 omitted and that are unambiguously approval-material:
 *
 *   GRANULARITY (`part_number`, `subpart`). KG-3E's whole granularity contract exists because
 *   1926.50 and 1926.501 are different duties. v1 covered `citation` but not the structural
 *   columns, so a record could be re-scoped to a different subpart while its approval stood.
 *
 *   FORCE AND TIME (`effective_date`, `revision_date`, `deprecation_status`,
 *   `superseded_by_citation`). A rescinded or superseded standard is the single most dangerous
 *   thing to cite, and under v1 flipping `deprecation_status` to `superseded` left approval
 *   untouched -- the record would still read as reviewer-approved authority.
 *
 *   APPLICABILITY (`applicability_schema_version`). Governs how the record's conditions are
 *   interpreted; reinterpreting them changes what the record asserts.
 *
 *   KEYWORDS, retained from v1 deliberately rather than inherited. Keywords look like search
 *   tuning, and the argument for excluding them is real -- a reviewer approves regulation, not a
 *   synonym list. They stay IN because KG-3F Phase 4 measured that they are not cosmetic: adding
 *   `keywords` to the scoring SELECT moved 1926.1153 from 15 to 51 and changed which citation was
 *   emitted for a silica finding. A record whose keywords changed can be surfaced against
 *   materially different hazards than the one the reviewer approved, and the reviewer approved
 *   the record AS AN ANSWER TO SOMETHING. That is approval-material.
 */
export function normalizeSubstantiveContent(row: StandardsMasterRow) {
  return {
    contractVersion: APPROVAL_CONTRACT_VERSION,
    // jurisdiction / regime
    agency: row.agency_code ?? null,
    // canonical citation + granularity
    citation: row.citation ?? null,
    partNumber: row.part_number ?? null,
    subpart: row.subpart ?? null,
    // codified heading + actual standard text + normalized clauses
    title: row.title ?? null,
    canonicalText: row.standard_text ?? null,
    summary: row.plain_language_summary ?? null,
    // legally material qualifications represented in the record
    scope: row.scope_code ?? null,
    hazards: row.hazard_codes ?? null,
    controls: row.required_controls ?? null,
    keywords: row.keywords ?? null,
    severityWeight: row.severity_weight ?? null,
    active: row.is_active ?? null,
    // whether the obligation is in force, and when
    effectiveDate: normalizeDate(row.effective_date),
    revisionDate: normalizeDate(row.revision_date),
    deprecationStatus: row.deprecation_status ?? null,
    supersededByCitation: row.superseded_by_citation ?? null,
    applicabilitySchemaVersion: row.applicability_schema_version ?? null,
  };
}

/**
 * AXIS B -- AUTHORITATIVE SOURCE IDENTITY.
 *
 * WHICH authoritative artifact this record is a rendering of. Distinct from Axis A because the
 * obligation and the attestation of where it came from can change independently: re-deriving the
 * same text from a different dataset family does not change the duty, but it does change what the
 * record's authority claim rests on, and a reviewer's approval carries that claim forward to a
 * customer.
 *
 * THE URL IS NOT HERE, AND THAT IS THE POINT. The task's caution -- "do not equate URL with source
 * identity automatically" -- is the crux. `source_url` is one retrieval path to an artifact; it is
 * not the artifact. eCFR serves 29 CFR 1910.212 from several stable and unstable paths, and the
 * govinfo mirror serves the identical codified text under a different host entirely. If the URL
 * carried identity, every mirror migration would invalidate the whole corpus's approvals and force
 * exactly the bulk re-approval this design forbids. What DOES carry identity is the registry key,
 * the issuing authority, the dataset family, the codification edition, and -- decisively --
 * `source_document_checksum`, which is a hash of the fetched artifact itself. If a different URL
 * yields a different document, the checksum moves and approval falls. If it yields the same
 * document, nothing moved, and nothing should.
 *
 * `transformation_version` is here rather than in Axis A because it names how the artifact was
 * normalized into this record. It does not change the regulation, but it does change whether the
 * rendering the reviewer read is reproducible from the source.
 */
export function normalizeSourceIdentity(row: StandardsMasterRow) {
  return {
    contractVersion: APPROVAL_CONTRACT_VERSION,
    sourceKey: row.source_key ?? null,
    sourceName: row.source_name ?? null,
    sourceType: row.source_type ?? null,
    authorityTier: row.authority_tier ?? null,
    allowedUse: row.allowed_use ?? null,
    sourcePublicationDate: normalizeDate(row.source_publication_date),
    sourceDocumentChecksum: row.source_document_checksum ?? null,
    transformationVersion: row.transformation_version ?? null,
  };
}

/**
 * AXIS C -- RETRIEVAL / TRANSPORT METADATA. Named here so its exclusion is a decision on the
 * record rather than an omission, and so a future reader can see it was considered.
 *
 * These describe HOW a copy was obtained, not WHAT was obtained. Re-fetching an unchanged
 * regulation on a later date, or through a new mirror, does not change one word of what the
 * reviewer read. Making these approval-material would mean routine re-crawls silently revoked
 * regulatory approvals across the corpus -- a governance mechanism that fires constantly for no
 * regulatory reason trains its operators to bypass it.
 *
 * The safety argument for including them is already discharged elsewhere and better:
 * `source_document_checksum` (Axis B) detects a re-fetch that returned DIFFERENT content, which is
 * the only case where a retrieval event has regulatory meaning. Transport metadata is retained on
 * the record and remains fully auditable; it simply does not bind the reviewer's decision.
 */
export const TRANSPORT_METADATA_FIELDS = Object.freeze([
  'source_url',
  'retrieval_date',
  'created_at',
  'updated_at',
] as const);

/** The three digests plus the payloads they cover, so v2 stays re-verifiable without the corpus. */
export interface ApprovalIdentity {
  approvalContractVersion: number;
  substantiveContentDigest: string;
  sourceIdentityDigest: string;
  approvalDigest: string;
  approvalPayload: {
    substantiveContent: ReturnType<typeof normalizeSubstantiveContent>;
    sourceIdentity: ReturnType<typeof normalizeSourceIdentity>;
  };
}

/**
 * The identity an approval names. Composed rather than flat so that when it moves, the carry-
 * forward report can say WHICH axis moved -- see `classifyApprovalDelta`.
 */
export function computeApprovalIdentity(row: StandardsMasterRow): ApprovalIdentity {
  const substantiveContent = normalizeSubstantiveContent(row);
  const sourceIdentity = normalizeSourceIdentity(row);
  const substantiveContentDigest = canonicalDigest(substantiveContent);
  const sourceIdentityDigest = canonicalDigest(sourceIdentity);
  return {
    approvalContractVersion: APPROVAL_CONTRACT_VERSION,
    substantiveContentDigest,
    sourceIdentityDigest,
    approvalDigest: canonicalDigest({
      contractVersion: APPROVAL_CONTRACT_VERSION,
      substantiveContentDigest,
      sourceIdentityDigest,
    }),
    approvalPayload: { substantiveContent, sourceIdentity },
  };
}

export type ApprovalDeltaAxis = 'none' | 'substantive_content' | 'source_identity' | 'both';

export interface ApprovalDelta {
  axis: ApprovalDeltaAxis;
  /** The contract's verdict on the prior approval. */
  effect: 'REMAIN_EFFECTIVE' | 'BECOME_INEFFECTIVE';
  changedFields: string[];
  reason: string;
}

/**
 * Compares two approval identities and states, in the contract's own vocabulary, whether an
 * approval bound to `before` still truthfully names `after`.
 *
 * A transport-only edit produces `axis: 'none'` -- not because transport was compared and found
 * equal, but because it is not in either projection at all. That is the KG-3E observation turned
 * into an intended, tested property.
 */
export function classifyApprovalDelta(
  before: ApprovalIdentity, after: ApprovalIdentity,
): ApprovalDelta {
  const contentMoved = before.substantiveContentDigest !== after.substantiveContentDigest;
  const sourceMoved = before.sourceIdentityDigest !== after.sourceIdentityDigest;
  const changedFields = [
    ...diffFields(before.approvalPayload.substantiveContent, after.approvalPayload.substantiveContent),
    ...diffFields(before.approvalPayload.sourceIdentity, after.approvalPayload.sourceIdentity),
  ];

  if (!contentMoved && !sourceMoved) {
    return {
      axis: 'none', effect: 'REMAIN_EFFECTIVE', changedFields,
      reason: 'No approval-material field changed. Any edit was to retrieval/transport metadata, '
        + 'which the contract deliberately excludes from both digests.',
    };
  }
  const axis: ApprovalDeltaAxis = contentMoved && sourceMoved ? 'both'
    : contentMoved ? 'substantive_content' : 'source_identity';
  return {
    axis, effect: 'BECOME_INEFFECTIVE', changedFields,
    reason: axis === 'substantive_content'
      ? 'The substantive regulatory artifact changed; the reviewer\'s legal conclusion was reached '
        + 'about different content and must be re-established.'
      : axis === 'source_identity'
      ? 'The authoritative source identity changed; the record is no longer attested to the '
        + 'artifact/edition the reviewer relied on.'
      : 'Both the regulatory content and its authoritative source identity changed.',
  };
}

function diffFields(before: Record<string, any>, after: Record<string, any>): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];
  for (const key of keys) {
    if (key === 'contractVersion') continue;
    if (JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null)) changed.push(key);
  }
  return changed.sort();
}

/**
 * Dates arrive as `Date` from pg and as `string` from JSON round-trips. Normalizing to `YYYY-MM-DD`
 * keeps the digest stable across both paths; without this, re-verifying a snapshot would appear to
 * detect a change that never happened.
 */
function normalizeDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
