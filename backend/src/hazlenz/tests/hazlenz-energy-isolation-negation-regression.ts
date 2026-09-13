// Regression coverage for the 2026-08-18 core-closure phase: a critical
// standards-matching correctness bug. shared-evidence-facts.ts's
// energyIsolationState extraction previously used a plain (non-negation-aware)
// regex, so "hazardous energy has NOT been isolated or locked out" and "...has
// NOT been deenergized or isolated" both contained the literal substrings
// "locked out"/"deenergized" and were extracted as energyIsolationState =
// 'isolated_and_verified' -- the OPPOSITE of what the text says. This directly
// corrupted LOTO (1910.147 / 56.12016) and electrical (1910.303) standards
// applicability predicates: a genuinely UNSAFE, uncontrolled-energy finding
// could evaluate as if energy were confirmed safely isolated.
import { buildEvidenceFacts } from '../evidence/shared-evidence-facts';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

function hasFact(facts: ReturnType<typeof buildEvidenceFacts>, type: string, value: unknown): boolean {
  return facts.facts.some(f => f.type === type && f.value === value);
}

{
  const facts = buildEvidenceFacts({ text: 'A technician is servicing the press and hazardous energy has not been isolated or locked out.', scopes: ['osha_general_industry'] });
  check('"has not been isolated or locked out" extracts not_isolated, never isolated_and_verified',
    hasFact(facts, 'energyIsolationState', 'not_isolated') && !hasFact(facts, 'energyIsolationState', 'isolated_and_verified'),
    facts.facts);
}

{
  const facts = buildEvidenceFacts({ text: 'A live, exposed electrical conductor in the panel is reachable and has not been deenergized or isolated.', scopes: ['osha_general_industry'] });
  check('"has not been deenergized or isolated" extracts not_isolated, never isolated_and_verified',
    hasFact(facts, 'energyIsolationState', 'not_isolated') && !hasFact(facts, 'energyIsolationState', 'isolated_and_verified'),
    facts.facts);
}

{
  // Positive control: genuinely safe/verified language must still correctly
  // extract isolated_and_verified -- the fix must not over-correct into
  // never recognizing a real verified-safe condition.
  const facts = buildEvidenceFacts({ text: 'The equipment was locked out and zero energy was verified before servicing began.', scopes: ['osha_general_industry'] });
  check('Genuinely verified LOTO language still extracts isolated_and_verified',
    hasFact(facts, 'energyIsolationState', 'isolated_and_verified') && !hasFact(facts, 'energyIsolationState', 'not_isolated'),
    facts.facts);
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz energy-isolation negation regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz energy-isolation negation regression: all invariants passed, 0 failed');
