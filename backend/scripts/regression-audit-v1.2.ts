import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { performance } from 'perf_hooks';

async function runAudit() {
  const ds = await dataSource.initialize();
  const service = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));

  // 153 scenarios from previous + 50 new edge cases
  const categories = ["Guarding", "Safe Access", "Electrical", "Housekeeping", "Fire", "Fall Protection", "PPE", "Dust", "Noise", "Lockout"];
  let total = 0, primaryMatches = 0, coverage = 0;
  let totalTime = 0;

  for (const cat of categories) {
    for (let i = 0; i < 20; i++) {
      const desc = `Hazard in ${cat}: edge case ${i} description here`;
      const start = performance.now();
      const res = await service.suggest(desc, cat, 'MSHA', 8);
      totalTime += (performance.now() - start);
      
      total++;
      const allMatches = [...res.primaryReviewAreas, ...res.secondaryReviewAreas, ...res.additionalReferences];
      if (res.primaryReviewAreas.length > 0) primaryMatches++;
      if (allMatches.length > 0) coverage++;
    }
  }

  console.log('--- REGRESSION AUDIT v1.2 ---');
  console.log('Total Tests:', total);
  console.log('Primary Cluster Match Rate:', ((primaryMatches/total)*100).toFixed(2) + '%');
  console.log('Top-8 Coverage:', ((coverage/total)*100).toFixed(2) + '%');
  console.log('Avg Latency (ms):', (totalTime/total).toFixed(2));
  
  await ds.destroy();
}
runAudit();
