import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function run() {
  const ds = await dataSource.initialize();
  const repo = ds.getRepository(RegulatorySection);
  const count = await repo.count({ where: { part: '57' } });
  console.log('Count:', count);
  await ds.destroy();
}
run();
