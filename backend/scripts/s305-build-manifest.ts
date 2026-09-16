/*
 * §305 — build the canonical manifest FROM A FRESH MIGRATION REPLAY.
 *
 * The manifest is generated from the replay rather than from production deliberately. The replay is
 * what the migration history produces, and after the convergence migration it is what production
 * must also be. Generating from the replay means the committed manifest is, by construction, a
 * statement about the migration history — which is the thing SE-12 says nobody could trust.
 * Production is then compared against it as a separate, falsifiable claim.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { extractCanonicalSchema, schemaDigest } from '../src/database/canonical-schema';

(async () => {
  const url = process.env.DATABASE_URL!;
  if (url.includes('neon.tech')) throw new Error('§305 REFUSED: manifest target resolved to production');
  const ds = new DataSource({ type: 'postgres', url });
  await ds.initialize();
  const schema = await extractCanonicalSchema({ query: (s, p) => ds.query(s, p) });
  await ds.destroy();

  const digest = schemaDigest(schema);
  const out = path.join(__dirname, '../src/database/canonical-schema.manifest.json');
  fs.writeFileSync(out, JSON.stringify({
    artifact: 'SAFETY_INSITE_CANONICAL_SCHEMA_MANIFEST',
    establishedBy: '§305 (SE-12)',
    generatedFrom: 'a fresh database built by replaying the full migration history',
    digest,
    tableCount: schema.tables.length,
    schema,
  }, null, 1) + '\n');
  console.log(JSON.stringify({ tables: schema.tables.length, digest }));
})();
