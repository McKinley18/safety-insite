import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { IntelligenceService } from '../src/intelligence-framework/intelligence.service';
import { HazardTaxonomy } from '../src/intelligence-framework/entities/hazard-taxonomy.entity';

async function test() {
  const ds = await dataSource.initialize();
  const repo = ds.getRepository(HazardTaxonomy);
  // Seed basic data
  await repo.save([
      { family: 'Guarding', condition: 'Conveyor Guarding', triggerPhrases: ['conveyor missing guard', 'tail pulley exposed'], clarifyingQuestions: ['Is the equipment operating?'], likelyCitations: ['30 CFR 56.14107'] }
  ]);

  const service = new IntelligenceService(repo);
  const result = await service.analyze('conveyor missing guard near crusher');
  
  console.log(JSON.stringify(result, null, 2));
  
  if (result.condition === 'Conveyor Guarding') {
    console.log('Framework v4 Test PASSED');
  } else {
    console.log('Framework v4 Test FAILED');
  }
  await ds.destroy();
}
test();
