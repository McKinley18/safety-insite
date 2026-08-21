import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { SAFESCOPE_CURATED_STANDARDS } from './safescope-standards.data';
import {
  LegacyCorpusGuardRefused,
  assertSeedableCorpus,
} from '../../standards/seed/legacy-corpus-guard';

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
  synchronize: true,
});

const standards = SAFESCOPE_CURATED_STANDARDS;

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);

  // KG-5B. THE GUARD BELONGS HERE, AT STAGE ONE.
  //
  // It was first wired only into the sync and the finalizer -- stages two and three of
  // `seed:safescope-standards` -- and that was measurably not enough. Against a copy of the
  // production-shaped corpus the guard fired correctly at stage two, by which point THIS loop had
  // already inserted five rows and rewritten `title` and `standardText` on `1910.219`, `1910.146`
  // and `1910.36`: three of the five live rows KG-5A recorded as damaged, and 2,390 rows had
  // become 2,395. A guard placed after the first mutation is not a guard.
  //
  // The refusal now happens before this function writes anything at all.
  const corpus = await assertSeedableCorpus(sql => ds.query(sql));
  console.log(
    `[legacy-corpus-guard] rows=${corpus.totalRows} governed=${corpus.governedRows} ` +
    `foreign=${corpus.foreignRows} ownedDisposable=${corpus.ownedDisposable}`,
  );

  for (const standard of standards) {
    const existing = await repo.findOne({
      where: {
        agencyCode: standard.agencyCode,
        citation: standard.citation,
      },
    });

    if (existing) {
      Object.assign(existing, standard);
      await repo.save(existing);
      console.log(`Updated ${standard.citation}`);
    } else {
      await repo.save(repo.create(standard));
      console.log(`Inserted ${standard.citation}`);
    }
  }

  console.log(`Seeded ${standards.length} SafeScope standards.`);
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
