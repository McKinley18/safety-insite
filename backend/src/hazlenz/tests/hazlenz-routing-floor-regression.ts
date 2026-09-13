/**
 * §277 / D-024b — CUSTOMER-VISIBLE CANDIDATE ROUTING FLOOR. Zero provider calls, no database.
 *
 * ==================== WHAT THIS PINS ====================
 *
 * The floor for ordinary customer-visible candidate routing is 0.50, and a candidate below
 * it must not appear as a normal primary finding **solely from weak semantic/lexical
 * routing**. Explicit governed deterministic evidence routes a hazard regardless of the
 * semantic confidence, because there the deterministic rule independently established the
 * candidate.
 *
 * Both halves have to hold at once, and each is the other's failure mode:
 *
 *   floor with no exception   -> measured before implementing: ALMOST EVERY legitimate
 *                               hazard routes at 0.2. A bare threshold suppresses the §275
 *                               machine-guarding case, the MSHA case and the fall-protection
 *                               case along with the noise. That is the dangerous direction.
 *   exception with no floor   -> §276's defect: "isolated at the wall" proposes a
 *                               `ground_control` hazard on a compliant machine, from the
 *                               single word "wall".
 *
 * The confidence number cannot be the discriminator on its own, and neither can the count
 * or length of the matched signals -- the real guarding fragment and the spurious "wall"
 * fragment both carry exactly one single-word signal at 0.2. What separates them is whether
 * anything OTHER than the lexical router supports the candidate.
 *
 * Run: npm run test:hazlenz-routing-floor
 */
import {
  CUSTOMER_VISIBLE_ROUTING_FLOOR, withholdWeaklyRoutedHazards,
} from '../hazlenz.controller';

let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: unknown): void {
  checks += 1;
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
}

type Hazard = {
  domainId: string;
  hazardFamily?: string;
  confidence: number;
  mechanism?: string;
  supportingSignals?: string[];
  observationFragment?: string;
  standardCandidates?: Array<{ citation: string; applicability?: string; status?: string }>;
};

function surface(hazards: Hazard[], applicabilityDecisions: unknown[] = []) {
  const response: Record<string, unknown> = {
    applicabilityDecisions,
    multiHazardDecomposition: {
      hazards: hazards.map((h) => ({ ...h })),
      hazardCount: hazards.length,
      isMultiHazard: hazards.length > 1,
      primaryHazard: hazards[0],
      routingNotes: [],
    },
  };
  withholdWeaklyRoutedHazards(response);
  const decomposition = response.multiHazardDecomposition as {
    hazards: Hazard[]; hazardCount: number; routingNotes: string[]; primaryHazard?: Hazard;
  };
  return {
    kept: decomposition.hazards.map((h) => h.domainId),
    count: decomposition.hazardCount,
    notes: decomposition.routingNotes,
    primary: decomposition.primaryHazard?.domainId,
  };
}

console.log(`floor = ${CUSTOMER_VISIBLE_ROUTING_FLOOR}\n`);
check('the floor is 0.50 as decided', CUSTOMER_VISIBLE_ROUTING_FLOOR === 0.5, CUSTOMER_VISIBLE_ROUTING_FLOOR);

// =========================================================================================
// THE KNOWN "WALL" FALSE ROUTE. §276 measured this exactly: a compliant, de-energised bench
// grinder produced a `ground_control` hazard whose entire evidence was the word "wall".
// =========================================================================================
console.log('\n--- the §276 "wall" false route ---');
const wall = surface([{
  domainId: 'ground_control',
  confidence: 0.2,
  mechanism: 'wall',
  supportingSignals: ['wall'],
  observationFragment: 'isolated at the wall',
  standardCandidates: [],
}]);
check('W1 the "wall" route is not surfaced as a finding', wall.count === 0, wall);
check('W2 nothing is left for the reviewer to dismiss', wall.kept.length === 0, wall.kept);
check('W3 the withdrawal is RECORDED, not silent',
  wall.notes.some((n) => /ground_control/.test(n) && /routing floor/.test(n)), wall.notes);
check('W4 the note names the evidence that was insufficient',
  wall.notes.some((n) => n.includes('"wall"')), wall.notes);

// =========================================================================================
// THE THRESHOLD ITSELF. Below, at, and above -- with no governed evidence in any of them,
// so the confidence is the only thing deciding.
// =========================================================================================
console.log('\n--- the threshold, with no governed evidence ---');
const lexical = (confidence: number) => ({
  domainId: 'ground_control', confidence, mechanism: 'wall',
  supportingSignals: ['wall'], standardCandidates: [],
});

check('T1 0.20 is below the floor and is withheld', surface([lexical(0.2)]).count === 0);
check('T2 0.49 is below the floor and is withheld', surface([lexical(0.49)]).count === 0);
check('T3 0.50 is AT the floor and is eligible', surface([lexical(0.5)]).count === 1);
check('T4 0.51 is above the floor and is eligible', surface([lexical(0.51)]).count === 1);
check('T5 0.85 is above the floor and is eligible', surface([lexical(0.85)]).count === 1);

/**
 * A hazard with no numeric confidence at all is NOT withheld. The floor is a statement about
 * a measured routing score; absence of a score is not evidence of a low one, and failing
 * closed on missing data would suppress hazards for a schema reason rather than a safety one.
 */
check('T6 a hazard carrying no confidence is not withheld by the floor',
  surface([{ domainId: 'machine_guarding', confidence: undefined as unknown as number, standardCandidates: [] }]).count === 1);

// =========================================================================================
// THE EXCEPTION. Governed deterministic evidence routes a hazard regardless of the semantic
// confidence. This is the main path, not a carve-out: the §275 machine-guarding case, the
// MSHA case and the fall-protection case all route at 0.2 and all carry a citation.
// =========================================================================================
console.log('\n--- governed deterministic evidence, independent of semantic confidence ---');

const guarding275 = surface([{
  domainId: 'machine_guarding',
  confidence: 0.2,
  mechanism: 'guard',
  supportingSignals: ['guard'],
  observationFragment: 'the point of operation guard on the 60-ton punch press has been removed',
  standardCandidates: [{ citation: '29 CFR 1910.212(a)(1)', applicability: 'direct', status: 'SUPPORTED' }],
}]);
check('G1 the §275 guarding case survives the floor at confidence 0.2', guarding275.count === 1, guarding275);

const mshaCase = surface([{
  domainId: 'machine_guarding', confidence: 0.2, supportingSignals: ['guard'],
  standardCandidates: [{ citation: '30 CFR 56.14107(a)', applicability: 'direct', status: 'SUPPORTED' }],
}]);
check('G2 the MSHA case survives at 0.2', mshaCase.count === 1, mshaCase);

const fallCase = surface([{
  domainId: 'fall_protection', confidence: 0.2, supportingSignals: ['guardrail'],
  standardCandidates: [{ citation: '29 CFR 1910.28', applicability: 'direct', status: 'SUPPORTED' }],
}]);
check('G3 the fall-protection case survives at 0.2', fallCase.count === 1, fallCase);

/**
 * A `candidate` standard counts as well as a `direct` one. The deterministic rule evaluated
 * this hazard's own evidence, produced a citation and named the predicates still missing --
 * that IS the engine independently establishing a candidate, and the product has an explicit
 * uncertain state for it. Withholding it would delete the clarification path §276 proved.
 */
const unresolvedCase = surface([{
  domainId: 'machine_guarding', confidence: 0.2, supportingSignals: ['guard'],
  observationFragment: 'the point of operation guard has been removed from the press brake in bay 2',
  standardCandidates: [{ citation: '29 CFR 1910.212(a)(1)', applicability: 'candidate', status: 'UNKNOWN' }],
}]);
check('G4 a CANDIDATE standard also exempts the hazard, so the clarification path survives',
  unresolvedCase.count === 1, unresolvedCase);

/**
 * The exception also reads a whole-observation decision in the same family, so a hazard the
 * deterministic engine established for the observation is not withheld merely because the
 * per-finding attachment did not happen.
 */
const observationLevel = surface(
  [{ domainId: 'machine_guarding', hazardFamily: 'machine_guarding', confidence: 0.2, standardCandidates: [] }],
  [{ citation: '29 CFR 1910.212(a)(1)', family: 'machine_guarding', status: 'SUPPORTED' }],
);
check('G5 a whole-observation deterministic decision in the same family exempts it',
  observationLevel.count === 1, observationLevel);

const notApplicableDecision = surface(
  [{ domainId: 'machine_guarding', hazardFamily: 'machine_guarding', confidence: 0.2, standardCandidates: [] }],
  [{ citation: '29 CFR 1910.212(a)(1)', family: 'machine_guarding', status: 'NOT_APPLICABLE' }],
);
check('G6 a NOT_APPLICABLE decision establishes nothing and does not exempt it',
  notApplicableDecision.count === 0, notApplicableDecision);

// =========================================================================================
// NO SUPPRESSION OF ESTABLISHED DETERMINISTIC TRUTH. The floor applies to the CANDIDATE
// LIST a customer is shown. It must not reach the deterministic conclusions themselves.
// =========================================================================================
console.log('\n--- established deterministic truth is never suppressed ---');

const decisions = [{ citation: '29 CFR 1910.212(a)(1)', family: 'machine_guarding', status: 'SUPPORTED', confidence: 0.96 }];
const response: Record<string, unknown> = {
  applicabilityDecisions: JSON.parse(JSON.stringify(decisions)),
  evidenceSnapshot: { facts: [{ type: 'guardState', value: 'absent_or_ineffective' }] },
  multiHazardDecomposition: {
    hazards: [{ domainId: 'ground_control', confidence: 0.2, supportingSignals: ['wall'], standardCandidates: [] }],
    hazardCount: 1, isMultiHazard: false, routingNotes: [],
  },
};
withholdWeaklyRoutedHazards(response);
check('S1 applicabilityDecisions are untouched',
  JSON.stringify(response.applicabilityDecisions) === JSON.stringify(decisions), response.applicabilityDecisions);
check('S2 the evidence snapshot is untouched',
  JSON.stringify(response.evidenceSnapshot) === JSON.stringify({ facts: [{ type: 'guardState', value: 'absent_or_ineffective' }] }),
  response.evidenceSnapshot);
check('S3 and the weak candidate is still withheld from the candidate list',
  (response.multiHazardDecomposition as { hazardCount: number }).hazardCount === 0);

// =========================================================================================
// MIXED OBSERVATIONS. The floor is per hazard, and removing one must not disturb the others
// or leave the decomposition describing a shape it no longer has.
// =========================================================================================
console.log('\n--- a mixed observation keeps what it should ---');
const mixed = surface([
  { domainId: 'ground_control', confidence: 0.2, supportingSignals: ['wall'], standardCandidates: [] },
  {
    domainId: 'machine_guarding', confidence: 0.2, supportingSignals: ['guard'],
    standardCandidates: [{ citation: '29 CFR 1910.212(a)(1)', applicability: 'direct' }],
  },
  { domainId: 'fall_protection', confidence: 0.85, supportingSignals: ['guardrail'], standardCandidates: [] },
]);
check('M1 the governed hazard survives', mixed.kept.includes('machine_guarding'), mixed.kept);
check('M2 the above-floor hazard survives', mixed.kept.includes('fall_protection'), mixed.kept);
check('M3 only the weak ungoverned route is withheld', mixed.count === 2, mixed);
check('M4 the primary hazard is re-pointed at a surviving hazard',
  mixed.primary !== undefined && mixed.kept.includes(mixed.primary as string), mixed);

const allKept = surface([
  { domainId: 'machine_guarding', confidence: 0.85, standardCandidates: [] },
  { domainId: 'fall_protection', confidence: 0.75, standardCandidates: [] },
]);
check('M5 an observation with nothing to withhold is returned unchanged', allKept.count === 2, allKept);
check('M6 and gains no routing note', allKept.notes.length === 0, allKept.notes);

console.log('\n' + '='.repeat(70));
console.log(`checks: ${checks}   failures: ${failures}`);
if (failures > 0) {
  console.error(
    'HazLenz routing-floor regression FAILED. D-024b: a candidate below 0.50 must not be a '
    + 'normal primary finding on weak lexical routing alone, and governed deterministic '
    + 'evidence must route a hazard regardless of the semantic confidence.',
  );
  process.exit(1);
}
console.log('HazLenz customer-visible routing floor regression: all invariants passed, 0 failed');
