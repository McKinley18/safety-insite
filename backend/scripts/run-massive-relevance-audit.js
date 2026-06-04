const fs = require('fs');

async function runAudit() {
  const categories = {
    "Guarding": ["guard", "moving machine parts", "rotating shaft", "belt drive"],
    "Electrical": ["exposed wire", "damaged cord", "live panel", "junction box"],
    "Housekeeping": ["oil spill", "debris on floor", "cluttered walkway", "mud slip hazard"]
  };
  
  const results = [];
  const testsPerCategory = 100;
  
  for (const [cat, inputs] of Object.entries(categories)) {
    for (let i = 0; i < testsPerCategory; i++) {
      const input = inputs[i % inputs.length] + " " + i;
      const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description: input, source: 'MSHA' })
      });
      const data = await response.json();
      results.push({ category: cat, input, count: data.length, top: data.slice(0, 1).map(d => d.heading) });
    }
  }
  
  fs.writeFileSync('massive-relevance-results.json', JSON.stringify(results, null, 2));
  console.log('Massive audit complete.');
}
runAudit();
