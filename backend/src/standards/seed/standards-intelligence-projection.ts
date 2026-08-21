import { Standard, AgencyCode, StandardScope } from '../entities/standard.entity';

/**
 * KG-5B (Phase 2) -- the ONE definition of how an authoritative standards-intelligence record is
 * projected into a `standards_master`-shaped row.
 *
 * WHY THIS MODULE EXISTS. These functions previously lived inline in
 * `sync-standards-intelligence-to-master.ts`, a script whose only mode of operation is to WRITE
 * the projection into the live corpus. Governed release construction needs the same projection
 * without the write -- that is the whole of KG5A-DISC-01 -- and a second copy of a normalization
 * that feeds a checksum is exactly the drift that KG-2 extracted `release-manifest.ts` to prevent.
 *
 * The bodies below are byte-for-byte the ones the sync script used; the script now imports them.
 * `buildGovernedSourceSet()` imports the same symbols, so a governed candidate record and a synced
 * corpus row are the same projection by construction rather than by coincidence.
 */

type AnyRecord = Record<string, any>;

/**
 * The curated 19-standard seed (safescope-standards.seed.ts, run before this
 * script) and this larger intelligence catalog do not agree on a citation
 * string format for the same regulation -- one uses "1910.147", the other
 * "29 CFR 1910.147". Matching on the raw citation string treats those as two
 * different standards and inserts a duplicate row for the same regulation.
 * Reuse the same "strip agency/part prefix, compare digits and punctuation"
 * normalization already used by this repo's own standards test harnesses
 * (see canonicalizeCitation() in golden-standards-tests.ts) so a sync run
 * recognizes and updates the existing row instead of duplicating it.
 */
export function normalizeCitationForMatch(citation: string): string {
  return String(citation || '')
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function normalizeAgency(agency: string): AgencyCode | null {
  const normalized = String(agency || '').toUpperCase();
  if (normalized.includes('MSHA')) return 'MSHA' as AgencyCode;
  if (normalized.includes('OSHA')) return 'OSHA' as AgencyCode;
  return null;
}

export function normalizeScope(scope: string | undefined, citation: string): StandardScope {
  const text = `${scope || ''} ${citation || ''}`.toLowerCase();

  if (text.includes('1926')) return 'construction' as StandardScope;
  if (text.includes('1910')) return 'general_industry' as StandardScope;

  if (
    text.includes('msha') ||
    text.includes('mining') ||
    text.includes('30 cfr') ||
    /\b(?:56|57|75|77)\./.test(text)
  ) {
    return 'mining' as StandardScope;
  }

  return (scope || 'general') as StandardScope;
}

export function normalizePart(part: string | undefined, citation: string): string | undefined {
  if (part) return String(part);

  const match = String(citation || '').match(/\b(1910|1926|1904|56|57|75|77)\b/);
  return match?.[1];
}

export function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

export function severityWeight(record: AnyRecord): number {
  const severity = String(record.severityDefault || '').toLowerCase();

  if (severity === 'critical') return 5;
  if (severity === 'high') return 4;
  if (severity === 'medium') return 3;
  return 2;
}

export function standardText(record: AnyRecord): string {
  return (
    record.plainLanguageSummary ||
    record.title ||
    `Standard intelligence metadata for ${record.citation}`
  );
}

export function toPayload(record: AnyRecord): Partial<Standard> | null {
  const agencyCode = normalizeAgency(record.agency);
  const citation = String(record.citation || '').trim();

  if (!agencyCode || !citation) return null;

  const hazardCodes = dedupe([
    ...asArray(record.hazardFamilies),
    ...asArray(record.crossDomainLinks),
  ]);

  const keywords = dedupe([
    ...asArray(record.searchBoostTerms),
    ...asArray(record.equipmentTags),
    ...asArray(record.taskTags),
    ...asArray(record.exposureTags),
    ...asArray(record.controlTags),
    ...asArray(record.consequenceTags),
  ]);

  const requiredControls = dedupe([
    ...asArray(record.controlTags),
  ]);

  return {
    agencyCode,
    citation,
    partNumber: normalizePart(record.part, citation),
    subpart: record.subpart || null,
    title: record.title || citation,
    standardText: standardText(record),
    plainLanguageSummary: record.plainLanguageSummary || record.title || citation,
    scopeCode: normalizeScope(record.scope, citation),

    sourceKey: record.sourceKey || null,
    sourceName: record.sourceName || null,
    sourceType: record.sourceType || null,
    authorityTier: Number(record.authorityTier || 1),
    allowedUse: record.allowedUse || null,
    requiresApproval: Boolean(record.requiresApproval || false),
    approvedForAutoIngestion: Boolean(record.approvedForAutoIngestion ?? true),

    // Provenance for records verified against a primary source (additive; older seed records
    // without these fields keep null, exactly as before).
    ...(record.sourceUrl ? { sourceUrl: String(record.sourceUrl) } : {}),
    ...(record.retrievalDate ? { retrievalDate: record.retrievalDate as any } : {}),

    hazardCodes,
    requiredControls,
    keywords,
    severityWeight: severityWeight(record),
    isActive: true,
  } as Partial<Standard>;
}
