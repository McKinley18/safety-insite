import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySyncService } from '../src/regulatory/regulatory-sync.service';

async function run() {
  const ds = await dataSource.initialize();
  const service = new RegulatorySyncService(
      ds.getRepository(require('../src/regulatory/entities/regulatory-section.entity').RegulatorySection),
      ds.getRepository(require('../src/regulatory/entities/regulatory-part.entity').RegulatoryPart),
      ds.getRepository(require('../src/regulatory/entities/regulatory-agency.entity').RegulatoryAgency),
      ds.getRepository(require('../src/regulatory/entities/regulatory-subpart.entity').RegulatorySubpart),
      ds.getRepository(require('../src/regulatory/entities/regulatory-paragraph.entity').RegulatoryParagraph)
  );

  console.log('--- STARTING MSHA PART 56 SYNC ---');
  try {
      const res = await service.syncPart56();
      console.log('SUCCESS:', res);
  } catch (e) {
      console.error('FAILED:', e.message);
  }
  await ds.destroy();
}
run();
