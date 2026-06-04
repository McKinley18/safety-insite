const fs = require('fs');

async function runAudit() {
  const categories = [
    "Machine Guarding", "Conveyors", "Ladders/access", "Walking-working surfaces", "Electrical", "Lockout/energy",
    "Mobile equipment", "Berms/roads", "Fire/hot work", "Housekeeping", "Fall protection", "PPE",
    "Dust/silica", "Noise", "Materials/storage", "Excavation/trenching", "Scaffolds", "Cranes", "Emergency", "Training", "Vague"
  ];
  
  const results = [];
  const totalTests = 1000;
  const testsPerCat = totalTests / categories.length;

  for (const cat of categories) {
    for (let i = 0; i < testsPerCat; i++) {
      const desc = `Realistic hazard test in ${cat} - scenario ${i}`;
      try {
        const response = await fetch('https://safescope-backend.onrender.com/match/hazard', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ description: desc, hazardCategory: cat, industryMode: 'MSHA' })
        });
        const data = await response.json();
        results.push({ category: cat, input: desc, ...data });
      } catch (e) {
        results.push({ category: cat, input: desc, error: e.message });
      }
    }
  }
  
  fs.writeFileSync('enterprise-audit-1000.json', JSON.stringify(results, null, 2));
  console.log('Massive audit complete. Results saved to enterprise-audit-1000.json');
}

runAudit();
