import { DataSource } from 'typeorm';
import { Standard } from '../standard.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mckinley',
  password: '',
  database: 'sentinel_safety',
  entities: [Standard],
  synchronize: false,
});

function isValidStandard(s: Standard) {
  const text = (s.text || '').toLowerCase();
  const title = (s.title || '').toLowerCase();

  // ❌ remove weak / non-enforceable sections
  if (!s.text || s.text.length < 40) return false;

  if (title.includes('authority')) return false;
  if (title.includes('scope')) return false;
  if (title.includes('definition')) return false;
  if (title.includes('appendix')) return false;

  if (text.includes('authority citation')) return false;
  if (text.includes('table of contents')) return false;

  return true;
}

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Standard);

  const all = await repo.find();
  console.log(`Loaded ${all.length} records`);

  let removed = 0;

  for (const s of all) {
    if (!isValidStandard(s)) {
      await repo.delete(s.id);
      removed++;
    }
  }

  console.log(`Removed ${removed} non-enforceable sections`);

  const finalCount = await repo.count();
  console.log(`Final clean count: ${finalCount}`);

  process.exit(0);
}

run();
