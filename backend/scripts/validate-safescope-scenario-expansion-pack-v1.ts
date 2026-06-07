import * as fs from 'fs';
import * as path from 'path';
import { ScenarioRecord } from '../src/safescope-v2/scenario-expansion/scenario-expansion.types';

async function validate() {
  const packPath = path.resolve(__dirname, '../../safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json');
  const data = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  const scenarios: ScenarioRecord[] = data.records;

  console.log(`Testing pack: ${packPath}`);
  if (scenarios.length < 60) {
      console.error(`Expected >= 60 scenarios, found ${scenarios.length}`);
      process.exit(1);
  }

  const prohibitedPhrases = ["is a violation", "creates a citation", "will be cited", "non-compliant", "noncompliant", "must comply", "regulatory violation"];
  const scenarioString = JSON.stringify(scenarios).toLowerCase();
  for (const phrase of prohibitedPhrases) {
    if (scenarioString.includes(phrase)) {
        console.error(`Prohibited language detected: ${phrase}`);
        process.exit(1);
    }
  }

  console.log('✅ SafeScope scenario expansion pack v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
