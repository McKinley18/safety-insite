/**
 * §300 / HZ-10 — THE DISPLAY EVIDENCE BOUNDARY NO LONGER READS "NOBODY" AS "CONTROLLED".
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:300-evidence-boundary-negation`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS SUITE EXISTS SEPARATELY FROM THE §299 ONE.
 *
 * §299's family exercised `buildEvidenceFacts` and `applyEvidenceFoundation` and passed. This
 * module is DOWNSTREAM OF BOTH, so every one of those assertions stayed green while the identical
 * defect ran in production. The lesson is not "add more cases" — it is that a repair proven at one
 * layer says nothing about another layer that re-implemented the same rule. This suite pins THIS
 * layer's behaviour directly.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING PROVEN.
 *
 * `enforceHazLenzEvidenceBoundary` may mark an observation AFFIRMATIVELY CONTROLLED — which zeroes
 * the risk block, empties every standard list and sets `assessmentDisposition` to
 * `controlled_condition`. That is a very strong claim and it must rest on a genuine denial of
 * presence or exposure, never on a negative person quantifier that happens to deny a control or an
 * injury.
 *
 * Both directions are asserted. A repair that simply stopped marking anything controlled would
 * fail the second half, and "maximum conservatism" is not the objective — a genuinely unoccupied
 * area must still read as controlled.
 */
import { enforceHazLenzEvidenceBoundary } from '../src/hazlenz/display/hazlenz-evidence-boundary';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

/** The §298 observation, verbatim — the one that came back Controlled in production. */
const OBSERVATION_298 =
  'Morning walkthrough of the warehouse shipping area. The storage mezzanine above the packing '
  + 'benches was being restocked. On the west side there is a pallet-loading opening about twelve '
  + 'feet wide where the forklift lifts pallets up to the deck. The chain that normally goes across '
  + 'that opening was unhooked and lying on the deck, so the edge was open. One of the stockers was '
  + 'working maybe three feet from that open edge with his back to it, moving cartons off a pallet. '
  + 'It is about a ten foot drop to the concrete below. Nobody working up there had a harness on '
  + 'and I did not see any anchor points. The supervisor told me the chain gets unhooked whenever '
  + 'they are loading and they hook it back afterwards. I do not know whether that opening is '
  + 'supposed to have a proper gate or whether the chain is all they have ever had there. Nobody '
  + 'was injured and the forklift was not lifting at the time I was there.';

/**
 * An UPSTREAM RESULT THAT HAS ALREADY ESCALATED THE HAZARD.
 *
 * The defect was never about what the engine concluded — it was about this layer OVERWRITING a
 * correct conclusion. So every probe starts from a Critical, shutdown-required result carrying a
 * citation, and the assertion is about what survives.
 */
function escalatedResult(): Record<string, unknown> {
  return {
    primaryCitation: '29 CFR 1910.28',
    risk: {
      riskScore: 20, riskBand: 'Critical', imminentDanger: true,
      requiresShutdown: true, fatalityPotential: 'possible',
      reasoning: ['upstream deterministic escalation'],
    },
    primaryStandards: [{ citation: '29 CFR 1910.28' }],
    suggestedStandards: [{ citation: '29 CFR 1910.28' }],
    standards: [{ citation: '29 CFR 1910.28' }],
    standardDecisions: [{ citation: '29 CFR 1910.28' }],
  };
}

interface Outcome {
  disposition: unknown;
  riskBand: unknown;
  riskScore: unknown;
  imminentDanger: unknown;
  requiresShutdown: unknown;
  primaryCitation: unknown;
  standardsKept: number;
}

function probe(text: string, extra: Record<string, unknown> = {}): Outcome {
  const result = escalatedResult();
  enforceHazLenzEvidenceBoundary(result, { text, ...extra } as never);
  const risk = (result.risk || {}) as Record<string, unknown>;
  return {
    disposition: result.assessmentDisposition,
    riskBand: risk.riskBand,
    riskScore: risk.riskScore,
    imminentDanger: risk.imminentDanger,
    requiresShutdown: risk.requiresShutdown,
    primaryCitation: result.primaryCitation,
    standardsKept: (result.primaryStandards as unknown[] | undefined)?.length ?? 0,
  };
}

const show = (label: string, o: Outcome): void => {
  console.log(`      ${label}`);
  console.log(`        disposition=${JSON.stringify(o.disposition)} risk=${o.riskBand}/${o.riskScore} `
    + `imminent=${o.imminentDanger} shutdown=${o.requiresShutdown} `
    + `citation=${JSON.stringify(o.primaryCitation)} standards=${o.standardsKept}`);
};

// ================================================================ 1. the §298 observation

console.log('\n---- 1. the exact §298 observation is no longer called controlled ----\n');

const s298 = probe(OBSERVATION_298);
show('§298 observation', s298);

check(s298.disposition !== 'controlled_condition',
  'The §298 observation is NOT assessed controlled_condition. '
  + '(Production measured controlled_condition before this repair.)');
check(s298.riskBand === 'Critical',
  'The upstream Critical risk band SURVIVES rather than being overwritten with Controlled.');
check(s298.riskScore === 20, 'The risk score is not zeroed.');
check(s298.imminentDanger === true, 'imminentDanger is not flipped to false.');
check(s298.requiresShutdown === true, 'requiresShutdown is not flipped to false.');
check(s298.primaryCitation === '29 CFR 1910.28', 'The citation is not stripped.');
check(s298.standardsKept > 0, 'The standards list is not emptied.');

// ================================================================ 2. the semantic family, at this layer

console.log('\n---- 2. the four predicate senses, at this layer ----\n');

interface Case { readonly text: string; readonly controlled: boolean; readonly why: string; }

const FAMILY: ReadonlyArray<{ group: string; cases: readonly Case[] }> = [
  { group: 'a control denial is not a control', cases: [
    { text: 'Nobody working up there had a harness on.', controlled: false,
      why: 'The §298 sentence. It denies a CONTROL and presupposes people at height.' },
    { text: 'Nobody was wearing fall protection near the open edge.', controlled: false,
      why: 'Plainest form.' },
    { text: 'No one had a hard hat on beneath the suspended load.', controlled: false,
      why: '"no one" is bare and the predicate names a control.' },
  ]},
  { group: 'an outcome denial is not a control', cases: [
    { text: 'Nobody was injured when the panel came down.', controlled: false,
      why: 'An unharmed worker is an exposed worker.' },
    { text: 'No one was struck by the falling load.', controlled: false,
      why: 'A near miss is exposure without harm.' },
  ]},
  { group: 'an unresolved clause is not a control', cases: [
    { text: 'Nobody could tell me how long the chain had been down.', controlled: false,
      why: 'An epistemic gap says nothing about presence, control or harm.' },
    { text: 'No one was available to walk the area with me.', controlled: false,
      why: 'Availability is not presence.' },
  ]},
  { group: 'a genuine presence denial STILL reads as controlled', cases: [
    { text: 'No employees were on the mezzanine at any point and the deck was closed to entry.',
      controlled: true, why: 'The intended sense. It must still mark the condition controlled.' },
    { text: 'Nobody was in the trench at any time during the work.', controlled: true,
      why: 'Presence denial, bare quantifier, correctly read.' },
    { text: 'Nobody entered the vessel.', controlled: true,
      why: 'A finite presence verb opens the predicate.' },
    { text: 'The area was unoccupied and fenced off for the whole shift.', controlled: true,
      why: '"unoccupied" is not a person quantifier and is deliberately left in the alternation.' },
  ]},
  { group: 'the non-observation markers are untouched', cases: [
    { text: 'This is a hypothetical example used for training.', controlled: true,
      why: 'Not an observation at all; that member of the alternation is unchanged.' },
    { text: 'The word "lockout" appears only on a training poster in the break room.',
      controlled: true, why: 'The quoted-word marker is unchanged.' },
  ]},
];

for (const { group, cases } of FAMILY) {
  console.log(`  -- ${group} --`);
  for (const c of cases) {
    const o = probe(c.text);
    const isControlled = o.disposition === 'controlled_condition';
    check(isControlled === c.controlled,
      `[${group}] ${c.controlled ? 'controlled' : 'NOT controlled'} — ${c.why}`);
    if (isControlled !== c.controlled) show(c.text, o);
  }
  console.log('');
}

// ================================================================ 3. the distinction is measured

console.log('---- 3. the suite measures a distinction, not a direction ----\n');

const all = FAMILY.flatMap(g => g.cases);
const controlled = all.filter(c => c.controlled);
const notControlled = all.filter(c => !c.controlled);
check(controlled.length >= 5,
  `${controlled.length} cases MUST still read as controlled — a repair that simply stopped marking `
  + 'anything controlled would fail here.');
check(notControlled.length >= 5,
  `${notControlled.length} cases must NOT read as controlled.`);

/** The pre-§300 expression, held here as the control. Never called by any product path. */
const LEGACY = /\b(no (?:employee|worker|person|one|occupant)s? (?:entered|exposed|working|present|using|access)|no (?:active |current )?(?:employee |worker )?exposure|nobody|no one|unoccupied|hypothetical|training example|appears only|word ['"][^'"]+['"] appears only)\b/i;
const legacyWrong = all.filter(c => LEGACY.test(c.text) !== c.controlled);
check(legacyWrong.length > 0,
  `The pre-§300 expression is wrong on ${legacyWrong.length} of ${all.length} members, so this `
  + 'suite distinguishes the repair from the defect rather than passing under both.');
for (const c of legacyWrong) console.log(`      pre-§300 wrong: ${c.text}`);
check(all.filter(c => LEGACY.test(c.text) === c.controlled).length > 0,
  'And it is right on the rest, which are the ones the repair must not break.');

// ================================================================ 4. the second alternation

console.log('\n---- 4. the controls-present branch is repaired the same way ----\n');

const withControls = {
  structuredObservation: { controlsPresent: ['guardrail'], controlsMissing: [] },
};
const a = probe('Nobody was wearing a harness on the deck.', withControls);
show('control denial, with controlsPresent asserted', a);
check(a.disposition !== 'controlled_condition',
  'A control denial does not reach controlled_condition through the controls-present branch either.');
const b = probe('No employees were on the deck at any point.', withControls);
show('presence denial, with controlsPresent asserted', b);
check(b.disposition === 'controlled_condition',
  'A genuine presence denial still does.');

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
