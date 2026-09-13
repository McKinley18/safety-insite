/**
 * §126 PHASE 3 -- reconcile the product-owner's read-only governed snapshot against the accepted
 * production release and the frozen evaluation contracts.
 *
 * Consumes ONLY the sanitized CSV the owner produced from `federal-core-2026-08-28.1`. No database
 * connection, no credential, no provider. The CSV stays outside the repository at the owner's
 * choice; this script reads it in place and emits a derived, non-secret reconciliation.
 *
 * It also RESOLVES the backing-state mapping from production truth rather than assuming one, and
 * proves the resulting classification against the frozen contract.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createHash } from 'crypto';
import { classifyRow, FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow } from
  '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { ACCEPTED_EXPERT_TAXONOMY } from './lib/expert-cohort-supplemental-policy';

const SNAPSHOT = path.join(os.homedir(), 'Desktop', 'governed-snapshot.csv');
const EXPECTED_SNAPSHOT_SHA = 'a2c5dc324ded4fee8689982785682cec0f21c4ed0ce2b1128afd8f902c4d5cd3';
const EXPECTED_RELEASE = 'federal-core-2026-08-28.1';
const EXPECTED_RECORD_COUNT = 64;

/** Minimal RFC4180 reader: quoted fields, doubled quotes, embedded commas and newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

/**
 * THE MAPPING, resolved from production truth rather than assumed.
 *
 * Production stores `reviewState`, never `backingState` -- backing state is derived at request time
 * by the resolver. The three persisted values map into the production backing vocabulary
 * (`fallback-contract.ts` ALL_BACKING_STATES) as follows:
 *
 *   reviewer_approved      + text present -> APPROVED_EXACT
 *   reviewer_approved      + no text      -> APPROVED_NO_TEXT
 *   mechanically_validated                -> UNAPPROVED_RECORD
 *   unreviewed                            -> UNAPPROVED_RECORD
 *
 * `mechanically_validated` means "passed deterministic transformation checks from a registered
 * source". `review-state.ts` is explicit that this is NOT review, and that the three states are
 * never silently upgraded into one another. Mapping it to anything APPROVED_* would assert a
 * reviewer decision that no reviewer made -- which is precisely KG-3A defect B, re-committed.
 */
function backingStateFor(reviewState: string, approvedText: string): string {
  if (reviewState === 'reviewer_approved') {
    return approvedText.trim().length > 0 ? 'APPROVED_EXACT' : 'APPROVED_NO_TEXT';
  }
  return 'UNAPPROVED_RECORD';
}

function main(): void {
  const buf = fs.readFileSync(SNAPSHOT);
  const actualSha = createHash('sha256').update(buf).digest('hex');
  const ok = (label: string, pass: boolean, detail = '') =>
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? '  -- ' + detail : ''}`);

  console.log('PHASE 3 -- GOVERNED SNAPSHOT RECONCILIATION\n');
  ok('snapshot SHA-256 matches the owner-reported hash', actualSha === EXPECTED_SNAPSHOT_SHA,
    actualSha.slice(0, 16) + '...');

  const rows = parseCsv(buf.toString('utf8'));
  const header = rows[0];
  const body = rows.slice(1);
  const col = (name: string) => header.indexOf(name);

  ok('header carries the exact projected columns', header.length === 9,
    header.join(','));
  ok(`record count is exactly ${EXPECTED_RECORD_COUNT}`, body.length === EXPECTED_RECORD_COUNT,
    String(body.length));

  const releaseIds = new Set(body.map(r => r[col('releaseId')]));
  ok('every record belongs to the accepted release',
    releaseIds.size === 1 && releaseIds.has(EXPECTED_RELEASE), [...releaseIds].join(','));

  const states = new Map<string, number>();
  for (const r of body) {
    const s = r[col('reviewState')];
    states.set(s, (states.get(s) ?? 0) + 1);
  }
  ok('review-state distribution is exactly { mechanically_validated: 64 }',
    states.size === 1 && states.get('mechanically_validated') === EXPECTED_RECORD_COUNT,
    [...states].map(([k, v]) => `${k}=${v}`).join(' '));

  const checksums = new Set(body.map(r => r[col('recordChecksum')]));
  ok('every recordChecksum is present and distinct',
    checksums.size === body.length && [...checksums].every(c => /^[0-9a-f]{64}$/.test(c)),
    `${checksums.size} distinct`);

  const citations = body.map(r => r[col('citation')]);
  ok('every citation is non-empty and unique',
    new Set(citations).size === citations.length && citations.every(c => c.trim().length > 0),
    `${new Set(citations).size} distinct`);

  const withText = body.filter(r => (r[col('approved_text')] ?? '').trim().length > 0).length;
  ok('every record carries approved text', withText === body.length, `${withText}/${body.length}`);

  // ---------------------------------------------------------------- backing-state resolution
  console.log('\nBACKING-STATE RESOLUTION FROM PRODUCTION TRUTH\n');
  const mapped = body.map(r => backingStateFor(r[col('reviewState')], r[col('approved_text')] ?? ''));
  const dist = new Map<string, number>();
  for (const m of mapped) dist.set(m, (dist.get(m) ?? 0) + 1);
  console.log('  ' + [...dist].map(([k, v]) => `${k} = ${v}`).join('   '));
  ok('no APPROVED_* state was invented', ![...dist.keys()].some(k => k.startsWith('APPROVED')));
  ok('mapping is lossless for THIS snapshot (single-valued domain)', states.size === 1,
    'all 64 share one reviewState, so nothing is collapsed');

  // Prove the classification the frozen contract derives from that mapping.
  const probe: FormalCohortRow = {
    contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    source: {
      rowId: 'probe', observation: 'probe', inspectionContext: { location: null, task: null },
      jurisdiction: 'osha-general-industry',
      allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY],
      governedStandards: [{
        citation: citations[0], title: body[0][col('title')],
        approvedText: body[0][col('approved_text')], backingState: mapped[0],
      }],
      answeredClarifications: [], supplementaryContext: [],
    },
    truth: {
      presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ACCEPTED_EXPERT_TAXONOMY.filter(f => f !== 'machine_guarding'),
      forbiddenHazardFamilies: [], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale: 'classification probe only',
    },
  };
  const classes = classifyRow(probe);
  ok('a governed-supplied row classifies GOVERNED_RECORD_SUPPLIED',
    classes.includes('GOVERNED_RECORD_SUPPLIED'));
  ok('and DISAGREEMENT_OPPORTUNITY -- M08 is exercised, per composition note :144',
    classes.includes('DISAGREEMENT_OPPORTUNITY'));

  console.log('\nLIMITATION, PRESERVED\n');
  console.log('  REVIEWER_APPROVED_GOVERNED_RECORDS = 0');
  console.log('  APPROVED_RECORD_GROUNDING_EXERCISED = FALSE');
  console.log('  No immutable measure requires approved-record coverage: M06/M07 key off');
  console.log('  governedStandards.length > 0, M08 is exercised BY unapproved records, and no');
  console.log('  REQUIRED_CLASS_MINIMUMS entry names an approved class. This is a REPORTED');
  console.log('  LIMITATION, not a failed gate, and must not be implied as covered by a green run.');
}

main();
