/**
 * KG-4E -- structural proof that the report generator cannot surface governed/shadow state.
 *
 * WHY THIS EXISTS ALONGSIDE THE PDF COMPARISON. The LEGACY-versus-SHADOW comparison proves the two
 * reports agree TODAY, on the corpus and the cases that exist today. It cannot prove WHY. If the
 * agreement rests on SHADOW happening not to populate a field the renderer would have printed, the
 * property is an accident of the current data and the first governed delivery mode breaks it.
 *
 * So this suite attacks the generator directly. It takes the real `sourceSnapshot` the server froze
 * for a real report, POISONS it with every governed, shadow and telemetry field the subsystem knows
 * how to produce -- at snapshot level, analysis level, result-snapshot level, finding level,
 * standard-decision level and corrective-action level -- and renders it through the real
 * `renderInspectionReportPdf()`.
 *
 *   Poisoned render == byte-identical to the clean render  =>  those fields are STRUCTURALLY
 *   excluded: the renderer projects an allowlist of fields and never spreads or serialises the
 *   snapshot, so no future governed field can reach a page by default.
 *
 * AND THE CANARY, WHICH IS THE HALF THAT MAKES IT MEAN ANYTHING. A harness that mutates nothing
 * also produces byte-identical output. So a second mutation changes a field the renderer DOES read
 * (a finding's conclusion) and asserts the bytes DIFFER. Without the canary, "identical" is
 * equally consistent with a working exclusion and a broken harness -- which is exactly how KG-4C's
 * ownership guard passed its own suite while doing the opposite of what it claimed.
 *
 * Env: DATABASE_URL (READ-ONLY -- this suite performs no writes and claims no ownership),
 *      OUT_DIR (optional, for the rendered artifacts).
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderInspectionReportPdf } from '../src/reports/canonical-report-pdf-renderer';

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

const DB = process.env.DATABASE_URL || '';
const OUT_DIR = process.env.OUT_DIR || '';

const checks: string[] = [];
const failures: string[] = [];
function check(condition: unknown, message: string): void {
  if (condition) checks.push(message); else failures.push(message);
}

/**
 * Everything the governed/shadow subsystem can produce that a customer must never see. Names are
 * taken from the live modules, not invented: the display projection, the fallback decision, the
 * provenance columns, the v2 telemetry event and the operational vocabulary.
 */
const POISON: Record<string, unknown> = {
  knowledgeReleaseId: 'federal-core-2026-07-30.1',
  knowledgeReleaseIdSource: 'GOVERNED_PIN',
  governedDeliveryState: 'GOVERNED_VERIFIED_TEXT',
  governedFallbackReason: 'GOVERNANCE_FILTER_EMPTY',
  governedTextUnavailable: true,
  governedVerifiedText: 'GOVERNED VERIFIED TEXT THAT MUST NOT BE PRINTED',
  governedBackingState: 'APPROVED_EXACT',
  governedResolvedCitation: '29 CFR 1910.999',
  backingStatus: 'APPROVED_GOVERNED_CONTENT',
  customerVisible: true,
  releaseManifestChecksum: '14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b',
  approvalDigest: '388a349c2b0a6f6d5c0deba02d43f54717b54a2c1e6957e5c6f4c3eb5f616d5a',
  approvalContractVersion: 2,
  substantiveContentDigest: 'POISON-SUBSTANTIVE-DIGEST',
  sourceIdentityDigest: 'POISON-SOURCE-DIGEST',
  shadowMode: 'SHADOW',
  mode: 'SHADOW',
  stage: 'STAGE_1_SINGLE_ACCOUNT',
  eligibilitySource: 'ACCOUNT_ALLOWLIST',
  correlationId: '74b77cdb-c304-435e-8a06-8b8344ead94e',
  eventKey: 'ec265a30d79b722da8a64ceae03e6d30',
  findingKey: 'POISON-FINDING-KEY',
  mismatch: 'GRANULARITY_DIFFERENCE',
  // NOT `severity`. KG4E-DISC-02: the shadow taxonomy and the operational risk model both use the
  // word, and `riskSnapshot.operationalRisk.severity` is a field the report legitimately PRINTS.
  // Stamping the poison over it would make the suite fail on a collision of vocabulary rather than
  // on a governance leak -- and the first "fix" for that failure would have been to widen the
  // normalisation until the suite stopped noticing real changes. The shadow-specific spellings are
  // poisoned instead; the risk model keeps its own word.
  shadowSeverity: 'BLOCKING',
  mismatchSeverity: 'BLOCKING',
  rootCause: 'CITATION_GRANULARITY',
  resolverHealth: 'STALE_SCHEMA',
  legacyTextDigest: 'POISONLEGACYDIGEST',
  governedTextDigest: 'POISONGOVERNEDDIGEST',
  outputInvarianceVerdict: 'MUTATED',
  outputInvarianceHash: 'POISON-INVARIANCE-HASH',
  shadowProvenanceNull: false,
  schemaVersion: 'kg4c.shadow-comparison.v2',
  killSwitch: 'engaged',
  circuitBreaker: 'LATCHED',
  telemetryDropped: 3,
  privacyCanary: 'POISON-CANARY',
  cutoverMode: 'GOVERNED_STRICT',
};

/** Recursively stamps the poison onto every object in the snapshot, at every depth. */
function poison(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return value.map((entry) => poison(entry, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = poison(entry, depth + 1);
    }
    // Stamped AFTER the recursion so it wins over anything the snapshot already carried.
    for (const [key, entry] of Object.entries(POISON)) out[key] = entry;
    return out;
  }
  return value;
}

const sha = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * Two renders of the SAME snapshot are never byte-equal, for two reasons that have nothing to do
 * with the snapshot: PDFKit stamps a wall-clock `/CreationDate`, and it stamps a random `/ID` file
 * identifier. Both are normalised out. Both were DERIVED, not assumed -- rendering one snapshot
 * twice and diffing the bytes is what named them, and `assertNormalizationIsNotBlind()` re-derives
 * that fact at run time so this list cannot quietly go stale.
 *
 * Nothing else is normalised. In particular no page content, no object stream and no length is
 * touched, so a single changed character anywhere on a page still moves the hash -- which is what
 * the two canaries at the end of the suite demonstrate rather than assert.
 */
function normalize(pdf: Buffer): Buffer {
  return Buffer.from(pdf.toString('latin1')
    .replace(/\/CreationDate\s*\(D:[^)]*\)/g, '/CreationDate (D:NORMALIZED)')
    .replace(/\/ModDate\s*\(D:[^)]*\)/g, '/ModDate (D:NORMALIZED)')
    .replace(/\/ID\s*\[\s*<[0-9a-fA-F]*>\s*<[0-9a-fA-F]*>\s*\]/g, '/ID [<NORMALIZED> <NORMALIZED>]'),
    'latin1');
}

async function main(): Promise<void> {
  if (!DB) throw new Error('DATABASE_URL is required (read-only)');
  const client = new Client({ connectionString: DB });
  await client.connect();
  let rows: any[];
  try {
    // READ ONLY. No transaction, no write, no ownership claim -- this suite mutates nothing.
    const result = await client.query(
      `SELECT v.id, v."sourceSnapshot", r."inspectionId"
         FROM inspection_report_versions v
         JOIN inspection_reports r ON r.id = v."reportId"
        WHERE v.status = 'generated'
        ORDER BY v."generatedAt" ASC`);
    rows = result.rows;
  } finally { await client.end(); }

  check(rows.length > 0, 'real frozen report snapshots exist to attack (' + rows.length + ')');
  if (!rows.length) return;

  if (OUT_DIR) mkdirSync(OUT_DIR, { recursive: true });

  // The snapshot the server actually froze already carries the governed columns, because
  // snapshotInspection() spreads the finding row and copies the analyses verbatim. Assert that,
  // rather than assume it: a poison test on a snapshot that never carried the field would be
  // testing nothing.
  const sample = rows[0].sourceSnapshot;
  const serialized = JSON.stringify(sample);
  check(serialized.includes('"knowledgeReleaseId"'),
    'the frozen report snapshot DOES carry knowledgeReleaseId -- so its absence from the PDF is exclusion, not absence');
  check(!!sample.knowledgeProvenance,
    'the frozen report snapshot DOES carry a knowledgeProvenance block');
  const provenanceValues = new Set<unknown>();
  for (const observation of sample.observations || []) {
    for (const finding of observation.findings || []) provenanceValues.add(finding.knowledgeReleaseId);
  }
  check(provenanceValues.size === 1 && provenanceValues.has(null),
    'every finding in the frozen snapshot carries NULL provenance (SHADOW obligation, at report time)');

  // The normalisation must be exactly sufficient: rendering ONE snapshot twice, unchanged, must
  // come back identical. If it does not, the poison result below is unreadable -- an inequality
  // could be the poison or could be the generator's own nondeterminism.
  const selfA = normalize(await renderInspectionReportPdf(rows[0].sourceSnapshot));
  const selfB = normalize(await renderInspectionReportPdf(rows[0].sourceSnapshot));
  check(sha(selfA) === sha(selfB),
    'the generator is deterministic once CreationDate/ModDate/ID are normalised -- so an inequality below is the poison');

  let attacked = 0;
  let identical = 0;
  for (const row of rows) {
    const clean = normalize(await renderInspectionReportPdf(row.sourceSnapshot));
    const poisoned = normalize(await renderInspectionReportPdf(poison(row.sourceSnapshot) as any));
    attacked += 1;
    if (sha(clean) === sha(poisoned)) identical += 1;
    else failures.push('POISON REACHED THE PAGE for report version ' + row.id +
      ' (' + clean.length + ' vs ' + poisoned.length + ' bytes)');

    if (OUT_DIR && attacked <= 2) {
      writeFileSync(join(OUT_DIR, 'poisoned-' + row.id + '.pdf'), poisoned);
      writeFileSync(join(OUT_DIR, 'clean-' + row.id + '.pdf'), clean);
    }
  }
  check(identical === attacked,
    'HARD: ' + identical + '/' + attacked + ' reports are BYTE-IDENTICAL after poisoning with ' +
    Object.keys(POISON).length + ' governed/shadow/telemetry fields at every object depth');

  // ---------------------------------------------------------------- THE CANARY
  //
  // Mutate a field the renderer genuinely reads. If this ALSO comes back identical the suite above
  // proves nothing, because the harness is inert.
  const canarySource = JSON.parse(JSON.stringify(rows[0].sourceSnapshot));
  let mutated = 0;
  for (const observation of canarySource.observations || []) {
    for (const finding of observation.findings || []) {
      finding.conclusion = 'KG4E-CANARY-CONCLUSION-' + mutated;
      finding.hazardCategory = 'KG4E-CANARY-CATEGORY';
      mutated += 1;
    }
  }
  check(mutated > 0, 'the canary had at least one finding to mutate (' + mutated + ')');
  const canaryClean = normalize(await renderInspectionReportPdf(rows[0].sourceSnapshot));
  const canaryMutated = normalize(await renderInspectionReportPdf(canarySource));
  check(sha(canaryClean) !== sha(canaryMutated),
    'CANARY: mutating a field the renderer DOES read changes the PDF -- the byte comparison is live');

  // A second canary at snapshot level, because the finding-level one alone would not catch a
  // renderer that ignored the whole snapshot and drew a fixed page.
  const headerCanary = JSON.parse(JSON.stringify(rows[0].sourceSnapshot));
  headerCanary.site = { id: 'canary', name: 'KG4E-CANARY-SITE-NAME' };
  const headerMutated = normalize(await renderInspectionReportPdf(headerCanary));
  check(sha(canaryClean) !== sha(headerMutated),
    'CANARY: changing the site name changes the PDF (cover, summary and running header are live)');
}

main()
  .then(() => {
    console.log('');
    console.log('kg4e-report-field-exclusion: ' + checks.length + ' passed, ' + failures.length + ' failed');
    for (const entry of checks) console.log('  ok  ' + entry);
    for (const entry of failures) console.error('  FAIL  ' + entry);
    if (failures.length) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  });
