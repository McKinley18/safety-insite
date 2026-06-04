const fs = require('fs');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function run() {
  const tests = JSON.parse(
    fs.readFileSync('backend/test-data/large-hazard-tests.json', 'utf8')
  );

  let total = 0;
  let withSuggestions = 0;

  for (const group of tests) {
    console.log(`\nCATEGORY: ${group.category}`);
    console.log('='.repeat(60));

    for (const input of group.inputs) {
      total += 1;

      const res = await fetch(`${BASE_URL}/standards/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input, source: 'MSHA' }),
      });

      const json = await res.json();
      const suggestions = Array.isArray(json) ? json : [];

      if (suggestions.length > 0) withSuggestions += 1;

      console.log(`\nINPUT: ${input || '[empty]'}`);
      console.log(`SUGGESTIONS: ${suggestions.length}`);

      suggestions.slice(0, 3).forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.citation || 'No citation'} — ${item.heading || 'No heading'}`
        );
      });
    }
  }

  console.log('\nSUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests: ${total}`);
  console.log(`Tests with suggestions: ${withSuggestions}`);
  console.log(`Coverage: ${Math.round((withSuggestions / total) * 100)}%`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
