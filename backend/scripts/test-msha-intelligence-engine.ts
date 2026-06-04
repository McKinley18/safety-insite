import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function test() {
  const ds = await dataSource.initialize();
  const service = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  
  const scenarios = [
    { desc: "conveyor tail pulley missing guard", cat: "Machine Guarding", exp: "56.14107" },
    { desc: "damaged ladder with bent side rail", cat: "Access / Walking Surfaces", exp: "56.11001" },
    { desc: "no lockout clearing jam", cat: "Lockout / Energy", exp: "56.14105" },
    { desc: "crusher dust cloud", cat: "Health: Dust / Noise / Respiratory", exp: "56.5001" },
    { desc: "too loud near screen plant", cat: "Noise / Hearing Conservation", exp: "56.5050" }
  ];

  let passed = 0;
  for (const s of scenarios) {
    const res = await service.suggest(s.desc, s.cat, 'MSHA');
    if (res.find(m => m.citation.includes(s.exp))) passed++;
    else console.log('Failed:', s.desc, 'Exp:', s.exp);
  }
  console.log(`Test Passed: ${passed}/${scenarios.length}`);
  await ds.destroy();
}
test();
