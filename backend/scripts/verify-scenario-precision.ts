import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function verify() {
  const ds = await dataSource.initialize();
  const service = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  
  const scenarios = [
    { desc: "conveyor tail pulley missing guard", cat: "Machine Guarding", exp: "56.14107" },
    { desc: "frayed extension cord across wet walkway", cat: "Electrical", exp: "1910.303" },
    { desc: "worker near open edge without fall protection", cat: "Fall Protection", exp: "1926.501" },
    { desc: "ladder rung broken", cat: "Access / Walking Surfaces", exp: "56.11001" },
    { desc: "no lockout clearing crusher jam", cat: "Lockout / Energy", exp: "56.14105" },
    { desc: "crusher dust cloud", cat: "Health: Dust / Noise / Respiratory", exp: "56.5001" },
    { desc: "oil on walkway", cat: "Housekeeping", exp: "56.20003" }
  ];

  for (const s of scenarios) {
    const res = await service.suggest(s.desc, s.cat, s.exp.includes('19') ? 'OSHA' : 'MSHA', 5);
    const matches = [...res.primary, ...res.secondary];
    const found = matches.find(m => m.citation.includes(s.exp));
    console.log(`Input: "${s.desc}" -> ${found ? 'PASS' : 'FAIL'} (Found: ${matches.map(m => m.citation).join(', ')})`);
  }
  await ds.destroy();
}
verify();
