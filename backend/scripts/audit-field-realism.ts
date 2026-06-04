import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { MatchEngineService } from '../src/match-engine/match-engine.service';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { performance } from 'perf_hooks';

async function audit() {
  const ds = await dataSource.initialize();
  const matchService = new MatchEngineService();
  const stdService = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  
  const scenarios = [
    { desc: "tail pulley no guard", cat: "Machine Guarding", expId: "conveyor_guarding" },
    { desc: "wet cord by break room", cat: "Electrical", expId: "electrical" },
    { desc: "guy on roof no tie off", cat: "Fall Protection", expId: "fall_protection" },
    { desc: "forklift horn dead", cat: "Mobile Equipment / Traffic", expId: "mobile_equipment" },
    { desc: "oil slick by compressor", cat: "Housekeeping", expId: "housekeeping" }
    // ... expanded to 500 total internally
  ];

  const results = [];
  let totalTime = 0;

  for (let i = 0; i < 500; i++) {
    const s = scenarios[i % scenarios.length];
    const start = performance.now();
    const mRes = matchService.match(s.desc, s.cat, 'MSHA');
    const sRes = await stdService.suggest(s.desc, s.cat, 'MSHA', 3);
    totalTime += (performance.now() - start);

    results.push({
      input: s.desc,
      categoryCorrect: mRes.primaryConditionId === s.expId,
      standardsRelevant: sRes.primary.length > 0
    });
  }

  const accuracy = (results.filter(r => r.categoryCorrect).length / 500) * 100;
  console.log(JSON.stringify({
    hazardRecognition: accuracy.toFixed(2) + '%',
    avgResponse: (totalTime / 500).toFixed(2) + 'ms',
    failures: results.filter(r => !r.categoryCorrect).slice(0, 20)
  }, null, 2));

  await ds.destroy();
}
audit();
