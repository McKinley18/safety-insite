import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function testOsha() {
  const ds = await dataSource.initialize();
  const service = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  
  const scenarios = [
    { desc: "unguarded saw blade", cat: "Machine Guarding", exp: "1910" },
    { desc: "exposed electrical wire", cat: "Electrical", exp: "1910" },
    { desc: "no guardrail on platform", cat: "Fall Protection", exp: "1910" }
  ];

  for (const s of scenarios) {
    const res = await service.suggest(s.desc, s.cat, 'OSHA', 5);
    console.log(`Input: ${s.desc}, Results: ${res.primary.length + res.secondary.length}`);
  }
  await ds.destroy();
}
testOsha();
