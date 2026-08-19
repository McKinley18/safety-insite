// V5-C02 Phase 6: semantic adversarial tests for the shared evidence-fact foundation
// (backend/src/safescope-v2/evidence/shared-evidence-facts.ts).
//
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/c02_semantic_adversarial_tests.ts

import { buildEvidenceFacts, hasFact, buildHazardScopedEvidenceFacts } from '../../backend/src/safescope-v2/evidence/shared-evidence-facts';

type Result = { name: string; pass: boolean; detail?: any };
const results: Result[] = [];
function check(name: string, pass: boolean, detail?: any) {
  results.push({ name, pass, detail });
}

// 1. Positive evidence
{
  const r = buildEvidenceFacts({ text: 'The machine guard is missing and the operator can reach the rotating shaft.' });
  check('positive: guard absence is captured, not lost',
    hasFact(r, 'guardState', 'absent_or_ineffective'), r.facts);
}

// 2. Safe/control evidence
{
  const r = buildEvidenceFacts({ text: 'The machine guard is installed and prevents access to the rotating shaft.' });
  const positive = buildEvidenceFacts({ text: 'The machine guard is missing and the operator can reach the rotating shaft.' });
  check('safe/control: guard-present is captured and is NOT equivalent to the positive/absent condition',
    hasFact(r, 'guardState', 'present_and_effective') &&
    !hasFact(r, 'guardState', 'absent_or_ineffective') &&
    JSON.stringify(r.facts.find(f => f.type === 'guardState')?.value) !== JSON.stringify(positive.facts.find(f => f.type === 'guardState')?.value),
    r.facts);
}

// 3. Unknown evidence
{
  const r = buildEvidenceFacts({ text: 'The condition of the machine guard could not be confirmed.' });
  check('unknown: does not infer missing or effective',
    !hasFact(r, 'guardState', 'absent_or_ineffective') && !hasFact(r, 'guardState', 'present_and_effective'),
    r.facts);
}

// 4. Negation
{
  const r = buildEvidenceFacts({ text: 'No exposed energized conductors were observed.' });
  check('negation: does not become positive electrical exposure',
    !hasFact(r, 'energyState', 'energized_or_operating'),
    r.facts);
}

// 5. Historical (corrected before review)
{
  const r = buildEvidenceFacts({ text: 'The guard was missing last week but was replaced before this inspection.' });
  check('historical: temporal distinction preserved (currentHazardNegated + correctedBeforeReview both true)',
    r.currentHazardNegated === true && r.correctedBeforeReview === true,
    { currentHazardNegated: r.currentHazardNegated, correctedBeforeReview: r.correctedBeforeReview, facts: r.facts });
}

// 6. Planned future
{
  const r = buildEvidenceFacts({ text: "The guard will be replaced during tomorrow's shutdown." });
  check('planned future: replacement is not represented as already completed',
    !hasFact(r, 'guardState', 'present_and_effective'),
    r.facts);
}

// 7. Failed control (presence vs. effectiveness)
{
  const r = buildEvidenceFacts({ text: 'Local exhaust ventilation is running but fumes remain in the worker breathing zone.' });
  check('failed control: distinguishes control presence from control effectiveness',
    hasFact(r, 'controlEffectiveness', 'present_but_ineffective'),
    r.facts);
}

// 8. Multi-hazard attribution
{
  const observation = 'An employee reached through an unguarded rotating pulley on a running conveyor drive while a nearby open junction box had exposed live parts.';
  const guardFragment = 'An employee reached through an unguarded rotating pulley on a running conveyor drive.';
  const electricalFragment = 'A nearby open junction box had exposed live parts.';

  const whole = buildEvidenceFacts({ text: observation });
  const guardOnly = buildHazardScopedEvidenceFacts(guardFragment);
  const electricalOnly = buildHazardScopedEvidenceFacts(electricalFragment);

  const wholeHasBoth = hasFact(whole, 'guardState', 'absent_or_ineffective') && hasFact(whole, 'electricalLiveParts', 'exposed_and_reachable');
  const guardScopedIsGuardOnly = hasFact(guardOnly, 'guardState', 'absent_or_ineffective') && !hasFact(guardOnly, 'electricalLiveParts', 'exposed_and_reachable');
  const electricalScopedIsElectricalOnly = hasFact(electricalOnly, 'electricalLiveParts', 'exposed_and_reachable') && !hasFact(electricalOnly, 'guardState', 'absent_or_ineffective');

  check('multi-hazard: whole-observation facts include both hazards',
    wholeHasBoth, whole.facts);
  check('multi-hazard: hazard-scoped guard fragment does NOT pick up the sibling electrical fact',
    guardScopedIsGuardOnly, guardOnly.facts);
  check('multi-hazard: hazard-scoped electrical fragment does NOT pick up the sibling guard fact',
    electricalScopedIsElectricalOnly, electricalOnly.facts);
}

const allPass = results.every(r => r.pass);
console.log(JSON.stringify({ allPass, results }, null, 2));
process.exit(allPass ? 0 : 1);
