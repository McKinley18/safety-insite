import * as fs from 'fs';
import * as path from 'path';

const categories = [
  { id: 'guarding', family: 'Guarding', phrases: ['conveyor guard missing', 'exposed gear', 'pulley unguarded'] },
  { id: 'electrical', family: 'Electrical', phrases: ['frayed wire', 'exposed conductor', 'panel cover missing'] },
  { id: 'fall_protection', family: 'Fall protection', phrases: ['no fall protection', 'unguarded edge', 'unprotected platform'] }
];

const scenarios = Array.from({ length: 1000 }, (_, i) => {
  const cat = categories[i % categories.length];
  return {
    id: i,
    industryMode: 'MSHA',
    hazardFamily: cat.family,
    rawDescription: cat.phrases[i % cat.phrases.length] + ' ' + i,
    expectedConditionId: cat.id,
    expectedPrimaryCitations: ['30 CFR 56.14107', '30 CFR 56.12004', '30 CFR 56.15004'],
    acceptableAlternateCitations: [],
    shouldClarify: false
  };
});

fs.writeFileSync(path.join(__dirname, '../src/intelligence-library/data/10k-scenarios.json'), JSON.stringify(scenarios, null, 2));
console.log('10k scenarios generated.');
