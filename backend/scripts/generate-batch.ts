const fs = require('fs');
const batchName = process.argv[2];
const startId = parseInt(process.argv[3]);
const families = ["Guarding", "Electrical", "Fall protection", "Housekeeping", "Access"];
const scenarios = Array.from({length: 100}, (_, i) => ({
    id: `case_${(startId + i).toString().padStart(5, '0')}`,
    scopeExpected: 'mining',
    agencyExpected: 'MSHA',
    observation: `Enterprise hazard test ${startId + i} family ${families[i % families.length]}`,
    primaryHazardFamily: families[i % families.length].toLowerCase().replace(/ /g, '_'),
    difficulty: i % 10 === 0 ? 'brutal' : 'medium'
}));
fs.writeFileSync('backend/test-data/safescope-validation/' + batchName + '.json', JSON.stringify(scenarios, null, 2));
