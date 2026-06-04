const fs = require('fs');
const path = require('path');

const batchName = 'batch-enterprise-001';
const startId = 1311; // Sequential after 1310
const categories = [
    { cat: "Machine Guarding", agency: "MSHA", scope: "mining" },
    { cat: "Electrical", agency: "OSHA", scope: "general_industry" },
    { cat: "Fall Protection", agency: "OSHA", scope: "construction" },
    { cat: "Housekeeping", agency: "MSHA", scope: "mining" }
];

const scenarios = [];
const phrases = [
    "Conveyor tail pulley exposed in main haulage drive.",
    "Frayed extension cord laying in standing water near the maintenance shop exit.",
    "Worker observed on open roof edge with no fall restraint equipment.",
    "Oil spill detected on stairs leading to the secondary plant level.",
    "No lockout tagout applied to primary feeder breaker during motor inspection.",
    "Gas cylinder leaning unsecured against concrete wall.",
    "Pre-shift record missing for yesterday's shift.",
    "Machine guards appear to be in full compliance, area clean.",
    "Berm height on haul road 12 appears below minimum specs.",
    "Dust cloud reported at crusher dump point."
];

for (let i = 0; i < 250; i++) {
    const f = categories[i % categories.length];
    const phrase = phrases[i % phrases.length];
    const isNoMatch = i % 10 === 0; // 10% no_match control

    scenarios.push({
        id: `case_${(startId + i).toString().padStart(5, '0')}`,
        scopeExpected: isNoMatch ? 'no_match' : f.scope,
        agencyExpected: isNoMatch ? 'NONE' : f.agency,
        observation: isNoMatch ? "Area inspected; everything looks good." : phrase,
        primaryHazardFamily: f.cat,
        difficulty: i % 5 === 0 ? 'hard' : 'medium'
    });
}

fs.writeFileSync(path.join(__dirname, '../test-data/safescope-validation/' + batchName + '.json'), JSON.stringify(scenarios, null, 2));
console.log('Batch generated');
