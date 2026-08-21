import { SAFESCOPE_CURATED_STANDARDS } from '../../safescope-v2/standards/safescope-standards.data';
import { STANDARDS_INTELLIGENCE_SEED } from '../../safescope-v2/standards-intelligence/standards-intelligence.seed';
import {
  normalizeAgency,
  normalizeCitationForMatch,
  toPayload,
} from '../seed/standards-intelligence-projection';
import { releaseCitationKey } from './citation-identity';

/**
 * KG-5B (Phase 2) -- THE GOVERNED SOURCE OF TRUTH.
 *
 * =====================================================================================
 * THE DEFECT THIS ANSWERS: KG5A-DISC-01
 * =====================================================================================
 *
 * Before KG-5B there was no such thing as a governed candidate record. The only
 * representation of a governed standard was a row in `standards_master` -- the same table that
 * serves 2,390 legacy customer-facing rows on the LEGACY retrieval path. Consequently the only
 * way to build a release was:
 *
 *     run the seed  ->  WRITE the governed records into the live customer corpus
 *                   ->  snapshot the ENTIRE table (the finalizer's SELECT has no WHERE clause)
 *
 * KG-5A measured what that does to a production-shaped corpus: it rewrote `standard_text` and
 * `title` on five live rows (1910.146, 1910.219, 1910.36, 30 CFR 56.12016, 30 CFR 56.14105),
 * inserted rows, then crashed on the `(agency_code, citation)` unique index when its normalized
 * matcher tried to rename production's bare `1910.147` to `29 CFR 1910.147` -- a string another
 * row already held. It left the corpus half-seeded at 2,396 rows with a duplicate citation pair.
 *
 * Every one of those effects is a consequence of one architectural fact: THE GOVERNED RECORD HAD
 * NO HOME OF ITS OWN. A release could not be built without first mutating the live corpus into
 * the shape the release wanted.
 *
 * =====================================================================================
 * WHAT THIS MODULE IS
 * =====================================================================================
 *
 * The authoritative governed source set: every candidate regulatory record the system can put
 * into a release, derived PURELY from version-controlled data, with ZERO database access.
 *
 * Its inputs are the two authoritative source artifacts that already existed and were already
 * reviewed -- `SAFESCOPE_CURATED_STANDARDS` and `STANDARDS_INTELLIGENCE_SEED` -- and it applies
 * exactly the projection the sync script applies, imported from
 * `standards-intelligence-projection.ts` rather than reimplemented. A candidate record and a
 * synced corpus row are therefore the same projection by construction. That equality is not
 * decorative: it is what lets KG-5B reproduce KG-5A's `14a34fea…` manifest byte-for-byte through
 * an architecture that never writes to `standards_master`.
 *
 * WHY THE MERGE IS REPLAYED RATHER THAN SHORT-CIRCUITED. The two source artifacts genuinely
 * disagree about citation formatting for the same regulation -- the curated set says
 * `1910.147`, the intelligence catalogue says `29 CFR 1910.147` -- and the historical pipeline
 * resolved that disagreement by letting the second writer update the first writer's row,
 * renaming the citation in the process. That resolution is part of the reviewed governed
 * content: the 35 records KG-3D/3E/4A adjudicated carry the post-merge citation strings. Replaying
 * the merge in memory preserves the reviewed identity; re-deciding it here would silently change
 * what 27 recorded clause-by-clause reviews refer to.
 *
 * The merge happens ENTIRELY BETWEEN GOVERNED SOURCE RECORDS. Nothing here reads, matches
 * against, or renames a `standards_master` row. That is the whole difference from the pipeline it
 * replaces, and it is why Phase 6's requirement -- canonicalize citations without renaming legacy
 * rows -- is satisfied structurally rather than by a guard that could be forgotten.
 *
 * =====================================================================================
 * PROVENANCE INDEPENDENCE (Phase 7)
 * =====================================================================================
 *
 * Production's `standards_master.source_key` is NULL on all 2,390 rows, so Axis B of the approval
 * contract is unsatisfiable from those rows. It does not matter. A governed source record carries
 * its own registry key, source name, source type, authority tier and allowed use, taken from
 * `buildSourceRegistryMetadata()` at the point the intelligence catalogue is declared. Provenance
 * is a property of the governed source, never something retrofitted onto a legacy row.
 */

/**
 * A candidate governed record, before it becomes an immutable release record.
 *
 * Field names are deliberately `standards_master` column names. The staging step writes these
 * into a session-scoped TEMP table with the same column names and types, so the manifest and
 * approval projections -- which read by column name -- see exactly the shape they have always
 * seen. That is what makes checksum reproduction a property rather than a hope.
 */
export interface GovernedSourceRecord {
  agency_code: string;
  citation: string;
  part_number: string | null;
  subpart: string | null;
  title: string;
  standard_text: string;
  plain_language_summary: string | null;
  scope_code: string | null;
  source_key: string | null;
  source_name: string | null;
  source_type: string | null;
  authority_tier: number;
  allowed_use: string | null;
  requires_approval: boolean;
  approved_for_auto_ingestion: boolean;
  source_url: string | null;
  retrieval_date: string | null;
  source_publication_date: string | null;
  effective_date: string | null;
  revision_date: string | null;
  source_document_checksum: string | null;
  hazard_codes: string[];
  required_controls: string[];
  keywords: string[];
  severity_weight: number;
  is_active: boolean;
}

export interface GovernedSourceSet {
  /** Deterministic order: the order the merge produced. Membership never depends on it. */
  records: GovernedSourceRecord[];
  /** Logical regulatory identity -> record. The key an explicit release definition names. */
  byCitationKey: Map<string, GovernedSourceRecord>;
  /** Citation keys that more than one source record resolved to, if any. Always empty today. */
  duplicateCitationKeys: string[];
}

/**
 * `standards_master` column defaults, applied on INSERT exactly as Postgres would.
 *
 * Spelled out rather than inherited so that the governed source set does not silently depend on
 * DDL it never touches. If the table's defaults ever changed, a governed candidate would keep the
 * values the reviewed release was built from -- which is the correct behaviour for a frozen
 * regulatory artifact.
 */
function emptyRecord(): GovernedSourceRecord {
  return {
    agency_code: '', citation: '', part_number: null, subpart: null, title: '',
    standard_text: '', plain_language_summary: null, scope_code: null,
    source_key: null, source_name: null, source_type: null,
    authority_tier: 1, allowed_use: null, requires_approval: false,
    approved_for_auto_ingestion: true, source_url: null, retrieval_date: null,
    source_publication_date: null, effective_date: null, revision_date: null,
    source_document_checksum: null, hazard_codes: [], required_controls: [],
    keywords: [], severity_weight: 1, is_active: true,
  };
}

/** camelCase entity property -> snake_case column, for the two payload shapes below. */
const COLUMN_BY_PROPERTY: Record<string, keyof GovernedSourceRecord> = {
  agencyCode: 'agency_code', citation: 'citation', partNumber: 'part_number',
  subpart: 'subpart', title: 'title', standardText: 'standard_text',
  plainLanguageSummary: 'plain_language_summary', scopeCode: 'scope_code',
  sourceKey: 'source_key', sourceName: 'source_name', sourceType: 'source_type',
  authorityTier: 'authority_tier', allowedUse: 'allowed_use',
  requiresApproval: 'requires_approval', approvedForAutoIngestion: 'approved_for_auto_ingestion',
  sourceUrl: 'source_url', retrievalDate: 'retrieval_date',
  sourcePublicationDate: 'source_publication_date', effectiveDate: 'effective_date',
  revisionDate: 'revision_date', sourceDocumentChecksum: 'source_document_checksum',
  hazardCodes: 'hazard_codes', requiredControls: 'required_controls', keywords: 'keywords',
  severityWeight: 'severity_weight', isActive: 'is_active',
};

/**
 * Applies one payload over a record.
 *
 * `undefined` is SKIPPED, `null` is APPLIED. This reproduces TypeORM's `save()` semantics
 * precisely: `Object.assign(entity, {partNumber: undefined})` leaves the column out of the
 * generated UPDATE, whereas an explicit `null` writes NULL. Getting this backwards would move
 * `part_number` on several records and therefore move `substantiveContentDigest`, invalidating
 * reviews that were recorded against the current digest.
 */
function applyPayload(target: GovernedSourceRecord, payload: Record<string, any>): void {
  for (const [property, value] of Object.entries(payload)) {
    const column = COLUMN_BY_PROPERTY[property];
    if (!column) continue;
    if (value === undefined) continue;
    (target as Record<string, any>)[column] = value;
  }
}

/**
 * Builds the governed source set. Pure: no database, no filesystem, no clock, no environment.
 *
 * Determinism is a hard requirement, not a nicety -- Phase 3 requires that release membership be
 * reproducible, and Phases 8/9 require that a clean corpus and a 2,390-row production corpus
 * produce the identical release. A function with no inputs beyond version-controlled constants
 * satisfies all three by construction.
 */
export function buildGovernedSourceSet(): GovernedSourceSet {
  const records: GovernedSourceRecord[] = [];
  const byExactCitation = new Map<string, GovernedSourceRecord>();
  const byNormalizedCitation = new Map<string, GovernedSourceRecord>();

  // ---- Stage 1: the curated SafeScope standards, matched on EXACT (agency, citation).
  // `safescope-standards.seed.ts` uses `repo.findOne({ agencyCode, citation })`, an exact match,
  // so two curated entries differing only in citation format would be two records. They do not,
  // but replaying the real matcher rather than a tidier one keeps this a reproduction.
  for (const standard of SAFESCOPE_CURATED_STANDARDS as Array<Record<string, any>>) {
    const exactKey = `${standard.agencyCode}::${standard.citation}`;
    const existing = byExactCitation.get(exactKey);
    if (existing) {
      applyPayload(existing, standard);
      continue;
    }
    const record = emptyRecord();
    applyPayload(record, standard);
    records.push(record);
    byExactCitation.set(exactKey, record);
  }

  // The normalized index the sync stage matches against is built from the records that exist at
  // that moment, first-wins -- exactly as the sync builds it from `repo.find()`.
  for (const record of records) {
    const normalizedKey = `${record.agency_code}::${normalizeCitationForMatch(record.citation)}`;
    if (!byNormalizedCitation.has(normalizedKey)) byNormalizedCitation.set(normalizedKey, record);
  }

  // ---- Stage 2: the standards-intelligence catalogue, deduplicated on raw lowercase citation
  // first (the sync's `unique` map) and then matched on the NORMALIZED citation.
  const unique = new Map<string, Record<string, any>>();
  for (const record of STANDARDS_INTELLIGENCE_SEED as Array<Record<string, any>>) {
    const agencyCode = normalizeAgency(record.agency);
    const citation = String(record.citation || '').trim();
    if (!agencyCode || !citation) continue;
    const key = `${agencyCode}::${citation.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, record);
  }

  for (const record of unique.values()) {
    const payload = toPayload(record) as Record<string, any> | null;
    if (!payload?.agencyCode || !payload?.citation) continue;

    const normalizedKey =
      `${payload.agencyCode}::${normalizeCitationForMatch(String(payload.citation))}`;
    const existing = byNormalizedCitation.get(normalizedKey);

    if (existing) {
      // The rename that matters, and the reason it is safe here: this overwrites the CITATION of
      // a governed source record we built four lines of code ago. In the pipeline this replaces,
      // the same assignment landed on a live customer row and collided with a unique index.
      applyPayload(existing, payload);
      continue;
    }

    const created = emptyRecord();
    applyPayload(created, payload);
    records.push(created);
    byNormalizedCitation.set(normalizedKey, created);
  }

  // ---- Logical identity index. Built LAST, from post-merge citations, because the merge is what
  // decides a record's published citation string.
  const byCitationKey = new Map<string, GovernedSourceRecord>();
  const duplicateCitationKeys: string[] = [];
  for (const record of records) {
    const key = releaseCitationKey(record.citation);
    if (byCitationKey.has(key)) {
      // Never silently collapsed. A duplicate logical identity in the governed source set is a
      // defect in the source artifacts and must surface as a refusal at preparation time, not as
      // a quietly dropped regulation.
      duplicateCitationKeys.push(key);
      continue;
    }
    byCitationKey.set(key, record);
  }

  return { records, byCitationKey, duplicateCitationKeys };
}

/** Convenience for CLI/reporting surfaces. Sorted for stable human-readable output. */
export function listGovernedSourceCitations(): Array<{ citationKey: string; agency: string; citation: string }> {
  const set = buildGovernedSourceSet();
  return [...set.byCitationKey.entries()]
    .map(([citationKey, record]) => ({
      citationKey, agency: record.agency_code, citation: record.citation,
    }))
    .sort((a, b) => (a.agency + a.citation).localeCompare(b.agency + b.citation));
}
