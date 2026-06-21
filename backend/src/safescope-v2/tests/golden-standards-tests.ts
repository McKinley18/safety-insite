import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { ApplicableStandardsService } from '../../applicable-standards/applicable-standards.service';

const databaseUrl = process.env.DATABASE_URL;

const ds = new DataSource({
  type: 'postgres',
  url: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USERNAME || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: databaseUrl ? undefined : process.env.DB_NAME || 'safescope',
  entities: [Standard],
  synchronize: true,
});

function canonicalizeCitation(cit: string): string {
  return cit
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isCitationMatch(dbCit: string, targetCit: string): boolean {
  const c1 = canonicalizeCitation(dbCit);
  const c2 = canonicalizeCitation(targetCit);
  return c1.includes(c2) || c2.includes(c1);
}

async function run() {
  await ds.initialize();

  const repo = ds.getRepository(Standard);
  const service = new ApplicableStandardsService(repo);

  const tests = [
    {
      name: 'Machine guarding conveyor hazard finds MSHA guarding standard',
      text: 'Worker exposed to unguarded rotating shaft near conveyor drive with moving parts in reach.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.14107(a)',
    },
    {
      name: 'Electrical live wire hazard finds OSHA electrical standard',
      text: 'Live wire and exposed conductor hanging from open electrical panel creates shock hazard.',
      source: 'OSHA_GENERAL_INDUSTRY',
      expectedCitation: '1910.303(b)(1)',
    },
    {
      name: 'Confined space tank entry finds permit space standard',
      text: 'Confined space entry into tank with no attendant and atmospheric testing not performed.',
      source: 'OSHA_GENERAL_INDUSTRY',
      expectedCitation: '1910.146',
    },
    {
      name: 'Catwalk material buildup finds MSHA housekeeping standard',
      text: 'Catwalk has build up of material creating poor housekeeping and slip trip exposure on the travelway.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.20003',
    },
    {
      name: 'Catwalk material buildup finds MSHA safe access standard',
      text: 'Material accumulation on catwalk walkway restricts safe access to the work area.',
      source: 'MSHA',
      expectedCitation: '30 CFR 56.11001',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const matches = await service.suggest(test.text, undefined, test.source, 5);
    const found = matches.some((match) => isCitationMatch(match.citation, test.expectedCitation));

    if (found) {
      passed += 1;
      console.log(`✅ ${test.name}`);
    } else {
      failed += 1;
      console.log(`❌ ${test.name}`);
      console.log(`   Expected: ${test.expectedCitation}`);
      console.log(`   Received: ${matches.map((m) => m.citation).join(', ') || 'no matches'}`);
    }
  }

  // Verify that cylinder standards are NOT matched for mechanical guarding hazards
  const mechanicalMatches = await service.suggest('tail pulley missing guard', undefined, 'OSHA_GENERAL_INDUSTRY', 5);
  const matchedCylinder = mechanicalMatches.some(m => /1910\.253|1910\.101/i.test(m.citation) && m.score > 0);
  if (matchedCylinder) {
    console.log(`❌ Fail: Mechanical hazard matched a cylinder/oxygen standard! Matches: ${mechanicalMatches.map(m => m.citation).join(', ')}`);
    failed += 1;
  } else {
    console.log(`✅ Success: Mechanical hazard does not match cylinder/oxygen standards.`);
  }

  // Precision Upgrade Regression Scenarios:
  const precisionScenarios = [
    {
      name: 'Scenario A: A container has no label.',
      text: 'A container has no label.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: false,
    },
    {
      name: 'Scenario B: Unlabeled spray bottle found in the maintenance shop.',
      text: 'Unlabeled spray bottle found in the maintenance shop.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: false,
    },
    {
      name: 'Scenario C: Used oil container has no label.',
      text: 'Used oil container has no label.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: false,
    },
    {
      name: 'Scenario D: Oxygen cylinder stored unsecured near a walkway.',
      text: 'Oxygen cylinder stored unsecured near a walkway.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: true,
    },
    {
      name: 'Scenario E: Compressed gas cylinder missing valve protection cap.',
      text: 'Compressed gas cylinder missing valve protection cap.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: true,
    },
    {
      name: 'Scenario F: Tank has no label.',
      text: 'Tank has no label.',
      source: 'OSHA_GENERAL_INDUSTRY',
      shouldMatchCylinder: false,
    },
  ];

  for (const scen of precisionScenarios) {
    const matches = await service.suggest(scen.text, undefined, scen.source, 5);
    const cylinderPattern = /1910\.253|1910\.252|1910\.101|1926\.350|56\.16005|56\.16006|57\.16005|57\.16006/i;
    const hasCylinderMatch = matches.some(m =>
      cylinderPattern.test(m.citation) &&
      m.score > 0 &&
      m.candidateStatus === 'active'
    );

    if (scen.shouldMatchCylinder) {
      if (hasCylinderMatch) {
        passed += 1;
        console.log(`✅ ${scen.name}`);
      } else {
        failed += 1;
        console.log(`❌ ${scen.name} (Expected a cylinder standard, but none matched with positive score. Got: ${matches.map(m => m.citation + ' (' + m.score + ')').join(', ')})`);
      }
    } else {
      if (!hasCylinderMatch) {
        passed += 1;
        console.log(`✅ ${scen.name}`);
        const excludedCylinderMatch = matches.find(m => cylinderPattern.test(m.citation) && m.scopeFit === 'mismatch');
        if (excludedCylinderMatch) {
          if (excludedCylinderMatch.scopeExclusionReason === "Compressed gas / oxygen cylinder storage evidence not present.") {
            console.log(`   (Confirmed exclusion reason: "${excludedCylinderMatch.scopeExclusionReason}")`);
          } else {
            console.log(`   ⚠️ Warning: Cylinder standard was excluded, but reason was incorrect: "${excludedCylinderMatch.scopeExclusionReason}"`);
          }
        }
      } else {
        failed += 1;
        console.log(`❌ ${scen.name} (Expected NO cylinder standards, but found matching citations with positive score: ${matches.filter(m => cylinderPattern.test(m.citation) && m.score > 0).map(m => m.citation).join(', ')})`);
      }
    }
  }

  const evidenceFitScenarios = [
    {
      name: 'Evidence fit A: walkway is context for an unsecured oxygen cylinder',
      text: 'Oxygen cylinder stored unsecured near a walkway.',
      forbiddenFamilies: ['walking_working_surfaces', 'hazcom', 'electrical'],
    },
    {
      name: 'Evidence fit B: unlabeled generic container does not activate unrelated families',
      text: 'A container has no label.',
      forbiddenFamilies: ['compressed_gas_cylinders', 'walking_working_surfaces', 'electrical'],
    },
    {
      name: 'Evidence fit C: oil spill does not activate compressed gas',
      text: 'Oil spilled across the walkway.',
      forbiddenFamilies: ['compressed_gas_cylinders', 'hazcom', 'electrical'],
    },
    {
      name: 'Evidence fit D: exposed energized panel does not activate HazCom or walking surfaces',
      text: 'Electrical panel has an open breaker slot exposing energized parts.',
      forbiddenFamilies: ['compressed_gas_cylinders', 'hazcom', 'walking_working_surfaces'],
    },
  ];

  for (const scen of evidenceFitScenarios) {
    const matches = await service.suggest(scen.text, undefined, 'OSHA_GENERAL_INDUSTRY', 10);
    const forbiddenActive = matches.filter(m =>
      m.candidateStatus === 'active' && scen.forbiddenFamilies.includes(m.standardFamily)
    );

    if (forbiddenActive.length === 0) {
      passed += 1;
      console.log(`✅ ${scen.name}`);
    } else {
      failed += 1;
      console.log(`❌ ${scen.name} (Forbidden active candidates: ${forbiddenActive.map(m => `${m.citation}:${m.standardFamily}`).join(', ')})`);
    }
  }

  console.log('');
  console.log(`SafeScope standards tests: ${passed} passed, ${failed} failed`);

  await ds.destroy();

  if (failed > 0) process.exit(1);
}

run().catch(async (error) => {
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
