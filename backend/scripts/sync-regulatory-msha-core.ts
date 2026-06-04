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
  
  const parts = ['46', '47', '48', '50', '56', '57', '62', '77'];
  for (const p of parts) {
      console.log(`Syncing Part ${p}...`);
      try {
          const res = await (service as any)[`syncPart${p}`]();
          console.log(res);
      } catch (e) { console.error(`Part ${p} sync failed`, e); }
  }
  await ds.destroy();
}
syncAll();
