const fs = require('fs');

async function runAudit() {
  const tests = JSON.parse(fs.readFileSync('backend/test-data/massive-audit-tests.json', 'utf8'));
  const results = [];
  let totalTests = 0;
  let matches = 0;
  
  for (const group of tests) {
    for (const input of group.inputs) {
      totalTests++;
      try {
        const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ description: input, source: 'MSHA' })
        });
        const data = await response.json();
        if (data.length > 0) matches++;
        results.push({ input, category: group.category, suggestions: data.length });
      } catch (e) {
        results.push({ input, category: group.category, error: e.message });
      }
    }
  }
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
  console.log(`Done. Total: ${totalTests}, Matches: ${matches}, Coverage: ${(matches/totalTests)*100}%`);
}

runAudit();
