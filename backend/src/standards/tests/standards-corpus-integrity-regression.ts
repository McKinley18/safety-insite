// Regression coverage for the 2026-08-18 core-closure phase: standards corpus
// integrity. Protects two defect classes discovered and fixed this session:
//  (a) 29 CFR 1910.178(p)(1) and 1910.22(a) had titles copied from a
//      different paragraph/subpart than the one actually cited;
//  (b) the two independent seed sources disagreed on citation-string format
//      for the same regulation (e.g. "1910.147" vs "29 CFR 1910.147"), so the
//      sync pipeline's exact-string matching re-inserted a duplicate row on
//      every re-seed instead of updating the existing one -- reproduced and
//      fixed at the root (both the sync script's matching logic and the
//      source seed file's own citation format) this session.
// Requires a real database connection (DATABASE_URL) -- run against a
// disposable database only, never the production/dev database, per this
// repo's own data-protection policy. This test does not seed or mutate data;
// it only reads.
import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../entities/standard.entity';

const databaseUrl = process.env.DATABASE_URL;

const ds = new DataSource({
  type: 'postgres',
  url: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USERNAME || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: databaseUrl ? undefined : process.env.DB_NAME || 'safescope',
  entities: [Standard],
  synchronize: false,
});

function normalizeCitation(citation: string): string {
  return String(citation || '')
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);
  const all = await repo.find();

  // No two rows for the same agency collapse to the same normalized citation.
  const seen = new Map<string, string[]>();
  for (const standard of all) {
    const key = `${standard.agencyCode}::${normalizeCitation(standard.citation)}`;
    const citations = seen.get(key) || [];
    citations.push(standard.citation);
    seen.set(key, citations);
  }
  const duplicates = [...seen.entries()].filter(([, citations]) => citations.length > 1);
  check('No duplicate standards under different citation-string formats for the same regulation', duplicates.length === 0, duplicates);

  const lockoutStandard = all.find(s => normalizeCitation(s.citation) === normalizeCitation('1910.147'));
  if (lockoutStandard) {
    check('29 CFR 1910.147 title is "The control of hazardous energy"', /control of hazardous energy/i.test(lockoutStandard.title), lockoutStandard.title);
    check('29 CFR 1910.147 uses the canonical "29 CFR" citation format', lockoutStandard.citation.trim().toLowerCase().startsWith('29 cfr'), lockoutStandard.citation);
  } else {
    check('29 CFR 1910.147 exists in the corpus', false);
  }

  const powTruckStandard = all.find(s => normalizeCitation(s.citation) === normalizeCitation('1910.178(p)(1)'));
  if (powTruckStandard) {
    check('1910.178(p)(1) title does not claim to be "General requirements" (that is paragraph (a), not (p)(1))',
      !/general requirements/i.test(powTruckStandard.title), powTruckStandard.title);
    check('1910.178(p)(1) title reflects operation-of-the-truck / out-of-service content',
      /operation of the truck|out of service|removing unsafe/i.test(powTruckStandard.title), powTruckStandard.title);
  } else {
    console.log('SKIP 1910.178(p)(1) not present in this corpus (not required to exist, only correct if present)');
  }

  const walkingSurfaceStandard = all.find(s => normalizeCitation(s.citation) === normalizeCitation('1910.22(a)'));
  if (walkingSurfaceStandard) {
    check('1910.22(a) title does not claim to BE the subpart name alone ("Walking-working surfaces" verbatim, no paragraph content)',
      walkingSurfaceStandard.title.trim().toLowerCase() !== 'walking-working surfaces', walkingSurfaceStandard.title);
  } else {
    console.log('SKIP 1910.22(a) not present in this corpus (not required to exist, only correct if present)');
  }

  await ds.destroy();

  console.log('='.repeat(60));
  if (failures > 0) {
    console.error(`Standards corpus integrity regression: ${failures} FAILED`);
    process.exit(1);
  }
  console.log('Standards corpus integrity regression: all invariants passed, 0 failed');
}

run().catch(async (error) => {
  console.error(error);
  try { await ds.destroy(); } catch { /* already destroyed */ }
  process.exit(1);
});
