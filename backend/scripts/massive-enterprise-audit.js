const fs = require('fs');

async function runAudit() {
  const categories = [
    "Guarding", "Conveyors", "Crushers", "Screens", "Feeders", "Safe access", "Ladders", "Stairs", "Platforms", "Handrails",
    "Grating", "Walkways", "Travelways", "Housekeeping", "Slips/trips", "Electrical cords", "Electrical panels", "Energized components",
    "Lockout/tagout", "Fire extinguishers", "Hot work/welding", "Flammables/fuel", "Compressed gas/cylinders", "Mobile equipment",
    "Berms/haul roads", "Traffic control", "Seat belts", "Horns/backup alarms", "Fall protection", "PPE general", "Eye/face protection",
    "Hand protection", "Foot protection", "Respiratory/dust/silica", "Noise/hearing", "Confined spaces", "First aid", "Bad/vague inputs",
    "Misspellings", "Multi-hazard descriptions"
  ];
  
  // Generating test cases (25 per category = 1000 total)
  const testSuite = categories.map(cat => ({
    category: cat,
    inputs: Array.from({length: 25}, (_, i) => `[${cat}] Test input ${i + 1}`)
  }));

  const results = [];
  let totalTests = 0;
  
  for (const group of testSuite) {
    for (const input of group.inputs) {
      totalTests++;
      try {
        const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ description: input, source: 'MSHA' })
        });
        const data = await response.json();
        results.push({ category: group.category, input, suggestions: data.length });
      } catch (e) {
        results.push({ category: group.category, input, error: e.message });
      }
    }
  }
  
  fs.writeFileSync('enterprise-audit-results.json', JSON.stringify(results, null, 2));
  console.log(`Audit Complete. Total: ${totalTests}`);
}

runAudit();
