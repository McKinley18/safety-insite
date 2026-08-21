/**
 * KG-3A -- logical regulatory identity vs release-version identity (Phase 3).
 *
 * Two different identities exist and must not be confused:
 *
 *   LOGICAL identity   `29 CFR 1910.212(a)(1)` -- the citation an inspector reads and a finding
 *                      cites. Stable across releases. This is what `citationKey` normalizes.
 *
 *   VERSION identity   `regulatory_release_records.recordChecksum` -- the exact normalized text
 *                      and applicability of that citation WITHIN one release. Two releases can
 *                      hold the same citationKey with different recordChecksums; that is a
 *                      regulation whose text changed.
 *
 * Consequence for provenance: a finding recorded under release A must resolve its citation
 * through A's snapshot, so it keeps showing A's text even after release B revises it. Looking a
 * citation up without a release is what would silently show newer text on an old finding.
 *
 * This intentionally does NOT reuse `normalizeCitationForLookup` from
 * `applicable-standards.service.ts`: that helper is module-private to the live retrieval path
 * (which KG-3A must leave byte-for-byte untouched), and it is tuned for fuzzy retrieval
 * matching -- it discards subsections into a base key. Identity normalization must preserve the
 * subsection, because `1910.212(a)(1)` and `1910.212(b)` are different records.
 */

/**
 * Normalizes a published citation to a stable logical key.
 *
 * Unifies agency-prefixed and bare forms (`29 CFR 1910.212(a)(1)` and `1910.212(a)(1)` are the
 * same standard) and is case/whitespace/§ insensitive, while preserving every subsection level.
 * Citations that do not match a known CFR shape fall back to a conservative normalization of
 * the whole string rather than being dropped, so no record is silently excluded from a snapshot.
 */
export function releaseCitationKey(value: unknown): string {
  const raw = String(value ?? '')
    .replace(/§/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!raw) return '';

  const cfrMatch = raw.match(/\b(29|30)\s*cfr\s*(?:part\s*)?((?:\d+)\.\d+(?:\([a-z0-9]+\))*)/i);
  // Any CFR part, not an allowlist: the corpus legitimately contains parts beyond the common
  // ones (30 CFR 47.41, 30 CFR 62.120), and an allowlist would silently push those to the raw
  // fallback, so `62.120` and `30 CFR 62.120` would not share an identity.
  const bareMatch = raw.match(/(?:^|[^\d.])(\d{2,4}\.\d+(?:\([a-z0-9]+\))*)/i);
  const section = (cfrMatch?.[2] || bareMatch?.[1] || '').toLowerCase();

  if (!section) {
    // Unknown shape: keep the whole string, normalized. Better an ugly key than a lost record.
    return raw.replace(/[^a-z0-9.()]/g, '');
  }

  const agency: '29' | '30' | undefined =
    (cfrMatch?.[1] as '29' | '30' | undefined) ||
    (/^(1910|1926)\./.test(section) ? '29' : /^(56|57|75|77)\./.test(section) ? '30' : undefined);

  return `${agency ? `${agency}cfr` : ''}${section}`.replace(/[^a-z0-9.()]/g, '');
}
