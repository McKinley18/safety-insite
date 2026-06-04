const fs = require('fs');

const testCases = [
  { input: "Damaged ladder with bent side rail at crusher platform", expected: "Safe access" },
  { input: "Conveyor tail pulley missing guard", expected: "Moving machine parts" },
  { input: "Oil spill on walkway", expected: "Housekeeping" },
  { input: "Exposed wire in wet area", expected: "Electrical conductors" },
  { input: "Missing face shield during grinding", expected: "Eye protection" }
];

async function runAudit() {
  const results = [];
  for (const tc of testCases) {
    const response = await fetch('https://safescope-backend.onrender.com/standards/suggest', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ description: tc.input, source: 'MSHA' })
    });
    const data = await response.json();
    results.push({ input: tc.input, expected: tc.expected, returned: data.map(d => d.heading) });
  }
  console.log(JSON.stringify(results, null, 2));
}
runAudit();
