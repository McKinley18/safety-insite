import 'reflect-metadata';
import 'dotenv/config';
import { dataSource } from '../../database/data-source';
import { StandardsService } from '../standards.service';
import { Standard } from '../entities/standard.entity';

const testCases = [
  ['MSHA conveyor tail pulley guarding', '56.14107(a)', { observation: 'Unguarded conveyor tail pulley with exposed rotating pinch point', siteType: 'mining', equipmentType: 'conveyor', locationType: 'plant' }],
  ['MSHA exposed rotating shaft', '56.14107(a)', { observation: 'Exposed rotating shaft on crusher drive without guard', siteType: 'mining', equipmentType: 'crusher drive', locationType: 'plant' }],
  ['MSHA missing berm haul road', '56.9300(a)', { observation: 'Missing berm along elevated haul road edge near dump point', siteType: 'mining', equipmentType: 'haul truck', locationType: 'haul road' }],
  ['MSHA low berm roadway', '56.9300(a)', { observation: 'Low berm on mine roadway with steep drop off', siteType: 'mining', locationType: 'haul road' }],
  ['MSHA workplace exam not documented', '56.18002(a)', { observation: 'No documented workplace exam was completed before miners began work at the crusher', siteType: 'mining', locationType: 'crusher' }],
  ['MSHA competent person exam missing', '56.18002(a)', { observation: 'Competent person did not complete working place exam before shift', siteType: 'mining', locationType: 'plant' }],
  ['MSHA damaged electrical cable', '56.12004', { observation: 'Damaged electrical cable exposed to mechanical damage near plant walkway', siteType: 'mining', locationType: 'plant' }],
  ['MSHA frayed conductor', '56.12004', { observation: 'Frayed electrical conductor lying across travelway', siteType: 'mining', locationType: 'plant' }],
  ['MSHA unsafe access', '56.11001', { observation: 'Blocked walkway creates unsafe access to screen deck', siteType: 'mining', locationType: 'plant' }],
  ['MSHA ladder access to work area', '56.11001', { observation: 'No safe means of access provided to elevated work platform', siteType: 'mining', locationType: 'platform' }],

  ['OSHA GI machine guarding', '1910.212(a)(1)', { observation: 'Exposed rotating shaft and ingoing nip point on production machine', siteType: 'general_industry', equipmentType: 'production machine', locationType: 'manufacturing floor' }],
  ['OSHA GI point of operation', '1910.212(a)(1)', { observation: 'Point of operation on press is not guarded', siteType: 'general_industry', equipmentType: 'press' }],
  ['OSHA GI LOTO energized maintenance', '1910.147(c)(1)', { observation: 'Maintenance employee servicing energized equipment without lockout tagout', siteType: 'general_industry', activityType: 'maintenance' }],
  ['OSHA GI unexpected startup', '1910.147(c)(1)', { observation: 'Unexpected startup hazard during repair because no energy control procedure was used', siteType: 'general_industry', activityType: 'repair' }],
  ['OSHA forklift training', '1910.178(l)(1)', { observation: 'Forklift operator in warehouse has not completed powered industrial truck training', siteType: 'general_industry', equipmentType: 'forklift', locationType: 'warehouse' }],
  ['OSHA lift truck evaluation', '1910.178(l)(1)', { observation: 'Lift truck operator has no documented training evaluation', siteType: 'general_industry', equipmentType: 'lift truck', locationType: 'warehouse' }],
  ['OSHA hazcom SDS training', '1910.1200(h)(1)', { observation: 'Employees using hazardous chemical without SDS training or hazard communication instruction', siteType: 'general_industry', locationType: 'shop' }],
  ['OSHA chemical labels', '1910.1200(h)(1)', { observation: 'Chemical containers missing labels and workers have not received hazcom training', siteType: 'general_industry', locationType: 'shop' }],
  ['OSHA GI damaged cord', '1910.303(b)(1)', { observation: 'Damaged frayed electrical cord on temporary power at warehouse work area', siteType: 'general_industry', locationType: 'warehouse' }],
  ['OSHA GI exposed wire', '1910.303(b)(1)', { observation: 'Exposed wire on electrical equipment likely to cause serious harm', siteType: 'general_industry', locationType: 'production floor' }],
  ['OSHA GI housekeeping debris', '1910.22(a)(1)', { observation: 'Debris and clutter creating trip hazard in passageway', siteType: 'general_industry', locationType: 'passageway' }],
  ['OSHA GI oil spill walking surface', '1910.22(a)(1)', { observation: 'Oil spill on walking working surface causing slip hazard', siteType: 'general_industry', locationType: 'warehouse' }],

  ['OSHA construction roof edge', '1926.501(b)(1)', { observation: 'Worker near unprotected roof edge 10 feet above lower level with no guardrail', siteType: 'construction', activityType: 'roof work' }],
  ['OSHA construction open side', '1926.501(b)(1)', { observation: 'Employee exposed to open side more than 6 feet above lower level without fall arrest', siteType: 'construction', activityType: 'framing' }],
  ['OSHA construction ladder access', '1926.1053(b)(1)', { observation: 'Portable ladder used for roof access does not extend 3 feet above landing', siteType: 'construction', equipmentType: 'ladder' }],
  ['OSHA construction ladder landing', '1926.1053(b)(1)', { observation: 'Extension ladder side rails stop below upper landing surface', siteType: 'construction', equipmentType: 'extension ladder' }],
  ['OSHA construction trench protection', '1926.652(a)(1)', { observation: 'Employee working in trench excavation with no shoring trench box sloping or cave-in protection', siteType: 'construction', activityType: 'excavation' }],
  ['OSHA construction cave-in hazard', '1926.652(a)(1)', { observation: 'Unprotected excavation over 5 feet deep with cave in hazard', siteType: 'construction', activityType: 'trenching' }],
  ['OSHA construction scaffold fall protection', '1926.451(g)(1)', { observation: 'Employees working on scaffold platform more than 10 feet high without guardrails', siteType: 'construction', activityType: 'scaffold work' }],
  ['OSHA construction scaffold guardrail', '1926.451(g)(1)', { observation: 'Scaffold platform lacks guardrail and worker is above lower level', siteType: 'construction', activityType: 'scaffold' }],
  ['OSHA construction eye protection', '1926.102(a)(1)', { observation: 'Worker grinding concrete without safety glasses or face shield', siteType: 'construction', activityType: 'grinding' }],
  ['OSHA construction flying particles', '1926.102(a)(1)', { observation: 'Cutting operation creates flying particles and employee lacks eye protection', siteType: 'construction', activityType: 'cutting' }],
];

async function main() {
  await dataSource.initialize();

  const fakeFeedbackRepo = {
    find: async () => [],
    create: (dto: any) => dto,
    save: async (dto: any) => dto,
  } as any;

  const service = new StandardsService();

  let pass = 0;

  for (const [name, expectedCitation, request] of testCases as any[]) {
    const result = await service.match(JSON.stringify(request));
    const top = result[0];
    const ok = top?.citation === expectedCitation;

    if (ok) pass += 1;

    console.log(`${ok ? '✅' : '❌'} ${name}`);
    console.log(`   Expected: ${expectedCitation}`);
    console.log(`   Got:      ${top?.citation ?? 'NO MATCH'} (${top?.confidence ?? 0})`);
  }

  console.log('');
  console.log(`Accuracy: ${pass}/${testCases.length} = ${Math.round((pass / testCases.length) * 100)}%`);

  await dataSource.destroy();

  if (pass !== testCases.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
