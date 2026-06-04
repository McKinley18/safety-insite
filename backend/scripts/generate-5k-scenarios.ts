import * as fs from 'fs';
import * as path from 'path';

const families = [
  { family: "Guarding", id: "guarding", phrases: ["unguarded conveyor", "pulley missing guard", "pinch point exposed", "guard removed"] },
  { family: "Electrical", id: "electrical", phrases: ["frayed wire", "exposed conductor", "panel cover missing", "wet electrical"] },
  { family: "Fall protection", id: "fall_protection", phrases: ["no fall protection", "unguarded edge", "working at height", "open edge"] }
];

const scenarios = [];
for (let i = 0; i < 5000; i++) {
  const f = families[i % families.length];
  const phrase = f.phrases[i % f.phrases.length];
  scenarios.push({
    id: i,
    industryMode: i % 2 === 0 ? 'OSHA_GENERAL_INDUSTRY' : 'MSHA',
    hazardFamily: f.family,
    rawDescription: phrase + ' ' + i,
    expectedConditionId: f.id,
    expectedPrimaryCitations: ['1910.212', '56.14107'],
    wordingStyle: 'clean'
  });
}

// Write to correct path
fs.writeFileSync(path.join(__dirname, '../src/intelligence-library/data/5k-scenarios.json'), JSON.stringify(scenarios, null, 2));
console.log('10,000 scenarios generated.');
