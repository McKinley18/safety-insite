/**
 * §117 REGRESSION GATE -- machine-guarding applicability precedence.
 *
 * Guards the repair recorded in §117/D-129 against silent reversal. Zero provider calls.
 *
 * ==================== WHAT IT ASSERTS, AND WHY BOTH SIDES ====================
 *
 * `evidence-foundation.ts` previously computed `notApplicable = guardPresent || energySafe` and
 * `decision()` resolves `status` from that BEFORE consulting predicate statuses. A verified-
 * isolation fact anywhere in the text therefore excluded OSHA General Industry machine guarding at
 * confidence 0.96 no matter what else was stated -- 8 of the 16 cases below were dangerous false
 * negatives, including a technician stated to have both hands in the point of operation, and
 * including one decision that read NOT_APPLICABLE while all four of its own required predicates
 * read SUPPORTED.
 *
 * The obvious "fix" -- deleting `energySafe` -- is FORBIDDEN and this suite fails loudly if anyone
 * tries it. §115/D-127 confirmed the `R6` determination partly ON that predicate: a press under a
 * completed, verified, second-person-witnessed lockout with the guard removed genuinely is not a
 * current machine-guarding hazard. So case `A` fails on over-promotion and cases `B`-`J` fail on
 * under-recall, and a change that trades one for the other cannot pass.
 *
 * `M`-`P` are cross-jurisdiction and cross-family controls: the MSHA and Construction guarding
 * rules carry no `energySafe` term and the LOTO/electrical rules read the same isolation fact from
 * the other direction. None of them may move.
 */

import { applyEvidenceFoundation } from '../evidence/evidence-foundation';
import {
  GUARDING_APPLICABILITY_CORPUS, type GuardingCase,
} from './machine-guarding-applicability-corpus';

let failures = 0;
let dangerousFailures = 0;

function check(name: string, condition: boolean, dangerous: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures++;
  if (dangerous) dangerousFailures++;
  console.error(`FAIL${dangerous ? ' *DANGEROUS*' : ''} ${name}`,
    detail !== undefined ? JSON.stringify(detail) : '');
}

function decisionFor(c: GuardingCase) {
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result, { text: c.text, scopes: [c.scope] } as never);
  const decisions = (result.applicabilityDecisions ?? []) as Array<{
    family: string; status: string; confidence: number;
    requiredPredicates: Array<{ name: string; status: string }>;
  }>;
  return decisions.find(d => c.family.test(d.family)) ?? null;
}

for (const c of GUARDING_APPLICABILITY_CORPUS) {
  const d = decisionFor(c);
  const label = `${c.id} (${c.klass})${c.mirrors ? ` [mirrors ${c.mirrors}]` : ''}`;

  if (c.expect === 'NO_DECISION') {
    check(`${label}: emits no ${c.family.source} decision`, d === null, c.dangerous,
      d ? { got: d.status } : undefined);
  } else if (c.expect === 'NOT_APPLICABLE') {
    check(`${label}: stays NOT_APPLICABLE`, d !== null && d.status === 'NOT_APPLICABLE',
      c.dangerous, { got: d?.status ?? null, rationale: c.rationale });
  } else {
    // SURVIVES: the family must remain live for the reviewer. SUPPORTED and UNKNOWN both do that;
    // NOT_APPLICABLE and CONTRADICTED are both suppression and both fail this gate.
    const survives = d !== null && (d.status === 'SUPPORTED' || d.status === 'UNKNOWN');
    check(`${label}: current-exposure recall survives`, survives, c.dangerous,
      { got: d?.status ?? null, rationale: c.rationale });
  }
}

// ---------------------------------------------------------------- structural invariants

{
  // The precision anchor must rest on a COHERENT predicate set, not on a short-circuit. Before the
  // repair a decision could read NOT_APPLICABLE while its own predicates said the hazard applied;
  // this asserts the two agree for R6.
  const a = GUARDING_APPLICABILITY_CORPUS.find(c => c.id === 'A')!;
  const d = decisionFor(a);
  const movingEnergy = d?.requiredPredicates.find(p => p.name === 'moving or accessible energy');
  check('A: NOT_APPLICABLE is predicate-coherent (moving-or-accessible energy CONTRADICTED)',
    d?.status === 'NOT_APPLICABLE' && movingEnergy?.status === 'CONTRADICTED', false,
    { status: d?.status, movingEnergy: movingEnergy?.status });
}

{
  // The defect's signature: NOT_APPLICABLE emitted while a required predicate affirmatively
  // SUPPORTS the hazard. No case in the corpus may exhibit it again, in any family.
  const offenders: string[] = [];
  for (const c of GUARDING_APPLICABILITY_CORPUS) {
    const d = decisionFor(c);
    if (!d || d.status !== 'NOT_APPLICABLE') continue;
    const hazardSupporting = d.requiredPredicates.filter(p =>
      p.status === 'SUPPORTED'
      && (p.name === 'moving or accessible energy' || p.name === 'employee in the guarded zone'));
    if (hazardSupporting.length) offenders.push(`${c.id}:${hazardSupporting.map(p => p.name).join('+')}`);
  }
  check('no decision reports NOT_APPLICABLE while a hazard predicate is SUPPORTED',
    offenders.length === 0, true, offenders);
}

console.log('='.repeat(70));
console.log(`cases: ${GUARDING_APPLICABILITY_CORPUS.length}   failures: ${failures}   `
  + `dangerous failures: ${dangerousFailures}`);
if (failures > 0) {
  console.error(`HazLenz machine-guarding applicability precedence regression: ${failures} FAILED `
    + `(${dangerousFailures} dangerous)`);
  process.exit(1);
}
console.log('HazLenz machine-guarding applicability precedence regression: all invariants passed, 0 failed');
