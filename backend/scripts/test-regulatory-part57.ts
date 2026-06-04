import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function test() {
  const ds = await dataSource.initialize();
  const repo = ds.getRepository(RegulatorySection);
  
  const count = await repo.count({ where: { part: '57' } });
  const section = await repo.findOne({ where: { citation: '30 CFR 57.14107' } });
  
  if (count > 50 && section) {
    console.log('Test PASSED: Part 57 sync successful.');
  } else {
    console.log('Test FAILED: Part 57 count too low or missing section.');
  }
  
  await ds.destroy();
}
test();
