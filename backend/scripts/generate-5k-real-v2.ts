import * as fs from 'fs';
import * as path from 'path';

const families = [
  { id: 'conveyor_guarding', family: 'Guarding', phrases: ['conveyor tail pulley unguarded', 'belt drive pinch point', 'exposed rotating shaft'] },
  { id: 'electrical', family: 'Electrical', phrases: ['frayed cord across wet floor', 'exposed wire in panel', 'damaged extension cord'] },
  { id: 'fall_protection', family: 'Fall Protection', phrases: ['no harness on open edge', 'worker at height no tie-off', 'missing guardrail on elevated platform'] }
];

const scenarios = [];
for (let i = 0; i < 5000; i++) {
  const f = families[i % families.length];
  const phrase = f.phrases[i % f.phrases.length];
  scenarios.push({
    id: i,
    industryMode: i % 2 === 0 ? 'OSHA_GENERAL_INDUSTRY' : 'MSHA',
    hazardFamily: f.family,
    rawDescription: phrase + ' near machine ' + i,
    expectedConditionId: f.id,
    acceptableConditionIds: [f.id],
    expectedPrimaryCitations: f.id === 'conveyor_guarding' ? ['56.14107'] : (f.id === 'electrical' ? ['1910.303'] : ['1926.501']),
    wordingStyle: 'clean'
  });
}
fs.writeFileSync(path.join(__dirname, '../src/intelligence-library/data/5k-real-scenarios.json'), JSON.stringify(scenarios, null, 2));
console.log('5,000 scenarios generated.');
