import { DataSource, Repository } from 'typeorm';
import { Standard } from '../standard.entity';
import * as fs from 'fs';
import * as path from 'path';

type IngestRecord = {
  citation: string;
  agency: string;
  title?: string;
  text?: string;
  part?: string | null;
  category?: string | null;
  isActive?: boolean;
  [key: string]: unknown;
};

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mckinley',
  password: '',
  database: 'sentinel_safety',
  entities: [Standard],
  synchronize: true,
});

function loadJSON(file: string) {
  const filePath = path.join(__dirname, file);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function mapToStandardPayload(record: IngestRecord): Partial<Standard> {
  return {
    citation: record.citation,
    agency: record.agency,
    title: record.title ?? record.citation,
    text: record.text ?? '',
    part: record.part ?? undefined,
    subpart: undefined,
    category: record.category ?? undefined,
    isActive: record.isActive ?? true,
  };
}

async function upsert(repo: Repository<Standard>, record: IngestRecord) {
  const existing = await repo.findOne({
    where: { citation: record.citation, agency: record.agency },
  });

  if (existing) {
    await repo.update(existing.id, mapToStandardPayload(record));
    console.log(`🔄 Updated ${record.citation}`);
  } else {
    await repo.save(repo.create(mapToStandardPayload(record)));
    console.log(`✔ Inserted ${record.citation}`);
  }
}

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Standard);

  const datasets = ['msha.full.json', 'osha.full.json'];

  for (const file of datasets) {
    console.log(`\n📦 Processing ${file}`);

    const data = loadJSON(file);

    for (const record of data) {
      await upsert(repo, record);
    }
  }

  console.log('\n✅ FULL CFR INGESTION COMPLETE');
  process.exit(0);
}

run();
