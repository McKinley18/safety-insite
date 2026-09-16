/**
 * §305 (SE-12) — THE DURABLE STRUCTURAL DRIFT GATE.
 *
 * Builds nothing itself: it is run INSIDE `with-disposable-db`, which creates an empty database and
 * replays the entire migration history into it. This script then extracts the normalized schema and
 * compares it against the committed canonical manifest, failing on material drift.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT MAKES THIS A GATE RATHER THAN A FORMALITY.
 *
 * Two things, and both matter.
 *
 * FIRST, it compares a SCHEMA against a SCHEMA, through the one shared extractor in
 * `src/database/canonical-schema.ts`. SE-12 survived for the product's whole life because nobody
 * could tell a cosmetic difference (a synchronize-generated constraint name) from a material one (a
 * missing table). Normalizing names away and comparing types, nullability, keys, foreign keys with
 * their actions, unique constraints and indexes is what makes the answer trustworthy.
 *
 * SECOND, it is watched to fail. `verification/current/se12-canonical-schema-305/` retains the
 * output of running this gate against the PRE-§305 migration history, where it reports the missing
 * `notifications` table among many others. A gate nobody has watched fail is not evidence.
 *
 * ---------------------------------------------------------------------------------------------
 * SCOPE, AND WHY RETIRED OBJECTS ARE REPORTED BUT NOT FATAL.
 *
 * ACTIVE_INDIVIDUAL_BETA, SHARED_INFRASTRUCTURE and DEFERRED_COMPANY_TEAM objects are binding: a
 * difference fails the gate. RETIRED_COMPATIBILITY objects — legacy tables with canonical successors
 * under other names, and the unexplained `outcomes` table (DB-4) — are printed and tolerated.
 * §305 forbids dropping production-only tables, and failing every release over a table nothing on
 * the Beta v1 path reads would train people to ignore this gate, which is how gates die.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import {
  extractCanonicalSchema, diffSchemas, schemaDigest, CanonicalSchema,
} from '../src/database/canonical-schema';

const PROTECTED = ['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'neondb'];

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§305 gate REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  if (PROTECTED.includes(database) || parsed.hostname.includes('neon.tech')) {
    throw new Error(`§305 gate REFUSED: ${database} is not a disposable database.`);
  }
  console.log(`canonical schema gate: replayed database ${database}`);

  const manifestPath = path.join(__dirname, '../src/database/canonical-schema.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expected: CanonicalSchema = manifest.schema;

  const ds = new DataSource({ type: 'postgres', url });
  await ds.initialize();
  const actual = await extractCanonicalSchema({ query: (s, p) => ds.query(s, p) });
  await ds.destroy();

  const differences = diffSchemas(expected, actual);
  const actualDigest = schemaDigest(actual);

  console.log(`  manifest digest  ${manifest.digest}`);
  console.log(`  replay digest    ${actualDigest}`);
  console.log(`  manifest tables  ${expected.tables.length}`);
  console.log(`  replay tables    ${actual.tables.length}`);

  const retired = actual.tables.filter((t) => t.scope === 'RETIRED_COMPATIBILITY').map((t) => t.name);
  if (retired.length) console.log(`  retired/compatibility objects present (not enforced): ${retired.join(', ')}`);

  if (differences.length) {
    console.error(`\n§305 CANONICAL SCHEMA DRIFT — ${differences.length} material difference(s):\n`);
    for (const d of differences) {
      console.error(`  [${d.scope}] ${d.table}: ${d.kind} — ${d.detail}`);
    }
    console.error('\nA fresh migration replay no longer produces the canonical schema. Either the '
      + 'migration history is missing a change, or the manifest needs regenerating deliberately '
      + '(npm run s305:manifest) as part of a reviewed schema change.');
    process.exit(1);
  }

  console.log(`\nok    a fresh migration replay reproduces the canonical schema exactly `
    + `(${expected.tables.length} tables, 0 material differences)`);
  console.log(JSON.stringify({ tables: expected.tables.length, digest: actualDigest, differences: 0 }));
})().catch((error) => { console.error(error); process.exit(1); });
