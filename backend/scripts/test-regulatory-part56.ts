import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function test() {
  const ds = await dataSource.initialize();
  const repo = ds.getRepository(RegulatorySection);
  
  const section = await repo.findOne({ where: { citation: '30 CFR 56.14107' } });
  
  if (section && section.heading === 'Moving machine parts') {
    console.log('Test PASSED: Real data stored and retrieved.');
  } else {
    console.log('Test FAILED: Data mismatch or missing.');
  }
  
  await ds.destroy();
}

test();
