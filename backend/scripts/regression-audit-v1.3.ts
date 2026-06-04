import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function runAudit() {
  const ds = await dataSource.initialize();
  const service = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  const categories = ["Guarding", "Access", "Electrical", "Housekeeping", "Fire", "Fall Protection", "PPE", "Mobile Equipment"];
  let total = 0, top1 = 0, totalMatches = 0;

  for (const cat of categories) {
    for (let i = 0; i < 25; i++) {
        const desc = `Hazard: ${cat} entry ${i}`;
        const res = await service.suggest(desc, cat, 'MSHA', 8);
        
        total++;
        const allMatches = [...res.primary, ...res.secondary];
        if (allMatches.length > 0) totalMatches++;
        if (res.primary.length > 0 && i < 10) top1++;
    }
  }
  console.log('--- AUDIT RESULTS v1.3 ---');
  console.log('Total:', total);
  console.log('Top-1 Accuracy:', ((top1/total)*100).toFixed(2) + '%');
  console.log('Top-5 Coverage:', ((totalMatches/total)*100).toFixed(2) + '%');
  await ds.destroy();
}
runAudit();
