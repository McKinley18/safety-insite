import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySyncService } from '../src/regulatory/regulatory-sync.service';
import { RegulatoryAgency } from '../src/regulatory/entities/regulatory-agency.entity';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';
import { RegulatorySubpart } from '../src/regulatory/entities/regulatory-subpart.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';

async function syncAll() {
  const ds = await dataSource.initialize();
  const service = new RegulatorySyncService(
      ds.getRepository(RegulatorySection), ds.getRepository(RegulatoryPart),
      ds.getRepository(RegulatoryAgency), ds.getRepository(RegulatorySubpart), ds.getRepository(RegulatoryParagraph)
  );
  
  const mapping = { '1904': 'syncOsha1904', '1910': 'syncOsha1910', '1926': 'syncOsha1926' };
  for (const [part, method] of Object.entries(mapping)) {
      console.log(`Syncing OSHA Part ${part}...`);
      try {
          const res = await (service as any)[method]();
          console.log(res);
      } catch (e) { console.error(`Part ${part} sync failed`, e); }
  }
  await ds.destroy();
}
syncAll();
