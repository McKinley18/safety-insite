const fs = require('fs');

const families = [
  "Guarding", "Conveyors", "Ladders", "Walking-working surfaces", "Fall protection", 
  "Electrical", "Lockout/energy", "Mobile equipment", "Berms/roads", "Fire protection", 
  "Hot work", "Housekeeping", "PPE", "Dust/silica", "Noise", "Chemicals", 
  "Confined space", "Compressed gas", "Materials storage", "Scaffolds", 
  "Excavation", "Cranes", "Emergency", "Training", "Vague"
];

const scenarios = [];
for (let i = 0; i < 10000; i++) {
  const family = families[i % families.length];
  scenarios.push({
    id: i,
    industryMode: i % 3 === 0 ? 'OSHA_GENERAL_INDUSTRY' : (i % 3 === 1 ? 'OSHA_CONSTRUCTION' : 'MSHA'),
    hazardFamily: family,
    rawDescription: `Hazard test ${i} for ${family}`,
    wordingStyle: 'clean',
    expectedConditionId: family.toLowerCase().replace(/ /g, '_'),
    expectedPrimaryCitations: ['1910.212'],
    reviewed: false
  });
}
fs.writeFileSync('backend/src/intelligence-library/data/10k-scenarios.json', JSON.stringify(scenarios, null, 2));
console.log('10,000 scenarios generated.');
