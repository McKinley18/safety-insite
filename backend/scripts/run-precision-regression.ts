import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { dataSource } from '../src/database/data-source';
import { MatchEngineService } from '../src/match-engine/match-engine.service';
import { StandardsService } from '../src/standards/standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { CorrectiveActionTemplate } from '../src/standards/entities/corrective-action-template.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

async function runAudit() {
  const ds = await dataSource.initialize();
  const matchService = new MatchEngineService();
  const stdService = new StandardsService(ds.getRepository(Standard), ds.getRepository(CorrectiveActionTemplate), ds.getRepository(RegulatorySection));
  const tests = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/intelligence-library/data/5k-real-scenarios-v4.json'), 'utf8')).slice(0, 500);
  
  let matches = 0, aliasMatches = 0, total = tests.length, failures = [];

  for (const t of tests) {
    const mRes = matchService.match(t.rawDescription, t.hazardFamily, t.industryMode);
    
    // Accurate logic: alias matches if primary matches parent family expectation
    if (mRes.primaryConditionId === t.expectedConditionId) matches++;
    else if (mRes.aliasAdjustedId === t.expectedConditionId) aliasMatches++;
    else failures.push({ input: t.rawDescription, expected: t.expectedConditionId, actual: mRes.primaryConditionId });
  }

  const report = {
    exactConditionAccuracy: ((matches / total) * 100).toFixed(2) + '%',
    aliasAdjustedHazardRecognition: (((matches + aliasMatches) / total) * 100).toFixed(2) + '%',
    worstFailures: failures.slice(0, 20)
  };
  console.log(JSON.stringify(report, null, 2));
  await ds.destroy();
}
runAudit();
