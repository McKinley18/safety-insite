const fs = require('fs');

async function runAudit() {
  const data = JSON.parse(fs.readFileSync('backend/test-data/audit-1000.json', 'utf8'));
  const results = [];
  
  for (const group of data) {
    for (const input of group.inputs) {
      try {
        const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ description: input, source: 'MSHA' })
        });
        const suggestions = await response.json();
        results.push({ category: group.category, input, suggestionCount: suggestions.length });
      } catch (e) {
        results.push({ category: group.category, input, error: e.message });
      }
    }
  }
  fs.writeFileSync('enterprise-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Audit Complete.');
}

runAudit();
