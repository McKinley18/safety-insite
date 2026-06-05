import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const manifest = fs.readFileSync('project-docs/08-audits/SAFESCOPE_AI_READINESS_MANIFEST.md', 'utf-8');

const requiredSections = [
  '1. Classification Statement',
  '2. Capability Layers (v2)',
  '3. Governance and Advisory Guardrails',
  '4. Current Validation Status',
  '5. Remaining Maturity Gaps',
  '6. What SafeScope Does Not Do'
];

console.log("Validating AI Readiness Manifest...");

for (const section of requiredSections) {
  assert(manifest.includes(section), `Missing required section: ${section}`);
  console.log(`Verified section: ${section}`);
}

console.log("AI Readiness Manifest validation passed.");
