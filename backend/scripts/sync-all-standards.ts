import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySyncService } from '../src/regulatory/regulatory-sync.service';

async function run() {
  console.log('\n🌐 SENTINEL SAFETY: INITIALIZING GLOBAL REGULATORY SYNC');
  console.log('========================================================');
  
  const ds = await dataSource.initialize();
  const service = new RegulatorySyncService(
      ds.getRepository(require('../src/regulatory/entities/regulatory-section.entity').RegulatorySection),
      ds.getRepository(require('../src/regulatory/entities/regulatory-part.entity').RegulatoryPart),
      ds.getRepository(require('../src/regulatory/entities/regulatory-agency.entity').RegulatoryAgency),
      ds.getRepository(require('../src/regulatory/entities/regulatory-subpart.entity').RegulatorySubpart),
      ds.getRepository(require('../src/regulatory/entities/regulatory-paragraph.entity').RegulatoryParagraph)
  );

  const syncMethods = [
    { agency: 'MSHA', name: 'syncPart46' },
    { agency: 'MSHA', name: 'syncPart47' },
    { agency: 'MSHA', name: 'syncPart48' },
    { agency: 'MSHA', name: 'syncPart50' },
    { agency: 'MSHA', name: 'syncPart56' },
    { agency: 'MSHA', name: 'syncPart57' },
    { agency: 'MSHA', name: 'syncPart62' },
    { agency: 'MSHA', name: 'syncPart77' },
    { agency: 'OSHA', name: 'syncOsha1904' },
    { agency: 'OSHA', name: 'syncOsha1910' },
    { agency: 'OSHA', name: 'syncOsha1926' },
  ];

  for (const target of syncMethods) {
    console.log(`\n⏳ Syncing ${target.agency} - ${target.name.replace('sync', '')}...`);
    try {
      const res = await (service as any)[target.name]();
      console.log(`✅ SUCCESS: Parsed & Upserted ${res.sectionsUpserted} regulatory sections.`);
    } catch (e) {
      console.error(`❌ FAILED: ${e.message}`);
    }
  }

  console.log('\n========================================================');
  console.log('✅ GLOBAL REGULATORY SYNC COMPLETE');
  await ds.destroy();
}

run();
