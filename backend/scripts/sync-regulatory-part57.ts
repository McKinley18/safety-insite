import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySyncService } from '../src/regulatory/regulatory-sync.service';
import { RegulatoryAgency } from '../src/regulatory/entities/regulatory-agency.entity';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';
import { RegulatorySubpart } from '../src/regulatory/entities/regulatory-subpart.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';

async function sync() {
  const ds = await dataSource.initialize();
  const service = new RegulatorySyncService(
      ds.getRepository(RegulatorySection),
      ds.getRepository(RegulatoryPart),
      ds.getRepository(RegulatoryAgency),
      ds.getRepository(RegulatorySubpart),
      ds.getRepository(RegulatoryParagraph)
  );
  console.log(await service.syncPart57());
  await ds.destroy();
}
sync();
