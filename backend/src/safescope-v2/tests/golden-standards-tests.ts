import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { ApplicableStandardsService } from '../../applicable-standards/applicable-standards.service';

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mckinley',
  password: '',
  database: 'sentinel_safety',
  entities: [Standard],
  synchronize: false,
});

async function run() {
  await ds.initialize();

  const repo = ds.getRepository(Standard);
  const service = new ApplicableStandardsService(repo);

  const tests = [
    {
      name: 'Machine guarding conveyor hazard finds MSHA guarding standard',
      text: 'Worker exposed to unguarded rotating shaft near conveyor drive with moving parts in reach.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.14107(a)',
    },
    {
      name: 'Electrical live wire hazard finds OSHA electrical standard',
      text: 'Live wire and exposed conductor hanging from open electrical panel creates shock hazard.',
      source: 'OSHA_GENERAL_INDUSTRY',
      expectedCitation: '1910.303(b)(1)',
    },
    {
      name: 'Confined space tank entry finds permit space standard',
      text: 'Confined space entry into tank with no attendant and atmospheric testing not performed.',
      source: 'OSHA_GENERAL_INDUSTRY',
      expectedCitation: '1910.146',
    },
    {
      name: 'Catwalk material buildup finds MSHA housekeeping standard',
      text: 'Catwalk has build up of material creating poor housekeeping and slip trip exposure on the travelway.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.20003',
    },
    {
      name: 'Catwalk material buildup finds MSHA safe access standard',
      text: 'Material accumulation on catwalk walkway restricts safe access to the work area.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.11001',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const matches = await service.suggest(test.text, undefined, test.source, 5);
    const found = matches.some((match) => match.citation === test.expectedCitation);

    if (found) {
      passed += 1;
      console.log(`✅ ${test.name}`);
    } else {
      failed += 1;
      console.log(`❌ ${test.name}`);
      console.log(`   Expected: ${test.expectedCitation}`);
      console.log(`   Received: ${matches.map((m) => m.citation).join(', ') || 'no matches'}`);
    }
  }

  console.log('');
  console.log(`SafeScope standards tests: ${passed} passed, ${failed} failed`);

  await ds.destroy();

  if (failed > 0) process.exit(1);
}

run().catch(async (error) => {
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
