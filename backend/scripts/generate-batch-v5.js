const fs = require('fs');
const path = require('path');

const families = [
  { id: 'conveyor_guarding', family: 'Guarding', phrases: ['conveyor tail pulley missing guard', 'belt tail pulley exposed', 'belt drive missing guard'] },
  { id: 'electrical', family: 'Electrical', phrases: ['frayed cord', 'exposed wire', 'damaged extension cable'] },
  { id: 'fall_protection', family: 'Fall Protection', phrases: ['no fall protection', 'unguarded edge', 'working at height'] }
];

const scenarios = [];
for (let i = 0; i < 250; i++) {
  const f = families[i % families.length];
  const phrase = f.phrases[i % f.phrases.length];
  scenarios.push({
    id: `case_${(1311 + i).toString().padStart(5, '0')}`,
    industryMode: i % 2 === 0 ? 'OSHA_GENERAL_INDUSTRY' : 'MSHA',
    hazardFamily: f.family,
    rawDescription: phrase + ' scenario ' + i,
    expectedConditionId: f.id,
    expectedPrimaryCitations: ['1910.212', '56.14107'],
    wordingStyle: 'clean'
  });
}

fs.writeFileSync(path.join(__dirname, '../test-data/gemini/batch-enterprise-001.json'), JSON.stringify(scenarios, null, 2));
