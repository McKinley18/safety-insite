import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../entities/standard.entity';
import { STANDARDS_INTELLIGENCE_SEED } from '../../safescope-v2/standards-intelligence/standards-intelligence.seed';
import { normalizeAgency, normalizeCitationForMatch, toPayload } from './standards-intelligence-projection';
import { LegacyCorpusGuardRefused, assertSeedableCorpus } from './legacy-corpus-guard';

type AnyRecord = Record<string, any>;

/**
 * KG-5B (Phase 2). The projection functions this script used to declare inline
 * (`normalizeCitationForMatch`, `normalizeAgency`, `normalizeScope`, `normalizePart`, `asArray`,
 * `dedupe`, `severityWeight`, `standardText`, `toPayload`) now live in
 * `standards-intelligence-projection.ts`, unchanged, so that governed release construction can
 * apply the identical projection WITHOUT writing to the live corpus. This script's behaviour is
 * unaffected: same inputs, same functions, same writes.
 */

const databaseUrl = process.env.DATABASE_URL;
const dryRun = !process.argv.includes('--apply');

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

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);

  // KG-5B. Refuse BEFORE the first mutation if this corpus holds regulations the governed source
  // set does not name. The apply path below rewrites matched rows and renames their citations,
  // which KG-5A measured destroying a production-shaped corpus (KG5A-DISC-01). A dry run is
  // read-only and is always allowed, so an operator can still inspect what would happen.
  if (!dryRun) {
    const corpus = await assertSeedableCorpus(sql => ds.query(sql));
    console.log(
      `[legacy-corpus-guard] rows=${corpus.totalRows} governed=${corpus.governedRows} ` +
      `foreign=${corpus.foreignRows} ownedDisposable=${corpus.ownedDisposable}`,
    );
  }

  const allExisting = await repo.find();
  const existingByNormalizedCitation = new Map<string, Standard>();
  for (const standard of allExisting) {
    const normalizedKey = `${standard.agencyCode}::${normalizeCitationForMatch(standard.citation)}`;
    // If two rows already collide on the normalized key (the exact duplicate
    // this fix prevents going forward), keep the first and leave the
    // pre-existing duplicate for a separate, explicit cleanup decision --
    // this sync only prevents new duplicates, it does not silently delete
    // existing rows.
    if (!existingByNormalizedCitation.has(normalizedKey)) {
      existingByNormalizedCitation.set(normalizedKey, standard);
    }
  }

  const unique = new Map<string, AnyRecord>();

  for (const record of STANDARDS_INTELLIGENCE_SEED as AnyRecord[]) {
    const agencyCode = normalizeAgency(record.agency);
    const citation = String(record.citation || '').trim();

    if (!agencyCode || !citation) continue;

    const key = `${agencyCode}::${citation.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, record);
  }

  const planned = {
    seedRecords: (STANDARDS_INTELLIGENCE_SEED as AnyRecord[]).length,
    uniqueStandards: unique.size,
    insert: 0,
    update: 0,
    skipped: 0,
  };

  const byAgency = new Map<string, number>();

  for (const record of unique.values()) {
    const payload = toPayload(record);
    if (!payload?.agencyCode || !payload?.citation) {
      planned.skipped++;
      continue;
    }

    const agencyKey = String(payload.agencyCode);
    byAgency.set(agencyKey, (byAgency.get(agencyKey) || 0) + 1);

    const existing = existingByNormalizedCitation.get(
      `${payload.agencyCode}::${normalizeCitationForMatch(payload.citation)}`,
    );

    if (existing) planned.update++;
    else planned.insert++;
  }

  console.log('==================================================');
  console.log('Standards Intelligence → standards_master Sync');
  console.log('==================================================');
  console.log(dryRun ? 'Mode: DRY RUN, no DB writes' : 'Mode: APPLY, DB writes enabled');
  console.table([planned]);
  console.table([...byAgency.entries()].map(([agency, count]) => ({ agency, count })));

  if (dryRun) {
    console.log('Dry run complete. Re-run with --apply to write changes.');
    await ds.destroy();
    return;
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const record of unique.values()) {
    const payload = toPayload(record);

    if (!payload?.agencyCode || !payload?.citation) {
      skipped++;
      continue;
    }

    const existing = existingByNormalizedCitation.get(
      `${payload.agencyCode}::${normalizeCitationForMatch(payload.citation)}`,
    );

    if (existing) {
      Object.assign(existing, payload);
      await repo.save(existing);
      updated++;
    } else {
      const created = await repo.save(repo.create(payload));
      existingByNormalizedCitation.set(
        `${payload.agencyCode}::${normalizeCitationForMatch(payload.citation)}`,
        created,
      );
      inserted++;
    }
  }

  const counts = await repo
    .createQueryBuilder('s')
    .select('s.agencyCode', 'agency')
    .addSelect('COUNT(*)::int', 'count')
    .groupBy('s.agencyCode')
    .orderBy('count', 'DESC')
    .getRawMany();

  console.log('Applied standards intelligence sync.');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.table(counts);

  await ds.destroy();
}

run().catch(async (error) => {
  if (error instanceof LegacyCorpusGuardRefused) {
    console.error('');
    console.error(error.message);
    console.error('');
    console.error('No mutation was attempted.');
    await ds.destroy().catch(() => undefined);
    process.exit(1);
  }
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
