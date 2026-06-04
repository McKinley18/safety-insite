import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { dataSource } from '../src/database/data-source';
import { MatchEngineService } from '../src/match-engine/match-engine.service';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function run() {
  const ds = await dataSource.initialize();
  const matchService = new MatchEngineService();
  const stdService = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  const tests = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/intelligence-library/data/5k-real-scenarios-v4.json'), 'utf8'));
  
  let exact = 0, aliasAdjusted = 0, primaryCit = 0, total = tests.length, failures = [];

  for (const t of tests) {
    const mRes = matchService.match(t.rawDescription, t.hazardFamily, t.industryMode);
    const sRes = await stdService.suggest(t.rawDescription, t.hazardFamily, t.industryMode.includes('MSHA') ? 'MSHA' : 'OSHA', 5);
    
    if (mRes.primaryConditionId === t.expectedConditionId) exact++;
    else if (t.acceptableConditionIds.includes(mRes.primaryConditionId) || mRes.parentConditionId === t.expectedConditionId) aliasAdjusted++;
    else failures.push({ input: t.rawDescription, expected: t.expectedConditionId, actual: mRes.primaryConditionId });

    const citations = [...sRes.primary, ...sRes.secondary, ...sRes.additional].map(c => c.citation);
    if (t.expectedPrimaryCitations.some(c => citations.some(x => x.includes(c)))) primaryCit++;
  }

  const report = {
    exactConditionAccuracy: ((exact / total) * 100).toFixed(2) + '%',
    aliasAdjustedConditionAccuracy: (((exact + aliasAdjusted) / total) * 100).toFixed(2) + '%',
    primaryCitationRelevance: ((primaryCit / total) * 100).toFixed(2) + '%',
    worstFailures: failures.slice(0, 20)
  };
  console.log(JSON.stringify(report, null, 2));
  await ds.destroy();
}
run();
