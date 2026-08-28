// Protected gate for SOURCE-LEVEL REGULATORY AUTHORITY.
//
// Phase 8 of "Authoritative Regulatory Source Acquisition + Governed Corpus Expansion".
//
// This is NOT a matching test and must not be read as one. It asks one question per cell of the
// v1.0 coverage matrix: **does the governed source set actually contain the provision this cell
// names?** A family is not covered because some other regulation in the same subpart exists, and
// it is not covered because a code rule somewhere can emit a citation — it is covered when the
// governed, version-controlled source set holds that exact provision.
//
// It runs against the governed source set directly, with no database, so it cannot be satisfied
// by a row someone inserted by hand.
//
//   npm run test:hazlenz-source-authority

import { STANDARDS_INTELLIGENCE_SEED } from '../standards-intelligence/standards-intelligence.seed';
import { SAFESCOPE_CURATED_STANDARDS } from '../standards/safescope-standards.data';
import { V1_COVERAGE_MATRIX, matrixTotals, CellStatus } from './hazlenz-regulatory-coverage-matrix';

/** Citation identity, normalized the way the governed projection normalizes it. */
function key(citation: string): string {
  return String(citation || '')
    .toLowerCase()
    .replace(/^\s*(?:29|30)\s*cfr\s*/i, '')
    .replace(/\s+/g, '')
    .trim();
}

function governedCitationKeys(): Set<string> {
  const keys = new Set<string>();
  for (const record of STANDARDS_INTELLIGENCE_SEED) keys.add(key(record.citation));
  for (const record of SAFESCOPE_CURATED_STANDARDS) keys.add(key(String(record.citation || '')));
  return keys;
}

type Verdict = 'SOURCE_AUTHORITY_PRESENT' | 'NO_STANDARD_APPLICABLE' | 'SOURCE_AUTHORITY_MISSING' | 'OUT_OF_SCOPE';

function verdictFor(status: CellStatus, citations: string[], governed: Set<string>): Verdict {
  if (status === 'NO_STANDARD_APPLICABLE') return 'NO_STANDARD_APPLICABLE';
  if (status === 'OUT_OF_V1_SCOPE') return 'OUT_OF_SCOPE';
  if (status === 'AUTHORITATIVE_SOURCE_REQUIRED') return 'SOURCE_AUTHORITY_MISSING';
  if (!citations.length) return 'SOURCE_AUTHORITY_MISSING';
  return citations.every(c => governed.has(key(c)))
    ? 'SOURCE_AUTHORITY_PRESENT'
    : 'SOURCE_AUTHORITY_MISSING';
}

function main(): void {
  const governed = governedCitationKeys();
  const rows: Array<{ family: string; regime: string; verdict: Verdict; citations: string[]; missing: string[] }> = [];

  for (const row of V1_COVERAGE_MATRIX) {
    for (const [regime, cell] of [
      ['osha-general-industry', row.oshaGeneralIndustry],
      ['osha-construction', row.oshaConstruction],
      ['msha', row.msha],
    ] as const) {
      const verdict = verdictFor(cell.status, cell.citations, governed);
      rows.push({
        family: row.family,
        regime,
        verdict,
        citations: cell.citations,
        missing: cell.citations.filter(c => !governed.has(key(c))),
      });
    }
  }

  const counts: Record<Verdict, number> = {
    SOURCE_AUTHORITY_PRESENT: 0, NO_STANDARD_APPLICABLE: 0, SOURCE_AUTHORITY_MISSING: 0, OUT_OF_SCOPE: 0,
  };
  for (const r of rows) counts[r.verdict] += 1;

  console.log('-- source-level regulatory authority, by hazard family and regime --');
  for (const r of rows) {
    if (r.verdict === 'SOURCE_AUTHORITY_PRESENT') continue;
    console.log(`  [${r.verdict}] ${r.family} / ${r.regime}` +
      (r.citations.length ? ` names [${r.citations.join(', ')}]` : '') +
      (r.missing.length ? ` MISSING FROM GOVERNED SET: [${r.missing.join(', ')}]` : ''));
  }

  const totals = matrixTotals();
  console.log(`\n  governed source citations: ${governed.size}`);
  console.log(`  matrix families: ${totals.families}   cells: ${totals.cells}`);
  console.log(`  SOURCE_AUTHORITY_PRESENT : ${counts.SOURCE_AUTHORITY_PRESENT}`);
  console.log(`  NO_STANDARD_APPLICABLE   : ${counts.NO_STANDARD_APPLICABLE}`);
  console.log(`  SOURCE_AUTHORITY_MISSING : ${counts.SOURCE_AUTHORITY_MISSING}`);
  console.log(`  OUT_OF_SCOPE             : ${counts.OUT_OF_SCOPE}`);
  console.log(`  families with a finding-level rule today: ${totals.familiesWithFindingRule} / ${totals.families}`);

  // A cell that NAMES a provision must actually hold it. A cell that is honestly
  // AUTHORITATIVE_SOURCE_REQUIRED is a recorded gap, not a gate failure — hiding it would be the
  // gate demanding a fabrication.
  const brokenPromises = rows.filter(r => r.citations.length && r.missing.length);
  if (brokenPromises.length) {
    for (const r of brokenPromises) {
      console.error(`FAIL ${r.family} / ${r.regime} names [${r.citations.join(', ')}] but the governed set lacks [${r.missing.join(', ')}]`);
    }
    console.error(`\n${brokenPromises.length} cell(s) name a provision the governed source set does not hold`);
    process.exit(1);
  }
  console.log('\nPASS HazLenz source-authority gate — every named provision is in the governed source set');
}

main();
