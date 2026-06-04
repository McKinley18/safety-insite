const fs = require('fs');

const categories = [
  "Access / Ladders / Platforms", "Guarding / Moving Parts", "Electrical", "Housekeeping / Slips / Trips",
  "Mobile Equipment / Traffic", "Fire / Hot Work / Fuel", "PPE", "Dust / Respiratory / Noise",
  "Fall Protection", "Lockout / Energy Isolation", "Emergency / First Aid", "Other / Unknown"
];

const testCases = categories.flatMap(cat => 
  Array.from({length: 42}, (_, i) => ({
    category: cat,
    input: `Test for ${cat} - input ${i + 1}`
  }))
);

async function runAudit() {
  const results = [];
  for (const tc of testCases) {
    try {
      const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description: tc.input, hazardCategory: tc.category, source: 'MSHA' })
      });
      const data = await response.json();
      results.push({ category: tc.category, input: tc.input, suggestions: data.length });
    } catch (e) {
      results.push({ category: tc.category, input: tc.input, error: e.message });
    }
  }
  fs.writeFileSync('category-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Audit complete.');
}
runAudit();
