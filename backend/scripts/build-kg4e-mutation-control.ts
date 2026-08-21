/**
 * KG-4E -- the mutation control for the report-invariance oracle.
 *
 * A comparison that reports agreement is worth exactly as much as its ability to report
 * disagreement, and a forbidden-term test that has never fired is not evidence that the terms are
 * absent -- it is equally consistent with a regex that cannot match anything. So this script builds
 * a deliberately WRONG report set: it takes the real frozen snapshots and writes governance and
 * shadow vocabulary into fields the renderer genuinely prints (the finding conclusion, the hazard
 * category, the review rationale), then renders them through the real generator.
 *
 * Running the oracle against this set MUST fail, on both axes:
 *   - DIFFERENT verdicts, because the printed text changed;
 *   - forbidden-term hits, because the words are now on the page.
 *
 * If it passes, the oracle is broken and the PASSED result next to it means nothing.
 *
 * Env: DATABASE_URL (read-only), PDF_DIR, SOURCE_LABEL (default legacy-A), LABEL (default mutation-control)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderInspectionReportPdf } from '../src/reports/canonical-report-pdf-renderer';

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

const DB = process.env.DATABASE_URL || '';
const PDF_DIR = process.env.PDF_DIR || '';
const SOURCE_LABEL = process.env.SOURCE_LABEL || 'legacy-A';
const LABEL = process.env.LABEL || 'mutation-control';

/** Text a customer must never read, placed exactly where a customer WOULD read it. */
const LEAK = 'SHADOW mode active — governedDeliveryState GOVERNED_VERIFIED_TEXT, ' +
  'governedFallbackReason GOVERNANCE_FILTER_EMPTY, release federal-core-2026-07-30.1, ' +
  'mismatch GRANULARITY_DIFFERENCE (BLOCKING), correlationId 74b77cdb, telemetry allowlist cutover.';

async function main(): Promise<void> {
  if (!DB || !PDF_DIR) throw new Error('DATABASE_URL and PDF_DIR are required');
  const manifest = JSON.parse(readFileSync(join(PDF_DIR, SOURCE_LABEL + '__manifest.json'), 'utf8'));

  const client = new Client({ connectionString: DB });
  await client.connect();
  let byInspection = new Map<string, any>();
  try {
    const result = await client.query(
      `SELECT r."inspectionId", v."sourceSnapshot"
         FROM inspection_report_versions v
         JOIN inspection_reports r ON r.id = v."reportId"
        WHERE v.status = 'generated'`);
    for (const row of result.rows) byInspection.set(row.inspectionId, row.sourceSnapshot);
  } finally { await client.end(); }

  const cases: any[] = [];
  for (const entry of manifest.cases) {
    const snapshot = byInspection.get(entry.inspectionId);
    if (!snapshot) throw new Error('no frozen snapshot for inspection ' + entry.inspectionId);
    const mutated = JSON.parse(JSON.stringify(snapshot));
    let touched = 0;
    for (const observation of mutated.observations || []) {
      for (const finding of observation.findings || []) {
        finding.conclusion = LEAK + ' ' + String(finding.conclusion || '');
        finding.hazardCategory = 'SHADOW GOVERNED LEAK';
        if (finding.finalReview) finding.finalReview.rationale = LEAK;
        touched += 1;
      }
    }
    if (!touched) throw new Error('mutation control touched nothing for ' + entry.case);
    const pdf = await renderInspectionReportPdf(mutated);
    writeFileSync(join(PDF_DIR, LABEL + '__' + entry.case + '.pdf'), pdf);
    cases.push({ ...entry, mutatedFindings: touched });
  }

  writeFileSync(join(PDF_DIR, LABEL + '__manifest.json'), JSON.stringify({
    label: LABEL, derivedFrom: SOURCE_LABEL,
    note: 'DELIBERATELY WRONG. Governance/shadow vocabulary written into printed fields so the ' +
          'oracle can be shown to fail. Never evidence of product behaviour.',
    caseCount: cases.length, cases,
  }, null, 2) + '\n');
  console.log(LABEL + ': ' + cases.length + ' deliberately-leaking reports written to ' + PDF_DIR);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
