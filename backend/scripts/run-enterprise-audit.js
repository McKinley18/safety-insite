const fs = require('fs');

async function runAudit() {
  const tests = JSON.parse(fs.readFileSync('backend/test-data/audit-1000.json', 'utf8'));
  const results = [];
  
  for (const group of tests) {
    for (const input of group.inputs) {
      const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description: input, source: 'MSHA' })
      });
      const data = await response.json();
      results.push({ category: group.category, input, suggestions: data.length });
    }
  }
  
  fs.writeFileSync('enterprise-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Audit complete.');
}

runAudit();
